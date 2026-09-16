/** User-driven conversation. No timers, storage, navigation, or network effects. */
export const INTENTS = Object.freeze({
  design: Object.freeze({ label: 'I need a new website', heading: 'A clean slate. A little ambition.', line: 'Excellent. Tell the human what you do and who you want to reach. They can suggest a website direction that fits your business.', desktop: 'happy', mobile: 'Happy' }),
  rescue: Object.freeze({ label: 'My website needs rescuing', heading: 'Let’s get it working for you.', line: 'The spinning wheel is not a brand strategy. Share your current site and what is getting in the way. That gives the human somewhere useful to start.', desktop: 'facepalm', mobile: 'Facepalm' }),
  search: Object.freeze({ label: 'Help customers find me', heading: 'Less hide. More seek.', line: 'Being the internet’s best-kept secret gets old. Tell us who you want to reach, so the human can look at how people find and understand your business.', desktop: 'thinking', mobile: 'Think' }),
});
export const ROASTS = Object.freeze([
  'A homepage that says “Welcome to our website” is a front door with a sign saying “Door.”',
  'Seven different fonts. Finally, a website that argues with itself.',
  'If finding the contact button requires a treasure map, the treasure is probably your competitors.',
  'An “Under construction” badge from 2016. An ambitious project. A patient public.',
]);
export const DESKTOP_TO_MOBILE = Object.freeze({
  idle: 'Idle', alert: 'Startled', overheating: 'Frustrated', searching: 'Searching', defeated: 'Sad', revived: 'Revived', amused: 'Laugh', skeptical: 'Suspicious', sleepy: 'Sleepy', proud: 'Proud', startled: 'Startled', thinking: 'Think',
  happy: 'Happy', sad: 'Sad', angry: 'Angry', confused: 'Confused', sassy: 'Sassy', 'eye-roll': 'EyeRoll', facepalm: 'Facepalm', shrug: 'Shrug', wave: 'Wave', 'point-left': 'PointLeft', 'point-right': 'PointRight', beckon: 'Wave', 'thumbs-up': 'Proud', bow: 'Bow', shush: 'Shy', raspberry: 'Sassy', 'rude-flip-off': 'RudeFlipOff', 'double-flip-off': 'RudeFlipOff', 'demo-invite': 'PointRight', 'demo-success': 'Revived',
});
const rude = new Set(['rude-flip-off', 'double-flip-off']);
export function createConversation() {
  return { view: 'closed', intent: null, roastIndex: -1, attitude: false, desktop: 'idle', mobile: 'Idle', announcement: '' };
}
function pose(state, desktop) {
  const safe = rude.has(desktop) && !state.attitude ? 'eye-roll' : desktop;
  return { ...state, desktop: safe, mobile: DESKTOP_TO_MOBILE[safe] };
}
export function transitionConversation(state, event) {
  switch (event.type) {
    case 'OPEN': return pose({ ...state, view: 'choose', attitude: false, announcement: 'What would make your website more useful?' }, 'wave');
    case 'CLOSE': return { ...createConversation(), roastIndex: state.roastIndex };
    case 'BACK': return pose({ ...state, view: 'choose', intent: null, attitude: false, announcement: 'What would you like your website to do?' }, 'idle');
    case 'INTENT': {
      if (!Object.hasOwn(INTENTS, event.intent)) return state;
      const choice = INTENTS[event.intent];
      return pose({ ...state, view: 'recommendation', intent: event.intent, attitude: false, announcement: choice.line }, choice.desktop);
    }
    case 'ROAST': {
      const roastIndex = (state.roastIndex + 1) % ROASTS.length;
      return pose({ ...state, view: 'roast', intent: state.intent || 'rescue', attitude: false, roastIndex, announcement: ROASTS[roastIndex] }, ['sassy', 'eye-roll', 'shrug', 'raspberry'][roastIndex]);
    }
    case 'GESTURE': return pose({ ...state, attitude: true, announcement: 'One censored gesture. All right. Let’s give it a better website.' }, event.double ? 'double-flip-off' : 'rude-flip-off');
    case 'POLITE': return pose({ ...state, attitude: false, announcement: 'Hands down. Back to the website.' }, 'eye-roll');
    case 'MOOD': {
      if (!Object.hasOwn(DESKTOP_TO_MOBILE, event.desktop)) return state;
      return pose(state, event.desktop);
    }
    default: return state;
  }
}
