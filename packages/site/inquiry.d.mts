export type ProjectIntent = 'design' | 'rescue' | 'search' | 'care' | 'unsure';
export interface DemoIntent { readonly projectType: ProjectIntent; readonly source: 'computer'; readonly label: string }
export const INQUIRY_PATH: '/contact/';
export const INQUIRY_FORM_ID: 'demo-request';
export const INQUIRY_FORM_HREF: '/contact/#demo-request';
export const PROJECT_INTENTS: readonly ProjectIntent[];
export const PROJECT_LABELS: Readonly<Record<ProjectIntent, string>>;
export function demoIntentHref(project?: ProjectIntent): string;
export function parseDemoIntent(search: unknown): DemoIntent | null;
