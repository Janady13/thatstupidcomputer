import type { ActionName } from '../mobile/types';
export interface PlaybackConditions {
  action: ActionName;
  replay: number;
  paused: boolean;
  visible: boolean;
  hidden: boolean;
  reduced: boolean;
}
export interface PlaybackGate {
  update(patch: Partial<PlaybackConditions>): void;
  stopped(data: unknown): void;
  dispose(): void;
}
export declare function createPlaybackGate(player: { play(action: string): void; pause(): void; stop(): void }, initial: PlaybackConditions): PlaybackGate;
