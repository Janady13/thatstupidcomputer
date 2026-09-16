import { memo } from 'react';
import type { ReactNode } from 'react';
import { ART } from './registry';
import { placement } from './model';
import type { RoomItem, RoomPalette } from './types';

interface Props {
  item: RoomItem;
  items: readonly RoomItem[];
  idPrefix: string;
  palette: RoomPalette;
  slot: (parent: string) => ReactNode;
}

export const RoomObject = memo(function RoomObject({ item, items, idPrefix, palette, slot }: Props) {
  if (!item.visible) return null;
  const Art = ART[item.kind];
  const children = items.filter(child => child.parent === item.id);
  const render = (child: RoomItem) => <RoomObject key={child.id} item={child} items={items} idPrefix={idPrefix} palette={palette} slot={slot} />;
  return (
    <g id={`${idPrefix}--object-${item.id}`} data-object={item.id} data-kind={item.kind} transform={placement(item)}>
      {children.filter(child => child.stack === 'under').map(render)}
      <Art idPrefix={`${idPrefix}--${item.id}`} palette={palette} hiddenParts={item.hiddenParts} />
      <g id={`${idPrefix}--${item.id}-attachments`} data-attachments={item.id}>
        {children.filter(child => child.stack !== 'under').map(render)}
        {slot(item.id)}
      </g>
    </g>
  );
});
