# Luna

Situs resmi Luna, asisten suara untuk Windows dan Android. Repo ini hanya berisi situs webnya, bukan aplikasi atau berkas instalasinya.

## Isi repo

- `src/` berisi halaman, komponen, ikon, dan mesin demo percakapan.
- `public/` berisi aset merek dan render karakter.
- `releases/` tidak ada di sini. Installer PC dan APK diunggah lewat GitHub Releases dan ditautkan dari situs.

Model VRM pribadi tidak disimpan di repo ini. Satu-satunya berkas 3D di sini adalah `public/models/sick.vrm`, versi web ringan berlisensi CC0 khusus untuk demo karakter di situs. Model HoYoverse/Wuthering yang dipakai di aplikasi tetap privat dan tidak ikut dibagikan.

## Menjalankan

```bash
npm install
npm run dev
```

Build produksi:

```bash
npm run build
npm run preview
```

## Deploy

Proyek ini disiapkan untuk Vercel dengan root direktori `web`, framework Vite, dan output `dist`. Berkas `vercel.json` sudah memuat pengaturan tersebut.

Alamat unduhan memakai aset GitHub Releases terbaru. Kalau perlu memakai alamat lain, isi variabel berikut saat build:

```bash
VITE_PC_DOWNLOAD_URL=
VITE_APK_DOWNLOAD_URL=
```

Nilai kosong berarti situs memakai alamat rilis bawaan di `src/site.js`.

## Demo

Demo percakapan di situs berjalan sepenuhnya di browser. Ia tidak terhubung ke aplikasi PC, tidak memakai mikrofon, dan tidak menjalankan perintah sungguhan. Tujuannya hanya memperlihatkan pola jawaban Luna.

Bagian "Coba 3D" memuat model VRM 1.0 asli lewat `three` + `@pixiv/three-vrm` (chunk terpisah, baru diunduh saat bagian itu mendekat). Pemutaran, ekspresi, kedip, dan mode bicara semuanya berjalan lokal tanpa server.

## Kredit karakter

- Sick oleh MITUBASINA / MITUBA no Clover (BOOTH #8664885), CC0 1.0. Basis tubuh SiroinoSotai, juga CC0 1.0. Model ini dipakai untuk demo 3D dan boleh didistribusikan ulang sesuai lisensinya.
- Tsukuyomi oleh Rei Yumesaki (夢前黎明), https://tyc.rei-yumesaki.net/material/avatar/3d-a/
- Vita oleh VRoid Project, https://vroid.com/en/studio

Ketentuan tiap model berlaku. Selain `public/models/sick.vrm`, repo ini tidak membagikan berkas VRM aslinya.
