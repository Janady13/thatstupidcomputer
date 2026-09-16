# Public truth integration and search delivery

That Stupid Computer consumes the existing unified truth registry. It does not create a second organizational or personal graph, change upstream inheritance, or declare a legal organization for the domain. The canonical registry on BUBBLES was not available in this environment. Its current IDs, identity facts, review state and commit are therefore **BLOCKED pending an actual canonical public export**. The shortened revision mentioned in the prior handoff is historical context, not a current full revision pin.

The implementation is complete on the consumer side: one narrow public adapter, explicit publication validation, revision and byte pins, reusable public config, and site-owned metadata generated from the same editorial source that the React interface renders. Preview builds omit unavailable business identity. A production build fails before publication if the required export or pins are missing, invalid, expired or inconsistent, or if the two separate model-use crawler choices have not been explicitly configured.

## Adapter boundary

`packages/site/truth.ts` defines `TruthProjection` and `validateProjection`. This is an **exchange shape for this consumer**, not a replacement schema for the canonical repository. An adapter running beside the actual registry maps its existing approved records and relationship predicates into this shape. It must preserve the exact upstream IDs, use existing canonical claim references, and omit fields not already approved for public use. There is no requirement to reorganize, reconstruct or migrate the existing registry.

The upstream adapter must resolve the website's actual publisher, service provider and optional brand from existing relationships. It must not assume ownership means publishing, that a Brand is an Organization, or that domains under common control are the same entity. If the registry does not establish a required relationship, leave production blocked and resolve that relationship through the existing canonical process.

| Export field | Contract |
| --- | --- |
| `schemaVersion` | Exact string `tsc-public-projection/v1`. |
| `audience` | Exact string `public`. |
| `provenance.sourceCommit` | Full 40- or 64-character lowercase canonical Git commit; must match the deployment pin. |
| `provenance.exportedAt` | Actual UTC export timestamp. |
| `approval.status` | `approved-for-publication`, reflecting the upstream decision, never generated from a test pass. |
| `approval.reviewedAt`, `expiresAt` | Actual UTC review and recheck expiry; stale or future reviews fail. Export must follow review. |
| `approval.claimRefs` | Opaque references to the existing canonical claims covering exported values and relationships. Supporting evidence remains upstream. |
| `approval.approvedPaths` | Exact JSON pointer of every scalar under `/site` and `/entities`, with no omissions, duplicates or extras. For example, `/entities/0/name` approves that exported name value under the pinned bytes. |
| `site.origin`, `name` | `https://thatstupidcomputer.com` and `That Stupid Computer`, the authorized website. |
| `site.websiteId` | Exact approved site-owned WebSite ID. No person, organization or brand ID is substituted. |
| `site.publisherId` | Existing approved Organization or Person that publishes this website. |
| `site.providerId` | Existing approved Organization or Person that provides the offered services. |
| `site.brandId` | Optional exact existing Brand ID, only if the relationship is approved. |
| `site.contactId` | Optional publisher/provider ID whose approved public email or telephone may be displayed. It is not the backend email-delivery recipient configuration. |
| `site.socialImage` | Optional approved site image `{url,alt,width,height}` with actual same-origin asset and measured dimensions. |
| `entities` | One to eight referenced canonical records, each `{id,type,name,url}` with optional public `email` and E.164 `telephone`. `type` is Person, Organization or Brand. Contact fields on Brand are rejected. Unreferenced records are rejected. |

All unknown fields are rejected. This allowlist intentionally excludes private ownership documents, legal addresses, biography drafts, credentials, inferred employment/founding relationships, `sameAs`, customer records, internal evidence, access tokens, review bodies and ratings. A later genuine need should extend the adapter deliberately, with tests and upstream permission; it should not dump additional registry fields into the browser.

IDs and links must be public HTTPS URLs without credentials or query strings. Literal IPs, local/private host conventions, private-resource paths and example domains are rejected. IDs retain their original bytes instead of being lowercased, normalized or reminted. Validation does not perform network fetches or infer identity from a domain name. Publication review upstream remains responsible for checking ownership, identity, actual source support, public URL suitability and permission.

