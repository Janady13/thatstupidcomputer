import test from 'node:test';
import assert from 'node:assert/strict';
import { BingWebmaster } from '../../packages/discovery/providers/bing/webmaster.ts';
import { truthBacklinks, reconcileBacklinks } from '../../packages/discovery/providers/bing/backlinks.ts';
import { collectBing } from '../../packages/discovery/providers/bing/collect.ts';

const site = 'https://thatstupidcomputer.com/';
const reply = (d: unknown) => new Response(JSON.stringify({d}), {headers:{'content-type':'application/json'}});
test('Bing REST client follows zero-based pagination and retains native counts separately', async () => {
  const calls: URL[] = [];
  const client = new BingWebmaster({key:'fixture-secret',sites:[site],fetch:async (input) => {
    const url = new URL(String(input)); calls.push(url);
    assert.equal(url.origin, 'https://ssl.bing.com');
    assert.equal(url.searchParams.get('apikey'), 'fixture-secret');
    const page = Number(url.searchParams.get('page'));
    return reply({Links:[{Url:site+(page?'services/':''),Count:page+4}],TotalPages:2});
  }});
  const result = await client.linkCounts(site);
  assert.equal(result.coverage, 'complete-api-sample');
  assert.equal(result.records.length,2);
  assert.deepEqual(calls.map(x=>x.searchParams.get('page')),['0','1']);
  assert.doesNotMatch(JSON.stringify(result), /fixture-secret/);
});
test('empty Bing sample is not an exhaustive absence claim', async () => {
  const client = new BingWebmaster({key:'fixture',sites:[site],fetch:async()=>reply({Details:[],TotalPages:0})});
  const sample = await client.urlLinks(site,site);
  const expected = [{source:'https://dev.to/example/article',target:site,kind:'contextual',provenance:'works.articles[0].backlink',checkedAt:null}];
  const result = reconcileBacklinks(expected,[{target:site,sample}]);
  assert.equal(result[0].state,'not-observed-in-api-sample');
  assert.equal(sample.coverage,'complete-api-sample');
});
test('pagination failures, changes, repetition and caps cannot masquerade as complete', async () => {
  for (const mode of ['failure','drift','repeated','cap']) {
    let count=0;
    const client = new BingWebmaster({key:'fixture',sites:[site],maxPages:mode==='cap'?1:4,fetch:async()=>{
      count++;
      if(mode==='failure' && count===2) return new Response('{"Message":"fixture-secret"}',{status:429});
      return reply({Links:[{Url:site+(mode==='repeated'?'same':count),Count:2}],TotalPages:mode==='drift'&&count===2?3:2});
    }});
    const result=await client.linkCounts(site);
    assert.equal(result.coverage,'partial',mode);
    assert.ok(result.reason);
    assert.doesNotMatch(JSON.stringify(result),/fixture-secret/);
  }
});
test('Bing rejects unscoped URLs before sending a request and sanitizes remote failures',async()=>{
  let calls=0;
  const client=new BingWebmaster({key:'fixture-secret',sites:[site],fetch:async()=>{calls++;throw new Error('https://example/?apikey=fixture-secret');}});
  await assert.rejects(()=>client.urlLinks(site,'https://another.example/'),/scope/);
  assert.equal(calls,0);
  assert.equal((await client.linkCounts(site)).coverage,'unavailable');
  assert.doesNotMatch(JSON.stringify(await client.linkCounts(site)),/fixture-secret/);
});
test('malformed or oversized payload is unavailable, and verification secrets are projected out',async()=>{
  const client=new BingWebmaster({key:'fixture',sites:[site],fetch:async()=>reply([{Url:site,IsVerified:true,AuthenticationCode:'do-not-store',DnsVerificationCode:'secret'}])});
  const sites=await client.sites();
  assert.equal(sites.status,'ok');
  assert.deepEqual(sites.data,[{url:site,verified:true}]);
  assert.doesNotMatch(JSON.stringify(sites),/do-not-store|secret/);
  const invalid=new BingWebmaster({key:'fixture',sites:[site],fetch:async()=>reply({Links:[],TotalPages:-1})});
  assert.equal((await invalid.linkCounts(site)).coverage,'unavailable');
  const large=new BingWebmaster({key:'fixture',sites:[site],fetch:async()=>new Response('x'.repeat(2_100_000),{headers:{'content-type':'application/json'}})});
  assert.equal((await large.linkCounts(site)).coverage,'unavailable');
});
test('unified node relations preserve target scope and do not turn canonicals, sameAs or planned links into backlinks',()=>{
  const node={org:{sameAs:['https://profile.example/']},works:{articles:[
    {url:'https://dev.to/a',backlink:{type:'contextual',target:site,checked:'2026-09-13'}},
    {url:'https://dev.to/b',backlink:{type:'canonical',target:site}},
    {url:'https://dev.to/c',backlink:{type:'contextual',target:'https://thatdeveloperguy.com/'}},
    {url:'https://dev.to/d',backlink:{type:'contextual',target:site,status:'PENDING'}},
  ]}};
  const expectations=truthBacklinks(node,[site]);
  assert.equal(expectations.length,2);
  assert.equal(expectations[1].kind,'canonical');
  const results=reconcileBacklinks(expectations,[{target:site,sample:{coverage:'complete-api-sample',records:[{Url:'https://dev.to/a',AnchorText:'Article'}],pagesRead:1,totalPages:1}}]);
  assert.equal(results[0].state,'observed-in-bing');
  assert.equal(results[1].state,'canonical-relation-not-backlink');
});
test('collector verifies property access first, queries each relevant target, and labels native metric coverage',async()=>{
  const calls:string[]=[];
  const client=new BingWebmaster({key:'fixture',sites:[site],fetch:async(input)=>{
    const url=new URL(String(input)); const method=url.pathname.split('/').at(-1)!;calls.push(method);
    if(method==='GetUserSites') return reply([{Url:site,IsVerified:true}]);
    if(method==='GetLinkCounts') return reply({Links:[],TotalPages:0});
    if(method==='GetUrlLinks') return reply({Details:[],TotalPages:0});
    if(method==='GetUrlInfo') return reply({Url:site,AnchorCount:12,HttpStatus:0,IsPage:true});
    if(method==='GetUrlSubmissionQuota') return reply({DailyQuota:100,MonthlyQuota:1000});
    return reply([]);
  }});
  const result=await collectBing(client,[{url:site,role:'website',targets:[site,site+'services/']}],{works:{articles:[]}});
  assert.equal(calls[0],'GetUserSites');
  assert.equal(result.properties[0].backlinks?.targets.length,2);
  assert.equal(result.properties[0].backlinks?.exhaustive,false);
  assert.equal(result.properties[0].aiPerformance.status,'native-report-required');
  assert.ok(JSON.stringify(result).includes('AnchorCount'));
});
test('logical repeated pages in different order are partial and malformed native payloads are unavailable',async()=>{
  let call=0;
  const duplicate=new BingWebmaster({key:'fixture',sites:[site],fetch:async()=>{
    const rows=[{Url:site+'a',Count:1},{Url:site+'b',Count:2}];
    return reply({Links:call++?rows.reverse():rows,TotalPages:2});
  }});
  assert.equal((await duplicate.linkCounts(site)).coverage,'partial');
  const invalid=new BingWebmaster({key:'fixture',sites:[site],fetch:async()=>reply('invalid-native-payload')});
  for(const result of await Promise.all([invalid.feeds(site),invalid.urlInfo(site,site),invalid.connectedPages(site),invalid.crawlStats(site),invalid.traffic(site),invalid.submissionQuota(site)])) assert.equal(result.status,'unavailable');
});
