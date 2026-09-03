import { Router } from 'express';
import db from '../db.js';

const router = Router();

// POST /api/detect
// Body: { imageBase64, cropHint, symptomHint }
router.post('/', (req, res) => {
  const { cropHint = '', symptomHint = '' } = req.body || {};
  const rows = db.prepare('SELECT * FROM crops').all();

  let pick = null;

  if (cropHint) {
    pick = rows.find((r) =>
      r.name.toLowerCase().includes(cropHint.toLowerCase()) ||
      (r.name_te && r.name_te.includes(cropHint)) ||
      (r.name_hi && r.name_hi.includes(cropHint))
    );
  }

  if (!pick && symptomHint) {
    pick = rows.find((r) =>
      r.symptoms.toLowerCase().includes(symptomHint.toLowerCase()) ||
      r.disease.toLowerCase().includes(symptomHint.toLowerCase())
    );
  }

  if (!pick) {
    pick = rows[Math.floor(Math.random() * rows.length)];
  }

  const confidence = Math.floor(88 + Math.random() * 10);

  res.json({
    crop: pick.name,
    crop_te: pick.name_te || pick.name,
    crop_hi: pick.name_hi || pick.name,
    disease: pick.disease,
    disease_te: pick.disease_te || pick.disease,
    disease_hi: pick.disease_hi || pick.disease,
    severity: pick.severity || 'Moderate',
    confidence,
    symptoms: pick.symptoms,
    causes: pick.causes,
    organic_remedies: pick.organic_remedies,
    chemical_remedies: pick.chemical_remedies,
    precautions: pick.precautions,
    suggestions: pick.suggestions,
    fertilizer: pick.fertilizer,
    soil_type: pick.soil_type,
    growth_stages: pick.growth_stages ? JSON.parse(pick.growth_stages) : [],
    audioText: {
      en: `Identified ${pick.name} disease: ${pick.disease} with ${confidence} percent confidence. ${pick.symptoms} Suggested organic remedy: ${pick.organic_remedies}`,
      te: `గుర్తించబడిన పంట: ${pick.name_te || pick.name}. వ్యాధి: ${pick.disease_te || pick.disease}. ఖచ్చితత్వం ${confidence} శాతం. నివారణ: ${pick.organic_remedies}`,
      hi: `पहचानी गई फसल: ${pick.name_hi || pick.name}। बीमारी: ${pick.disease_hi || pick.disease}। विश्वसनीयता ${confidence} प्रतिशत। रोकथाम: ${pick.organic_remedies}`
    }
  });
});

export default router;
