import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
process.chdir(root);
mkdirSync('.build/verification', { recursive: true });
const startedAt = new Date().toISOString();
const commands = [
  ['typecheck', 'npm', ['run', 'typecheck']],
  ['application-tests', 'npm', ['test']],
  ['build', 'npm', ['run', 'build']],
  ['assets', 'npm', ['run', 'test:assets']],
  ['standards', 'npm', ['run', 'test:standards']],
  ['built-http-integration', 'npm', ['run', 'test:build']],
];
const results = [];
for (const [id, command, args] of commands) {
  const start = Date.now();
  const result = spawnSync(command, args, { cwd: root, encoding: 'utf8', timeout: 180_000, maxBuffer: 8 * 1024 * 1024 });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}${result.error ? `\n${result.error.message}\n` : ''}`;
  const log = `.build/verification/${id}.log`;
  writeFileSync(log, output);
  const entry = { id, command: [command, ...args].join(' '), status: result.status === 0 ? 'PASS' : 'FAIL', exitCode: result.status, durationMs: Date.now() - start, log, logSha256: createHash('sha256').update(output).digest('hex') };
  results.push(entry);
  console.log(`${entry.status} ${entry.command} (${entry.durationMs} ms)`);
  if (result.status !== 0) { console.error(output); break; }
}
const report = {
  schema: 'tsc-local-verification/v1', startedAt, finishedAt: new Date().toISOString(), node: process.version,
  lockSha256: createHash('sha256').update(readFileSync('package-lock.json')).digest('hex'),
  result: results.length === commands.length && results.every(entry => entry.status === 'PASS') ? 'PASS' : 'FAIL',
  results,
  scope: 'Local source/build/HTTP injection only. No browser, live SMTP, external account, device or production deployment result is inferred.',
};
mkdirSync('docs/standards', { recursive: true });
writeFileSync(resolve(root, 'docs/standards/local-verification.json'), JSON.stringify(report, null, 2) + '\n');
if (report.result !== 'PASS') process.exitCode = 1;
