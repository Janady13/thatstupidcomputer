import {annotated,record,records,type AnswerAdapter} from '../../protocol.ts';
export const googleAnswers:AnswerAdapter={
  endpoint:'https://generativelanguage.googleapis.com/v1beta/interactions',auth:'google',headers:{'Api-Revision':'2026-05-20'},
  build:(model,query)=>({model,input:query,tools:[{type:'google_search'}],generation_config:{max_output_tokens:1200},store:false}),
  parse:value=>{
    if(!record(value)||value.status!=='completed'||!Array.isArray(value.steps))return;
    const steps=records(value.steps);
    const answer=annotated(steps.filter(s=>s.type==='model_output').flatMap(s=>records(s.content)),'text','url_citation');
    if(!answer.text.trim())return;
    return {...answer,searchExecuted:steps.some(s=>s.type==='google_search_result'),...(typeof value.model==='string'?{responseModel:value.model}:{})};
  },
};
