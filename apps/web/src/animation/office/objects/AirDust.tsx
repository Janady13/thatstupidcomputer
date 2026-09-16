import { memo } from 'react';
import type { ArtProps } from '../types';

/** Air / a few editable dust motes. Local geometry: placement belongs to RoomObject. */
export const AirDust = memo(function AirDust({ idPrefix, palette, hiddenParts }: ArtProps) {
  return (
    <g id={`${idPrefix}--air-dust`} data-part="air-dust" display={hiddenParts?.includes("air-dust") ? "none" : undefined} data-art="air-dust">
      <g id={`${idPrefix}--air-dust-mote-1-motion`} data-part="air-dust-mote-1-motion" display={hiddenParts?.includes("air-dust-mote-1-motion") ? "none" : undefined} data-motion="dust" data-phase="0.0">
        <circle id={`${idPrefix}--air-dust-mote-1`} data-part="air-dust-mote-1" cx="460" cy="276" r="1.5" fill={palette.paper} stroke="none" strokeWidth="1.5" opacity="0.75" />
        <circle id={`${idPrefix}--air-dust-mote-1-edge`} data-part="air-dust-mote-1-edge" cx="460.7" cy="276.8" r="0.675" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.18" />
      </g>
      <g id={`${idPrefix}--air-dust-mote-2-motion`} data-part="air-dust-mote-2-motion" display={hiddenParts?.includes("air-dust-mote-2-motion") ? "none" : undefined} data-motion="dust" data-phase="0.137">
        <circle id={`${idPrefix}--air-dust-mote-2`} data-part="air-dust-mote-2" cx="491" cy="244" r="1" fill={palette.paper} stroke="none" strokeWidth="1.5" opacity="0.75" />
        <circle id={`${idPrefix}--air-dust-mote-2-edge`} data-part="air-dust-mote-2-edge" cx="491.7" cy="244.8" r="0.45" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.18" />
      </g>
      <g id={`${idPrefix}--air-dust-mote-3-motion`} data-part="air-dust-mote-3-motion" display={hiddenParts?.includes("air-dust-mote-3-motion") ? "none" : undefined} data-motion="dust" data-phase="0.274">
        <circle id={`${idPrefix}--air-dust-mote-3`} data-part="air-dust-mote-3" cx="544" cy="293" r="1.3" fill={palette.paper} stroke="none" strokeWidth="1.5" opacity="0.75" />
        <circle id={`${idPrefix}--air-dust-mote-3-edge`} data-part="air-dust-mote-3-edge" cx="544.7" cy="293.8" r="0.5850000000000001" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.18" />
      </g>
      <g id={`${idPrefix}--air-dust-mote-4-motion`} data-part="air-dust-mote-4-motion" display={hiddenParts?.includes("air-dust-mote-4-motion") ? "none" : undefined} data-motion="dust" data-phase="0.41100000000000003">
        <circle id={`${idPrefix}--air-dust-mote-4`} data-part="air-dust-mote-4" cx="583" cy="241" r="1.1" fill={palette.paper} stroke="none" strokeWidth="1.5" opacity="0.75" />
        <circle id={`${idPrefix}--air-dust-mote-4-edge`} data-part="air-dust-mote-4-edge" cx="583.7" cy="241.8" r="0.49500000000000005" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.18" />
      </g>
      <g id={`${idPrefix}--air-dust-mote-5-motion`} data-part="air-dust-mote-5-motion" display={hiddenParts?.includes("air-dust-mote-5-motion") ? "none" : undefined} data-motion="dust" data-phase="0.548">
        <circle id={`${idPrefix}--air-dust-mote-5`} data-part="air-dust-mote-5" cx="1081" cy="340" r="1.4" fill={palette.paper} stroke="none" strokeWidth="1.5" opacity="0.75" />
        <circle id={`${idPrefix}--air-dust-mote-5-edge`} data-part="air-dust-mote-5-edge" cx="1081.7" cy="340.8" r="0.63" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.18" />
      </g>
      <g id={`${idPrefix}--air-dust-mote-6-motion`} data-part="air-dust-mote-6-motion" display={hiddenParts?.includes("air-dust-mote-6-motion") ? "none" : undefined} data-motion="dust" data-phase="0.685">
        <circle id={`${idPrefix}--air-dust-mote-6`} data-part="air-dust-mote-6" cx="1120" cy="224" r="0.9" fill={palette.paper} stroke="none" strokeWidth="1.5" opacity="0.75" />
        <circle id={`${idPrefix}--air-dust-mote-6-edge`} data-part="air-dust-mote-6-edge" cx="1120.7" cy="224.8" r="0.405" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.18" />
      </g>
      <g id={`${idPrefix}--air-dust-mote-7-motion`} data-part="air-dust-mote-7-motion" display={hiddenParts?.includes("air-dust-mote-7-motion") ? "none" : undefined} data-motion="dust" data-phase="0.8220000000000001">
        <circle id={`${idPrefix}--air-dust-mote-7`} data-part="air-dust-mote-7" cx="991" cy="360" r="0.8" fill={palette.paper} stroke="none" strokeWidth="1.5" opacity="0.75" />
        <circle id={`${idPrefix}--air-dust-mote-7-edge`} data-part="air-dust-mote-7-edge" cx="991.7" cy="360.8" r="0.36000000000000004" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.18" />
      </g>
      <g id={`${idPrefix}--air-dust-mote-8-motion`} data-part="air-dust-mote-8-motion" display={hiddenParts?.includes("air-dust-mote-8-motion") ? "none" : undefined} data-motion="dust" data-phase="0.9590000000000001">
        <circle id={`${idPrefix}--air-dust-mote-8`} data-part="air-dust-mote-8" cx="649" cy="396" r="1.2" fill={palette.paper} stroke="none" strokeWidth="1.5" opacity="0.75" />
        <circle id={`${idPrefix}--air-dust-mote-8-edge`} data-part="air-dust-mote-8-edge" cx="649.7" cy="396.8" r="0.54" fill={palette.ink} stroke="none" strokeWidth="1.5" opacity="0.18" />
      </g>
    </g>
  );
});
