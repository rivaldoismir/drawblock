# Changelog

All notable changes to DrawBlock are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-08

First public release. DrawBlock is now MIT-licensed and open for contributions.

### Added

- Local-first workspace for Markdown notes (`.md`) and Excalidraw sketches
  (`.excalidraw`), backed by the File System Access API.
- BlockNote editor with a pure-Markdown round trip and an allowlisted block set.
- Excalidraw editor loaded lazily, with local fonts for full offline use.
- Markdown links between notes and sketches, including a `/` slash-menu picker.
- Debounced autosave queue with per-path chaining and `lastModified` conflict
  detection.
- File management: create, rename, move (drag and drop), and permanent delete.
- Search across file names and note contents; sketch contents are never indexed.
- Offline PWA with local fonts, Workbox precache, and a manual light/dark theme
  toggle.
- New app icon that combines the note (BlockNote) and pencil (Excalidraw) motifs,
  plus a maskable variant and an Open Graph image.
- "Tentang DrawBlock" dialog with upstream credits and contribution links for
  Excalidraw and BlockNote.
- Open-source documentation: MIT license, contributing guide, code of conduct,
  security policy, third-party notices, changelog, issue/PR templates, CI, and
  Dependabot.
- Vercel Web Analytics (same-origin, aggregate, cookie-less) on the production
  host only, plus `npm run stats:repo` for GitHub traffic.

### Changed

- Package metadata now points to the public repository, Vercel demo, and issue
  tracker; version bumped to `1.0.0`.
- README rewritten in English, with an Indonesian translation in `README.id.md`.
- Dependencies are pinned exactly; transitive security overrides are documented
  in `package.json`.

### Fixed

- `Ctrl/Cmd+S` now flushes pending saves instead of triggering the browser's
  "Save page" dialog; `Ctrl/Cmd+P` and `Ctrl/Cmd+O` are also suppressed.
- The PWA icons no longer show a placeholder "E".

### Security

- Resolved all high-severity `npm audit` findings with exact overrides for
  `nanoid`, `lodash-es`, `katex`, and the Workbox `glob` chain.
- Added `vercel.json` security headers and `.env`/secret exclusions to
  `.gitignore`.
- Enabled Dependabot alerts, Dependabot security updates, and secret scanning on
  the public repository.
- Remaining `npm audit` findings are four low-severity, build-time-only
  advisories in the `vite-plugin-pwa` → `workbox-build` → `deepmerge` chain; see
  `SECURITY.md`.
