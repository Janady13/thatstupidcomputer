/** Deterministic vector animation player. No framework, network calls, or raster assets.
 * Angles in motion JSON are radians. Scene baseline angles are degrees.
 * The controller owns SVG attributes; React owns only the surrounding UI.
 */
import { PERFORMANCES } from '../performances/catalog.mjs';
const DEG = 180 / Math.PI;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const smooth = (v) => { const k=clamp(v,0,1); return k*k*(3-2*k); };
export function keyValue(keys, frame, hold=false) {
  if(frame<=keys[0][0]) return keys[0][1];
  let lo=0, hi=keys.length-1;
  if(frame>=keys[hi][0]) return keys[hi][1];
  while(hi-lo>1){const mid=(lo+hi)>>1;if(keys[mid][0]<=frame)lo=mid;else hi=mid;}
  const a=keys[lo], b=keys[hi];
  return hold ? a[1] : a[1]+(b[1]-a[1])*(frame-a[0])/(b[0]-a[0]);
}
export function sampleClip(clip, seconds) {
  const frame=clip.loop ? (Math.max(0,seconds)*clip.fps)%clip.duration : clamp(seconds*clip.fps,0,clip.duration);
  const pose={};
  for(const track of clip.tracks) (pose[track.target]??={})[track.property]=keyValue(track.keys,frame,track.interpolation==='hold');
  return pose;
}
export function indexNodes(root) {
  const out={};const scan=n=>{out[n.id]=n;for(const c of n.children||[])scan(c);};scan(root);return out;
}
export class CharacterController {
  constructor(svg,model,clips,options={}) {
    if(!svg || svg.localName!=='svg') throw new TypeError('A mounted SVG element is required.');
    this.svg=svg; this.model=model; this.options=options;
    this.nodes={};for(const n of svg.querySelectorAll('[data-rig-id]'))this.nodes[n.dataset.rigId]=n;
    this.base=indexNodes(model.root);this.clips=new Map(clips.map(c=>[c.name,c]));
    for(const c of clips)for(const t of c.tracks)if(!this.nodes[t.target])throw new Error(`Missing rig node ${t.target}`);
    this.action=this.clips.has(options.action)?options.action:'Idle';this.time=0;this.age=0;this.playbackRate=1;
    this.visible=true;this.paused=!!options.paused;this.censored=options.censored!==false;
    this.external=!!options.externalClock;this.destroyed=false;this.raf=0;this.last=0;this.cache=new Map();
    this.pose=null;this.from=null;this.transition=.24;this.complete=false;this.hidden=new Set();this.revision=0;
    this.media=window.matchMedia('(prefers-reduced-motion: reduce)');this.reduced=this.media.matches;
    this._media=()=>{this.reduced=this.media.matches;this.from=null;this.render();this.sync();};
    this._visibility=()=>this.sync();
    this._frame=now=>{this.raf=0;if(!this.allowed())return;if(!this.last)this.last=now;const dt=(now-this.last)/1000;if(dt>=1/30-.001){this.last=now;this.advance(Math.min(.08,dt));}if(this.allowed()&&!this.raf)this.raf=requestAnimationFrame(this._frame);};
    this.media.addEventListener('change',this._media);document.addEventListener('visibilitychange',this._visibility);
    if('IntersectionObserver' in window){this.io=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this.sync();},{threshold:.01});this.io.observe(svg);}
    this.render();this.sync();
  }
  allowed(){return !this.destroyed&&!this.external&&!this.paused&&!this.reduced&&!this.complete&&!document.hidden&&this.visible;}
  sync(){cancelAnimationFrame(this.raf);this.raf=0;this.last=0;if(this.allowed())this.raf=requestAnimationFrame(this._frame);this.options.onPlaybackChange?.({paused:this.paused,reduced:this.reduced,visible:this.visible});}
  set(name,attribute,value){const key=name+':'+attribute,s=String(value);if(this.cache.get(key)===s)return;this.nodes[name]?.setAttribute(attribute,s);this.cache.set(key,s);}
  setAction(name,{immediate=false}={}){
    if(this.destroyed)return;
    if(!this.clips.has(name))throw new RangeError(`Unknown action ${name}`);
    const revision=++this.revision;
    this.from=immediate||this.reduced?null:this.pose;this.age=immediate?1:0;this.time=0;this.complete=false;this.action=name;
    this.options.onActionChange?.(name);if(this.destroyed||this.revision!==revision)return;this.render();if(!this.destroyed&&this.revision===revision)this.sync();
  }
  setCensored(value){this.censored=!!value;this.render();}
  setPlaybackRate(value){if(!Number.isFinite(value)||value<.25||value>2)throw new RangeError('Rate must be 0.25 to 2');this.playbackRate=value;}
  setLayerVisible(id,visible){if(!this.nodes[id])throw new RangeError(`Unknown rig layer ${id}`);if(visible)this.hidden.delete(id);else this.hidden.add(id);this.nodes[id].style.display=visible?'':'none';}
  pause(){this.paused=true;this.sync();}
  resume(){this.paused=false;this.sync();}
  seek(seconds){if(!Number.isFinite(seconds)||seconds<0)throw new RangeError('Time must be nonnegative');this.time=seconds;this.age=1;this.from=null;this.complete=false;this.render();this.sync();}
  advance(dt){
    if(this.destroyed||this.paused||this.reduced||this.complete||document.hidden||!this.visible)return;
    if(!Number.isFinite(dt)||dt<0)throw new RangeError("Delta must be finite and nonnegative");
    const revision=this.revision,action=this.action,c=this.clips.get(action);
    dt=clamp(dt,0,.1)*this.playbackRate;this.time+=dt;this.age+=dt;this.render();
    if(this.destroyed||this.revision!==revision)return;
    if(!c.loop && this.time>=c.seconds){
      this.complete=true;this.options.onComplete?.(action);
      // Completion callbacks can replace the action or destroy the controller.
      // Never overwrite that decision or emit a new action with the old clip.
      if(this.destroyed||this.revision!==revision)return;
      if(this.options.returnToIdle&&action!=='Revived'){this.setAction('Idle');return;}
      cancelAnimationFrame(this.raf);this.raf=0;
    }
    this.options.onAdvance?.({dt,time:this.time,action,clip:c});
  }
  render(){
    if(this.destroyed)return;
    const c=this.clips.get(this.action);
    const staticTime=PERFORMANCES[this.action]?.isNew ? PERFORMANCES[this.action].peakSeconds : this.action==='RudeFlipOff'?1.55:this.action==='Excited'?1.8:Math.min(1.1,c.seconds);
    const t=this.reduced ? Math.min(staticTime,c.seconds) : this.time;
    const p=sampleClip(c,t),k=smooth(this.age/this.transition);
    // Hand/face switches are discrete. Do not alpha-blend into ghost fingers.
    if(this.from&&k<1&&!this.reduced)for(const [id,vals] of Object.entries(p))for(const prop of Object.keys(vals)){
      if(prop==='opacity' && (id.startsWith('hand-')||id.startsWith('eye-')))continue;
      const a=this.from[id]?.[prop];if(a!==undefined)vals[prop]=a+(vals[prop]-a)*k;
    }
    for(const [id,v] of Object.entries(p)){
      const b=this.base[id];const x=v.x??b.x??0,y=v.y??b.y??0;
      const r=(v.rotation??((b.rotation||0)/DEG))*DEG;
      const sx=v.scaleX??b.scaleX??1,sy=v.scaleY??b.scaleY??1;
      this.set(id,'transform',`translate(${x.toFixed(3)} ${y.toFixed(3)}) rotate(${r.toFixed(3)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})`);
      this.set(id,'opacity',(v.opacity??b.opacity??1).toFixed(4));
    }
    for(const side of ['left','right'])this.set('hand-'+side+'-censor','opacity',this.censored?1:0);
    this.pose=p;this.svg.dataset.action=this.action;
    this.options.onRender?.({time:t,action:this.action,duration:c.seconds,progress:Math.min(1,t/c.seconds),loop:c.loop});
  }
  destroy(){
    if(this.destroyed)return;this.destroyed=true;cancelAnimationFrame(this.raf);this.raf=0;
    this.io?.disconnect();this.media.removeEventListener('change',this._media);document.removeEventListener('visibilitychange',this._visibility);for(const [id,n] of Object.entries(this.nodes)){const b=this.base[id];if(!b)continue;n.setAttribute('transform',`translate(${b.x??0} ${b.y??0}) rotate(${b.rotation??0}) scale(${b.scaleX??1} ${b.scaleY??1})`);n.setAttribute('opacity',String(b.opacity??1));n.style.removeProperty('display');}this.cache.clear();
  }
}
