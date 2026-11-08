# Verification Report — DrawBlock MVP 1

Tanggal: 2026-11-08
Lingkungan: Windows, Node 24.14.1, Chrome headless (CDP), build produksi
(`npm run build` + `npm run preview`), workspace = OPFS dengan override
`window.showDirectoryPicker`.

## Gate otomatis

| Perintah | Hasil |
|---|---|
| `npm run typecheck` | PASS |
| `npm run test` | PASS — 5 file, 28 tes |
| `npm run build` | PASS — SW + manifest, precache 452 entri / 25.340 KiB |

Tes unit mencakup: `path`/validasi nama, penomoran `New N` per ekstensi,
`SaveQueue` (debounce, serialisasi per path, konflik, force write, discard),
`SearchIndex` (pemisahan nama/isi, gambar tidak diindeks isinya, snippet),
`linkTarget` (encode/resolve, tolak jalur keluar workspace).

## Uji alur (headless Chrome + CDP)

| Skenario | Hasil |
|---|---|
| Buka folder → pohon hanya `.md` + `.excalidraw`; `node_modules` dan entri titik disembunyikan | PASS |
| Klik `.md` → BlockNote memuat isi; klik `.excalidraw` → Excalidraw + canvas | PASS |
| Catatan Baru → `New 1.md`; Gambar Baru → `New 1.excalidraw` (penomoran terpisah) | PASS |
| Ketik di catatan → tunggu ±2 dtk → isi file berubah di disk | PASS (`Halo otomatis dari smoke.`) |
| Rename lewat klik dua kali → ekstensi dipertahankan (`catatan.md` → `baru.md`), file lama hilang | PASS |
| Folder Baru → `New Folder` | PASS |
| Drag `baru.md` ke folder `arsitektur` → file pindah di disk | PASS |
| Klik kanan → Hapus → dialog konfirmasi → file hilang permanen | PASS |
| Pencarian "otomatis" → seksi **Isi catatan**; pencarian "gambar" → seksi **Nama file** | PASS |
| Tautan `[Gambar](gambar.excalidraw)` di catatan → klik membuka editor gambar | PASS |
| Ubah file dari luar lalu mengetik → dialog konflik muncul; "Muat ulang" menampilkan versi disk; "Timpa" menulis versi editor | PASS |
| Offline: SW aktif, reload dengan Network offline → aplikasi + workspace terakhir pulih | PASS |
| Request eksternal selama pemakaian | 0 (semua same-origin) |
| Error runtime di konsol | 0 |

## Perf

- Build precache 25.340 KiB (font Excalidraw + aset BlockNote), sesuai perkiraan.
- Chunk Excalidraw terpisah dan dimuat malas (hanya saat file gambar pertama dibuka).
- Perf 1.000 file belum diuji pada mesin ini; `collectFiles` dan indeks
  dibangun bertahap dengan yield. Catat sebagai risiko sisa.

## Tidak diuji / risiko sisa

- Uji round-trip `.excalidraw` dengan excalidraw.com dilakukan manual oleh user
  (tidak bisa diotomasi di headless).
- Round-trip seluruh jenis blok BlockNote di luar sampel (paragraf, heading,
  list) belum diekspor manual ke Notepad.
- Perf folder 1.000 file belum diukur formal.
- Drag-drop konflik nama (Ganti / Simpan keduanya / Batal) belum diuji lewat UI,
  tetapi jalur kode `moveConflict` + `moveFileAsCopy` tersedia.
