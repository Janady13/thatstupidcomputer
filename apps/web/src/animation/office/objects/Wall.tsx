import { memo } from 'react';
import type { ArtProps } from '../types';

/** Wall / uninterrupted backing. Local geometry: placement belongs to RoomObject. */
export const Wall = memo(function Wall({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--wall`} data-part="wall" display={hiddenParts?.includes("wall") ? "none" : undefined} data-art="wall">
      <rect id={`${idPrefix}--wall-paint`} data-part="wall-paint" x="0" y="0" width="1648" height="928" rx="0" fill={palette.paper} stroke="none" strokeWidth="1.5" />
      <path id={`${idPrefix}--wall-left-joint`} data-part="wall-left-joint" d="M397 0 L397 635" fill="none" stroke={palette.ink} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
      <path id={`${idPrefix}--wall-repair-seam`} data-part="wall-repair-seam" d="M477 0 L477 170 M477 208 L477 383" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.18" />
      <path id={`${idPrefix}--wall-plaster-hairlines`} data-part="wall-plaster-hairlines" d="M548 18 l-5 17 7 9 -5 26 M1120 407 l9 -5 6 7" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.16" />
    </g>
  );
});
