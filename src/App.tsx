import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorHost } from "./editors/EditorHost";
import {
  ConflictDialog,
  ContextMenu,
  DeleteDialog,
  MoveConflictDialog,
  RenameDialog,
} from "./components/Dialogs";
import { EmptyState } from "./components/EmptyState";
import { Sidebar } from "./components/Sidebar";
import { Toolbar } from "./components/Toolbar";
import { useWorkspace } from "./hooks/useWorkspace";
import { useTheme } from "./hooks/useTheme";
import {
  ConflictError,
  countDirectory,
  createEntry,
  createFolder,
  deleteEntry,
  getFileByPath,
  moveEntry,
  moveFileAsCopy,
  renameEntry,
  resolveNode,
  readTextFile,
  writeTextFile,
} from "./lib/fs";
import {
  baseName,
  extensionOf,
  isInsidePath,
  joinPath,
  parentPath,
  validateEntryName,
} from "./lib/path";
import { idbGet, idbSet } from "./lib/persistence";
import { loadScene, sceneSignature, serializeScene, createEmptySceneJSON } from "./lib/scene";
import { SaveConflictError, SaveQueue } from "./services/saveQueue";
import { SearchIndex } from "./services/searchIndex";
import { resolveHref } from "./services/linkTarget";
import type { ActiveFile, SaveStatus, SceneData, WorkspaceNode } from "./types";

const NOTE_DEBOUNCE_MS = 1200;
const DRAWING_DEBOUNCE_MS = 1500;

type DialogState =
  | { kind: "rename"; node: WorkspaceNode }
  | { kind: "delete"; node: WorkspaceNode; count: number | null }
  | { kind: "moveConflict"; path: string; targetDir: string }
  | null;

interface ContextMenuState {
  x: number;
  y: number;
  node: WorkspaceNode | null;
}

