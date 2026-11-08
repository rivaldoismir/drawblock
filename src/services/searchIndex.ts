import { baseName, parentPath } from "../lib/path";
import { collectFiles, readTextFile } from "../lib/fs";
import type { SearchResult, WorkspaceNode } from "../types";

interface IndexEntry {
  path: string;
  name: string;
  folder: string;
  kind: "note" | "drawing";
  text: string;
}

function snippetFor(text: string, matchIndex: number): string {
  const lineStart = text.lastIndexOf("\n", matchIndex) + 1;
  let lineEnd = text.indexOf("\n", matchIndex);
  if (lineEnd === -1) {
    lineEnd = text.length;
  }
  let line = text.slice(lineStart, lineEnd).trim();
  if (line.length > 150) {
    const relative = Math.max(0, matchIndex - lineStart - 50);
    line = `${relative > 0 ? "…" : ""}${line.slice(relative, relative + 150)}…`;
  }
  return line;
}

export interface SearchResults {
  names: SearchResult[];
  contents: SearchResult[];
}

/**
 * Indeks nama (kedua jenis) + isi catatan.
 * File `.excalidraw` TIDAK PERNAH dibaca isinya.
 */
export class SearchIndex {
  private entries = new Map<string, IndexEntry>();
  private listeners = new Set<() => void>();
  private building = false;
  private buildToken = 0;
  private indexed = 0;
  private total = 0;

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  get isBuilding(): boolean {
    return this.building;
  }

  get size(): number {
    return this.entries.size;
  }

  get progress(): { indexed: number; total: number } {
    return { indexed: this.indexed, total: this.total };
  }

  async build(root: FileSystemDirectoryHandle): Promise<void> {
    const token = this.buildToken + 1;
    this.buildToken = token;
    this.entries.clear();
    this.indexed = 0;
    this.building = true;
    this.notify();

    try {
      const files = await collectFiles(root);
      this.total = files.length;
      this.notify();
      let processed = 0;
      for (const file of files) {
        if (token !== this.buildToken) {
          return;
        }
        this.setEntry(file, file.kind === "note" ? await this.readNote(file) : "");
        processed += 1;
        this.indexed = processed;
        if (processed % 25 === 0) {
          this.notify();
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }
    } finally {
      if (token === this.buildToken) {
        this.building = false;
        this.notify();
      }
    }
  }

  private async readNote(node: WorkspaceNode): Promise<string> {
    try {
      return await readTextFile(node.handle as FileSystemFileHandle);
    } catch (error) {
      console.warn(`Gagal mengindeks ${node.path}`, error);
      return "";
    }
  }

  private setEntry(node: WorkspaceNode, text: string): void {
    if (node.kind === "folder") {
      return;
    }
    this.entries.set(node.path, {
      path: node.path,
      name: node.name,
      folder: parentPath(node.path),
      kind: node.kind,
      text,
    });
  }

  upsertNote(path: string, text: string, name = baseName(path)): void {
    this.entries.set(path, {
      path,
      name,
      folder: parentPath(path),
      kind: "note",
      text,
    });
    this.notify();
  }

  upsertName(path: string, kind: "note" | "drawing" = "drawing"): void {
    const normalized = baseName(path).toLowerCase().endsWith(".excalidraw")
      ? "drawing"
      : kind;
    this.entries.set(path, {
      path,
      name: baseName(path),
      folder: parentPath(path),
      kind: normalized,
      text: "",
    });
    this.notify();
  }

  remove(path: string): void {
    if (this.entries.delete(path)) {
      this.notify();
    }
  }

  removePrefix(path: string): void {
    let changed = false;
    for (const key of [...this.entries.keys()]) {
      if (key === path || key.startsWith(`${path}/`)) {
        this.entries.delete(key);
        changed = true;
      }
    }
    if (changed) {
      this.notify();
    }
  }

  rename(oldPath: string, newPath: string): void {
    const entry = this.entries.get(oldPath);
    if (!entry) {
      return;
    }
    this.entries.delete(oldPath);
    this.entries.set(newPath, {
      ...entry,
      path: newPath,
      name: baseName(newPath),
      folder: parentPath(newPath),
    });
    this.notify();
  }

  renamePrefix(oldPath: string, newPath: string): void {
    let changed = false;
    for (const [key, entry] of [...this.entries.entries()]) {
      if (key !== oldPath && !key.startsWith(`${oldPath}/`)) {
        continue;
      }
      const updated = `${newPath}${key.slice(oldPath.length)}`;
      this.entries.delete(key);
      this.entries.set(updated, {
        ...entry,
        path: updated,
        name: baseName(updated),
        folder: parentPath(updated),
      });
      changed = true;
    }
    if (changed) {
      this.notify();
    }
  }

  list(kind?: "note" | "drawing"): Array<{ path: string; name: string; folder: string }> {
    return [...this.entries.values()]
      .filter((entry) => !kind || entry.kind === kind)
      .map((entry) => ({ path: entry.path, name: entry.name, folder: entry.folder }))
      .sort((left, right) =>
        left.path.localeCompare(right.path, "id", {
          numeric: true,
          sensitivity: "base",
        }),
      );
  }

  search(query: string, limit = 100): SearchResults {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return { names: [], contents: [] };
    }

    const names: SearchResult[] = [];
    const contents: SearchResult[] = [];

    for (const entry of this.entries.values()) {
      if (entry.name.toLowerCase().includes(needle)) {
        names.push({
          path: entry.path,
          name: entry.name,
          folder: entry.folder,
          kind: entry.kind,
          match: "name",
        });
        continue;
      }
      if (entry.kind !== "note") {
        continue;
      }
      const matchIndex = entry.text.toLowerCase().indexOf(needle);
      if (matchIndex !== -1) {
        contents.push({
          path: entry.path,
          name: entry.name,
          folder: entry.folder,
          kind: entry.kind,
          match: "content",
          snippet: snippetFor(entry.text, matchIndex),
        });
      }
    }

    names.sort((left, right) =>
      left.name.localeCompare(right.name, "id", {
        numeric: true,
        sensitivity: "base",
      }),
    );
    contents.sort((left, right) =>
      left.path.localeCompare(right.path, "id", {
        numeric: true,
        sensitivity: "base",
      }),
    );

    return {
      names: names.slice(0, limit),
      contents: contents.slice(0, limit),
    };
  }
}
