#!/usr/bin/env node
/** Linux/Node24 release preflight and atomic pointer selection. No email sends. */
import { readFile, writeFile, lstat, realpath, mkdir, symlink, rename, unlink, rmdir } from 'node:fs/promises';
import { resolve, join, dirname, basename, isAbsolute, relative } from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { parseEnv } from 'node:util';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const DEFAULT_ROOT = '/home/user/sites/thatstupidcomputer-runtime';
const DEFAULT_UNIT = 'thatstupidcomputer-runtime.service';
const safeId = value => /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(value) && !value.includes('..');
const fail = message => { throw Object.assign(new Error(message), { safe: true }); };
const isInside = (parent, child) => { const rel = relative(parent, child); return Boolean(rel) && !rel.startsWith('..') && !isAbsolute(rel); };
async function file(path) { const value = await lstat(path); if (!value.isFile()) fail('A required release artifact is not a regular file.'); return value; }
async function privateSnapshot(path, directory) {
  const target = await realpath(path);
  if (await realpath(directory) !== directory || !isInside(directory, target)) fail('Environment snapshot must be inside its protected shared directory without directory aliases.');
  const info = await file(target);
  if ((info.mode & 0o077) !== 0) fail('Environment snapshots require mode 0600 or stricter.');
  const data = await readFile(target, 'utf8');
  if (Buffer.byteLength(data) > 32_768) fail('Environment snapshot exceeds its size limit.');
  return parseEnv(data);
}
export async function validateRelease(runtimeRoot, releaseId) {
  if (!safeId(releaseId)) fail('Use a simple release identifier, not a path.');
  const root = await realpath(runtimeRoot);
  if (root !== resolve(runtimeRoot)) fail('Runtime root must not resolve through a symlink.');
  const releaseDir = join(root, 'releases', releaseId);
  if (await realpath(releaseDir) !== releaseDir) fail('Release directories must not be symlink aliases.');
  if (await realpath(join(root, 'shared')) !== join(root, 'shared')) fail('Shared directory must not be a symlink.');
  const record = JSON.parse(await readFile(join(releaseDir, '.build/build-record.json'), 'utf8'));
  if (record.deployment !== 'production' || record.truthStatus !== 'approved-projection') fail('Activation requires a completed production build with an approved projection.');
  const lockHash = createHash('sha256').update(await readFile(join(releaseDir, 'package-lock.json'))).digest('hex');
  if (record.lockSha256 !== lockHash) fail('The dependency lock differs from the production build record.');
  const runtime = await privateSnapshot(join(releaseDir, 'runtime.env'), join(root, 'shared/runtime-env'));
  const build = await privateSnapshot(join(releaseDir, 'build.env'), join(root, 'shared/build-env'));
  if (!/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(build.TSC_TRUTH_COMMIT || '') || !/^[a-f0-9]{64}$/.test(build.TSC_TRUTH_SHA256 || '') || !['allow', 'deny'].includes(build.AI_TRAINING_POLICY) || !['allow', 'deny'].includes(build.GOOGLE_EXTENDED_POLICY)) fail('The protected build snapshot must explicitly contain full truth pins and both crawler policies.');
  const { loadConfig } = await import(pathToFileURL(join(releaseDir, 'apps/api/src/config.ts')).href);
  const config = loadConfig(runtime);
  if (!config.production || config.host !== '127.0.0.1' || config.port !== 3000 || !config.smtp || config.publicOrigin !== 'https://thatstupidcomputer.com') fail('Runtime requires complete production SMTP configuration, canonical origin, and 127.0.0.1:3000.');
  if (JSON.stringify(config.trustProxy) !== JSON.stringify(['127.0.0.1'])) fail('This proxy template requires TRUST_PROXY=127.0.0.1 exactly. Review any other ingress design separately.');
  if (!build.TSC_TRUTH_PROJECTION || !isAbsolute(build.TSC_TRUTH_PROJECTION)) fail('Build projection path must be absolute.');
  const projection = await realpath(build.TSC_TRUTH_PROJECTION);
  if (!isInside(join(releaseDir, 'private/truth'), projection)) fail('Use the reviewed projection imported into this release private/truth directory.');
  const { loadSiteConfig } = await import(pathToFileURL(join(releaseDir, 'packages/site/truth.ts')).href);
  const publicConfig = loadSiteConfig({
    deployment: 'production', projectionPath: projection,
    expectedCommit: build.TSC_TRUTH_COMMIT, expectedSha256: build.TSC_TRUTH_SHA256,
    aiTrainingPolicy: build.AI_TRAINING_POLICY, googleExtendedPolicy: build.GOOGLE_EXTENDED_POLICY,
    openaiTrainingPolicy: build.OPENAI_TRAINING_POLICY ?? '', anthropicTrainingPolicy: build.ANTHROPIC_TRAINING_POLICY ?? '',
    mistralTrainingPolicy: build.MISTRAL_TRAINING_POLICY ?? '',
    ga4MeasurementId: build.GA4_MEASUREMENT_ID,
    googleSiteVerification: build.GOOGLE_SITE_VERIFICATION, bingSiteVerification: build.BING_SITE_VERIFICATION,
  });
  if (record.truthCommit !== build.TSC_TRUTH_COMMIT || record.truthSha256 !== build.TSC_TRUTH_SHA256) fail('Production build and protected truth pins do not match. Rebuild, never edit the record.');
  if (record.crawlerPolicy?.training !== publicConfig.crawlerPolicy.training || record.crawlerPolicy?.googleExtended !== publicConfig.crawlerPolicy.googleExtended) fail('Crawler policy differs from the production build.');
  for (const field of ['openaiTraining', 'anthropicTraining', 'mistralTraining']) {
    if ((record.crawlerPolicy?.[field] ?? record.crawlerPolicy?.training) !== (publicConfig.crawlerPolicy[field] ?? publicConfig.crawlerPolicy.training)) fail('Crawler policy differs from the production build.');
  }
  if ((record.ga4MeasurementId || null) !== (config.measurementId || null) || (record.ga4MeasurementId || null) !== (publicConfig.ga4MeasurementId || null)) fail('Build and runtime GA4 configuration must match.');
  for (const artifact of ['apps/api/dist/server.mjs', 'apps/web/dist/index.html', 'apps/web/dist/404.html', 'apps/web/dist/robots.txt', 'apps/web/dist/sitemap.xml']) {
    const target = join(releaseDir, artifact);
    await file(target);
    if (!isInside(releaseDir, await realpath(target))) fail('A built artifact escapes its release.');
  }
  if (!Array.isArray(record.routes) || record.routes.length !== 11) fail('The build record must declare all 11 public routes.');
  for (const route of record.routes) {
    if (typeof route !== 'string' || !/^\/(?:[a-z-]+\/)*$/.test(route)) fail('Invalid public route in build record.');
    await file(join(releaseDir, 'apps/web/dist', route, 'index.html'));
  }
  const deps = await lstat(join(releaseDir, 'node_modules'));
  if (!deps.isDirectory() || deps.isSymbolicLink()) fail('Install this release dependencies with npm ci; do not share a mutable node_modules symlink.');
  return { root, releaseDir, releaseId, buildRecord: record };
}
async function currentRelease(root) {
  const path = join(root, 'current');
  let info;
  try { info = await lstat(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  if (!info.isSymbolicLink()) fail('Refusing to replace current because it is not a symlink.');
  const target = await realpath(path);
  if (dirname(target) !== join(root, 'releases') || !safeId(basename(target))) fail('The existing current pointer does not identify a direct release.');
  return basename(target);
}
export async function selectRelease(root, name, releaseId) {
  if (!['current', 'previous'].includes(name) || !safeId(releaseId)) fail('Invalid pointer selection.');
  const target = join(root, name);
  try { if (!(await lstat(target)).isSymbolicLink()) fail(`Refusing to replace ${name}: it is not a symlink.`); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const temporary = join(root, `.${name}-${randomUUID()}`);
  await symlink(`releases/${releaseId}`, temporary);
  try { await rename(temporary, target); } catch (error) { await unlink(temporary).catch(() => {}); throw error; }
}
function serviceAction(command, action, unit) {
  const result = spawnSync(command, [action, unit], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 45_000, maxBuffer: 16_384 });
  if (result.error || result.status !== 0) fail(`Service ${action} failed. Inspect the protected host service status; no request has been retried.`);
}
async function verifyServiceIdentity(command, unit, releaseDir) {
  const result = spawnSync(command, ['show', '--property=MainPID', '--value', unit], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 5_000, maxBuffer: 1024 });
  const pid = result.stdout?.toString().trim();
  if (result.error || result.status !== 0 || !/^[1-9][0-9]*$/.test(pid || '')) fail('The selected service has no verified running process.');
  if (await realpath(`/proc/${pid}/cwd`) !== releaseDir) fail('The running service does not belong to the selected release.');
}
async function ready() {
  for (let attempt = 0; attempt < 12; attempt++) {
    try {
      const res = await fetch('http://127.0.0.1:3000/api/ready', { signal: AbortSignal.timeout(1_500), redirect: 'error' });
      const body = await res.json();
      if (res.status === 200 && body.ok === true && body.checks?.mail === 'configured' && body.checks?.site === 'available' && body.delivery === 'not_checked') return;
    } catch { /* finite retry; no SMTP or POST requests */ }
    if (attempt < 11) await new Promise(resolve => setTimeout(resolve, 500));
  }
  fail('Configuration readiness did not pass within the bounded observation window.');
}
async function main(args) {
  if (process.platform !== 'linux' || Number(process.versions.node.split('.')[0]) !== 24 || Number(process.versions.node.split('.')[1]) < 19) fail('Use a verified Linux Node 24.19+ executable (major 24).');
  const options = { root: DEFAULT_ROOT, unit: DEFAULT_UNIT, systemctl: '/usr/bin/systemctl', release: '', activate: false };
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--activate') options.activate = true;
    else if (['--root', '--unit', '--systemctl', '--release'].includes(arg) && args[index + 1]) options[arg.slice(2)] = args[++index];
    else fail('Usage: node deploy/release.mjs --release RELEASE_ID [--root ABSOLUTE_ROOT] [--activate] [--unit NAME.service] [--systemctl ABSOLUTE_PATH]');
  }
  if (!isAbsolute(options.root) || !isAbsolute(options.systemctl) || !/^[a-zA-Z0-9_.@-]+\.service$/.test(options.unit)) fail('Invalid runtime root, service name or systemctl path.');
  const checked = await validateRelease(options.root, options.release);
  const previous = await currentRelease(checked.root);
  console.log(JSON.stringify({ mode: options.activate ? 'activate' : 'dry-run', release: checked.releaseId, previous, runtimeRoot: checked.root, service: options.unit, productionBuild: 'validated', smtp: 'configured-not-contacted', mailboxReceipt: 'not-tested' }));
  if (!options.activate) return;
  if (previous === checked.releaseId) fail('This release is already selected; no restart was performed.');
  await file(options.systemctl);
  const lock = join(checked.root, 'shared/activation.lock');
  await mkdir(lock, { mode: 0o700 }); // Exclusive lock: an existing lock blocks activation.
  const journalDirectory = join(checked.root, 'shared/activations');
  const journalPath = join(journalDirectory, `${Date.now()}-${randomUUID()}.json`);
  let selected = false;
  try {
    if (await currentRelease(checked.root) !== previous) fail('Current changed since preflight. Start a fresh review.');
    await mkdir(journalDirectory, { recursive: true, mode: 0o700 });
    await writeFile(journalPath, JSON.stringify({ timestamp: new Date().toISOString(), previous, selected: checked.releaseId, service: options.unit, state: 'pending' }, null, 2) + '\n', { mode: 0o600, flag: 'wx' });
    if (previous) await selectRelease(checked.root, 'previous', previous);
    await selectRelease(checked.root, 'current', checked.releaseId);
    selected = true;
    serviceAction(options.systemctl, 'restart', options.unit);
    await ready();
    serviceAction(options.systemctl, 'is-active', options.unit);
    await verifyServiceIdentity(options.systemctl, options.unit, checked.releaseDir);
    await writeFile(journalPath, JSON.stringify({ timestamp: new Date().toISOString(), previous, selected: checked.releaseId, service: options.unit, state: 'configuration-ready', mailboxReceipt: 'not-tested', publicAcceptance: 'pending' }, null, 2) + '\n');
    console.log('Release selected and configuration readiness passed. Public/TLS/browser/SMTP-mailbox acceptance remains pending.');
  } catch (error) {
    if (selected) {
      if (previous) {
        await selectRelease(checked.root, 'current', previous);
        serviceAction(options.systemctl, 'restart', options.unit);
      } else {
        await unlink(join(checked.root, 'current'));
        serviceAction(options.systemctl, 'stop', options.unit);
      }
      console.error('Candidate failed; prior pointer was restored (or first selection removed). Verify restored service and public behavior.');
    }
    throw error;
  } finally { await rmdir(lock); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).catch(error => { console.error(error.safe ? error.message : 'Deployment did not complete. Inspect the protected staged artifacts and service status; no secrets are printed.'); process.exitCode = 1; });
}
