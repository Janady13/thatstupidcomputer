import type { ActionName, CharacterSlug } from '../mobile/types';
export interface Performance {name:ActionName;label:string;group:'mood'|'reaction'|'gesture'|'movement';seconds:number;loop:boolean;description:string;isNew:boolean;travel:boolean;peakSeconds:number;}
export interface CharacterPerformance {name:string;personality:string;actingNotes:string;recommendedActions:ActionName[];}
export const PERFORMANCE_VERSION:string;
export const LEGACY_ACTIONS:readonly ActionName[];
export const NEW_ACTIONS:readonly ActionName[];
export const ALL_ACTIONS:readonly ActionName[];
export const PERFORMANCES:Readonly<Record<ActionName,Performance>>;
export const PERFORMANCE_GROUPS:readonly {id:string;label:string;actions:ActionName[]}[];
export const CHARACTER_PERFORMANCES:Readonly<Record<CharacterSlug,CharacterPerformance>>;
export const RESET_ADDITIONS:readonly (readonly [string,string])[];
export const SOURCE_FINGERPRINTS:Readonly<Record<CharacterSlug,{sceneSHA256:string;legacyClips:Record<string,string>}>>;
