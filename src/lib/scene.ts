import { getSceneVersion, loadFromBlob, serializeAsJSON } from "@excalidraw/excalidraw";
import type { SceneData } from "../types";

export interface LoadedScene {
  scene: SceneData;
  lastModified: number;
}

export async function loadScene(handle: FileSystemFileHandle): Promise<LoadedScene> {
  const file = await handle.getFile();
  const data = await loadFromBlob(file, null, null);
  return {
    scene: { elements: data.elements, appState: data.appState, files: data.files },
    lastModified: file.lastModified,
  };
}

export function serializeScene(scene: SceneData): string {
  return serializeAsJSON(scene.elements, scene.appState, scene.files, "local");
}

/**
 * Detektor perubahan murah. `getSceneVersion` hanya berubah saat elemen berubah,
 * dan daftar file berubah saat gambar ditambah/dihapus — zoom/seleksi diabaikan.
 */
export function sceneSignature(scene: SceneData): string {
  const appState = scene.appState;
  const documentState = [
    appState.viewBackgroundColor ?? "",
    appState.gridSize ?? "",
    appState.gridStep ?? "",
    appState.gridModeEnabled ? "1" : "0",
  ].join("|");
  return `${getSceneVersion(scene.elements)}|${Object.keys(scene.files).sort().join(",")}|${documentState}`;
}

export function createEmptySceneJSON(): string {
  return serializeAsJSON([], {}, {}, "local");
}
