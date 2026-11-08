# Reuse Map — dari dua MVP ke DrawBlock

Sumber (read-only, jangan diubah):

- `C:\Users\netda\Desktop\PROJECT\blocknote-mvp1` (BlokCatat, 966 baris `App.tsx`)
- `C:\Users\netda\Desktop\PROJECT\excelidraw-mvp1` (ExcaliFolder, 936 baris `App.tsx`)

Target: `C:\Users\netda\Desktop\PROJECT\drawblock`

## Prinsip

1. **Port, bukan copy buta.** Kedua `App.tsx` adalah orkestrasi monolitik untuk satu jenis file; DrawBlock butuh satu orkestrasi untuk dua jenis. Ambil polanya, tulis ulang `App.tsx`.
2. **Satu pemilik per lapisan.** `lib/fs.ts` hanya dari `blocknote` `fsService.ts` + tambahan `moveAsset` dari `excalidraw/lib/fs.ts`; jangan gabungkan dua implementasi tulis file.
3. **Jangan ubah proyek sumber.** Semua penyesuaian terjadi di `drawblock`.

## Peta file

| Target DrawBlock | Sumber utama | Bagian yang dipakai | Perubahan wajib |
|---|---|---|---|
| `src/lib/path.ts` | `blocknote/src/services/fsService.ts` (joinPath, parentPath, baseName, isHiddenName, validateEntryName, isInsidePath) + `excalidraw/src/lib/path.ts` (withExcalidrawExtension, splitPath, dirname, basename) | Util path relatif `/` | Tambah `isNoteFile`, `isDrawingFile`, `nextAvailableName(existing, ext)` |
| `src/lib/fs.ts` | `blocknote/src/services/fsService.ts` (473) | `scanWorkspace`, `flattenNotes`, `findNode`, `countNotes`, `pickWorkspace`, `ensurePermission`, `readTextFile`, `writeTextFile`, `getFileByPath`, `getDirectoryByPath`, `createNote`, `createFolder`, `renameEntry`, `deleteEntry`, `moveFile`, `moveFileAsCopy`, `replaceFileWithMove`, `ConflictError` | Terima dua ekstensi; `createEntry(ext)` generik; `scanWorkspace` set `kind: "note" \| "drawing"`; tambah `resolveEntry(path)` |
| `src/lib/fs.ts` (tulis/move) | `excalidraw/src/lib/fs.ts` (237) | `writeTextFile` via `createWritable`, `moveEntry` fallback copy+delete, `resolveDirectory`, `resolveFileHandle`, `entryExists`, `isVisibleEntry`, permission helpers | Pakai versi `excalidraw` untuk move (lebih lengkap), versi `blocknote` untuk tree/scan |
| `src/lib/scene.ts` | `excalidraw/src/lib/scene.ts` (38) | `loadScene`, `serializeScene`, `sceneSignature`, `createEmptySceneJSON` | Tanpa perubahan; `sceneSignature` wajib abaikan viewport/seleksi |
| `src/lib/persistence.ts` | `blocknote/src/services/persistence.ts` + `excalidraw/src/lib/persistence.ts` | `idbGet/idbSet/idbDelete`, session | Key: `workspace`, `lastFile`, `expanded`, `selectedFolder`; `sidebarCollapsed` di localStorage |
| `src/services/autosave.ts` | `blocknote/src/services/autosave.ts` (28) | `Autosave` class | Tanpa perubahan |
| `src/services/noteCodec.ts` | `blocknote/src/services/noteCodec.ts` (39) | `parseMarkdown`, `serializeMarkdown` | Tanpa perubahan; tetap satu-satunya pintu konversi |
| `src/services/searchIndex.ts` | `blocknote/src/services/searchIndex.ts` (207) | `SearchIndex` (build, upsert, remove, removePrefix, rename, renamePrefix, search), `snippetFor` | Entri gambar: `text: ""` dan jangan baca file; hasil diberi `kind`; urutan nama dulu lalu isi |
| `src/services/linkTarget.ts` | **baru** | — | `encodeHref`, `decodeHref`, `resolveHref(noteDir, href)` → `{kind:"drawing"|"note"|"external"|"invalid", path}` |
| `src/hooks/useWorkspace.ts` | **baru** (ekstrak dari dua `App.tsx`) | lifecycle folder, tree, CRUD, expanded, selected folder | State folder/tree + operasi |
| `src/hooks/useSaveQueue.ts` | **baru** (pola dari dua `App.tsx`) | `saveChainRef`, `changeVersionRef`, status, `lastModified` | Per file: `Map<path, Promise>`; flush semua |
| `src/editors/NoteEditor.tsx` | `blocknote/src/components/EditorPane.tsx` (166) | `useCreateBlockNote`, allowlist slash/format, `onReady` baseline, `formattingToolbar`/`slashMenu`/`sideMenu` controller | Tambah `onOpenLink` (intersepsi klik) + item slash "Tautan ke gambar"; tanpa blok kustom |
| `src/editors/DrawingEditor.tsx` | `excalidraw/src/components/EditorPane.tsx` (35) + `App.tsx` bagian mount | `Excalidraw` + `initialData` stabil, theme | Lazy-load di fase 6; `key` remount di parent |
| `src/components/Sidebar.tsx` | `blocknote/src/components/Sidebar.tsx` (497) + `excalidraw/src/components/Sidebar.tsx` (386) | pohon, ikon, drag-drop, search list, context menu | Dua ikon; folder tidak bisa diseret; search dua seksi |
| `src/components/Toolbar.tsx` | `excalidraw/src/components/Toolbar.tsx` (111) | nama file, save status, tombol sidebar | Tambah tombol Catatan Baru/Gambar Baru |
| `src/components/Dialogs.tsx` | `excalidraw/src/components/Dialogs.tsx` (181) + `blocknote/src/components/ConflictDialog.tsx` | new/rename/delete/konflik | Gabung; tambah dialog drag-drop (Ganti/Simpan keduanya/Batal) |
| `src/components/ContextMenu.tsx` | `excalidraw/src/components/ContextMenu.tsx` (105) | menu klik kanan | Rename/Hapus/Buka |
| `src/components/EmptyState.tsx` | `excalidraw/src/components/EmptyState.tsx` (80) | state folder kosong | Teks dua jenis file |
| `src/components/icons.tsx` | `blocknote/src/components/icons.tsx` (141) | ikon catatan/folder/aksi | Tambah ikon gambar |
| `src/App.tsx` | `blocknote/src/App.tsx` + `excalidraw/src/App.tsx` | dialog state machine, shortcut, flush, error handling | Tulis ulang sebagai komposisi hooks + DialogHost |
| `scripts/sync-fonts.mjs` | `excalidraw/scripts/sync-fonts.mjs` | copy font Excalidraw | Tanpa perubahan |
| `vite.config.ts` | `excalidraw/vite.config.ts` | PWA, define `IS_PREACT`, precache globs, asset limit | Tambah aset Mantine/BlockNote; locale BlockNote hanya `en` |
| `src/main.tsx` | `excalidraw/src/main.tsx` | `EXCALIDRAW_ASSET_PATH = "/"` | Tambah import CSS BlockNote/Mantine + app.css |

