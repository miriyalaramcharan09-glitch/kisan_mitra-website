import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/alerts
router.get('/', (req, res) => {
  const { crop, severity } = req.query;
  let query = 'SELECT * FROM alerts WHERE 1=1';
  const params = [];

  if (crop) {
    query += ' AND crop LIKE ?';
    params.push(`%${crop}%`);
  }
  if (severity) {
    query += ' AND severity = ?';
    params.push(severity);
  }

  query += " ORDER BY CASE severity WHEN 'High' THEN 1 WHEN 'Moderate' THEN 2 ELSE 3 END";

  const rows = db.prepare(query).all(...params);
  res.json({ alerts: rows, total: rows.length });
});

export default router;
