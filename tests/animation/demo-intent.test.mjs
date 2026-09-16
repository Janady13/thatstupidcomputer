import test from 'node:test';
import assert from 'node:assert/strict';
import { PROJECT_INTENTS, demoIntentHref, parseDemoIntent, applyDemoIntent } from '../../apps/web/src/components/demo-intent.mjs';
test('character intent links carry only finite project choices into the actual demo route',()=>{
  for(const project of PROJECT_INTENTS){const url=new URL(demoIntentHref(project),'https://example.test');assert.equal(url.pathname,'/contact/');assert.equal(url.hash,'#demo-request');assert.equal(parseDemoIntent(url.search).projectType,project);assert.equal(url.searchParams.size,2);}
});
test('unknown, ambiguous, oversized and forged intent parameters fail closed',()=>{
  for(const search of [null,{},'', 'project=design&from=computer','?project=design','?project=design&from=elsewhere','?from=computer&project=search&project=rescue','?from=computer&from=computer&project=design','?from=computer&project=__proto__','?from=computer&project=%3Cscript%3E','?from=computer&project=https%3A%2F%2Fexample.com','?'+ 'a'.repeat(2048)])assert.equal(parseDemoIntent(search),null);
  assert.throws(()=>demoIntentHref('https://example.com'));
});
test('intent initialization preserves every user field and never overwrites an edited or selected form',()=>{
  const fields={projectType:'unsure',name:'Joseph',email:'owner@example.test',message:'A clearer website',consent:false};
  const intent=parseDemoIntent('?from=computer&project=rescue');
  assert.deepEqual(applyDemoIntent(fields,intent),{...fields,projectType:'rescue'});
  assert.equal(fields.projectType,'unsure');
  assert.strictEqual(applyDemoIntent(fields,intent,true),fields);
  const selected={...fields,projectType:'care'};assert.strictEqual(applyDemoIntent(selected,intent),selected);
  assert.strictEqual(applyDemoIntent(fields,null),fields);
});
test('raw query strings, unrelated attribution and PII are not reflected in the parsed context',()=>{
  const intent=parseDemoIntent('?from=computer&project=search&email=private%40example.test&message=secret&utm_source=anything');
  assert.deepEqual(Object.keys(intent),['projectType','source','label']);assert(!JSON.stringify(intent).includes('secret'));assert(!JSON.stringify(intent).includes('private'));
});
