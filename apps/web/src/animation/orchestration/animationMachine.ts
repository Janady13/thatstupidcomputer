import { setup, assign } from 'xstate';
import { INITIAL_STATE, transition, type AnimationEvent, type AnimationState } from '../core/contracts.mjs';
/** Host state only. Native Rive timelines do not pretend to expose fabricated VM inputs. */
export const animationMachine = setup({
  types: { context: {} as AnimationState, events: {} as AnimationEvent },
  actions: { apply: assign(({ context, event }) => transition(context, event)) },
}).createMachine({
  id: 'tsc-animation', context: { ...INITIAL_STATE },
  on: {
    SELECT: { actions: 'apply' }, PERFORM: { actions: 'apply' }, DESKTOP: { actions: 'apply' },
    PAUSE: { actions: 'apply' }, PLAY: { actions: 'apply' }, REPLAY: { actions: 'apply' },
    ATTITUDE: { actions: 'apply' }, SCENE: { actions: 'apply' }, CUE: { actions: 'apply' },
  },
});
