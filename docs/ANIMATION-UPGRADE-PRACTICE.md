# Animation upgrade execution record

The user authorized richer moods for every existing character and more ways to move around the screen while website transfer work continues. This v2 copy is isolated from the delivered v1 website. No deployment, email, account configuration or canonical truth change belongs to this upgrade.

## Governing inputs and implementation choices

- The supplied SEO/AIO manual remains the website build authority. Existing semantic HTML, eleven routes, truth projections, consent and direct SMTP contracts remain in force. Animation is progressive enhancement, not a prerequisite for navigation or submitting a request.
- Preserve the original five mobile scene files byte for byte, all original fourteen motion tracks and clip metadata, the desktop illustration and the office props. Extend the mobile action contract to 32 and the desktop state contract to 12. Add constant baseline tracks where new gestures would otherwise leave joints in the previous pose.
- Build the five native files with the official Rive CLI, from original drawing geometry and generated32-action timelines. Compare exact native bytes to matching SVG reference poses through the official Canvas WASM runtime. This verifies native animation independently from browser WebGL acceptance.
- Give each character a recognizably different timing, posture and gesture style. Coordinated eyes, brows, hands, shoulders, head, cable and body movement do the acting. Do not mirror whole characters or their lettering.
- Keep movement inside an explicit stage. Entry/exit and peeking may intentionally cross its clipped edge. Ordinary walking, running, jumps, positioning and dragging use the actor dimensions, resized bounds and finite command sequences. Completed movement stops scheduling; persistent pose animation obeys all pause/visibility gates.
- Keep the Work page's large playground lazy loaded. No pointer listeners or draggable overlay should obstruct the rest of the website. Each drag operation has non-drag buttons and keyboard alternatives.

## Primary practice references reviewed

[WCAG 2.2 dragging movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) requires a single-pointer alternative without dragging; keyboard access alone does not satisfy that criterion. The stage therefore includes simple position/action buttons as well as keyboard operation.

[Animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) informs reduced-motion handling. Expressive static poses stay available while continuous stage travel and automatic performance sequences are disabled.

[Pointer Events capture lifecycle](https://www.w3.org/TR/pointerevents3/#implicit-release-of-pointer-capture) informs release and cancellation handling. Only the character control captures its active pointer; cancellation and cleanup restore a stable state.

Exact installed versions, not floating dependency guesses, govern implementation: Node 24.19.0, official Rive CLI 1.0.2, Canvas runtime 2.42.1, React WebGL adapter 4.34.2 and its paired runtime. No dependency upgrade was required.

## Evidence boundaries

The browser tool's policy blocked local browser access in this environment. No alternate browser, CDP session or tunnel was attempted. Browser tests are authored for the deployment operator and remain unexecuted here. Native WebGL promotion remains empty until that separate gate actually passes.

The offline video is rendered from the actual compiled Rive files and shared deterministic stage engine. It is an animation proof reel, not a website screenshot or browser recording. Local tests, native import and rendered parity do not establish physical-device performance or public production acceptance.

The additive installer compares both source and target hashes and preflights every file before writing. Ongoing Claude edits produce explicit merge conflicts; the installer never silently replaces them. Full updated source and compiled preview are also provided for a fresh checkout.
