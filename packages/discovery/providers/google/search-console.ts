import {jsonRequest,object,webUrl,type Capture} from '../../http.ts';
interface Options {token:string;property:string;origin:string;fetch?:typeof fetch}
const validDate=(value:string)=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().startsWith(value);
export class SearchConsole {
  constructor(private readonly options:Options) {
    if(!options.token || webUrl(options.origin)!==options.origin+'/' || ![options.origin+'/',`sc-domain:${new URL(options.origin).hostname}`].includes(options.property)) throw new Error('Invalid Search Console property scope');
  }
  private request(url:string,body?:unknown) {
    return jsonRequest(url,{method:body===undefined?'GET':'POST',headers:{authorization:`Bearer ${this.options.token}`,'content-type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})},this.options.fetch);
  }
  private resource(suffix='') {return `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(this.options.property)}${suffix}`;}
  async site() {
    const result=await this.request(this.resource());
    return result.status==='ok'&&(!object(result.data)||typeof result.data.permissionLevel!=='string')?{status:'unavailable' as const,reason:'payload' as const}:result;
  }
  async sitemaps() {
    const result=await this.request(this.resource('/sitemaps'));
    return result.status==='ok'&&(!object(result.data)||Object.keys(result.data).some(key=>!['sitemap'].includes(key))||(result.data.sitemap!==undefined&&(!Array.isArray(result.data.sitemap)||result.data.sitemap.some(v=>!object(v)||!webUrl(v.path)))))?{status:'unavailable' as const,reason:'payload' as const}:result;
  }
  async inspect(url:string) {
    if(!webUrl(url)||new URL(url).origin!==this.options.origin) throw new Error('Inspection URL outside configured scope');
    const result=await this.request('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect',{inspectionUrl:url,siteUrl:this.options.property,languageCode:'en-US'});
    if(result.status==='ok'&&(!object(result.data)||Object.hasOwn(result.data,'error')||!object(result.data.inspectionResult)||!object(result.data.inspectionResult.indexStatusResult)||typeof result.data.inspectionResult.indexStatusResult.verdict!=='string'))return {status:'unavailable' as const,reason:'payload' as const};
    return result;
  }
  async analytics(startDate:string,endDate:string) {
    if(!validDate(startDate)||!validDate(endDate)||startDate>endDate) throw new Error('Invalid Search Console date window');
    const window={startDate,endDate,timezone:'America/Los_Angeles',type:'web',dataState:'final'};
    // Date aggregation has at most one row per day. Explicitly bound the window and request all rows.
    if(Date.parse(endDate)-Date.parse(startDate)>366*86_400_000) throw new Error('Search Console date window exceeds one year');
    const result=await this.request(this.resource('/searchAnalytics/query'),{startDate,endDate,dimensions:['date'],type:'web',dataState:'final',rowLimit:25_000,startRow:0});
    if(result.status==='ok'&&(!object(result.data)||Object.keys(result.data).some(key=>!['rows','responseAggregationType','metadata'].includes(key))||(result.data.rows!==undefined&&(!Array.isArray(result.data.rows)||result.data.rows.some(v=>!object(v)||!Array.isArray(v.keys)||v.keys.length!==1||!validDate(v.keys[0])||['clicks','impressions','ctr','position'].some(k=>typeof v[k]!=='number'||!Number.isFinite(v[k])||(v[k] as number)<0)))))) return {status:'unavailable' as const,reason:'payload' as const,window,exhaustive:false};
    return {...result,window,exhaustive:false,definition:'Native date-level web-search totals; the API does not expose every underlying query. No AI-only attribution is inferred.'};
  }
}
