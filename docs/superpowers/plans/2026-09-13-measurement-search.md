# Measurement and Search Completion Implementation Plan

> **For agentic workers:** Use the existing isolated Astra checkout, one writer per path, and execute the tasks in order. The primary agent owns provider changes, release integration and verification.

**Goal:** Complete the existing GA4, Google Search Console and Bing integration for `https://thatstupidcomputer.com`, proving account configuration and public delivery separately from engine indexing.

**Architecture:** Preserve the React/Fastify site, original characters, privacy controls and immutable Bubbles release workflow. Fix the existing analytics adapter rather than introduce another tag manager or tracking backend. Provider credentials remain on Bubbles; only public verification identifiers enter the build.

**Tech Stack:** Existing TypeScript/React, Node 24 production runtime, CSS/SVG, Google Analytics Admin/Data APIs, Search Console API, Bing Webmaster JSON API and IndexNow.

**Spec:** User request of 2026-09-13; `docs/MEASUREMENT.md`; `AGENTS.md`; governing private standards R08/R16 and the current GA4/GSC modules. This plan supersedes the adapter's relative-URL reporting limitation, not its privacy boundary.

## Global constraints

- Only `apps/web/dist/` is public. Never output credentials or publish operational evidence.
- Preserve `package-lock.json`, the canonical truth projection and SMTP configuration.
- Do not change other properties, streams, websites, account access or historical reports.
- No live inquiry/email, purchase, qualification or fabricated conversion event.
- Analytics remains opt-in-only; no names, email, message text, raw query/fragment, arbitrary pathname or referrer URL enters events.
- Record provider acceptance and actual indexing separately. No indexing/ranking guarantee.
- Preserve the main HTTPS/www normalization and the three migrated legacy-content redirects; the retired blanket homepage redirect is already removed.

## Task 1 — Provider baseline and exact targets

- [x] Resolve the deployed GA4 measurement ID to its real stream: property `533588991`, stream `15768871672`, `G-RNRQK2CRDY`. Historical streams remain untouched.
- [x] Read enhanced measurement, redaction, Signals, retention, event rules, key events, custom definitions and actual Data API responses.
- [x] Establish current defect: new-stream events have an empty hostname; no custom dimensions/metrics exist; `generate_lead` is not registered as a key event.
- [x] Confirm Search Console domain and HTTPS-prefix ownership and 11-page sitemap fetched with zero errors. Save homepage inspection showing the previous day's redirect snapshot.
- [x] Confirm the working Bing account has no target site; do not rotate the unrelated failing secondary credential.

## Task 2 — Repair canonical analytics context

**Files:** `apps/web/src/measurement/analytics.mjs`, `analytics.d.mts`, `apps/web/src/App.tsx`, `tests/measurement/measurement.test.mjs`, `tests/measurement/computer-funnel.test.mjs`, and relevant existing browser measurement tests.

- [ ] Add a regression asserting that consented events contain `https://thatstupidcomputer.com/about/`, not `/about/`, while a raw visitor URL/query/fragment and an unknown path cannot leak.
- [ ] Add origin validation and reconfiguration tests: missing origin, HTTP, credentials, path/query/hash and invalid URLs fail closed; a validated HTTPS root is normalized and used consistently.
- [ ] Observe the regressions failing against the existing adapter.
- [ ] Pass the already-approved `config.canonicalOrigin` into `analytics.configure`; extend typed configuration; construct `page_location` from that validated origin plus the finite route dictionary. Never read the browser's full URL for this field.
- [ ] Preserve deduplication, consent withdrawal, finite events and receipt handling. Run all measurement tests, strict types and application tests.

## Task 3 — Complete provider configuration

- [ ] Register only the adapter's existing finite event dimensions: `page_path`, `referral_source`, `referral_evidence`, `scene_id`, `interaction`, `entry_point`, `error_type`, `acceptance`, `interaction_stage`, `project_intent`, `metric_name`, `metric_rating`; register the standard-unit `metric_value` custom metric with its per-name interpretation.
- [ ] Register `generate_lead` once-per-event for the existing SMTP-accepted event only. Preserve historical key events and current property retention/timezone.
- [ ] Keep enhanced automatic measurement disabled on the current stream, Signals disabled, and email redaction enabled. Read each resulting configuration back.
- [ ] Add the exact HTTPS site to the existing working Bing account, obtain its actual verification code, and use the existing `BING_SITE_VERIFICATION` build input. Verify ownership only after the token is public.
- [ ] Submit/read back the current sitemap in Bing. Submit the eleven verified canonical URLs once through the preserved IndexNow key file. Resubmit the current Google sitemap after release and inspect the resulting provider record.

## Task 4 — Release and measured acceptance

- [ ] Update `docs/MEASUREMENT.md` to describe canonical URLs and real account state. Add an integration report with provider/resource IDs, timestamps, failures, readbacks, limits and rollback.
- [ ] Run the smallest regressions first, then `npm run verify:local`, architecture validation and relevant browser checks. Obtain independent read-only code review before release.
- [ ] Stage a new immutable Bubbles release with fresh pinned `npm ci`, current approved truth and separate protected env snapshots. Preserve the active r2 release.
- [ ] Build/test on actual Node 24; validate candidate private endpoint; integrate only scoped files into the operator checkout with hash/conflict guards; activate only the accepted release.
- [ ] Verify public TLS/HTTP, canonical routes, GA4 context, consent boundaries and Bing token, then provider readbacks. Keep real wire/receiver evidence distinct from mocked tests.
- [ ] Report final technical setup, exact files/tests, actual provider acceptance and any unavoidable recrawl/reporting delay. Do not label Google's old index snapshot as a new live redirect.
