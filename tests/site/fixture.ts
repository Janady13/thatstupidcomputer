import type { TruthProjection, PublicCrawlerPolicy } from '../../packages/site/truth.ts';
export const TEST_CRAWLER_POLICY: PublicCrawlerPolicy = { training: 'deny', googleExtended: 'deny', source: 'deployment-config' };
/** Synthetic unit-test data only. Not an approved business export; never copied into production. */
export function projectionFixture(): TruthProjection {
  const now = Date.now();
  const fixture: TruthProjection = {
    schemaVersion: 'tsc-public-projection/v1', audience: 'public',
    provenance: { sourceCommit: 'a'.repeat(40), exportedAt: new Date(now - 1000).toISOString() },
    approval: { status: 'approved-for-publication', reviewedAt: new Date(now - 2000).toISOString(), expiresAt: new Date(now + 86400000).toISOString(), claimRefs: ['TEST-ONLY:claim-1'], approvedPaths: [] },
    site: { origin: 'https://thatstupidcomputer.com', name: 'That Stupid Computer', websiteId: 'https://thatstupidcomputer.com/#website', publisherId: 'https://fixture-only.thatstupidcomputer.com/#canonical-test-organization', providerId: 'https://fixture-only.thatstupidcomputer.com/#canonical-test-organization', brandId: 'https://fixture-only.thatstupidcomputer.com/#canonical-test-brand', contactId: 'https://fixture-only.thatstupidcomputer.com/#canonical-test-organization' },
    entities: [
      { id: 'https://fixture-only.thatstupidcomputer.com/#canonical-test-organization', type: 'Organization', name: 'TEST FIXTURE — NEVER PUBLISH', url: 'https://fixture-only.thatstupidcomputer.com/', email: 'test-only@fixture-only.thatstupidcomputer.com' },
      { id: 'https://fixture-only.thatstupidcomputer.com/#canonical-test-brand', type: 'Brand', name: 'TEST FIXTURE BRAND — NEVER PUBLISH', url: 'https://fixture-only.thatstupidcomputer.com/brand/' },
    ],
  };
  approveFixturePaths(fixture);
  return fixture;
}
export function approveFixturePaths(fixture: TruthProjection): void {
  function leaves(value: unknown, prefix: string): string[] {
    return value && typeof value === 'object' ? Object.entries(value).flatMap(([key, v]) => leaves(v, `${prefix}/${key}`)) : [prefix];
  }
  fixture.approval.approvedPaths = [...leaves(fixture.site, '/site'), ...leaves(fixture.entities, '/entities')];
}
