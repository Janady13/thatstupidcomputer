import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, realpath, symlink, lstat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { selectRelease, validateRelease } from './release.mjs';
import { createHash } from 'node:crypto';
import { projectionFixture } from '../tests/site/fixture.ts';

async function fixture(t) {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'tsc-release-test-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'releases'));
  await mkdir(join(root, 'shared'));
  for (const id of ['old-reviewed', 'new-reviewed']) {
    await mkdir(join(root, 'releases', id));
    await writeFile(join(root, 'releases', id, 'artifact.txt'), `${id}: synthetic artifact retained`);
  }
  return root;
}

test('atomic release selection and rollback preserve both release directories and artifacts', async t => {
  const root = await fixture(t);
  await selectRelease(root, 'current', 'old-reviewed');
  await selectRelease(root, 'previous', 'old-reviewed');
  await selectRelease(root, 'current', 'new-reviewed');
  assert.equal(await realpath(join(root, 'current')), join(root, 'releases/new-reviewed'));
  assert.equal(await realpath(join(root, 'previous')), join(root, 'releases/old-reviewed'));
  await selectRelease(root, 'current', 'old-reviewed');
  assert.equal(await realpath(join(root, 'current')), join(root, 'releases/old-reviewed'));
  for (const id of ['old-reviewed', 'new-reviewed']) assert.equal(await readFile(join(root, 'releases', id, 'artifact.txt'), 'utf8'), `${id}: synthetic artifact retained`);
  assert.deepEqual((await readdir(root)).sort(), ['current', 'previous', 'releases', 'shared']);
});

test('selection refuses to overwrite an ordinary current directory', async t => {
  const root = await fixture(t);
  await mkdir(join(root, 'current'));
  await writeFile(join(root, 'current', 'keep.txt'), 'Existing unrelated directory');
  await assert.rejects(selectRelease(root, 'current', 'new-reviewed'), /not a symlink/);
  assert.equal(await readFile(join(root, 'current/keep.txt'), 'utf8'), 'Existing unrelated directory');
});

test('selection refuses to overwrite an ordinary previous file', async t => {
  const root = await fixture(t);
  await writeFile(join(root, 'previous'), 'Existing unrelated file');
  await assert.rejects(selectRelease(root, 'previous', 'old-reviewed'), /not a symlink/);
  assert.equal(await readFile(join(root, 'previous'), 'utf8'), 'Existing unrelated file');
});

test('pointer names and traversal release identifiers cannot escape the owned directory', async t => {
  const root = await fixture(t);
  for (const id of ['../outside', 'old/../../outside', '..', '/tmp/other', '']) {
    await assert.rejects(selectRelease(root, 'current', id), /Invalid pointer/);
    await assert.rejects(validateRelease(root, id), /simple release identifier/);
  }
  await assert.rejects(selectRelease(root, '../outside', 'old-reviewed'), /Invalid pointer/);
  assert.deepEqual((await readdir(root)).sort(), ['releases', 'shared']);
});

