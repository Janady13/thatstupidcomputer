import type { FastifyRequest, FastifyReply } from 'fastify';
import { INQUIRY_FORM_HREF } from '../../../packages/site/inquiry.mjs';
export type FailureCode = 'invalid_request' | 'invalid_origin' | 'unsupported_media_type' | 'body_too_large' | 'rate_limited' | 'service_unavailable' | 'mail_rejected' | 'delivery_unknown' | 'request_in_progress' | 'server_error' | 'method_not_allowed';
export interface Failure { ok: false; code: FailureCode; message: string; requestId: string; fieldErrors?: Record<string, string> }
export interface Accepted { ok: true; status: 'accepted'; requestId: string }
export type Outcome = Accepted | Failure;
export function wantsHtml(request: FastifyRequest): boolean {
  return Boolean(request.headers.accept?.includes('text/html')) && !request.headers.accept?.includes('application/json');
}
const escape = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
export const responseStyles = 'html{color-scheme:light;background:#f5f2e9;color:#162722;font-family:system-ui,sans-serif}body{margin:0}main{max-width:42rem;padding:clamp(1.5rem,6vw,4rem);margin:8vh auto}h1{font-size:clamp(2rem,7vw,3.3rem);line-height:1.08}p,li{font-size:1.1rem;line-height:1.65}a{color:#174f3c;text-underline-offset:.22em}a:focus-visible{outline:3px solid #174f3c;outline-offset:4px}.brand{font-weight:800;letter-spacing:-.05em;font-size:1.4rem}.reference{font-size:.85rem;overflow-wrap:anywhere}';
export function respond(request: FastifyRequest, reply: FastifyReply, status: number, outcome: Outcome) {
  reply.code(status).header('cache-control', 'no-store').header('x-robots-tag', 'noindex, nofollow').header('x-request-id', request.id);
  if (!wantsHtml(request)) return reply.send(outcome);
  const title = outcome.ok ? 'Your request was accepted for sending.' : 'Your request needs attention.';
  const message = outcome.ok ? 'The mail service accepted your request for sending to That Stupid Computer. This confirms acceptance by the mail service, not arrival in the inbox.' : outcome.message;
  const errors = !outcome.ok && outcome.fieldErrors ? `<ul>${Object.values(outcome.fieldErrors).map(value => `<li>${escape(value)}</li>`).join('')}</ul>` : '';
  return reply.type('text/html; charset=utf-8').send(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escape(title)} — That Stupid Computer</title><link rel="stylesheet" href="/api/form-status.css"></head><body><main><a class="brand" href="/">That Stupid Computer</a><h1>${escape(title)}</h1><div role="${outcome.ok ? 'status' : 'alert'}"><p>${escape(message)}</p>${errors}</div><p><a href="${INQUIRY_FORM_HREF}">Return to the request form</a> · <a href="/">Back to the website</a></p><p class="reference">Request reference: ${escape(outcome.requestId)}</p></main></body></html>`);
}
