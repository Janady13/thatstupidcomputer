import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ComputerMotion, COMPUTER_MOTION_STATES, sampleDesktopPose } from '../../apps/web/src/animation/desktop/computer-motion.mjs';
import { DESKTOP_PERFORMANCES, DESKTOP_PERFORMANCE_BY_ID, DESKTOP_LEGACY_STATES, safeDesktopState } from '../../apps/web/src/animation/desktop/performances.mjs';
import { GESTURE_BASELINE, gestureAttributes } from '../../apps/web/src/animation/desktop/gesture-geometry.mjs';

const cables=JSON.parse(readFileSync(new URL('../../apps/web/src/animation/desktop/cable-poses.json',import.meta.url)));
const originalKeys='bodyX,bodyY,bodyR,headX,headY,headR,fanX,fanY,fanR,fanWire,fanSpeed,eyeOpenL,eyeOpenR,eyeOpacity,browY,browL,browR,browHappy,gazeX,gazeY,noteR,heat,steam,dirt,glass,glassX,glassY,glassR,cursor,plugY,plugR,cableCoil,cableAmp,dustKick'.split(',');
const peak=id=>sampleDesktopPose(id,DESKTOP_PERFORMANCE_BY_ID[id].peakSeconds,{attitudeEnabled:true});

test('desktop metadata defines exactly32 unique states and valid complete performance timings',()=>{
  assert.equal(DESKTOP_PERFORMANCES.length,32);
  assert.deepEqual(DESKTOP_PERFORMANCES.map(x=>x.id),COMPUTER_MOTION_STATES);
  assert.equal(new Set(COMPUTER_MOTION_STATES).size,32);
  for(const entry of DESKTOP_PERFORMANCES){
    assert.equal(DESKTOP_PERFORMANCE_BY_ID[entry.id],entry);
    assert(Object.isFrozen(entry));assert(entry.label&&entry.description);
    assert(entry.seconds>0&&entry.seconds<=6.4&&entry.peakSeconds>0&&entry.peakSeconds<entry.seconds);
    assert.equal(typeof entry.loop,'boolean');assert.equal(typeof entry.requiresAttitude,'boolean');
  }
  assert.deepEqual(DESKTOP_PERFORMANCES.filter(x=>x.requiresAttitude).map(x=>x.id),['rude-flip-off','double-flip-off']);
});

test('original twelve numeric pose channels match the immutable v2 reference at120 sampled poses',()=>{
  // Captured from the original delivered v2 module, before desktop-v3 edits.
  const sampled=DESKTOP_LEGACY_STATES.map(state=>[state,[0,.17,.85,1.3,2.6,3.6,6.399,6.4,9.2,14.7].map(time=>{
    const p=sampleDesktopPose(state,time);
    for(const key of Object.keys(GESTURE_BASELINE))assert.equal(p[key],0,`${state}:${key}`);
    // Rounded to 6 decimals: the raw doubles differ in the last bits between x86-64 and arm64
    // (raw x86-64 hash 0a9e61c0…d496f9); the rounded table hashes identically on both.
    return Object.fromEntries(originalKeys.map(key=>[key,typeof p[key]==='number'?Number(p[key].toFixed(6)):p[key]]));
  })]);
  assert.equal(createHash('sha256').update(JSON.stringify(sampled)).digest('hex'),'4817abde6e3a9adff304798c4089b58ee1772dcf5849f0c65f0431edf913cf1b');
});

test('all32 authored performances remain finite and new one-shots finish at a stable baseline',()=>{
  const signatures=new Set();
  for(const entry of DESKTOP_PERFORMANCES){
    signatures.add(JSON.stringify(peak(entry.id)));
    for(let time=0;time<entry.seconds+.2;time+=1/30){
      const p=sampleDesktopPose(entry.id,time,{attitudeEnabled:true});
      assert(Object.values(p).every(Number.isFinite),entry.id);
      for(const key of ['heat','steam','eyeOpacity','browHappy','glass','dirt','gestureOpacity','mouthOpen','tongue'])assert(p[key]>=0&&p[key]<=1,`${entry.id}:${key}`);
      assert(p.eyeOpenL>=0&&p.eyeOpenR>=0);
      assert(!Object.keys(p).some(key=>/scale/i.test(key)),'the case must remain rigid');
      assert(Number.isInteger(p.handL)&&Number.isInteger(p.handR));
      if(!entry.requiresAttitude)assert(p.handL!==5&&p.handR!==5,entry.id);
    }
    if(!entry.loop){
      const end=sampleDesktopPose(entry.id,entry.seconds,{attitudeEnabled:true});
      assert.deepEqual(sampleDesktopPose(entry.id,entry.seconds+1000,{attitudeEnabled:true}),end);
      for(const key of Object.keys(GESTURE_BASELINE))assert.equal(end[key],0,`${entry.id} left ${key} active`);
    }
  }
  assert.equal(signatures.size,32);
});

