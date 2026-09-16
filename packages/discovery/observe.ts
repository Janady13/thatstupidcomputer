import type {ProviderId} from './registry.ts';
import {ANSWER_ADAPTERS} from './adapters.ts';
import {SITE_ORIGIN} from '../site/content.ts';
import {jsonRequest} from './http.ts';
interface Options {key:string;model:string;query:string;fetch?:typeof fetch}
/** One explicitly requested API sample, never an unattended scrape of consumer interfaces. */
export async function observeAnswer(provider:ProviderId,options:Options) {
  const startedAt=new Date().toISOString(),adapter=ANSWER_ADAPTERS[provider];
  const context={schema:'tsc-model-observation/v1',provider,surface:'developer-api-web-search',requestedModel:options.model,query:options.query,language:'en',locale:'not-specified',accountState:'api-key',querySetVersion:'tsc-service-questions/v1',startedAt,consumerUiResult:false};
  const unavailable=(reason:string,httpStatus?:number)=>({...context,outcome:'unavailable' as const,reason,...(httpStatus?{httpStatus}:{}),finishedAt:new Date().toISOString()});
  if(!adapter) return unavailable('no-supported-search-observation-api');
  if(!options.key)return unavailable('credential-not-configured');
  if(!/^[a-zA-Z0-9._-]{1,128}$/.test(options.model)||!options.query.trim()||options.query.length>2000) return unavailable('invalid-observation-input');
  const authentication:Record<string,string>=adapter.auth==='bearer'?{authorization:`Bearer ${options.key}`} : adapter.auth==='anthropic'?{'x-api-key':options.key}:{'x-goog-api-key':options.key};
  const result=await jsonRequest(adapter.endpoint,{method:'POST',headers:{...authentication,...adapter.headers,'content-type':'application/json'},body:JSON.stringify(adapter.build(options.model,options.query))},options.fetch);
  if(result.status!=='ok')return unavailable(result.reason,result.httpStatus);
  const answer=adapter.parse(result.data);
  if(!answer)return unavailable('incomplete-or-unrecognized-answer',result.httpStatus);
  if(!answer.searchExecuted)return unavailable('search-execution-not-observed',result.httpStatus);
  const targetHost=new URL(SITE_ORIGIN).hostname;
  // The HTTP and www aliases are verified canonical redirects, not unrelated sibling sites.
  const cited=answer.citations.some(c=>{const url=new URL(c.url);return !url.port&&[targetHost,`www.${targetHost}`].includes(url.hostname);});
  const unresolved=answer.citations.some(c=>{const url=new URL(c.url);return url.hostname==='vertexaisearch.cloud.google.com'||(url.hostname==='www.google.com'&&url.pathname==='/url');});
  if(!cited&&unresolved)return {...unavailable('citation-destination-unresolved',result.httpStatus),...answer};
  return {...context,outcome:cited?'observed-target-citation' as const:'completed-without-target-citation' as const,httpStatus:result.httpStatus,...answer,finishedAt:new Date().toISOString(),correctnessReview:'not-reviewed',limitations:['Single API sample, not consumer product placement or a ranking guarantee.','Citation presence does not prove answer correctness, a referral or an inquiry.']};
}
