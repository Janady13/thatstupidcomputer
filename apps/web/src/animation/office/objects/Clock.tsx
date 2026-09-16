import { memo } from 'react';
import type { ArtProps } from '../types';

/** Wall clock / independent hands. Local geometry: placement belongs to RoomObject. */
export const Clock = memo(function Clock({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--clock`} data-part="clock" display={hiddenParts?.includes("clock") ? "none" : undefined} data-art="clock">
      <ellipse id={`${idPrefix}--clock-contact-shadow`} data-part="clock-contact-shadow" cx="4" cy="7" rx="103" ry="108" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.1" />
      <circle id={`${idPrefix}--clock-outer-case`} data-part="clock-outer-case" cx="0" cy="0" r="102" fill={palette.paper} stroke={palette.ink} strokeWidth="3" />
      <circle id={`${idPrefix}--clock-case-bevel`} data-part="clock-case-bevel" cx="0" cy="0" r="98" fill={palette.ink} stroke={palette.ink} strokeWidth="0.8" />
      <circle id={`${idPrefix}--clock-dial`} data-part="clock-dial" cx="0" cy="0" r="91.5" fill={palette.paper} stroke={palette.ink} strokeWidth="1.3" />
      <circle id={`${idPrefix}--clock-dial-edge`} data-part="clock-dial-edge" cx="0" cy="0" r="87.5" fill="none" stroke={palette.ink} strokeWidth="0.7" />
      <g id={`${idPrefix}--clock-minute-marks`} data-part="clock-minute-marks" display={hiddenParts?.includes("clock-minute-marks") ? "none" : undefined}>
        <path id={`${idPrefix}--clock-minute-00`} data-part="clock-minute-00" d="M0.0 -77.0 L0.0 -84.0" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-01`} data-part="clock-minute-01" d="M8.36 -79.56 L8.78 -83.54" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-02`} data-part="clock-minute-02" d="M16.63 -78.25 L17.46 -82.16" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-03`} data-part="clock-minute-03" d="M24.72 -76.08 L25.96 -79.89" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-04`} data-part="clock-minute-04" d="M32.54 -73.08 L34.17 -76.74" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-05`} data-part="clock-minute-05" d="M38.5 -66.68 L42.0 -72.75" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-06`} data-part="clock-minute-06" d="M47.02 -64.72 L49.37 -67.96" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-07`} data-part="clock-minute-07" d="M53.53 -59.45 L56.21 -62.42" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-08`} data-part="clock-minute-08" d="M59.45 -53.53 L62.42 -56.21" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-09`} data-part="clock-minute-09" d="M64.72 -47.02 L67.96 -49.37" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-10`} data-part="clock-minute-10" d="M66.68 -38.5 L72.75 -42.0" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-11`} data-part="clock-minute-11" d="M73.08 -32.54 L76.74 -34.17" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-12`} data-part="clock-minute-12" d="M76.08 -24.72 L79.89 -25.96" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-13`} data-part="clock-minute-13" d="M78.25 -16.63 L82.16 -17.46" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-14`} data-part="clock-minute-14" d="M79.56 -8.36 L83.54 -8.78" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-15`} data-part="clock-minute-15" d="M77.0 0.0 L84.0 0.0" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-16`} data-part="clock-minute-16" d="M79.56 8.36 L83.54 8.78" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-17`} data-part="clock-minute-17" d="M78.25 16.63 L82.16 17.46" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-18`} data-part="clock-minute-18" d="M76.08 24.72 L79.89 25.96" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-19`} data-part="clock-minute-19" d="M73.08 32.54 L76.74 34.17" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-20`} data-part="clock-minute-20" d="M66.68 38.5 L72.75 42.0" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-21`} data-part="clock-minute-21" d="M64.72 47.02 L67.96 49.37" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-22`} data-part="clock-minute-22" d="M59.45 53.53 L62.42 56.21" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-23`} data-part="clock-minute-23" d="M53.53 59.45 L56.21 62.42" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-24`} data-part="clock-minute-24" d="M47.02 64.72 L49.37 67.96" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-25`} data-part="clock-minute-25" d="M38.5 66.68 L42.0 72.75" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-26`} data-part="clock-minute-26" d="M32.54 73.08 L34.17 76.74" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-27`} data-part="clock-minute-27" d="M24.72 76.08 L25.96 79.89" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-28`} data-part="clock-minute-28" d="M16.63 78.25 L17.46 82.16" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-29`} data-part="clock-minute-29" d="M8.36 79.56 L8.78 83.54" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-30`} data-part="clock-minute-30" d="M0.0 77.0 L0.0 84.0" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-31`} data-part="clock-minute-31" d="M-8.36 79.56 L-8.78 83.54" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-32`} data-part="clock-minute-32" d="M-16.63 78.25 L-17.46 82.16" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-33`} data-part="clock-minute-33" d="M-24.72 76.08 L-25.96 79.89" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-34`} data-part="clock-minute-34" d="M-32.54 73.08 L-34.17 76.74" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-35`} data-part="clock-minute-35" d="M-38.5 66.68 L-42.0 72.75" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-36`} data-part="clock-minute-36" d="M-47.02 64.72 L-49.37 67.96" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-37`} data-part="clock-minute-37" d="M-53.53 59.45 L-56.21 62.42" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-38`} data-part="clock-minute-38" d="M-59.45 53.53 L-62.42 56.21" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-39`} data-part="clock-minute-39" d="M-64.72 47.02 L-67.96 49.37" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-40`} data-part="clock-minute-40" d="M-66.68 38.5 L-72.75 42.0" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-41`} data-part="clock-minute-41" d="M-73.08 32.54 L-76.74 34.17" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-42`} data-part="clock-minute-42" d="M-76.08 24.72 L-79.89 25.96" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-43`} data-part="clock-minute-43" d="M-78.25 16.63 L-82.16 17.46" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-44`} data-part="clock-minute-44" d="M-79.56 8.36 L-83.54 8.78" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-45`} data-part="clock-minute-45" d="M-77.0 0.0 L-84.0 0.0" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-46`} data-part="clock-minute-46" d="M-79.56 -8.36 L-83.54 -8.78" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-47`} data-part="clock-minute-47" d="M-78.25 -16.63 L-82.16 -17.46" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-48`} data-part="clock-minute-48" d="M-76.08 -24.72 L-79.89 -25.96" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-49`} data-part="clock-minute-49" d="M-73.08 -32.54 L-76.74 -34.17" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-50`} data-part="clock-minute-50" d="M-66.68 -38.5 L-72.75 -42.0" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-51`} data-part="clock-minute-51" d="M-64.72 -47.02 L-67.96 -49.37" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-52`} data-part="clock-minute-52" d="M-59.45 -53.53 L-62.42 -56.21" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-53`} data-part="clock-minute-53" d="M-53.53 -59.45 L-56.21 -62.42" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-54`} data-part="clock-minute-54" d="M-47.02 -64.72 L-49.37 -67.96" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-55`} data-part="clock-minute-55" d="M-38.5 -66.68 L-42.0 -72.75" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-56`} data-part="clock-minute-56" d="M-32.54 -73.08 L-34.17 -76.74" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-57`} data-part="clock-minute-57" d="M-24.72 -76.08 L-25.96 -79.89" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-58`} data-part="clock-minute-58" d="M-16.63 -78.25 L-17.46 -82.16" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--clock-minute-59`} data-part="clock-minute-59" d="M-8.36 -79.56 L-8.78 -83.54" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text id={`${idPrefix}--clock-numeral-01`} data-part="clock-numeral-01" x="34.0" y="-52.89" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="500" textAnchor="middle" fill={palette.ink} stroke="none">1</text>
      <text id={`${idPrefix}--clock-numeral-02`} data-part="clock-numeral-02" x="58.89" y="-28.0" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="500" textAnchor="middle" fill={palette.ink} stroke="none">2</text>
      <text id={`${idPrefix}--clock-numeral-03`} data-part="clock-numeral-03" x="68.0" y="6.0" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="500" textAnchor="middle" fill={palette.ink} stroke="none">3</text>
      <text id={`${idPrefix}--clock-numeral-04`} data-part="clock-numeral-04" x="58.89" y="40.0" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="500" textAnchor="middle" fill={palette.ink} stroke="none">4</text>
      <text id={`${idPrefix}--clock-numeral-05`} data-part="clock-numeral-05" x="34.0" y="64.89" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="500" textAnchor="middle" fill={palette.ink} stroke="none">5</text>
      <text id={`${idPrefix}--clock-numeral-06`} data-part="clock-numeral-06" x="0.0" y="74.0" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="500" textAnchor="middle" fill={palette.ink} stroke="none">6</text>
      <text id={`${idPrefix}--clock-numeral-07`} data-part="clock-numeral-07" x="-34.0" y="64.89" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="500" textAnchor="middle" fill={palette.ink} stroke="none">7</text>
      <text id={`${idPrefix}--clock-numeral-08`} data-part="clock-numeral-08" x="-58.89" y="40.0" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="500" textAnchor="middle" fill={palette.ink} stroke="none">8</text>
      <text id={`${idPrefix}--clock-numeral-09`} data-part="clock-numeral-09" x="-68.0" y="6.0" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="500" textAnchor="middle" fill={palette.ink} stroke="none">9</text>
      <text id={`${idPrefix}--clock-numeral-10`} data-part="clock-numeral-10" x="-58.89" y="-28.0" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="500" textAnchor="middle" fill={palette.ink} stroke="none">10</text>
      <text id={`${idPrefix}--clock-numeral-11`} data-part="clock-numeral-11" x="-34.0" y="-52.89" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="500" textAnchor="middle" fill={palette.ink} stroke="none">11</text>
      <text id={`${idPrefix}--clock-numeral-12`} data-part="clock-numeral-12" x="-0.0" y="-62.0" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="500" textAnchor="middle" fill={palette.ink} stroke="none">12</text>
      <g id={`${idPrefix}--clock-hour-hand-motion`} data-part="clock-hour-hand-motion" display={hiddenParts?.includes("clock-hour-hand-motion") ? "none" : undefined} data-motion="clock-hour" data-pivot="0,0" transform="rotate(304)">
        <path id={`${idPrefix}--clock-hour-hand`} data-part="clock-hour-hand" d="M-2.6 10 L-2.2 -49 Q0 -52 2.2 -49 L2.6 10 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--clock-minute-hand-motion`} data-part="clock-minute-hand-motion" display={hiddenParts?.includes("clock-minute-hand-motion") ? "none" : undefined} data-motion="clock-minute" data-pivot="0,0" transform="rotate(62)">
        <path id={`${idPrefix}--clock-minute-hand`} data-part="clock-minute-hand" d="M-1.7 13 L-1.3 -65 Q0 -67 1.3 -65 L1.7 13 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--clock-second-hand-motion`} data-part="clock-second-hand-motion" display={hiddenParts?.includes("clock-second-hand-motion") ? "none" : undefined} data-motion="clock-second" data-pivot="0,0" transform="rotate(180)">
        <path id={`${idPrefix}--clock-second-hand`} data-part="clock-second-hand" d="M0 18 V-75" fill="none" stroke={palette.rust} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <circle id={`${idPrefix}--clock-second-counterweight`} data-part="clock-second-counterweight" cx="0" cy="15" r="3" fill={palette.paper} stroke={palette.rust} strokeWidth="1" />
      </g>
      <circle id={`${idPrefix}--clock-spindle`} data-part="clock-spindle" cx="0" cy="0" r="4.2" fill={palette.rust} stroke={palette.ink} strokeWidth="1" />
      <circle id={`${idPrefix}--clock-spindle-highlight`} data-part="clock-spindle-highlight" cx="-1.1" cy="-1.2" r="1" fill={palette.paper} stroke="none" strokeWidth="1.5" />
      <path id={`${idPrefix}--clock-glass-glint`} data-part="clock-glass-glint" d="M-79 -39 A88 88 0 0 1 -30 -83" fill="none" stroke={palette.paper} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </g>
  );
});
