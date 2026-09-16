# Workshop cleanup v4 — acceptance

The user requested removal of the four floating room tabs and their pop-ups. The current reference removes those JSX controls, hover handlers and associated CSS. The original room composition sits below the header. Header navigation and normal demo links remain. The computer conversation expands inline, with an actual character preview in its own reserved column. Existing service explanations remain ordinary content below the room; there is no floating quick-tour panel.

The same original desktop and mobile animation files, APIs, dependency lock and canonical truth adapter are retained. Only one homepage paragraph was corrected so it no longer instructs people to click removed room hotspots.

## Verification

**PASS:** strict TypeScript, 278 application/installer tests (zero failures/skips), the full client/SSR/API build, 62 asset checks, the complete standards inventory, and 20 built HTTP checks. Run: 2026-09-13T11:38:27.498Z to 2026-09-13T11:38:36.811Z. Exact command/log records: docs/standards/local-verification.json (SHA-256 010d9c6ead169d540c069231e612bd776765d2617950a798e16ab80682a7f59e).

The six new targeted-cleanup tests cover guarded source edits. An additional actual-v3 Workshop rehearsal confirmed that dry run changes nothing, apply preserves every byte outside the parsed navigation element, the backup matches the source and repeat is a no-op. Evidence: docs/standards/workshop-cleanup-rehearsal.json. The portable browser tests were updated, but not executed. Source inspection and automated checks do not establish browser rendering or deployment.

## Integration and limits

The supplied screenshots show Claude's newer live layout; those exact edited source files are not present here. The focused helper parses the real target Workshop.tsx and deletes only the unambiguous room-navigation element, with dry run, backup and hash checks. The rest of the updated reference is for a reviewed merge, not wholesale replacement of the live tree. See WORKSHOP-CLEANUP-INTEGRATION.md.

Earlier browser restrictions remain in force. No browser, alternative browser engine, tunnel, live email or deployment was used. The attempt to inspect the public homepage through the web reader was also rejected as non-retryable; no alternate access route was attempted. Browser tests are updated and included for the authorized deployment environment.

The SEO/AIO manual remains the governing build authority. Earlier acceptance counts describe their own versions. Current archive integrity is checked separately; a hash match does not establish successful production behavior.
