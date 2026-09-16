import { memo } from 'react';
import type { ArtProps } from '../types';

/** Pinned landscape illustration. Local geometry: placement belongs to RoomObject. */
export const BoardPhoto = memo(function BoardPhoto({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--board-photo`} data-part="board-photo" display={hiddenParts?.includes("board-photo") ? "none" : undefined} data-art="board-photo">
      <g id={`${idPrefix}--board-photo-sheet-motion`} data-part="board-photo-sheet-motion" display={hiddenParts?.includes("board-photo-sheet-motion") ? "none" : undefined} data-motion="paper" data-pivot="38,-4" data-phase="3">
        <path id={`${idPrefix}--board-photo-photo-sheet`} data-part="board-photo-photo-sheet" d="M-2 -6 L88 1 L82 128 L-13 120 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--board-photo-photo-window`} data-part="board-photo-photo-window" d="M6 10 L76 16 L71 93 L0 87 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--board-photo-photo-sky`} data-part="board-photo-photo-sky" d="M6 10 L76 16 L73 60 L3 53 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
        <path id={`${idPrefix}--board-photo-photo-mountains`} data-part="board-photo-photo-mountains" d="M2 69 L28 35 L45 55 L60 28 L74 55 L72 81 L1 82 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.42" />
        <path id={`${idPrefix}--board-photo-photo-fir-1`} data-part="board-photo-photo-fir-1" d="M13 42 l-7 14 h4 l-9 12 h10 v11 h3 v-11 h9 l-8 -12 h4 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--board-photo-photo-fir-2`} data-part="board-photo-photo-fir-2" d="M27 50.599999999999994 l-5.6000000000000005 11.200000000000001 h3.2 l-7.2 9.600000000000001 h8.0 v8.8 h2.4000000000000004 v-8.8 h7.2 l-6.4 -9.600000000000001 h3.2 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--board-photo-photo-fir-3`} data-part="board-photo-photo-fir-3" d="M41 41.4 l-8.4 16.8 h4.8 l-10.799999999999999 14.399999999999999 h12.0 v13.2 h3.5999999999999996 v-13.2 h10.799999999999999 l-9.6 -14.399999999999999 h4.8 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--board-photo-photo-fir-4`} data-part="board-photo-photo-fir-4" d="M58 52.8 l-6.3 12.6 h3.6 l-8.1 10.8 h9.0 v9.9 h2.7 v-9.9 h8.1 l-7.2 -10.8 h3.6 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--board-photo-photo-caption`} data-part="board-photo-photo-caption" d="M9 105 l36 3 M20 110 l20 2" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      </g>
      <circle id={`${idPrefix}--board-photo-photo-pin-shadow`} data-part="board-photo-photo-pin-shadow" cx="43.8" cy="-1.4" r="4.3" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.16" />
      <ellipse id={`${idPrefix}--board-photo-photo-pin-body`} data-part="board-photo-photo-pin-body" cx="43" cy="-3" rx="3.7" ry="4.2" fill={palette.rust} stroke={palette.ink} strokeWidth="1" />
      <path id={`${idPrefix}--board-photo-photo-pin-shine`} data-part="board-photo-photo-pin-shine" d="M42 -5 q2 -1 3 1" fill="none" stroke={palette.paper} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
