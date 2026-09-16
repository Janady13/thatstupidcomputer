/* Construct the SVG controller in a client effect; pose sampling is DOM-free. */
import { DESKTOP_STATE_IDS, DESKTOP_PERFORMANCE_BY_ID, safeDesktopState } from './performances.mjs';
import { GESTURE_BASELINE, gestureAttributes } from './gesture-geometry.mjs';
const global = globalThis;

const STATES = DESKTOP_STATE_IDS;
const SHOTS = Object.freeze([
  {state:'idle',duration:4.8}, {state:'alert',duration:4.7},
  {state:'overheating',duration:5.5}, {state:'searching',duration:6.5},
  {state:'defeated',duration:4.5}, {state:'revived',duration:6.5}
]);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>{t=clamp(t);return t*t*(3-2*t)};
const ease=t=>{t=clamp(t);return 1-Math.pow(1-t,3)};
const pulse=(t,at,width)=>Math.exp(-Math.pow((t-at)/width,2));
const deg=r=>r*Math.PI/180;
const f=v=>(Math.abs(v)<.0005?0:v).toFixed(2);
const move=(x,y,a=0,cx=0,cy=0)=>`translate(${f(x)} ${f(y)}) rotate(${f(a)} ${cx} ${cy})`;
const transformPoint=(x,y,dx,dy,a,cx,cy)=>{
  const c=Math.cos(deg(a)),s=Math.sin(deg(a));
  return [dx+cx+(x-cx)*c-(y-cy)*s,dy+cy+(x-cx)*s+(y-cy)*c];
};
const bounce=t=>{
  t=clamp(t);const n=7.5625,d=2.75;
  if(t<1/d)return n*t*t;
  if(t<2/d){t-=1.5/d;return n*t*t+.75}
  if(t<2.5/d){t-=2.25/d;return n*t*t+.9375}
  t-=2.625/d;return n*t*t+.984375;
};
const BLINKS={idle:[.55,2.9,3.2],alert:[1.7,3.7],overheating:[2.9],searching:[1.6,4.5],defeated:[],revived:[2.4,4.9],amused:[4.8],skeptical:[3.9,4.12],sleepy:[],proud:[3.8],startled:[2.1,2.35,4.8],thinking:[2.8,5.7]};
function pose(state,t) {
  // Rigid shells. Only the face and flexible appendages change shape.
  const p={bodyX:0,bodyY:0,bodyR:0,headX:0,headY:0,headR:0,
    fanX:714,fanY:842,fanR:13,fanWire:1,fanSpeed:0,
    eyeOpenL:1,eyeOpenR:1,eyeOpacity:1,browY:0,browL:0,browR:0,
    browHappy:0,gazeX:0,gazeY:0,noteR:0,heat:0,steam:0,dirt:1,
    glass:0,glassX:0,glassY:0,glassR:0,cursor:0,
    plugY:0,plugR:0,cableCoil:0,cableAmp:0,dustKick:0,...GESTURE_BASELINE};
  if(STATES.indexOf(state)>=12)return extendedPose(state,t,p);
  const s=Math.sin,c=Math.cos;
  const u=t%6.4;
  if(state==='idle') {
    const sigh=pulse(u,2.6,1.05);
    p.bodyR=.7*s(t*.98);p.bodyY=-2.5*(1+c(t*1.3));
    p.headR=2.4*s(t*1.12)+3.8*sigh-1.4;
    p.headY=6*sigh-1.8*c(t*1.3);
    p.eyeOpenL=.96-.25*sigh;p.eyeOpenR=.96-.18*sigh;
    p.browY=3*sigh;p.gazeX=10*s(t*.95);p.gazeY=5*sigh;
    p.fanX=714+14*s(t*1.82);p.fanY=842+4*c(t*3.64);p.fanR=13+6*s(t*1.82);
    p.fanSpeed=95*pulse(u,1.5,.3)+65*pulse(u,4.85,.2);
    p.noteR=3.8*s(t*2.3+.6)+1.5*s(t*4.7);
    p.cableAmp=6;p.plugR=2.8*s(t*1.8);p.plugY=-3*(1+s(t*1.8));
  } else if(state==='alert') {
    const attention=pulse(t,1.3,.38);
    p.bodyR=-1.1+.5*s(t*1.9);p.bodyY=-7-2*s(t*1.6);
    p.headR=-4.7+1.9*s(t*1.4)-2*attention;p.headY=-3;
    p.eyeOpenL=1.85+.15*attention;p.eyeOpenR=1.75+.25*attention;
    p.browY=-17;p.browL=-10;p.browR=9;
    p.gazeX=15*s(t*.9);p.gazeY=-7+3*s(t*1.2);
    p.fanX=714+10*s(t*2.2);p.fanR=13+7*s(t*2.2);p.fanSpeed=18+40*pulse(t%4,2,.25);
    p.noteR=6*s(t*3.5)*Math.exp(-t*.14);
    p.cableAmp=12;p.plugR=7*s(t*2.4)*Math.exp(-t*.23);p.plugY=-13*Math.abs(s(t*2.4))*Math.exp(-t*.23);
  } else if(state==='overheating') {
    p.bodyX=2.6*s(t*13.5);p.bodyR=.95*s(t*8);p.bodyY=-4*(1+s(t*5));
    p.headR=2.8+1.5*s(t*6.4);p.headY=4+2*s(t*5);
    p.eyeOpenL=.38+.06*s(t*3);p.eyeOpenR=.44+.05*c(t*3);
    p.browY=13;p.browL=-5;p.browR=5;
    p.fanX=714+10*s(t*9);p.fanY=842+5*s(t*7);p.fanR=13+8*s(t*7);
    p.fanSpeed=225+135*s(t*2.4)+40*s(t*7);p.noteR=7*s(t*5.4);
    p.heat=.88+.1*s(t*.9);p.steam=1;p.cableAmp=13;
    p.plugR=3*s(t*5);p.plugY=-5*Math.abs(s(t*4));p.dustKick=.7;
  } else if(state==='searching') {
    p.bodyR=.9*s(t*1.15);p.bodyY=-4;
    p.headR=-3+4.3*s(t*1.02);p.headY=-2+3*s(t*1.5);
    p.eyeOpenL=1.38+.2*s(t*1.3);p.eyeOpenR=1.9-.18*s(t*1.3);
    p.browY=-12;p.browL=-12+4*s(t*1.1);p.browR=5;
    p.glass=1;p.glassX=-78+82*c(t*1.08);p.glassY=9*s(t*2.16);p.glassR=4*s(t*1.08);
    p.gazeX=-10+15*c(t*1.08);p.gazeY=3*s(t*2.16);
    p.fanX=714+8*s(t*1.65);p.fanR=13+6*s(t*1.65);p.fanSpeed=20*pulse(t%5,3,.4);
    p.noteR=4*s(t*2.7);p.cableAmp=8;p.plugR=2*s(t*1.65);
  } else if(state==='defeated') {
    p.bodyR=1.7;p.headR=7.2+.35*s(t*1.1);p.headY=8;
    p.eyeOpacity=0;p.eyeOpenL=.1;p.eyeOpenR=.1;
    p.fanX=920;p.fanY=1068;p.fanR=-26;p.fanWire=0;
    p.cursor=1;p.noteR=4+1.2*s(t*1.2);p.cableAmp=2;
    p.plugR=-4;p.plugY=0;
  } else if(state==='revived') {
    const nod=pulse(t%6.2,2.2,.42)-.7*pulse(t%6.2,2.75,.3);
    p.bodyR=-.55+.5*s(t*1.35);p.bodyY=-4-2*s(t*1.35);
    p.headR=-2.3+1.5*s(t*1.2)+2.8*nod;p.headY=-3;
    p.eyeOpenL=1.9-.25*nod;p.eyeOpenR=1.9-.2*nod;
    p.browY=-14;p.browL=-2;p.browR=2;p.browHappy=1;
    p.gazeX=9*s(t*.9);p.gazeY=-2;
    p.fanX=766;p.fanY=831;p.fanR=0;p.fanWire=0;p.fanSpeed=300;
    p.dirt=0;p.cableCoil=1;p.cableAmp=1;
    p.noteR=2.8*s(t*2.3);p.plugR=3*s(t*1.6);p.plugY=-5*(1+s(t*1.6));
  } else if(state==='amused') {
    // Three dry chuckles: face leads, heavy housing follows, note settles last.
    const laugh=pulse(u,.85,.19)+.88*pulse(u,1.3,.2)+.68*pulse(u,1.8,.24);
    p.headR=-3+3.6*laugh;p.headY=2-9*laugh;p.bodyY=-2-4*laugh;
    p.eyeOpenL=.38+.3*(1-laugh);p.eyeOpenR=.48+.2*(1-laugh);
    p.browY=-8;p.browHappy=.8;p.gazeX=4;p.gazeY=-2;
    p.fanR=13+4*s(t*7)*laugh;p.fanSpeed=35+35*laugh;
    p.noteR=5*s(t*7)*Math.exp(-(u%3)*.8);p.cableAmp=5;p.plugR=2*s(t*3);
  } else if(state==='skeptical') {
    const look=smooth(u/.6),beat=pulse(u,2.3,.35);
    p.headR=5+1.5*beat;p.headY=2;p.bodyR=-.8;
    p.eyeOpenL=.5;p.eyeOpenR=1.1;p.browY=-3;p.browL=15;p.browR=-17;
    p.gazeX=-17*look;p.gazeY=-2;p.fanSpeed=8;
    p.noteR=2*s(t*1.5);p.cableAmp=2;p.plugR=-3;
  } else if(state==='sleepy') {
    const breath=(1+s(t*1.15))*.5,nod=pulse(u,3.6,.65);
    p.headR=6+5*nod;p.headY=8+10*nod;p.bodyY=2*breath;p.bodyR=1.2;
    p.eyeOpenL=.19-.13*nod;p.eyeOpenR=.23-.16*nod;p.browY=10;
    p.gazeY=6;p.fanSpeed=5+9*breath;p.fanR=17;
    p.noteR=1.5*s(t*.8);p.cableAmp=1;p.plugR=-4;
  } else if(state==='proud') {
    const nod=pulse(u,1.4,.26)-.6*pulse(u,1.8,.24);
    p.bodyY=-8;p.bodyR=-1.1;p.headY=-8;p.headR=-5+2.5*nod;
    p.eyeOpenL=.76;p.eyeOpenR=.86;p.browY=-13;p.browL=-6;p.browR=6;p.browHappy=.55;
    p.gazeX=6;p.gazeY=-6;p.fanSpeed=110;p.fanX=730;p.fanY=834;
    p.noteR=3*s(t*1.7);p.cableAmp=5;p.plugY=-7;p.plugR=6;
  } else if(state==='startled') {
    const recoil=Math.exp(-u*1.7),settle=s(u*12)*Math.exp(-u*2);
    p.bodyX=6*settle;p.bodyY=-13*recoil;p.bodyR=-2*recoil;
    p.headY=-12*recoil;p.headR=-9*recoil+2*settle;
    p.eyeOpenL=1.3+1.15*recoil;p.eyeOpenR=1.3+1.05*recoil;p.browY=-9-15*recoil;
    p.browL=-12*recoil;p.browR=12*recoil;p.gazeY=-4;
    p.fanR=13+12*settle;p.fanSpeed=25+70*recoil;
    p.noteR=14*s(u*10)*Math.exp(-u*1.1);p.cableAmp=4+16*recoil;p.plugY=-22*recoil;p.plugR=14*settle;
  } else if(state==='thinking') {
    const glance=smooth(u/.7)-smooth((u-3.4)/.8),nod=pulse(u,4.9,.32);
    p.headR=-6+3*nod;p.headY=-1;p.bodyR=.45*s(t*.7);
    p.eyeOpenL=.72;p.eyeOpenR=1.13;p.browY=-5;p.browL=-12;p.browR=9;
    p.gazeX=14*glance;p.gazeY=-9*glance;p.fanSpeed=15+12*nod;
    p.noteR=2.2*s(t*1.5);p.cableAmp=3;p.plugR=3*s(t*.9);
  }
  let b=1;
  for(const at of BLINKS[state]) b=Math.min(b,1-.95*pulse(t%6.4,at,.063));
  p.eyeOpenL*=b;p.eyeOpenR*=b;
  return p;
}
const windowAt=(t,a,b,c,d)=>smooth((t-a)/(b-a))*(1-smooth((t-c)/(d-c)));
function extendedPose(state,seconds,baseline) {
  const duration=DESKTOP_PERFORMANCE_BY_ID[state].seconds;
  const t=Math.min(seconds,duration),s=Math.sin;
  // Each new performance has a full anticipation, readable hold and recovery.
  // Every channel returns to its baseline by the finite deadline.
  const e=windowAt(t,0,.65,duration-1.1,duration);
  const p={...baseline},beat=pulse(t,1.15,.28),after=pulse(t,1.65,.32);
  p.gestureOpacity=1;p.cableAmp=4;p.noteR=2*s(t*2.2);p.fanSpeed=25;
  const arm=(side,x,y,r=0,bend=0,hand=0)=>Object.assign(p,side==='L'?{armLX:x,armLY:y,armLR:r,armLBend:bend,handL:hand}:{armRX:x,armRY:y,armRR:r,armRBend:bend,handR:hand});
  if(state==='happy') {
    const nod=pulse(t,1.25,.22)-.6*pulse(t,1.62,.22);
    p.bodyY=-7-3*nod;p.headY=-4;p.headR=-3+3*nod;p.browY=-12;p.browHappy=1;
    p.eyeOpenL=.62;p.eyeOpenR=.7;p.mouthSmile=.92;p.fanSpeed=115;p.cableAmp=5;
    arm('L',-28,-110,-34,-34);arm('R',32,-115,35,35);
  } else if(state==='sad') {
    const sigh=pulse(t,2.0,.65);
    p.bodyY=5*sigh;p.bodyR=1.7;p.headY=15+5*sigh;p.headR=8;p.browY=6;
    p.browL=-15;p.browR=15;p.eyeOpenL=.36;p.eyeOpenR=.43;p.gazeY=9;p.mouthSmile=-.8;
    p.fanSpeed=5;p.fanR=20;p.noteR=3+.7*s(t);p.cableAmp=1;p.plugR=-5;
    arm('L',-14,37,-20,18);arm('R',9,34,24,-18);
  } else if(state==='angry') {
    const stamp=pulse(t,1.38,.13),recoil=pulse(t,1.18,.16);
    p.bodyY=-8*recoil+6*stamp;p.bodyR=-1.7;p.headR=-4+3*stamp;p.headY=3;
    p.eyeOpenL=.4;p.eyeOpenR=.46;p.browY=8;p.browL=20;p.browR=-20;p.gazeY=-1;
    p.mouthSmile=-.7;p.heat=.12;p.steam=.25;p.fanSpeed=165+80*stamp;p.cableAmp=12;p.plugY=-8*stamp;
    arm('L',-28,-115-22*stamp,-20,-22,1);arm('R',30,-113-18*stamp,20,24,1);
  } else if(state==='confused') {
    const turn=smooth((t-.6)/.45)-2*smooth((t-1.35)/.5)+smooth((t-2.35)/.5);
    p.headR=7*turn;p.headY=-3;p.eyeOpenL=.72;p.eyeOpenR=1.4;p.browY=-8;p.browL=14;p.browR=-15;
    p.gazeX=18*turn;p.gazeY=-3;p.mouthOpen=.12;p.fanSpeed=12;p.noteR=-3*turn;
    arm('L',25,-178,-58,-30);arm('R',48,-172,56,32);
  } else if(state==='sassy') {
    const dismiss=windowAt(t,.8,1.4,2.35,2.85);
    p.bodyR=-1.8;p.headR=7;p.headY=-3;p.eyeOpenL=.48;p.eyeOpenR=.86;p.browL=17;p.browR=-13;
    p.browY=-5;p.gazeX=-17;p.mouthSmile=.4;p.fanSpeed=18;p.noteR=-3;
    arm('L',65,-100,45,30);arm('R',35+55*dismiss,-190-24*dismiss,25+28*dismiss,60);
  } else if(state==='eye-roll') {
    const roll=clamp((t-.8)/1.5),arc=Math.sin(Math.PI*roll);
    p.gestureOpacity=0;p.headR=4+3*arc;p.headY=3*arc;p.eyeOpenL=.72-.25*arc;p.eyeOpenR=.85-.2*arc;
    p.gazeX=20*Math.cos(Math.PI*roll);p.gazeY=-20*arc;p.browY=-3;p.browL=11;p.browR=-9;
    p.mouthSmile=-.3;p.fanSpeed=8;p.cableAmp=2;
  } else if(state==='facepalm') {
    const cover=windowAt(t,.35,1.15,2.75,3.6),meet=pulse(t,1.33,.2);
    p.headR=5+3*cover;p.headY=8*cover+3*meet;p.eyeOpenL=.22;p.eyeOpenR=.25;p.browY=8;
    p.gazeY=8;p.mouthSmile=-.7;p.fanSpeed=5;p.bodyR=1.1;p.cableAmp=1;p.noteR=4*meet;
    arm('L',8,5,-12,12);arm('R',-463*cover,-452*cover,-13*cover,100*cover,0);
  } else if(state==='shrug') {
    const shoulder=windowAt(t,.4,1.1,2.2,2.8);
    p.bodyY=-5*shoulder;p.headY=-3;p.headR=-4;p.eyeOpenL=.8;p.eyeOpenR=1.15;
    p.browY=-14;p.browL=-8;p.browR=12;p.mouthOpen=.16;p.gazeY=-2;p.fanR=13-4*shoulder;
    arm('L',25,-200*shoulder,-63,-35);arm('R',46,-198*shoulder,63,35);
  } else if(state==='wave') {
    const wave=windowAt(t,.7,1.0,2.7,3.0)*Math.sin((t-1)*9.5);
    p.headR=-4;p.headY=-3;p.eyeOpenL=.75;p.eyeOpenR=.85;p.browY=-10;p.browHappy=.8;p.mouthSmile=.65;
    p.gazeX=5;p.bodyR=-.7;p.noteR=-2*wave;p.fanSpeed=60;
    arm('L',5,-5,-8,10);arm('R',25+8*wave,-325+6*wave,18+24*wave,70);
  } else if(state==='point-left'||state==='point-right') {
    const right=state==='point-right',lead=windowAt(t,.1,.55,2.9,3.7),nod=pulse(t,2.0,.2);
    p.gazeX=(right?22:-22)*lead;p.headR=(right?-3:4)+2*nod;p.headY=-3;
    p.eyeOpenL=1.12;p.eyeOpenR=1.13;p.browY=-10;p.mouthSmile=.4;p.bodyR=right?-1:1;
    p.fanSpeed=55;p.noteR=2*nod;
    if(right){arm('R',172,-247,90,15,2);arm('L',12,-25,-15,15);}
    else{arm('L',32,-249,-90,-15,2);arm('R',-8,-20,12,-10);}
  } else if(state==='beckon'||state==='demo-invite') {
    const invite=state==='demo-invite',curlWindow=windowAt(t,.8,1.15,2.7,3.1),curl=(1+Math.sin((t-1.05)*7.5))*.5*curlWindow;
    const present=invite?smooth((t-2.7)/.65):0;
    p.headR=-4+2*pulse(t,1.6,.22);p.headY=-4;p.bodyR=-1.4;p.eyeOpenL=.84;p.eyeOpenR=1.13;
    p.browY=-11;p.browHappy=.65;p.gazeX=14*present;p.mouthSmile=.72;p.fanSpeed=75;p.cableAmp=5;
    arm('L',-12,-45,-22,-12);
    arm('R',mix(8,115,present)-18*curl,mix(-255,-196,present)+30*curl,mix(-15,64,present)-25*curl,70, present>.25?0:curl>.62?1:0);
  } else if(state==='thumbs-up') {
    const nod=pulse(t,1.3,.24)-.6*pulse(t,1.65,.23);
    p.headR=-4+4*nod;p.headY=-6;p.bodyY=-3;p.eyeOpenL=.75;p.eyeOpenR=.8;p.browY=-12;p.browHappy=.8;
    p.mouthSmile=.72;p.fanSpeed=105;p.plugY=-5*nod;
    arm('L',-3,-25,-8,10);arm('R',35,-250,-8,50,3);
  } else if(state==='bow') {
    const bow=windowAt(t,.6,1.7,2.65,3.8);
    p.bodyR=4*bow;p.bodyY=8*bow;p.headR=15*bow;p.headY=22*bow;
    p.eyeOpenL=1-.86*bow;p.eyeOpenR=1-.84*bow;p.browY=8*bow;p.gazeY=10*bow;p.mouthSmile=.55;
    p.fanR=13+5*bow;p.fanSpeed=40;p.noteR=5*bow;p.cableAmp=3;
    arm('L',175,-72,-72,-25);arm('R',-150,-65,78,30);
  } else if(state==='shush') {
    const hush=windowAt(t,.3,1.1,2.7,3.6);
    p.headR=-4;p.headY=-3;p.eyeOpenL=.76;p.eyeOpenR=.9;p.browY=-9;p.gazeX=-4;
    p.mouthOpen=.2;p.fanSpeed=3;p.cableAmp=1;p.noteR=0;
    arm('L',4,8,-10,8);arm('R',-463*hush,-312*hush,0,110*hush,4);
  } else if(state==='raspberry') {
    const spit=windowAt(t,.65,1.1,2.0,2.5),flutter=Math.sin(t*27)*spit;
    p.headR=-3+flutter*.8;p.bodyX=flutter;p.headY=-2;p.eyeOpenL=.48;p.eyeOpenR=.54;
    p.browY=-3;p.browL=6;p.browR=-6;p.mouthOpen=.8*spit;p.tongue=spit;p.gazeX=1;
    p.fanSpeed=20+55*spit;p.noteR=3*flutter;p.cableAmp=3+3*spit;
    arm('L',-18,-68,-34,-20);arm('R',20,-65,32,22);
  } else if(state==='rude-flip-off'||state==='double-flip-off') {
    const double=state==='double-flip-off',right=windowAt(t,.62,1.45,duration-1.5,duration-.4),left=double?windowAt(t,1.08,1.9,duration-1.4,duration-.35):0;
    p.headR=6;p.headY=-3;p.bodyR=-1.8;p.eyeOpenL=.39;p.eyeOpenR=.66;p.browY=1;p.browL=15;p.browR=-17;
    p.gazeX=double?0:-13;p.mouthSmile=-.25;p.fanSpeed=12;p.cableAmp=3;p.noteR=-2;
    arm('R',14*right,-305*right,(-10+3*pulse(t,2,.2))*right,50*right,right>.68?5:1);
    arm('L',double?-15*left:70,double?-294*left:-90,double?9*left:45,-50*left,left>.68?5:double?1:0);
  } else if(state==='demo-success') {
    const relief=pulse(t,.85,.3),nod=pulse(t,1.7,.24)-.6*pulse(t,2.08,.2);
    p.bodyY=-6;p.bodyR=-1;p.headY=-7+4*relief;p.headR=-5+4*nod;p.eyeOpenL=.73;p.eyeOpenR=.78;
    p.browY=-14;p.browHappy=1;p.mouthSmile=.92;p.dirt=.2;p.fanSpeed=185;p.cableCoil=.45;p.cableAmp=2;p.plugY=-6;
    arm('L',25,-168,-58,-25);arm('R',38,-261,-10,50,3);
  }
  const out={};
  for(const key of Object.keys(p))out[key]=key==='handL'||key==='handR'?(e>.02?p[key]:0):mix(baseline[key],p[key],e);
  return out;
}
export function sampleDesktopPose(state,seconds,options={}) {
  state=safeDesktopState(state,options.attitudeEnabled);
  if(!Number.isFinite(seconds)||seconds<0)throw new RangeError('Time must be finite and nonnegative');
  return pose(state,seconds);
}
export class ComputerMotion {
  constructor(svg,options={}) {
    if(!svg||svg.tagName.toLowerCase()!=='svg')throw new TypeError('ComputerMotion requires the inline character SVG.');
    this.svg=svg;this.options=options;this.nodes={};
    for(const node of svg.querySelectorAll('[id]'))this.nodes[node.getAttribute('data-rig-id')||node.id]=node;
    for(const id of ['body-motion','monitor','fan','rotor-motion','cable-path','connector','search-arm']) {
      if(!this.nodes[id])throw new Error('Missing required rig layer: '+id);
    }
    const cables=options.cables||global.COMPUTER_CABLE_POSES;
    if(!cables||cables.idle.length!==158||cables.revived.length!==158)throw new Error('Two matching 26-cubic cable poses are required.');
    this.cables=cables;this.pathBuffer=new Float64Array(158);
    this.originalBrows=[this.nodes['brow-left'].getAttribute('d'),this.nodes['brow-right'].getAttribute('d')];
    this.attitudeEnabled=options.attitudeEnabled===true;
    this.requestedState=STATES.includes(options.state)?options.state:'idle';
    this.state=safeDesktopState(this.requestedState,this.attitudeEnabled);this.complete=false;this.revision=0;
    this.age=options.paused&&STATES.indexOf(this.state)>=12?DESKTOP_PERFORMANCE_BY_ID[this.state].peakSeconds:0;
    this.time=this.age;this.angle=0;this._pose=pose(this.state,this.age);this.from={...this._pose};this.transition=1.15;
    this.intensity=clamp(options.intensity??1,.3,1.35);this.fps=clamp(options.fps??30,15,60);
    this.visible=true;this.paused=!!options.paused;this.external=!!options.externalClock;this.destroyed=false;this.raf=0;this.last=0;
    this.pointer={x:0,y:0,targetX:0,targetY:0};this.nudgeAge=99;
    this.tour=false;this.tourTime=0;this.shot=0;this.cache=new Map();this.originalAttributes=new Map();
    this.media=global.matchMedia('(prefers-reduced-motion: reduce)');this.reduced=this.media.matches;
    this._media=()=>{this.reduced=this.media.matches;if(this.reduced)this.stopShowcase();if(this.destroyed)return;this._draw(this.reduced?pose(this.state,DESKTOP_PERFORMANCE_BY_ID[this.state].peakSeconds):this._pose);this._sync();};
    this._visibility=()=>this._sync();
    this._pointerMove=e=>{if(this.paused||this.reduced||this.complete)return;const rect=this.svg.getBoundingClientRect();if(!(rect.width>0&&rect.height>0))return;this.pointer.targetX=clamp((e.clientX-rect.left)/rect.width*2-1,-1,1);this.pointer.targetY=clamp((e.clientY-rect.top)/rect.height*2-1,-1,1);};
    this._pointerLeave=()=>{this.pointer.targetX=0;this.pointer.targetY=0;};
    this.media.addEventListener('change',this._media);document.addEventListener('visibilitychange',this._visibility);
    const hit=options.pointerTarget||svg.parentElement;this.hit=hit;
    if(options.pointer!==false&&hit){hit.addEventListener('pointermove',this._pointerMove,{passive:true});hit.addEventListener('pointerleave',this._pointerLeave,{passive:true});}
    if('IntersectionObserver' in global){this.io=new IntersectionObserver(entries=>{this.visible=entries[0].isIntersecting;this._sync();},{threshold:.01});this.io.observe(svg);}
    this._frame=t=>{this.raf=0;if(!this._allowed())return;if(!this.last)this.last=t;const dt=(t-this.last)/1000;if(dt>=1/this.fps-.001){this.last=t;this.advance(Math.min(dt,.08));}if(this._allowed()&&!this.raf)this.raf=requestAnimationFrame(this._frame);};
    const initialRevision=this.revision;
    this._draw(this.reduced?pose(this.state,DESKTOP_PERFORMANCE_BY_ID[this.state].peakSeconds):this._pose);
    if(!this.destroyed&&this.revision===initialRevision)this._notify();
    if(options.autoplay&&!this.reduced&&!this.destroyed&&this.revision===initialRevision)this.playShowcase();
    this._sync();
  }
  _set(id,attribute,value) {
    const key=id+':'+attribute,v=String(value);if(this.cache.get(key)===v)return;
    const node=this.nodes[id];if(node&&!this.originalAttributes.has(key))this.originalAttributes.set(key,{node,attribute,value:node.getAttribute(attribute)});node?.setAttribute(attribute,v);this.cache.set(key,v);
  }
  _allowed(){return !this.destroyed&&!this.paused&&!this.reduced&&!this.complete&&!document.hidden&&this.visible&&!this.external;}
  _sync(){if(this.destroyed)return;if(this._allowed()){if(!this.raf){this.last=0;this.raf=requestAnimationFrame(this._frame);}}else{cancelAnimationFrame(this.raf);this.raf=0;this.last=0;}this.options.onPlaybackChange?.({paused:this.paused,reduced:this.reduced,visible:this.visible,tour:this.tour});}
  _notify(){if(this.destroyed)return;this.svg.dataset.state=this.state;this.options.onStateChange?.(this.state);}
  setState(state,{immediate=false,keepTour=false}={}) {
    if(this.destroyed)return;
    const requested=state;state=safeDesktopState(state,this.attitudeEnabled);
    const revision=++this.revision;
    if(!keepTour)this.stopShowcase();
    if(this.destroyed||this.revision!==revision)return;
    this.from={...this._pose};this.state=state;this.requestedState=requested;this.age=0;this.complete=false;
    this.transition=state==='defeated'?1.5:state==='revived'?1.8:state==='startled'?.14:STATES.indexOf(state)>=6?.4:1.05;
    if(immediate||this.reduced||this.paused){this.age=STATES.indexOf(state)>=12?(this.paused?DESKTOP_PERFORMANCE_BY_ID[state].peakSeconds:0):this.transition;this.from=pose(state,this.age);this._pose={...this.from};}
    this._notify();if(this.destroyed||this.revision!==revision)return;
    const staticTime=DESKTOP_PERFORMANCE_BY_ID[state].peakSeconds;
    this._draw(this.reduced||(this.paused&&STATES.indexOf(state)>=12)?pose(state,staticTime):this._pose);
    if(!this.destroyed&&this.revision===revision)this._sync();
  }
  playShowcase(){if(this.reduced||this.destroyed)return;this.tour=true;this.tourTime=0;this.shot=0;const revision=this.revision+1;this.setState('idle',{keepTour:true});if(this.destroyed||this.revision!==revision)return;this.paused=false;this._sync();}
  stopShowcase(){if(this.destroyed)return;this.tour=false;this.options.onProgress?.(0,false);}
  nudge(){if(!this.reduced&&!this.destroyed&&!this.complete){this.nudgeAge=0;this._sync();}}
  setIntensity(value){if(this.destroyed)return;this.intensity=clamp(Number(value)||1,.3,1.35);this._draw(this.reduced?pose(this.state,DESKTOP_PERFORMANCE_BY_ID[this.state].peakSeconds):this._pose);}
  setAttitudeEnabled(value){if(this.destroyed)return;this.attitudeEnabled=value===true;if(!this.attitudeEnabled&&DESKTOP_PERFORMANCE_BY_ID[this.state].requiresAttitude)this.setState('eye-roll',{immediate:true});}
  pause(){if(this.destroyed)return;this.paused=true;this._sync();}
  resume(){if(this.destroyed)return;this.paused=false;this._sync();}
  setExternalClock(value){if(this.destroyed)return;this.external=!!value;this._sync();}
  seek(seconds) {
    if(!Number.isFinite(seconds)||seconds<0||seconds>3600)throw new RangeError('Seek time must be finite and between 0 and 3600 seconds');
    if(this.destroyed)return;
    const revision=++this.revision,performance=DESKTOP_PERFORMANCE_BY_ID[this.state];
    this.tour=false;this.age=performance.loop?seconds:Math.min(seconds,performance.seconds);this.time=this.age;
    this.complete=!performance.loop&&this.age>=performance.seconds;this.nudgeAge=99;
    this.pointer={x:0,y:0,targetX:0,targetY:0};this._pose=pose(this.state,this.age);this.from={...this._pose};
    // Deterministic finite quadrature for an explicit offline seek. Live frames
    // retain the original incremental fan clock; seeking has no hidden history.
    const steps=Math.min(4096,Math.ceil(this.age*120));let angle=0;
    for(let i=0;i<steps;i++)angle+=pose(this.state,(i+.5)*this.age/steps).fanSpeed*this.age/steps;
    this.angle=angle;
    this._draw(this.reduced?pose(this.state,performance.peakSeconds):this._pose);
    if(!this.destroyed&&this.revision===revision)this._sync();
  }
  advance(seconds) {
    if(!Number.isFinite(seconds)||seconds<0)throw new RangeError("Delta must be finite and nonnegative");
    if(this.destroyed||this.reduced||this.paused||this.complete||document.hidden||!this.visible)return;
    let revision=this.revision;
    const performance=DESKTOP_PERFORMANCE_BY_ID[this.state],dt=clamp(seconds,0,.1);
    if(!dt)return;
    this.time+=dt;this.age=performance.loop?this.age+dt:Math.min(performance.seconds,this.age+dt);this.nudgeAge+=dt;
    if(this.tour){
      this.tourTime+=dt;let edge=0,index=SHOTS.length-1;
      for(let i=0;i<SHOTS.length;i++){edge+=SHOTS[i].duration;if(this.tourTime<edge){index=i;break;}}
      if(index!==this.shot){this.shot=index;const expected=revision+1;this.setState(SHOTS[index].state,{keepTour:true});if(this.destroyed||this.revision!==expected)return;revision=this.revision;}
      const total=SHOTS.reduce((sum,x)=>sum+x.duration,0);
      this.options.onProgress?.(clamp(this.tourTime/total),true);
      if(this.destroyed||this.revision!==revision)return;
      if(this.tourTime>=total){this.tour=false;this.options.onProgress?.(1,false);this._sync();}
      if(this.destroyed||this.revision!==revision)return;
    }
    const target=pose(this.state,this.age),k=smooth(this.age/this.transition),p={};
    for(const key of Object.keys(target))p[key]=key==='handL'||key==='handR'?target[key]:mix(this.from[key]??0,target[key],k);
    // The falling fan obeys a visible bounce, while the rigid housing stays intact.
    if(this.state==='defeated'&&this.age<this.transition){
      p.fanY=mix(this.from.fanY,target.fanY,bounce(this.age/this.transition));
      p.fanR=mix(this.from.fanR,target.fanR,ease(this.age/this.transition));
    }
    if(this.state==='revived'){
      p.bodyY-=16*pulse(this.age,.8,.3);p.headR-=3.5*pulse(this.age,1,.35);
      p.dustKick+=pulse(this.age,.9,.45);
    }
    this.angle+=(p.fanSpeed*dt);this._pose=p;
    const following=1-Math.exp(-dt*5);
    this.pointer.x=mix(this.pointer.x,this.pointer.targetX,following);
    this.pointer.y=mix(this.pointer.y,this.pointer.targetY,following);
    const finishing=!DESKTOP_PERFORMANCE_BY_ID[this.state].loop&&this.age>=DESKTOP_PERFORMANCE_BY_ID[this.state].seconds;
    if(finishing)this.complete=true;
    this._draw(p);
    if(this.destroyed||this.revision!==revision)return;
    const current=DESKTOP_PERFORMANCE_BY_ID[this.state];
    if(finishing&&!current.loop){
      cancelAnimationFrame(this.raf);this.raf=0;this.last=0;
      this.options.onComplete?.(this.state);
      if(this.destroyed||this.revision!==revision)return;
      if(this.options.returnToIdle){this.setState('idle');return;}
      this._sync();
    }
  }
  _draw(input) {
    if(this.destroyed)return;
    const p={...input};const t=this.reduced?DESKTOP_PERFORMANCE_BY_ID[this.state].peakSeconds:this.time;const q=this.intensity;
    // Nudge is a damped reaction, never an accumulated transform.
    const n=!this.reduced&&this.nudgeAge<2?Math.sin(this.nudgeAge*14)*Math.exp(-this.nudgeAge*2.5):0;
    p.headR+=n*6*q;p.noteR-=n*6*q;p.fanR+=n*5*q;
    const bx=p.bodyX*q,by=p.bodyY*q,br=p.bodyR*q;
    const pointerX=this.reduced?0:this.pointer.x,pointerY=this.reduced?0:this.pointer.y;
    const hx=p.headX,hy=p.headY,hr=p.headR*q+pointerX*1.6*q;
    this._set('body-motion','transform',move(bx,by,br,530,1070));
    this._set('monitor','transform',move(hx,hy,hr,521,592));
    this._set('sticky-note','transform',`rotate(${f(p.noteR*q)} 804 439)`);
    this._set('fan','transform',move(p.fanX,p.fanY,p.fanR));
    this._set('rotor-motion','transform',`rotate(${f(this.reduced?0:this.angle%360)})`);
    // Fan wires remain attached to the tower and the moving housing.
    const wireEnd=transformPoint(-43*.86,-75*1.04,p.fanX,p.fanY,p.fanR,0,0);
    const wd=`M692 635 C${f(698+Math.sin(t*1.6)*8*q)} 697 ${f(wireEnd[0]-18)} ${f(wireEnd[1]-37)} ${f(wireEnd[0])} ${f(wireEnd[1])}`;
    this._set('fan-wiring','transform','translate(0 0)');this._set('fan-wiring','opacity',f(p.fanWire));
    this._set('fan-lead','d',wd);this._set('fan-lead-highlight','d',wd);
    this._set('fan-lead-return','d',`M700 634 C702 682 ${f(wireEnd[0]+12)} ${f(wireEnd[1]-30)} ${f(wireEnd[0]+8)} ${f(wireEnd[1])}`);
    const gx=(p.gazeX+pointerX*15)*q,gy=(p.gazeY+pointerY*9)*q;
    for(const [side,cx,cy,opening] of [['left',350,337,p.eyeOpenL],['right',536,332,p.eyeOpenR]]){
      this._set('eye-'+side+'-motion','transform',`translate(${f(gx)} ${f(gy)}) translate(${cx} ${cy}) scale(1 ${f(Math.max(.045,opening))}) translate(${-cx} ${-cy})`);
      this._set('eye-'+side,'opacity',f(p.eyeOpacity));
      const color=this._color([201,112,56],[41,38,31],p.heat);
      this._set('eye-'+side,'fill',color);this._set('brow-'+side,'stroke',color);
      this._set('brow-'+side,'opacity',f(p.eyeOpacity));
    }
    this._set('brow-left-motion','transform',move(gx*.5,p.browY+gy*.45,p.browL,350,264));
    this._set('brow-right-motion','transform',move(gx*.5,p.browY+gy*.45,p.browR,540,260));
    const h=p.browHappy;
    this._set('brow-left','d',`M${f(mix(309,308,h))} ${f(mix(274,263,h))} C${f(mix(341,333,h))} ${f(mix(273,251,h))} ${f(mix(368,364,h))} ${f(mix(264,249,h))} ${f(mix(389,388,h))} ${f(mix(252,256,h))}`);
    this._set('brow-right','d',`M${f(mix(506,505,h))} ${f(mix(248,251,h))} C${f(mix(534,531,h))} ${f(mix(259,244,h))} ${f(mix(559,564,h))} ${f(mix(265,249,h))} ${f(mix(590,587,h))} ${f(mix(265,261,h))}`);
    this._set('screen-fill','fill',this._color([41,38,31],[201,112,56],p.heat));
    this._set('screen-cursor','opacity',f(p.cursor*(this.reduced?1:(this.age%1.3<.72?1:0))));
    this._set('magnifying-glass','opacity',f(p.glass));this._set('search-arm','opacity',f(p.glass));
    const glassX=p.glassX,glassY=p.glassY+(1-p.glass)*70,glassR=p.glassR;
    this._set('magnifying-glass','transform',move(glassX,glassY,glassR,537,330));
    const lensEnd=transformPoint(641,415,glassX,glassY,glassR,537,330);
    const gripPath=`M735 516 C704 506 ${f(lensEnd[0]+55)} ${f(lensEnd[1]+34)} ${f(lensEnd[0])} ${f(lensEnd[1])}`;
    this._set('search-grip','d',gripPath);this._set('search-grip-highlight','d',gripPath);
    this._set('connector','transform',move(0,p.plugY*q,p.plugR*q,1142,1043));
    this._drawCable(p,{bx,by,br,hx,hy,hr},t,q);
    // Steam uses three offset paths, not blur or an expensive particle system.
    this._set('steam','opacity',f(p.steam*.65));
    const wispIds=['steam-wisp-left','steam-wisp-center','steam-wisp-right'];
    wispIds.forEach((id,i)=>{
      const life=this.reduced?.3:((t*.45+i*.34)%1);
      const alpha=this.reduced?.7:Math.sin(Math.PI*life);
      this._set(id,'opacity',f(alpha));
      this._set(id,'transform',move(Math.sin(t*2+i)*13*q,-life*165*q,Math.sin(t*1.7+i)*4*q,925,630));
    });
    for(const id of ['grime','note-grime','monitor-grime','casing-scuffs'])this._set(id,'opacity',f(p.dirt));
    this._set('airborne-dust','transform',move(9*Math.sin(t)*q,-16*(1+Math.sin(t*.7))*q));
    this._set('dust-drift','opacity',f(Math.max(p.dirt*.6,p.dustKick)));
    for(let i=1;i<=8;i++){
      const drift=this.reduced?0:((t*.14+i*.137)%1);
      this._set('dust-drift-'+i,'transform',move(Math.sin(t*.8+i)*17*q+p.dustKick*(i%2?35:-25),-drift*65*q-p.dustKick*48));
      this._set('dust-drift-'+i,'opacity',f((.2+.28*Math.sin(Math.PI*drift))));
    }
    this._set('ground-dust','transform',move(0,-p.dustKick*12*q));
    for(const [id,attribute,value] of gestureAttributes(p))this._set(id,attribute,value);
    this._renderedPose={...p};this.options.onFrame?.(this.getSnapshot());
  }
  _drawCable(p,a,t,q) {
    const out=this.pathBuffer,one=this.cables.idle,two=this.cables.revived;
    const end=transformPoint(1142,1043,0,p.plugY*q,p.plugR*q,1142,1043);
    for(let i=0;i<158;i+=2){
      let x=mix(one[i],two[i],p.cableCoil),y=mix(one[i+1],two[i+1],p.cableCoil);
      // All upper passes follow the head; middle passes follow the tower.
      const headWeight=1-smooth((y-545)/230),bodyWeight=1-smooth((y-625)/390);
      const hp=transformPoint(x,y,a.hx,a.hy,a.hr,521,592);
      x=mix(x,hp[0],headWeight);y=mix(y,hp[1],headWeight);
      const bp=transformPoint(x,y,a.bx,a.by,a.br,530,1070);
      x=mix(x,bp[0],bodyWeight);y=mix(y,bp[1],bodyWeight);
      const edge=Math.sin(Math.PI*(i/156));
      const amp=p.cableAmp*q*edge;
      x+=Math.sin(t*2.4-i*.15)*amp;y+=Math.cos(t*2.2-i*.125)*amp*.7;
      // Three final control/anchor pairs converge exactly on the moving connector.
      const tail=smooth((i-144)/12);x+=(end[0]-1142)*tail;y+=(end[1]-1043)*tail;
      out[i]=x;out[i+1]=y;
    }
    let d=`M${f(out[0])} ${f(out[1])}`;
    for(let i=2;i<158;i+=6)d+=` C${f(out[i])} ${f(out[i+1])} ${f(out[i+2])} ${f(out[i+3])} ${f(out[i+4])} ${f(out[i+5])}`;
    this._set('cable-path','d',d);
  }
  _color(a,b,k){return '#'+a.map((v,i)=>Math.round(mix(v,b[i],clamp(k))).toString(16).padStart(2,'0')).join('');}
  getSnapshot(){const performance=DESKTOP_PERFORMANCE_BY_ID[this.state];return {state:this.state,requestedState:this.requestedState,time:this.time,age:this.age,duration:performance.seconds,progress:Math.min(1,this.age/performance.seconds),loop:performance.loop,paused:this.paused,reduced:this.reduced,visible:this.visible,tour:this.tour,complete:this.complete,fanAngle:this.angle,pose:{...(this._renderedPose||this._pose)}};}
  snapshot(){return this.getSnapshot();}
  destroy(){if(this.destroyed)return;this.destroyed=true;cancelAnimationFrame(this.raf);this.io?.disconnect();this.media.removeEventListener('change',this._media);document.removeEventListener('visibilitychange',this._visibility);this.hit?.removeEventListener('pointermove',this._pointerMove);this.hit?.removeEventListener('pointerleave',this._pointerLeave);for(const {node,attribute,value} of this.originalAttributes.values()){if(value===null)node.removeAttribute(attribute);else node.setAttribute(attribute,value);}this.originalAttributes.clear();this.cache.clear();this.raf=0;}
}

export { STATES as COMPUTER_MOTION_STATES, SHOTS as COMPUTER_MOTION_SHOTS };
