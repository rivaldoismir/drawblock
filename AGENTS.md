# AGENTS.md

## What this is

DrawBlock: PWA lokal (Chrome/Edge) yang membuka satu folder sebagai workspace.
File `.md` diedit dengan BlockNote, file `.excalidraw` dengan Excalidraw, dan
catatan dapat menautkan gambar lewat tautan Markdown standar (tanpa pratinjau
atau blok kustom).

Sumber kebenaran produk: `PRD.md` + `.planning/PROJECT.md`. **Catatan penting:**
keputusan user 2026-11-08 membatalkan gambar tersisip/pratinjau/overlay (PRD
F15–F19, F23–F25). Jangan menambahkannya kembali tanpa keputusan baru.

## Commands

```bash
npm install
npm run dev        # Vite di :5173; sw tidak aktif
npm run typecheck  # tsc -b
npm run test       # Vitest (logika murni)
npm run build      # tsc -b + vite build + Workbox precache
npm run preview    # :4173 — wajib untuk uji PWA/offline
npm run sync:fonts # manual; otomatis lewat predev/prebuild
```

Tidak ada E2E otomatis. UI diverifikasi manual di Chrome/Edge; harness CDP +
override `window.showDirectoryPicker` ke OPFS dipakai saat pengembangan.

## Non-negotiable rules

- **Markdown murni.** Tanpa frontmatter/metadata/sintaks khusus. Judul = nama file.
- **Blok aman saja.** Allowlist di `src/editors/NoteEditor.tsx`
  (`ALLOWED_SLASH_TITLES`, `ALLOWED_SELECT_TYPES`). Menambah tipe blok = update
  allowlist **dan** uji round-trip.
- **Jangan tambah `@blocknote/xl-*`** (GPL-3.0/komersial). Versi paket dikunci eksak.
- **Semua konversi Markdown ↔ blok lewat `src/services/noteCodec.ts`.**
- **Simpan scene dengan `serializeAsJSON`, muat dengan `loadFromBlob`.** Jangan
  membangun JSON Excalidraw manual.
- **Tulis file lewat `createWritable()`** (`src/lib/fs.ts`), bukan stream manual.
- **Cek `lastModified` sebelum menimpa**; konflik → dialog Timpa/Muat ulang,
  jangan pernah menimpa diam-diam.
- **Autosave** lewat `SaveQueue` (`src/services/saveQueue.ts`): debounce 1,2 dtk
  (catatan) / 1,5 dtk (gambar), rantai tulis per path, flush saat pindah file,
  `visibilitychange`, `pagehide`, `beforeunload`.
- **Jangan pernah memanggil `queue.dispose()` di cleanup `useEffect`.** React
  StrictMode (dev) menjalankan cleanup tepat setelah setup; antrean akan mati
  permanen dan status tersangkut di "Menyimpan…". `SaveQueue` hidup selama
  aplikasi.
- **Jangan remount editor saat rename/move.** `EditorHost` memakai
  `sessionId` + `nonce`, bukan path. Remount hanya saat membuka file lain atau
  "muat ulang dari disk".
- **Baseline Markdown** (`onReady`) dipertahankan agar BlockNote yang
  menormalkan `-` → `*` / `---` → `***` tidak menulis file yang tidak diedit.
- **Offline penuh.** Tanpa request eksternal, tanpa analytics, font lokal.
- **Tema default terang.** Mode gelap hanya lewat tombol toggle di toolbar,
  disimpan di `localStorage` (`drawblock:theme`). Jangan kembali ke
  `prefers-color-scheme` otomatis.
- **Hanya Chrome/Edge.** Jangan tambah polyfill Firefox/Safari.
- **Jangan fork/vendor** BlockNote atau Excalidraw.

## Toolchain quirks

- `window.EXCALIDRAW_ASSET_PATH = "/"` di `src/main.tsx` **wajib**; tanpa itu
  font diambil dari `esm.sh` dan offline gagal.
- `define: { "process.env.IS_PREACT": "false" }` di `vite.config.ts` wajib.
- Tipe Excalidraw lewat subpath: `@excalidraw/excalidraw/types` dan
  `@excalidraw/excalidraw/element/types`.
- CSS Excalidraw diimpor di `DrawingEditorImpl.tsx` (modul lazy), bukan di
  `main.tsx`, agar tidak masuk bundle awal.
- `DrawingEditor` = `React.lazy`; chunk Excalidraw hanya dimuat saat file gambar
  pertama dibuka.
- Font Excalidraw disalin `scripts/sync-fonts.mjs` ke `public/fonts/`
  (gitignored, ~20 MB). Jangan edit/commit hasil salinan.
- PWA hanya bisa diuji lewat `build` + `preview`; `devOptions` sengaja mati.
- Warning chunk >500 kB normal (BlockNote + Excalidraw). Precache ±25 MB.

## Layout

- `src/App.tsx` — orkestrasi: workspace, antrean simpan, dialog, menu konteks,
  shortcut, tautan, indeks pencarian.
- `src/lib/fs.ts` — File System Access API: scan, CRUD, move (fallback
  copy+delete), permission, `collectFiles` untuk indeks.
- `src/lib/path.ts` — path relatif, validasi nama, `nextAvailableName` per ekstensi.
- `src/lib/scene.ts` — load/save/signature scene; UI-agnostic.
- `src/lib/persistence.ts` — IndexedDB (`workspace`, `lastFile`, `expanded`,
  `selectedFolder`).
- `src/hooks/useWorkspace.ts` — state pohon + sesi; baca direktori malas.
- `src/services/saveQueue.ts` — antrean/debounce/konflik (diuji Vitest).
- `src/services/searchIndex.ts` — nama (2 jenis) + isi catatan; `.excalidraw`
  tidak pernah dibaca isinya.
- `src/services/linkTarget.ts` — encode/resolve href relatif; menolak jalur
  keluar workspace.
- `src/editors/` — `NoteEditor` (BlockNote + picker tautan), `DrawingEditor`
  (lazy wrapper), `DrawingEditorImpl` (mount Excalidraw), `EditorHost`.
- `src/components/` — Sidebar, Toolbar, Dialogs, EmptyState, icons.
- `.planning/` — GSD: PROJECT, REQUIREMENTS, ROADMAP, STATE, phases, verification.

## Verification checklist

1. `npm run typecheck && npm run test && npm run build`.
2. `npm run preview` → Chrome: buka folder berisi `.md`, `.excalidraw`, subfolder,
   `node_modules` → hanya file yang didukung tampil.
3. Ketik di catatan → tunggu ~2 dtk → buka `.md` di Notepad. Gambar → tunggu
   ~2 dtk → zoom saja tidak boleh mengubah `lastModified`.
4. Rename (F2/klik kanan/dua klik), drag ke subfolder, konflik nama, hapus
   permanen → tercermin di disk; file yang sedang terbuka tidak remount.
5. Cari nama gambar + isi catatan → dua daftar terpisah; isi `.excalidraw`
   tidak pernah muncul.
6. Sisip tautan lewat `/` → *Tautan ke gambar*; file `.md` berisi
   `[Nama](path.excalidraw)`; klik tautan membuka editor gambar.
7. DevTools → Offline → reload → workspace terakhir pulih dan bisa diedit.
8. Tutup tab 2 dtk setelah edit → tidak ada data hilang.
