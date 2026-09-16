'use client';
import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback, type ReactNode } from 'react';
import { createActor, type ActorRefFrom } from 'xstate';
import { animationMachine } from './animationMachine';
import { INITIAL_STATE, type AnimationEvent, type AnimationState, type SiteCue } from '../core/contracts.mjs';
interface Context { state: AnimationState; send: (event: AnimationEvent) => void; cue: (name: SiteCue) => void }
const AnimationContext = createContext<Context | null>(null);
export function AnimationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AnimationState>({ ...INITIAL_STATE });
  const actor = useRef<ActorRefFrom<typeof animationMachine> | null>(null);
  const pending = useRef<AnimationEvent[]>([]);
  const dispatch = useCallback((event: AnimationEvent) => {
    if (actor.current) actor.current.send(event);
    else pending.current.push(event);
  }, []);
  useEffect(() => {
    // New actor per mount: React Strict Mode may clean up and re-run this effect.
    const instance = createActor(animationMachine); actor.current = instance;
    const subscription = instance.subscribe(snapshot => setState(snapshot.context)); instance.start();
    // Child mount effects may send the welcome cue before this parent effect.
    // Preserve those initial events rather than silently dropping them.
    const queued = pending.current.splice(0);
    for (const event of queued) instance.send(event);
    return () => { subscription.unsubscribe(); instance.stop(); if (actor.current === instance) actor.current = null; };
  }, []);
  const value = useMemo<Context>(() => ({ state, send: dispatch, cue: name => dispatch({ type: 'CUE', cue: name }) }), [state, dispatch]);
  return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
}
export function useAnimation(): Context {
  const context = useContext(AnimationContext);
  if (!context) throw new Error('useAnimation requires AnimationProvider');
  return context;
}
