import {
  DRAWING_EXTENSION,
  NOTE_EXTENSION,
  baseName,
  extensionOf,
  isDrawingFile,
  isHiddenName,
  isNoteFile,
  joinPath,
  nextAvailableName,
  nextCopyName,
  parentPath,
  sortNodes,
  splitPath,
  validateEntryName,
  withExtension,
} from "./path";
import type { WorkspaceNode } from "../types";

type MovableFileHandle = FileSystemFileHandle & {
  move?: (parent: FileSystemDirectoryHandle, name?: string) => Promise<void>;
};

type MovableDirectoryHandle = FileSystemDirectoryHandle & {
  move?: (parent: FileSystemDirectoryHandle, name?: string) => Promise<void>;
};

export class ConflictError extends Error {
  constructor(name: string) {
    super(`"${name}" sudah ada di folder ini.`);
    this.name = "ConflictError";
  }
}

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";
}

export async function pickWorkspace(): Promise<FileSystemDirectoryHandle | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error("File System Access API tidak tersedia. Gunakan Chrome atau Edge.");
  }
  return window.showDirectoryPicker!({
    id: "drawblock-workspace",
    mode: "readwrite",
  });
}

type PermissionCapable = FileSystemHandle & {
  queryPermission?: (descriptor: { mode: "readwrite" }) => Promise<PermissionState>;
  requestPermission?: (descriptor: { mode: "readwrite" }) => Promise<PermissionState>;
};

export async function hasPermission(handle: FileSystemHandle): Promise<boolean> {
  const capable = handle as PermissionCapable;
  if (!capable.queryPermission) {
    return true;
  }
  return (await capable.queryPermission({ mode: "readwrite" })) === "granted";
}

export async function requestPermission(handle: FileSystemHandle): Promise<boolean> {
  const capable = handle as PermissionCapable;
  if (!capable.requestPermission) {
    return true;
  }
  return (await capable.requestPermission({ mode: "readwrite" })) === "granted";
}

async function listNames(dir: FileSystemDirectoryHandle): Promise<string[]> {
  const names: string[] = [];
  for await (const name of dir.keys()) {
    names.push(name);
  }
  return names;
}

async function readChildren(
  dir: FileSystemDirectoryHandle,
  base: string,
  expanded: Set<string>,
): Promise<WorkspaceNode[]> {
  const nodes: WorkspaceNode[] = [];
  for await (const [name, handle] of dir.entries()) {
    if (isHiddenName(name)) {
      continue;
    }
    const path = joinPath(base, name);
    if (handle.kind === "directory") {
      const directoryHandle = handle as FileSystemDirectoryHandle;
      nodes.push({
        kind: "folder",
        name,
        path,
        handle: directoryHandle,
        children: expanded.has(path)
          ? await readChildren(directoryHandle, path, expanded)
          : undefined,
      });
      continue;
    }
    if (isNoteFile(name)) {
      nodes.push({ kind: "note", name, path, handle: handle as FileSystemFileHandle });
    } else if (isDrawingFile(name)) {
      nodes.push({ kind: "drawing", name, path, handle: handle as FileSystemFileHandle });
    }
  }
  return sortNodes(nodes);
}

export async function scanWorkspace(
  root: FileSystemDirectoryHandle,
  expanded: Set<string> = new Set(),
): Promise<WorkspaceNode[]> {
  return readChildren(root, "", expanded);
}

/** Baca SEMUA file (rekursif) untuk indeks pencarian, tanpa mengubah state tree. */
export async function collectFiles(
  dir: FileSystemDirectoryHandle,
  base = "",
): Promise<WorkspaceNode[]> {
  const files: WorkspaceNode[] = [];
  for await (const [name, handle] of dir.entries()) {
    if (isHiddenName(name)) {
      continue;
    }
    const path = joinPath(base, name);
    if (handle.kind === "directory") {
      files.push(
        ...(await collectFiles(handle as FileSystemDirectoryHandle, path)),
      );
      continue;
    }
    if (isNoteFile(name)) {
      files.push({ kind: "note", name, path, handle: handle as FileSystemFileHandle });
    } else if (isDrawingFile(name)) {
      files.push({
        kind: "drawing",
        name,
        path,
        handle: handle as FileSystemFileHandle,
      });
    }
  }
  return files;
}

