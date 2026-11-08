interface EmptyStateProps {
  error: string | null;
  canResume: boolean;
  onOpenFolder: () => void;
  onResumeFolder: () => void;
  onClearError: () => void;
}

export function EmptyState({
  error,
  canResume,
  onOpenFolder,
  onResumeFolder,
  onClearError,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-card">
        <h1>DrawBlock</h1>
        <p>
          Satu folder untuk catatan Markdown dan gambar Excalidraw. Semua file
          tetap di disk Anda, berformat standar, dan bisa dibuka aplikasi lain.
        </p>
        {error ? (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button type="button" className="text-button" onClick={onClearError}>
              Tutup
            </button>
          </div>
        ) : null}
        <div className="empty-actions">
          <button type="button" className="primary-button" onClick={onOpenFolder}>
            Buka Folder
          </button>
          {canResume ? (
            <button type="button" className="secondary-button" onClick={onResumeFolder}>
              Lanjutkan folder terakhir
            </button>
          ) : null}
        </div>
        <p className="empty-note">
          Gunakan Chrome atau Edge. Izin baca-tulis hanya diminta saat Anda membuka
          folder.
        </p>
      </div>
    </div>
  );
}
