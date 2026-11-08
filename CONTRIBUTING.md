# Contributing to DrawBlock

Thanks for taking the time to contribute. DrawBlock is a small, opinionated
project: a local-first workspace for Markdown notes and Excalidraw sketches. The
best contributions are focused, well-tested, and respect the rules below.

Bahasa Indonesia juga dipersilakan — issue dan pull request boleh ditulis dalam
bahasa Indonesia atau Inggris.

## Before you start

- Read [`AGENTS.md`](AGENTS.md) — it is the source of truth for architecture and
  non-negotiable rules.
- Read [`SECURITY.md`](SECURITY.md) before reporting anything security-related.
  Do **not** open a public issue for a vulnerability.
- For larger features, open an issue first so we can agree on the approach.

## Development setup

Requirements: Node.js 20+, npm, and Chrome or Edge for manual verification.

```bash
git clone https://github.com/rivaldoismir/drawblock.git
cd drawblock
npm install
npm run dev        # http://localhost:5173
```

Useful checks:

```bash
npm run typecheck
npm run test
npm run build
npm run preview    # http://localhost:4173 — required for PWA/offline checks
```

## Project rules (short version)

These are not style preferences; breaking them changes the product.

- **Markdown stays pure.** No frontmatter, custom syntax, or hidden metadata.
  The title is the file name.
- **Only allowlisted blocks.** If you add a block type, update
  `ALLOWED_SLASH_TITLES` / `ALLOWED_SELECT_TYPES` in
  `src/editors/NoteEditor.tsx` **and** add a Markdown round-trip test.
- **No `@blocknote/xl-*` packages.** Their licenses are incompatible with this
  project's MIT distribution.
- **All Markdown ↔ block conversion goes through `src/services/noteCodec.ts`.**
- **Save scenes with `serializeAsJSON`; load with `loadFromBlob`.** Never build
  Excalidraw JSON manually.
- **Write files through `createWritable()`** (`src/lib/fs.ts`), not ad-hoc streams.
- **Check `lastModified` before overwriting.** Conflicts must show the
  overwrite/reload dialog; never overwrite silently.
- **Autosave uses `SaveQueue`.** Do not call `queue.dispose()` in a `useEffect`
  cleanup (React StrictMode will kill the queue in development).
- **Do not remount editors on rename/move.** `EditorHost` keys off
  `sessionId` + `nonce`, not the path.
- **Preserve the Markdown baseline** from `onReady` so BlockNote normalization
  does not rewrite untouched files.
- **Offline first.** No third-party runtime requests. Fonts and assets stay local.
  The only allowed telemetry is the same-origin, aggregate Vercel Web Analytics
  described in [`docs/ANALYTICS.md`](docs/ANALYTICS.md).
- **Light theme by default.** Dark mode is an explicit toolbar toggle stored in
  `localStorage` (`drawblock:theme`).
- **Chrome/Edge desktop only.** Do not add Firefox/Safari polyfills.
- **Do not fork or vendor BlockNote or Excalidraw.**

## Pull request checklist

1. Fork the repository and create a branch:
   `feat/short-description` or `fix/short-description`.
2. Keep the change focused. Separate refactors from behavior changes.
3. Add or update tests for pure logic (`src/test/`).
4. Run:
   ```bash
   npm run typecheck
   npm run test
   npm run build
   ```
5. Verify UI changes manually in Chrome/Edge using the checklist in
   [`AGENTS.md`](AGENTS.md#verification-checklist).
6. Update documentation (`README.md`, `README.id.md`, `AGENTS.md`, or
   `docs/`) when behavior changes.
7. Open the PR using the template. Describe **what** changed and **why**, and
   include screenshots or a short recording for UI changes.

## Commit messages

Use short, imperative subjects, optionally with a conventional prefix:

```text
feat: add about dialog with upstream credits
fix: flush pending saves on Ctrl+S
docs: clarify offline verification
chore: bump vite
```

## Good first contributions

- Documentation fixes and translations.
- More unit tests around path handling, save conflicts, and link resolution.
- Accessibility improvements in the sidebar, toolbar, and dialogs.
- Reproducing and confirming bugs on different Chromium versions.

## License

By contributing, you agree that your contributions are licensed under the
project's [MIT License](LICENSE).
