import type {ProviderProfile} from '../../contract.ts';
export const mistral={
  id:'mistral',product:'Mistral search / Vibe',reviewedAt:'2026-09-13',
  sources:['https://docs.mistral.ai/robots','https://docs.mistral.ai/studio/agents/agent-tools/websearch','https://docs.mistral.ai/studio/conversations/citations'],
  feeds:{mistralIndex:'https://mistral.ai/mistralai-index-ips.json',mistralUser:'https://mistral.ai/mistralai-user-ips.json'},
  agents:[{agent:'MistralAI-Index',provider:'mistral',purpose:'search',feed:'mistralIndex'},{agent:'MistralAI-User',provider:'mistral',purpose:'user-fetch',feed:'mistralUser'},{agent:'MistralAI-Training',provider:'mistral',purpose:'training',feed:null}],
  robots:[{agent:'MistralAI-Index',policy:'allow'},{agent:'MistralAI-User',policy:'allow'},{agent:'MistralAI-Training',policy:'mistralTraining'}],
  answerPaths:['/services/website-design/','/services/website-rescue/','/process/'],
  observationFormat:'Conversations API message.output content tool_reference chunks',
  limits:['MistralAI-Index and MistralAI-User are separate from MistralAI-Training.','The reviewed crawler page publishes IP feeds for Index and User, not Training; a Training user-agent claim is not authenticated.','Built-in web_search and web_search_premium are retrieval tools, not publisher submission endpoints.','Consumer search and developer Conversations results are separate samples.'],
} as const satisfies ProviderProfile;
