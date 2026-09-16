import { memo } from 'react';
import type { ArtProps } from '../types';

/** Workbench / complete tabletop and legs. Local geometry: placement belongs to RoomObject. */
export const Workbench = memo(function Workbench({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--workbench`} data-part="workbench" display={hiddenParts?.includes("workbench") ? "none" : undefined} data-art="workbench">
      <path id={`${idPrefix}--workbench-rear-contact`} data-part="workbench-rear-contact" d="M24 62 L1139 44 L1109 104 L41 119 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.08" />
      <path id={`${idPrefix}--workbench-left-back-leg`} data-part="workbench-left-back-leg" d="M112 83 L139 83 L158 250 L139 259 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--workbench-back-stretcher`} data-part="workbench-back-stretcher" d="M136 211 L849 211 V229 L137 229 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--workbench-right-back-leg`} data-part="workbench-right-back-leg" d="M842 69 L866 69 L866 263 L844 264 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--workbench-left-front-leg`} data-part="workbench-left-front-leg" d="M32 80 L60 81 L53 304 L34 305 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--workbench-left-leg-shade`} data-part="workbench-left-leg-shade" d="M49 82 L61 81 L53 304 L46 299 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" />
      <path id={`${idPrefix}--workbench-right-front-leg`} data-part="workbench-right-front-leg" d="M1105 76 L1149 73 L1130 353 L1113 355 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--workbench-right-leg-shade`} data-part="workbench-right-leg-shade" d="M1137 83 L1148 80 L1130 353 L1123 351 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.16" />
      <path id={`${idPrefix}--workbench-apron`} data-part="workbench-apron" d="M29 88 L1145 84 L1143 115 L28 119 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--workbench-apron-bottom`} data-part="workbench-apron-bottom" d="M32 112 L1143 110 L1143 115 L28 119 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.1" />
      <path id={`${idPrefix}--workbench-tabletop`} data-part="workbench-tabletop" d="M0 63 L115 -2 L1212 8 L1153 80 L0 88 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--workbench-rear-bevel`} data-part="workbench-rear-bevel" d="M115 -2 L1212 8 L1206 13 L118 4 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.1" />
      <path id={`${idPrefix}--workbench-front-edge`} data-part="workbench-front-edge" d="M0 77 L1156 80 L1154 99 L0 91 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--workbench-right-edge`} data-part="workbench-right-edge" d="M1156 80 L1212 8 L1211 24 L1154 99 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--workbench-front-edge-shade`} data-part="workbench-front-edge-shade" d="M0 86 L1155 93 L1154 99 L0 91 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.13" />
      <path id={`${idPrefix}--workbench-edge-wood-lines`} data-part="workbench-edge-wood-lines" d="M7 83 L291 86 M301 86 L732 89 M762 89 L1147 93 M103 88 L782 92" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.56" />
      <path id={`${idPrefix}--workbench-desk-grain-long`} data-part="workbench-desk-grain-long" d="M116 24 C249 15 301 26 437 21 M479 23 Q656 20 779 25 M827 24 L1094 25 M98 42 Q141 38 185 41 M513 60 L899 60 M30 66 L171 66 M994 62 Q1051 55 1128 60 M1061 49 L1146 50" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
      <path id={`${idPrefix}--workbench-desk-knots`} data-part="workbench-desk-knots" d="M270 45 q14 -7 31 0 q-14 7 -31 0 M275 45 q10 -3 18 0 M757 41 q11 -5 24 1 q-9 5 -24 -1" fill="none" stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      <circle id={`${idPrefix}--workbench-top-fixing-1-head`} data-part="workbench-top-fixing-1-head" cx="61" cy="60" r="2" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" />
      <path id={`${idPrefix}--workbench-top-fixing-1-slot`} data-part="workbench-top-fixing-1-slot" d="M59.8 60.7 L62.2 59.3" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--workbench-top-fixing-2-head`} data-part="workbench-top-fixing-2-head" cx="1158" cy="38" r="2" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" />
      <path id={`${idPrefix}--workbench-top-fixing-2-slot`} data-part="workbench-top-fixing-2-slot" d="M1156.8 38.7 L1159.2 37.3" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--workbench-top-fixing-3-head`} data-part="workbench-top-fixing-3-head" cx="1099" cy="70" r="2" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" />
      <path id={`${idPrefix}--workbench-top-fixing-3-slot`} data-part="workbench-top-fixing-3-slot" d="M1097.8 70.7 L1100.2 69.3" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--workbench-top-fixing-4-head`} data-part="workbench-top-fixing-4-head" cx="111" cy="13" r="2" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" />
      <path id={`${idPrefix}--workbench-top-fixing-4-slot`} data-part="workbench-top-fixing-4-slot" d="M109.8 13.7 L112.2 12.3" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--workbench-foot-contact`} data-part="workbench-foot-contact" d="M24 307 L74 305 M1108 357 L1141 353" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.18" />
    </g>
  );
});
