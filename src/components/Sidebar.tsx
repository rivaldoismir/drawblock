import { useState } from "react";
import type { DragEvent, MouseEvent, ReactNode } from "react";
import {
  ChevronIcon,
  DrawingIcon,
  FolderIcon,
  FolderOpenIcon,
  NoteIcon,
  SearchIcon,
} from "./icons";
import type { SearchResult, WorkspaceNode } from "../types";

const DRAG_TYPE = "application/x-drawblock-path";

interface SidebarProps {
  tree: WorkspaceNode[];
  activePath: string | null;
  selectionPath: string | null;
  expanded: Set<string>;
  selectedFolder: string;
  loading: boolean;
  canResume: boolean;
  query: string;
  results: { names: SearchResult[]; contents: SearchResult[] };
  indexing: boolean;
  indexProgress: { indexed: number; total: number };
  onQueryChange: (value: string) => void;
  onOpenResult: (path: string) => void;
  onOpenFolder: () => void;
  onResumeFolder: () => void;
  onToggleFolder: (path: string) => void;
  onOpenFile: (node: WorkspaceNode) => void;
  onSelectFolder: (path: string) => void;
  onSelectNode: (node: WorkspaceNode | null) => void;
  onRenameRequest: (node: WorkspaceNode) => void;
  onContextMenu: (node: WorkspaceNode | null, event: MouseEvent) => void;
  onDropFile: (filePath: string, folderPath: string) => void;
}

