import { memo } from 'react';
import type { ArtProps } from '../types';

/** Loose desk drawing / curled corner. Local geometry: placement belongs to RoomObject. */
export const DeskPaper = memo(function DeskPaper({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--desk-paper`} data-part="desk-paper" display={hiddenParts?.includes("desk-paper") ? "none" : undefined} data-art="desk-paper">
      <g id={`${idPrefix}--desk-paper-paper-motion`} data-part="desk-paper-paper-motion" display={hiddenParts?.includes("desk-paper-paper-motion") ? "none" : undefined} data-motion="desk-paper" data-pivot="10,0" data-phase="1.4">
        <path id={`${idPrefix}--desk-paper-paper-shadow`} data-part="desk-paper-paper-shadow" d="M-14 5 L120 -8 L158 24 L12 39 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.13" />
        <path id={`${idPrefix}--desk-paper-paper`} data-part="desk-paper-paper" d="M-20 -1 L112 -11 L153 24 L7 33 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--desk-paper-paper-curl`} data-part="desk-paper-paper-curl" d="M123 26 Q135 19 134 9 L153 24 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--desk-paper-drawing-frame`} data-part="desk-paper-drawing-frame" d="M-3 2 L105 -6 L133 18 L17 25 Z" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <path id={`${idPrefix}--desk-paper-drawing-plan`} data-part="desk-paper-drawing-plan" d="M15 5 l59 -4 23 16 -62 4 Z M43 3 l12 9 30 -2 M56 12 l-6 9 M22 11 l25 -2 M83 7 l-3 5" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <path id={`${idPrefix}--desk-paper-drawing-dimensions`} data-part="desk-paper-drawing-dimensions" d="M11 4 l-6 5 20 15 M94 -2 l24 20 M6 12 l5 -1 M17 21 l8 -1" fill="none" stroke={palette.ink} strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </g>
    </g>
  );
});
