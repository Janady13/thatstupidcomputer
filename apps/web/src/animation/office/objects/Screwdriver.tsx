import { memo } from 'react';
import type { ArtProps } from '../types';

/** Bench screwdriver. Local geometry: placement belongs to RoomObject. */
export const Screwdriver = memo(function Screwdriver({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--screwdriver`} data-part="screwdriver" display={hiddenParts?.includes("screwdriver") ? "none" : undefined} data-art="screwdriver">
      <path id={`${idPrefix}--screwdriver-contact`} data-part="screwdriver-contact" d="M-59 7 L53 4" fill="none" stroke={palette.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
      <path id={`${idPrefix}--screwdriver-shaft`} data-part="screwdriver-shaft" d="M-60 6 L-22 -2 L-9 2 L-58 10 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--screwdriver-tip`} data-part="screwdriver-tip" d="M-60 6 L-67 10 L-58 10 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--screwdriver-collar`} data-part="screwdriver-collar" d="M-22 -2 L-9 -4 L-7 7 L-22 9 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--screwdriver-handle`} data-part="screwdriver-handle" d="M-11 -7 Q9 -12 43 -10 Q55 -7 54 2 Q52 11 39 11 L-9 12 Q-17 9 -17 2 Q-17 -5 -11 -7 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--screwdriver-handle-grooves`} data-part="screwdriver-handle-grooves" d="M-6 -4 L38 -6 M-6 0 L44 -2 M-4 6 L39 5" fill="none" stroke={palette.ink} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    </g>
  );
});
