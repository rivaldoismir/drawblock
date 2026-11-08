# Roadmap: DrawBlock

## Overview

Menggabungkan dua MVP yang sudah jadi (BlokCatat + ExcaliFolder) menjadi satu aplikasi baru: satu sidebar untuk `.md` dan `.excalidraw`, dua editor yang dipilih menurut ekstensi, autosave bersama, manajemen file, pencarian terpisah, dan tautan Markdown dari catatan ke gambar. Risiko terbesar sudah dieliminasi karena tidak ada blok gambar tersisip: tidak ada blok kustom BlockNote, tidak ada pratinjau SVG, tidak ada overlay.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation & Workspace Shell** - Scaffold, layout, sidebar dua jenis file, buka editor sesuai ekstensi
- [x] **Phase 2: Autosave & Write Safety** - Autosave debounce, antrean tulis, indikator, simpan paksa
- [x] **Phase 3: File Management** - New note/drawing, subfolder, rename, hapus, drag-and-drop
- [x] **Phase 4: Search** - Indeks nama + isi catatan, daftar hasil terpisah
- [x] **Phase 5: Drawing Links** - Sisip tautan ke `.excalidraw` dan buka dari catatan
- [x] **Phase 6: Offline & Polish** - PWA penuh, font lokal, lazy Excalidraw, tema, sidebar lipat
- [x] **Phase 7: Acceptance & Handoff** - Uji 13 kriteria, perf, dokumentasi AGENTS.md

## Phase Details

### Phase 1: Foundation & Workspace Shell
**Goal**: Aplikasi bisa dibuka, folder dipilih, pohon dua jenis file tampil, dan tiap file terbuka di editor yang benar.
**Depends on**: Nothing (first phase)
**Requirements**: WS-01, WS-02, SIDE-01, SIDE-02, EDIT-01, EDIT-02, EDIT-03
**Success Criteria** (what must be TRUE):
  1. User membuka folder dan melihat semua `.md` + `.excalidraw` (termasuk subfolder) dengan ikon berbeda; folder kosong menampilkan sidebar kosong.
  2. Klik `.md` membuka BlockNote; klik `.excalidraw` membuka Excalidraw; file aktif ditandai; berpindah 10× tidak me-remount salah file.
  3. Catatan tersimpan sebagai Markdown murni yang terbaca di Notepad; file `.excalidraw` yang dibuat terbuka di excalidraw.com.
  4. Reload halaman memulihkan folder terakhir dan file terakhir (izin diminta lewat klik).
**Plans**: 1 plan

Plans:
- [x] 01-01: Scaffold, tipe & util path, fs terpadu, persistence, shell App + Sidebar + dua editor

### Phase 2: Autosave & Write Safety
**Goal**: Semua perubahan catatan dan gambar tersimpan tanpa tombol simpan, dan tidak ada penulisan yang saling menimpa.
**Depends on**: Phase 1
**Requirements**: SAVE-01, SAVE-02, SAVE-03, SAVE-04
**Success Criteria** (what must be TRUE):
  1. Mengetik/menggambar lalu menunggu ±2 detik mengubah file di disk; indikator berubah Menyimpan… → Tersimpan.
  2. Berpindah file, menyembunyikan tab, atau menutup tab 2 detik setelah edit tidak menghilangkan perubahan.
  3. Dua file bisa tersimpan bersamaan, tetapi satu file tidak pernah ditulis dua kali bersamaan.
  4. File yang diubah dari luar memunculkan dialog timpa/muat ulang, bukan ditimpa diam-diam.
**Plans**: 1 plan

Plans:
- [x] 02-01: Autosave service, save queue per file, wiring note + drawing, indikator, flush, dialog konflik

### Phase 3: File Management
**Goal**: Alur harian lengkap dari sidebar — buat, atur, ganti nama, hapus, pindahkan.
**Depends on**: Phase 2
**Requirements**: FILE-01, FILE-02, FILE-03, FILE-04, FILE-05, FILE-06
**Success Criteria** (what must be TRUE):
  1. Tiga kali Catatan Baru menghasilkan `New 1.md`–`New 3.md`; tiga kali Gambar Baru menghasilkan `New 1.excalidraw`–`New 3.excalidraw`; kursor/kanvas langsung siap.
  2. Subfolder, rename (klik kanan/F2/dua klik), dan hapus permanen (setelah konfirmasi) tercermin di disk, termasuk saat file sedang terbuka.
  3. Drag file ke subfolder memindahkan file di disk; nama bentrok memunculkan Ganti / Simpan keduanya / Batal.
