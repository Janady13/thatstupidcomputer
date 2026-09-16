/** Compile through the official installed Rive CLI. No authentication or publishing is attempted. */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { CHARACTER_IDS } from '../apps/web/src/animation/core/contracts.mjs';
import { prepareNativeRml } from './prepare-native-rml.mjs';
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
const localCLI = fileURLToPath(new URL('../.tools/rive/rive', import.meta.url));
const executable = process.env.RIVE_CLI || (existsSync(localCLI) ? localCLI : 'rive');
const version = spawnSync(executable, ['--version'], {encoding:'utf8',timeout:10000});
if (version.error || version.status !== 0) { console.error('BLOCKED: Install the official Rive CLI, then retry. See docs/ANIMATION.md.'); process.exit(2); }
const sources=prepareNativeRml();
const records=[];mkdirSync('native/compiled',{recursive:true});mkdirSync('native/reports',{recursive:true});
writeFileSync('native/canvas-verified-assets.json','{}\n');writeFileSync('native/canvas-visual-review.json','{}\n');
writeFileSync('native/reports/native-canvas.json',JSON.stringify({status:'STALE',reason:'Official compiler is rebuilding native bytes; fresh exact-byte Canvas proof is required.',files:[]},null,2)+'\n');
writeFileSync('native/reports/native-compiled.json',JSON.stringify({status:'RUNNING',startedAt:new Date().toISOString(),compiler:version.stdout.trim(),files:[]},null,2)+'\n');
const fail=message=>{writeFileSync('native/reports/native-compiled.json',JSON.stringify({status:'FAIL',failedAt:new Date().toISOString(),compiler:version.stdout.trim(),error:message,files:records},null,2)+'\n');throw new Error(message);};
const schema=spawnSync(executable,['schema','Node'],{encoding:'utf8',timeout:10000});
if(schema.error||schema.status!==0)fail('Official CLI schema inspection failed');
writeFileSync('native/reports/rive-transform-schema.txt',schema.stdout);
for (const slug of CHARACTER_IDS) {
  const project=`native/build-source/${slug}`;
  for (const flag of ['--verify','--once']) {
    const run=spawnSync(executable,[project,flag],{encoding:'utf8',timeout:60000});
    writeFileSync(`native/reports/rive-${slug}-${flag.slice(2)}.log`,`${run.stdout??''}\n${run.stderr??''}`);
    if(run.error||run.status!==0)fail(`Official compiler rejected ${slug}; inspect the RML and compiler log. No candidates promoted.`);
  }
  const inspect = spawnSync(executable, ['inspect',project,'--json'], { encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024 });
  writeFileSync(`native/reports/rive-${slug}-inspect.json`, inspect.stdout || inspect.stderr || '');
  if (inspect.error || inspect.status !== 0) fail(`Official inspection rejected ${slug}`);
  const source=`${project}/build/${slug}.riv`;
  if(!existsSync(source))fail(`Compiler produced no expected output at ${source}`);
  const bytes=readFileSync(source);if(bytes.subarray(0,4).toString()!=='RIVE')fail('Bad output signature');
  records.push({...sources.find(record=>record.slug===slug),sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length});
}
for(const record of records)copyFileSync(`native/build-source/${record.slug}/build/${record.slug}.riv`,`native/compiled/${record.slug}.riv`);
writeFileSync('native/reports/native-compiled.json',JSON.stringify({status:'PASS',compiler:version.stdout.trim(),compiledAt:new Date().toISOString(),files:records},null,2)+'\n');
console.log(`Official compilation complete: ${records.length} native files, ${records.reduce((n,record)=>n+record.animations,0)} timelines. Next: exact-byte Canvas proof and contact-sheet review; WebGL remains BLOCKED.`);
