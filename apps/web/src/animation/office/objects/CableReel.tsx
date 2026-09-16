import { memo } from 'react';
import type { ArtProps } from '../types';

/** Hanging cable / independent coil. Local geometry: placement belongs to RoomObject. */
export const CableReel = memo(function CableReel({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--cable-reel`} data-part="cable-reel" display={hiddenParts?.includes("cable-reel") ? "none" : undefined} data-art="cable-reel">
      <g id={`${idPrefix}--cable-reel-coil-motion`} data-part="cable-reel-coil-motion" display={hiddenParts?.includes("cable-reel-coil-motion") ? "none" : undefined} data-motion="cable-coil" data-pivot="0,0" data-phase="1">
        <path id={`${idPrefix}--cable-reel-loop-1`} data-part="cable-reel-loop-1" d="M-8 0 C-83 -52 -71 91 -73 161 C-82 260 30 191 32 82 C33 10 -7 -16 -14 2" fill="none" stroke={palette.ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--cable-reel-loop-1-edge`} data-part="cable-reel-loop-1-edge" d="M-9 0 C-81 -50 -69 91 -72 161 C-80 253 28 188 30 83" fill="none" stroke={palette.paper} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        <path id={`${idPrefix}--cable-reel-loop-2`} data-part="cable-reel-loop-2" d="M0 0 C-75 -52 -63 91 -65 161 C-74 260 38 191 40 82 C41 10 1 -16 -6 2" fill="none" stroke={palette.ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--cable-reel-loop-2-edge`} data-part="cable-reel-loop-2-edge" d="M-1 0 C-73 -50 -61 91 -64 161 C-72 253 36 188 38 83" fill="none" stroke={palette.paper} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        <path id={`${idPrefix}--cable-reel-loop-3`} data-part="cable-reel-loop-3" d="M8 0 C-67 -52 -55 91 -57 161 C-66 260 46 191 48 82 C49 10 9 -16 2 2" fill="none" stroke={palette.ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--cable-reel-loop-3-edge`} data-part="cable-reel-loop-3-edge" d="M7 0 C-65 -50 -53 91 -56 161 C-64 253 44 188 46 83" fill="none" stroke={palette.paper} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        <path id={`${idPrefix}--cable-reel-loop-4`} data-part="cable-reel-loop-4" d="M16 0 C-59 -52 -47 91 -49 161 C-58 260 54 191 56 82 C57 10 17 -16 10 2" fill="none" stroke={palette.ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--cable-reel-loop-4-edge`} data-part="cable-reel-loop-4-edge" d="M15 0 C-57 -50 -45 91 -48 161 C-56 253 52 188 54 83" fill="none" stroke={palette.paper} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        <path id={`${idPrefix}--cable-reel-loop-5`} data-part="cable-reel-loop-5" d="M24 0 C-51 -52 -39 91 -41 161 C-50 260 62 191 64 82 C65 10 25 -16 18 2" fill="none" stroke={palette.ink} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--cable-reel-loop-5-edge`} data-part="cable-reel-loop-5-edge" d="M23 0 C-49 -50 -37 91 -40 161 C-48 253 60 188 62 83" fill="none" stroke={palette.paper} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
        <path id={`${idPrefix}--cable-reel-tie`} data-part="cable-reel-tie" d="M-13 -3 L26 -9 L28 2 L-14 9 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--cable-reel-tail`} data-part="cable-reel-tail" d="M-15 174 C-36 207 -36 249 -52 268" fill="none" stroke={palette.ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--cable-reel-tail-plug`} data-part="cable-reel-tail-plug" d="M-57 264 L-48 266 L-50 283 L-59 279 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
});
