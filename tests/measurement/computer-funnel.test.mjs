import test from 'node:test';
import assert from 'node:assert/strict';
import { CONSENT_KEY, DATA_LAYER, createAnalytics, validateEvent } from '../../apps/web/src/measurement/analytics.mjs';

const stages = ['open', 'intent_selected', 'attitude_requested', 'gesture_requested', 'mood_selected', 'back', 'demo_clicked', 'dismissed'];
const intents = ['design', 'rescue', 'search', 'care', 'unsure'];

function fixture() {
  const scripts = [], storage = new Map();
  let vitalsLoads = 0;
  const win = {
    location: { hostname: 'studio.example.com', pathname: '/contact/', search: '?project=design&from=computer&email=private@example.com#private' },
    localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    addEventListener() {},
  };
  const doc = {
    referrer: 'https://studio.example.com/?message=private', cookie: '',
    addEventListener() {},
    createElement: () => ({ remove() { this.removed = true; } }),
    head: { appendChild: script => scripts.push(script) },
  };
  const service = createAnalytics({
    getWindow: () => win, getDocument: () => doc, now: () => 1_800_000_000_000,
    loadVitals: async () => {
      vitalsLoads++;
      return { onCLS() {}, onINP() {}, onLCP() {} };
    },
  });
  const commands = () => Array.from(win[DATA_LAYER] ?? [], args => Array.from(args));
  const events = () => commands().filter(([command]) => command === 'event');
  const computerEvents = () => events().filter(([, name]) => name === 'computer_interaction');
  return { service, win, scripts, storage, commands, events, computerEvents, get vitalsLoads() { return vitalsLoads; } };
}

function enable(f) {
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABCDE' });
  f.service.setConsent('granted');
}

test('computer schema accepts only the finite stage and intent dictionary', () => {
  for (const interaction_stage of stages) for (const project_intent of [...intents, 'not_selected']) {
    assert.equal(validateEvent('computer_interaction', { interaction_stage, project_intent }), true);
  }
  assert.equal(validateEvent('demo_start', { entry_point: 'computer' }), true);
  for (const invalid of ['', 'DESIGN', 'private@example.com', '/contact/?project=design', 'a private message', null, 42, {}, ['design']]) {
    assert.equal(validateEvent('computer_interaction', { interaction_stage: invalid, project_intent: 'design' }), false);
    assert.equal(validateEvent('computer_interaction', { interaction_stage: 'intent_selected', project_intent: invalid }), false);
  }
});

test('computer schema rejects unknown fields, accessors and inherited payloads without reading content', () => {
  const safe = { interaction_stage: 'demo_clicked', project_intent: 'design' };
  for (const key of ['email', 'name', 'phone', 'message', 'page_location', 'page_url', 'project', 'requestId', 'request_id', '__proto__']) {
    assert.equal(validateEvent('computer_interaction', { ...safe, [key]: 'private@example.com' }), false);
  }
  assert.equal(validateEvent('computer_interaction', { interaction_stage: 'open' }), false);
  assert.equal(validateEvent('computer_interaction', Object.create(safe)), false);
  assert.equal(validateEvent('computer_interaction', { ...safe, [Symbol('private')]: 'secret' }), false);
  const getter = Object.defineProperty({ project_intent: 'design' }, 'interaction_stage', {
    enumerable: true, get() { throw new Error('private getter must not execute'); },
  });
  assert.equal(validateEvent('computer_interaction', getter), false);
});

