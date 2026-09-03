import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/pests
router.get('/', (req, res) => {
  const crop = req.query.crop;
  const rows = db.prepare('SELECT * FROM pests').all();
  let parsed = rows.map((r) => ({
    ...r,
    target_crops: r.target_crops ? JSON.parse(r.target_crops) : []
  }));

  if (crop) {
    const cropLower = crop.toLowerCase();
    parsed = parsed.filter((p) =>
      p.target_crops.some((c) => c.toLowerCase().includes(cropLower))
    );
  }

  res.json({ pests: parsed });
});

// GET /api/pests/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM pests WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Pest not found' });

  res.json({
    ...row,
    target_crops: row.target_crops ? JSON.parse(row.target_crops) : []
  });
});

// POST /api/pests/identify
// Body: { symptoms, cropName }
router.post('/identify', (req, res) => {
  const { symptoms = '', cropName = '' } = req.body;
  const rows = db.prepare('SELECT * FROM pests').all();
  const parsed = rows.map((r) => ({
    ...r,
    target_crops: r.target_crops ? JSON.parse(r.target_crops) : []
  }));

  // Score matching
  const scored = parsed.map((p) => {
    let score = 50;
    if (cropName && p.target_crops.some((c) => c.toLowerCase().includes(cropName.toLowerCase()))) {
      score += 30;
    }
    const symWords = symptoms.toLowerCase().split(/\s+/).filter(Boolean);
    symWords.forEach((word) => {
      if (p.symptoms.toLowerCase().includes(word) || p.identification.toLowerCase().includes(word)) {
        score += 15;
      }
    });
    return { ...p, matchConfidence: Math.min(96, Math.max(65, score)) };
  });

  scored.sort((a, b) => b.matchConfidence - a.matchConfidence);

  res.json({
    identifiedPest: scored[0] || parsed[0],
    alternatives: scored.slice(1, 3)
  });
});

export default router;
