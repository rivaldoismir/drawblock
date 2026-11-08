import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Excalidraw resolves its drawing fonts against window.EXCALIDRAW_ASSET_PATH
// (set to "/" in src/main.tsx). Copy the fonts shipped with the npm package
// into public/ so the app never depends on the esm.sh CDN and can precache
// them for offline use. Keep them out of git — this script regenerates them.

const source = fileURLToPath(
  new URL("../node_modules/@excalidraw/excalidraw/dist/prod/fonts", import.meta.url),
);
const target = fileURLToPath(new URL("../public/fonts", import.meta.url));

if (!existsSync(source)) {
  console.warn("[sync-fonts] @excalidraw fonts not found — run npm install first.");
  process.exit(0);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });

console.log(`[sync-fonts] copied Excalidraw fonts -> ${target}`);
