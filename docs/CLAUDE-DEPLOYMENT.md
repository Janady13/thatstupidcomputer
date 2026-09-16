# Deploy the complete website to BUBBLES

This handoff is for an operator or Claude working with authorized access to the existing BUBBLES host. It contains concrete local build and deployment artifacts. **No BUBBLES command, DNS change, service change, live SMTP send or production acceptance has been performed by this delivery.** Begin with host discovery and a dry-run; activate only the exact reviewed release and ingress diff. Preserve the existing site until the replacement has passed its gates.

The delivered website is React/TypeScript with Vite prerendering and a Node/Fastify direct-email backend. The original v1 animation workbench described Next and optional Python authoring utilities; those are historical source facts, superseded here by the authorized whole-site implementation. Do not install Next, Python, a submissions database, PostgreSQL, an outbox or a replacement identity graph. Keep the original animation assets, motions and coordinate systems. Read `docs/ANIMATION.md`, `docs/TRUTH-INTEGRATION.md`, `docs/MEASUREMENT.md`, `apps/api/README.md` and the governing private standards before adapting the host.

## What is known, and what must be discovered

Historical attachment paths are discovery leads, **not currently verified host state**:

| Item | Historical lead / proposed target |
| --- | --- |
| Existing website | `/home/user/sites/thatstupidcomputer` — preserve and inspect. |
| Canonical truth worktree | `/home/user/thatdeveloperguy-truth` — inspect actual current schema/export and full revision. |
| Canonical bare repository | `/home/user/thatdeveloperguy-truth.git` — preserve. |
| Canonical files mentioned | `index.ts`, `schema.ts`, `MANIFEST.json`, `organization/brands.json`, `properties/properties.json`; do not assume unchanged contents. |
| Historical revision | `0d548feb6f52` is an old short prefix, not a usable full deployment pin. |
| Historical staging name | `thatstupidcomputer.thatwebhostingguy.com`; current routing, TLS and ownership are unverified. |
| Historical apex behavior | A redirect to `thatdeveloperguy.com` was mentioned. Inspect actual behavior; the new intended canonical origin is `https://thatstupidcomputer.com`. |
| Proposed isolated runtime | `/home/user/sites/thatstupidcomputer-runtime` — create only after confirming it is unused or already belongs to this deployment. |
| Proposed new unit | `thatstupidcomputer-runtime.service` — first confirm there is no unrelated unit with that name. |

Record the actual Linux distribution, CPU architecture, free disk, Node/npm executables and versions, service account/group, ingress chain, available ports, systemd/nginx versions, existing vhost, certificate/renewal configuration, DNS A/AAAA records and the current externally observed site. Check IPv4 and each published IPv6 address independently. A private/tailnet result does not establish public reachability. Do not paste credentials, canonical private records or raw visitor logs into the handoff.

Use the verified Node 24.19+ executable within major 24 and the locked npm 11.9 workflow. The systemd template intentionally contains an unresolved Node-path token. Never assume an interactive shell's version manager is available to systemd. Verify the `user` account/group in the template and replace it if discovery establishes different actual ownership. Do not blanket restart nginx or replace an unknown service.

## Artifact and runtime layout

The transfer archive is `artifacts/TSC-COMPLETE-WEBSITE.zip`, with a `TSC-COMPLETE-WEBSITE/` root. It contains the full source, compiled preview website/API, selected native source/compiled files/proofs, documentation and private standards. It excludes dependencies, local tools, actual environment files and actual private truth exports. Validate the delivered archive/checksum and inspect its inventory before extracting into a fresh staging directory. The included preview build is reviewable; it is not a production build with approved canonical identity.

| Runtime path | Purpose |
| --- | --- |
| `releases/RELEASE_ID/` | One independently installed and built release; never overwrite a prior release. |
| `current` | Atomic symlink to the selected release. |
| `previous` | Previous selected release, kept for rollback. |
| `shared/runtime-env/RELEASE_ID.env` | Protected runtime/SMTP snapshot, mode 0600. |
| `shared/build-env/RELEASE_ID.env` | Protected production build settings and exact public-projection pins, mode 0600. |
| `shared/activations/` | Private activation records containing release IDs/states, no inquiry data. |
| `releases/RELEASE_ID/runtime.env` | Symlink to that release's immutable runtime snapshot. |
| `releases/RELEASE_ID/build.env` | Symlink to that release's immutable build snapshot. |
| `releases/RELEASE_ID/private/truth/` | Narrow reviewed public export input; never a full canonical registry copy. |

