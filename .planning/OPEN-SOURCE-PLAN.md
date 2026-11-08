# DrawBlock v1.0 — Rencana Open Source, Perbaikan Repo & Keamanan

- **Tanggal:** 2026-11-08
- **Repo:** https://github.com/rivaldoismir/drawblock (saat ini **private**)
- **Situs:** https://drawblock.vercel.app
- **Target:** rilis publik `v1.0.0`, lisensi terbuka, atribusi + ajakan kontribusi
  ke Excalidraw dan BlockNote, ikon PWA yang layak, README persuasif.
- **Status:** ✅ Dipublikasikan 2026-11-08. Repo publik, release `v1.0.0` terbit,
  CI hijau, secret scanning + Dependabot aktif, ikon baru live di Vercel.

## 1. Temuan audit awal

| Area | Status |
| --- | --- |
| `npm run typecheck` | Lulus |
| `npm run test` | Lulus, 28 tes / 5 file |
| Perubahan belum di-commit | `src/App.tsx` — shortcut Ctrl/Cmd+S/P/O; valid & sudah lolos typecheck/test |
| Lisensi | Belum ada `LICENSE`; `package.json` tanpa `license` |
| Metadata repo | Tanpa deskripsi, topik, lisensi; homepage sudah terisi |
| Dokumen komunitas | Belum ada CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, CHANGELOG, CI, template issue/PR |
| Ikon PWA | Placeholder huruf **“E”** di `icon-192.png`, `icon-512.png`, `icon-512-maskable.png` |
| Rahasia/secret | Tidak ditemukan di working tree maupun seluruh history (hanya string uji `file:///etc/passwd`) |
| `npm audit` | 18 temuan (9 high, 5 moderate, 4 low), **0 critical**, seluruhnya dependensi transitif |
| Akses GitHub | `gh` login sebagai `rivaldoismir`, scope `repo`; repo private |

### Ringkasan temuan keamanan dependensi

- **Runtime (ikut ter-bundle):** `@excalidraw/excalidraw` → `@excalidraw/mermaid-to-excalidraw`
  → `mermaid` / `chevrotain` / `lodash-es` / `nanoid`, plus `nanoid` milik Excalidraw.
- **Build-time saja:** `vite-plugin-pwa` → `workbox-build` → `glob` / `minimatch` / `deepmerge`.
- Tidak ada temuan **critical**. Fitur Mermaid tidak dipakai DrawBlock; risiko runtime rendah,
  tetapi tetap akan dicoba diperbaiki dengan `overrides` tanpa mengubah pin paket langsung.

## 2. Fase pekerjaan

### Fase 1 — Identitas, legal, dan metadata

1. `LICENSE` — MIT, pemegang hak **Rivaldo Ismir (2026)**.
2. `package.json`:
   - `version: 1.0.0`, `license: MIT`, `private` dihapus/`false`.
   - `repository`, `homepage`, `bugs`, `author`, `engines` (Node ≥ 20).
3. `THIRD-PARTY-NOTICES.md`:
   - Teks MIT Excalidraw lengkap (copyright 2020 Excalidraw).
   - Notice MPL-2.0 BlockNote (`@blocknote/core`, `react`, `mantine`).
   - Ringkasan lisensi dependensi lain (React, Vite, dsb.).
4. `CHANGELOG.md` dengan entri `1.0.0`.

### Fase 2 — Ikon & branding

1. Rancang `public/icon.svg` baru: latar violet DrawBlock (`#6965db`),
   lembar catatan putih (BlockNote) + pensil/goresan tangan (Excalidraw),
   tanpa huruf/teks agar terbaca di ukuran kecil.
2. Rasterisasi ke:
   - `icon-192.png`, `icon-512.png` (`purpose: any`)
   - `icon-512-maskable.png` (`purpose: maskable`, safe zone 80%)
   - `apple-touch-icon.png` 180×180
   menggunakan `sharp-cli` (npx, tidak menambah dependensi proyek).
3. Perbarui `index.html` (favicon + apple-touch-icon) dan manifest PWA.
4. Opsional: `docs/og-image.png` 1200×630 untuk social preview.

### Fase 3 — Atribusi & ajakan kontribusi di aplikasi

1. Dialog **“Tentang DrawBlock”** di `src/components/Dialogs.tsx`:
   - Versi aplikasi, lisensi MIT, tautan repo DrawBlock.
   - Kartu **Excalidraw** (MIT) dan **BlockNote** (MPL-2.0): deskripsi singkat,
     tombol *GitHub* + *Panduan Kontribusi*.
   - Tombol *Laporkan Bug* / *Berkontribusi ke DrawBlock*.
2. Tombol info di `Toolbar` → membuka dialog; `Esc` menutup.
3. Semua tautan `target="_blank"` + `rel="noopener noreferrer"`.
   Tidak ada request jaringan otomatis → sifat offline tetap utuh.
4. Verifikasi tidak ada `fetch`/CDN baru di bundle.

### Fase 4 — README & tampilan repo

1. `README.md` (Inggris, persuasif):
   - Hero + tagline, badge CI/lisensi/PWA/Chrome-Edge.
   - Tombol besar **Open / Install on Vercel** → https://drawblock.vercel.app.
   - *Why DrawBlock* (lokal, privat, offline, Markdown murni, file milik pengguna).
   - Fitur, quick start, cara pakai, arsitektur singkat, batasan.
   - **Built with / Support upstream**: Excalidraw & BlockNote + tautan kontribusi.
   - Keamanan, lisensi, tautan repo.
