# Requirements: DrawBlock

**Defined:** 2026-11-08
**Core Value:** Satu folder, dua editor, file standar yang tetap milik pengguna.

## v1 Requirements

### Workspace

- [x] **WS-01**: User dapat membuka folder sebagai workspace (baca-tulis) lewat File System Access API
- [x] **WS-02**: Folder dan file terakhir diingat; izin diminta ulang dengan satu klik (bukan saat startup)

### Sidebar

- [x] **SIDE-01**: Pohon folder + `.md` + `.excalidraw` dengan ikon berbeda; sembunyikan entri berawalan titik, `node_modules`, dan file lain
- [x] **SIDE-02**: Klik file membuka editor sesuai ekstensi; file aktif ditandai; editor di-remount per file
- [x] **SIDE-03**: Kata kunci pencarian menggantikan pohon dengan daftar hasil terpisah; mengosongkan kotak mengembalikan pohon
- [x] **SIDE-04**: Sidebar bisa dilipat, status diingat (P1)

### Editor

- [x] **EDIT-01**: BlockNote dengan slash menu, toolbar format, drag blok, indentasi, daftar centang
- [x] **EDIT-02**: Markdown murni tanpa metadata; blok/format dibatasi pada yang aman bolak-balik (paragraf, H1–H3, bullet, bernomor, checklist, kutipan, kode, divider, tabel)
- [x] **EDIT-03**: Excalidraw memuat/menyimpan JSON standar via `loadFromBlob` + `serializeAsJSON`; gambar tempelan tetap base64 di `files`
- [x] **EDIT-04**: Excalidraw dimuat malas saat pertama dibutuhkan (P1)

### File Management

- [x] **FILE-01**: Catatan Baru → `New 1.md`, `New 2.md`, dst. (nomor terkecil belum dipakai) di folder terpilih/akar; kursor langsung di editor
- [x] **FILE-02**: Gambar Baru → `New 1.excalidraw`, `New 2.excalidraw`, dst.; penomoran terpisah; kanvas langsung siap
- [x] **FILE-03**: Buat subfolder di folder terpilih/akar
- [x] **FILE-04**: Ganti nama lewat klik kanan, F2, atau klik dua kali; ekstensi dipertahankan; nama bentrok ditolak
- [x] **FILE-05**: Hapus permanen dengan konfirmasi (folder menyebut jumlah isi); tanpa `.trash`
- [x] **FILE-06**: Drag file ke folder memindahkannya di disk; bentrok nama → Ganti / Simpan keduanya / Batal; folder tidak bisa diseret; folder tidak bisa masuk ke dirinya sendiri

### Autosave

- [x] **SAVE-01**: Autosave kedua jenis file, debounce 1–2 detik, hanya bila isi berubah (gambar: abaikan zoom/seleksi)
- [x] **SAVE-02**: Indikator Tersimpan / Menyimpan… / Gagal
- [x] **SAVE-03**: Simpan paksa saat pindah file, `visibilitychange`, `pagehide`/`beforeunload`
- [x] **SAVE-04**: Deteksi perubahan luar lewat `lastModified` + dialog timpa/muat ulang (P1)

### Search

- [x] **SRCH-01**: Indeks nama kedua jenis file + isi `.md`, dibangun bertahap di latar belakang; diperbarui saat simpan/buat/rename/move/hapus
- [x] **SRCH-02**: Hasil = dua daftar terpisah (nama file, lalu isi catatan); gambar tidak diindeks isinya; tiap hasil menampilkan ikon, nama, jalur folder, cuplikan (untuk isi); klik membuka file

### Drawing Links

- [x] **LINK-01**: User dapat menyisipkan tautan Markdown standar ke file `.excalidraw` dari catatan (jalur relatif, spasi ter-encode), tanpa blok/pratinjau kustom
- [x] **LINK-02**: Klik tautan `.excalidraw` di catatan membuka gambar di editor; tautan rusak memberi pemberitahuan dan teks tautan tetap utuh

### PWA

- [x] **PWA-01**: Offline setelah kunjungan pertama; dapat dipasang sebagai PWA
- [x] **PWA-02**: Font/aset lokal, tanpa request jaringan keluar, tanpa analytics
- [x] **PWA-03**: Tema terang/gelap mengikuti sistem (P1)

## v2 Requirements

Deferred, tidak di roadmap saat ini:

- Tautan antar catatan + backlink (tingkat 3)
- Ekspor `.svg`/`.png` pendamping agar gambar tampil di aplikasi Markdown lain
- Quick open (Ctrl+P), pencarian teks di dalam gambar
- Template, riwayat versi, integrasi Git

## Out of Scope

| Feature | Reason |
|---------|--------|
| Gambar tersisip, pratinjau SVG, overlay editor | Keputusan user: catatan teks murni + tautan |
| Blok kustom BlockNote (`toExternalHTML`/round-trip kustom) | Tidak diperlukan tanpa embed |
| Pembaruan tautan otomatis saat rename/move gambar (F23) | Tidak ada tautan tersemat |
| Pencarian isi elemen teks gambar (F24) | User: gambar cukup nama file |
| Keterangan gambar / "Buka di panel" (F25) | Tidak ada blok gambar |
| Kolaborasi, cloud, mobile, Firefox/Safari | PRD §4 |
| `@blocknote/xl-*`, AI, ekspor DOCX/PDF, plugin, template | Lisensi / non-tujuan PRD |
| Fork atau vendor pustaka | PRD §3 prinsip 4 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| WS-01 | Phase 1 | Complete |
| WS-02 | Phase 1 | Complete |
| SIDE-01 | Phase 1 | Complete |
| SIDE-02 | Phase 1 | Complete |
| SIDE-03 | Phase 4 | Complete |
| SIDE-04 | Phase 6 | Complete |
| EDIT-01 | Phase 1 | Complete |
| EDIT-02 | Phase 1 | Complete |
| EDIT-03 | Phase 1 | Complete |
| EDIT-04 | Phase 6 | Complete |
| FILE-01 | Phase 3 | Complete |
| FILE-02 | Phase 3 | Complete |
| FILE-03 | Phase 3 | Complete |
| FILE-04 | Phase 3 | Complete |
| FILE-05 | Phase 3 | Complete |
| FILE-06 | Phase 3 | Complete |
| SAVE-01 | Phase 2 | Complete |
| SAVE-02 | Phase 2 | Complete |
| SAVE-03 | Phase 2 | Complete |
| SAVE-04 | Phase 2 | Complete |
| SRCH-01 | Phase 4 | Complete |
| SRCH-02 | Phase 4 | Complete |
| LINK-01 | Phase 5 | Complete |
| LINK-02 | Phase 5 | Complete |
| PWA-01 | Phase 6 | Complete |
| PWA-02 | Phase 6 | Complete |
| PWA-03 | Phase 6 | Complete |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-11-08*
*Last updated: 2026-11-08 setelah klarifikasi lingkup (tanpa gambar tersisip)*
