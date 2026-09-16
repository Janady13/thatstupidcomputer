import { memo } from 'react';
import type { ArtProps } from '../types';

/** Shelf binders / blank spines. Local geometry: placement belongs to RoomObject. */
export const Binders = memo(function Binders({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--binders`} data-part="binders" display={hiddenParts?.includes("binders") ? "none" : undefined} data-art="binders">
      <g id={`${idPrefix}--binders-binder-1`} data-part="binders-binder-1" display={hiddenParts?.includes("binders-binder-1") ? "none" : undefined}>
        <path id={`${idPrefix}--binders-binder-1-spine`} data-part="binders-binder-1-spine" d="M0 8 L26 6 L26 168 L0 171 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect id={`${idPrefix}--binders-binder-1-label`} data-part="binders-binder-1-label" x="5" y="27" width="16" height="45" rx="0" fill={palette.paper} stroke={palette.ink} strokeWidth="0.8" />
        <circle id={`${idPrefix}--binders-binder-1-ring`} data-part="binders-binder-1-ring" cx="13.0" cy="129" r="4.1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <path id={`${idPrefix}--binders-binder-1-foot`} data-part="binders-binder-1-foot" d="M4 157 L23 156" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--binders-binder-2`} data-part="binders-binder-2" display={hiddenParts?.includes("binders-binder-2") ? "none" : undefined}>
        <path id={`${idPrefix}--binders-binder-2-spine`} data-part="binders-binder-2-spine" d="M29 2 L53 0 L53 168 L29 171 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect id={`${idPrefix}--binders-binder-2-label`} data-part="binders-binder-2-label" x="34" y="27" width="14" height="45" rx="0" fill={palette.paper} stroke={palette.ink} strokeWidth="0.8" />
        <circle id={`${idPrefix}--binders-binder-2-ring`} data-part="binders-binder-2-ring" cx="41.0" cy="129" r="4.1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <path id={`${idPrefix}--binders-binder-2-foot`} data-part="binders-binder-2-foot" d="M33 157 L50 156" fill="none" stroke={palette.paper} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--binders-binder-3`} data-part="binders-binder-3" display={hiddenParts?.includes("binders-binder-3") ? "none" : undefined}>
        <path id={`${idPrefix}--binders-binder-3-spine`} data-part="binders-binder-3-spine" d="M58 13 L86 11 L86 168 L58 171 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect id={`${idPrefix}--binders-binder-3-label`} data-part="binders-binder-3-label" x="63" y="27" width="18" height="45" rx="0" fill={palette.paper} stroke={palette.ink} strokeWidth="0.8" />
        <circle id={`${idPrefix}--binders-binder-3-ring`} data-part="binders-binder-3-ring" cx="72.0" cy="129" r="4.1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <path id={`${idPrefix}--binders-binder-3-foot`} data-part="binders-binder-3-foot" d="M62 157 L83 156" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--binders-binder-4`} data-part="binders-binder-4" display={hiddenParts?.includes("binders-binder-4") ? "none" : undefined}>
        <path id={`${idPrefix}--binders-binder-4-spine`} data-part="binders-binder-4-spine" d="M90 5 L113 3 L113 168 L90 171 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect id={`${idPrefix}--binders-binder-4-label`} data-part="binders-binder-4-label" x="95" y="27" width="13" height="45" rx="0" fill={palette.paper} stroke={palette.ink} strokeWidth="0.8" />
        <circle id={`${idPrefix}--binders-binder-4-ring`} data-part="binders-binder-4-ring" cx="101.5" cy="129" r="4.1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <path id={`${idPrefix}--binders-binder-4-foot`} data-part="binders-binder-4-foot" d="M94 157 L110 156" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
});
