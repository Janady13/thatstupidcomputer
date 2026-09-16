import {BingWebmaster} from './webmaster.ts';
import {truthBacklinks,reconcileBacklinks} from './backlinks.ts';
import {webUrl} from '../../http.ts';
export interface BingProperty {url:string;role:'website'|'organization';targets:string[]}

export async function collectBing(client:BingWebmaster,properties:BingProperty[],node:unknown) {
  const startedAt=new Date().toISOString();
  const ownership=await client.sites();
  const expected=truthBacklinks(node,properties.map(p=>p.url));
  const reports=[];
  for(const property of properties) {
    const aiPerformance={status:'native-report-required' as const,reason:'No AI Performance endpoint in the reviewed Webmaster API reference. Import a native report; traffic totals are not citation counts.'};
    if(ownership.status!=='ok'||!ownership.data.some(x=>x.url===property.url&&x.verified)) {
      reports.push({property:property.url,role:property.role,status:'unavailable',reason:'verified-property-access-required',aiPerformance});continue;
    }
    const links=await client.linkCounts(property.url);
    const relevant=expected.filter(x=>new URL(x.target).origin===new URL(property.url).origin);
    const targets=[...new Set([property.url,...property.targets,...relevant.map(x=>x.target),...links.records.map(x=>x.Url)])].filter(url=>webUrl(url)&&new URL(url).origin===new URL(property.url).origin);
    const selected=targets.slice(0,100);
    const samples=[];
    // Small batches respect the shared account and keep timeouts from stalling unrelated targets.
    for(let i=0;i<selected.length;i+=3) samples.push(...await Promise.all(selected.slice(i,i+3).map(async target=>({target,sample:await client.urlLinks(property.url,target)}))));
    const [feeds,urlInfo,connectedPages]=await Promise.all([client.feeds(property.url),client.urlInfo(property.url,property.url),client.connectedPages(property.url)]);
    const [crawlStats,crawlIssues,traffic]=await Promise.all([client.crawlStats(property.url),client.crawlIssues(property.url),client.traffic(property.url)]);
    const [submissionQuota,siteMoves]=await Promise.all([client.submissionQuota(property.url),client.siteMoves(property.url)]);
    const allAvailable=[feeds,urlInfo,connectedPages,crawlStats,crawlIssues,traffic,submissionQuota,siteMoves].every(x=>x.status==='ok')&&links.coverage==='complete-api-sample'&&samples.every(x=>x.sample.coverage==='complete-api-sample')&&selected.length===targets.length;
    reports.push({property:property.url,role:property.role,status:allAvailable?'collected':'partial',
      backlinks:{exhaustive:false,coverage:'Bing representative API sample; absent rows do not prove absent backlinks.',counts:links,targets:samples,omittedTargets:targets.slice(selected.length),reconciliation:reconcileBacklinks(relevant,samples)},
      feeds,urlInfo,connectedPages,crawlStats,crawlIssues,traffic,submissionQuota,siteMoves,aiPerformance,
      trafficDefinition:'Native Bing date windows and all reported verticals; not isolated AI citations, referrals, leads, or revenue.',
    });
  }
  return {schema:'tsc-bing-observation/v1',startedAt,finishedAt:new Date().toISOString(),readOnly:true,ownership,properties:reports};
}
