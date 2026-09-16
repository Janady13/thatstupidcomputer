import type { ActionName } from '../mobile/types';
import type { CharacterState } from '../office/types';

export interface WorkshopBeat {
  title: string;
  line: string;
  desktop: CharacterState;
  mobile: ActionName;
  seconds: number;
  destination?: string;
}
export const WORKSHOP_STORIES = {
  tour: {
    label: 'Show me around',
    beats: [
      { title: 'Welcome to the workshop', line: 'I am the computer. The human builds the websites. I supervise.', desktop: 'wave', mobile: 'Wave', seconds: 4.4 },
      { title: 'The drawing board', line: 'A new website, a rescue, or help getting found. Start with what you need.', desktop: 'thinking', mobile: 'Think', seconds: 5, destination: '/services/' },
      { title: 'The clock', line: 'First we talk. Then a direction, a working demo, and the details that make it yours.', desktop: 'point-right', mobile: 'PointRight', seconds: 5, destination: '/process/' },
      { title: 'The good drawer', line: 'This site is a working example. The little characters have quite a range.', desktop: 'proud', mobile: 'Proud', seconds: 4.5, destination: '/work/' },
      { title: 'The human behind it', line: 'That is the coffee. The human is much better at answering website questions.', desktop: 'point-left', mobile: 'Laugh', seconds: 4.5, destination: '/about/' },
      { title: 'Your turn', line: 'Tell us what your business needs. We will start with the useful questions.', desktop: 'demo-invite', mobile: 'Wave', seconds: 5.4, destination: '/contact/' },
    ],
  },
  rescue: {
    label: 'Watch a website rescue',
    beats: [
      { title: 'A familiar feeling', line: 'Your website is having a moment. Unfortunately, the moment has lasted six months.', desktop: 'overheating', mobile: 'Frustrated', seconds: 4.5 },
      { title: 'First, find the problem', line: 'A slow page? A confusing menu? A form nobody tested? Start with what is actually broken.', desktop: 'searching', mobile: 'Searching', seconds: 5 },
      { title: 'A little professional judgment', line: 'Ah. The contact button is hiding. That does explain a few things.', desktop: 'facepalm', mobile: 'Facepalm', seconds: 4.8 },
      { title: 'Give it a clear job', line: 'Make the message clear. Make the next step obvious. Check it on a real screen.', desktop: 'thinking', mobile: 'Think', seconds: 5 },
      { title: 'Much better', line: 'That is the idea. Your actual site needs an actual look. Let us start there.', desktop: 'revived', mobile: 'Revived', seconds: 5, destination: '/services/website-rescue/' },
    ],
  },
} as const satisfies Record<string, { label: string; beats: readonly WorkshopBeat[] }>;

export type WorkshopStory = keyof typeof WORKSHOP_STORIES;
