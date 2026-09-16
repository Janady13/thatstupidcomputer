import { memo } from 'react';
import type { ArtProps } from '../types';

/** Window frame and sill. Local geometry: placement belongs to RoomObject. */
export const Window = memo(function Window({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--window`} data-part="window" display={hiddenParts?.includes("window") ? "none" : undefined} data-art="window">
      <path id={`${idPrefix}--window-outer-frame`} data-part="window-outer-frame" d="M0 0 H340 V370 L0 393 Z M17 17 V367 L321 346 V17 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fillRule="evenodd" />
      <path id={`${idPrefix}--window-inside-reveal`} data-part="window-inside-reveal" d="M17 17 L24 25 V356 L321 336 V346 L17 367 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.16" />
      <path id={`${idPrefix}--window-left-beading`} data-part="window-left-beading" d="M6 0 V378 L333 357 M12 0 V373" fill="none" stroke={palette.ink} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--window-right-frame`} data-part="window-right-frame" d="M330 0 V358 L339 368" fill="none" stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--window-sill-top`} data-part="window-sill-top" d="M-17 393 L337 366 L348 374 L-18 408 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--window-sill-front`} data-part="window-sill-front" d="M-18 408 L348 374 V388 L-18 421 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--window-sill-edge`} data-part="window-sill-edge" d="M-11 412 L341 383" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--window-bottom-sash`} data-part="window-bottom-sash" d="M17 352 L321 331 V346 L17 367 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--window-sash-crease`} data-part="window-sash-crease" d="M22 358 L317 338" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--window-latch`} data-part="window-latch" d="M157 345 l21 -2 0 7 -21 2 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--window-latch-screw-left-head`} data-part="window-latch-screw-left-head" cx="160" cy="349" r="1.4" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" />
      <path id={`${idPrefix}--window-latch-screw-left-slot`} data-part="window-latch-screw-left-slot" d="M159.16 349.49 L160.84 348.51" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--window-latch-screw-right-head`} data-part="window-latch-screw-right-head" cx="175" cy="347" r="1.4" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" />
      <path id={`${idPrefix}--window-latch-screw-right-slot`} data-part="window-latch-screw-right-slot" d="M174.16 347.49 L175.84 346.51" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
