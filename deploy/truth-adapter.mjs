#!/usr/bin/env node
/**
 * Maps the canonical thatdeveloperguy-truth registry into the narrow
 * tsc-public-projection/v1 exchange shape (docs/TRUTH-INTEGRATION.md).
 *
 * It imports the registry's own index.ts/schema.ts so every ID, name, URL and
 * contact value is read from the one source of facts; nothing is retyped here.
 * The registry is never modified. Output is a candidate export for
 * scripts/import-truth.ts, which pins it under private/truth/.
 *
 *   node deploy/truth-adapter.mjs --truth /abs/path/to/thatdeveloperguy-truth \
 *        --out /abs/path/candidate.json [--expires-days 365]
 */
import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const option = (name, fallback) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : fallback; };
const truthRoot = option('--truth');
const outPath = option('--out');
const expiresDays = Number(option('--expires-days', '365'));
if (!truthRoot || !outPath || !isAbsolute(truthRoot) || !isAbsolute(outPath) || !Number.isInteger(expiresDays) || expiresDays < 1) {
  throw new Error('Usage: node deploy/truth-adapter.mjs --truth ABS_TRUTH_ROOT --out ABS_OUTPUT_JSON [--expires-days N]');
}

// The registry must be a clean checkout so the pinned commit describes the exact bytes read.
const git = (...a) => execFileSync('git', ['-C', truthRoot, ...a], { encoding: 'utf8' }).trim();
const sourceCommit = git('rev-parse', 'HEAD');
if (git('status', '--porcelain', '--untracked-files=no')) throw new Error('Canonical registry has uncommitted changes; commit or discard before exporting');

const { org, canonicalHost, ORG_ID } = await import(pathToFileURL(resolve(truthRoot, 'index.ts')).href);
const { brandNodes } = await import(pathToFileURL(resolve(truthRoot, 'schema.ts')).href);
const { validateProjection } = await import(pathToFileURL(resolve(process.cwd(), 'packages/site/truth.ts')).href);
const { SITE_NAME, SITE_ORIGIN } = await import(pathToFileURL(resolve(process.cwd(), 'packages/site/content.ts')).href);

// The site is one of the organization's Brand nodes (organization/brands.json, G02);
// the organization publishes it and provides the services it offers.
const siteHost = `${SITE_ORIGIN}/`;
const brand = brandNodes().find((node) => node.url === siteHost);
if (!brand) throw new Error(`No verified Brand in the registry has host ${siteHost}`);
const property = org.brands.brands.find((entry) => entry.host === siteHost);
if (!property) throw new Error('Brand host is not registered in organization/brands.json');

const now = new Date();
const stamp = (date) => date.toISOString().replace(/\.\d{3}Z$/, 'Z');
const reviewedAt = stamp(now);
const expiresAt = stamp(new Date(now.getTime() + expiresDays * 86_400_000));

const site = {
  origin: SITE_ORIGIN,
  name: SITE_NAME,
  websiteId: `${SITE_ORIGIN}/#website`,
  publisherId: ORG_ID,
  providerId: ORG_ID,
  brandId: brand['@id'],
  contactId: ORG_ID,
};
const entities = [
  { id: ORG_ID, type: 'Organization', name: org.name, url: canonicalHost, email: org.email, telephone: org.telephone },
  { id: brand['@id'], type: 'Brand', name: brand.name, url: brand.url },
];
const leaves = (value, prefix) => value && typeof value === 'object'
  ? Object.entries(value).flatMap(([key, entry]) => leaves(entry, `${prefix}/${key}`))
  : [prefix];

const projection = {
  schemaVersion: 'tsc-public-projection/v1',
  audience: 'public',
  provenance: { sourceCommit, exportedAt: reviewedAt },
  approval: {
    status: 'approved-for-publication',
    reviewedAt,
    expiresAt,
    // Canonical claim IDs from register/claims.json plus the registry leaves that establish the brand relationship.
    claimRefs: [
      'CLM-ORG-001', 'CLM-ORG-006', 'CLM-ORG-010', 'CLM-PER-011',
      'organization/identity.json#name', 'organization/contact.json#email', 'organization/contact.json#telephone',
      `organization/brands.json#${brand.name}`, `properties/properties.json#${new URL(siteHost).hostname}`,
    ],
    approvedPaths: [...leaves(site, '/site'), ...leaves(entities, '/entities')].sort(),
  },
  site,
  entities,
};
validateProjection(projection, { expectedCommit: sourceCommit });
await writeFile(outPath, JSON.stringify(projection, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
console.log(JSON.stringify({ sourceCommit, brandId: brand['@id'], publisherId: ORG_ID, entities: entities.length, outPath }));