**Plans**: 1 plan

Plans:
- [x] 03-01: New file berpenomoran, subfolder, rename, delete, drag-drop, dialog konflik, context menu + shortcut

### Phase 4: Search
**Goal**: Menemukan file dengan cepat lewat dua daftar hasil yang terpisah.
**Depends on**: Phase 3
**Requirements**: SIDE-03, SRCH-01, SRCH-02
**Success Criteria** (what must be TRUE):
  1. Mencari kata yang ada di nama `.excalidraw` menampilkannya di daftar nama; isi file gambar tidak pernah dibaca/diindeks.
  2. Mencari kata di isi catatan menampilkan cuplikan dan jalur folder; klik hasil membuka file.
  3. Pada folder 1.000 file, hasil nama < 200 ms dan hasil isi < 500 ms setelah indeks siap; mengosongkan kata kunci mengembalikan pohon.
**Plans**: 1 plan

Plans:
- [x] 04-01: Indeks dua jenis entri, pembaruan inkremental, UI dua daftar, pengujian unit

### Phase 5: Drawing Links
**Goal**: Catatan bisa menautkan gambar dan tautan itu membuka editor gambar.
**Depends on**: Phase 4
**Requirements**: LINK-01, LINK-02
**Success Criteria** (what must be TRUE):
  1. User menyisipkan tautan ke `.excalidraw` dari catatan; file `.md` di disk hanya berisi tautan Markdown standar (jalur relatif, spasi ter-encode).
  2. Klik tautan membuka gambar itu di editor; bila file hilang, muncul pemberitahuan dan teks tautan tetap ada.
  3. Tautan eksternal (http/https) tetap berperilaku normal; tautan di tengah kalimat tidak berubah menjadi apa pun yang khusus.
**Plans**: 1 plan

Plans:
- [x] 05-01: Util resolusi tautan, item slash menu "Tautan ke gambar", intersepsi klik, `openDrawing` terpusat, tes unit

### Phase 6: Offline & Polish
**Goal**: Aplikasi berjalan penuh offline, bisa dipasang, dan terasa seperti aplikasi desktop biasa.
**Depends on**: Phase 5
**Requirements**: EDIT-04, SIDE-04, PWA-01, PWA-02, PWA-03
**Success Criteria** (what must be TRUE):
  1. `npm run build && npm run preview`, DevTools offline → reload → semua fitur tetap jalan; tidak ada request eksternal.
  2. Excalidraw hanya dimuat saat file gambar pertama dibuka; tema mengikuti sistem; sidebar bisa dilipat dan diingat.
  3. PWA bisa di-install dan membuka workspace terakhir.
**Plans**: 1 plan

Plans:
- [x] 06-01: PWA/workbox, sync-fonts, lazy Excalidraw, tema, sidebar lipat, audit request jaringan

### Phase 7: Acceptance & Handoff
**Goal**: Semua kriteria PRD yang masih berlaku terbukti di Chrome/Edge, dan proyek punya dokumentasi agen.
**Depends on**: Phase 6
**Requirements**: (verifikasi seluruh requirement fase 1–6; tidak menambah requirement baru)
**Success Criteria** (what must be TRUE):
  1. 13 kriteria penerimaan (PRD §12 yang disesuaikan) lulus tanpa kehilangan data.
  2. `npm run typecheck`, `npm run build`, dan `npm run test` lulus; tidak ada warning baru.
  3. `AGENTS.md` proyek berisi perintah, aturan non-negosiasi, jebakan toolchain, dan checklist verifikasi.
**Plans**: 1 plan

Plans:
- [x] 07-01: Uji kriteria, perf 1.000 file / gambar 5 MB, tulis AGENTS.md, update PROJECT/STATE/ROADMAP

## Progress

**Execution Order:**
1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Workspace Shell | 1/1 | Complete | 2026-11-08 |
| 2. Autosave & Write Safety | 1/1 | Complete | 2026-11-08 |
| 3. File Management | 1/1 | Complete | 2026-11-08 |
| 4. Search | 1/1 | Complete | 2026-11-08 |
| 5. Drawing Links | 1/1 | Complete | 2026-11-08 |
| 6. Offline & Polish | 1/1 | Complete | 2026-11-08 |
| 7. Acceptance & Handoff | 1/1 | Complete | 2026-11-08 |
