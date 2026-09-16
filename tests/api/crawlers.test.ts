import test from 'node:test';
import assert from 'node:assert/strict';
import { createCrawlerVerifier } from '../../apps/api/src/crawlers.js';

const instant = Date.parse('2026-09-13T16:00:00Z');
const dataset = (prefixes: unknown[] = [{ ipv4Prefix: '203.0.113.0/24' }, { ipv6Prefix: '2001:db8:abcd::/48' }]) => new Response(JSON.stringify({ creationTime: '2024-01-03T10:00:00.121331', prefixes }), { headers: { 'content-type': 'application/json' } });

test('each named consumer uses its own verified provider feed, not another model brand', async () => {
  const cases = [
    ['Googlebot', 'https://developers.google.com/static/crawling/ipranges/common-crawlers.json', 'google', 'search'],
    ['bingbot', 'https://www.bing.com/toolbox/bingbot.json', 'microsoft', 'search'],
    ['OAI-SearchBot', 'https://openai.com/searchbot.json', 'openai', 'search'],
    ['GPTBot', 'https://openai.com/gptbot.json', 'openai', 'training'],
    ['ChatGPT-User', 'https://openai.com/chatgpt-user.json', 'openai', 'user-fetch'],
    ['ClaudeBot', 'https://claude.com/crawling/bots.json', 'anthropic', 'training'],
    ['Claude-User', 'https://claude.com/crawling/bots.json', 'anthropic', 'user-fetch'],
    ['Claude-SearchBot', 'https://claude.com/crawling/bots.json', 'anthropic', 'search'],
    ['PerplexityBot', 'https://www.perplexity.ai/perplexitybot.json', 'perplexity', 'search'],
    ['Perplexity-User', 'https://www.perplexity.ai/perplexity-user.json', 'perplexity', 'user-fetch'],
    ['MistralAI-Index', 'https://mistral.ai/mistralai-index-ips.json', 'mistral', 'search'],
    ['MistralAI-User', 'https://mistral.ai/mistralai-user-ips.json', 'mistral', 'user-fetch'],
  ];
  for (const [agent, endpoint, provider, purpose] of cases) {
    const verify = createCrawlerVerifier({ now: () => instant, fetch: async (url, init) => {
      assert.equal(url, endpoint);
      assert.equal(init?.redirect, 'error');
      assert.ok(init?.signal);
      return dataset();
    } });
    const result = await verify(`Mozilla/5.0 (compatible; ${agent}/1.4; +https://example.test/bot)`, '203.0.113.8');
    assert.equal(result?.verification, 'verified', agent);
    assert.equal(result?.provider, provider);
    assert.equal(result?.purpose, purpose);
    assert.equal(result?.datasetCreatedAt, '2024-01-03T10:00:00.121Z');
    assert.equal(result?.datasetFetchedAt, '2026-09-13T16:00:00.000Z');
  }
});

test('a documented training agent without a published IP feed is not authenticated by its name', async () => {
  let calls = 0;
  const verify = createCrawlerVerifier({ now: () => instant, fetch: async () => { calls++; return dataset(); } });
  const result = await verify('MistralAI-Training/1.0', '20.240.160.161');
  assert.equal(result?.agent, 'MistralAI-Training');
  assert.equal(result?.purpose, 'training');
  assert.equal(result?.verification, 'unavailable');
  assert.equal(result?.method, 'no-published-ip-feed');
  assert.equal(calls, 0);
});

test('IPv4, IPv6 and mapped IPv4 are matched against the actual network boundaries', async () => {
  const verify = createCrawlerVerifier({ now: () => instant, fetch: async () => dataset() });
  for (const [ip, expected] of [['203.0.113.0', 'verified'], ['203.0.113.255', 'verified'], ['203.0.114.0', 'ip_mismatch'], ['2001:db8:abcd:ffff::1', 'verified'], ['2001:db8:abce::1', 'ip_mismatch'], ['::ffff:203.0.113.8', 'verified'], ['invalid-ip', 'ip_mismatch']]) {
    assert.equal((await verify('OAI-SearchBot', ip!))?.verification, expected, ip);
  }
});

