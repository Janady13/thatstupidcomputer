/**
 * Additive desktop rig, in the original 1254 × 1254 coordinate system.
 * No browser, React, filesystem, or runtime dependency: React and proof SVGs
 * consume this same tree. Arm roots follow body-motion; face follows monitor.
 *
 * Provenance: open/fist/point/middle silhouettes and palm creases are adapted
 * from the supplied smartphone scene.json hand-left groups. Desktop arms,
 * cuff detail, thumbs-up, shush, and mouth are new pen-line additions. The
 * original computer paths are not edited. Only the hand shapes are reflected;
 * the case, screen, sticky note and lettering are never mirrored.
 */
export const DESKTOP_HANDS = Object.freeze(['open', 'fist', 'point', 'thumbsup', 'shush', 'middle']);
export const GESTURE_ANCHORS = Object.freeze({left:Object.freeze({x:221,y:705}),right:Object.freeze({x:832,y:697})});
export const GESTURE_WRISTS = Object.freeze({left:Object.freeze({x:173,y:819}),right:Object.freeze({x:908,y:807})});
export const GESTURE_BASELINE = Object.freeze({
  gestureOpacity:0,armLX:0,armLY:0,armLBend:0,armLR:0,
  armRX:0,armRY:0,armRBend:0,armRR:0,handL:0,handR:0,
  mouthSmile:0,mouthOpen:0,tongue:0,
});
export const GESTURE_HAND_SCALE = 1.5;
export const GESTURE_CENSOR = Object.freeze({x:-16,y:56,width:40,height:74,fill:'#29261F'});
export const DEFAULT_GESTURE_PALETTE = Object.freeze({paper:'#F4E5C4',ink:'#29261F',rust:'#C97038'});

const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const f=v=>String(Math.round(v*1000)/1000);
const n=(tag,id,attrs={},children=[])=>({tag,id,attrs,children});
const group=(id,attrs,children)=>n('g',id,attrs,children);

/** A fresh finite pose; unknown fields (the rest of the desktop pose) are ignored. */
function gesturePose(partial={}) {
  const result={...GESTURE_BASELINE};
  for(const key of Object.keys(result)) {
    if(partial[key]!==undefined) {
      if(!Number.isFinite(partial[key]))throw new TypeError(`Gesture ${key} must be a finite number`);
      result[key]=partial[key];
    }
  }
  return result;
}

/** Exact connected cable path, with hand-entry tangent derived from wrist angle. */
export function gestureCable(side,partial={}) {
  if(side!=='left'&&side!=='right')throw new RangeError('Unknown gesture side');
  const p=gesturePose(partial),key=side==='left'?'L':'R',sign=side==='left'?-1:1;
  const a=GESTURE_ANCHORS[side],w=GESTURE_WRISTS[side];
  const x=w.x+p[`arm${key}X`],y=w.y+p[`arm${key}Y`];
  const bend=p[`arm${key}Bend`],r=p[`arm${key}R`]*Math.PI/180;
  // Both control points have meaning: shoulder exit and the cuff's local down
  // direction. Endpoints never depend on bend, so a flourish cannot detach them.
  const c1x=a.x+sign*(86+bend),c1y=a.y+75+bend*.3;
  const c2x=x-Math.sin(r)*76,c2y=y+Math.cos(r)*76;
  return `M${a.x} ${a.y} C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(x)} ${f(y)}`;
}

/** Attribute tuples accepted directly by ComputerMotion._set. */
export function gestureAttributes(partial={}) {
  const p=gesturePose(partial),out=[['desktop-gestures','opacity',clamp(p.gestureOpacity,0,1)]];
  for(const side of ['left','right']) {
    const key=side==='left'?'L':'R',w=GESTURE_WRISTS[side],d=gestureCable(side,p);
    out.push([`gesture-arm-${side}`,'d',d],[`gesture-arm-${side}-highlight`,'d',d]);
    out.push([`gesture-hand-${side}`,'transform',`translate(${f(w.x+p[`arm${key}X`])} ${f(w.y+p[`arm${key}Y`])}) rotate(${f(p[`arm${key}R`])})`]);
    const index=clamp(Math.round(p[`hand${key}`]),0,DESKTOP_HANDS.length-1);
    for(let i=0;i<DESKTOP_HANDS.length;i++)out.push([`gesture-hand-${side}-${DESKTOP_HANDS[i]}`,'opacity',i===index?1:0]);
  }
  const smile=clamp(p.mouthSmile,-1,1),open=clamp(p.mouthOpen,0,1),tongue=clamp(p.tongue,0,1);
  out.push(['gesture-face','opacity',Math.max(Math.abs(smile),open,tongue)]);
  out.push(['gesture-mouth-smile','opacity',Math.abs(smile)],['gesture-mouth-open','opacity',open],['gesture-tongue','opacity',tongue]);
  out.push(['gesture-mouth-smile','d',`M392 405 Q446 ${f(405+36*smile)} 498 402`]);
  out.push(['gesture-mouth-open','transform',`translate(445 415) scale(1 ${f(.35+.65*open)}) translate(-445 -415)`]);
  return out;
}

