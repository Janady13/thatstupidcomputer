import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlaybackGate } from '../../apps/web/src/animation/rive/playback-gate.mjs';

function fixture(extra = {}, onStop = () => {}) {
  const calls = [];
  const player = { stop() { calls.push(['stop']); onStop(); }, play(action) { calls.push(['play', action]); }, pause() { calls.push(['pause']); } };
  const gate = createPlaybackGate(player, { action: 'Idle', replay: 0, paused: false, visible: false, hidden: false, reduced: false, ...extra });
  return { gate, calls };
}
test('native waits for visibility and independently respects pause, hidden document and reduced motion', () => {
  const { gate, calls } = fixture();
  assert.deepEqual(calls, []);
  gate.update({ visible: true }); assert.deepEqual(calls, [['stop'], ['play', 'Idle']]);
  gate.update({ paused: true }); gate.update({ visible: false, hidden: true, reduced: true });
  assert.deepEqual(calls.at(-1), ['pause']); const count = calls.length;
  gate.update({ paused: false, visible: true }); gate.update({ hidden: false }); assert.equal(calls.length, count);
  gate.update({ reduced: false }); assert.deepEqual(calls.at(-1), ['play', 'Idle']);
  assert.equal(calls.filter(call => call[0] === 'stop').length, 1, 'resume must retain the paused instance');
});
test('replay and action changes while offscreen queue only the latest requested restart', () => {
  const { gate, calls } = fixture({ visible: true });
  gate.update({ visible: false }); const count = calls.length;
  gate.update({ replay: 1 }); gate.update({ replay: 2, action: 'Think' }); gate.update({ action: 'RunRight' });
  assert.equal(calls.length, count, 'no play while offscreen');
  gate.update({ visible: true }); assert.deepEqual(calls.slice(-2), [['stop'], ['play', 'RunRight']]);
});
test('an action and pause in the same update never transiently start the new action', () => {
  const { gate, calls } = fixture({ visible: true });
  gate.update({ action: 'Facepalm', paused: true, replay: 1 });
  assert.deepEqual(calls, [['stop'], ['play', 'Idle'], ['pause']]);
  gate.update({ paused: false }); assert.deepEqual(calls.slice(-2), [['stop'], ['play', 'Facepalm']]);
  const count = calls.length; gate.update({ action: 'Facepalm', paused: false, replay: 1 }); assert.equal(calls.length, count);
});
test('completed one-shots stay completed through visibility changes until explicit replay', () => {
  const { gate, calls } = fixture({ visible: true, action: 'Bow' });
  gate.stopped(['Bow']); const count = calls.length;
  gate.update({ hidden: true }); gate.update({ hidden: false }); gate.update({ paused: true }); gate.update({ paused: false });
  assert.equal(calls.length, count, 'visibility restoration must not replay a completed gesture');
  gate.update({ replay: 1 }); assert.deepEqual(calls.slice(-2), [['stop'], ['play', 'Bow']]);
});
test('synchronous Stop from an explicit restart is not misclassified as completion', () => {
  let gate;
  const state = fixture({ visible: true, action: 'Happy' }, () => gate?.stopped(['Happy'])); gate = state.gate;
  gate.update({ replay: 1 }); gate.update({ hidden: true }); gate.update({ hidden: false });
  assert.deepEqual(state.calls.slice(-2), [['pause'], ['play', 'Happy']]);
});
test('a queued replay survives the old instance stop event and stale callbacks after disposal cannot play', () => {
  const { gate, calls } = fixture({ visible: true, action: 'Jump' });
  gate.update({ visible: false, replay: 1 }); gate.stopped(['Jump']);
  gate.update({ visible: true }); assert.deepEqual(calls.slice(-2), [['stop'], ['play', 'Jump']]);
  gate.dispose(); const count = calls.length; gate.dispose(); gate.update({ replay: 2, visible: true }); gate.stopped(['Jump']);
  assert.equal(calls.length, count); assert.deepEqual(calls.at(-1), ['pause']);
});
test('unknown actions and nonfinite replay counters cannot become native commands', () => {
  const { gate, calls } = fixture();
  assert.throws(() => gate.update({ action: 'Invented' })); assert.throws(() => gate.update({ replay: NaN }));
  assert.throws(() => gate.update({ replay: -1 })); assert.throws(() => gate.update({ visible: 'yes' }));
  assert.deepEqual(calls, []);
});
