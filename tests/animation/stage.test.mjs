import assert from 'node:assert/strict';
import test from 'node:test';
import { beginDrag, boundsFor, cancelDrag, COMMAND_KINDS, createStage, dragTo, endDrag, hasStageWork, issueCommand, MAX_DELTA, MAX_SEQUENCE, normalizedPosition, resizeStage, stageStatus, tickStage } from '../../apps/web/src/animation/stage/engine.mjs';
import { PERFORMANCES } from '../../apps/web/src/animation/performances/catalog.mjs';

const size = { width: 688, height: 370, actorWidth: 220, actorHeight: 281 };
const close = (actual, expected, tolerance = 1e-7) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
function finite(state) {
  for (const value of [state.x, state.y, state.elapsed, state.velocity.x, state.velocity.y, ...Object.values(state.size)]) assert.ok(Number.isFinite(value));
  assert.ok(state.queue.length < MAX_SEQUENCE);
  assert.ok(state.active === null || state.active.duration > 0);
}
function inside(state) {
  const bounds = boundsFor(state.size);
  finite(state);
  assert.ok(state.x >= bounds.minX - 1e-7 && state.x <= bounds.maxX + 1e-7);
  assert.ok(state.y >= bounds.minY - 1e-7 && state.y <= bounds.maxY + 1e-7);
}
function finish(state, check = finite) {
  let ticks = 0;
  while (hasStageWork(state) && ticks++ < 4000) { state = tickStage(state, 1 / 60); check(state); }
  assert.ok(ticks < 4000, 'every command has a finite deadline');
  assert.equal(hasStageWork(state), false);
  return state;
}
function step(state, seconds) {
  for (let elapsed = 0; elapsed < seconds - 1e-8; elapsed += 0.01) state = tickStage(state, Math.min(0.01, seconds - elapsed));
  return state;
}
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.freeze(value); Object.values(value).forEach(freeze); }
  return value;
}

test('stage starts at floor center without autonomous travel or queued work', () => {
  const state = createStage(size);
  assert.deepEqual(normalizedPosition(state), { x: 0.5, y: 1 });
  assert.equal(hasStageWork(state), false);
  assert.equal(tickStage(state, 999), state);
  assert.equal(issueCommand(state, { id: 1, kind: 'not-a-command' }), state);
  assert.equal(issueCommand(state, { id: 2, kind: 'replay' }), state);
  assert.equal(stageStatus(state).complete, true);
});

test('normalized targets are clamped and nonfinite targets cannot poison stage math', () => {
  for (const target of [-10, 12, NaN, Infinity, { x: -2, y: 7 }, { x: Infinity, y: NaN }]) {
    const state = finish(issueCommand(createStage(size), { id: 1, kind: 'walkTo', target }), inside);
    const point = normalizedPosition(state);
    assert.ok(point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1);
  }
  assert.deepEqual(normalizedPosition(finish(issueCommand(createStage(size), { id: 1, kind: 'walkTo', target: { x: 0.2, y: 0.4 } }))), { x: 0.2, y: 0.4 });
});

test('left and right travel select authored facing poses; running covers the same distance sooner', () => {
  for (const [target, direction] of [[0, 'Left'], [1, 'Right']]) {
    const walk = issueCommand(createStage(size), { id: 1, kind: 'walkTo', target });
    const run = issueCommand(createStage(size), { id: 2, kind: 'runTo', target });
    assert.equal(walk.active.pose, `Walk${direction}`);
    assert.equal(run.active.pose, `Run${direction}`);
    assert.ok(run.active.duration < walk.active.duration);
    assert.deepEqual(normalizedPosition(finish(run, inside)), normalizedPosition(finish(walk, inside)));
  }
});

test('paused time is ignored and long background gaps consume at most one bounded frame', () => {
  const initial = issueCommand(createStage(size), { id: 1, kind: 'walkTo', target: 1 });
  const held = step(initial, 0.3);
  for (const delta of [30, 3600, Number.MAX_VALUE]) assert.equal(tickStage(held, delta, false), held);
  assert.deepEqual(tickStage(held, 3600), tickStage(held, MAX_DELTA));
  for (const delta of [0, -1, NaN, Infinity]) assert.equal(tickStage(held, delta), held);
  assert.ok(tickStage(held, 3600).x - held.x <= 145 * MAX_DELTA + 1e-7);
});

test('entry starts beyond its own clipped edge and exits become hidden only on completion', () => {
  for (const side of ['Left', 'Right']) {
    const entry = issueCommand(createStage(size), { id: 1, kind: `enter${side}`, target: 0.3 });
    assert.equal(entry.visible, true);
    assert.ok(side === 'Left' ? entry.x + size.actorWidth < 0 : entry.x > size.width);
    const arrived = finish(entry);
    close(normalizedPosition(arrived).x, 0.3);
    const exit = issueCommand(arrived, { id: 2, kind: `exit${side}` });
    assert.equal(step(exit, 0.1).visible, true);
    const hidden = finish(exit);
    assert.equal(hidden.visible, false);
    assert.equal(hidden.phase, 'hidden');
    assert.equal(stageStatus(hidden).complete, true);
    assert.ok(side === 'Left' ? hidden.x + size.actorWidth < 0 : hidden.x > size.width);
    assert.equal(tickStage(hidden, 5), hidden);
  }
});