test('poses have specific acting: facepalm, shrug, directions, beckon, tongue and two distinct censored hands',()=>{
  const facepalm=peak('facepalm'),shrug=peak('shrug'),left=peak('point-left'),right=peak('point-right');
  assert(facepalm.armRX<-400&&facepalm.armRY<-400&&facepalm.eyeOpenL<.3);
  assert(shrug.armLY<-170&&shrug.armRY<-170&&shrug.armLR<-50&&shrug.armRR>50);
  assert(left.handL===2&&left.armLR===-90&&left.gazeX<0);
  assert(right.handR===2&&right.armRR===90&&right.gazeX>0);
  assert(peak('raspberry').tongue>.8);
  assert(peak('thumbs-up').handR===3&&peak('demo-success').handR===3);
  assert(peak('rude-flip-off').handR===5&&peak('rude-flip-off').handL!==5);
  assert(peak('double-flip-off').handR===5&&peak('double-flip-off').handL===5);
  const beckonA=sampleDesktopPose('beckon',1.35),beckonB=sampleDesktopPose('beckon',1.8);
  assert(Math.abs(beckonA.armRR-beckonB.armRR)>10);
  const angry=peak('angry');assert(angry.heat<=.15,'intermediate brown-on-brown eyes were unreadable in proof');
  for(const state of ['point-left','shrug','confused','demo-success'])assert(peak(state).armLX>=25,'left fingers need margin inside the original viewBox');
});

test('attitude requires explicit true and direct samplers reject unknown or inherited states',()=>{
  for(const value of [undefined,false,0,1,'true',{},null])for(const state of ['rude-flip-off','double-flip-off']){
    assert.equal(safeDesktopState(state,value),'eye-roll');
    assert.deepEqual(sampleDesktopPose(state,1.2,{attitudeEnabled:value}),sampleDesktopPose('eye-roll',1.2));
  }
  assert.equal(safeDesktopState('double-flip-off',true),'double-flip-off');
  for(const state of ['__proto__','constructor','toString','invented']){
    assert.throws(()=>safeDesktopState(state),RangeError);
    assert.throws(()=>sampleDesktopPose(state,0),RangeError);
  }
  for(const time of [-1,NaN,Infinity,'1'])assert.throws(()=>sampleDesktopPose('wave',time),RangeError);
});

test('external-clock controller owns no RAF, supports deterministic seek, and copies snapshots',()=>withTestHost(host=>{
  const svg=fixtureSvg();const motion=new ComputerMotion(svg,{cables,state:'facepalm',externalClock:true,pointer:false});
  const at=DESKTOP_PERFORMANCE_BY_ID.facepalm.peakSeconds;
  motion.seek(at);const snapshot=motion.getSnapshot(),attributes=svg.snapshot();
  assert.equal(snapshot.age,at);assert.equal(snapshot.pose.handR,0);assert.equal(snapshot.state,'facepalm');
  snapshot.pose.armRX=999;
  assert.notEqual(motion.getSnapshot().pose.armRX,999);
  motion.setState('idle');motion.advance(.1);motion.setState('facepalm',{immediate:true});motion.seek(at);
  assert.deepEqual(svg.snapshot(),attributes);assert.equal(host.frames.size,0);
  for(const value of [-1,NaN,Infinity,3601,'1'])assert.throws(()=>motion.seek(value),RangeError);
  motion.destroy();assert.equal(host.listeners.size,0);assert(host.observers.every(x=>x.disconnected));
}));

