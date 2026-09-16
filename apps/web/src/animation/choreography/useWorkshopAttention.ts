import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { useAnimation } from '../orchestration/AnimationProvider';
import { ATTENTION_CHAPTERS, attentionChapterAt } from '../performances/attention';

/** Native scroll selects the scene. Existing controllers remain the only joint animators. */
export function useWorkshopAttention(root: RefObject<HTMLElement | null>, stage: RefObject<HTMLElement | null>, enabled: boolean, paused: boolean, blocked: boolean) {
  const { send } = useAnimation();
  const [selection, setSelection] = useState({ chapter: 0, beat: 0 });
  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [muted, setMuted] = useState(false);
  const cancelled = useRef(false);
  const position = useRef(0);
  const remainder = useRef(0);
  const lastBeat = useRef('');
  const chapter = ATTENTION_CHAPTERS[selection.chapter]!;
  const beat = chapter.beats[selection.beat]!;
  const frozen = !enabled || paused || blocked || reduced || hidden || !visible || muted;
  const frozenRef = useRef(frozen); frozenRef.current = frozen;

  useEffect(() => {
    if (!enabled) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pin = window.matchMedia('(min-width: 768px) and (min-height: 900px) and (max-aspect-ratio: 33/20) and (prefers-reduced-motion: no-preference)');
    const sync = () => { setReduced(motion.matches); setPinned(pin.matches); setHidden(document.hidden); };
    sync();
    motion.addEventListener('change', sync); pin.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    const observer = new IntersectionObserver(entries => setVisible((entries[0]?.intersectionRatio ?? 0) >= .12), { threshold: [0, .12] });
    if (stage.current) observer.observe(stage.current);
    return () => { observer.disconnect(); motion.removeEventListener('change', sync); pin.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync); };
  }, [enabled, stage]);

  useEffect(() => {
    if (!enabled) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (!root.current) return;
      const bounds = root.current.getBoundingClientRect();
      position.current = pinned ? -bounds.top / Math.max(1, bounds.height - innerHeight)
        : innerWidth < 768 ? (innerHeight * .55 - bounds.top) / (innerHeight * .85)
        : -bounds.top / Math.max(1, bounds.height * .65);
      // Explicit visitor actions always win, even between an event and React's next effect.
      if (paused || blocked || reduced || hidden || !visible) return;
      setSelection(current => {
        const next = attentionChapterAt(position.current, current.chapter);
        return next === current.chapter ? current : { chapter: next, beat: 0 };
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(measure); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
  }, [enabled, root, pinned, paused, blocked, reduced, hidden, visible]);

  useEffect(() => { cancelled.current = false; setMuted(false); }, [selection.chapter]);

  useEffect(() => {
    if (frozen || cancelled.current) return;
    const identity = `${selection.chapter}:${selection.beat}`;
    if (lastBeat.current !== identity) {
      lastBeat.current = identity;
      remainder.current = beat.seconds * 1000;
      send({ type: 'ATTITUDE', enabled: false });
      send({ type: 'PERFORM', action: beat.mobile });
      send({ type: 'DESKTOP', state: beat.desktop });
    }
    if (!beat.seconds) return;
    const started = performance.now();
    const timer = window.setTimeout(() => {
      if (cancelled.current || frozenRef.current) return;
      setSelection(current => current.chapter === selection.chapter && current.beat === selection.beat ? { ...current, beat: Math.min(chapter.beats.length - 1, current.beat + 1) } : current);
    }, remainder.current);
    return () => { window.clearTimeout(timer); remainder.current = Math.max(0, remainder.current - (performance.now() - started)); };
  }, [beat, chapter, selection, frozen, send]);

  // A synchronous lease prevents a just-clicked choice being overwritten by an expiring timer.
  const cancel = useCallback(() => { cancelled.current = true; setMuted(true); }, []);
  return { chapter, index: selection.chapter, pinned, active: !frozen && !cancelled.current, cancel };
}