The service reads files but receives no filesystem write permission. It serves only `apps/web/dist`, never the runtime/project root. Keep all prior releases and snapshots until the owner-approved retention/recovery policy allows cleanup. The helper performs no deletion of old releases. Back up existing vhost/unit files and preserve their actual original paths and restore instructions before changing them; a copied file is not proof of a tested restore.

After inspecting the archive and confirming the proposed root is unused, an operator can create its initial directories. These are Linux/Bash commands; fill in an actual unique release ID and verified absolute Node executable first. Do not reuse the placeholder or overwrite an existing release.

```bash
TSC_ROOT=/home/user/sites/thatstupidcomputer-runtime
TSC_RELEASE=ACTUAL_UNIQUE_RELEASE_ID
TSC_NODE=/ABSOLUTE/VERIFIED/NODE24
umask 077
# First-time initialization only: mkdir must fail if this root already exists.
mkdir -m 0700 "$TSC_ROOT"
mkdir -m 0700 "$TSC_ROOT/releases" "$TSC_ROOT/shared"
mkdir -m 0700 "$TSC_ROOT/shared/runtime-env" "$TSC_ROOT/shared/build-env"
mkdir -m 0700 "$TSC_ROOT/releases/$TSC_RELEASE"
```

Copy the inspected archive root's contents into this **new empty release directory** using the actual extraction path. Do not copy a `.env`, `node_modules`, actual private truth records or external symlinks from another checkout. Do not use a deletion/mirroring flag against the historical live site. Subsequent releases reuse the verified runtime root and create only a fresh release directory.

## Prepare actual public truth and protected configuration

Inspect the existing canonical registry and its public-selection/export mechanism without changing its inheritance or creating another graph. The website adapter must preserve its existing publisher/provider/brand IDs and approved relationships. If no approved public export establishes the required relationship, production remains blocked until the existing canonical process resolves it. Never label synthetic fixture data approved or edit a failed approval record to clear the gate.

From the new release, import the actual approved narrow export using the actual full current canonical revision:

```bash
cd "$TSC_ROOT/releases/$TSC_RELEASE"
"$TSC_NODE" scripts/import-truth.ts /ABSOLUTE/APPROVED/PUBLIC-EXPORT.json private/truth/reviewed-export.json FULL_APPROVED_CANONICAL_COMMIT
```

The importer exclusively creates a protected snapshot and reports its full commit and SHA-256. It does not change the upstream registry. Populate the protected build snapshot with those actual values, using a secure editor or secret-management process. The activation validator requires its projection path to resolve inside this release's `private/truth/` directory.

| Build setting | Required value |
| --- | --- |
| `TSC_TRUTH_PROJECTION` | Absolute path to this release's imported, reviewed export. |
| `TSC_TRUTH_COMMIT` | Actual full 40- or 64-character lowercase reviewed canonical revision. |
| `TSC_TRUTH_SHA256` | SHA-256 of the exact approved export bytes. |
| `AI_TRAINING_POLICY` | Explicit actual owner-approved `allow` or `deny`. |
| `GOOGLE_EXTENDED_POLICY` | Separate explicit actual owner-approved `allow` or `deny`; this covers the named Google training **and grounding** uses. |
| `GA4_MEASUREMENT_ID` | Optional actual public property ID after the account/consent gates; otherwise empty. Match runtime. |
| `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` | Optional actual public account tokens; do not overwrite another owner's verification method. |

Production refuses missing/invalid/expired approval, wrong pins or missing crawler choices. Inspect the actual existing crawler policy before choosing whether to preserve it. No supplied value grants publication approval. Build pins and policy are recorded in `.build/build-record.json`, outside public output. If the projection or policy changes, rebuild; do not hand-edit the record.

Populate the separate runtime snapshot with `NODE_ENV=production`, `HOST=127.0.0.1`, `PORT=3000`, `PUBLIC_ORIGIN=https://thatstupidcomputer.com`, and `TRUST_PROXY=127.0.0.1` for the supplied direct loopback nginx ingress. Leave `ALLOWED_ORIGINS` empty unless an actual additional HTTPS origin is approved. If the actual CDN/proxy chain differs, explicitly review the forwarding/trust design and adapt the helper/template together; do not trust arbitrary forwarded headers.

