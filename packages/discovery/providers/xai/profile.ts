import type {ProviderProfile} from '../../contract.ts';
export const xai={
  id:'xai',product:'Grok / xAI',reviewedAt:'2026-09-13',
  sources:['https://docs.x.ai/developers/tools/web-search','https://docs.x.ai/developers/tools/x-search','https://docs.x.ai/developers/tools/citations'],
  feeds:{},agents:[],robots:[],
  answerPaths:['/services/website-rescue/','/services/search-visibility/','/work/','/process/'],
  observationFormat:'xAI Responses API web_search output url_citation annotations; X search is a separate tool',
  limits:['Reviewed xAI docs provide web and X search tools, not a verified publisher GrokBot/IP-range contract.','No invented crawler allowlist or Grok-specific website schema.','API search observations are not consumer Grok measurements.'],
} as const satisfies ProviderProfile;
