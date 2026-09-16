import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useAnimation } from '../orchestration/AnimationProvider';
import { WORKSHOP_STORIES, type WorkshopBeat, type WorkshopStory } from '../performances/workshop';

/** A finite performance clock. The existing SVG controllers still own every joint. */
export function useWorkshopStory(root: RefObject<HTMLElement | null>, paused: boolean) {
  const { send } = useAnimation();
  const [selection, setSelection] = useState<{ story: WorkshopStory; index: number; run: number } | null>(null);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [holding, setHolding] = useState(false);
  const run = useRef(0);
  const remainder = useRef(0);
  const story = selection ? WORKSHOP_STORIES[selection.story] : null;
  const beat: WorkshopBeat | undefined = selection ? story?.beats[selection.index] : undefined;
  const frozen = paused || reduced || hidden || !visible || holding;
  const final = !!selection && selection.index === (story?.beats.length ?? 0) - 1;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => { setReduced(media.matches); setHidden(document.hidden); };
    sync();
    media.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    // A quick scroll can queue several changes for this one stage. Only the
    // newest entry describes whether its clock should be running now.
    const observer = new IntersectionObserver(entries => setVisible(entries.at(-1)?.isIntersecting ?? false), { threshold: 0.15 });
    if (root.current) observer.observe(root.current);
    return () => { media.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync); observer.disconnect(); };
  }, [root]);

  useEffect(() => {
    if (!beat) return;
    remainder.current = beat.seconds * 1000;
    send({ type: 'ATTITUDE', enabled: false });
    send({ type: 'PERFORM', action: beat.mobile });
    send({ type: 'DESKTOP', state: beat.desktop });
  }, [beat, selection?.run, send]);

  useEffect(() => {
    if (!selection || !beat || frozen || final) return;
    const started = performance.now();
    const timer = window.setTimeout(() => setSelection(current => current && current.run === selection.run && current.index === selection.index ? { ...current, index: current.index + 1 } : current), remainder.current);
    return () => { window.clearTimeout(timer); remainder.current = Math.max(0, remainder.current - (performance.now() - started)); };
  }, [selection, beat, frozen, final]);

  const start = useCallback((name: WorkshopStory) => { setHolding(false); setSelection({ story: name, index: 0, run: ++run.current }); }, []);
  const stop = useCallback(() => { setSelection(null); setHolding(false); send({ type: 'CUE', cue: 'scene.rest' }); }, [send]);
  const move = useCallback((direction: number) => setSelection(current => current ? { ...current, index: Math.max(0, Math.min(WORKSHOP_STORIES[current.story].beats.length - 1, current.index + direction)) } : null), []);
  return { active: selection !== null, selection, story, beat, final, frozen, reduced, holding, start, stop, next: () => move(1), previous: () => move(-1), toggle: () => setHolding(value => !value) };
}

export type WorkshopStoryControls = ReturnType<typeof useWorkshopStory>;
