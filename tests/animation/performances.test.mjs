import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {ALL_ACTIONS,NEW_ACTIONS,LEGACY_ACTIONS,PERFORMANCES,PERFORMANCE_GROUPS,CHARACTER_PERFORMANCES,RESET_ADDITIONS,SOURCE_FINGERPRINTS} from '../../apps/web/src/animation/performances/catalog.mjs';
import {sampleClip} from '../../apps/web/src/animation/mobile/character-controller.mjs';
import {validateCharacter} from '../../apps/web/src/animation/core/contracts.mjs';
const read=path=>readFileSync(new URL('../../'+path,import.meta.url));
const json=path=>JSON.parse(read(path));
const hash=value=>createHash('sha256').update(value).digest('hex');
const resetKeys=new Set(RESET_ADDITIONS.map(([target,property])=>target+':'+property));
const flatten=pose=>Object.entries(pose).flatMap(([target,values])=>Object.entries(values).map(([property,value])=>[target+':'+property,value]));
test('catalog exposes exactly eighteen distinct new actions and four complete groups',()=>{
 assert.equal(ALL_ACTIONS.length,32);assert.equal(NEW_ACTIONS.length,18);assert.equal(new Set(ALL_ACTIONS).size,32);
 assert.deepEqual(PERFORMANCE_GROUPS.flatMap(group=>group.actions).sort(),[...ALL_ACTIONS].sort());
 for(const action of ALL_ACTIONS){assert.equal(PERFORMANCES[action].name,action);assert(PERFORMANCES[action].seconds>0&&PERFORMANCES[action].seconds<10);assert(PERFORMANCES[action].description.length>20);}
});
for(const slug of Object.keys(CHARACTER_PERFORMANCES)){
 const prefix=`apps/web/public/animation/mobile/${slug}`,model=json(`${prefix}/scene.json`),motion=json(`${prefix}/motion.json`);
 test(`${slug}: vectors and all original existing tracks preserved`,()=>{
  assert.equal(hash(read(`${prefix}/scene.json`)),SOURCE_FINGERPRINTS[slug].sceneSHA256);
  for(const name of LEGACY_ACTIONS){const clip=motion.find(c=>c.name===name),original={...clip,tracks:clip.tracks.filter(track=>!resetKeys.has(track.target+':'+track.property))};assert.equal(hash(JSON.stringify(original)),SOURCE_FINGERPRINTS[slug].legacyClips[name]);for(const track of clip.tracks.filter(track=>resetKeys.has(track.target+':'+track.property)))assert.equal(new Set(track.keys.map(k=>k[1])).size,1);}
 });
 test(`${slug}: all32 satisfy format, full reset set, and transfer budget`,()=>{
  validateCharacter(model,motion);assert.deepEqual(motion.map(c=>c.name),ALL_ACTIONS);assert(read(`${prefix}/motion.json`).byteLength<2_000_000);
  const expected=motion[0].tracks.map(t=>t.target+':'+t.property).sort();
  for(const clip of motion){assert.deepEqual(clip.tracks.map(t=>t.target+':'+t.property).sort(),expected);for(const track of clip.tracks){assert.equal(track.keys[0][0],0);assert.equal(track.keys.at(-1)[0],clip.duration);}}
 });
 test(`${slug}: new performances are distinct whole-body acting, not aliases`,()=>{
  const fingerprints=new Set();
  for(const name of NEW_ACTIONS){const clip=motion.find(c=>c.name===name);fingerprints.add(hash(JSON.stringify(clip.tracks)));const active=new Set(clip.tracks.filter(t=>new Set(t.keys.map(k=>k[1])).size>1).map(t=>t.target));assert(active.has('body-bob'));assert([...active].some(t=>t.startsWith('eye-')||t.startsWith('brow-')));assert([...active].some(t=>t.startsWith('upper-arm-')));assert(active.has('cable-trail'));}
  assert.equal(fingerprints.size,18);
 });
 test(`${slug}: all new timeline samples are finite with continuous body translation`,()=>{
  for(const name of NEW_ACTIONS){const clip=motion.find(c=>c.name===name);let previous=null;for(let frame=0;frame<=clip.duration;frame++){const pose=sampleClip(clip,frame/60);for(const [key,value]of flatten(pose)){assert(Number.isFinite(value));if(key.endsWith(':opacity'))assert(value>=0&&value<=1,key);}assert(Math.abs(pose['body-bob'].x)<20);assert(pose['body-bob'].y>-75&&pose['body-bob'].y<35);for(const side of ['left','right'])assert(pose[`eye-${side}`].scaleY>.01);if(previous){assert(Math.abs(pose['body-bob'].x-previous.x)<6);assert(Math.abs(pose['body-bob'].y-previous.y)<14);}previous=pose['body-bob'];}}
 });
 test(`${slug}: sleeping exit and wake-up entry join without a pose jump`,()=>{
  const sleep=motion.find(c=>c.name==='Sleepy'),wake=motion.find(c=>c.name==='WakeUp');const end=flatten(sampleClip(sleep,sleep.seconds)),start=Object.fromEntries(flatten(sampleClip(wake,0)));for(const[key,value]of end)assert(Math.abs(value-start[key])<.00001,key);
 });
 test(`${slug}: directional run loops close and retain travel magnitude`,()=>{
  for(const name of ['RunRight','RunLeft']){const clip=motion.find(c=>c.name===name);assert(clip.loop);assert.equal(clip.travelPerCycle,148);for(const track of clip.tracks)assert(Math.abs(track.keys[0][1]-track.keys.at(-1)[1])<.00001,track.target+':'+track.property);}
 });
 test(`${slug}: variant switches cannot create ghost hands or eyes`,()=>{
  for(const name of NEW_ACTIONS){const clip=motion.find(c=>c.name===name);for(let frame=0;frame<=clip.duration;frame++){const pose=sampleClip(clip,frame/60);for(const side of ['left','right']){assert.equal(['grip','fist','open','point','middle-finger'].reduce((sum,mode)=>sum+pose[`hand-${side}-${mode}`].opacity,0),1);assert.equal(['neutral','happy','sad','angry'].reduce((sum,mode)=>sum+pose[`eye-${side}-${mode}`].opacity,0),1);assert.equal(pose[`hand-${side}-middle-finger`].opacity,0);}}}
 });
}
test('personalities have distinct timing and staging for the same named new action',()=>{
 for(const action of NEW_ACTIONS){const poses=new Set();for(const slug of Object.keys(CHARACTER_PERFORMANCES)){const clip=json(`apps/web/public/animation/mobile/${slug}/motion.json`).find(c=>c.name===action);poses.add(hash(JSON.stringify(sampleClip(clip,clip.seconds*.37))));}assert.equal(poses.size,5,action);}
});
