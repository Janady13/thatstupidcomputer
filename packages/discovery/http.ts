/** Private integration transport. Callers supply fixed provider endpoints, never visitor input. */
export type Capture<T> = {status:'ok';httpStatus:number;data:T} | {status:'unavailable';httpStatus?:number;reason:'transport'|'http'|'payload';providerCode?:number};
export async function jsonRequest(url: URL | string, init: RequestInit, fetcher: typeof fetch = fetch): Promise<Capture<unknown>> {
  try {
    const response = await fetcher(url, {...init,redirect:'error',signal:AbortSignal.timeout(20_000)});
    if (!response.ok) { await response.body?.cancel(); return {status:'unavailable',httpStatus:response.status,reason:'http'}; }
    if (!/application\/(?:[\w.+-]*\+)?json/i.test(response.headers.get('content-type') ?? '')) {
      await response.body?.cancel(); return {status:'unavailable',httpStatus:response.status,reason:'payload'};
    }
    if (!response.body || Number(response.headers.get('content-length')) > 2_097_152) {
      await response.body?.cancel(); return {status:'unavailable',httpStatus:response.status,reason:'payload'};
    }
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = []; let size=0;
    try {
      while (true) {
        const chunk=await reader.read(); if(chunk.done) break;
        size+=chunk.value.byteLength;
        if(size>2_097_152) { await reader.cancel(); return {status:'unavailable',httpStatus:response.status,reason:'payload'}; }
        chunks.push(chunk.value);
      }
    } finally { reader.releaseLock(); }
    try {
      const data:unknown=JSON.parse(Buffer.concat(chunks).toString('utf8'));
      return {status:'ok',httpStatus:response.status,data};
    } catch { return {status:'unavailable',httpStatus:response.status,reason:'payload'}; }
  } catch { return {status:'unavailable',reason:'transport'}; } // Never retain authenticated URLs, response prose or thrown errors.
}
export const object = (value:unknown): value is Record<string,unknown> => Boolean(value && typeof value==='object' && !Array.isArray(value));
export function webUrl(value:unknown): string | undefined {
  if(typeof value!=='string' || value.length>4096) return;
  try { const url=new URL(value); if(!['https:','http:'].includes(url.protocol)||url.username||url.password) return; url.hash=''; return url.href; } catch { return; }
}
