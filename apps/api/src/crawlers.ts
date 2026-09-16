import { BlockList, isIP } from 'node:net';
import { CRAWLER_FEEDS as feeds, CRAWLER_AGENTS as agents } from '../../../packages/discovery/registry.ts';
type Agent = typeof agents[number];
type Feed = keyof typeof feeds;
export interface CrawlerObservation {
  agent: Agent['agent'];
  provider: Agent['provider'];
  purpose: Agent['purpose'];
  verification: 'verified' | 'ip_mismatch' | 'stale_match' | 'unavailable';
  method: 'published-ip-range' | 'no-published-ip-feed';
  checkedAt: string;
  datasetFetchedAt?: string;
  datasetCreatedAt?: string;
}
export interface CrawlerVerificationOptions {
  fetch?: typeof globalThis.fetch;
  now?: () => number;
}
interface Snapshot { ranges: BlockList; fetchedAt: number; createdAt: string }
interface Cache { lastAttempt: number; snapshot?: Snapshot; pending?: Promise<void> }
const freshnessMs = 24 * 60 * 60 * 1000;
const maximumStaleMs = 7 * freshnessMs;
const retryAfterMs = 15 * 60 * 1000;
const maximumBytes = 262_144;

function claimedAgent(value: string | undefined): Agent | undefined {
  if (!value || value.length > 1024) return;
  const matches = agents.filter(({ agent }) => new RegExp(`(?:^|[^a-z0-9_-])${agent}(?=$|[/;\\s)])`, 'i').test(value));
  // An ambiguous claim cannot authenticate two unrelated products at once.
  return matches.length === 1 ? matches[0] : undefined;
}

async function readRanges(response: Response, now: number, feed: Feed): Promise<Snapshot> {
  const contentType = (response.headers.get('content-type') || '').split(';')[0]!.trim().toLowerCase();
  // This specific provider endpoint serves JSON as a download (observed 2026-09-13).
  // It must still pass every body, date and CIDR check; other MIME types fail closed.
  const acceptedType = contentType === 'application/json' || (feed === 'openaiUser' && contentType === 'application/octet-stream');
  if (response.status !== 200 || !acceptedType || !response.body) throw new Error('Unavailable provider dataset');
  const declared = Number(response.headers.get('content-length') || 0);
  if (!Number.isFinite(declared) || declared > maximumBytes) throw new Error('Oversized provider dataset');
  const reader = response.body.getReader();
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > maximumBytes) throw new Error('Oversized provider dataset');
      chunks.push(chunk.value);
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error; }
  finally { reader.releaseLock(); }
  const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as { creationTime?: unknown; prefixes?: unknown };
  if (typeof body.creationTime !== 'string' || !/^\d{4}-\d\d-\d\dT[\d:.]+Z?$/.test(body.creationTime)) throw new Error('Missing provider dataset date');
  const created = Date.parse(body.creationTime.endsWith('Z') ? body.creationTime : `${body.creationTime}Z`);
  if (!Number.isFinite(created) || created > now + 300_000) throw new Error('Invalid provider dataset date');
  if (!Array.isArray(body.prefixes) || !body.prefixes.length || body.prefixes.length > 4096) throw new Error('Invalid provider ranges');
  const ranges = new BlockList();
  for (const entry of body.prefixes) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Invalid provider range');
    const record = entry as Record<string, unknown>;
    const values = [record.ipv4Prefix, record.ipv6Prefix].filter(value => value !== undefined);
    if (values.length !== 1 || typeof values[0] !== 'string') throw new Error('Invalid provider range');
    const [address, width, extra] = values[0].split('/');
    const family = isIP(address!);
    const bits = Number(width);
    if (extra !== undefined || !width || !/^\d+$/.test(width) || !family || !Number.isInteger(bits) ||
      bits < (family === 4 ? 8 : 16) || bits > (family === 4 ? 32 : 128) ||
      (record.ipv4Prefix !== undefined ? family !== 4 : family !== 6)) throw new Error('Unsafe provider range');
    ranges.addSubnet(address!, bits, family === 4 ? 'ipv4' : 'ipv6');
  }
  return { ranges, fetchedAt: now, createdAt: new Date(created).toISOString() };
}

/** Observation only: never grants access, bypasses limits, or stores request IPs/headers. */
export function createCrawlerVerifier(options: CrawlerVerificationOptions = {}) {
  const fetcher = options.fetch ?? globalThis.fetch;
  const now = options.now ?? Date.now;
  const cache = new Map<Feed, Cache>(); // Bounded by the registry; no per-visitor entries.
  return async (userAgent: string | undefined, connectionIp: string): Promise<CrawlerObservation | undefined> => {
    const claim = claimedAgent(userAgent);
    if (!claim) return;
    const checked = now();
    if (claim.feed === null) return {
      agent: claim.agent, provider: claim.provider, purpose: claim.purpose,
      verification: 'unavailable', method: 'no-published-ip-feed', checkedAt: new Date(checked).toISOString(),
    };
    let entry = cache.get(claim.feed);
    if (!entry) { entry = { lastAttempt: -Infinity }; cache.set(claim.feed, entry); }
    if (!entry.snapshot || checked - entry.snapshot.fetchedAt >= freshnessMs) {
      if (!entry.pending && checked - entry.lastAttempt >= retryAfterMs) {
        entry.lastAttempt = checked;
        const state = entry;
        state.pending = (async () => {
          try {
            const response = await fetcher(feeds[claim.feed], { redirect: 'error', signal: AbortSignal.timeout(3000), headers: { accept: 'application/json' } });
            // Publish only a completely validated dataset. A failed refresh preserves the last good one.
            state.snapshot = await readRanges(response, now(), claim.feed);
          } catch { /* Log only the finite unavailable/stale result; never remote response/error text. */ }
        })().finally(() => { state.pending = undefined; });
      }
      if (entry.pending) await entry.pending;
    }
    const snapshot = entry.snapshot;
    const family = isIP(connectionIp);
    const age = snapshot ? now() - snapshot.fetchedAt : Infinity;
    const usable = snapshot && age >= 0 && age <= maximumStaleMs;
    const matches = Boolean(usable && family && snapshot.ranges.check(connectionIp, family === 4 ? 'ipv4' : 'ipv6'));
    return {
      agent: claim.agent, provider: claim.provider, purpose: claim.purpose, method: 'published-ip-range',
      verification: !usable ? 'unavailable' : age >= freshnessMs ? (matches ? 'stale_match' : 'unavailable') : matches ? 'verified' : 'ip_mismatch',
      checkedAt: new Date(checked).toISOString(),
      ...(snapshot ? { datasetFetchedAt: new Date(snapshot.fetchedAt).toISOString(), datasetCreatedAt: snapshot.createdAt } : {}),
    };
  };
}
