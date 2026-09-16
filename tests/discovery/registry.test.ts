import test from 'node:test';
import assert from 'node:assert/strict';
import {PROVIDERS,CRAWLER_AGENTS,CRAWLER_FEEDS} from '../../packages/discovery/registry.ts';
import {answerCatalog} from '../../packages/discovery/answers.ts';
import {getPage} from '../../packages/site/content.ts';
import {buildSync} from 'esbuild';
import {fileURLToPath} from 'node:url';
test('one registry assembles distinct provider contracts with real documentation and no invented crawlers',()=>{
  assert.deepEqual(Object.keys(PROVIDERS),['bing','google','openai','anthropic','perplexity','xai','mistral','deepseek']);
  for(const profile of Object.values(PROVIDERS)) {
    assert.ok(profile.sources.length>0);
    assert.equal(profile.reviewedAt,'2026-09-13');
    assert.ok(profile.answerPaths.length>0);
  }
  for(const agent of CRAWLER_AGENTS) if (agent.feed !== null) assert.ok(CRAWLER_FEEDS[agent.feed]);
  assert.equal(new Set(CRAWLER_AGENTS.map(x=>x.agent)).size, CRAWLER_AGENTS.length);
  assert.ok(!CRAWLER_AGENTS.some(x=>/Grok|Google-Extended|DeepSeek/.test(x.agent)));
});
test('provider answer catalog consumes actual site copy without duplicating entity facts or inventing model results',()=>{
  for(const provider of Object.keys(PROVIDERS) as Array<keyof typeof PROVIDERS>) {
    const catalog=answerCatalog(provider);
    assert.equal(catalog.language,'en');
    assert.equal(catalog.status,'source-content-not-observed-model-answer');
    for(const page of catalog.pages) {
      assert.equal(page.intro,getPage(page.path)?.intro);
      assert.ok(page.sections.length>0);
      assert.equal(page.canonical,'https://thatstupidcomputer.com'+page.path);
    }
  }
  assert.notEqual(PROVIDERS.google.observationFormat,PROVIDERS.anthropic.observationFormat);
});
test('public policy consumers do not bundle private API request or citation-parser implementations',()=>{
  for (const treeShaking of [true, false]) {
    const result=buildSync({stdin:{contents:'import {ROBOTS_POLICIES} from "./packages/discovery/registry.ts";globalThis.policies=ROBOTS_POLICIES;',resolveDir:fileURLToPath(new URL('../..',import.meta.url)),loader:'ts'},bundle:true,write:false,metafile:true,platform:'browser',format:'esm',treeShaking});
    assert.doesNotMatch(result.outputFiles[0].text,/api\.openai\.com\/v1\/responses|api\.mistral\.ai\/v1\/conversations|start_index|max_output_tokens/);
    assert.ok(Object.keys(result.metafile.inputs).every(path => !/\/(?:answers|protocol|http)\.ts$/.test(path)), 'Private integrations must not enter the public dependency graph, even if an optimizer removes them');
  }
});
