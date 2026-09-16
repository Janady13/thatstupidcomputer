import { DEFAULT_OBJECTS, LAYERS } from './catalog';
import type { RoomAddition, RoomItem, RoomOverrides } from './types';

const NAME = /^[a-z][a-z0-9-]*$/;
/** Validate a small, explicit scene graph before rendering it. */
export function resolveObjects(
  overrides: RoomOverrides = {}, additions: readonly RoomAddition[] = [],
): RoomItem[] {
  const templates = new Map(DEFAULT_OBJECTS.map(item => [item.kind, item]));
  const all: RoomItem[] = DEFAULT_OBJECTS.map(item => ({ ...item }));
  const ids = new Set(all.map(item => item.id));
  for (const addition of additions) {
    if (!NAME.test(addition.id) || ids.has(addition.id)) {
      throw new Error(`Room object ID must be unique and kebab-case: ${addition.id}`);
    }
    const template = templates.get(addition.kind);
    if (!template) throw new Error(`Unknown room artwork kind: ${addition.kind}`);
    all.push({ ...template, ...addition });
    ids.add(addition.id);
  }
  for (const key of Object.keys(overrides)) {
    if (!ids.has(key)) throw new Error(`Cannot override unknown room object: ${key}`);
  }
  for (let i = 0; i < all.length; i++) {
    const item = all[i] = { ...all[i], ...overrides[all[i].id] };
    for (const property of ['x', 'y', 'scale', 'rotation'] as const) {
      if (!Number.isFinite(item[property])) throw new TypeError(`${item.id}.${property} must be finite.`);
    }
    if (item.scale <= 0) throw new RangeError(`${item.id}.scale must be positive.`);
    if (!LAYERS.includes(item.layer)) throw new RangeError(`Unknown room layer: ${item.layer}`);
    if (item.parent !== null && !ids.has(item.parent)) throw new Error(`Missing parent of ${item.id}: ${item.parent}`);
  }
  const map = new Map(all.map(item => [item.id, item]));
  for (const item of all) {
    const seen = new Set([item.id]);
    let parent = item.parent;
    while (parent) {
      if (seen.has(parent)) throw new Error(`Scene parenting cycle at: ${item.id}`);
      seen.add(parent);
      parent = map.get(parent)!.parent;
    }
  }
  return all;
}

/** Never strip characters from an ID: lossless encoding avoids sanitizer collisions. */
export function instancePrefix(id: string): string {
  return 'office-' + Array.from(id, char => char.codePointAt(0)!.toString(16)).join('-');
}

export function placement(item: Pick<RoomItem, 'x' | 'y' | 'rotation' | 'scale'>): string {
  return `translate(${item.x} ${item.y}) rotate(${item.rotation}) scale(${item.scale})`;
}
