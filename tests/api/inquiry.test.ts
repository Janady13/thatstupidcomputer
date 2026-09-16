import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { DOMParser } from '@xmldom/xmldom';
import { createApp } from '../../apps/api/src/app.js';
import { demoIntentHref, parseDemoIntent } from '../../apps/web/src/components/demo-intent.mjs';
import type { PublicSiteConfig } from '../../packages/site/truth.ts';

// Execute the actual SSR entry in memory, without a saved build or browser.
const root = fileURLToPath(new URL('../../', import.meta.url));
const bundle = await build({
  absWorkingDir: root, entryPoints: ['apps/web/src/entry-server.tsx'],
  bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external',
  jsx: 'automatic', loader: { '.css': 'empty' }, logLevel: 'silent',
});
const serverModule = { exports: {} as { render(path: string, config: PublicSiteConfig): string } };
new Function('require', 'module', 'exports', bundle.outputFiles[0].text)(createRequire(import.meta.url), serverModule, serverModule.exports);
const origin = 'https://thatstupidcomputer.com';
const config: PublicSiteConfig = {
  deployment: 'preview', canonicalOrigin: origin, siteName: 'That Stupid Computer',
  websiteId: `${origin}/#website`, contact: {}, truthStatus: 'unavailable-preview',
  crawlerPolicy: { training: 'deny', googleExtended: 'deny', source: 'preview-default' },
};
function elements(markup: string, tag: string) {
  const document = markup.startsWith('<!doctype html>') ? markup : `<html><body>${markup}</body></html>`;
  return Array.from(new DOMParser().parseFromString(document, 'text/html').getElementsByTagName(tag));
}

test('native success and failure return links resolve to the actual SSR request form without JavaScript', async t => {
  const staticRoot = await mkdtemp(join(tmpdir(), 'tsc-inquiry-test-'));
  t.after(() => rm(staticRoot, { recursive: true, force: true }));
  await mkdir(join(staticRoot, 'contact'));
  const markup = serverModule.exports.render('/contact/', config);
  await writeFile(join(staticRoot, 'contact/index.html'), `<!doctype html><html><body>${markup}</body></html>`);
  const app = await createApp({
    staticRoot, logger: false,
    env: { NODE_ENV: 'production', PUBLIC_ORIGIN: origin, SMTP_HOST: 'smtp.example.test', SMTP_PORT: '587', SMTP_SECURE: 'false', SMTP_USER: 'synthetic-user', SMTP_PASS: 'synthetic-secret', SMTP_FROM: 'sender@example.test', SMTP_TO: 'owner@example.test' },
    mailTransport: { async sendMail() { return { accepted: ['owner@example.test'], rejected: [] }; } },
  });
  t.after(() => app.close());
  const payload = new URLSearchParams({ name: 'Synthetic Visitor', email: 'visitor@example.test', business: 'Synthetic Business', website: '', projectType: 'rescue', message: 'Synthetic website rescue inquiry.', consent: 'on', companyWebsite: '', submissionId: '' });
  for (const [email, expectedStatus] of [['visitor@example.test', 200], ['invalid-email', 400]] as const) {
    payload.set('email', email);
    const response = await app.inject({ method: 'POST', url: '/api/demo', headers: { origin, accept: 'text/html', 'content-type': 'application/x-www-form-urlencoded' }, payload: payload.toString() });
    assert.equal(response.statusCode, expectedStatus);
    assert.equal(response.headers['cache-control'], 'no-store');
    const returnLink = elements(response.body, 'a').find(link => link.textContent === 'Return to the request form');
    assert.ok(returnLink);
    const target = new URL(returnLink.getAttribute('href')!, origin);
    assert.equal(target.origin, origin);
    assert.equal(target.pathname, '/contact/');
    assert.notEqual(target.hash, '');
    const page = await app.inject({ url: target.pathname + target.search, headers: { accept: 'text/html' } });
    assert.equal(page.statusCode, 200);
    const form = elements(page.body, 'form').find(node => node.getAttribute('id') === target.hash.slice(1));
    assert.ok(form, `The no-JavaScript return link ${target.pathname}${target.hash} must reach the rendered form`);
    assert.equal(form.getAttribute('action'), '/api/demo');
    assert.equal(form.getAttribute('method'), 'post');
    assert.equal(form.hasAttribute('novalidate'), false);
  }
});

test('computer inquiry links reach an SSR form that offers every finite project choice', () => {
  const markup = serverModule.exports.render('/contact/', config);
  for (const project of ['design', 'rescue', 'search', 'care', 'unsure'] as const) {
    const target = new URL(demoIntentHref(project), origin);
    const form = elements(markup, 'form').find(node => node.getAttribute('id') === target.hash.slice(1));
    assert.ok(form);
    const projectField = Array.from(form.getElementsByTagName('select')).find(node => node.getAttribute('name') === 'projectType');
    assert.ok(projectField);
    assert.ok(Array.from(projectField.getElementsByTagName('option')).some(node => node.getAttribute('value') === project));
    assert.equal(parseDemoIntent(target.search)?.projectType, project);
  }
});