export function Sidebar({
  tree,
  activePath,
  selectionPath,
  expanded,
  selectedFolder,
  loading,
  canResume,
  query,
  results,
  indexing,
  indexProgress,
  onQueryChange,
  onOpenResult,
  onOpenFolder,
  onResumeFolder,
  onToggleFolder,
  onOpenFile,
  onSelectFolder,
  onSelectNode,
  onRenameRequest,
  onContextMenu,
  onDropFile,
}: SidebarProps) {
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const searching = query.trim().length > 0;

  function readDragPath(event: DragEvent): string | null {
    return event.dataTransfer.getData(DRAG_TYPE) || null;
  }

  function handleDrop(event: DragEvent, folderPath: string) {
    event.preventDefault();
    event.stopPropagation();
    setDropTarget(null);
    const filePath = readDragPath(event);
    if (filePath) {
      onDropFile(filePath, folderPath);
    }
  }

  function renderResult(result: SearchResult): ReactNode {
    return (
      <button
        key={`${result.match}:${result.path}`}
        type="button"
        className="result-row"
        title={result.path}
        onClick={() => onOpenResult(result.path)}
      >
        <span className="result-icon">
          {result.kind === "note" ? (
            <NoteIcon size={15} className="icon-note" />
          ) : (
            <DrawingIcon size={15} className="icon-drawing" />
          )}
        </span>
        <span className="result-body">
          <span className="result-name">{result.name}</span>
          {result.folder ? <span className="result-folder">{result.folder}</span> : null}
          {result.snippet ? <span className="result-snippet">{result.snippet}</span> : null}
        </span>
      </button>
    );
  }

  function renderNodes(nodes: WorkspaceNode[], depth: number): ReactNode {
    return nodes.map((node) => {
      if (node.kind === "folder") {
        const open = expanded.has(node.path);
        return (
          <div key={node.path} className="tree-branch">
            <div
              className={[
                "tree-row",
                "folder",
                selectedFolder === node.path ? "selected" : "",
                dropTarget === node.path ? "drop-target" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ paddingLeft: 6 + depth * 14 }}
              onContextMenu={(event) => {
                event.preventDefault();
                onSelectNode(node);
                onContextMenu(node, event);
              }}
              onDragOver={(event) => {
                if (event.dataTransfer.types.includes(DRAG_TYPE)) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDropTarget(node.path);
                }
              }}
              onDragLeave={() =>
                setDropTarget((value) => (value === node.path ? null : value))
              }
              onDrop={(event) => handleDrop(event, node.path)}
            >
              <button
                type="button"
                className="tree-toggle"
                aria-label={open ? "Tutup folder" : "Buka folder"}
                aria-expanded={open}
                onClick={() => void onToggleFolder(node.path)}
              >
                <ChevronIcon open={open} size={13} />
              </button>
              <button
                type="button"
                className="tree-label"
                onClick={() => {
                  onSelectNode(node);
                  onSelectFolder(node.path);
                  if (!open) {
                    void onToggleFolder(node.path);
                  }
                }}
                onDoubleClick={() => onRenameRequest(node)}
              >
                <FolderIcon open={open} size={15} />
                <span className="tree-name">{node.name}</span>
              </button>
            </div>
            {open && node.children ? renderNodes(node.children, depth + 1) : null}
          </div>
        );
      }

      const isActive = activePath === node.path;
      const isSelected = selectionPath === node.path;
      return (
        <button
          key={node.path}
          type="button"
          draggable
          className={[
            "tree-row",
            "file",
            isActive ? "active" : "",
            isSelected && !isActive ? "selected" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ paddingLeft: 6 + depth * 14 + 20 }}
          title={node.path}
          onClick={() => {
            onSelectNode(node);
            void onOpenFile(node);
          }}
          onDoubleClick={() => onRenameRequest(node)}
          onContextMenu={(event) => {
            event.preventDefault();
            onSelectNode(node);
            onContextMenu(node, event);
          }}
          onDragStart={(event) => {
            event.dataTransfer.setData(DRAG_TYPE, node.path);
            event.dataTransfer.effectAllowed = "move";
          }}
        >
          {node.kind === "note" ? (
            <NoteIcon size={15} className="icon-note" />
          ) : (
            <DrawingIcon size={15} className="icon-drawing" />
          )}
          <span className="tree-name">{node.name}</span>
        </button>
      );
    });
  }

  return (
    <aside className="sidebar" aria-label="Workspace">
      <div className="sidebar-top">
        <label className="search-box">
          <SearchIcon size={14} />
          <input
            id="sidebar-search"
            type="search"
            placeholder="Cari nama atau isi…"
            aria-label="Cari file"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="icon-button"
          title="Ganti folder workspace"
          aria-label="Ganti folder workspace"
          onClick={onOpenFolder}
        >
          <FolderOpenIcon size={15} />
        </button>
      </div>

      {searching ? (
        <div className="search-results" role="region" aria-label="Hasil pencarian">
          {indexing ? (
            <p className="sidebar-hint">
              Mengindeks {indexProgress.indexed}/{indexProgress.total} file…
            </p>
          ) : null}
          {results.names.length === 0 &&
          results.contents.length === 0 &&
          !indexing ? (
            <p className="sidebar-hint">Tidak ada hasil untuk “{query.trim()}”.</p>
          ) : null}
          {results.names.length > 0 ? (
            <section className="result-section">
              <h3 className="result-heading">Nama file</h3>
              {results.names.map(renderResult)}
            </section>
          ) : null}
          {results.contents.length > 0 ? (
            <section className="result-section">
              <h3 className="result-heading">Isi catatan</h3>
              {results.contents.map(renderResult)}
            </section>
          ) : null}
        </div>
      ) : (
        <div
          className={`tree${dropTarget === "__root__" ? " drop-root" : ""}`}
          role="tree"
          onContextMenu={(event) => {
            if (event.target === event.currentTarget) {
              event.preventDefault();
              onSelectNode(null);
              onContextMenu(null, event);
            }
          }}
          onDragOver={(event) => {
            if (event.dataTransfer.types.includes(DRAG_TYPE)) {
              event.preventDefault();
              setDropTarget("__root__");
            }
          }}
          onDragLeave={() =>
            setDropTarget((value) => (value === "__root__" ? null : value))
          }
          onDrop={(event) => handleDrop(event, "")}
        >
          {loading ? (
            <p className="sidebar-hint">Memuat folder…</p>
          ) : tree.length === 0 ? (
            <p className="sidebar-hint">
              Folder ini kosong. Klik kanan di sini untuk membuat catatan.
            </p>
          ) : (
            renderNodes(tree, 0)
          )}
        </div>
      )}

      {canResume ? (
        <div className="sidebar-footer">
          <button type="button" className="text-button" onClick={onResumeFolder}>
            Lanjutkan folder terakhir
          </button>
        </div>
      ) : null}
    </aside>
  );
}
