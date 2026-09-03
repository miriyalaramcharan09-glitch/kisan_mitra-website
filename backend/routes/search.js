import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/search?q=cotton
router.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json({ results: [] });

  const term = `%${q}%`;

  // Search crops
  const cropRows = db
    .prepare(
      `SELECT id, name, name_te, name_hi, disease, disease_te, disease_hi, severity, 'crop' as type
       FROM crops
       WHERE name LIKE ? OR name_te LIKE ? OR name_hi LIKE ? OR disease LIKE ? OR disease_te LIKE ? OR disease_hi LIKE ?
       LIMIT 8`
    )
    .all(term, term, term, term, term, term);

  // Search pests
  const pestRows = db
    .prepare(
      `SELECT id, name, name_te, name_hi, symptoms, 'pest' as type
       FROM pests
       WHERE name LIKE ? OR name_te LIKE ? OR name_hi LIKE ? OR symptoms LIKE ?
       LIMIT 4`
    )
    .all(term, term, term, term);

  // Search alerts
  const alertRows = db
    .prepare(
      `SELECT id, title, title_te, title_hi, crop, severity, 'alert' as type
       FROM alerts
       WHERE title LIKE ? OR title_te LIKE ? OR title_hi LIKE ? OR crop LIKE ?
       LIMIT 3`
    )
    .all(term, term, term, term);

  const results = [
    ...cropRows.map((r) => ({
      id: `crop-${r.id}`,
      name: `${r.name} (${r.disease})`,
      name_te: `${r.name_te || r.name} (${r.disease_te || r.disease})`,
      name_hi: `${r.name_hi || r.name} (${r.disease_hi || r.disease})`,
      type: 'crop',
      cropId: r.id,
      cropName: r.name,
      disease: r.disease,
      severity: r.severity
    })),
    ...pestRows.map((r) => ({
      id: `pest-${r.id}`,
      name: r.name,
      name_te: r.name_te || r.name,
      name_hi: r.name_hi || r.name,
      type: 'pest',
      pestId: r.id
    })),
    ...alertRows.map((r) => ({
      id: `alert-${r.id}`,
      name: `⚠️ ${r.title} (${r.crop})`,
      name_te: `⚠️ ${r.title_te || r.title} (${r.crop})`,
      name_hi: `⚠️ ${r.title_hi || r.title} (${r.crop})`,
      type: 'alert',
      alertId: r.id
    }))
  ];

  res.json({ results });
});

export default router;
