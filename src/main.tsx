import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { inject } from "@vercel/analytics";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./styles/app.css";
import App from "./App";

// Excalidraw resolves drawing fonts against this base; "/" keeps them local
// (public/fonts) so the app works offline instead of hitting the esm.sh CDN.
window.EXCALIDRAW_ASSET_PATH = "/";

// Aggregate, cookie-less page views from Vercel Web Analytics. The script is
// same-origin (/_vercel/insights/script.js) and only runs on the production
// host, so local previews and offline sessions never emit a request. Disable
// it by removing this block (or turning Analytics off in the Vercel project).
if (
  import.meta.env.PROD &&
  window.location.hostname === "drawblock.vercel.app"
) {
  inject();
}

registerSW({ immediate: true });

const container = document.getElementById("root");
if (!container) {
  throw new Error("Elemen #root tidak ditemukan.");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
