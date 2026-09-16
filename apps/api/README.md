# Direct email service

This is the B01 backend for That Stupid Computer. It is a Node 24.19 / Fastify 5 service; the root build bundles `src/index.ts` to `dist/server.mjs`. Run it from the project root. `createApp(options)` in `src/app.ts` supports isolated integration tests without network SMTP.

## Data and delivery contract

A request is validated, handed directly to the configured SMTP service, and answered synchronously. There is no inquiry database, lead table, local outbox, background worker, attachment processing, automatic retry, or form-content disk write. Request names, addresses, business names, website addresses and message text exist transiently in process memory while sending. The configured email service and destination mailbox then have their own retention policies, controlled by the owner.

HTTP 200 with `{ "ok": true, "status": "accepted", "requestId": "..." }` means the mail transport confirmed acceptance of the sole configured recipient. It does not establish destination-mailbox receipt, folder placement, business qualification, or a response from the business. An unavailable configuration returns HTTP 503; it cannot send a pretend success.

A process-random HMAC key generates duplicate and rate keys. Identical validated content, irrespective of the browser-generated submission ID, has one outcome for 15 minutes. Stored duplicate entries contain only an opaque digest, expiry, server-generated reference and safe response; they contain no submitted plaintext. Up to 2,000 duplicate entries and 5,000 rate keys are held in memory. Entries disappear when the process ends. This is best-effort duplicate suppression within one running process, not durable idempotency or an outbox. A lost connection or deadline can leave delivery uncertain; the same content is not automatically resent. An in-flight transport retains its concurrency slot until it settles.

Logs contain a server-generated request reference, route template, response status, elapsed time and a coarse mail outcome. They do not contain submitted data, query strings, raw URLs, visitor IPs, request headers, raw provider exceptions, recipient addresses or secrets. Infrastructure logging must uphold the same boundary; never configure request-body or query-string logging at a reverse proxy.

## Protected runtime configuration

Configure values in the deployment environment, never in frontend builds or source files.

| Variable | Behavior |
| --- | --- |
| `NODE_ENV` | `production` enables secure public-origin requirements and HSTS. |
| `HOST` | Defaults to `127.0.0.1`. Bind behind a controlled reverse proxy. |
| `PORT` | Defaults to `3000`. Integer 1–65535. |
| `PUBLIC_ORIGIN` | Exact canonical origin, for example `https://thatstupidcomputer.com`; required for production mail readiness. No slash, path or credentials. |
| `ALLOWED_ORIGINS` | Optional comma-separated exact additional origins. Wildcards and subdomain suffix matching are unsupported. |
| `TRUST_PROXY` | Optional comma-separated trusted proxy IPs or CIDRs; defaults to disabled. Use only actual ingress addresses, with direct public access to the app port blocked. |
| `SMTP_HOST` | SMTP DNS hostname. |
| `SMTP_PORT` | SMTP port; defaults to 465 with `SMTP_SECURE=true`, otherwise 587. |
| `SMTP_SECURE` | Explicit `true` for implicit TLS or `false` for mandatory STARTTLS. Port 465 requires `true`. |
| `SMTP_USER` / `SMTP_PASS` | SMTP credentials. |
| `SMTP_FROM` | One fixed sender mailbox; no display-name, list, or visitor-controlled sender. |
| `SMTP_TO` | One fixed destination mailbox; no list and no client override. |
| `GA4_MEASUREMENT_ID` | Optional public `G-...` identifier. A missing or malformed ID yields `null`. |

TLS certificate verification is mandatory and the minimum SMTP TLS version is 1.2. Nodemailer debug/connection logging, file access and URL access are disabled. The service does not call SMTP `verify()` or send a test message at startup. Sender-domain authentication and controlled-mailbox receipt must be validated separately in an authorized deployment.

## HTTP interfaces

| Interface | Meaning |
| --- | --- |
| `GET /api/health` | Process liveness, with no provider or deployment claim. |
| `GET /api/ready` | HTTP 200 only when all 11 known prerendered pages exist and SMTP configuration is complete; otherwise 503. `delivery: "not_checked"` is explicit. This is configuration readiness, not a live SMTP probe. |
| `GET /api/config` | `{ "analytics": { "measurementId": "G-..." or null } }`; no SMTP information. The frontend must load analytics only after consent. |
| `POST /api/demo` | Direct email form. Accepts JSON or native URL-encoded form data. |

`/api/demo` accepts exactly these fields:

- `name`: 2–100 characters, one line.
- `email`: one valid address, up to 254 characters, no control characters or address lists.
- `business`: 2–160 characters, one line.
- `website`: optional complete HTTP(S) URL, up to 300 characters, without embedded credentials; never fetched.
- `projectType`: `design`, `rescue`, `search`, `care` or `unsure`.
- `message`: 10–4,000 characters; ordinary line breaks are permitted.
- `consent`: JSON `true`, or native-form `true`/`on`.
- `companyWebsite`: empty honeypot string.
- `submissionId`: browser-generated UUID or empty string for the unenhanced native form.

