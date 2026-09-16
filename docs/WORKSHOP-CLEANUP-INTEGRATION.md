# Workshop cleanup for Claude Code

Remove the four floating room labels and their hover tips from the currently edited source. Preserve the newer full-room composition, header spacing, hidden desktop hero copy and computer CTA already present in release 1120. The v4 full project is a reference build, **not an overwrite package for that edited release**. Do not run the historical v3 animation installer for this cleanup.

## Apply the narrow change

Work in the actual source checkout used to build the release, with concurrent edits paused. Run the helper from the extracted v4 project with its locked dependencies installed; it uses the existing Rolldown/Oxc TSX parser supplied with Vite. Node 24 is the project runtime.

```sh
node /absolute/path/to/v4/scripts/apply-room-tab-cleanup.mjs --target /absolute/path/to/current-source
node /absolute/path/to/v4/scripts/apply-room-tab-cleanup.mjs --target /absolute/path/to/current-source --apply
```

The first command writes nothing. `ready` means it found exactly one literal-class `<nav className="room-navigation">` subtree in `apps/web/src/components/Workshop.tsx`. Review that subtree before the second command. Its removal also removes the labels’ hover/focus handlers and tooltip markup. The helper preserves every source byte outside that AST-selected range; it does not reformat the file or replace the surrounding room layout. In an expression position it substitutes `null` to keep valid TSX.

The helper rejects malformed TSX, ambiguous or dynamic class matches, duplicate target blocks, symlink paths and a target with the wrong package name. It rechecks the original SHA-256 before replacement, saves the actual target file plus a restoration journal under `.room-tab-cleanup-backups/<id>/`, and writes atomically. A later edit blocks replacement. A repeat reports `already-clean`. There is no force option. If it blocks on different markup, inspect the actual live source and manually remove only the matching navigation subtree; do not copy the reference Workshop file over it.

The returned backup path holds the original file. Before a manual restoration, compare the current file with the journal’s `afterSha256`; merge any later edits instead of blindly restoring over them. No build, server restart, API, mail, environment or deployment change is performed by the helper.

## Keep the conversation deliberate

Removing the navigation subtree is the complete floating-label/hover-tip cleanup. The reference v4 additionally places `ComputerConversation` after the artwork in normal page flow. If the edited release still opens a floating conversation panel, review and merge the relevant `App.tsx`, `ComputerConversation.tsx` and `computer-conversation.css` changes individually. Preserve its existing CTA placement and full-room layout. The intended disclosure opens on click or keyboard activation, expands in flow, and closes with Escape or its close control. Unused old label CSS/data can be removed after confirming no remaining references; they create no popup without the removed markup.

Keep ordinary header/mobile navigation and the demo/contact links available. Rebuild and run the checkout’s existing verification commands before the established release process. In an authorized browser, check desktop and narrow layouts, keyboard navigation, absent floating labels/tips, and an unobscured computer/demo CTA.

## Evidence and limits

The six focused Node tests passed: byte preservation including Unicode/CRLF and synthetic release edits; valid literal/expression handling; ambiguous-source rejection; dry-run/apply/backup/idempotence; intervening-edit rejection; wrong-project/symlink rejection. Read-only dry run on the immutable v3 Workshop selected its 760-character navigation subtree. Source review of v4 confirms the room labels/hover handlers are removed, named desktop/mobile navigation remains, and the native conversation disclosure uses normal flow with visible keyboard focus and explicit close controls.

The unknown release 1120 source has not been read or modified. Browser/viewport verification remains unavailable under the session’s browser policy; Node/source checks do not certify its live appearance. No deployment has occurred.