test('computer clicks remain inactive without config or consent and never replay on grant', async () => {
  const missing = fixture();
  missing.service.setConsent('granted');
  assert.equal(missing.service.computerInteraction('open'), false);
  assert.equal(missing.service.demoStart('computer'), false);
  assert.equal(missing.scripts.length, 0);
  const f = fixture();
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABCDE' });
  for (const stage of stages) assert.equal(f.service.computerInteraction(stage, 'design'), false);
  assert.equal(f.service.demoStart('computer'), false);
  f.service.setConsent('denied');
  assert.equal(f.service.computerInteraction('open'), false);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(f.scripts.length, 0);
  assert.equal(f.vitalsLoads, 0);
  assert.equal(f.win[DATA_LAYER], undefined);
  f.service.setConsent('granted');
  assert.deepEqual(f.events().map(([, name]) => name), ['page_view']);
  assert.equal(f.scripts.length, 1);
});

test('one explicit method call emits one computer event with no raw URL, text or receipt', () => {
  const f = fixture(); enable(f);
  assert.equal(f.service.computerInteraction('open'), true);
  for (const intent of intents) assert.equal(f.service.computerInteraction('intent_selected', intent), true);
  for (const stage of stages.slice(2)) assert.equal(f.service.computerInteraction(stage, 'design'), true);
  assert.equal(f.computerEvents().length, 1 + intents.length + stages.length - 2);
  assert.deepEqual(f.computerEvents()[0][2], {
    interaction_stage: 'open', project_intent: 'not_selected',
    page_location: 'https://thatstupidcomputer.com/contact/', page_title: 'Contact', page_referrer: '', send_to: 'G-ABCDE',
  });
  assert.equal(f.service.computerInteraction('open'), true, 'a second actual click remains a second interaction');
  assert.equal(f.computerEvents().filter(([, , payload]) => payload.interaction_stage === 'open').length, 2);
  const count = f.events().length;
  assert.equal(f.service.computerInteraction('private@example.com', 'design'), false);
  assert.equal(f.service.computerInteraction('intent_selected', 'private@example.com'), false);
  assert.equal(f.service.computerInteraction('open', null), false);
  assert.equal(f.events().length, count);
  assert.doesNotMatch(JSON.stringify(f.commands()), /private|@|studio\.example|#|\?project|requestId|request_id/);
  assert.deepEqual([...f.storage.keys()], [CONSENT_KEY]);
});

test('withdrawal and tag failure stop new computer events and discard queued interactions', () => {
  const f = fixture(); enable(f);
  f.service.computerInteraction('open');
  f.service.computerInteraction('demo_clicked', 'search');
  f.service.setConsent('denied');
  assert.equal(f.scripts[0].removed, true);
  assert.equal(f.win['ga-disable-G-ABCDE'], true);
  assert.equal(f.service.computerInteraction('dismissed'), false);
  assert.equal(f.service.demoStart('computer'), false);
  assert.equal(f.events().length, 0);
  f.service.setConsent('granted');
  assert.equal(f.computerEvents().length, 0, 'withdrawn events do not return after regrant');
  f.scripts.at(-1).onerror();
  assert.equal(f.service.computerInteraction('open'), false);
  assert.equal(f.events().length, 0);
});

test('computer demo journey never implies a lead before the existing SMTP acceptance boundary', () => {
  const f = fixture(); enable(f);
  f.service.computerInteraction('open');
  f.service.computerInteraction('intent_selected', 'rescue');
  f.service.computerInteraction('demo_clicked', 'rescue');
  f.service.demoStart('computer');
  f.service.demoSubmitError('validation');
  assert.equal(f.events().filter(([, name]) => name === 'generate_lead').length, 0);
  assert.equal(f.service.generateLead('demo_clicked', 'accepted-receipt-1'), false);
  assert.equal(f.service.generateLead('smtp_accepted', 'accepted-receipt-1'), true);
  assert.equal(f.service.generateLead('smtp_accepted', 'accepted-receipt-1'), false);
  assert.equal(f.events().filter(([, name]) => name === 'generate_lead').length, 1);
  assert.deepEqual(f.events().filter(([, name]) => name === 'demo_start').map(([, , payload]) => payload.entry_point), ['computer']);
  assert.doesNotMatch(JSON.stringify(f.commands()), /accepted-receipt-1|requestId|request_id/);
});