export default function App() {
  const workspace = useWorkspace();
  const { theme, toggleTheme } = useTheme();
  const [active, setActive] = useState<ActiveFile | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [conflictPath, setConflictPath] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [selection, setSelection] = useState<WorkspaceNode | null>(null);
  const [sessionId, setSessionId] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [query, setQuery] = useState("");
  const [indexTick, setIndexTick] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.localStorage.getItem("drawblock:sidebarCollapsed") === "1";
  });

  useEffect(() => {
    window.localStorage.setItem(
      "drawblock:sidebarCollapsed",
      sidebarCollapsed ? "1" : "0",
    );
  }, [sidebarCollapsed]);

  const activeRef = useRef<ActiveFile | null>(null);
  const rootRef = useRef<FileSystemDirectoryHandle | null>(null);
  const queuedTextRef = useRef("");
  const queuedSignatureRef = useRef("");
  const restoredRootRef = useRef<FileSystemDirectoryHandle | null>(null);

  activeRef.current = active;
  rootRef.current = workspace.root;

  const queueRef = useRef<SaveQueue | null>(null);
  if (queueRef.current === null) {
    queueRef.current = new SaveQueue({
      write: async (path, text, expectedLastModified) => {
        const root = rootRef.current;
        if (!root) {
          throw new Error("Workspace belum dibuka.");
        }
        const handle = await getFileByPath(root, path);
        const file = await handle.getFile();
        if (
          expectedLastModified >= 0 &&
          file.lastModified !== expectedLastModified
        ) {
          throw new SaveConflictError(path);
        }
        return writeTextFile(handle, text);
      },
      forceWrite: async (path, text) => {
        const root = rootRef.current;
        if (!root) {
          throw new Error("Workspace belum dibuka.");
        }
        const handle = await getFileByPath(root, path);
        return writeTextFile(handle, text);
      },
      onStatus: (nextStatus, error) => {
        setStatus(nextStatus);
        setSaveError(error);
      },
      onConflict: (path) => setConflictPath(path),
    });
  }
  const queue = queueRef.current;

  const indexRef = useRef<SearchIndex | null>(null);
  if (indexRef.current === null) {
    indexRef.current = new SearchIndex();
  }
  const index = indexRef.current;

  const results = useMemo(
    () => index.search(query),
    // indexTick memaksa hitung ulang saat indeks berubah.
    [index, indexTick, query],
  );

  const drawings = useMemo(
    () => index.list("drawing"),
    [index, indexTick],
  );

  useEffect(() => index.subscribe(() => setIndexTick((value) => value + 1)), [index]);

  useEffect(() => {
    if (workspace.root) {
      void index.build(workspace.root);
    }
  }, [index, workspace.root]);

  useEffect(() => {
    return () => {
      queue.dispose();
    };
  }, [queue]);

  const openFile = useCallback(
    async (node: WorkspaceNode) => {
      if (node.kind === "folder") {
        return;
      }
      await queue.flushAll();
      try {
        const handle = node.handle as FileSystemFileHandle;
        const file = await handle.getFile();
        if (node.kind === "note") {
          const text = await file.text();
          queuedTextRef.current = text;
          setActive({
            kind: "note",
            name: node.name,
            path: node.path,
            handle,
            text,
            lastModified: file.lastModified,
          });
        } else {
          const loaded = await loadScene(handle);
          const signature = sceneSignature(loaded.scene);
          queuedSignatureRef.current = signature;
          setActive({
            kind: "drawing",
            name: node.name,
            path: node.path,
            handle,
            scene: loaded.scene,
            lastModified: loaded.lastModified,
            signature,
          });
        }
        queue.setBaseline(node.path, file.lastModified);
        setSessionId((value) => value + 1);
        setStatus("saved");
        setSaveError(null);
        void idbSet("lastFile", node.path);
      } catch (error) {
        console.error(error);
        setNotice(error instanceof Error ? error.message : "Gagal membuka file.");
      }
    },
    [queue],
  );

  const openByPath = useCallback(
    async (path: string) => {
      const root = rootRef.current;
      if (!root) {
        return;
      }
      const node = await resolveNode(root, path);
      if (node && node.kind !== "folder") {
        await openFile(node);
      }
    },
    [openFile],
  );

  const handleOpenLink = useCallback(
    async (href: string) => {
      const current = activeRef.current;
      const root = rootRef.current;
      if (!current || current.kind !== "note" || !root) {
        return;
      }
      const target = resolveHref(current.path, href);
      if (target.kind === "drawing") {
        const node = await resolveNode(root, target.path);
        if (!node || node.kind !== "drawing") {
          setNotice(`Gambar tidak ditemukan: ${target.path}`);
          return;
        }
        await openFile(node);
        return;
      }
      if (target.kind === "note") {
        setNotice("Tautan antar catatan belum didukung di MVP ini.");
        return;
      }
      if (target.kind === "invalid") {
        setNotice(target.reason);
      }
    },
    [openFile],
  );

  // Pulihkan file terakhir setelah folder siap.
  useEffect(() => {
    const root = workspace.root;
    if (!root || restoredRootRef.current === root) {
      return;
    }
    restoredRootRef.current = root;
    void (async () => {
      const lastFile = await idbGet<string>("lastFile");
      if (!lastFile) {
        return;
      }
      const node = await resolveNode(root, lastFile);
      if (node && node.kind !== "folder") {
        await openFile(node);
      }
    })();
  }, [openFile, workspace.root]);

  const handleNoteChange = useCallback(
    (markdown: string) => {
      const current = activeRef.current;
      setActive((value) =>
        value && value.kind === "note" && value.text !== markdown
          ? { ...value, text: markdown }
          : value,
      );
      if (current && current.kind === "note" && markdown !== queuedTextRef.current) {
        queuedTextRef.current = markdown;
        queue.schedule(current.path, markdown, NOTE_DEBOUNCE_MS);
        index.upsertNote(current.path, markdown);
        setStatus("saving");
      }
    },
    [index, queue],
  );

  const handleNoteReady = useCallback(
    (normalized: string) => {
      queuedTextRef.current = normalized;
      setActive((value) =>
        value && value.kind === "note" ? { ...value, text: normalized } : value,
      );
      const current = activeRef.current;
      if (current && current.kind === "note") {
        index.upsertNote(current.path, normalized);
      }
    },
    [index],
  );

  const handleDrawingChange = useCallback(
    (scene: SceneData, signature: string) => {
      const current = activeRef.current;
      setActive((value) => {
        if (!value || value.kind !== "drawing" || value.signature === signature) {
          return value;
        }
        return { ...value, scene, signature };
      });
      if (
        current &&
        current.kind === "drawing" &&
        signature !== queuedSignatureRef.current
      ) {
        queuedSignatureRef.current = signature;
        const snapshot = scene;
        queue.schedule(
          current.path,
          () => serializeScene(snapshot),
          DRAWING_DEBOUNCE_MS,
        );
        setStatus("saving");
      }
    },
    [queue],
  );

  const handleOpenFolder = useCallback(async () => {
    await queue.flushAll();
    setActive(null);
    setStatus("idle");
    setSaveError(null);
    await workspace.openFolder();
  }, [queue, workspace]);

  const handleOverwrite = useCallback(async () => {
    if (!conflictPath) {
      return;
    }
    const path = conflictPath;
    setConflictPath(null);
    await queue.forceWrite(path);
  }, [conflictPath, queue]);

  const handleReload = useCallback(async () => {
    const path = conflictPath;
    if (!path) {
      return;
    }
    setConflictPath(null);
    queue.discard(path);
    setNonce((value) => value + 1);
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const node = await resolveNode(root, path);
    if (node && node.kind !== "folder") {
      await openFile(node);
    }
  }, [conflictPath, openFile, queue]);

  // ------------------------------------------------------------------ files

  const handleCreate = useCallback(
    async (kind: "note" | "drawing" | "folder") => {
      const root = rootRef.current;
      if (!root) {
        return;
      }
      const parent = workspace.selectedFolder;
      try {
        await queue.flushAll();
        if (kind === "folder") {
          const node = await createFolder(root, parent);
          await workspace.refresh();
          workspace.selectFolder(node.path);
          setSelection(node);
          return;
        }
        const node = await createEntry(
          root,
          parent,
          kind,
          kind === "note" ? "" : createEmptySceneJSON(),
        );
        await workspace.refresh();
        if (kind === "note") {
          index.upsertNote(node.path, "");
        } else {
          index.upsertName(node.path, "drawing");
        }
        await openFile(node);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Gagal membuat entri.");
      }
    },
    [index, openFile, queue, workspace],
  );

  const requestRename = useCallback((node: WorkspaceNode) => {
    setDialogError(null);
    setDialog({ kind: "rename", node });
  }, []);

  const submitRename = useCallback(
    async (value: string) => {
      const root = rootRef.current;
      if (!root || !dialog || dialog.kind !== "rename") {
        return;
      }
      const node = dialog.node;
      const validation = validateEntryName(value);
      if (validation) {
        setDialogError(validation);
        return;
      }
      try {
        await queue.flushAll();
        const newPath = await renameEntry(root, node.path, value);
        if (node.kind === "folder") {
          index.renamePrefix(node.path, newPath);
        } else {
          index.rename(node.path, newPath);
        }
        const current = activeRef.current;
        if (current) {
          if (current.path === node.path) {
            queue.setBaseline(newPath, queue.getBaseline(current.path));
            setActive({ ...current, path: newPath, name: baseName(newPath) });
            void idbSet("lastFile", newPath);
          } else if (isInsidePath(current.path, node.path)) {
            const movedPath = newPath + current.path.slice(node.path.length);
            queue.setBaseline(movedPath, queue.getBaseline(current.path));
            setActive({ ...current, path: movedPath });
            void idbSet("lastFile", movedPath);
          }
        }
        setDialog(null);
        setSelection(null);
        await workspace.refresh();
      } catch (error) {
        setDialogError(
          error instanceof Error ? error.message : "Gagal mengganti nama.",
        );
      }
    },
    [dialog, index, queue, workspace],
  );

  const requestDelete = useCallback(async (node: WorkspaceNode) => {
    let count: number | null = null;
    const root = rootRef.current;
    if (root && node.kind === "folder") {
      try {
        count = await countDirectory(root, node.path);
      } catch {
        count = null;
      }
    }
    setDialog({ kind: "delete", node, count });
  }, []);

  const confirmDelete = useCallback(async () => {
    const root = rootRef.current;
    if (!root || !dialog || dialog.kind !== "delete") {
      return;
    }
    const node = dialog.node;
    try {
      await queue.flushAll();
      const current = activeRef.current;
      if (current && isInsidePath(current.path, node.path)) {
        queue.discard(current.path);
        setActive(null);
      }
      await deleteEntry(root, node.path);
      if (node.kind === "folder") {
        index.removePrefix(node.path);
      } else {
        index.remove(node.path);
      }
      setDialog(null);
      setSelection(null);
      await workspace.refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Gagal menghapus.");
    }
  }, [dialog, index, queue, workspace]);

  const updateActiveAfterMove = useCallback(
    (oldPath: string, newPath: string) => {
      const current = activeRef.current;
      if (!current || current.path !== oldPath) {
        return;
      }
      queue.setBaseline(newPath, queue.getBaseline(oldPath));
      index.rename(oldPath, newPath);
      setActive({ ...current, path: newPath, name: baseName(newPath) });
      void idbSet("lastFile", newPath);
    },
    [index, queue],
  );

  const handleDropFile = useCallback(
    async (filePath: string, targetDir: string) => {
      const root = rootRef.current;
      if (!root || parentPath(filePath) === targetDir) {
        return;
      }
      try {
        await queue.flushAll();
        const newPath = await moveEntry(root, filePath, targetDir);
        updateActiveAfterMove(filePath, newPath);
        await workspace.refresh();
      } catch (error) {
        if (error instanceof ConflictError) {
          setDialog({ kind: "moveConflict", path: filePath, targetDir });
          return;
        }
        setNotice(error instanceof Error ? error.message : "Gagal memindahkan file.");
      }
    },
    [queue, updateActiveAfterMove, workspace],
  );

  const resolveMoveConflict = useCallback(
    async (mode: "replace" | "keepBoth") => {
      const root = rootRef.current;
      if (!root || !dialog || dialog.kind !== "moveConflict") {
        return;
      }
      const { path, targetDir } = dialog;
      setDialog(null);
      try {
        if (mode === "replace") {
          await deleteEntry(root, joinPath(targetDir, baseName(path)));
          const newPath = await moveEntry(root, path, targetDir);
          updateActiveAfterMove(path, newPath);
        } else {
          const newPath = await moveFileAsCopy(root, path, targetDir);
          const node = await resolveNode(root, newPath);
          if (node?.kind === "note") {
            index.upsertNote(newPath, await readTextFile(node.handle as FileSystemFileHandle));
          } else if (node?.kind === "drawing") {
            index.upsertName(newPath, "drawing");
          }
        }
        await workspace.refresh();
      } catch (error) {
        setNotice(error instanceof Error ? error.message : "Gagal memindahkan file.");
      }
    },
    [dialog, index, updateActiveAfterMove, workspace],
  );

  // ------------------------------------------------------------------ menu

  const showContextMenu = useCallback(
    (node: WorkspaceNode | null, event: React.MouseEvent) => {
      if (node && node.kind === "folder") {
        workspace.selectFolder(node.path);
      }
      setContextMenu({ x: event.clientX, y: event.clientY, node });
    },
    [workspace],
  );

  const contextItems = useCallback(() => {
    if (!contextMenu) {
      return [];
    }
    const node = contextMenu.node;
    if (!node) {
      return [
        { label: "Catatan Baru", onSelect: () => void handleCreate("note") },
        { label: "Sketsa Baru", onSelect: () => void handleCreate("drawing") },
        { label: "Folder Baru", onSelect: () => void handleCreate("folder") },
      ];
    }
    if (node.kind === "folder") {
      return [
        { label: "Catatan Baru di sini", onSelect: () => void handleCreate("note") },
        { label: "Sketsa Baru di sini", onSelect: () => void handleCreate("drawing") },
        { label: "Folder Baru di sini", onSelect: () => void handleCreate("folder") },
        { label: "Ganti nama", onSelect: () => requestRename(node) },
        { label: "Hapus", onSelect: () => void requestDelete(node), danger: true },
      ];
    }
    return [
      { label: "Buka", onSelect: () => void openFile(node) },
      { label: "Ganti nama", onSelect: () => requestRename(node) },
      { label: "Hapus", onSelect: () => void requestDelete(node), danger: true },
    ];
  }, [contextMenu, handleCreate, openFile, requestDelete, requestRename]);

  // ------------------------------------------------------------------ effects

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setSidebarCollapsed((value) => !value);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        document.getElementById("sidebar-search")?.focus();
        return;
      }
      if (event.key === "F2" && selection) {
        event.preventDefault();
        requestRename(selection);
        return;
      }
      if (event.key === "Escape") {
        setDialog(null);
        setContextMenu(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [requestRename, selection]);

  // Simpan paksa saat tab disembunyikan/ditutup.
  useEffect(() => {
    const flush = () => {
      void queue.flushAll();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        flush();
      }
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [queue]);

  useEffect(() => {
    if (workspace.error) {
      setNotice(workspace.error);
    }
  }, [workspace.error]);

  const dismissNotice = useCallback(() => {
    setNotice(null);
    setSaveError(null);
    workspace.clearError();
  }, [workspace]);

  const initialRenameValue =
    dialog && dialog.kind === "rename"
      ? dialog.node.name.slice(
          0,
          dialog.node.kind === "folder"
            ? dialog.node.name.length
            : dialog.node.name.length - extensionOf(dialog.node.name).length,
        )
      : "";

  return (
    <div className="app">
      <Toolbar
        fileName={active?.name ?? null}
        status={status}
        error={saveError}
        hasRoot={workspace.root !== null}
        sidebarCollapsed={sidebarCollapsed}
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
        onNewNote={() => void handleCreate("note")}
        onNewDrawing={() => void handleCreate("drawing")}
        onNewFolder={() => void handleCreate("folder")}
      />
      {workspace.root ? (
        <div className={`app-body${sidebarCollapsed ? " sidebar-collapsed" : ""}`}>
          <Sidebar
            tree={workspace.tree}
            activePath={active?.path ?? null}
            selectionPath={selection?.path ?? null}
            expanded={workspace.expanded}
            selectedFolder={workspace.selectedFolder}
            loading={workspace.loading}
            canResume={workspace.canResume}
            query={query}
            results={results}
            indexing={index.isBuilding}
            indexProgress={index.progress}
            onQueryChange={setQuery}
            onOpenResult={(path) => void openByPath(path)}
            onOpenFolder={() => void handleOpenFolder()}
            onResumeFolder={() => void workspace.resumeFolder()}
            onToggleFolder={(path) => void workspace.toggleFolder(path)}
            onOpenFile={(node) => void openFile(node)}
            onSelectFolder={workspace.selectFolder}
            onSelectNode={setSelection}
            onRenameRequest={requestRename}
            onContextMenu={showContextMenu}
            onDropFile={(filePath, folderPath) => void handleDropFile(filePath, folderPath)}
          />
          <main className="main-pane">
            {active ? (
              <EditorHost
                active={active}
                sessionId={sessionId}
                nonce={nonce}
                theme={theme}
                drawings={drawings}
                onNoteChange={handleNoteChange}
                onNoteReady={handleNoteReady}
                onDrawingChange={handleDrawingChange}
                onOpenLink={(href) => void handleOpenLink(href)}
              />
            ) : (
              <div className="editor-empty">
                <p>Pilih catatan atau gambar di sidebar.</p>
              </div>
            )}
            {notice || saveError ? (
              <div className="notice" role="status">
                <span>{notice ?? saveError}</span>
                <button type="button" className="text-button" onClick={dismissNotice}>
                  Tutup
                </button>
              </div>
            ) : null}
          </main>
        </div>
      ) : (
        <EmptyState
          error={workspace.error}
          canResume={workspace.canResume}
          onOpenFolder={() => void handleOpenFolder()}
          onResumeFolder={() => void workspace.resumeFolder()}
          onClearError={dismissNotice}
        />
      )}

      {conflictPath ? (
        <ConflictDialog
          path={conflictPath}
          onOverwrite={() => void handleOverwrite()}
          onReload={() => void handleReload()}
        />
      ) : null}

      {dialog?.kind === "rename" ? (
        <RenameDialog
          title={dialog.node.kind === "folder" ? "Ganti nama folder" : "Ganti nama"}
          initialValue={initialRenameValue}
          error={dialogError}
          onCancel={() => setDialog(null)}
          onSubmit={(value) => void submitRename(value)}
        />
      ) : null}

      {dialog?.kind === "delete" ? (
        <DeleteDialog
          name={dialog.node.name}
          kind={dialog.node.kind === "folder" ? "folder" : "file"}
          count={dialog.count}
          onCancel={() => setDialog(null)}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}

      {dialog?.kind === "moveConflict" ? (
        <MoveConflictDialog
          name={baseName(dialog.path)}
          folder={dialog.targetDir}
          onCancel={() => setDialog(null)}
          onReplace={() => void resolveMoveConflict("replace")}
          onKeepBoth={() => void resolveMoveConflict("keepBoth")}
        />
      ) : null}

      {contextMenu ? (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextItems()}
          onClose={() => setContextMenu(null)}
        />
      ) : null}
    </div>
  );
}
