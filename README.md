# Pengelola Keuangan (Android, offline)

1. Upload semua file ini ke repository GitHub (branch `main`).
2. Workflow **Build APK** berjalan saat Anda membuat tag versi (lihat bagian *Rilis versi baru*) atau lewat tab **Actions** > *Run workflow*.
3. Setelah selesai, unduh artifact `pengelola-keuangan-apk`, ekstrak, lalu install `app-debug.apk` di HP
   (izinkan "Install dari sumber tidak dikenal").

Semua library (Excel/PDF) dibundel di dalam APK, jadi benar-benar offline.
Untuk Play Store perlu APK/AAB bertanda tangan (release) dan akun Google Play Developer.

## Ganti nama & logo
- **Nama aplikasi (di HP):** ubah `appName` di `capacitor.config.json`.
- **Nama di dalam aplikasi:** ubah teks `Pengelola Keuangan` di `www/index.html` (tag `<title>` dan `<h1>`).
- **Tampilan:** warna & tema ada di `www/css/app.css` (bagian `:root`). Ikon kategori/dompet berupa SVG di `www/js/icons.js`; tambah ikon baru dengan menambah entri di objek `P` dan daftar `PICKABLE`.
- **ID aplikasi:** ubah `appId` di `capacitor.config.json` (mis. `com.namaanda.keuangan`).
- **Logo:** timpa file PNG di folder `assets/` dengan ukuran sama:
  `icon-only.png` (1024x1024, ikon penuh), `icon-foreground.png` (1024x1024, logo transparan, taruh di tengah ±60%),
  `icon-background.png` (1024x1024, warna latar), `splash.png` dan `splash-dark.png` (2732x2732).
Commit, lalu workflow akan membuat ikon semua ukuran secara otomatis.

## Rilis versi baru
```
git tag v1.0.1
git push origin v1.0.1
```
Workflow berjalan otomatis, memakai `1.0.1` sebagai versionName dan menghitung versionCode (1.0.1 -> 10001),
lalu membuat halaman **Releases** di GitHub berisi file `Pengelola-Keuangan-v1.0.1.apk`.
Setiap versi berikutnya harus lebih besar agar APK baru bisa menimpa yang lama tanpa uninstall.
Format tag harus `vMAJOR.MINOR.PATCH`.

## Update tanpa uninstall
APK ditandatangani dengan kunci tetap di `keystore/pengelola.keystore` (bukan kunci acak tiap build), sehingga versi baru dengan
`versionCode` lebih besar bisa langsung menimpa versi lama. **Jangan hapus/ganti file keystore** — kalau berganti, HP akan menolak update.
Catatan: jika repository ini publik, siapa pun bisa memakai kunci tersebut; jadikan repository private bila perlu.

## Laporan Excel
Ekspor Excel dibuat oleh `www/js/report.js` + `www/js/xlsxwriter.js` (tanpa library tambahan). Isinya 4 sheet:
**Ringkasan** (kartu total, rekap bulanan, per kategori, posisi dompet — semua rumus), **Transaksi**, **Dompet**, **Kategori**.
Tiga sheet terakhir tetap bisa diimpor kembali ke aplikasi.
