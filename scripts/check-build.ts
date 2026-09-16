/** Actual built-artifact and Fastify integration checks. No socket, browser or email send. */
import assert from 'node:assert/strict';
import { readFile, readdir, lstat, mkdir, writeFile } from 'node:fs/promises';
import { resolve, relative, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { DOMParser } from '@xmldom/xmldom';
import { createApp } from '../apps/api/src/app.ts';
import { htmlRoutes } from '../apps/api/src/static.ts';
import { ROUTES, getPage, SITE_ORIGIN } from '../packages/site/content.ts';
import { buildGraph, metadataForPage, robotsTxt, sitemapXml } from '../packages/site/search.ts';
import { CRAWLER_AGENTS, PUBLISHER_META, PROVIDERS } from '../packages/discovery/registry.ts';
import type { PublicSiteConfig } from '../packages/site/truth.ts';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'apps/web/dist');
const sha = (bytes: string | Buffer) => createHash('sha256').update(bytes).digest('hex');
type Check = { id: string; status: 'PASS' | 'FAIL'; detail?: unknown; error?: string };
const checks: Check[] = [];
async function check(id: string, run: () => unknown | Promise<unknown>) {
  try { checks.push({ id, status: 'PASS', detail: await run() }); }
  catch (error) { checks.push({ id, status: 'FAIL', error: error instanceof Error ? error.message : String(error) }); }
}
async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async entry => {
    const path = resolve(directory, entry.name);
    assert(!entry.isSymbolicLink(), `Public output must not contain symlink: ${relative(output, path)}`);
    return entry.isDirectory() ? walk(path) : [path];
  }))).flat().sort();
}
function parse(html: string) {
  const errors: string[] = [];
  const document = new DOMParser({ onError: (level, message) => errors.push(`${level}: ${message}`) }).parseFromString(html, 'text/html');
  assert.deepEqual(errors, [], 'Unexpected parser warnings/errors in actual HTML');
  return document;
}
type Parsed = ReturnType<typeof parse>;
const tags = (document: Parsed, tag: string) => Array.from(document.getElementsByTagName(tag));
function meta(document: Parsed, name: string) {
  return tags(document, 'meta').filter(node => node.getAttribute('name') === name || node.getAttribute('property') === name);
}
function configFromHTML(document: Parsed): PublicSiteConfig {
  const configs = tags(document, 'script').filter(node => node.getAttribute('id') === 'tsc-config');
  assert.equal(configs.length, 1, 'Exactly one hydration configuration');
  assert.equal(configs[0].getAttribute('type'), 'application/json');
  const text = configs[0].textContent ?? '';
  assert.doesNotMatch(text, /sourceCommit|approvedPaths|claimRefs|SMTP_PASS|SMTP_TO|private\/standards/);
  assert.doesNotMatch(text, /BING_KEY|OPENAI_API_KEY|GEMINI_API_KEY|TSC_DISCOVERY_NODE|TSC_GSC_SERVICE_ACCOUNT|api\.openai\.com\/v1\/responses|api\.mistral\.ai\/v1\/conversations/);
  const config = JSON.parse(text) as PublicSiteConfig;
  assert(['preview', 'production'].includes(config.deployment));
  assert(config.crawlerPolicy, 'Current crawler contract must be present in the built hydration config');
  assert.equal(config.canonicalOrigin, SITE_ORIGIN);
  return config;
}

