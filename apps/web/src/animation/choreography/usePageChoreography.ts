'use client';
import { useEffect, type RefObject } from 'react';
/** Owns only [data-reveal] wrappers, never a character's joints or room props. */
export function usePageChoreography(root: RefObject<HTMLElement | null>, disabled: boolean) {
  useEffect(() => {
    if (disabled || !root.current) return;
    let cancelled = false; let revert: (() => void) | undefined;
    void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const context = gsap.context(() => {
          root.current?.querySelectorAll<HTMLElement>('[data-reveal]').forEach(element => {
            gsap.fromTo(element, { y: 22, opacity: .45 }, {
              y: 0, opacity: 1, duration: .65, ease: 'power2.out',
              scrollTrigger: { trigger: element, start: 'top 92%', toggleActions: 'play none none reverse' },
            });
          });
        }, root.current!);
        return () => context.revert();
      });
      revert = () => mm.revert();
    }).catch(() => { /* Content is visible without this optional enhancement. */ });
    return () => { cancelled = true; revert?.(); };
  }, [root, disabled]);
}
