import { Router } from 'express';
import { pool } from '../db.js';
import { wajibLogin } from '../middleware/auth.js';
import { kirimExpoPush } from '../services/pushService.js';

const router = Router();
const expoTokenPattern = /^(ExponentPushToken|ExpoPushToken)\[[^\]]+\]$/;

router.post('/token', wajibLogin, async (req, res, next) => {
  const expoPushToken = typeof req.body?.expoPushToken === 'string'
    ? req.body.expoPushToken.trim()
    : '';
  if (!expoTokenPattern.test(expoPushToken)) {
    return res.status(400).json({ pesan: 'format Expo Push Token tidak valid' });
  }

  try {
    await pool.execute(
      `INSERT INTO push_tokens (user_id, expo_push_token)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), diperbarui_pada = CURRENT_TIMESTAMP`,
      [req.user.sub, expoPushToken],
    );
    return res.status(201).json({ pesan: 'push token tersimpan' });
  } catch (error) {
    return next(error);
  }
});

router.post('/test', wajibLogin, async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      'SELECT expo_push_token FROM push_tokens WHERE user_id = ? ORDER BY diperbarui_pada DESC',
      [req.user.sub],
    );
    if (rows.length === 0) {
      return res.status(404).json({ pesan: 'perangkat belum mendaftarkan push token' });
    }

    const hasil = [];
    for (const row of rows) {
      try {
        const ticket = await kirimExpoPush(row.expo_push_token, {
          title: 'TaskFlow',
          body: 'Login JWT dan push notification berhasil.',
          data: { screen: 'profile' },
        });
        hasil.push({ token: row.expo_push_token, berhasil: true, ticket });
      } catch (error) {
        hasil.push({ token: row.expo_push_token, berhasil: false, pesan: error.message });
      }
    }

    const adaYangBerhasil = hasil.some((item) => item.berhasil);
    return res.status(adaYangBerhasil ? 200 : 502).json({
      pesan: adaYangBerhasil ? 'notifikasi dikirim ke Expo Push Service' : 'Expo Push Service menolak pengiriman',
      hasil,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
