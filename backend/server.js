import 'dotenv/config';
import app from './app.js';
import { cekKoneksiDatabase, pool } from './db.js';

const PORT = Number(process.env.PORT || 3000);

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET wajib diisi dengan secret acak minimal 32 karakter. Periksa backend/.env.');
  process.exit(1);
}

try {
  await cekKoneksiDatabase();
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskFlow API berjalan di http://localhost:${PORT}`);
  });

  async function shutdown() {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  }
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (error) {
  console.error('Server gagal dimulai:', error.message);
  process.exit(1);
}
