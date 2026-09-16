import { memo } from 'react';
import type { ArtProps } from '../types';

/** Foreground document box / removable folders. Local geometry: placement belongs to RoomObject. */
export const FloorBox = memo(function FloorBox({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--floor-box`} data-part="floor-box" display={hiddenParts?.includes("floor-box") ? "none" : undefined} data-art="floor-box">
      <path id={`${idPrefix}--floor-box-contact`} data-part="floor-box-contact" d="M-26 202 Q85 226 207 217 L207 234 L-27 223 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.06" />
      <path id={`${idPrefix}--floor-box-back-panel`} data-part="floor-box-back-panel" d="M-1 -15 L190 -46 L210 122 L-2 147 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-inside`} data-part="floor-box-inside" d="M3 -11 L190 -40 L208 121 L8 145 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-folder-1`} data-part="floor-box-folder-1" d="M36 -4.0 L119 -14.0 L161 26.0 L76 37.0 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-folder-1-crease`} data-part="floor-box-folder-1-crease" d="M45 -2.0 L114 -10.0" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-folder-2`} data-part="floor-box-folder-2" d="M55 -5.8 L138 -15.8 L180 24.2 L95 35.2 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-folder-2-crease`} data-part="floor-box-folder-2-crease" d="M64 -3.8 L133 -11.8" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-folder-3`} data-part="floor-box-folder-3" d="M74 -7.6 L157 -17.6 L199 22.4 L114 33.4 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-folder-3-crease`} data-part="floor-box-folder-3-crease" d="M83 -5.6 L152 -13.6" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-folder-4`} data-part="floor-box-folder-4" d="M93 -9.4 L176 -19.4 L218 20.6 L133 31.6 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-folder-4-crease`} data-part="floor-box-folder-4-crease" d="M102 -7.4 L171 -15.4" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-folder-5`} data-part="floor-box-folder-5" d="M112 -11.2 L195 -21.2 L237 18.8 L152 29.8 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-folder-5-crease`} data-part="floor-box-folder-5-crease" d="M121 -9.2 L190 -17.2" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-left-side`} data-part="floor-box-left-side" d="M-1 -15 L-11 199 L50 237 L51 24 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-front-panel`} data-part="floor-box-front-panel" d="M51 24 L222 -7 L219 213 L50 237 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-front-tint`} data-part="floor-box-front-tint" d="M51 24 L222 -7 L219 213 L50 237 Z" fill={palette.rust} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.17" />
      <path id={`${idPrefix}--floor-box-top-rim`} data-part="floor-box-top-rim" d="M-1 -15 L51 17 L222 -14 L222 -6 L51 26 L-2 -7 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-handhold`} data-part="floor-box-handhold" d="M11 21 L37 35 L36 46 L10 32 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-front-label`} data-part="floor-box-front-label" d="M102 72 L167 60 L167 109 L103 121 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--floor-box-fold-lines`} data-part="floor-box-fold-lines" d="M62 42 L62 219 M210 12 L208 198" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
    </g>
  );
});
