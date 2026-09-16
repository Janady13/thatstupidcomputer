import { createCharacterSVG } from '/apps/web/src/animation/core/geometry.mjs';
import { CharacterController } from '/apps/web/src/animation/mobile/character-controller.mjs';
const base='/apps/web/public/animation';
const manifest=await (await fetch(`${base}/manifest.json`)).json();
const runtimeInfo=await (await fetch(`${base}/runtime/version.json`)).json();
const nativeCanvas=document.querySelector('#native'), reference=document.querySelector('#reference');
const status=document.querySelector('#status'), reportElement=document.querySelector('#report');
const character=document.querySelector('#character'), action=document.querySelector('#action');
for(const item of manifest.characters)character.add(new Option(item.name,item.slug));
for(const clip of manifest.characters[0].clips)action.add(new Option(clip.name,clip.name));
rive.RuntimeLoader.setWasmUrl(`${base}/runtime/rive.wasm`);rive.RuntimeLoader.setWasmFallbackUrl(null);
let runtime,renderer,file,artboard,animation,controller,svg,currentClip;
const errors=[];window.addEventListener('error',e=>errors.push(e.message));window.addEventListener('unhandledrejection',e=>errors.push(String(e.reason)));
function cleanup(){animation?.delete();animation=null;artboard?.delete();artboard=null;file?.delete();file=null;controller?.destroy();controller=null;svg?.remove();svg=null;}
async function load(item){
 cleanup();runtime ||= await rive.RuntimeLoader.awaitInstance();renderer ||= runtime.makeRenderer(nativeCanvas,true);
 const bytes=await (await fetch(`/native/compiled/${item.slug}.riv`)).arrayBuffer();
 file=await runtime.load(new Uint8Array(bytes),undefined,false);if(!file)throw new Error('Native importer returned no file');
 artboard=file.artboardByName(item.artboard);if(!artboard)throw new Error(`Missing artboard ${item.artboard}`);
 const names=[];for(let i=0;i<artboard.animationCount();i++)names.push(artboard.animationByIndex(i).name);
 if(JSON.stringify([...names].sort())!==JSON.stringify(item.clips.map(c=>c.name).sort()))throw new Error('Native timeline contract mismatch');
 const [model,clips]=await Promise.all(['scene','motion'].map(async name=>(await fetch(`${base}/mobile/${item.slug}/${name}.json`)).json()));
 svg=createCharacterSVG(model,`proof-${item.slug}`);svg.style.cssText='position:absolute;left:-10000px;width:720px;height:920px';document.body.append(svg);
 controller=new CharacterController(svg,model,clips,{paused:true,externalClock:true,censored:true});
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(b=>b.toString(16).padStart(2,'0')).join('');
 return {slug:item.slug,artboard:artboard.name,sha256:hash,bytes:bytes.byteLength,animations:names,runtimeVersion:runtimeInfo.version,checks:[],captures:[]};
}
function changeAction(name){animation?.delete();animation=new runtime.LinearAnimationInstance(artboard.animationByName(name),artboard);controller.setAction(name,{immediate:true});currentClip=controller.clips.get(name);}
async function frame(seconds){
 animation.time=currentClip.loop?seconds%currentClip.seconds:Math.min(seconds,currentClip.seconds);animation.apply(1);artboard.advance(0);
 renderer.clear();renderer.save();renderer.align(runtime.Fit.contain,runtime.Alignment.center,{minX:0,minY:0,maxX:360,maxY:460},artboard.bounds);artboard.draw(renderer);renderer.restore();runtime.resolveAnimationFrame();
 const nativeImage=new Image();nativeImage.src=nativeCanvas.toDataURL();await nativeImage.decode();
 const nativeCopy=document.createElement('canvas');nativeCopy.width=360;nativeCopy.height=460;const nativeContext=nativeCopy.getContext('2d',{willReadFrequently:true});nativeContext.drawImage(nativeImage,0,0);
 controller.seek(seconds);const source=new XMLSerializer().serializeToString(svg);const url=URL.createObjectURL(new Blob([source],{type:'image/svg+xml'}));
 const referenceImage=new Image();referenceImage.src=url;await referenceImage.decode();const referenceContext=reference.getContext('2d',{willReadFrequently:true});referenceContext.clearRect(0,0,360,460);referenceContext.drawImage(referenceImage,0,0,360,460);URL.revokeObjectURL(url);
 const a=nativeContext.getImageData(0,0,360,460).data,b=referenceContext.getImageData(0,0,360,460).data;
 let error=0,large=0,union=0,missing=0,filled=0;for(let i=0;i<a.length;i+=4){const aa=a[i+3]/255,ba=b[i+3]/255;let pixel=0;for(let c=0;c<3;c++)pixel+=Math.abs(a[i+c]*aa-b[i+c]*ba);error+=pixel/3;if(pixel/3>30)large++;if(a[i+3]>20||b[i+3]>20){union++;if(Math.abs(a[i+3]-b[i+3])>100)missing++;}if(a[i+3]>20)filled++;}
 const pixels=a.length/4;return {seconds,meanError:error/pixels/255,largeDifference:large/pixels,geometryDifference:missing/Math.max(1,union),filledPixels:filled,native:nativeCopy.toDataURL(),svg:reference.toDataURL()};
}
function showPair(name,capture){const section=document.createElement('section');section.className='pair';const title=document.createElement('h3');title.textContent=name;section.append(title);for(const mode of ['native','svg']){const img=document.createElement('img');img.src=capture[mode];img.alt=`${name} ${mode}`;section.append(img);}document.querySelector('#gallery').append(section);}
async function run(){
 document.querySelector('#run').disabled=true;document.querySelector('#gallery').replaceChildren();errors.length=0;
 const timelineCount=manifest.characters.reduce((n,item)=>n+item.clips.length,0);
 const report={testedAt:new Date().toISOString(),status:'PASS',scope:`Official Rive WebGL2 import; all ${timelineCount} native timelines; six deterministic samples each compared with the supplied SVG motion; load/destroy cycles. Browser visuals require review; real devices not tested.`,runtime:runtimeInfo,files:[],errors};
 try {
  for(const item of manifest.characters){const record=await load(item);report.files.push(record);
   for(const clip of item.clips){status.textContent=`Rendering ${item.slug} / ${clip.name}`;changeAction(clip.name);const times=[0,.35,.9,1.55,clip.seconds*.8,clip.seconds-.02];const samples=[];let capture;
    for(const time of times){const current=await frame(time);samples.push({seconds:time,meanError:current.meanError,largeDifference:current.largeDifference,geometryDifference:current.geometryDifference,filledPixels:current.filledPixels});if(time===1.55)capture=current;}
    const passed=samples.every(s=>s.filledPixels>1000&&s.meanError<.025&&s.geometryDifference<.08);
    record.checks.push({action:clip.name,status:passed?'PASS':'FAIL',samples});if(!passed)report.status='FAIL';
    record.captures.push({name:`${item.slug}--${clip.name}`,native:capture.native,svg:capture.svg});showPair(`${item.name} · ${clip.name}`,capture);
   }
  }
 }catch(error){report.status='FAIL';errors.push(error.stack||String(error));}finally{cleanup();}
 if(errors.length)report.status='FAIL';
 const response=await fetch('/native-results',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report)});if(!response.ok)throw new Error(await response.text());
 const checks=report.files.flatMap(f=>f.checks);reportElement.textContent=JSON.stringify({status:report.status,characters:report.files.length,actions:checks.length,samples:checks.reduce((n,c)=>n+c.samples.length,0),passed:checks.filter(c=>c.status==='PASS').length,errors},null,2);
 status.textContent=`${report.status}: ${checks.filter(c=>c.status==='PASS').length}/${checks.length} timelines. Evidence saved.`;document.querySelector('#run').disabled=false;
}
document.querySelector('#run').addEventListener('click',()=>run().catch(e=>{status.textContent=`FAIL: ${e.message}`;document.querySelector('#run').disabled=false;}));
document.querySelector('#review').addEventListener('click',async()=>{try{const item=manifest.characters.find(i=>i.slug===character.value);await load(item);changeAction(action.value);const result=await frame(1.55);status.textContent=`${item.name} / ${action.value}: mean error ${(result.meanError*100).toFixed(3)}%, geometry difference ${(result.geometryDifference*100).toFixed(3)}%`; }catch(e){status.textContent=String(e);}});
window.addEventListener('pagehide',()=>{cleanup();renderer?.delete();renderer=null;});
