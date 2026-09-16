# Animation system

The working site uses the complete supplied SVG animation system. It contains five 720 × 920 mobile rigs, 32 actions per rig, the original desktop computer with 32 performances, and all forty independently composed office props in the original 1648 × 928 room coordinate system. SVG geometry, outlined character lettering and pivots remain supplied source assets. All original fourteen clips retain their original metadata and existing track values. New constant baseline channels prevent new gestures from leaking into legacy poses. The 90 new timelines use character-specific acting. See `ANIMATION-UPGRADES.md` and `NATIVE-UPGRADE.md`.

Desktop v3 preserves the original twelve numeric pose contracts and drawing paths. Twenty finite performances add moods, hands, directional gestures and demo responses. Metadata and the DOM-free pose sampler are in `desktop/performances.mjs` and `desktop/computer-motion.mjs`; shared gesture geometry is rendered by both React and the offline proof. Explicit boolean attitude permission gates both rude performances, with permanent opaque censorship. See `DESKTOP-VISUAL-PROOF.md` and `DESKTOP-ACCEPTANCE.md`.

The native v2 mobile files are unchanged in v3. They were rebuilt with the official CLI from original drawing geometry and the authoritative expanded motion JSON. Current byte-bound compilation, Canvas proof and sample metrics are in `native/reports/native-compiled.json` and `native/reports/native-canvas.json`. Historical v1 reports are under `native/history/v1`; they do not establish a current pass.

## Native evidence and the browser boundary

| Check | Current evidence |
| --- | --- |
| Desktop 32-state and mobile 32-action contracts, preservation, controller and stage behavior | `tests/animation/`, `docs/DESKTOP-ACCEPTANCE.md` |
| Original desktop SVG/controller poses and offline reel | `docs/desktop-preview/desktop-proof.json`, `docs/DESKTOP-VISUAL-PROOF.md` |
| Compiler/re-import of five native files | `native/reports/native-compiled.json` |
| Matching-time native/SVG Canvas proof, 160 actions and 960 samples | `native/reports/native-canvas.json` |
| Asset structure and shipped native hashes | `native/reports/asset-audit.json` |
| Actual browser WebGL2 and physical devices | Not executed here; browser policy blocked local access |


Canvas verification uses `@napi-rs/canvas` for the drawing surface and SVG reference rasterization. It starts no browser and makes no network requests. Rive reports that WebGL image meshes are unavailable; these rigs contain vector paths only, and the audit forbids image nodes, so that warning does not omit any authored art. This is actual official-runtime rendering of the native files, not a file-header or serializer-only check.

The earlier local CLI GPU screenshot attempt produced an empty background for both the character and an isolated official rectangle fixture. It therefore supplied no useful visual evidence. Canvas WASM supplied the successful proof instead.

`native/canvas-verified-assets.json` records the completed native proof. The browser's `apps/web/src/animation/rive/verified-assets.json` intentionally stays empty until actual WebGL evidence exists. The functional SVG renderer remains active. Native files are ready at `apps/web/public/animation/rive/*.riv` and `native/compiled/*.riv`; no native pass is fabricated from the presence of a `.riv` extension.

## Reproduce the native build

Use Node 24 and the project's locked npm dependencies. This workflow does not use Python.

```sh
npm ci
node scripts/install-native-cli.mjs
node scripts/compile-native.mjs
node scripts/verify-native.mjs
node scripts/native-contact-sheets.mjs
npm run test:assets
node --test tests/animation/contracts.test.mjs
```

The installer downloads the pinned official vendor release, checks its published SHA-256, and installs it locally under `.tools/rive`. Linux requires the vendor's shared-library dependencies, including `libGLESv2.so.2`. It never modifies system packages. An existing official CLI can be selected with `RIVE_CLI=/absolute/path/to/rive`. The delivered build used the vendor's published Linux archive with SHA-256 `9c8adbabf7ae6457bc01ea7d75a1f145ba51a99b67a69d9ac2bdcc6cf5363710`.

