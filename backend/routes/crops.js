import { Router } from 'express';
import db from '../db.js';

const router = Router();

// GET /api/crops
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM crops ORDER BY id ASC').all();
  const parsed = rows.map((r) => ({
    ...r,
    growth_stages: r.growth_stages ? JSON.parse(r.growth_stages) : []
  }));
  res.json({ crops: parsed });
});

// GET /api/crops/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM crops WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Crop not found' });

  res.json({
    ...row,
    growth_stages: row.growth_stages ? JSON.parse(row.growth_stages) : []
  });
});

// POST /api/crops/calculate-fertilizer
// Body: { cropId, area, unit: 'acres' | 'hectares' }
router.post('/calculate-fertilizer', (req, res) => {
  const { cropId, area = 1, unit = 'acres' } = req.body;
  const crop = db.prepare('SELECT * FROM crops WHERE id = ?').get(cropId);
  if (!crop) return res.status(404).json({ error: 'Crop not found' });

  // Convert area to hectares for base calculation (1 ha = 2.471 acres)
  const areaInHa = unit === 'acres' ? area / 2.471 : area;

  // Standard NPK requirements per ha
  const npkDefaults = {
    1: { n: 120, p: 80, k: 100 }, // Tomato
    2: { n: 120, p: 60, k: 40 },  // Rice
    3: { n: 150, p: 60, k: 60 },  // Cotton
    4: { n: 120, p: 60, k: 60 },  // Chilli
    5: { n: 120, p: 60, k: 40 },  // Maize
    6: { n: 20, p: 40, k: 40 },   // Groundnut
    7: { n: 250, p: 100, k: 120 },// Sugarcane
    8: { n: 200, p: 50, k: 300 }, // Banana
    9: { n: 100, p: 50, k: 100 }, // Mango
    10: { n: 100, p: 50, k: 50 }, // Paddy fine
    11: { n: 120, p: 60, k: 40 }, // Wheat
    12: { n: 100, p: 50, k: 50 }, // Brinjal
    13: { n: 100, p: 50, k: 50 }, // Okra
    14: { n: 150, p: 100, k: 120 },// Potato
    15: { n: 20, p: 50, k: 20 },  // Pulses
    16: { n: 100, p: 60, k: 200 },// Coconut
  };

  const npk = npkDefaults[crop.id] || { n: 100, p: 50, k: 50 };

  const totalN = Math.round(npk.n * areaInHa);
  const totalP = Math.round(npk.p * areaInHa);
  const totalK = Math.round(npk.k * areaInHa);

  // Common fertilizer commercial bags (50kg each):
  // DAP (18% N, 46% P) -> P from DAP = totalP / 0.46 kg DAP -> bags
  const dapKg = Math.round(totalP / 0.46);
  const dapBags = (dapKg / 50).toFixed(1);
  const nFromDap = dapKg * 0.18;

  // Remaining N supplied by Urea (46% N)
  const remainingN = Math.max(0, totalN - nFromDap);
  const ureaKg = Math.round(remainingN / 0.46);
  const ureaBags = (ureaKg / 50).toFixed(1);

  // MOP (60% K2O)
  const mopKg = Math.round(totalK / 0.6);
  const mopBags = (mopKg / 50).toFixed(1);

  // Organic alternatives
  const fymTonnes = (areaInHa * 10).toFixed(1);
  const vermicompostKg = Math.round(areaInHa * 2000);
  const neemCakeKg = Math.round(areaInHa * 250);
  const jeevamruthamLiters = Math.round(areaInHa * 500);

  res.json({
    crop: {
      id: crop.id,
      name: crop.name,
      name_te: crop.name_te,
      name_hi: crop.name_hi,
      soil_type: crop.soil_type,
      growth_stages: crop.growth_stages ? JSON.parse(crop.growth_stages) : []
    },
    area: Number(area),
    unit,
    areaInHa: Number(areaInHa.toFixed(2)),
    npkRequirement: {
      nitrogen: `${totalN} kg`,
      phosphorus: `${totalP} kg`,
      potassium: `${totalK} kg`
    },
    commercialFertilizers: {
      urea: {
        totalKg: ureaKg,
        bags50kg: Number(ureaBags),
        applicationSchedule: 'Split: 50% basal (or early vegetative) + 50% top-dressing during active growth.'
      },
      dap: {
        totalKg: dapKg,
        bags50kg: Number(dapBags),
        applicationSchedule: '100% applied as basal dose at sowing/transplanting time.'
      },
      mop: {
        totalKg: mopKg,
        bags50kg: Number(mopBags),
        applicationSchedule: '50% basal + 50% at flowering/fruiting stage.'
      }
    },
    organicAlternatives: {
      fym: `${fymTonnes} tonnes well-decomposed Farmyard Manure (FYM)`,
      vermicompost: `${vermicompostKg} kg Vermicompost`,
      neemCake: `${neemCakeKg} kg Neem Cake (repels root nematodes & slows nitrogen leaching)`,
      jeevamrutham: `${jeevamruthamLiters} liters Liquid Jeevamrutham (apply via irrigation every 15 days)`
    },
    recommendationNote: crop.fertilizer
  });
});

export default router;
