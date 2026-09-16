import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {DOMParser,XMLSerializer} from '@xmldom/xmldom';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {
  DESKTOP_HANDS,GESTURE_ANCHORS,GESTURE_WRISTS,GESTURE_BASELINE,GESTURE_CENSOR,
  DEFAULT_GESTURE_PALETTE,gestureAttributes,gestureCable,createGestureGeometry,
  serializeGestureGeometry,
} from '../../apps/web/src/animation/desktop/gesture-geometry.mjs';

const root=fileURLToPath(new URL('../../',import.meta.url));
const source=readFileSync(new URL('../../apps/web/src/animation/desktop/ComputerGeometry.tsx',import.meta.url),'utf8');
const elements=doc=>[...Array.from(doc.getElementsByTagName('*'))];
const nodes=tree=>[tree,...tree.children.flatMap(nodes)];
const parse=svg=>new DOMParser().parseFromString(svg,'image/svg+xml');
const byId=doc=>new Map(elements(doc).map(n=>[n.getAttribute('data-rig-id'),n]));

// Bundle just these two React geometry components in memory. No browser or app
// host is involved; this is the actual component's server-rendered output.
const bundle=await build({absWorkingDir:root,entryPoints:['apps/web/src/animation/desktop/ComputerGeometry.tsx'],bundle:true,write:false,format:'cjs',platform:'node',packages:'external',jsx:'automatic',logLevel:'silent'});
const exports={};const module={exports};
new Function('require','module','exports',bundle.outputFiles[0].text)(createRequire(import.meta.url),module,exports);
const art=renderToStaticMarkup(createElement(module.exports.ComputerGeometry,{idPrefix:'proof',palette:DEFAULT_GESTURE_PALETTE,artRef:null}));

test('all original desktop geometry bytes are preserved; only additive imports and components differ',()=>{
  const original=source.replace("import { DesktopGestures } from './DesktopGestures';\n",'').replace(/^\s*<DesktopGestures [^\n]+\/>(?:\r?\n)/gm,'');
  // 2026-09-13: the procedural cable path's separators are spaces instead of a literal backslash-n
  // inside the JSX string (Chromium/WebKit refused to parse that path). Geometry unchanged; bytes are.
  assert.equal(createHash('sha256').update(original).digest('hex'),'0051046ce962f6cbb31ab8b24d4f4381869272f5582cac2e1cc5ba620a518c8c');
  assert.equal((source.match(/<DesktopGestures /g)||[]).length,2);
});

test('SSR mounts cable arms on the body and mouth on the monitor, with hidden original-state baseline',()=>{
  const map=byId(parse(art));
  for(const [id,parent] of [['desktop-gestures','body-motion'],['gesture-face','monitor']]){
    assert.equal(map.get(id).parentNode.getAttribute('data-rig-id'),parent);
    assert.equal(map.get(id).getAttribute('opacity'),'0');
  }
  assert(Object.values(GESTURE_BASELINE).every(value=>value===0));
  for(const [id,attr,value] of gestureAttributes())if(id==='desktop-gestures'||id==='gesture-face')assert.equal(value,0);
});

test('React and DOM-free serializers share every geometry attribute and child ordering',()=>{
  const reactMap=byId(parse(art));
  for(const layer of ['arms','face']){
    const tree=createGestureGeometry(DEFAULT_GESTURE_PALETTE,layer);
    const dom=parse(`<svg xmlns="http://www.w3.org/2000/svg">${serializeGestureGeometry(DEFAULT_GESTURE_PALETTE,{},layer,'proof')}</svg>`);
    const serializedMap=byId(dom);
    for(const node of nodes(tree)){
      const react=reactMap.get(node.id),svg=serializedMap.get(node.id);
      assert(react&&svg,node.id);
      assert.equal(react.tagName,svg.tagName);
      // Dynamic attributes are set by the shared sampler. Compare the paths,
      // colors, strokes and transform baselines that define the actual artwork.
      for(const attr of ['d','fill','stroke','stroke-width','stroke-linecap','stroke-linejoin','x','y','cx','cy','rx','ry','width','height']){
        if(node.id==='gesture-mouth-smile'&&attr==='d')continue;
        assert.equal(react.getAttribute(attr),svg.getAttribute(attr),`${node.id}:${attr}`);
      }
      assert.deepEqual(Array.from(react.childNodes).filter(n=>n.nodeType===1).map(n=>n.getAttribute('data-rig-id')),node.children.map(n=>n.id));
    }
  }
});

test('rig IDs are unique and every animated attribute refers to a real additive node',()=>{
  const tree=[...nodes(createGestureGeometry()),...nodes(createGestureGeometry(undefined,'face'))];
  const ids=tree.map(n=>n.id);
  assert.equal(new Set(ids).size,ids.length);
  const all=elements(parse(art)).map(n=>n.getAttribute('id')).filter(Boolean);
  assert.equal(new Set(all).size,all.length);
  for(const [id] of gestureAttributes({gestureOpacity:1,handL:5,handR:5}))assert(ids.includes(id),id);
});

