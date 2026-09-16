# Website architecture

The site is a React application with prerendered HTML for each public URL and a small Node/Fastify server. It has no database. The same shared page source drives visible content, metadata, canonical links, breadcrumbs, JSON-LD and the production sitemap. The supplied SEO/AIO manual governs those decisions; the private implementation mapping covers all supplied documents, roles and graph cards.

## Rendering and navigation

`scripts/build.ts` validates configuration first, runs Vite's browser and server builds, and renders the same `App` with a `StaticRouter` into all eleven route files and the 404 page. The browser hydrates the existing HTML with a `BrowserRouter`. Route changes replace only the owned head elements through the same pure metadata renderer. Malformed and unknown paths remain 404 content; the server does not return a successful SPA fallback.

The homepage is a full-screen workshop at desktop sizes. Ordinary links attached to the objects open useful semantic pages. Detail pages are modeless `main` regions, with a visible return path, breadcrumbs, focus management and browser history. Mobile layout places the hero, character scene, destinations and guide in a natural document flow. Navigation, content and the inquiry form remain outside decorative SVG/canvas. A skipped or failed animation cannot remove the customer journey.

The initial HTML includes a dimensioned poster. The desktop room and animation controllers load in separate chunks. Fonts use the system stack and no remote font request. Public artwork and the optional Rive JS/WASM are local, with runtime versions resolved from the installed wrapper package. No third-party service runs merely to display a page.

## Direct email

| Stage | Behavior |
| --- | --- |
| Browser | Native POST form enhanced with pending, validation, failure and acceptance states. Fields stay in component memory; no persistence. |
| HTTP boundary | Same-origin checks, content-type/body-size/method handling, global and inquiry rate limits, server-side schema validation. |
| Mail boundary | One protected configured recipient, required TLS, bounded concurrency and deadline, no provider-body logging. |
| Duplicate handling | Bounded keyed digests in process memory, preserving pending/uncertain outcomes without a durable queue. |
| Result | Acceptance only when the configured recipient is accepted; uncertain timeout is never described as failure-to-send or automatically retried. |

Process-memory deduplication disappears on restart and is not cross-instance coordination. Run one mail service instance unless the product owner deliberately changes that contract. An accepted mail transaction can still bounce or be filtered later. Operators verify mailbox receipt and sender authentication separately. Form bodies are neither an analytics event nor an operational log field.

The exact API schema, statuses and SMTP environment contract are in `apps/api/README.md`. `/api/health` is liveness; `/api/ready` checks configuration and built-page presence without sending mail. Runtime `/api/config` exposes only the optional public measurement ID.

## Canonical organizational data

The actual canonical repository remains authoritative. The consumer accepts a narrow reviewed public projection, checks its exact commit and bytes, and constructs only approved public display fields and ID references. The complete upstream graph, claims, review evidence and export metadata never enter the public output.

Website, page, breadcrumb and service nodes belong to this site. Organization, Person and Brand remain exact references to upstream entities. The adapter does not equate a brand, its owner, publisher and service provider. Production cannot build without real approved relationships. Preview explicitly omits unavailable identity and remains noindex.

Training and Google-Extended permission are independent deployment choices. Search and user-requested public retrieval have separate explicit rules. This preserves the distinction between crawler permission, index eligibility, actual retrieval and measurable business outcomes. Neither robots rules nor schema imply indexing or citations. See `docs/TRUTH-INTEGRATION.md`.

## Animation

`animation/office/navigation.ts` owns the room destinations, hit shapes and reactions. Product components consume this data; the animation layer never imports the UI. `animation/performances/workshop.ts` holds the room tour and rescue story, while `animation/performances/stage-shows.ts` supplies three finite scripts for each of the five existing mobile rigs. `choreography/useWorkshopStory.ts` coordinates discrete cues and a bounded story timer. It preserves pause duration and stops progression for reduced motion, hidden tabs and an offscreen scene. The existing controllers retain ownership of SVG joints and frame updates.

The character conversation remains inline with the room. Manual Previous, Next and End controls work alongside automatic progression; each useful destination remains an ordinary link. The existing direct inquiry and attitude gates are shared with the new experience.

