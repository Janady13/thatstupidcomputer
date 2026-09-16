import { memo } from 'react';
import type { ArtProps } from '../types';

/** Loose screws and nuts. Local geometry: placement belongs to RoomObject. */
export const LooseHardware = memo(function LooseHardware({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--loose-hardware`} data-part="loose-hardware" display={hiddenParts?.includes("loose-hardware") ? "none" : undefined} data-art="loose-hardware">
      <g id={`${idPrefix}--loose-hardware-fastener-1`} data-part="loose-hardware-fastener-1" display={hiddenParts?.includes("loose-hardware-fastener-1") ? "none" : undefined} transform="rotate(18 -25 4)">
        <path id={`${idPrefix}--loose-hardware-fastener-1-shank`} data-part="loose-hardware-fastener-1-shank" d="M-26 4 l2 -6 3 1 -1 6 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse id={`${idPrefix}--loose-hardware-fastener-1-head`} data-part="loose-hardware-fastener-1-head" cx="-25" cy="4" rx="5" ry="2.5" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <path id={`${idPrefix}--loose-hardware-fastener-1-slot`} data-part="loose-hardware-fastener-1-slot" d="M-27 4 L-23 4" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--loose-hardware-fastener-2`} data-part="loose-hardware-fastener-2" display={hiddenParts?.includes("loose-hardware-fastener-2") ? "none" : undefined} transform="rotate(-14 -3 -1)">
        <path id={`${idPrefix}--loose-hardware-fastener-2-shank`} data-part="loose-hardware-fastener-2-shank" d="M-4 -1 l2 -6 3 1 -1 6 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse id={`${idPrefix}--loose-hardware-fastener-2-head`} data-part="loose-hardware-fastener-2-head" cx="-3" cy="-1" rx="5" ry="2.5" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <path id={`${idPrefix}--loose-hardware-fastener-2-slot`} data-part="loose-hardware-fastener-2-slot" d="M-5 -1 L-1 -1" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--loose-hardware-fastener-3`} data-part="loose-hardware-fastener-3" display={hiddenParts?.includes("loose-hardware-fastener-3") ? "none" : undefined} transform="rotate(24 18 1)">
        <path id={`${idPrefix}--loose-hardware-fastener-3-shank`} data-part="loose-hardware-fastener-3-shank" d="M17 1 l2 -6 3 1 -1 6 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse id={`${idPrefix}--loose-hardware-fastener-3-head`} data-part="loose-hardware-fastener-3-head" cx="18" cy="1" rx="5" ry="2.5" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <path id={`${idPrefix}--loose-hardware-fastener-3-slot`} data-part="loose-hardware-fastener-3-slot" d="M16 1 L20 1" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--loose-hardware-fastener-4`} data-part="loose-hardware-fastener-4" display={hiddenParts?.includes("loose-hardware-fastener-4") ? "none" : undefined} transform="rotate(-21 36 -3)">
        <path id={`${idPrefix}--loose-hardware-fastener-4-shank`} data-part="loose-hardware-fastener-4-shank" d="M35 -3 l2 -6 3 1 -1 6 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <ellipse id={`${idPrefix}--loose-hardware-fastener-4-head`} data-part="loose-hardware-fastener-4-head" cx="36" cy="-3" rx="5" ry="2.5" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <path id={`${idPrefix}--loose-hardware-fastener-4-slot`} data-part="loose-hardware-fastener-4-slot" d="M34 -3 L38 -3" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path id={`${idPrefix}--loose-hardware-washer`} data-part="loose-hardware-washer" d="M1 6 a5 2.5 0 1 0 10 0 a5 2.5 0 1 0 -10 0 M4 6 a2 1 0 1 1 4 0 a2 1 0 1 1 -4 0" fill={palette.paper} stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" fillRule="evenodd" />
    </g>
  );
});