The supplied RML contains a real translation error: its sibling order follows SVG's last-on-top convention, while Rive draws first siblings on top. `prepare-native-rml.mjs` reverses only drawing siblings into `native/build-source`, preserving the original `native/rml` files. The official compiler then builds those repaired sources. Geometry, colors, base transforms and character IDs are preserved. The generated build-source replaces animation blocks with all 32 validated source clips; original RML stays unchanged. Verification caught this error as faces and note lettering disappearing behind device panels before repair.

The official inspector emits two documented warnings: no default state machine, because the host selects named timelines explicitly; and no layout style, because these are fixed-size, absolutely positioned vector rigs. Canvas proof demonstrates that the fixed geometry imports and renders correctly. No invented state machine or data-binding API is used.

Reference: [official Rive CLI](https://rive.app/docs/cli/overview), [local build and sign-in requirements](https://rive.app/docs/cli/getting-started), [RML format](https://rive.app/docs/runtimes/advanced-topic/rml). The CLI's bundled `docs/transforms.md` documents first-sibling draw order.

## Complete the WebGL promotion gate

On a machine with a permitted local browser:

```sh
node scripts/sync-rive-wasm.mjs
node scripts/native-harness-server.mjs
```

Open the displayed local URL and press **Run all native checks**. The harness executes the actual installed WebGL2 runtime, checks every native timeline, produces paired screenshots at the harness sample times, and saves byte-bound results in `native/reports/native-runtime.json`. Alternatively set `NATIVE_TEST_URL=http://127.0.0.1:4175` and run `npx playwright test tests/animation/native-runtime.spec.ts` with a configuration that includes that test directory.

Inspect the pair gallery and copy `native/visual-review.example.json` to `native/visual-review.json`, recording the exact file hashes and actual reviewer/date. Then run:

```sh
node scripts/promote-native.mjs
npm run test:assets
```

Promotion refuses missing/failed Canvas evidence, missing/failed real WebGL evidence, stale hashes, mismatched runtime versions, incomplete timelines, or absent visual review. It is never run automatically by a normal build.

## Runtime behavior

- `AnimationProvider` owns the XState actor; cleanup stops the actor and removes its subscription. Site cues, user action selection, scene selection, replay, explicit attitude permission and user pause share one contract.
- User pause persists through cues and action selection. Reduced motion, page visibility and intersection observers independently stop continuous animation. Removing any one restriction cannot override another.
- The new Work-page playground uses `CharacterStage`: finite movement commands, isolated pointer capture, single-click and keyboard alternatives, cancellation, resize handling and no continuous stage scheduler once a command completes. `Workshop` offers an accessible computer conversation, 32 selectable moods, explicit attitude controls and normal demo links. The original character also appears alongside the real inquiry form.
- `Character` uses SVG whenever there is no verified native entry, motion is reduced, travelling is requested, playback rate differs from one, frame callbacks are needed, or native loading fails. Posters reserve the layout while vector/runtime chunks load.
- Walking follows the source gait and uses bounded travel with direction changes. It remains inside the stage when the character is wider than its container or the container is resized.
- Mobile `RudeFlipOff` and desktop `rude-flip-off`/`double-flip-off` require explicit boolean attitude permission; otherwise they resolve to their eye-roll fallback. Censorship remains opaque. Revoking permission immediately clears both mobile and desktop rude states.
- Room props retain parent-local coordinates and shared palette roles. One room clock advances the desktop computer; React owns composition while the controllers own animation attributes.
- Lazy imports and fetches handle cancellation. Controllers disconnect observers/listeners, cancel frame callbacks and restore owned SVG attributes on cleanup. `useRive` owns native cleanup; it is not called twice by the wrapper.
- `sync-rive-wasm.mjs` resolves the WebGL2 runtime underneath the installed React wrapper and copies that exact JS/WASM version locally. CDN fallback and runtime asset CDN loading are disabled.

Essential site text, navigation, forms and keyboard controls remain semantic HTML outside decorative animation SVG/canvas. The website can operate with the SVG or poster fallback independently of native promotion.
