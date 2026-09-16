/** Private developer-API implementations; never a dependency of public crawler policy. */
import type { ProviderId } from './registry.ts';
import type { AnswerAdapter } from './protocol.ts';
import { googleAnswers } from './providers/google/answers.ts';
import { openaiAnswers } from './providers/openai/answers.ts';
import { anthropicAnswers } from './providers/anthropic/answers.ts';
import { perplexityAnswers } from './providers/perplexity/answers.ts';
import { xaiAnswers } from './providers/xai/answers.ts';
import { mistralAnswers } from './providers/mistral/answers.ts';

export const ANSWER_ADAPTERS = {
  bing: null, google: googleAnswers, openai: openaiAnswers, anthropic: anthropicAnswers,
  perplexity: perplexityAnswers, xai: xaiAnswers, mistral: mistralAnswers, deepseek: null,
} as const satisfies Record<ProviderId, AnswerAdapter | null>;
