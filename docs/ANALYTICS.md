# Melihat akses DrawBlock

Ada dua pertanyaan berbeda yang sering tercampur:

1. **Berapa orang membuka aplikasinya?** → Vercel Web Analytics.
2. **Berapa orang melihat/clone repo GitHub-nya?** → GitHub Traffic.

Keduanya tidak memakai cookie pelacak pihak ketiga dan tidak pernah melihat isi
catatan pengguna.

## 1. Akses aplikasi: Vercel Web Analytics

DrawBlock memakai **Vercel Web Analytics** untuk demo di
https://drawblock.vercel.app.

### Cara mengaktifkan (sekali saja)

1. Buka [dashboard Vercel](https://vercel.com/dashboard) → proyek **drawblock**.
2. Masuk ke tab **Analytics**.
3. Klik **Enable** (Web Analytics).
4. Deploy ulang (push ke `main`, atau **Redeploy** dari dashboard).

Kode `inject()` sudah ada di `src/main.tsx`; tanpa langkah di atas, skrip tidak
akan menghasilkan data.

### Yang bisa dilihat

- **Visitors** dan **Page views** per hari/minggu/bulan.
- **Top pages** (praktisnya hanya `/`).
- **Referrers** — dari mana pengunjung datang (GitHub, Google, dsb.).
- **Devices**, **browsers**, dan **countries** (agregat).
- **Bounce rate** dan durasi kunjungan (estimasi).

### Batasan penting

- Hanya menghitung **kunjungan online**. Sesi offline, PWA yang dibuka tanpa
  jaringan, dan pemakaian lokal **tidak terhitung**.
- Tidak ada identitas pengguna, cookie, atau fingerprint. Angka “visitors”
  adalah perkiraan unik, bukan orang yang terverifikasi.
- **Install PWA tidak terhitung terpisah.** Yang terlihat adalah kunjungan
  halaman, bukan jumlah instalasi.
- Free tier Vercel Web Analytics punya kuota event bulanan; lihat dashboard
  untuk batas terbaru.
- Skrip hanya berjalan di host produksi (`drawblock.vercel.app`). Preview lokal
  dan `npm run preview` tidak mengirim data.

### Menonaktifkan

Hapus blok `inject()` di `src/main.tsx`, atau matikan Analytics di dashboard
Vercel. Aplikasi tetap berfungsi penuh; tidak ada fitur yang bergantung padanya.

## 2. Akses repo: GitHub Traffic

Buka **repo → Insights → Traffic**. GitHub menampilkan data 14 hari terakhir:

- **Views** — berapa kali halaman repo dilihat (total dan unik).
- **Clones** — berapa kali repo di-clone (total dan unik).
- **Referring sites** — dari mana pengunjung repo datang.
- **Popular content** — halaman/file repo yang paling sering dibuka.

Tambahan yang tersedia tanpa batas 14 hari:

- **Stars / forks / watchers** di halaman utama repo.
- **Release downloads** di halaman Releases (per aset).
- **Issue/PR activity** di tab Issues dan Pull requests.

### Lewat terminal

```bash
npm run stats:repo
```

Script `scripts/repo-stats.mjs` memanggil `gh api` dan mencetak:

- total views + uniques 14 hari,
- total clones + uniques 14 hari,
- referrer teratas,
- path repo terpopuler,
- stars, forks, open issues,
- unduhan per aset rilis.

Prasyarat: [GitHub CLI](https://cli.github.com/) sudah login (`gh auth login`)
dan akun punya akses ke repo. Tidak ada token yang disimpan di repo.

Perintah manual:

```bash
gh api repos/rivaldoismir/drawblock/traffic/views
gh api repos/rivaldoismir/drawblock/traffic/clones
gh api repos/rivaldoismir/drawblock/traffic/popular/referrers
gh api repos/rivaldoismir/drawblock/traffic/popular/paths
gh api repos/rivaldoismir/drawblock/releases
```

### Batasan GitHub Traffic

- Hanya **14 hari terakhir**; tidak ada histori jangka panjang lewat UI/API.
- “Views” adalah tampilan halaman repo, bukan jumlah orang yang benar-benar
  memakai aplikasi.
- Clone otomatis oleh CI/bot ikut terhitung sebagai clone (unik dikurangi).
- Repo private juga punya Traffic, tetapi hanya bisa dilihat pemilik.

## 3. Angka yang tidak bisa diukur tanpa telemetri

Karena DrawBlock offline-first dan tidak mengirim isi catatan:

- Jumlah **pembukaan aplikasi secara offline** tidak diketahui.
- Jumlah **instalasi PWA** tidak diketahui.
- Jumlah **file/folder yang dibuka** tidak diketahui.
- **Retensi** pengguna lokal tidak diketahui.

Jika angka-angka itu penting, satu-satunya cara adalah telemetri opt-in yang
mengirim event (mis. “app_opened”) ke server. Itu keputusan produk baru dan
harus didokumentasikan di README + SECURITY, karena mengubah janji privasi
proyek. Rekomendasi saat ini: **jangan** menambahkannya; gunakan Vercel
Analytics + GitHub Traffic sebagai indikator minat.

## 4. Ringkasan privasi

| Sumber | Apa yang dikirim | Cookie | Isi catatan |
| --- | --- | --- | --- |
| Vercel Web Analytics | URL halaman, referrer, perangkat, negara (agregat) | Tidak | Tidak pernah |
| GitHub Traffic | Metadata repo (views/clones) | Tidak | Tidak pernah |
| DrawBlock sendiri | Tidak ada | Tidak | Tidak pernah |

Tidak ada Google Analytics, Meta Pixel, session replay, atau tracker pihak
ketiga lainnya.
