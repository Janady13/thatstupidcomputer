import {record,records,citationUrl,type AnswerAdapter} from '../../protocol.ts';
export const perplexityAnswers:AnswerAdapter={
  endpoint:'https://api.perplexity.ai/v1/sonar',auth:'bearer',
  build:(model,query)=>({model,messages:[{role:'user',content:query}],max_tokens:1200,stream:false}),
  parse:value=>{
    if(!record(value)||!Array.isArray(value.choices)||!Array.isArray(value.citations))return;
    const choice=records(value.choices)[0];if(!choice||choice.finish_reason!=='stop'||!record(choice.message)||typeof choice.message.content!=='string'||!choice.message.content.trim())return;
    // Native citations are sources used in generation; search_results is only retrieved context.
    const citations=value.citations.map(citationUrl).filter((url):url is string=>Boolean(url)).map(url=>({url}));
    return {text:choice.message.content,citations,searchExecuted:true,...(typeof value.model==='string'?{responseModel:value.model}:{})};
  },
};
