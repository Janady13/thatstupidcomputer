import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { existsSync, readFileSync, copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const require=createRequire(import.meta.url);
try {
  const reactEntry=require.resolve('@rive-app/react-webgl2');
  const scoped=createRequire(reactEntry); const runtimeEntry=scoped.resolve('@rive-app/webgl2');
  let dir=dirname(runtimeEntry);
  while(!existsSync(join(dir,'package.json'))){const parent=dirname(dir);if(parent===dir)throw new Error('Runtime package root not found');dir=parent;}
  const pkg=JSON.parse(readFileSync(join(dir,'package.json'),'utf8'));
  if(pkg.name!=='@rive-app/webgl2')throw new Error('Unexpected runtime package');
  const wasm=join(dir,'rive.wasm'); const js=join(dir,'rive.js');
  if(!existsSync(wasm)||!existsSync(js))throw new Error('Installed runtime layout changed; inspect the version-matched package before adapting this script');
  const out='apps/web/public/animation/runtime';mkdirSync(out,{recursive:true});
  copyFileSync(wasm,join(out,'rive.wasm'));
  // The native verification harness uses the same official browser bundle as the React wrapper.
  copyFileSync(js,join(out,'rive.js'));
  writeFileSync(join(out,'version.json'),JSON.stringify({name:pkg.name,version:pkg.version,wasmSHA256:createHash('sha256').update(readFileSync(wasm)).digest('hex')},null,2));
  console.log(`Self-hosted official Rive runtime ${pkg.version}; no mismatched CDN WASM.`);
} catch(error) { console.error('BLOCKED: Install package.json dependencies before preparing Rive WASM.',error.message);process.exit(2); }
