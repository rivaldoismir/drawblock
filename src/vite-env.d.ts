/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Window {
  /** File System Access API — Chrome / Edge only. */
  showDirectoryPicker?: (options?: {
    id?: string;
    mode?: "read" | "readwrite";
    startIn?: string;
  }) => Promise<FileSystemDirectoryHandle>;
  /** Serve Excalidraw fonts/assets locally instead of the esm.sh CDN. */
  EXCALIDRAW_ASSET_PATH?: string;
  /** Value written to the `source` field of saved `.excalidraw` files. */
  EXCALIDRAW_EXPORT_SOURCE?: string;
}
