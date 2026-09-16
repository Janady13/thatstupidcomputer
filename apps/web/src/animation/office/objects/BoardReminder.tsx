import { memo } from 'react';
import type { ArtProps } from '../types';

/** Pinned curled checklist. Local geometry: placement belongs to RoomObject. */
export const BoardReminder = memo(function BoardReminder({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--board-reminder`} data-part="board-reminder" display={hiddenParts?.includes("board-reminder") ? "none" : undefined} data-art="board-reminder">
      <g id={`${idPrefix}--board-reminder-sheet-motion`} data-part="board-reminder-sheet-motion" display={hiddenParts?.includes("board-reminder-sheet-motion") ? "none" : undefined} data-motion="paper" data-pivot="37,1" data-phase="1.5">
        <path id={`${idPrefix}--board-reminder-paper-shadow`} data-part="board-reminder-paper-shadow" d="M0 3 L85 -3 85 116 67 133 0 139 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
        <path id={`${idPrefix}--board-reminder-paper`} data-part="board-reminder-paper" d="M-5 1 L84 -5 L83 111 Q84 132 60 139 L-4 140 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--board-reminder-curl`} data-part="board-reminder-curl" d="M60 139 Q70 131 65 117 Q76 119 83 111 Q82 132 60 139 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--board-reminder-check-line-1`} data-part="board-reminder-check-line-1" d="M10 26 L65 24" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.48" />
        <path id={`${idPrefix}--board-reminder-check-line-2`} data-part="board-reminder-check-line-2" d="M10 40 L65 38" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.48" />
        <path id={`${idPrefix}--board-reminder-check-line-3`} data-part="board-reminder-check-line-3" d="M10 54 L65 52" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.48" />
        <path id={`${idPrefix}--board-reminder-check-line-4`} data-part="board-reminder-check-line-4" d="M10 68 L65 66" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.48" />
        <path id={`${idPrefix}--board-reminder-check-line-5`} data-part="board-reminder-check-line-5" d="M10 82 L65 80" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.48" />
        <path id={`${idPrefix}--board-reminder-check-line-6`} data-part="board-reminder-check-line-6" d="M10 96 L65 94" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.48" />
      </g>
      <circle id={`${idPrefix}--board-reminder-reminder-pin-shadow`} data-part="board-reminder-reminder-pin-shadow" cx="37.8" cy="2.6" r="4.3" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.16" />
      <ellipse id={`${idPrefix}--board-reminder-reminder-pin-body`} data-part="board-reminder-reminder-pin-body" cx="37" cy="1" rx="3.7" ry="4.2" fill={palette.rust} stroke={palette.ink} strokeWidth="1" />
      <path id={`${idPrefix}--board-reminder-reminder-pin-shine`} data-part="board-reminder-reminder-pin-shine" d="M36 -1 q2 -1 3 1" fill="none" stroke={palette.paper} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
