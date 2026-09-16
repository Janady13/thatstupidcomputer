import { memo } from 'react';
import type { ArtProps } from '../types';

/** Desk pedestal / open drawer cavities. Local geometry: placement belongs to RoomObject. */
export const DeskPedestal = memo(function DeskPedestal({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--desk-pedestal`} data-part="desk-pedestal" display={hiddenParts?.includes("desk-pedestal") ? "none" : undefined} data-art="desk-pedestal">
      <path id={`${idPrefix}--desk-pedestal-shell`} data-part="desk-pedestal-shell" d="M0 0 L259 -1 L252 249 L2 232 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--desk-pedestal-left-stile`} data-part="desk-pedestal-left-stile" d="M0 0 L18 2 L17 233 L2 232 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--desk-pedestal-right-stile`} data-part="desk-pedestal-right-stile" d="M242 0 L259 -1 L252 249 L237 245 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--desk-pedestal-inside-upper`} data-part="desk-pedestal-inside-upper" d="M18 5 L242 4 L240 82 L18 76 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--desk-pedestal-inside-lower`} data-part="desk-pedestal-inside-lower" d="M18 94 L241 100 L237 231 L18 216 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--desk-pedestal-drawer-rails`} data-part="desk-pedestal-drawer-rails" d="M22 109 L233 115 M22 207 L232 223" fill="none" stroke={palette.paper} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.36" />
      <path id={`${idPrefix}--desk-pedestal-foot-left`} data-part="desk-pedestal-foot-left" d="M0 232 L18 233 L17 246 L1 245 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--desk-pedestal-foot-right`} data-part="desk-pedestal-foot-right" d="M237 245 L252 249 L251 263 L236 259 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
