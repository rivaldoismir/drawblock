import { DrawingEditor } from "./DrawingEditor";
import { NoteEditor } from "./NoteEditor";
import type { ActiveFile, SceneData } from "../types";

interface EditorHostProps {
  active: ActiveFile | null;
  sessionId: number;
  nonce: number;
  theme: "light" | "dark";
  drawings: Array<{ path: string; name: string; folder: string }>;
  onNoteChange: (markdown: string) => void;
  onNoteReady: (markdown: string) => void;
  onDrawingChange: (scene: SceneData, signature: string) => void;
  onOpenLink: (href: string) => void;
}

export function EditorHost({
  active,
  sessionId,
  nonce,
  theme,
  drawings,
  onNoteChange,
  onNoteReady,
  onDrawingChange,
  onOpenLink,
}: EditorHostProps) {
  if (!active) {
    return null;
  }
  const key = `${active.kind}:${sessionId}:${nonce}`;
  if (active.kind === "note") {
    return (
      <NoteEditor
        key={key}
        notePath={active.path}
        markdown={active.text}
        theme={theme}
        drawings={drawings}
        onChange={onNoteChange}
        onReady={onNoteReady}
        onOpenLink={onOpenLink}
      />
    );
  }
  return (
    <DrawingEditor
      key={key}
      scene={active.scene}
      theme={theme}
      onChange={onDrawingChange}
    />
  );
}
