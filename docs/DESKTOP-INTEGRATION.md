# Original desktop v3 — guarded Claude integration

The addon upgrades the original CRT computer, its moods and optional censored gestures, and the path from its conversation to the existing demo form. It accepts known source files from either the original complete website (v1) or the expanded mobile-animation website (v2). The original delivery directories and ZIPs remain unchanged.

Use the addon when Claude has ongoing site work. Use the full v3 website as a reference or clean source tree; do not copy it wholesale over an edited project. The addon includes inherited mobile-v2 files needed by a v1 target. It carries no API/mail implementation, protected environment, canonical truth mapping, dependency settings, host deployment files or built public output.

## Inspect and apply

Extract the addon into a separate directory. Use Node 24 and the actual project directory, not a symlink such as a deployment `current` pointer. Pause other edits to the listed files during application.

```bash
node scripts/apply-animation-upgrade.mjs --target /absolute/path/to/existing/thatstupidcomputer
```

This default dry run changes nothing. It selects `desktop-upgrade-manifest.json` and validates every source hash, the target project name, all path components and every existing target file before allowing writes. V3 takes precedence over any retained v2 manifest; an invalid v3 manifest cannot fall back to an older upgrade.

Each entry has a primary v1 `beforeSha256`, an `acceptedBeforeSha256` array containing the distinct authentic v1/v2 values, and the required `afterSha256`. `null` means that file was absent from an actual baseline. It is never a wildcard. A target may contain a mixture of known v1/v2 files; an already-upgraded file is a no-op. Any unknown edit blocks the entire operation and lists conflicts. There is no force option or automatic content merge. Have Claude inspect and merge conflicting files deliberately, preserving current work.

After a clean dry run:

```bash
node scripts/apply-animation-upgrade.mjs --target /absolute/path/to/existing/thatstupidcomputer --apply
```

The helper saves the actual target bytes and modes in a unique `.animation-upgrade-backups/` directory and writes a `restoration.json` journal. Each file replacement is atomic. On an application failure, it restores its previous writes, including the correct v2 original when present, and removes files it created. It preserves later operator edits and reports `manual-required` instead of overwriting them. Inspect the printed backup path if restoration is incomplete. The helper is not a transaction against unrelated concurrent editors or a power-loss guarantee.

Rebuild from the merged source using the target's lockfile. Run typecheck, tests, build, asset/standards checks and built-site HTTP checks. Then run the portable browser tests and manual desktop/demo checks in an authorized browser environment before the usual release process. Application does not install packages, send email, configure analytics, alter the canonical truth source or deploy.

## Handoff behavior

The computer conversation uses fixed, finite choices and real `/contact/` links. Its URL handoff carries only a project category and `from=computer`. The form applies that category once after hydration while untouched; any field edit prevents later URL changes from overwriting it. It does not prefill personal details, tick consent or submit automatically. Existing SMTP acceptance remains the success boundary.

Rude gestures require an explicit request. Closing, backing out or selecting a different intent revokes the permission. The original drawing and lettering retain their geometry; new hands/face are additive. Global pause and reduced motion remain effective. New measurement stages pass through existing consent rules and collect no conversation or form text. See `DESKTOP-MEASUREMENT.md` for the event definitions and limits.

The full reference package contains the complete private standards ledger and visual proof. Consult `DESKTOP-ACCEPTANCE.md` for fresh results and remaining browser/account/host checks; copied v1/v2 reports are historical for files changed by v3.

## Maintainer manifest generation

Run this maintainer command from the full reference source tree, after source and documentation freeze, using the two immutable source baselines:

```bash
node scripts/make-desktop-upgrade-manifest.mjs /absolute/path/to/v1 /absolute/path/to/v2
```

The generator reads a reviewed allowlist, includes files that differ from either baseline, and writes only the new desktop manifest. It does not modify either baseline or regenerate the original v2 manifest. Rehearse the resulting addon on disposable copies of both baseline projects before packaging.