`approval.approvedPaths` and a SHA-256 digest prove the reviewed field set and selected bytes, not that a claim is true or that a reviewer actually had authority. The canonical process must provide that assurance. Do not edit candidate claims to `approved` merely to clear a build gate. Synthetic test fixtures are never deployable business exports.

The default social image is site-owned artwork, independent of business identity: `apps/web/public/images/tsc-workshop-social.png`, rendered by the root build work from the supplied vector office/computer artwork and visually inspected at 1200 × 630. `SITE_SOCIAL_IMAGE` records that actual file's URL, dimensions and descriptive alt text. It is used when no approved projection override is provided. It makes no claim about an organization, a client project or a photographed physical office.

## Integrate an actual export

1. On BUBBLES, inspect the existing canonical registry and export mechanism at its actual current revision. Use its public selection and permission rules. Implement only a mapping adapter if its existing public export differs from the consumer shape above.
2. Obtain the actual full canonical commit and the selected approved export through an authorized path. Keep the input out of web/public output directories.
3. Validate and copy that export using the Node importer. The importer uses exclusive creation, private permissions and a bounded size. It does not modify the upstream repository, overwrite an existing review snapshot or send data to another service.

```bash
node scripts/import-truth.ts /absolute/path/to/approved-export.json private/truth/reviewed-export.json FULL_CANONICAL_COMMIT
```

4. Pin the returned SHA-256 and source revision with the build's protected deployment configuration:

```text
TSC_TRUTH_PROJECTION=/absolute/path/to/private/truth/reviewed-export.json
TSC_TRUTH_COMMIT=<full reviewed canonical commit>
TSC_TRUTH_SHA256=<SHA-256 of the exact reviewed export bytes>
AI_TRAINING_POLICY=<actual owner-approved allow or deny>
GOOGLE_EXTENDED_POLICY=<actual owner-approved allow or deny>
```

These variables identify a reviewed artifact; they do not contain email-provider credentials. The approved public contact address, if supplied, is distinct from the private destination and credentials used by the direct-email backend. Do not infer one from the other.

5. Run the production build. Inspect the generated pages, names, contact details and graph references against that exact export. Capture the revision/digest in the private release evidence. When canonical facts change or their review expires, produce and review a fresh projection, update both pins, rebuild and inspect again.

No canonical truth export, reviewer record, `claimRefs`, `approvedPaths` or provenance object is serialized into public HTML. `loadSiteConfig` explicitly constructs a public config containing approved display facts and exact references only. The complete canonical graph is never emitted at `/graph.json` or another website endpoint.

## Runtime and rendering API

`loadSiteConfig({deployment, projectionPath?, expectedCommit?, expectedSha256?, ga4MeasurementId?, aiTrainingPolicy?, googleExtendedPolicy?, googleSiteVerification?, bingSiteVerification?})` returns serializable `PublicSiteConfig`. It is a server/build API and uses Node APIs. The browser imports its types only. An invalid supplied projection fails even in preview; absence is allowed only in preview. Preview without identity uses the site-owned WebSite identifier and omits publisher/provider/brand references.

`crawlerPolicy` in public config has typed `training` and `googleExtended` decisions (`allow` or `deny`) and a `source` of `preview-default` or `deployment-config`. Missing preview values default to deny. Production requires both explicit values; it does not infer a training or grounding preference from the privacy copy or the desire for search visibility. If preserving the existing host policy, inspect and record that actual policy first, then configure the matching values. The current host policy has not been observed from this environment.

`packages/site/content.ts` contains the 11 requested routes, their purposes, parent hierarchy, visible headings and sections, CTA, related links and service names. `packages/site/search.ts` is browser-safe and exports `metadataForPage`, `renderHead`, `buildGraph`, `breadcrumbsForPage`, `safeJson`, `robotsTxt` and `sitemapXml`. `scripts/generate-search.ts` exports `generateSearch({outDir,config})` for the root build. It emits only `robots.txt` and `sitemap.xml`.

The root renderer prerenders the same React content and public config into each route's initial HTML. The interface must render approved publisher/provider identity visibly when those references are present. JSON-LD contains site-owned WebSite, WebPage/appropriate subtypes, BreadcrumbList and Service nodes. Organization, Person and Brand are canonical `@id` references, never new local entity declarations. `Service.description` is the exact visible page introduction. A service provider is never set to a Brand or WebSite. There are no ratings, credentials, storefronts, fictional articles/bylines, offers/prices, search actions for nonexistent search, or artificial AI schemas.

