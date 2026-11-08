# Pitfalls — jebakan yang sudah dibayar mahal di dua MVP

## Excalidraw

1. `window.EXCALIDRAW_ASSET_PATH = "/"` di `src/main.tsx` **wajib**. Tanpa itu font diambil dari `https://esm.sh/...` dan offline gagal.
2. Import `@excalidraw/excalidraw/index.css`.
3. Tipe lewat subpath: `@excalidraw/excalidraw/types` (`AppState`, `BinaryFiles`) dan `@excalidraw/excalidraw/element/types` (`ExcalidrawElement`). `.../types/element/types` tidak ada.
4. Serialisasi wajib `serializeAsJSON`; muat wajib `loadFromBlob`. Jangan bangun JSON manual — kompatibilitas excalidraw.com adalah kriteria terima.
5. `initialData` harus referensi stabil (state), bukan objek baru tiap render → kalau tidak, scene di-reset.
6. `sceneSignature` sengaja mengabaikan seleksi/zoom; hanya elemen, daftar `files`, dan appState dokumen (background/grid). Field appState baru yang ingin disimpan harus ditambahkan ke sana.
7. Font disalin `scripts/sync-fonts.mjs` dari `node_modules/@excalidraw/excalidraw/dist/prod/fonts` ke `public/fonts/` (gitignored). Jangan edit/commit hasil salinan.
8. Vite butuh `define: { "process.env.IS_PREACT": "false" }`.
9. Build warning chunk >500 kB adalah normal (Excalidraw ±2 MB). Jangan "perbaiki" dengan manual chunking agresif.
10. PWA hanya bisa diuji `npm run build && npm run preview`; dev server tidak mendaftarkan service worker.

## BlockNote

1. Markdown murni: tanpa frontmatter/metadata. Judul = nama file.
2. Blok aman: paragraf, H1–H3, bullet, bernomor, checklist, kutipan, kode, divider, tabel. Allowlist ada di `EditorPane.tsx`; menambah tipe blok = update allowlist **dan** uji round-trip.
3. Jangan tambah `@blocknote/xl-*`. Versi paket dikunci eksak.
4. Semua konversi lewat `noteCodec.ts`; jangan panggil parser/serializer langsung dari komponen.
5. Setelah load, `onReady(normalizedMarkdown)` menjadi baseline `savedTextRef`. Tanpa ini, BlockNote yang menormalkan `-` → `*` atau `---` → `***` membuat file yang tidak diedit ikut tertulis.
6. `EditorPane` di-remount per file lewat `sessionKey`; rename/move **tidak** boleh menaikkan `sessionKey` (isi editor tidak boleh remount).
7. Autosave: `saveChainRef` menyerialkan tulis; `changeVersionRef` mencegah save yang selesai menghapus status dirty jika user mengetik saat write berlangsung.
8. Locale BlockNote ikut masuk precache (±5 MB). DrawBlock hanya butuh `en`; jangan import semua locale.

## File System Access API

1. Tulis lewat `createWritable()` (atomik), bukan stream manual.
2. Cek `lastModified` sebelum menimpa; jangan menimpa diam-diam.
3. `move()` tidak universal → fallback copy+delete, rekursif untuk folder.
4. Izin folder hanya bisa diminta dari gesture user; jangan `requestPermission` saat startup.
5. Handle folder disimpan di IndexedDB; File System Access handle bisa diserialisasi, tapi izin tetap perlu dipinta ulang.
6. Nama bentrok: `New N` memakai nomor terkecil yang belum dipakai **per ekstensi**.
7. Filter: sembunyikan nama berawalan titik dan `node_modules`; hanya `.md` dan `.excalidraw` yang tampil.
8. `visibilitychange` + `pagehide` (bukan hanya `beforeunload`) untuk flush yang andal di Chrome.

## Integrasi dua pustaka

1. Render tiap editor di kontainer terpisah; jangan berbagi root CSS. BlockNote memakai Mantine; Excalidraw membawa CSS sendiri. Verifikasi visual di Plan 01-01.
2. Jangan mount dua editor berat sekaligus tanpa alasan: `key` remount + lazy Excalidraw.
3. React 19.3.1 dipakai kedua paket; jangan biarkan npm memasang dua salinan React.
4. TypeScript: BlockNote 0.57 memakai TS 7.0.2, Excalidraw 0.18.1 memakai 5.9.3. Coba 7.0.2 lebih dulu; jika tipe Excalidraw gagal, turunkan ke 5.9.3 untuk seluruh proyek (jangan dua versi TS).
5. `import` Excalidraw di top-level membuat bundle awal ±2 MB; gunakan `React.lazy` + `Suspense` (fase 6).

## Tautan catatan → gambar

1. Tautan harus Markdown standar: `[Nama](rel/path.excalidraw)`, spasi → `%20`, tanpa metadata.
2. Resolusi relatif terhadap folder catatan, bukan root workspace.
3. Intersepsi klik hanya untuk href yang resolve ke file `.excalidraw` di workspace; jangan ganggu `http(s)://`.
4. Jangan mengubah teks tautan saat target hilang — cukup pemberitahuan.
5. `preventDefault()` wajib untuk tautan relatif; jika tidak, browser mencoba membuka `file://`/404.
