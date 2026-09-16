import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { loadSiteConfig, publicUrl, validateProjection, configFromProjection, resolveCrawlerPolicy } from '../../packages/site/truth.ts';
import { projectionFixture, approveFixturePaths } from './fixture.ts';

test('public projection preserves exact canonical IDs and strips private provenance from browser config', () => {
  const fixture = projectionFixture();
  const approved = validateProjection(fixture, { expectedCommit: 'a'.repeat(40) });
  const config = configFromProjection(approved, 'preview');
  assert.equal(config.publisher?.id, fixture.site.publisherId);
  assert.equal(config.provider?.id, fixture.site.providerId);
  assert.equal(config.brand?.id, fixture.site.brandId);
  assert.equal(config.contact.email, fixture.entities[0]?.email);
  assert.doesNotMatch(JSON.stringify(config), /claimRefs|approvedPaths|sourceCommit|reviewedAt|expiresAt/);
});
test('unapproved fields, private fields, stale evidence and incomplete approvals are rejected', () => {
  for (const mutate of [
    (p: any) => { p.entities[0].password = 'do-not-copy'; },
    (p: any) => { p.audience = 'private'; },
    (p: any) => { p.approval.status = 'candidate'; },
    (p: any) => { p.approval.expiresAt = '2000-01-01T00:00:00Z'; },
    (p: any) => { p.approval.claimRefs = []; },
    (p: any) => { p.approval.approvedPaths.pop(); },
    (p: any) => { p.approval.approvedPaths.push('/site/unreviewed'); },
    (p: any) => { p.provenance.sourceCommit = '0d548feb6f52'; },
  ]) {
    const fixture = projectionFixture(); mutate(fixture);
    assert.throws(() => validateProjection(fixture));
  }
});
test('semantic relationship and entity identity conflicts cannot pass structural approval', () => {
  for (const mutate of [
    (p: any) => { p.site.publisherId = p.site.brandId; },
    (p: any) => { p.site.providerId = p.site.websiteId; },
    (p: any) => { p.entities[1].id = p.entities[0].id; },
    (p: any) => { p.entities[0].id = p.site.websiteId; },
    (p: any) => { p.entities[1].telephone = '+15555550100'; },
    (p: any) => { p.site.contactId = p.site.brandId; },
  ]) {
    const fixture = projectionFixture(); mutate(fixture); approveFixturePaths(fixture);
    assert.throws(() => validateProjection(fixture));
  }
});
test('public URLs reject credential transport, private locators and deceptive origins', () => {
  for (const url of ['http://thatstupidcomputer.com/', 'https://user:secret@thatstupidcomputer.com/', 'https://thatstupidcomputer.com/?token=private', 'https://127.0.0.1/', 'https://2130706433/', 'https://[::1]/', 'https://bubbles/', 'https://bubbles.local/', 'https://host.ts.net/', 'https://thatstupidcomputer.com/private/facts', 'https://thatstupidcomputer.com/%70rivate/facts', 'javascript:alert(1)']) assert.throws(() => publicUrl(url), url);
  const id = 'https://thatdeveloperguy.com/identity/#Exact-ID';
  assert.equal(publicUrl(id), id);
});
test('production requires reviewed bytes and full revision pins; preview can omit identity', () => {
  assert.throws(() => loadSiteConfig({ deployment: 'production' }), /Production blocked/);
  const preview = loadSiteConfig({ deployment: 'preview' });
  assert.equal(preview.truthStatus, 'unavailable-preview');
  assert.equal(preview.publisher, undefined);
  const dir = mkdtempSync(join(tmpdir(), 'tsc-truth-test-'));
  try {
    const fixture = projectionFixture();
    const bytes = JSON.stringify(fixture);
    const file = join(dir, 'projection.json'); writeFileSync(file, bytes);
    const options = { deployment: 'production' as const, projectionPath: file, expectedCommit: 'a'.repeat(40), expectedSha256: createHash('sha256').update(bytes).digest('hex'), aiTrainingPolicy: 'deny', googleExtendedPolicy: 'allow' };
    assert.equal(loadSiteConfig(options).truthStatus, 'approved-projection');
    assert.throws(() => loadSiteConfig({ ...options, expectedCommit: 'b'.repeat(40) }), /pinned canonical revision/);
    assert.throws(() => loadSiteConfig({ ...options, expectedSha256: '0'.repeat(64) }), /digest/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
test('production crawler choices are explicit and Google grounding can differ from model training', () => {
  assert.throws(() => resolveCrawlerPolicy('production'), /explicitly configure/);
  assert.throws(() => resolveCrawlerPolicy('production', 'deny'), /GOOGLE_EXTENDED_POLICY/);
  assert.throws(() => resolveCrawlerPolicy('production', 'maybe', 'deny'), /allow or deny/);
  assert.deepEqual(resolveCrawlerPolicy('preview'), { training: 'deny', openaiTraining: 'deny', anthropicTraining: 'deny', mistralTraining: 'deny', googleExtended: 'deny', source: 'preview-default' });
  assert.deepEqual(resolveCrawlerPolicy('production', 'deny', 'allow'), { training: 'deny', openaiTraining: 'deny', anthropicTraining: 'deny', mistralTraining: 'deny', googleExtended: 'allow', source: 'deployment-config' });
});
test('public ownership verification tokens reject HTML, whitespace and oversized values; GA4 requires 5+ characters', () => {
  const config = loadSiteConfig({ deployment: 'preview', googleSiteVerification: 'google_safe-token-123', bingSiteVerification: 'ABCDEF1234567890', ga4MeasurementId: 'G-ABCDE' });
  assert.deepEqual(config.verification, { google: 'google_safe-token-123', bing: 'ABCDEF1234567890' });
  for (const token of ['<meta name="evil">', 'space token here', 'a'.repeat(257), 'tiny']) {
    assert.throws(() => loadSiteConfig({ deployment: 'preview', googleSiteVerification: token }));
    assert.throws(() => loadSiteConfig({ deployment: 'preview', bingSiteVerification: token }));
  }
  assert.throws(() => loadSiteConfig({ deployment: 'preview', ga4MeasurementId: 'G-ABCD' }));
  const blank = loadSiteConfig({ deployment: 'preview', googleSiteVerification: '', bingSiteVerification: '', ga4MeasurementId: '', aiTrainingPolicy: '', googleExtendedPolicy: '' });
  assert.equal(blank.verification, undefined);
  assert.equal(blank.ga4MeasurementId, undefined);
  assert.equal(blank.crawlerPolicy.source, 'preview-default');
});
