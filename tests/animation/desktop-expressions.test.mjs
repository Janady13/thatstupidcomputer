import test from 'node:test';
import assert from 'node:assert/strict';
import { COMPUTER_MOTION_STATES, sampleDesktopPose } from '../../apps/web/src/animation/desktop/computer-motion.mjs';
import { DESKTOP_STATES, validateCharacter } from '../../apps/web/src/animation/core/contracts.mjs';
import { readFileSync } from 'node:fs';

test('desktop legacy expressions retain twelve finite, distinct poses without changing shell scale',()=>{
  assert.deepEqual(COMPUTER_MOTION_STATES,DESKTOP_STATES);
  assert.equal(COMPUTER_MOTION_STATES.slice(0,12).length,12);
  const signatures=new Set();
  for(const state of COMPUTER_MOTION_STATES.slice(0,12)){
    signatures.add(JSON.stringify(sampleDesktopPose(state,1.25)));
    for(let frame=0;frame<720;frame++){
      const pose=sampleDesktopPose(state,frame/60);
      for(const value of Object.values(pose))assert(Number.isFinite(value));
      assert(pose.eyeOpenL>=0 && pose.eyeOpenR>=0);
      for(const key of ['heat','steam','eyeOpacity','browHappy','glass','dirt'])assert(pose[key]>=0 && pose[key]<=1,`${state}:${key}`);
      assert(Math.abs(pose.bodyR)<12 && Math.abs(pose.headR)<20);
      assert(!Object.keys(pose).some(key=>key.toLowerCase().includes('scale')));
    }
  }
  assert.equal(signatures.size,12);
});

test('desktop acting reads as asymmetry, eyelid weight, recoil and a timed chuckle',()=>{
  const skeptical=sampleDesktopPose('skeptical',1.2);
  assert(skeptical.eyeOpenL < skeptical.eyeOpenR*.6);
  assert(skeptical.browL>0 && skeptical.browR<0 && skeptical.gazeX<-10);
  const sleepy=sampleDesktopPose('sleepy',3.6);
  assert(sleepy.eyeOpenL<.1 && sleepy.headY>15);
  const proud=sampleDesktopPose('proud',1.2);
  assert(proud.bodyY<0 && proud.headY<0 && proud.browHappy>.5);
  const start=sampleDesktopPose('startled',0),settled=sampleDesktopPose('startled',4);
  assert(start.eyeOpenL>settled.eyeOpenL && Math.abs(start.headR)>Math.abs(settled.headR));
  assert(sampleDesktopPose('amused',.85).headY < sampleDesktopPose('amused',3.2).headY-5);
});

test('desktop sampler rejects unknown states and invalid time',()=>{
  assert.throws(()=>sampleDesktopPose('invented',0));
  for(const time of [NaN,Infinity,-1,'1'])assert.throws(()=>sampleDesktopPose('thinking',time));
});

test('motion loader rejects coercible timing and invalid loop or travel metadata',()=>{
  const base=new URL('../../apps/web/public/animation/mobile/smartphone/',import.meta.url);
  const model=JSON.parse(readFileSync(new URL('scene.json',base)));
  const clips=JSON.parse(readFileSync(new URL('motion.json',base)));
  for(const [field,value] of [['seconds','bad'],['seconds',null],['loop',1],['loop','false'],['travelPerCycle',null],['travelPerCycle',-1],['travelPerCycle',Infinity]]){
    const changed=structuredClone(clips);changed[0][field]=value;
    assert.throws(()=>validateCharacter(model,changed),`${field}:${value}`);
  }
});
