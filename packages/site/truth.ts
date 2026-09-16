import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { isIP } from 'node:net';
import { SITE_NAME, SITE_ORIGIN, SITE_SOCIAL_IMAGE } from './content.ts';

export type Deployment = 'preview' | 'production';
export type CanonicalEntityType = 'Person' | 'Organization' | 'Brand';
export interface PublicCrawlerPolicy {
  /** Backward-compatible default; explicit provider choices take precedence. */
  training: 'allow' | 'deny';
  openaiTraining?: 'allow' | 'deny';
  anthropicTraining?: 'allow' | 'deny';
  mistralTraining?: 'allow' | 'deny';
  googleExtended: 'allow' | 'deny';
  source: 'preview-default' | 'deployment-config';
}
export interface PublicEntity {
  id: string;
  type: CanonicalEntityType;
  name: string;
  url: string;
  email?: string;
  telephone?: string;
}
export interface PublicSiteConfig {
  deployment: Deployment;
  canonicalOrigin: string;
  siteName: string;
  websiteId: string;
  contact: { email?: string; phone?: string };
  crawlerPolicy: PublicCrawlerPolicy;
  /** References to the canonical graph; never local Person/Organization declarations. */
  brand?: PublicEntity;
  publisher?: PublicEntity;
  provider?: PublicEntity;
  approvedOrganization?: PublicEntity;
  ga4MeasurementId?: string;
  verification?: { google?: string; bing?: string };
  socialImage?: { url: string; alt: string; width: number; height: number };
  truthStatus: 'unavailable-preview' | 'approved-projection';
}
export interface TruthProjection {
  schemaVersion: 'tsc-public-projection/v1';
  audience: 'public';
  provenance: { sourceCommit: string; exportedAt: string };
  approval: {
    status: 'approved-for-publication';
    reviewedAt: string;
    expiresAt: string;
    /** Opaque canonical claim IDs only. Private evidence remains in the canonical repository. */
    claimRefs: string[];
    /** Explicit JSON pointers for every leaf under site and entities. */
    approvedPaths: string[];
  };
  site: {
    origin: string;
    name: string;
    websiteId: string;
    publisherId: string;
    providerId: string;
    brandId?: string;
    contactId?: string;
    socialImage?: { url: string; alt: string; width: number; height: number };
  };
  entities: PublicEntity[];
}
type UnknownRecord = Record<string, unknown>;
function object(value: unknown, path: string): UnknownRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${path}: expected object`);
  return value as UnknownRecord;
}
function keys(value: UnknownRecord, allowed: string[], required: string[], path: string): void {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw new Error(`${path}: field is not in the public allowlist`);
  for (const key of required) if (!(key in value)) throw new Error(`${path}.${key}: required`);
}
function plain(value: unknown, path: string, max = 240): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[<>\u0000-\u001f\u007f]/.test(value)) throw new Error(`${path}: invalid public string`);
  return value;
}
/** Public HTTPS references only: no credentials, query tokens, local hosts or literal IPs. */
export function publicUrl(value: unknown, path = 'url'): string {
  const input = plain(value, path, 1200);
  let url: URL;
  try { url = new URL(input); } catch { throw new Error(`${path}: invalid URL`); }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== 'https:' || url.username || url.password || url.search || (url.port && url.port !== '443') ||
      !host.includes('.') || host.endsWith('.') || isIP(host.replace(/^\[|\]$/g, '')) ||
      /(^|\.)(localhost|local|internal|test|invalid|example|lan|home|onion)$/.test(host) ||
      /^(example\.(com|net|org))$/.test(host) || /(?:\.ts\.net|\.localhost)$/.test(host) ||
      /(?:^|\/)(?:private|secrets?|credentials?|admin|\.git|\.env)(?:\/|$)/i.test(decodeURIComponent(url.pathname))) {
    throw new Error(`${path}: URL is not eligible for public projection`);
  }
  return input; // Exact canonical identifier bytes are preserved; never normalized or re-minted.
}
function timestamp(value: unknown, path: string): number {
  const text = plain(value, path, 40);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(text) || !Number.isFinite(Date.parse(text))) throw new Error(`${path}: UTC timestamp required`);
  return Date.parse(text);
}
function leaves(value: unknown, prefix: string): string[] {
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, entry]) => leaves(entry, `${prefix}/${key}`));
  return [prefix];
}
/** Structural policy check. Actual claim truth/permission is reviewed upstream, never inferred here. */
export function validateProjection(input: unknown, options: { now?: Date; expectedCommit?: string } = {}): TruthProjection {
  const raw = object(input, 'projection');
  keys(raw, ['schemaVersion', 'audience', 'provenance', 'approval', 'site', 'entities'], ['schemaVersion', 'audience', 'provenance', 'approval', 'site', 'entities'], 'projection');
  if (raw.schemaVersion !== 'tsc-public-projection/v1' || raw.audience !== 'public') throw new Error('An explicitly public tsc-public-projection/v1 export is required');
  const provenance = object(raw.provenance, 'provenance');
  keys(provenance, ['sourceCommit', 'exportedAt'], ['sourceCommit', 'exportedAt'], 'provenance');
  if (typeof provenance.sourceCommit !== 'string' || !/^[a-f0-9]{40,64}$/.test(provenance.sourceCommit) || ![40, 64].includes(provenance.sourceCommit.length)) throw new Error('provenance.sourceCommit: full Git commit required');
  if (options.expectedCommit && provenance.sourceCommit !== options.expectedCommit) throw new Error('Projection source commit does not match the pinned canonical revision');
  const now = (options.now ?? new Date()).getTime();
  const exported = timestamp(provenance.exportedAt, 'provenance.exportedAt');
  const approval = object(raw.approval, 'approval');
  keys(approval, ['status', 'reviewedAt', 'expiresAt', 'claimRefs', 'approvedPaths'], ['status', 'reviewedAt', 'expiresAt', 'claimRefs', 'approvedPaths'], 'approval');
  if (approval.status !== 'approved-for-publication') throw new Error('Projection is not approved for publication');
  const reviewed = timestamp(approval.reviewedAt, 'approval.reviewedAt');
  const expires = timestamp(approval.expiresAt, 'approval.expiresAt');
  if (reviewed > now || exported > now || exported < reviewed || expires <= now || expires <= reviewed) throw new Error('Projection review/export timing is stale or inconsistent');
  if (!Array.isArray(approval.claimRefs) || approval.claimRefs.length === 0 || approval.claimRefs.length > 200 || approval.claimRefs.some((ref) => typeof ref !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9:._/#-]{0,199}$/.test(ref))) throw new Error('approval.claimRefs: canonical claim references required');
  const site = object(raw.site, 'site');
  keys(site, ['origin', 'name', 'websiteId', 'publisherId', 'providerId', 'brandId', 'contactId', 'socialImage'], ['origin', 'name', 'websiteId', 'publisherId', 'providerId'], 'site');
  if (site.origin !== SITE_ORIGIN || site.name !== SITE_NAME) throw new Error('Projection does not target the approved TSC website');
  for (const key of ['websiteId', 'publisherId', 'providerId', 'brandId', 'contactId']) if (site[key] !== undefined) publicUrl(site[key], `site.${key}`);
  if (new URL(site.websiteId as string).origin !== SITE_ORIGIN) throw new Error('WebSite ID must belong to the site-owned canonical origin');
  if (site.socialImage !== undefined) {
    const img = object(site.socialImage, 'site.socialImage');
    keys(img, ['url', 'alt', 'width', 'height'], ['url', 'alt', 'width', 'height'], 'site.socialImage');
    publicUrl(img.url, 'site.socialImage.url'); plain(img.alt, 'site.socialImage.alt', 500);
    if (new URL(img.url as string).origin !== SITE_ORIGIN) throw new Error('Social image must use the approved website origin');
    for (const key of ['width', 'height']) if (!Number.isInteger(img[key]) || Number(img[key]) < 1 || Number(img[key]) > 10000) throw new Error(`site.socialImage.${key}: invalid dimension`);
  }
  if (!Array.isArray(raw.entities) || raw.entities.length < 1 || raw.entities.length > 8) throw new Error('entities: bounded canonical public projection required');
  const ids = new Map<string, PublicEntity>();
  raw.entities.forEach((entry, index) => {
    const entity = object(entry, `entities/${index}`);
    keys(entity, ['id', 'type', 'name', 'url', 'email', 'telephone'], ['id', 'type', 'name', 'url'], `entities/${index}`);
    const id = publicUrl(entity.id, `entities/${index}/id`);
    publicUrl(entity.url, `entities/${index}/url`);
    plain(entity.name, `entities/${index}/name`);
    if (!['Person', 'Organization', 'Brand'].includes(String(entity.type))) throw new Error('Only approved canonical Person/Organization/Brand references are accepted');
    if (ids.has(id) || id === site.websiteId) throw new Error('Canonical entity IDs must be unique and distinct from the WebSite');
    if (entity.email !== undefined && (typeof entity.email !== 'string' || entity.email.length > 254 || !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(entity.email))) throw new Error('Invalid approved public email');
    if (entity.telephone !== undefined && (typeof entity.telephone !== 'string' || !/^\+[1-9]\d{6,14}$/.test(entity.telephone))) throw new Error('Public telephone must use E.164 format');
    if (entity.type === 'Brand' && (entity.email !== undefined || entity.telephone !== undefined)) throw new Error('Contact belongs to the actual Person/Organization, not an inferred Brand operator');
    ids.set(id, entity as unknown as PublicEntity);
  });
  for (const key of ['publisherId', 'providerId']) {
    const entity = ids.get(site[key] as string);
    if (!entity || !['Organization', 'Person'].includes(entity.type)) throw new Error(`site.${key}: must reference an approved Person or Organization, never Brand or WebSite`);
  }
  if (site.brandId !== undefined && ids.get(site.brandId as string)?.type !== 'Brand') throw new Error('site.brandId: must reference an approved Brand');
  if (site.contactId !== undefined && !['publisherId', 'providerId'].some((key) => site[key] === site.contactId)) throw new Error('Contact must reference the approved publisher or provider');
  const used = new Set([site.publisherId, site.providerId, site.brandId, site.contactId].filter(Boolean));
  if ([...ids.keys()].some((id) => !used.has(id))) throw new Error('Unreferenced entities are not allowed in the public projection');
  const requiredPaths = [...leaves(raw.site, '/site'), ...leaves(raw.entities, '/entities')].sort();
  const approvedPaths = approval.approvedPaths;
  if (!Array.isArray(approvedPaths) || approvedPaths.some((path) => typeof path !== 'string') || new Set(approvedPaths).size !== approvedPaths.length || JSON.stringify([...approvedPaths].sort()) !== JSON.stringify(requiredPaths)) throw new Error('Every projected public field must have an exact approval path; extra approval paths are rejected');
  return structuredClone(raw) as unknown as TruthProjection;
}
export function resolveCrawlerPolicy(deployment: Deployment, training?: string, googleExtended?: string, overrides: { openai?: string; anthropic?: string; mistral?: string } = {}): PublicCrawlerPolicy {
  for (const [name, value] of [['AI_TRAINING_POLICY', training], ['GOOGLE_EXTENDED_POLICY', googleExtended], ['OPENAI_TRAINING_POLICY', overrides.openai], ['ANTHROPIC_TRAINING_POLICY', overrides.anthropic], ['MISTRAL_TRAINING_POLICY', overrides.mistral]]) {
    if (value !== undefined && value !== 'allow' && value !== 'deny') throw new Error(`${name} must explicitly be allow or deny`);
  }
  if (deployment === 'production' && (!training || !googleExtended)) throw new Error('Production blocked: explicitly configure AI_TRAINING_POLICY and GOOGLE_EXTENDED_POLICY from the actual owner-approved crawler policy');
  return {
    training: (training ?? 'deny') as 'allow' | 'deny',
    openaiTraining: (overrides.openai ?? training ?? 'deny') as 'allow' | 'deny',
    anthropicTraining: (overrides.anthropic ?? training ?? 'deny') as 'allow' | 'deny',
    mistralTraining: (overrides.mistral ?? training ?? 'deny') as 'allow' | 'deny',
    googleExtended: (googleExtended ?? 'deny') as 'allow' | 'deny',
    source: training && googleExtended ? 'deployment-config' : 'preview-default',
  };
}
export function configFromProjection(projection: TruthProjection, deployment: Deployment, crawlerPolicy?: PublicCrawlerPolicy): PublicSiteConfig {
  const policy = crawlerPolicy ?? resolveCrawlerPolicy(deployment);
  if (deployment === 'production' && policy.source !== 'deployment-config') throw new Error('Production requires an explicit crawler policy');
  const find = (id: string | undefined) => projection.entities.find((entity) => entity.id === id);
  const publisher = find(projection.site.publisherId)!;
  const provider = find(projection.site.providerId)!;
  const contact = find(projection.site.contactId);
  return {
    deployment, canonicalOrigin: SITE_ORIGIN, siteName: SITE_NAME, websiteId: projection.site.websiteId, crawlerPolicy: policy,
    publisher, provider, ...(find(projection.site.brandId) ? { brand: find(projection.site.brandId) } : {}),
    ...(publisher.type === 'Organization' ? { approvedOrganization: publisher } : {}),
    contact: { ...(contact?.email ? { email: contact.email } : {}), ...(contact?.telephone ? { phone: contact.telephone } : {}) },
    socialImage: projection.site.socialImage ?? { ...SITE_SOCIAL_IMAGE }, truthStatus: 'approved-projection',
  };
}
export interface LoadSiteConfigOptions {
  deployment: Deployment;
  projectionPath?: string;
  ga4MeasurementId?: string;
  googleSiteVerification?: string;
  bingSiteVerification?: string;
  aiTrainingPolicy?: string;
  openaiTrainingPolicy?: string;
  anthropicTrainingPolicy?: string;
  mistralTrainingPolicy?: string;
  googleExtendedPolicy?: string;
  expectedCommit?: string;
  expectedSha256?: string;
}
export function loadSiteConfig(options: LoadSiteConfigOptions): PublicSiteConfig {
  const optional = (value: string | undefined): string | undefined => value === '' ? undefined : value;
  if (!['preview', 'production'].includes(options.deployment)) throw new Error('Explicit preview or production deployment mode required');
  const projectionPath = options.projectionPath ?? process.env.TSC_TRUTH_PROJECTION;
  const expectedCommit = options.expectedCommit ?? process.env.TSC_TRUTH_COMMIT;
  const expectedSha256 = options.expectedSha256 ?? process.env.TSC_TRUTH_SHA256;
  if (options.deployment === 'production' && (!projectionPath || !expectedCommit || !expectedSha256)) throw new Error('Production blocked: supply canonical public projection, TSC_TRUTH_COMMIT and TSC_TRUTH_SHA256 pins');
  const crawlerPolicy = resolveCrawlerPolicy(options.deployment, optional(options.aiTrainingPolicy ?? process.env.AI_TRAINING_POLICY), optional(options.googleExtendedPolicy ?? process.env.GOOGLE_EXTENDED_POLICY), {
    openai: optional(options.openaiTrainingPolicy ?? process.env.OPENAI_TRAINING_POLICY),
    anthropic: optional(options.anthropicTrainingPolicy ?? process.env.ANTHROPIC_TRAINING_POLICY),
    mistral: optional(options.mistralTrainingPolicy ?? process.env.MISTRAL_TRAINING_POLICY),
  });
  let config: PublicSiteConfig = {
    deployment: options.deployment, canonicalOrigin: SITE_ORIGIN, siteName: SITE_NAME,
    websiteId: `${SITE_ORIGIN}/#website`, contact: {}, crawlerPolicy, socialImage: { ...SITE_SOCIAL_IMAGE }, truthStatus: 'unavailable-preview',
  };
  if (projectionPath) {
    const bytes = readFileSync(projectionPath);
    if (bytes.length > 64_000) throw new Error('Public projection exceeds bounded adapter size');
    const digest = createHash('sha256').update(bytes).digest('hex');
    if (expectedSha256 && (!/^[a-f0-9]{64}$/.test(expectedSha256) || digest !== expectedSha256)) throw new Error('Public projection digest does not match the pinned reviewed export');
    config = configFromProjection(validateProjection(JSON.parse(bytes.toString('utf8')), { expectedCommit }), options.deployment, crawlerPolicy);
  }
  const ga4MeasurementId = optional(options.ga4MeasurementId);
  if (ga4MeasurementId !== undefined) {
    if (!/^G-[A-Z0-9]{5,20}$/.test(ga4MeasurementId)) throw new Error('Invalid public GA4 measurement ID');
    config.ga4MeasurementId = ga4MeasurementId;
  }
  const google = optional(options.googleSiteVerification ?? process.env.GOOGLE_SITE_VERIFICATION);
  const bing = optional(options.bingSiteVerification ?? process.env.BING_SITE_VERIFICATION);
  for (const [provider, token] of [['Google', google], ['Bing', bing]]) {
    if (token !== undefined && !/^[A-Za-z0-9_-]{10,256}$/.test(token)) throw new Error(`${provider} site verification requires a safe bounded token, not pasted HTML or a secret`);
  }
  if (google || bing) config.verification = { ...(google ? { google } : {}), ...(bing ? { bing } : {}) };
  return config;
}
