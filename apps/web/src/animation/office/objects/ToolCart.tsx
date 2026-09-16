import { memo } from 'react';
import type { ArtProps } from '../types';

/** Rolling service cart / open shelves. Local geometry: placement belongs to RoomObject. */
export const ToolCart = memo(function ToolCart({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--tool-cart`} data-part="tool-cart" display={hiddenParts?.includes("tool-cart") ? "none" : undefined} data-art="tool-cart">
      <path id={`${idPrefix}--tool-cart-rear-leg`} data-part="tool-cart-rear-leg" d="M245 -21 L272 -26 L271 246 L249 263 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--tool-cart-upper-top`} data-part="tool-cart-upper-top" d="M0 -1 L245 -26 L272 -13 L28 24 L0 19 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--tool-cart-upper-rim`} data-part="tool-cart-upper-rim" d="M0 13 L272 -13 L272 10 L0 42 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--tool-cart-lower-shelf`} data-part="tool-cart-lower-shelf" d="M0 215 L241 169 L268 183 L28 247 L0 240 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--tool-cart-lower-rim`} data-part="tool-cart-lower-rim" d="M0 232 L268 183 L268 204 L0 260 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--tool-cart-front-leg-left`} data-part="tool-cart-front-leg-left" d="M19 25 L43 24 L40 310 L18 316 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--tool-cart-front-leg-right`} data-part="tool-cart-front-leg-right" d="M242 1 L261 0 L259 238 L241 242 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--tool-cart-front-caster-fork`} data-part="tool-cart-front-caster-fork" d="M17 300 L35 295 L39 325 L21 330 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse id={`${idPrefix}--tool-cart-front-caster-wheel`} data-part="tool-cart-front-caster-wheel" cx="27" cy="331" rx="11" ry="22" fill={palette.ink} stroke={palette.ink} strokeWidth="1.5" />
      <ellipse id={`${idPrefix}--tool-cart-front-caster-hub`} data-part="tool-cart-front-caster-hub" cx="28" cy="331" rx="4.5" ry="10" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
      <path id={`${idPrefix}--tool-cart-right-caster-fork`} data-part="tool-cart-right-caster-fork" d="M240 236 L258 231 L262 261 L244 266 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse id={`${idPrefix}--tool-cart-right-caster-wheel`} data-part="tool-cart-right-caster-wheel" cx="250" cy="267" rx="11" ry="22" fill={palette.ink} stroke={palette.ink} strokeWidth="1.5" />
      <ellipse id={`${idPrefix}--tool-cart-right-caster-hub`} data-part="tool-cart-right-caster-hub" cx="251" cy="267" rx="4.5" ry="10" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
      <path id={`${idPrefix}--tool-cart-rear-caster`} data-part="tool-cart-rear-caster" d="M12 249 a8 15 0 1 0 16 0 a8 15 0 1 0 -16 0" fill={palette.ink} stroke={palette.ink} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--tool-cart-shelf-seam`} data-part="tool-cart-shelf-seam" d="M48 247 L236 202" fill="none" stroke={palette.ink} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--tool-cart-cart-bolt-1-head`} data-part="tool-cart-cart-bolt-1-head" cx="31" cy="61" r="2.3" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" />
      <path id={`${idPrefix}--tool-cart-cart-bolt-1-slot`} data-part="tool-cart-cart-bolt-1-slot" d="M29.62 61.805 L32.38 60.195" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--tool-cart-cart-bolt-2-head`} data-part="tool-cart-cart-bolt-2-head" cx="250" cy="28" r="2.3" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" />
      <path id={`${idPrefix}--tool-cart-cart-bolt-2-slot`} data-part="tool-cart-cart-bolt-2-slot" d="M248.62 28.805 L251.38 27.195" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--tool-cart-cart-bolt-3-head`} data-part="tool-cart-cart-bolt-3-head" cx="249" cy="188" r="2.3" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" />
      <path id={`${idPrefix}--tool-cart-cart-bolt-3-slot`} data-part="tool-cart-cart-bolt-3-slot" d="M247.62 188.805 L250.38 187.195" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle id={`${idPrefix}--tool-cart-cart-bolt-4-head`} data-part="tool-cart-cart-bolt-4-head" cx="30" cy="265" r="2.3" fill={palette.paper} stroke={palette.ink} strokeWidth="0.9" />
      <path id={`${idPrefix}--tool-cart-cart-bolt-4-slot`} data-part="tool-cart-cart-bolt-4-slot" d="M28.62 265.805 L31.38 264.195" fill="none" stroke={palette.ink} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
