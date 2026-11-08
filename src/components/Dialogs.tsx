import { useEffect, useState } from "react";
import {
  APP_CONTRIBUTING_URL,
  APP_ISSUES_URL,
  APP_LICENSE,
  APP_REPO_URL,
  APP_VERSION,
  BLOCKNOTE_CONTRIBUTING_URL,
  BLOCKNOTE_REPO_URL,
  EXCALIDRAW_CONTRIBUTING_URL,
  EXCALIDRAW_REPO_URL,
} from "../lib/appInfo";

interface ConflictDialogProps {
  path: string;
  onOverwrite: () => void;
  onReload: () => void;
}

export function ConflictDialog({ path, onOverwrite, onReload }: ConflictDialogProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="conflict-title">
        <h2 id="conflict-title">File berubah di luar DrawBlock</h2>
        <p>
          <code>{path}</code> diubah aplikasi lain sejak terakhir dibuka. Pilih
          cara menyelesaikan agar tidak ada data yang tertimpa diam-diam.
        </p>
        <div className="modal-actions">
          <button type="button" className="primary-button" onClick={onOverwrite}>
            Timpa dengan versi ini
          </button>
          <button type="button" className="secondary-button" onClick={onReload}>
            Muat ulang dari disk
          </button>
        </div>
      </div>
    </div>
  );
}

interface RenameDialogProps {
  title: string;
  initialValue: string;
  error: string | null;
  onCancel: () => void;
  onSubmit: (value: string) => void;
}

export function RenameDialog({
  title,
  initialValue,
  error,
  onCancel,
  onSubmit,
}: RenameDialogProps) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="modal-backdrop">
      <form
        className="modal"
        role="dialog"
        aria-modal="true"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(value);
        }}
      >
        <h2>{title}</h2>
        <label className="field">
          <span>Nama baru</span>
          <input
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onFocus={(event) => {
              const dot = event.currentTarget.value.lastIndexOf(".");
              event.currentTarget.setSelectionRange(
                0,
                dot > 0 ? dot : event.currentTarget.value.length,
              );
            }}
          />
        </label>
        {error ? <p className="field-error">{error}</p> : null}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Batal
          </button>
          <button type="submit" className="primary-button">
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
}

interface DeleteDialogProps {
  name: string;
  kind: "file" | "folder";
  count: number | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteDialog({
  name,
  kind,
  count,
  onCancel,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <h2 id="delete-title">Hapus permanen?</h2>
        <p>
          <code>{name}</code>
          {kind === "folder"
            ? ` adalah folder${count === null ? "" : ` berisi ${count} file`}. Semua isinya akan dihapus.`
            : " akan dihapus dari disk."}{" "}
          Tindakan ini tidak bisa dibatalkan dan tidak ada folder sampah.
        </p>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Batal
          </button>
          <button type="button" className="danger-button" onClick={onConfirm}>
            Hapus permanen
          </button>
        </div>
      </div>
    </div>
  );
}

interface MoveConflictDialogProps {
  name: string;
  folder: string;
  onReplace: () => void;
  onKeepBoth: () => void;
  onCancel: () => void;
}

export function MoveConflictDialog({
  name,
  folder,
  onReplace,
  onKeepBoth,
  onCancel,
}: MoveConflictDialogProps) {
  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="move-title">
        <h2 id="move-title">Nama sudah ada di folder tujuan</h2>
        <p>
          <code>{name}</code> sudah ada di <code>{folder || "akar workspace"}</code>.
          Pilih cara memindahkan file ini.
        </p>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Batal
          </button>
          <button type="button" className="secondary-button" onClick={onReplace}>
            Ganti
          </button>
          <button type="button" className="primary-button" onClick={onKeepBoth}>
            Simpan keduanya
          </button>
        </div>
      </div>
    </div>
  );
}

interface DrawingOption {
  path: string;
  name: string;
  folder: string;
}

