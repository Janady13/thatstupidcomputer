import {sign} from 'node:crypto';
import {jsonRequest,object,type Capture} from '../../http.ts';
/** Short-lived token for a supplied service account. No credential discovery or broad account scopes. */
export async function searchConsoleToken(account:unknown,fetcher:typeof fetch=fetch):Promise<Capture<string>> {
  if(!object(account)||typeof account.client_email!=='string'||typeof account.private_key!=='string'||account.type!=='service_account') return {status:'unavailable',reason:'payload'};
  try {
    const encode=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString('base64url');
    const now=Math.floor(Date.now()/1000);
    const content=encode({alg:'RS256',typ:'JWT'})+'.'+encode({iss:account.client_email,scope:'https://www.googleapis.com/auth/webmasters.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+900});
    const signature=sign('RSA-SHA256',Buffer.from(content),account.private_key).toString('base64url');
    const result=await jsonRequest('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:content+'.'+signature})},fetcher);
    if(result.status!=='ok') return result;
    if(!object(result.data)||typeof result.data.access_token!=='string') return {status:'unavailable',reason:'payload'};
    return {...result,data:result.data.access_token};
  } catch { return {status:'unavailable',reason:'payload'}; }
}
