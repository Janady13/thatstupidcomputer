/** Construct a trusted, validated rig without parsing or injecting HTML. */
const NS = 'http://www.w3.org/2000/svg';
export function createCharacterSVG(model, prefix) {
  const make = (tag, attrs) => { const e = document.createElementNS(NS, tag); for (const [k,v] of Object.entries(attrs)) e.setAttribute(k, String(v)); return e; };
  const svg = make('svg', { xmlns: NS, width: model.width, height: model.height, viewBox: `0 0 ${model.width} ${model.height}`, 'aria-hidden': 'true' });
  const add = n => {
    const attrs = { id: prefix + '--' + n.id, 'data-rig-id': n.id, opacity: n.opacity ?? 1 };
    const e = n.type === 'group' ? make('g', { ...attrs, transform: `translate(${n.x ?? 0} ${n.y ?? 0}) rotate(${n.rotation ?? 0}) scale(${n.scaleX ?? 1} ${n.scaleY ?? 1})` }) : make('path', { ...attrs, d: n.d, fill: n.fill, stroke: n.stroke, 'stroke-width': n.strokeWidth, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    for (const child of n.children || []) e.append(add(child));
    return e;
  };
  svg.append(add(model.root)); return svg;
}
