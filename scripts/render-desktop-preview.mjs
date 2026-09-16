/** Actual desktop SVG/controller proof. Local XML attribute composition and rasterization only.
 * Run: node --import tsx scripts/render-desktop-preview.mjs [--sheets-only]
 * No browser, browser engine, HTTP server, Rive conversion or network request is used.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { tsImport } from 'tsx/esm/api';
import { ComputerMotion } from '../apps/web/src/animation/desktop/computer-motion.mjs';

export const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url));
export const OUTPUT_DIR = resolve(PROJECT_ROOT, 'docs/desktop-preview');
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const serializer = new XMLSerializer();
let sessionActive = false;

/** These are explicitly bounded controller-test primitives, not a DOM/browser engine. */
function installControllerPrimitives(reducedMotion) {
  const previous = new Map();
  const listeners = new Set();
  const replace = (key, value) => { previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key)); Object.defineProperty(globalThis, key, { configurable: true, writable: true, value }); };
  replace('document', { hidden: false, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn) });
  replace('matchMedia', query => ({ media: query, matches: reducedMotion, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn) }));
  replace('requestAnimationFrame', () => { throw new Error('Offline proof must use the external controller clock; no animation scheduler is permitted'); });
  replace('cancelAnimationFrame', () => {});
  return () => { for (const [key, descriptor] of previous) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; } };
}

export async function createDesktopProofSession({ reducedMotion = false, attitudeEnabled = true } = {}) {
  if (sessionActive) throw new Error('Desktop proof sessions must be sequential because controller-test primitives are scoped globals');
  sessionActive = true;
  let restore = () => {};
  try {
    const [{ ComputerGeometry }, { DEFAULT_PALETTE }] = await Promise.all([
      tsImport('../apps/web/src/animation/desktop/ComputerGeometry.tsx', import.meta.url),
      tsImport('../apps/web/src/animation/office/catalog.ts', import.meta.url),
    ]);
    const markup = renderToStaticMarkup(React.createElement(ComputerGeometry, { idPrefix: 'desktop-proof', palette: DEFAULT_PALETTE, artRef: null }));
    if (/<(?:script|foreignObject|image)\b|(?:href|src)="(?:https?:|\/\/)/i.test(markup)) throw new Error('Proof geometry must be self-contained vector markup');
    const document = new DOMParser().parseFromString(markup, 'image/svg+xml');
    const svg = document.documentElement;
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const nodes = Array.from(svg.getElementsByTagName('*'));
    // The controller only needs named-element discovery and dataset state attributes.
    svg.querySelectorAll = selector => {
      if (selector !== '[id]') throw new Error(`Unsupported offline controller selector: ${selector}`);
      return nodes.filter(node => node.hasAttribute('id'));
    };
    for (const node of nodes) Object.defineProperty(node, 'id', { configurable: true, get: () => node.getAttribute('id') });
    svg.dataset = new Proxy({}, { set(_, key, value) { svg.setAttribute('data-' + String(key).replace(/[A-Z]/g, letter => '-' + letter.toLowerCase()), String(value)); return true; } });
    svg.addEventListener = () => {}; svg.removeEventListener = () => {};
    restore = installControllerPrimitives(reducedMotion);
    const cables = JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'apps/web/src/animation/desktop/cable-poses.json'), 'utf8'));
    const controller = new ComputerMotion(svg, { cables, externalClock: true, pointer: false, autoplay: false, attitudeEnabled });
    if (typeof controller.seek !== 'function' || typeof controller.getSnapshot !== 'function') throw new Error('The upgraded actual desktop controller must provide seek() and getSnapshot()');
    let closed = false;
    return {
      svg, controller, originalMarkup: markup, palette: DEFAULT_PALETTE,
      render(state, seconds) {
        if (closed) throw new Error('Proof session is closed');
        controller.setState(state, { immediate: true });
        controller.seek(seconds);
        const snapshot = controller.getSnapshot();
        const xml = serializer.serializeToString(svg);
        if (/NaN|Infinity|undefined/.test(xml)) throw new Error(`Invalid rendered SVG attributes: ${state}`);
        return { svg: xml, snapshot, sha256: sha256(xml) };
      },
      serialize() { return serializer.serializeToString(svg); },
      close() { if (closed) return; closed = true; controller.destroy(); restore(); sessionActive = false; },
    };
  } catch (error) { restore(); sessionActive = false; throw error; }
}

