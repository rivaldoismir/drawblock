import { lazy, Suspense } from "react";
import type { SceneData } from "../types";

interface DrawingEditorProps {
  scene: SceneData;
  theme: "light" | "dark";
  onChange: (scene: SceneData, signature: string) => void;
}

const DrawingEditorImpl = lazy(() => import("./DrawingEditorImpl"));

export function DrawingEditor(props: DrawingEditorProps) {
  return (
    <div className="editor-pane drawing-pane">
      <Suspense
        fallback={
          <div className="editor-loading">
            <span>Memuat editor gambar…</span>
          </div>
        }
      >
        <DrawingEditorImpl {...props} />
      </Suspense>
    </div>
  );
}
