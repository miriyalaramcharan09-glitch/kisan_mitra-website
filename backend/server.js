import express from 'express';
import cors from 'cors';
import searchRouter from './routes/search.js';
import detectRouter from './routes/detect.js';
import cropsRouter from './routes/crops.js';
import pestsRouter from './routes/pests.js';
import alertsRouter from './routes/alerts.js';
import weatherRouter from './routes/weather.js';
import soilRouter from './routes/soil.js';

const app = express();

// CORS — in production set FRONTEND_URL to your deployed frontend URL
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : true; // allow all in dev
app.use(cors({ origin: allowedOrigins }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/search', searchRouter);
app.use('/api/detect', detectRouter);
app.use('/api/crops', cropsRouter);
app.use('/api/pests', pestsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/soil', soilRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// 404 fallback for unknown API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler — prevents unhandled crashes
app.use((err, req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Kisan Mitra backend running on http://localhost:${PORT}`));
