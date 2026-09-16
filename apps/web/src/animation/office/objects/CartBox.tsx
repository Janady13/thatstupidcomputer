import { memo } from 'react';
import type { ArtProps } from '../types';

/** Cart storage box. Local geometry: placement belongs to RoomObject. */
export const CartBox = memo(function CartBox({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--cart-box`} data-part="cart-box" display={hiddenParts?.includes("cart-box") ? "none" : undefined} data-art="cart-box">
      <path id={`${idPrefix}--cart-box-body`} data-part="cart-box-body" d="M-73 -9 L61 -25 L68 90 L-79 114 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--cart-box-lid`} data-part="cart-box-lid" d="M-78 -16 L65 -33 L75 -21 L-83 -2 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--cart-box-lid-shadow`} data-part="cart-box-lid-shadow" d="M-83 -2 L75 -21 L74 -13 L-82 7 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--cart-box-label-frame`} data-part="cart-box-label-frame" d="M12 4 L50 -1 L50 20 L12 26 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--cart-box-label-paper`} data-part="cart-box-label-paper" d="M17 8 L45 5 L45 16 L17 21 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--cart-box-corner-band`} data-part="cart-box-corner-band" d="M-76 10 L-67 10 L-70 107 L-79 108 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.18" />
    </g>
  );
});
