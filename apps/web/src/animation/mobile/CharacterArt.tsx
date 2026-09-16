import { forwardRef, useId } from 'react';
import type { CSSProperties } from 'react';
import type { CharacterModel, VectorNode } from './types';
function transform(n: VectorNode): string {
  return `translate(${n.x ?? 0} ${n.y ?? 0}) rotate(${n.rotation ?? 0}) scale(${n.scaleX ?? 1} ${n.scaleY ?? 1})`;
}
function Part({ node: n, prefix }: { node: VectorNode; prefix: string }) {
  const attrs={id: `${prefix}${n.id}`, 'data-rig-id': n.id, 'data-name': n.id, opacity: n.opacity ?? 1};
  return n.type==='group'
    ? <g {...attrs} transform={transform(n)}>{n.children?.map(child=><Part key={child.id} node={child} prefix={prefix}/>)}</g>
    : <path {...attrs} d={n.d} fill={n.fill} stroke={n.stroke} strokeWidth={n.strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>;
}
export interface CharacterArtProps { model: CharacterModel; className?: string; style?: CSSProperties; decorative?: boolean; }
/** Editable JSX paths, scoped IDs, no innerHTML or embedded raster. Safe for static/server rendering. */
export const CharacterArt=forwardRef<SVGSVGElement, CharacterArtProps>(function CharacterArt({model,className,style,decorative=true},ref){
  const id=Array.from(useId(), c => c.codePointAt(0)!.toString(16)).join('-');const prefix=`cast-${id}-${model.slug}--`;
  return <svg ref={ref} xmlns="http://www.w3.org/2000/svg" width={model.width} height={model.height}
    viewBox={`0 0 ${model.width} ${model.height}`} className={className} style={style}
    role={decorative?undefined:'img'} aria-hidden={decorative?true:undefined} aria-labelledby={decorative?undefined:prefix+'title'}>
    <title id={prefix+'title'}>{model.title}: an expressive vintage-device character.</title>
    <Part node={model.root} prefix={prefix}/>
  </svg>;
});
