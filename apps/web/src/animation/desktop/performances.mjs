/** Original CRT performance contract. Pure metadata; no runtime or asset loading. */
export const DESKTOP_PERFORMANCE_VERSION = '3.0.0';
const entries = [
  ['idle','Idle',6.4,true,2.6,false,'mood','A patient sigh, wandering eyes and a fan that needs encouragement.'],
  ['alert','Alert',6.4,true,1.3,false,'reaction','Eyes open first; the heavy monitor leans in to listen.'],
  ['overheating','Overheating',6.4,true,2.4,false,'reaction','A sputtering fan, hot screen and frazzled cable under pressure.'],
  ['searching','Searching',6.4,true,2.9,false,'mood','The original magnifying glass follows a deliberate search.'],
  ['defeated','Defeated',6.4,true,2,false,'reaction','Screen gone quiet, shoulders sunk and the fan on the floor.'],
  ['revived','Revived',6.4,true,2.2,false,'reaction','Clean case, bright eyes, gathered cable and a reassuring nod.'],
  ['amused','Amused',6.4,true,1.3,false,'mood','Three dry chuckles travel from the screen into the heavy case.'],
  ['skeptical','Skeptical',6.4,true,2.3,false,'mood','One lid lowers, one brow rises, and a long side-eye does the talking.'],
  ['sleepy','Sleepy',6.4,true,3.6,false,'mood','The monitor nods off while the fan slows to a tired breath.'],
  ['proud','Proud',6.4,true,1.4,false,'mood','A lifted chin and modest nod from a machine pleased with itself.'],
  ['startled','Startled',6.4,true,0.08,false,'reaction','A sharp recoil followed by a damped note and cable rattle.'],
  ['thinking','Thinking',6.4,true,1.6,false,'mood','An upward glance, asymmetric brows and a small idea nod.'],
  ['happy','Happy',4.4,false,1.65,false,'mood','An unhurried smile, lifted palms and a small contented shoulder bounce.'],
  ['sad','Sad',4.8,false,2.05,false,'mood','Hands fall open as the monitor droops into a long, quiet sigh.'],
  ['angry','Angry',4.4,false,1.85,false,'mood','A warning squint, clenched fists and one restrained desk-side stamp.'],
  ['confused','Confused',4.8,false,2.1,false,'mood','Look left, look right, then two open palms ask the obvious question.'],
  ['sassy','Sassy',4.4,false,2.0,false,'mood','A knowing side-eye and a palm-out dismissal, followed by a patient hold.'],
  ['eye-roll','Eye roll',3.8,false,1.85,false,'reaction','A deliberate look away, slow upward eye roll and exhausted release.'],
  ['facepalm','Facepalm',4.8,false,2.15,false,'reaction','The hand arrives first; the monitor meets it, holds, then slowly recovers.'],
  ['shrug','Shrug',4.2,false,1.8,false,'gesture','Both palms turn up as the shoulders rise: your guess is as good as mine.'],
  ['wave','Wave',4.4,false,1.7,false,'gesture','A little recognition, three clear wrist waves and a relaxed goodbye.'],
  ['point-left','Point left',4.2,false,1.75,false,'gesture','The eyes find the target before a decisive leftward point.'],
  ['point-right','Point right',4.2,false,1.75,false,'gesture','The eyes lead a clear rightward point and a confirming nod.'],
  ['beckon','Come closer',4.8,false,2.15,false,'gesture','Lean in, open the hand, then give two friendly come-here curls.'],
  ['thumbs-up','Thumbs up',4.2,false,1.85,false,'gesture','A confident nod and one unmistakable thumbs-up.'],
  ['bow','Take a bow',5.0,false,2.05,false,'gesture','Gather the hands, bow the rigid monitor and case, hold, then rise.'],
  ['shush','Shush',4.6,false,1.9,false,'gesture','An attentive glance and one finger held gently in front of the screen.'],
  ['raspberry','Raspberry',3.8,false,1.65,false,'reaction','A cheeky squint and short tongue-out raspberry, then innocent composure.'],
  ['rude-flip-off','Censored flip-off',4.8,false,2.25,true,'gesture','A disbelieving pause, one censored finger, a deadpan hold and a full retraction.'],
  ['double-flip-off','Double censored flip-off',5.4,false,2.55,true,'gesture','One hand rises, then the other joins: two censored fingers and a deeply unimpressed look.'],
  ['demo-invite','Invite to the demo',5.4,false,2.65,false,'demo','Make eye contact, beckon twice, then present the demo with an open palm.'],
  ['demo-success','Demo success',5.2,false,2.25,false,'demo','A relieved exhale becomes a proud nod, thumbs-up and welcoming open hand.'],
];
export const DESKTOP_PERFORMANCES = Object.freeze(entries.map(([id,label,seconds,loop,peakSeconds,requiresAttitude,group,description]) => Object.freeze({ id,label,seconds,loop,peakSeconds,requiresAttitude,group,description })));
export const DESKTOP_STATE_IDS = Object.freeze(DESKTOP_PERFORMANCES.map(entry => entry.id));
export const DESKTOP_LEGACY_STATES = Object.freeze(DESKTOP_STATE_IDS.slice(0,12));
export const DESKTOP_PERFORMANCE_BY_ID = Object.freeze(Object.fromEntries(DESKTOP_PERFORMANCES.map(entry => [entry.id,entry])));
/** The gate protects direct runtime calls as well as UI selections. */
export function safeDesktopState(state, attitudeEnabled = false) {
  if (!Object.hasOwn(DESKTOP_PERFORMANCE_BY_ID,state)) throw new RangeError('Unknown character state: ' + state);
  const performance = DESKTOP_PERFORMANCE_BY_ID[state];
  return performance.requiresAttitude && attitudeEnabled !== true ? 'eye-roll' : state;
}
