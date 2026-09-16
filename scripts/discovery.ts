import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {parseEnv} from 'node:util';
import {createHash} from 'node:crypto';
import {BingWebmaster} from '../packages/discovery/providers/bing/webmaster.ts';
import {collectBing} from '../packages/discovery/providers/bing/collect.ts';
import {SITE_ORIGIN,ROUTES} from '../packages/site/content.ts';
import {object,webUrl} from '../packages/discovery/http.ts';
import {evidenceDirectory,saveEvidence} from '../packages/discovery/evidence.ts';
import {SearchConsole} from '../packages/discovery/providers/google/search-console.ts';
import {searchConsoleToken} from '../packages/discovery/providers/google/auth.ts';
import {PROVIDERS,type ProviderId} from '../packages/discovery/registry.ts';
import {answerCatalog} from '../packages/discovery/answers.ts';
import {observeAnswer} from '../packages/discovery/observe.ts';

async function main() {
  const mode=process.argv[2];
  if(mode==='--help'||!mode) {
    console.log('discovery catalog | bing | google START_DATE END_DATE | answer PROVIDER MODEL\nPrivate reports only. Set TSC_DISCOVERY_ROOT when using the bundled CLI. Bing: TSC_DISCOVERY_NODE + TSC_DISCOVERY_NODE_SHA256. Credentials: TSC_DISCOVERY_ENV or provider environment key; Google Search Console: TSC_GSC_SERVICE_ACCOUNT. Each answer command makes one bounded, billable native API request. No consumer-UI results are inferred.');return;
  }
  if(!['catalog','bing','google','answer'].includes(mode))throw new Error('Unknown discovery command');
  const directory=evidenceDirectory(process.env.TSC_DISCOVERY_ROOT??fileURLToPath(new URL('..',import.meta.url)));
  const environment=process.env.TSC_DISCOVERY_ENV?parseEnv(readFileSync(process.env.TSC_DISCOVERY_ENV,'utf8')):{};
  if(mode==='catalog') {
    const startedAt=new Date().toISOString();
    const file=saveEvidence(directory,'catalog',startedAt,{schema:'tsc-answer-catalog/v1',startedAt,providers:(Object.keys(PROVIDERS) as ProviderId[]).map(answerCatalog)});
    console.log(JSON.stringify({file,providers:Object.keys(PROVIDERS)}));return;
  }
  if(mode==='answer') {
    const provider=process.argv[3] as ProviderId,model=process.argv[4]??'';
    if(!Object.hasOwn(PROVIDERS,provider))throw new Error('Unknown provider');
    const keyNames:Record<ProviderId,string>={bing:'BING_KEY',google:'GEMINI_API_KEY',openai:'OPENAI_API_KEY',anthropic:'ANTHROPIC_API_KEY',perplexity:'PERPLEXITY_API_KEY',xai:'XAI_API_KEY',mistral:'MISTRAL_API_KEY',deepseek:'DEEPSEEK_API_KEY'};
    const keyName=keyNames[provider];
    const query='Search the web in English: What website repair and search-visibility services does That Stupid Computer offer? Cite the current source pages. If reliable information is unavailable, say so. Do not infer prices or guaranteed results.';
    const report=await observeAnswer(provider,{model,query,key:process.env[keyName]??environment[keyName]??''});
    const file=saveEvidence(directory,provider,report.startedAt,report);
    console.log(JSON.stringify({file,provider,outcome:report.outcome,...('reason' in report?{reason:report.reason,httpStatus:report.httpStatus}:{citations:report.citations.map(c=>c.url),model:report.responseModel})}));
    if(report.outcome==='unavailable')process.exitCode=2;return;
  }
  if(mode==='google') {
    if(!process.env.TSC_GSC_SERVICE_ACCOUNT)throw new Error('Google service account path required');
    const auth=await searchConsoleToken(JSON.parse(readFileSync(process.env.TSC_GSC_SERVICE_ACCOUNT,'utf8')));
    if(auth.status!=='ok')throw new Error('Google authentication unavailable');
    const property=`sc-domain:${new URL(SITE_ORIGIN).hostname}`,startedAt=new Date().toISOString();
    const client=new SearchConsole({token:auth.data,property,origin:SITE_ORIGIN});
    const ownership=await client.site();
    if(ownership.status!=='ok'||!object(ownership.data)||!['siteOwner','siteFullUser','siteRestrictedUser'].includes(String(ownership.data.permissionLevel)))throw new Error('Search Console property access unavailable');
    const [sitemaps,analytics]=await Promise.all([client.sitemaps(),client.analytics(process.argv[3]??'',process.argv[4]??'')]);
    const inspections=[];
    for(const page of ROUTES) inspections.push({url:SITE_ORIGIN+page.path,result:await client.inspect(SITE_ORIGIN+page.path)});
    const report={schema:'tsc-search-console-observation/v1',startedAt,finishedAt:new Date().toISOString(),property,readOnly:true,ownership,sitemaps,analytics,inspections,
      backlinks:{status:'native-report-required',reason:'No Links API resource in the official Search Console API reference.'},
      generativeAi:{status:'native-report-required',reason:'Search AI participation and generative AI report readback require the native supported surface; do not infer them from web analytics.'}};
    const file=saveEvidence(directory,'google',startedAt,report);
    console.log(JSON.stringify({file,property,sitemaps:sitemaps.status,analytics:analytics.status,inspections:inspections.map(i=>({url:i.url,status:i.result.status})),nativeReportsRequired:['Links','Generative AI']}));
    if([sitemaps,analytics,...inspections.map(i=>i.result)].some(x=>x.status!=='ok'))process.exitCode=2;return;
  }
  const nodePath=process.env.TSC_DISCOVERY_NODE;
  if(!nodePath || !process.env.TSC_DISCOVERY_NODE_SHA256) throw new Error('Pinned canonical node path and SHA256 required');
  const bytes=readFileSync(nodePath); const hash=createHash('sha256').update(bytes).digest('hex');
  if(hash!==process.env.TSC_DISCOVERY_NODE_SHA256) throw new Error('Canonical node hash changed');
  const node:unknown=JSON.parse(bytes.toString('utf8'));
  if(!object(node)||!webUrl(node.canonicalHost)||!object(node.org)||typeof node.org['@id']!=='string') throw new Error('Canonical node contract missing');
  const canonicalHost=String(node.canonicalHost);
  if(new URL(canonicalHost).pathname!=='/'||new URL(node.org['@id']).origin!==new URL(canonicalHost).origin) throw new Error('Canonical node identity scope mismatch');
  const sites=[SITE_ORIGIN+'/',canonicalHost];
  const client=new BingWebmaster({key:process.env.BING_KEY??environment.BING_KEY??'',sites});
  const report=await collectBing(client,[{url:sites[0],role:'website',targets:ROUTES.map(p=>SITE_ORIGIN+p.path)},{url:sites[1],role:'organization',targets:[sites[1]]}],node);
  const stable=createHash('sha256').update(readFileSync(nodePath)).digest('hex')===hash;
  const file=saveEvidence(directory,'bing',report.startedAt,{...report,canonicalNode:{sha256:hash,unchangedDuringRun:stable},limitations:['Canonical relationships are expected links, not independent endorsements.','Canonical-node facts were read, not modified or republished.','Bing empty detail lists do not prove zero inbound links.']});
  console.log(JSON.stringify({file,canonicalNodeUnchanged:stable,properties:report.properties.map(p=>({url:p.property,status:p.status,expectedRelations:p.backlinks?.reconciliation.length,queriedTargets:p.backlinks?.targets.length,observedDetailRows:p.backlinks?.targets.reduce((n,t)=>n+t.sample.records.length,0),aiPerformance:p.aiPerformance.status}))}));
  if(!stable || report.properties.some(p=>p.status!=='collected')) process.exitCode=2;
}
main().catch(()=>{console.error('Discovery collection failed; verify configured provider, credential access, canonical node pin and private output path. Credentials and provider error bodies are not logged.');process.exitCode=1;});
