import { Router } from 'express';
import { pool } from '../db.js';
import { wajibLogin } from '../middleware/auth.js';
import { kirimExpoPush } from '../services/pushService.js';

const router = Router();
const statuses = new Set(['pending', 'in_progress', 'done']);

async function notifikasiUser(userId, payload) {
  const [rows] = await pool.execute(
    'SELECT expo_push_token FROM push_tokens WHERE user_id = ? ORDER BY diperbarui_pada DESC',
    [userId],
  );
  if (rows.length === 0) return { status: 'belum_terdaftar' };

  const hasil = [];
  for (const row of rows) {
    try {
      const ticket = await kirimExpoPush(row.expo_push_token, payload);
      hasil.push({ berhasil: true, ticket });
    } catch (error) {
      console.error('Push gagal:', error.message);
      hasil.push({ berhasil: false, pesan: error.message });
    }
  }
  return { status: hasil.some((item) => item.berhasil) ? 'terkirim_ke_service' : 'gagal', hasil };
}

router.get('/', wajibLogin, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, judul, deskripsi, status, dibuat_pada, diperbarui_pada
       FROM tasks WHERE user_id = ? ORDER BY dibuat_pada DESC`,
      [req.user.sub],
    );
    return res.json({ data: rows });
  } catch (error) {
    return next(error);
  }
});

router.post('/', wajibLogin, async (req, res, next) => {
  const judul = typeof req.body?.judul === 'string' ? req.body.judul.trim() : '';
  const deskripsi = typeof req.body?.deskripsi === 'string' ? req.body.deskripsi.trim() : '';
  if (!judul) return res.status(400).json({ pesan: 'judul tugas wajib diisi' });
  if (judul.length > 150) return res.status(400).json({ pesan: 'judul maksimal 150 karakter' });
  if (deskripsi.length > 3000) return res.status(400).json({ pesan: 'deskripsi maksimal 3000 karakter' });

  try {
    const [result] = await pool.execute(
      'INSERT INTO tasks (user_id, judul, deskripsi) VALUES (?, ?, ?)',
      [req.user.sub, judul, deskripsi || null],
    );
    const [rows] = await pool.execute(
      'SELECT id, judul, deskripsi, status, dibuat_pada, diperbarui_pada FROM tasks WHERE id = ? AND user_id = ?',
      [result.insertId, req.user.sub],
    );
    const notifikasi = await notifikasiUser(req.user.sub, {
      title: 'Tugas baru dibuat',
      body: `Tugas "${judul.slice(0, 90)}" sudah ditambahkan.`,
      data: { screen: 'tasks', taskId: result.insertId },
    });
    return res.status(201).json({ task: rows[0], notifikasi });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', wajibLogin, async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ pesan: 'id tugas tidak valid' });
  }
  try {
    const [rows] = await pool.execute(
      `SELECT id, judul, deskripsi, status, dibuat_pada, diperbarui_pada
       FROM tasks WHERE id = ? AND user_id = ? LIMIT 1`,
      [id, req.user.sub],
    );
    if (rows.length === 0) return res.status(404).json({ pesan: 'tugas tidak ditemukan' });
    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id/status', wajibLogin, async (req, res, next) => {
  const id = Number(req.params.id);
  const status = typeof req.body?.status === 'string' ? req.body.status : '';
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ pesan: 'id tugas tidak valid' });
  if (!statuses.has(status)) {
    return res.status(400).json({ pesan: 'status harus pending, in_progress, atau done' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?',
      [status, id, req.user.sub],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ pesan: 'tugas tidak ditemukan' });
    }
    const [rows] = await pool.execute(
      `SELECT id, judul, deskripsi, status, dibuat_pada, diperbarui_pada
       FROM tasks WHERE id = ? AND user_id = ?`,
      [id, req.user.sub],
    );

    let notifikasi = { status: 'tidak_diperlukan' };
    if (status === 'done') {
      notifikasi = await notifikasiUser(req.user.sub, {
        title: 'Tugas selesai',
        body: `"${rows[0].judul.slice(0, 90)}" ditandai selesai.`,
        data: { screen: 'tasks', taskId: id },
      });
    }
    return res.json({ task: rows[0], notifikasi });
  } catch (error) {
    return next(error);
  }
});

export default router;
