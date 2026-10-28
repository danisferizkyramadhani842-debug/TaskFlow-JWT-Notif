# TaskFlow - JWT Authentication & Push Notification

Mini-app tugas untuk praktikum Pemrograman Mobile. Backend memakai **Express + MySQL + JWT**, sedangkan aplikasi mobile memakai **React Native + Expo Router**. Access token disimpan di `expo-secure-store`. Push notification menggunakan `expo-notifications` dan Expo Push Service.

> **Catatan bukti dan kredensial:** project ini belum terhubung ke repository GitHub publik karena perlu akun/izin GitHub pemilik tugas. Repository Git lokal sudah disiapkan. URL publik dan screenshot nyata dari Postman/perangkat harus dilengkapi setelah project dijalankan. Jangan mengganti placeholder itu dengan URL atau bukti palsu.

## Fitur
- Register dengan validasi dan password hash bcrypt (cost 12).
- Login menghasilkan JWT dengan expiry, issuer, audience, dan algoritma HS256.
- `GET /auth/me` memerlukan `Authorization: Bearer <token>`.
- Protected routes di Expo Router, pemulihan sesi dari SecureStore, dan logout.
- Manajemen tugas milik pengguna yang sedang login.
- Endpoint pendaftaran Expo Push Token dan endpoint notifikasi uji.
- Notifikasi pada peristiwa pembuatan/perubahan status tugas; payload `screen: "tasks"` mengarahkan aplikasi ke layar tugas.
- Koleksi Postman pada `postman/TaskFlow.postman_collection.json`.

## Teknologi
- Backend: Node.js 20+, Express, MySQL 8, `mysql2`, `bcrypt`, `jsonwebtoken`, `dotenv`.
- Mobile: Expo SDK 54, React Native, Expo Router, SecureStore, Notifications.
- Push Android: perlu development build, EAS project, serta kredensial Firebase FCM v1 sesuai konfigurasi Expo.

## 1. Menyiapkan MySQL

### Pilihan A - Docker
Dari root repository:

```bash
docker compose up -d db
```

Database `db_taskflow` dan tabel dibuat otomatis ketika volume database pertama kali dibuat. Untuk mengulang inisialisasi database development:

```bash
docker compose down -v
docker compose up -d db
```

**Perhatian:** perintah `down -v` menghapus volume database Docker dan semua data lokal di dalamnya.

### Pilihan B - XAMPP / MySQL lokal
1. Nyalakan MySQL di XAMPP.
2. Buka phpMyAdmin dan impor `backend/schema.sql`, atau jalankan file SQL tersebut di MySQL Workbench.
3. Bila kredensial MySQL berbeda dari contoh, sesuaikan file `backend/.env`.

## 2. Menjalankan backend

Dari folder `backend`:

```bash
npm install
```

Salin `.env.example` menjadi `.env`:

- Windows CMD: `copy .env.example .env`
- PowerShell: `Copy-Item .env.example .env`
- macOS/Linux: `cp .env.example .env`

Edit `backend/.env`, khususnya `DB_HOST`, `DB_USER`, `DB_PASSWORD`, dan `JWT_SECRET`. Ganti `JWT_SECRET` dengan nilai acak panjang milik sendiri. Jangan commit `.env`.

Jalankan backend:

```bash
npm run dev
```

Uji health endpoint di browser atau Postman: `GET http://localhost:3000/`. Respons yang diharapkan:

```json
{"pesan":"API TaskFlow Auth & Notification berjalan"}
```

Backend berjalan di `0.0.0.0:3000` supaya perangkat di jaringan yang sama dapat mengaksesnya. Bila port 3000 tertutup atau digunakan aplikasi lain, ubah `PORT` di `.env`.

## 3. Menguji API dengan Postman

1. Import `postman/TaskFlow.postman_collection.json` ke Postman.
2. Pilih collection variables. Default `baseUrl` adalah `http://localhost:3000`.
3. Jalankan request berurutan: Health, Register, Login, Get My Profile, Create Task, List Tasks.
4. Request Login menyimpan JWT ke collection variable `token`; request pembuatan tugas menyimpan `taskId`.
5. Uji skenario error 400, 401, 404, dan 409 dengan request yang tersedia.
6. Untuk endpoint notifikasi, masukkan Expo Push Token yang asli ke variable `expoPushToken` setelah aplikasi memperoleh token. Jangan memakai token contoh/fiktif sebagai bukti push.

## 4. Menjalankan aplikasi mobile

Dari folder `mobile`:

```bash
npm install
```

Salin `.env.example` menjadi `.env` lalu ubah `EXPO_PUBLIC_API_URL`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

Ganti IP contoh dengan IPv4 laptop yang menjalankan backend. Di Windows, jalankan `ipconfig` dan cari IPv4 adapter Wi-Fi/Ethernet. Ponsel dan laptop harus terhubung ke jaringan yang dapat saling berkomunikasi. **Jangan gunakan `localhost` sebagai alamat backend pada ponsel fisik** karena itu menunjuk ke ponsel itu sendiri.