## URL contract

| Paths | Production | Preview |
| --- | --- | --- |
| `/`, `/services/`, four service detail routes, `/work/`, `/process/`, `/about/`, `/contact/`, `/privacy/` | Real initial HTML, intended 200, self-canonical on approved origin, index/follow, sitemap entry. | Real initial HTML, noindex/nofollow, no sitemap entries. Canonical points to the eventual production page. |
| Known page without trailing slash | Root server resolves through its explicit canonical redirect contract. | Same route behavior, preview indexing controls. |
| Unknown path | Real 404, noindex, no canonical and no page JSON-LD. | Same. |
| API, private files, review artifacts, native source | Server-side deny/appropriate API behavior; not page sitemap entries. | Same. |

The API/edge owner must prove actual response statuses, headers, redirects, asset delivery and private-file denial. The metadata generator alone does not prove those HTTP behaviors. The root build must not use a blanket successful SPA fallback for unknown pages. No `lastmod` is generated from build time: an export or build timestamp is not evidence that every page changed.

Client route lookup accepts only the exact canonical inventory and its explicit one-missing-trailing-slash aliases. It never collapses repeated slashes, decodes unknown paths or changes case to manufacture a match. Thus `/about//` and `/services///` stay 404 content without a canonical after hydration, matching the server route contract.

## Engine control decision

Ordinary public search discovery and user-requested public retrieval remain allowed. The broader model-use choices must come from the actual owner-approved policy. `AI_TRAINING_POLICY=allow|deny` controls GPTBot and ClaudeBot. Independently, `GOOGLE_EXTENDED_POLICY=allow|deny` controls Google's combined Gemini training and specified Gemini/Vertex grounding permission. A desire to avoid model training does not establish whether the owner accepts the accompanying Google grounding tradeoff. Production fails if either decision is missing; it does not silently pick one. No paid advertising workflow is configured.

| Consumer | Generated decision | Scope |
| --- | --- | --- |
| Googlebot, Bingbot and ordinary crawlers | Allow public routes under the wildcard group. | Search access; indexing and selection remain separate. |
| OAI-SearchBot, Claude-SearchBot, PerplexityBot | Explicit allow, repeated utility exclusions. | Named search discovery. |
| GPTBot, ClaudeBot | Explicit `AI_TRAINING_POLICY`; preview default deny. | Model-training preference. |
| Google-Extended | Explicit `GOOGLE_EXTENDED_POLICY`; preview default deny. | Gemini training **and** the specified Gemini/Vertex grounding uses; denying does not block Google Search, but does decline the named grounding uses. |
| ChatGPT-User, Claude-User, Perplexity-User | Explicit allow public routes. | User-directed retrieval. Robots behavior differs; it never protects private data. |
| OAI-AdsBot | Deny. | No paid ChatGPT ad workflow is configured. |

Preview robots allows ordinary crawls so response/HTML `noindex` can be seen; a wildcard `Disallow: /` would hide that directive. This is indexing control, not privacy protection. Any private preview needs actual host access control. Preview model-use defaults deny unless explicitly configured; unused advertising remains denied. Allowed specific groups repeat utility-path exclusions rather than assuming wildcard inheritance. There are no WAF bypass rules based only on a user-agent string. Verified crawler requests, indexing, citations, referrals and qualified inquiries are separate evidence records.

Current provider checks, reviewed 2026-09-13:

