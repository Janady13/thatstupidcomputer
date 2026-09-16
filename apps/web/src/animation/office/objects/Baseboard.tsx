import { memo } from 'react';
import type { ArtProps } from '../types';

/** Baseboard. Local geometry: placement belongs to RoomObject. */
export const Baseboard = memo(function Baseboard({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--baseboard`} data-part="baseboard" display={hiddenParts?.includes("baseboard") ? "none" : undefined} data-art="baseboard">
      <path id={`${idPrefix}--baseboard-profile`} data-part="baseboard-profile" d="M0 0 H1648 V41 H0 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <rect id={`${idPrefix}--baseboard-recess`} data-part="baseboard-recess" x="0" y="6" width="1648" height="32" rx="0" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.09" />
      <path id={`${idPrefix}--baseboard-top-highlight`} data-part="baseboard-top-highlight" d="M0 4 L1648 4" fill="none" stroke={palette.paper} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--baseboard-bottom-crease`} data-part="baseboard-bottom-crease" d="M0 40 L1648 40" fill="none" stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