function handShapes(side,kind,palette) {
  const {paper,ink}=palette,id=`gesture-${side}-${kind}`;
  const path=(name,d,fill=paper,width=2.2)=>n('path',`${id}-${name}`,{d,fill,stroke:ink,strokeWidth:width,strokeLinecap:'round',strokeLinejoin:'round'});
  const line=(name,d,width=1.1)=>path(name,d,'none',width);
  const thumb=()=>path('thumb','M-20 20 C-35 15 -42 23 -35 34 Q-31 43 -23 43 L-12 32',paper,1.7);
  if(kind==='open')return [
    path('outline','M-18 10 L18 10 Q25 16 26 34 L33 58 Q35 70 29 72 Q23 74 18 61 L15 51 L20 81 Q20 90 14 91 Q8 91 7 82 L3 57 L4 91 Q4 99 -3 99 Q-10 98 -10 90 L-11 56 L-15 84 Q-17 93 -24 91 Q-30 89 -26 78 L-23 43 L-31 51 Q-42 58 -47 51 Q-51 43 -39 37 L-28 21 Q-26 14 -18 10 Z'),
    line('palm','M-24 39 Q-11 33 3 40 M-16 50 Q-4 44 9 48'),
    line('thumb-crease','M-29 24 Q-20 29 -23 40',.9),
  ];
  if(kind==='fist')return [
    path('outline','M-20 10 C-30 18 -30 43 -22 50 C-12 61 17 60 27 48 Q35 29 21 12 Z',paper,2.3),
    path('thumb','M-17 18 C-32 16 -34 31 -23 38 Q-14 41 -8 32 L1 26',paper,1.7),
    line('folds','M-3 20 Q3 31 -1 43 M6 20 Q11 31 8 43 M15 20 Q19 31 17 43'),
  ];
  if(kind==='point')return [
    path('outline','M-18 10 L18 10 Q30 17 29 37 Q31 47 23 50 L16 49 L18 94 Q17 105 9 105 Q1 103 2 95 L0 57 L-16 57 Q-31 51 -30 33 Q-33 20 -18 10 Z',paper,2.3),
    thumb(),line('folds','M-16 41 Q-6 39 1 46 M6 75 L14 75 M6 92 L14 92'),
  ];
  if(kind==='thumbsup')return [
    path('outline','M-18 10 L18 10 Q28 15 28 28 L26 52 Q23 60 14 60 L-5 59 L-8 94 Q-9 104 -17 103 Q-25 102 -25 93 L-24 46 Q-36 40 -35 29 Q-33 16 -18 10 Z',paper,2.3),
    line('thumb-web','M-5 59 Q-6 42 -22 34',1.5),
    line('curled-fingers','M-3 22 Q9 17 20 25 M-3 33 Q9 29 21 35 M-1 44 Q11 40 21 47'),
    line('thumb-knuckle','M-21 80 L-12 80',.95),
  ];
  if(kind==='shush')return [
    path('outline','M-18 10 L19 10 Q28 14 27 29 L23 47 Q20 54 13 54 L8 50 L9 101 Q8 111 1 111 Q-6 110 -6 101 L-8 49 L-17 52 Q-29 48 -31 36 Q-34 21 -18 10 Z',paper,2.3),
    thumb(),line('folds','M-18 42 Q-7 35 1 42 M13 27 Q21 29 23 36 M-2 75 L6 75'),
  ];
  // The censor is intrinsic to this variant, last in paint order. There is no
  // API for hiding it. The opaque backing has a margin beyond finger + stroke.
  const censor=[n('rect',`${id}-censor-backing`,{...GESTURE_CENSOR,opacity:1})];
  for(let row=0;row<8;row++)for(let col=0;col<4;col++) {
    const light=(row*7+col*11+row*col)%5<2;
    censor.push(n('rect',`${id}-censor-pixel-${row}-${col}`,{x:-16+col*10,y:56+row*9,width:10,height:9,fill:light?'#F4E5C4':'#29261F',opacity:1}));
  }
  return [
    path('outline','M-18 10 L18 10 Q30 16 31 31 L31 44 Q33 55 24 59 Q19 62 13 59 L12 104 Q11 117 2 117 Q-7 116 -7 105 L-8 62 Q-15 65 -21 57 Q-34 57 -35 43 Q-44 33 -36 22 Q-31 15 -18 10 Z',paper,2.6),
    thumb(),line('folds','M-18 39 Q-10 37 -8 47 L-8 58 M13 39 Q24 38 26 47'),
    group(`${id}-censor`,{opacity:1,'data-censor':'always'},censor),
  ];
}

