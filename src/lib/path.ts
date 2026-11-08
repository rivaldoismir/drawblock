export const NOTE_EXTENSION = ".md";
export const DRAWING_EXTENSION = ".excalidraw";

export function splitPath(path: string): string[] {
  return path.split("/").filter((part) => part.length > 0);
}

export function joinPath(...parts: string[]): string {
  return parts.flatMap(splitPath).join("/");
}

export function parentPath(path: string): string {
  const parts = splitPath(path);
  parts.pop();
  return parts.join("/");
}

export function baseName(path: string): string {
  const parts = splitPath(path);
  return parts.length > 0 ? parts[parts.length - 1]! : "";
}

export function extensionOf(name: string): string {
  const base = baseName(name);
  const dot = base.lastIndexOf(".");
  if (dot <= 0) {
    return "";
  }
  return base.slice(dot).toLowerCase();
}

export function isHiddenName(name: string): boolean {
  return name.startsWith(".") || name === "node_modules";
}

export function isNoteFile(name: string): boolean {
  return extensionOf(name) === NOTE_EXTENSION;
}

export function isDrawingFile(name: string): boolean {
  return extensionOf(name) === DRAWING_EXTENSION;
}

export function isInsidePath(path: string, ancestor: string): boolean {
  if (ancestor === "") {
    return true;
  }
  return path === ancestor || path.startsWith(`${ancestor}/`);
}

export function validateEntryName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return "Nama tidak boleh kosong.";
  }
  if (trimmed === "." || trimmed === "..") {
    return "Nama tidak valid.";
  }
  if (/[\\/:*?"<>|]/.test(trimmed)) {
    return 'Nama tidak boleh mengandung \\ / : * ? " < > |.';
  }
  if (/[. ]$/.test(trimmed)) {
    return "Nama tidak boleh diakhiri titik atau spasi.";
  }
  return null;
}

/** Pertahankan ekstensi target; buang ekstensi lama bila berbeda. */
export function withExtension(name: string, ext: string): string {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  if (lower.endsWith(ext)) {
    return trimmed;
  }
  let stem = trimmed;
  if (lower.endsWith(NOTE_EXTENSION)) {
    stem = trimmed.slice(0, -NOTE_EXTENSION.length);
  } else if (lower.endsWith(DRAWING_EXTENSION)) {
    stem = trimmed.slice(0, -DRAWING_EXTENSION.length);
  }
  return `${stem}${ext}`;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Nomor terkecil yang belum dipakai, dihitung terpisah per ekstensi. */
export function nextAvailableName(existingNames: string[], ext: string): string {
  const pattern = new RegExp(`^New (\\d+)${escapeRegExp(ext)}$`, "i");
  const used = new Set<number>();
  for (const name of existingNames) {
    const match = pattern.exec(name);
    if (match) {
      used.add(Number(match[1]));
    }
  }
  let index = 1;
  while (used.has(index)) {
    index += 1;
  }
  return `New ${index}${ext}`;
}

/** `catatan.md` → `catatan (2).md`, lalu `(3)`, dst. */
export function nextCopyName(existingNames: string[], name: string): string {
  const ext = extensionOf(name);
  const stem = ext.length > 0 ? name.slice(0, -ext.length) : name;
  const existing = new Set(existingNames);
  let index = 2;
  while (existing.has(`${stem} (${index})${ext}`)) {
    index += 1;
  }
  return `${stem} (${index})${ext}`;
}

export function sortNodes<T extends { kind: EntryKindLike; name: string }>(nodes: T[]): T[] {
  return [...nodes].sort((left, right) => {
    const leftFolder = left.kind === "folder" ? 0 : 1;
    const rightFolder = right.kind === "folder" ? 0 : 1;
    if (leftFolder !== rightFolder) {
      return leftFolder - rightFolder;
    }
    return left.name.localeCompare(right.name, "id", {
      numeric: true,
      sensitivity: "base",
    });
  });
}

type EntryKindLike = "folder" | "note" | "drawing";
