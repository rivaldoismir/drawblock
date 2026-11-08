import type { SaveStatus } from "../types";

interface ToolbarProps {
  fileName: string | null;
  status: SaveStatus;
  error: string | null;
  hasRoot: boolean;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onOpenFolder: () => void;
  onNewNote: () => void;
  onNewDrawing: () => void;
  onNewFolder: () => void;
}

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "",
  saving: "Menyimpan…",
  saved: "Tersimpan",
  error: "Gagal menyimpan",
};

export function Toolbar({
  fileName,
  status,
  error,
  hasRoot,
  sidebarCollapsed,
  onToggleSidebar,
  onOpenFolder,
  onNewNote,
  onNewDrawing,
  onNewFolder,
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <button
          type="button"
          className="icon-button"
          title={sidebarCollapsed ? "Tampilkan sidebar (Ctrl+B)" : "Lipat sidebar (Ctrl+B)"}
          aria-label={sidebarCollapsed ? "Tampilkan sidebar" : "Lipat sidebar"}
          onClick={onToggleSidebar}
        >
          {sidebarCollapsed ? "»" : "«"}
        </button>
        <span className="brand">DrawBlock</span>
        {hasRoot ? (
          <>
            <button type="button" className="secondary-button compact" onClick={onNewNote}>
              Catatan Baru
            </button>
            <button
              type="button"
              className="secondary-button compact"
              onClick={onNewDrawing}
            >
              Gambar Baru
            </button>
            <button
              type="button"
              className="secondary-button compact"
              onClick={onNewFolder}
            >
              Folder Baru
            </button>
            <button type="button" className="text-button" onClick={onOpenFolder}>
              Buka folder lain
            </button>
          </>
        ) : null}
      </div>
      <div className="toolbar-center">
        <span className="file-name" title={fileName ?? undefined}>
          {fileName ?? "Belum ada file terbuka"}
        </span>
      </div>
      <div className="toolbar-right">
        {STATUS_LABEL[status] ? (
          <span
            className={`save-status status-${status}`}
            role="status"
            title={error ?? undefined}
          >
            {STATUS_LABEL[status]}
          </span>
        ) : null}
      </div>
    </header>
  );
}
