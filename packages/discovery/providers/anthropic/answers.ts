import {annotated,record,records,type AnswerAdapter} from '../../protocol.ts';
export const anthropicAnswers:AnswerAdapter={
  endpoint:'https://api.anthropic.com/v1/messages',auth:'anthropic',headers:{'anthropic-version':'2023-06-01'},
  build:(model,query)=>({model,max_tokens:1200,messages:[{role:'user',content:query}],tools:[{type:'web_search_20260318',name:'web_search',max_uses:3,allowed_callers:['direct']}]}),
  parse:value=>{
    if(!record(value)||value.stop_reason!=='end_turn'||!Array.isArray(value.content))return;
    const content=records(value.content),search=content.filter(c=>c.type==='web_search_tool_result');
    if(search.some(c=>!Array.isArray(c.content)))return; // API 200 may contain a tool-result error object.
    const answer=annotated(content,'text','web_search_result_location','citations');
    if(!answer.text.trim())return;
    return {...answer,searchExecuted:search.length>0,...(typeof value.model==='string'?{responseModel:value.model}:{})};
  },
};
