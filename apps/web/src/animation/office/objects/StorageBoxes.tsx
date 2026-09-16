import { memo } from 'react';
import type { ArtProps } from '../types';

/** Stacked parts boxes. Local geometry: placement belongs to RoomObject. */
export const StorageBoxes = memo(function StorageBoxes({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--storage-boxes`} data-part="storage-boxes" display={hiddenParts?.includes("storage-boxes") ? "none" : undefined} data-art="storage-boxes">
      <path id={`${idPrefix}--storage-boxes-lower-body`} data-part="storage-boxes-lower-body" d="M0 -47 L110 -45 L107 3 L0 0 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--storage-boxes-lower-lid`} data-part="storage-boxes-lower-lid" d="M-4 -52 L111 -49 L114 -40 L-5 -42 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--storage-boxes-lower-label-frame`} data-part="storage-boxes-lower-label-frame" d="M40 -33 L73 -32 L73 -16 L40 -17 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--storage-boxes-lower-label`} data-part="storage-boxes-lower-label" d="M45 -29 L68 -28 L68 -20 L45 -21 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--storage-boxes-upper-body`} data-part="storage-boxes-upper-body" d="M9 -94 L108 -95 L111 -48 L7 -50 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--storage-boxes-upper-lid`} data-part="storage-boxes-upper-lid" d="M5 -101 L111 -102 L114 -91 L3 -91 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--storage-boxes-upper-label-frame`} data-part="storage-boxes-upper-label-frame" d="M36 -84 L73 -84 L74 -66 L36 -66 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--storage-boxes-upper-label`} data-part="storage-boxes-upper-label" d="M41 -80 L68 -80 L68 -70 L41 -70 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--storage-boxes-upper-rim`} data-part="storage-boxes-upper-rim" d="M6 -96 L110 -97" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
