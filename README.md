# Pengelola Keuangan (Android, offline)

1. Upload semua file ini ke repository GitHub (branch `main`).
2. Tab **Actions** > workflow **Build APK** berjalan otomatis (atau klik *Run workflow*).
3. Setelah selesai, unduh artifact `pengelola-keuangan-apk`, ekstrak, lalu install `app-debug.apk` di HP
   (izinkan "Install dari sumber tidak dikenal").

Semua library (Excel/PDF) dibundel di dalam APK, jadi benar-benar offline.
Untuk Play Store perlu APK/AAB bertanda tangan (release) dan akun Google Play Developer.

## Ganti nama & logo
- **Nama aplikasi (di HP):** ubah `appName` di `capacitor.config.json`.
- **Nama di dalam aplikasi:** ubah teks `Pengelola Keuangan` di `www/index.html` (tag `<title>` dan `<h1>`).
- **ID aplikasi:** ubah `appId` di `capacitor.config.json` (mis. `com.namaanda.keuangan`).
- **Logo:** timpa file PNG di folder `assets/` dengan ukuran sama:
  `icon-only.png` (1024x1024, ikon penuh), `icon-foreground.png` (1024x1024, logo transparan, taruh di tengah ±60%),
  `icon-background.png` (1024x1024, warna latar), `splash.png` dan `splash-dark.png` (2732x2732).
Commit, lalu workflow akan membuat ikon semua ukuran secara otomatis.
