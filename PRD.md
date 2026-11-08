# PRD — DrawBlock: Workspace Dokumentasi dan Perancangan Offline (MVP 1)

Draf v0.1 · 8 November 2026 · Nama: **DrawBlock**

## 0. Keputusan dan asumsi

Keputusan dari diskusi (8 November 2026):

1. DrawBlock adalah **proyek baru** yang menggabungkan persyaratan PRD ExcaliFolder (Excalidraw) dan PRD BlokCatat (BlockNote). Kedua PRD itu menjadi sumber persyaratan, bukan proyek terpisah yang harus selesai dulu.
2. **Satu workspace, dua editor:** file `.md` dibuka dengan BlockNote, file `.excalidraw` dengan Excalidraw.
3. **Cakupan MVP 1 = tingkat 2:** satu sidebar dengan dua editor, ditambah gambar yang bisa disisipkan ke dalam catatan.
4. **Gambar di dalam catatan disimpan sebagai tautan ke file `.excalidraw` biasa**, bukan SVG dengan data tertanam dan bukan data tertanam di dalam `.md`.
5. Semua keputusan PRD BlokCatat berlaku: Markdown murni, workspace dimulai dari folder kosong, hapus permanen, nama bawaan `New 1.md`, pencarian sidebar berupa daftar hasil terpisah (nama file dan isi catatan).
6. Semua keputusan PRD ExcaliFolder berlaku: file `.excalidraw` standar yang kompatibel dengan excalidraw.com, autosave, offline.

Asumsi yang perlu dikonfirmasi:

- Satu pengguna, satu komputer, Chrome atau Edge, tanpa cloud dan kolaborasi (sama seperti dua PRD sebelumnya).
- Gambar baru bernama `New 1.excalidraw`, `New 2.excalidraw`, dan seterusnya; penomoran dihitung terpisah per jenis file.
- Mengedit gambar dari dalam catatan dibuka sebagai lapisan layar penuh (overlay) di atas catatan.
- Di aplikasi Markdown lain, gambar tersisip tampil sebagai tautan biasa, bukan pratinjau. Ini konsekuensi keputusan nomor 4 dan diterima.

## 1. Ringkasan

DrawBlock adalah aplikasi web (PWA) untuk menulis dokumentasi dan merancang secara visual dalam satu folder. Sidebar menampilkan catatan (`.md`) dan gambar (`.excalidraw`), dan setiap file terbuka di editor yang sesuai. Gambar bisa disisipkan ke dalam catatan sebagai pratinjau yang dapat diedit dengan dua klik. Semua file berformat standar terbuka dan tersimpan di disk, sehingga bisa dibuka di aplikasi lain, dibackup, atau dimasukkan ke Git.

## 2. Latar belakang dan masalah

- Dokumentasi teknis butuh teks dan diagram sekaligus, tetapi keduanya hidup di alat terpisah, dan tautan di antaranya mudah rusak.
- Aplikasi catatan populer menyimpan data di cloud atau format tertutup, sedangkan whiteboard online mengharuskan buka dan simpan manual per file.
- Dibutuhkan satu folder yang bisa dibuka seperti proyek: catatan rapi dan sketsa kasar berdampingan, offline, dengan file yang tetap milik pengguna.

## 3. Prinsip produk

Diturunkan dari filosofi Excalidraw dan BlockNote:

1. **Berkas terbuka dan portabel.** Hanya `.md` dan `.excalidraw` standar, tanpa format sendiri atau metadata tambahan. Excalidraw menyimpan gambar sebagai JSON terbuka; Markdown kita pilih untuk catatan dengan batasan blok yang aman.
2. **Local-first.** Tidak ada permintaan jaringan; semuanya berjalan offline.
3. **Siap pakai dan sederhana.** Tidak ada pengaturan wajib, antarmuka umum dan familiar, dan sedikit konsep (folder, catatan, gambar).
4. **Komponen, bukan fork.** Memakai paket resmi `@excalidraw/excalidraw` dan `@blocknote/*` tanpa mengubah kode sumbernya; kustomisasi lewat mekanisme perluasan masing-masing (blok kustom BlockNote).
5. **Tulis rapi, gambar kasar.** Catatan untuk penjelasan yang tersusun, gambar bergaya sketsa untuk ide dan arsitektur. Keduanya setara di sidebar dan bisa saling menyisip.

