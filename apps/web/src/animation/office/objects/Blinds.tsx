import { memo } from 'react';
import type { ArtProps } from '../types';

/** Venetian blinds / separate slats. Local geometry: placement belongs to RoomObject. */
export const Blinds = memo(function Blinds({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--blinds`} data-part="blinds" display={hiddenParts?.includes("blinds") ? "none" : undefined} data-art="blinds">
      <g id={`${idPrefix}--blinds-slat-bank`} data-part="blinds-slat-bank" display={hiddenParts?.includes("blinds-slat-bank") ? "none" : undefined}>
        <g id={`${idPrefix}--blinds-slat-01-motion`} data-part="blinds-slat-01-motion" display={hiddenParts?.includes("blinds-slat-01-motion") ? "none" : undefined} data-motion="blind" data-pivot="0,-15" data-phase="0.0">
          <path id={`${idPrefix}--blinds-slat-01-face`} data-part="blinds-slat-01-face" d="M0 -20 L315 8 L315 17 L0 -11 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          <path id={`${idPrefix}--blinds-slat-01-ridge`} data-part="blinds-slat-01-ridge" d="M2 -18 L314 10" fill="none" stroke={palette.rust} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          <path id={`${idPrefix}--blinds-slat-01-underside`} data-part="blinds-slat-01-underside" d="M0 -12 L315 16 L315 19 L0 -9 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
        </g>
        <g id={`${idPrefix}--blinds-slat-02-motion`} data-part="blinds-slat-02-motion" display={hiddenParts?.includes("blinds-slat-02-motion") ? "none" : undefined} data-motion="blind" data-pivot="0,3" data-phase="0.07">
          <path id={`${idPrefix}--blinds-slat-02-face`} data-part="blinds-slat-02-face" d="M0 -2 L315 26 L315 35 L0 7 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          <path id={`${idPrefix}--blinds-slat-02-ridge`} data-part="blinds-slat-02-ridge" d="M2 0 L314 28" fill="none" stroke={palette.rust} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          <path id={`${idPrefix}--blinds-slat-02-underside`} data-part="blinds-slat-02-underside" d="M0 6 L315 34 L315 37 L0 9 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
        </g>
        <g id={`${idPrefix}--blinds-slat-03-motion`} data-part="blinds-slat-03-motion" display={hiddenParts?.includes("blinds-slat-03-motion") ? "none" : undefined} data-motion="blind" data-pivot="0,21" data-phase="0.14">
          <path id={`${idPrefix}--blinds-slat-03-face`} data-part="blinds-slat-03-face" d="M0 16 L315 44 L315 53 L0 25 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          <path id={`${idPrefix}--blinds-slat-03-ridge`} data-part="blinds-slat-03-ridge" d="M2 18 L314 46" fill="none" stroke={palette.rust} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          <path id={`${idPrefix}--blinds-slat-03-underside`} data-part="blinds-slat-03-underside" d="M0 24 L315 52 L315 55 L0 27 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
        </g>
        <g id={`${idPrefix}--blinds-slat-04-motion`} data-part="blinds-slat-04-motion" display={hiddenParts?.includes("blinds-slat-04-motion") ? "none" : undefined} data-motion="blind" data-pivot="0,39" data-phase="0.21000000000000002">
          <path id={`${idPrefix}--blinds-slat-04-face`} data-part="blinds-slat-04-face" d="M0 34 L315 62 L315 71 L0 43 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          <path id={`${idPrefix}--blinds-slat-04-ridge`} data-part="blinds-slat-04-ridge" d="M2 36 L314 64" fill="none" stroke={palette.rust} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          <path id={`${idPrefix}--blinds-slat-04-underside`} data-part="blinds-slat-04-underside" d="M0 42 L315 70 L315 73 L0 45 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
        </g>
        <g id={`${idPrefix}--blinds-slat-05-motion`} data-part="blinds-slat-05-motion" display={hiddenParts?.includes("blinds-slat-05-motion") ? "none" : undefined} data-motion="blind" data-pivot="0,57" data-phase="0.28">
          <path id={`${idPrefix}--blinds-slat-05-face`} data-part="blinds-slat-05-face" d="M0 52 L315 80 L315 89 L0 61 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          <path id={`${idPrefix}--blinds-slat-05-ridge`} data-part="blinds-slat-05-ridge" d="M2 54 L314 82" fill="none" stroke={palette.rust} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          <path id={`${idPrefix}--blinds-slat-05-underside`} data-part="blinds-slat-05-underside" d="M0 60 L315 88 L315 91 L0 63 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
        </g>
        <g id={`${idPrefix}--blinds-slat-06-motion`} data-part="blinds-slat-06-motion" display={hiddenParts?.includes("blinds-slat-06-motion") ? "none" : undefined} data-motion="blind" data-pivot="0,75" data-phase="0.35000000000000003">
          <path id={`${idPrefix}--blinds-slat-06-face`} data-part="blinds-slat-06-face" d="M0 70 L315 98 L315 107 L0 79 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          <path id={`${idPrefix}--blinds-slat-06-ridge`} data-part="blinds-slat-06-ridge" d="M2 72 L314 100" fill="none" stroke={palette.rust} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          <path id={`${idPrefix}--blinds-slat-06-underside`} data-part="blinds-slat-06-underside" d="M0 78 L315 106 L315 109 L0 81 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
        </g>
        <g id={`${idPrefix}--blinds-slat-07-motion`} data-part="blinds-slat-07-motion" display={hiddenParts?.includes("blinds-slat-07-motion") ? "none" : undefined} data-motion="blind" data-pivot="0,93" data-phase="0.42000000000000004">
          <path id={`${idPrefix}--blinds-slat-07-face`} data-part="blinds-slat-07-face" d="M0 88 L315 116 L315 125 L0 97 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          <path id={`${idPrefix}--blinds-slat-07-ridge`} data-part="blinds-slat-07-ridge" d="M2 90 L314 118" fill="none" stroke={palette.rust} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          <path id={`${idPrefix}--blinds-slat-07-underside`} data-part="blinds-slat-07-underside" d="M0 96 L315 124 L315 127 L0 99 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
        </g>
        <g id={`${idPrefix}--blinds-slat-08-motion`} data-part="blinds-slat-08-motion" display={hiddenParts?.includes("blinds-slat-08-motion") ? "none" : undefined} data-motion="blind" data-pivot="0,111" data-phase="0.49000000000000005">
          <path id={`${idPrefix}--blinds-slat-08-face`} data-part="blinds-slat-08-face" d="M0 106 L315 134 L315 143 L0 115 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          <path id={`${idPrefix}--blinds-slat-08-ridge`} data-part="blinds-slat-08-ridge" d="M2 108 L314 136" fill="none" stroke={palette.rust} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          <path id={`${idPrefix}--blinds-slat-08-underside`} data-part="blinds-slat-08-underside" d="M0 114 L315 142 L315 145 L0 117 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
        </g>
        <g id={`${idPrefix}--blinds-slat-09-motion`} data-part="blinds-slat-09-motion" display={hiddenParts?.includes("blinds-slat-09-motion") ? "none" : undefined} data-motion="blind" data-pivot="0,129" data-phase="0.56">
          <path id={`${idPrefix}--blinds-slat-09-face`} data-part="blinds-slat-09-face" d="M0 124 L315 152 L315 161 L0 133 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          <path id={`${idPrefix}--blinds-slat-09-ridge`} data-part="blinds-slat-09-ridge" d="M2 126 L314 154" fill="none" stroke={palette.rust} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          <path id={`${idPrefix}--blinds-slat-09-underside`} data-part="blinds-slat-09-underside" d="M0 132 L315 160 L315 163 L0 135 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
        </g>
        <g id={`${idPrefix}--blinds-slat-10-motion`} data-part="blinds-slat-10-motion" display={hiddenParts?.includes("blinds-slat-10-motion") ? "none" : undefined} data-motion="blind" data-pivot="0,147" data-phase="0.6300000000000001">
          <path id={`${idPrefix}--blinds-slat-10-face`} data-part="blinds-slat-10-face" d="M0 142 L315 170 L315 179 L0 151 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          <path id={`${idPrefix}--blinds-slat-10-ridge`} data-part="blinds-slat-10-ridge" d="M2 144 L314 172" fill="none" stroke={palette.rust} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          <path id={`${idPrefix}--blinds-slat-10-underside`} data-part="blinds-slat-10-underside" d="M0 150 L315 178 L315 181 L0 153 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
        </g>
        <g id={`${idPrefix}--blinds-slat-11-motion`} data-part="blinds-slat-11-motion" display={hiddenParts?.includes("blinds-slat-11-motion") ? "none" : undefined} data-motion="blind" data-pivot="0,165" data-phase="0.7000000000000001">
          <path id={`${idPrefix}--blinds-slat-11-face`} data-part="blinds-slat-11-face" d="M0 160 L315 188 L315 197 L0 169 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
          <path id={`${idPrefix}--blinds-slat-11-ridge`} data-part="blinds-slat-11-ridge" d="M2 162 L314 190" fill="none" stroke={palette.rust} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
          <path id={`${idPrefix}--blinds-slat-11-underside`} data-part="blinds-slat-11-underside" d="M0 168 L315 196 L315 199 L0 171 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.22" />
        </g>
      </g>
      <path id={`${idPrefix}--blinds-ladder-left`} data-part="blinds-ladder-left" d="M39 -6 L40 193 M44 -6 L45 194" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--blinds-ladder-right`} data-part="blinds-ladder-right" d="M285 -6 L287 215 M291 -6 L293 216" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <g id={`${idPrefix}--blinds-pull-cord-motion`} data-part="blinds-pull-cord-motion" display={hiddenParts?.includes("blinds-pull-cord-motion") ? "none" : undefined} data-motion="cord" data-pivot="21,26" data-phase="0.3">
        <path id={`${idPrefix}--blinds-pull-cord`} data-part="blinds-pull-cord" d="M20 20 L23 183 Q29 197 22 213 L25 246" fill="none" stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--blinds-toggle`} data-part="blinds-toggle" d="M20 243 Q19 240 25 240 Q30 240 29 244 L31 269 Q26 277 21 270 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--blinds-toggle-groove`} data-part="blinds-toggle-groove" d="M24 245 L25 268" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
});