test('all20 finite runtime performances complete once, settle, and stay asleep',()=>withTestHost(host=>{
  for(const entry of DESKTOP_PERFORMANCES.filter(x=>!x.loop)){
    const completed=[],frames=[];
    const motion=new ComputerMotion(fixtureSvg(),{cables,state:entry.id,attitudeEnabled:true,externalClock:true,pointer:false,onComplete:state=>completed.push(state),onFrame:frame=>frames.push(frame)});
    for(let i=0;i<80;i++)motion.advance(.1);
    assert.deepEqual(completed,[entry.id]);assert.equal(motion.complete,true);
    assert.equal(frames.at(-1).complete,true);
    const last=motion.getSnapshot();motion.advance(100);assert.deepEqual(motion.getSnapshot(),last);
    assert.equal(host.frames.size,0);motion.destroy();
  }
}));

test('pause, reduced motion, document hiding and intersection stop time without catch-up',()=>withTestHost(host=>{
  const motion=new ComputerMotion(fixtureSvg(),{cables,state:'wave',pointer:false});
  assert.equal(host.frames.size,1);motion.advance(.2);assert.equal(motion.age,.1);
  for(const [block,unblock] of [
    [()=>motion.pause(),()=>motion.resume()],
    [()=>{host.document.hidden=true;host.emit('visibilitychange');},()=>{host.document.hidden=false;host.emit('visibilitychange');}],
    [()=>host.observers[0].callback([{isIntersecting:false}]),()=>host.observers[0].callback([{isIntersecting:true}])],
  ]){
    block();assert.equal(host.frames.size,0);const age=motion.age;motion.advance(120);assert.equal(motion.age,age);
    unblock();assert.equal(host.frames.size,1);host.runFrame(1e9);assert.equal(motion.age,age,'first resumed frame establishes a fresh clock');
  }
  host.media.matches=true;host.emit('media');assert.equal(host.frames.size,0);
  assert.deepEqual(motion.getSnapshot().pose,peak('wave'));
  const age=motion.age;motion.advance(100);assert.equal(motion.age,age);
  motion.destroy();assert.equal(host.frames.size,0);
}));

test('initial reduced motion and paused loading display representative poses without scheduling',()=>{
  for(const mode of ['reduced','paused'])withTestHost(host=>{
    host.media.matches=mode==='reduced';
    const motion=new ComputerMotion(fixtureSvg(),{cables,state:'facepalm',paused:mode==='paused',pointer:false});
    assert.equal(host.frames.size,0);assert.deepEqual(motion.getSnapshot().pose,peak('facepalm'));
    motion.setIntensity(.8);assert.deepEqual(motion.getSnapshot().pose,peak('facepalm'));
    motion.setState('shrug');assert.deepEqual(motion.getSnapshot().pose,peak('shrug'));
    motion.setIntensity(1);assert.deepEqual(motion.getSnapshot().pose,peak('shrug'));
    motion.destroy();
  });
});

test('rude runtime gate and revocation remove middle-finger variants immediately',()=>withTestHost(()=>{
  const svg=fixtureSvg();const motion=new ComputerMotion(svg,{cables,state:'double-flip-off',externalClock:true,pointer:false});
  assert.equal(motion.state,'eye-roll');assert.equal(motion.requestedState,'double-flip-off');
  motion.setAttitudeEnabled(true);motion.setState('double-flip-off');motion.seek(2.55);
  assert.equal(svg.nodes['gesture-hand-left-middle'].getAttribute('opacity'),'1');
  assert.equal(svg.nodes['gesture-hand-right-middle'].getAttribute('opacity'),'1');
  motion.setAttitudeEnabled(false);
  assert.equal(motion.state,'eye-roll');
  assert.equal(svg.nodes['gesture-hand-left-middle'].getAttribute('opacity'),'0');
  assert.equal(svg.nodes['gesture-hand-right-middle'].getAttribute('opacity'),'0');
  motion.destroy();
}));

test('completion callbacks can select the next state without returnToIdle overwriting it',()=>withTestHost(()=>{
  const motion=new ComputerMotion(fixtureSvg(),{cables,state:'wave',externalClock:true,pointer:false,returnToIdle:true});
  motion.options.onComplete=()=>motion.setState('thumbs-up',{immediate:true});
  motion.seek(4.39);motion.advance(.1);
  assert.equal(motion.state,'thumbs-up');assert.equal(motion.complete,false);
  motion.options.onComplete=undefined;motion.seek(4.19);motion.advance(.1);assert.equal(motion.state,'idle');
  motion.destroy();
}));

