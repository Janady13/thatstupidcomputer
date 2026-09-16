import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_STATE, DESKTOP_STATES, safeDesktopState, transition } from '../../apps/web/src/animation/core/contracts.mjs';
test('desktop rude performances require explicit permission at the shared state boundary',()=>{
  for(const name of ['rude-flip-off','double-flip-off']){
    assert.equal(safeDesktopState(name,false),'eye-roll');
    assert.equal(safeDesktopState(name,true),name);
    assert.equal(transition({...INITIAL_STATE},{type:'DESKTOP',state:name}).desktop,'eye-roll');
  }
  assert.equal(transition({...INITIAL_STATE},{type:'CUE',cue:'attitude.requested'}).desktop,'eye-roll');
  for(const value of ['false',1,{},null]){
    assert.equal(safeDesktopState('rude-flip-off',value),'eye-roll');
    assert.equal(transition({...INITIAL_STATE},{type:'ATTITUDE',enabled:value}).attitude,false);
  }
  for(const state of ['__proto__','constructor','toString'])assert.throws(()=>safeDesktopState(state,true));
});
test('revoking attitude clears both original desktop and mobile rude gestures immediately',()=>{
  for(const desktop of ['rude-flip-off','double-flip-off']){
    const next=transition({...INITIAL_STATE,attitude:true,desktop,action:'RudeFlipOff',paused:true},{type:'ATTITUDE',enabled:false});
    assert.equal(next.desktop,'idle');assert.equal(next.action,'Idle');assert.equal(next.attitude,false);assert.equal(next.paused,true);
  }
});
test('actual demo outcome cues select supportive desktop actions without counting navigation as success',()=>{
  assert.equal(transition({...INITIAL_STATE},{type:'CUE',cue:'project.started'}).desktop,'demo-invite');
  assert.equal(transition({...INITIAL_STATE},{type:'CUE',cue:'inquiry.pending'}).desktop,'searching');
  assert.equal(transition({...INITIAL_STATE},{type:'CUE',cue:'inquiry.failed'}).desktop,'confused');
  assert.equal(transition({...INITIAL_STATE},{type:'CUE',cue:'inquiry.accepted'}).desktop,'demo-success');
  assert.equal(DESKTOP_STATES.length,32);
});