export async function rasterizeDesktop(svg, { width = 640, height = 640, background = '#F4E5C4' } = {}) {
  const canvas = createCanvas(width, height), ctx = canvas.getContext('2d');
  if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, width, height); }
  const image = await loadImage(Buffer.from(svg));
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
}

function sourceBindings() {
  const desktop = 'apps/web/src/animation/desktop';
  // Bind actual rendering inputs. React lifecycle/page wrappers are outside this proof's scope.
  const paths = ['ComputerGeometry.tsx', 'DesktopGestures.tsx', 'gesture-geometry.mjs', 'computer-motion.mjs', 'performances.mjs', 'cable-poses.json'].map(name => `${desktop}/${name}`);
  paths.push('apps/web/src/animation/office/catalog.ts', 'apps/web/src/animation/core/contracts.mjs', 'scripts/render-desktop-preview.mjs', 'package-lock.json');
  return paths.sort().map(path => ({ path, sha256: sha256(readFileSync(resolve(PROJECT_ROOT, path))) }));
}
function assertUnchanged(bindings) { for (const record of bindings) if (sha256(readFileSync(resolve(PROJECT_ROOT, record.path))) !== record.sha256) throw new Error(`Source changed during proof generation: ${record.path}`); }
function artifact(path) { const bytes = readFileSync(path); return { path: relative(PROJECT_ROOT, path), sha256: sha256(bytes), bytes: bytes.length }; }
const writeJSON = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n');
function text(ctx, value, x, y, size = 18, color = '#29261F', weight = 400) { ctx.fillStyle = color; ctx.font = `${weight} ${size}px sans-serif`; ctx.fillText(value, x, y); }

