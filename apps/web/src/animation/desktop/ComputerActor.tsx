"use client";

import { useEffect, useRef, type RefObject } from 'react';
import type { MutableRefObject } from 'react';
import type { ComputerMotion } from './computer-motion.mjs';
import { ComputerGeometry } from './ComputerGeometry';
import cablePoses from './cable-poses.json';
import type { ArtProps, CharacterState } from '../office/types';

export interface ComputerActorProps extends ArtProps {
  controllerRef: MutableRefObject<ComputerMotion | null>;
  state: CharacterState;
  replay?: number;
  intensity: number;
  paused: boolean;
  attitudeEnabled?: boolean;
  onComplete?: (state: CharacterState) => void;
  pointerTarget?: RefObject<HTMLElement | null>;
  onError?: (error: unknown) => void;
}

/** SVG child, not a div or canvas. Advances from the room's single animation clock. */
export function ComputerActor({ idPrefix, palette, controllerRef, state, intensity, paused, replay = 0, attitudeEnabled = false, onComplete, onError, pointerTarget }: ComputerActorProps) {
  const artRef = useRef<SVGSVGElement>(null);
  const latest = useRef({ state, intensity, paused, attitudeEnabled, onComplete, onError });
  latest.current = { state, intensity, paused, attitudeEnabled, onComplete, onError };

  useEffect(() => {
    let cancelled = false;
    let local: ComputerMotion | null = null;
    void import('./computer-motion.mjs').then(({ ComputerMotion: Controller }) => {
      if (cancelled || !artRef.current) return;
      local = new Controller(artRef.current, {
        cables: cablePoses,
        state: latest.current.state,
        intensity: latest.current.intensity,
        externalClock: true,
        pointerTarget: pointerTarget?.current ?? artRef.current,
        autoplay: false,
        paused: latest.current.paused,
        attitudeEnabled: latest.current.attitudeEnabled,
        onComplete: completed => latest.current.onComplete?.(completed),
      });
      controllerRef.current = local;
      if (latest.current.paused) local.pause();
    }).catch(error => { if (!cancelled) latest.current.onError?.(error); });
    return () => {
      cancelled = true;
      local?.destroy();
      if (controllerRef.current === local) controllerRef.current = null;
    };
  }, [controllerRef]);
  useEffect(() => { controllerRef.current?.setAttitudeEnabled(attitudeEnabled); }, [attitudeEnabled, controllerRef]);
  useEffect(() => {
    controllerRef.current?.setState(state);
  }, [state, replay, controllerRef]);
  useEffect(() => { controllerRef.current?.setIntensity(intensity); }, [intensity, controllerRef]);
  useEffect(() => {
    if (paused) controllerRef.current?.pause(); else controllerRef.current?.resume();
  }, [paused, controllerRef]);
  return <ComputerGeometry idPrefix={idPrefix} palette={palette} artRef={artRef} />;
}
