import { memo } from 'react';
import type { ArtProps } from '../types';

/** Pencil cup / individual pens. Local geometry: placement belongs to RoomObject. */
export const PencilCup = memo(function PencilCup({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--pencil-cup`} data-part="pencil-cup" display={hiddenParts?.includes("pencil-cup") ? "none" : undefined} data-art="pencil-cup">
      <g id={`${idPrefix}--pencil-cup-pen-1`} data-part="pencil-cup-pen-1" display={hiddenParts?.includes("pencil-cup-pen-1") ? "none" : undefined} transform="rotate(-11 -17 0)">
        <path id={`${idPrefix}--pencil-cup-pen-1-barrel`} data-part="pencil-cup-pen-1-barrel" d="M-19 -3 L-19 -70 Q-17 -77 -14 -70 L-14 -3 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--pencil-cup-pen-1-line`} data-part="pencil-cup-pen-1-line" d="M-17 -67 V-6" fill="none" stroke={palette.ink} strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--pencil-cup-pen-2`} data-part="pencil-cup-pen-2" display={hiddenParts?.includes("pencil-cup-pen-2") ? "none" : undefined} transform="rotate(-5 -6 0)">
        <path id={`${idPrefix}--pencil-cup-pen-2-barrel`} data-part="pencil-cup-pen-2-barrel" d="M-8 -3 L-8 -108 Q-6 -115 -3 -108 L-3 -3 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--pencil-cup-pen-2-line`} data-part="pencil-cup-pen-2-line" d="M-6 -105 V-6" fill="none" stroke={palette.ink} strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--pencil-cup-pen-3`} data-part="pencil-cup-pen-3" display={hiddenParts?.includes("pencil-cup-pen-3") ? "none" : undefined} transform="rotate(4 7 0)">
        <path id={`${idPrefix}--pencil-cup-pen-3-barrel`} data-part="pencil-cup-pen-3-barrel" d="M5 -3 L5 -83 Q7 -90 10 -83 L10 -3 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--pencil-cup-pen-3-line`} data-part="pencil-cup-pen-3-line" d="M7 -80 V-6" fill="none" stroke={palette.ink} strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--pencil-cup-pen-4`} data-part="pencil-cup-pen-4" display={hiddenParts?.includes("pencil-cup-pen-4") ? "none" : undefined} transform="rotate(8 15 0)">
        <path id={`${idPrefix}--pencil-cup-pen-4-barrel`} data-part="pencil-cup-pen-4-barrel" d="M13 -3 L13 -107 Q15 -114 18 -107 L18 -3 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--pencil-cup-pen-4-line`} data-part="pencil-cup-pen-4-line" d="M15 -104 V-6" fill="none" stroke={palette.ink} strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--pencil-cup-pen-5`} data-part="pencil-cup-pen-5" display={hiddenParts?.includes("pencil-cup-pen-5") ? "none" : undefined} transform="rotate(12 22 0)">
        <path id={`${idPrefix}--pencil-cup-pen-5-barrel`} data-part="pencil-cup-pen-5-barrel" d="M20 -3 L20 -86 Q22 -93 25 -86 L25 -3 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--pencil-cup-pen-5-line`} data-part="pencil-cup-pen-5-line" d="M22 -83 V-6" fill="none" stroke={palette.ink} strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path id={`${idPrefix}--pencil-cup-cup-body`} data-part="pencil-cup-cup-body" d="M-24 -56 L24 -54 L25 2 Q0 13 -24 3 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--pencil-cup-cup-tint`} data-part="pencil-cup-cup-tint" d="M9 -55 L24 -54 L25 2 Q20 7 8 8 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
      <ellipse id={`${idPrefix}--pencil-cup-rim`} data-part="pencil-cup-rim" cx="0" cy="-55" rx="24" ry="5.5" fill="none" stroke={palette.ink} strokeWidth="1.3" />
      <path id={`${idPrefix}--pencil-cup-cup-lines`} data-part="pencil-cup-cup-lines" d="M-17 -48 V0 M-12 -47 V2 M-6 -47 V4 M1 -46 V5" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.38" />
    </g>
  );
});
