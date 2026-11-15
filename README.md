# Luna

Situs resmi Luna, asisten suara untuk Windows dan Android. Repo ini hanya berisi situs webnya, bukan aplikasi atau berkas instalasinya.

## Isi repo

- `src/` berisi halaman, komponen, ikon, dan mesin demo percakapan.
- `public/` berisi aset merek dan render karakter.
- `releases/` tidak ada di sini. Installer PC dan APK diunggah lewat GitHub Releases dan ditautkan dari situs.

Model VRM mentah tidak disimpan di repo ini. Yang ada hanya gambar hasil render untuk keperluan tampilan situs.

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

Demo di situs berjalan sepenuhnya di browser. Ia tidak terhubung ke aplikasi PC, tidak memakai mikrofon, dan tidak menjalankan perintah sungguhan. Tujuannya hanya memperlihatkan pola jawaban Luna.

## Kredit karakter

- Tsukuyomi oleh Rei Yumesaki (夢前黎明), https://tyc.rei-yumesaki.net/material/avatar/3d-a/
- Vita oleh VRoid Project, https://vroid.com/en/studio

Ketentuan tiap model berlaku. Repo ini tidak membagikan berkas VRM aslinya.
