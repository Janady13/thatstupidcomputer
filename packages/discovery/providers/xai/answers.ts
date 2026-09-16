import {responsesAnswer,type AnswerAdapter} from '../../protocol.ts';
export const xaiAnswers:AnswerAdapter={
  endpoint:'https://api.x.ai/v1/responses',auth:'bearer',
  // X search is deliberately not enabled; it is a different corpus and observation surface.
  build:(model,query)=>({model,input:[{role:'user',content:query}],tools:[{type:'web_search'}],max_output_tokens:1200,store:false}),
  parse:responsesAnswer,
};
