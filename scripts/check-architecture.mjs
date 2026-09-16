import { readFileSync, existsSync, readdirSync, statSync, realpathSync } from 'node:fs';
import { resolve, relative, dirname, extname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { builtinModules } from 'node:module';
import { buildSync } from 'esbuild';

const defaultRoot = fileURLToPath(new URL('..', import.meta.url));
const serverModules = new Set([...builtinModules, ...builtinModules.map(name => `node:${name}`), 'fastify', 'nodemailer']);
const code = /\.(?:[cm]?[jt]s|[jt]sx)$/;
const declaration = /\.d\.[cm]?ts$/;
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mts', '.mjs', '.cts', '.cjs'];
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? files(resolve(directory, entry.name)) : code.test(entry.name) && !declaration.test(entry.name) ? [resolve(directory, entry.name)] : []);
}
function localFile(root, from, name) {
  name = name.split(/[?#]/, 1)[0];
  const stem = name.startsWith('@/') ? resolve(root, 'apps/web/src', name.slice(2)) : name.startsWith('.') ? resolve(dirname(from), name) : null;
  if (!stem) return null;
  const candidates = [stem];
  // Match Vite's explicit JS-output -> TypeScript-source substitutions before
  // trying appended extensions, so those spellings cannot hide runtime edges.
  const extension = extname(stem);
  if (/^\.(?:js|jsx|mjs|cjs)$/.test(extension)) {
    const base = stem.slice(0, -extension.length);
    candidates.push(base + extension.replace('js', 'ts'));
    if (extension === '.js') candidates.push(base + '.tsx');
  }
  candidates.push(...extensions.map(suffix => stem + suffix), ...extensions.map(suffix => `${stem}/index${suffix}`));
  const target = candidates.find(candidate => existsSync(candidate) && statSync(candidate).isFile());
  return target ? realpathSync(target) : null;
}

/** Check actual runtime import edges, including lazy imports, without following type-only edges. */
export function auditArchitecture(root = defaultRoot) {
  // Import targets are resolved to physical paths; use that same identity for
  // the root and graph keys (notably macOS /var -> /private/var aliases).
  root = realpathSync(root);
  const violations = [];
  const visited = new Set();
  // The installed transpiler removes type-only imports and reports real static and
  // dynamic edges. Nothing is written or executed; this also works with native TS 7.
  const result = buildSync({
    absWorkingDir: root,
    entryPoints: ['apps/web/src', 'apps/api/src', 'packages'].flatMap(directory => files(resolve(root, directory))),
    bundle: false, write: false, metafile: true, outdir: '.build/architecture',
    platform: 'neutral', format: 'esm', jsx: 'automatic', target: 'es2022', logLevel: 'silent',
  });
  const edges = new Map(Object.values(result.metafile.outputs).filter(info => info.entryPoint).map(info => [resolve(root, info.entryPoint), info.imports.map(item => item.path)]));
  const imports = file => edges.get(file) ?? [];
  const visit = file => {
    if (visited.has(file)) return;
    visited.add(file);
    for (const name of imports(file)) {
      const owner = relative(root, file);
      if (serverModules.has(name) || name.startsWith('node:')) violations.push(`${owner}: server runtime import ${name}`);
      const target = localFile(root, file, name);
      if (!target) continue;
      const path = relative(root, target);
      if (/^(?:apps\/api|private|native|scripts|deploy)\//.test(path) || path.startsWith('..')) violations.push(`${owner}: browser imports protected source ${path}`);
      else if (path.startsWith('packages/discovery/') && !(/^packages\/discovery\/(?:registry|contract)\.ts$/.test(path)||/^packages\/discovery\/providers\/[^/]+\/profile\.ts$/.test(path))) violations.push(`${owner}: browser imports private discovery integration ${path}`);
      else if (code.test(target)) visit(target);
    }
  };
  visit(resolve(root, 'apps/web/src/entry-client.tsx'));
  for (const directory of ['apps/web/src/animation', 'apps/api/src', 'packages']) {
    for (const file of files(resolve(root, directory))) {
      for (const name of imports(file)) {
        const target = localFile(root, file, name);
        if (!target) continue;
        const path = relative(root, target);
        if (directory.endsWith('animation') && /^apps\/web\/src\/(?:components|measurement)\//.test(path)) violations.push(`${relative(root, file)}: animation depends on product UI ${path}`);
        if (directory !== 'apps/web/src/animation' && path.startsWith('apps/web/src/')) violations.push(`${relative(root, file)}: shared/server source depends on web UI ${path}`);
      }
    }
  }
  const css = readFileSync(resolve(root, 'apps/web/src/styles/site.css'), 'utf8');
  for (const [, name] of css.matchAll(/@import\s+"(.+)";/g)) {
    if (!existsSync(resolve(root, 'apps/web/src/styles', name))) violations.push(`Missing CSS module ${name}`);
  }
  for (const entry of readdirSync(resolve(root, 'apps/web/public'))) {
    if (['private', 'native', 'src', 'tests', 'node_modules', 'deploy'].includes(entry) || entry.startsWith('.')) violations.push(`Forbidden public directory ${entry}`);
  }
  return { checkedBrowserModules: visited.size, violations };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const result = auditArchitecture();
  console.log(JSON.stringify(result, null, 2));
  if (result.violations.length) process.exitCode = 1;
}
