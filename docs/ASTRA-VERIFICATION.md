# Astra workshop release — 2026-09-13

Status: LIVE. Release `20260913-astra-workshop-r1` was activated at 2026-09-13 13:23:15 UTC. Source, build, browser and public HTTP checks passed within the limits recorded below.

## Delivery and preservation

The operator source is `/Users/josephanady/Code/thatstupidcomputer-website`. Work was isolated in `/Users/josephanady/Code/thatstupidcomputer-astra` and its original source was checkpointed as `60485455a3986c6a1ea5c42f79dda6cbf2599cc0`. Before integration, 295 scoped source, asset and documentation paths were compared with that checkpoint, including every newly owned path. No existing operator edit conflicted. Generated local reports are not copied over reports belonging to a different build.

Bubbles live release: `/home/user/sites/thatstupidcomputer-runtime/releases/20260913-astra-workshop-r1`.
Preserved prior release: `20260913-1225-0d548feb`.
Only the dedicated `thatstupidcomputer-runtime.service` is in the activation scope. Nginx configuration, other sites, canonical truth files, original artwork, native eligibility manifests and the dependency lock remain unchanged.

All 35 reviewed source/document files were integrated into the original operator checkout with an exact before/after hash guard. Its typecheck, 260 application tests and architecture check then passed. All 292 scoped code, dependency and asset files match the Bubbles release byte-for-byte. The existing service restarted successfully on Node 24.21.0, remains enabled, binds only `127.0.0.1:3000`, and reports ready. Its verified PID is 3860011 with zero automatic restarts. The prior release remains selected by `previous`. No nginx reload or unrelated service restart was performed.

## What changed

- Per the user's screenshot feedback, Services and all four service-detail pages now live on an enlarged bulletin board, with readable pinned notices, the existing computer beside it and normal document scrolling. Their old popup, close box and floating scene note are removed. Full content, breadcrumbs, links and no-JavaScript access are retained.
- The illustrated room now offers a six-beat guided tour and a five-beat website rescue, using the existing CRT/mobile controllers. Real page links, manual progression, pause/resume, cancellation, reduced motion and hidden/offscreen suspension remain visitor controlled.
- All five mobile personalities can use three finite stage scripts, including website rescue and launch-day performances. Positioning and expressive acting are separate beats so a movement command cannot swallow an expression. Existing 32 expressions/moves, dragging, keyboard direction and explicit censored-attitude opt-in are retained.
- The initial privacy choice occupies less of the scene, retains equal allow/decline choices and expandable details, and no longer sends the first visit to the footer on dismissal.
- The original page heading and introduction are readable below the intact full-viewport room. The large stylesheet is now an import manifest over nine extracted modules plus the new board module; existing cascade ordering was preserved.
- A repeatable architecture check traverses runtime imports, including lazy imports, JSON and raw assets. It enforces browser/server/private separation and prevents animation modules depending on product UI or measurement. The current browser graph contains 89 code modules and reports zero violations.

The main ownership map remains:

```text
apps/api/                  validated input and direct-email service
apps/web/src/animation/    rigs, controllers, choreography and authored performances
apps/web/src/components/  customer-facing composition and controls
apps/web/src/measurement/ consent and bounded analytics events
apps/web/src/styles/      tokens, base, components, layout and responsive rules
apps/web/public/           reviewed public assets only
apps/web/dist/             only public build root
packages/site/            shared public content, metadata and truth projection contract
private/ and native/      protected material, never public directories
tests/ and scripts/       repeatable checks and build tooling
deploy/                   existing isolated release activation and rollback helper
```

## Verification evidence

Local final source checks: `npm run verify:local` passed typecheck, 260 application tests, build, asset audit, standards inventory and 20 built-HTTP checks. The final local check used Node 22.18.0; browser automation uses the separately installed Node 26.3.0. Neither is used as proof of the required production Node version.

The final candidate was independently rebuilt on Debian Bubbles using `/opt/node-v24.21.0-linux-x64/bin/node` and the unchanged lock installed by `npm ci`. Typecheck, 260 application tests, protected production build, asset audit, standards inventory, 20 built-HTTP checks and all six existing release-helper tests passed. The production build record says `approved-projection`, declares all eleven routes and records Node 24.21.0. Release preflight passed without contacting SMTP. Host evidence is `.build/astra-final-production-verification.log` inside the candidate.

Dependency lock SHA-256: `818f0012c01844dc38517611b18166b0229098dd4e348db206739b8c8a8c6c69`.

The browser suite used the existing dedicated no-mail fixture server, isolated port 4188, the desktop user's account and two workers. All twelve focused board cases passed across Chromium desktop/mobile emulation, Firefox and WebKit. These include reflow at 320, 390, 768, 1024 and 1440 pixels, accessibility, no-JavaScript reading and restoring an in-view keyboard focus target. The final complete run including the board revision passed 159 cases in 7.0 minutes, with one intentional mobile-only skip for desktop SVG hotspot geometry. Earlier single-worker runs exposed an account-environment launch problem with Firefox; launching it as the actual desktop user resolved that without reinstalling dependencies.

