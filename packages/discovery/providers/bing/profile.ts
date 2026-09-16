import type {ProviderProfile} from '../../contract.ts';
export const bing={
  id:'bing',product:'Bing / Microsoft Copilot',reviewedAt:'2026-09-13',
  sources:['https://learn.microsoft.com/en-us/bingwebmaster/api-protocols','https://www.bing.com/webmasters/help/backlinks-c3a334e8','https://www.bing.com/webmasters/help/robots-meta-tags-and-attributes-that-bing-supports-5198d240'],
  feeds:{bing:'https://www.bing.com/toolbox/bingbot.json'},
  agents:[{agent:'bingbot',provider:'microsoft',purpose:'search',feed:'bing'}],
  robots:[{agent:'bingbot',policy:'allow'}],
  pageMeta:[{name:'bingbot',content:'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'}],
  answerPaths:['/services/website-rescue/','/services/search-visibility/','/services/','/process/'],
  observationFormat:'Webmaster JSON REST d envelope; native AI Performance report separately',
  limits:['Backlink detail is a representative sample, not an exhaustive inventory.','IndexNow receipt is not index inclusion.','noarchive excludes Copilot use; nocache limits use. Neither is set by this integration.','No public AI Performance API endpoint in the reviewed reference; native report access remains separate.'],
} as const satisfies ProviderProfile;
