export type CharacterSlug = 'smartphone' | 'flip-phone' | 'app-bot' | 'pager' | 'handheld';
export type ActionName = 'Idle' | 'Happy' | 'Excited' | 'Sad' | 'Angry' | 'Confused' | 'Searching' | 'Sassy' | 'EyeRoll' | 'RudeFlipOff' | 'Wave' | 'Revived' | 'WalkRight' | 'WalkLeft'
  | 'Laugh' | 'Proud' | 'Shy' | 'Suspicious' | 'Startled' | 'Frustrated' | 'Sleepy' | 'WakeUp' | 'Think' | 'Facepalm' | 'Shrug' | 'PointLeft' | 'PointRight' | 'Bow' | 'Jump' | 'Land' | 'RunRight' | 'RunLeft';
export type Property = 'x' | 'y' | 'rotation' | 'scaleX' | 'scaleY' | 'opacity';
export interface VectorNode {
  type: 'group' | 'path'; id: string;
  x?: number; y?: number; rotation?: number; scaleX?: number; scaleY?: number; opacity?: number;
  children?: VectorNode[]; d?: string; fill?: string; stroke?: string; strokeWidth?: number;
}
export interface CharacterModel { slug: CharacterSlug; title: string; subtitle: string; width: number; height: number; cycleSeconds: number; root: VectorNode; }
export interface Track { target: string; property: Property; interpolation: 'hold' | 'linear'; keys: [number, number][]; }
export interface Clip { name: ActionName; fps: number; duration: number; seconds: number; loop: boolean; description: string; tracks: Track[]; travelPerCycle: number; }
