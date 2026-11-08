import { useCallback, useRef } from "react";
import "@excalidraw/excalidraw/index.css";
import { Excalidraw } from "@excalidraw/excalidraw";
import type { AppState, BinaryFiles, ExcalidrawInitialDataState } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { sceneSignature } from "../lib/scene";
import type { SceneData } from "../types";

interface DrawingEditorImplProps {
  scene: SceneData;
  theme: "light" | "dark";
  onChange: (scene: SceneData, signature: string) => void;
}

export default function DrawingEditorImpl({
  scene,
  theme,
  onChange,
}: DrawingEditorImplProps) {
  // `initialData` harus stabil: Excalidraw hanya memakainya saat mount.
  const initialDataRef = useRef<ExcalidrawInitialDataState | null>(null);
  if (initialDataRef.current === null) {
    initialDataRef.current = {
      elements: scene.elements,
      appState: scene.appState,
      files: scene.files,
    };
  }

  const handleChange = useCallback(
    (
      elements: readonly ExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles,
    ) => {
      const next: SceneData = { elements, appState, files };
      onChange(next, sceneSignature(next));
    },
    [onChange],
  );

  return (
    <Excalidraw
      initialData={initialDataRef.current}
      theme={theme}
      onChange={handleChange}
      // Navigasi/simpan file milik sidebar workspace. Open/Save bawaan
      // Excalidraw akan melewati antrean simpan dan deteksi konflik.
      UIOptions={{
        canvasActions: {
          loadScene: false,
          saveToActiveFile: false,
          export: { saveFileToDisk: false },
        },
      }}
    />
  );
}