export function flattenFiles(nodes: WorkspaceNode[]): WorkspaceNode[] {  const files: WorkspaceNode[] = [];
  for (const node of nodes) {
    if (node.kind === "folder") {
      if (node.children) {
        files.push(...flattenFiles(node.children));
      }
    } else {
      files.push(node);
    }
  }
  return files;
}

export function findNode(nodes: WorkspaceNode[], path: string): WorkspaceNode | undefined {
  for (const node of nodes) {
    if (node.path === path) {
      return node;
    }
    if (node.children) {
      const match = findNode(node.children, path);
      if (match) {
        return match;
      }
    }
  }
  return undefined;
}

export function flattenFolders(nodes: WorkspaceNode[]): WorkspaceNode[] {
  const folders: WorkspaceNode[] = [];
  for (const node of nodes) {
    if (node.kind === "folder") {
      folders.push(node);
      if (node.children) {
        folders.push(...flattenFolders(node.children));
      }
    }
  }
  return folders;
}

async function countDirectoryEntries(dir: FileSystemDirectoryHandle): Promise<number> {
  let total = 0;
  for await (const [, handle] of dir.entries()) {
    if (handle.kind === "file") {
      total += 1;
    } else {
      total += await countDirectoryEntries(handle as FileSystemDirectoryHandle);
    }
  }
  return total;
}

