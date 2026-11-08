# DrawBlock

Workspace dokumentasi offline: satu folder berisi catatan Markdown (`.md`) dan
gambar Excalidraw (`.excalidraw`). Sidebar menampilkan keduanya, tiap file
terbuka di editor yang sesuai, dan catatan bisa menautkan gambar lewat tautan
Markdown biasa.

- Catatan: BlockNote, disimpan sebagai Markdown murni.
- Gambar: Excalidraw, disimpan sebagai JSON standar yang bisa dibuka di
  excalidraw.com.
- Offline: PWA dengan font dan aset lokal; tidak ada request jaringan.
- Penyimpanan: File System Access API langsung ke folder pilihan Anda.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
```

Gunakan Chrome atau Edge desktop. Izin baca-tulis diminta saat folder dibuka.

## Build dan uji offline

```bash
npm run typecheck
npm run test
npm run build
npm run preview    # http://localhost:4173
```

Service worker hanya aktif pada build/preview. Setelah halaman terbuka,
DevTools → Network → Offline → reload; semua fitur tetap berjalan.

## Alur singkat

1. **Buka Folder** → pilih folder proyek.
2. **Catatan Baru** / **Gambar Baru** membuat `New 1.md` / `New 1.excalidraw`
   (nomor terkecil, dihitung terpisah per jenis).
3. Klik file di sidebar untuk membuka; perubahan tersimpan otomatis setelah
   ~1–2 detik.
4. Di catatan, ketik `/` → **Tautan ke gambar** untuk menautkan file
   `.excalidraw`. Tautan tersimpan sebagai `[Nama](path.excalidraw)`; klik
   tautan membuka gambar di editor.
5. Klik kanan untuk rename/hapus; F2 untuk rename; seret file ke folder untuk
   memindahkan.
6. Tombol bulan/matahari di toolbar mengganti mode terang/gelap; pilihan
   diingat setelah reload. Default selalu terang.

## Batasan MVP

Tanpa gambar tersisip/pratinjau di catatan, tanpa kolaborasi/cloud, tanpa
dukungan Firefox/Safari, tanpa `@blocknote/xl-*`. Detail keputusan ada di
`.planning/PROJECT.md`; panduan agen di `AGENTS.md`.