## Yang TIDAK diangkat

| Kandidat | Alasan |
|---|---|
| `excalidraw/src/lib/fs.ts::searchWorkspace` | DrawBlock memakai `SearchIndex` di memori, bukan scan disk per pencarian |
| `blocknote/src/services/fsService.ts` `isMarkdownFile` | Diganti `isNoteFile` + `isDrawingFile` |
| Blok kustom / `toExternalHTML` | Tidak ada gambar tersisip |
| Overlay editor | Tidak ada |
| Pratinjau SVG / `exportToSvg` | Tidak ada |
| `xl-*` | Lisensi |

## Dependency pins

```json
{
  "@blocknote/core": "0.57.0",
  "@blocknote/mantine": "0.57.0",
  "@blocknote/react": "0.57.0",
  "@excalidraw/excalidraw": "0.18.1",
  "react": "19.3.1",
  "react-dom": "19.3.1",
  "vite": "8.3.6",
  "vite-plugin-pwa": "2.0.0",
  "@vitejs/plugin-react": "6.2.1",
  "typescript": "7.0.2 (fallback 5.9.3)",
  "vitest": "latest stabil yang cocok dengan Vite 8",
  "jsdom": "latest stabil"
}
```

`@excalidraw/excalidraw@0.18.1` peer deps: `react ^17 || ^18 || ^19`, `react-dom ^17 || ^18 || ^19` — React 19.3.1 valid.
