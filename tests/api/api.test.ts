import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { createApp, type AppOptions } from '../../apps/api/src/app.js';
import { loadConfig } from '../../apps/api/src/config.js';
import { htmlRoutes, animationJsonPaths } from '../../apps/api/src/static.js';
import type { MailMessage, MailTransport } from '../../apps/api/src/mail.js';

const origin = 'https://thatstupidcomputer.com';
const configured = { NODE_ENV: 'production', PUBLIC_ORIGIN: origin, SMTP_HOST: 'smtp.example.test', SMTP_PORT: '587', SMTP_SECURE: 'false', SMTP_USER: 'protected-user', SMTP_PASS: 'synthetic-secret-not-real', SMTP_FROM: 'sender@example.test', SMTP_TO: 'owner@example.test' };
const input = () => ({ name: 'Synthetic Visitor', email: 'visitor@example.test', business: 'Synthetic Business', website: 'https://example.test', projectType: 'design', message: 'A synthetic request for a website demo.', consent: true, companyWebsite: '', submissionId: randomUUID() });
const headers = { origin, 'content-type': 'application/json', accept: 'application/json' };
const accepted: MailTransport = { async sendMail() { return { accepted: [configured.SMTP_TO], rejected: [] }; } };
async function appFor(t: TestContext, options: AppOptions = {}) {
  const app = await createApp({ env: configured, mailTransport: accepted, logger: false, ...options });
  t.after(() => app.close());
  return app;
}
async function fixture(t: TestContext) {
  const root = await mkdtemp(join(tmpdir(), 'tsc-api-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const route of htmlRoutes) {
    const path = join(root, route, 'index.html');
    await mkdir(join(root, route), { recursive: true });
    await writeFile(path, `<!doctype html><html lang="en"><title>${route}</title><h1>${route}</h1></html>`);
  }
  await mkdir(join(root, 'assets'));
  await writeFile(join(root, 'assets', 'main-AbCd1234.js'), 'export const safe = true;');
  await writeFile(join(root, 'assets', 'renderer.wasm'), Buffer.from([0, 97, 115, 109, 1, 0, 0, 0]));
  await writeFile(join(root, 'robots.txt'), 'User-agent: *\nAllow: /\n');
  await writeFile(join(root, 'assets', 'private.json'), '{"secret":"DO_NOT_SERVE"}');
  await writeFile(join(root, 'assets', 'bundle.js.map'), 'DO_NOT_SERVE');
  await writeFile(join(root, '.env'), 'DO_NOT_SERVE');
  return root;
}

test('mail acceptance is truthful, goes to the single configured recipient, and returns a generated ID', async t => {
  const messages: MailMessage[] = [];
  const app = await appFor(t, { mailTransport: { async sendMail(message) { messages.push(message); return { accepted: [configured.SMTP_TO], rejected: [] }; } } });
  const res = await app.inject({ method: 'POST', url: '/api/demo', headers: { ...headers, 'x-request-id': 'visitor-controlled' }, payload: input() });
  assert.equal(res.statusCode, 200);
  assert.equal(res.json().status, 'accepted');
  assert.equal(res.json().ok, true);
  assert.match(res.json().requestId, /^[\da-f-]{36}$/);
  assert.notEqual(res.json().requestId, 'visitor-controlled');
  assert.equal(messages.length, 1);
  assert.deepEqual(messages[0].envelope, { from: configured.SMTP_FROM, to: [configured.SMTP_TO] });
  assert.equal(messages[0].from, configured.SMTP_FROM);
  assert.equal(messages[0].replyTo.address, 'visitor@example.test');
  assert.equal(messages[0].disableFileAccess, true);
  assert.equal(messages[0].disableUrlAccess, true);
  assert.equal(res.headers['cache-control'], 'no-store');
  assert.doesNotMatch(res.body, /delivered|received|synthetic-secret|owner@example/);
});

test('unconfigured SMTP never sends or reports success and readiness is separate from liveness', async t => {
  let sent = 0;
  const app = await appFor(t, { env: { NODE_ENV: 'production', PUBLIC_ORIGIN: origin }, mailTransport: { async sendMail() { sent++; return { accepted: [] }; } } });
  const res = await app.inject({ method: 'POST', url: '/api/demo', headers, payload: input() });
  assert.equal(res.statusCode, 503);
  assert.equal(res.json().code, 'service_unavailable');
  assert.match(res.json().message, /not been sent/);
  assert.equal(sent, 0);
  assert.equal((await app.inject('/api/health')).statusCode, 200);
  const ready = await app.inject('/api/ready');
  assert.equal(ready.statusCode, 503);
  assert.equal(ready.json().checks.mail, 'unconfigured');
  assert.equal(ready.json().delivery, 'not_checked');
});

test('complete runtime and static configuration reports ready without calling mail', async t => {
  const root = await fixture(t);
  let sent = 0;
  const app = await appFor(t, { staticRoot: root, mailTransport: { async sendMail() { sent++; return { accepted: [] }; } } });
  const ready = await app.inject('/api/ready');
  assert.equal(ready.statusCode, 200);
  assert.deepEqual(ready.json(), { ok: true, status: 'ready', checks: { mail: 'configured', site: 'available' }, delivery: 'not_checked' });
  assert.equal(sent, 0);
  assert.doesNotMatch(ready.body, /protected-user|synthetic-secret|smtp.example|owner@example/);
});

test('Origin enforcement rejects cross-site, null, suffix spoof, missing metadata, and contradictory fetch metadata', async t => {
  let sent = 0;
  const app = await appFor(t, { mailTransport: { async sendMail() { sent++; return { accepted: [] }; } } });
  for (const extra of [{ origin: 'https://evil.test' }, { origin: 'null' }, { origin: `${origin}.evil.test` }, { origin, 'sec-fetch-site': 'cross-site' }, { origin: undefined }]) {
    const requestHeaders = Object.fromEntries(Object.entries({ ...headers, ...extra }).filter(([, value]) => value !== undefined)) as Record<string, string>;
    const res = await app.inject({ method: 'POST', url: '/api/demo', headers: requestHeaders, payload: input() });
    assert.equal(res.statusCode, 403);
    assert.equal(res.json().code, 'invalid_origin');
  }
  assert.equal(sent, 0);
});

test('authoritative validation rejects abusive and malformed fields without invoking SMTP', async t => {
  let sent = 0;
  const app = await appFor(t, { limits: { demoMax: 50 }, mailTransport: { async sendMail() { sent++; return { accepted: [] }; } } });
  const invalid = [
    { name: 'A' }, { name: 'X\r\nBcc: injected@example.test' }, { email: 'a@example.test\nBcc: bad@example.test' },
    { consent: false }, { consent: 'true' }, { companyWebsite: 'https://bot.example.test' },
    { message: 'short' }, { message: 'a'.repeat(4001) }, { business: 'x'.repeat(161) },
    { website: 'javascript:alert(1)' }, { website: 'https://user:pass@example.test/' },
    { to: 'injected@example.test' }, { submissionId: 'fake-id' }, { name: ['A', 'B'] }, { projectType: 'invented' },
  ];
  for (const payload of invalid) {
    const res = await app.inject({ method: 'POST', url: '/api/demo', headers, payload: { ...input(), ...payload } });
    assert.equal(res.statusCode, 400, JSON.stringify(payload));
    assert.equal(res.json().code, 'invalid_request');
  }
  assert.equal(sent, 0);
});

test('parsing, body size and method failures retain actual HTTP status and safe bodies', async t => {
  const app = await appFor(t, { limits: { demoMax: 50 } });
  const malformed = await app.inject({ method: 'POST', url: '/api/demo', headers, payload: '{"name":' });
  assert.equal(malformed.statusCode, 400);
  const oversized = await app.inject({ method: 'POST', url: '/api/demo', headers, payload: { ...input(), message: 'x'.repeat(18000) } });
  assert.equal(oversized.statusCode, 413);
  assert.equal(oversized.json().code, 'body_too_large');
  const wrongType = await app.inject({ method: 'POST', url: '/api/demo', headers: { ...headers, 'content-type': 'text/plain' }, payload: 'private message' });
  assert.equal(wrongType.statusCode, 415);
  const unsupported = await app.inject({ method: 'POST', url: '/api/demo', headers: { ...headers, 'content-type': 'application/xml' }, payload: '<data>private</data>' });
  assert.equal(unsupported.statusCode, 415);
  const method = await app.inject('/api/demo');
  assert.equal(method.statusCode, 405);
  assert.equal(method.headers.allow, 'POST');
});

test('native HTML form works without JS and reflects no submitted content into error pages', async t => {
  const app = await appFor(t);
  const payload = new URLSearchParams({ ...input(), consent: 'on', submissionId: '' });
  const res = await app.inject({ method: 'POST', url: '/api/demo', headers: { origin, accept: 'text/html', 'content-type': 'application/x-www-form-urlencoded' }, payload: payload.toString() });
  assert.equal(res.statusCode, 200);
  assert.match(res.headers['content-type'] || '', /text\/html/);
  assert.match(res.body, /role="status"/);
  assert.match(res.body, /accepted for sending/);
  payload.set('name', '<script>alert(1)</script>');
  payload.set('email', 'not-an-email');
  const invalid = await app.inject({ method: 'POST', url: '/api/demo', headers: { origin, accept: 'text/html', 'content-type': 'application/x-www-form-urlencoded' }, payload: payload.toString() });
  assert.equal(invalid.statusCode, 400);
  assert.match(invalid.body, /role="alert"/);
  assert.doesNotMatch(invalid.body, /<script>|alert\(1\)|not-an-email/);
  assert.match(invalid.body, /Enter a valid email address/);
});

test('same-origin Referer provides a bounded fallback for native forms without Origin', async t => {
  const app = await appFor(t);
  const payload = new URLSearchParams({ ...input(), consent: 'true', submissionId: '' });
  const res = await app.inject({ method: 'POST', url: '/api/demo', headers: { referer: `${origin}/contact/`, accept: 'text/html', 'content-type': 'application/x-www-form-urlencoded' }, payload: payload.toString() });
  assert.equal(res.statusCode, 200);
});

test('same content with a changed submission ID is sent once, while different content is separate', async t => {
  let sent = 0;
  const app = await appFor(t, { mailTransport: { async sendMail() { sent++; return { accepted: [configured.SMTP_TO] }; } } });
  const payload = input();
  const first = await app.inject({ method: 'POST', url: '/api/demo', headers, payload });
  const duplicate = await app.inject({ method: 'POST', url: '/api/demo', headers, payload: { ...payload, submissionId: randomUUID() } });
  assert.equal(first.statusCode, 200);
  assert.deepEqual(duplicate.json(), first.json());
  assert.equal(sent, 1);
  const other = await app.inject({ method: 'POST', url: '/api/demo', headers, payload: { ...payload, message: 'A materially different synthetic inquiry.' } });
  assert.equal(other.statusCode, 200);
  assert.equal(sent, 2);
});

test('mail rejection and partial/unexpected acceptance cannot produce success', async t => {
  const outcomes = [
    { accepted: [], rejected: [configured.SMTP_TO] },
    { accepted: ['wrong@example.test'] },
    { accepted: [configured.SMTP_TO, 'extra@example.test'] },
    { accepted: [configured.SMTP_TO], pending: ['pending'] },
  ];
  for (const outcome of outcomes) {
    const app = await appFor(t, { mailTransport: { async sendMail() { return outcome; } } });
    const res = await app.inject({ method: 'POST', url: '/api/demo', headers, payload: input() });
    assert.equal(res.statusCode, 502);
    assert.equal(res.json().ok, false);
    assert.equal(res.json().code, 'mail_rejected');
    assert.doesNotMatch(res.body, /owner@example|extra@example|wrong@example/);
  }
});

test('provider errors are redacted and authentication rejection is accurately reported', async t => {
  const app = await appFor(t, { mailTransport: { async sendMail() { throw Object.assign(new Error('secret SMTP_PASS=synthetic-secret-not-real visitor@example.test'), { code: 'EAUTH', responseCode: 535 }); } } });
  const res = await app.inject({ method: 'POST', url: '/api/demo', headers, payload: input() });
  assert.equal(res.statusCode, 502);
  assert.equal(res.json().code, 'mail_rejected');
  // A generated UUID may contain the digits 535; only a standalone SMTP code is a leak.
  assert.doesNotMatch(res.body, /synthetic-secret|SMTP_PASS|visitor@example|EAUTH|\b535\b/);
});

test('timeout stays uncertain, keeps concurrency bounded, and never retries the same content', async t => {
  let resolveSend!: (value: { accepted: string[] }) => void;
  let sent = 0;
  const app = await appFor(t, { limits: { mailDeadlineMs: 20, concurrentSends: 1 }, mailTransport: { sendMail() { sent++; return new Promise(resolve => { resolveSend = resolve; }); } } });
  const payload = input();
  const first = await app.inject({ method: 'POST', url: '/api/demo', headers, payload });
  assert.equal(first.statusCode, 504);
  assert.equal(first.json().code, 'delivery_unknown');
  const duplicate = await app.inject({ method: 'POST', url: '/api/demo', headers, payload });
  assert.equal(duplicate.statusCode, 504);
  assert.deepEqual(duplicate.json(), first.json());
  const concurrent = await app.inject({ method: 'POST', url: '/api/demo', headers, payload: { ...input(), message: 'A second different synthetic request.' } });
  assert.equal(concurrent.statusCode, 503);
  assert.equal(sent, 1);
  resolveSend({ accepted: [configured.SMTP_TO] });
});

test('in-flight duplicate receives conflict and global mail concurrency is enforced', async t => {
  let resolveSend!: (value: { accepted: string[] }) => void;
  let started!: () => void;
  const begun = new Promise<void>(resolve => { started = resolve; });
  const app = await appFor(t, { limits: { concurrentSends: 1 }, mailTransport: { sendMail() { started(); return new Promise(resolve => { resolveSend = resolve; }); } } });
  const payload = input();
  const first = app.inject({ method: 'POST', url: '/api/demo', headers, payload });
  await begun;
  const duplicate = await app.inject({ method: 'POST', url: '/api/demo', headers, payload });
  assert.equal(duplicate.statusCode, 409);
  assert.equal(duplicate.json().code, 'request_in_progress');
  const other = await app.inject({ method: 'POST', url: '/api/demo', headers, payload: { ...input(), name: 'Another Synthetic Visitor' } });
  assert.equal(other.statusCode, 503);
  resolveSend({ accepted: [configured.SMTP_TO] });
  assert.equal((await first).statusCode, 200);
});

test('rate limiting returns 429 with Retry-After and cannot be bypassed by untrusted forwarding headers', async t => {
  const app = await appFor(t, { limits: { demoMax: 1 } });
  const first = await app.inject({ method: 'POST', url: '/api/demo', headers: { ...headers, 'x-forwarded-for': '192.0.2.1' }, payload: input() });
  assert.equal(first.statusCode, 200);
  const second = await app.inject({ method: 'POST', url: '/api/demo', headers: { ...headers, 'x-forwarded-for': '192.0.2.2' }, payload: input() });
  assert.equal(second.statusCode, 429);
  assert.ok(second.headers['retry-after']);
  assert.equal(second.json().code, 'rate_limited');
});

test('global rate limiting also bounds early origin rejections and unknown resources', async t => {
  const app = await appFor(t, { limits: { globalMax: 2 } });
  const first = await app.inject({ method: 'POST', url: '/api/demo', headers: { ...headers, origin: 'https://evil.test' }, payload: input() });
  assert.equal(first.statusCode, 403);
  assert.equal((await app.inject('/unknown-resource')).statusCode, 404);
  const limited = await app.inject('/api/health');
  assert.equal(limited.statusCode, 429);
  assert.ok(limited.headers['retry-after']);
});

test('HTML routes, canonical redirects, asset MIME/cache and genuine 404s are preserved', async t => {
  const root = await fixture(t);
  const app = await appFor(t, { staticRoot: root });
  for (const route of htmlRoutes) {
    const res = await app.inject(route);
    assert.equal(res.statusCode, 200, route);
    assert.match(res.headers['content-type'] || '', /text\/html/);
    assert.equal(res.headers['cache-control'], 'public, max-age=0, must-revalidate');
  }
  const redirect = await app.inject('/services?email=never-reflected@example.test');
  assert.equal(redirect.statusCode, 308);
  assert.equal(redirect.headers.location, '/services/');
  const js = await app.inject('/assets/main-AbCd1234.js');
  assert.equal(js.statusCode, 200);
  assert.match(js.headers['content-type'] || '', /javascript/);
  assert.equal(js.headers['cache-control'], 'public, max-age=31536000, immutable');
  const wasm = await app.inject('/assets/renderer.wasm');
  assert.equal(wasm.headers['content-type'], 'application/wasm');
  const missing = await app.inject({ url: '/unknown-page/', headers: { accept: 'text/html' } });
  assert.equal(missing.statusCode, 404);
  assert.match(missing.body, /Page not found/);
  assert.equal((await app.inject('/assets/missing.js')).statusCode, 404);
});

test('source maps, private files, encoded traversal, source folders and escaping symlinks are blocked', async t => {
  const root = await fixture(t);
  const outside = await mkdtemp(join(tmpdir(), 'tsc-api-outside-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await writeFile(join(outside, 'secret.js'), 'DO_NOT_SERVE');
  await symlink(join(outside, 'secret.js'), join(root, 'assets', 'secret.js'));
  const app = await appFor(t, { staticRoot: root });
  for (const url of ['/.env', '/%2eenv', '/%61bout/', '/services/%77ebsite-design/', '/assets/bundle.js.map', '/assets/private.json', '/private/standards/document-001.txt', '/src/app.ts', '/assets/secret.js', '/assets/%2e%2e/.env', '/assets/%252e%252e/.env', '/assets/%5csecret.js', '/services/index.html', '/index.html']) {
    const res = await app.inject(url);
    assert.equal(res.statusCode, 404, url);
    assert.doesNotMatch(res.body, /DO_NOT_SERVE/, url);
  }
});

test('canonical redirects preserve only one exact approved attribution source and strip PII/duplicates', async t => {
  const root = await fixture(t);
  const app = await appFor(t, { staticRoot: root });
  for (const source of ['chatgpt.com', 'perplexity.ai', 'claude.ai', 'copilot.microsoft.com', 'gemini.google.com']) {
    const res = await app.inject(`/services?utm_source=${source}&email=visitor%40example.test&utm_campaign=private-details&gclid=private-token`);
    assert.equal(res.statusCode, 308);
    assert.equal(res.headers.location, `/services/?utm_source=${source}`);
    assert.doesNotMatch(res.headers.location || '', /private|visitor|email|gclid|campaign/);
  }
  for (const query of ['utm_source=visitor%40example.test', 'utm_source=chatgpt.com.evil.test', 'utm_source=chatgpt.com&utm_source=claude.ai', 'utm_source=chatgpt.com&utm_source=chatgpt.com', 'utm_source=%00chatgpt.com', 'utm_source=CHATGPT.COM', 'utm_source=%3Cscript%3E', 'utm_campaign=chatgpt.com']) {
    const res = await app.inject(`/services?${query}`);
    assert.equal(res.statusCode, 308);
    assert.equal(res.headers.location, '/services/');
  }
});

test('contact redirects retain finite computer project context while dropping unrelated query content', async t => {
  const root = await fixture(t);
  const app = await appFor(t, { staticRoot: root });
  for (const project of ['design', 'rescue', 'search', 'care', 'unsure']) {
    const res = await app.inject(`/contact?project=${project}&from=computer&email=visitor%40example.test&message=private-details`);
    assert.equal(res.statusCode, 308);
    assert.equal(res.headers.location, `/contact/?project=${project}&from=computer`);
    assert.equal((await app.inject(res.headers.location!)).statusCode, 200);
  }
  const attributed = await app.inject('/contact?project=rescue&from=computer&utm_source=chatgpt.com&gclid=private-token');
  assert.equal(attributed.statusCode, 308);
  const location = new URL(attributed.headers.location!, origin);
  assert.equal(location.pathname, '/contact/');
  assert.deepEqual([...location.searchParams].sort(), [['from', 'computer'], ['project', 'rescue'], ['utm_source', 'chatgpt.com']]);
  const otherRoute = await app.inject('/services?project=rescue&from=computer&utm_source=chatgpt.com');
  assert.equal(otherRoute.headers.location, '/services/?utm_source=chatgpt.com');
});

test('contact redirects discard invalid or duplicate inquiry fields without losing approved attribution', async t => {
  const root = await fixture(t);
  const app = await appFor(t, { staticRoot: root });
  for (const query of [
    'project=rescue', 'from=computer', 'project=rescue&from=elsewhere',
    'project=rescue&from=computer&project=design', 'project=rescue&from=computer&project=rescue',
    'project=rescue&from=computer&from=computer', 'project=rescue&from=computer&%66rom=elsewhere',
    'project=&from=computer', 'project=RESCUE&from=computer', 'project=__proto__&from=computer',
    'project=visitor%40example.test&from=computer', 'project=%3Cscript%3E&from=computer',
    'project=rescue&from=%00computer', 'project=rescue&from=computer%3Fprivate',
    `project=rescue&from=computer&message=${'x'.repeat(2048)}`,
  ]) {
    const res = await app.inject(`/contact?${query}&utm_source=claude.ai`);
    assert.equal(res.statusCode, 308, query);
    assert.equal(res.headers.location, '/contact/?utm_source=claude.ai', query);
  }
});

test('invalid or duplicate attribution cannot erase an otherwise valid contact project', async t => {
  const root = await fixture(t);
  const app = await appFor(t, { staticRoot: root });
  for (const query of ['utm_source=private%40example.test', 'utm_source=chatgpt.com&utm_source=claude.ai', 'utm_source=chatgpt.com&utm_source=chatgpt.com']) {
    const res = await app.inject(`/contact?project=search&from=computer&${query}`);
    assert.equal(res.statusCode, 308);
    assert.equal(res.headers.location, '/contact/?project=search&from=computer');
  }
});

test('the actual public animation manifests, mobile motion/scene JSON, poster and WASM remain available', async t => {
  const app = await appFor(t, { staticRoot: resolve('apps/web/public') });
  for (const path of animationJsonPaths) {
    const response = await app.inject(path);
    assert.equal(response.statusCode, 200, path);
    assert.match(response.headers['content-type'] || '', /application\/json/, path);
    assert.doesNotThrow(() => JSON.parse(response.body), path);
  }
  const poster = await app.inject('/animation/mobile/smartphone/poster.svg');
  assert.equal(poster.statusCode, 200);
  assert.match(poster.headers['content-type'] || '', /image\/svg\+xml/);
  const wasm = await app.inject('/animation/runtime/rive.wasm');
  assert.equal(wasm.statusCode, 200);
  assert.equal(wasm.headers['content-type'], 'application/wasm');
  assert.equal((await app.inject('/animation/mobile/smartphone/private.json')).statusCode, 404);
});

test('a built styled 404 page is used while preserving the 404 status', async t => {
  const root = await fixture(t);
  await writeFile(join(root, '404.html'), '<!doctype html><html lang="en"><title>Missing page</title><main><h1>Styled missing page</h1></main></html>');
  const app = await appFor(t, { staticRoot: root });
  const res = await app.inject({ url: '/not-a-page/', headers: { accept: 'text/html' } });
  assert.equal(res.statusCode, 404);
  assert.match(res.body, /Styled missing page/);
  assert.equal(res.headers['cache-control'], 'no-store');
});

test('security headers enforce local script and WASM policy without unsafe-eval and expose no server identity', async t => {
  const app = await appFor(t);
  const res = await app.inject('/api/health');
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
  assert.equal(res.headers['x-frame-options'], 'SAMEORIGIN');
  assert.match(res.headers['content-security-policy'] || '', /frame-ancestors 'none'/);
  assert.match(res.headers['content-security-policy'] || '', /form-action 'self'/);
  assert.match(res.headers['content-security-policy'] || '', /'wasm-unsafe-eval'/);
  assert.doesNotMatch(res.headers['content-security-policy'] || '', /(?:^|\s)'unsafe-eval'(?:\s|;|$)/);
  assert.ok(res.headers['strict-transport-security']);
  assert.equal(res.headers['x-powered-by'], undefined);
  assert.equal(res.headers.server, undefined);
});

test('runtime config validates exact origins, single mailbox, TLS mode and safe public measurement ID', async t => {
  for (const change of [{ SMTP_TO: 'one@example.test,two@example.test' }, { SMTP_FROM: 'x@example.test\r\nBcc: y@example.test' }, { SMTP_SECURE: '' }, { SMTP_PORT: '465', SMTP_SECURE: 'false' }, { PUBLIC_ORIGIN: 'http://thatstupidcomputer.com' }]) {
    assert.equal(loadConfig({ ...configured, ...change }).smtp, null);
  }
  assert.throws(() => loadConfig({ ...configured, ALLOWED_ORIGINS: `${origin}/path` }));
  assert.throws(() => loadConfig({ ...configured, TRUST_PROXY: 'true' }));
  assert.equal(loadConfig({}).host, '127.0.0.1');
  const app = await appFor(t, { env: { ...configured, GA4_MEASUREMENT_ID: 'G-ABC1234567' } });
  const res = await app.inject('/api/config');
  assert.deepEqual(res.json(), { analytics: { measurementId: 'G-ABC1234567' } });
  assert.doesNotMatch(res.body, /SMTP|smtp|secret|recipient|protected-user|owner@example/);
});

test('request and provider logs never contain form content, query strings, headers, IP addresses or secrets', async t => {
  let logs = '';
  const app = await appFor(t, { logger: { stream: { write(chunk: string) { logs += chunk; } } }, mailTransport: { async sendMail() { throw new Error('Synthetic Visitor visitor@example.test protected-user synthetic-secret-not-real'); } } });
  await app.inject({ method: 'POST', url: '/api/demo?email=visitor@example.test', headers: { ...headers, authorization: 'Bearer private-token', 'x-request-id': 'private-token' }, payload: input() });
  await app.inject('/unknown?message=synthetic-secret-not-real');
  assert.match(logs, /request_completed/);
  assert.match(logs, /delivery_unknown/);
  assert.doesNotMatch(logs, /Synthetic Visitor|Synthetic Business|visitor@example|synthetic-secret|protected-user|private-token|127\.0\.0\.1|SMTP_PASS/);
});

test('graceful app close invokes transport close without sending mail', async () => {
  let closed = 0;
  const app = await createApp({ env: configured, logger: false, mailTransport: { async sendMail() { throw new Error('Must not send'); }, close() { closed++; } } });
  await app.ready();
  await app.close();
  assert.equal(closed, 1);
});

test('crawler evidence verifies the connection IP and never logs raw addresses or visitor headers', async t => {
  let logs = '';
  const app = await appFor(t, {
    logger: { stream: { write(chunk: string) { logs += chunk; } } },
    crawlerVerification: { fetch: async () => new Response(JSON.stringify({ creationTime: '2026-09-01T00:00:00Z', prefixes: [{ ipv4Prefix: '203.0.113.0/24' }] }), { headers: { 'content-type': 'application/json' } }) },
  });
  const response = await app.inject({ url: '/api/health?token=private-query', remoteAddress: '203.0.113.7', headers: { 'user-agent': 'Mozilla/5.0 (compatible; OAI-SearchBot/1.4; visitor-private-value)', authorization: 'Bearer private-token' } });
  assert.equal(response.statusCode, 200);
  await app.close();
  assert.match(logs, /"event":"crawler_observed"/);
  assert.match(logs, /"agent":"OAI-SearchBot"/);
  assert.match(logs, /"verification":"verified"/);
  assert.doesNotMatch(logs, /203\.0\.113|private-query|visitor-private-value|private-token|prefixes/);
});

test('a claimed bot cannot use a forwarding header to authenticate or bypass private routes', async t => {
  let logs = '';
  const app = await appFor(t, {
    logger: { stream: { write(chunk: string) { logs += chunk; } } },
    crawlerVerification: { fetch: async () => new Response(JSON.stringify({ creationTime: '2026-09-01T00:00:00Z', prefixes: [{ ipv4Prefix: '203.0.113.0/24' }] }), { headers: { 'content-type': 'application/json' } }) },
  });
  const response = await app.inject({ url: '/private/standards/SEO-AIO-Library.txt', remoteAddress: '198.51.100.2', headers: { 'user-agent': 'OAI-SearchBot/1.4', 'x-forwarded-for': '203.0.113.7' } });
  assert.equal(response.statusCode, 404);
  await app.close();
  assert.match(logs, /"verification":"ip_mismatch"/);
  assert.doesNotMatch(logs, /198\.51\.100|203\.0\.113|SEO-AIO-Library/);
});

test('verified crawler traffic still obeys the normal request limits', async t => {
  const app = await appFor(t, {
    logger: { stream: { write() {} } }, limits: { globalMax: 1 },
    crawlerVerification: { fetch: async () => new Response(JSON.stringify({ creationTime: '2026-09-01T00:00:00Z', prefixes: [{ ipv4Prefix: '203.0.113.0/24' }] }), { headers: { 'content-type': 'application/json' } }) },
  });
  const request = { url: '/api/health', remoteAddress: '203.0.113.7', headers: { 'user-agent': 'OAI-SearchBot/1.4' } };
  assert.equal((await app.inject(request)).statusCode, 200);
  assert.equal((await app.inject(request)).statusCode, 429);
});

test('deployed loopback proxy trust authenticates only the nearest untrusted connection', async t => {
  for (const [remoteAddress, forwardedFor, expected] of [
    ['127.0.0.1', '203.0.113.7', 'verified'],
    ['198.51.100.2', '203.0.113.7', 'ip_mismatch'],
    ['127.0.0.1', '203.0.113.7, 198.51.100.2', 'ip_mismatch'],
  ]) {
    let logs = '';
    const app = await appFor(t, {
      env: { ...configured, TRUST_PROXY: '127.0.0.1' },
      logger: { stream: { write(chunk: string) { logs += chunk; } } },
      crawlerVerification: { fetch: async () => new Response(JSON.stringify({ creationTime: '2026-09-01T00:00:00Z', prefixes: [{ ipv4Prefix: '203.0.113.0/24' }] }), { headers: { 'content-type': 'application/json' } }) },
    });
    assert.equal((await app.inject({ url: '/api/health', remoteAddress, headers: { 'user-agent': 'OAI-SearchBot/1.4', 'x-forwarded-for': forwardedFor! } })).statusCode, 200);
    await app.close();
    const observation = logs.split('\n').filter(Boolean).map(line => JSON.parse(line)).find(row => row.event === 'crawler_observed');
    assert.equal(observation.verification, expected);
    assert.doesNotMatch(logs, /198\.51\.100|203\.0\.113|127\.0\.0\.1/);
  }
});