export async function renderDesktopPreview({ sheetsOnly = false } = {}) {
  const { DESKTOP_PERFORMANCES } = await import('../apps/web/src/animation/desktop/performances.mjs');
  if (DESKTOP_PERFORMANCES.length !== 32) throw new Error('Desktop proof requires the complete 32-performance contract');
  const sources = sourceBindings(), session = await createDesktopProofSession();
  mkdirSync(resolve(OUTPUT_DIR, 'states'), { recursive: true });
  const proof = { schema: 'tsc-desktop-runtime-proof/v3', status: 'RUNNING', generatedAt: new Date().toISOString(), source: 'React ComputerGeometry -> xmldom named attributes -> actual ComputerMotion.setState/seek/_draw/getSnapshot -> napi Canvas SVG rasterizer. Offline character proof, not a browser or website recording.', browserVerified: false, browserPolicy: 'BLOCKED', stateCount: DESKTOP_PERFORMANCES.length, sources, environment: { node: process.version, react: React.version, canvas: JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'node_modules/@napi-rs/canvas/package.json'))).version, xmldom: JSON.parse(readFileSync(resolve(PROJECT_ROOT, 'node_modules/@xmldom/xmldom/package.json'))).version }, states: [], sheets: [], limitations: ['No browser, CSS layout, interaction, navigation, form submission or real device validation.', 'The controller is exercised through a deterministic external clock; no browser scheduling or pointer events are replayed.', 'The reel uses authored excerpts and mock captions; it does not demonstrate a completed demo request.', 'The SVG and procedural cable/gesture controller remain the real implementation; mobile Rive bytes are unchanged.'] };
  writeJSON(resolve(OUTPUT_DIR, 'desktop-proof.json'), proof);
  try {
    const captures = [];
    for (const performance of DESKTOP_PERFORMANCES) {
      const frame = session.render(performance.id, performance.peakSeconds);
      const image = await rasterizeDesktop(frame.svg);
      const svgPath = resolve(OUTPUT_DIR, `states/${performance.id}.svg`), pngPath = resolve(OUTPUT_DIR, `states/${performance.id}.png`);
      writeFileSync(svgPath, frame.svg); writeFileSync(pngPath, image.toBuffer('image/png'));
      proof.states.push({ id: performance.id, label: performance.label, seconds: performance.peakSeconds, snapshot: frame.snapshot, svg: artifact(svgPath), png: artifact(pngPath) });
      captures.push({ performance, image });
    }
    async function sheet(records, path, columns, size, title) {
      const gap = 22, top = 110, cellH = size + 66, width = columns * (size + gap) + gap, height = top + Math.ceil(records.length / columns) * cellH + 34;
      const canvas = createCanvas(width, height), ctx = canvas.getContext('2d'); ctx.fillStyle = '#eee8da'; ctx.fillRect(0, 0, width, height);
      text(ctx, title, 26, 42, 28, '#29261f', 700); text(ctx, 'Original CRT drawing · actual SVG controller · offline rendered proof · attitudes remain censored', 27, 77, 17, '#645d51');
      records.forEach(({ performance, image }, index) => { const x = gap + index % columns * (size + gap), y = top + Math.floor(index / columns) * cellH; ctx.drawImage(image, x, y, size, size); text(ctx, performance.label, x + 8, y + size + 28, 23, '#29261f', 700); text(ctx, `${performance.id} · ${performance.peakSeconds.toFixed(2)}s`, x + 8, y + size + 51, 16, '#645d51'); });
      writeFileSync(path, canvas.toBuffer('image/png')); proof.sheets.push({ ...artifact(path), width, height, states: records.map(({ performance }) => performance.id) });
    }
    await sheet(captures, resolve(OUTPUT_DIR, 'TSC-Desktop-32-States.png'), 4, 440, 'That Stupid Computer / 32 desktop performances');
    for (let start = 0; start < captures.length; start += 8) await sheet(captures.slice(start, start + 8), resolve(OUTPUT_DIR, `TSC-Desktop-Details-${String(start / 8 + 1).padStart(2, '0')}.png`), 2, 640, `Desktop performance details / ${start + 1}–${start + 8}`);
    assertUnchanged(sources); proof.status = 'SHEETS_READY'; writeJSON(resolve(OUTPUT_DIR, 'desktop-proof.json'), proof);
    console.log(`Desktop contact sheets ready: ${proof.states.length} actual controller states.`);
    if (!sheetsOnly) proof.video = await renderReel(session, DESKTOP_PERFORMANCES, sources);
    assertUnchanged(sources); proof.status = 'PASS'; proof.completedAt = new Date().toISOString();
    writeJSON(resolve(OUTPUT_DIR, 'desktop-proof.json'), proof); console.log(JSON.stringify({ status: proof.status, states: proof.states.length, sheets: proof.sheets.length, video: proof.video?.path }));
    return proof;
  } catch (error) { proof.status = 'FAIL'; proof.error = error.message; writeJSON(resolve(OUTPUT_DIR, 'desktop-proof.json'), proof); throw error; }
  finally { session.close(); }
}

