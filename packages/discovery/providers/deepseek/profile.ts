import type {ProviderProfile} from '../../contract.ts';
export const deepseek={
  id:'deepseek',product:'DeepSeek web search',reviewedAt:'2026-09-13',
  sources:['https://api-docs.deepseek.com/api/create-response/','https://api-docs.deepseek.com/guides/responses_api/'],
  feeds:{},agents:[],robots:[],
  answerPaths:['/services/website-rescue/','/services/website-care/','/process/'],
  observationFormat:'Consumer search observation import; current Responses API does not execute built-in web_search',
  limits:['The current compatibility guide says built-in web_search is ignored; older indexed reference snippets claiming support are stale.','No verified DeepSeek publisher crawler/IP contract established in the reviewed reference.','Text-only API answers must not be labeled live web-search observations.'],
} as const satisfies ProviderProfile;
