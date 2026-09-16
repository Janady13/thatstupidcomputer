import { memo } from 'react';
import type { ArtProps } from '../types';

/** Coffee mug / separate steam wisps. Local geometry: placement belongs to RoomObject. */
export const CoffeeMug = memo(function CoffeeMug({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--coffee-mug`} data-part="coffee-mug" display={hiddenParts?.includes("coffee-mug") ? "none" : undefined} data-art="coffee-mug">
      <ellipse id={`${idPrefix}--coffee-mug-contact`} data-part="coffee-mug-contact" cx="0" cy="7" rx="35" ry="7" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.12" />
      <path id={`${idPrefix}--coffee-mug-handle-outer`} data-part="coffee-mug-handle-outer" d="M25 -45 Q47 -50 45 -22 Q42 -7 27 -12 L26 -21 Q36 -19 37 -31 Q39 -41 26 -37 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--coffee-mug-cup-body`} data-part="coffee-mug-cup-body" d="M-28 -51 Q0 -59 28 -51 L26 0 Q0 13 -26 2 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--coffee-mug-cup-side`} data-part="coffee-mug-cup-side" d="M18 -51 L28 -51 L26 0 Q22 5 14 7 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.08" />
      <path id={`${idPrefix}--coffee-mug-rust-band-top`} data-part="coffee-mug-rust-band-top" d="M-27 -37 Q0 -29 28 -37 L27 -31 Q0 -23 -27 -31 Z" fill={palette.rust} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--coffee-mug-rust-band-lower`} data-part="coffee-mug-rust-band-lower" d="M-27 -24 Q0 -16 27 -24 L27 -19 Q0 -10 -26 -18 Z" fill={palette.rust} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse id={`${idPrefix}--coffee-mug-rim`} data-part="coffee-mug-rim" cx="0" cy="-51" rx="28" ry="6" fill={palette.paper} stroke={palette.ink} strokeWidth="1.5" />
      <ellipse id={`${idPrefix}--coffee-mug-coffee`} data-part="coffee-mug-coffee" cx="0" cy="-51" rx="23" ry="3.6" fill={palette.ink} stroke="none" strokeWidth="1.5" />
      <g id={`${idPrefix}--coffee-mug-steam`} data-part="coffee-mug-steam" display={hiddenParts?.includes("coffee-mug-steam") ? "none" : undefined} data-effect="steam">
        <g id={`${idPrefix}--coffee-mug-steam-1-motion`} data-part="coffee-mug-steam-1-motion" display={hiddenParts?.includes("coffee-mug-steam-1-motion") ? "none" : undefined} data-motion="steam" data-phase="0">
          <path id={`${idPrefix}--coffee-mug-steam-1`} data-part="coffee-mug-steam-1" d="M-12 -62 C-2 -77 -24 -83 -17 -96 C-10 -108 -2 -111 -8 -128" fill="none" stroke={palette.paper} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.82" />
          <path id={`${idPrefix}--coffee-mug-steam-1-edge`} data-part="coffee-mug-steam-1-edge" d="M-12 -62 C-2 -77 -24 -83 -17 -96 C-10 -108 -2 -111 -8 -128" fill="none" stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" opacity="0.17" />
        </g>
        <g id={`${idPrefix}--coffee-mug-steam-2-motion`} data-part="coffee-mug-steam-2-motion" display={hiddenParts?.includes("coffee-mug-steam-2-motion") ? "none" : undefined} data-motion="steam" data-phase="0.34">
          <path id={`${idPrefix}--coffee-mug-steam-2`} data-part="coffee-mug-steam-2" d="M1 -62 C11 -77 -11 -83 -4 -96 C3 -108 11 -111 5 -128" fill="none" stroke={palette.paper} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.82" />
          <path id={`${idPrefix}--coffee-mug-steam-2-edge`} data-part="coffee-mug-steam-2-edge" d="M1 -62 C11 -77 -11 -83 -4 -96 C3 -108 11 -111 5 -128" fill="none" stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" opacity="0.17" />
        </g>
        <g id={`${idPrefix}--coffee-mug-steam-3-motion`} data-part="coffee-mug-steam-3-motion" display={hiddenParts?.includes("coffee-mug-steam-3-motion") ? "none" : undefined} data-motion="steam" data-phase="0.69">
          <path id={`${idPrefix}--coffee-mug-steam-3`} data-part="coffee-mug-steam-3" d="M11 -62 C21 -77 -1 -83 6 -96 C13 -108 21 -111 15 -128" fill="none" stroke={palette.paper} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.82" />
          <path id={`${idPrefix}--coffee-mug-steam-3-edge`} data-part="coffee-mug-steam-3-edge" d="M11 -62 C21 -77 -1 -83 6 -96 C13 -108 21 -111 15 -128" fill="none" stroke={palette.ink} strokeWidth="0.65" strokeLinecap="round" strokeLinejoin="round" opacity="0.17" />
        </g>
      </g>
    </g>
  );
});
