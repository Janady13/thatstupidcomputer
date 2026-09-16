import { memo } from 'react';
import type { ArtProps } from '../types';

/** Small pinned note. Local geometry: placement belongs to RoomObject. */
export const BoardSmallNote = memo(function BoardSmallNote({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--board-small-note`} data-part="board-small-note" display={hiddenParts?.includes("board-small-note") ? "none" : undefined} data-art="board-small-note">
      <g id={`${idPrefix}--board-small-note-sheet-motion`} data-part="board-small-note-sheet-motion" display={hiddenParts?.includes("board-small-note-sheet-motion") ? "none" : undefined} data-motion="paper" data-pivot="28,1" data-phase="3.8">
        <path id={`${idPrefix}--board-small-note-sheet`} data-part="board-small-note-sheet" d="M-4 1 L54 -3 L56 76 L-7 77 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--board-small-note-note-rule-1`} data-part="board-small-note-note-rule-1" d="M4 20 L45 19" fill="none" stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        <path id={`${idPrefix}--board-small-note-note-rule-2`} data-part="board-small-note-note-rule-2" d="M4 28 L45 27" fill="none" stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        <path id={`${idPrefix}--board-small-note-note-rule-3`} data-part="board-small-note-note-rule-3" d="M4 36 L45 35" fill="none" stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        <path id={`${idPrefix}--board-small-note-note-rule-4`} data-part="board-small-note-note-rule-4" d="M4 44 L45 43" fill="none" stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        <path id={`${idPrefix}--board-small-note-note-rule-5`} data-part="board-small-note-note-rule-5" d="M4 52 L45 51" fill="none" stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
        <path id={`${idPrefix}--board-small-note-note-rule-6`} data-part="board-small-note-note-rule-6" d="M4 60 L45 59" fill="none" stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      </g>
      <circle id={`${idPrefix}--board-small-note-pin-shadow`} data-part="board-small-note-pin-shadow" cx="27.8" cy="1.6" r="4.3" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.16" />
      <ellipse id={`${idPrefix}--board-small-note-pin-body`} data-part="board-small-note-pin-body" cx="27" cy="0" rx="3.7" ry="4.2" fill={palette.rust} stroke={palette.ink} strokeWidth="1" />
      <path id={`${idPrefix}--board-small-note-pin-shine`} data-part="board-small-note-pin-shine" d="M26 -2 q2 -1 3 1" fill="none" stroke={palette.paper} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
