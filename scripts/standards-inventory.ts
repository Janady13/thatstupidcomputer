/** Private standards inventory. Node 24 TypeScript; no runtime packages required.
 * Structural coverage is not proof of product behavior or permission to release.
 * Run from the project root: node scripts/standards-inventory.ts [--check]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, relative } from 'node:path';

type Status = 'PENDING' | 'PASS' | 'FAIL' | 'BLOCKED' | 'NOT_APPLICABLE';
type Requirement = { id: string; owner: string; requirement: string; paths: string[]; checks: string[]; external: string[]; status: Status };
type DocIndex = { number: number; line: number; header: string };
type Decision = { requirements: string[]; disposition: string; reason: string };
const root = resolve(import.meta.dirname, '..');
const sourceRoot = resolve(root, 'private/standards');
const outRoot = resolve(root, 'docs/standards');
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');
const hash = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const file = (p: string) => ({ path: p, exists: existsSync(resolve(root, p)) });
const docPath = (n: number) => `private/standards/document-${String(n).padStart(3, '0')}.txt`;
const docText = (n: number) => read(docPath(n));
const unique = <T>(v: T[]) => [...new Set(v)];
const index = JSON.parse(read('private/standards/document-index.json')) as DocIndex[];
const graphText = read('private/standards/Graph-Expansion.txt');
const manual = read('private/standards/SEO-AIO-Library.txt');
const req = (id: string, owner: string, requirement: string, paths: string[], checks: string[], external: string[] = []): Requirement => ({ id, owner, requirement, paths, checks, external, status: 'PENDING' });

const requirements: Requirement[] = [
  req('SCOPE', 'R24', 'Every supplied document and graph has an explicit application decision, traceable source hash and requirement mapping. Missing original archives remain missing.', ['scripts/standards-inventory.ts', 'docs/standards/coverage-ledger.json', 'docs/standards/README.md'], ['node scripts/standards-inventory.ts --check: all 135 document IDs, 26 roles, 40 graph cards and source hashes; no behavioral PASS inferred']),
  req('ARCH', 'R24', 'React frontend and appropriate TypeScript/Node backend, no Next.js product scaffold, Python execution, PostgreSQL or lead database. One owner per shared artifact; reproducible lockfile.', ['package.json', 'package-lock.json', 'apps/web/vite.config.ts', 'apps/api/src/index.ts'], ['Review installed dependency/runtime/build versions and product imports; clean install, strict typecheck and production build']),
  req('CONTENT', 'R13/R14/R23', 'Distinct buyer tasks, clear service/demo next action, factual claims grounded in user instructions or approved evidence. No fabricated clients, results, prices, credentials, local offices, reviews or bylines.', ['packages/site/content.ts', 'tests/site/content.test.ts'], ['Read every public route and compare claim basis; check distinct page purposes and useful answers; future capability language is not a completed case study']),
  req('HTML', 'R04/R08', 'Useful initial HTML, per-route meaning and crawlable navigation. Essential task remains available when optional scripts or animation fail.', ['apps/web/src', 'apps/web/index.html', 'packages/site/content.ts', 'scripts/build.ts'], ['Inspect complete prerendered HTML and rendered DOM separately; disable JavaScript and optional animation; follow service-to-demo navigation and submit native form']),
  req('A11Y', 'R07/R05', 'Complete keyboard task, names/roles/states, associated validation errors, focus management, reduced motion, reflow/zoom and sufficient contrast within defined WCAG 2.2 AA assessment scope.', ['apps/web/src/components/DemoForm.tsx', 'apps/web/src/components/Workshop.tsx', 'apps/web/src/animation'], ['Automated detectable checks plus manual keyboard/dialog/error recovery and 320px/reflow tests; label browser engines/emulation correctly'], ['Actual Safari/iPhone/Android and screen-reader/browser combinations require separately recorded runs; no automated-only conformance claim']),
  req('MAIL_API', 'R03', 'Server validates inputs and handles duplicate attempts, rejection and timeout accurately. Direct mail only; provider acceptance is the last observable success state here. No silently retained lead bodies or fictional durable queue.', ['apps/api/src/app.ts', 'apps/api/src/validation.ts', 'apps/api/src/mail.ts', 'apps/api/src/responses.ts', 'apps/web/src/components/DemoForm.tsx', 'tests/api'], ['Synthetic accepted/rejected/invalid/duplicate/timeout cases; response semantics match transport outcome; no success on failure; duplicate handling scope documented']),
  req('MAIL_RECEIPT', 'R17', 'Verify the configured sender/recipient and legitimate sender streams, then trace one controlled inquiry through provider acceptance to actual mailbox observation. Authentication is a separate check.', ['apps/api/src/config.ts', 'apps/api/src/mail.ts', 'docs'], ['Inspect From/Reply-To/envelope semantics; preserve privacy-safe correlation and distinguish mocked transport from live receipt'], ['Protected SMTP configuration, authorized synthetic send, received headers and destination-folder observation; DNS/authentication review on the actual host']),
  req('PRIVACY', 'R20/R16', 'Protected credentials, no inquiry content/PII in logs or analytics, consent-aware collection, private source/build records excluded from public outputs. Consent labels and robots are not access enforcement.', ['apps/api/src/config.ts', 'apps/api/src/app.ts', 'apps/api/src/static.ts', 'apps/web/src/measurement/analytics.mjs', 'apps/web/src/measurement/ConsentControls.tsx'], ['Test denied/withdrawn consent, hostile query/campaign input, logging redaction, public-path traversal/encoded paths, private-source/secret absence from public artifact and source maps']),
  req('SECURITY', 'R20/R22', 'Authoritative validation, bounded body size/rate/timeout, same-origin/form restrictions and tested enforced security headers. Do not weaken private access for crawlers.', ['apps/api/src/app.ts', 'apps/api/src/config.ts', 'apps/api/src/static.ts', 'tests/api'], ['Malformed input, forged origins, spoofed forwarded IP, header injection, honeypot/abuse, body limits and CSP functional regressions; sensitive traces never echoed']),
  req('EVENTS', 'R16/R15', 'Versioned event and metric contracts with unit/scope/window/source, deduplication and data-quality boundaries. Request acceptance, qualified inquiry and revenue are distinct; failed submissions never count as success.', ['apps/web/src/measurement', 'tests/measurement', 'docs/MEASUREMENT.md', 'apps/web/src/components/DemoForm.tsx'], ['Synthetic consented flow maps one provider_accepted response to one allowed business event; blocked tags and denied consent never break forms; all permitted payload fields reviewed']),
  req('SEARCH_REPORTS', 'R12/R16', 'Google/Bing/AI observations and referral/outcome layers stay separate. Missing report fields/data remain null, not zero. Source/model/date/locale/cohort/denominators retained; no fabricated hidden prompts or causal metrics.', ['apps/web/src/measurement', 'docs/MEASUREMENT.md', 'docs/standards/observations.json'], ['Review event definitions and reporting guide; verify account-dependent facts against official sources at deployment'], ['Actual GA4 collection/debug/property settings, Search Console/Bing availability, consented traffic and report exports; later qualified outcomes cannot be fabricated']),
  req('URLS', 'R08/R09', 'Explicit public/indexable, utility, missing and redirect contracts; route-specific canonical/metadata; sitemap contains only canonical public URLs; correct missing-route status and meaningful internal links.', ['packages/site/search.ts', 'scripts/generate-search.ts', 'apps/api/src/static.ts', 'tests/site/search.test.ts'], ['Test complete route inventory, unknown and parameterized requests, canonical closure, duplicate head tags, correct 404, internal links and sitemap consistency']),
  req('TRUTH', 'R11/R14', 'Consume exact pinned public projection of the existing unified organizational/person graph. Do not create competing identity declarations, invent profile matches, or use sameAs for affiliation; validate facts and references separately.', ['packages/site/truth.ts', 'packages/site/search.ts', 'scripts/import-truth.ts', 'tests/site/truth.test.ts', 'docs/TRUTH-INTEGRATION.md'], ['Negative tests for private fields, bad digest/commit, identity type mismatch, fictional placeholders, conflicting IDs and script breakout; production gate fails until canonical source supplied'], ['Actual canonical truth repository/export and public ID/field contract are absent; projected identity verification and production activation remain blocked']),
  req('SCHEMA', 'R11/R08', 'JSON-LD derives from approved visible facts, uses safe serialization and stable entity/document distinctions. Syntax, reference closure, vocabulary, factual support and feature eligibility are separate gates.', ['packages/site/search.ts', 'packages/site/truth.ts', 'tests/site/search.test.ts'], ['Safe script embedding, exact canonical references, no unverified Organization/Person declarations, visible-schema agreement; no fake ratings or retired-feature benefit claims'], ['Current live feature validator if a particular rich-result feature is claimed; engine display is not guaranteed']),
  req('CRAWL_POLICY', 'R08/R12/R20', 'Search, training and user-requested retrieval have distinct documented roles. Policy choices are explicit and host-specific; no generic AI allowlist or training opt-in inferred from SEO intent.', ['scripts/generate-search.ts', 'packages/site/search.ts', 'docs'], ['Inspect generated production/staging robots and noindex behavior; private file exclusion enforced independently; spoofed user-agent run not called authenticated bot'], ['Reconfirm owner discovery/training policy and actual public edge; crawler identity/engine indexing require observed records']),
  req('ANIMATION', 'R04/R06', 'Full-viewport interactive office, responsive compositions and genuine native Rive assets using the supplied source. Keyboard/touch, reduced-motion/pause and permanent usable fallback survive runtime failure.', ['apps/web/src/animation', 'apps/web/src/components/Workshop.tsx', 'apps/web/public/animation', 'scripts/compile-native.mjs', 'tests/animation', 'docs/ANIMATION.md'], ['Inspect SVG source/assets, actual .riv binaries, native timelines and action transitions; build and browser controls; exercise missing asset/runtime and reduced-motion paths']),
  req('PERFORMANCE', 'R06', 'Measure actual complete HTML and asset budgets, expensive animation/scripts and critical interaction costs. Lab/field distinction explicit; preserve task, content, privacy and accessibility.', ['apps/web/src/animation', 'apps/web/vite.config.ts', 'apps/api/src/static.ts', 'docs'], ['Record largest HTML/JS/media bytes and representative controlled lab context; lazy optional runtime; verify no private API caching'], ['Post-launch consented/available field data with p75 LCP/INP/CLS, device cohort and window; no invented field pass']),
  req('MEDIA', 'R13/R20', 'Supplied and created media have source, version, appropriate description and rights basis; resolve actual assets and preview metadata without inventing depicted client work.', ['apps/web/public/animation/manifest.json', 'packages/site/search.ts', 'docs'], ['Inventory referenced SVG/Rive/media and provenance; resolve public URLs; decorative art has appropriate accessibility treatment; inspect social-preview intent'], ['Consumer-rendered sharing preview observations after public deployment if claimed']),
  req('RELEASE', 'R25/R01/R02', 'Portable handoff has exact build/runtime, protected configuration, staged public-host/redirect cutover, backup and usable rollback. Do not replace unrelated host services from assumed paths.', ['docs/CLAUDE-DEPLOYMENT.md', 'docs/ARCHITECTURE.md', 'docs/ACCEPTANCE.md', 'deploy/release.mjs', 'deploy/release.test.mjs', 'deploy/local-validation.json', 'apps/api/src/index.ts'], ['Local startup/health/route/form checks; review transfer commands and placeholder handling; preserve original configuration before deployment'], ['BUBBLES runtime/DNS/TLS/IPv4/IPv6/outside-in reachability, controlled-mail receipt, actual rollback rehearsal and post-cutover checks']),
  req('EVIDENCE', 'R21/R26', 'Acceptance records tie executed tests to the exact build/environment with fresh runs, artifact hashes and actual review relationship. Missing mandatory evidence remains blocked.', ['tests', 'scripts/check-build.ts', 'docs/ACCEPTANCE.md', 'docs/standards/observations.json', 'docs/standards/build-integration.json', 'docs/standards/coverage-ledger.json'], ['Independently inspect current product files and run bounded tests; record actual commands/time/outcomes and limitations; source/metadata checks do not grant release']),
  req('MAINTENANCE', 'R24/R14', 'Keep current/superseded/conditional guidance and source lineage distinct; source changes identify affected implementation/tests. Preserve historical boundaries and do not install a scheduler or retrieval stack by implication.', ['scripts/standards-inventory.ts', 'docs/standards/coverage-ledger.json', 'docs/standards/decisions.json'], ['Verify source-to-requirement-to-artifact closure and --check drift detection; re-review fast-changing official guidance before platform-dependent release decisions'])
];
// Additive animation-upgrade coverage. The original observation file remains a
// historical build record; only freshly executed upgrade checks can pass here.
const upgradeCoverage: Record<string, { paths: string[]; checks: string[] }> = {
  HTML: { paths: ['apps/web/src/components/CharacterPlayground.tsx'], checks: ['The /work/ page exposes the real finite character playground while initial HTML retains its service/demo task and useful no-script text.'] },
  A11Y: { paths: ['apps/web/src/components/CharacterPlayground.tsx', 'apps/web/src/animation/stage/CharacterStage.tsx'], checks: ['Verify keyboard alternatives to dragging, explicit playback and gesture controls, persistent pause/reduced motion, offscreen timer suspension, and resize/zoom bounds; pure math tests do not certify rendered access.'] },
  ANIMATION: { paths: ['apps/web/src/animation/performances/catalog.mjs', 'apps/web/src/animation/stage/engine.mjs', 'apps/web/src/animation/stage/CharacterStage.tsx', 'apps/web/src/animation/rive/playback-gate.mjs', 'tests/animation/upgrade-acceptance.test.mjs', 'tests/animation/native-playback-gate.test.mjs'], checks: ['All five original rigs retain geometry and original fourteen clips; each has thirty-two actual timelines with full pose resets. Verify finite travel/landing, current-clip callbacks, replay/offscreen gates, resizing and explicit rude-gesture opt-in. Bind all 160 native actions to new compiled bytes and distinguish Canvas evidence from browser WebGL promotion.'] },
  RELEASE: { paths: ['scripts/apply-animation-upgrade.mjs', 'tests/animation/upgrade-installer.test.mjs', 'docs/UPGRADE-ACCEPTANCE.md'], checks: ['Read-only installer preflight validates every source and target hash and rejects symlinks/traversal; detected concurrent target edits conflict rather than being overwritten. Explicit apply has exclusive backups, restoration journal, rollback and idempotency; no backend/environment/deployment files copied.'] },
  EVIDENCE: { paths: ['docs/UPGRADE-ACCEPTANCE.md', 'docs/standards/upgrade-observations.json'], checks: ['Treat prior 14-action/96-test reports as historical. New 32-action, stage, native and build passes require their own fresh command results and hashes. Original delivery remains immutable.'] },
};
for (const requirement of requirements) {
  const addition = upgradeCoverage[requirement.id];
  if (addition) { requirement.paths.push(...addition.paths); requirement.checks.push(...addition.checks); }
}
const desktopCoverage: Record<string, { paths: string[]; checks: string[] }> = {
  CONTENT: { paths: ['apps/web/src/animation/conversation/director.mjs', 'apps/web/src/components/ComputerConversation.tsx'], checks: ['Conversation answers real buyer tasks and leads to the existing demo request. Fixed fictional-computer quips are not customer outcomes or a claimed AI diagnosis; no conversion improvement is inferred from interaction tests.'] },
  HTML: { paths: ['apps/web/src/components/ComputerConversation.tsx', 'apps/web/src/components/DemoCompanion.tsx', 'apps/web/src/components/demo-intent.mjs'], checks: ['Native disclosure and real contact links remain useful without JavaScript; finite project context applies only after hydration and never overwrites any visitor-edited field.'] },
  A11Y: { paths: ['apps/web/src/components/ComputerConversation.tsx', 'apps/web/src/components/DemoCompanion.tsx'], checks: ['Review disclosure names, keyboard and Escape/focus return, reduced-motion still poses, global pause and inline form errors. Browser layout, touch and screen-reader observations remain explicitly separate.'] },
  ANIMATION: { paths: ['apps/web/src/animation/desktop/performances.mjs', 'apps/web/src/animation/desktop/gesture-geometry.mjs', 'apps/web/src/animation/desktop/computer-motion.mjs', 'tests/animation/desktop-rendering.test.mjs', 'docs/DESKTOP-VISUAL-PROOF.md'], checks: ['Verify 32 original-CRT performances, all original body/lettering/cable geometry, connected additive hands, permanent censorship, strict permission/revocation at runtime and UI, finite completion/replay, full pose resets and safe callback reentrancy. Offline SVG raster proof is not browser or Rive certification.'] },
  EVENTS: { paths: ['tests/measurement/computer-funnel.test.mjs', 'docs/DESKTOP-MEASUREMENT.md'], checks: ['Finite computer interaction stages and project choices pass through existing consent rules without raw text/URL/PII. One deliberate invocation maps to one event; computer demo start and SMTP accepted lead remain distinct.'] },
  RELEASE: { paths: ['scripts/make-desktop-upgrade-manifest.mjs', 'docs/DESKTOP-INTEGRATION.md'], checks: ['Manifest records both authentic v1/v2 before hashes and includes inherited mobile-v2 dependencies. Rehearse guarded apply on disposable copies of both baselines, preserve arbitrary edits, and exclude API/mail/canonical truth/settings/deployment/built output.'] },
  EVIDENCE: { paths: ['docs/DESKTOP-ACCEPTANCE.md', 'docs/DESKTOP-WORK-LEDGER.md', 'docs/desktop-preview/desktop-proof.json'], checks: ['Bind v3 results to current source and artifact hashes; inherited v1/v2 proof passes are historical for modified files. Preserve actual environment and browser-policy limitations.'] },
};
for (const requirement of requirements) {
  const addition = desktopCoverage[requirement.id];
  if (addition) { requirement.paths.push(...addition.paths); requirement.checks.push(...addition.checks); }
}
const workshopCoverage: Record<string, { paths: string[]; checks: string[] }> = {
  HTML: { paths: ['apps/web/src/components/Workshop.tsx', 'apps/web/src/components/ComputerConversation.tsx'], checks: ['Remove duplicate floating room navigation and hover tips. Header navigation, native inline disclosure, demo links and existing service explanations remain usable in initial HTML.'] },
  A11Y: { paths: ['apps/web/src/styles/computer-conversation.css', 'tests/browser/desktop-conversation.spec.ts'], checks: ['Expanded conversation follows the room and uses page scrolling; preview reserves its own space. Closed mobile navigation restores focus to its summary. Browser layout and actual keyboard behavior remain target-side observations.'] },
  RELEASE: { paths: ['scripts/apply-room-tab-cleanup.mjs', 'tests/animation/room-tab-cleanup-installer.test.mjs', 'docs/WORKSHOP-CLEANUP-INTEGRATION.md'], checks: ['For unknown operator edits, remove only an unambiguous parsed room-navigation JSX subtree, preserving all surrounding bytes. Dry run first; exact hash rechecks, backups and repeat no-op. Do not apply historical whole-file manifests to modified live source.'] },
  EVIDENCE: { paths: ['docs/WORKSHOP-CLEANUP-ACCEPTANCE.md'], checks: ['Fresh v4 results cover changed layout/source and current build. Prior native/desktop proof remains usable only for exact unchanged inputs; screenshots from the user are context, not a new browser pass.'] },
};
for (const requirement of requirements) { const addition = workshopCoverage[requirement.id]; if (addition) { requirement.paths.push(...addition.paths); requirement.checks.push(...addition.checks); } }
const byReq = new Map(requirements.map(r => [r.id, r]));
const decisions = new Map<number, Decision>();
function mapDocs(numbers: number[], ids: string[], reason: string, disposition = 'APPLY') {
  for (const number of numbers) {
    if (decisions.has(number)) throw new Error(`Duplicate document decision ${number}`);
    decisions.set(number, { requirements: ids, disposition, reason });
  }
}
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
mapDocs([1,3,4,5,8,9,10,37,38,39,46,83,118,124,131,132,133], ['SCOPE','ARCH','EVIDENCE','MAINTENANCE'], 'Governs how the authorized React project is built and handed off. Local build is authorized; the library cannot require redundant approval or supply missing host facts. Field-specific controls flow to the requirements below.');
mapDocs([2,119,120,121,123], ['SCOPE','MAINTENANCE','EVIDENCE'], 'Preserve release history and its limits. Historical utility/browser checks describe the source library, not this website, and never supply a product PASS.', 'HISTORICAL_RECORD');
mapDocs([6,31,36,70,82], ['EVIDENCE','URLS','MAIL_API','RELEASE'], 'Freeze and test actual requirements; fresh separate AI review is not external human independence. Local acceptance and external release evidence remain separate.');
mapDocs([7,23,24,33,52,72,80,116,117], ['CONTENT','TRUTH','SCHEMA','PRIVACY'], 'Apply substantiation, useful public content and safe publication boundaries. Proposed 26-role articles and publication-host options are not instructions to mass-publish or mint canonical identity IDs.');
mapDocs([11,12,75], ['RELEASE','SECURITY','CRAWL_POLICY'], 'Local delivery/configuration can be built now; actual BUBBLES processes, public DNS/TLS and restore readiness require target-host evidence. Lack of access is blocked, not inapplicable.');
mapDocs([13], ['MAIL_API','SECURITY','MAIL_RECEIPT','EVENTS'], 'Apply authoritative request and provider-state controls. User direct-email/no-database instruction overrides optional persistence/queue examples.');
mapDocs([14,15,17,78], ['HTML','A11Y','ANIMATION','MAIL_API'], 'Apply complete critical journey, semantic controls, progressive behavior, real-versus-emulated browser labeling and explicit untested screen-reader/device rows.');
mapDocs([16,49,54,79], ['PERFORMANCE','HTML','A11Y','PRIVACY'], 'Measure complete route/asset/interaction costs and preserve usability. No literal threshold or lab score may be called observed field compliance.');
mapDocs([18,19,53,58,74], ['URLS','HTML','CONTENT'], 'Apply page-purpose/internal-link/route/metadata contract, including tracking parameter and invalid-route behavior. Commerce facets are not created for a service funnel.');
mapDocs([20], ['CONTENT','SEARCH_REPORTS'], 'Map actual buyer questions to useful pages with demand labeled as hypothesis until observed. An owned retrieval/search engine is outside the requested service site.');
mapDocs([21], ['TRUTH','SCHEMA','CONTENT'], 'Use existing canonical graph exact public identifiers and preserve source-backed identity claims. Public identity is blocked until actual projection is supplied.');
mapDocs([22,41,43,44,69,77], ['CRAWL_POLICY','SEARCH_REPORTS','CONTENT','SCHEMA'], 'Apply engine-specific access, useful answer content and honest observation contracts. Do not build llms.txt, public graph API or hidden prompt bait as an assumed ranking requirement.');
mapDocs([25], ['MAIL_API','CONTENT','EVENTS','A11Y'], 'Build clear offer and low-friction demo journey. No uplift/qualification claim without observed definition and data; no unsolicited experiment infrastructure.');
mapDocs([26,42,45,55,56,57], ['EVENTS','SEARCH_REPORTS','PRIVACY'], 'Implement consent-aware event semantics and reporting handoff. Platform fields and account access need actual verification; no invented imports, denominators or private CRM.');
mapDocs([27,76], ['MAIL_API','MAIL_RECEIPT','SECURITY','EVENTS'], 'Direct mail preserves only actual observed provider/receipt states. Recipient receipt and domain authentication require live controlled evidence.');
mapDocs([28,59], ['CONTENT','TRUTH','SCHEMA'], 'Eligibility and location truth govern omission of unverified addresses/branches. No local/location pages or GBP claims are in the requested scope; activate on verified business facts.', 'CONDITIONAL');
mapDocs([29], ['CONTENT','TRUTH','MEDIA'], 'No external outreach/profile edits requested. Preserve owned/paid/earned distinction and do not manufacture corroboration. Publication/outreach workflows activate only with actual assets and authorization.', 'CONDITIONAL');
mapDocs([30,32,40], ['SECURITY','PRIVACY','EVIDENCE'], 'Apply minimal access, negative-input tests and actual enforcement. Installing a public MCP server is not part of the requested website.');
mapDocs([34], ['ARCH','SCOPE','MAINTENANCE','RELEASE'], 'One coordinated architecture and artifact writer; resolve cross-feature security/content/form interfaces before packaging.');
mapDocs([35,61,81], ['RELEASE','URLS','TRUTH','EVENTS'], 'Production replaces the explicitly identified redirect only after host inventory, backed-up configuration and actual staged acceptance; package portable instructions locally.');
mapDocs([47], ['CONTENT','SCHEMA'], 'No product catalog, cart, payment, inventory or merchant feed is requested. Omit Product/Offer/price/review examples; service information consistency remains required.', 'NOT_APPLICABLE');
mapDocs([48], ['HTML','URLS','SCHEMA','ANIMATION'], 'Apply reliable meaningful initial content plus sophisticated accessible interaction. This is not an anti-React or anti-dialog rule.');
mapDocs([50,51], ['CRAWL_POLICY','SECURITY','PRIVACY','RELEASE'], 'Separate bot role/access policy from real identity, indexing and business outcomes; never log raw visitor queries or weaken protected paths.');
mapDocs([60,122], ['SCOPE','MAINTENANCE'], 'Navigation/catalog records expose inherited coverage boundaries. Referenced legacy originals are not included; retain all references with source availability, supersession and conditional applicability.');
mapDocs([62,63], ['HTML','URLS','SCHEMA','ARCH'], 'Next.js APIs/streaming configuration are inapplicable because user requires React without Next.js. Apply transferable raw/rendered HTML, safe JSON-LD and canonical consistency tests through this React build.', 'PARTIAL');
mapDocs([64], ['CONTENT','PERFORMANCE'], 'No news/publication preference feature is requested or eligibility verified. Do not install a Preferred Sources button merely to satisfy an optional publisher module.', 'NOT_APPLICABLE');
mapDocs([65], ['CONTENT','URLS','SEARCH_REPORTS'], 'Current English service website has no translated equivalent route set or region-restricted product features. Omit hreflang/forced geolocation; keep regional feature availability unclaimed.', 'CONDITIONAL');
mapDocs([66,125,126,127,128], ['MAINTENANCE','SCOPE','CONTENT','EVIDENCE'], 'Preserve source dates, finding dispositions and unknown originals; current platform-specific rules require primary-source recheck. Unsupported legacy multipliers remain excluded.');
mapDocs([67,68,130], ['SCHEMA','TRUTH','CONTENT'], 'Separate JSON/vocabulary/evidence/feature checks; synthetic graph examples stay private and never provide default business facts.');
mapDocs([71], ['SEARCH_REPORTS','MEDIA','TRUTH'], 'No social/video account is connected and no video publishing feature is requested. Provide applicable preview/media truth; account-specific property work awaits actual scope/access.', 'CONDITIONAL');
mapDocs([73], ['CONTENT','TRUTH','CRAWL_POLICY'], 'Use real useful service content, truthful visible identity and deliberate consumer access. No doorway pages, fake testimonials, hidden instructions, numerical publishing quotas or assumed policy safe harbors.');
mapDocs([129], ['SCOPE','CONTENT','MAINTENANCE'], 'Tier names are commercial packaging, not a mandate to add every industry/platform capability. No prices or tier promises are invented; commercial Tier 13 remains retired.');
mapDocs(range(84,109), ['CONTENT','TRUTH','PRIVACY','EVIDENCE'], 'Unapproved publication brief informs reader-task and proof review only. Do not publish the template, suggested route/byline, candidate keyword or expertise claim as completed client work.', 'REVIEW_ONLY');
mapDocs(range(110,115), ['CONTENT','MAIL_API','SEARCH_REPORTS','EVIDENCE','PRIVACY'], 'Unapproved methodology draft can teach distinctions but is not owner-reviewed public copy, client result or current project evidence; use original site-specific explanation.', 'REVIEW_ONLY');
mapDocs([134,135], ['SCOPE','EVIDENCE','ARCH','MAINTENANCE'], 'Python utility execution is superseded by explicit user prohibition. Implement needed structural inventory in TypeScript; do not claim original utility tests validate this project.', 'PARTIAL');

const graphMappings: [string[], string, string][] = [
  [['TRUTH','CONTENT'], 'APPLY', 'Canonical Person/profile identity comes only from the existing public projection; no newly minted competing identity.'],
  [['TRUTH','SCHEMA'], 'APPLY', 'Preserve Organization/Brand/WebSite/Service meaning and public exact IDs from canonical source.'],
  [['TRUTH','CONTENT'], 'APPLY', 'Cross-domain operating relationships consume canonical facts; common ownership never implies sameAs or independent endorsement.'],
  [['TRUTH','EVIDENCE'], 'APPLY', 'Validate exact identifier types and reject conflicting/private/candidate imports; do not run fuzzy merging against absent source.'],
  [['CONTENT','TRUTH'], 'CONDITIONAL', 'No local branch/address/service-area claims requested or verified. Do not invent locations; activate only after eligible canonical facts and public rights exist.'],
  [['CONTENT','SCHEMA'], 'NOT_APPLICABLE', 'Service demo funnel has no purchasable catalog, stock, cart, merchant feed or price contract.'],
  [['CONTENT','TRUTH'], 'APPLY', 'No invented authored article/byline; only actual approved contribution may be represented.'],
  [['CONTENT','URLS'], 'APPLY', 'Service/site route taxonomy supports distinct reader decisions; no page per keyword or 26 role labels.'],
  [['SCOPE','MAINTENANCE'], 'APPLY', 'Private document hashes, section locators and source-to-requirement paths preserve exact evidence context.'],
  [['CONTENT','TRUTH','EVIDENCE'], 'APPLY', 'Material public claims have provenance; derived summaries are not independent evidence.'],
  [['CONTENT','EVIDENCE'], 'APPLY', 'Evidence-backed work/method claims; no E-E-A-T score, manufactured credentials or invented client wins.'],
  [['CONTENT','TRUTH'], 'CONDITIONAL', 'No genuine review/testimonial dataset supplied; omit ratings and fabricated corroboration, retain future provenance/rights requirement.'],
  [['URLS','HTML'], 'APPLY', 'Every important route has crawlable working links; page-purpose/entry-to-demo journey governs topology.'],
  [['CONTENT','URLS','SEARCH_REPORTS'], 'CONDITIONAL', 'Existing outward links checked where present; backlink acquisition/complete external link crawl is not requested or available.'],
  [['SCOPE','MAINTENANCE'], 'REVIEW_ONLY', 'Source bibliography is retained for dependency review; no citation/co-citation analytical product or authority metric requested.'],
  [['URLS','SCHEMA'], 'APPLY', 'Publisher-declared route canonicals are tested; engine-selected canonical remains unavailable until actual inspection.'],
  [['RELEASE','URLS'], 'APPLY', 'Explicit redirect replacement needs old/current host inventory and reversible deployment map; local routes can be fully tested now.'],
  [['URLS'], 'NOT_APPLICABLE', 'Only English routes are present; no translated equivalent documents exist to justify hreflang.'],
  [['HTML','ANIMATION','PERFORMANCE'], 'APPLY', 'Observe actual HTML/resources, optional runtime failures and browser task; user-agent spoof is only a response-variant check.'],
  [['TRUTH','SCHEMA','CONTENT'], 'APPLY', 'One approved projection feeds visible facts/JSON-LD; safe serialization and exact ID closure are distinct from factual verification.'],
  [['CONTENT','EVENTS'], 'APPLY', 'Buyer question-to-page map uses transparent editorial hypotheses; no fabricated demand volumes.'],
  [['SEARCH_REPORTS'], 'CONDITIONAL', 'Dated observation schema and limits supplied; live SERP/competitor dataset unavailable and no scrape or invented ranks performed.'],
  [['CONTENT','SEARCH_REPORTS'], 'APPLY', 'Related customer questions guide useful sections; no hidden provider query-fan-out or cloned question pages claimed.'],
  [['TRUTH','MAINTENANCE'], 'REVIEW_ONLY', 'No co-occurrence analytics requested; mention/identity/support distinctions govern imports and source review.'],
  [['SEARCH_REPORTS'], 'CONDITIONAL', 'Observation/report contract applies; actual answer/citation data and platform exports remain external blocked.'],
  [['MAIL_API','EVENTS','PRIVACY'], 'APPLY', 'Direct-email user override means provider-accepted state, not fictitious durable inquiry storage; qualification and attribution remain separate.'],
  [['SCOPE','PRIVACY'], 'NOT_APPLICABLE', 'No owned-corpus answering feature requested; implementing GraphRAG would add unrelated infrastructure and private-data flow.'],
  [['SCOPE','TRUTH'], 'NOT_APPLICABLE', 'No vector search feature or embedding corpus requested; HNSW similarity is not a factual identity or SEO requirement.'],
  [['MAINTENANCE','SCOPE'], 'APPLY', 'Document hashes/review dates and explicit supersession records distinguish historical from current-use guidance.'],
  [['MAINTENANCE','TRUTH'], 'APPLY', 'User corrections and source conflicts remain recorded; unknown canonical source blocks identity promotion.'],
  [['MAINTENANCE','SCOPE'], 'APPLY', 'Every document/card maps to requirements and current artifact locations; hash changes trigger targeted review.'],
  [['ARCH','SCOPE','RELEASE'], 'APPLY', 'Bounded role/file ownership and actual access distinguish local build from external transfer obligations.'],
  [['EVIDENCE','SCOPE'], 'APPLY', 'Requirements/tests/evidence tied to exact current product; no PASS from enumeration or source-library historical tests.'],
  [['PRIVACY','SECURITY','MEDIA'], 'APPLY', 'Consent, resource protection and actual public-export boundaries enforced; private source/derived records never shipped as public content.'],
  [['MEDIA','ANIMATION'], 'APPLY', 'SVG/Rive assets supplied or authored for this site have version/provenance/rights inventory and actual public reference checks; no transcript feature invented.'],
  [['SCHEMA','MEDIA','URLS'], 'APPLY', 'Per-route Open Graph/social-preview intent with actual image URL; platform-rendered preview is later observed separately.'],
  [['TRUTH','CONTENT'], 'CONDITIONAL', 'Verified profiles may flow from canonical export; no social connections scraped or invented; private contacts excluded.'],
  [['MAINTENANCE'], 'NOT_APPLICABLE', 'Website is a service acquisition funnel, not a scholarly discovery/publication database; source research uses citations without a scholarly product graph.'],
  [['CONTENT','SCHEMA'], 'NOT_APPLICABLE', 'No event listings, tickets, occurrences or venue publishing requested; demo request is not an Event listing.'],
  [['SCOPE','MAINTENANCE'], 'REVIEW_ONLY', 'Private handoff teaches prerequisites identity→evidence→markup→observation; no public course, learner records or credential badge requested.']
];

const graphMatches = [...graphText.matchAll(/^# (G\d{2}) — (.+)$/gm)];
const graphs = graphMatches.map((m, i) => {
  const end = graphMatches[i + 1]?.index ?? graphText.indexOf('PRIMARY SOURCE REGISTER', m.index);
  const card = graphText.slice(m.index, end);
  const mapping = graphMappings[i];
  const checks = card.match(/## Acceptance checks\n([\s\S]*?)\n## Do not infer/)?.[1].trim().split('\n').map(s => s.replace(/^- /, '')) ?? [];
  return { id: m[1], title: m[2], source: 'private/standards/Graph-Expansion.txt', sourceLine: graphText.slice(0, m.index).split('\n').length, sha256: hash(card), nature: card.match(/^Nature: (.+)$/m)?.[1], priority: card.match(/^Priority: (.+)$/m)?.[1], roles: card.match(/^Accountability: (.+)$/m)?.[1].split(', '), disposition: mapping[1], reason: mapping[2], requirements: mapping[0], acceptanceCriteria: checks, implementation: unique(mapping[0].flatMap(id => byReq.get(id)!.paths)).map(file), status: mapping[1] === 'NOT_APPLICABLE' ? 'NOT_APPLICABLE' : 'PENDING' };
});

const documents = index.map(d => {
  const text = docText(d.number);
  const decision = decisions.get(d.number);
  if (!decision) throw new Error(`No application decision for document ${d.number}`);
  for (const id of decision.requirements) if (!byReq.has(id)) throw new Error(`Unknown requirement ${id}`);
  const originPath = d.header.match(/^Path: (.+)$/m)?.[1];
  const label = d.header.match(/^Label: (.+)$/m)?.[1];
  const roles = d.number >= 11 && d.number <= 36 ? [`R${String(d.number - 10).padStart(2, '0')}`] : unique(decision.requirements.flatMap(id => byReq.get(id)!.owner.split('/')));
  return { id: `D${String(d.number).padStart(3,'0')}`, number: d.number, title: d.header.match(/^Title: (.+)$/m)?.[1], originPath, source: docPath(d.number), sourceLine: d.line, bytes: Buffer.byteLength(text), sha256: hash(text), sourceLabel: label, sourceReviewStatus: d.header.match(/^Review status: (.+)$/m)?.[1], ...decision, roles, graphIds: graphs.filter(g => g.requirements.some(id => decision.requirements.includes(id))).map(g => g.id), implementation: unique(decision.requirements.flatMap(id => byReq.get(id)!.paths)).map(file), verification: unique(decision.requirements.flatMap(id => byReq.get(id)!.checks)), status: decision.disposition === 'NOT_APPLICABLE' ? 'NOT_APPLICABLE' : 'PENDING' };
});

const roleReqs: string[][] = [
 ['RELEASE'], ['RELEASE','CRAWL_POLICY'], ['MAIL_API','SECURITY'], ['HTML','ANIMATION'], ['A11Y'], ['PERFORMANCE'], ['A11Y'], ['URLS','CRAWL_POLICY'], ['CONTENT','URLS'], ['CONTENT','SEARCH_REPORTS'], ['TRUTH','SCHEMA'], ['CRAWL_POLICY','SEARCH_REPORTS'], ['CONTENT'], ['CONTENT','TRUTH','EVIDENCE'], ['EVENTS','MAIL_API','CONTENT'], ['EVENTS','SEARCH_REPORTS','PRIVACY'], ['MAIL_RECEIPT'], ['CONTENT','TRUTH'], ['CONTENT','TRUTH'], ['PRIVACY','SECURITY'], ['EVIDENCE'], ['SECURITY','EVIDENCE'], ['CONTENT'], ['ARCH','SCOPE'], ['RELEASE'], ['EVIDENCE']
];
const roles = range(11,36).map(n => {
  const source = docText(n), doc = documents[n-1];
  const id = `R${String(n-10).padStart(2,'0')}`;
  const related = roleReqs[n-11];
  const conditional = [28,29].includes(n);
  const external = [11,12,27,35].includes(n);
  return { id, title: doc.title, document: doc.id, applicability: conditional ? 'REVIEW_ONLY' : external ? 'ACTIVE_WITH_EXTERNAL_BLOCKS' : 'ACTIVE', reason: conditional ? 'Real-world local/profile/outreach facts are not supplied and new profile/outreach work is not requested; truth/claim checks remain active.' : external ? 'Build portable local interfaces/docs; target-host or mail observations await actual access and controlled deployment.' : 'Directly relevant to the complete website, its user journey, source governance or scoped verification.', requirements: related, acceptanceCriteria: source.match(/## Acceptance conditions\n([\s\S]*?)\n## Failure modes/)?.[1].trim().split('\n').filter(Boolean).map(s=>s.replace(/^- /,'')) ?? [], implementation: unique(related.flatMap(r => byReq.get(r)!.paths)).map(file), checksBlocked: unique(related.flatMap(r => byReq.get(r)!.external)), status: 'PENDING' };
});

const legacyRows = docText(122).split('\n').filter(l => /^\| `/.test(l));
const replacementByName: Record<string,string[]> = {
 'framework-aicitations.md':['D043'], 'framework-aioverviews.md':['D044'], 'framework-contentfirst.md':['D048'], 'framework-ga4.md':['D055'], 'framework-gscanalysis.md':['D057'], 'framework-nextjs.md':['D063'], 'framework-schema-types-2026.md':['D068'], 'framework-searchgpt.md':['D069'], 'framework-spampolicies.md':['D073'], 'framework-masterindex.md':['D060'], 'framework-react.md':['D048','D062'], 'framework-technicalseo.md':['D018','D074'], 'LOCATION-PAGE-FRAMEWORK.md':['D059'], 'tier-one.md':['D038','D058','D070'], 'tier-three.md':['D043','D044','D051']
};
const legacy = legacyRows.map(row => {
 const cells = row.split('|').slice(1,-1).map(s=>s.trim());
 const name = cells[0].replaceAll('`','');
 const active = cells[2].match(/\((.+)\)/)?.[1] ?? null;
 const archive = cells[3].match(/\((.+)\)/)?.[1] ?? null;
 const stack = /framework-(11ty|astro|astrohugo|bigcommerce|drupal|hugo|hydrogen|jekyll|magento|nextjs|nuxt|remix|shopify|sveltekit|webflow|wordpress|headless|saas-website-builders)\.md/.test(name);
 const conditional = /commerce|international|hreflang|newsseo|finance|healthcare|legal-seo|realestate|aso\.md|publisher|video|voice|tier-eleven|tier-twelve|tier-seven|tier-six/.test(name);
 const retired = name === 'tier-thirteen.md';
 return { name, reportedTreatment: cells[1], referencedActivePath: active, referencedOriginalPath: archive, sourceBodyAvailable: false, replacementDocuments: replacementByName[name] ?? [], disposition: retired ? 'RETIRED' : stack ? 'STACK_NOT_APPLICABLE' : conditional ? 'CONDITIONAL_LEGACY' : replacementByName[name] ? 'USE_CURRENT_REPLACEMENT' : 'UNAVAILABLE_LEGACY', reason: retired ? 'Commercial Tier 13 remains retired; role R13 is separate.' : stack ? 'This React/Node site does not use the named framework adapter; any transferable principle requires current route-specific verification.' : conditional ? 'Activate only if the corresponding industry/page/product/account feature actually enters scope; unavailable prose is not silently treated as verified.' : replacementByName[name] ? 'Current supplied guide controls conflicting older prose; original body is not in the text export.' : 'Only its catalog record is supplied. No assertion of reading, validating or executing the absent original; current scoped modules govern implemented requirements.' };
});

const overrides = [
 { id:'OV-REACT', origin:'User handoff line 172', supersedes:'Next.js scaffold and framework-specific APIs', resolution:'React website with its actual chosen build adapter; apply transferable delivery/metadata contracts.' },
 { id:'OV-NO-PYTHON', origin:'User handoff lines 288 and 340', supersedes:'Python utilities and scripting examples throughout source library', resolution:'No Python execution; private structural inventory implemented in Node/TypeScript.' },
 { id:'OV-NO-DB', origin:'User handoff lines 354, 387 and 412', supersedes:'PostgreSQL, persistence/outbox/CRM examples where presented as necessary', resolution:'Direct email backend; no lead database, provider acceptance and mailbox observation kept distinct.' },
 { id:'OV-TRUTH', origin:'User handoff lines 246 and 372', supersedes:'New person/organization registry or synthetic identities from neutral library examples', resolution:'Existing unified canonical source is authoritative; exact public projection integration is gated on actual source retrieval.' },
 { id:'OV-LOCAL', origin:'Current user direction relayed by root: build entire site locally and hand to Claude Code for transfer', supersedes:'Network access as a blocker to local implementation', resolution:'Complete local code/assets/docs/tests; only actual remote deployment/account/receipt observations remain external gates.' },
 { id:'OV-WHOLE', origin:'User handoff lines 372, 472 and 519', supersedes:'Selective SEO snippets treated only as reference/governance', resolution:'Every supplied document, role and graph receives a meaningful application decision; avoid unneeded products explicitly described as optional in the library.' },
 { id:'OV-DESKTOP-V3', origin:'Current user direction relayed by root: expand the original CRT moods/attitude and demo journey in a separate v3 delivery', supersedes:'Treating the mobile-v2 upgrade as the completed original-desktop request or copying a full older website over ongoing operator edits', resolution:'Preserve original CRT geometry, gate rude gestures, connect finite buyer choices to the unchanged direct-email form, and deliver a hash-guarded addon supporting exact v1 and v2 baselines.' }
];
overrides.push({ id:'OV-WORKSHOP-V4', origin:'User correction: remove screen tabs and sloppy pop-ups; screenshots show newer operator full-room layout', supersedes:'Floating room navigation, hover labels and detached computer conversation overlay', resolution:'Keep navigation in the header, retain the original scene composition and make conversation content flow below the room. Preserve unknown live edits through targeted cleanup and reviewed merges.' });
const findings = [...docText(126).matchAll(/^## (F\d{2}) — (.+)\n([\s\S]*?)(?=^## F\d{2} —|$(?![\s\S]))/gm)].map(m=>({id:m[1],classification:m[2],disposition:m[3].match(/\*\*Disposition:\*\* (.+)/)?.[1]??null,source:'D126',status:'SOURCE_DISPOSITION_NOT_PRODUCT_TEST'}));
const completeness = {
 manual: { path:'private/standards/SEO-AIO-Library.txt', bytes:Buffer.byteLength(manual), sha256:hash(manual) },
 graphExpansion: { path:'private/standards/Graph-Expansion.txt', bytes:Buffer.byteLength(graphText), sha256:hash(graphText), alsoIncludedInCombinedManual:manual.startsWith(graphText.trimEnd()) },
 expected: { documents:135, roles:26, graphs:40, originalCatalogRows:146 },
 observed: { documents:documents.length, roles:roles.length, graphs:graphs.length, originalCatalogRows:legacy.length },
 scope: 'All supplied text-document records and graph cards are inventoried and semantically mapped. The referenced million-word/146-original archive, companion JSON schemas and original utilities are absent; no claim that those absent bodies were read or certified.',
 readingMethod: 'Bounded full-document/card reads; exact repeated lines suppressed where already read. Metadata and structural ingestion cover complete source bytes; no token match is used as a product-compliance verdict.',
 sourceReviewBoundary: 'Source-dated claims remain source-derived; time-sensitive deployed behavior requires primary-source confirmation and actual account/host evidence.'
};
const ledger = { schemaVersion:1, project:'ThatStupidComputer workshop v4 and focused live-source cleanup', visibility:'PRIVATE_NOT_WEB_CONTENT', generatedAt:new Date().toISOString(), completeness, overrides, requirements:requirements.map(r=>({...r,implementation:r.paths.map(file),scopedEvidence:{path:'docs/WORKSHOP-CLEANUP-ACCEPTANCE.md',matchRequirement:r.id,note:'Read the requirement scopes, actual executed reports and limitations in desktop acceptance. A narrow PASS never passes an entire requirement; prior observations belong to their original v1/v2 builds.'}})), documents, roles, graphs, legacyReferences:legacy, sourceFindingDispositions:findings, evidencePolicy:{ allowedStatuses:['PENDING','PASS','FAIL','BLOCKED','NOT_APPLICABLE'], initialState:'PENDING', passRequires:'Executed observation with exact build/environment/command/time/artifact and scope; never source presence or historical package tests.', independence:'separate AI review; shared task and filesystem; not independent human or external audit', productionAuthorizationGranted:false, observationsPath:'docs/WORKSHOP-CLEANUP-ACCEPTANCE.md', historicalObservationsPaths:['docs/standards/observations.json','docs/standards/upgrade-observations.json'] } };
const problems: string[] = [];
for (const [key,value] of Object.entries(completeness.expected)) if (completeness.observed[key as keyof typeof completeness.observed]!==value) problems.push(`${key} expected ${value}`);
if (unique(index.map(x=>x.number)).length!==135 || index.some((x,i)=>x.number!==i+1)) problems.push('Document IDs incomplete or out of order');
if (decisions.size!==135) problems.push('Document decisions incomplete');
if (graphs.some((g,i)=>g.id!==`G${String(i+1).padStart(2,'0')}`)) problems.push('Graph IDs incomplete');
if (graphs.some(g=>g.acceptanceCriteria.length===0) || roles.some(r=>r.acceptanceCriteria.length===0)) problems.push('Source acceptance criteria missing');
if (graphs.some(g=>!g.requirements.length || !g.reason) || documents.some(d=>!d.requirements.length || !d.reason)) problems.push('Reasoned requirement mapping missing');
if (findings.length!==28) problems.push('Source finding dispositions incomplete');
if (problems.length) throw new Error(problems.join('; '));
if (process.argv.includes('--check')) {
 const saved = JSON.parse(read('docs/standards/coverage-ledger.json'));
 if (saved.completeness.manual.sha256!==completeness.manual.sha256 || saved.completeness.graphExpansion.sha256!==completeness.graphExpansion.sha256) throw new Error('Source drift: rerun inventory and semantic review');
 for (const d of documents) if (saved.documents.find((s:{id:string})=>s.id===d.id)?.sha256!==d.sha256) throw new Error(`Source drift ${d.id}`);
 for (const [kind,count] of Object.entries(completeness.expected)) if (saved.completeness.observed[kind]!==count) throw new Error(`Saved coverage incomplete: ${kind}`);
 // Existence is an observation at generation time; new owner files do not change source policy.
 // Compare every saved mapping/criterion, not only claimed counts or source hashes.
 // Native Node TypeScript stripping and tsx/esbuild can give object spreads
 // different property insertion order. Compare semantic object keys; keep array order.
 const normalize = (value: unknown): unknown => Array.isArray(value) ? value.map(normalize) : value && typeof value === 'object'
   ? Object.fromEntries(Object.entries(value).filter(([key])=>!['generatedAt','exists'].includes(key)).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>[key,normalize(item)])) : value;
 const stable = (value: unknown) => JSON.stringify(normalize(value));
 if (stable(saved)!==stable(ledger)) throw new Error('Saved mapping drift: regenerate inventory and review changed decisions');
 console.log(JSON.stringify({status:'PASS',scope:'Source inventory and mapping structure only',documents:135,roles:26,graphs:40,legacyCatalogReferences:146,sourceFindings:28,productAcceptance:'NOT_DETERMINED',productionAuthorizationGranted:false}));
} else {
 mkdirSync(outRoot,{recursive:true});
 writeFileSync(resolve(outRoot,'coverage-ledger.json'),JSON.stringify(ledger,null,2)+'\n');
 writeFileSync(resolve(outRoot,'decisions.json'),JSON.stringify({schemaVersion:1,visibility:'private',overrides,conditionalGraphDecisions:graphs.filter(g=>g.disposition!=='APPLY').map(({id,title,disposition,reason})=>({id,title,disposition,reason})),sourceFindingDispositions:findings},null,2)+'\n');
 console.log(JSON.stringify({written:relative(root,resolve(outRoot,'coverage-ledger.json')),documents:documents.length,roles:roles.length,graphs:graphs.length,legacyCatalogReferences:legacy.length,behavioralAcceptance:'PENDING'}));
}