test('a symlinked release is refused before reading untrusted outside configuration', async t => {
  const root = await fixture(t);
  const outside = await mkdtemp(join(tmpdir(), 'tsc-release-outside-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await writeFile(join(outside, 'untouched'), 'Keep outside');
  await symlink(outside, join(root, 'releases/alias'));
  await assert.rejects(validateRelease(root, 'alias'), /symlink aliases/);
  assert.equal(await readFile(join(outside, 'untouched'), 'utf8'), 'Keep outside');
});

test('a shipped preview cannot pass deployment preflight or modify the active release', async t => {
  const root = await fixture(t);
  await selectRelease(root, 'current', 'old-reviewed');
  await mkdir(join(root, 'releases/new-reviewed/.build'));
  await writeFile(join(root, 'releases/new-reviewed/.build/build-record.json'), JSON.stringify({ deployment: 'preview', truthStatus: 'unavailable-preview' }));
  await assert.rejects(validateRelease(root, 'new-reviewed'), /completed production build/);
  assert.equal(await realpath(join(root, 'current')), join(root, 'releases/old-reviewed'));
  assert.equal((await lstat(join(root, 'releases/new-reviewed'))).isDirectory(), true);
});

test('production preflight detects provider-specific policy drift before selecting a release', async t => {
  const root = await fixture(t);
  const dir = join(root, 'releases/new-reviewed');
  for (const child of ['.build', 'apps/api/src', 'apps/api/dist', 'apps/web/dist', 'packages/site', 'private/truth', 'node_modules']) await mkdir(join(dir, child), { recursive: true });
  for (const child of ['runtime-env', 'build-env']) await mkdir(join(root, 'shared', child));
  // Import the actual parsers; no fixture replacement of the policy logic being tested.
  await writeFile(join(dir, 'apps/api/src/config.ts'), `export { loadConfig } from ${JSON.stringify(new URL('../apps/api/src/config.ts', import.meta.url).href)};`);
  await writeFile(join(dir, 'packages/site/truth.ts'), `export { loadSiteConfig } from ${JSON.stringify(new URL('../packages/site/truth.ts', import.meta.url).href)};`);
  const projection = JSON.stringify(projectionFixture());
  const digest = createHash('sha256').update(projection).digest('hex');
  await writeFile(join(dir, 'private/truth/public.json'), projection);
  await writeFile(join(dir, 'package-lock.json'), '{}');
  const routes = ['/', '/services/', '/services/website-design/', '/services/website-rescue/', '/services/search-visibility/', '/services/website-care/', '/work/', '/process/', '/about/', '/contact/', '/privacy/'];
  for (const route of routes) { await mkdir(join(dir, 'apps/web/dist', route), { recursive: true }); await writeFile(join(dir, 'apps/web/dist', route, 'index.html'), 'Synthetic test artifact'); }
  for (const artifact of ['apps/api/dist/server.mjs', 'apps/web/dist/404.html', 'apps/web/dist/robots.txt', 'apps/web/dist/sitemap.xml']) await writeFile(join(dir, artifact), 'Synthetic test artifact');
  await writeFile(join(dir, '.build/build-record.json'), JSON.stringify({ deployment: 'production', truthStatus: 'approved-projection', lockSha256: createHash('sha256').update('{}').digest('hex'), truthCommit: 'a'.repeat(40), truthSha256: digest, crawlerPolicy: { training: 'allow', openaiTraining: 'allow', anthropicTraining: 'allow', googleExtended: 'allow' }, routes }));
  const runtimeFile = join(root, 'shared/runtime-env/new-reviewed.env');
  await writeFile(runtimeFile, 'NODE_ENV=production\nHOST=127.0.0.1\nPORT=3000\nTRUST_PROXY=127.0.0.1\nPUBLIC_ORIGIN=https://thatstupidcomputer.com\nSMTP_HOST=smtp.example.test\nSMTP_PORT=587\nSMTP_SECURE=false\nSMTP_USER=test\nSMTP_PASS=synthetic-not-real\nSMTP_FROM=sender@example.test\nSMTP_TO=recipient@example.test\n', { mode: 0o600 });
  const buildFile = join(root, 'shared/build-env/new-reviewed.env');
  const build = `TSC_TRUTH_PROJECTION=${join(dir, 'private/truth/public.json')}\nTSC_TRUTH_COMMIT=${'a'.repeat(40)}\nTSC_TRUTH_SHA256=${digest}\nAI_TRAINING_POLICY=allow\nGOOGLE_EXTENDED_POLICY=allow\n`;
  await writeFile(buildFile, build, { mode: 0o600 });
  await symlink(runtimeFile, join(dir, 'runtime.env'));
  await symlink(buildFile, join(dir, 'build.env'));
  assert.equal((await validateRelease(root, 'new-reviewed')).releaseId, 'new-reviewed');
  for (const name of ['OPENAI_TRAINING_POLICY', 'ANTHROPIC_TRAINING_POLICY', 'MISTRAL_TRAINING_POLICY']) {
    await writeFile(buildFile, build + `${name}=deny\n`, { mode: 0o600 });
    await assert.rejects(validateRelease(root, 'new-reviewed'), /Crawler policy differs/);
  }
});
