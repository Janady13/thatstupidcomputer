import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUTES, SERVICE_PAGES, getPage } from '../../packages/site/content.ts';
import { breadcrumbsForPage } from '../../packages/site/search.ts';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ContentSections } from '../../apps/web/src/components/PageContent.tsx';

test('the 11 distinct route contracts have unique metadata and useful content', () => {
  assert.equal(ROUTES.length, 11);
  for (const key of ['path', 'title', 'description', 'purpose'] as const) assert.equal(new Set(ROUTES.map((page) => page[key])).size, ROUTES.length);
  assert.equal(SERVICE_PAGES.length, 4);
  for (const page of ROUTES) {
    assert.ok(page.heading && page.intro && page.sections.length >= 3, page.path);
    assert.ok(page.sections.every((section) => section.heading && (section.paragraphs?.length || section.items?.length)), page.path);
    assert.equal(getPage(page.path), page);
  }
  assert.equal(getPage('/not-a-real-page/'), undefined);
});
test('every internal destination resolves and every public page has an incoming link', () => {
  const incoming = new Set<string>(['/']);
  for (const page of ROUTES) {
    const destinations = [...page.relatedPaths, page.cta.href, ...page.sections.flatMap((section) => (section.links ?? []).map((link) => link.href))];
    for (const path of destinations) {
      assert.ok(getPage(path), `${page.path} -> ${path}`);
      if (path !== page.path) incoming.add(path);
    }
    const crumbs = breadcrumbsForPage(page);
    assert.equal(crumbs[0]?.path, '/');
    assert.equal(crumbs.at(-1)?.path, page.path);
    if (page.service) assert.deepEqual(crumbs.map((crumb) => crumb.path), ['/', '/services/', page.path]);
  }
  assert.equal(incoming.size, ROUTES.length);
});
test('route lookup accepts only canonical paths and the explicit missing-slash aliases', () => {
  for (const page of ROUTES) {
    assert.equal(getPage(page.path), page);
    if (page.path !== '/') assert.equal(getPage(page.path.slice(0, -1)), page);
  }
  for (const path of ['/about//', '/about////', '/services///', '//', '', '/%61bout/', '/about%2f', '/services//website-design/', '/About/', '/about/?source=test']) {
    assert.equal(getPage(path), undefined, path);
  }
});

test('supporting references are ordinary visible links in initial HTML, not interaction-only metadata', () => {
  const html = renderToStaticMarkup(createElement(ContentSections, { sections: [{ heading: 'Search access', paragraphs: ['A supported public answer.'], sources: [{ label: 'OpenAI crawler documentation', href: 'https://developers.openai.com/api/docs/bots' }] }] }));
  assert.match(html, /href="https:\/\/developers\.openai\.com\/api\/docs\/bots"/);
  assert.match(html, />OpenAI crawler documentation</);
  assert.match(html, /A supported public answer\./);
});
