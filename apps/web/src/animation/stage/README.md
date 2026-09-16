# Character stage

`CharacterStage` composes the existing character renderer with a clipped, finite movement area. It changes only the outer actor translation. The renderer retains its authored face, limbs and lettering without horizontal mirroring.

```tsx
import { CharacterStage, type StageCommand } from './animation/stage';

const command: StageCommand = { id: 'run-1', kind: 'runTo', target: 0.8 };
<CharacterStage character="smartphone" action="Proud" command={command}
  paused={false} onStatus={status => console.log(status.phase)} />;
```

Use a new command `id` for each intent. Targets are normalized to the available actor area: `0` is the left or top edge, `1` is the right or floor edge. A number sets horizontal position and defaults to the floor; `{ x, y }` sets both. Missing targets default to floor center. An actor larger than its stage is centered within the clipped dimension.

Commands are `enterLeft`, `enterRight`, `exitLeft`, `exitRight`, `walkTo`, `runTo`, `peekLeft`, `peekRight`, `jump`, `home`, `return`, `roam`, `cancel` and `replay`. Roam is an explicit finite five-leg sequence. Replay repeats the last non-cancel intent. Cancel holds the current position and restores the `action` prop. Jump uses the authored body trajectory, followed by Land; it does not add a second outer jump. Jump, Land and Suspicious holds use the shared performance catalog durations.

`onStatus` reports discrete changes, readiness, pause state and command completion, with normalized position. It is not a frame callback. `ready` requires both measured geometry and loaded character assets. Match `commandId` when advancing a sequence. A drag clears the old ID and sequence. `onCommand` observes internally generated stage-tap or keyboard intents; callers should cancel their own sequence but must not echo the command back. `onError` reports renderer failures; a successful fallback can emit ready again.

The actor button alone owns pointer capture and touch dragging. Space picks up/drops, arrows move a held actor (Shift uses smaller steps), Escape releases. When not held, Left/Right walk, Up jumps, Down/Home returns to center, and End walks right. The stage never focuses itself automatically. Pointer cancellation, lost capture, blur, resize and motion restrictions release a held actor safely.

Pause, reduced motion, document visibility, intersection and asset readiness stop the stage clock. A newly requested movement waits until playback is available. Resuming starts with a fresh timestamp; each elapsed step is capped at 50ms. Idle or hidden stages have no movement RAF. The character renderer independently manages its own pose clock. Frames write transforms to DOM refs; React state changes only at discrete pose, visibility or interaction changes.

Set `--stage-height` and optionally `--stage-actor-width` on the supplied `className`. Stable hooks are `data-testid="character-stage"`, `stage-actor`, and `stage-actor-handle`; actor `data-x`/`data-y` are pixels, while status positions are normalized.

Pure regression coverage is in `tests/animation/stage.test.mjs`. It verifies finite motion, invalid bounds, background deltas, sequence interruption, clip timing, drag limits and resize continuity. These tests and TypeScript compilation do not establish live browser rendering, pointer capture or assistive-technology behavior; those remain browser acceptance gates.
