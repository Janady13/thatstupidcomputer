/** Local-only, bounded acceptance server. It serves only animation test assets. */
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTER_IDS } from '../apps/web/src/animation/core/contracts.mjs';
const root = fileURLToPath(new URL('..', import.meta.url));
const boundary = JSON.parse(await readFile(resolve(root, 'native/reports/browser-boundary.json'), 'utf8'));
if (boundary.status === 'BLOCKED') throw new Error('BLOCKED: browser URL policy forbids this browser/WebGL workflow, alternate browsers and CDP workarounds. Use the permitted DOM-free native Canvas proof; no HTTP server was started.');
const port = Number(process.env.NATIVE_TEST_PORT || 4175);
const prefixes = ['/tests/animation/', '/apps/web/public/animation/', '/apps/web/src/animation/core/', '/apps/web/src/animation/mobile/', '/native/compiled/', '/native/candidates/'];
const mime = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.json':'application/json', '.wasm':'application/wasm', '.svg':'image/svg+xml', '.riv':'application/octet-stream' };
const server = createServer(async (req,res) => {
  try {
    const path = new URL(req.url || '/', 'http://localhost').pathname;
    if (req.method === 'POST' && path === '/native-results') {
      let size=0; const chunks=[];
      for await (const chunk of req) { size+=chunk.length; if(size>40*1024*1024)throw new Error('Report too large'); chunks.push(chunk); }
      const report=JSON.parse(Buffer.concat(chunks).toString());
      if(!Array.isArray(report.files) || report.files.length!==CHARACTER_IDS.length)throw new Error(`Expected ${CHARACTER_IDS.length} results`);
      const out=resolve(root,'native/reports'); await mkdir(out,{recursive:true});
      for(const file of report.files) for(const capture of file.captures || []) {
        if(!/^[a-z-]+--[A-Za-z]+$/.test(capture.name))throw new Error('Invalid capture name');
        for(const mode of ['native','svg']) { const data=capture[mode]; if(typeof data!=='string'||!data.startsWith('data:image/png;base64,'))throw new Error('Invalid capture'); await writeFile(resolve(out,`${capture.name}--${mode}.png`),Buffer.from(data.slice(22),'base64')); delete capture[mode]; }
      }
      await writeFile(resolve(out,'native-runtime.json'),JSON.stringify(report,null,2)+'\n');
      res.writeHead(200,{'Content-Type':'application/json'}); return res.end('{"saved":true}');
    }
    const safePath=path==='/'?'/tests/animation/native-harness.html':path;
    if(!prefixes.some(p=>safePath.startsWith(p))) { res.writeHead(404);return res.end('Not found'); }
    const absolute=resolve(root,'.'+safePath);
    if(!absolute.startsWith(root+sep)){res.writeHead(403);return res.end();}
    const data=await readFile(absolute);
    res.writeHead(200,{'Content-Type':mime[extname(absolute)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
  } catch(error) { res.writeHead(400,{'Content-Type':'text/plain'});res.end(String(error.message)); }
});
server.listen(port,'127.0.0.1',()=>console.log(`Native verification: http://localhost:${port}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
