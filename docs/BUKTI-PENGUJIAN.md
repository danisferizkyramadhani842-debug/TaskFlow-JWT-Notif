# Bukti pengujian yang harus diambil setelah menjalankan project

Halaman ini bukan bukti screenshot. Gunakan checklist untuk mendapatkan bukti nyata di PC/HP.

## Screenshot Postman
1. `POST /auth/register` sukses (201) dan respons tidak memuat password.
2. `POST /auth/login` sukses (200) dan respons memuat token JWT.
3. `GET /auth/me` tanpa Authorization (401), lalu dengan Bearer token (200).
4. Skenario error 400 dan 409.
5. `GET /tasks`, `POST /tasks`, dan `PATCH /tasks/:id/status` dengan token aktif.
6. Setelah EAS/FCM siap: `POST /notifications/token` dan `POST /notifications/test` yang berhasil.

## Screenshot aplikasi mobile
1. Layar registrasi.
2. Layar login.
3. Dashboard setelah login (halaman privat).
4. Daftar dan pembuatan tugas.
5. Layar profil (data `/auth/me`).
6. Notifikasi yang diterima pada perangkat nyata.

Simpan screenshot ke PDF laporan atau folder `docs/evidence/` dan pastikan tidak ada JWT lengkap, password, atau service-account key yang terlihat di screenshot.
