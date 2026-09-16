import { memo } from 'react';
import type { ArtProps } from '../types';

/** Desk drawer / lower + contents. Local geometry: placement belongs to RoomObject. */
export const DrawerBottom = memo(function DrawerBottom({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--drawer-bottom`} data-part="drawer-bottom" display={hiddenParts?.includes("drawer-bottom") ? "none" : undefined} data-art="drawer-bottom">
      <g id={`${idPrefix}--drawer-bottom-slide-motion`} data-part="drawer-bottom-slide-motion" display={hiddenParts?.includes("drawer-bottom-slide-motion") ? "none" : undefined} data-motion="drawer-bottom" data-pivot="0,0">
        <path id={`${idPrefix}--drawer-bottom-open-box`} data-part="drawer-bottom-open-box" d="M6 -6 L217 3 L234 26 L-14 11 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--drawer-bottom-folder-one`} data-part="drawer-bottom-folder-one" d="M14 -4 L66 -1 L69 -7 L194 0 L198 14 L11 7 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--drawer-bottom-folder-two`} data-part="drawer-bottom-folder-two" d="M24 1 L95 4 L98 -2 L207 4 L210 15 L22 11 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--drawer-bottom-folder-three`} data-part="drawer-bottom-folder-three" d="M11 3 L171 9 L179 5 L211 9 L213 20 L12 12 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--drawer-bottom-drawer-left-side`} data-part="drawer-bottom-drawer-left-side" d="M6 -6 L-14 11 L-14 128 L7 112 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--drawer-bottom-drawer-front`} data-part="drawer-bottom-drawer-front" d="M-14 11 L234 28 L231 141 L-14 128 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--drawer-bottom-front-inset`} data-part="drawer-bottom-front-inset" d="M-6 20 L225 36 L223 133 L-6 121 Z" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        <path id={`${idPrefix}--drawer-bottom-label-frame`} data-part="drawer-bottom-label-frame" d="M78 39 L135 43 L135 69 L78 65 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--drawer-bottom-label-paper`} data-part="drawer-bottom-label-paper" d="M83 43 L130 47 L130 64 L83 60 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--drawer-bottom-handle`} data-part="drawer-bottom-handle" d="M88 72 L131 75" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
});