test('flexible cable endpoints stay attached to sockets and wrist transforms across bends and rotations',()=>{
  for(const side of ['left','right'])for(const rotation of [-180,-90,-23,0,35,90,180])for(const bend of [-60,0,90]){
    const key=side==='left'?'L':'R',p={[`arm${key}X`]:-35,[`arm${key}Y`]:-275,[`arm${key}R`]:rotation,[`arm${key}Bend`]:bend};
    const values=gestureCable(side,p).match(/-?\d+(?:\.\d+)?/g).map(Number),a=GESTURE_ANCHORS[side],w=GESTURE_WRISTS[side];
    assert.deepEqual(values.slice(0,2),[a.x,a.y]);
    assert.deepEqual(values.slice(-2),[w.x-35,w.y-275]);
    const transform=gestureAttributes(p).find(([id,attr])=>id===`gesture-hand-${side}`&&attr==='transform')[2];
    assert.match(transform,new RegExp(`^translate\\(${w.x-35} ${w.y-275}\\)`));
    assert(values.every(Number.isFinite));
  }
});

test('six distinct hands have an exact one-hot selection and explicit visible thumbs',()=>{
  for(let index=0;index<DESKTOP_HANDS.length;index++){
    const attrs=gestureAttributes({gestureOpacity:1,handL:index,handR:index});
    for(const side of ['left','right']){
      const opacities=DESKTOP_HANDS.map(hand=>attrs.find(([id,attr])=>id===`gesture-hand-${side}-${hand}`&&attr==='opacity')[2]);
      assert.equal(opacities.reduce((a,b)=>a+b),1);assert.equal(opacities[index],1);
    }
  }
  const tree=nodes(createGestureGeometry());
  const outlines=DESKTOP_HANDS.map(kind=>tree.find(n=>n.id===`gesture-left-${kind}-outline`).attrs.d);
  assert.equal(new Set(outlines).size,6);
  for(const kind of ['fist','point','shush','middle'])assert(tree.some(n=>n.id===`gesture-left-${kind}-thumb`));
  assert(tree.some(n=>n.id==='gesture-left-open-thumb-crease'));
  assert(tree.some(n=>n.id==='gesture-left-thumbsup-thumb-web'));
});

test('rude variants permanently contain opaque censor backing and pixels beyond finger bounds',()=>{
  // A translucent custom palette cannot make the censor backing transparent.
  const tree=nodes(createGestureGeometry({paper:'transparent',ink:'transparent',rust:'transparent'}));
  for(const side of ['left','right']){
    const hand=tree.find(n=>n.id===`gesture-hand-${side}-middle`),censor=hand.children.at(-1);
    assert.equal(censor.attrs['data-censor'],'always');assert.equal(censor.attrs.opacity,1);
    const backing=censor.children[0];assert.equal(backing.attrs.fill,'#29261F');assert.equal(backing.attrs.opacity,1);
    assert.equal(censor.children.length,33);assert(censor.children.every(n=>n.attrs.opacity===1));
    assert.equal(backing.attrs.x,GESTURE_CENSOR.x);
    // Exposed source finger [-8..12,59..117] plus half of its2.6px stroke.
    assert(backing.attrs.x<=-9.3&&backing.attrs.x+backing.attrs.width>=13.3);
    assert(backing.attrs.y<=57.7&&backing.attrs.y+backing.attrs.height>=118.3);
  }
  assert(!gestureAttributes({handL:5,handR:5,censor:0}).some(([id])=>id.includes('censor')));
});

test('signed smile bends the mouth and invalid numeric poses fail before SVG serialization',()=>{
  const smiling=gestureAttributes({mouthSmile:1}),frowning=gestureAttributes({mouthSmile:-1});
  const d=attrs=>attrs.find(([id,a])=>id==='gesture-mouth-smile'&&a==='d')[2];
  assert.notEqual(d(smiling),d(frowning));
  for(const attrs of [smiling,frowning])assert.equal(attrs.find(([id,a])=>id==='gesture-mouth-smile'&&a==='opacity')[2],1);
  for(const key of Object.keys(GESTURE_BASELINE))for(const value of [NaN,Infinity,-Infinity,'1',null])assert.throws(()=>gestureAttributes({[key]:value}),TypeError);
});

test('hidden additive groups leave every original rendered pixel unchanged at home character scale',async()=>{
  const original=parse(art),map=byId(original);
  for(const id of ['desktop-gestures','gesture-face'])map.get(id).parentNode.removeChild(map.get(id));
  const serial=new XMLSerializer();
  const render=async svg=>{const canvas=createCanvas(300,300),ctx=canvas.getContext('2d');ctx.drawImage(await loadImage(Buffer.from(svg)),0,0,300,300);return Buffer.from(ctx.getImageData(0,0,300,300).data);};
  assert.deepEqual(await render(art),await render(serial.serializeToString(original)));
});
