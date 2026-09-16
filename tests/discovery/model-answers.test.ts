import test from 'node:test';
import assert from 'node:assert/strict';
import {ANSWER_ADAPTERS} from '../../packages/discovery/adapters.ts';
import {observeAnswer} from '../../packages/discovery/observe.ts';
const target='https://thatstupidcomputer.com/services/website-rescue/';
test('model requests use their actual native contracts rather than one shared request body',()=>{
  const query='Search for website repair options.';
  assert.deepEqual(ANSWER_ADAPTERS.openai!.build('fixture-model',query).tools,[{type:'web_search'}]);
  assert.deepEqual(ANSWER_ADAPTERS.google!.build('fixture-model',query).tools,[{type:'google_search'}]);
  assert.deepEqual(ANSWER_ADAPTERS.anthropic!.build('fixture-model',query).tools,[{type:'web_search_20260318',name:'web_search',max_uses:3,allowed_callers:['direct']}]);
  assert.equal(ANSWER_ADAPTERS.perplexity!.endpoint,'https://api.perplexity.ai/v1/sonar');
  assert.equal(ANSWER_ADAPTERS.xai!.endpoint,'https://api.x.ai/v1/responses');
  assert.equal(ANSWER_ADAPTERS.mistral!.endpoint,'https://api.mistral.ai/v1/conversations');
  assert.equal(ANSWER_ADAPTERS.deepseek,null);
});
test('ChatGPT and Grok adapters use output citations, not tool search-result inventories',()=>{
  const response={status:'completed',model:'fixture-model',output:[{type:'web_search_call',status:'completed',action:{sources:[{url:'https://not-cited.example/'}]}},{type:'message',role:'assistant',content:[{type:'output_text',text:'Repair is an option.',annotations:[{type:'url_citation',url:target,title:'Repair'}]}]}]};
  for(const provider of [ANSWER_ADAPTERS.openai,ANSWER_ADAPTERS.xai]) {
    const result=provider!.parse(response);
    assert.equal(result?.searchExecuted,true);assert.deepEqual(result?.citations.map(x=>x.url),[target]);
    assert.equal(provider!.parse({...response,status:'incomplete'}),undefined);
  }
});
test('Gemini follows the current steps schema, ignoring thoughts and search suggestions as citations',()=>{
  const parsed=ANSWER_ADAPTERS.google!.parse({status:'completed',model:'fixture-model',steps:[{type:'thought',summary:[{type:'text',text:'not retained'}]},{type:'google_search_call'},{type:'google_search_result',result:[{search_suggestions:'not a citation'}]},{type:'model_output',content:[{type:'text',text:'Repair.',annotations:[{type:'url_citation',url:target,title:'Repair'}]}]}]});
  assert.equal(parsed?.text,'Repair.');assert.deepEqual(parsed?.citations.map(x=>x.url),[target]);
  assert.equal(ANSWER_ADAPTERS.google!.parse({candidates:[]}),undefined);
});
test('Claude detects embedded tool errors even at HTTP200, and keeps only actual answer citations',()=>{
  const body={stop_reason:'end_turn',model:'fixture-model',content:[{type:'web_search_tool_result',content:[{url:'https://retrieved.example/'}]},{type:'text',text:'Repair.',citations:[{type:'web_search_result_location',url:target,title:'Repair'}]}]};
  assert.deepEqual(ANSWER_ADAPTERS.anthropic!.parse(body)?.citations.map(x=>x.url),[target]);
  body.content[0]={type:'web_search_tool_result',content:{type:'web_search_tool_result_error',error_code:'too_many_requests'}} as never;
  assert.equal(ANSWER_ADAPTERS.anthropic!.parse(body),undefined);
});
test('Perplexity and Mistral preserve their native citation structures',()=>{
  const sonar=ANSWER_ADAPTERS.perplexity!.parse({model:'sonar',choices:[{finish_reason:'stop',message:{content:'Repair [1].'}}],citations:[target],search_results:[{url:'https://retrieved.example/'}]});
  assert.deepEqual(sonar?.citations.map(x=>x.url),[target]);
  const mistral=ANSWER_ADAPTERS.mistral!.parse({outputs:[{type:'tool.execution',name:'web_search'},{type:'message.output',model:'fixture-model',content:[{type:'text',text:'Repair.'},{type:'tool_reference',tool:'web_search',url:target,title:'Repair'}]}]});
  assert.deepEqual(mistral?.citations.map(x=>x.url),[target]);
});
test('unavailable, unsupported, no-search and completed-without-citation remain different outcomes',async()=>{
  let calls=0;
  const noSearch=async()=>{calls++;return new Response(JSON.stringify({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'I did not search.',annotations:[]}]}]}),{headers:{'content-type':'application/json'}});};
  const options={model:'fixture-model',query:'Search for website repair.',key:'fixture-secret',fetch:noSearch};
  assert.equal((await observeAnswer('deepseek',options)).outcome,'unavailable');assert.equal(calls,0);
  assert.equal((await observeAnswer('openai',{...options,key:''})).outcome,'unavailable');assert.equal(calls,0);
  assert.equal((await observeAnswer('openai',options)).outcome,'unavailable');
  const result=await observeAnswer('openai',{...options,fetch:async()=>new Response(JSON.stringify({status:'completed',output:[{type:'web_search_call',status:'completed'},{type:'message',content:[{type:'output_text',text:'Other service.',annotations:[]}]}]}),{headers:{'content-type':'application/json'}})});
  assert.equal(result.outcome,'completed-without-target-citation');
  assert.doesNotMatch(JSON.stringify(result),/fixture-secret/);
});
test('an unresolved Gemini citation proxy is not a negative visibility result',async()=>{
  const report=await observeAnswer('google',{key:'fixture',model:'fixture-model',query:'Search the web.',fetch:async()=>new Response(JSON.stringify({status:'completed',steps:[{type:'google_search_result'},{type:'model_output',content:[{type:'text',text:'Repair.',annotations:[{type:'url_citation',url:'https://vertexaisearch.cloud.google.com/grounding-api-redirect/example'}]}]}]}),{headers:{'content-type':'application/json'}})});
  assert.equal(report.outcome,'unavailable');
  assert.equal('reason' in report&&report.reason,'citation-destination-unresolved');
});
test('verified canonical-host aliases count as site citations without rewriting native evidence',async()=>{
  for(const url of ['http://thatstupidcomputer.com/','https://www.thatstupidcomputer.com/','https://thatstupidcomputer.com:8443/']) {
    const report=await observeAnswer('openai',{key:'fixture',model:'fixture-model',query:'Search.',fetch:async()=>new Response(JSON.stringify({status:'completed',output:[{type:'web_search_call',status:'completed'},{type:'message',content:[{type:'output_text',text:'Website.',annotations:[{type:'url_citation',url}]}]}]}),{headers:{'content-type':'application/json'}})});
    assert.equal(report.outcome,new URL(url).port?'completed-without-target-citation':'observed-target-citation');assert.equal('citations' in report&&report.citations[0].url,url);
  }
});