Set the actual `SMTP_HOST`, `SMTP_PORT`, explicit `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, fixed `SMTP_FROM` and sole fixed `SMTP_TO`. `SMTP_SECURE=false` means mandatory STARTTLS, not plaintext; implicit TLS on port 465 requires `true`. Certificates remain verified with TLS 1.2 minimum. A public contact email in the truth projection does not determine the private delivery recipient. Do not put any SMTP secret in a build/public variable. Match runtime `GA4_MEASUREMENT_ID` to the build snapshot, or leave both empty.

Use dotenv syntax understood by Node's `--env-file`; do not shell-source either snapshot or print its contents. The unit uses Node's parser too. After securely creating the two files, connect only this release to them:

```bash
TSC_BUILD_ENV="$TSC_ROOT/shared/build-env/$TSC_RELEASE.env"
TSC_RUNTIME_ENV="$TSC_ROOT/shared/runtime-env/$TSC_RELEASE.env"
chmod 0600 "$TSC_BUILD_ENV" "$TSC_RUNTIME_ENV"
ln -s "$TSC_BUILD_ENV" "$TSC_ROOT/releases/$TSC_RELEASE/build.env"
ln -s "$TSC_RUNTIME_ENV" "$TSC_ROOT/releases/$TSC_RELEASE/runtime.env"
```

Treat these per-release files as immutable after approval. A later secret rotation creates a reviewed new runtime snapshot/release selection, preserving a usable rollback decision; do not leave an old compromised credential eligible for rollback.

## Build and verify before activation

Install this release's exact dependencies using `npm ci` from its root. Do not use `latest`, forced peer resolution or a shared mutable dependency directory. Do not rebuild native characters merely to deploy the site; the normal renderer remains the proven SVG implementation until the separate real-WebGL promotion gate passes. Native Canvas evidence is actual but does not replace browser evidence.

```bash
cd "$TSC_ROOT/releases/$TSC_RELEASE"
npm ci
npm run verify:local
node --test deploy/release.test.mjs
# Browser installation/use must be allowed on this actual machine.
npm run test:browser
# Local verification builds a preview. Build production LAST using the protected pins.
"$TSC_NODE" --env-file="$TSC_BUILD_ENV" --import tsx scripts/build.ts --production
npm run test:assets
npm run test:standards
npm run test:build
```

`verify:local` covers strict types, local tests, preview build, assets, standards and built-route injection. It does not run a real browser or contact email/analytics services. `verify` adds the required browser suite. `verify:production` is also available when invoked from an explicitly configured protected build environment; never obtain that environment by sourcing untrusted shell text. Running `npm run build`, `verify:local` or `verify` **after** the final production build replaces it with preview output; rebuild production before activation.

Keep runtime SMTP credentials out of ordinary automated browser tests: failure/unconfigured cases use synthetic inputs and injected mail transports. The protected production build snapshot contains only public measurement values and private provenance pins, not mail credentials.

On the actual browser/device matrix, verify all 11 pages and initial HTML, direct/deep links, true 404, slashless redirects and approved `utm_source` preservation, keyboard/focus, contrast, zoom, motion pause/reduced motion, slow/failed assets, native form submission without JS, validation/error focus and receipt semantics. Exercise all five mobile characters, fourteen actions, desktop states and room interactions. Real Chromium/WebKit/Firefox testing and physical iOS/Safari are separate observations; do not rename emulation as a device test. Follow `docs/ANIMATION.md` before any native `.riv` promotion and retain exact runtime/file hashes.

Run the **default nonmutating deployment dry-run**. It reads the staged release, validates production/configuration/pin consistency and prints safe release IDs/status only. It does not change pointers, restart services, open a listener, verify SMTP or send a message.

```bash
"$TSC_NODE" deploy/release.mjs --release "$TSC_RELEASE"
```

A missing host path, environment snapshot, production build, approved pin or dependency installation must fail; do not bypass the check. Dry-run success is preparation evidence, not production acceptance.

## Review and install the new service and ingress

Render `deploy/thatstupidcomputer-runtime.service.template` into a separate reviewed candidate. Substitute the actual absolute Node executable and verified account/group. Verify its read-only filesystem settings on the actual systemd version. Core dumps are disabled; no inquiry write path is granted. Node/V8 needs executable JIT mappings, so do not add `MemoryDenyWriteExecute=true`. Run the actual host's `systemd-analyze verify` on the rendered candidate. This delivery did not validate BUBBLES's systemd.

Install the reviewed candidate as the proposed **new** `thatstupidcomputer-runtime.service` only after confirming that name is unused or belongs to this managed deployment. Preserve any prior managed version before updating it. Run `systemctl daemon-reload` after that exact unit-file change. Enable it at the reviewed activation step; it cannot start until `current` is selected.

The nginx files are templates, not a command to replace `nginx.conf`:

- `deploy/nginx/http-logging.conf` belongs once in the existing `http {}` context. Its finite map/log format never records raw URI/query, headers, visitor IPs, name/email or form body.
- Render `website-server.inc.conf.template` into the reviewed existing canonical HTTPS server. Replace the private access-log token with a new approved restricted log path and merge its `location /` with the actual existing config; do not add a conflicting duplicate location.
- `https-server.conf.template` is a reference wrapper only. Reuse the actual valid certificate, private-key path, renewal method and reviewed TLS settings. Do not guess `/etc/letsencrypt` paths, issue certificates, add www/staging aliases or change DNS from this template.

Review inherited or additional access logs: a privacy-safe new log does not sanitize an inherited combined log. Nginx's request error log cannot use the sanitized format and may include URI/IP data, so this vhost sends its error log to `/dev/null`. Monitor finite access statuses and the backend's safe logs instead. Keep configuration/daemon diagnostics protected; verify other ingress layers and any preserved HTTP/staging vhost against the same privacy rule. Do not add request-body tracing or debug logging to investigate forms.

The proxy enforces 16 KiB bodies, a matching memory buffer, disabled body-file mode, HTTP/1.1 upstream streaming and `proxy_request_buffering off`. Response buffering/cache/store are disabled, temporary response files are disabled, `proxy_next_upstream off` forbids automatic retries, and upstream errors retain their actual status. Gzip is explicitly enabled at level 5 above 1,024 bytes, with `Vary: Accept-Encoding`, for HTML and the listed text/CSS/JS/JSON/SVG/WASM/XML types; already compressed images and fonts are excluded. Verify actual compressed transfers at the HTTPS edge. Verify no request body is written to nginx temporary files using bounded synthetic data. Do not mirror `/api/demo` or replay it on an upstream failure. For any necessary edge-side 413/429 styling, preserve the actual status and accessible outcome.

Run `nginx -t` against the staged actual configuration and inspect the exact diff. Preserve ACME routes and existing third-party sites. Keep the old public ingress until the new service and candidate private preview are accepted. Only the reviewed canonical vhost transition may remove the historical apex redirect; do not redirect the unrelated destination site or change its configuration. DNS/TLS edits, if actually needed, require their own exact reviewed diff and rollback.

## Activate the reviewed release; roll back if needed

The helper does not install/modify nginx, DNS, certificates or unit files. After preflight and service-file review, execute it through the host's authorized mechanism with permission to restart the **new exact unit**. The example uses sudo and the verified absolute Node executable; use the actual authorization arrangement.

```bash
sudo "$TSC_NODE" "$TSC_ROOT/releases/$TSC_RELEASE/deploy/release.mjs" --release "$TSC_RELEASE" --activate
```

It takes an exclusive lock, records the prior pointer, atomically selects `current`, preserves `previous`, restarts the named unit and performs bounded GET-only configuration-readiness checks. It also checks the unit's actual MainPID working directory so an unrelated service on port 3000 cannot pass acceptance. It neither verifies SMTP nor sends email. Restart is bounded to 45 seconds; readiness has at most 12 attempts with per-request timeout and bounded delays. A failure restores the previous pointer and restarts the prior release, or removes the first selection and stops the new unit. If restoration itself fails, stop and inspect the host; there is no unbounded retry. An existing activation lock blocks another attempt; investigate its owner before removing a stale empty lock.

When the new private service is confirmed, apply only the reviewed nginx diff, run `nginx -t`, and reload the actual nginx service through the authorized operator. Reuse the current TLS setup. Enable the new unit for boot only after its reviewed first activation. Record actual timestamps, revision/hash, configuration snapshots and the exact prior ingress restore paths.

For a later rollback, choose the **explicit previously accepted release ID** from the protected activation record, inspect whether its truth review and credentials are still valid, and run the same dry-run and activation commands with that ID. The atomic swap restores that release's code and matching environment snapshots. Do not force expired identity approvals or compromised credentials through a rollback gate; use a reviewed valid forward repair when necessary.

```bash
TSC_ROLLBACK=ACTUAL_PREVIOUS_ACCEPTED_RELEASE_ID
"$TSC_NODE" "$TSC_ROOT/releases/$TSC_ROLLBACK/deploy/release.mjs" --release "$TSC_ROLLBACK"
sudo "$TSC_NODE" "$TSC_ROOT/releases/$TSC_ROLLBACK/deploy/release.mjs" --release "$TSC_ROLLBACK" --activate
```

If the public ingress change fails, restore its separately preserved prior vhost configuration and validate/reload it. The release helper does not own nginx rollback. A restart may interrupt an in-flight SMTP attempt: its outcome is uncertain and the memory-only duplicate cache resets. Never replay inquiries automatically after restart or rollback.

## Required live acceptance and evidence

Process liveness, configuration readiness, SMTP acceptance and mailbox receipt are different checks. Complete these after the exact activation, from the declared actual vantages:

| Gate | Required observation |
| --- | --- |
| Process and release | Unit active, expected MainPID/release directory, loopback-only port and new build/pins. |
| Public transport | Independent public HTTPS on canonical hostname; valid TLS/renewal, correct redirect behavior and all advertised address families. |
| HTTP/content | All 11 canonical routes serve initial HTML; unknown and encoded aliases return actual 404; private/source/env/standards/maps are inaccessible; WASM/JSON/SVG MIME and caches are correct; enforced headers preserve the UI. |
| Inquiry failure paths | Invalid, oversized, cross-site, duplicate, unavailable and timeout cases have truthful accessible errors; no proxy retry/body logging or disk spooling. Use a controlled staging/fake transport for destructive failure simulation. |
| Controlled email | With actual permission to send to the configured controlled mailbox, submit one unique synthetic request through the real browser. Correlate safe request ID → actual SMTP acceptance → observed destination mailbox/folder and redacted received headers. Never call API success mailbox receipt. Inspect real sender-domain SPF/DKIM/DMARC without blindly changing DNS. |
| GA4, when configured | Actual account/settings and permitted DebugView/device; zero Google requests/cookies before consent/after decline; finite payloads without PII/raw URLs; one SMTP-accepted event only; withdrawal stops further traffic. Disable configuration if this gate cannot be completed. |
| Search publication | Actual approved IDs/facts match the pinned projection and visible pages; production canonicals/robots/sitemap reflect the two explicit crawler decisions; actual ownership verification belongs to existing authorized accounts. Crawling/indexing/citation/referral remain separate observations. |
| Browser/animation | Fresh actual browser/device execution, keyboard and motion checks, consent/no-JS form path, safe loading fallbacks. Native WebGL promotion remains separate if unverified. |
| Rollback and observation | Confirm restoration procedure with the actual accepted prior release/ingress and observe the owner-agreed window. No universal availability or recovery target is invented. |

Keep safe correlation IDs, exact revisions/hashes, tool versions, times, vantages and PASS/FAIL/BLOCKED reasons. Keep raw mailbox headers and infrastructure details in restricted evidence; never publish inquiry text, recipient addresses, credentials or canonical private records. Required inaccessible or unexecuted checks remain **BLOCKED**, not zero and not passed. Local tests and the helper's configuration readiness do not declare this production website accepted.

## Local deployment-artifact verification

`deploy/local-validation.json` records the actual local environment and scope. The helper passed Node syntax checking and six temporary-filesystem tests covering atomic pointer selection/rollback, preservation of both release directories, refusal to replace an ordinary file/directory, path traversal and symlink-alias refusal, and refusal of a preview build. Those tests never called systemctl or the network. A temporary service copy with the Node token replaced passed `systemd-analyze verify` under local systemd 255; no service was installed or started. Nginx is not installed in this local container, so merged nginx syntax and every BUBBLES execution/acceptance gate remain blocked until performed on the actual host.

Primary references checked 2026-09-13: [nginx proxy buffering/retry controls](https://nginx.org/en/docs/http/ngx_http_proxy_module.html), [nginx log format contexts](https://nginx.org/en/docs/http/ngx_http_log_module.html), and the installed local `systemd-analyze` verification facility. The [systemd execution manual](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html) is the operator reference for target-version applicability. Exact host applicability must be verified on BUBBLES.
