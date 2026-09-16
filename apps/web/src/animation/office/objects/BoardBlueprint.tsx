import { memo } from 'react';
import type { ArtProps } from '../types';

/** Pinned technical drawing. Local geometry: placement belongs to RoomObject. */
export const BoardBlueprint = memo(function BoardBlueprint({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--board-blueprint`} data-part="board-blueprint" display={hiddenParts?.includes("board-blueprint") ? "none" : undefined} data-art="board-blueprint">
      <g id={`${idPrefix}--board-blueprint-sheet-motion`} data-part="board-blueprint-sheet-motion" display={hiddenParts?.includes("board-blueprint-sheet-motion") ? "none" : undefined} data-motion="paper" data-pivot="37,6" data-phase="0.5">
        <path id={`${idPrefix}--board-blueprint-sheet-shadow`} data-part="board-blueprint-sheet-shadow" d="M2 7 L184 -8 L185 166 L4 171 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
        <path id={`${idPrefix}--board-blueprint-sheet`} data-part="board-blueprint-sheet" d="M-3 4 L181 -10 L183 160 L-2 167 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--board-blueprint-drawing-frame`} data-part="board-blueprint-drawing-frame" d="M13 25 L160 15 L164 140 L14 147 Z" fill="none" stroke={palette.ink} strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" opacity="0.64" />
        <path id={`${idPrefix}--board-blueprint-plan-walls`} data-part="board-blueprint-plan-walls" d="M44 51 L122 45 124 117 44 122 Z M78 48 L78 91 105 90 105 116 M44 85 L78 82 M109 48 L109 69 124 68 M66 121 L66 104 M45 105 L67 104 M123 92 L113 92" fill="none" stroke={palette.ink} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" opacity="0.73" />
        <path id={`${idPrefix}--board-blueprint-plan-dimensions`} data-part="board-blueprint-plan-dimensions" d="M35 45 L35 133 M29 53 L38 53 M29 122 L39 122 M43 36 L123 30 M44 30 L44 40 M123 24 L123 35 M133 47 L136 118 M129 49 L141 49 M131 117 L143 117" fill="none" stroke={palette.ink} strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        <path id={`${idPrefix}--board-blueprint-door-arcs`} data-part="board-blueprint-door-arcs" d="M78 69 Q65 69 65 82 M93 117 Q93 104 106 104 M112 80 Q112 68 124 68" fill="none" stroke={palette.ink} strokeWidth="0.55" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        <path id={`${idPrefix}--board-blueprint-technical-notes`} data-part="board-blueprint-technical-notes" d="M24 153 l42 -2 M81 150 l50 -3 M23 157 l21 -1 M140 143 l15 -1" fill="none" stroke={palette.ink} strokeWidth="0.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </g>
      <circle id={`${idPrefix}--board-blueprint-drawing-pin-shadow`} data-part="board-blueprint-drawing-pin-shadow" cx="35.8" cy="6.6" r="4.3" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.16" />
      <ellipse id={`${idPrefix}--board-blueprint-drawing-pin-body`} data-part="board-blueprint-drawing-pin-body" cx="35" cy="5" rx="3.7" ry="4.2" fill={palette.rust} stroke={palette.ink} strokeWidth="1" />
      <path id={`${idPrefix}--board-blueprint-drawing-pin-shine`} data-part="board-blueprint-drawing-pin-shine" d="M34 3 q2 -1 3 1" fill="none" stroke={palette.paper} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
