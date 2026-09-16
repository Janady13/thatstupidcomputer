import { PROJECT_INTENTS } from '../../../../packages/site/inquiry.mjs';
export { PROJECT_INTENTS, PROJECT_LABELS, demoIntentHref, parseDemoIntent } from '../../../../packages/site/inquiry.mjs';
/** Call after hydration. An edited form is never rewritten by a URL change. */
export function applyDemoIntent(fields, intent, edited = false) {
  if (edited || !intent || intent.source !== 'computer' || !PROJECT_INTENTS.includes(intent.projectType) || fields.projectType !== 'unsure') return fields;
  return { ...fields, projectType: intent.projectType };
}
