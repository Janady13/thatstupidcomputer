'use client';
import { useEffect, useId, useRef } from 'react';
import { ComputerGeometry } from './ComputerGeometry';
import type { ComputerMotion, CharacterState } from './computer-motion.mjs';
import cablePoses from './cable-poses.json';
import { DEFAULT_PALETTE } from '../office/catalog';
interface Props { state?: CharacterState; paused?: boolean; replay?: number; attitudeEnabled?: boolean; className?: string; onComplete?: (state: CharacterState) => void; onError?: (error: unknown) => void }
export function DesktopCharacter({ state = 'idle', paused = false, replay = 0, attitudeEnabled = false, className = '', onComplete, onError }: Props) {
  const generated = useId(); const id = 'desktop-' + Array.from(generated, c => c.codePointAt(0)!.toString(16)).join('-');
  const svg = useRef<SVGSVGElement>(null); const controller = useRef<ComputerMotion | null>(null);
  const latest = useRef({ state, paused, attitudeEnabled, onComplete, onError }); latest.current = { state, paused, attitudeEnabled, onComplete, onError };
  useEffect(() => {
    let cancelled = false; let local: ComputerMotion | null = null;
    void import('./computer-motion.mjs').then(({ ComputerMotion: Player }) => {
      if (cancelled || !svg.current) return;
      local = new Player(svg.current, { cables: cablePoses, state: latest.current.state, autoplay: false, paused: latest.current.paused, attitudeEnabled: latest.current.attitudeEnabled, onComplete: completed => latest.current.onComplete?.(completed) });
      controller.current = local; if (latest.current.paused) local.pause();
    }).catch(error => { if (!cancelled) latest.current.onError?.(error); });
    return () => { cancelled = true; local?.destroy(); if (controller.current === local) controller.current = null; };
  }, []);
  useEffect(() => { controller.current?.setAttitudeEnabled(attitudeEnabled); }, [attitudeEnabled]);
  useEffect(() => { controller.current?.setState(state); }, [state, replay]);
  useEffect(() => { if (paused) controller.current?.pause(); else controller.current?.resume(); }, [paused]);
  return <div className={`tsc-desktop-actor ${className}`}><ComputerGeometry idPrefix={id} palette={DEFAULT_PALETTE} artRef={svg} /></div>;
}
