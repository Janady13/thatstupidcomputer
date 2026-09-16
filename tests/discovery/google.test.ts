import test from 'node:test';
import assert from 'node:assert/strict';
import {SearchConsole} from '../../packages/discovery/providers/google/search-console.ts';
const origin='https://thatstupidcomputer.com',property='sc-domain:thatstupidcomputer.com';
test('Search Console uses separate documented resources, encoded property and explicit index-inspection language',async()=>{
  const calls:Array<{url:string;init?:RequestInit}>=[];
  const client=new SearchConsole({token:'fixture-token',property,origin,fetch:async(url,init)=>{calls.push({url:String(url),init});return new Response('{"permissionLevel":"siteOwner"}',{headers:{'content-type':'application/json'}});}});
  await client.site();await client.sitemaps();await client.inspect(origin+'/services/');
  assert.equal(calls[0].url,'https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Athatstupidcomputer.com');
  assert.equal(calls[1].url,calls[0].url+'/sitemaps');
  assert.equal(calls[2].url,'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect');
  assert.deepEqual(JSON.parse(String(calls[2].init?.body)),{inspectionUrl:origin+'/services/',siteUrl:property,languageCode:'en-US'});
  await assert.rejects(()=>client.inspect('https://another.example/'),/scope/);
  assert.equal(calls.length,3);
});
test('Search Analytics retains dates and pagination status; no backlinks or AI-specific metric is invented',async()=>{
  const client=new SearchConsole({token:'fixture',property,origin,fetch:async(_url,init)=>{
    const body=JSON.parse(String(init?.body));assert.equal(body.startDate,'2026-08-14');assert.equal(body.endDate,'2026-09-10');
    assert.deepEqual(body.dimensions,['date']);assert.equal(body.type,'web');assert.equal(body.dataState,'final');
    return new Response('{"rows":[{"keys":["2026-09-10"],"clicks":1,"impressions":2,"ctr":0.5,"position":3}]}',{headers:{'content-type':'application/json'}});
  }});
  const result=await client.analytics('2026-08-14','2026-09-10');
  assert.equal(result.status,'ok');
  assert.deepEqual(result.window,{startDate:'2026-08-14',endDate:'2026-09-10',timezone:'America/Los_Angeles',type:'web',dataState:'final'});
  assert.equal(result.exhaustive,false);
  await assert.rejects(()=>client.analytics('wrong','2026-09-10'),/date/);
});
test('Google error envelopes and malformed successes remain unavailable; legitimate empty lists remain valid',async()=>{
  for(const data of [{error:{code:403}},null,{unrecognized:true}]) {
    const client=new SearchConsole({token:'fixture',property,origin,fetch:async()=>new Response(JSON.stringify(data),{headers:{'content-type':'application/json'}})});
    for(const result of await Promise.all([client.sitemaps(),client.analytics('2026-09-01','2026-09-10'),client.inspect(origin+'/')]))assert.equal(result.status,'unavailable');
  }
  const empty=new SearchConsole({token:'fixture',property,origin,fetch:async()=>new Response('{}',{headers:{'content-type':'application/json'}})});
  assert.equal((await empty.sitemaps()).status,'ok');assert.equal((await empty.analytics('2026-09-01','2026-09-10')).status,'ok');
});
