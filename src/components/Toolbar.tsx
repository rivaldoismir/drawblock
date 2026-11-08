import { InfoIcon, MoonIcon, SunIcon } from "./icons";
import type { SaveStatus } from "../types";
import type { Theme } from "../hooks/useTheme";

interface ToolbarProps {
  fileName: string | null;
  status: SaveStatus;
  error: string | null;
  hasRoot: boolean;
  sidebarCollapsed: boolean;
  theme: Theme;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  onNewNote: () => void;
  onNewDrawing: () => void;
  onNewFolder: () => void;
  onAbout: () => void;
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
  theme,
  onToggleTheme,
  onToggleSidebar,
  onNewNote,
  onNewDrawing,
  onNewFolder,
  onAbout,
}: ToolbarProps) {
  const label = STATUS_LABEL[status];

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
              Sketsa Baru
            </button>
            <button
              type="button"
              className="secondary-button compact"
              onClick={onNewFolder}
            >
              Folder Baru
            </button>
          </>
        ) : null}
      </div>
      <div className="toolbar-center">
        <span className="file-name" title={fileName ?? undefined}>
          {fileName ?? "Belum ada file terbuka"}
        </span>
        {fileName && label ? (
          <span
            className={`save-status status-${status}`}
            role="status"
            title={error ?? undefined}
          >
            <span className="status-dot" aria-hidden="true" />
            {label}
          </span>
        ) : null}
        <button
          type="button"
          className="icon-button"
          title={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
          aria-label={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
          onClick={onToggleTheme}
        >
          {theme === "dark" ? <SunIcon size={15} /> : <MoonIcon size={15} />}
        </button>
        <button
          type="button"
          className="icon-button"
          title="Tentang DrawBlock"
          aria-label="Tentang DrawBlock"
          onClick={onAbout}
        >
          <InfoIcon size={15} />
        </button>
      </div>
    </header>
  );
}
