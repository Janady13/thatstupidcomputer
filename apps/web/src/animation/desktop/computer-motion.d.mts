import type { DesktopState } from '../core/contracts.mjs';
export type CharacterState = DesktopState;
export interface DesktopSnapshot {
  state: CharacterState;
  requestedState: CharacterState;
  time: number;
  age: number;
  duration: number;
  progress: number;
  loop: boolean;
  paused: boolean;
  reduced: boolean;
  visible: boolean;
  tour: boolean;
  complete: boolean;
  fanAngle: number;
  pose: Record<string, number>;
}
export interface ComputerMotionOptions {
  state?: CharacterState;
  autoplay?: boolean;
  paused?: boolean;
  fps?: number;
  intensity?: number;
  attitudeEnabled?: boolean;
  returnToIdle?: boolean;
  externalClock?: boolean;
  pointer?: boolean;
  pointerTarget?: Element | null;
  cables: { idle: number[]; revived: number[] };
  onStateChange?: (state: CharacterState) => void;
  onProgress?: (progress: number, playing: boolean) => void;
  onFrame?: (snapshot: DesktopSnapshot) => void;
  onComplete?: (state: CharacterState) => void;
  onPlaybackChange?: (status: {paused:boolean; reduced:boolean; visible:boolean; tour:boolean}) => void;
}
export class ComputerMotion {
  constructor(svg: SVGSVGElement, options: ComputerMotionOptions);
  state: CharacterState;
  requestedState: CharacterState;
  paused: boolean;
  reduced: boolean;
  complete: boolean;
  setState(state: CharacterState, options?: {immediate?:boolean;keepTour?:boolean}): void;
  setAttitudeEnabled(value:boolean): void;
  playShowcase(): void;
  stopShowcase(): void;
  pause(): void;
  resume(): void;
  nudge(): void;
  setIntensity(value:number): void;
  setExternalClock(value:boolean): void;
  advance(seconds:number): void;
  /** Explicit deterministic sample, 0..3600 seconds. Does not emit completion. */
  seek(seconds:number): void;
  getSnapshot(): DesktopSnapshot;
  /** Compatibility alias for the original controller. */
  snapshot(): DesktopSnapshot;
  destroy(): void;
}
export const COMPUTER_MOTION_STATES: readonly CharacterState[];
export function sampleDesktopPose(state: CharacterState, seconds: number, options?: {attitudeEnabled?:boolean}): Record<string, number>;
export const COMPUTER_MOTION_SHOTS: readonly {state:CharacterState;duration:number}[];
