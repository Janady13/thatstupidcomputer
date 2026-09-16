import type { ActionName } from '../mobile/types';
import type { StageCommand } from '../stage/engine.mjs';

export interface ShowStep { action: ActionName; caption: string; command?: StageCommand['kind']; target?: number }
export const STAGE_SHOWS = {
  introduction: {
    label: 'A proper introduction',
    steps: [
      { action: 'Wave', command: 'enterLeft', caption: 'First, a proper entrance.' },
      { action: 'Suspicious', caption: 'Something seems suspicious.' },
      { action: 'Laugh', caption: 'Never mind. It was a very good joke.' },
      { action: 'RunRight', command: 'runTo', target: .78, caption: 'Places to be. Absolutely no appointments.' },
      { action: 'Proud', caption: 'Quietly pleased with that.' },
      { action: 'Jump', command: 'jump', caption: 'And a little jump for good measure.' },
      { action: 'Bow', caption: 'Thank you. You have been a lovely audience.' },
      { action: 'Idle', command: 'home', caption: 'Back to their mark.' },
    ],
  },
  rescue: {
    label: 'The website rescue',
    steps: [
      { action: 'Idle', command: 'home', caption: 'Back to the workshop. There is a website to rescue.' },
      { action: 'Sad', caption: 'It used to work. Probably.' },
      { action: 'Frustrated', caption: 'Another spinning wheel. A little patience leaves the room.' },
      { action: 'Searching', caption: 'Time to find the actual problem.' },
      { action: 'Think', caption: 'A moment of thought. An unexpectedly useful idea.' },
      { action: 'RunLeft', command: 'runTo', target: .22, caption: 'Right. Let’s get to work.' },
      { action: 'Revived', caption: 'Back on their feet. Looking a little more like themselves.' },
      { action: 'Jump', command: 'jump', caption: 'A small celebration is allowed.' },
      { action: 'Idle', command: 'home', caption: 'Back to their mark.' },
      { action: 'Proud', caption: 'Ready for the next thing.' },
    ],
  },
  deadline: {
    label: 'Five minutes to launch',
    steps: [
      { action: 'Idle', command: 'home', caption: 'Places, everyone. We have a launch to prepare.' },
      { action: 'Sleepy', caption: 'Everything is perfectly under control.' },
      { action: 'WakeUp', caption: 'Except the deadline. The deadline is now.' },
      { action: 'RunRight', command: 'runTo', target: .82, caption: 'Check the page.' },
      { action: 'RunLeft', command: 'runTo', target: .18, caption: 'Check the form.' },
      { action: 'Facepalm', caption: 'Remember to check it on a phone.' },
      { action: 'Think', caption: 'One last look. Then one more.' },
      { action: 'Excited', caption: 'All right. Now we can celebrate.' },
      { action: 'Idle', command: 'home', caption: 'Back to the mark. One last thing.' },
      { action: 'Bow', caption: 'Made it. Nobody needs to know about the nap.' },
    ],
  },
} as const satisfies Record<string, { label: string; steps: readonly ShowStep[] }>;
export type StageShow = keyof typeof STAGE_SHOWS;