2. `README.id.md` — versi Bahasa Indonesia.
3. Deskripsi repo GitHub (Inggris, persuasif) + topics:
   `markdown`, `excalidraw`, `blocknote`, `offline-first`, `pwa`, `local-first`,
   `file-system-access-api`, `note-taking`, `diagram`, `react`.
4. Homepage repo: `https://drawblock.vercel.app`.

### Fase 5 — Komunitas & CI

1. `CONTRIBUTING.md` (setup, aturan arsitektur, commit/PR, verifikasi).
2. `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1).
3. `SECURITY.md` (versi didukung, cara lapor privat, ruang lingkup).
4. `.github/ISSUE_TEMPLATE/bug_report.yml`, `feature_request.yml`, `config.yml`.
5. `.github/pull_request_template.md`.
6. `.github/dependabot.yml` (npm mingguan + GitHub Actions).
7. `.github/workflows/ci.yml`: `npm ci` → typecheck → test → build pada Node 20/22.

### Fase 6 — Keamanan

1. **Secret scan** ulang (working tree + history) — sudah bersih.
2. **Dependensi:** tambahkan `overrides` untuk paket transitif yang punya versi patch:
   `nanoid` (3.3.20), `lodash-es` (4.18.1), `katex` (0.19.1),
   `glob` (14.0.4), `minimatch` (11.0.5), varian `nanoid` milik
   `mermaid-to-excalidraw`. Jalankan ulang audit + build + test.
   Jika ada yang merusak build → kembalikan override tersebut dan catat di `SECURITY.md`.
3. **Header keamanan** `vercel.json` (tanpa CSP ketat yang berisiko merusak editor):
   `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
   `X-Frame-Options`, `Strict-Transport-Security`. Evaluasi CSP di preview;
   jika aman, tambahkan `default-src 'self'` + `img-src`/`font-src`/`worker-src`
   yang diperlukan.
4. **Hardening repo:** `.gitignore` tambah `.env*`, log, OS/editor files.
5. **GitHub settings:** aktifkan Dependabot alerts + security updates,
   secret scanning (gratis untuk repo publik), dan (opsional) branch protection `main`.
6. Verifikasi offline: `npm run build` + `npm run preview`, DevTools Offline,
   pastikan tidak ada request eksternal.

### Fase 7 — Analitik akses (tanpa pelacakan isi)

1. **Vercel Web Analytics** (same-origin, agregat, tanpa cookie) di
   `src/main.tsx`, hanya aktif di host produksi `drawblock.vercel.app`.
2. **GitHub Traffic** untuk views/clones/referrers repo (14 hari) + stars,
   forks, dan unduhan rilis.
3. `npm run stats:repo` (`scripts/repo-stats.mjs`) untuk mencetak angka tersebut.
4. `docs/ANALYTICS.md`: cara mengaktifkan, metrik yang tersedia, batasan
   (pemakaian offline/PWA install tidak terhitung), dan cara opt-out.
5. Perbarui `AGENTS.md` + README: satu-satunya telemetri adalah Vercel Web
   Analytics; tidak ada tracker pihak ketiga.

### Fase 8 — Publikasi

1. Commit terpisah dan jelas; tag `v1.0.0`.
2. Push `main`.
3. Ubah visibilitas repo menjadi **public** (dengan konfirmasi).
4. Set deskripsi, homepage, topics; aktifkan Discussions.
5. Buat GitHub Release `v1.0.0` + catatan rilis.
6. Aktifkan Dependabot alerts/security updates + secret scanning.
7. Verifikasi pasca-rilis: clone bersih → `npm ci` → typecheck/test/build;
   buka https://drawblock.vercel.app; cek ikon PWA terpasang benar.

## 3. Kriteria selesai

- [x] `npm run typecheck && npm run test && npm run build` lulus.
- [x] Ikon PWA baru tampil di 192/512/maskable dan saat install.
- [x] README punya tombol Vercel, atribusi Excalidraw/BlockNote, dan tautan kontribusi.
- [x] Dialog Tentang berfungsi, `Esc` menutup, tautan aman, offline tetap jalan.
- [x] `LICENSE`, `CONTRIBUTING`, `SECURITY`, `CODE_OF_CONDUCT`, `CHANGELOG` ada.
- [x] CI hijau; Dependabot & secret scanning aktif (setelah publish).
- [x] `npm audit` tidak lagi memuat temuan **high**; sisa 4 low build-time
      terdokumentasi di `SECURITY.md`.
- [x] Repo publik, deskripsi/topics terisi, release `v1.0.0` terbit.
- [x] Vercel Analytics + GitHub Traffic terdokumentasi di `docs/ANALYTICS.md`.
- [x] Header keamanan live di https://drawblock.vercel.app (diverifikasi via HEAD).
- [x] Tidak ada request eksternal saat aplikasi dimuat (diverifikasi via CDP).

## 4. Risiko & rollback

| Risiko | Mitigasi |
| --- | --- |
| `overrides` merusak build | Uji build; revert override bermasalah, dokumentasikan |
| CSP memblokir BlockNote/Excalidraw | Uji preview; kirim header tanpa CSP bila perlu |
| Repo publik tidak bisa “ditarik” sepenuhnya | Visibilitas bisa dikembalikan ke private; history sudah dipindai |
| Ikon maskable terpotong | Buat varian maskable terpisah dengan padding 20% |
| Vercel memakai konfigurasi lama | `vercel.json` hanya menambah header, tidak mengubah build |

## 5. Keputusan yang perlu dikonfirmasi

1. Lisensi: **MIT** (disarankan) / Apache-2.0 / GPL-3.0.
2. README utama: **Inggris + README.id.md** (disarankan) / bilingual / Indonesia saja.
3. Publikasi: lakukan push + ubah repo menjadi publik sekarang, atau siapkan lokal dulu.
