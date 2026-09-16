import type { DesktopState } from '../core/contracts.mjs';
import type { ActionName } from '../mobile/types';
export type ConversationIntent = 'design' | 'rescue' | 'search';
export interface ConversationState { view: 'closed' | 'choose' | 'recommendation' | 'roast'; intent: ConversationIntent | null; roastIndex: number; attitude: boolean; desktop: DesktopState; mobile: ActionName; announcement: string }
export type ConversationEvent = { type: 'OPEN' | 'CLOSE' | 'BACK' | 'ROAST' | 'POLITE' } | { type: 'INTENT'; intent: ConversationIntent } | { type: 'GESTURE'; double?: boolean } | { type: 'MOOD'; desktop: DesktopState };
export const INTENTS: Readonly<Record<ConversationIntent, { label: string; heading: string; line: string; desktop: DesktopState; mobile: ActionName }>>;
export const ROASTS: readonly string[];
export const DESKTOP_TO_MOBILE: Readonly<Record<DesktopState, ActionName>>;
export function createConversation(): ConversationState;
export function transitionConversation(state: ConversationState, event: ConversationEvent): ConversationState;
