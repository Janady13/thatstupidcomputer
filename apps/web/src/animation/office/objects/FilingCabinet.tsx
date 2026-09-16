import { memo } from 'react';
import type { ArtProps } from '../types';

/** Tall filing cabinet / independent drawers. Local geometry: placement belongs to RoomObject. */
export const FilingCabinet = memo(function FilingCabinet({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--filing-cabinet`} data-part="filing-cabinet" display={hiddenParts?.includes("filing-cabinet") ? "none" : undefined} data-art="filing-cabinet">
      <path id={`${idPrefix}--filing-cabinet-shadow`} data-part="filing-cabinet-shadow" d="M-9 14 L170 13 V493 L-13 504 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.08" />
      <path id={`${idPrefix}--filing-cabinet-shell`} data-part="filing-cabinet-shell" d="M0 0 L172 -7 L183 473 L-7 484 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--filing-cabinet-side-bevel`} data-part="filing-cabinet-side-bevel" d="M158 -6 L172 -7 L183 473 L168 476 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
      <path id={`${idPrefix}--filing-cabinet-shell-inset`} data-part="filing-cabinet-shell-inset" d="M6 13 L151 7 L159 458 L0 468 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <g id={`${idPrefix}--filing-cabinet-drawer-1-motion`} data-part="filing-cabinet-drawer-1-motion" display={hiddenParts?.includes("filing-cabinet-drawer-1-motion") ? "none" : undefined} data-motion="cabinet-drawer" data-phase="0">
        <path id={`${idPrefix}--filing-cabinet-drawer-1-front`} data-part="filing-cabinet-drawer-1-front" d="M8 18 L149 13 L152 150 L5 156 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--filing-cabinet-drawer-1-shade`} data-part="filing-cabinet-drawer-1-shade" d="M8 150 L151 144 L152 150 L5 156 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.065" />
        <path id={`${idPrefix}--filing-cabinet-drawer-1-label-frame`} data-part="filing-cabinet-drawer-1-label-frame" d="M54 47 L111 45 L112 82 L53 84 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--filing-cabinet-drawer-1-label-paper`} data-part="filing-cabinet-drawer-1-label-paper" d="M60 53 L105 52 L106 76 L60 77 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--filing-cabinet-drawer-1-handle`} data-part="filing-cabinet-drawer-1-handle" d="M56 108 Q52 110 56 115 L105 113 Q110 109 105 106" fill={palette.paper} stroke={palette.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--filing-cabinet-drawer-1-handle-light`} data-part="filing-cabinet-drawer-1-handle-light" d="M60 110 L101 108" fill="none" stroke={palette.paper} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--filing-cabinet-drawer-2-motion`} data-part="filing-cabinet-drawer-2-motion" display={hiddenParts?.includes("filing-cabinet-drawer-2-motion") ? "none" : undefined} data-motion="cabinet-drawer" data-phase="1">
        <path id={`${idPrefix}--filing-cabinet-drawer-2-front`} data-part="filing-cabinet-drawer-2-front" d="M8 166 L149 161 L152 298 L5 304 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--filing-cabinet-drawer-2-shade`} data-part="filing-cabinet-drawer-2-shade" d="M8 298 L151 292 L152 298 L5 304 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.065" />
        <path id={`${idPrefix}--filing-cabinet-drawer-2-label-frame`} data-part="filing-cabinet-drawer-2-label-frame" d="M54 195 L111 193 L112 230 L53 232 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--filing-cabinet-drawer-2-label-paper`} data-part="filing-cabinet-drawer-2-label-paper" d="M60 201 L105 200 L106 224 L60 225 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--filing-cabinet-drawer-2-handle`} data-part="filing-cabinet-drawer-2-handle" d="M56 256 Q52 258 56 263 L105 261 Q110 257 105 254" fill={palette.paper} stroke={palette.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--filing-cabinet-drawer-2-handle-light`} data-part="filing-cabinet-drawer-2-handle-light" d="M60 258 L101 256" fill="none" stroke={palette.paper} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--filing-cabinet-drawer-3-motion`} data-part="filing-cabinet-drawer-3-motion" display={hiddenParts?.includes("filing-cabinet-drawer-3-motion") ? "none" : undefined} data-motion="cabinet-drawer" data-phase="2">
        <path id={`${idPrefix}--filing-cabinet-drawer-3-front`} data-part="filing-cabinet-drawer-3-front" d="M8 314 L149 309 L152 446 L5 452 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--filing-cabinet-drawer-3-shade`} data-part="filing-cabinet-drawer-3-shade" d="M8 446 L151 440 L152 446 L5 452 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.065" />
        <path id={`${idPrefix}--filing-cabinet-drawer-3-label-frame`} data-part="filing-cabinet-drawer-3-label-frame" d="M54 343 L111 341 L112 378 L53 380 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--filing-cabinet-drawer-3-label-paper`} data-part="filing-cabinet-drawer-3-label-paper" d="M60 349 L105 348 L106 372 L60 373 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--filing-cabinet-drawer-3-handle`} data-part="filing-cabinet-drawer-3-handle" d="M56 404 Q52 406 56 411 L105 409 Q110 405 105 402" fill={palette.paper} stroke={palette.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--filing-cabinet-drawer-3-handle-light`} data-part="filing-cabinet-drawer-3-handle-light" d="M60 406 L101 404" fill="none" stroke={palette.paper} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path id={`${idPrefix}--filing-cabinet-top-trim`} data-part="filing-cabinet-top-trim" d="M3 -2 L154 -8 L173 -7 L172 4 L0 10 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
