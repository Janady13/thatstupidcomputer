# Measurement and search completion — 2026-09-13

Status: candidate preparation in progress. Production remains `20260913-astra-attention-r2` until the tested `20260913-astra-measurement-r3` is activated. This report will be finalized against actual public and provider readbacks.

## Verified baseline and scope

Google property `533588991`, rebuild stream `15768871672`, measurement ID `G-RNRQK2CRDY`, exact website `https://thatstupidcomputer.com/`. The stream receives events, but the 2026-09-13 Data API baseline has empty hostnames because the adapter sent relative page locations. The repair composes an absolute URL only from the approved public canonical origin and finite route dictionary; raw visitor URLs, private form fields, query strings and fragments remain excluded.

Both Search Console properties (`sc-domain:thatstupidcomputer.com` and the HTTPS-prefix property) are owned by the authorized account. Their eleven-page sitemap was fetched at 11:03:27 UTC with zero errors/warnings. Google's homepage inspection still reflects its 2026-09-12 14:49:53 UTC crawl of the old redirect to `thatdeveloperguy.com`; that stale index snapshot is not evidence of a current homepage redirect.

The blanket redirect is already removed. HTTP/www normalization remains, as do three intentional migrated-content redirects for the old SEO guide, Google Business Profile guide and blog. No unrelated redirect, host, DNS, TLS, SMTP or canonical truth configuration is in this change.

## Provider changes and readbacks

At 15:03:05–09 UTC, the existing Google property gained twelve event-scoped dimensions, the STANDARD-unit `metric_value` metric and one once-per-event `generate_lead` key event. Exact resources and before/after API readbacks are retained privately under `.build/astra-measurement-proof/`. `generate_lead` means SMTP acceptance only. No live inquiry, email or fabricated lead event was sent. Historical properties, streams, key events, timezone and retention were preserved.

Enhanced Measurement's master switch and Signals were already disabled; email redaction was enabled, with no create/edit-event rules on the current stream. These were read, not unnecessarily toggled. Google's dimension-level ads-personalization flag is supported only for user-scoped dimensions, so no such flag is claimed for these event dimensions; browser advertising consent remains denied.

The working Bing account did not contain this site. It was added at 15:00:57 UTC; ownership verification awaits the new release's public meta tag. The unrelated secondary Bing credential returned HTTP 400 and was not rotated or modified. Existing root IndexNow key files were preserved.

## Tests, release and limits

The actual unit regressions first failed on the old relative-URL implementation. After repair, 24/24 measurement tests and the complete 264-test application suite passed, along with strict types, preview build, asset/standards and built-HTTP checks. Architecture traversed 91 browser modules with zero violations. The browser regression also failed against the old bundle, proving the application-level bug; the full rebuilt browser run is in progress.

Only the existing adapter, its type declaration and App configuration wiring change in production code. Tests and measurement documentation accompany them. No dependency, original artwork, animation controller or backend behavior changes. Local verification uses Node 26.3.0; independent Bubbles validation must use the installed Node 24.21.0 before activation.

Mocked browser/unit events prove the application contract, not third-party wire delivery or Google's processed reporting. Sitemap submission and IndexNow acceptance are not guarantees of crawling, indexing or rankings. DebugView, physical-phone acceptance, real mailbox receipt, qualification and revenue require distinct evidence and are not inferred.
