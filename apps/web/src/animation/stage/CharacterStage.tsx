import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Character } from '../rive/Character';
import { useMedia } from '../core/useMedia';
import type { ActionName, CharacterSlug } from '../mobile/types';
import { beginDrag, boundsFor, cancelDrag, createStage, dragTo, endDrag, hasStageWork, issueCommand, normalizedPosition, resizeStage, stageStatus, tickStage, type StageCommand, type EngineStatus, type Point } from './engine.mjs';
import './stage.css';

export type StageReason = 'command' | 'drag' | 'drop' | 'complete' | 'resize' | 'pause' | 'ready';
export interface StageStatus extends Omit<EngineStatus, 'pose'> { pose: ActionName; reason: StageReason; ready: boolean; paused: boolean }
export interface CharacterStageProps {
  character: CharacterSlug;
  action?: ActionName;
  paused?: boolean;
  attitudeEnabled?: boolean;
  command?: StageCommand;
  replay?: number;
  onStatus?: (status: StageStatus) => void;
  /** Observe user-generated stage intents. Do not echo these back as commands. */
  onCommand?: (command: StageCommand) => void;
  onError?: (error: unknown) => void;
  label?: string;
  className?: string;
}
type PointerSession = { id: number; offset: Point; lastTime: number };
type Controls = { submit(command: StageCommand, internal?: boolean): void; startPointer(event: PointerEvent<HTMLButtonElement>): void; movePointer(event: PointerEvent<HTMLButtonElement>): void; finishPointer(cancelled?: boolean): void; keyboard(event: KeyboardEvent<HTMLButtonElement>): void; tap(event: PointerEvent<HTMLDivElement>): void; sync(): void; notify(reason: StageReason): void; loaded(character: CharacterSlug, failed?: boolean, error?: unknown): void };

