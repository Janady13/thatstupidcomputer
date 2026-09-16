import { memo } from 'react';
import type { ArtProps } from '../types';

/** Bench test meter / needle. Local geometry: placement belongs to RoomObject. */
export const TestMeter = memo(function TestMeter({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--test-meter`} data-part="test-meter" display={hiddenParts?.includes("test-meter") ? "none" : undefined} data-art="test-meter">
      <path id={`${idPrefix}--test-meter-meter-shell`} data-part="test-meter-meter-shell" d="M-16 -2 L95 -8 Q108 -7 111 4 L113 69 L-14 79 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--test-meter-side`} data-part="test-meter-side" d="M95 -8 L111 -3 L116 68 L104 72 L104 5 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.1" />
      <path id={`${idPrefix}--test-meter-screen-frame`} data-part="test-meter-screen-frame" d="M12 8 L54 5 L55 38 L13 41 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--test-meter-screen-glass`} data-part="test-meter-screen-glass" d="M17 13 L49 11 L50 33 L17 36 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--test-meter-meter-arc`} data-part="test-meter-meter-arc" d="M21 29 Q30 13 45 27" fill="none" stroke={palette.ink} strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
      <g id={`${idPrefix}--test-meter-needle-motion`} data-part="test-meter-needle-motion" display={hiddenParts?.includes("test-meter-needle-motion") ? "none" : undefined} data-motion="meter-needle" data-pivot="34,32" data-phase="0.9">
        <path id={`${idPrefix}--test-meter-needle`} data-part="test-meter-needle" d="M34 32 L29 19" fill="none" stroke={palette.rust} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <circle id={`${idPrefix}--test-meter-dial-1`} data-part="test-meter-dial-1" cx="22" cy="57" r="9" fill={palette.paper} stroke={palette.ink} strokeWidth="1.4" />
      <circle id={`${idPrefix}--test-meter-dial-1-center`} data-part="test-meter-dial-1-center" cx="22" cy="57" r="5" fill={palette.ink} stroke={palette.ink} strokeWidth="0.7" />
      <path id={`${idPrefix}--test-meter-dial-1-mark`} data-part="test-meter-dial-1-mark" d="M22 52 L22 56" fill="none" stroke={palette.paper} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--test-meter-dial-2`} data-part="test-meter-dial-2" cx="63" cy="58" r="9" fill={palette.paper} stroke={palette.ink} strokeWidth="1.4" />
      <circle id={`${idPrefix}--test-meter-dial-2-center`} data-part="test-meter-dial-2-center" cx="63" cy="58" r="5" fill={palette.ink} stroke={palette.ink} strokeWidth="0.7" />
      <path id={`${idPrefix}--test-meter-dial-2-mark`} data-part="test-meter-dial-2-mark" d="M63 53 L63 57" fill="none" stroke={palette.paper} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--test-meter-dial-3`} data-part="test-meter-dial-3" cx="91" cy="57" r="9" fill={palette.paper} stroke={palette.ink} strokeWidth="1.4" />
      <circle id={`${idPrefix}--test-meter-dial-3-center`} data-part="test-meter-dial-3-center" cx="91" cy="57" r="5" fill={palette.ink} stroke={palette.ink} strokeWidth="0.7" />
      <path id={`${idPrefix}--test-meter-dial-3-mark`} data-part="test-meter-dial-3-mark" d="M91 52 L91 56" fill="none" stroke={palette.paper} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <rect id={`${idPrefix}--test-meter-upper-switch`} data-part="test-meter-upper-switch" x="66" y="10" width="26" height="11" rx="1" fill={palette.ink} stroke={palette.ink} strokeWidth="0.8" />
      <g id={`${idPrefix}--test-meter-status-led-motion`} data-part="test-meter-status-led-motion" display={hiddenParts?.includes("test-meter-status-led-motion") ? "none" : undefined} data-motion="led">
        <circle id={`${idPrefix}--test-meter-status-led`} data-part="test-meter-status-led" cx="75" cy="29" r="3" fill={palette.rust} stroke={palette.ink} strokeWidth="0.8" />
      </g>
      <circle id={`${idPrefix}--test-meter-socket-left`} data-part="test-meter-socket-left" cx="-2" cy="50" r="3" fill={palette.ink} stroke={palette.ink} strokeWidth="0.7" />
      <circle id={`${idPrefix}--test-meter-socket-right`} data-part="test-meter-socket-right" cx="-2" cy="62" r="3" fill={palette.ink} stroke={palette.ink} strokeWidth="0.7" />
    </g>
  );
});
