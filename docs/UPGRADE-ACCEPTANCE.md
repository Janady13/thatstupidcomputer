> Historical v2 animation acceptance below. Current v3 desktop and demo results are in `DESKTOP-ACCEPTANCE.md`. V2 native mobile files are preserved byte for byte; these earlier application counts do not certify changed v3 source.

# Animation upgrade v2 — acceptance and integration

This is the additive animation upgrade in `tsc-animations-v2`. The earlier website folder and delivery ZIP remain unchanged. All 11 public website routes, the direct-email backend and canonical truth integration remain in scope; the visible upgrade adds the real character playground to `/work/`.

Each of the five original vector rigs now has **32 timelines**: the original 14 plus Laugh, Proud, Shy, Suspicious, Startled, Frustrated, Sleepy, WakeUp, Think, Facepalm, Shrug, PointLeft, PointRight, Bow, Jump, Land, RunRight and RunLeft. Original geometry and original animation tracks are retained; neutral reset tracks prevent previous poses leaking into another action. The characters have distinct acting profiles. Native files contain the same 160 named timelines.

The stage provides finite entrances/exits, walk/run destinations, roaming, peeking, jumping/landing, return, cancellation and replay. Pointer dragging has keyboard alternatives and bounded settling. Stage travel does not mirror artwork or double the authored jump trajectory. Playback, sequences and native commands respect explicit pause, reduced motion, document visibility and viewport visibility. Asset readiness gates progression. Rude gestures require an explicit opt-in and are absent from the automatic showcase.

## Evidence for this upgrade

| Check | Actual scope and status |
| --- | --- |
| Native generation and import | **PASS:** five compiled files, 32 actions each, official Rive CLI 1.0.2. New byte-bound records are in `native/reports/native-compiled.json`. |
| Native Canvas rendering | **PASS:** 160 actions, 960 samples (800 normalized phases plus 160 authored peaks) through official Canvas WASM 2.42.1 and Node canvas. The peak image captures use those same peak samples. Exact-byte evidence is in `native/reports/native-canvas.json`; this is not browser/WebGL certification. |
| Separate native gate and installer checks | **PASS:** 20 pure Node checks (7 native gate, 13 installer), with command, source hashes and log in `docs/standards/upgrade-observations.json`. |
| Whole-upgrade verification | **PASS:** the final source-freeze run passed strict typecheck, **215 tests with zero failures/skips**, build, 62 asset checks, the complete standards inventory, and all 20 built-site HTTP checks across 105 public files. `docs/standards/local-verification.json` records all six gates; the separate review verified its log hashes and totals. |
| Additive patch rehearsal | **PASS:** dry run against the original, then 125 file changes applied to a disposable original-site copy; repeat application needed zero changes. The patched copy passed all six local gates with 202 tests, 62 asset checks and 20 HTTP checks. Its count excludes the 13 installer-only tests kept in the reference package. `docs/standards/upgrade-rehearsal.json` records this before final documentation bindings; executable code is unchanged. |
| Source standards mapping | All 135 supplied documents, 26 roles and 40 graph cards remain governed by their recorded dispositions. New stage, accessibility, integration and evidence paths are mapped. Structural inventory is not behavioral certification. |
| Browser, device and field evidence | **BLOCKED / NOT OBSERVED:** this environment explicitly forbids the local browser target and alternate browser workarounds. Browser hydration, actual layout, keyboard/screen-reader use, viewport interaction, WebGL and field performance require the authorized operator's runs. |

Prior 14-action/96-test observations in `docs/standards/observations.json` describe the original build. They do not certify changed files. `native/history/v1/` preserves the prior native evidence. The separate review is another AI task worker sharing the workspace, not an external or human audit.

The full reference website package contains the complete private evidence and standards corpus. The smaller integration patch contains its listed changes; consult the full package for any evidence path omitted from that patch.

No new claim is made about SMTP mailbox arrival, GA4/search accounts, public indexing, DNS/TLS or BUBBLES deployment. The production build still requires the real approved canonical truth export and exact commit/digest pins. The native browser promotion registry remains empty until the required browser review is completed; the site retains its usable SVG implementation.

## Apply over Claude's existing website work

Use the additive integration package to avoid copying an entire old website over newer work. Extract it to a separate directory. Review its `animation-upgrade-manifest.json`, which names every intended file and its before/after SHA-256. Pause other edits to these paths during application. From that extracted package on Node 24:

```bash
node scripts/apply-animation-upgrade.mjs --target /absolute/path/to/existing/thatstupidcomputer
```

The default dry run makes no changes. It requires the expected project name, valid source hashes, safe regular-file paths and exact target baseline hashes. Files already matching the upgrade are no-ops. Any other target content blocks the entire operation and lists the conflicts. There is no force option: inspect conflicting changes and have Claude merge those files deliberately, retaining the current site's work.

After a clean preflight, apply explicitly:

```bash
node scripts/apply-animation-upgrade.mjs --target /absolute/path/to/existing/thatstupidcomputer --apply
```

The helper creates a unique `.animation-upgrade-backups/` directory inside the target, saves original bytes and modes, and writes `restoration.json`. File replacement is atomic per file. If an application step fails, it restores its prior writes and removes its newly created files; later operator edits are retained and reported as `manual-required`. Read the printed backup path and journal if restoration is incomplete. This is not a transaction against unrelated concurrent editors or a power-loss guarantee.

The installer rejects backend, deployment, private, environment, `node_modules` and built-public-output paths. It does not install packages, contact APIs, send mail, alter protected configuration or deploy. Rebuild the existing project's public output from the merged source; do not copy stale API or deployment files from the full reference package. Rerun the target's typecheck, tests, build, asset and standards gates, then the portable browser suite and manual playground checks on an authorized browser target before the operator's normal release process.
