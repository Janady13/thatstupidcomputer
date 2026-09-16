'use client';
import { lazy, Suspense, useState, useEffect } from 'react';
import { useAnimation } from './orchestration/AnimationProvider';
import { useMedia } from './core/useMedia';
import { selectScene } from './core/contracts.mjs';
import { Character } from './rive/Character';
import { AnimationBoundary } from './core/AnimationBoundary';
import type { RoomOverrides, RoomEffects } from './office/types';
const Office = lazy(() => import('./office/RoomScene').then(m => ({ default: m.RoomScene })));
const Desktop = lazy(() => import('./desktop/DesktopCharacter').then(m => ({ default: m.DesktopCharacter })));
export function AdaptiveScene({ travel = false, playbackRate = 1, objects, effects, drawerOpen = 0 }: { travel?: boolean; playbackRate?: number; objects?: RoomOverrides; effects?: Partial<RoomEffects>; drawerOpen?: number }) {
  const { state } = useAnimation(); const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), []); const narrow = useMedia('(max-width: 767px)', false);
  const scene = selectScene(state.scene, narrow ? 400 : 1200);
  const poster = <img className="tsc-scene-poster" src={`/animation/${scene === 'mobile' ? `mobile/${state.character}/poster.svg` : scene === 'desktop' ? 'desktop/computer.svg' : 'office/office-with-computer.svg'}`} width={scene === 'desktop' ? 1254 : 1648} height={scene === 'desktop' ? 1254 : 928} alt="" />;
  if (!mounted) return <div className="tsc-stage" data-renderer="poster"><picture><source media="(max-width: 767px)" srcSet={`/animation/mobile/${state.character}/poster.svg`}/><img className="tsc-scene-poster" src="/animation/office/office-with-computer.svg" width={1648} height={928} alt=""/></picture></div>;
  return <div className={`tsc-stage scene-${scene}`} data-scene={scene}>
    <AnimationBoundary key={scene} fallback={poster}>
      {scene === 'mobile' ? <Character character={state.character} action={state.action} paused={state.paused} replay={state.replay} attitudeEnabled={state.attitude} travel={travel} playbackRate={playbackRate} /> :
        <Suspense fallback={poster}>{scene === 'office' ? <Office objects={objects} effects={effects} drawerOpen={drawerOpen} character={{state: state.desktop}} paused={state.paused} replay={state.replay} /> : <Desktop state={state.desktop} paused={state.paused} replay={state.replay} />}</Suspense>}
    </AnimationBoundary>
  </div>;
}
