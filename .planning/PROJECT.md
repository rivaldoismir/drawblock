# DrawBlock

## What This Is

DrawBlock adalah PWA lokal (Chrome/Edge) yang membuka satu folder proyek sebagai workspace: catatan `.md` diedit dengan BlockNote, gambar `.excalidraw` diedit dengan Excalidraw, dan catatan dapat menautkan file gambar lewat tautan Markdown biasa. Satu pengguna, satu komputer, tanpa cloud, tanpa kolaborasi.

## Core Value

Satu folder, dua editor, file standar yang tetap milik pengguna — buka folder, klik file, langsung edit, tersimpan otomatis tanpa tombol simpan.

## Requirements

### Validated

- ✓ MVP 1 (2026-11-08) — 27 requirement aktif terverifikasi; lihat `.planning/verification/REPORT.md`.

### Active

### Active

- [x] **WS-01**: User dapat membuka folder sebagai workspace (baca-tulis) lewat File System Access API
- [x] **WS-02**: Aplikasi mengingat folder terakhir dan file terakhir, serta meminta ulang izin dengan satu klik
- [x] **SIDE-01**: Sidebar menampilkan pohon folder, `.md`, dan `.excalidraw` dengan ikon berbeda; file lain, entri berawalan titik, dan `node_modules` disembunyikan
- [x] **SIDE-02**: Klik file membuka editor sesuai ekstensi; file aktif ditandai
- [x] **SIDE-03**: Pencarian di sidebar menggantikan pohon dengan daftar hasil terpisah selama ada kata kunci
- [x] **SIDE-04**: Sidebar dapat dilipat dan statusnya diingat (P1)
- [x] **EDIT-01**: Editor catatan BlockNote dengan slash menu, toolbar format, drag blok, indentasi, daftar centang
- [x] **EDIT-02**: Catatan disimpan sebagai Markdown murni tanpa metadata; hanya blok/format yang aman bolak-balik yang ditawarkan
- [x] **EDIT-03**: Editor gambar Excalidraw memuat/menyimpan JSON standar memakai fungsi bawaan pustaka
- [x] **EDIT-04**: Excalidraw dimuat malas saat pertama dibutuhkan (P1)
- [x] **FILE-01**: Catatan Baru membuat `New 1.md`, `New 2.md`, dst. (nomor terkecil yang belum dipakai) di folder terpilih/akar, kursor langsung di editor
- [x] **FILE-02**: Gambar Baru membuat `New 1.excalidraw`, `New 2.excalidraw`, dst. dengan penomoran terpisah dari catatan, kanvas langsung siap
- [x] **FILE-03**: User dapat membuat subfolder
- [x] **FILE-04**: Ganti nama file/folder lewat klik kanan, F2, atau klik dua kali; ekstensi dipertahankan; nama bentrok ditolak
- [x] **FILE-05**: Hapus permanen dengan dialog konfirmasi (folder menyebut jumlah isi); tanpa folder `.trash`
- [x] **FILE-06**: Drag file ke folder di sidebar memindahkannya di disk; nama bentrok memunculkan Ganti / Simpan keduanya / Batal
- [x] **SAVE-01**: Autosave kedua jenis file, debounce 1–2 detik, hanya saat isi berubah
- [x] **SAVE-02**: Indikator status Tersimpan / Menyimpan… / Gagal di toolbar
- [x] **SAVE-03**: Simpan paksa saat berpindah file dan saat tab ditutup/disembunyikan
- [x] **SAVE-04**: Peringatan bila file diubah dari luar sejak dibuka (cek `lastModified` sebelum menulis) (P1)
- [x] **SRCH-01**: Indeks nama file (kedua jenis) dan isi catatan dibangun di latar belakang dan diperbarui saat simpan/buat/ganti nama/pindah/hapus
- [x] **SRCH-02**: Hasil pencarian berupa dua daftar terpisah — nama file (kedua jenis, tanpa isi gambar) dan isi catatan (dengan cuplikan); klik hasil membuka file
- [x] **LINK-01**: User dapat menyisipkan tautan Markdown standar ke file `.excalidraw` dari catatan (tanpa blok/pratinjau kustom)
- [x] **LINK-02**: Klik tautan `.excalidraw` di catatan membuka gambar itu di editor; tautan rusak memberi pemberitahuan tanpa menghapus teks tautan
- [x] **PWA-01**: Berjalan offline setelah kunjungan pertama dan dapat dipasang sebagai PWA
- [x] **PWA-02**: Semua font/aset dilayani lokal; tidak ada permintaan jaringan keluar dan tanpa analytics
- [x] **PWA-03**: Tema default terang dengan toggle mode gelap yang diingat (P1)

### Out of Scope

