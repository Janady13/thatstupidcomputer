import { memo } from 'react';
import type { ArtProps } from '../types';

/** Noticeboard / intact cork backing. Local geometry: placement belongs to RoomObject. */
export const BulletinBoard = memo(function BulletinBoard({ idPrefix, palette, hiddenParts, reading = false }: ArtProps & { reading?: boolean }) {
  // The same prop, viewed head-on and enlarged for reading. The room's original
  // perspective geometry below is untouched. Pixel-sized frame strokes keep the
  // wood the same thickness as the reading surface grows with its HTML content.
  if (reading) return <g id={`${idPrefix}--bulletin-board`} data-art="bulletin-board">
    <rect width="100%" height="100%" fill={palette.rust} />
    <rect width="100%" height="100%" fill={palette.ink} opacity=".12" />
    <rect width="100%" height="100%" fill="none" stroke={palette.ink} strokeWidth="18" strokeLinejoin="round" />
    <rect width="100%" height="100%" fill="none" stroke={palette.paper} strokeWidth="15" strokeLinejoin="round" />
    <rect width="100%" height="100%" fill="none" stroke={palette.ink} strokeWidth=".6" />
  </g>;
  return (
    <g id={`${idPrefix}--bulletin-board`} data-part="bulletin-board" display={hiddenParts?.includes("bulletin-board") ? "none" : undefined} data-art="bulletin-board">
      <path id={`${idPrefix}--bulletin-board-frame-shadow`} data-part="bulletin-board-frame-shadow" d="M13 41 L470 0 L477 307 L21 319 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.16" />
      <path id={`${idPrefix}--bulletin-board-frame`} data-part="bulletin-board-frame" d="M0 37 L464 -3 L472 307 L0 314 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--bulletin-board-cork`} data-part="bulletin-board-cork" d="M15 50 L449 14 L456 287 L16 292 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--bulletin-board-cork-tone`} data-part="bulletin-board-cork-tone" d="M15 50 L449 14 L456 287 L16 292 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.13" />
      <path id={`${idPrefix}--bulletin-board-inner-border`} data-part="bulletin-board-inner-border" d="M22 57 L442 22 L448 280 L23 285 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
      <path id={`${idPrefix}--bulletin-board-frame-bevel`} data-part="bulletin-board-frame-bevel" d="M0 37 L15 50 M464 -3 L449 14 M472 307 L456 287 M0 314 L16 292" fill="none" stroke={palette.ink} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--bulletin-board-frame-trim`} data-part="bulletin-board-frame-trim" d="M5 42 L458 4 L465 300 L6 306 Z" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-01`} data-part="bulletin-board-cork-edge-hatch-01" d="M27 279.0 L31 274.0" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-02`} data-part="bulletin-board-cork-edge-hatch-02" d="M45 278.73 L49 273.73" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-03`} data-part="bulletin-board-cork-edge-hatch-03" d="M63 278.46 L67 273.46" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-04`} data-part="bulletin-board-cork-edge-hatch-04" d="M81 278.19 L85 273.19" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-05`} data-part="bulletin-board-cork-edge-hatch-05" d="M99 277.92 L103 272.92" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-06`} data-part="bulletin-board-cork-edge-hatch-06" d="M117 277.65 L121 272.65" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-07`} data-part="bulletin-board-cork-edge-hatch-07" d="M135 277.38 L139 272.38" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-08`} data-part="bulletin-board-cork-edge-hatch-08" d="M153 277.11 L157 272.11" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-09`} data-part="bulletin-board-cork-edge-hatch-09" d="M171 276.84 L175 271.84" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-10`} data-part="bulletin-board-cork-edge-hatch-10" d="M189 276.57 L193 271.57" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-11`} data-part="bulletin-board-cork-edge-hatch-11" d="M207 276.3 L211 271.3" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-12`} data-part="bulletin-board-cork-edge-hatch-12" d="M225 276.03 L229 271.03" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-13`} data-part="bulletin-board-cork-edge-hatch-13" d="M243 275.76 L247 270.76" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-14`} data-part="bulletin-board-cork-edge-hatch-14" d="M261 275.49 L265 270.49" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-15`} data-part="bulletin-board-cork-edge-hatch-15" d="M279 275.22 L283 270.22" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-16`} data-part="bulletin-board-cork-edge-hatch-16" d="M297 274.95 L301 269.95" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-17`} data-part="bulletin-board-cork-edge-hatch-17" d="M315 274.68 L319 269.68" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-18`} data-part="bulletin-board-cork-edge-hatch-18" d="M333 274.41 L337 269.41" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-19`} data-part="bulletin-board-cork-edge-hatch-19" d="M351 274.14 L355 269.14" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-20`} data-part="bulletin-board-cork-edge-hatch-20" d="M369 273.87 L373 268.87" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-21`} data-part="bulletin-board-cork-edge-hatch-21" d="M387 273.6 L391 268.6" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-22`} data-part="bulletin-board-cork-edge-hatch-22" d="M405 273.33 L409 268.33" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      <path id={`${idPrefix}--bulletin-board-cork-edge-hatch-23`} data-part="bulletin-board-cork-edge-hatch-23" d="M423 273.06 L427 268.06" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
    </g>
  );
});