Public verification bypassed this Mac's private hosts-file pin and connected to the DNS-published IPv4 address `169.155.162.118` with normal TLS certificate verification. No public AAAA answer was returned during discovery. All 41 GET-only HTTP checks passed: eleven complete HTML routes, sixteen versioned client assets, eight protected/missing paths denied, health/readiness, robots/sitemap and both HTTP/www canonical redirects. All five Services documents contain the board rather than a page panel. A rapid concurrent repeat initially hit the existing 120-request/minute global limit; it passed after the window cleared and the HTTP checks were serialized and paced. No protection was loosened.

The staged Bubbles browser check passed, followed by fresh public desktop and mobile-emulation checks. The final public run passed seven interaction/render checks, with zero page errors and zero failed HTTP responses: room tour, real destinations, focus return, Services board and detail navigation, overflow, two finite character performances and the visible paused final character. Actual desktop/mobile screenshots were inspected. One initial immediate stage capture was blank; this did not reproduce in settled full-sequence captures or the final public run. Its cause remains unproven, so no speculative production fix was made. The initial image and subsequent geometry/capture evidence are retained.

`nginx -t` passed against the existing configuration. It emitted existing deprecation/protocol/MIME warnings; these unrelated configurations were not rewritten. The dedicated unit's post-activation warning-level journal had no entries.

Independent read-only code review found and resolved swallowed stage expressions, final-beat keyboard focus loss, an unavailable final-pose resume control, JSON/raw boundary-check gaps and a board-return scroll ordering issue. Regression tests were first observed failing for those actual behaviors before their fixes. The frontend design skill informed the enlarged, pinned-notice reading surface while preserving the existing illustration and visual palette.

## Explicit limits

No live inquiry or test email was sent. Readiness checks establish configured SMTP, not mailbox receipt. Analytics account settings and real collection were not claimed verified. Browser mobile emulation and the WebKit engine do not establish physical-phone or installed Safari acceptance. No native candidate was promoted to verified runtime status. No field traffic, conversion, revenue or performance result is inferred from these checks.

The standards inventory check validates the existing corpus mapping; it is not a new claim that every historical standard or external account requirement has been re-audited. There is no database or alternate truth graph in this delivery.

## Commands and retained evidence

Commands actually run include `npm run verify:local`, `npm run typecheck`, `npm test`, `npm run test:architecture`, Playwright `test --workers=2 --max-failures=3 --reporter=list` on isolated port 4188, the protected Node 24 `scripts/build.ts --production` build, `npm run test:assets`, `npm run test:standards`, `npm run test:build`, `node --test deploy/release.test.mjs`, release preflight/activation, `nginx -t`, service/port/process checks and the GET-only public/browser proof scripts.

Evidence root: `/Users/josephanady/Code/thatstupidcomputer-astra/.build/astra-proof/`.

- `final-browser.log`: 159 passed, one intentional skip.
- `bubbles-production-verification.log` and `production-build-record.json`: actual Node 24 production gates and approved projection pins.
- `source-before-integration.json`, `source-integration.json` and `bubbles-source-hashes.json`: preservation and exact-source checks.
- `bubbles-activation.txt` and `bubbles-live-host.txt`: actual release selection and running service.
- `public-http.json` and `public-browser.json`: final public checks.
- [Desktop board](/Users/josephanady/Code/thatstupidcomputer-astra/.build/astra-proof/public-desktop-services.png), [mobile board](/Users/josephanady/Code/thatstupidcomputer-astra/.build/astra-proof/public-mobile-services.png), [paused character](/Users/josephanady/Code/thatstupidcomputer-astra/.build/astra-proof/public-character-stage.png).

## Changed source files

Paths below are relative to the operator checkout. Generated build reports stay with their own build and are not part of this integration.

```text
apps/web/src/App.tsx
apps/web/src/animation/choreography/useWorkshopStory.ts
apps/web/src/animation/office/navigation.ts
apps/web/src/animation/office/objects/BulletinBoard.tsx
apps/web/src/animation/performances/stage-shows.ts
apps/web/src/animation/performances/workshop.ts
apps/web/src/components/CharacterPlayground.tsx
apps/web/src/components/ComputerConversation.tsx
apps/web/src/components/ServiceBoardScenery.tsx
apps/web/src/components/Workshop.tsx
apps/web/src/measurement/ConsentControls.tsx
apps/web/src/measurement/consent.css
apps/web/src/styles/base.css
apps/web/src/styles/components/forms.css
apps/web/src/styles/components/pages.css
apps/web/src/styles/components/service-board.css
apps/web/src/styles/computer-conversation.css
apps/web/src/styles/layout/reading-and-reflow.css
apps/web/src/styles/layout/scene.css
apps/web/src/styles/layout/shell.css
apps/web/src/styles/layout/workshop.css
apps/web/src/styles/responsive.css
apps/web/src/styles/site.css
apps/web/src/styles/tokens.css
docs/ARCHITECTURE.md
docs/ASTRA-PLAN.md
docs/ASTRA-VERIFICATION.md
package.json
playwright.config.ts
scripts/browser-server.ts
scripts/check-architecture.mjs
tests/browser/animation-upgrades.spec.ts
tests/browser/service-board.spec.ts
tests/browser/workshop-stories.spec.ts
tests/site/architecture.test.ts
```
