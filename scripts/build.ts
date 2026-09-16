import { build as viteBuild } from 'vite';
import { build as bundle } from 'esbuild';
import { mkdir, readFile, writeFile, rm, readdir, unlink, rmdir, lstat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { ROUTES, getPage } from '../packages/site/content.ts';
import { loadSiteConfig, type PublicSiteConfig } from '../packages/site/truth.ts';
import { renderHead } from '../packages/site/search.ts';
import { generateSearch } from './generate-search.ts';

const root = fileURLToPath(new URL('..', import.meta.url));
process.chdir(root);
if (existsSync('.env')) process.loadEnvFile('.env');
const production = process.argv.includes('--production');
const config = loadSiteConfig({
  deployment: production ? 'production' : 'preview',
  projectionPath: process.env.TSC_TRUTH_PROJECTION,
  ga4MeasurementId: process.env.GA4_MEASUREMENT_ID,
});
const output = resolve(root, 'apps/web/dist');
execFileSync(process.execPath, [resolve(root, 'scripts/sync-rive-wasm.mjs')], { stdio: 'inherit' });
const ssrOutput = resolve(root, '.build/ssr');
await mkdir(resolve(root, '.build'), { recursive: true });
// Validation runs before deleting output, so a rejected truth projection preserves the last build.
// Explicit, non-following unlinks also work on hosts whose recursive directory
// removal leaves old build files behind. Never traverse an output symlink.
async function clearOutput(directory: string): Promise<void> {
  if (!existsSync(directory)) return;
  const info = await lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Build output must be a real directory.');
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory() && !entry.isSymbolicLink()) await clearOutput(path);
    else await unlink(path);
  }
  await rmdir(directory);
}
await clearOutput(output);
await clearOutput(ssrOutput);
const clientBuild = await viteBuild({ configFile: resolve(root, 'apps/web/vite.config.ts'), build: { outDir: output, emptyOutDir: true } });
const emittedFiles = new Set<string>();
for (const result of Array.isArray(clientBuild) ? clientBuild : [clientBuild]) {
  if (!('output' in result)) throw new Error('Expected a finite client build, not a watcher.');
  for (const item of result.output) emittedFiles.add(item.fileName);
}
// The bundler's own returned inventory is authoritative for the generated assets
// namespace. Do not ship files from a previous dependency graph.
for (const entry of await readdir(resolve(output, 'assets'), { withFileTypes: true })) {
  if (!entry.isFile()) throw new Error('Generated assets must be regular files.');
  if (!emittedFiles.has(`assets/${entry.name}`)) await unlink(resolve(output, 'assets', entry.name));
}
await viteBuild({ configFile: resolve(root, 'apps/web/vite.config.ts'), publicDir: false, build: {
  outDir: ssrOutput, emptyOutDir: true, ssr: resolve(root, 'apps/web/src/entry-server.tsx'), manifest: false,
  rollupOptions: { output: { entryFileNames: 'entry-server.js' } },
} });
const renderer = await import(pathToFileURL(resolve(ssrOutput, 'entry-server.js')).href) as { render(path: string, config: PublicSiteConfig): string };
const template = await readFile(resolve(output, 'index.html'), 'utf8');
for (const marker of ['<!--tsc-head-->', '<!--tsc-app-->', '<!--tsc-config-->']) {
  if (!template.includes(marker)) throw new Error(`Build template missing ${marker}`);
}
const safeConfig = JSON.stringify(config).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
function html(path: string) {
  const head = renderHead(getPage(path), config).replace(/<(title|meta|link|script)\b/g, '<$1 data-tsc-head');
  return template.replace('<!--tsc-head-->', head).replace('<!--tsc-app-->', renderer.render(path, config)).replace('<!--tsc-config-->', safeConfig);
}
for (const page of ROUTES) {
  const directory = resolve(output, `.${page.path}`);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), html(page.path));
}
await writeFile(resolve(output, '404.html'), html('/not-found/'));
await generateSearch({ outDir: output, config });
await rm(resolve(output, '.vite/manifest.json'), { force: true });
await rm(resolve(output, '.vite'), { recursive: true, force: true });
if (existsSync(resolve(output, '.vite/manifest.json'))) throw new Error('Internal Vite manifest remained in public output.');
await mkdir(resolve(root, 'apps/api/dist'), { recursive: true });
await bundle({ entryPoints: [resolve(root, 'apps/api/src/index.ts')], outfile: resolve(root, 'apps/api/dist/server.mjs'), bundle: true, platform: 'node', target: 'node24', format: 'esm', packages: 'external', sourcemap: false });
await bundle({ entryPoints: [resolve(root, 'scripts/discovery.ts')], outfile: resolve(root, 'apps/api/dist/discovery.mjs'), bundle: true, platform: 'node', target: 'node24', format: 'esm', packages: 'external', sourcemap: false });
const lockHash = createHash('sha256').update(await readFile(resolve(root, 'package-lock.json'))).digest('hex');
await writeFile(resolve(root, '.build/build-record.json'), JSON.stringify({
  builtAt: new Date().toISOString(), deployment: config.deployment, truthStatus: config.truthStatus,
  routes: ROUTES.map(page => page.path), node: process.version, lockSha256: lockHash,
  canonicalOrigin: config.canonicalOrigin, publicRoot: 'apps/web/dist', backend: 'apps/api/dist/server.mjs',
  truthCommit: production ? process.env.TSC_TRUTH_COMMIT : null,
  truthSha256: production ? process.env.TSC_TRUTH_SHA256 : null,
  crawlerPolicy: config.crawlerPolicy,
  ga4MeasurementId: config.ga4MeasurementId ?? null,
  clientAssets: [...emittedFiles].filter(file => file.startsWith('assets/')).sort(),
}, null, 2) + '\n');
console.log(`Built ${ROUTES.length} complete React routes, a 404 page and the direct-email backend (${config.deployment}).`);
