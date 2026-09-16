import test from 'node:test';
import assert from 'node:assert/strict';
import { createConversation, transitionConversation, INTENTS, ROASTS, DESKTOP_TO_MOBILE } from '../../apps/web/src/animation/conversation/director.mjs';
import { DESKTOP_STATE_IDS, safeDesktopState } from '../../apps/web/src/animation/desktop/performances.mjs';
import { MOBILE_ACTIONS } from '../../apps/web/src/animation/core/contracts.mjs';
import { demoIntentHref, parseDemoIntent } from '../../apps/web/src/components/demo-intent.mjs';

test('all 32 desktop expressions have an existing mobile counterpart', () => {
  assert.equal(DESKTOP_STATE_IDS.length, 32);
  assert.deepEqual(Object.keys(DESKTOP_TO_MOBILE).sort(), [...DESKTOP_STATE_IDS].sort());
  for (const action of Object.values(DESKTOP_TO_MOBILE)) assert.ok(MOBILE_ACTIONS.includes(action));
});

test('the invitation starts quietly with no selected intent or rude permission', () => {
  assert.deepEqual(createConversation(), { view: 'closed', intent: null, roastIndex: -1, attitude: false, desktop: 'idle', mobile: 'Idle', announcement: '' });
  const initial = createConversation();
  const opened = transitionConversation(initial, { type: 'OPEN' });
  assert.equal(opened.view, 'choose');
  assert.equal(opened.desktop, 'wave');
  assert.equal(initial.view, 'closed');
});

test('each supported intent leads to the matching ordinary inquiry URL', () => {
  for (const intent of ['design', 'rescue', 'search']) {
    const next = transitionConversation(createConversation(), { type: 'INTENT', intent });
    assert.equal(next.view, 'recommendation');
    assert.equal(next.intent, intent);
    assert.equal(next.announcement, INTENTS[intent].line);
    assert.ok(DESKTOP_STATE_IDS.includes(next.desktop));
    const href = demoIntentHref(next.intent);
    const url = new URL(href, 'https://example.invalid');
    assert.equal(url.pathname, '/contact/');
    assert.equal(url.hash, '#demo-request');
    assert.equal(parseDemoIntent(url.search).projectType, intent);
    assert.equal(url.searchParams.get('from'), 'computer');
    assert.equal([...url.searchParams].length, 2);
  }
});

test('rude mood selection never grants permission; the explicit gesture does', () => {
  let state = createConversation();
  for (const desktop of ['rude-flip-off', 'double-flip-off']) {
    const blocked = transitionConversation(state, { type: 'MOOD', desktop });
    assert.equal(blocked.attitude, false);
    assert.equal(blocked.desktop, 'eye-roll');
    assert.equal(blocked.mobile, 'EyeRoll');
  }
  state = transitionConversation(state, { type: 'ROAST' });
  assert.equal(state.attitude, false);
  state = transitionConversation(state, { type: 'GESTURE' });
  assert.equal(state.attitude, true);
  assert.equal(state.desktop, 'rude-flip-off');
  assert.equal(state.mobile, 'RudeFlipOff');
  const doubled = transitionConversation(state, { type: 'GESTURE', double: true });
  assert.equal(doubled.desktop, 'double-flip-off');
  assert.equal(safeDesktopState(doubled.desktop, doubled.attitude), 'double-flip-off');
});

test('back, dismissal, a fresh intent, another roast and hands-down revoke permission', () => {
  const rude = transitionConversation(transitionConversation(createConversation(), { type: 'ROAST' }), { type: 'GESTURE', double: true });
  for (const event of [{ type: 'BACK' }, { type: 'CLOSE' }, { type: 'INTENT', intent: 'rescue' }, { type: 'ROAST' }, { type: 'POLITE' }]) {
    const next = transitionConversation(rude, event);
    assert.equal(next.attitude, false);
    assert.notEqual(next.mobile, 'RudeFlipOff');
    assert.notEqual(next.desktop, 'rude-flip-off');
    assert.notEqual(next.desktop, 'double-flip-off');
  }
});

test('roasts are a bounded authored rotation and preserve an already selected project', () => {
  let state = transitionConversation(createConversation(), { type: 'INTENT', intent: 'search' });
  for (let index = 0; index < ROASTS.length * 3; index++) {
    state = transitionConversation(state, { type: 'ROAST' });
    assert.equal(state.announcement, ROASTS[index % ROASTS.length]);
    assert.equal(state.roastIndex, index % ROASTS.length);
    assert.equal(state.intent, 'search');
    assert.equal(state.attitude, false);
  }
  assert.equal(transitionConversation(createConversation(), { type: 'ROAST' }).intent, 'rescue');
});

test('unrecognized and inherited keys cannot become project intents or animation states', () => {
  const state = createConversation();
  for (const invalid of ['constructor', '__proto__', 'https://example.invalid', 'visitor@example.invalid', '']) {
    assert.equal(transitionConversation(state, { type: 'INTENT', intent: invalid }), state);
    assert.equal(transitionConversation(state, { type: 'MOOD', desktop: invalid }), state);
  }
  assert.equal(transitionConversation(state, { type: 'unknown' }), state);
});