## 4. Tujuan dan non-tujuan

**Tujuan MVP 1**

1. Buka folder sebagai workspace; sidebar menampilkan folder, catatan `.md`, dan gambar `.excalidraw`.
2. Klik file membuka editor yang sesuai (BlockNote atau Excalidraw).
3. Kelola dari sidebar: subfolder, buat, ganti nama, hapus permanen, seret file ke subfolder.
4. Cari di sidebar (nama kedua jenis file dan isi catatan) dengan hasil berupa daftar terpisah.
5. Autosave untuk kedua jenis file.
6. Sisipkan gambar ke dalam catatan sebagai pratinjau yang bisa diedit, disimpan di `.md` sebagai tautan ke file `.excalidraw`.
7. Berjalan penuh offline.

**Non-tujuan (bukan MVP 1)**

- Kolaborasi real-time dan sinkronisasi cloud
- Aplikasi mobile, dukungan Firefox/Safari
- Backlink, graf, tag, database; tautan antar catatan (tingkat 3)
- Fitur AI, ekspor DOCX/PDF, kolom berdampingan (paket XL BlockNote)
- Struktur folder bawaan atau template; pintasan global lintas aplikasi
- SVG/PNG dengan scene tertanam
- Mengubah kode sumber kedua pustaka

## 5. Pengguna dan skenario

**Pengguna:** developer atau penulis dokumentasi yang merancang sistem, bekerja sendiri di satu komputer.

**Skenario utama**

1. Buka folder proyek. Sidebar menampilkan `README.md`, folder `arsitektur/`, dan `alur-pembayaran.excalidraw`.
2. Klik `README.md` untuk membuka BlockNote, klik `alur-pembayaran.excalidraw` untuk membuka Excalidraw. Tidak ada tombol simpan.
3. Menulis catatan arsitektur: ketik `/`, pilih *Gambar Excalidraw*, lalu *Gambar baru*. File `New 1.excalidraw` dibuat di folder yang sama, pratinjau muncul di catatan, dan overlay editor terbuka.
4. Selesai menggambar, tutup overlay dan pratinjau diperbarui. Ganti nama gambar menjadi `arsitektur-v1.excalidraw` dari sidebar; tautan di catatan ikut diperbarui setelah konfirmasi (P1).
5. Menyisipkan gambar yang sudah ada: `/`, *Gambar Excalidraw*, lalu *Pilih dari workspace*.
6. Mencari `pembayaran`: muncul daftar hasil berisi nama file dan cuplikan isi catatan; klik hasil membuka file.
7. Tanpa internet semuanya tetap jalan. Membuka `.md` di Notepad menampilkan teks biasa dengan tautan ke file gambar, dan `.excalidraw` bisa dibuka di excalidraw.com.

## 6. Keputusan teknis

| Hal | Keputusan | Alasan |
| --- | --- | --- |
| Aplikasi | React + TypeScript + Vite, PWA | Kedua pustaka berbasis React |
| Editor catatan | BlockNote (`@blocknote/core`, `@blocknote/react`, `@blocknote/mantine`), tanpa paket `xl-*` | Editor blok siap pakai; paket XL berlisensi GPL-3.0 atau komersial |
| Editor gambar | `@excalidraw/excalidraw` | Komponen resmi, lisensi MIT |
| Pemilihan editor | Berdasarkan ekstensi file | Satu aturan sederhana |
| Format catatan | Markdown `.md` murni | Keputusan PRD BlokCatat |
| Format gambar | `.excalidraw` JSON standar, memakai fungsi serialisasi bawaan Excalidraw | Kompatibel dengan excalidraw.com |
| Sisip gambar | Blok kustom BlockNote; di Markdown berupa tautan | Lihat bagian 7 |
| Pratinjau gambar | Render SVG dari isi file memakai fungsi ekspor Excalidraw, disimpan di memori saja | Tidak menambah file ke workspace |
| Akses file | File System Access API | Baca-tulis langsung ke folder |
| State aplikasi | IndexedDB (handle folder, file terakhir) | Handle folder bisa disimpan di sana |
| Offline | Service worker; font, ikon, dan asset kedua pustaka dilayani lokal; Excalidraw dimuat malas saat pertama dibutuhkan | Tanpa CDN dan awal lebih cepat |
| Platform | Chrome/Edge | Sama dengan PRD sebelumnya |

