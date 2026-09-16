'use client';
import { useEffect } from 'react';
import { useMedia } from '../core/useMedia';
/** Opt-in experimental experience, never the default scroll path. */
export function useSmoothScroll(enabled: boolean) {
  const reduced = useMedia('(prefers-reduced-motion: reduce)', true);
  useEffect(() => {
    if (!enabled || reduced) return;
    let cancelled = false; let dispose: (() => void) | undefined;
    void Promise.all([import('lenis'), import('gsap'), import('gsap/ScrollTrigger')]).then(([{ default: Lenis }, { gsap }, { ScrollTrigger }]) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false, anchors: true });
      const update = () => ScrollTrigger.update(); const tick = (seconds: number) => lenis.raf(seconds * 1000);
      lenis.on('scroll', update); gsap.ticker.add(tick);
      dispose = () => { gsap.ticker.remove(tick); lenis.off('scroll', update); lenis.destroy(); };
    }).catch(() => { /* Native scrolling remains available on load failure. */ });
    return () => { cancelled = true; dispose?.(); };
  }, [enabled, reduced]);
}
