import type { ReactNode, RefObject } from 'react';
import type { DesktopState } from '../core/contracts.mjs';

export type LayerName = 'architecture' | 'wall' | 'furniture' | 'desktop' | 'character' | 'foreground' | 'atmosphere';
export type ObjectKind = 'wall' | 'floor' | 'baseboard' | 'outside' | 'window' | 'blinds' | 'bulletin-board' | 'board-blueprint' | 'board-reminder' | 'board-smile' | 'board-photo' | 'board-small-note' | 'clock' | 'shelf' | 'binders' | 'shelf-plant' | 'filing-cabinet' | 'outlet' | 'workbench' | 'desk-pedestal' | 'drawer-top' | 'drawer-bottom' | 'desk-lamp' | 'desk-plant' | 'coffee-mug' | 'soldering-station' | 'tape-roll' | 'parts-organizer' | 'storage-boxes' | 'pencil-cup' | 'desk-paper' | 'screwdriver' | 'loose-hardware' | 'tool-cart' | 'test-meter' | 'cart-tool-cup' | 'cart-box' | 'cable-reel' | 'floor-box' | 'air-dust';
export type CharacterState = DesktopState;
export interface RoomPalette { paper: string; ink: string; rust: string }
export interface ArtProps {
  idPrefix: string;
  palette: RoomPalette;
  /** Exact semantic group names, e.g. desk-lamp-light-pool. */
  hiddenParts?: readonly string[];
}
export interface RoomItem {
  id: string;
  kind: ObjectKind;
  label: string;
  layer: LayerName;
  /** Actual nesting. Children move, scale, rotate and hide with this parent. */
  parent: string | null;
  stack: 'under' | 'over';
  /** Coordinates in the parent's local SVG space, never CSS pixels. */
  x: number;
  y: number;
  scale: number;
  rotation: number;
  visible: boolean;
  hiddenParts?: readonly string[];
  category?: string;
}
export type ObjectOverride = Partial<Omit<RoomItem, 'id' | 'kind'>>;
export type RoomOverrides = Readonly<Record<string, ObjectOverride>>;
export type RoomAddition = Pick<RoomItem, 'id' | 'kind'> & Partial<Omit<RoomItem, 'id' | 'kind'>>;
export interface RoomEffects {
  breeze: boolean;
  steam: boolean;
  clock: boolean;
  lighting: boolean;
  dust: boolean;
  instruments: boolean;
}
export interface CharacterPlacement {
  visible: boolean;
  parent: string | null;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  state: CharacterState;
  attitudeEnabled?: boolean;
  intensity: number;
}
export interface RoomSceneProps {
  /** Fires when a non-looping computer performance finishes; the host decides what plays next. */
  onCharacterComplete?: (state: CharacterState) => void;
  /** Element whose pointer movement the computer's eyes follow (defaults to the character's own SVG). */
  pointerTarget?: RefObject<HTMLElement | null>;
  objects?: RoomOverrides;
  additions?: readonly RoomAddition[];
  character?: false | Partial<CharacterPlacement>;
  effects?: Partial<RoomEffects>;
  palette?: Partial<RoomPalette>;
  paused?: boolean;
  /** 0..1 additional opening; the base illustration already has an ajar lower drawer. */
  drawerOpen?: number;
  replay?: number;
  attitudeEnabled?: boolean;
  className?: string;
  /** Decorative by default. Keep headlines, navigation and forms in HTML. */
  decorative?: boolean;
  label?: string;
  onError?: (error: unknown) => void;
  /** Extra SVG nodes drawn above the scene, not HTML children. */
  children?: ReactNode;
}