**Lisensi.** Excalidraw berlisensi MIT. Sebagian besar BlockNote berlisensi MPL-2.0 (aman dipakai tanpa mengubah file sumbernya), sedangkan paket `@blocknote/xl-*` berlisensi GPL-3.0 atau perlu lisensi komersial, jadi tidak dipakai. Baca ulang LICENSE di repositori masing-masing sebelum dirilis ke orang lain.

## 7. Gambar di dalam catatan (tingkat 2)

Representasi di file `.md`:

```markdown
Alur pembayaran:

[Alur pembayaran](alur-pembayaran.excalidraw)

Penjelasan berikutnya...
```

**Aturan penulisan**

- Paragraf yang **hanya berisi satu tautan** ke file `.excalidraw` dikenali DrawBlock sebagai gambar tersisip. Teks tautan menjadi keterangan.
- Tautan ke `.excalidraw` di tengah kalimat tetap tautan biasa.
- Jalur relatif terhadap folder catatan; spasi pada nama ditulis ter-encode (`New%201.excalidraw`).
- Tidak ada metadata tambahan di file `.md`.
- Di aplikasi lain tautan itu tampil sebagai tautan biasa; di DrawBlock tampil sebagai pratinjau.

**Perilaku**

- **Pratinjau:** render SVG dari isi file, mengikuti tema, lebar menyesuaikan catatan, tinggi dibatasi.
- **Edit:** klik dua kali atau tombol *Edit* membuka overlay layar penuh berisi Excalidraw untuk file itu. Autosave ke file gambar, dan saat overlay ditutup pratinjau diperbarui.
- **Penyegaran:** pratinjau juga diperbarui saat jendela kembali fokus bila `lastModified` file gambar berubah.
- **Tautan rusak:** bila file tidak ditemukan, blok menampilkan *Gambar tidak ditemukan* dengan tombol *Pilih ulang*; teks tautan di `.md` tidak hilang.
- **Integritas tautan (P1):** mengganti nama atau memindahkan `.excalidraw` dari sidebar memperbarui tautan di catatan yang menunjuk ke file itu (memakai indeks isi), setelah konfirmasi daftar catatan terdampak. Menghapus gambar yang masih ditautkan memunculkan peringatan jumlah catatan.

**Risiko teknis utama.** Blok kustom React di BlockNote bisa menentukan bentuk HTML luarnya (`toExternalHTML`) yang menjadi dasar konversi keluar, tetapi konversi Markdown BlockNote bersifat lossy. Apakah ini cukup untuk menghasilkan paragraf tautan yang persis dan membacanya kembali menjadi blok harus dibuktikan lebih dulu di tahap 1.

## 8. Kebutuhan fungsional

