import type {ProviderProfile} from '../../contract.ts';
export const openai={
  id:'openai',product:'ChatGPT Search / OpenAI',reviewedAt:'2026-09-13',
  sources:['https://developers.openai.com/api/docs/bots','https://help.openai.com/en/articles/12627856','https://developers.openai.com/api/docs/guides/tools-web-search'],
  feeds:{openaiSearch:'https://openai.com/searchbot.json',openaiTraining:'https://openai.com/gptbot.json',openaiUser:'https://openai.com/chatgpt-user.json'},
  agents:[{agent:'OAI-SearchBot',provider:'openai',purpose:'search',feed:'openaiSearch'},{agent:'GPTBot',provider:'openai',purpose:'training',feed:'openaiTraining'},{agent:'ChatGPT-User',provider:'openai',purpose:'user-fetch',feed:'openaiUser'}],
  robots:[{agent:'OAI-SearchBot',policy:'allow'},{agent:'ChatGPT-User',policy:'allow'},{agent:'GPTBot',policy:'openaiTraining'},{agent:'OAI-AdsBot',policy:'deny'}],
  answerPaths:['/services/website-rescue/','/services/','/process/','/services/search-visibility/'],
  observationFormat:'Responses API output messages with output_text.annotations url_citation',
  limits:['Search discovery is independent of GPTBot training.','User-triggered retrieval may not apply robots rules.','Atlas documents standard ARIA labels, roles and states for agent interaction; these are not special citation tags.','API web-search answers are not evidence of ChatGPT consumer Search results.','No mandatory model-specific publisher citation file is specified in the reviewed crawler and publisher documentation.'],
} as const satisfies ProviderProfile;