Lalu jalankan:

```bash
npx expo start
```

Scan QR untuk membuka aplikasi. Login, register, profil, dan manajemen tugas dapat diuji setelah backend hidup.

## 5. Mengaktifkan push notification sungguhan

Push remote Android pada konfigurasi Expo modern memerlukan development build, bukan diasumsikan berjalan di Expo Go.

1. Buat/login akun Expo: `npx eas-cli@latest login`.
2. Dari `mobile`, jalankan `npx eas-cli@latest build:configure`.
3. Buat project EAS dan masukkan project ID asli pada `mobile/app.json` di `expo.extra.eas.projectId`.
4. Di Firebase Console, daftarkan aplikasi Android dengan package name `id.ac.uinsa.taskflow`, unduh `google-services.json`, dan letakkan di root folder `mobile`.
5. Atur FCM v1 service account key melalui EAS credentials. **Private key service account tidak boleh masuk Git.**
6. Buat development build Android: `npx eas-cli@latest build --profile development --platform android`.
7. Instal build tersebut, login, pilih Aktifkan Notifikasi, lalu uji Kirim Notifikasi Uji dan pembuatan/perubahan tugas.

`mobile/app.json` sengaja berisi placeholder project ID sampai project EAS milik Anda dibuat. Push remote belum dapat dibuktikan sebelum kredensial dan build perangkat nyata tersedia.

## Daftar endpoint

| Metode | Endpoint | JWT | Fungsi |
|---|---|---:|---|
| GET | `/` | Tidak | Health check |
| POST | `/auth/register` | Tidak | Registrasi akun |
| POST | `/auth/login` | Tidak | Login dan penerbitan JWT |
| GET | `/auth/me` | Ya | Profil pengguna aktif |
| GET | `/tasks` | Ya | Daftar tugas milik pengguna aktif |
| POST | `/tasks` | Ya | Membuat tugas; mencoba mengirim notifikasi |
| GET | `/tasks/:id` | Ya | Detail tugas milik pengguna aktif |
| PATCH | `/tasks/:id/status` | Ya | Mengubah status tugas |
| POST | `/notifications/token` | Ya | Menyimpan Expo Push Token |
| POST | `/notifications/test` | Ya | Mengirim notifikasi uji ke perangkat terdaftar |

## Contoh skenario error

- **400 Bad Request:** register tanpa `nama`, `email`, atau `password`; password kurang dari 8 karakter; atau status tugas tidak valid.
- **401 Unauthorized:** `GET /auth/me` tanpa Bearer token atau token rusak.
- **404 Not Found:** detail tugas yang tidak ada/tidak dimiliki user, atau request notifikasi uji sebelum perangkat mendaftarkan token.
- **409 Conflict:** mendaftarkan email yang sudah terdaftar.

## Struktur repository

```text
TaskFlow-JWT-Notif/
├── backend/
│   ├── server.js, app.js, db.js, schema.sql
│   ├── middleware/auth.js
│   ├── routes/auth.js, tasks.js, notifications.js
│   └── services/pushService.js
├── mobile/
│   ├── app/ (Expo Router screens)
│   ├── context/AuthContext.js
│   ├── services/ (API clients)
│   └── utils/notifications.js
├── postman/TaskFlow.postman_collection.json
├── docs/ (catatan bukti dan ERD)
├── docker-compose.yml
└── README.md
```

## Git: membuat repository publik

Repository lokal sudah mempunyai commit. Buat repository kosong di GitHub tanpa README/license tambahan, kemudian dari root proyek jalankan:

```bash
git remote add origin https://github.com/USERNAME/taskflow-jwt-notif.git
git branch -M main
git push -u origin main
```

Ganti `USERNAME` dengan akun GitHub sendiri dan salin URL repository asli ke halaman Link Git laporan. Jangan menaruh token GitHub atau kredensial lain di file proyek.

## Checklist sebelum pengumpulan

- [ ] Ganti NIM/nama jika ada perubahan data cover.
- [ ] Backend dapat register, login, dan memverifikasi JWT di Postman.
- [ ] Password di MySQL tersimpan sebagai `password_hash`.
- [ ] Uji error 400, 401, 404, 409 dan simpan screenshot Postman asli.
- [ ] Aplikasi mobile dapat register/login, membuka halaman privat, memuat tugas, dan logout.
- [ ] Ambil screenshot aplikasi dari perangkat/emulator asli.
- [ ] Konfigurasikan EAS/FCM dan uji push notification jika fitur push dinilai langsung.
- [ ] Tambahkan URL GitHub publik dan masukkan screenshot riil ke PDF laporan.
- [ ] Pastikan `.env`, `google-services.json` (bila kebijakan repository menganggapnya privat), dan service-account private key tidak ikut terunggah.
