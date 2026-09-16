/** Rebuild derived CLI source; preserve supplied RML and its IDs/geometry byte-for-byte on disk. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { CHARACTER_IDS } from '../apps/web/src/animation/core/contracts.mjs';
import { synchronizeTimelines, snapshotV1Proof, markNativeProofStale, sha256 } from './sync-native-timelines.mjs';

const defaultRoot = fileURLToPath(new URL('..', import.meta.url));
export function prepareNativeRml(root = defaultRoot) {
  snapshotV1Proof(root);
  const records = [];
  for (const slug of CHARACTER_IDS) {
    const original = readFileSync(resolve(root, `native/rml/${slug}/scene.rml`), 'utf8');
    const motion = readFileSync(resolve(root, `apps/web/public/animation/mobile/${slug}/motion.json`), 'utf8');
    const doc = new DOMParser({ onError: (level, message) => { throw new Error(`${level}: ${message}`); } }).parseFromString(original, 'application/xml');
    // Official CLI transforms.md: first sibling draws on top. Original SVG uses last-on-top.
    for (const node of Array.from(doc.getElementsByTagName('*'))) {
      if (!['Node', 'Artboard'].includes(node.tagName)) continue;
      const children = Array.from(node.childNodes).filter(child => child.nodeType === 1 && ['Node', 'Shape'].includes(child.nodeName));
      for (const child of children.reverse()) node.appendChild(child);
    }
    const result = synchronizeTimelines(new XMLSerializer().serializeToString(doc), JSON.parse(motion));
    const output = resolve(root, `native/build-source/${slug}`);
    mkdirSync(output, { recursive: true });
    writeFileSync(resolve(output, 'scene.rml'), result.rml);
    writeFileSync(resolve(output, 'rive.yaml'), `name: ${slug}\n`);
    records.push({ slug, originalRmlSHA256: sha256(original), motionSHA256: sha256(motion), buildRmlSHA256: sha256(result.rml), ...result.stats });
  }
  markNativeProofStale(root, records);
  writeFileSync(resolve(root, 'native/reports/timeline-sync.json'), JSON.stringify({ status: 'PASS', schema: 'tsc-native-timeline-sync/v2', generatedAt: new Date().toISOString(), format: 'Official Rive CLI RML LinearAnimation/KeyedObject/KeyedProperty/KeyFrameDouble', files: records }, null, 2) + '\n');
  return records;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const records = prepareNativeRml();
  console.log(`Prepared ${records.length} official RML projects: ${records.reduce((n, r) => n + r.animations, 0)} timelines. Supplied RML preserved.`);
}
