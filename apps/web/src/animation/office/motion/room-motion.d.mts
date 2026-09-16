import type { RoomEffects } from '../types';
export interface RoomMotionOptions {
  effects?: Partial<RoomEffects>;
  paused?: boolean;
  drawerOpen?: number;
  fps?: number;
  externalClock?: boolean;
  onFrame?: (deltaSeconds: number) => void;
  onPlaybackChange?: (state: {paused: boolean; reduced: boolean; visible: boolean; running: boolean}) => void;
}
export class RoomMotion {
  constructor(svg: SVGSVGElement, options?: RoomMotionOptions);
  time: number;
  frames: number;
  reduced: boolean;
  paused: boolean;
  visible: boolean;
  raf: number;
  refresh(): void;
  pause(): void;
  resume(): void;
  setEffects(effects: Partial<RoomEffects>): void;
  setDrawerOpen(value: number): void;
  setExternalClock(value: boolean): void;
  advance(seconds: number): void;
  render(time: number, staticPose?: boolean): void;
  destroy(): void;
}
