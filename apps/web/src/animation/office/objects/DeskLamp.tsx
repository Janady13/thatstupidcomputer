import { memo } from 'react';
import type { ArtProps } from '../types';

/** Articulated desk lamp. Local geometry: placement belongs to RoomObject. */
export const DeskLamp = memo(function DeskLamp({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--desk-lamp`} data-part="desk-lamp" display={hiddenParts?.includes("desk-lamp") ? "none" : undefined} data-art="desk-lamp">
      <path id={`${idPrefix}--desk-lamp-lamp-cord`} data-part="desk-lamp-lamp-cord" d="M-16 -6 C-60 -30 -72 24 -44 35 C-28 39 -21 20 -9 24" fill="none" stroke={palette.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse id={`${idPrefix}--desk-lamp-contact-shadow`} data-part="desk-lamp-contact-shadow" cx="0" cy="6" rx="43" ry="9" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.12" />
      <path id={`${idPrefix}--desk-lamp-base`} data-part="desk-lamp-base" d="M-43 -1 Q-44 -12 -12 -15 Q16 -17 35 -6 L41 2 Q19 16 -36 9 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--desk-lamp-base-top`} data-part="desk-lamp-base-top" d="M-37 -5 Q-25 -17 4 -14 Q26 -13 31 -7 Q22 2 -7 3 Q-29 3 -37 -5 Z" fill={palette.paper} stroke={palette.ink} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--desk-lamp-base-dark`} data-part="desk-lamp-base-dark" d="M-33 7 Q6 14 38 3 L37 8 Q1 21 -35 12 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.17" />
      <path id={`${idPrefix}--desk-lamp-upright`} data-part="desk-lamp-upright" d="M-4 -6 L-4 -30 Q2 -37 9 -29 L12 -7 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <g id={`${idPrefix}--desk-lamp-arm-assembly`} data-part="desk-lamp-arm-assembly" display={hiddenParts?.includes("desk-lamp-arm-assembly") ? "none" : undefined}>
        <g id={`${idPrefix}--desk-lamp-lower-arm-motion`} data-part="desk-lamp-lower-arm-motion" display={hiddenParts?.includes("desk-lamp-lower-arm-motion") ? "none" : undefined} data-motion="lamp-lower-arm" data-pivot="8,-29">
          <path id={`${idPrefix}--desk-lamp-lower-arm`} data-part="desk-lamp-lower-arm" d="M-1 -25 L-65 -168 L-57 -178 L11 -31 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path id={`${idPrefix}--desk-lamp-lower-link`} data-part="desk-lamp-lower-link" d="M7 -34 L-52 -169" fill="none" stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path id={`${idPrefix}--desk-lamp-lower-link-highlight`} data-part="desk-lamp-lower-link-highlight" d="M-1 -38 L-56 -164" fill="none" stroke={palette.paper} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
          <path id={`${idPrefix}--desk-lamp-spring`} data-part="desk-lamp-spring" d="M-9 -69 l-10 0 7 -8 -12 -1 7 -9 -12 -1 6 -9 -12 -1 5 -9 -9 -3" fill="none" stroke={palette.ink} strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse id={`${idPrefix}--desk-lamp-base-hinge`} data-part="desk-lamp-base-hinge" cx="8" cy="-29" rx="10" ry="12" fill={palette.rust} stroke={palette.ink} strokeWidth="1.8" />
          <ellipse id={`${idPrefix}--desk-lamp-base-hinge-pin`} data-part="desk-lamp-base-hinge-pin" cx="8" cy="-29" rx="3" ry="5" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
          <ellipse id={`${idPrefix}--desk-lamp-elbow`} data-part="desk-lamp-elbow" cx="-54" cy="-173" rx="10" ry="12" fill={palette.rust} stroke={palette.ink} strokeWidth="1.8" />
          <ellipse id={`${idPrefix}--desk-lamp-elbow-pin`} data-part="desk-lamp-elbow-pin" cx="-54" cy="-173" rx="3" ry="5" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
          <g id={`${idPrefix}--desk-lamp-upper-arm-motion`} data-part="desk-lamp-upper-arm-motion" display={hiddenParts?.includes("desk-lamp-upper-arm-motion") ? "none" : undefined} data-motion="lamp-upper-arm" data-pivot="-54,-173">
            <path id={`${idPrefix}--desk-lamp-upper-arm`} data-part="desk-lamp-upper-arm" d="M-57 -180 L53 -287 L65 -278 L-50 -166 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path id={`${idPrefix}--desk-lamp-upper-link`} data-part="desk-lamp-upper-link" d="M-53 -171 L57 -281" fill="none" stroke={palette.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path id={`${idPrefix}--desk-lamp-upper-highlight`} data-part="desk-lamp-upper-highlight" d="M-55 -179 L52 -284" fill="none" stroke={palette.paper} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            <path id={`${idPrefix}--desk-lamp-upper-spring`} data-part="desk-lamp-upper-spring" d="M-31 -188 l3 -11 10 1 2 -12 11 0 2 -10 11 -1 1 -10" fill="none" stroke={palette.ink} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            <ellipse id={`${idPrefix}--desk-lamp-neck`} data-part="desk-lamp-neck" cx="60" cy="-282" rx="10" ry="12" fill={palette.rust} stroke={palette.ink} strokeWidth="1.8" />
            <ellipse id={`${idPrefix}--desk-lamp-neck-pin`} data-part="desk-lamp-neck-pin" cx="60" cy="-282" rx="3" ry="5" fill={palette.paper} stroke={palette.ink} strokeWidth="1" />
            <g id={`${idPrefix}--desk-lamp-head-motion`} data-part="desk-lamp-head-motion" display={hiddenParts?.includes("desk-lamp-head-motion") ? "none" : undefined} data-motion="lamp-head" data-pivot="61,-282" data-phase="0.2">
              <g id={`${idPrefix}--desk-lamp-light-pool`} data-part="desk-lamp-light-pool" display={hiddenParts?.includes("desk-lamp-light-pool") ? "none" : undefined} data-motion="lamp-light">
                <path id={`${idPrefix}--desk-lamp-beam`} data-part="desk-lamp-beam" d="M66 -182 L188 -238 L320 -1 Q171 40 3 5 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.16" />
                <ellipse id={`${idPrefix}--desk-lamp-desk-pool`} data-part="desk-lamp-desk-pool" cx="151" cy="3" rx="130" ry="15" fill={palette.rust} stroke="none" strokeWidth="1.5" opacity="0.045" />
              </g>
              <path id={`${idPrefix}--desk-lamp-neck-hook`} data-part="desk-lamp-neck-hook" d="M62 -286 C26 -323 72 -344 80 -315" fill="none" stroke={palette.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path id={`${idPrefix}--desk-lamp-socket`} data-part="desk-lamp-socket" d="M65 -326 Q81 -338 102 -324 L113 -292 L77 -278 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              <path id={`${idPrefix}--desk-lamp-vent-1`} data-part="desk-lamp-vent-1" d="M76 -321 l5 16" fill="none" stroke={palette.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path id={`${idPrefix}--desk-lamp-vent-2`} data-part="desk-lamp-vent-2" d="M82 -321 l5 16" fill="none" stroke={palette.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path id={`${idPrefix}--desk-lamp-vent-3`} data-part="desk-lamp-vent-3" d="M88 -321 l5 16" fill="none" stroke={palette.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path id={`${idPrefix}--desk-lamp-vent-4`} data-part="desk-lamp-vent-4" d="M94 -321 l5 16" fill="none" stroke={palette.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path id={`${idPrefix}--desk-lamp-shade`} data-part="desk-lamp-shade" d="M84 -292 C123 -302 171 -274 189 -242 C172 -214 109 -181 63 -178 C39 -214 48 -263 84 -292 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path id={`${idPrefix}--desk-lamp-shade-side`} data-part="desk-lamp-shade-side" d="M74 -284 C54 -247 60 -212 68 -187 L61 -178 C39 -214 48 -262 74 -284 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.17" />
              <path id={`${idPrefix}--desk-lamp-shade-seam`} data-part="desk-lamp-shade-seam" d="M88 -287 C72 -255 77 -225 88 -205" fill="none" stroke={palette.paper} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
              <ellipse id={`${idPrefix}--desk-lamp-shade-opening`} data-part="desk-lamp-shade-opening" cx="127" cy="-211" rx="70" ry="24" fill={palette.paper} stroke={palette.ink} strokeWidth="2" transform="rotate(-24 127 -211)" />
              <path id={`${idPrefix}--desk-lamp-bulb`} data-part="desk-lamp-bulb" d="M109 -203 Q114 -189 129 -196 Q144 -202 138 -218" fill={palette.paper} stroke={palette.ink} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
});
