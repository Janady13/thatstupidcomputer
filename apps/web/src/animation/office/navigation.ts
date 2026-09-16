/** Semantic destinations share the room's original 1648 × 928 coordinate system. */
import type { CharacterState } from './types';

export interface Destination {
  path: string;
  action: 'services' | 'process' | 'about' | 'work';
  label: string;
  object: string;
  highlight: string;
  icon: 'grid' | 'clock' | 'coffee' | 'folder';
  tip: string;
  shape: string;
  reaction: CharacterState;
}

export const destinations: readonly Destination[] = [
  { path: '/services/', action: 'services', label: 'What we do', object: 'board', highlight: 'bulletin-board', icon: 'grid', tip: 'Good websites. Fewer headaches.', reaction: 'thinking', shape: 'M 622 2 H 1104 V 312 H 954 V 118 H 738 V 312 H 622 Z' },
  { path: '/process/', action: 'process', label: 'The process', object: 'clock', highlight: 'clock', icon: 'clock', tip: 'There is a method to this.', reaction: 'point-right', shape: 'M 1250 35 a 110 110 0 1 0 0.01 0 Z' },
  { path: '/about/', action: 'about', label: 'Meet the human', object: 'coffee', highlight: 'coffee-mug', icon: 'coffee', tip: 'Yes, an actual human.', reaction: 'point-left', shape: 'M 566 344 H 674 V 444 H 566 Z' },
  { path: '/work/', action: 'work', label: 'The work', object: 'drawer', highlight: 'desk-pedestal', icon: 'folder', tip: 'Open the good stuff.', reaction: 'point-right', shape: 'M 1146 512 H 1414 V 776 H 1146 Z' },
];
