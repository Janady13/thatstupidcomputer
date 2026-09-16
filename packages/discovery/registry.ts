/** Public provider assembly point. Private API adapters live in adapters.ts. */
import {bing} from './providers/bing/profile.ts';
import {google} from './providers/google/profile.ts';
import {openai} from './providers/openai/profile.ts';
import {anthropic} from './providers/anthropic/profile.ts';
import {perplexity} from './providers/perplexity/profile.ts';
import {xai} from './providers/xai/profile.ts';
import {mistral} from './providers/mistral/profile.ts';
import {deepseek} from './providers/deepseek/profile.ts';
export const PROVIDERS={bing,google,openai,anthropic,perplexity,xai,mistral,deepseek} as const;
export type ProviderId=keyof typeof PROVIDERS;
export const CRAWLER_FEEDS={...bing.feeds,...google.feeds,...openai.feeds,...anthropic.feeds,...perplexity.feeds,...mistral.feeds} as const;
export const CRAWLER_AGENTS=[...bing.agents,...google.agents,...openai.agents,...anthropic.agents,...perplexity.agents,...mistral.agents] as const;
export const ROBOTS_POLICIES=Object.values(PROVIDERS).flatMap(provider=>[...provider.robots]);
// Only these providers document engine-scoped HTML names. All other consumers
// receive the same canonical HTML, generic robots policy and accessible controls.
export const PUBLISHER_META=[...bing.pageMeta,...google.pageMeta];
