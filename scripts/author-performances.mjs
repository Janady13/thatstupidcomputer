/** Deterministic v2 acting authoring. The supplied vectors and existing keyframes are immutable inputs. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { ALL_ACTIONS, LEGACY_ACTIONS, NEW_ACTIONS, PERFORMANCES, CHARACTER_PERFORMANCES, RESET_ADDITIONS, SOURCE_FINGERPRINTS } from '../apps/web/src/animation/performances/catalog.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const slugs=Object.keys(CHARACTER_PERFORMANCES),RAD=Math.PI/180;
const profiles={smartphone:{gain:.78,delay:.065,tilt:1.18,bounce:.58,blink:.65},'flip-phone':{gain:1.05,delay:.01,tilt:1.3,bounce:.85,blink:1},'app-bot':{gain:1.1,delay:0,tilt:.92,bounce:1.2,blink:.95},pager:{gain:.8,delay:.02,tilt:.8,bounce:.74,blink:1.1},handheld:{gain:.94,delay:0,tilt:.78,bounce:1,blink:.82}};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>{const u=clamp(t);return u*u*(3-2*u);};
function keys(t,list){if(t<=list[0][0])return list[0][1];for(let i=1;i<list.length;i++){const [b,y]=list[i],[a,x]=list[i-1];if(t<=b)return x+(y-x)*smooth((t-a)/(b-a));}return list.at(-1)[1];}
const pulse=(u,a,b,c)=>keys(u,[[0,0],[a,0],[b,1],[c,0],[1,0]]);
const envelope=u=>keys(u,[[0,0],[.09,0],[.2,1.06],[.29,1],[.62,1],[.76,.48],[.94,0],[1,0]]);
const index=root=>{const nodes={};function scan(n){nodes[n.id]=n;for(const c of n.children||[])scan(c);}scan(root);return nodes;};
const baseValue=(nodes,target,property)=>property==='rotation'?(nodes[target].rotation||0)*RAD:nodes[target][property]??(['opacity','scaleX','scaleY'].includes(property)?1:0);
const newPairs=new Set(RESET_ADDITIONS.map(([a,b])=>a+':'+b));
function legacyOriginal(clip){return {...clip,tracks:clip.tracks.filter(t=>!newPairs.has(t.target+':'+t.property))};}
function derivePose(name,raw,slug,nodes,pairs){
 const profile=profiles[slug];let u=clamp((raw-profile.delay)/(1-profile.delay));if(['RunLeft','RunRight'].includes(name))u=raw;
 const p=Object.fromEntries(pairs.map(([target,property])=>[target+':'+property,baseValue(nodes,target,property)]));
 const get=(target,property)=>p[target+':'+property];
 const set=(target,property,value)=>{if(Object.hasOwn(p,target+':'+property))p[target+':'+property]=value;};
 const add=(target,property,value)=>set(target,property,baseValue(nodes,target,property)+value);
 const rot=(target,degrees)=>add(target,'rotation',degrees*RAD);
 const e=envelope(u),g=profile.gain,b=profile.bounce;
 const eyes=(variant,enabled=true)=>{for(const side of ['left','right'])for(const mode of ['neutral','happy','sad','angry'])set(`eye-${side}-${mode}`,'opacity',(enabled?mode===variant:mode==='neutral')?1:0);};
 const hands=(left,right=left,enabled=true)=>{for(const [side,variant]of [['left',left],['right',right]])for(const mode of ['grip','fist','open','point','middle-finger'])set(`hand-${side}-${mode}`,'opacity',(enabled?mode===variant:mode==='grip')?1:0);};
 const arm=(side,upper,fore,wrist=0,strength=e)=>{const factor=strength;set(`upper-arm-${side}`,'rotation',baseValue(nodes,`upper-arm-${side}`,'rotation')+(upper*RAD-baseValue(nodes,`upper-arm-${side}`,'rotation'))*factor);set(`forearm-${side}`,'rotation',baseValue(nodes,`forearm-${side}`,'rotation')+(fore*RAD-baseValue(nodes,`forearm-${side}`,'rotation'))*factor);rot(`wrist-${side}`,wrist*factor);};
 const brows=(left,right,lift=0,strength=e)=>{rot('brow-left',left*strength);rot('brow-right',right*strength);for(const side of ['left','right'])add(`brow-${side}`,'y',lift*strength);};
 const gaze=(x,y=0,strength=e)=>{for(const side of ['left','right']){add(`eye-${side}`,'x',x*strength);add(`eye-${side}`,'y',y*strength);add(`brow-${side}`,'x',x*.3*strength);}};
 const lids=(left,right=left,strength=e)=>{set('eye-left','scaleY',1+(left-1)*strength);set('eye-right','scaleY',1+(right-1)*strength);};
 const shoulders=(left,right=left,strength=e)=>{add('shoulder-left','y',left*strength);add('shoulder-right','y',right*strength);};
 let bodyX=0,bodyY=0,torso=0,device=0,cable=0,note=0,footLiftL=0,footLiftR=0,footXL=0,footXR=0,footRollL=0,footRollR=0,accent=e;
 // Every action owns a complete pose; expressions switch discretely while transforms ease.
 switch(name){
  case 'Laugh':{const ha=keys(u,[[0,0],[.13,0],[.22,1],[.31,.14],[.4,.9],[.49,.08],[.59,.55],[.72,0],[1,0]]);eyes('happy',u>.16&&u<.75);hands('open','fist',e>.25);bodyY=(-7*e-8*ha)*b;torso=(-2*e+2.2*ha)*g;device=2.1*ha;shoulders(-9*ha,-7*ha);arm('left',24,48,-72,e);arm('right',-18,-72,65,e);brows(-6,6,-7);lids(.72,.76);cable=-3*ha;note=4*ha;accent=ha;break;}
  case 'Proud':{bodyY=-8*e*b;torso=-1.8*e*g;device=-1*e;eyes('happy',e>.5);hands('fist','fist',e>.3);arm('left',-27,-78,103,e);arm('right',27,78,-103,e);shoulders(-5,-5);brows(-7,4,-10);gaze(3,-4);const nod=pulse(u,.63,.69,.81);device+=3.7*nod;bodyY+=2*nod;set('excitement-rays','opacity',.75*pulse(u,.17,.3,.5));note=-2*e;break;}
  case 'Shy':{bodyX=-5*e*g;bodyY=8*e*b;torso=3.6*e*g;device=2.6*e;hands('grip','grip');arm('left',-34,-91,115,e);arm('right',31,81,-109,e);shoulders(-9,-5);brows(9,-5,2);gaze(keys(u,[[0,0],[.2,-11],[.5,-11],[.64,5],[.75,-4],[1,0]]),6,1);lids(.54,.65);eyes('sad',u>.2&&u<.61);note=-4*e;break;}
  case 'Suspicious':{const scan=keys(u,[[0,0],[.2,13],[.42,13],[.48,-10],[.64,-10],[.81,2],[1,0]]);bodyX=scan*.38;bodyY=1.8*e;torso=-2.7*e*g;device=2.8*e*profile.tilt;hands('grip','fist',e>.25);arm('left',19,8,-18,e);arm('right',14,67,-82,e);brows(-12,18,-3);add('brow-right','y',-13*e);gaze(scan,-2,1);lids(.38,.65);shoulders(-3,-6);set('question-mark','opacity',.68*e);rot('question-mark',-9*e);cable=-2.5*e;break;}
  case 'Startled':{const j=keys(u,[[0,0],[.09,-.1],[.17,1],[.25,.85],[.41,.3],[.67,0],[1,0]]);accent=j;bodyY=-23*j*b;bodyX=-4*j*g;torso=-4.7*j*g;device=-3.5*j;hands('open','open',j>.1);arm('left',62,112,-171,j);arm('right',-68,-109,173,j);brows(-14,14,-19,j);lids(1.75,1.75,j);gaze(0,-8,j);shoulders(-18,-16,j);footLiftL=-14*j;footLiftR=-9*j;footXL=-3*j;footXR=4*j;set('excitement-rays','opacity',clamp(j));cable=6*j;note=-7*j;break;}
  case 'Frustrated':{const shake=keys(u,[[0,0],[.25,0],[.3,-1],[.35,1],[.4,-.75],[.45,.65],[.5,0],[.58,-.5],[.63,.5],[.69,0],[1,0]]);bodyX=shake*5.5*g;bodyY=5*e*b;torso=shake*2.2+2.2*e;device=-shake*1.4;eyes('angry',e>.16);hands('fist','fist',e>.16);arm('left',35,-41,7,e);arm('right',-37,35,-4,e);shoulders(-8,-9);brows(-13,13,7);lids(.61,.61);set('anger-mark','opacity',e);set('anger-mark','scaleX',1+shake*.08);set('anger-mark','scaleY',1+shake*.08);cable=-shake*3;note=shake*4;break;}
  case 'Sleepy':{const z=keys(u,[[0,0],[.14,.2],[.26,.48],[.36,.23],[.49,.73],[.61,.44],[.76,1],[1,1]]);accent=z;bodyY=14*z*b;torso=3.5*z*g;device=3.6*z;arm('left',7,-2,9,z);arm('right',-5,0,-8,z);shoulders(5,4,z);eyes('sad',z>.2);lids(1-.965*z,1-.965*z,1);brows(7,-7,7,z);gaze(0,7,z);cable=1.5*z;note=-3*z;break;}
  case 'WakeUp':{const z=1-keys(u,[[0,0],[.12,0],[.23,.75],[.31,1],[1,1]]),stretch=keys(u,[[0,0],[.2,0],[.34,1.05],[.45,1],[.6,.88],[.79,0],[1,0]]);accent=z+stretch;bodyY=14*z*b-10*stretch*b;torso=3.5*z*g-1.2*stretch;device=3.6*z-2.2*stretch;shoulders(5*z-14*stretch,4*z-14*stretch,1);eyes('sad',z>.2);lids(1-.965*z,1-.965*z,1);brows(7*z-9*stretch,-7*z+9*stretch,7*z-12*stretch,1);for(const [side,sleepU,sleepF,sleepW,awakeU,awakeF,awakeW]of [['left',7,-2,9,105,50,-153],['right',-5,0,-8,-109,-44,150]]){set(`upper-arm-${side}`,'rotation',baseValue(nodes,`upper-arm-${side}`,'rotation')*(1-z-stretch)+(sleepU*z+awakeU*stretch)*RAD);set(`forearm-${side}`,'rotation',baseValue(nodes,`forearm-${side}`,'rotation')*(1-z-stretch)+(sleepF*z+awakeF*stretch)*RAD);rot(`wrist-${side}`,sleepW*z+awakeW*stretch);}hands('open','open',stretch>.12);gaze(0,7*z-7*stretch,1);const blink=pulse(u,.75,.79,.84)*.8;for(const side of ['left','right'])set(`eye-${side}`,'scaleY',get(`eye-${side}`,'scaleY')*(1-blink));cable=1.5*z-4*stretch;note=-3*z+4*stretch;break;}
  case 'Think':{const look=keys(u,[[0,0],[.18,-8],[.29,-8],[.41,10],[.66,10],[.79,0],[1,0]]),idea=pulse(u,.65,.76,.91);bodyY=-2*e*b;torso=-3.5*e*g;device=2*e-5*idea;hands('point','grip',e>.18);arm('left',-53,-77,132,e);arm('right',-10,20,-12,e);shoulders(-4,1);brows(10,-9,-2);gaze(look,-7,1);lids(.63,.84);set('question-mark','opacity',e*(1-idea));set('excitement-rays','opacity',idea);set('screen-cursor','opacity',u>.16&&u<.65&&Math.floor(u*18)%2===0?1:0);add('screen-cursor','x',18*Math.sin(u*Math.PI*2)*e);note=-2*e;cable=2*idea;break;}
  case 'Facepalm':{const palm=keys(u,[[0,0],[.17,0],[.32,1.04],[.4,1],[.68,1],[.91,0],[1,0]]);bodyY=5*e*b;torso=3.5*palm*g;device=2.8*palm;hands('open','grip',palm>.12);arm('left',-126,25,102,palm);arm('right',-7,2,-8,e);shoulders(-11,-1,palm);brows(9,-7,4);lids(.09,.16,palm);gaze(-4,3,palm);note=-4*palm;cable=2*e;accent=palm;break;}
  case 'Shrug':{bodyY=-4*e*b;torso=2.5*e*g;hands('open','open',e>.1);arm('left',54,120,-160,e);arm('right',-54,-120,160,e);shoulders(-17,-12);brows(13,-9,-12);gaze(4,-3);lids(.83,.54);set('question-mark','opacity',.45*e);rot('question-mark',12*e);note=3.5*e;cable=-2*e;break;}
  case 'PointLeft':case 'PointRight':{const dir=name==='PointRight'?1:-1;const armE=keys(u,[[0,0],[.14,0],[.28,1.04],[.36,1],[.67,1],[.91,0],[1,0]]);bodyX=dir*4*e*g;torso=dir*2.2*e*g;device=dir*.6*e;hands(dir<0?'point':'grip',dir>0?'point':'grip',armE>.12);arm(dir<0?'left':'right',-dir*88,0,180,armE);arm(dir<0?'right':'left',dir*10,dir*9,-dir*10,e);shoulders(dir<0?-7:-2,dir>0?-7:-2);brows(-6,8,-7);gaze(dir*12,-1,keys(u,[[0,0],[.08,.7],[.17,1],[.7,1],[1,0]]));lids(.83,.89);note=-dir*2*e;cable=dir*2.8*e;accent=armE;break;}
  case 'Bow':{const bow=keys(u,[[0,0],[.15,-.08],[.36,1],[.58,1],[.76,-.08],[.93,0],[1,0]]);bodyY=15*bow*b;torso=7*bow*g;device=4*bow;hands('open','grip',e>.2);arm('left',-18,-73,98,e);arm('right',-18,8,-10,e);shoulders(4*bow,3*bow,1);eyes('happy',bow>.4);lids(.52,.52,Math.max(0,bow));brows(5,-5,3,Math.max(0,bow));gaze(0,7,Math.max(0,bow));cable=5*bow;note=-6*bow;accent=bow;break;}
  case 'Jump':{const jump=keys(u,[[0,0],[.15,18],[.22,20],[.32,-41],[.43,-57],[.5,-50],[.64,13],[.73,17],[.86,-3],[1,0]]);const jumpPower=.95+.2*b;bodyY=jump*jumpPower;const air=keys(u,[[0,0],[.23,0],[.33,1],[.49,1],[.64,0],[1,0]]);footLiftL=-74*air*jumpPower;footLiftR=-67*air*jumpPower;footXL=-8*air;footXR=10*air;footRollL=-10*air;footRollR=13*air;hands('fist','fist',u>.2&&u<.77);arm('left',75,35,-90,air);arm('right',-75,-35,90,air);shoulders(-10,-10,air);eyes('happy',air>.2);brows(-8,8,-12,air);device=-2.4*air;torso=-1.2*air;set('ground-shadow','scaleX',1-.25*air);set('ground-shadow','scaleY',1-.25*air);set('ground-shadow','opacity',1-.52*air);cable=-7*air;note=7*air;accent=air;break;}
  case 'Land':{const land=keys(u,[[0,-23],[.12,-11],[.27,20],[.36,22],[.55,-5],[.72,2],[.92,0],[1,0]]);bodyY=land*b;const air=keys(u,[[0,1],[.2,0],[1,0]]);footLiftL=-30*air*b;footLiftR=-26*air*b;footXL=-7*air;footXR=7*air;const impact=pulse(u,.08,.29,.7);arm('left',40,-15,0,impact);arm('right',-42,15,0,impact);hands('open','open',impact>.2);shoulders(8,7,impact);brows(-8,8,4,impact);lids(.47,.47,impact);device=2.7*impact;torso=-2*impact;set('ground-shadow','scaleX',1+.14*impact-.15*air);set('ground-shadow','scaleY',1+.1*impact-.15*air);set('ground-shadow','opacity',1-.3*air);cable=5*impact-2*air;note=-5*impact;accent=impact;break;}
  case 'RunRight':case 'RunLeft':{const dir=name==='RunRight'?1:-1,phase=u*Math.PI*2,swing=Math.sin(phase),liftA=Math.max(0,Math.cos(phase)),liftB=Math.max(0,-Math.cos(phase));bodyY=(-7-5*Math.cos(phase*2))*b;bodyX=1.8*Math.sin(phase*2);torso=dir*4.2*g;device=-dir*1.4;footXL=-dir*29*swing;footXR=dir*29*swing;footLiftL=-30*liftA*b;footLiftR=-30*liftB*b;footRollL=-dir*15*swing;footRollR=dir*15*swing;hands('fist','fist');arm('left',dir*42*swing,dir*(-32-12*swing),0,1);arm('right',-dir*42*swing,dir*(32-12*swing),0,1);shoulders(-3-2*liftA,-3-2*liftB,1);brows(-8+1.6*Math.cos(phase*2),8-1.6*Math.cos(phase*2),-3,1);gaze(dir*7,-2+.45*Math.cos(phase*2),1);lids(.82+.04*Math.cos(phase*2),.82+.04*Math.cos(phase*2),1);cable=-dir*(4+2*Math.sin(phase-.7));note=3*Math.sin(phase-.4);accent=.5+.5*Math.sin(phase);break;}
 }
 // The same authored intent is performed differently by each existing character.
 if(slug==='smartphone'&&!['Sleepy','WakeUp','RunLeft','RunRight'].includes(name)){add('brow-right','y',-4*e);set('eye-left','scaleY',Math.max(.035,get('eye-left','scaleY')-.11*e));}
 if(slug==='pager'&&!['Sleepy','WakeUp','Jump','Land','RunLeft','RunRight'].includes(name)){const jitter=Math.sin(u*Math.PI*30)*Math.sin(u*Math.PI*14)*e;bodyX+=1.3*jitter;device+=.35*jitter;add('eye-right','x',1.2*jitter);}
 if(slug==='app-bot'&&!['Sleepy','WakeUp','RunLeft','RunRight'].includes(name)){const spring=Math.sin(u*Math.PI*12)*pulse(u,.6,.75,.94);bodyY+=2.2*spring;device+=.5*spring;}
 if(slug==='handheld'&&!['Sleepy','WakeUp','RunLeft','RunRight'].includes(name)){brows(-3,3,-1,e);device-=.8*pulse(u,.16,.23,.32);}
 set('body-bob','x',bodyX);set('body-bob','y',bodyY);rot('torso-roll',torso);rot('device-body',device);
 rot('cable-trail',cable);add('cable-trail','y',-bodyY*.55);rot('sticky-note',note);
 if(nodes['flip-head'])rot('flip-head',device*1.55+torso*.38-3*accent);
 if(nodes['panel-image']){rot('panel-image',-device*.7+5*accent+1.2*Math.sin(u*Math.PI*8)*e);rot('panel-list',device*.6-4*accent-1.1*Math.sin(u*Math.PI*8-.45)*e);}
 if(nodes.kickstand)rot('kickstand',2*accent+.7*Math.sin(u*Math.PI*24)*e);
 // Two-link inverse kinematics keeps ordinary moods' feet planted as the body moves.
 for(const [side,lift,dx,roll]of [['left',footLiftL,footXL,footRollL],['right',footLiftR,footXR,footRollR]]){
  const thigh=baseValue(nodes,`thigh-${side}`,'rotation'),calf=baseValue(nodes,`calf-${side}`,'rotation'),L1=nodes[`knee-${side}`].y,L2=nodes[`ankle-${side}`].y;
  const footX=-L1*Math.sin(thigh)-L2*Math.sin(thigh+calf),footY=L1*Math.cos(thigh)+L2*Math.cos(thigh+calf);
  const x=footX+dx-bodyX,y=footY+lift-bodyY,d=clamp(Math.hypot(x,y),18,L1+L2-.6);
  const a=Math.atan2(-x,y)-Math.acos(clamp((L1*L1+d*d-L2*L2)/(2*L1*d),-1,1));
  const c=Math.acos(clamp((d*d-L1*L1-L2*L2)/(2*L1*L2),-1,1));
  set(`thigh-${side}`,'rotation',a);set(`calf-${side}`,'rotation',c);set(`ankle-${side}`,'rotation',-a-c+roll*RAD);
 }
 for(const key of Object.keys(p))if(key.endsWith(':opacity'))p[key]=clamp(p[key]);
 for(const [key,value]of Object.entries(p))assert(Number.isFinite(value),`${name}: ${key} nonfinite`);
 return p;
}
function simplify(points,tolerance){if(points.length<=2)return points;let worst=0,index=0;const [first,last]=[points[0],points.at(-1)];for(let i=1;i<points.length-1;i++){const p=points[i],linear=first[1]+(last[1]-first[1])*(p[0]-first[0])/(last[0]-first[0]);const distance=Math.abs(p[1]-linear);if(distance>worst){worst=distance;index=i;}}return worst<=tolerance?[first,last]:[...simplify(points.slice(0,index+1),tolerance).slice(0,-1),...simplify(points.slice(index),tolerance)];}
for(const slug of slugs){
 const dir=resolve(root,`apps/web/public/animation/mobile/${slug}`),scene=readFileSync(resolve(dir,'scene.json'));
 assert.equal(createHash('sha256').update(scene).digest('hex'),SOURCE_FINGERPRINTS[slug].sceneSHA256,'Vector source changed');
 const nodes=index(JSON.parse(scene).root),old=JSON.parse(readFileSync(resolve(dir,'motion.json'),'utf8')).filter(c=>LEGACY_ACTIONS.includes(c.name)).map(legacyOriginal);
 for(const clip of old)assert.equal(createHash('sha256').update(JSON.stringify(clip)).digest('hex'),SOURCE_FINGERPRINTS[slug].legacyClips[clip.name],`${slug}/${clip.name}: legacy keyframes changed`);
 const pairs=[...old[0].tracks.map(t=>[t.target,t.property]),...RESET_ADDITIONS];
 for(const clip of old)for(const[target,property]of RESET_ADDITIONS)clip.tracks.push({target,property,interpolation:property==='opacity'?'hold':'linear',keys:[[0,baseValue(nodes,target,property)],[clip.duration,baseValue(nodes,target,property)]]});
 const authored=NEW_ACTIONS.map(name=>{const spec=PERFORMANCES[name],duration=Math.round(spec.seconds*60),poses=Array.from({length:duration+1},(_,frame)=>derivePose(name,frame/duration,slug,nodes,pairs));
 const tracks=pairs.map(([target,property])=>{const hold=property==='opacity'&&(target.startsWith('eye-')||target.startsWith('hand-')||target==='screen-cursor');const all=poses.map((pose,frame)=>[frame,Number(pose[target+':'+property].toFixed(6))]);let points;if(hold){points=all.filter((p,i)=>i===0||i===all.length-1||p[1]!==all[i-1][1]);}else{points=simplify(all,property==='rotation'?.0007:['x','y'].includes(property)?.045:.0012);}return {target,property,interpolation:hold?'hold':'linear',keys:points};});
 return {name,fps:60,duration,seconds:duration/60,loop:spec.loop,description:`${spec.description} ${CHARACTER_PERFORMANCES[slug].actingNotes}`,tracks,travelPerCycle:name.startsWith('Run')?148:0};});
 const result=[...old,...authored];assert.deepEqual(result.map(c=>c.name),ALL_ACTIONS);const json=JSON.stringify(result);assert(Buffer.byteLength(json)<2_000_000,`${slug}: transfer budget exceeded`);writeFileSync(resolve(dir,'motion.json'),json);console.log(`${slug}: ${result.length} actions, ${pairs.length} reset tracks, ${Buffer.byteLength(json)} bytes`);
}
const manifestPath=resolve(root,'apps/web/public/animation/manifest.json'),manifest=JSON.parse(readFileSync(manifestPath,'utf8'));manifest.version='2.0.0';for(const character of manifest.characters){const motion=JSON.parse(readFileSync(resolve(root,`apps/web/public/animation/mobile/${character.slug}/motion.json`),'utf8'));character.clips=motion.map(c=>({name:c.name,seconds:c.seconds,loop:c.loop}));character.personality=CHARACTER_PERFORMANCES[character.slug].personality;character.recommendedActions=CHARACTER_PERFORMANCES[character.slug].recommendedActions;}writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
