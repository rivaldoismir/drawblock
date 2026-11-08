import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./styles/app.css";
import App from "./App";

// Excalidraw resolves drawing fonts against this base; "/" keeps them local
// (public/fonts) so the app works offline instead of hitting the esm.sh CDN.
window.EXCALIDRAW_ASSET_PATH = "/";

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
