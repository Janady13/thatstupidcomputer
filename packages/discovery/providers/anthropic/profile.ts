import type {ProviderProfile} from '../../contract.ts';
export const anthropic={
  id:'anthropic',product:'Claude',reviewedAt:'2026-09-13',
  sources:['https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler','https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool'],
  feeds:{anthropic:'https://claude.com/crawling/bots.json'},
  agents:[{agent:'Claude-SearchBot',provider:'anthropic',purpose:'search',feed:'anthropic'},{agent:'ClaudeBot',provider:'anthropic',purpose:'training',feed:'anthropic'},{agent:'Claude-User',provider:'anthropic',purpose:'user-fetch',feed:'anthropic'}],
  robots:[{agent:'Claude-SearchBot',policy:'allow'},{agent:'Claude-User',policy:'allow'},{agent:'ClaudeBot',policy:'anthropicTraining'}],
  answerPaths:['/services/website-rescue/','/process/','/services/search-visibility/','/services/'],
  observationFormat:'Messages API content text citations of type web_search_result_location',
  limits:['Claude-SearchBot, Claude-User and ClaudeBot have distinct roles.','Anthropic documents robots and Crawl-delay support.','A successful HTTP Messages response can still contain a web_search_tool_result_error.','API observations are not consumer Claude UI measurements.'],
} as const satisfies ProviderProfile;
