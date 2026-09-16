'use client';
import { lazy, Suspense, useEffect, useState } from 'react';
import { MobileCharacter, type MobileCharacterProps } from '../mobile/MobileCharacter';
import { AnimationBoundary } from '../core/AnimationBoundary';
import { safeAction } from '../core/contracts.mjs';
import { useMedia } from '../core/useMedia';
import registry from './verified-assets.json';
import type { VerifiedRiveAsset } from './types';
const Native = lazy(() => import('./RiveCharacter'));
export function Character(props: MobileCharacterProps & { renderer?: 'auto' | 'svg' }) {
  const slug = props.character ?? 'smartphone';
  const reduced = useMedia('(prefers-reduced-motion: reduce)', true);
  const entry = (registry as Partial<Record<string, VerifiedRiveAsset>>)[slug];
  const [failed, setFailed] = useState(false); const [ready, setReady] = useState(false);
  useEffect(() => { setFailed(false); setReady(false); }, [slug]);
  const eligible = props.renderer !== 'svg' && entry?.status === 'runtime-verified' && !props.travel && !props.onFrame && !props.onComplete && (props.playbackRate ?? 1) === 1 && !reduced && !failed;
  useEffect(() => {
    if (!eligible || ready) return;
    const timeout = setTimeout(() => setFailed(true), 12000);
    return () => clearTimeout(timeout);
  }, [eligible, ready, slug]);
  const fallback = <MobileCharacter {...props} />;
  if (!eligible || !entry) return fallback;
  const fail = (error: unknown) => { setFailed(true); props.onError?.(error); };
  return <AnimationBoundary key={slug} fallback={fallback} onError={fail}>
    <div className={`tsc-native-shell ${props.className ?? ''}`} data-renderer={ready ? 'rive' : 'poster'}>
      {!ready && <img className="native-poster" src={`${props.assetBase ?? '/animation'}/mobile/${slug}/poster.svg`} width={720} height={920} alt="" />}
      <Suspense fallback={null}><Native asset={entry} action={safeAction(props.action ?? 'Idle', !!props.attitudeEnabled)} paused={!!props.paused} replay={props.replay ?? 0} onReady={() => { setReady(true); props.onReady?.(); }} onError={fail} /></Suspense>
    </div>
  </AnimationBoundary>;
}
