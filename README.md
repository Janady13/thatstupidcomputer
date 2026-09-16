# That Stupid Computer — complete website

The complete React website and Node/TypeScript email backend for **thatstupidcomputer.com**. The supplied workshop artwork fills the home page below a clear header: the bulletin board, clock, desk drawer and coffee mug are the navigation (invisible hit shapes over the drawing, no floating labels), the computer turns toward whatever the visitor points at, and its conversation runs as one caption on the floor under the desk. The same service explanations follow as ordinary page content. Mobile visitors get a dedicated character scene, a link grid and readable, flowing pages.

This delivery includes editable source, the pinned dependency lock, compiled preview files, the original desktop computer with 32 performances, five expanded native Rive mobile characters, animation source and proof, automated tests, the supplied SEO/AIO build manual and its implementation mapping, and BUBBLES deployment files. It uses **no Next.js, Python, PostgreSQL or lead database**.

## Open the website

Use Node **24.19 or newer within Node 24**, and npm 11.9. Extract the archive, open its `TSC-WORKSHOP-CLEANUP-v4` directory, then:

```sh
node scripts/verify-release.mjs
npm ci
npm run preview
```

Open **http://localhost:4173**. The archive already contains the compiled preview. To rebuild after editing, run `npm run build` before preview. For development with live updates, run `npm run dev` and open **http://localhost:5173**.

The website works without analytics or SMTP credentials. The form accurately reports that sending is unavailable until its mail service is configured. It never displays a fake successful submission. All principal pages, links and the native HTML form also have useful initial HTML before JavaScript runs.

## Pages and functionality

| Page | Address |
| --- | --- |
| Interactive workshop | `/` |
| Services | `/services/` |
| Website design | `/services/website-design/` |
| Website rescue | `/services/website-rescue/` |
| Search visibility | `/services/search-visibility/` |
| Website care | `/services/website-care/` |
| Work: an interactive demonstration of this actual site | `/work/` |
| Process | `/process/` |
| About | `/about/` |
| Demo request | `/contact/` |
| Privacy | `/privacy/` |

Unknown addresses return an actual 404 page and status. Navigation uses normal links with enhanced client navigation, browser history and focus handling. Motion respects pause, reduced motion, visibility and intersection. The five mobile rigs now have 32 actions each, with their original fourteen preserved. The original desktop computer now has 32 performances, with additive cable arms, expressive hands, facepalm, shush, pointing, beckoning and permanently censored rude gestures behind an explicit request. The room retains its forty props. The Work page includes an interactive character playground with bounded movement, dragging, keyboard controls, opt-in performances and a shared pause. The workshop computer offers three project choices, playful roasts and direct demo links in an inline disclosure below the room. The expanded controls share space with a compact preview of the original character, without covering the artwork. Its chosen project category carries into the untouched form, where the same computer responds during submission, acceptance and recoverable errors.

The backend validates every submission, enforces same-origin delivery and rate limits, bounds mail concurrency, deduplicates recent submissions in process memory, and sends directly to one configured SMTP recipient. It records no form content in application logs or a database. An accepted result means the configured SMTP server accepted that recipient; it is not proof of inbox delivery.

Analytics loads only after explicit consent and a valid real GA4 ID. Route and conversion events use finite schemas. Form values, full browsing URLs, query strings, selectors and receipt IDs never enter the analytics payload. Optional Google and Bing verification tokens come from actual account configuration.

## Give this to Claude Code

If Claude is already modifying the live website, first read **`docs/WORKSHOP-CLEANUP-INTEGRATION.md`**. The targeted cleanup removes only the floating room-navigation JSX from the actual edited Workshop file, preserving the live room layout and all other bytes. Merge the inline conversation and companion preview from this complete reference only after reviewing current source. Do not run an older full animation installer or overwrite the edited live project wholesale. Otherwise, start Claude Code in this extracted directory and have it read **`CLAUDE.md`** and **`docs/CLAUDE-DEPLOYMENT.md`**. The website is already implemented. The remaining deployment work is to inspect BUBBLES, connect its existing canonical truth export, verified SMTP recipient and analytics/search accounts, run the browser acceptance suite, and activate a reviewed release using the included deployment files.

The supplied compiled files are deliberately a **noindex preview**. A production build requires the real approved public truth projection with exact revision/digest pins and explicit crawler-policy choices. The project consumes the existing organization/person graph by exact reference; it never creates another one. Do not turn synthetic test fixtures into business facts or copy credentials from unrelated services.

Copy `.env.example` to `.env` for local configuration. Use protected configuration outside the public tree in production. `npm run build:production` creates indexable production HTML only after the truth and crawler-policy checks pass. The public document root is exclusively `apps/web/dist`; serve it through the compiled API with the provided proxy configuration.

## Verification

```sh
npm run verify:local
```

This runs strict TypeScript, application tests, the complete build, asset and manual-inventory checks, and HTTP integration checks against the actual compiled pages through Fastify injection. No socket or live mailbox is needed.

On a machine with permitted browser access, install the Playwright browsers and execute the browser suite:

```sh
npx playwright install chromium firefox webkit
npm run test:browser
```

Some Linux hosts additionally need Playwright's documented system libraries. Inspect the host before installing system packages. `npm run verify` includes the browser gate after local verification. `npm run verify:production` performs the corresponding production build and acceptance sequence with protected build configuration already loaded.

**Current results and limits are recorded in `docs/WORKSHOP-CLEANUP-ACCEPTANCE.md` and the machine-readable verification reports.** Earlier v1/v2/v3 reports are historical for changed files; deployment scope remains in `docs/ACCEPTANCE.md`. The cloud browser's URL policy prevented live browser execution; the browser suite is included but is not represented as passed. Mailbox delivery, live account collection, public hosting and field performance require observations on the deployment target.

The original desktop SVG/controller has offline render proof for every performance and a 30-second preview in `docs/desktop-preview/`. This is actual controller output, not a browser recording. The SVG experience is fully active. The five `.riv` files are compiled and verified through the official Canvas runtime; switching the website to its WebGL adapter requires the separate actual-browser promotion gate in `docs/ANIMATION.md`. The project does not falsify that gate.

## Where to work

| Location | Responsibility |
| --- | --- |
| `apps/web/src/` | React interface, scene, form, styles and consented measurement |
| `apps/web/public/` | Public artwork, native animation files and matched Rive runtime |
| `apps/api/src/` | Validation, direct SMTP, HTTP routing, security and static delivery |
| `packages/site/` | Shared public content, exact truth adapter and search output |
| `native/` | Original/repaired animation source, compiled files and scoped evidence |
| `tests/` | Application, browser, measurement and native acceptance tests |
| `private/standards/` | Complete supplied manual bytes, extracted document bodies and index |
| `docs/standards/` | Requirement mapping and implementation review evidence |
| `deploy/` | Reviewed-host deployment templates and release tooling |

Read `docs/ARCHITECTURE.md`, `docs/TRUTH-INTEGRATION.md`, `docs/MEASUREMENT.md` and `docs/ANIMATION.md` for the corresponding implementation contracts. The manual is a build authority, not content for the public website. The catalog's 146 older file references are retained with their unavailable-source status; no claim is made to have read absent originals.

`npm run package` regenerates a complete ZIP and SHA-256 sidecar under `artifacts/`. It includes source and built output, excludes credentials and dependencies, and writes a file-by-file transfer manifest inside the archive. The manifest verifies delivered bytes; changes made after extraction intentionally require a fresh build and package.
