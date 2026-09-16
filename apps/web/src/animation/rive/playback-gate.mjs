import { MOBILE_ACTIONS } from '../core/contracts.mjs';

/** Pure command gate for the pinned Rive timeline API. Permission to select an
 * action belongs to the caller's safeAction contract; this gate never chooses one.
 * Keeping conditions outside React effect closures prevents replay/visibility races.
 */
export function createPlaybackGate(player, initial) {
  let state;
  let restartPending = true;
  let playing = false;
  let completed = false;
  let disposed = false;
  let issuingStop = false;
  let activeAction;
  function validate(next) {
    if (!MOBILE_ACTIONS.includes(next.action)) throw new RangeError('Unknown native action');
    if (!Number.isSafeInteger(next.replay) || next.replay < 0) throw new RangeError('Invalid replay counter');
    for (const key of ['paused', 'visible', 'hidden', 'reduced']) if (typeof next[key] !== 'boolean') throw new TypeError(`Expected boolean ${key}`);
    return next;
  }
  function sync() {
    if (disposed) return;
    if (state.paused || !state.visible || state.hidden || state.reduced || completed) {
      if (playing) { playing = false; player.pause(); }
      return;
    }
    if (restartPending) {
      // stop() synchronously emits Stop in the pinned runtime. It is our restart,
      // not a natural completion of the just-selected action.
      issuingStop = true;
      try { player.stop(); } finally { issuingStop = false; }
      restartPending = false;
      activeAction = state.action;
      playing = true;
      player.play(state.action);
    } else if (!playing) {
      // play(existing paused name) resumes its instance; stop() would lose phase.
      playing = true;
      player.play(state.action);
    }
  }
  const gate = Object.freeze({
    update(patch) {
      if (disposed) return;
      const next = validate({ ...state, ...patch });
      if (next.action !== state.action || next.replay !== state.replay) { restartPending = true; completed = false; }
      state = next;
      sync();
    },
    stopped(data) {
      if (disposed || issuingStop) return;
      const names = typeof data === 'string' ? [data] : Array.isArray(data) ? data : [];
      if (!names.includes(activeAction)) return;
      playing = false;
      // A newer explicit replay/action queued while hidden remains pending.
      if (!restartPending && activeAction === state.action) completed = true;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (playing) { playing = false; player.pause(); }
    },
  });
  state = validate({ ...initial });
  sync();
  return gate;
}