async function renderReel(session, performances, bindings) {
  const byId = Object.fromEntries(performances.map(item => [item.id, item]));
  // Explicit authored excerpts: a proof edit, not a recording of page or form behavior.
  const selections = [
    ['idle', 'Still here. Still a little skeptical.'], ['amused', 'A sense of humor comes standard.'],
    ['skeptical', 'Some ideas deserve a second look.'], ['facepalm', 'We have all been there.'],
    ['rude-flip-off', 'A little attitude. Always censored.'], ['double-flip-off', 'Okay. A lot of attitude.'],
    ['point-left', 'Look this way.'], ['point-right', 'Now over here.'],
    ['beckon', 'Come take a closer look.'], ['demo-invite', 'Get my demo'],
    ['revived', 'Ready for a fresh start.'], ['bow', 'Your corner of the internet. With character.'],
  ];
  for (const [id] of selections) if (!byId[id]) throw new Error(`Missing reel state ${id}; use the actual desktop metadata ID`);
  const probe = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8', timeout: 10000 });
  if (probe.status !== 0) throw new Error('A local ffmpeg encoder is required');
  const width = 1280, height = 720, fps = 24, shotSeconds = 2.5;
  const canvas = createCanvas(width, height), ctx = canvas.getContext('2d');
  const output = resolve(OUTPUT_DIR, 'TSC-Desktop-Character-v3.mp4');
  const encoder = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pixel_format', 'rgba', '-video_size', `${width}x${height}`, '-framerate', String(fps), '-i', 'pipe:0', '-an', '-c:v', 'libx264', '-threads', '2', '-preset', 'fast', '-crf', '19', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', output], { stdio: ['pipe', 'ignore', 'pipe'] });
  let errors = '', frames = 0; const frameHashes = [], shots = [], chapterCaptures = [];
  mkdirSync(resolve(OUTPUT_DIR, 'reel-captures'), { recursive: true });
  encoder.stderr.on('data', chunk => { errors = (errors + chunk).slice(-5000); });
  const done = once(encoder, 'close'); const deadline = setTimeout(() => encoder.kill('SIGTERM'), 180000);
  try {
    for (const [id, caption] of selections) {
      const performance = byId[id];
      const start = Math.max(0, Math.min(performance.peakSeconds - shotSeconds / 2, Math.max(0, performance.seconds - shotSeconds)));
      shots.push({ id, sourceStartSeconds: start, excerptSeconds: shotSeconds, firstFrame: frames, caption, mockCaption: true });
      for (let frame = 0; frame < fps * shotSeconds; frame++) {
        const seconds = Math.min(performance.seconds, start + frame / fps);
        const rendered = session.render(id, seconds), actor = await loadImage(Buffer.from(rendered.svg));
        ctx.fillStyle = '#eee8da'; ctx.fillRect(0, 0, width, height);
        text(ctx, 'THAT STUPID COMPUTER  /  THE ORIGINAL DESKTOP CHARACTER', 44, 42, 14, '#a24d25', 700);
        text(ctx, 'Offline animation reel · actual SVG controller', 44, 70, 15, '#645d51');
        ctx.drawImage(actor, 24, 77, 636, 636);
        text(ctx, performance.label, 682, 247, 37, '#29261f', 700);
        const words = caption.split(' '); let line = '', y = 296;
        for (const word of words) { const next = line ? line + ' ' + word : word; ctx.font = '24px sans-serif'; if (ctx.measureText(next).width > 510 && line) { text(ctx, line, 684, y, 24, '#645d51'); y += 35; line = word; } else line = next; }
        if (line) text(ctx, line, 684, y, 24, '#645d51');
        if (id === 'demo-invite') { ctx.fillStyle = '#29261f'; ctx.fillRect(684, 369, 236, 60); text(ctx, 'Get my demo', 720, 408, 23, '#f4e5c4', 700); text(ctx, 'Mock caption — not an interactive form', 684, 465, 15, '#645d51'); }
        text(ctx, `${String(shots.length).padStart(2, '0')} / ${selections.length}    ${id} · t=${seconds.toFixed(2)}s`, 45, 694, 13, '#645d51');
        text(ctx, 'Browser validation remains blocked', 920, 694, 13, '#645d51');
        if (frame === fps * shotSeconds / 2) {
          const png = canvas.toBuffer('image/png'), capturePath = resolve(OUTPUT_DIR, `reel-captures/${id}.png`);
          writeFileSync(capturePath, png); chapterCaptures.push({ id, frame: frames, seconds, ...artifact(capturePath) });
          if (id === 'demo-invite') writeFileSync(resolve(OUTPUT_DIR, 'TSC-Desktop-Character-v3-poster.png'), png);
        }
        const rgba = ctx.getImageData(0, 0, width, height).data;
        frameHashes.push({ frame: frames, state: id, seconds, svgSHA256: rendered.sha256, rgbaSHA256: sha256(rgba) });
        if (!encoder.stdin.write(Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength))) await once(encoder.stdin, 'drain');
        frames++;
      }
    }
    encoder.stdin.end(); const [code] = await done;
    if (code !== 0) throw new Error(`ffmpeg failed (${code}): ${errors}`);
    assertUnchanged(bindings);
    writeJSON(resolve(OUTPUT_DIR, 'desktop-reel-frames.json'), { frames: frameHashes, shots });
    return { ...artifact(output), width, height, fps, frames, seconds: frames / fps, ffmpeg: probe.stdout.split('\n')[0], frameEvidence: artifact(resolve(OUTPUT_DIR, 'desktop-reel-frames.json')), poster: artifact(resolve(OUTPUT_DIR, 'TSC-Desktop-Character-v3-poster.png')), chapterCaptures, shots };
  } finally { clearTimeout(deadline); if (encoder.exitCode === null) encoder.kill('SIGTERM'); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await renderDesktopPreview({ sheetsOnly: process.argv.includes('--sheets-only') });
}
