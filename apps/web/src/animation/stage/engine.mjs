/** Deterministic stage math. Pixels internally; public command targets are 0..1.
 * All travel is finite. No random numbers, clocks, DOM, timers or mirrored artwork.
 */
import { PERFORMANCES } from '../performances/catalog.mjs';
export const COMMAND_KINDS = Object.freeze(['enterLeft', 'enterRight', 'exitLeft', 'exitRight', 'walkTo', 'runTo', 'roam', 'peekLeft', 'peekRight', 'jump', 'home', 'return', 'cancel', 'replay']);
export const MAX_DELTA = 0.05;
export const MAX_SEQUENCE = 12;
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.min(high, Math.max(low, finite(value, low)));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
function dimensions(value = {}) {
  return {
    width: clamp(value.width ?? 720, 0, 20_000), height: clamp(value.height ?? 400, 0, 20_000),
    actorWidth: clamp(value.actorWidth ?? 180, 1, 10_000), actorHeight: clamp(value.actorHeight ?? 230, 1, 10_000),
  };
}
export function boundsFor(size) {
  const { width, height, actorWidth, actorHeight } = dimensions(size);
  const minX = actorWidth > width ? (width - actorWidth) / 2 : 0;
  const minY = actorHeight > height ? (height - actorHeight) / 2 : 0;
  return { minX, maxX: actorWidth > width ? minX : width - actorWidth, minY, maxY: actorHeight > height ? minY : height - actorHeight };
}
export function normalizedPosition(state) {
  const bounds = boundsFor(state.size);
  return {
    x: bounds.maxX > bounds.minX ? clamp((state.x - bounds.minX) / (bounds.maxX - bounds.minX), 0, 1) : 0.5,
    y: bounds.maxY > bounds.minY ? clamp((state.y - bounds.minY) / (bounds.maxY - bounds.minY), 0, 1) : 1,
  };
}
function targetPoint(state, target, defaultX = 0.5) {
  const bounds = boundsFor(state.size);
  const point = typeof target === 'number' ? { x: target } : target || {};
  return { x: lerp(bounds.minX, bounds.maxX, clamp(point.x ?? defaultX, 0, 1)), y: lerp(bounds.minY, bounds.maxY, clamp(point.y ?? 1, 0, 1)) };
}
export function createStage(size = {}) {
  const actual = dimensions(size);
  const bounds = boundsFor(actual);
  return { size: actual, x: lerp(bounds.minX, bounds.maxX, 0.5), y: bounds.maxY, visible: true, phase: 'idle', active: null, queue: [], elapsed: 0, commandId: null, commandKind: null, lastCommand: null, revision: 0, velocity: { x: 0, y: 0 } };
}
function segment(state, to, style = 'walk', extra = {}) {
  const distance = Math.hypot(to.x - state.x, to.y - state.y);
  const running = style === 'run';
  return { from: { x: state.x, y: state.y }, to, duration: clamp(distance / (running ? 360 : 145), 0.16, running ? 3 : 5), style, pose: `${running ? 'Run' : 'Walk'}${to.x < state.x ? 'Left' : 'Right'}`, ...extra };
}
function startSegments(state, segments) {
  const bounded = segments.slice(0, MAX_SEQUENCE);
  return { ...state, active: bounded[0] || null, queue: bounded.slice(1), elapsed: 0, phase: bounded.length ? (bounded[0].style === 'settle' ? 'settling' : 'moving') : (state.visible ? 'idle' : 'hidden'), revision: state.revision + 1 };
}
function cloneCommand(command) {
  return { id: command.id, kind: command.kind, ...(command.target === undefined ? {} : { target: typeof command.target === 'number' ? finite(command.target, 0.5) : { x: finite(command.target?.x, 0.5), y: finite(command.target?.y, 1) } }) };
}
export function issueCommand(previous, command) {
  if (!command || !COMMAND_KINDS.includes(command.kind)) return previous;
  let intent = command.kind === 'replay' && previous.lastCommand ? { ...previous.lastCommand, id: command.id } : cloneCommand(command);
  if (intent.kind === 'replay') return previous;
  let state = { ...previous, active: null, queue: [], elapsed: 0, velocity: { x: 0, y: 0 }, commandId: command.id, commandKind: intent.kind, revision: previous.revision + 1 };
  if (intent.kind === 'cancel') return { ...state, phase: state.visible ? 'idle' : 'hidden' };
  state.lastCommand = cloneCommand(intent);
  const bounds = boundsFor(state.size);
  const home = targetPoint(state, intent.target);
  const { width, actorWidth } = state.size;
  if (intent.kind === 'enterLeft' || intent.kind === 'enterRight') {
    state = { ...state, x: intent.kind === 'enterLeft' ? -actorWidth - 4 : width + 4, y: home.y, visible: true };
    return startSegments(state, [segment(state, home, 'walk', { style: 'enter' })]);
  }
  if (intent.kind === 'exitLeft' || intent.kind === 'exitRight') {
    return startSegments({ ...state, visible: true }, [segment(state, { x: intent.kind === 'exitLeft' ? -actorWidth - 4 : width + 4, y: state.y }, 'walk', { style: 'exit', hideAfter: true })]);
  }
  if (intent.kind === 'peekLeft' || intent.kind === 'peekRight') {
    const left = intent.kind === 'peekLeft';
    state = { ...state, x: left ? -actorWidth - 4 : width + 4, y: bounds.maxY, visible: true };
    const point = { x: left ? -actorWidth * 0.58 : width - actorWidth * 0.42, y: bounds.maxY };
    const entry = segment(state, point, 'walk', { duration: 0.5 });
    const hold = { from: point, to: point, duration: PERFORMANCES.Suspicious.seconds, style: 'hold', pose: 'Suspicious' };
    return startSegments(state, [entry, hold]);
  }
  if (intent.kind === 'jump') {
    const from = { x: clamp(state.x, bounds.minX, bounds.maxX), y: clamp(state.y, bounds.minY, bounds.maxY) };
    state = { ...state, ...from, visible: true };
    return startSegments(state, [
      // Authored Jump owns the vertical body trajectory. Do not add a second
      // world-space lift to its body-bob motion; preserve the whole acting clip.
      { from, to: from, duration: PERFORMANCES.Jump.seconds, style: 'jump', pose: 'Jump', height: 0 },
      { from, to: from, duration: PERFORMANCES.Land.seconds, style: 'land', pose: 'Land' },
    ]);
  }
  if (intent.kind === 'roam') {
    const segments = [];
    let cursor = { ...state, visible: true };
    for (const [index, x] of [0.12, 0.83, 0.31, 0.68, 0.5].entries()) {
      const to = targetPoint(cursor, x);
      const next = segment(cursor, to, index === 2 ? 'run' : 'walk');
      segments.push(next);
      cursor = { ...cursor, ...to };
    }
    return startSegments({ ...state, visible: true }, segments);
  }
  return startSegments({ ...state, visible: true }, [segment(state, home, intent.kind === 'runTo' ? 'run' : 'walk')]);
}
export function hasStageWork(state) { return !!state.active && state.phase !== 'dragging'; }
export function tickStage(previous, delta, enabled = true) {
  if (!enabled || !hasStageWork(previous)) return previous;
  const dt = clamp(delta, 0, MAX_DELTA);
  if (!dt) return previous;
  const active = previous.active;
  const elapsed = Math.min(active.duration, previous.elapsed + dt);
  const t = clamp(elapsed / active.duration, 0, 1);
  const progress = ['enter', 'exit'].includes(active.style) ? smooth(t) : active.style === 'settle' ? 1 - Math.pow(1 - t, 3) : t;
  let x = lerp(active.from.x, active.to.x, progress);
  let y = lerp(active.from.y, active.to.y, progress);
  if (active.style === 'jump') y -= Math.sin(Math.PI * t) * finite(active.height);
  if (active.style === 'settle') {
    // Analytic decay with a finite deadline: no accumulated physics energy.
    y = active.to.y + (active.from.y - active.to.y) * Math.exp(-7 * t) * (0.5 + 0.5 * Math.cos(3 * Math.PI * t));
    const bounds = boundsFor(previous.size);
    x = clamp(x, bounds.minX, bounds.maxX); y = clamp(y, bounds.minY, bounds.maxY);
  }
  let state = { ...previous, x, y, elapsed };
  if (t < 1) return state;
  state = { ...state, x: active.to.x, y: active.to.y, visible: active.hideAfter ? false : state.visible, velocity: { x: 0, y: 0 } };
  if (state.queue.length) return startSegments(state, state.queue);
  return { ...state, active: null, queue: [], elapsed: 0, phase: state.visible ? 'idle' : 'hidden', revision: state.revision + 1 };
}
function remap(value, oldMin, oldMax, nextMin, nextMax, actorRatio, collapsedRatio = 0.5) {
  if (value < oldMin) return nextMin + (value - oldMin) * actorRatio;
  if (value > oldMax) return nextMax + (value - oldMax) * actorRatio;
  return oldMax === oldMin ? lerp(nextMin, nextMax, collapsedRatio) : lerp(nextMin, nextMax, clamp((value - oldMin) / (oldMax - oldMin), 0, 1));
}
export function resizeStage(previous, size) {
  const actual = dimensions({ ...previous.size, ...size });
  const old = boundsFor(previous.size), next = boundsFor(actual);
  const map = point => ({ x: remap(point.x, old.minX, old.maxX, next.minX, next.maxX, actual.actorWidth / previous.size.actorWidth), y: clamp(remap(point.y, old.minY, old.maxY, next.minY, next.maxY, actual.actorHeight / previous.size.actorHeight, 1), next.minY, next.maxY) });
  const mapSegment = value => ({ ...value, from: map(value.from), to: map(value.to), ...(value.height === undefined ? {} : { height: Math.max(0, Math.min(value.height, map(value.from).y - next.minY)) }) });
  const position = map(previous);
  // Overscan remapping is piecewise: interpolating remapped original endpoints
  // could jump after a resize. Continue from the actual remapped position for
  // the remaining duration, while keeping the same acting pose and deadline.
  const active = previous.active ? { ...mapSegment(previous.active), from: position, duration: Math.max(0.001, previous.active.duration - previous.elapsed) } : null;
  return { ...previous, ...position, size: actual, active, elapsed: 0, queue: previous.queue.map(mapSegment), velocity: { x: 0, y: 0 }, revision: previous.revision + 1 };
}
export function beginDrag(previous) {
  const bounds = boundsFor(previous.size);
  return { ...previous, x: clamp(previous.x, bounds.minX, bounds.maxX), y: clamp(previous.y, bounds.minY, bounds.maxY), visible: true, active: null, queue: [], elapsed: 0, commandId: null, commandKind: null, phase: 'dragging', velocity: { x: 0, y: 0 }, revision: previous.revision + 1 };
}
export function dragTo(previous, point, delta = 1 / 60) {
  if (previous.phase !== 'dragging') return previous;
  const bounds = boundsFor(previous.size), dt = clamp(delta, 0.004, MAX_DELTA);
  const x = clamp(point?.x, bounds.minX, bounds.maxX), y = clamp(point?.y, bounds.minY, bounds.maxY);
  return { ...previous, x, y, velocity: { x: clamp((x - previous.x) / dt, -900, 900), y: clamp((y - previous.y) / dt, -900, 900) } };
}
export function endDrag(previous) {
  if (previous.phase !== 'dragging') return previous;
  const bounds = boundsFor(previous.size);
  const to = { x: clamp(previous.x + previous.velocity.x * 0.08, bounds.minX, bounds.maxX), y: bounds.maxY };
  return startSegments(previous, [{ from: { x: previous.x, y: previous.y }, to, duration: PERFORMANCES.Land.seconds, style: 'settle', pose: 'Land' }]);
}
export function cancelDrag(previous) { return endDrag({ ...previous, velocity: { x: 0, y: 0 } }); }
export function stageStatus(state) {
  return { phase: state.phase, commandId: state.commandId, commandKind: state.commandKind, complete: !state.active && state.phase !== 'dragging', position: normalizedPosition(state), pose: state.active?.pose ?? null, visible: state.visible };
}
