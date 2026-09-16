import { memo } from 'react';
import type { ArtProps } from '../types';

/** Desk plant / independent leaves. Local geometry: placement belongs to RoomObject. */
export const DeskPlant = memo(function DeskPlant({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--desk-plant`} data-part="desk-plant" display={hiddenParts?.includes("desk-plant") ? "none" : undefined} data-art="desk-plant">
      <ellipse id={`${idPrefix}--desk-plant-pot-contact`} data-part="desk-plant-pot-contact" cx="0" cy="6" rx="39" ry="9" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.12" />
      <path id={`${idPrefix}--desk-plant-stems`} data-part="desk-plant-stems" d="M0 -46 C-14 -80 -18 -111 -13 -144 M-4 -49 C14 -90 34 -93 58 -101 M-3 -48 C-14 -97 -44 -97 -76 -88 M-1 -48 C10 -93 10 -120 24 -140" fill="none" stroke={palette.ink} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <g id={`${idPrefix}--desk-plant-leaf-left-low-motion`} data-part="desk-plant-leaf-left-low-motion" display={hiddenParts?.includes("desk-plant-leaf-left-low-motion") ? "none" : undefined} data-motion="leaf" data-pivot="-18,-75" data-phase="0.1">
        <path id={`${idPrefix}--desk-plant-leaf-left-low-blade`} data-part="desk-plant-leaf-left-low-blade" d="M-18 -75 C-38.23 -91.02 -64.73 -82.11 -77 -62 C-55.03 -54.96 -32.99 -58.80 -18 -75 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--desk-plant-leaf-left-low-lit-half`} data-part="desk-plant-leaf-left-low-lit-half" d="M-18 -75 Q-51.69 -70.65 -77 -62 C-55.03 -54.96 -32.99 -58.80 -18 -75 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.59" />
        <path id={`${idPrefix}--desk-plant-leaf-left-low-vein`} data-part="desk-plant-leaf-left-low-vein" d="M-18 -75 Q-51.04 -67.72 -77 -62" fill="none" stroke={palette.paper} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      </g>
      <g id={`${idPrefix}--desk-plant-leaf-left-mid-motion`} data-part="desk-plant-leaf-left-mid-motion" display={hiddenParts?.includes("desk-plant-leaf-left-mid-motion") ? "none" : undefined} data-motion="leaf" data-pivot="-19,-84" data-phase="0.6">
        <path id={`${idPrefix}--desk-plant-leaf-left-mid-blade`} data-part="desk-plant-leaf-left-mid-blade" d="M-19 -84 C-30.46 -108.44 -59.27 -112.28 -80 -99 C-62.78 -82.22 -40.46 -75.65 -19 -84 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--desk-plant-leaf-left-mid-lit-half`} data-part="desk-plant-leaf-left-mid-lit-half" d="M-19 -84 Q-52.41 -95.46 -80 -99 C-62.78 -82.22 -40.46 -75.65 -19 -84 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.59" />
        <path id={`${idPrefix}--desk-plant-leaf-left-mid-vein`} data-part="desk-plant-leaf-left-mid-vein" d="M-19 -84 Q-53.16 -92.40 -80 -99" fill="none" stroke={palette.paper} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      </g>
      <g id={`${idPrefix}--desk-plant-leaf-left-high-motion`} data-part="desk-plant-leaf-left-high-motion" display={hiddenParts?.includes("desk-plant-leaf-left-high-motion") ? "none" : undefined} data-motion="leaf" data-pivot="-17,-102" data-phase="1.2">
        <path id={`${idPrefix}--desk-plant-leaf-left-high-blade`} data-part="desk-plant-leaf-left-high-blade" d="M-17 -102 C-16.28 -122.49 -34.41 -134.94 -53 -133 C-47.18 -115.74 -34.38 -103.66 -17 -102 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--desk-plant-leaf-left-high-lit-half`} data-part="desk-plant-leaf-left-high-lit-half" d="M-17 -102 Q-35.59 -121.18 -53 -133 C-47.18 -115.74 -34.38 -103.66 -17 -102 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.59" />
        <path id={`${idPrefix}--desk-plant-leaf-left-high-vein`} data-part="desk-plant-leaf-left-high-vein" d="M-17 -102 Q-37.16 -119.36 -53 -133" fill="none" stroke={palette.paper} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      </g>
      <g id={`${idPrefix}--desk-plant-leaf-top-motion`} data-part="desk-plant-leaf-top-motion" display={hiddenParts?.includes("desk-plant-leaf-top-motion") ? "none" : undefined} data-motion="leaf" data-pivot="-8,-102" data-phase="1.7">
        <path id={`${idPrefix}--desk-plant-leaf-top-blade`} data-part="desk-plant-leaf-top-blade" d="M-8 -102 C18.06 -102.97 33.17 -127.35 30 -151 C8.29 -141.94 -6.56 -124.42 -8 -102 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--desk-plant-leaf-top-lit-half`} data-part="desk-plant-leaf-top-lit-half" d="M-8 -102 Q15.65 -127.60 30 -151 C8.29 -141.94 -6.56 -124.42 -8 -102 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.59" />
        <path id={`${idPrefix}--desk-plant-leaf-top-vein`} data-part="desk-plant-leaf-top-vein" d="M-8 -102 Q13.28 -129.44 30 -151" fill="none" stroke={palette.paper} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      </g>
      <g id={`${idPrefix}--desk-plant-leaf-right-high-motion`} data-part="desk-plant-leaf-right-high-motion" display={hiddenParts?.includes("desk-plant-leaf-right-high-motion") ? "none" : undefined} data-motion="leaf" data-pivot="6,-100" data-phase="2.3">
        <path id={`${idPrefix}--desk-plant-leaf-right-high-blade`} data-part="desk-plant-leaf-right-high-blade" d="M6 -100 C28.30 -82.88 58.99 -91.96 74 -113 C49.27 -120.67 23.92 -116.89 6 -100 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--desk-plant-leaf-right-high-lit-half`} data-part="desk-plant-leaf-right-high-lit-half" d="M6 -100 Q44.67 -104.19 74 -113 C49.27 -120.67 23.92 -116.89 6 -100 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.59" />
        <path id={`${idPrefix}--desk-plant-leaf-right-high-vein`} data-part="desk-plant-leaf-right-high-vein" d="M6 -100 Q44.08 -107.28 74 -113" fill="none" stroke={palette.paper} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      </g>
      <g id={`${idPrefix}--desk-plant-leaf-right-motion`} data-part="desk-plant-leaf-right-motion" display={hiddenParts?.includes("desk-plant-leaf-right-motion") ? "none" : undefined} data-motion="leaf" data-pivot="7,-77" data-phase="2.8">
        <path id={`${idPrefix}--desk-plant-leaf-right-blade`} data-part="desk-plant-leaf-right-blade" d="M7 -77 C18.80 -52.54 48.06 -48.70 69 -62 C51.40 -78.79 28.71 -85.36 7 -77 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--desk-plant-leaf-right-lit-half`} data-part="desk-plant-leaf-right-lit-half" d="M7 -77 Q40.98 -65.54 69 -62 C51.40 -78.79 28.71 -85.36 7 -77 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.59" />
        <path id={`${idPrefix}--desk-plant-leaf-right-vein`} data-part="desk-plant-leaf-right-vein" d="M7 -77 Q41.72 -68.60 69 -62" fill="none" stroke={palette.paper} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      </g>
      <g id={`${idPrefix}--desk-plant-leaf-center-motion`} data-part="desk-plant-leaf-center-motion" display={hiddenParts?.includes("desk-plant-leaf-center-motion") ? "none" : undefined} data-motion="leaf" data-pivot="-3,-79" data-phase="3.4">
        <path id={`${idPrefix}--desk-plant-leaf-center-blade`} data-part="desk-plant-leaf-center-blade" d="M-3 -79 C14.59 -97.02 9.45 -124.85 -8 -140 C-17.33 -118.97 -16.43 -96.32 -3 -79 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--desk-plant-leaf-center-lit-half`} data-part="desk-plant-leaf-center-lit-half" d="M-3 -79 Q-2.96 -113.39 -8 -140 C-17.33 -118.97 -16.43 -96.32 -3 -79 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.59" />
        <path id={`${idPrefix}--desk-plant-leaf-center-vein`} data-part="desk-plant-leaf-center-vein" d="M-3 -79 Q-5.80 -113.16 -8 -140" fill="none" stroke={palette.paper} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      </g>
      <g id={`${idPrefix}--desk-plant-leaf-low-motion`} data-part="desk-plant-leaf-low-motion" display={hiddenParts?.includes("desk-plant-leaf-low-motion") ? "none" : undefined} data-motion="leaf" data-pivot="-3,-59" data-phase="3.8">
        <path id={`${idPrefix}--desk-plant-leaf-low-blade`} data-part="desk-plant-leaf-low-blade" d="M-3 -59 C17.92 -50.62 36.31 -64.89 40 -85 C20.41 -85.35 4.03 -76.50 -3 -59 Z" fill={palette.ink} stroke={palette.ink} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path id={`${idPrefix}--desk-plant-leaf-low-lit-half`} data-part="desk-plant-leaf-low-lit-half" d="M-3 -59 Q22.48 -71.25 40 -85 C20.41 -85.35 4.03 -76.50 -3 -59 Z" fill={palette.paper} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.59" />
        <path id={`${idPrefix}--desk-plant-leaf-low-vein`} data-part="desk-plant-leaf-low-vein" d="M-3 -59 Q21.08 -73.56 40 -85" fill="none" stroke={palette.paper} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.65" />
      </g>
      <path id={`${idPrefix}--desk-plant-pot-body`} data-part="desk-plant-pot-body" d="M-34 -44 L33 -44 L23 6 Q-2 15 -24 5 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--desk-plant-pot-side-shade`} data-part="desk-plant-pot-side-shade" d="M19 -43 L33 -44 L23 6 Q16 11 9 10 Z" fill={palette.ink} stroke="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.11" />
      <ellipse id={`${idPrefix}--desk-plant-pot-rim`} data-part="desk-plant-pot-rim" cx="0" cy="-44" rx="35" ry="8" fill={palette.rust} stroke={palette.ink} strokeWidth="1.5" />
      <ellipse id={`${idPrefix}--desk-plant-soil`} data-part="desk-plant-soil" cx="0" cy="-44" rx="29" ry="4.5" fill={palette.ink} stroke={palette.ink} strokeWidth="0.8" />
      <path id={`${idPrefix}--desk-plant-front-rim`} data-part="desk-plant-front-rim" d="M-32 -42 Q0 -33 32 -43" fill="none" stroke={palette.ink} strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
      <path id={`${idPrefix}--desk-plant-saucer`} data-part="desk-plant-saucer" d="M-30 6 Q-1 16 31 7 L30 13 Q0 22 -29 14 Z" fill={palette.rust} stroke={palette.ink} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
});
