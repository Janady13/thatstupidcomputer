import { memo } from 'react';
import type { ArtProps } from '../types';

/** Soldering station / lead and iron. Local geometry: placement belongs to RoomObject. */
export const SolderingStation = memo(function SolderingStation({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--soldering-station`} data-part="soldering-station" display={hiddenParts?.includes("soldering-station") ? "none" : undefined} data-art="soldering-station">
      <path id={`${idPrefix}--soldering-station-lead`} data-part="soldering-station-lead" d="M-31 2 C-82 -2 -76 39 -84 61 C-90 97 -99 134 -71 151" fill="none" stroke={palette.ink} strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--soldering-station-base`} data-part="soldering-station-base" d="M-38 -10 L33 -14 L58 -2 L58 10 L-44 11 L-45 1 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--soldering-station-top`} data-part="soldering-station-top" d="M-38 -10 L33 -14 L57 -2 L-45 2 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--soldering-station-cleaning-pad`} data-part="soldering-station-cleaning-pad" d="M3 -8 L32 -10 L43 -4 L12 0 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--soldering-station-iron-handle`} data-part="soldering-station-iron-handle" d="M-10 -34 L28 -70 L37 -64 L2 -25 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--soldering-station-iron-shaft`} data-part="soldering-station-iron-shaft" d="M29 -70 L55 -94 L59 -90 L37 -64 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--soldering-station-iron-tip`} data-part="soldering-station-iron-tip" d="M55 -94 L63 -105 L59 -90 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--soldering-station-coil-support`} data-part="soldering-station-coil-support" d="M-25 -1 L-27 -22 L-9 -48" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse id={`${idPrefix}--soldering-station-coil-loop-1`} data-part="soldering-station-coil-loop-1" cx="-18.0" cy="-19.0" rx="7" ry="4.2" fill="none" stroke={palette.ink} strokeWidth="1.3" transform="rotate(40 -18.0 -19.0)" />
      <ellipse id={`${idPrefix}--soldering-station-coil-loop-2`} data-part="soldering-station-coil-loop-2" cx="-13.7" cy="-24.2" rx="7" ry="4.2" fill="none" stroke={palette.ink} strokeWidth="1.3" transform="rotate(40 -13.7 -24.2)" />
      <ellipse id={`${idPrefix}--soldering-station-coil-loop-3`} data-part="soldering-station-coil-loop-3" cx="-9.4" cy="-29.4" rx="7" ry="4.2" fill="none" stroke={palette.ink} strokeWidth="1.3" transform="rotate(40 -9.4 -29.4)" />
      <ellipse id={`${idPrefix}--soldering-station-coil-loop-4`} data-part="soldering-station-coil-loop-4" cx="-5.100000000000001" cy="-34.6" rx="7" ry="4.2" fill="none" stroke={palette.ink} strokeWidth="1.3" transform="rotate(40 -5.100000000000001 -34.6)" />
      <ellipse id={`${idPrefix}--soldering-station-coil-loop-5`} data-part="soldering-station-coil-loop-5" cx="-0.8000000000000007" cy="-39.8" rx="7" ry="4.2" fill="none" stroke={palette.ink} strokeWidth="1.3" transform="rotate(40 -0.8000000000000007 -39.8)" />
      <path id={`${idPrefix}--soldering-station-coil-foot`} data-part="soldering-station-coil-foot" d="M-35 0 L-20 -4 L-10 0" fill="none" stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
