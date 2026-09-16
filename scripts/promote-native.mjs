/** Explicit local promotion, guarded by same-byte Canvas + actual WebGL reports and visual review. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHARACTER_IDS, MOBILE_ACTIONS } from '../apps/web/src/animation/core/contracts.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const json=p=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const boundary=json('native/reports/browser-boundary.json');
assert.notEqual(boundary.status,'BLOCKED','BLOCKED: the browser URL policy prohibits this WebGL workflow and all alternate-browser/CDP workarounds. Canvas proof cannot authorize WebGL promotion.');
const canvas=json('native/reports/native-canvas.json'),webgl=json('native/reports/native-runtime.json'),review=json('native/visual-review.json'),runtime=json('apps/web/public/animation/runtime/version.json');
assert.equal(canvas.status,'PASS');assert.equal(webgl.status,'PASS');assert.equal(webgl.files.length,CHARACTER_IDS.length);
const registry={};
for(const file of webgl.files){const bytes=readFileSync(resolve(root,`apps/web/public/animation/rive/${file.slug}.riv`)),hash=createHash('sha256').update(bytes).digest('hex');assert(CHARACTER_IDS.includes(file.slug));assert.equal(file.sha256,hash);assert.equal(canvas.files.find(c=>c.slug===file.slug)?.sha256,hash);assert.equal(file.runtimeVersion,runtime.version);assert.deepEqual([...file.animations].sort(),[...MOBILE_ACTIONS].sort());assert.equal(file.checks.length,MOBILE_ACTIONS.length);assert(file.checks.every(c=>c.status==='PASS'));assert.equal(review[file.slug]?.sha256,hash);assert.equal(review[file.slug]?.approved,true);assert(review[file.slug]?.reviewer);assert(review[file.slug]?.reviewedAt);registry[file.slug]={slug:file.slug,src:`/animation/rive/${file.slug}.riv`,artboard:file.artboard,sha256:hash,status:'runtime-verified',runtimeVersion:runtime.version,reviewedAt:review[file.slug].reviewedAt,animations:file.animations};}
writeFileSync(resolve(root,'apps/web/src/animation/rive/verified-assets.json'),JSON.stringify(registry,null,2)+'\n');console.log(`${CHARACTER_IDS.length} assets promoted against actual WebGL evidence and visual review.`);