interface DrawingPickerDialogProps {
  drawings: DrawingOption[];
  onSelect: (path: string) => void;
  onCancel: () => void;
}

export function DrawingPickerDialog({
  drawings,
  onSelect,
  onCancel,
}: DrawingPickerDialogProps) {
  const [filter, setFilter] = useState("");
  const needle = filter.trim().toLowerCase();
  const visible = needle
    ? drawings.filter(
        (item) =>
          item.name.toLowerCase().includes(needle) ||
          item.folder.toLowerCase().includes(needle),
      )
    : drawings;

  return (
    <div className="modal-backdrop">
      <div className="modal picker" role="dialog" aria-modal="true" aria-labelledby="picker-title">
        <h2 id="picker-title">Pilih gambar Excalidraw</h2>
        <label className="field">
          <span>Filter</span>
          <input
            autoFocus
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Nama atau folder…"
          />
        </label>
        <div className="picker-list">
          {visible.length === 0 ? (
            <p className="picker-empty">
              {drawings.length === 0
                ? "Belum ada gambar di workspace. Buat lewat tombol Sketsa Baru."
                : "Tidak ada gambar yang cocok."}
            </p>
          ) : (
            visible.map((item) => (
              <button
                key={item.path}
                type="button"
                className="picker-row"
                onClick={() => onSelect(item.path)}
              >
                <span className="picker-name">{item.name}</span>
                {item.folder ? <span className="picker-folder">{item.folder}</span> : null}
              </button>
            ))
          )}
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

interface ContextMenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function AboutDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <div
        className="modal about-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
      >
        <div className="about-head">
          <img src="/icon.svg" alt="" width={44} height={44} />
          <div>
            <h2 id="about-title">DrawBlock</h2>
            <p className="about-version">
              Versi {APP_VERSION} · Lisensi {APP_LICENSE}
            </p>
          </div>
        </div>

        <p>
          Workspace lokal untuk catatan Markdown dan sketsa Excalidraw. Tidak
          ada akun, cloud, atau unggahan: semua file tetap di folder pilihan
          Anda.
        </p>

        <div className="about-grid">
          <section className="about-card">
            <div className="about-card-head">
              <h3>Excalidraw</h3>
              <span className="about-badge">MIT</span>
            </div>
            <p>Kanvas sketsa dan diagram yang dipakai untuk file .excalidraw.</p>
            <div className="about-links">
              <a href={EXCALIDRAW_REPO_URL} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a
                href={EXCALIDRAW_CONTRIBUTING_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Berkontribusi
              </a>
            </div>
          </section>

          <section className="about-card">
            <div className="about-card-head">
              <h3>BlockNote</h3>
              <span className="about-badge">MPL-2.0</span>
            </div>
            <p>Editor blok yang menyimpan catatan sebagai Markdown murni.</p>
            <div className="about-links">
              <a href={BLOCKNOTE_REPO_URL} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
              <a
                href={BLOCKNOTE_CONTRIBUTING_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Berkontribusi
              </a>
            </div>
          </section>
        </div>

        <div className="about-links about-links-main">
          <a href={APP_REPO_URL} target="_blank" rel="noopener noreferrer">
            Repo DrawBlock
          </a>
          <a href={APP_CONTRIBUTING_URL} target="_blank" rel="noopener noreferrer">
            Kontribusi
          </a>
          <a href={APP_ISSUES_URL} target="_blank" rel="noopener noreferrer">
            Laporkan bug
          </a>
        </div>

        <div className="modal-actions">
          <button type="button" className="primary-button" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  useEffect(() => {
    const close = () => onClose();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("click", close);
    window.addEventListener("resize", close);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="context-menu"
      style={{ left: x, top: y }}
      role="menu"
      onClick={(event) => event.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          role="menuitem"
          className={`context-item${item.danger ? " danger" : ""}`}
          disabled={item.disabled}
          onClick={() => {
            item.onSelect();
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
