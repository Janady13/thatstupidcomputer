import type { ActionName } from '../mobile/types';
export type CommandKind = 'enterLeft' | 'enterRight' | 'exitLeft' | 'exitRight' | 'walkTo' | 'runTo' | 'roam' | 'peekLeft' | 'peekRight' | 'jump' | 'home' | 'return' | 'cancel' | 'replay';
export interface StageCommand { id: string | number; kind: CommandKind; target?: number | { x: number; y?: number } }
export interface StageSize { width: number; height: number; actorWidth: number; actorHeight: number }
export interface Point { x: number; y: number }
export type StagePhase = 'idle' | 'moving' | 'dragging' | 'settling' | 'hidden';
export interface Segment { from: Point; to: Point; duration: number; style: string; pose: ActionName; height?: number; hideAfter?: boolean }
export interface StageState { size: StageSize; x: number; y: number; visible: boolean; phase: StagePhase; active: Segment | null; queue: Segment[]; elapsed: number; commandId: string | number | null; commandKind: CommandKind | null; lastCommand: StageCommand | null; revision: number; velocity: Point }
export interface EngineStatus { phase: StagePhase; commandId: string | number | null; commandKind: CommandKind | null; complete: boolean; position: Point; pose: ActionName | null; visible: boolean }
export const COMMAND_KINDS: readonly CommandKind[];
export const MAX_DELTA: number;
export const MAX_SEQUENCE: number;
export function boundsFor(size: Partial<StageSize>): { minX: number; maxX: number; minY: number; maxY: number };
export function normalizedPosition(state: StageState): Point;
export function createStage(size?: Partial<StageSize>): StageState;
export function issueCommand(previous: StageState, command: StageCommand): StageState;
export function tickStage(previous: StageState, delta: number, enabled?: boolean): StageState;
export function resizeStage(previous: StageState, size: Partial<StageSize>): StageState;
export function hasStageWork(state: StageState): boolean;
export function beginDrag(previous: StageState): StageState;
export function dragTo(previous: StageState, point: Point, delta?: number): StageState;
export function endDrag(previous: StageState): StageState;
export function cancelDrag(previous: StageState): StageState;
export function stageStatus(state: StageState): EngineStatus;
