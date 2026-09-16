import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { DOMParser } from '@xmldom/xmldom';
import { createElement, type ComponentType, type ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import type { PublicSiteConfig } from '../../packages/site/truth.ts';

// Follow the existing geometry SSR convention: bundle actual components in
// memory, with React external. No browser, HTTP server, email, or saved build.
const root = fileURLToPath(new URL('../../', import.meta.url));
const bundle = await build({
  absWorkingDir: root,
  stdin: { contents: `export { render } from './apps/web/src/entry-server.tsx';
    export { DemoCompanion } from './apps/web/src/components/DemoCompanion.tsx';
    export { AnimationProvider } from './apps/web/src/animation/orchestration/AnimationProvider.tsx';`, resolveDir: root, sourcefile: 'demo-ssr-test-entry.ts' },
  bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external',
  jsx: 'automatic', loader: { '.css': 'empty' }, logLevel: 'silent',
});
type CompanionStatus = 'idle' | 'pending' | 'accepted' | 'error';
type Renderer = {
  render(path: string, config: PublicSiteConfig): string;
  DemoCompanion: ComponentType<{ status: CompanionStatus; intent: null }>;
  AnimationProvider: ComponentType<{ children?: ReactNode }>;
};
const serverModule = { exports: {} as Renderer };
new Function('require', 'module', 'exports', bundle.outputFiles[0].text)(createRequire(import.meta.url), serverModule, serverModule.exports);
const renderer = serverModule.exports;
// An explicit public fixture avoids reading an operator's .env or truth export.
const config: PublicSiteConfig = {
  deployment: 'preview', canonicalOrigin: 'https://thatstupidcomputer.com',
  siteName: 'That Stupid Computer', websiteId: 'https://thatstupidcomputer.com/#website',
  contact: {}, crawlerPolicy: { training: 'deny', googleExtended: 'deny', source: 'preview-default' },
  truthStatus: 'unavailable-preview',
};
function parse(markup: string) {
  return new DOMParser().parseFromString(`<html xmlns="http://www.w3.org/1999/xhtml"><body>${markup}</body></html>`, 'application/xhtml+xml');
}
function elements(markup: string, tag: string) { return Array.from(parse(markup).getElementsByTagName(tag)); }
function byId(markup: string, id: string) {
  const element = elements(markup, '*').find(node => node.getAttribute('id') === id);
  assert.ok(element, `Expected server-rendered #${id}`);
  return element;
}
function htmlAttribute(element: ReturnType<typeof byId>, name: string) {
  // HTML attribute names are insensitive to case; the XML inspection tree is not.
  return Array.from(element.attributes).find(attribute => attribute.name.toLowerCase() === name.toLowerCase())?.value ?? null;
}

test('home SSR includes ordinary demo CTAs and three native intent links before JavaScript', () => {
  const markup = renderer.render('/', config);
  const links = elements(markup, 'a');
  const hero = links.find(node => node.getAttribute('class')?.split(' ').includes('hero-demo'));
  assert.ok(hero);
  assert.equal(hero.getAttribute('href'), '/contact/');
  assert.equal(hero.textContent?.trim(), 'Get my demo');
  assert.equal(hero.hasAttribute('aria-hidden'), false);
  const intentLabels = { design: 'I need a new website', rescue: 'My website needs rescuing', search: 'Help customers find me' };
  for (const [project, label] of Object.entries(intentLabels)) {
    const link = links.find(node => node.getAttribute('class')?.split(' ').includes('computer-intent') && node.getAttribute('aria-label') === label);
    assert.ok(link, label);
    assert.equal(link.getAttribute('href'), `/contact/?project=${project}&from=computer#demo-request`);
    assert.equal(link.hasAttribute('aria-hidden'), false);
    assert.equal(link.getElementsByTagName('strong')[0]?.textContent, label, 'The visible key label matches its accessible name.');
  }
  // The caption and tactile keys remain ordinary initial HTML, not a hidden chat panel.
  const voice = elements(markup, 'div').find(node => node.getAttribute('class')?.split(' ').includes('computer-voice'));
  assert.ok(voice);
  assert.match(voice.getElementsByTagName('p')[0].textContent || '', /I have a few ideas for your website/);
  assert.equal(elements(markup, 'details').some(node => node.getAttribute('class') === 'computer-chat'), false);
  assert.doesNotMatch(markup, /The server did not finish this Suspense boundary|<canvas\b/);
});

test('contact SSR is identical across intent queries and never reflects raw or private query text', () => {
  const baseline = renderer.render('/contact/', config);
  const privateText = 'synthetic.person@example.invalid';
  const injected = '<img src=x onerror=alert(1)>';
  const queries = [
    '?project=design&from=computer', '?project=rescue&from=computer', '?project=search&from=computer',
    `?project=rescue&from=computer&email=${encodeURIComponent(privateText)}&message=${encodeURIComponent(injected)}`,
    `?project=${encodeURIComponent(privateText)}&from=computer`,
    '?project=design&project=rescue&from=computer',
    '?status=accepted&ok=true&message=QUERY_CANNOT_CONFIRM_DELIVERY',
    '?status=error&message=QUERY_CANNOT_INJECT_AN_ERROR',
  ];
  for (const query of queries) {
    const markup = renderer.render(`/contact/${query}#demo-request`, config);
    assert.equal(markup, baseline, `Initial server markup changed for ${query}`);
    for (const sentinel of [privateText, encodeURIComponent(privateText), injected, 'QUERY_CANNOT_CONFIRM_DELIVERY', 'QUERY_CANNOT_INJECT_AN_ERROR']) assert.equal(markup.includes(sentinel), false);
  }
  // Equality checks the first-render contract, not actual browser hydration.
  assert.doesNotMatch(baseline, /The server did not finish this Suspense boundary/);
});

test('the initial form retains native constraints, empty fields and a quiet feedback region', () => {
  const markup = renderer.render('/contact/?project=rescue&from=computer', config);
  const form = byId(markup, 'demo-request');
  assert.equal(form.tagName, 'form');
  assert.equal(form.getAttribute('action'), '/api/demo');
  assert.equal(form.getAttribute('method'), 'post');
  assert.equal(form.getAttribute('aria-label'), 'Request your website demo');
  assert.equal(form.getAttribute('aria-busy'), 'false');
  assert.equal(form.hasAttribute('novalidate'), false);
  const labels = elements(markup, 'label');
  for (const field of ['name', 'email', 'business', 'message', 'consent']) {
    const input = byId(markup, `demo-${field}`);
    assert.ok(labels.some(label => label.getAttribute('for') === `demo-${field}`), `${field} has a native label`);
    assert.equal(input.hasAttribute('required'), true, field);
    assert.equal(input.getAttribute('aria-invalid'), 'false', field);
    if (field === 'message') assert.equal(input.textContent, '');
    else if (field === 'consent') assert.equal(input.hasAttribute('checked'), false);
    else assert.equal(input.getAttribute('value'), '', field);
  }
  assert.equal(byId(markup, 'demo-email').getAttribute('type'), 'email');
  assert.equal(htmlAttribute(byId(markup, 'demo-website'), 'maxlength'), '300');
  assert.equal(htmlAttribute(byId(markup, 'demo-message'), 'maxlength'), '4000');
  const selected = Array.from(byId(markup, 'demo-projectType').getElementsByTagName('option')).filter(option => option.hasAttribute('selected'));
  assert.deepEqual(selected.map(option => option.getAttribute('value')), ['unsure']);
  const feedback = elements(markup, 'div').find(node => node.getAttribute('class')?.split(' ').includes('form-feedback'));
  assert.ok(feedback);
  assert.equal(feedback.getAttribute('role'), 'status');
  assert.equal(feedback.getAttribute('aria-live'), 'polite');
  assert.equal(feedback.getAttribute('tabindex'), '-1');
  assert.equal(feedback.textContent, '');
  const submit = elements(markup, 'button').find(node => node.getAttribute('type') === 'submit');
  assert.ok(submit);
  assert.equal(submit.textContent?.trim(), 'Get my demo');
  assert.equal(submit.hasAttribute('disabled'), false);
  assert.equal(elements(markup, '*').some(node => node.getAttribute('role') === 'alert'), false);
  assert.doesNotMatch(markup, /class="form-accepted"|Message accepted\.|accepted for sending/);
});

test('the actual companion renders distinct pending, accepted and error messages without changing form status', () => {
  const expected: Record<CompanionStatus, string> = {
    idle: 'Tell me about your business. The human handles the clever part.',
    pending: 'I’m keeping an eye on your request.',
    accepted: 'A good first step. Even I’m impressed.',
    error: 'Your details are still here. Let’s check what happened below.',
  };
  for (const status of Object.keys(expected) as CompanionStatus[]) {
    const markup = renderToString(createElement(renderer.AnimationProvider, null, createElement(renderer.DemoCompanion, { status, intent: null })));
    const aside = elements(markup, 'aside')[0];
    assert.equal(aside.getAttribute('aria-label'), 'A note from the computer');
    assert.ok(aside.textContent?.includes(expected[status]));
    for (const other of Object.keys(expected) as CompanionStatus[]) if (other !== status) assert.equal(aside.textContent?.includes(expected[other]), false);
    assert.doesNotMatch(markup, /<form\b|class="form-accepted"|role="alert"|<canvas\b|data-computer-art=/);
  }
  // Submit/failure transitions and focus require the separately authored browser
  // tests. This Node test does not claim those unexecuted interactions passed.
});
