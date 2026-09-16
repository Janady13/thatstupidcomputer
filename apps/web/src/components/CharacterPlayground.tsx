import { lazy, Suspense, useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimationBoundary } from '../animation/core/AnimationBoundary';
import { useAnimation } from '../animation/orchestration/AnimationProvider';
import type { ActionName, CharacterSlug } from '../animation/mobile/types';
import type { StageCommand, StageStatus } from '../animation/stage';
import { CHARACTER_PERFORMANCES, PERFORMANCE_GROUPS, PERFORMANCES } from '../animation/performances/catalog.mjs';
import { STAGE_SHOWS, type StageShow, type ShowStep } from '../animation/performances/stage-shows';
import { Icon } from './Icons';
import '../styles/playground.css';

const CharacterStage = lazy(() => import('../animation/stage').then(module => ({ default: module.CharacterStage })));
const CHARACTERS: readonly CharacterSlug[] = ['smartphone', 'flip-phone', 'app-bot', 'pager', 'handheld'];
const QUICK_ACTIONS: readonly ActionName[] = ['Laugh', 'Suspicious', 'Facepalm', 'Shy', 'Proud'];
type CommandKind = StageCommand['kind'];

export default function CharacterPlayground() {
  const { state, send } = useAnimation();
  const [character, setCharacter] = useState<CharacterSlug>('smartphone');
  const [action, setAction] = useState<ActionName>('Idle');
  const [command, setCommand] = useState<StageCommand>({ id: 0, kind: 'home' });
  const [rudeAllowed, setRudeAllowed] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [stageReady, setStageReady] = useState(false);
  const [stagePaused, setStagePaused] = useState(true);
  const [stageFailed, setStageFailed] = useState(false);
  const [showIndex, setShowIndex] = useState<number | null>(null);
  const [showName, setShowName] = useState<StageShow>('introduction');
  const SHOW: readonly ShowStep[] = STAGE_SHOWS[showName].steps;
  const [announcement, setAnnouncement] = useState('Pick a personality. Then give them something to react to.');
  const serial = useRef(0);
  const stageElement = useRef<HTMLDivElement>(null);
  const sequence = useRef<{ index: number; commandId: string | number | null } | null>(null);
  const pendingDirection = useRef<{ commandId: string | number; kind: CommandKind } | null>(null);
  const remaining = useRef<{ index: number; milliseconds: number } | null>(null);
  const nextStep = useRef<(index: number) => void>(() => {});
  const id = useId();
  const persona = CHARACTER_PERFORMANCES[character];
  const currentPerformance = PERFORMANCES[action];
  const motionDisabled = state.paused || reduced || hidden;
  const frozen = motionDisabled || stagePaused;
  const movementUnavailable = motionDisabled || !stageReady || stageFailed;
  const showing = showIndex !== null;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReduced(media.matches);
    const updateVisibility = () => setHidden(document.hidden);
    updateMotion(); updateVisibility();
    media.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      media.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  function issue(kind: CommandKind, target?: number) {
    pendingDirection.current = null;
    const next = { id: ++serial.current, kind, ...(target === undefined ? {} : { target }) } as StageCommand;
    setCommand(next);
    return next.id;
  }

  function stopShow(cancelStage = true) {
    sequence.current = null;
    remaining.current = null;
    setShowIndex(null);
    if (cancelStage) issue('cancel');
  }

  function revealStage() {
    const stage = stageElement.current;
    if (!stage) return;
    // An explicit direction brings its visual target into view. Use an immediate
    // scroll and put keyboard focus on the direct-manipulation handle.
    stage.scrollIntoView({ block: 'center', behavior: 'auto' });
    stage.querySelector<HTMLButtonElement>('[data-testid="stage-actor-handle"]')?.focus({ preventScroll: true });
  }

  nextStep.current = (index: number) => {
    const step = SHOW[index];
    if (!step) {
      sequence.current = null;
      remaining.current = null;
      setShowIndex(null);
      setAction('Idle');
      setAnnouncement('That’s the show. Your turn.');
      return;
    }
    const commandId = issue(step.command ?? 'cancel', step.target);
    sequence.current = { index, commandId: step.command ? commandId : null };
    remaining.current = { index, milliseconds: PERFORMANCES[step.action].seconds * 1000 };
    setShowIndex(index);
    setAction(step.action);
    setAnnouncement(step.caption);
  };

  // Action-only beats use the actual clip duration. Movement beats wait for the
  // matching engine completion. Pausing preserves the remaining dwell time.
  useEffect(() => {
    if (showIndex === null || frozen || SHOW[showIndex].command) return;
    const timerState = remaining.current;
    if (!timerState || timerState.index !== showIndex) return;
    const started = performance.now();
    const timer = window.setTimeout(() => {
      if (sequence.current?.index === showIndex) nextStep.current(showIndex + 1);
    }, Math.max(0, timerState.milliseconds));
    return () => {
      window.clearTimeout(timer);
      timerState.milliseconds = Math.max(0, timerState.milliseconds - (performance.now() - started));
    };
  }, [showIndex, frozen, SHOW]);

  useEffect(() => {
    if (!reduced || !sequence.current) return;
    sequence.current = null;
    remaining.current = null;
    setShowIndex(null);
    setCommand({ id: ++serial.current, kind: 'cancel' });
    setAnnouncement('Reduced motion is on. You can still choose an expression.');
  }, [reduced]);

  const onStatus = useCallback((status: StageStatus) => {
    setStageReady(status.ready);
    setStagePaused(status.paused);
    if (status.ready) setStageFailed(false);
    if (status.reason === 'drag') {
      // The engine already owns this pointer. Cancel the sequence, not the drag.
      sequence.current = null;
      pendingDirection.current = null;
      remaining.current = null;
      setShowIndex(null);
      setAnnouncement('A little nudge. They’ll find their feet.');
      return;
    }
    const current = sequence.current;
    if (current && current.commandId !== null && status.complete && status.commandId === current.commandId) nextStep.current(current.index + 1);
    const direction = pendingDirection.current;
    if (direction && status.complete && status.commandId === direction.commandId) {
      pendingDirection.current = null;
      if (direction.kind === 'roam') setAnnouncement('A little wander, then back to their mark.');
      if (direction.kind === 'exitRight') setAnnouncement('They’ve left the stage. Reset brings them back.');
    }
  }, []);

  const onInternalCommand = useCallback(() => {
    sequence.current = null;
    pendingDirection.current = null;
    remaining.current = null;
    setShowIndex(null);
    setAnnouncement('Your direction. Their interpretation.');
  }, []);

  const onStageError = useCallback(() => {
    sequence.current = null;
    pendingDirection.current = null;
    remaining.current = null;
    setShowIndex(null);
    setStageFailed(true);
    setStageReady(false);
    setAnnouncement('The illustration is here; motion is taking a break.');
  }, []);

  function chooseCharacter(slug: CharacterSlug) {
    stopShow(false);
    setStageReady(false);
    setStageFailed(false);
    setStagePaused(true);
    setCharacter(slug);
    setAction('Idle');
    setRudeAllowed(false);
    issue('home');
    setAnnouncement(`${CHARACTER_PERFORMANCES[slug].name} is ready for their close-up.`);
  }

  function chooseAction(next: ActionName) {
    if (next === 'RudeFlipOff' && !rudeAllowed) return;
    stopShow(false);
    issue('cancel');
    setAction(next);
    setAnnouncement(`${PERFORMANCES[next].label} selected.`);
  }

  function move(kind: CommandKind, caption: string, target?: number) {
    stopShow(false);
    const commandId = issue(kind, target);
    if (kind === 'roam' || kind === 'exitRight') pendingDirection.current = { commandId, kind };
    setAnnouncement(caption);
    revealStage();
  }

  function reset() {
    stopShow(false);
    setAction('Idle');
    issue('home');
    setAnnouncement('Back in position. Dignity mostly intact.');
    revealStage();
  }

  function toggleAnimations() {
    send({ type: state.paused ? 'PLAY' : 'PAUSE' });
    if (state.paused) revealStage();
  }

  const poster = <div className="playground-poster"><img src={`/animation/mobile/${character}/poster.svg`} width="720" height="920" alt={`${persona.name}, an illustrated device character`} /><p>{stageFailed ? 'Taking a little breather.' : 'Getting into character…'}</p></div>;

  return <section className="character-playground" aria-labelledby={`${id}-heading`} data-testid="character-playground" data-character={character} data-selected-action={action} data-show={showing ? 'playing' : 'idle'}>
    <header className="playground-heading"><p className="eyebrow">A small cast. Big feelings.</p><h2 id={`${id}-heading`}>Meet the characters.</h2><p>Same little workshop. Five very different personalities. Give them a mood, a direction, or a moment in the spotlight.</p></header>

    <fieldset className="playground-cast"><legend>Choose your character</legend><div className="playground-cast-options">
      {CHARACTERS.map(slug => <button key={slug} type="button" aria-pressed={character === slug} onClick={() => chooseCharacter(slug)} data-character-choice={slug}><img src={`/animation/mobile/${slug}/poster.svg`} width="720" height="920" alt="" loading="lazy" /><span>{CHARACTER_PERFORMANCES[slug].name}</span></button>)}
    </div></fieldset>

    <figure className="playground-theatre">
      <div className="playground-personality"><h3>{persona.name}</h3><p>{persona.personality}</p></div>
      <div className="playground-stage" ref={stageElement} id={`${id}-stage`} aria-describedby={`${id}-stage-help`}>
        <div className="playground-stage-label" aria-hidden="true">A little room to be yourself.</div>
        <AnimationBoundary key={character} fallback={poster} onError={onStageError}>
          <Suspense fallback={poster}><CharacterStage className="playground-live-stage" character={character} action={action} paused={state.paused} attitudeEnabled={rudeAllowed} command={command} onStatus={onStatus} onCommand={onInternalCommand} onError={onStageError} label={`Interactive stage for ${persona.name}`} /></Suspense>
        </AnimationBoundary>
      </div>
      <figcaption id={`${id}-stage-help`}>{reduced ? 'Reduced motion is on. Choose an expression to see a still pose.' : 'Tap a spot to send them over, or gently drag them. You can also use the movement buttons below.'}</figcaption>
    </figure>

    <div className="playground-director">
      <div className="playground-now"><span className="playground-now-label">The mood</span><strong>{currentPerformance.label}</strong><p>{currentPerformance.description}</p></div>
      <fieldset className="playground-moods"><legend>Give them a feeling</legend><div className="playground-quick-moods">{QUICK_ACTIONS.map(name => <button key={name} type="button" aria-pressed={action === name} onClick={() => chooseAction(name)}>{PERFORMANCES[name].label}</button>)}</div></fieldset>
      <label className="playground-expression-select" htmlFor={`${id}-expression`}><span>All expressions and moves</span><select id={`${id}-expression`} value={action} onChange={event => chooseAction(event.target.value as ActionName)}>{PERFORMANCE_GROUPS.map(group => <optgroup key={group.id} label={group.label}>{group.actions.map(name => <option key={name} value={name} disabled={name === 'RudeFlipOff' && !rudeAllowed}>{PERFORMANCES[name].label}{name === 'RudeFlipOff' && !rudeAllowed ? ' — opt in below' : ''}</option>)}</optgroup>)}</select></label>
      <button type="button" className="playground-see-expression" disabled={!stageReady || stageFailed} onClick={() => { chooseAction(action); revealStage(); }}>See this expression <Icon name="arrow" /></button>
      <label className="playground-attitude"><input type="checkbox" checked={rudeAllowed} onChange={event => { setRudeAllowed(event.target.checked); if (!event.target.checked && action === 'RudeFlipOff') chooseAction('EyeRoll'); }} /><span>Allow the rude gesture. <span>It stays censored.</span></span></label>

      <fieldset className="playground-movement" disabled={movementUnavailable}><legend>A little stage direction</legend><div className="playground-movement-buttons">
        <button type="button" onClick={() => move('walkTo', 'A little walk to the left.', .18)}><span aria-hidden="true">←</span> Walk left</button>
        <button type="button" onClick={() => move('walkTo', 'A little walk to the right.', .82)}>Walk right <span aria-hidden="true">→</span></button>
        <button type="button" onClick={() => move('runTo', 'Off they go.', .82)}>Run across</button>
        <button type="button" onClick={() => move('enterLeft', 'Making an entrance. Naturally.')}>Make an entrance</button>
        <button type="button" onClick={() => move('peekRight', 'Just checking whether anyone is looking.')}>Take a peek</button>
        <button type="button" onClick={() => move('jump', 'A little jump for joy.')}>Jump</button>
        <button type="button" onClick={() => move('roam', 'Taking a little wander. They’ll be back.')}>Wander</button>
        <button type="button" onClick={() => move('exitRight', 'A graceful exit. Probably.')}>Make an exit</button>
      </div></fieldset>
      <label className="playground-expression-select" htmlFor={`${id}-show`}><span>Choose their story</span><select id={`${id}-show`} value={showName} onChange={event => { stopShow(); setShowName(event.target.value as StageShow); setAnnouncement('New script. Same personality. Press A little performance when you are ready.'); }}>{(Object.keys(STAGE_SHOWS) as StageShow[]).map(name => <option key={name} value={name}>{STAGE_SHOWS[name].label}</option>)}</select></label>
      <div className="playground-show-controls"><button type="button" className="playground-performance-button" aria-pressed={showing} disabled={!showing && movementUnavailable} onClick={() => { if (showing) { stopShow(); setAnnouncement('Show stopped for creative differences. Your turn.'); } else { nextStep.current(0); revealStage(); } }}><Icon name={showing ? 'pause' : 'spark'} /><span>{showing ? 'Stop the performance' : 'A little performance'}</span></button><button type="button" onClick={reset} disabled={movementUnavailable}>Reset stage</button>{!reduced && <button type="button" onClick={toggleAnimations} aria-pressed={state.paused}><Icon name={state.paused ? 'play' : 'pause'} /><span>{state.paused ? 'Resume animations' : 'Pause animations'}</span></button>}</div>
      <p className="playground-status" role="status" aria-live="polite" aria-atomic="true">{state.paused && showing ? 'The performance is paused. Resume animations when you’re ready.' : announcement}</p>
      {showing && stagePaused && !motionDisabled && <p className="playground-back-to-stage"><a href={`#${id}-stage`}>Back to the stage</a> to continue the performance.</p>}
      {stageFailed && <p className="playground-reload"><a href="/work/">Reload the example</a>, or keep exploring the work below.</p>}
    </div>
  </section>;
}
