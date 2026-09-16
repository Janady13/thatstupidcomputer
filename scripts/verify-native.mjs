/** Exact native-byte rendering using official Canvas WASM; no browser, HTTP, CDP or WebGL. */
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, writeFileSync, copyFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { createCanvas, Path2D, ImageData, loadImage } from '@napi-rs/canvas';
import { sampleClip } from '../apps/web/src/animation/mobile/character-controller.mjs';
import { CHARACTER_IDS, MOBILE_ACTIONS } from '../apps/web/src/animation/core/contracts.mjs';
import { PERFORMANCES } from '../apps/web/src/animation/performances/catalog.mjs';
const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('..', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export const SAMPLE_FRACTIONS = Object.freeze([0, .125, .30, .50, .75, .98]);

/** Reusable local-frame helper for contact sheets or an offline video encoder. */
export async function createNativeProofSession({ width = 360, height = 460 } = {}) {
  if (![width, height].every(n => Number.isInteger(n) && n > 0 && n <= 2000)) throw new Error('Bounded native canvas dimensions required');
  const runtimeRoot = dirname(require.resolve('@rive-app/canvas'));
  const version = JSON.parse(readFileSync(resolve(runtimeRoot, 'package.json'), 'utf8')).version;
  if (version !== '2.42.1') throw new Error(`Re-review required for Canvas runtime ${version}; expected 2.42.1`);
  Object.assign(globalThis, {
    Path2D, ImageData,
    document: { createElement: tag => {
      if (tag !== 'canvas') throw new Error(`Unsupported DOM-free proof element ${tag}`);
      const canvas = createCanvas(width, height), get = canvas.getContext.bind(canvas);
      canvas.getContext = (type, options) => type === '2d' ? get(type, options) : null;
      return canvas;
    } },
    requestAnimationFrame: callback => setTimeout(() => callback(performance.now()), 16),
    cancelAnimationFrame: id => clearTimeout(id),
  });
  const { RuntimeLoader } = require('@rive-app/canvas');
  const wasm = readFileSync(resolve(runtimeRoot, 'rive.wasm'));
  RuntimeLoader.setWasmBinary(wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength));
  RuntimeLoader.setWasmFallbackUrl(null);
  const runtime = await RuntimeLoader.awaitInstance();
  const canvas = createCanvas(width, height), renderer = runtime.makeRenderer(canvas);
  const handles = new Set();
  let closed = false;
  return {
    canvas, width, height,
    runtime: { name: '@rive-app/canvas', version, wasmSHA256: hash(wasm), renderer: '@napi-rs/canvas', browser: false, networking: false },
    async loadCharacter(bytes, artboardName) {
      if (closed) throw new Error('Native proof session is closed');
      const file = await runtime.load(new Uint8Array(bytes), undefined, false);
      if (!file) throw new Error('Official native importer returned no file');
      const artboard = file.artboardByName(artboardName);
      if (!artboard) { file.delete(); throw new Error(`Missing native artboard ${artboardName}`); }
      const animations = [];
      for (let index = 0; index < artboard.animationCount(); index++) animations.push(artboard.animationByIndex(index).name);
      let instance, selected, disposed = false;
      const handle = {
        artboard: artboard.name, animations,
        draw(clip, seconds) {
          if (closed || disposed) throw new Error('Native actor has been disposed');
          if (!Number.isFinite(seconds) || seconds < 0 || !animations.includes(clip.name)) throw new Error('Invalid native action/time');
          if (selected !== clip.name) {
            instance?.delete();
            instance = new runtime.LinearAnimationInstance(artboard.animationByName(clip.name), artboard);
            selected = clip.name;
          }
          instance.time = clip.loop ? seconds % clip.seconds : Math.min(seconds, clip.seconds);
          instance.apply(1); artboard.advance(0);
          renderer.clear(); renderer.save();
          renderer.align(runtime.Fit.contain, runtime.Alignment.center, { minX: 0, minY: 0, maxX: width, maxY: height }, artboard.bounds);
          artboard.draw(renderer); renderer.restore(); runtime.resolveAnimationFrame();
          return canvas;
        },
        close() { if (disposed) return; disposed = true; instance?.delete(); artboard.delete(); file.delete(); handles.delete(handle); },
      };
      handles.add(handle);
      return handle;
    },
    close() { if (closed) return; for (const handle of [...handles]) handle.close(); renderer.delete(); closed = true; },
  };
}

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
export function referenceSVG(model, clip, seconds, width = 360, height = 460) {
  const pose = sampleClip(clip, seconds), DEG = 180 / Math.PI;
  const render = node => {
    const values = pose[node.id] || {};
    const x = values.x ?? node.x ?? 0, y = values.y ?? node.y ?? 0;
    const rotation = (values.rotation ?? ((node.rotation || 0) / DEG)) * DEG;
    const sx = values.scaleX ?? node.scaleX ?? 1, sy = values.scaleY ?? node.scaleY ?? 1;
    let opacity = values.opacity ?? node.opacity ?? 1;
    if (node.id === 'hand-left-censor' || node.id === 'hand-right-censor') opacity = 1;
    const common = `id="${escape(node.id)}" opacity="${opacity}"`;
    if (node.type === 'group') return `<g ${common} transform="translate(${x} ${y}) rotate(${rotation}) scale(${sx} ${sy})">${(node.children || []).map(render).join('')}</g>`;
    return `<path ${common} d="${escape(node.d)}" fill="${escape(node.fill)}" stroke="${escape(node.stroke)}" stroke-width="${node.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${model.width} ${model.height}">${render(model.root)}</svg>`;
}
export function comparePixels(a, b) {
  if (a.length !== b.length || a.length % 4) throw new Error('Pixel buffers must match');
  let total = 0, large = 0, union = 0, missing = 0, filled = 0;
  for (let i = 0; i < a.length; i += 4) {
    const aa = a[i + 3] / 255, ba = b[i + 3] / 255;
    let pixel = 0;
    for (let color = 0; color < 3; color++) pixel += Math.abs(a[i + color] * aa - b[i + color] * ba);
    total += pixel / 3;
    if (pixel / 3 > 30) large++;
    if (a[i + 3] > 20 || b[i + 3] > 20) { union++; if (Math.abs(a[i + 3] - b[i + 3]) > 100) missing++; }
    if (a[i + 3] > 20) filled++;
  }
  const pixels = a.length / 4;
  return { meanError: total / pixels / 255, largeDifference: large / pixels, geometryDifference: missing / Math.max(1, union), filledPixels: filled };
}
export async function verifyNative({ projectRoot = root } = {}) {
  const reports = resolve(projectRoot, 'native/reports'); mkdirSync(reports, { recursive: true });
  const output = resolve(reports, 'canvas'); mkdirSync(output, { recursive: true });
  const reportPath = resolve(reports, 'native-canvas.json');
  writeFileSync(reportPath, JSON.stringify({ status: 'RUNNING', startedAt: new Date().toISOString(), files: [] }) + '\n');
  writeFileSync(resolve(projectRoot, 'native/canvas-verified-assets.json'), '{}\n');
  writeFileSync(resolve(projectRoot, 'native/canvas-visual-review.json'), '{}\n');
  const assets = resolve(projectRoot, 'apps/web/public/animation');
  const manifest = JSON.parse(readFileSync(resolve(assets, 'manifest.json'), 'utf8'));
  const compiled = JSON.parse(readFileSync(resolve(reports, 'native-compiled.json'), 'utf8'));
  const report = {
    status: 'PASS', testedAt: new Date().toISOString(),
    scope: 'Official Canvas WASM exact-byte import and native timeline rendering in Node with @napi-rs/canvas; five normalized phase samples plus the authored peak per action. Not browser/WebGL, compositor, responsive layout, physical-device or user-interface verification.',
    sampleFractions: SAMPLE_FRACTIONS, authoredPeakReplacesMidpoint: true, thresholds: { meanError: .025, geometryDifference: .08, filledPixelsMinimum: 1000 },
    sourceManifestSHA256: hash(readFileSync(resolve(assets, 'manifest.json'))), files: [],
  };
  let session;
  try {
    if (compiled.status !== 'PASS') throw new Error('Current official compilation has not passed');
    if (JSON.stringify(manifest.characters.map(c => c.slug).sort()) !== JSON.stringify([...CHARACTER_IDS].sort())) throw new Error('Manifest character inventory mismatch');
    session = await createNativeProofSession(); report.runtime = session.runtime;
    console.log(`Official DOM-free Canvas ${session.runtime.version} initialized; browser boundary remains BLOCKED.`);
    for (const item of manifest.characters) {
      const bytes = readFileSync(resolve(projectRoot, `native/compiled/${item.slug}.riv`));
      const motionBytes = readFileSync(resolve(assets, `mobile/${item.slug}/motion.json`));
      const modelBytes = readFileSync(resolve(assets, `mobile/${item.slug}/scene.json`));
      const source = compiled.files.find(file => file.slug === item.slug);
      if (!source || source.sha256 !== hash(bytes) || source.motionSHA256 !== hash(motionBytes) || source.buildRmlSHA256 !== hash(readFileSync(resolve(projectRoot, `native/build-source/${item.slug}/scene.rml`)))) throw new Error(`Stale native bytes or compilation lineage: ${item.slug}`);
      const model = JSON.parse(modelBytes), clips = JSON.parse(motionBytes);
      const names = clips.map(clip => clip.name).sort();
      if (JSON.stringify(names) !== JSON.stringify([...MOBILE_ACTIONS].sort()) || JSON.stringify(names) !== JSON.stringify(item.clips.map(clip => clip.name).sort())) throw new Error(`Authoritative motion/manifest contract mismatch: ${item.slug}`);
      const actor = await session.loadCharacter(bytes, item.artboard);
      if (JSON.stringify([...actor.animations].sort()) !== JSON.stringify(names)) throw new Error(`Native timeline mismatch: ${item.slug}`);
      const record = { slug: item.slug, artboard: actor.artboard, sha256: hash(bytes), bytes: bytes.length, motionSHA256: hash(motionBytes), sceneSHA256: hash(modelBytes), buildRmlSHA256: source.buildRmlSHA256, animations: actor.animations, checks: [] };
      report.files.push(record);
      for (const clip of clips) {
        const samples = [];
        const peakSeconds = PERFORMANCES[clip.name]?.peakSeconds;
        if (!Number.isFinite(peakSeconds) || peakSeconds < 0) throw new Error(`Missing authored peak for ${clip.name}`);
        for (const fraction of SAMPLE_FRACTIONS) {
          const seconds = fraction === .5 ? peakSeconds : clip.seconds * fraction;
          const native = actor.draw(clip, seconds), refCanvas = createCanvas(session.width, session.height), ctx = refCanvas.getContext('2d');
          ctx.drawImage(await loadImage(Buffer.from(referenceSVG(model, clip, seconds))), 0, 0);
          const result = { fraction: seconds / clip.seconds, phase: fraction === .5 ? 'authored-peak' : 'normalized', seconds, ...comparePixels(native.getContext('2d').getImageData(0, 0, session.width, session.height).data, ctx.getImageData(0, 0, session.width, session.height).data) };
          if (fraction === .5) {
            writeFileSync(resolve(output, `${item.slug}--${clip.name}--native.png`), native.toBuffer('image/png'));
            writeFileSync(resolve(output, `${item.slug}--${clip.name}--svg.png`), refCanvas.toBuffer('image/png'));
          }
          samples.push(result);
        }
        const pass = samples.every(sample => sample.filledPixels > 1000 && sample.meanError < .025 && sample.geometryDifference < .08);
        record.checks.push({ action: clip.name, status: pass ? 'PASS' : 'FAIL', captureSeconds: peakSeconds, samples });
        if (!pass) report.status = 'FAIL';
      }
      actor.close();
      console.log(`${item.slug}: ${record.checks.filter(check => check.status === 'PASS').length}/${record.checks.length} native parity checks`);
    }
  } catch (error) { report.status = 'FAIL'; report.error = error.stack || String(error); }
  finally { session?.close(); }
  const checks = report.files.flatMap(file => file.checks);
  report.totals = { characters: report.files.length, actions: checks.length, samples: checks.reduce((sum, check) => sum + check.samples.length, 0), passed: checks.filter(check => check.status === 'PASS').length };
  if (report.totals.characters !== CHARACTER_IDS.length || report.totals.actions !== CHARACTER_IDS.length * MOBILE_ACTIONS.length || report.totals.samples !== CHARACTER_IDS.length * MOBILE_ACTIONS.length * SAMPLE_FRACTIONS.length) report.status = 'FAIL';
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  if (report.status === 'PASS') {
    const entries = {}; mkdirSync(resolve(assets, 'rive'), { recursive: true });
    for (const file of report.files) {
      copyFileSync(resolve(projectRoot, `native/compiled/${file.slug}.riv`), resolve(assets, `rive/${file.slug}.riv`));
      entries[file.slug] = { slug: file.slug, src: `/animation/rive/${file.slug}.riv`, artboard: file.artboard, sha256: file.sha256, status: 'canvas-runtime-verified', runtimeVersion: report.runtime.version, testedAt: report.testedAt, animations: file.animations, actionCount: file.checks.length, sampleCount: file.checks.reduce((n, check) => n + check.samples.length, 0), motionSHA256: file.motionSHA256, browserWebGLVerified: false };
    }
    writeFileSync(resolve(projectRoot, 'native/canvas-verified-assets.json'), JSON.stringify(entries, null, 2) + '\n');
  }
  console.log(`${report.status}: ${report.totals.passed}/${report.totals.actions} actions, ${report.totals.samples} samples. ${report.error || ''}`);
  return report;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const report = await verifyNative();
  if (report.status !== 'PASS') process.exitCode = 1;
}
