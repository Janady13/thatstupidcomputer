import { createHmac, randomBytes, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import Fastify, { LogController, type FastifyServerOptions, type FastifyRequest } from 'fastify';
import helmet from '@fastify/helmet';
import rateLimit, { normalizeIP } from '@fastify/rate-limit';
import formbody from '@fastify/formbody';
import { loadConfig, type Environment } from './config.js';
import { parseDemo, fieldMessages } from './validation.js';
import { createMailTransport, messageFor, soleRecipientAccepted, type MailTransport } from './mail.js';
import { registerStatic, safeDecodedPath } from './static.js';
import { respond, responseStyles, type Failure, type Outcome } from './responses.js';
import { createCrawlerVerifier, type CrawlerVerificationOptions } from './crawlers.js';

export interface AppOptions {
  env?: Environment;
  staticRoot?: string;
  mailTransport?: MailTransport;
  logger?: FastifyServerOptions['logger'];
  crawlerVerification?: CrawlerVerificationOptions;
  limits?: { globalMax?: number; demoMax?: number; timeWindowMs?: number; concurrentSends?: number; mailDeadlineMs?: number; dedupeTtlMs?: number; dedupeEntries?: number };
}
interface DedupeEntry { expires: number; outcome?: Outcome; status?: number }
const failure = (request: FastifyRequest, code: Failure['code'], message: string, fieldErrors?: Record<string, string>): Failure => ({ ok: false, code, message, requestId: request.id, ...(fieldErrors ? { fieldErrors } : {}) });
function trustedOrigin(request: FastifyRequest, origins: ReadonlySet<string>): boolean {
  const origin = request.headers.origin;
  const fetchSite = request.headers['sec-fetch-site'];
  if (fetchSite === 'cross-site') return false;
  if (origin !== undefined) return typeof origin === 'string' && origins.has(origin);
  const referer = request.headers.referer;
  if (referer) {
    try { return origins.has(new URL(referer).origin); } catch { return false; }
  }
  // Legacy requests need independent same-origin browser metadata plus a known host.
  return fetchSite === 'same-origin' && Array.from(origins).some(value => new URL(value).host === request.headers.host);
}
export async function createApp(options: AppOptions = {}) {
  const config = loadConfig(options.env);
  const limits = { globalMax: 120, demoMax: 5, timeWindowMs: 600_000, concurrentSends: 4, mailDeadlineMs: 20_000, dedupeTtlMs: 900_000, dedupeEntries: 2_000, ...options.limits };
  for (const value of Object.values(limits)) if (!Number.isFinite(value) || value <= 0) throw new Error('Invalid application limit.');
  const logger: FastifyServerOptions['logger'] = options.logger === false ? false : {
    ...(typeof options.logger === 'object' ? options.logger : {}),
    level: 'info',
    serializers: { req: () => ({}), res: () => ({}), err: () => ({ type: 'ApplicationError', message: '', stack: '' }) },
    redact: { paths: ['req', 'res', 'err', 'body', 'headers', 'email', 'name', 'business', 'message', 'smtp', 'password'], remove: true },
  };
  const app = Fastify({
    logger, logController: new LogController({ disableRequestLogging: true }), requestIdHeader: false, genReqId: () => randomUUID(),
    bodyLimit: 16_384, requestTimeout: 30_000, connectionTimeout: 30_000, keepAliveTimeout: 5_000,
    maxRequestsPerSocket: 100, trustProxy: config.trustProxy,
    onProtoPoisoning: 'error', onConstructorPoisoning: 'error',
  });
  const digestSecret = randomBytes(32);
  const digest = (value: string) => createHmac('sha256', digestSecret).update(value).digest('hex');
  const duplicates = new Map<string, DedupeEntry>();
  let activeSends = 0;
  let closing = false;
  const mailTransport = config.smtp ? (options.mailTransport || createMailTransport(config.smtp)) : null;
  const inspectCrawler = createCrawlerVerifier(options.crawlerVerification);

  await app.register(helmet, {
    contentSecurityPolicy: { directives: {
      defaultSrc: ["'self'"], scriptSrc: ["'self'", "'wasm-unsafe-eval'", 'https://www.googletagmanager.com'],
      styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", 'data:', 'blob:', 'https://www.google-analytics.com'],
      fontSrc: ["'self'"], connectSrc: ["'self'", 'https://www.google-analytics.com', 'https://region1.google-analytics.com'],
      mediaSrc: ["'self'"], workerSrc: ["'self'", 'blob:'], objectSrc: ["'none'"], frameSrc: ["'none'"],
      frameAncestors: ["'none'"], formAction: ["'self'"], baseUri: ["'none'"],
      upgradeInsecureRequests: config.production ? [] : null,
    } },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-origin' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: config.production ? { maxAge: 31_536_000, includeSubDomains: false } : false,
  });
  await app.register(rateLimit, {
    global: false, max: limits.globalMax, timeWindow: 60_000, cache: 5_000,
    keyGenerator: request => digest(normalizeIP(request.ip, 64)),
    errorResponseBuilder: request => ({ ...failure(request, 'rate_limited', 'Too many requests. Please wait before trying again.'), statusCode: 429 }),
  });
  const limitEveryRequest = app.createRateLimit();
  app.addHook('onRequest', async (request, reply) => {
    reply.header('permissions-policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
    reply.header('x-request-id', request.id);
    // Apply a separate global counter before any early path/origin rejection.
    const rate = await limitEveryRequest(request);
    if (!rate.isAllowed && rate.isExceeded) return respond(request, reply.header('retry-after', String(rate.ttlInSeconds)), 429, failure(request, 'rate_limited', 'Too many requests. Please wait before trying again.'));
    if (!safeDecodedPath(request.raw.url || '/')) return reply.code(404).header('cache-control', 'no-store').send({ ok: false, code: 'not_found', message: 'This resource was not found.', requestId: request.id });
    if (safeDecodedPath(request.raw.url || '/') === '/api/demo') {
      reply.header('cache-control', 'no-store');
      if (request.method !== 'POST') return respond(request, reply.header('allow', 'POST'), 405, failure(request, 'method_not_allowed', 'Use the request form to submit a request.'));
      if (!trustedOrigin(request, config.origins)) return respond(request, reply, 403, failure(request, 'invalid_origin', 'Open the request form on this website and try again.'));
      const contentType = request.headers['content-type']?.split(';')[0].trim();
      if (contentType !== 'application/json' && contentType !== 'application/x-www-form-urlencoded') return respond(request, reply, 415, failure(request, 'unsupported_media_type', 'Use the website request form or submit JSON.'));
    }
  });
  await app.register(formbody, { bodyLimit: 16_384 });
  app.addHook('onResponse', async (request, reply) => {
    app.log.info({ event: 'request_completed', requestId: request.id, route: request.routeOptions.url || 'unmatched', statusCode: reply.statusCode, elapsedMs: Math.round(reply.elapsedTime) }, 'Request completed');
    // The response has already been sent. Identity lookup cannot delay page delivery,
    // change authorization or trust visitor-supplied forwarding headers.
    if (options.logger !== false) {
      const elapsedMs = Math.round(reply.elapsedTime);
      const crawler = await inspectCrawler(request.headers['user-agent'], request.ip);
      if (crawler) app.log.info({ event: 'crawler_observed', requestId: request.id, host: config.publicOrigin,
        route: request.routeOptions.url || 'unmatched', statusCode: reply.statusCode, elapsedMs,
        ...crawler }, 'Crawler observation');
    }
  });
  app.setErrorHandler((error, request, reply) => {
    const err = error as { statusCode?: number; code?: string };
    if (err.statusCode === 429) return respond(request, reply, 429, failure(request, 'rate_limited', 'Too many requests. Please wait before trying again.'));
    if (err.code === 'FST_ERR_CTP_BODY_TOO_LARGE' || err.statusCode === 413) return respond(request, reply, 413, failure(request, 'body_too_large', 'This request is too large. Keep your project details under 4,000 characters.'));
    if (err.statusCode === 415) return respond(request, reply, 415, failure(request, 'unsupported_media_type', 'Use the website request form or submit JSON.'));
    if (err.statusCode === 400) return respond(request, reply, 400, failure(request, 'invalid_request', 'The request could not be read. Check the form and try again.'));
    app.log.error({ event: 'request_failed', requestId: request.id }, 'Request failed');
    return respond(request, reply, 500, failure(request, 'server_error', 'The request could not be completed. Please try again later.'));
  });
  const site = await registerStatic(app, options.staticRoot || resolve(process.cwd(), 'apps/web/dist'));
  app.get('/api/health', async (_request, reply) => reply.header('cache-control', 'no-store').send({ ok: !closing, status: closing ? 'stopping' : 'alive' }));
  app.get('/api/ready', async (_request, reply) => {
    const siteReady = await site.isReady();
    const ready = !closing && Boolean(mailTransport) && siteReady;
    return reply.code(ready ? 200 : 503).header('cache-control', 'no-store').send({ ok: ready, status: ready ? 'ready' : 'not_ready', checks: { mail: mailTransport ? 'configured' : 'unconfigured', site: siteReady ? 'available' : 'unavailable' }, delivery: 'not_checked' });
  });
  app.get('/api/config', async (_request, reply) => reply.header('cache-control', 'no-store').send({ analytics: { measurementId: config.measurementId } }));
  app.get('/api/form-status.css', async (_request, reply) => reply.type('text/css; charset=utf-8').header('cache-control', 'public, max-age=3600').send(responseStyles));
  app.post('/api/demo', { config: { rateLimit: { max: limits.demoMax, timeWindow: limits.timeWindowMs } } }, async (request, reply) => {
    const nativeForm = request.headers['content-type']?.split(';')[0].trim() === 'application/x-www-form-urlencoded';
    const parsed = parseDemo(request.body, nativeForm);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] || 'form');
        errors[field] = fieldMessages[field] || 'Check the form fields and try again.';
      }
      return respond(request, reply, 400, failure(request, 'invalid_request', 'Please check the form fields and try again.', errors));
    }
    if (!mailTransport || !config.smtp || closing) return respond(request, reply, 503, failure(request, 'service_unavailable', 'The request form is temporarily unavailable. Your request has not been sent. Please try again later.'));
    const { submissionId: _submissionId, ...content } = parsed.data;
    const key = digest(JSON.stringify(content));
    const now = Date.now();
    for (const [entryKey, entry] of duplicates) if (entry.expires <= now) duplicates.delete(entryKey);
    const duplicate = duplicates.get(key);
    if (duplicate) {
      if (duplicate.outcome) return respond(request, reply, duplicate.status!, duplicate.outcome);
      return respond(request, reply.header('retry-after', '30'), 409, failure(request, 'request_in_progress', 'This request is already being sent. Please wait for its result before submitting again.'));
    }
    if (activeSends >= limits.concurrentSends || duplicates.size >= limits.dedupeEntries) return respond(request, reply.header('retry-after', '60'), 503, failure(request, 'service_unavailable', 'The request form is busy. Your request has not been sent. Please try again shortly.'));
    const entry: DedupeEntry = { expires: now + limits.dedupeTtlMs };
    duplicates.set(key, entry);
    activeSends++;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const send = Promise.resolve().then(() => mailTransport.sendMail(messageFor(config.smtp!, parsed.data, request.id)));
    // A deadline does not prove non-delivery. Keep the slot until the transport settles;
    // remember the uncertain result and never retry automatically.
    void send.finally(() => { activeSends--; }).catch(() => {});
    try {
      const result = await Promise.race([
        send,
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(Object.assign(new Error('Mail deadline reached.'), { code: 'ETIMEDOUT' })), limits.mailDeadlineMs); }),
      ]);
      if (!soleRecipientAccepted(result, config.smtp.to)) {
        entry.status = 502;
        entry.outcome = failure(request, 'mail_rejected', 'The mail service did not confirm acceptance of your request. Please try again later.');
      } else {
        entry.status = 200;
        entry.outcome = { ok: true, status: 'accepted', requestId: request.id };
      }
    } catch (error) {
      const err = error as { code?: string; command?: string; responseCode?: number };
      const definiteRejection = err.code === 'EAUTH' || err.code === 'EENVELOPE' || (typeof err.responseCode === 'number' && err.responseCode >= 400);
      entry.status = definiteRejection ? 502 : 504;
      entry.outcome = failure(request, definiteRejection ? 'mail_rejected' : 'delivery_unknown', definiteRejection ? 'The mail service rejected the request. Please try again later.' : 'We could not confirm whether the mail service accepted your request. Please avoid submitting it again immediately; it may still arrive.');
    } finally { if (timer) clearTimeout(timer); }
    app.log.info({ event: entry.outcome.ok ? 'mail_accepted' : entry.outcome.code, requestId: request.id }, 'Mail attempt completed');
    return respond(request, reply, entry.status!, entry.outcome);
  });
  app.addHook('preClose', async () => { closing = true; });
  app.addHook('onClose', async () => { duplicates.clear(); digestSecret.fill(0); await mailTransport?.close?.(); });
  return app;
}
