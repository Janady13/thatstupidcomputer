# Original desktop character: offline visual proof

The proof uses the original CRT illustration in `ComputerGeometry.tsx`, including its case, monitor, lettering, fan, note and long procedural cable. The added face and hand geometry comes from the same imported components and geometry definitions as the website. There is no replacement mascot, hand-drawn approximation of the controller output, conversion to Rive, or change to the existing mobile `.riv` files.

Run the local proof with:

```bash
node --import tsx scripts/render-desktop-preview.mjs
```

Use `--sheets-only` to render all state captures and contact sheets without invoking the video encoder. This command needs the installed project dependencies and an existing local `ffmpeg`; it does not install anything.

## What is actually rendered

`renderToStaticMarkup(ComputerGeometry)` creates the actual React SVG. `@xmldom/xmldom` parses its elements. A small, scoped controller-test adapter supplies named `[id]` discovery, dataset attribute writes, document visibility/listener hooks and the reduced-motion preference. It does not create `window`, implement browser layout, execute a JavaScript browser engine, start HTTP, schedule frames, or send any network request. A request for browser animation scheduling throws.

The actual `ComputerMotion` is constructed with an external clock and pointer tracking disabled. For each capture, the proof calls `setState(id, {immediate:true})`, `seek(seconds)` and `getSnapshot()`. The controller's real `_draw()` updates the SVG: all eyes, brows, mouth, arm/hand variants, censorship and cable deformation therefore come from the implementation under test. The resulting SVG is serialized and rasterized by the locally installed `@napi-rs/canvas` SVG renderer.

The contact sheet captures all 32 performances at their metadata `peakSeconds`. Four additional sheets show eight states each at larger scale. Individual SVG and PNG captures are retained under `docs/desktop-preview/states/`.

The 30-second MP4 uses twelve selected 2.5-second excerpts at 24 fps, for 720 composed frames. It includes moods, facepalm, single and double censored attitude gestures, directional pointing, beckoning and a demo invitation. Every frame derives from the actual controller at its recorded source time. The surrounding captions and demo button are explicitly an offline mock presentation. They do not claim to be a recording of the webpage or a submitted demo request.

## Evidence and scope

`docs/desktop-preview/desktop-proof.json` records the actual rendering dependency hashes, render script and lockfile hashes, runtime versions, exact state snapshots, captured SVG/PNG hashes, contact-sheet hashes and final video hash. React page/lifecycle wrappers are outside this rendering scope. `desktop-reel-frames.json` records the source SVG and composed RGBA hash for each reel frame. Generation fails if a bound source file changes while the proof runs.

`tests/animation/desktop-rendering.test.mjs` exercises the actual full geometry/controller, deterministic state seeks, immutable case paths, substantial rasterized content, distinct selected gesture outputs, the direct attitude gate and preservation of the browser boundary. These checks supplement the separate controller and geometry tests.

This is local SVG/controller visual evidence. It does not verify browser rendering, CSS layout, event scheduling, pointer or keyboard interaction, navigation, form delivery, animation performance on a real device, or website accessibility. The inherited browser workflow remains **BLOCKED**; this renderer does not work around that rejection. The empty browser-verified Rive activation registry remains empty, and the v2 native mobile files are preserved.

## Completed proof

The final local render passed on 2026-09-13: 32 SVG/PNG state captures, one overview, four enlarged contact sheets and a 30-second MP4. `ffprobe` independently confirmed H.264, 1280 × 720, 24 fps and exactly 720 frames. The MP4 is 2,858,442 bytes with SHA-256 `d6e709b43c1b070c50bbd7172377f616271aa13a834ccbc2748e69063f989be3`.

Actual AI-assisted inspection covered all 32 peak poses, the five corrected poses, the poster and 12 chapter midpoint frames decoded from the finished MP4. The double-censored gesture and demo-invite decoded frames were also inspected full-size. Four cropped left-hand poses and weak angry-face contrast found during review were corrected in the actual controller, then recaptured. All 32 peak rasters now pass a capture-boundary check. A separate animation-authoring agent reviewed the state sheets and corrected poses without finding further issues. `desktop-visual-review.json` binds this limited review to exact image, source-proof and video hashes; it does not claim a human review or continuous real-time playback inspection.

The three actual rendering tests passed. The controller owner reported all 32 combined desktop tests and TypeScript validation passing. All five mobile native binary hashes were compared with the v2 project and remain byte-identical. Browser validation remains blocked.
