import { memo } from 'react';
import type { ArtProps } from '../types';

/** Cart hand tools / individual handles. Local geometry: placement belongs to RoomObject. */
export const CartToolCup = memo(function CartToolCup({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--cart-tool-cup`} data-part="cart-tool-cup" display={hiddenParts?.includes("cart-tool-cup") ? "none" : undefined} data-art="cart-tool-cup">
      <g id={`${idPrefix}--cart-tool-cup-tool-1`} data-part="cart-tool-cup-tool-1" display={hiddenParts?.includes("cart-tool-cup-tool-1") ? "none" : undefined} transform="rotate(-11 -21 0)">
        <path id={`${idPrefix}--cart-tool-cup-tool-1-shaft`} data-part="cart-tool-cup-tool-1-shaft" d="M-22 -8 L-22 -75 L-19 -75 L-19 -8 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <rect id={`${idPrefix}--cart-tool-cup-tool-1-handle`} data-part="cart-tool-cup-tool-1-handle" x="-26" y="-105" width="11" height="43" rx="3" fill={palette.rust} stroke={palette.ink} strokeWidth="1.5" />
        <path id={`${idPrefix}--cart-tool-cup-tool-1-grip`} data-part="cart-tool-cup-tool-1-grip" d="M-22 -99 V-71" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--cart-tool-cup-tool-2`} data-part="cart-tool-cup-tool-2" display={hiddenParts?.includes("cart-tool-cup-tool-2") ? "none" : undefined} transform="rotate(3 -3 0)">
        <path id={`${idPrefix}--cart-tool-cup-tool-2-shaft`} data-part="cart-tool-cup-tool-2-shaft" d="M-4 -8 L-4 -65 L-1 -65 L-1 -8 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <rect id={`${idPrefix}--cart-tool-cup-tool-2-handle`} data-part="cart-tool-cup-tool-2-handle" x="-8" y="-95" width="11" height="43" rx="3" fill={palette.rust} stroke={palette.ink} strokeWidth="1.5" />
        <path id={`${idPrefix}--cart-tool-cup-tool-2-grip`} data-part="cart-tool-cup-tool-2-grip" d="M-4 -89 V-61" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g id={`${idPrefix}--cart-tool-cup-tool-3`} data-part="cart-tool-cup-tool-3" display={hiddenParts?.includes("cart-tool-cup-tool-3") ? "none" : undefined} transform="rotate(18 20 0)">
        <path id={`${idPrefix}--cart-tool-cup-tool-3-shaft`} data-part="cart-tool-cup-tool-3-shaft" d="M19 -8 L19 -58 L22 -58 L22 -8 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        <rect id={`${idPrefix}--cart-tool-cup-tool-3-handle`} data-part="cart-tool-cup-tool-3-handle" x="15" y="-88" width="11" height="43" rx="3" fill={palette.rust} stroke={palette.ink} strokeWidth="1.5" />
        <path id={`${idPrefix}--cart-tool-cup-tool-3-grip`} data-part="cart-tool-cup-tool-3-grip" d="M19 -82 V-54" fill="none" stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path id={`${idPrefix}--cart-tool-cup-cup`} data-part="cart-tool-cup-cup" d="M-28 -57 L27 -59 L27 2 Q0 13 -27 7 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse id={`${idPrefix}--cart-tool-cup-cup-rim`} data-part="cart-tool-cup-cup-rim" cx="0" cy="-58" rx="28" ry="6" fill="none" stroke={palette.ink} strokeWidth="1.4" />
      <path id={`${idPrefix}--cart-tool-cup-cup-side`} data-part="cart-tool-cup-cup-side" d="M12 -57 L27 -59 L27 2 L13 8 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
    </g>
  );
});
