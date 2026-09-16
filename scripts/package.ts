import JSZip from 'jszip';
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const topFiles = ['README.md', 'workshop-cleanup-manifest.json', 'AGENTS.md', 'CLAUDE.md', 'package.json', 'package-lock.json', 'tsconfig.json', 'playwright.config.ts', '.env.example', '.nvmrc', '.npmrc', '.gitignore'];
const trees = ['apps', 'packages', 'scripts', 'tests', 'docs', 'deploy', 'native', 'private/standards'];
const required = ['apps/web/dist/index.html', 'apps/web/dist/404.html', 'apps/api/dist/server.mjs', '.build/build-record.json', 'docs/ACCEPTANCE.md', 'docs/WORKSHOP-CLEANUP-ACCEPTANCE.md', 'docs/WORKSHOP-CLEANUP-INTEGRATION.md', 'docs/UPGRADE-ACCEPTANCE.md', 'docs/DESKTOP-ACCEPTANCE.md', 'docs/DESKTOP-INTEGRATION.md', 'docs/desktop-preview/desktop-proof.json', 'docs/CLAUDE-DEPLOYMENT.md', 'docs/standards/build-integration.json', 'docs/standards/local-verification.json'];
for (const name of required) if (!(await lstat(resolve(root, name))).isFile()) throw new Error(`Required delivery file is missing: ${name}`);
const record = JSON.parse(await readFile(resolve(root, '.build/build-record.json'), 'utf8'));
const lock = await readFile(resolve(root, 'package-lock.json'));
if (record.lockSha256 !== createHash('sha256').update(lock).digest('hex')) throw new Error('Dependency lock changed after the build. Rebuild before packaging.');
const local = JSON.parse(await readFile(resolve(root, 'docs/standards/local-verification.json'), 'utf8'));
const integration = JSON.parse(await readFile(resolve(root, 'docs/standards/build-integration.json'), 'utf8'));
if (local.result !== 'PASS' || integration.status !== 'PASS') throw new Error('Complete local verification must pass before packaging.');
for (const artifact of integration.publicBuild as { path: string; sha256: string }[]) {
  if (!artifact.path.startsWith('apps/web/dist/') || artifact.path.split('/').includes('..')) throw new Error('Invalid public build evidence path.');
  const digest = createHash('sha256').update(await readFile(resolve(root, artifact.path))).digest('hex');
  if (digest !== artifact.sha256) throw new Error(`Tested public artifact changed before packaging: ${artifact.path}`);
}
const excludedDirectoryNames = new Set(['node_modules', '.git', '.tools', 'test-results', 'playwright-report', 'artifacts', '__pycache__']);
function include(path: string): boolean {
  if (path.split('/').includes('.build') && !path.startsWith('.build/verification/')) return false;
  if (path.split('/').some(part => excludedDirectoryNames.has(part))) return false;
  if (path.startsWith('native/reports/canvas/')) return false; // Reproducible intermediate frames; all metrics and reviewed sheets are included.
  if (/^native\/reports\/(minimal|.*-cli\.)/.test(path)) return false; // Failed early graphics-environment probes, not acceptance evidence.
  if (/(?:^|\/)\.env(?:\.|$)/.test(path) && path !== '.env.example') return false;
  if (/\.(?:py|pyc|pyo|pem|key|map|zip|tar|gz)$/i.test(path)) return false;
  if (path.endsWith('/runtime.env') || path.endsWith('/build.env')) return false;
  return true;
}
async function walk(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    const name = `${directory}/${entry.name}`;
    if (!include(name)) continue;
    if (entry.isSymbolicLink()) throw new Error(`Refusing to package a symlink: ${name}`);
    if (entry.isDirectory()) result.push(...await walk(name));
    else if (entry.isFile()) result.push(name);
  }
  return result;
}
const files = [...topFiles, '.build/build-record.json'];
files.push(...await walk('.build/verification'));
for (const tree of trees) files.push(...await walk(tree));
const unique = [...new Set(files)].sort();
const zip = new JSZip();
const manifest: { schema: string; createdAt: string; deployment: string; files: {path: string; bytes: number; sha256: string}[] } = {
  schema: 'tsc-release/v1', createdAt: new Date().toISOString(), deployment: record.deployment, files: [],
};
const stableDate = new Date('2026-09-13T00:00:00Z');
for (const name of unique) {
  const bytes = await readFile(resolve(root, name));
  manifest.files.push({ path: name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  zip.file(`TSC-WORKSHOP-CLEANUP-v4/${name}`, bytes, { date: stableDate, unixPermissions: name.endsWith('.sh') ? 0o100755 : 0o100644 });
}
zip.file('TSC-WORKSHOP-CLEANUP-v4/release-manifest.json', JSON.stringify(manifest, null, 2) + '\n', { date: stableDate, unixPermissions: 0o100644 });
const archive = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 }, platform: 'UNIX' });
const output = resolve(root, 'artifacts/TSC-WORKSHOP-CLEANUP-v4.zip');
await mkdir(resolve(root, 'artifacts'), { recursive: true });
await writeFile(output, archive);
const sha256 = createHash('sha256').update(archive).digest('hex');
await writeFile(`${output}.sha256`, `${sha256}  TSC-WORKSHOP-CLEANUP-v4.zip\n`);
console.log(JSON.stringify({ archive: output, bytes: archive.length, files: manifest.files.length + 1, sha256, deployment: record.deployment, note: 'Contains complete source and compiled preview; live production bindings are documented in docs/CLAUDE-DEPLOYMENT.md.' }, null, 2));