`animation/performances/attention.ts` owns the finite homepage arrival and four scroll chapters. `choreography/useWorkshopAttention.ts` selects them through passive native scroll observation, hysteresis and a suspendable timer. Original controllers still own all joint movement. Stories, conversations, object focus and active key previews outrank automatic acting. Releasing a preview explicitly returns to idle. The physical key deck is HTML in `ComputerConversation.tsx`; its visible labels, accessible names and real inquiry URLs agree. The scene briefly sticks only when an enhanced, motion-enabled viewport can show it; narrow, short, ultrawide, reduced-motion and no-JavaScript views retain normal flow. `workshop-stage` establishes its own mobile block formatting context so the navigation spacer cannot displace the artwork.

Services and its four detail routes use the bulletin board as their HTML reading surface, not the page-panel popup. `ServiceBoardScenery.tsx` renders the existing board prop in an enlarged, head-on reading mode and keeps the existing CRT beside it. The original room-perspective board geometry is unchanged; the background room omits its board and CRT only when this valid service surface owns them. Content still comes from `packages/site/content.ts`, is server rendered, and scrolls with the document. Back/Escape preserve deliberate focus return; direct-entry returns reopen the top of the workshop.

XState coordinates site cues and performance. Motion controllers own SVG animation attributes and clean up frame loops, observers and listeners. User pause, reduced motion, visibility and intersection each have authority to stop motion. Native rendering must independently qualify against exact asset hashes and the installed WebGL runtime; failure uses the supplied SVG renderer.

The original RML layer-order issue was repaired reproducibly into a separate build-source tree. All five native files have official compiler and Canvas-runtime evidence. Actual browser WebGL promotion remains a separately blocked environment check, recorded in `docs/ANIMATION.md`.

## Measurement and delivery

The first privacy choice uses a compact panel with equal accept and decline actions and an expandable explanation. Closing that initial panel returns focus to the main content without scrolling. Opening preferences explicitly returns focus to the preferences button on close. Consent logic and the finite measurement payload schema remain in the original measurement module.

## Styles and enforceable source boundaries

The main stylesheet is an explicit import manifest. Nine extracted modules retain the existing cascade, followed by the service-board surface:

```text
apps/web/src/styles/
  site.css                         Import order only
  tokens.css                       Shared palette and type defaults
  base.css                         Reset, controls, focus and skip link
  layout/shell.css                 Page shell, header and navigation
  layout/scene.css                 Base scene geometry and mobile links
  components/pages.css             Content panels and ordinary page components
  components/forms.css             Form and server outcome presentation
  responsive.css                   Original viewport and accessibility rules
  layout/reading-and-reflow.css    Shared readable sizing and viewport refinements
  layout/workshop.css              Current full room and visible home content
  components/service-board.css     Enlarged in-room Services reading surface
```

Component-specific conversation, playground and companion CSS stays beside the existing styles. Measurement styles remain owned by `measurement/`. Room and character-stage geometry stays inside `animation/`.

`npm run test:architecture` follows the actual transpiled browser import graph, including lazy imports and excluding type-only imports. Protected JSON/raw assets and symlink-resolved targets are checked before recursion is restricted to code modules. It rejects server/private source in the browser graph, UI dependencies from the animation layer, reverse web dependencies from shared/server modules, missing stylesheet imports and protected directories in public assets. The check also runs in the normal application test suite. The existing asset and built-HTTP tests separately verify public bytes, route status, content and source denial.

Browser acceptance uses `TSC_BROWSER_PORT` when set, so an isolated checkout can test without borrowing or replacing another operator's server. Local runs use one worker by default to leave memory for the host's other applications.

GA4 is opt-in basic consent mode with a dedicated data layer, finite event schemas, versioned consent and withdrawal handling. There is no pre-consent event replay. Lead events require accepted SMTP receipts and deduplicate receipt IDs in memory without transmitting them. Route measurement uses an explicit inventory rather than arbitrary path or query capture. Live property settings, Enhanced Measurement and DebugView still require actual account inspection.

Only the compiled web tree is publicly routable. The server denies source, private files, arbitrary JSON, source maps, symlinks that escape the public tree and unknown endpoints. Security headers permit local scripts and required WASM compilation without general JavaScript `unsafe-eval`. No generic production request logger captures URL queries or form content.

Deploy into a new versioned release directory, validate behind access-controlled staging, then switch the current symlink and restart the dedicated service with an explicit rollback path. Keep protected environment snapshots, the canonical source and deployment evidence outside the web root. The supplied templates are inputs for actual host inspection, not assertions that BUBBLES already uses a particular service, certificate or proxy layout.
