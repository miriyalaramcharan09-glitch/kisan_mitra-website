import { Router } from 'express';
import db from '../db.js';
import { classifyPlantCondition } from '../services/visualClassifier.js';
import { analyzePlantWithGemini } from '../services/geminiVision.js';

const router = Router();

// POST /api/detect
// Body: { imageBase64, cropHint, symptomHint, apiKey }
router.post('/', async (req, res) => {
  try {
    const { cropHint = '', symptomHint = '', imageBase64 = '', apiKey: customApiKey = '' } = req.body || {};
    const headerApiKey = req.headers['x-gemini-api-key'] || '';
    const geminiKey = (customApiKey || headerApiKey || process.env.GEMINI_API_KEY || '').trim();

    // 1. If Gemini API Key is provided, use Google Gemini 1.5 Flash Vision AI
    if (geminiKey && imageBase64) {
      try {
        console.log('🤖 Running diagnosis via Google Gemini Vision AI...');
        const geminiResult = await analyzePlantWithGemini({
          apiKey: geminiKey,
          imageBase64,
          cropHint,
          symptomHint,
        });
        return res.json(geminiResult);
      } catch (geminiErr) {
        console.warn('⚠️ Gemini Vision failed, falling back to Agronomy Visual Classifier:', geminiErr.message);
      }
    }

    // 2. Offline / Built-in Visual Classifier & Agronomic Matcher
    const rows = db.prepare('SELECT * FROM crops').all();
    if (!rows || rows.length === 0) {
      return res.status(503).json({ error: 'Crop database is empty. Please check backend seed data.' });
    }

    const diagnosis = classifyPlantCondition(rows, {
      cropHint,
      symptomHint,
      imageBase64,
    });

    if (!diagnosis) {
      return res.status(500).json({ error: 'Failed to classify plant image.' });
    }

    return res.json(diagnosis);
  } catch (err) {
    console.error('Detect route error:', err);
    res.status(500).json({ error: 'Detection failed: ' + err.message });
  }
});

export default router;
