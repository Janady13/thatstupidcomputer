import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router';
import { ContentSections } from '../../apps/web/src/components/PageContent.tsx';
import { getPage } from '../../packages/site/content.ts';
import { renderHead, buildGraph, robotsTxt } from '../../packages/site/search.ts';
import { loadSiteConfig, configFromProjection, validateProjection } from '../../packages/site/truth.ts';
import { projectionFixture, TEST_CRAWLER_POLICY } from './fixture.ts';

test('production emits Google and Bing supported snippet directives without opting out of answers', () => {
  const config = configFromProjection(validateProjection(projectionFixture()), 'production', TEST_CRAWLER_POLICY);
  const html = renderHead(getPage('/services/website-rescue/'), config);
  for (const name of ['googlebot', 'bingbot']) assert.ok(html.includes(`<meta name="${name}" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">`));
  assert.doesNotMatch(html, /noarchive|nocache|nosnippet|citation_title|chatgpt-citation|name="(?:GPTBot|ClaudeBot|Google-Extended)"/);
});

test('provider-specific head tags cannot override preview or missing-page exclusions', () => {
  const preview = loadSiteConfig({ deployment: 'preview' });
  const production = configFromProjection(validateProjection(projectionFixture()), 'production', TEST_CRAWLER_POLICY);
  for (const html of [renderHead(getPage('/'), preview), renderHead(undefined, production)]) {
    for (const name of ['googlebot', 'bingbot']) assert.ok(html.includes(`<meta name="${name}" content="noindex, nofollow">`));
  }
});

test('Mistral discovery is allowed independently of its owner-selected training policy', () => {
  const config = loadSiteConfig({ deployment: 'preview', aiTrainingPolicy: 'allow', mistralTrainingPolicy: 'deny' });
  const robots = robotsTxt(config);
  for (const agent of ['MistralAI-Index', 'MistralAI-User']) assert.ok(robots.includes(`User-agent: ${agent}\nAllow: /\nDisallow: /api/`));
  assert.match(robots, /User-agent: MistralAI-Training\nDisallow: \/\n/);
  assert.match(robots, /User-agent: GPTBot\nAllow: \//);
  const inverse = robotsTxt(loadSiteConfig({ deployment: 'preview', aiTrainingPolicy: 'deny', mistralTrainingPolicy: 'allow' }));
  assert.match(inverse, /User-agent: MistralAI-Training\nAllow: \/\nDisallow: \/api\//);
  assert.throws(() => loadSiteConfig({ deployment: 'preview', mistralTrainingPolicy: 'invalid' }), /MISTRAL_TRAINING_POLICY/);
});

test('a repair answer has the same deep link and text in visible HTML and structured data', () => {
  const page = getPage('/services/website-rescue/')!;
  const html = renderToStaticMarkup(createElement(MemoryRouter, {}, createElement(ContentSections, { sections: page.sections })));
  assert.match(html, /id="repair-or-rebuild"/);
  assert.match(html, /aria-labelledby="repair-or-rebuild-heading"/);
  assert.match(html, /href="#repair-or-rebuild"/);
  const config = configFromProjection(validateProjection(projectionFixture()), 'production', TEST_CRAWLER_POLICY);
  const graph = buildGraph(page, config)!['@graph'];
  const answer = graph.find(node => node['@id'] === 'https://thatstupidcomputer.com/services/website-rescue/#repair-or-rebuild');
  assert.equal(answer?.['@type'], 'WebPageElement');
  assert.equal(answer?.name, 'Can you repair my website without rebuilding it?');
  assert.match(String(answer?.text), /Often, a specific failure can be repaired/);
  assert.ok(html.includes('Often, a specific failure can be repaired'));
  assert.deepEqual(answer?.isPartOf, { '@id': 'https://thatstupidcomputer.com/services/website-rescue/#webpage' });
});
