import type { CharacterState } from '../office/types';
import type { ActionName } from '../mobile/types';

interface AttentionBeat { desktop: CharacterState; mobile: ActionName; seconds: number }
export interface AttentionChapter { id: string; label: string; line: string; beats: readonly AttentionBeat[] }

/** Finite acting, using the original rigs. No automatic attitude, travel or endless loop. */
export const ATTENTION_CHAPTERS: readonly AttentionChapter[] = [
  { id: 'hello', label: 'Hello, human.', line: 'Oh, good. A human.\nI have a few ideas for your website.', beats: [
    { desktop: 'wave', mobile: 'Wave', seconds: 4.5 },
    { desktop: 'beckon', mobile: 'Excited', seconds: 4.9 },
    { desktop: 'point-right', mobile: 'PointRight', seconds: 4.3 },
    { desktop: 'idle', mobile: 'Idle', seconds: 0 },
  ] },
  { id: 'trouble', label: 'Sound familiar?', line: 'Your website is having a moment.\nHas that moment lasted six months?', beats: [
    { desktop: 'startled', mobile: 'Startled', seconds: 2.2 },
    { desktop: 'facepalm', mobile: 'Facepalm', seconds: 4.9 },
    { desktop: 'shrug', mobile: 'Shrug', seconds: 4.3 },
    { desktop: 'idle', mobile: 'Idle', seconds: 0 },
  ] },
  { id: 'thinking', label: 'Let me take a look.', line: 'Less guesswork. More detective work.\nEvery website needs a useful job.', beats: [
    { desktop: 'searching', mobile: 'Searching', seconds: 4.8 },
    { desktop: 'thinking', mobile: 'Think', seconds: 3.8 },
    { desktop: 'thumbs-up', mobile: 'Proud', seconds: 4.3 },
    { desktop: 'idle', mobile: 'Idle', seconds: 0 },
  ] },
  { id: 'your-turn', label: 'Your move.', line: 'Enough about my excellent personality.\nWhat should your website do?', beats: [
    { desktop: 'demo-invite', mobile: 'PointRight', seconds: 5.5 },
    { desktop: 'bow', mobile: 'Bow', seconds: 5.1 },
    { desktop: 'idle', mobile: 'Idle', seconds: 0 },
  ] },
];

/** Hysteresis prevents a trembling scroll position from repeatedly restarting a gesture. */
export function attentionChapterAt(progress: number, previous: number): number {
  const value = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const edges = [.27, .57, .85];
  let chapter = Math.max(0, Math.min(3, previous));
  while (chapter < 3 && value >= edges[chapter]! + .025) chapter++;
  while (chapter > 0 && value < edges[chapter - 1]! - .025) chapter--;
  return chapter;
}
