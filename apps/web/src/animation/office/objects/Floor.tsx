import { memo } from 'react';
import type { ArtProps } from '../types';

/** Floor / complete surface. Local geometry: placement belongs to RoomObject. */
export const Floor = memo(function Floor({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--floor`} data-part="floor" display={hiddenParts?.includes("floor") ? "none" : undefined} data-art="floor">
      <rect id={`${idPrefix}--floor-base`} data-part="floor-base" x="0" y="0" width="1648" height="262" rx="0" fill={palette.paper} stroke="none" strokeWidth="1.5" />
      <path id={`${idPrefix}--floor-rear-tone`} data-part="floor-rear-tone" d="M0 0 H1648 V54 C1190 22 940 35 714 43 S201 87 0 46 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.035" />
      <path id={`${idPrefix}--floor-seam-left`} data-part="floor-seam-left" d="M512 0 L340 262" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.13" />
      <path id={`${idPrefix}--floor-seam-right`} data-part="floor-seam-right" d="M1200 0 L1355 262" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.1" />
      <path id={`${idPrefix}--floor-seam-cross`} data-part="floor-seam-cross" d="M0 213 Q780 180 1648 233" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.09" />
    </g>
  );
});
