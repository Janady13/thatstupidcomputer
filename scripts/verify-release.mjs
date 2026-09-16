import { createHash } from 'node:crypto';
import { readFile, lstat, realpath } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('..', import.meta.url)));
const manifest = JSON.parse(await readFile(resolve(root, 'release-manifest.json'), 'utf8'));
if (manifest.schema !== 'tsc-release/v1' || !Array.isArray(manifest.files)) throw new Error('Invalid release manifest.');
const seen = new Set();
for (const item of manifest.files) {
  if (typeof item.path !== 'string' || item.path.startsWith('/') || item.path.split('/').some(part => !part || part === '.' || part === '..') || item.path.includes('\\') || seen.has(item.path)) throw new Error('Invalid manifest path.');
  seen.add(item.path);
  const path = resolve(root, item.path);
  if (!(await realpath(path)).startsWith(root + sep) || !(await lstat(path)).isFile()) throw new Error(`Unsafe release entry: ${item.path}`);
  const bytes = await readFile(path);
  if (bytes.length !== item.bytes || createHash('sha256').update(bytes).digest('hex') !== item.sha256) throw new Error(`Release integrity failed: ${item.path}`);
}
console.log(`Verified ${seen.size} delivered files against the release manifest. This checks transfer integrity, not production acceptance.`);
