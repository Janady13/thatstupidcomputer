import type {RoutePath} from '../site/content.ts';
export interface ProviderProfile {
  id:string; product:string; reviewedAt:string; sources:readonly string[];
  feeds:Readonly<Record<string,string>>;
  agents:readonly {agent:string;provider:string;purpose:'search'|'training'|'user-fetch';feed:string|null}[];
  robots:readonly {agent:string;policy:'allow'|'deny'|'openaiTraining'|'anthropicTraining'|'mistralTraining'|'googleExtended'}[];
  /** Only documented HTML robot meta names. Not API citation annotations. */
  pageMeta?:readonly {name:'googlebot'|'bingbot';content:string}[];
  answerPaths:readonly RoutePath[];
  observationFormat:string;
  limits:readonly string[];
}
