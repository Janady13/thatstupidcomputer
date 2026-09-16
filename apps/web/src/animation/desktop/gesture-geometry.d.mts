export interface GesturePalette {paper:string;ink:string;rust:string}
export interface GesturePose {
  gestureOpacity:number;armLX:number;armLY:number;armLBend:number;armLR:number;
  armRX:number;armRY:number;armRBend:number;armRR:number;handL:number;handR:number;
  mouthSmile:number;mouthOpen:number;tongue:number;
}
export interface GestureNode {tag:'g'|'path'|'rect'|'ellipse';id:string;attrs:Record<string,string|number>;children:GestureNode[]}
export type GestureLayer='arms'|'face';
export const DESKTOP_HANDS:readonly ['open','fist','point','thumbsup','shush','middle'];
export const GESTURE_ANCHORS:Readonly<Record<'left'|'right',Readonly<{x:number;y:number}>>>;
export const GESTURE_WRISTS:Readonly<Record<'left'|'right',Readonly<{x:number;y:number}>>>;
export const GESTURE_BASELINE:Readonly<GesturePose>;
export const GESTURE_HAND_SCALE:number;
export const GESTURE_CENSOR:Readonly<{x:number;y:number;width:number;height:number;fill:string}>;
export const DEFAULT_GESTURE_PALETTE:Readonly<GesturePalette>;
export function gestureCable(side:'left'|'right',pose?:Partial<GesturePose>):string;
export function gestureAttributes(pose?:Partial<GesturePose>):Array<[string,string,string|number]>;
export function createGestureGeometry(palette?:GesturePalette,layer?:GestureLayer):GestureNode;
export function serializeGestureGeometry(palette?:GesturePalette,pose?:Partial<GesturePose>,layer?:GestureLayer,idPrefix?:string):string;
