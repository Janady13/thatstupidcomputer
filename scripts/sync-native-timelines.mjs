/** Authoritative motion JSON -> existing official RML timeline elements; never a .riv serializer. */
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { CHARACTER_IDS } from '../apps/web/src/animation/core/contracts.mjs';

// Confirmed with official CLI 1.0.2 `rive schema Node`: all six properties are doubles.
export const RML_PROPERTY_KEYS = Object.freeze({ x: 13, y: 14, rotation: 15, scaleX: 16, scaleY: 17, opacity: 18 });
export const sha256 = value => createHash('sha256').update(value).digest('hex');
export function synchronizeTimelines(source, clips) {
  const doc = new DOMParser({ onError: (level, message) => { throw new Error(`${level}: ${message}`); } }).parseFromString(source, 'application/xml');
  const boards = Array.from(doc.getElementsByTagName('Artboard'));
  if (boards.length !== 1) throw new Error('Expected exactly one supplied character artboard');
  const board = boards[0], ids = new Map();
  for (const node of Array.from(board.getElementsByTagName('*'))) {
    if (!['Node', 'Shape'].includes(node.tagName) || !node.hasAttribute('name')) continue;
    const name = node.getAttribute('name'), id = node.getAttribute('id');
    if (ids.has(name)) throw new Error(`Ambiguous original rig node ${name}`);
    if (!/^\d+:\d+$/.test(id)) throw new Error(`Missing original RML ID for ${name}`);
    ids.set(name, id);
  }
  if (!Array.isArray(clips) || !clips.length || clips.length > 100) throw new Error('Expected bounded authoritative motion clips');
  const names = new Set();
  const replacement = [];
  let trackCount = 0, keyframeCount = 0;
  const element = (name, attributes) => { const node = doc.createElement(name); for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value)); return node; };
  for (const clip of clips) {
    if (!/^[A-Za-z][A-Za-z0-9]{0,63}$/.test(clip.name) || names.has(clip.name)) throw new Error('Invalid or duplicate animation name');
    names.add(clip.name);
    if (clip.fps !== 60 || !Number.isInteger(clip.duration) || clip.duration < 1 || clip.duration > 3600 || Math.abs(clip.seconds - clip.duration / clip.fps) > .0001 || typeof clip.loop !== 'boolean') throw new Error(`Invalid authoritative timing: ${clip.name}`);
    if (!Array.isArray(clip.tracks) || !clip.tracks.length || clip.tracks.length > 1500) throw new Error(`Invalid tracks: ${clip.name}`);
    const animation = element('LinearAnimation', { name: clip.name, fps: clip.fps, duration: clip.duration, loopValue: clip.loop ? '1' : '0' });
    const objects = new Map(), channels = new Set();
    for (const track of clip.tracks) {
      const target = ids.get(track.target), propertyKey = RML_PROPERTY_KEYS[track.property];
      if (!target || !Object.hasOwn(RML_PROPERTY_KEYS, track.property) || !['linear', 'hold'].includes(track.interpolation)) throw new Error(`Unsupported target/channel ${clip.name}: ${track.target}.${track.property}`);
      const channel = `${target}:${propertyKey}`;
      if (channels.has(channel)) throw new Error(`Duplicate channel ${channel}`);
      channels.add(channel);
      if (!Array.isArray(track.keys) || track.keys.length < 2 || track.keys.length > 3601 || track.keys[0][0] !== 0 || track.keys.at(-1)[0] !== clip.duration) throw new Error(`Missing channel endpoints: ${channel}`);
      let object = objects.get(target);
      if (!object) { object = element('KeyedObject', { objectId: target }); objects.set(target, object); animation.appendChild(object); }
      const property = element('KeyedProperty', { propertyKey });
      object.appendChild(property);
      let previous = -1;
      for (const key of track.keys) {
        if (!Array.isArray(key) || key.length !== 2 || !Number.isInteger(key[0]) || key[0] <= previous || key[0] > clip.duration || !Number.isFinite(key[1])) throw new Error(`Invalid keyframe: ${channel}`);
        previous = key[0];
        property.appendChild(element('KeyFrameDouble', { frame: key[0], interpolationType: track.interpolation, value: key[1] }));
        keyframeCount++;
      }
      trackCount++;
    }
    replacement.push(animation);
  }
  // Replace only timeline siblings; geometry, hierarchy, IDs and state-machine elements survive.
  for (const child of Array.from(board.childNodes)) if (child.nodeType === 1 && child.nodeName === 'LinearAnimation') board.removeChild(child);
  for (const animation of replacement) board.appendChild(animation);
  return { rml: new XMLSerializer().serializeToString(doc), stats: { animations: clips.length, tracks: trackCount, keyframes: keyframeCount } };
}
export function snapshotV1Proof(root) {
  const history = resolve(root, 'native/history/v1');
  if (existsSync(resolve(history, 'HISTORICAL.json'))) return;
  mkdirSync(history, { recursive: true });
  for (const name of ['reports', 'compiled', 'canvas-verified-assets.json', 'canvas-visual-review.json']) {
    const source = resolve(root, 'native', name);
    if (existsSync(source)) cpSync(source, resolve(history, name), { recursive: true });
  }
  writeFileSync(resolve(history, 'HISTORICAL.json'), JSON.stringify({ status: 'HISTORICAL_V1_ONLY', archivedAt: new Date().toISOString(), note: 'Original 14-action proof copied from the immutable v1 delivery. Does not verify expanded v2 motion or new compiled bytes. Original native/rml and candidates are retained separately.' }, null, 2) + '\n');
}
export function markNativeProofStale(root, records) {
  const reports = resolve(root, 'native/reports'); mkdirSync(reports, { recursive: true });
  const previousFile = resolve(reports, 'native-compiled.json');
  const previous = existsSync(previousFile) ? JSON.parse(readFileSync(previousFile, 'utf8')) : null;
  const current = records.every(record => previous?.files?.some(file => file.slug === record.slug && file.buildRmlSHA256 === record.buildRmlSHA256 && file.motionSHA256 === record.motionSHA256));
  if (current) return;
  writeFileSync(resolve(root, 'native/canvas-verified-assets.json'), '{}\n');
  writeFileSync(resolve(root, 'native/canvas-visual-review.json'), '{}\n');
  writeFileSync(resolve(reports, 'native-canvas.json'), JSON.stringify({ status: 'STALE', reason: 'Authoritative motion/build source changed; exact-byte Canvas proof must be rerun.', files: [] }, null, 2) + '\n');
  writeFileSync(resolve(reports, 'browser-boundary.json'), JSON.stringify({ status: 'BLOCKED', scope: 'Browser/WebGL verification and promotion', reason: 'Existing browser URL policy rejected this workflow. Alternate browsers, CDP, navigation workarounds and browser commands are prohibited. No browser server is started.', permittedAlternative: 'Official Canvas WASM inside Node with @napi-rs/canvas, local bytes only; no HTTP or browser control.' }, null, 2) + '\n');
}
const root = fileURLToPath(new URL('..', import.meta.url));
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  snapshotV1Proof(root);
  const records = [];
  for (const slug of CHARACTER_IDS) {
    const path = resolve(root, `native/build-source/${slug}/scene.rml`);
    const motion = readFileSync(resolve(root, `apps/web/public/animation/mobile/${slug}/motion.json`), 'utf8');
    const result = synchronizeTimelines(readFileSync(path, 'utf8'), JSON.parse(motion));
    writeFileSync(path, result.rml);
    records.push({ slug, originalRmlSHA256: sha256(readFileSync(resolve(root, `native/rml/${slug}/scene.rml`))), motionSHA256: sha256(motion), buildRmlSHA256: sha256(result.rml), ...result.stats });
  }
  markNativeProofStale(root, records);
  writeFileSync(resolve(root, 'native/reports/timeline-sync.json'), JSON.stringify({ status: 'PASS', generatedAt: new Date().toISOString(), files: records }, null, 2) + '\n');
  console.log(`Synchronized ${records.length} existing RML projects from authoritative motion JSON.`);
}
