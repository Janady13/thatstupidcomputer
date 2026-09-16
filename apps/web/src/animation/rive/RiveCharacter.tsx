'use client';
import { useEffect, useRef } from 'react';
import { useRive, Layout, Fit, Alignment, RuntimeLoader } from '@rive-app/react-webgl2';
import type { ActionName } from '../mobile/types';
import type { VerifiedRiveAsset } from './types';
import { MOBILE_ACTIONS } from '../core/contracts.mjs';
import { createPlaybackGate, type PlaybackGate } from './playback-gate.mjs';
if (typeof window !== 'undefined') {
  RuntimeLoader.setWasmUrl('/animation/runtime/rive.wasm');
  RuntimeLoader.setWasmFallbackUrl(null);
}
interface Props {
  asset: VerifiedRiveAsset; action: ActionName; paused: boolean; replay: number;
  onError: (error: unknown) => void; onReady: () => void;
}
/** Timeline playback, not an invented state machine or a fabricated data-binding API. */
export default function RiveCharacter({ asset, action, paused, replay, onError, onReady }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const gate = useRef<PlaybackGate | null>(null);
  const latest = useRef({ action, paused, replay }); latest.current = { action, paused, replay };
  const callbacks = useRef({ onError, onReady }); callbacks.current = { onError, onReady };
  // A version-matched WASM is copied from the installed runtime by the build script.
  const { rive, RiveComponent } = useRive({
    src: asset.src, artboard: asset.artboard, autoplay: false, enableRiveAssetCDN: false, shouldDisableRiveListeners: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: event => callbacks.current.onError(event),
    onStop: event => gate.current?.stopped(event.data),
  }, { shouldResizeCanvasToContainer: true, useDevicePixelRatio: true });
  useEffect(() => {
    if (!rive || !box.current) return;
    const artboard = rive.contents?.artboards?.find(item => item.name === asset.artboard);
    const names = new Set(artboard?.animations ?? []);
    if (!MOBILE_ACTIONS.every(name => names.has(name))) {
      callbacks.current.onError(new Error(`Rive file does not satisfy the ${MOBILE_ACTIONS.length}-animation contract`)); return;
    }
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    // Wait for the initial intersection observation rather than briefly playing
    // an offscreen canvas on each action change. The observer persists for the file.
    const local = createPlaybackGate(rive, { ...latest.current, visible: false, hidden: document.hidden, reduced: media.matches });
    gate.current = local;
    const visibility = () => local.update({ hidden: document.hidden });
    const preference = () => local.update({ reduced: media.matches });
    const element = box.current;
    const observer = new IntersectionObserver(entries => {
      const entry = entries.find(entry => entry.target === element);
      if (entry) local.update({ visible: entry.isIntersecting });
    });
    observer.observe(element);
    document.addEventListener('visibilitychange', visibility);
    media.addEventListener('change', preference);
    callbacks.current.onReady();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      media.removeEventListener('change', preference);
      local.dispose();
      if (gate.current === local) gate.current = null;
    };
  }, [rive, asset.artboard]);
  useEffect(() => { gate.current?.update({ action, paused, replay }); }, [rive, action, paused, replay]);
  // useRive owns resize observation and native cleanup; do not call cleanup twice.
  return <div ref={box} className="tsc-rive-character" aria-hidden="true"><RiveComponent /></div>;
}
