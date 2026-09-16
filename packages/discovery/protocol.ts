/** Pure provider response contracts. No credentials, filesystem, network or private truth data. */
export interface Citation {url:string;title?:string;block?:number;start?:number;end?:number}
export interface ParsedAnswer {text:string;citations:Citation[];searchExecuted:boolean;responseModel?:string}
export interface AnswerAdapter {
  endpoint:string; auth:'bearer'|'anthropic'|'google'; headers?:Record<string,string>;
  build:(model:string,query:string)=>Record<string,unknown>;
  parse:(value:unknown)=>ParsedAnswer|undefined;
}
export const record=(v:unknown):v is Record<string,unknown>=>Boolean(v&&typeof v==='object'&&!Array.isArray(v));
export const records=(v:unknown):Record<string,unknown>[]=>Array.isArray(v)?v.filter(record):[];
export function citationUrl(v:unknown):string|undefined {
  if(typeof v!=='string'||v.length>4096) return;
  try {const u=new URL(v);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)return;return u.href;}catch{return;}
}
export function annotated(blocks:Record<string,unknown>[],textType:string,citationType:string,field='annotations') {
  const texts:string[]=[];const citations:Citation[]=[];
  for(const [block,item] of blocks.entries()) {
    if(item.type!==textType||typeof item.text!=='string') continue;
    texts.push(item.text);
    for(const annotation of records(item[field])) {
      const url=citationUrl(annotation.url);if(annotation.type!==citationType||!url)continue;
      citations.push({url,block,...(typeof annotation.title==='string'?{title:annotation.title}:{}),
        ...(Number.isInteger(annotation.start_index)?{start:annotation.start_index as number}:{}),
        ...(Number.isInteger(annotation.end_index)?{end:annotation.end_index as number}:{})});
    }
  }
  return {text:texts.join('\n'),citations};
}
export function responsesAnswer(value:unknown):ParsedAnswer|undefined {
  if(!record(value)||value.status!=='completed'||!Array.isArray(value.output))return;
  const output=records(value.output);
  if(output.some(item=>item.type==='web_search_call'&&item.status==='failed'))return;
  const answer=annotated(output.filter(item=>item.type==='message').flatMap(item=>records(item.content)),'output_text','url_citation');
  if(!answer.text.trim())return;
  return {...answer,searchExecuted:output.some(item=>item.type==='web_search_call'&&item.status==='completed'),...(typeof value.model==='string'?{responseModel:value.model}:{})};
}
