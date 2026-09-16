import { memo } from 'react';
import type { ArtProps } from '../types';

/** Smiley note. Local geometry: placement belongs to RoomObject. */
export const BoardSmile = memo(function BoardSmile({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--board-smile`} data-part="board-smile" display={hiddenParts?.includes("board-smile") ? "none" : undefined} data-art="board-smile">
      <g id={`${idPrefix}--board-smile-sheet-motion`} data-part="board-smile-sheet-motion" display={hiddenParts?.includes("board-smile-sheet-motion") ? "none" : undefined} data-motion="paper" data-pivot="32,0" data-phase="2">
        <path id={`${idPrefix}--board-smile-paper`} data-part="board-smile-paper" d="M0 0 L64 -4 L60 65 L-3 63 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--board-smile-paper-tint`} data-part="board-smile-paper-tint" d="M0 0 L64 -4 L60 65 L-3 63 Z" fill={palette.rust} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.16" />
        <path id={`${idPrefix}--board-smile-smile-eyes`} data-part="board-smile-smile-eyes" d="M20 17 l-1 7 M37 15 l-1 7" fill="none" stroke={palette.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--board-smile-smile-mouth`} data-part="board-smile-smile-mouth" d="M14 34 C23 54 43 48 47 31" fill="none" stroke={palette.ink} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
});