Prioritas: **P0** wajib MVP 1, **P1** sebaiknya ada.

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| F1 | *Open Folder* membuka dialog pilih folder (baca-tulis) | P0 |
| F2 | Sidebar menampilkan pohon folder, file `.md`, dan file `.excalidraw` dengan ikon berbeda; file lain, folder tersembunyi (diawali titik), dan `node_modules` tidak ditampilkan | P0 |
| F3 | Klik file membuka editor sesuai ekstensi; file aktif ditandai | P0 |
| F4 | **Catatan Baru**: membuat `New 1.md`, `New 2.md`, dan seterusnya (nomor terkecil yang belum dipakai) di folder yang sedang dipilih, atau di akar bila tidak ada folder terpilih; kursor langsung di editor | P0 |
| F5 | **Gambar Baru**: membuat `New 1.excalidraw`, `New 2.excalidraw`, dan seterusnya dengan aturan yang sama, penomoran terpisah dari catatan; kanvas langsung siap | P0 |
| F6 | Buat subfolder. **Ganti nama** file/folder lewat klik kanan, F2, atau klik dua kali (ekstensi dipertahankan; nama bentrok ditolak). **Hapus permanen** dengan dialog konfirmasi (folder menyebut jumlah isi); tanpa folder `.trash` | P0 |
| F7 | **Drag-and-drop** file ke folder di sidebar untuk memindahkannya di disk; nama bentrok memunculkan *Ganti / Simpan keduanya / Batal* | P0 |
| F8 | **Pencarian di sidebar**: hasil berupa daftar terpisah yang menggantikan pohon selama ada kata kunci; mencocokkan nama file (kedua jenis) dan isi catatan; tiap hasil memuat ikon jenis, nama, jalur folder, dan cuplikan untuk kecocokan isi; klik membuka file; mengosongkan kotak mengembalikan pohon | P0 |
| F9 | Indeks nama dan isi di memori, dibangun di latar belakang saat folder dibuka dan diperbarui saat file disimpan, dipindah, diganti nama, atau dihapus | P0 |
| F10 | Editor catatan BlockNote: slash menu, toolbar format, drag blok, indentasi, daftar centang | P0 |
| F11 | Catatan disimpan sebagai Markdown murni tanpa metadata; toolbar dan slash menu hanya menawarkan blok dan format yang aman bolak-balik ke Markdown | P0 |
| F12 | Editor gambar Excalidraw memuat dan menyimpan JSON standar memakai fungsi bawaan; gambar tempelan tersimpan sebagai data standar | P0 |
| F13 | **Autosave** kedua jenis file: debounce 1–2 detik, hanya bila isi berubah (untuk gambar, bukan karena zoom atau seleksi saja); indikator *Tersimpan / Menyimpan… / Gagal* | P0 |
| F14 | Simpan paksa saat berpindah file, menutup overlay, atau menutup tab | P0 |
| F15 | **Sisip gambar**: slash menu *Gambar Excalidraw* dengan pilihan *Gambar baru* (membuat `New N.excalidraw` di folder catatan) dan *Pilih dari workspace* | P0 |
| F16 | **Blok gambar tersisip**: pratinjau dan keterangan; disimpan sebagai paragraf tautan tunggal (bagian 7) dan dibaca kembali menjadi blok | P0 |
| F17 | **Edit dari catatan**: klik dua kali atau tombol *Edit* membuka overlay; autosave; saat ditutup pratinjau diperbarui | P0 |
| F18 | Pratinjau menyegarkan diri saat jendela fokus bila `lastModified` file gambar berubah | P0 |
| F19 | Tautan rusak menampilkan placeholder dengan *Pilih ulang* | P0 |
| F20 | Ingat folder dan file terakhir; minta izin ulang dengan satu klik jika browser mensyaratkan | P0 |
| F21 | Berjalan offline setelah kunjungan pertama; bisa di-install sebagai PWA | P0 |
| F22 | Peringatan bila file diubah dari luar sejak dibuka (cek `lastModified` sebelum menulis) | P1 |
| F23 | Pembaruan tautan di catatan saat gambar diganti nama atau dipindah; peringatan saat menghapus gambar yang masih ditautkan | P1 |
| F24 | Indeks teks di dalam gambar (elemen teks) agar ikut dicari | P1 |
| F25 | Edit keterangan gambar dan tombol *Buka di panel* | P1 |
| F26 | Tema terang/gelap mengikuti sistem; sidebar bisa dilipat; Excalidraw dimuat malas | P1 |

## 9. Kebutuhan non-fungsional

- **Kompatibilitas:** `.md` berisi Markdown murni tanpa metadata; `.excalidraw` terbuka di excalidraw.com dan sebaliknya.
- **Keamanan data:** penulisan lewat `createWritable()` (berkas sementara lalu diganti saat ditutup); antrean tulis per file, sehingga dua file bisa tersimpan bersamaan tetapi satu file tidak pernah ditulis dua kali bersamaan.
- **Kinerja:** membuka folder 1.000 file < 2 detik; hasil pencarian nama < 200 ms dan isi < 500 ms setelah indeks siap; Catatan Baru siap diketik < 300 ms; gambar 5 MB terbuka tanpa membekukan UI; pratinjau gambar biasa muncul < 1 detik.
- **Privasi:** tidak ada permintaan jaringan ke luar, tanpa analytics.
- **Kesederhanaan:** tidak ada pengaturan wajib; hanya sidebar dan editor.
- **Gaya tampilan:** dua panel umum (sidebar kiri, editor kanan), terang/gelap mengikuti sistem, font sistem, ikon standar, perilaku yang sudah dikenal (klik kanan, F2, seret-lepas). Pintasan keyboard menghindari yang dicadangkan browser (Ctrl+N, Ctrl+T, Ctrl+W).
- **Stabilitas dependensi:** kunci versi paket, baca changelog sebelum upgrade, dan batasi pemakaian tiap pustaka di satu lapisan.

