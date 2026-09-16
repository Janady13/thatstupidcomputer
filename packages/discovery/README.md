# Provider discovery and answer observations

`registry.ts` assembles eight independent provider profiles. Each provider owns its documented crawler policies, source-page selection and supported API contract. Public content remains in `packages/site/content.ts`; approved identity remains in the existing truth projection. Nothing here publishes competing copies of the organization or model-specific doorway pages.

The public registry imports profiles only. `adapters.ts` assembles the private request builders and citation parsers with an exhaustive provider-key type check. Browser code cannot import those adapters or their protocol implementations; the architecture gate enforces this before bundling, without relying on tree-shaking.

The private CLI is bundled to `apps/api/dist/discovery.mjs`. It is not an HTTP route, browser dependency or background job. Only `apps/web/dist` is public. Run `npm run discovery -- --help` from the source checkout, or pass `TSC_DISCOVERY_ROOT` explicitly when running the bundle.

## Commands

- `npm run discovery -- catalog`: derive provider answer selections from real public pages. This is source content, not evidence that a model answered.
- `npm run discovery -- bing`: read the two verified website/organization properties, paginate native link samples, reconcile explicit canonical-node relationships and capture sitemaps, crawl, traffic and quota data.
- `npm run discovery -- google 2026-08-14 2026-09-10`: read Search Console ownership, sitemaps, final date-level web analytics and URL Inspection for all eleven routes. Dates are explicit and use Google's Pacific reporting window.
- `npm run discovery -- answer PROVIDER MODEL`: one bounded, potentially billable search-backed API observation using an explicitly selected available model. No retry loop or consumer-interface result is inferred.

Reports are exclusively created under `.build/discovery/`, with a 0700 directory and 0600 files. A validated project root and symlink checks prevent placing evidence under public output. Exit 2 means partial/unavailable evidence; exit 1 means configuration or collection failure. A successful command is not an indexing, ranking or citation guarantee.

## Private configuration

Credentials may be supplied through the process environment or an explicitly selected `TSC_DISCOVERY_ENV` file. Do not commit that file or put keys on command lines. Supported key names: `BING_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `XAI_API_KEY`, `MISTRAL_API_KEY`.

Bing also requires `TSC_DISCOVERY_NODE` and `TSC_DISCOVERY_NODE_SHA256`. The full canonical node is read only, checked before and after collection, and never copied to public output. Google Search Console requires `TSC_GSC_SERVICE_ACCOUNT`, the path to an authorized service-account JSON file; the OAuth scope is `webmasters.readonly`.

## Evidence boundaries

- Bing backlinks are a representative sample, not an exhaustive register. Native `AnchorCount`, returned detail rows, expected contextual links and canonical relationships remain separate. `sameAs` is not an inbound backlink. Empty detail lists do not establish zero links.
- Bing AI Performance and Search Console Links/generative-AI readback require their native supported surfaces; no invented API endpoint fills those gaps. A failing ancillary API method remains visible as unavailable.
- OpenAI and xAI use Responses; Gemini uses the current Interactions `steps` contract; Claude uses its versioned search tool; Perplexity uses Sonar; Mistral uses Conversations. Only actual answer citations are counted, not search-result inventories. Unresolved citation proxies remain unavailable.
- DeepSeek's reviewed Responses compatibility guide says built-in web search is ignored. Its profile records that limit and deliberately has no fabricated search adapter.
- Model API tests are not consumer ChatGPT, Gemini, Claude, Grok or Copilot placement measurements. Missing credentials, HTTP errors and incomplete/searchless answers are unavailable, never zero visibility. Citation presence still requires a separate correctness review.

Provider source URLs and the last review date are stored beside each implementation. The governing SEO/AIO library is applied together with current primary documentation; recheck those contracts before adopting a new API revision.
