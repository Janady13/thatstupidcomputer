import { jsonRequest, object, webUrl, type Capture } from '../../http.ts';

export interface LinkCount {Url:string;Count:number}
export interface LinkDetail {Url:string;AnchorText:string}
export interface Sample<T> {
  coverage:'complete-api-sample'|'partial'|'unavailable'; records:T[]; pagesRead:number;
  totalPages:number|null; reason?:'http'|'transport'|'payload'|'page-limit'|'pagination-drift'|'repeated-page';
}
type Method='GetUserSites'|'GetLinkCounts'|'GetUrlLinks'|'GetFeeds'|'GetUrlInfo'|'GetConnectedPages'|'GetCrawlStats'|'GetCrawlIssues'|'GetRankAndTrafficStats'|'GetUrlSubmissionQuota'|'GetSiteMoves';
interface Options {key:string;sites:string[];fetch?:typeof fetch;maxPages?:number}
const natural=(n:unknown):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0;
const countRow=(v:unknown):v is LinkCount=>object(v)&&Boolean(webUrl(v.Url))&&natural(v.Count);
const detailRow=(v:unknown):v is LinkDetail=>object(v)&&Boolean(webUrl(v.Url))&&typeof v.AnchorText==='string'&&v.AnchorText.length<=20_000;
/** Current JSON REST protocol; no retired SOAP/POX and no generic arbitrary-method endpoint. */
export class BingWebmaster {
  private readonly options:Options;
  constructor(options:Options) {
    if(!options.key || !options.sites.length || options.sites.some(s=>webUrl(s)!==s || new URL(s).pathname!=='/' || new URL(s).search)) throw new Error('Invalid Bing configuration');
    if(options.maxPages!==undefined && (!natural(options.maxPages)||options.maxPages<1||options.maxPages>100)) throw new Error('Invalid Bing page limit');
    this.options=options;
  }
  private scope(site:string,target?:string) {
    if(!this.options.sites.includes(site) || (target && (!webUrl(target)||new URL(target).origin!==new URL(site).origin))) throw new Error('URL outside configured Bing scope');
  }
  private async get(method:Method,params:Record<string,string|number>={}):Promise<Capture<unknown>> {
    const url=new URL(`https://ssl.bing.com/webmaster/api.svc/json/${method}`);
    url.searchParams.set('apikey',this.options.key);
    for(const [key,value] of Object.entries(params)) url.searchParams.set(key,String(value));
    const result=await jsonRequest(url,{headers:{accept:'application/json'}},this.options.fetch);
    if(result.status!=='ok') return result;
    if(!object(result.data)||!Object.hasOwn(result.data,'d')) return {status:'unavailable',httpStatus:result.httpStatus,reason:'payload'};
    const data=result.data.d;
    const list=['GetUserSites','GetFeeds','GetConnectedPages','GetCrawlStats','GetCrawlIssues','GetRankAndTrafficStats','GetSiteMoves'].includes(method);
    const valid=list?Array.isArray(data)&&data.length<=100_000&&data.every(object):object(data);
    if(!valid || (object(data)&&Object.hasOwn(data,'ErrorCode'))) return {status:'unavailable',httpStatus:result.httpStatus,reason:'payload'};
    if(method==='GetUrlInfo'&&(!object(data)||!webUrl(data.Url)||!natural(data.AnchorCount)||!natural(data.HttpStatus)||typeof data.IsPage!=='boolean')) return {status:'unavailable',httpStatus:result.httpStatus,reason:'payload'};
    if(method==='GetUrlSubmissionQuota'&&(!object(data)||!natural(data.DailyQuota)||!natural(data.MonthlyQuota))) return {status:'unavailable',httpStatus:result.httpStatus,reason:'payload'};
    if(method==='GetFeeds'&&(data as Record<string,unknown>[]).some(v=>!webUrl(v.Url)||typeof v.Status!=='string')) return {status:'unavailable',httpStatus:result.httpStatus,reason:'payload'};
    if(['GetCrawlStats','GetRankAndTrafficStats'].includes(method)&&(data as Record<string,unknown>[]).some(v=>typeof v.Date!=='string'||!/^\/Date\(\d+(?:[+-]\d{4})?\)\/$/.test(v.Date))) return {status:'unavailable',httpStatus:result.httpStatus,reason:'payload'};
    return {...result,data};
  }
  async sites():Promise<Capture<Array<{url:string;verified:boolean}>>> {
    const result=await this.get('GetUserSites');
    if(result.status!=='ok') return result;
    if(!Array.isArray(result.data)||result.data.some(v=>!object(v)||!webUrl(v.Url)||typeof v.IsVerified!=='boolean')) return {status:'unavailable',reason:'payload'};
    return {...result,data:result.data.filter(v=>this.options.sites.includes(v.Url)).map(v=>({url:v.Url,verified:v.IsVerified}))};
  }
  private async pages<T>(method:'GetLinkCounts'|'GetUrlLinks',params:Record<string,string>,field:'Links'|'Details',valid:(v:unknown)=>v is T):Promise<Sample<T>> {
    const records:T[]=[]; const seen=new Set<string>(); let totalPages:number|null=null; let pagesRead=0;
    const incomplete=(reason:Sample<T>['reason']):Sample<T>=>({coverage:pagesRead?'partial':'unavailable',records,pagesRead,totalPages,reason});
    for(let page=0;page<(this.options.maxPages??100);page++) {
      const result=await this.get(method,{...params,page});
      if(result.status!=='ok') return incomplete(result.reason);
      const data=result.data;
      if(!object(data)||!natural(data.TotalPages)||data.TotalPages>32767||!Array.isArray(data[field])||data[field].length>10_000||!(data[field] as unknown[]).every(valid)) return incomplete('payload');
      const rows=data[field] as T[];
      if((data.TotalPages===0&&rows.length)||(data.TotalPages>0&&rows.length===0)) return incomplete('payload');
      if(totalPages!==null && totalPages!==data.TotalPages) return incomplete('pagination-drift');
      const signature=JSON.stringify(rows.map(row=>{
        const r=row as LinkCount|LinkDetail;
        return JSON.stringify([webUrl(r.Url),'Count' in r?r.Count:r.AnchorText]);
      }).sort());
      if(seen.has(signature)) return incomplete('repeated-page');
      seen.add(signature); totalPages=data.TotalPages; pagesRead++; records.push(...rows);
      if(page+1>=totalPages) return {coverage:'complete-api-sample',records,pagesRead,totalPages};
    }
    return incomplete('page-limit');
  }
  async linkCounts(site:string) { this.scope(site); return this.pages('GetLinkCounts',{siteUrl:site},'Links',countRow); }
  async urlLinks(site:string,target:string) { this.scope(site,target); return this.pages('GetUrlLinks',{siteUrl:site,link:target},'Details',detailRow); }
  async urlInfo(site:string,target:string) { this.scope(site,target); return this.get('GetUrlInfo',{siteUrl:site,url:target}); }
  async feeds(site:string) { this.scope(site); return this.get('GetFeeds',{siteUrl:site}); }
  async connectedPages(site:string) { this.scope(site); return this.get('GetConnectedPages',{siteUrl:site}); }
  async crawlStats(site:string) { this.scope(site); return this.get('GetCrawlStats',{siteUrl:site}); }
  async crawlIssues(site:string) { this.scope(site); return this.get('GetCrawlIssues',{siteUrl:site}); }
  /** Bing documents these totals across verticals; they are not Copilot-only citations. */
  async traffic(site:string) { this.scope(site); return this.get('GetRankAndTrafficStats',{siteUrl:site}); }
  async submissionQuota(site:string) { this.scope(site); return this.get('GetUrlSubmissionQuota',{siteUrl:site}); }
  async siteMoves(site:string) { this.scope(site); return this.get('GetSiteMoves',{siteUrl:site}); }
}
