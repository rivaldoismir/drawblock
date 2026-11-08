# Third-Party Notices

DrawBlock is MIT-licensed (see [`LICENSE`](LICENSE)). It bundles or depends on
the following open-source projects. Their licenses apply to their respective
code.

## Excalidraw

- Package: `@excalidraw/excalidraw` 0.18.1
- Project: https://github.com/excalidraw/excalidraw
- License: MIT

```text
MIT License

Copyright (c) 2020 Excalidraw

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## BlockNote

- Packages: `@blocknote/core`, `@blocknote/react`, `@blocknote/mantine` 0.57.0
- Project: https://github.com/TypeCellOS/BlockNote
- License: Mozilla Public License 2.0 (MPL-2.0)

BlockNote is used as an unmodified npm dependency. The Source Code Form of the
MPL-covered files is available from the upstream repository and from the
published npm packages. The full MPL-2.0 text is distributed in
`node_modules/@blocknote/core/LICENSE` after `npm install`, and at
https://www.mozilla.org/en-US/MPL/2.0/.

DrawBlock does not include or depend on any `@blocknote/xl-*` package.

## Other runtime dependencies

| Package | License |
| --- | --- |
| `react`, `react-dom` | MIT |
| `@vercel/analytics` | MIT |

## Build and test dependencies

| Package | License |
| --- | --- |
| `vite`, `@vitejs/plugin-react` | MIT |
| `typescript` | Apache-2.0 |
| `vitest` | MIT |
| `vite-plugin-pwa` | MIT |
| `workbox-build` | MIT |

Transitive dependencies keep the licenses declared by their own packages; see
`package-lock.json` for the exact resolved versions.

## Branding

The DrawBlock name, icon (`public/icon.svg`, `public/icons/*.png`), and
`public/og-image.png` are original assets for this project. Excalidraw and
BlockNote names and logos belong to their respective owners and are used only to
describe the libraries this project builds upon. DrawBlock is not affiliated
with or endorsed by either project.
