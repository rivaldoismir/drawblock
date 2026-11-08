import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export interface SceneData {
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState>;
  files: BinaryFiles;
}

export type EntryKind = "folder" | "note" | "drawing";

export interface WorkspaceNode {
  kind: EntryKind;
  name: string;
  /** Path relatif dari akar workspace, memakai pemisah "/". */
  path: string;
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
  /** Hanya diisi untuk folder yang sedang di-expand. */
  children?: WorkspaceNode[];
}

export interface NoteFile {
  kind: "note";
  name: string;
  path: string;
  handle: FileSystemFileHandle;
  text: string;
  lastModified: number;
}

export interface DrawingFile {
  kind: "drawing";
  name: string;
  path: string;
  handle: FileSystemFileHandle;
  scene: SceneData;
  lastModified: number;
  signature: string;
}

export type ActiveFile = NoteFile | DrawingFile;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface SearchResult {
  path: string;
  name: string;
  folder: string;
  kind: "note" | "drawing";
  match: "name" | "content";
  snippet?: string;
}
