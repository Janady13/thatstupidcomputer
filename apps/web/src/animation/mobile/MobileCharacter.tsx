'use client';
import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { CharacterArt } from './CharacterArt';
import { loadCharacter, safeAction, advanceTravel } from '../core/contracts.mjs';
import type { CharacterController } from './character-controller.mjs';
import type { CharacterModel, Clip, ActionName, CharacterSlug } from './types';
export interface CharacterHandle { seek: (seconds: number) => void; replay: () => void }
export interface MobileCharacterProps {
  character?: CharacterSlug; action?: ActionName; paused?: boolean; replay?: number;
  attitudeEnabled?: boolean; travel?: boolean; playbackRate?: number;
  assetBase?: string; className?: string;
  onReady?: () => void; onError?: (error: unknown) => void;
  onComplete?: (action: ActionName) => void;
  onFrame?: (frame: { time: number; duration: number; progress: number }) => void;
}
interface Loaded { model: CharacterModel; clips: Clip[] }
/** Lazy geometry and motion data. SSR always supplies a size-reserved poster. */
export const MobileCharacter = forwardRef<CharacterHandle, MobileCharacterProps>(function MobileCharacter({ character = 'smartphone', action = 'Idle', paused = false, replay = 0, attitudeEnabled = false, travel = false, playbackRate = 1, assetBase = '/animation', className = '', onError, onReady, onFrame, onComplete }, ref) {
  const [loaded, setLoaded] = useState<Loaded | null>(null); const [error, setError] = useState(false);
  const svg = useRef<SVGSVGElement>(null); const stage = useRef<HTMLDivElement>(null); const actor = useRef<HTMLDivElement>(null);
  const controller = useRef<CharacterController | null>(null); const unique = useId();
  const performed = safeAction(action, attitudeEnabled);
  const current = useRef({ performed, paused, playbackRate, onError, onReady, onFrame, onComplete, travel });
  current.current = { performed, paused, playbackRate, onError, onReady, onFrame, onComplete, travel };
  const travelState = useRef({ x: 0, direction: 1, max: 0 });
  useImperativeHandle(ref, () => ({ seek: seconds => controller.current?.seek(seconds), replay: () => controller.current?.setAction(current.current.performed, { immediate: true }) }), []);
  useEffect(() => {
    const abort = new AbortController(); setLoaded(null); setError(false);
    void loadCharacter(assetBase, character, abort.signal).then(value => { if (!abort.signal.aborted) setLoaded(value); }).catch(err => {
      if (!abort.signal.aborted) { setError(true); current.current.onError?.(err); }
    });
    return () => abort.abort();
  }, [assetBase, character]);
  useEffect(() => {
    if (!loaded || loaded.model.slug !== character) return;
    let cancelled = false; let local: CharacterController | null = null;
    void import('./character-controller.mjs').then(({ CharacterController: Player }) => {
      if (cancelled || !svg.current) return;
      const latest = current.current;
      local = new Player(svg.current, loaded.model, loaded.clips, {
        action: latest.performed, paused: latest.paused, censored: true,
        onRender: frame => current.current.onFrame?.(frame),
        onComplete: name => current.current.onComplete?.(name),
        onAdvance: ({ dt, clip }) => {
          if (!current.current.travel || !actor.current || !stage.current || !local || !/^(Walk|Run)(Left|Right)$/.test(local.action)) return;
          const scale = actor.current.clientHeight / loaded.model.height;
          const position = advanceTravel(travelState.current.x, travelState.current.direction, dt, Math.abs(clip.travelPerCycle) / clip.seconds * scale, travelState.current.max);
          const changed = position.direction !== travelState.current.direction;
          travelState.current = { ...travelState.current, ...position };
          actor.current.style.transform = `translateX(${position.x}px)`;
          if (changed) local.setAction(local.action.startsWith('Run') ? position.direction > 0 ? 'RunRight' : 'RunLeft' : position.direction > 0 ? 'WalkRight' : 'WalkLeft', { immediate: true });
        },
      });
      local.setPlaybackRate(latest.playbackRate); controller.current = local; latest.onReady?.();
    }).catch(err => { local?.destroy(); if (controller.current === local) controller.current = null; if (!cancelled) { setError(true); current.current.onError?.(err); } });
    return () => { cancelled = true; local?.destroy(); if (controller.current === local) controller.current = null; };
  }, [loaded, character]);
  useEffect(() => { controller.current?.setAction(performed); travelState.current.direction = performed.endsWith('Left') ? -1 : 1; }, [performed, replay]);
  useEffect(() => { if (paused) controller.current?.pause(); else controller.current?.resume(); }, [paused]);
  useEffect(() => { controller.current?.setPlaybackRate(playbackRate); }, [playbackRate]);
  useEffect(() => {
    if (!stage.current || !actor.current) return;
    const measure = () => {
      if (!stage.current || !actor.current) return;
      travelState.current.max = Math.max(0, stage.current.clientWidth - actor.current.clientWidth);
      travelState.current.x = Math.min(travelState.current.x, travelState.current.max);
      actor.current.style.transform = travel ? `translateX(${travelState.current.x}px)` : 'translateX(-50%)';
    };
    travelState.current = { x: 0, direction: performed.endsWith('Left') ? -1 : 1, max: 0 };
    measure(); const observer = new ResizeObserver(measure); observer.observe(stage.current);
    return () => observer.disconnect();
  }, [travel, character, loaded]);
  const ready = loaded?.model.slug === character && !error;
  return <div ref={stage} className={`tsc-mobile-stage ${travel ? 'is-travelling' : ''} ${className}`} data-character={character} data-instance={unique} data-renderer={ready ? 'svg' : 'poster'}>
    <div className="tsc-mobile-actor" ref={actor}>
      {ready && loaded ? <CharacterArt key={character} ref={svg} model={loaded.model} /> : <img src={`${assetBase}/mobile/${character}/poster.svg`} width={720} height={920} alt="" />}
    </div>
    {error && <p className="tsc-fallback-note" role="status">Motion unavailable. The character artwork remains visible.</p>}
  </div>;
});