function makeArms(palette) {
  const {paper,ink}=palette,arms=[];
  for(const side of ['left','right']) {
    const a=GESTURE_ANCHORS[side],w=GESTURE_WRISTS[side],d=gestureCable(side);
    arms.push(group(`gesture-appendage-${side}`,{},[
      n('ellipse',`gesture-socket-${side}`,{cx:a.x,cy:a.y,rx:12,ry:16,fill:paper,stroke:ink,strokeWidth:2.7}),
      n('path',`gesture-arm-${side}`,{d,fill:'none',stroke:ink,strokeWidth:9,strokeLinecap:'round'}),
      n('path',`gesture-arm-${side}-highlight`,{d,fill:'none',stroke:paper,strokeWidth:1.7,strokeOpacity:.68,strokeLinecap:'round'}),
      n('ellipse',`gesture-socket-pin-${side}`,{cx:a.x,cy:a.y,rx:4,ry:7,fill:ink,stroke:'none'}),
      group(`gesture-hand-${side}`,{transform:`translate(${w.x} ${w.y}) rotate(0)`},[
        group(`gesture-hand-${side}-shape`,{transform:`scale(${side==='left'?GESTURE_HAND_SCALE:-GESTURE_HAND_SCALE} ${-GESTURE_HAND_SCALE})`},[
          ...DESKTOP_HANDS.map((kind,i)=>group(`gesture-hand-${side}-${kind}`,{opacity:i===0?1:0},handShapes(side,kind,palette))),
          n('path',`gesture-hand-${side}-cuff`,{d:'M-13 -5 L15 -5 Q21 -5 21 1 L21 9 Q21 15 15 15 L-13 15 Q-19 15 -19 9 L-19 1 Q-19 -5 -13 -5 Z',fill:paper,stroke:ink,strokeWidth:2}),
          n('path',`gesture-hand-${side}-cuff-fold`,{d:'M-13 2 Q2 8 15 2 M-12 10 L-7 11 M10 11 L15 10',fill:'none',stroke:ink,strokeWidth:1,strokeLinecap:'round'}),
        ]),
      ]),
    ]));
  }
  return group('desktop-gestures',{opacity:0,'aria-hidden':'true','pointer-events':'none'},arms);
}

function makeFace({ink,rust}) {
  return group('gesture-face',{opacity:0,'aria-hidden':'true','pointer-events':'none'},[
    n('path','gesture-mouth-smile',{d:'M392 405 Q446 441 498 402',fill:'none',stroke:rust,strokeWidth:5,strokeLinecap:'round',opacity:0}),
    group('gesture-mouth-open',{opacity:0},[
      n('path','gesture-mouth-open-outline',{d:'M409 397 Q445 387 481 397 Q486 401 482 416 Q477 440 448 442 Q418 442 409 421 Q403 403 409 397 Z',fill:rust,stroke:'none'}),
      n('path','gesture-mouth-open-inner',{d:'M419 403 Q445 398 474 403 Q473 425 449 431 Q425 430 419 403 Z',fill:ink,stroke:'none'}),
    ]),
    group('gesture-tongue',{opacity:0},[
      n('path','gesture-tongue-outline',{d:'M430 420 Q445 412 460 420 L463 451 Q463 467 449 470 Q433 473 429 457 Z',fill:rust,stroke:ink,strokeWidth:2.5,strokeLinejoin:'round'}),
      n('path','gesture-tongue-crease',{d:'M446 424 L447 448',fill:'none',stroke:ink,strokeWidth:2,strokeLinecap:'round'}),
    ]),
  ]);
}

/** Tree with camelCase SVG attributes, suitable for React.createElement. */
export function createGestureGeometry(palette=DEFAULT_GESTURE_PALETTE,layer='arms') {
  if(layer!=='arms'&&layer!=='face')throw new RangeError('Unknown gesture layer');
  return layer==='arms'?makeArms(palette):makeFace(palette);
}

const attrName=name=>name.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
/** An SVG fragment, not a new approximation. Optional pose uses the same attributes as the live controller. */
export function serializeGestureGeometry(palette=DEFAULT_GESTURE_PALETTE,partial={},layer='arms',idPrefix='desktop') {
  const changes=new Map();
  for(const [id,attr,value] of gestureAttributes(partial)) {
    if(!changes.has(id))changes.set(id,{});
    changes.get(id)[attr]=value;
  }
  const serialize=node=>{
    const attrs={id:`${idPrefix}--${node.id}`,'data-rig-id':node.id,...node.attrs,...changes.get(node.id)};
    const text=Object.entries(attrs).map(([key,value])=>`${attrName(key)}="${escape(value)}"`).join(' ');
    return `<${node.tag} ${text}>${node.children.map(serialize).join('')}</${node.tag}>`;
  };
  return serialize(createGestureGeometry(palette,layer));
}
