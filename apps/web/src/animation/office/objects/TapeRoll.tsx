import { memo } from 'react';
import type { ArtProps } from '../types';

/** Tape roll. Local geometry: placement belongs to RoomObject. */
export const TapeRoll = memo(function TapeRoll({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--tape-roll`} data-part="tape-roll" display={hiddenParts?.includes("tape-roll") ? "none" : undefined} data-art="tape-roll">
      <path id={`${idPrefix}--tape-roll-body`} data-part="tape-roll-body" d="M-20 -14 L-20 0 Q-1 9 21 1 L21 -13 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse id={`${idPrefix}--tape-roll-top`} data-part="tape-roll-top" cx="0" cy="-14" rx="21" ry="7" fill={palette.paper} stroke={palette.ink} strokeWidth="1.3" />
      <ellipse id={`${idPrefix}--tape-roll-core`} data-part="tape-roll-core" cx="0" cy="-14" rx="12" ry="4" fill={palette.ink} stroke={palette.ink} strokeWidth="0.75" />
      <path id={`${idPrefix}--tape-roll-tail`} data-part="tape-roll-tail" d="M20 -12 L24 4 L35 5" fill="none" stroke={palette.ink} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
