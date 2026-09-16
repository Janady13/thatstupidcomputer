/** Structural vector and motion audit. Native rendering is a separate acceptance gate. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DOMParser } from '@xmldom/xmldom';
import { CHARACTER_IDS, MOBILE_ACTIONS, DESKTOP_STATES, validateCharacter } from '../apps/web/src/animation/core/contracts.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const assets=resolve(root,'apps/web/public/animation');
const json=(path:string)=>JSON.parse(readFileSync(resolve(root,path),'utf8'));
const checks:{name:string;status:'PASS'|'FAIL';detail:unknown}[]=[];
function record(name:string,run:()=>unknown){try{checks.push({name,status:'PASS',detail:run()});}catch(error){checks.push({name,status:'FAIL',detail:error instanceof Error?error.message:String(error)});}}
function files(dir:string):string[]{return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(resolve(dir,entry.name)):[resolve(dir,entry.name)]);}
for(const path of files(assets).filter(path=>extname(path)==='.svg'))record(relative(root,path),()=>{
 const text=readFileSync(path,'utf8');assert(!/<!DOCTYPE|<!ENTITY/i.test(text),'External declarations are not accepted');
 const document=new DOMParser({onError:(level,message)=>{throw new Error(`${level}: ${message}`);}}).parseFromString(text,'image/svg+xml');
 const nodes=Array.from(document.getElementsByTagName('*'));const ids=new Set<string>();
 for(const node of nodes){assert(!['image','script','foreignObject','iframe'].includes(node.localName || ''),`Unexpected ${node.localName}`);if(path.includes('/mobile/'))assert(node.localName!=='text','Character lettering must remain paths');const id=node.getAttribute('id');if(id){assert(!ids.has(id),`Duplicate ${id}`);ids.add(id);}for(const attr of Array.from(node.attributes)){assert(!/^on/i.test(attr.name),`Event attribute ${attr.name}`);if(attr.localName==='href')assert(attr.value.startsWith('#'),'External reference');}}
 return {elements:nodes.length,paths:nodes.filter(n=>n.localName==='path').length,sha256:createHash('sha256').update(text).digest('hex')};
});
for(const slug of CHARACTER_IDS){
 record(`${slug}: rig and all performance timelines`,()=>{const model=json(`apps/web/public/animation/mobile/${slug}/scene.json`),clips=json(`apps/web/public/animation/mobile/${slug}/motion.json`);validateCharacter(model,clips);assert.equal(model.width,720);assert.equal(model.height,920);assert.deepEqual(clips.map((c:{name:string})=>c.name).sort(),[...MOBILE_ACTIONS].sort());return {timelines:clips.length,width:model.width,height:model.height};});
 record(`${slug}: native RML references`,()=>{const text=readFileSync(resolve(root,`native/build-source/${slug}/scene.rml`),'utf8');const document=new DOMParser({onError:(level,message)=>{throw new Error(`${level}: ${message}`);}}).parseFromString(text,'application/xml');const ids=Array.from(document.getElementsByTagName('*')).map(node=>node.getAttribute('id')).filter(Boolean);assert.equal(new Set(ids).size,ids.length);const names=Array.from(document.getElementsByTagName('LinearAnimation')).map(node=>node.getAttribute('name'));assert.deepEqual(names.sort(),[...MOBILE_ACTIONS].sort());for(const node of Array.from(document.getElementsByTagName('KeyedObject')))assert(ids.includes(node.getAttribute('objectId')),'Missing keyed object');return {animations:names,elements:document.getElementsByTagName('*').length};});
}
record('office: forty independent original props',()=>{const room=json('apps/web/public/animation/office/room-manifest.json');assert.equal(room.objects.length,40);const ids=new Set(room.objects.map((o:{id:string})=>o.id));assert.equal(ids.size,40);for(const o of room.objects)assert(o.parent===null||ids.has(o.parent));return {props:40,desktopStates:DESKTOP_STATES};});
record('animation assets contain no distributed fonts',()=>{const fonts=files(assets).filter(path=>/\.(woff2?|ttf|otf)$/i.test(path));assert.deepEqual(fonts,[]);return 'All character lettering remains outlined vector paths';});
record('Canvas runtime evidence matches all shipped native binaries',()=>{
 const registry=json('native/canvas-verified-assets.json'),report=json('native/reports/native-canvas.json');assert.equal(report.status,'PASS');assert.equal(report.files.length,5);
 for(const slug of CHARACTER_IDS){const entry=registry[slug],evidence=report.files.find((file:{slug:string})=>file.slug===slug);assert.equal(entry.status,'canvas-runtime-verified');assert.equal(entry.browserWebGLVerified,false);assert.equal(evidence.sha256,entry.sha256);assert.equal(evidence.checks.length,MOBILE_ACTIONS.length);assert(evidence.checks.every((check:{status:string;samples:unknown[]})=>check.status==='PASS'&&check.samples.length===6));for(const path of [`native/compiled/${slug}.riv`,`apps/web/public/animation/rive/${slug}.riv`])assert.equal(createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex'),entry.sha256);}
 return {nativeFiles:CHARACTER_IDS.length,timelines:CHARACTER_IDS.length*MOBILE_ACTIONS.length,samples:CHARACTER_IDS.length*MOBILE_ACTIONS.length*6,browserWebGL:'not executed'};
});
record('native registry matches files and official runtime evidence',()=>{
 const registry=json('apps/web/src/animation/rive/verified-assets.json');
 for(const [slug,entry] of Object.entries(registry) as [string,{src:string;sha256:string;status:string;runtimeVersion:string}][]){assert((CHARACTER_IDS as readonly string[]).includes(slug));assert.equal(entry.status,'runtime-verified');const bytes=readFileSync(resolve(root,'apps/web/public'+entry.src));assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256);const runtime=json('apps/web/public/animation/runtime/version.json');assert.equal(runtime.version,entry.runtimeVersion);const native=json('native/reports/native-runtime.json');assert.equal(native.status,'PASS');const evidence=native.files.find((f:{slug:string})=>f.slug===slug);assert.equal(evidence.sha256,entry.sha256);assert.equal(evidence.checks.length,MOBILE_ACTIONS.length);assert(evidence.checks.every((check:{status:string})=>check.status==='PASS'));}
 return {promoted:Object.keys(registry).length};
});
const report={scope:'Strict XML structure, complete source motion contracts, vectors, and byte-bound native evidence',passed:checks.filter(c=>c.status==='PASS').length,failed:checks.filter(c=>c.status==='FAIL').length,checks};
mkdirSync(resolve(root,'native/reports'),{recursive:true});writeFileSync(resolve(root,'native/reports/asset-audit.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,failed:report.failed}));if(report.failed)process.exitCode=1;