const startedAt = new Date().toISOString();
const files = await walk(output);
const snapshot = await Promise.all(files.map(async path => ({ path: relative(root, path), bytes: (await lstat(path)).size, sha256: sha(await readFile(path)) })));
// Explicit empty environment prevents use of real SMTP configuration from the host.
const app = await createApp({ env: { NODE_ENV: 'test', PUBLIC_ORIGIN: SITE_ORIGIN }, staticRoot: output, logger: false, limits: { globalMax: 5000, demoMax: 50 }, crawlerVerification: { fetch: async () => new Response('', { status: 503 }) } });
const htmlHeaders = { accept: 'text/html' };
let config: PublicSiteConfig | undefined;
const internalLinks = new Set<string>();
try {
  await check('build-record-and-route-inventory', async () => {
    assert.deepEqual([...htmlRoutes].sort(), ROUTES.map(page => page.path).sort(), 'Backend and editorial route inventories differ');
    const record = JSON.parse(await readFile(resolve(root, '.build/build-record.json'), 'utf8'));
    assert.equal(record.lockSha256, sha(await readFile(resolve(root, 'package-lock.json'))), 'Build is stale relative to the dependency lock');
    assert.deepEqual(record.routes, ROUTES.map(page => page.path));
    assert.equal(record.node, process.version);
    assert.equal(snapshot.filter(file => file.path.endsWith('.html')).length, ROUTES.length + 1);
    const actualAssets = snapshot.map(file => relative(output, resolve(root, file.path))).filter(path => path.startsWith('assets/')).sort();
    assert(Array.isArray(record.clientAssets), 'Build record lacks the bundler output inventory');
    assert.deepEqual(actualAssets, [...record.clientAssets].sort(), 'Public assets differ from this build: stale or missing bundles');
    return { routes: ROUTES.length, missingPage: 1, builtAt: record.builtAt, deployment: record.deployment, lockSha256: record.lockSha256, currentGeneratedAssets: actualAssets.length };
  });
  for (const page of ROUTES) await check(`page:${page.path}`, async () => {
    const response = await app.inject({ url: page.path, headers: htmlHeaders });
    assert.equal(response.statusCode, 200);
    assert.match(String(response.headers['content-type']), /^text\/html/);
    assert.match(String(response.headers['cache-control']), /must-revalidate/);
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    const document = parse(response.body);
    const pageConfig = configFromHTML(document);
    if (config) assert.deepEqual(pageConfig, config, 'Hydration configuration differs between public pages');
    else config = pageConfig;
    const expected = metadataForPage(page, pageConfig);
    assert.equal(tags(document, 'title').length, 1);
    assert.equal(tags(document, 'title')[0].textContent, expected.title);
    for (const [name, value] of [['description', expected.description], ['robots', expected.robots], ['og:title', expected.title], ['og:url', expected.canonical]]) {
      const nodes = meta(document, name!); assert.equal(nodes.length, 1, `Duplicate/missing ${name}`); assert.equal(nodes[0].getAttribute('content'), value);
    }
    const canonical = tags(document, 'link').filter(node => node.getAttribute('rel') === 'canonical');
    assert.equal(canonical.length, 1); assert.equal(canonical[0].getAttribute('href'), expected.canonical);
    assert.equal(tags(document, 'h1').length, 1); assert.equal(tags(document, 'h1')[0].textContent, page.heading);
    const main = document.getElementById('main-content'); assert(main);
    assert.equal(document.documentElement?.getAttribute('lang'), 'en');
    for (const { name, content } of PUBLISHER_META) {
      const nodes = meta(document, name);
      assert.equal(nodes.length, 1, `Missing provider publisher directive: ${name}`);
      assert.equal(nodes[0].getAttribute('content'), pageConfig.deployment === 'production' ? content : 'noindex, nofollow');
    }
    assert(main.textContent?.includes(page.intro), 'Actual initial HTML lacks the visible introduction');
    for (const section of page.sections) assert(main.textContent?.includes(section.heading), `Initial HTML lacks section ${section.heading}`);
    const graphNodes = tags(document, 'script').filter(node => node.getAttribute('type') === 'application/ld+json');
    assert.equal(graphNodes.length, 1);
    assert.deepEqual(JSON.parse(graphNodes[0].textContent ?? ''), buildGraph(page, pageConfig), 'SSR graph and current route contract differ');
    const graph = JSON.parse(graphNodes[0].textContent ?? '')['@graph'] as Array<Record<string, unknown>>;
    for (const section of page.sections.filter(section => section.id)) {
      const element = document.getElementById(section.id!);
      assert(element, `Missing published answer: ${section.id}`);
      assert.equal(element.getAttribute('aria-labelledby'), `${section.id}-heading`);
      assert.equal(document.getElementById(`${section.id}-heading`)?.textContent, section.heading);
      assert.equal(tags(document, '*').filter(node => node.getAttribute('id') === section.id).length, 1);
      const record = graph.find(node => node['@id'] === `${expected.canonical}#${section.id}`);
      assert(record && record['@type'] === 'WebPageElement');
      for (const part of [...(section.paragraphs ?? []), ...(section.items ?? [])]) {
        assert(element.textContent?.includes(part), 'A structured answer is missing from visible HTML');
        assert(String(record.text).includes(part), 'Answer metadata lost a condition or limitation');
      }
      assert(!element.hasAttribute('data-nosnippet'), 'Public answer accidentally excluded from snippets');
    }
    for (const script of tags(document, 'script')) {
      if (!script.getAttribute('src')) assert(['application/json', 'application/ld+json'].includes(script.getAttribute('type') ?? ''), 'Executable inline script would violate the enforced CSP');
    }
    for (const anchor of tags(document, 'a')) {
      const href = anchor.getAttribute('href'); assert(href, 'Anchor has no native href');
      if (href.startsWith('/') && !href.startsWith('//')) internalLinks.add(href);
      if (href.startsWith('#')) assert(document.getElementById(href.slice(1)), `Missing fragment target ${href}`);
    }
    const forms = tags(document, 'form');
    assert.equal(forms.length, page.path === '/contact/' ? 1 : 0);
    if (forms.length) {
      const form = forms[0]; assert.equal(form.getAttribute('action'), '/api/demo'); assert.equal(form.getAttribute('method'), 'post');
      assert(!form.hasAttribute('novalidate'), 'No-JavaScript form must keep native validation');
      const labels = tags(document, 'label').map(node => node.getAttribute('for'));
      for (const field of [...tags(document, 'input'), ...tags(document, 'select'), ...tags(document, 'textarea')]) {
        if (field.getAttribute('type') !== 'hidden') assert(labels.includes(field.getAttribute('id')), 'Form control lacks its associated label');
      }
      const website = document.getElementById('demo-website'), message = document.getElementById('demo-message');
      // This parser preserves React's camel-case source spelling but folds getAttribute
      // lookups in HTML mode; inspect its named attributes to match browser HTML semantics.
      assert.equal(Array.from(website?.attributes ?? []).find(attribute => attribute.name.toLowerCase() === 'maxlength')?.value, '300');
      assert.equal(Array.from(message?.attributes ?? []).find(attribute => attribute.name.toLowerCase() === 'maxlength')?.value, '4000');
    }
    return { status: response.statusCode, bytes: response.rawPayload.length, canonical: expected.canonical, title: expected.title, initialHTML: true, nativeForm: forms.length === 1 };
  });
  await check('all-native-internal-links-resolve', async () => {
    for (const href of internalLinks) {
      const target = href.split(/[?#]/)[0]; assert(getPage(target), `Link has no public route: ${target}`);
      assert.equal((await app.inject({ url: target, headers: htmlHeaders })).statusCode, 200, href);
    }
    return { distinctTargets: internalLinks.size };
  });
  await check('publisher-crawler-public-private-parity-without-credentials', async () => {
    const url = '/services/website-rescue/';
    const human = await app.inject({ url, headers: htmlHeaders });
    for (const { agent } of CRAWLER_AGENTS) {
      const headers = { ...htmlHeaders, 'user-agent': `${agent}/1.0` };
      const response = await app.inject({ url, headers });
      assert.equal(response.statusCode, 200, agent);
      assert.equal(response.body, human.body, `Bot-only content or challenge for ${agent}`);
      assert.equal((await app.inject({ url: '/private/truth/reviewed-export.json', headers })).statusCode, 404, agent);
    }
    return { providersReviewed: Object.keys(PROVIDERS), simulatedAgents: CRAWLER_AGENTS.length, modelApiCalls: 0, outcome: 'publisher-delivery-only; not real crawler or citation evidence' };
  });
  await check('missing-page-and-hydration-input-consistency', async () => {
    const response = await app.inject({ url: '/this-page-does-not-exist/', headers: htmlHeaders });
    assert.equal(response.statusCode, 404); assert.match(String(response.headers['cache-control']), /no-store/);
    const document = parse(response.body); configFromHTML(document);
    assert.equal(tags(document, 'h1').length, 1);
    assert.equal(tags(document, 'link').filter(node => node.getAttribute('rel') === 'canonical').length, 0);
    assert.equal(tags(document, 'script').filter(node => node.getAttribute('type') === 'application/ld+json').length, 0);
    assert.match(meta(document, 'robots')[0].getAttribute('content') ?? '', /noindex/);
    for (const path of ['/about//', '/services///', '/ABOUT/', '/%61bout/', '/this-page-does-not-exist/']) {
      assert.equal(getPage(path), undefined, `Client resolver would hydrate unknown path into a public page: ${path}`);
      assert.equal((await app.inject({ url: path, headers: htmlHeaders })).statusCode, 404, path);
    }
    return 'Actual 404 response and initial metadata agree with the current route resolver; browser hydration itself is untested.';
  });
  await check('canonical-redirect-and-attribution', async () => {
    for (const page of ROUTES.filter(page => page.path !== '/')) {
      const response = await app.inject({ url: `${page.path.slice(0, -1)}?utm_source=chatgpt.com&email=private%40example.test`, headers: htmlHeaders });
      assert.equal(response.statusCode, 308); assert.equal(response.headers.location, `${page.path}?utm_source=chatgpt.com`);
      assert.equal(getPage(page.path.slice(0, -1))?.path, page.path);
    }
    const duplicate = await app.inject('/about?utm_source=chatgpt.com&utm_source=claude.ai');
    assert.equal(duplicate.headers.location, '/about/');
    return 'Each known slash alias redirects once; only the finite unique source label is preserved.';
  });
  await check('robots-sitemap-and-page-mode-agree', async () => {
    assert(config, 'No valid built public configuration');
    const robots = await app.inject('/robots.txt'), sitemap = await app.inject('/sitemap.xml');
    assert.equal(robots.statusCode, 200); assert.equal(sitemap.statusCode, 200);
    assert.equal(robots.body, robotsTxt(config)); assert.equal(sitemap.body, sitemapXml(config));
    return { deployment: config.deployment, sitemapEntries: (sitemap.body.match(/<loc>/g) ?? []).length, crawlerPolicy: config.crawlerPolicy };
  });
  await check('every-built-asset-is-served-with-exact-bytes-and-mime', async () => {
    const types: Record<string, RegExp> = { '.js': /(?:java|ecma)script/, '.mjs': /(?:java|ecma)script/, '.css': /text\/css/, '.svg': /image\/svg\+xml/, '.png': /image\/png/, '.wasm': /application\/wasm/, '.riv': /application\/octet-stream/, '.json': /application\/json/, '.txt': /text\/plain/, '.xml': /(?:application|text)\/xml/ };
    const assets = snapshot.filter(file => !file.path.endsWith('.html'));
    for (const file of assets) {
      const url = '/' + relative(output, resolve(root, file.path));
      const response = await app.inject(url); assert.equal(response.statusCode, 200, url);
      assert.equal(sha(response.rawPayload), file.sha256, `HTTP bytes differ from built artifact: ${url}`);
      const type = types[extname(url)]; if (type) assert.match(String(response.headers['content-type']), type, url);
      if (url.startsWith('/assets/')) assert.match(String(response.headers['cache-control']), /immutable/, url);
    }
    return { assets: assets.length, nativeRiveFiles: assets.filter(file => file.path.endsWith('.riv')).length };
  });
  await check('public-artifact-boundary-and-private-path-denial', async () => {
    for (const file of snapshot) {
      const url = relative(output, resolve(root, file.path));
      assert.doesNotMatch(url, /(?:^|\/)(?:private|standards|docs|src|node_modules|native)(?:\/|$)|\.map$|(?:^|\/)\./);
      if (/\.(?:html|js|css|json|txt|xml|svg)$/.test(url)) assert.doesNotMatch(await readFile(resolve(root, file.path), 'utf8'), /2026\.09\.09-d26|2026\.09\.12-g40|PRIVATE_NOT_WEB_CONTENT|SEO-AIO-Library\.txt|Graph-Expansion\.txt|approvedPaths|claimRefs/);
      if (url.endsWith('.js')) assert.doesNotMatch(await readFile(resolve(root, file.path), 'utf8'), /BING_KEY|OPENAI_API_KEY|GEMINI_API_KEY|TSC_DISCOVERY_NODE|TSC_GSC_SERVICE_ACCOUNT|api\.openai\.com\/v1\/responses|api\.mistral\.ai\/v1\/conversations/, 'Private provider implementations must not reach the browser');
    }
    for (const url of ['/private/standards/SEO-AIO-Library.txt', '/docs/standards/coverage-ledger.json', '/native/reports/native-canvas.json', '/src/App.tsx', '/package.json', '/.env', '/assets/main.js.map', '/%2e%2e/private/truth/export.json']) {
      const response = await app.inject({ url, headers: htmlHeaders }); assert.equal(response.statusCode, 404, url);
    }
    return 'No forbidden path or selected private-source/provenance markers found; targeted leak checks are not a universal secret scanner.';
  });
  await check('actual-build-form-and-api-failure-integration', async () => {
    const headers = { origin: SITE_ORIGIN, 'content-type': 'application/json', accept: 'application/json' };
    const payload = { name: 'Synthetic Review', email: 'review@example.test', business: 'Synthetic Build Check', website: '', projectType: 'design', message: 'This is synthetic local build verification.', consent: true, companyWebsite: '', submissionId: '00000000-0000-4000-8000-000000000000' };
    const unavailable = await app.inject({ method: 'POST', url: '/api/demo', headers, payload });
    assert.equal(unavailable.statusCode, 503); assert.equal(unavailable.json().ok, false); assert.equal(unavailable.json().code, 'service_unavailable');
    assert.match(String(unavailable.headers['cache-control']), /no-store/);
    const invalid = await app.inject({ method: 'POST', url: '/api/demo', headers, payload: { ...payload, email: 'invalid' } });
    assert.equal(invalid.statusCode, 400); assert.equal(invalid.json().ok, false);
    const hostile = await app.inject({ method: 'POST', url: '/api/demo', headers: { ...headers, origin: 'https://unrelated.example.test' }, payload });
    assert.equal(hostile.statusCode, 403);
    const native = await app.inject({ method: 'POST', url: '/api/demo', headers: { origin: SITE_ORIGIN, 'content-type': 'application/x-www-form-urlencoded', accept: 'text/html' }, payload: new URLSearchParams(Object.entries(payload).map(([key, value]) => [key, String(value)])).toString() });
    assert.equal(native.statusCode, 503); assert.match(String(native.headers['content-type']), /text\/html/); assert.doesNotMatch(native.body, /review@example\.test|Synthetic Build Check/);
    const ready = await app.inject('/api/ready'); assert.equal(ready.statusCode, 503); assert.equal(ready.json().checks.site, 'available'); assert.equal(ready.json().delivery, 'not_checked');
    const csp = String(unavailable.headers['content-security-policy']); assert.match(csp, /form-action 'self'/); assert.match(csp, /wasm-unsafe-eval/); assert.doesNotMatch(csp, /(?:^|\s)'unsafe-eval'/);
    return { syntheticOnly: true, mailTransportConfigured: false, emailSends: 0, readinessIsDeliveryProof: false };
  });
  await check('built-output-unchanged-during-check', async () => {
    assert.deepEqual(await walk(output), files);
    for (const file of snapshot) assert.equal(sha(await readFile(resolve(root, file.path))), file.sha256, `Concurrent build changed ${file.path}`);
    return { files: snapshot.length };
  });
} finally { await app.close(); }
const report = {
  schemaVersion: 1, visibility: 'PRIVATE_NOT_WEB_CONTENT', startedAt, endedAt: new Date().toISOString(),
  command: 'node --import tsx scripts/check-build.ts', environment: { node: process.version, platform: process.platform, arch: process.arch, method: 'Fastify.inject plus non-rendering HTML parser; no sockets, browser, DNS or mail transport' },
  status: checks.some(check => check.status === 'FAIL') ? 'FAIL' : 'PASS', passed: checks.filter(check => check.status === 'PASS').length, failed: checks.filter(check => check.status === 'FAIL').length,
  limitations: ['No actual browser hydration, JavaScript execution, layout, WebGL, keyboard or accessibility-conformance proof.', 'No live email send, mailbox receipt, production identity, account data, DNS/TLS, public indexing or field-performance observation.', 'Public-source marker checks are targeted artifact-boundary evidence, not a claim that arbitrary secrets cannot exist.'],
  checks, publicBuild: snapshot,
};
await mkdir(resolve(root, 'docs/standards'), { recursive: true });
await writeFile(resolve(root, 'docs/standards/build-integration.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ status: report.status, passed: report.passed, failed: report.failed, publicFiles: snapshot.length, report: 'docs/standards/build-integration.json', failures: checks.filter(check => check.status === 'FAIL') }));
if (report.failed) process.exitCode = 1;
