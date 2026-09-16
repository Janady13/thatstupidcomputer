/** Rendering-independent rules shared by React, the offline lab and tests. */
export const CHARACTER_IDS = Object.freeze(['smartphone', 'flip-phone', 'app-bot', 'pager', 'handheld']);
export const MOBILE_ACTIONS = Object.freeze(['Idle', 'Happy', 'Excited', 'Sad', 'Angry', 'Confused', 'Searching', 'Sassy', 'EyeRoll', 'RudeFlipOff', 'Wave', 'Revived', 'WalkRight', 'WalkLeft', 'Laugh', 'Proud', 'Shy', 'Suspicious', 'Startled', 'Frustrated', 'Sleepy', 'WakeUp', 'Think', 'Facepalm', 'Shrug', 'PointLeft', 'PointRight', 'Bow', 'Jump', 'Land', 'RunRight', 'RunLeft']);
export const DESKTOP_STATES = Object.freeze(["idle","alert","overheating","searching","defeated","revived","amused","skeptical","sleepy","proud","startled","thinking","happy","sad","angry","confused","sassy","eye-roll","facepalm","shrug","wave","point-left","point-right","beckon","thumbs-up","bow","shush","raspberry","rude-flip-off","double-flip-off","demo-invite","demo-success"]);
export const CUES = Object.freeze({
  'visitor.arrived': { mobile: 'Wave', desktop: 'wave' },
  'service.focused': { mobile: 'Searching', desktop: 'searching' },
  'project.started': { mobile: 'Excited', desktop: 'demo-invite' },
  'inquiry.pending': { mobile: 'Searching', desktop: 'searching' },
  'inquiry.accepted': { mobile: 'Revived', desktop: 'demo-success' },
  'inquiry.failed': { mobile: 'Confused', desktop: 'confused' },
  'attitude.requested': { mobile: 'RudeFlipOff', desktop: 'rude-flip-off' },
  'scene.rest': { mobile: 'Idle', desktop: 'idle' },
});
export const INITIAL_STATE = Object.freeze({ character: 'smartphone', action: 'Idle', desktop: 'idle', paused: false, attitude: false, replay: 0, scene: 'auto' });
export function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : lo)); }
export function selectScene(preference, width) {
  if (!['auto', 'mobile', 'desktop', 'office'].includes(preference)) throw new RangeError('Unknown scene');
  return preference === 'auto' ? (width < 768 ? 'mobile' : 'office') : preference;
}
export function safeAction(action, attitude) {
  if (!MOBILE_ACTIONS.includes(action)) throw new RangeError(`Unknown action: ${action}`);
  return action === 'RudeFlipOff' && attitude !== true ? 'EyeRoll' : action;
}
export function safeDesktopState(state, attitude = false) {
  if (!DESKTOP_STATES.includes(state)) throw new RangeError(`Unknown desktop state: ${state}`);
  return attitude !== true && ['rude-flip-off','double-flip-off'].includes(state) ? 'eye-roll' : state;
}
export function transition(state, event) {
  switch (event.type) {
    case 'SELECT':
      if (!CHARACTER_IDS.includes(event.character)) throw new RangeError('Unknown character');
      return { ...state, character: event.character };
    case 'PERFORM': return { ...state, action: safeAction(event.action, state.attitude), replay: state.replay + 1 };
    case 'DESKTOP':
      if (!DESKTOP_STATES.includes(event.state)) throw new RangeError('Unknown desktop state');
      return { ...state, desktop: safeDesktopState(event.state, state.attitude), replay: state.replay + 1 };
    case 'PAUSE': return { ...state, paused: true };
    case 'PLAY': return { ...state, paused: false };
    case 'REPLAY': return { ...state, replay: state.replay + 1 };
    case 'ATTITUDE': return { ...state, attitude: event.enabled === true, action: event.enabled !== true && state.action === 'RudeFlipOff' ? 'Idle' : state.action, desktop: event.enabled !== true && ['rude-flip-off','double-flip-off'].includes(state.desktop) ? 'idle' : state.desktop };
    case 'SCENE':
      selectScene(event.scene, 1000);
      return { ...state, scene: event.scene };
    case 'CUE': {
      const cue = CUES[event.cue];
      if (!cue) throw new RangeError(`Unknown site cue: ${event.cue}`);
      return { ...state, action: safeAction(cue.mobile, state.attitude), desktop: safeDesktopState(cue.desktop, state.attitude), replay: state.replay + 1 };
    }
    default: throw new RangeError(`Unknown animation event: ${event.type}`);
  }
}
/** Exact reflection at each edge; no negative bounds or scaling the lettering backwards. */
export function advanceTravel(x, direction, dt, pixelsPerSecond, maxX) {
  if (!Number.isFinite(dt) || dt < 0 || !Number.isFinite(pixelsPerSecond) || pixelsPerSecond < 0) throw new RangeError('Travel values must be finite and nonnegative');
  const limit = Math.max(0, Number.isFinite(maxX) ? maxX : 0);
  if (limit === 0) return { x: 0, direction: direction < 0 ? -1 : 1 };
  const start = clamp(x, 0, limit);
  const unfolded = (direction < 0 ? 2 * limit - start : start) + dt * pixelsPerSecond;
  const phase = unfolded % (2 * limit);
  return { x: phase <= limit ? phase : 2 * limit - phase, direction: phase < limit ? 1 : -1 };
}
export function assetURL(base, relative) {
  if (!relative || relative.includes('..') || relative.startsWith('/') || /^[a-z]+:/i.test(relative)) throw new Error('Asset paths must be relative and cannot traverse directories');
  return `${base.replace(/\/$/, '')}/${relative}`;
}
export function validateCharacter(model, clips) {
  if (!model || !CHARACTER_IDS.includes(model.slug) || model.width !== 720 || model.height !== 920 || !Array.isArray(clips)) throw new Error('Invalid character asset');
  const nodes = new Set(); let count = 0;
  function scan(n) {
    if (!n || !['group', 'path'].includes(n.type) || typeof n.id !== 'string' || !/^[a-z0-9-]+$/.test(n.id) || nodes.has(n.id)) throw new Error('Invalid or duplicate rig node');
    if (++count > 4000) throw new Error('Rig exceeds node budget');
    nodes.add(n.id);
    for (const key of ['x', 'y', 'rotation', 'scaleX', 'scaleY', 'opacity']) if (n[key] !== undefined && !Number.isFinite(n[key])) throw new Error('Non-finite geometry');
    if (n.type === 'path') {
      if (typeof n.d !== 'string' || n.d.length > 100000) throw new Error('Invalid vector path');
      for (const paint of [n.fill, n.stroke]) if (paint !== 'none' && !/^#[0-9a-f]{6}$/i.test(paint)) throw new Error('Only local solid vector colors are allowed');
    }
    for (const child of n.children || []) scan(child);
  }
  scan(model.root);
  if (clips.length !== MOBILE_ACTIONS.length || new Set(clips.map(c => c.name)).size !== MOBILE_ACTIONS.length) throw new Error(`The complete ${MOBILE_ACTIONS.length}-action contract is required`);
  for (const clip of clips) {
    if (!MOBILE_ACTIONS.includes(clip.name) || clip.fps !== 60 || !Number.isFinite(clip.duration) || clip.duration <= 0 || clip.duration > 3600 || !Number.isFinite(clip.seconds) || typeof clip.loop !== 'boolean' || !Number.isFinite(clip.travelPerCycle) || clip.travelPerCycle < 0 || Math.abs(clip.seconds - clip.duration / clip.fps) > .0001) throw new Error('Invalid clip timing');
    if (!Array.isArray(clip.tracks) || clip.tracks.length > 1500) throw new Error('Invalid track budget');
    const targets = new Set();
    for (const track of clip.tracks) {
      if (!nodes.has(track.target) || !['x','y','rotation','scaleX','scaleY','opacity'].includes(track.property) || !['linear','hold'].includes(track.interpolation)) throw new Error('Invalid track target or property');
      const key = track.target + ':' + track.property;
      if (targets.has(key)) throw new Error('Duplicate track'); targets.add(key);
      if (!Array.isArray(track.keys) || track.keys.length < 2 || track.keys.length > 3601) throw new Error('Invalid keyframes');
      let previous = -1;
      for (const [frame, value] of track.keys) {
        if (!Number.isFinite(frame) || !Number.isFinite(value) || frame <= previous || frame < 0 || frame > clip.duration) throw new Error('Invalid or unordered keyframe');
        previous = frame;
      }
      if (track.keys[0][0] !== 0 || track.keys.at(-1)[0] !== clip.duration) throw new Error('Tracks must define both endpoints');
    }
  }
  return { model, clips };
}
export async function loadCharacter(base, slug, signal) {
  if (!CHARACTER_IDS.includes(slug)) throw new RangeError('Unknown character');
  const read = async name => {
    const response = await fetch(assetURL(base, `mobile/${slug}/${name}.json`), { signal, credentials: 'same-origin' });
    if (!response.ok) throw new Error(`Character ${name} request failed (${response.status})`);
    const text = await response.text();
    if (text.length > 2_000_000) throw new Error('Character asset exceeds transfer budget');
    return JSON.parse(text);
  };
  const [model, clips] = await Promise.all([read('scene'), read('motion')]);
  return validateCharacter(model, clips);
}
