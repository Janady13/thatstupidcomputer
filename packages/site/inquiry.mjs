/** Shared public URL contract; only a finite project choice crosses into the form. */
export const INQUIRY_PATH = '/contact/';
export const INQUIRY_FORM_ID = 'demo-request';
export const INQUIRY_FORM_HREF = `${INQUIRY_PATH}#${INQUIRY_FORM_ID}`;
export const PROJECT_INTENTS = Object.freeze(['design', 'rescue', 'search', 'care', 'unsure']);
export const PROJECT_LABELS = Object.freeze({ design: 'a new website', rescue: 'rescuing your website', search: 'helping customers find you', care: 'looking after your website', unsure: 'finding the right starting point' });

export function demoIntentHref(project = 'unsure') {
  if (!PROJECT_INTENTS.includes(project)) throw new RangeError('Unknown project intent');
  return `${INQUIRY_PATH}?project=${project}&from=computer#${INQUIRY_FORM_ID}`;
}

export function parseDemoIntent(search) {
  if (typeof search !== 'string' || search.length > 2048 || !search.startsWith('?')) return null;
  const params = new URLSearchParams(search);
  if (params.getAll('from').length !== 1 || params.get('from') !== 'computer' || params.getAll('project').length !== 1) return null;
  const projectType = params.get('project');
  if (!PROJECT_INTENTS.includes(projectType)) return null;
  return Object.freeze({ projectType, source: 'computer', label: PROJECT_LABELS[projectType] });
}
