import { useCallback, useEffect, useRef, useState } from "react";
import {
  hasPermission,
  pickWorkspace,
  requestPermission,
  scanWorkspace,
} from "../lib/fs";
import { idbGet, idbSet } from "../lib/persistence";
import type { WorkspaceNode } from "../types";

interface WorkspaceApi {
  root: FileSystemDirectoryHandle | null;
  tree: WorkspaceNode[];
  expanded: Set<string>;
  selectedFolder: string;
  loading: boolean;
  error: string | null;
  canResume: boolean;
  openFolder: () => Promise<void>;
  resumeFolder: () => Promise<void>;
  toggleFolder: (path: string) => Promise<void>;
  selectFolder: (path: string) => void;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export function useWorkspace(): WorkspaceApi {
  const [root, setRoot] = useState<FileSystemDirectoryHandle | null>(null);
  const [tree, setTree] = useState<WorkspaceNode[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedFolder, setSelectedFolder] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<FileSystemDirectoryHandle | null>(null);

  const expandedRef = useRef<Set<string>>(new Set());
  const persistReady = useRef(false);

  const loadTree = useCallback(
    async (handle: FileSystemDirectoryHandle, expandedPaths: Set<string>) => {
      const nodes = await scanWorkspace(handle, expandedPaths);
      setTree(nodes);
    },
    [],
  );

  const adopt = useCallback(
    async (handle: FileSystemDirectoryHandle) => {
      setLoading(true);
      setError(null);
      try {
        setRoot(handle);
        setPending(null);
        await idbSet("workspace", handle);
        await loadTree(handle, expandedRef.current);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Gagal membuka folder.");
      } finally {
        setLoading(false);
      }
    },
    [loadTree],
  );

  const openFolder = useCallback(async () => {
    try {
      const handle = await pickWorkspace();
      if (handle) {
        const granted = (await hasPermission(handle)) || (await requestPermission(handle));
        if (!granted) {
          setError("Izin baca-tulis untuk folder ditolak.");
          return;
        }
        await adopt(handle);
      }
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") {
        return;
      }
      setError(cause instanceof Error ? cause.message : "Gagal membuka folder.");
    }
  }, [adopt]);

  const resumeFolder = useCallback(async () => {
    if (!pending) {
      return;
    }
    try {
      const granted = await requestPermission(pending);
      if (!granted) {
        setError("Izin baca-tulis untuk folder ditolak.");
        return;
      }
      await adopt(pending);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal melanjutkan folder.");
    }
  }, [adopt, pending]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [handle, storedExpanded, storedFolder] = await Promise.all([
        idbGet<FileSystemDirectoryHandle>("workspace"),
        idbGet<string[]>("expanded"),
        idbGet<string>("selectedFolder"),
      ]);
      if (cancelled) {
        return;
      }
      if (storedExpanded) {
        const set = new Set(storedExpanded);
        expandedRef.current = set;
        setExpanded(set);
      }
      if (typeof storedFolder === "string") {
        setSelectedFolder(storedFolder);
      }
      persistReady.current = true;
      if (handle) {
        if (await hasPermission(handle)) {
          await adopt(handle);
        } else {
          setPending(handle);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [adopt]);

  useEffect(() => {
    if (persistReady.current) {
      void idbSet("expanded", [...expanded]);
    }
  }, [expanded]);

  useEffect(() => {
    if (persistReady.current) {
      void idbSet("selectedFolder", selectedFolder);
    }
  }, [selectedFolder]);

  const toggleFolder = useCallback(
    async (path: string) => {
      const next = new Set(expandedRef.current);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      expandedRef.current = next;
      setExpanded(next);
      setSelectedFolder(path);
      if (root) {
        try {
          await loadTree(root, next);
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Gagal membaca folder.");
        }
      }
    },
    [loadTree, root],
  );

  const refresh = useCallback(async () => {
    if (!root) {
      return;
    }
    try {
      await loadTree(root, expandedRef.current);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal menyegarkan folder.");
    }
  }, [loadTree, root]);

  const selectFolder = useCallback((path: string) => {
    setSelectedFolder(path);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    root,
    tree,
    expanded,
    selectedFolder,
    loading,
    error,
    canResume: pending !== null,
    openFolder,
    resumeFolder,
    toggleFolder,
    selectFolder,
    refresh,
    clearError,
  };
}
