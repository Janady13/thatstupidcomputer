import {object,webUrl} from '../../http.ts';
import type {LinkDetail,Sample} from './webmaster.ts';
export interface ExpectedLink {source:string;target:string;kind:string;provenance:string;checkedAt:string|null}
/** Reads the canonical composite; never changes it or promotes harvested claims into public facts. */
export function truthBacklinks(node:unknown,sites:string[]):ExpectedLink[] {
  if(!object(node)||!object(node.works)) throw new Error('Canonical node works contract missing');
  const origins=new Set(sites.map(s=>new URL(s).origin)); const result:ExpectedLink[]=[];
  for(const collection of ['articles','papers','software','datasets','apps','caseStudies','pages']) {
    const works=node.works[collection]; if(!Array.isArray(works)) continue;
    works.forEach((work,index)=>{
      if(!object(work)||!object(work.backlink)) return;
      const link=work.backlink,source=webUrl(work.url),target=webUrl(link.target);
      if(!source||!target||!origins.has(new URL(target).origin)||typeof link.type!=='string'||!['contextual','canonical','homepage','profile'].includes(link.type)) return;
      if(typeof link.status==='string' && /pending|blocked|failed|planned|to-do/i.test(link.status)) return;
      result.push({source,target,kind:link.type,provenance:`works.${collection}[${index}].backlink`,checkedAt:typeof link.checked==='string'?link.checked:null});
    });
  }
  return result;
}
export function reconcileBacklinks(expected:ExpectedLink[],samples:Array<{target:string;sample:Sample<LinkDetail>}>) {
  return expected.map(link=>{
    const found=samples.find(x=>webUrl(x.target)===webUrl(link.target));
    const match=found?.sample.records.find(row=>webUrl(row.Url)===webUrl(link.source));
    const state=link.kind==='canonical'?'canonical-relation-not-backlink':match?'observed-in-bing':!found||found.sample.coverage!=='complete-api-sample'?'observation-unavailable':'not-observed-in-api-sample';
    return {...link,state,...(match?{bingAnchorText:match.AnchorText}:{})};
  });
}
