import {
  DRAWING_EXTENSION,
  NOTE_EXTENSION,
  baseName,
  extensionOf,
  parentPath,
  splitPath,
} from "../lib/path";

export type LinkTarget =
  | { kind: "drawing"; path: string }
  | { kind: "note"; path: string }
  | { kind: "external"; href: string }
  | { kind: "invalid"; reason: string };

const EXTERNAL_PATTERN = /^(https?|mailto|tel):/i;
const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

/** Encode tiap segmen; pemisah "/" tidak ikut di-encode. */
export function encodeHref(path: string): string {
  return splitPath(path).map(encodeURIComponent).join("/");
}

export function decodeHref(href: string): string {
  try {
    return splitPath(href).map(decodeURIComponent).join("/");
  } catch {
    return href;
  }
}

export function resolveHref(notePath: string, href: string): LinkTarget {
  const trimmed = href.trim();
  if (trimmed.length === 0) {
    return { kind: "invalid", reason: "Tautan kosong." };
  }
  if (EXTERNAL_PATTERN.test(trimmed) || trimmed.startsWith("#")) {
    return { kind: "external", href: trimmed };
  }
  if (trimmed.startsWith("/") || SCHEME_PATTERN.test(trimmed)) {
    return { kind: "invalid", reason: "Tautan absolut tidak didukung." };
  }

  const withoutHash = trimmed.split("#")[0] ?? "";
  const withoutQuery = withoutHash.split("?")[0] ?? "";
  const decoded = decodeHref(withoutQuery);
  const segments = splitPath(parentPath(notePath));

  for (const part of splitPath(decoded)) {
    if (part === ".") {
      continue;
    }
    if (part === "..") {
      if (segments.length === 0) {
        return { kind: "invalid", reason: "Tautan keluar dari workspace." };
      }
      segments.pop();
      continue;
    }
    segments.push(part);
  }

  const path = segments.join("/");
  if (path.length === 0) {
    return { kind: "invalid", reason: "Tautan tanpa target." };
  }
  const ext = extensionOf(path);
  if (ext === DRAWING_EXTENSION) {
    return { kind: "drawing", path };
  }
  if (ext === NOTE_EXTENSION) {
    return { kind: "note", path };
  }
  return { kind: "invalid", reason: "Bukan file DrawBlock." };
}

/** Href relatif dari folder catatan ke file gambar. */
export function drawingHref(notePath: string, drawingPath: string): string {
  const from = splitPath(parentPath(notePath));
  const to = splitPath(drawingPath);
  let common = 0;
  while (common < from.length && common < to.length && from[common] === to[common]) {
    common += 1;
  }
  const up = Array.from({ length: from.length - common }, () => "..");
  const relative = [...up, ...to.slice(common)].join("/");
  return encodeHref(relative);
}

export function drawingLinkText(path: string): string {
  const name = baseName(path);
  const ext = extensionOf(name);
  return ext.length > 0 ? name.slice(0, -ext.length) : name;
}