test('state and frame callback reentrancy cannot draw a stale pose or revive a destroyed controller',()=>withTestHost(host=>{
  const svg=fixtureSvg();const original=svg.snapshot();
  const motion=new ComputerMotion(svg,{cables,externalClock:true,pointer:false});
  motion.options.onStateChange=state=>{if(state==='facepalm'){motion.setState('shush',{immediate:true});motion.seek(1.9);}};
  motion.setState('facepalm');assert.equal(motion.state,'shush');assert.deepEqual(motion.getSnapshot().pose,peak('shush'));
  motion.options.onStateChange=undefined;
  motion.options.onFrame=()=>motion.destroy();motion.advance(.1);
  assert.equal(motion.destroyed,true);assert.equal(host.frames.size,0);assert.deepEqual(svg.snapshot(),original);
  motion.resume();motion.setExternalClock(false);motion.setState('wave');assert.equal(host.frames.size,0);
}));

test('seek is silent about completion and a replacement seek inside onFrame wins',()=>withTestHost(()=>{
  let completions=0;
  const motion=new ComputerMotion(fixtureSvg(),{cables,state:'wave',externalClock:true,pointer:false,onComplete:()=>completions++});
  motion.seek(10);assert.equal(motion.complete,true);assert.equal(completions,0);
  motion.seek(4.39);let replace=true;
  motion.options.onFrame=()=>{if(replace){replace=false;motion.setState('beckon',{immediate:true});motion.seek(2.15);}};
  motion.advance(.1);assert.equal(completions,0);assert.equal(motion.state,'beckon');assert.equal(motion.complete,false);
  motion.destroy();
}));

function fixtureSvg(){
  const ids=new Set(['body-motion','monitor','fan','rotor-motion','cable-path','connector','search-arm','brow-left','brow-right','brow-left-motion','brow-right-motion','eye-left-motion','eye-right-motion','eye-left','eye-right','desktop-gestures','gesture-face']);
  for(const [id] of gestureAttributes(GESTURE_BASELINE))ids.add(id);
  // A narrow DOM fixture verifies lifecycle and attribute restoration. Separate
  // rendering tests exercise the actual SSR illustration and raster output.
  const nodes=Object.fromEntries([...ids].map(id=>{
    const attributes=new Map([['id',id],['data-rig-id',id],['transform','translate(0 0)'],['d','M0 0 L1 1']]);
    return [id,{id,getAttribute:key=>attributes.has(key)?attributes.get(key):null,setAttribute:(key,value)=>attributes.set(key,String(value)),removeAttribute:key=>attributes.delete(key),attributes}];
  }));
  return {tagName:'svg',dataset:{},nodes,parentElement:null,querySelectorAll:()=>Object.values(nodes),snapshot:()=>Object.fromEntries(Object.entries(nodes).map(([id,node])=>[id,Object.fromEntries(node.attributes)]))};
}
function withTestHost(run){
  const names=['document','matchMedia','requestAnimationFrame','cancelAnimationFrame','IntersectionObserver'];
  const saved=new Map(names.map(name=>[name,Object.getOwnPropertyDescriptor(globalThis,name)]));
  const frames=new Map(),listeners=new Map(),observers=[];let next=1;
  const listen=(name,cb)=>{if(!listeners.has(name))listeners.set(name,new Set());listeners.get(name).add(cb);};
  const remove=(name,cb)=>{listeners.get(name)?.delete(cb);if(!listeners.get(name)?.size)listeners.delete(name);};
  const media={matches:false,addEventListener:(_,cb)=>listen('media',cb),removeEventListener:(_,cb)=>remove('media',cb)};
  const document={hidden:false,addEventListener:listen,removeEventListener:remove};
  class Observer {constructor(callback){this.callback=callback;this.disconnected=false;observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}
  const values={document,matchMedia:()=>media,requestAnimationFrame:cb=>{const id=next++;frames.set(id,cb);return id;},cancelAnimationFrame:id=>frames.delete(id),IntersectionObserver:Observer};
  for(const [name,value]of Object.entries(values))Object.defineProperty(globalThis,name,{value,configurable:true,writable:true});
  try{return run({frames,listeners,observers,media,document,emit:name=>{for(const cb of [...listeners.get(name)||[]])cb();},runFrame:time=>{const item=frames.entries().next().value;assert(item);frames.delete(item[0]);item[1](time);}});}
  finally{for(const [name,descriptor]of saved)if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}
}
