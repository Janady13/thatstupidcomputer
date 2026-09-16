import { createElement, memo } from 'react';
import type { ReactElement } from 'react';
import type { ArtProps } from '../office/types';
import { createGestureGeometry } from './gesture-geometry.mjs';
import type { GestureLayer, GestureNode } from './gesture-geometry.mjs';

/** Same DOM-free geometry tree used by the standalone SVG proof renderer. */
export const DesktopGestures = memo(function DesktopGestures({ idPrefix, palette, layer = 'arms' }: Pick<ArtProps, 'idPrefix' | 'palette'> & {layer?:GestureLayer}) {
  function render(node:GestureNode):ReactElement {
    const attrs = {...node.attrs};
    if ('pointer-events' in attrs) {
      attrs.pointerEvents = attrs['pointer-events'];
      delete attrs['pointer-events'];
    }
    return createElement(node.tag, {...attrs,id:`${idPrefix}--${node.id}`,'data-rig-id':node.id,key:node.id}, ...node.children.map(render));
  }
  return render(createGestureGeometry(palette,layer));
});
