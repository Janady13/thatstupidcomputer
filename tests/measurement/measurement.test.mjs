import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUTES as SITE_ROUTES } from '../../packages/site/content.ts';
import {
  CONSENT_KEY, CONSENT_MAX_AGE, DATA_LAYER, createAnalytics,
  validateConfig, validateEvent, parseConsent, safeAttribution, safeRoute,
} from '../../apps/web/src/measurement/analytics.mjs';

function fixture(saved) {
  let clock = 1_800_000_000_000;
  const storage = new Map(saved ? [[CONSENT_KEY, saved]] : []);
  const listeners = {};
  const cookies = new Map([['essential_session', 'kept']]);
  const scripts = [];
  const deletedCookies = [];
  let vitalsLoads = 0;
  const reporters = {};
  const win = {
    location: { hostname: 'studio.example.com', pathname: '/', search: '?utm_source=chatgpt.com&email=visitor%40example.com&gclid=private' },
    localStorage: { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    addEventListener: (event, callback) => { listeners[event] = callback; },
  };
  const doc = {
    referrer: 'https://chatgpt.com/c/private-conversation?name=private#secret',
    addEventListener: (event, callback) => { listeners[event] = callback; },
    createElement: () => ({ remove() { this.removed = true; } }),
    head: { appendChild: (script) => scripts.push(script) },
    get cookie() { return [...cookies].map(([key, value]) => `${key}=${value}`).join('; '); },
    set cookie(value) { deletedCookies.push(value); const key = value.split('=')[0]; if (value.includes('Max-Age=0')) cookies.delete(key); },
  };
  const service = createAnalytics({
    getWindow: () => win, getDocument: () => doc, now: () => clock,
    loadVitals: async () => {
      vitalsLoads++;
      return { onCLS: (cb) => { reporters.CLS = cb; }, onINP: (cb) => { reporters.INP = cb; }, onLCP: (cb) => { reporters.LCP = cb; } };
    },
  });
  const commands = () => Array.from(win[DATA_LAYER] ?? [], (args) => Array.from(args));
  const events = () => commands().filter(([command]) => command === 'event');
  return { service, win, doc, scripts, listeners, cookies, deletedCookies, reporters, commands, events, storage,
    get vitalsLoads() { return vitalsLoads; }, advance: (ms) => { clock += ms; } };
}
const tick = () => new Promise((resolve) => setImmediate(resolve));

test('every public canonical page has a finite measurement route', () => {
  for (const page of SITE_ROUTES) assert.equal(safeRoute(page.path), page.path);
});

test('canonical page context restores the hostname without copying visitor URLs', () => {
  const f = fixture();
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABCDE' });
  f.service.setConsent('granted');
  f.service.pageView('/about/');
  f.service.pageView('/visitor@example.com?private=1#secret');
  assert.deepEqual(f.events().map(([, , fields]) => fields.page_location), [
    'https://thatstupidcomputer.com/',
    'https://thatstupidcomputer.com/about/',
    'https://thatstupidcomputer.com/404/',
  ]);
  for (const [, , fields] of f.events()) {
    const url = new URL(fields.page_location);
    assert.equal(url.hostname, 'thatstupidcomputer.com');
    assert.equal(url.search, '');
    assert.equal(url.hash, '');
    assert.equal(fields.page_referrer, '');
  }
  assert.doesNotMatch(JSON.stringify(f.commands()), /studio\.example|visitor|private|secret|@|gclid/);
});

test('missing or unsafe canonical origins cannot activate Google', () => {
  for (const canonicalOrigin of [undefined, '', 'http://thatstupidcomputer.com', '/about/',
    'https://person:secret@thatstupidcomputer.com', 'https://thatstupidcomputer.com/about/',
    'https://thatstupidcomputer.com?email=private', 'https://thatstupidcomputer.com/#private',
    ' https://thatstupidcomputer.com', 42, {}]) {
    const f = fixture();
    assert.equal(f.service.configure({ canonicalOrigin, ga4MeasurementId: 'G-ABCDE' }), false);
    f.service.setConsent('granted');
    assert.equal(f.service.getStatus(), 'unconfigured');
    assert.equal(f.scripts.length, 0);
    assert.equal(f.events().length, 0);
  }
});

test('normalizing a canonical root does not duplicate configuration or pageviews', () => {
  const f = fixture();
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com/', ga4MeasurementId: 'G-ABCDE' });
  f.service.setConsent('granted');
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABCDE' });
  assert.equal(f.events().length, 1);
  assert.equal(f.events()[0][2].page_location, 'https://thatstupidcomputer.com/');
  assert.equal(f.commands().filter(([command]) => command === 'config').length, 1);
  assert.equal(f.scripts.length, 1);
});

test('changing an approved origin updates context and invalidating it stops collection', () => {
  const f = fixture();
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABCDE' });
  f.service.setConsent('granted');
  f.scripts[0].onload();
  f.service.configure({ canonicalOrigin: 'https://new-studio.example.com', ga4MeasurementId: 'G-ABCDE' });
  assert.equal(f.events().at(-1)[2].page_location, 'https://new-studio.example.com/');
  f.service.configure({ canonicalOrigin: 'https://new-studio.example.com/?private=1', ga4MeasurementId: 'G-ABCDE' });
  assert.equal(f.service.getStatus(), 'unconfigured');
  assert.equal(f.service.pageView('/about/'), false);
  assert.equal(f.win['ga-disable-G-ABCDE'], true);
});

test('valid runtime changes retain one vital subscription with the current destination and context', async () => {
  const f = fixture();
  const initial = { canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABCDE' };
  f.service.configure(initial);
  f.service.setConsent('granted');
  f.scripts[0].onload();
  await tick();
  const report = f.reporters.LCP;
  for (const next of [
    { ...initial, analyticsDebug: true },
    { ...initial, canonicalOrigin: 'https://new-studio.example.com' },
    { ...initial, ga4MeasurementId: 'G-FGHIJ' },
  ]) {
    f.service.configure(next);
    await tick();
    report({ name: 'LCP', value: 900, rating: 'good' });
    const vitals = f.events().filter(([, name]) => name === 'web_vital');
    assert.equal(vitals.length, 1, 'a configuration refresh must not silence the consented document');
    assert.equal(vitals[0][2].send_to, next.ga4MeasurementId);
    assert.equal(vitals[0][2].page_location, `${next.canonicalOrigin}/`);
    assert.equal(vitals[0][2].debug_mode, next.analyticsDebug);
    assert.equal(f.reporters.LCP, report);
  }
  assert.equal(f.vitalsLoads, 1);
  assert.equal(f.scripts.length, 1);
  assert.equal(f.win['ga-disable-G-ABCDE'], true);
  assert.equal(f.win['ga-disable-G-FGHIJ'], false);
});

test('a valid configuration refresh during the vital import preserves its eventual report', async () => {
  const f = fixture();
  const config = { canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABCDE' };
  f.service.configure(config);
  f.service.setConsent('granted');
  await Promise.resolve();
  assert.equal(f.vitalsLoads, 1);
  assert.equal(f.reporters.LCP, undefined, 'import has started but registration is still pending');
  f.service.configure({ ...config, analyticsDebug: true });
  await tick();
  assert.equal(typeof f.reporters.LCP, 'function');
  f.reporters.LCP({ name: 'LCP', value: 800, rating: 'good' });
  assert.equal(f.events().filter(([, name]) => name === 'web_vital').length, 1);
  assert.equal(f.vitalsLoads, 1);
});

test('invalidating configuration permanently discards document vitals even after configuration returns', async () => {
  const f = fixture();
  const config = { canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABCDE' };
  f.service.configure(config);
  f.service.setConsent('granted');
  await tick();
  const report = f.reporters.LCP;
  f.service.configure({});
  report({ name: 'LCP', value: 1000, rating: 'good' });
  assert.equal(f.events().length, 0);
  f.service.configure(config);
  report({ name: 'LCP', value: 1200, rating: 'good' });
  assert.deepEqual(f.events().map(([, name]) => name), ['page_view']);
  assert.equal(f.vitalsLoads, 1);
});

test('missing and invalid runtime IDs fail closed, even after opt-in', async () => {
  for (const id of [undefined, '', 'G-', 'UA-123456-1', 'G-VALID12?email=private', 'G-<script>', 42]) {
    const f = fixture();
    assert.equal(f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: id }), false);
    f.service.setConsent('granted');
    assert.equal(f.service.generateLead('smtp_accepted'), false);
    await tick();
    assert.equal(f.scripts.length, 0);
    assert.equal(f.vitalsLoads, 0);
    assert.equal(f.service.getStatus(), 'unconfigured');
  }
  assert.deepEqual(validateConfig({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABC1234567', analyticsDebug: 'true' }), { canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABC1234567', analyticsDebug: false });
  const shortest = fixture();
  assert.equal(shortest.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABCDE' }), true);
  assert.equal(shortest.scripts.length, 0);
  shortest.service.setConsent('granted');
  assert.equal(shortest.scripts.length, 1);
});

test('basic consent mode has no script, layer, vitals or buffered events before opt-in', async () => {
  const f = fixture();
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABC1234567' });
  f.service.pageView('/services/');
  f.service.sceneInteraction('desktop-office', 'demo');
  f.service.demoStart('hero');
  f.service.generateLead('smtp_accepted');
  await tick();
  assert.equal(f.scripts.length, 0);
  assert.equal(f.win[DATA_LAYER], undefined);
  assert.equal(f.vitalsLoads, 0);
  assert.equal(f.win['ga-disable-G-ABC1234567'], true);
  f.service.setConsent('denied');
  assert.equal(f.scripts.length, 0);
  f.service.setConsent('granted');
  assert.equal(f.scripts.length, 1);
  assert.equal(f.scripts[0].referrerPolicy, 'no-referrer');
  assert.deepEqual(f.events().map(([, name]) => name), ['page_view']);
  assert.equal(f.events()[0][2].page_path, '/services/');
  assert.deepEqual(f.commands().slice(0, 2).map((args) => args.slice(0, 2)), [['consent', 'default'], ['consent', 'update']]);
});

test('SPA views deduplicate effects and use a finite route/title without raw location', () => {
  const f = fixture();
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABC1234567' });
  f.service.setConsent('granted');
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABC1234567' });
  f.service.pageView('/');
  f.service.pageView('/about/');
  f.service.pageView('/about/');
  f.service.pageView('/');
  f.service.pageView('/visitor@example.com?private=1#secret');
  assert.deepEqual(f.events().map(([, , fields]) => fields.page_path), ['/', '/about/', '/', '/404/']);
  assert.equal(f.scripts.length, 1);
  const config = f.commands().find(([command]) => command === 'config')[2];
  assert.equal(config.send_page_view, false);
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.page_referrer, '');
  for (const key of ['campaign_name', 'campaign_id', 'campaign_content', 'campaign_term']) assert.equal(config[key], 'not_collected');
  assert.doesNotMatch(JSON.stringify(f.commands()), /visitor|private|secret|@|gclid|studio\.example/);
});

test('the runtime event schema rejects unknown keys, values, inherited properties and nonfinite numbers', () => {
  assert.equal(validateEvent('scene_interaction', { scene_id: 'desktop-office', interaction: 'demo' }), true);
  assert.equal(validateEvent('scene_interaction', { scene_id: 'desktop-office', interaction: 'private message' }), false);
  assert.equal(validateEvent('generate_lead', { acceptance: 'smtp_accepted', email: 'visitor@example.com' }), false);
  assert.equal(validateEvent('generate_lead', { acceptance: 'smtp_accepted', request_id: '12345' }), false);
  assert.equal(validateEvent('generate_lead', { acceptance: 'clicked' }), false);
  assert.equal(validateEvent('form_submit', {}), false);
  assert.equal(validateEvent('__proto__', {}), false);
  assert.equal(validateEvent('generate_lead', Object.create({ acceptance: 'smtp_accepted' })), false);
  for (const value of [Infinity, NaN, -1, '15', 4_000_000]) assert.equal(validateEvent('web_vital', { metric_name: 'LCP', metric_value: value, metric_rating: 'good', page_path: '/' }), false);
  assert.equal(validateEvent('web_vital', { metric_name: 'CLS', metric_value: 0.04, metric_rating: 'good', page_path: '/', target: '#person-name' }), false);
  const getter = Object.defineProperty({}, 'acceptance', { enumerable: true, get() { throw new Error('Getter must not run'); } });
  assert.equal(validateEvent('generate_lead', getter), false);
});

test('finite methods emit a lead only for accepted status and errors stay errors', () => {
  const f = fixture();
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABC1234567' });
  f.service.setConsent('granted');
  f.service.demoStart('contact');
  f.service.demoSubmitError('validation');
  assert.equal(f.service.generateLead('success'), false);
  assert.equal(f.service.generateLead({ email: 'visitor@example.com' }), false);
  assert.equal(f.service.generateLead('smtp_accepted', 'receipt-1'), true);
  assert.deepEqual(f.events().map(([, name]) => name), ['page_view', 'demo_start', 'demo_submit_error', 'generate_lead']);
});

test('accepted receipt deduplication is bounded, consent-aware and never leaves memory', () => {
  const f = fixture();
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABCDE' });
  assert.equal(f.service.generateLead('smtp_accepted', 'receipt-first'), false);
  f.service.setConsent('granted');
  assert.equal(f.service.generateLead('smtp_accepted', 'receipt-first'), true);
  f.service.pageView('/work/'); f.service.pageView('/contact/');
  assert.equal(f.service.generateLead('smtp_accepted', 'receipt-first'), false);
  assert.equal(f.service.generateLead('smtp_accepted', 'receipt-second'), true);
  assert.equal(f.service.generateLead('smtp_accepted'), false);
  assert.equal(f.service.generateLead('smtp_accepted', 'visitor@example.com'), false);
  assert.equal(f.events().filter(([, name]) => name === 'generate_lead').length, 2);
  assert.doesNotMatch(JSON.stringify(f.commands()), /receipt-first|receipt-second|requestId/);
  assert.doesNotMatch(JSON.stringify([...f.storage]), /receipt-first|receipt-second/);
  f.service.setConsent('denied');
  assert.equal(f.service.generateLead('smtp_accepted', 'receipt-while-denied'), false);
  f.service.setConsent('granted');
  assert.equal(f.service.generateLead('smtp_accepted', 'receipt-first'), false, 'regrant cannot recount an already emitted receipt');
  assert.equal(f.service.generateLead('smtp_accepted', 'receipt-while-denied'), true, 'no receipt or event was buffered while denied');
  f.advance(30 * 60 * 1000);
  assert.equal(f.service.generateLead('smtp_accepted', 'receipt-first'), true, 'receipt cache expires after the documented window');
  for (let i = 0; i < 100; i++) f.service.generateLead('smtp_accepted', `bounded-${i}`);
  assert.equal(f.service.generateLead('smtp_accepted', 'receipt-first'), true, 'oldest record is evicted at 100 entries');
});

test('withdrawal disables loaded tag before update, deletes analytics cookies and stops late vitals', async () => {
  const f = fixture();
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABC1234567' });
  f.service.setConsent('granted');
  f.scripts[0].onload();
  await tick();
  f.cookies.set('_ga', '123'); f.cookies.set('_ga_ABC1234567', '456');
  const layer = f.win[DATA_LAYER];
  const originalPush = layer.push.bind(layer);
  let disabledAtUpdate = false;
  layer.push = (...args) => { if (args[0][0] === 'consent') disabledAtUpdate = f.win['ga-disable-G-ABC1234567']; return originalPush(...args); };
  f.service.setConsent('denied');
  assert.equal(disabledAtUpdate, true);
  assert.equal(f.win['ga-disable-G-ABC1234567'], true);
  assert.equal(f.service.sceneInteraction('desktop-office', 'demo'), false);
  f.reporters.LCP({ name: 'LCP', value: 999, rating: 'good' });
  assert.equal(f.events().length, 0);
  assert.equal(f.cookies.get('essential_session'), 'kept');
  assert.equal(f.cookies.has('_ga'), false);
  assert.equal(f.cookies.has('_ga_ABC1234567'), false);
  assert.ok(f.deletedCookies.some((cookie) => cookie.includes('domain=.example.com')));
  f.service.setConsent('granted');
  assert.equal(f.scripts.length, 1, 'reuse disabled loaded tag instead of registering it twice');
  const count = f.events().length;
  f.reporters.LCP({ name: 'LCP', value: 1200, rating: 'good' });
  assert.equal(f.events().length, count, 'revoked observer never reactivates');
  assert.equal(f.vitalsLoads, 1);
});

test('withdrawal while script is loading clears queued allowed events and removes pending script', async () => {
  const f = fixture();
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABC1234567' });
  f.service.setConsent('granted');
  f.service.demoStart('hero');
  f.service.setConsent('denied');
  await tick();
  assert.equal(f.scripts[0].removed, true);
  assert.equal(f.scripts[0].onload, null);
  assert.equal(f.events().length, 0);
  assert.equal(f.win['ga-disable-G-ABC1234567'], true);
  assert.equal(Object.keys(f.reporters).length, 0);
  assert.equal(f.vitalsLoads, 0, 'withdrawal before the import starts must prevent that work');
});

test('stored consent is versioned, expiring, resilient to corruption and withdrawn across tabs', () => {
  const now = 1_800_000_000_000;
  for (const raw of ['bad', '{}', 'null', JSON.stringify({ version: 0, choice: 'granted', updatedAt: now }), JSON.stringify({ version: 1, choice: 'granted', updatedAt: now + 1 }), JSON.stringify({ version: 1, choice: 'granted', updatedAt: now - CONSENT_MAX_AGE })]) assert.equal(parseConsent(raw, now), 'unset');
  const f = fixture(JSON.stringify({ version: 1, choice: 'granted', updatedAt: now - 1000 }));
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABC1234567' });
  assert.equal(f.scripts.length, 1);
  f.storage.set(CONSENT_KEY, JSON.stringify({ version: 1, choice: 'denied', updatedAt: now }));
  f.listeners.storage({ key: CONSENT_KEY });
  assert.equal(f.service.getConsent(), 'denied');
  assert.equal(f.win['ga-disable-G-ABC1234567'], true);
  f.service.setConsent('granted');
  f.advance(CONSENT_MAX_AGE);
  f.listeners.visibilitychange();
  assert.equal(f.service.getConsent(), 'unset');
  assert.equal(f.service.demoStart('hero'), false);
});

test('blocked storage preserves in-memory choice without breaking the page', () => {
  const f = fixture();
  f.win.localStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABC1234567' });
  assert.equal(f.service.getConsent(), 'unset');
  assert.equal(f.service.setConsent('granted'), true);
  assert.equal(f.scripts.length, 1);
  assert.equal(f.service.setConsent('denied'), true);
  assert.equal(f.service.getConsent(), 'denied');
});

test('attribution uses exact allowlists and does not turn absent evidence into AI traffic', () => {
  assert.deepEqual(safeAttribution('?utm_source=chatgpt.com&email=person@example.com', ''), { source: 'chatgpt', evidence: 'allowed_utm' });
  assert.deepEqual(safeAttribution('?utm_source=person@example.com&utm_campaign=secret', ''), { source: 'unattributed', evidence: 'unavailable' });
  assert.deepEqual(safeAttribution('?utm_source=chatgpt.com&utm_source=private', ''), { source: 'unattributed', evidence: 'unavailable' });
  assert.deepEqual(safeAttribution('', 'https://www.google.com/search?q=person@example.com'), { source: 'google', evidence: 'referrer_host' });
  assert.deepEqual(safeAttribution('', 'https://chatgpt.com.evil.example/private'), { source: 'other_referral', evidence: 'referrer_host' });
  assert.deepEqual(safeAttribution('', 'https://unclassified.example/secret'), { source: 'other_referral', evidence: 'referrer_host' });
  assert.deepEqual(safeAttribution('', 'javascript:alert(1)'), { source: 'unattributed', evidence: 'unavailable' });
  assert.equal(safeRoute('https://studio.example/about/?email=person@example.com'), '/404/');
  for (const route of ['website-design', 'website-rescue', 'search-visibility', 'website-care']) assert.equal(safeRoute(`/services/${route}/`), `/services/${route}/`);
});

test('web vitals send only scalar metrics after opt-in and never entries, selectors, ids or attribution', async () => {
  const f = fixture();
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABC1234567' });
  await tick();
  assert.equal(f.vitalsLoads, 0);
  f.service.setConsent('granted');
  await tick();
  f.reporters.CLS({ name: 'CLS', value: 0.056789, rating: 'good', id: 'private-id', entries: [{ target: '#name' }], attribution: { largestShiftTarget: 'person@example.com' } });
  f.reporters.INP({ name: 'INP', value: 121.567, rating: 'good', target: '#message' });
  const vitals = f.events().filter(([, name]) => name === 'web_vital');
  assert.equal(vitals.length, 2);
  assert.equal(vitals[0][2].metric_value, 0.0568);
  assert.equal(vitals[1][2].metric_value, 122);
  assert.doesNotMatch(JSON.stringify(vitals), /person|@|#|private-id|attribution|entries|target/);
});

test('delayed consent attributes navigation vitals to the document route, not a later SPA view', async () => {
  const f = fixture();
  f.win.location.pathname = '/services/website-rescue/';
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABCDE' });
  f.win.location.pathname = '/contact/';
  f.service.pageView('/contact/');
  f.service.setConsent('granted');
  await tick();
  f.service.pageView('/about/');
  for (const name of ['CLS', 'INP', 'LCP']) {
    f.reporters[name]({ name, value: name === 'CLS' ? 0.01 : 900, rating: 'good' });
  }
  assert.deepEqual(f.events().filter(([, name]) => name === 'page_view').map(([, , payload]) => payload.page_path), ['/contact/', '/about/']);
  const vitals = f.events().filter(([, name]) => name === 'web_vital');
  assert.equal(vitals.length, 3);
  for (const [, , payload] of vitals) {
    assert.equal(payload.page_path, '/services/website-rescue/');
    assert.equal(payload.page_location, 'https://thatstupidcomputer.com/services/website-rescue/');
    assert.equal(payload.page_title, 'Website rescue');
  }
});

test('tag load failure drops later events without preventing other site actions', () => {
  const f = fixture();
  f.service.configure({ canonicalOrigin: 'https://thatstupidcomputer.com', ga4MeasurementId: 'G-ABC1234567' });
  f.service.setConsent('granted');
  f.scripts[0].onerror();
  assert.equal(f.service.getStatus(), 'blocked');
  assert.equal(f.service.generateLead('smtp_accepted'), false);
  assert.equal(f.events().length, 0);
  assert.equal(f.service.setConsent('denied'), true);
});
