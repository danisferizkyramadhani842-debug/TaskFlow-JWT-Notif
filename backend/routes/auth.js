import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { wajibLogin, JWT_ISSUER, JWT_AUDIENCE } from '../middleware/auth.js';

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', async (req, res, next) => {
  const nama = typeof req.body?.nama === 'string' ? req.body.nama.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!nama || !email || !password) {
    return res.status(400).json({ pesan: 'nama, email, dan password wajib diisi' });
  }
  if (nama.length > 100) return res.status(400).json({ pesan: 'nama maksimal 100 karakter' });
  if (!emailPattern.test(email) || email.length > 150) {
    return res.status(400).json({ pesan: 'format email tidak valid' });
  }
  if (password.length < 8) {
    return res.status(400).json({ pesan: 'password minimal 8 karakter' });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await pool.execute(
      'INSERT INTO users (nama, email, password_hash) VALUES (?, ?, ?)',
      [nama, email, passwordHash],
    );
    return res.status(201).json({ id: result.insertId, nama, email });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ pesan: 'email sudah terdaftar' });
    }
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) {
    return res.status(400).json({ pesan: 'email dan password wajib diisi' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, nama, email, password_hash FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    if (rows.length === 0 || !(await bcrypt.compare(password, rows[0].password_hash))) {
      return res.status(401).json({ pesan: 'email atau password salah' });
    }

    const user = rows[0];
    const token = jwt.sign(
      { email: user.email, nama: user.nama },
      process.env.JWT_SECRET,
      {
        subject: String(user.id),
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithm: 'HS256',
      },
    );
    return res.json({ token, user: { id: user.id, nama: user.nama, email: user.email } });
  } catch (error) {
    return next(error);
  }
});

router.get('/me', wajibLogin, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, nama, email, dibuat_pada FROM users WHERE id = ? LIMIT 1',
      [req.user.sub],
    );
    if (rows.length === 0) return res.status(404).json({ pesan: 'pengguna tidak ditemukan' });
    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
});

export default router;
