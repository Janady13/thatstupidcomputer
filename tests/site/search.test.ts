import test from 'node:test';
import assert from 'node:assert/strict';
import { ROUTES, getPage } from '../../packages/site/content.ts';
import { buildGraph, metadataForPage, renderHead, robotsTxt, safeJson, sitemapXml } from '../../packages/site/search.ts';
import { configFromProjection, loadSiteConfig, validateProjection } from '../../packages/site/truth.ts';
import { projectionFixture, TEST_CRAWLER_POLICY } from './fixture.ts';

test('all indexable pages self-canonicalize and have correct stable graph references', () => {
  const config = configFromProjection(validateProjection(projectionFixture()), 'production', TEST_CRAWLER_POLICY);
  for (const page of ROUTES) {
    const canonical = `${config.canonicalOrigin}${page.path}`;
    const meta = metadataForPage(page, config);
    assert.equal(meta.canonical, canonical);
    assert.match(meta.robots, /^index/);
    const graph = buildGraph(page, config)!['@graph'];
    const internal = new Set(graph.map((node) => node['@id']));
    const external = new Set([config.publisher?.id, config.provider?.id, config.brand?.id]);
    function checkRefs(value: unknown): void {
      if (!value || typeof value !== 'object') return;
      const record = value as Record<string, unknown>;
      if (typeof record['@id'] === 'string') assert.ok(internal.has(record['@id']) || external.has(record['@id']), `${page.path}: ${record['@id']}`);
      Object.values(record).forEach(checkRefs);
    }
    checkRefs(graph);
    assert.equal(internal.size, graph.length);
    assert.ok(graph.every((node) => !['Person', 'Organization', 'Brand'].includes(node['@type'])));
    const service = graph.find((node) => node['@type'] === 'Service');
    if (page.service) { assert.equal(service?.description, page.intro); assert.deepEqual(service?.provider, { '@id': config.provider!.id }); }
    const head = renderHead(page, config);
    assert.equal((head.match(/<title>/g) ?? []).length, 1);
    assert.equal((head.match(/rel="canonical"/g) ?? []).length, 1);
    assert.doesNotMatch(head, /sameAs|AggregateRating|LocalBusiness|FAQPage|SearchAction/);
  }
});
test('preview remains noindex and unknown pages never masquerade as the homepage', () => {
  const config = loadSiteConfig({ deployment: 'preview' });
  assert.match(metadataForPage(getPage('/'), config).robots, /^noindex/);
  assert.equal(metadataForPage(undefined, config).canonical, undefined);
  assert.equal(buildGraph(undefined, config), undefined);
  assert.match(renderHead(undefined, config), /Page not found/);
  assert.doesNotMatch(renderHead(undefined, config), /rel="canonical"/);
  for (const path of ['/about//', '/services///', '/%61bout/']) {
    const unknown = getPage(path);
    assert.equal(unknown, undefined);
    assert.doesNotMatch(renderHead(unknown, config), /rel="canonical"|site-structured-data/);
    assert.match(renderHead(unknown, config), /Page not found/);
  }
  assert.doesNotMatch(sitemapXml(config), /<loc>/);
  assert.doesNotMatch(robotsTxt(config), /Sitemap:/);
});
test('production sitemap includes only the canonical route inventory and no invented freshness', () => {
  const config = configFromProjection(validateProjection(projectionFixture()), 'production', TEST_CRAWLER_POLICY);
  const xml = sitemapXml(config);
  assert.equal((xml.match(/<loc>/g) ?? []).length, ROUTES.length);
  for (const page of ROUTES) assert.ok(xml.includes(`<loc>${config.canonicalOrigin}${page.path}</loc>`));
  assert.doesNotMatch(xml, /lastmod|changefreq|priority|private|api/);
  const robots = robotsTxt(config);
  assert.match(robots, /User-agent: OAI-SearchBot\nAllow: \/\nDisallow: \/api\//);
  assert.match(robots, /User-agent: GPTBot\nDisallow: \//);
  assert.match(robots, /User-agent: Google-Extended\nDisallow: \//);
});
test('metadata and JSON-LD embedding escape HTML boundaries', () => {
  const config = loadSiteConfig({ deployment: 'preview' });
  const page = { ...ROUTES[0]!, title: 'A & B </title><script>alert(1)</script>', description: '" < > &' };
  const head = renderHead(page, config);
  assert.doesNotMatch(head, /<script>alert/);
  assert.match(head, /&amp;/);
  const input = { text: '</script><script>alert(1)</script>\u2028&' };
  const output = safeJson(input);
  assert.doesNotMatch(output, /<|>|&/);
  assert.deepEqual(JSON.parse(output), input);
});
test('configured model-use decisions remain independent and preserve utility exclusions when allowed', () => {
  const config = configFromProjection(validateProjection(projectionFixture()), 'production', { training: 'deny', googleExtended: 'allow', source: 'deployment-config' });
  let robots = robotsTxt(config);
  assert.match(robots, /User-agent: GPTBot\nDisallow: \//);
  assert.match(robots, /User-agent: ClaudeBot\nDisallow: \//);
  assert.match(robots, /User-agent: Google-Extended\nAllow: \/\nDisallow: \/api\//);
  config.crawlerPolicy = { training: 'allow', googleExtended: 'deny', source: 'deployment-config' };
  robots = robotsTxt(config);
  assert.match(robots, /User-agent: GPTBot\nAllow: \/\nDisallow: \/api\//);
  assert.match(robots, /User-agent: ClaudeBot\nAllow: \/\nDisallow: \/api\//);
  assert.match(robots, /User-agent: Google-Extended\nDisallow: \//);
  config.crawlerPolicy.source = 'preview-default';
  assert.throws(() => robotsTxt(config), /explicitly configured/);
});
test('ownership metadata is emitted only for actually configured public tokens', () => {
  const configured = loadSiteConfig({ deployment: 'preview', googleSiteVerification: 'google_safe-token-123', bingSiteVerification: 'ABCDEF1234567890' });
  const head = renderHead(getPage('/'), configured);
  assert.match(head, /name="google-site-verification" content="google_safe-token-123"/);
  assert.match(head, /name="msvalidate.01" content="ABCDEF1234567890"/);
  const noVerification = { ...configured, verification: undefined };
  assert.doesNotMatch(renderHead(getPage('/'), noVerification), /google-site-verification|msvalidate.01/);
});

test('OpenAI and Anthropic training choices can differ without changing discovery or Google grounding', () => {
  const config = loadSiteConfig({ deployment: 'preview', aiTrainingPolicy: 'deny', googleExtendedPolicy: 'deny', openaiTrainingPolicy: 'allow', anthropicTrainingPolicy: 'deny' });
  const robots = robotsTxt(config);
  assert.match(robots, /User-agent: GPTBot\nAllow: \/\nDisallow: \/api\//);
  assert.match(robots, /User-agent: ClaudeBot\nDisallow: \//);
  assert.match(robots, /User-agent: Google-Extended\nDisallow: \//);
  for (const agent of ['OAI-SearchBot', 'Claude-SearchBot', 'PerplexityBot', 'ChatGPT-User', 'Claude-User', 'Perplexity-User']) {
    assert.ok(robots.includes(`User-agent: ${agent}\nAllow: /\nDisallow: /api/`));
  }
  const opposite = robotsTxt(loadSiteConfig({ deployment: 'preview', aiTrainingPolicy: 'allow', googleExtendedPolicy: 'allow', openaiTrainingPolicy: 'deny', anthropicTrainingPolicy: 'allow' }));
  assert.match(opposite, /User-agent: GPTBot\nDisallow: \//);
  assert.match(opposite, /User-agent: ClaudeBot\nAllow: \/\nDisallow: \/api\//);
});

test('invalid provider overrides fail closed even when the legacy policy is valid', () => {
  assert.throws(() => loadSiteConfig({ deployment: 'preview', aiTrainingPolicy: 'allow', openaiTrainingPolicy: 'sometimes' }), /OPENAI_TRAINING_POLICY/);
  assert.throws(() => loadSiteConfig({ deployment: 'preview', aiTrainingPolicy: 'allow', anthropicTrainingPolicy: 'sometimes' }), /ANTHROPIC_TRAINING_POLICY/);
});
