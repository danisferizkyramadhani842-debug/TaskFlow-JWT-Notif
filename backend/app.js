import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import notificationRoutes from './routes/notifications.js';
import taskRoutes from './routes/tasks.js';

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '32kb' }));

app.get('/', (_req, res) => {
  res.json({ pesan: 'API TaskFlow Auth & Notification berjalan' });
});
app.use('/auth', authRoutes);
app.use('/notifications', notificationRoutes);
app.use('/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ pesan: `endpoint ${req.method} ${req.path} tidak ditemukan` });
});

app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ pesan: 'JSON request tidak valid' });
  }
  console.error(error);
  return res.status(500).json({ pesan: 'terjadi kesalahan pada server' });
});

export default app;