- [Google generative AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): ordinary search foundations, index/snippet eligibility, no special AI schema or llms.txt requirement, and no indexing/selection guarantee. Search Console account-level generative feature eligibility and actual reporting remain release/account checks.
- [Google structured-data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies): accurate visible information and feature-specific eligibility, separate from valid JSON.
- [OpenAI crawlers](https://developers.openai.com/api/docs/bots): distinct search, training, user-fetch and ad-validation roles. User-directed fetches may not follow robots; crawler access does not demonstrate search selection.
- [Google common crawler controls](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended): Google-Extended controls training and named grounding uses without changing Search inclusion.
- [Anthropic crawler controls](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler): separate search, user retrieval and training tokens.
- [Perplexity crawler controls](https://docs.perplexity.ai/docs/resources/perplexity-crawlers): search role distinct from foundation-model training; user fetch generally ignores robots.

No named consumer requires `llms.txt`, an AI-specific schema, or a public graph endpoint for this website. These are omitted. Public service pages answer buyer questions directly; the private 135-document manual is not republished as marketing copy or a collection of role pages.

## Search ownership verification

Optional `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` build variables contain only the public verification token from the actual owner-controlled account. `loadSiteConfig` also accepts `googleSiteVerification` and `bingSiteVerification` options. Tokens must be 10–256 ASCII letters, digits, underscores or hyphens. Pasted `<meta>` elements, whitespace, arbitrary HTML and overly long values fail. An empty optional environment value is treated as absent; no placeholder token is emitted. Empty crawler-policy values remain missing and cannot pass the production gate.

`renderHead` emits `google-site-verification` and `msvalidate.01` only when supplied. These public tags do not constitute successful ownership verification. The account owner still needs to inspect the deployed non-authenticated homepage, complete the provider's verification step, preserve other owners' verification methods, and check actual property access. Google HTML verification applies to URL-prefix properties; domain-property verification requires the applicable DNS method. [Google's verification instructions](https://support.google.com/webmasters/answer/9008080), [Bing add/verify instructions](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b).

No Search Console or Bing Webmaster Tools account was accessed or changed. Existing ownership tokens and verified property state are unknown until inspected through authorized account/host access. The public GA4 measurement ID is separately validated as `G-` followed by 5–20 uppercase ASCII letters or digits; loading remains controlled by the measurement package's consent behavior.

## Standards application and scoped evidence

The governing 2026.09.09-d26 library index was inspected, including the domain charters R08–R15 and R22–R23. Relevant current modules govern content-first delivery (048), engine controls (051), evidence governance (052), metadata (058), schema lifecycle/types (067–068), ChatGPT Search (069), release/URL contracts (070/074), and provenance (072). The 2026.09.12-g40 expansion retains rather than replaces the unified registry foundation. Its G01–G26 relationship, evidence, public/private, navigation, canonical, rendering, consistency and measurement distinctions are applied here. Historical/unverified legacy claims and unapproved public drafts are not used as deployed copy.

| Concern | Implementation/evidence |
| --- | --- |
| Identity preservation; G01–G04, G10, G20 | Exact canonical IDs, narrow public adapter, claim references, per-field approval paths, revision/digest pins; production blocked pending actual export. |
| Public content and graph agreement; R11/R13/R14 | Shared route source; Service uses visible introduction; canonical business references only; no unsupported clients, results, prices or credentials. |
| Navigation and relevance; R09/R10/R23, G08/G09/G13/G21/G23 | Explicit route purposes, hierarchical breadcrumbs, native link destinations and tests for incoming links. Customer task mapping is editorial judgment, not measured query demand. |
| Canonicals/rendering; R08, G16/G17/G19 | Per-page metadata, crawlable prerender contract, production-only sitemap, 404 metadata. Actual HTTP behavior is verified by the server/root suite. |
| AI controls; R12/G25 | Provider-specific role policy; no fabricated answers, hidden fan-out, ranking or citation counts. Account evidence remains unavailable until connected. |
| Conversion; R15/G26 | Clear scoped brief; direct-email acceptance distinguished from human reading, qualified inquiry and sale. Measurement integration belongs to its dedicated package. |
| Local/commerce/reputation/locale; G05/G06/G11/G12/G14/G15/G18/G22/G24 | No source-backed location, catalog, testimonial, backlink, translated variant or SERP observation supplied. Do not create them for graph completeness; useful current-site demonstration retained. |

Run `node --test tests/site/*.test.ts` for the bounded local contract suite. It checks route uniqueness/reachability, metadata/JSON escaping, graph references, production/preview distinctions, exact revision and digest pins, private/unknown field rejection, stale approval, unsafe URL forms and semantic entity conflicts. Synthetic fixtures are temporary test inputs. Passing these tests establishes local contract behavior, not canonical truth, live crawler access, Google feature validation, real-device accessibility, search indexing or AI citation selection. Those outcomes require their own actual observations and release evidence.