## 10. Arsitektur singkat

```
App
├─ Sidebar (kotak cari, daftar hasil, pohon folder, drag-and-drop, menu klik kanan, tombol Catatan Baru dan Gambar Baru)
├─ Toolbar atas (nama file, indikator simpan)
├─ EditorHost (memilih editor menurut ekstensi, di-remount per file via key)
│  ├─ NoteEditor     → BlockNote (+ blok kustom Gambar Excalidraw)
│  └─ DrawingEditor  → Excalidraw (dimuat malas)
└─ DrawingOverlay (Excalidraw layar penuh untuk gambar yang disisipkan)

Layanan
├─ fsService     → baca folder, baca/tulis/rename/hapus/pindah, buat subfolder
├─ noteCodec     → Markdown ↔ blok BlockNote (termasuk paragraf tautan ↔ blok gambar)
├─ drawingCodec  → JSON ↔ scene Excalidraw; render pratinjau SVG
├─ searchIndex   → nama file dan isi catatan di memori
├─ persistence   → IndexedDB: handle folder, file terakhir
└─ autosave      → debounce, antrean tulis per file, status
```

Catatan:

- Pemakaian BlockNote dibatasi di `NoteEditor` dan `noteCodec`, pemakaian Excalidraw di `DrawingEditor` dan `drawingCodec`, agar mudah di-upgrade atau diganti.
- Editor di-remount per file supaya riwayat undo/redo tidak bocor antar file.

## 11. Kasus tepi dan risiko

| Risiko / kasus | Penanganan |
| --- | --- |
| Blok gambar tidak bolak-balik ke Markdown | Dibuktikan di spike tahap 1; fallback: `noteCodec` memproses paragraf tautan sendiri sebelum dan sesudah konversi bawaan BlockNote |
| Gaya CSS BlockNote (Mantine) dan Excalidraw berbenturan, atau versi React kedua paket tidak cocok | Render tiap editor di kontainer terpisah; diperiksa di spike |
| Excalidraw berukuran besar memperlambat awal | Dimuat malas, dan di-cache service worker |
| Markdown bolak-balik mengubah isi catatan | Batasi blok MVP, sembunyikan format tanpa padanan Markdown, uji bolak-balik |
| Satu gambar ditautkan dari banyak catatan | Semua pratinjau membaca file yang sama dan menyegar saat file berubah |
| Gambar yang sama dibuka di dua editor sekaligus | Satu file gambar hanya dibuka di satu editor pada satu waktu; upaya kedua membuka editor yang sudah ada |
| Gambar dipindah, diganti nama, atau dihapus dari luar aplikasi | Placeholder *Gambar tidak ditemukan* (F19) |
| Gambar berisi banyak foto tempelan (JSON besar) | Autosave debounce dengan indikator; pratinjau dibuat saat blok terlihat |
| Nama bentrok saat Catatan/Gambar Baru atau drag-and-drop | Pakai nomor berikutnya; drag-and-drop memunculkan *Ganti / Simpan keduanya / Batal* |
| Folder diseret ke dalam dirinya sendiri atau subfoldernya | Ditolak |
| File dipindahkan saat sedang terbuka | Perbarui jalur; autosave menulis ke lokasi baru; pakai `move()` bila tersedia, jika tidak salin lalu hapus |
| Izin folder hilang saat dibuka ulang | Tombol *Lanjutkan folder terakhir* (izin hanya bisa diminta lewat klik) |
| File diubah dari luar | F22 |
| Tab ditutup saat ada perubahan tertunda | Simpan paksa pada `visibilitychange` dan `beforeunload` |
| Folder sangat besar | Pohon dibaca malas; indeks dibangun bertahap di latar belakang |

## 12. Kriteria penerimaan MVP 1

