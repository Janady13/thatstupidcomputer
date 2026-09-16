import type {ProviderProfile} from '../../contract.ts';
export const google={
  id:'google',product:'Google Search / Gemini',reviewedAt:'2026-09-13',
  sources:['https://developers.google.com/webmaster-tools/v1/api_reference_index','https://developers.google.com/search/docs/fundamentals/ai-optimization-guide','https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers#google-extended','https://ai.google.dev/gemini-api/docs/google-search'],
  feeds:{google:'https://developers.google.com/static/crawling/ipranges/common-crawlers.json'},
  agents:[{agent:'Googlebot',provider:'google',purpose:'search',feed:'google'}],
  robots:[{agent:'Googlebot',policy:'allow'},{agent:'Google-Extended',policy:'googleExtended'}],
  pageMeta:[{name:'googlebot',content:'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'}],
  answerPaths:['/services/search-visibility/','/services/website-rescue/','/services/website-design/','/process/'],
  observationFormat:'Search Console REST resources; Gemini Interactions steps.model_output content annotations',
  limits:['Google-Extended is a product token, not an HTTP crawler.','Search generative AI participation is separate from Gemini training/grounding.','Google Search does not require special AI files, schema or a model-specific writing language.','Search Console API has no documented backlink resource.','Gemini API observations do not measure consumer AI Overviews, AI Mode or Gemini Apps.'],
} as const satisfies ProviderProfile;
