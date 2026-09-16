# Give the animation upgrade to Claude Code

This archive contains the complete updated website and an animation-only installer for an existing copy. It does not require a new database, dependency, service, domain or canonical truth graph. The original delivered website is preserved separately.

## If work on the original site is already underway

Extract this archive into a new sibling directory. Do not extract it over the active project. Ask Claude Code to read this document and inspect `animation-upgrade-manifest.json`. The manifest identifies exactly which animation files differ from the original delivery and their before/after hashes.

Run the read-only check from the newly extracted upgrade directory, replacing the example target with the real absolute project directory:

```sh
node scripts/verify-release.mjs
node scripts/apply-animation-upgrade.mjs --target /absolute/path/to/existing/thatstupidcomputer
```

The default is a dry run. Every source file and every target file is checked before any write. Files that already match the upgrade are left alone. A target that matches neither the original nor upgraded hash is reported as a conflict, with no changes applied.

If there are conflicts, Claude should merge the listed source changes into the active work and review them. Do not change the manifest hashes to make the check pass or overwrite ongoing work. The archive contains the complete v2 source so the intended change is inspectable.

Once the dry run is clear, pause other edits to the target while applying:

```sh
node scripts/apply-animation-upgrade.mjs --target /absolute/path/to/existing/thatstupidcomputer --apply
```

The installer creates an exclusive backup directory and restoration journal under the target's `.animation-upgrade-backups/`, retains originals and rolls back its own writes if an operation fails. It refuses unsafe paths, symlinks and protected backend/deployment/private/environment paths. A journal marked `manual-required` means an outside edit was preserved during rollback and needs human inspection. This is a local filesystem operation, not a transaction with an unrelated editor; do not edit the same files concurrently.

The animation-only patch does not replace compiled output. After applying or merging, rebuild the existing project:

```sh
npm run verify:local
```

Run the included browser suite on a machine where browser access is permitted. The full project's existing production review and BUBBLES release procedure still govern deployment. Do not infer a browser pass from the included offline reel or local tests.

## If starting with the updated full website

The archive root is `TSC-ANIMATION-UPGRADES-v2/`. Use Node 24.19+ within major24, the existing locked dependencies and the included compiled preview:

```sh
node scripts/verify-release.mjs
npm ci
npm run preview
```

Open `http://localhost:4173/work/` to use the new character playground. The main workshop's existing Ask the computer button cycles richer desktop expressions. The complete preview remains noindex until the original production truth and crawler-policy gates pass.

## What changed

- Five mobile rigs now contain 32 actions each. The 18 additions coordinate eyes, eyebrows, hands, shoulders, posture, cable and character-specific secondary movement. All original scene geometry and existing fourteen tracks/metadata per rig are preserved; constant reset tracks prevent state leakage.
- Desktop expressions now include amused, skeptical, sleepy, proud, startled and thinking, alongside the original six.
- The Work page has a cast selector, all-action selector, quick moods, stage movement, pointer dragging, single-click/keyboard alternatives, a finite performance, global pause and reduced-motion static poses. Ordinary movement is bounded to the stage; entrance, exit and peek intentionally cross its clipped edge.
- Native files are compiled for32 named timelines each and verified through the official Canvas WASM runtime. The live site uses its functional SVG renderer until actual WebGL browser promotion passes.

The movie at `docs/preview/TSC-Animation-Upgrades-v2.mp4` shows actual native animation and the shared stage engine. It is an offline proof reel. Current tests, limitations and report paths are in `UPGRADE-ACCEPTANCE.md` and `NATIVE-UPGRADE.md`.