export async function countDirectory(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<number> {
  return countDirectoryEntries(await getDirectoryByPath(root, path));
}

export async function getDirectoryByPath(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<FileSystemDirectoryHandle> {
  let dir = root;
  for (const part of splitPath(path)) {
    dir = await dir.getDirectoryHandle(part);
  }
  return dir;
}

export async function getFileByPath(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<FileSystemFileHandle> {
  const parent = await getDirectoryByPath(root, parentPath(path));
  return parent.getFileHandle(baseName(path));
}

async function getHandle(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<FileSystemFileHandle | FileSystemDirectoryHandle> {
  const parent = await getDirectoryByPath(root, parentPath(path));
  const name = baseName(path);
  try {
    return await parent.getFileHandle(name);
  } catch {
    return parent.getDirectoryHandle(name);
  }
}

export async function resolveNode(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<WorkspaceNode | null> {
  const name = baseName(path);
  if (!name) {
    return null;
  }
  let parent: FileSystemDirectoryHandle;
  try {
    parent = await getDirectoryByPath(root, parentPath(path));
  } catch {
    return null;
  }
  try {
    const handle = await parent.getFileHandle(name);
    if (isNoteFile(name)) {
      return { kind: "note", name, path, handle };
    }
    if (isDrawingFile(name)) {
      return { kind: "drawing", name, path, handle };
    }
    return null;
  } catch {
    // Bukan file; coba folder.
  }
  try {
    const handle = await parent.getDirectoryHandle(name);
    return { kind: "folder", name, path, handle };
  } catch {
    return null;
  }
}

export async function readTextFile(handle: FileSystemFileHandle): Promise<string> {
  const file = await handle.getFile();
  return file.text();
}

export async function writeTextFile(
  handle: FileSystemFileHandle,
  text: string,
): Promise<number> {
  const writable = await handle.createWritable();
  try {
    await writable.write(text);
  } finally {
    await writable.close();
  }
  const file = await handle.getFile();
  return file.lastModified;
}

export async function entryExists(
  dir: FileSystemDirectoryHandle,
  name: string,
): Promise<boolean> {
  try {
    await dir.getFileHandle(name);
    return true;
  } catch {
    // bukan file
  }
  try {
    await dir.getDirectoryHandle(name);
    return true;
  } catch {
    return false;
  }
}

export async function createEntry(
  root: FileSystemDirectoryHandle,
  targetPath: string,
  kind: "note" | "drawing",
  initialContent: string,
): Promise<WorkspaceNode> {
  const dir = await getDirectoryByPath(root, targetPath);
  const ext = kind === "note" ? NOTE_EXTENSION : DRAWING_EXTENSION;
  const name = nextAvailableName(await listNames(dir), ext);
  const handle = await dir.getFileHandle(name, { create: true });
  await writeTextFile(handle, initialContent);
  return { kind, name, path: joinPath(targetPath, name), handle };
}

export async function createFolder(
  root: FileSystemDirectoryHandle,
  targetPath: string,
): Promise<WorkspaceNode> {
  const dir = await getDirectoryByPath(root, targetPath);
  const names = await listNames(dir);
  let name = "New Folder";
  if (names.includes(name)) {
    name = nextCopyName(names, name);
  }
  const handle = await dir.getDirectoryHandle(name, { create: true });
  return { kind: "folder", name, path: joinPath(targetPath, name), handle };
}

async function copyDirectory(
  source: FileSystemDirectoryHandle,
  targetParent: FileSystemDirectoryHandle,
  name: string,
): Promise<void> {
  const target = await targetParent.getDirectoryHandle(name, { create: true });
  for await (const [childName, childHandle] of source.entries()) {
    if (childHandle.kind === "file") {
      const text = await (childHandle as FileSystemFileHandle).getFile().then((file) => file.text());
      const file = await target.getFileHandle(childName, { create: true });
      await writeTextFile(file, text);
    } else {
      await copyDirectory(childHandle as FileSystemDirectoryHandle, target, childName);
    }
  }
}

export async function renameEntry(
  root: FileSystemDirectoryHandle,
  path: string,
  newName: string,
): Promise<string> {
  const validation = validateEntryName(newName);
  if (validation) {
    throw new Error(validation);
  }
  const parent = await getDirectoryByPath(root, parentPath(path));
  const oldName = baseName(path);
  const handle = await getHandle(root, path);
  const ext = extensionOf(oldName);
  const finalName = handle.kind === "file" && ext ? withExtension(newName, ext) : newName.trim();
  if (finalName === oldName) {
    return path;
  }
  if (await entryExists(parent, finalName)) {
    throw new ConflictError(finalName);
  }
  const newPath = joinPath(parentPath(path), finalName);
  const movable = handle as MovableFileHandle | MovableDirectoryHandle;
  if (typeof movable.move === "function") {
    await movable.move(parent, finalName);
    return newPath;
  }
  if (handle.kind === "file") {
    const fileHandle = handle as FileSystemFileHandle;
    const text = await fileHandle.getFile().then((file) => file.text());
    const target = await parent.getFileHandle(finalName, { create: true });
    await writeTextFile(target, text);
    await parent.removeEntry(oldName);
    return newPath;
  }
  await copyDirectory(handle as FileSystemDirectoryHandle, parent, finalName);
  await parent.removeEntry(oldName, { recursive: true });
  return newPath;
}

export async function deleteEntry(
  root: FileSystemDirectoryHandle,
  path: string,
): Promise<void> {
  const parent = await getDirectoryByPath(root, parentPath(path));
  await parent.removeEntry(baseName(path), { recursive: true });
}

export async function moveEntry(
  root: FileSystemDirectoryHandle,
  fromPath: string,
  targetDirPath: string,
): Promise<string> {
  const name = baseName(fromPath);
  const targetPath = joinPath(targetDirPath, name);
  if (targetPath === fromPath) {
    return fromPath;
  }
  const targetDir = await getDirectoryByPath(root, targetDirPath);
  if (await entryExists(targetDir, name)) {
    throw new ConflictError(name);
  }
  const handle = await getHandle(root, fromPath);
  const sourceDir = await getDirectoryByPath(root, parentPath(fromPath));
  const movable = handle as MovableFileHandle | MovableDirectoryHandle;
  if (typeof movable.move === "function") {
    await movable.move(targetDir);
  } else {
    if (handle.kind === "file") {
      const text = await (handle as FileSystemFileHandle)
        .getFile()
        .then((file) => file.text());
      const target = await targetDir.getFileHandle(name, { create: true });
      await writeTextFile(target, text);
    } else {
      await copyDirectory(handle as FileSystemDirectoryHandle, targetDir, name);
    }
    await sourceDir.removeEntry(name, { recursive: true });
  }
  return targetPath;
}

export async function moveFileAsCopy(
  root: FileSystemDirectoryHandle,
  fromPath: string,
  targetDirPath: string,
): Promise<string> {
  const source = await getFileByPath(root, fromPath);
  const targetDir = await getDirectoryByPath(root, targetDirPath);
  const name = nextCopyName(await listNames(targetDir), baseName(fromPath));
  const text = await source.getFile().then((file) => file.text());
  const target = await targetDir.getFileHandle(name, { create: true });
  await writeTextFile(target, text);
  return joinPath(targetDirPath, name);
}