test('peeking leaves part of the actor visible and preserves the full suspicious performance', () => {
  for (const side of ['Left', 'Right']) {
    const peek = issueCommand(createStage(size), { id: 1, kind: `peek${side}` });
    assert.equal(peek.queue[0].pose, 'Suspicious');
    assert.equal(peek.queue[0].duration, PERFORMANCES.Suspicious.seconds);
    const holding = step(peek, 0.6);
    assert.equal(holding.active.pose, 'Suspicious');
    assert.ok(side === 'Left' ? holding.x < 0 && holding.x + size.actorWidth > 0 : holding.x < size.width && holding.x + size.actorWidth > size.width);
    assert.equal(step(holding, PERFORMANCES.Suspicious.peakSeconds).active.pose, 'Suspicious');
    assert.equal(finish(holding).visible, true);
  }
});

test('jump uses one authored vertical trajectory and runs complete Jump then Land phases', () => {
  let state = issueCommand(createStage(size), { id: 'jump', kind: 'jump' });
  const position = { x: state.x, y: state.y };
  assert.equal(state.active.duration, PERFORMANCES.Jump.seconds);
  assert.equal(state.active.height, 0, 'the renderer owns the Jump body lift');
  assert.equal(state.queue[0].duration, PERFORMANCES.Land.seconds);
  state = step(state, PERFORMANCES.Jump.peakSeconds);
  assert.equal(state.active.pose, 'Jump');
  assert.deepEqual({ x: state.x, y: state.y }, position);
  while (state.active.pose === 'Jump') state = tickStage(state, 0.01);
  assert.equal(state.active.pose, 'Land');
  assert.equal(state.elapsed, 0);
  state = step(state, PERFORMANCES.Land.peakSeconds);
  assert.equal(state.active.pose, 'Land');
  assert.deepEqual({ x: state.x, y: state.y }, position);
  assert.equal(finish(state, inside).phase, 'idle');
});

test('roaming is opt-in, deterministic, bounded and finite', () => {
  const a = issueCommand(createStage(size), { id: 'roam', kind: 'roam' });
  const b = issueCommand(createStage(size), { id: 'roam', kind: 'roam' });
  assert.deepEqual(a, b);
  assert.equal(a.queue.length, 4);
  assert.equal(a.queue[1].pose, 'RunLeft');
  const final = finish(a, inside);
  assert.deepEqual(final, finish(b, inside));
  assert.deepEqual(normalizedPosition(final), { x: 0.5, y: 1 });
  assert.equal(tickStage(final, 100), final);
});

test('cancellation freezes the current position and replay recalls the last finite command', () => {
  const roaming = step(issueCommand(createStage(size), { id: 1, kind: 'roam' }), 0.2);
  const cancelled = issueCommand(roaming, { id: 2, kind: 'cancel' });
  assert.equal(cancelled.x, roaming.x); assert.equal(cancelled.y, roaming.y);
  assert.equal(cancelled.active, null); assert.deepEqual(cancelled.queue, []);
  assert.equal(tickStage(cancelled, 10), cancelled);
  assert.equal(stageStatus(cancelled).pose, null, 'base mood belongs to React props');
  const replay = issueCommand(cancelled, { id: 3, kind: 'replay' });
  assert.equal(replay.commandId, 3); assert.equal(replay.commandKind, 'roam');
  assert.equal(replay.queue.length, 4);
  assert.deepEqual(normalizedPosition(finish(replay, inside)), { x: 0.5, y: 1 });
});

test('drag interrupts the old sequence and extreme pointer samples stay bounded', () => {
  const roaming = issueCommand(createStage(size), { id: 'old-show', kind: 'roam' });
  let state = beginDrag(roaming);
  assert.equal(state.phase, 'dragging'); assert.equal(state.active, null);
  assert.equal(state.commandId, null); assert.equal(state.commandKind, null);
  assert.deepEqual(state.queue, []); assert.equal(hasStageWork(state), false);
  for (const point of [{ x: -1e12, y: 1e12 }, { x: 1e12, y: -1e12 }, { x: NaN, y: Infinity }]) {
    state = dragTo(state, point, 0); inside(state);
    assert.ok(Math.abs(state.velocity.x) <= 900 && Math.abs(state.velocity.y) <= 900);
  }
  assert.equal(stageStatus(state).complete, false);
  assert.equal(tickStage(state, 2), state);
});

test('drop settles analytically within bounds at a fixed deadline and cannot revive an old show', () => {
  const held = dragTo(beginDrag(issueCommand(createStage(size), { id: 'show', kind: 'roam' })), { x: 120, y: 3 }, 0.01);
  const dropped = endDrag(held);
  assert.equal(dropped.phase, 'settling'); assert.equal(dropped.active.pose, 'Land');
  assert.equal(dropped.active.duration, PERFORMANCES.Land.seconds);
  const landed = finish(dropped, inside);
  close(landed.y, boundsFor(size).maxY);
  assert.equal(landed.commandId, null);
  assert.equal(stageStatus(landed).complete, true);
  assert.deepEqual(landed.velocity, { x: 0, y: 0 });
  assert.equal(tickStage(landed, 1e9), landed);
  const cancelled = finish(cancelDrag(held), inside);
  close(cancelled.x, held.x, 1e-7);
  assert.ok(Math.abs(landed.x - held.x) <= 72);
});

