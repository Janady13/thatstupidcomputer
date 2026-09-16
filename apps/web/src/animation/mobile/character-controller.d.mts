import type { CharacterModel, Clip, ActionName } from './types';
export interface ControllerOptions {
  action?: ActionName; paused?: boolean; censored?: boolean; externalClock?: boolean; returnToIdle?: boolean;
  onActionChange?: (name: ActionName) => void;
  onComplete?: (name: ActionName) => void;
  onRender?: (frame: { time: number; action: ActionName; duration: number; progress: number; loop: boolean }) => void;
  onAdvance?: (frame: { dt: number; time: number; action: ActionName; clip: Clip }) => void;
  onPlaybackChange?: (state: { paused: boolean; reduced: boolean; visible: boolean }) => void;
}
export declare class CharacterController {
  constructor(svg: SVGSVGElement, model: CharacterModel, clips: Clip[], options?: ControllerOptions);
  action: ActionName; time: number; paused: boolean; reduced: boolean; visible: boolean; destroyed: boolean;
  setAction(name: ActionName, options?: { immediate?: boolean }): void;
  setCensored(censored: boolean): void;
  setPlaybackRate(rate: number): void;
  setLayerVisible(id: string, visible: boolean): void;
  pause(): void; resume(): void; seek(seconds: number): void; advance(seconds: number): void; destroy(): void;
}
export declare function keyValue(keys: [number, number][], frame: number, hold?: boolean): number;
export declare function sampleClip(clip: Clip, seconds: number): Record<string, Record<string, number>>;
