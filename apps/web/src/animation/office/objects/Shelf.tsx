import { memo } from 'react';
import type { ArtProps } from '../types';

/** Wall shelf / two brackets. Local geometry: placement belongs to RoomObject. */
export const Shelf = memo(function Shelf({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--shelf`} data-part="shelf" display={hiddenParts?.includes("shelf") ? "none" : undefined} data-art="shelf">
      <path id={`${idPrefix}--shelf-back-edge`} data-part="shelf-back-edge" d="M0 0 L297 -12 322 -1 15 18 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--shelf-front-edge`} data-part="shelf-front-edge" d="M15 18 L322 -1 V13 L15 33 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--shelf-front-shade`} data-part="shelf-front-shade" d="M15 29 L322 9 V13 L15 33 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.13" />
      <path id={`${idPrefix}--shelf-bracket-left`} data-part="shelf-bracket-left" d="M53 32 V94 L64 96 V49 L108 26 L103 23 L65 41 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--shelf-bracket-left-inner`} data-part="shelf-bracket-left-inner" d="M63 48 L64 82 L84 37" fill="none" stroke={palette.ink} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--shelf-bracket-right`} data-part="shelf-bracket-right" d="M252 17 V78 L263 81 V35 L304 16 L299 12 L264 27 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--shelf-mount-left-head`} data-part="shelf-mount-left-head" cx="59" cy="84" r="2.5" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" />
      <path id={`${idPrefix}--shelf-mount-left-slot`} data-part="shelf-mount-left-slot" d="M57.5 84.875 L60.5 83.125" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--shelf-mount-right-head`} data-part="shelf-mount-right-head" cx="258" cy="68" r="2.5" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" />
      <path id={`${idPrefix}--shelf-mount-right-slot`} data-part="shelf-mount-right-slot" d="M256.5 68.875 L259.5 67.125" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--shelf-shelf-grain`} data-part="shelf-shelf-grain" d="M32 12 L223 0 M96 18 L272 6" fill="none" stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" opacity="0.48" />
    </g>
  );
});
