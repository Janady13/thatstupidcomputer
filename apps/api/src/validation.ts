import { z } from 'zod';
import { PROJECT_INTENTS } from '../../../packages/site/inquiry.mjs';

const noControl = (value: string) => !/[\u0000-\u001f\u007f]/.test(value);
const line = (min: number, max: number) => z.string().trim().min(min).max(max).refine(noControl);
export const demoSchema = z.object({
  name: line(2, 100),
  email: z.string().trim().max(254).email().refine(value => !/[\r\n,;<>\s]/.test(value)),
  business: line(2, 160),
  website: z.string().trim().max(300).optional().default('').refine(value => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol) && Boolean(url.hostname) && !url.username && !url.password && noControl(value);
    } catch { return false; }
  }),
  projectType: z.enum(PROJECT_INTENTS),
  message: z.string().trim().min(10).max(4000).refine(value => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value)),
  consent: z.literal(true),
  companyWebsite: z.literal(''),
  // Empty is reserved for an unenhanced native form; the content digest still deduplicates it.
  submissionId: z.union([z.literal(''), z.string().uuid()]),
}).strict();
export type DemoInput = z.infer<typeof demoSchema>;
export const fieldMessages: Record<string, string> = {
  name: 'Enter your name using 2 to 100 characters.',
  email: 'Enter a valid email address.',
  business: 'Enter your business name using 2 to 160 characters.',
  website: 'Enter a complete http:// or https:// website address, or leave this blank.',
  projectType: 'Choose a project type.',
  message: 'Describe your project using 10 to 4,000 characters.',
  consent: 'Please agree to being contacted about your request.',
  companyWebsite: 'The request could not be validated.',
  submissionId: 'Reload the form and try again.',
};
export function parseDemo(body: unknown, nativeForm: boolean) {
  let candidate = body;
  if (nativeForm && body && typeof body === 'object' && !Array.isArray(body)) {
    candidate = { ...body, consent: (body as Record<string, unknown>).consent === 'true' || (body as Record<string, unknown>).consent === 'on' };
  }
  return demoSchema.safeParse(candidate);
}