test('the pinned ChatGPT user feed accepts its observed JSON download MIME without weakening other feeds', async () => {
  for (const [agent, contentType, expected] of [
    ['ChatGPT-User', 'application/octet-stream', 'verified'],
    ['OAI-SearchBot', 'application/octet-stream', 'unavailable'],
    ['ChatGPT-User', 'text/html', 'unavailable'],
  ]) {
    const verify = createCrawlerVerifier({ now: () => instant, fetch: async () => {
      const response = dataset();
      response.headers.set('content-type', contentType!);
      return response;
    } });
    assert.equal((await verify(agent, '203.0.113.8'))?.verification, expected);
  }
});

test('unknown, ambiguous and overlong claims do not trigger verification network requests', async () => {
  let calls = 0;
  const verify = createCrawlerVerifier({ fetch: async () => { calls++; return dataset(); } });
  for (const ua of [undefined, 'Mozilla/5.0', 'NotOAI-SearchBot', 'Google-Extended', 'GrokBot', 'OAI-SearchBot ClaudeBot', 'OAI-SearchBot/' + 'x'.repeat(1100)]) assert.equal(await verify(ua, '203.0.113.8'), undefined);
  assert.equal(calls, 0);
});

test('concurrent requests share a bounded refresh and failed refreshes do not certify stale data', async () => {
  let now = instant, calls = 0, fail = false;
  const verify = createCrawlerVerifier({ now: () => now, fetch: async () => { calls++; if (fail) throw new Error('private provider failure'); return dataset(); } });
  const observations = await Promise.all(Array.from({ length: 20 }, () => verify('Claude-SearchBot', '203.0.113.8')));
  assert.ok(observations.every(result => result?.verification === 'verified'));
  assert.equal(calls, 1);
  now += 24 * 60 * 60 * 1000 + 1; fail = true;
  assert.equal((await verify('Claude-User', '203.0.113.8'))?.verification, 'stale_match');
  assert.equal((await verify('ClaudeBot', '198.51.100.3'))?.verification, 'unavailable');
  assert.equal(calls, 2);
  now += 8 * 24 * 60 * 60 * 1000;
  assert.equal((await verify('ClaudeBot', '203.0.113.8'))?.verification, 'unavailable');
  assert.equal(calls, 3);
});

test('untrusted provider responses cannot create a blanket verified range or redirect a request', async () => {
  const responses = [
    () => new Response('', { status: 302, headers: { location: 'http://127.0.0.1/private' } }),
    () => new Response('<html>Challenge</html>', { headers: { 'content-type': 'text/html' } }),
    () => dataset([]),
    () => dataset([{ ipv4Prefix: '0.0.0.0/0' }]),
    () => dataset([{ ipv6Prefix: '::/0' }]),
    () => dataset([{ ipv4Prefix: '2001:db8::/48' }]),
    () => dataset([{ ipv4Prefix: '203.0.113.0/24', ipv6Prefix: '2001:db8::/48' }]),
    () => new Response('{"creationTime":"2099-01-01T00:00:00Z","prefixes":[{"ipv4Prefix":"203.0.113.0/24"}]}', { headers: { 'content-type': 'application/json' } }),
    () => new Response('x'.repeat(262145), { headers: { 'content-type': 'application/json' } }),
  ];
  for (const response of responses) {
    let calls = 0;
    const verify = createCrawlerVerifier({ now: () => instant, fetch: async () => { calls++; return response(); } });
    for (let attempt = 0; attempt < 3; attempt++) assert.equal((await verify('OAI-SearchBot', '203.0.113.8'))?.verification, 'unavailable');
    assert.equal(calls, 1);
  }
});
