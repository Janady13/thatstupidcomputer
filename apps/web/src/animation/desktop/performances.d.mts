import type { DesktopState } from '../core/contracts.mjs';
export type { DesktopState } from '../core/contracts.mjs';
export interface DesktopPerformance { readonly id: DesktopState; readonly label: string; readonly seconds: number; readonly loop: boolean; readonly peakSeconds: number; readonly requiresAttitude: boolean; readonly group: 'mood' | 'reaction' | 'gesture' | 'demo'; readonly description: string }
export const DESKTOP_PERFORMANCE_VERSION: string;
export const DESKTOP_PERFORMANCES: readonly DesktopPerformance[];
export const DESKTOP_STATE_IDS: readonly DesktopState[];
export const DESKTOP_LEGACY_STATES: readonly DesktopState[];
export const DESKTOP_PERFORMANCE_BY_ID: Readonly<Record<DesktopState, DesktopPerformance>>;
export function safeDesktopState(state: DesktopState, attitudeEnabled?: boolean): DesktopState;
