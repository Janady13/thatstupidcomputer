import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
process.chdir(root);
function collect(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? collect(join(dir, entry.name)) : /\.test\.(?:ts|mjs)$/.test(entry.name) ? [join(dir, entry.name)] : []);
}
const tests = collect('tests').sort();
if (!tests.length) throw new Error('No tests found.');
const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...tests], { stdio: 'inherit', cwd: root, timeout: 180000 });
if (result.error) { console.error(result.error.message); process.exitCode = 1; }
else process.exitCode = result.status ?? 1;
