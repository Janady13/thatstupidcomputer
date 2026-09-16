import {responsesAnswer,type AnswerAdapter} from '../../protocol.ts';
export const openaiAnswers:AnswerAdapter={
  endpoint:'https://api.openai.com/v1/responses',auth:'bearer',
  build:(model,query)=>({model,input:query,tools:[{type:'web_search'}],max_output_tokens:1200,store:false}),
  parse:responsesAnswer,
};
