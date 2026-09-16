import { memo } from 'react';
import type { ArtProps } from '../types';

/** Wall outlet and plugged lead. Local geometry: placement belongs to RoomObject. */
export const Outlet = memo(function Outlet({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--outlet`} data-part="outlet" display={hiddenParts?.includes("outlet") ? "none" : undefined} data-art="outlet">
      <rect id={`${idPrefix}--outlet-plate`} data-part="outlet-plate" x="0" y="0" width="31" height="70" rx="2" fill={palette.paper} stroke={palette.ink} strokeWidth="1.8" />
      <ellipse id={`${idPrefix}--outlet-socket`} data-part="outlet-socket" cx="16" cy="29" rx="9" ry="16" fill={palette.paper} stroke={palette.ink} strokeWidth="1.1" />
      <path id={`${idPrefix}--outlet-plug`} data-part="outlet-plug" d="M9 25 Q18 20 25 28 L24 43 Q15 51 8 44 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--outlet-lead`} data-part="outlet-lead" d="M19 43 C31 84 -16 96 -8 150 S-30 264 9 271 C30 275 35 250 31 226" fill="none" stroke={palette.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--outlet-top-screw-head`} data-part="outlet-top-screw-head" cx="16" cy="9" r="1.8" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" />
      <path id={`${idPrefix}--outlet-top-screw-slot`} data-part="outlet-top-screw-slot" d="M14.92 9.63 L17.08 8.37" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--outlet-bottom-screw-head`} data-part="outlet-bottom-screw-head" cx="16" cy="60" r="1.8" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" />
      <path id={`${idPrefix}--outlet-bottom-screw-slot`} data-part="outlet-bottom-screw-slot" d="M14.92 60.63 L17.08 59.37" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
