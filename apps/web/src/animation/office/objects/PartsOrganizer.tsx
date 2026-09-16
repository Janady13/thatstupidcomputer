import { memo } from 'react';
import type { ArtProps } from '../types';

/** Small-parts organizer / twelve drawers. Local geometry: placement belongs to RoomObject. */
export const PartsOrganizer = memo(function PartsOrganizer({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--parts-organizer`} data-part="parts-organizer" display={hiddenParts?.includes("parts-organizer") ? "none" : undefined} data-art="parts-organizer">
      <path id={`${idPrefix}--parts-organizer-side`} data-part="parts-organizer-side" d="M111 4 L127 11 L127 127 L111 123 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect id={`${idPrefix}--parts-organizer-body`} data-part="parts-organizer-body" x="0" y="0" width="111" height="124" rx="1" fill={palette.ink} stroke={palette.ink} strokeWidth="2" />
      <g id={`${idPrefix}--parts-organizer-bin-01`} data-part="parts-organizer-bin-01" display={hiddenParts?.includes("parts-organizer-bin-01") ? "none" : undefined}>
        <rect id={`${idPrefix}--parts-organizer-bin-01-frame`} data-part="parts-organizer-bin-01-frame" x="7" y="7" width="29" height="23" rx="1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <rect id={`${idPrefix}--parts-organizer-bin-01-window`} data-part="parts-organizer-bin-01-window" x="10" y="10" width="23" height="15" rx="1" fill={palette.ink} stroke={palette.ink} strokeWidth="0.6" />
        <path id={`${idPrefix}--parts-organizer-bin-01-parts`} data-part="parts-organizer-bin-01-parts" d="M12 22 l4 -3 3 4 4 -6 4 6 4 -2 0 4 -19 0 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.68" />
        <path id={`${idPrefix}--parts-organizer-bin-01-pull`} data-part="parts-organizer-bin-01-pull" d="M17 28 h10" fill="none" stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--parts-organizer-bin-02`} data-part="parts-organizer-bin-02" display={hiddenParts?.includes("parts-organizer-bin-02") ? "none" : undefined}>
        <rect id={`${idPrefix}--parts-organizer-bin-02-frame`} data-part="parts-organizer-bin-02-frame" x="41" y="7" width="29" height="23" rx="1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <rect id={`${idPrefix}--parts-organizer-bin-02-window`} data-part="parts-organizer-bin-02-window" x="44" y="10" width="23" height="15" rx="1" fill={palette.ink} stroke={palette.ink} strokeWidth="0.6" />
        <path id={`${idPrefix}--parts-organizer-bin-02-parts`} data-part="parts-organizer-bin-02-parts" d="M46 22 l4 -3 3 4 4 -6 4 6 4 -2 0 4 -19 0 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.68" />
        <path id={`${idPrefix}--parts-organizer-bin-02-pull`} data-part="parts-organizer-bin-02-pull" d="M51 28 h10" fill="none" stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--parts-organizer-bin-03`} data-part="parts-organizer-bin-03" display={hiddenParts?.includes("parts-organizer-bin-03") ? "none" : undefined}>
        <rect id={`${idPrefix}--parts-organizer-bin-03-frame`} data-part="parts-organizer-bin-03-frame" x="75" y="7" width="29" height="23" rx="1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <rect id={`${idPrefix}--parts-organizer-bin-03-window`} data-part="parts-organizer-bin-03-window" x="78" y="10" width="23" height="15" rx="1" fill={palette.ink} stroke={palette.ink} strokeWidth="0.6" />
        <path id={`${idPrefix}--parts-organizer-bin-03-parts`} data-part="parts-organizer-bin-03-parts" d="M80 22 l4 -3 3 4 4 -6 4 6 4 -2 0 4 -19 0 Z" fill={palette.rust} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.68" />
        <path id={`${idPrefix}--parts-organizer-bin-03-pull`} data-part="parts-organizer-bin-03-pull" d="M85 28 h10" fill="none" stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--parts-organizer-bin-04`} data-part="parts-organizer-bin-04" display={hiddenParts?.includes("parts-organizer-bin-04") ? "none" : undefined}>
        <rect id={`${idPrefix}--parts-organizer-bin-04-frame`} data-part="parts-organizer-bin-04-frame" x="7" y="35" width="29" height="23" rx="1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <rect id={`${idPrefix}--parts-organizer-bin-04-window`} data-part="parts-organizer-bin-04-window" x="10" y="38" width="23" height="15" rx="1" fill={palette.ink} stroke={palette.ink} strokeWidth="0.6" />
        <path id={`${idPrefix}--parts-organizer-bin-04-parts`} data-part="parts-organizer-bin-04-parts" d="M12 50 l4 -3 3 4 4 -6 4 6 4 -2 0 4 -19 0 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.68" />
        <path id={`${idPrefix}--parts-organizer-bin-04-pull`} data-part="parts-organizer-bin-04-pull" d="M17 56 h10" fill="none" stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--parts-organizer-bin-05`} data-part="parts-organizer-bin-05" display={hiddenParts?.includes("parts-organizer-bin-05") ? "none" : undefined}>
        <rect id={`${idPrefix}--parts-organizer-bin-05-frame`} data-part="parts-organizer-bin-05-frame" x="41" y="35" width="29" height="23" rx="1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <rect id={`${idPrefix}--parts-organizer-bin-05-window`} data-part="parts-organizer-bin-05-window" x="44" y="38" width="23" height="15" rx="1" fill={palette.ink} stroke={palette.ink} strokeWidth="0.6" />
        <path id={`${idPrefix}--parts-organizer-bin-05-parts`} data-part="parts-organizer-bin-05-parts" d="M46 50 l4 -3 3 4 4 -6 4 6 4 -2 0 4 -19 0 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.68" />
        <path id={`${idPrefix}--parts-organizer-bin-05-pull`} data-part="parts-organizer-bin-05-pull" d="M51 56 h10" fill="none" stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--parts-organizer-bin-06`} data-part="parts-organizer-bin-06" display={hiddenParts?.includes("parts-organizer-bin-06") ? "none" : undefined}>
        <rect id={`${idPrefix}--parts-organizer-bin-06-frame`} data-part="parts-organizer-bin-06-frame" x="75" y="35" width="29" height="23" rx="1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <rect id={`${idPrefix}--parts-organizer-bin-06-window`} data-part="parts-organizer-bin-06-window" x="78" y="38" width="23" height="15" rx="1" fill={palette.ink} stroke={palette.ink} strokeWidth="0.6" />
        <path id={`${idPrefix}--parts-organizer-bin-06-parts`} data-part="parts-organizer-bin-06-parts" d="M80 50 l4 -3 3 4 4 -6 4 6 4 -2 0 4 -19 0 Z" fill={palette.rust} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.68" />
        <path id={`${idPrefix}--parts-organizer-bin-06-pull`} data-part="parts-organizer-bin-06-pull" d="M85 56 h10" fill="none" stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--parts-organizer-bin-07`} data-part="parts-organizer-bin-07" display={hiddenParts?.includes("parts-organizer-bin-07") ? "none" : undefined}>
        <rect id={`${idPrefix}--parts-organizer-bin-07-frame`} data-part="parts-organizer-bin-07-frame" x="7" y="63" width="29" height="23" rx="1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <rect id={`${idPrefix}--parts-organizer-bin-07-window`} data-part="parts-organizer-bin-07-window" x="10" y="66" width="23" height="15" rx="1" fill={palette.ink} stroke={palette.ink} strokeWidth="0.6" />
        <path id={`${idPrefix}--parts-organizer-bin-07-parts`} data-part="parts-organizer-bin-07-parts" d="M12 78 l4 -3 3 4 4 -6 4 6 4 -2 0 4 -19 0 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.68" />
        <path id={`${idPrefix}--parts-organizer-bin-07-pull`} data-part="parts-organizer-bin-07-pull" d="M17 84 h10" fill="none" stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--parts-organizer-bin-08`} data-part="parts-organizer-bin-08" display={hiddenParts?.includes("parts-organizer-bin-08") ? "none" : undefined}>
        <rect id={`${idPrefix}--parts-organizer-bin-08-frame`} data-part="parts-organizer-bin-08-frame" x="41" y="63" width="29" height="23" rx="1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <rect id={`${idPrefix}--parts-organizer-bin-08-window`} data-part="parts-organizer-bin-08-window" x="44" y="66" width="23" height="15" rx="1" fill={palette.ink} stroke={palette.ink} strokeWidth="0.6" />
        <path id={`${idPrefix}--parts-organizer-bin-08-parts`} data-part="parts-organizer-bin-08-parts" d="M46 78 l4 -3 3 4 4 -6 4 6 4 -2 0 4 -19 0 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.68" />
        <path id={`${idPrefix}--parts-organizer-bin-08-pull`} data-part="parts-organizer-bin-08-pull" d="M51 84 h10" fill="none" stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--parts-organizer-bin-09`} data-part="parts-organizer-bin-09" display={hiddenParts?.includes("parts-organizer-bin-09") ? "none" : undefined}>
        <rect id={`${idPrefix}--parts-organizer-bin-09-frame`} data-part="parts-organizer-bin-09-frame" x="75" y="63" width="29" height="23" rx="1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <rect id={`${idPrefix}--parts-organizer-bin-09-window`} data-part="parts-organizer-bin-09-window" x="78" y="66" width="23" height="15" rx="1" fill={palette.ink} stroke={palette.ink} strokeWidth="0.6" />
        <path id={`${idPrefix}--parts-organizer-bin-09-parts`} data-part="parts-organizer-bin-09-parts" d="M80 78 l4 -3 3 4 4 -6 4 6 4 -2 0 4 -19 0 Z" fill={palette.rust} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.68" />
        <path id={`${idPrefix}--parts-organizer-bin-09-pull`} data-part="parts-organizer-bin-09-pull" d="M85 84 h10" fill="none" stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--parts-organizer-bin-10`} data-part="parts-organizer-bin-10" display={hiddenParts?.includes("parts-organizer-bin-10") ? "none" : undefined}>
        <rect id={`${idPrefix}--parts-organizer-bin-10-frame`} data-part="parts-organizer-bin-10-frame" x="7" y="91" width="29" height="23" rx="1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <rect id={`${idPrefix}--parts-organizer-bin-10-window`} data-part="parts-organizer-bin-10-window" x="10" y="94" width="23" height="15" rx="1" fill={palette.ink} stroke={palette.ink} strokeWidth="0.6" />
        <path id={`${idPrefix}--parts-organizer-bin-10-parts`} data-part="parts-organizer-bin-10-parts" d="M12 106 l4 -3 3 4 4 -6 4 6 4 -2 0 4 -19 0 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.68" />
        <path id={`${idPrefix}--parts-organizer-bin-10-pull`} data-part="parts-organizer-bin-10-pull" d="M17 112 h10" fill="none" stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--parts-organizer-bin-11`} data-part="parts-organizer-bin-11" display={hiddenParts?.includes("parts-organizer-bin-11") ? "none" : undefined}>
        <rect id={`${idPrefix}--parts-organizer-bin-11-frame`} data-part="parts-organizer-bin-11-frame" x="41" y="91" width="29" height="23" rx="1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <rect id={`${idPrefix}--parts-organizer-bin-11-window`} data-part="parts-organizer-bin-11-window" x="44" y="94" width="23" height="15" rx="1" fill={palette.ink} stroke={palette.ink} strokeWidth="0.6" />
        <path id={`${idPrefix}--parts-organizer-bin-11-parts`} data-part="parts-organizer-bin-11-parts" d="M46 106 l4 -3 3 4 4 -6 4 6 4 -2 0 4 -19 0 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.68" />
        <path id={`${idPrefix}--parts-organizer-bin-11-pull`} data-part="parts-organizer-bin-11-pull" d="M51 112 h10" fill="none" stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--parts-organizer-bin-12`} data-part="parts-organizer-bin-12" display={hiddenParts?.includes("parts-organizer-bin-12") ? "none" : undefined}>
        <rect id={`${idPrefix}--parts-organizer-bin-12-frame`} data-part="parts-organizer-bin-12-frame" x="75" y="91" width="29" height="23" rx="1" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
        <rect id={`${idPrefix}--parts-organizer-bin-12-window`} data-part="parts-organizer-bin-12-window" x="78" y="94" width="23" height="15" rx="1" fill={palette.ink} stroke={palette.ink} strokeWidth="0.6" />
        <path id={`${idPrefix}--parts-organizer-bin-12-parts`} data-part="parts-organizer-bin-12-parts" d="M80 106 l4 -3 3 4 4 -6 4 6 4 -2 0 4 -19 0 Z" fill={palette.rust} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.68" />
        <path id={`${idPrefix}--parts-organizer-bin-12-pull`} data-part="parts-organizer-bin-12-pull" d="M85 112 h10" fill="none" stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path id={`${idPrefix}--parts-organizer-foot`} data-part="parts-organizer-foot" d="M0 124 L110 126 L127 128" fill="none" stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
