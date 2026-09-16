import type {ProviderProfile} from '../../contract.ts';
export const perplexity={
  id:'perplexity',product:'Perplexity / Sonar',reviewedAt:'2026-09-13',
  sources:['https://docs.perplexity.ai/docs/resources/perplexity-crawlers','https://docs.perplexity.ai/api-reference/chat-completions-post'],
  feeds:{perplexitySearch:'https://www.perplexity.ai/perplexitybot.json',perplexityUser:'https://www.perplexity.ai/perplexity-user.json'},
  agents:[{agent:'PerplexityBot',provider:'perplexity',purpose:'search',feed:'perplexitySearch'},{agent:'Perplexity-User',provider:'perplexity',purpose:'user-fetch',feed:'perplexityUser'}],
  robots:[{agent:'PerplexityBot',policy:'allow'},{agent:'Perplexity-User',policy:'allow'}],
  answerPaths:['/services/search-visibility/','/services/website-rescue/','/services/','/process/'],
  observationFormat:'Sonar choices.message.content citation markers mapped to citations array',
  limits:['PerplexityBot is search, not foundation-model training.','Perplexity-User generally ignores robots.txt.','Pinned IP feed destinations are the verified .ai redirects of documented .com URLs.','Search results and references are not all necessarily used in the final answer.'],
} as const satisfies ProviderProfile;
