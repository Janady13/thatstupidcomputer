# Native animation upgrade

This work is isolated in `tsc-animations-v2`. The original delivered project and ZIP are not modified. The original `native/rml/` files retain the supplied geometry, named IDs and fourteen timelines. Original candidate bytes remain historical source artifacts. Prior compiled files, Canvas measurements and visual review were copied once into `native/history/v1/`, with an explicit historical marker; they do not validate the expanded version.

## Reproducible timeline pipeline

The five authoritative motion files are `apps/web/public/animation/mobile/{slug}/motion.json`. Each contains the 32-action contract: the original fourteen performances and eighteen new performances. Native timing, values, interpolation, loops and reset tracks derive from those files. The adapter does not independently author motion.

`scripts/prepare-native-rml.mjs` reads the untouched supplied RML and produces `native/build-source/{slug}/scene.rml`. It reverses drawing siblings once to reconcile SVG's back-to-front order with the official RML front-to-back order. It then calls `synchronizeTimelines` from `scripts/sync-native-timelines.mjs`, which replaces only the `LinearAnimation` elements. Geometry, original node IDs, hierarchy, artboard and non-animation elements survive.

`synchronizeTimelines` uses the existing official CLI format: `LinearAnimation`, `KeyedObject`, `KeyedProperty`, and `KeyFrameDouble`. The official CLI's `rive schema Node` identifies `x=13`, `y=14`, `rotation=15`, `scaleX=16`, `scaleY=17`, and `opacity=18` as double properties. Motion rotation stays in radians; keyframe timing stays in frames at 60 fps. Target IDs are read from the actual named RML elements, not guessed numeric offsets. Unknown or ambiguous targets, unsupported properties, duplicate channels, malformed timing, missing endpoints and nonfinite values fail before compilation.

The standalone sync script updates timelines in existing generated build sources without reversing drawing order again. Repeated synchronization is deterministic. `native/reports/timeline-sync.json` records original RML, authoritative motion and generated RML SHA-256 hashes, plus exact animation/track/keyframe counts.

## Official compiler

The native binary format is written only by the official Rive CLI. No hand-written `.riv` serializer, Python, editor automation or cloud publishing is used. The verified tool in this environment is CLI 1.0.2 at `/tmp/tsc-rive-cli/rive`, using the locally extracted dependency directory `/tmp/tsc-rive-cli/usr/lib/x86_64-linux-gnu`. `native/reports/cli-provenance.json` preserves the official release URL and archive SHA-256. Those temporary paths are environment facts, not portable installation assumptions.

```bash
RIVE_CLI=/tmp/tsc-rive-cli/rive LD_LIBRARY_PATH=/tmp/tsc-rive-cli/usr/lib/x86_64-linux-gnu node scripts/compile-native.mjs
```

On another host, supply `RIVE_CLI` for its installed official CLI and its actual runtime dependencies. The compiler script also supports `.tools/rive/rive` or an installed `rive` on PATH. There is no automatic installation, authentication or publishing step.

The command prepares the source, runs official `--verify`, `--once` and `inspect --json` for each character, checks the output signature, and copies all five outputs only after all projects pass. `native/reports/native-compiled.json` records the exact native bytes and source hashes. Per-character CLI logs and inspection output remain in `native/reports`. Compilation invalidates previous current Canvas and visual-review approvals even when the generated source has not changed.

## DOM-free exact-byte verification

```bash
node scripts/verify-native.mjs
node scripts/native-contact-sheets.mjs
```

The verifier loads the compiled bytes into the official `@rive-app/canvas` 2.42.1 WASM runtime. WASM is supplied from the locally installed package, with network fallback disabled. `@napi-rs/canvas` supplies local Canvas2D primitives. No browser session, HTTP server, CDP connection or WebGL context is created.

For each of the five characters and all 32 actions, it compares six exact-time native/source renders: normalized phases 0, 0.125, 0.30, 0.75 and 0.98, plus the authored `peakSeconds` in the performance catalog. This is 160 action checks and 960 pixel-comparison samples when the complete expanded contract is present. The source reference uses the same deterministic motion sampler and supplied vector geometry. Alpha-weighted color difference, geometry difference and nonempty output are checked with the pre-existing scoped tolerances; the report records each result rather than a claim of perfect pixel identity.