- Gambar tersisip / pratinjau SVG / overlay editor di dalam catatan — keputusan user 2026-11-08: catatan murni teks + tautan agar sederhana
- Blok kustom BlockNote dan konversi `toExternalHTML` — tidak diperlukan tanpa gambar tersisip
- Pembaruan tautan otomatis saat gambar diganti nama/dipindah (F23) — tidak ada tautan tersemat yang perlu dijaga
- Pencarian teks di dalam elemen gambar (F24) — pencarian gambar cukup nama file (keputusan user)
- Edit keterangan gambar / tombol "Buka di panel" (F25) — tidak ada keterangan karena tidak ada blok gambar
- Kolaborasi real-time, sinkronisasi cloud, aplikasi mobile, Firefox/Safari — PRD §4
- Backlink, graf, tag, database, tautan antar catatan (tingkat 3) — PRD §4/§14
- AI, ekspor DOCX/PDF, kolom berdampingan (`@blocknote/xl-*`), template, pintasan global — PRD §4
- Mengubah/mem-fork kode sumber BlockNote atau Excalidraw — PRD §3 prinsip 4

## Context

Proyek baru di `C:\Users\netda\Desktop\PROJECT\drawblock` (sebelumnya hanya `PRD.md`). Dua MVP yang sudah selesai menjadi sumber kode dan pelajaran:

- `C:\Users\netda\Desktop\PROJECT\blocknote-mvp1` — BlokCatat: BlockNote + fsService + autosave + searchIndex + Sidebar + persistence.
- `C:\Users\netda\Desktop\PROJECT\excelidraw-mvp1` — ExcaliFolder: Excalidraw + scene codec + tulis atomik + PWA/fonts + Toolbar/ContextMenu/Dialogs.

Peta reuse lengkap: `.planning/research/REUSE-MAP.md`. Jebakan teknis: `.planning/research/PITFALLS.md`.

Keputusan user 2026-11-08 (menjawab PRD §15):

1. Penomoran `New N` terpisah per jenis file.
2. Catatan tidak memuat gambar tersisip — teks murni, dengan hiperlink ke file `.excalidraw`.
3. Pencarian: `.excalidraw` hanya nama file; `.md` nama file + isi; dua daftar terpisah (perilaku BlokCatat).
4. Tidak ada pembaruan gambar/tautan otomatis karena tidak ada gambar yang dilampirkan di catatan.

## Constraints

- **Stack**: Vite 8 + React 19.3.1 + TypeScript; BlockNote `0.57.0` (core/react/mantine) dan `@excalidraw/excalidraw` `0.18.1`, semua versi dikunci eksak — dua MVP memakai versi ini dan sudah terbukti berjalan di React 19.
- **Platform**: hanya Chrome/Edge desktop (File System Access API). Tanpa polyfill Firefox/Safari.
- **Offline**: tanpa request eksternal; font dan aset lokal; service worker hanya aktif di build/preview.
- **Lisensi**: jangan tambah `@blocknote/xl-*` (GPL-3.0/komersial); jangan fork/vendor Excalidraw.
- **Format**: `.md` murni tanpa frontmatter/metadata; `.excalidraw` JSON standar yang bisa dibuka excalidraw.com.
- **Tulis aman**: `createWritable()` atomik, antrean per file, cek `lastModified` sebelum menimpa.
- **Ukuran**: precache PWA realistis ~25–30 MB (font Excalidraw ~20 MB + aset BlockNote) — jangan tambah aset tanpa alasan.
- **Verifikasi**: tidak ada E2E otomatis; gate = `typecheck` + `build` + Vitest untuk logika murni + checklist manual Chrome.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tanpa gambar tersisip; tautan Markdown biasa ke `.excalidraw` | User 2026-11-08: catatan tetap teks murni, implementasi jauh lebih sederhana | — Pending |
| Penomoran `New N` terpisah per ekstensi | User; mencegah tabrakan antar jenis file | — Pending |
| Pencarian gambar = nama saja, catatan = nama + isi, dua daftar | User; hindari parsing JSON gambar saat indeks | — Pending |
| F15–F19, F23–F25 dibatalkan; F22/F26 tetap P1 | Konsekuensi langsung dari keputusan tanpa embed | — Pending |
| Satu aplikasi baru di `drawblock/`, kode diangkat dari dua MVP | Keduanya sudah memakai stack dan pola yang sama | — Pending |
| React 19.3.1 + BlockNote 0.57.0 + Excalidraw 0.18.1 eksak | Kompatibilitas Peer Excalidraw mencakup React 19 | — Pending |
| TypeScript 7.0.2 dulu, fallback 5.9.3 | BlockNote memakai 7.0.2; Excalidraw memakai 5.9.3 — perlu dibuktikan di fase 1 | — Pending |
| Vitest untuk `path`, penomoran, `linkTarget`, `searchIndex` | Round-trip manual rapuh; logika murni mudah diuji | — Pending |
| Excalidraw lazy-loaded | Bundle ±2 MB; awal aplikasi harus cepat | — Pending |

## Evolution

Setelah tiap fase: pindahkan requirement yang terverifikasi ke Validated, catat keputusan baru, perbarui Out of Scope bila ada perubahan. Setelah milestone: audit ulang Core Value dan seluruh asumsi.

---
*Last updated: 2026-11-08 setelah MVP 1 selesai dan diverifikasi*
