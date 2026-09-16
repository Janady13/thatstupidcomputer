import type { ProjectIntent, DemoIntent } from '../../../../packages/site/inquiry.mjs';
export type { ProjectIntent, DemoIntent } from '../../../../packages/site/inquiry.mjs';
export { PROJECT_INTENTS, PROJECT_LABELS, demoIntentHref, parseDemoIntent } from '../../../../packages/site/inquiry.mjs';
export function applyDemoIntent<T extends {projectType: ProjectIntent}>(fields: T, intent: DemoIntent | null, edited?: boolean): T;