/** One clipped stage; one finite translation loop; the Character owns its own joints. */
export function CharacterStage(props: CharacterStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLButtonElement>(null);
  const latest = useRef(props); latest.current = props;
  const engine = useRef(createStage());
  const controls = useRef<Controls | null>(null);
  const pointer = useRef<PointerSession | null>(null);
  const pending = useRef<StageCommand | null>(null);
  const seen = useRef<string | number | null>(null);
  const previousCharacter = useRef(props.character);
  const reduced = useMedia('(prefers-reduced-motion: reduce)', true);
  const restrictions = useRef({ paused: !!props.paused, reduced, visible: false, intersects: false, measured: false, characterReady: null as CharacterSlug | null });
  const [restricted, setRestricted] = useState(true);
  const [motionPose, setMotionPose] = useState<ActionName | null>(null);
  const [hidden, setHidden] = useState(false);
  const [grabbed, setGrabbed] = useState(false);
  const [poseReplay, setPoseReplay] = useState(0);
  const helpId = useId();

  useEffect(() => {
    const stage = stageRef.current, actor = actorRef.current, handle = handleRef.current;
    if (!stage || !actor || !handle) return;
    let frame = 0, last = 0, disposed = false, serial = 0;
    let currentPose: ActionName | null = null;
    let currentHidden = false;
    let keyboardGrab = false;
    const ready = () => restrictions.current.measured && restrictions.current.characterReady === latest.current.character;
    const blocked = () => { const value = restrictions.current; return value.paused || value.reduced || !value.visible || !value.intersects || !ready(); };
    const notify = (reason: StageReason) => {
      if (disposed) return;
      const status = stageStatus(engine.current);
      latest.current.onStatus?.({ ...status, pose: status.pose || latest.current.action || 'Idle', reason, ready: ready(), paused: blocked() });
    };
    const paint = () => {
      const state = engine.current;
      actor.style.left = '0px'; actor.style.top = '0px'; actor.style.bottom = 'auto';
      actor.style.transform = `translate3d(${state.x.toFixed(3)}px, ${state.y.toFixed(3)}px, 0)`;
      actor.style.visibility = state.visible ? 'visible' : 'hidden';
      stage.dataset.phase = state.phase;
      actor.dataset.x = state.x.toFixed(3); actor.dataset.y = state.y.toFixed(3);
      const pose = state.active?.pose || null;
      actor.dataset.action = pose || latest.current.action || 'Idle';
      if (pose !== currentPose) { currentPose = pose; setMotionPose(pose); }
      if (!state.visible !== currentHidden) { currentHidden = !state.visible; setHidden(currentHidden); }
    };
    const stopFrame = () => { if (frame) cancelAnimationFrame(frame); frame = 0; last = 0; };
    const schedule = () => { if (!disposed && !frame && !blocked() && hasStageWork(engine.current)) frame = requestAnimationFrame(advance); };
    const advance = (now: number) => {
      frame = 0;
      if (disposed || blocked()) { last = 0; return; }
      const dt = last ? (now - last) / 1000 : 0;
      last = now;
      const oldRevision = engine.current.revision;
      engine.current = tickStage(engine.current, dt);
      paint();
      if (engine.current.revision !== oldRevision) notify(engine.current.active ? 'command' : 'complete');
      if (hasStageWork(engine.current)) schedule(); else last = 0;
    };
    const releaseCapture = () => {
      const session = pointer.current; pointer.current = null;
      if (session) { try { if (handle.hasPointerCapture(session.id)) handle.releasePointerCapture(session.id); } catch { /* Detached/cancelled capture is already released. */ } }
    };
    const finishPointer = (cancelled = false) => {
      if (!pointer.current && !keyboardGrab && engine.current.phase !== 'dragging') return;
      engine.current = cancelled ? cancelDrag(engine.current) : endDrag(engine.current);
      keyboardGrab = false; releaseCapture(); setGrabbed(false);
      paint(); notify('drop'); schedule();
    };
    const submit = (command: StageCommand, internal = false) => {
      if (disposed) return;
      if (internal) latest.current.onCommand?.(command);
      pending.current = null;
      if (command.kind !== 'cancel' && blocked()) { pending.current = command; notify('pause'); return; }
      keyboardGrab = false; stopFrame();
      engine.current = issueCommand(engine.current, command);
      releaseCapture(); setGrabbed(false);
      setPoseReplay(value => value + 1);
      paint(); notify('command'); schedule();
    };
    const internal = (kind: StageCommand['kind'], target?: StageCommand['target']) => submit({ id: `stage-${helpId}-${++serial}`, kind, ...(target === undefined ? {} : { target }) }, true);
    const sync = () => {
      if (disposed) return;
      const halted = blocked(); setRestricted(halted);
      if (halted) { stopFrame(); finishPointer(true); }
      else if (pending.current) { const command = pending.current; pending.current = null; submit(command); }
      else schedule();
      notify('pause');
    };
    const measure = () => {
      if (disposed) return;
      if (pointer.current || keyboardGrab) finishPointer(true);
      const width = stage.clientWidth, height = stage.clientHeight;
      const actorWidth = actor.offsetWidth, actorHeight = actor.offsetHeight;
      engine.current = resizeStage(engine.current, { width, height, actorWidth, actorHeight });
      restrictions.current.measured = width > 0 && height > 0 && actorWidth > 0 && actorHeight > 0;
      paint(); notify('resize'); sync();
    };
    controls.current = {
      submit, finishPointer, sync, notify,
      loaded(character, failed = false, error) {
        if (character !== latest.current.character) return;
        restrictions.current.characterReady = failed ? null : character;
        sync(); notify('ready');
        if (failed) latest.current.onError?.(error);
      },
      startPointer(event) {
        if (blocked() || !event.isPrimary || event.button !== 0 || pointer.current) return;
        event.preventDefault(); event.stopPropagation();
        try { handle.setPointerCapture(event.pointerId); } catch { return; }
        handle.focus({ preventScroll: true });
        pending.current = null; keyboardGrab = false; stopFrame();
        engine.current = beginDrag(engine.current);
        const rect = stage.getBoundingClientRect();
        pointer.current = { id: event.pointerId, offset: { x: event.clientX - rect.left - engine.current.x, y: event.clientY - rect.top - engine.current.y }, lastTime: event.timeStamp };
        setGrabbed(true); paint(); notify('drag');
      },
      movePointer(event) {
        const session = pointer.current;
        if (!session || session.id !== event.pointerId || blocked()) return;
        event.preventDefault(); event.stopPropagation();
        const rect = stage.getBoundingClientRect();
        engine.current = dragTo(engine.current, { x: event.clientX - rect.left - session.offset.x, y: event.clientY - rect.top - session.offset.y }, (event.timeStamp - session.lastTime) / 1000);
        session.lastTime = event.timeStamp; paint();
      },
      keyboard(event) {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', ' ', 'Escape'].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation();
        if (event.key === 'Escape') { finishPointer(true); return; }
        if (blocked()) return;
        if (event.key === ' ') {
          if (event.repeat) return;
          if (keyboardGrab) finishPointer();
          else { pending.current = null; stopFrame(); engine.current = beginDrag(engine.current); keyboardGrab = true; setGrabbed(true); paint(); notify('drag'); }
          return;
        }
        if (keyboardGrab && event.key.startsWith('Arrow')) {
          const amount = event.shiftKey ? 8 : 24;
          const point = { x: engine.current.x + (event.key === 'ArrowLeft' ? -amount : event.key === 'ArrowRight' ? amount : 0), y: engine.current.y + (event.key === 'ArrowUp' ? -amount : event.key === 'ArrowDown' ? amount : 0) };
          engine.current = dragTo(engine.current, point); paint(); return;
        }
        if (keyboardGrab) finishPointer(true);
        if (event.key === 'Home' || event.key === 'ArrowDown') internal('home');
        else if (event.key === 'End') internal('walkTo', 1);
        else if (event.key === 'ArrowUp') internal('jump');
        else internal('walkTo', normalizedPosition(engine.current).x + (event.key === 'ArrowLeft' ? -0.12 : 0.12));
      },
      tap(event) {
        if (event.target !== stage || blocked() || !event.isPrimary || event.button !== 0) return;
        const bounds = boundsFor(engine.current.size), rect = stage.getBoundingClientRect();
        const span = bounds.maxX - bounds.minX;
        internal('walkTo', span > 0 ? (event.clientX - rect.left - engine.current.size.actorWidth / 2 - bounds.minX) / span : 0.5);
      },
    };
    const visibility = () => { restrictions.current.visible = document.visibilityState !== 'hidden'; sync(); };
    const blur = () => finishPointer(true);
    restrictions.current.visible = document.visibilityState !== 'hidden';
    let resizeObserver: ResizeObserver | undefined;
    let intersection: IntersectionObserver | undefined;
    if (typeof ResizeObserver === 'function') { resizeObserver = new ResizeObserver(measure); resizeObserver.observe(stage); resizeObserver.observe(actor); }
    else window.addEventListener('resize', measure);
    if (typeof IntersectionObserver === 'function') {
      intersection = new IntersectionObserver(entries => { restrictions.current.intersects = entries.some(entry => entry.isIntersecting); sync(); }, { threshold: 0.01 });
      intersection.observe(stage);
    } else restrictions.current.intersects = true;
    document.addEventListener('visibilitychange', visibility); window.addEventListener('blur', blur);
    measure();
    return () => { disposed = true; controls.current = null; stopFrame(); releaseCapture(); resizeObserver?.disconnect(); intersection?.disconnect(); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('resize', measure); window.removeEventListener('blur', blur); };
  }, [helpId]);

  useEffect(() => { restrictions.current.paused = !!props.paused; restrictions.current.reduced = reduced; controls.current?.sync(); }, [props.paused, reduced]);
  useEffect(() => {
    if (previousCharacter.current === props.character) return;
    previousCharacter.current = props.character;
    restrictions.current.characterReady = null;
    controls.current?.finishPointer(true);
    controls.current?.submit({ id: `character-${props.character}`, kind: 'cancel' });
    controls.current?.sync();
  }, [props.character]);
  useEffect(() => {
    if (!props.command || seen.current === props.command.id) return;
    seen.current = props.command.id; controls.current?.submit(props.command);
  }, [props.command]);

  const action = motionPose || props.action || 'Idle';
  return <div ref={stageRef} className={`tsc-character-stage ${props.className || ''}`} data-testid="character-stage" data-reduced-motion={reduced ? 'true' : 'false'} onPointerUp={event => controls.current?.tap(event)}>
    <div ref={actorRef} className="tsc-character-stage__actor" data-testid="stage-actor" data-action={action}>
      <div className="tsc-character-stage__art" aria-hidden="true">
        <Character character={props.character} action={action} paused={restricted || hidden} attitudeEnabled={props.attitudeEnabled} replay={poseReplay + (props.replay || 0)} travel={false} onReady={() => controls.current?.loaded(props.character)} onError={error => controls.current?.loaded(props.character, true, error)} />
      </div>
      <button ref={handleRef} type="button" className="tsc-character-stage__handle" data-testid="stage-actor-handle" aria-label={props.label || `Move ${props.character.replaceAll('-', ' ')}`} aria-describedby={helpId} aria-pressed={grabbed} aria-disabled={restricted} tabIndex={hidden ? -1 : 0} onPointerDown={event => controls.current?.startPointer(event)} onPointerMove={event => controls.current?.movePointer(event)} onPointerUp={event => { event.stopPropagation(); if (pointer.current?.id === event.pointerId) controls.current?.finishPointer(); }} onPointerCancel={event => { if (pointer.current?.id === event.pointerId) controls.current?.finishPointer(true); }} onLostPointerCapture={event => { if (pointer.current?.id === event.pointerId) controls.current?.finishPointer(true); }} onKeyDown={event => controls.current?.keyboard(event)} onClick={event => { event.preventDefault(); event.stopPropagation(); }} onBlur={() => controls.current?.finishPointer(true)}>
        <span className="tsc-stage-sr-only">Move character</span>
      </button>
    </div>
    <span id={helpId} className="tsc-stage-sr-only">Drag the character, or press Space to pick up and drop. Arrow keys move a held character; Shift makes smaller steps. When not held, Left and Right walk, Up jumps, Down or Home returns to center, and End walks right. Escape releases. Movement stops when paused or reduced motion is enabled.</span>
  </div>;
}
