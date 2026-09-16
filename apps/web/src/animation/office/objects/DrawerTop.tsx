import { memo } from 'react';
import type { ArtProps } from '../types';

/** Desk drawer / upper. Local geometry: placement belongs to RoomObject. */
export const DrawerTop = memo(function DrawerTop({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--drawer-top`} data-part="drawer-top" display={hiddenParts?.includes("drawer-top") ? "none" : undefined} data-art="drawer-top">
      <g id={`${idPrefix}--drawer-top-slide-motion`} data-part="drawer-top-slide-motion" display={hiddenParts?.includes("drawer-top-slide-motion") ? "none" : undefined} data-motion="drawer-top" data-pivot="0,0">
        <path id={`${idPrefix}--drawer-top-box-interior`} data-part="drawer-top-box-interior" d="M0 0 L225 0 L224 60 L-2 63 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--drawer-top-drawer-front`} data-part="drawer-top-drawer-front" d="M-1 0 L225 1 L222 76 L-2 70 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--drawer-top-face-bevel`} data-part="drawer-top-face-bevel" d="M5 6 L218 7 L216 69 L5 65 Z" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
        <path id={`${idPrefix}--drawer-top-label-frame`} data-part="drawer-top-label-frame" d="M83 23 L139 24 L139 49 L83 48 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--drawer-top-label-paper`} data-part="drawer-top-label-paper" d="M88 27 L134 28 L134 44 L88 43 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--drawer-top-handle`} data-part="drawer-top-handle" d="M92 51 L132 52" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
});