1. Setelah memilih folder, semua `.md` dan `.excalidraw` (termasuk subfolder) tampil dengan ikon berbeda; folder kosong menampilkan sidebar kosong.
2. Klik `.md` membuka BlockNote dan klik `.excalidraw` membuka Excalidraw; berpindah file 10 kali berturut-turut tidak menghilangkan satu pun perubahan.
3. Mengetik atau menggambar lalu menunggu ±2 detik mengubah file di disk.
4. File `.md` terbaca wajar di Notepad; file `.excalidraw` dari DrawBlock terbuka di excalidraw.com, dan file dari excalidraw.com terbuka di DrawBlock, termasuk gambar tempelan.
5. **Uji bolak-balik** lulus untuk semua jenis blok yang didukung, termasuk blok gambar tersisip (buka, simpan, buka lagi, hasil identik).
6. Catatan Baru dan Gambar Baru masing-masing tiga kali menghasilkan `New 1` sampai `New 3` per ekstensi, langsung siap dipakai.
7. Subfolder, ganti nama, hapus permanen (setelah konfirmasi), dan seret file ke subfolder tercermin di disk, termasuk saat file sedang terbuka.
8. Pencarian menampilkan daftar hasil terpisah: kecocokan nama < 200 ms dan kecocokan isi < 500 ms setelah indeks siap pada folder 1.000 file; klik hasil membuka file.
9. *Gambar baru* dari slash menu membuat file `.excalidraw` di folder catatan dan menampilkan pratinjau di catatan.
10. Pada gambar tersisip, klik dua kali membuka overlay; setelah menggambar dan menutupnya, pratinjau menampilkan hasil terbaru dan file di disk berubah.
11. Di file `.md`, gambar tersisip hanya berupa satu paragraf tautan ke `.excalidraw` tanpa metadata lain; dibuka kembali, blok gambar muncul lagi.
12. Gambar yang file-nya dihapus atau dipindah dari luar menampilkan placeholder, bukan error, dan teks tautan di `.md` tetap ada.
13. Dengan internet dimatikan, semua fitur di atas tetap jalan.
14. Tidak ada kehilangan data saat tab ditutup 2 detik setelah mengetik atau menggambar.

## 13. Rencana kerja bertahap

| Tahap | Isi | Hasil yang bisa diuji |
| --- | --- | --- |
| 1 | **Spike teknis**: proyek Vite + React + TS dengan BlockNote dan Excalidraw berdampingan; blok gambar kustom dengan uji bolak-balik Markdown; cek benturan CSS dan versi React | Keputusan melanjutkan atau mengubah pendekatan sisip gambar |
| 2 | Pilih folder, sidebar pohon dua jenis file, buka editor sesuai ekstensi | Berpindah antara catatan dan gambar |
| 3 | Autosave bersama, indikator, simpan paksa, antrean tulis per file | Tidak ada perubahan hilang |
| 4 | Catatan Baru, Gambar Baru, subfolder, ganti nama, hapus, ingat folder terakhir | Alur harian lengkap |
| 5 | Drag-and-drop dan pencarian (indeks dan daftar hasil) | Merapikan dan menemukan file |
| 6 | Gambar tersisip: slash menu, pratinjau, overlay edit, penyegaran, tautan rusak | Tingkat 2 lengkap |
| 7 | PWA offline penuh, pemuatan malas, perapihan, P1 terpilih, uji kriteria penerimaan | MVP 1 selesai |

## 14. Di luar MVP 1 (backlog)

- Tingkat 3: tautan antar catatan dan gambar, backlink
- Ekspor otomatis `.svg` atau `.png` pendamping agar gambar tampil di aplikasi Markdown lain
- Quick open (Ctrl+P), penyorotan kata di editor, pencarian lanjutan
- Template, file pembuka, aksi *Arsipkan*
- Riwayat versi atau integrasi Git
- Blok kustom lain (misalnya diagram Mermaid), lampiran gambar bitmap di catatan
- Pembungkus Tauri/Electron untuk pintasan global dan akses file tanpa prompt izin
- Kolaborasi real-time

## 15. Pertanyaan terbuka

1. Nama bawaan `New 1.excalidraw` dengan penomoran terpisah dari `New 1.md` sudah sesuai, atau lebih baik satu penomoran bersama?
2. Edit gambar dari catatan lewat overlay layar penuh (usulan), atau membuka gambar di panel editor utama lalu kembali ke catatan?
3. Teks di dalam gambar ikut dicari (F24, P1): perlu naik menjadi P0?
4. Pembaruan tautan otomatis saat gambar diganti nama (F23, P1): cukup P1, atau harus P0 karena menyangkut integritas dokumen?