test('resizing ordinary positions preserves normalized placement and floor attachment', () => {
  const positioned = finish(issueCommand(createStage(size), { id: 1, kind: 'walkTo', target: { x: 0.73, y: 0.32 } }));
  const resized = resizeStage(positioned, { width: 350, height: 420, actorWidth: 180, actorHeight: 230 });
  close(normalizedPosition(resized).x, 0.73); close(normalizedPosition(resized).y, 0.32);
  const floor = resizeStage(createStage(size), { height: 600 });
  close(floor.y, boundsFor(floor.size).maxY);
});

test('zero-size stages and actors wider than their stage remain finite and restore to floor center', () => {
  for (const targetSize of [{ width: 0, height: 0 }, { width: 110, height: 80 }, { width: NaN, height: Infinity, actorWidth: -1, actorHeight: NaN }]) {
    let state = resizeStage(createStage(size), targetSize);
    inside(state);
    state = finish(endDrag(dragTo(beginDrag(state), { x: 1e9, y: -1e9 })), inside);
    state = resizeStage(state, size); inside(state);
    assert.deepEqual(normalizedPosition(state), { x: 0.5, y: 1 });
  }
});

test('resize during movement keeps continuity and remaps pending destinations', () => {
  for (const kind of ['walkTo', 'runTo', 'enterLeft', 'enterRight', 'roam', 'jump']) {
    const moving = step(issueCommand(createStage(size), { id: kind, kind, target: 0.8 }), 0.24);
    const remaining = moving.active.duration - moving.elapsed;
    const resized = resizeStage(moving, { width: 1200, height: 600, actorWidth: 180, actorHeight: 230 });
    finite(resized); close(resized.active.duration, remaining);
    assert.deepEqual(resized.active.from, { x: resized.x, y: resized.y });
    const next = tickStage(resized, 0.000001);
    assert.ok(Math.hypot(next.x - resized.x, next.y - resized.y) < 0.01, `${kind} jumps after resize`);
    const final = finish(resized);
    if (kind !== 'jump') close(normalizedPosition(final).x, kind === 'roam' ? 0.5 : 0.8);
    inside(final);
  }
});

test('resize during drag or settle remains clamped without accumulating velocity', () => {
  const dragging = dragTo(beginDrag(createStage(size)), { x: 450, y: 10 }, 0.01);
  const held = resizeStage(dragging, { width: 130, height: 100 });
  inside(held); assert.equal(held.phase, 'dragging'); assert.deepEqual(held.velocity, { x: 0, y: 0 });
  const settling = step(endDrag(dragging), 0.31);
  const resized = resizeStage(settling, { width: 330, height: 450, actorWidth: 160, actorHeight: 205 });
  inside(resized);
  const next = tickStage(resized, 0.000001);
  assert.ok(Math.hypot(next.x - resized.x, next.y - resized.y) < 0.01);
  inside(finish(resized, inside));
});

test('home and return recover from clipped exits and peeks', () => {
  for (const origin of ['exitLeft', 'exitRight', 'peekLeft', 'peekRight']) {
    for (const kind of ['home', 'return']) {
      const state = finish(issueCommand(finish(issueCommand(createStage(size), { id: 1, kind: origin })), { id: 2, kind }));
      assert.equal(state.visible, true);
      assert.deepEqual(normalizedPosition(state), { x: 0.5, y: 1 });
    }
  }
});

test('public operations preserve frozen prior states and copied command targets', () => {
  const initial = freeze(createStage(size));
  const target = { x: 0.8, y: 0.5 };
  const moving = freeze(issueCommand(initial, { id: 1, kind: 'walkTo', target }));
  target.x = 0;
  close(moving.lastCommand.target.x, 0.8);
  const advanced = freeze(tickStage(moving, 0.01));
  finite(resizeStage(advanced, { width: 400 }));
  const dragging = freeze(beginDrag(advanced));
  const dragged = freeze(dragTo(dragging, { x: 50, y: 10 }));
  finite(endDrag(dragged)); finite(cancelDrag(dragged));
  finite(issueCommand(advanced, { id: 2, kind: 'cancel' }));
  assert.deepEqual(initial, createStage(size));
});

test('every exposed command completes or is a defined no-op across desktop and narrow stage sizes', () => {
  for (const stageSize of [size, { width: 260, height: 340, actorWidth: 160, actorHeight: 205 }, { width: 90, height: 70, actorWidth: 200, actorHeight: 256 }]) {
    for (const kind of COMMAND_KINDS) {
      const state = finish(issueCommand(createStage(stageSize), { id: kind, kind, target: 0.9 }));
      finite(state); assert.equal(stageStatus(state).complete, true);
    }
  }
});
