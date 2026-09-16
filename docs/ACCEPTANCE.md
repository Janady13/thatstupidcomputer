# Acceptance and evidence

This package contains the complete local React website, 11 public page routes plus a real 404, the direct-email backend, supplied SVG animation system, five compiled native Rive files, and the configuration/instructions for transfer. Local checks below pass within their stated scope. **Production deployment, canonical identity activation, live mailbox/analytics evidence and browser acceptance remain unverified.**

The final combined local run is recorded in [local-verification.json](standards/local-verification.json), including commands, timestamps, exit codes, dependency-lock hash and log digests. Its build and integration records identify the tested output. Transfer integrity is checked separately by `scripts/verify-release.mjs`; a matching checksum is not production acceptance.

| Executed check | Result and scope | Evidence |
| --- | --- | --- |
| Strict TypeScript | PASS with `strict: true`, `skipLibCheck: false`; exact command recorded by the combined runner | [Local verification](standards/local-verification.json) |
| Current Node application suites | **96/96 PASS**: 42 animation, 24 API, 16 content/search/truth, 14 measurement | [Separate review and 126 input/source hashes](standards/observations.json), [test transcript](standards/unit-tests.log) |
| React client, SSR/prerender and API bundle | PASS: all 11 routes and a separate 404 built from the current source | `.build/build-record.json`, `.build/verification/build.log` |
| Actual built HTML and Fastify integration | **20/20 PASS**: native links/form, route/head/config/schema consistency, real 404 and redirects, exact asset bytes/MIME/cache, private-path denial, safe inquiry failures | [Build integration and public artifact hashes](standards/build-integration.json) |
| Supplied standards coverage | PASS for structural inventory and reasoned mappings: **135 documents, 26 roles, 40 graphs, 146 catalog references, 28 source findings** | [Coverage ledger](standards/coverage-ledger.json), [scope and supersession](standards/README.md) |
| Source asset audit | **62/62 PASS**: SVG/RML/motion structure, asset hygiene, source contracts and native file/evidence hashes | `native/reports/asset-audit.json` |
| Official native Rive compile/import and Canvas rendering | Five files; **70 actions and 420 samples PASS**. Separate review confirmed all public and compiled file hashes match the Canvas report | `native/reports/native-compiled.json`, `native/reports/native-canvas.json`, [animation scope](ANIMATION.md) |
| Release helper filesystem boundaries | **6/6 PASS** separately: temporary pointer selection/rollback, preserved files, path/alias rejection and preview refusal; no service or network operation | `deploy/release.test.mjs`, `deploy/local-validation.json` |

The HTML integration check uses the actual Fastify application and completed web output with `Fastify.inject`, an explicit synthetic environment and no mail transport. It opens no listening socket or browser. Its HTML parser checks initial markup and the inputs used by the client router; it does **not** execute hydration, JavaScript interactions, layout or accessibility tools. API tests use injected fake transports only. Measurement tests inspect the adapter in a fake DOM; they do not establish that Google received an event.

The separate standards reviewer read the supplied source corpus and reviewed API, content/truth/search, measurement, form/navigation and animation integration code. This is another AI task worker sharing context and filesystem, **not independent human or external audit certification**. Review found and coordinated fixes for route-attribution loss, missing service measurement routes, form length/uncertainty behavior, duplicate inquiry events, inconsistent GA ID validation, repeated-slash routing and encoded server/client route disagreement. Exact findings and resolutions are in [observations.json](standards/observations.json).

Earlier failed diagnostic records are retained as `standards/build-integration-initial.json` and `standards/local-verification-initial.json`. The initial build checker required corrections for its HTML parser's attribute casing and the API's actual 400 validation contract. The standards comparator required semantic key ordering across native Node/tsx serialization. Obsolete build manifests/bundles also required explicit output cleanup. These records describe resolved implementation/checker issues; read the latest completed run for the current state.

## Required target-side evidence

| Gate | Current state | Concrete completion condition |
| --- | --- | --- |
| Browser and accessibility journey | **BLOCKED in authoring environment** by an explicit local-URL browser policy; no alternate browser workaround used | Run the portable suite on an authorized target; inspect keyboard/focus/error recovery, reduced motion, reflow/zoom, contrast, animation failure and no-JavaScript submission. Record actual browser/screen-reader/device combinations. |
| Native browser WebGL promotion | **BLOCKED**; official Node Canvas evidence is complete, actual WebGL/compositor evidence is absent | Run the supplied native harness and actual visual review; promote only exact byte-bound passing assets with `scripts/promote-native.mjs`, rebuild and rerun acceptance. |
| Canonical identity | **BLOCKED**; existing truth repository/export was not available | Import its actual approved public projection with full revision and exact digest. Inspect public facts and references. Production build fails closed without it; synthetic test fixtures must never replace it. |
| Direct email | Local behavior PASS; **actual sending/receipt unverified** | Configure the real protected sender/recipient, inspect authentication and trace a controlled inquiry from provider acceptance to the destination mailbox. Acceptance is not receipt, reading or qualification. |
| GA4 and search accounts | Adapter PASS; **actual accounts/collection unverified** | Set actual public IDs/tokens, verify property ownership/configuration and consented wire/DebugView behavior; disable duplicate automatic measurement. Preserve missing reports as unavailable, not zero. |
| Training/grounding policy | Preview defaults are explicit; **production choices not supplied** | Configure independent `AI_TRAINING_POLICY` and `GOOGLE_EXTENDED_POLICY` from the actual owner policy. Google-Extended also affects specified grounding uses. |
| Public release and recovery | **Not executed locally** | Inventory BUBBLES, preserve configuration, stage the intended hostname, inspect DNS/TLS and relevant IPv4/IPv6 paths, perform cutover/rollback checks and observe real external requests. |
| Field performance/search/business outcomes | **Unavailable** | Record real sample/window/device scope for field metrics and separate indexing/citations/referrals, SMTP acceptance, qualified inquiries and revenue. Build bytes and laboratory evidence do not establish these outcomes. |

The native browser promotion registry intentionally remains empty, so the supplied SVG renderer is active. All five genuine `.riv` files are delivered and available as public assets; their presence and successful Canvas proof are not labeled as completed browser WebGL certification. Chromium mobile emulation is not a physical phone test, and Playwright WebKit is not evidence of actual Safari coverage.

## Reproduce

```bash
npm ci
npm run verify:local
```

`verify:local` runs strict typecheck, application tests, build, asset audit, standards check and built-artifact integration in sequence. Do not run another build concurrently: the integration report verifies that its complete output snapshot stayed unchanged during the check.

On an authorized browser host, complete `npm run test:browser` and the separate native WebGL/visual gate. The project `verify` command includes browser checks; `verify:production` additionally uses the production build contract. An intentionally blocked browser run must never be relabeled as passed to clear a gate.

For a narrower check after a completed build:

```bash
npm run test:standards
npm run test:build
```

Keep the private standards, truth imports, review artifacts and operational credentials outside the public document root. The ledger accounts for every supplied document; the referenced complete 146-original legacy archive and companion utilities were not supplied and are not silently certified. No source count, valid JSON, checksum, package test or this document grants permission to publish unsupported facts.
