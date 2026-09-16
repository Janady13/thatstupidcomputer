"use client";

import { useEffect, useId, useMemo, useRef } from 'react';
import { ComputerActor } from '../desktop/ComputerActor';
import type { ComputerMotion } from '../desktop/computer-motion.mjs';
import type { RoomMotion } from './motion/room-motion.mjs';
import { DEFAULT_CHARACTER, DEFAULT_EFFECTS, DEFAULT_PALETTE, LAYERS } from './catalog';
import { instancePrefix, placement, resolveObjects } from './model';
import { RoomObject } from './RoomObject';
import type { RoomSceneProps } from './types';
import './room.css';

/** Full vector scene. React owns composition; one imperative clock owns motion attributes. */
export function RoomScene({ objects, additions, character, effects, palette, paused = false,
  drawerOpen = 0, replay = 0, attitudeEnabled = false, className = '', decorative = true, onCharacterComplete, pointerTarget,
  label = 'A warm repair office with a patient vintage computer', onError, children,
}: RoomSceneProps) {
  const generatedId = useId();
  const idPrefix = useMemo(() => instancePrefix(generatedId), [generatedId]);
  const svg = useRef<SVGSVGElement>(null);
  const room = useRef<RoomMotion | null>(null);
  const computer = useRef<ComputerMotion | null>(null);
  const items = useMemo(() => resolveObjects(objects, additions), [objects, additions]);
  const colors = useMemo(() => ({ ...DEFAULT_PALETTE, ...palette }), [palette]);
  const motionEffects = useMemo(() => ({ ...DEFAULT_EFFECTS, ...effects }), [effects]);
  const actor = character === false ? null : { ...DEFAULT_CHARACTER, ...character };
  const latest = useRef({ paused, motionEffects, drawerOpen, onError });
  latest.current = { paused, motionEffects, drawerOpen, onError };

  useEffect(() => {
    let cancelled = false;
    let local: RoomMotion | null = null;
    void import('./motion/room-motion.mjs').then(({ RoomMotion: Controller }) => {
      if (cancelled || !svg.current) return;
      local = new Controller(svg.current, {
        effects: latest.current.motionEffects,
        paused: latest.current.paused,
        drawerOpen: latest.current.drawerOpen,
        onFrame: delta => computer.current?.advance(delta),
      });
      room.current = local;
    }).catch(error => { if (!cancelled) latest.current.onError?.(error); });
    return () => {
      cancelled = true;
      local?.destroy();
      if (room.current === local) room.current = null;
    };
  }, []);
  useEffect(() => { room.current?.refresh(); }, [items, character]);
  useEffect(() => { room.current?.setEffects(motionEffects); }, [motionEffects]);
  useEffect(() => { room.current?.setDrawerOpen(drawerOpen); }, [drawerOpen]);
  useEffect(() => { if (paused) room.current?.pause(); else room.current?.resume(); }, [paused]);

  const slot = (parent: string | null) => actor?.visible && actor.parent === parent ? (
    <g id={`${idPrefix}--computer-slot`} data-slot="computer" transform={placement(actor)}>
      <ComputerActor idPrefix={`${idPrefix}--computer`} palette={colors}
        controllerRef={computer} state={actor.state} intensity={actor.intensity}
        paused={paused} replay={replay} attitudeEnabled={actor.attitudeEnabled ?? attitudeEnabled} onComplete={onCharacterComplete} pointerTarget={pointerTarget} onError={onError} />
    </g>
  ) : null;

  return (
    <svg ref={svg} className={`office-room ${className}`.trim()}
      xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1648 928" width="1648" height="928"
      preserveAspectRatio="xMidYMid meet" aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'} aria-labelledby={decorative ? undefined : `${idPrefix}--title`}>
      {!decorative && <title id={`${idPrefix}--title`}>{label}</title>}
      {LAYERS.map(layer => (
        <g key={layer} id={`${idPrefix}--layer-${layer}`} data-layer={layer}>
          {items.filter(item => item.layer === layer && item.parent === null).map(item => (
            <RoomObject key={item.id} item={item} items={items} palette={colors} idPrefix={idPrefix} slot={slot} />
          ))}
          {layer === 'character' && slot(null)}
        </g>
      ))}
      {children}
    </svg>
  );
}