Only an exact allowed `Origin` is accepted. A native request without Origin needs a valid same-origin Referer, or a `Sec-Fetch-Site: same-origin` header together with a known Host. `Sec-Fetch-Site: cross-site` always rejects. No CORS access is advertised. Browser headers are an origin-abuse defense, not an authentication mechanism for a public form.

| HTTP status | Failure code |
| --- | --- |
| 400 | `invalid_request`, including bounded safe `fieldErrors` |
| 403 | `invalid_origin` |
| 405 | `method_not_allowed`, with `Allow: POST` |
| 409 | `request_in_progress` for identical in-flight content |
| 413 | `body_too_large` |
| 415 | `unsupported_media_type` |
| 429 | `rate_limited`, with `Retry-After` |
| 502 | `mail_rejected` when the transport did not confirm the sole intended recipient or returned an explicit rejection |
| 503 | `service_unavailable` when configuration, capacity or shutdown prevents sending |
| 504 | `delivery_unknown` for an ambiguous transport error or 20-second overall deadline |
| 500 | `server_error`, with no exception details |

Failure JSON is `{ ok: false, code, message, requestId, fieldErrors? }`. Native browser submissions receive an accessible HTML result with the same HTTP status and links to the request form and home. The response never reflects submitted plaintext. Both formats use `Cache-Control: no-store`; result pages have `noindex, nofollow`.

## Controls and serving

The request body limit is 16 KiB. Rate limits are 120 requests per minute per normalized client IP network, including early rejected requests, and 5 form submissions per 10 minutes. IPv6 addresses are grouped by /64 before HMAC; forwarded addresses are used only for explicitly trusted ingress. Four concurrent SMTP attempts are allowed per process. DNS, connection, greeting and SMTP inactivity timeouts are bounded. These limits and duplicate suppression are local to one process: the supplied deployment runs one API instance. A future replicated deployment needs an explicit shared abuse-control design that preserves the prohibition on storing inquiries.

Static serving uses the dedicated web `dist` directory and a known 11-route HTML list. Missing pages and assets retain HTTP 404. Known slashless pages redirect to their trailing-slash form. Redirects preserve one exact approved `utm_source` value (`chatgpt.com`, `perplexity.ai`, `claude.ai`, `copilot.microsoft.com` or `gemini.google.com`); duplicate values and all other query fields are dropped. This preserves the measurement contract's finite source observation without reflecting arbitrary queries or visitor data. A built `404.html` is used for HTML misses when present. Versioned Vite assets receive immutable caching; HTML revalidates; nonversioned assets use an hour with revalidation. Native Rive WASM has `application/wasm` MIME.

Dotfiles, traversal, source directories, native source assets, source maps, arbitrary JSON and escaping symlinks are blocked. Only named public animation JSON manifests/scene/motion/pivot files are permitted. No route serves project-root content. `realpath` confinement assumes deployed artifacts are immutable to untrusted users; filesystem write access to a running release is not a supported trust boundary.

CSP enforces local scripts with the narrow WASM compilation permission and the optional GA4 host. Inline script execution and general `unsafe-eval` are not allowed. Inline styles are allowed for the motion renderer's runtime style updates. Frames and plugins are blocked. Analytics loading and collection still depend on consent enforcement in the frontend. Transport/header behavior must be tested at the deployed proxy as well as at the Node app.

SIGINT/SIGTERM stop new requests, drain Fastify, close the mail transport and clear memory state. The executable uses a 30-second shutdown deadline. Termination during an SMTP attempt remains an ambiguous delivery boundary; there is no automatic replay.

## Verification and evidence boundary

Run `node --import tsx --test tests/api/api.test.ts` from the project root. The suite uses synthetic `.test` addresses and injected transports: it does not contact an SMTP provider or send email. It checks validation, origin failures, native HTML handling, body/media/method status codes, fixed sender/recipient, explicit rejection, timeout ambiguity, duplicates, concurrency, early-rejection rate limits, readiness, response/log redaction, real public animation asset access, safe static paths, cache/MIME behavior and shutdown.

The governing manual is applied through R01–R03, R17, R20–R21, R24–R26 and the contact-to-mailbox playbook (`document-076.txt`). The user's direct-email/no-database instruction defines the handling contract. Actual host/proxy/TLS/DNS, SMTP authentication, sender-domain authentication, external reachability and controlled-mailbox receipt are separate acceptance requirements; simulated transport tests do not satisfy them.

Implementation references checked 2026-09-13:

- [Fastify server configuration](https://fastify.dev/docs/latest/Reference/Server/) and [logging](https://fastify.dev/docs/latest/Reference/Logging/).
- [Official Fastify rate limiter](https://github.com/fastify/fastify-rate-limit) and [static serving plugin](https://github.com/fastify/fastify-static).
- [Nodemailer SMTP transport](https://nodemailer.com/smtp) for mandatory TLS, bounded transport waits and the limits of SMTP verification.