The verifier first rejects a stale compiled/motion/generated-RML combination. On a passing full run, it copies the tested native bytes to `apps/web/public/animation/rive/` and records them in `native/canvas-verified-assets.json`, explicitly marked `browserWebGLVerified:false`. Captures at each authored peak support readable contact-sheet review. `native/reports/contact-sheets.json` ties overview/detail PNGs to the exact native proof report and records their hashes. Visual review is a separate, explicit record in `native/canvas-visual-review.json` after actual inspection.

This comparison checks whether the native artifact renders the intended source motion in that exact Canvas environment. It does not independently prove artistic quality, all intermediate frames, state-machine behavior, viewport layout, real browser rendering, device performance or accessibility of the full website.

## Browser boundary

`native/reports/browser-boundary.json` remains **BLOCKED**. The earlier browser URL-policy rejection explicitly prohibits alternate browsers, indirect routes, raw CDP, browser commands and navigation workarounds for the same blocked workflow. The material safer alternative used here is local-byte official Canvas rendering without browser control or networking.

`scripts/native-harness-server.mjs` checks this boundary before starting any server. `scripts/promote-native.mjs` rejects promotion while the boundary is blocked. The separate WebGL test is skipped at declaration time under this boundary. None of these browser paths is executed as part of this upgrade. The React WebGL activation registry at `apps/web/src/animation/rive/verified-assets.json` must remain `{}`. Passing Canvas checks cannot be relabeled as WebGL approval or used to bypass that gate.

## Local animation-proof frames

`scripts/verify-native.mjs` exports `createNativeProofSession` without running the verification script as an import side effect. A local encoder can use the same official renderer for an actual animated proof:

```js
import { readFileSync } from 'node:fs';
import { createNativeProofSession } from './scripts/verify-native.mjs';
const session = await createNativeProofSession({ width: 360, height: 460 });
const actor = await session.loadCharacter(readFileSync(nativePath), artboardName);
try {
  for (const seconds of requestedFrameTimes) {
    actor.draw(authoritativeClip, seconds);
    const png = session.canvas.toBuffer('image/png');
    // Send png to the selected local encoder or save an explicitly numbered frame.
  }
} finally {
  actor.close();
  session.close();
}
```

A video produced this way is an actual native Canvas render, not a browser capture. Its label and accompanying evidence must keep that scope clear.

## Verification record

The pipeline contract tests are `tests/animation/native-pipeline.test.mjs`. They check exact source-to-RML translation, original geometry/state-machine preservation, idempotence, invalid-input rejection, all real rig target mappings and the empty WebGL activation registry. Final compiler, pixel-comparison and actual visual-review results are recorded in the current `native/reports/` and `native/canvas-visual-review.json`; historical v1 reports remain distinctly labeled under `native/history/v1/`.

The completed 2026-09-13 run passed all five official native builds, all 160 action checks and all 960 comparison samples. Each public binary contains the 32 named timelines and matches its tested SHA-256. The largest measured mean color difference was 0.001606983 (about 0.161%); the largest geometry difference was 0.0000216591 (about 0.00217%). These are measured differences, not exact pixel identity. All five preserved original RML files were also compared byte-for-byte with the original project and matched.

Actual AI-assisted visual review inspected all five overview sheets (160 native/source peak pairs), plus detail pages 03 and 04 for every character. A separate animation-authoring agent inspected all five overviews and selected enlarged mood/movement sheets. The native/source pairs agree in silhouette, lettering, facial expression, hand variants and attached limbs; the larger Jump remains visibly airborne without clipping in those captures. The flip-phone Facepalm rests at the original hinge/lower screen edge, consistent with its preserved shoulder position. No further motion changes were requested. `native/canvas-visual-review.json` records the exact inspected image hashes and its limited scope; this is not a human approval or browser/device validation.

The four native-pipeline tests passed. A separate 36-test animation acceptance suite passed with zero skips against the settled native/source hashes. Browser and WebGL verification remain blocked, with the React activation registry empty.
