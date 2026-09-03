import { Router } from 'express';

const router = Router();

const SOIL_PROFILES = {
  black: {
    type: 'Black Cotton Soil (Regur / Vertisol)',
    type_te: 'నల్ల రేగడి నేల',
    type_hi: 'काली मिट्टी (रेगुर)',
    color: 'Dark Brown to Deep Black',
    texture: 'Clayey, high swelling and shrinkage capacity',
    phRange: '7.2 - 8.5 (Slightly Alkaline)',
    organicCarbon: 'Medium (0.45 - 0.65%)',
    nitrogenStatus: 'Low to Medium',
    phosphorusStatus: 'Low',
    potassiumStatus: 'High',
    waterHoldingCapacity: 'Very High (Retains moisture well during dry spells)',
    suitableCrops: ['Cotton', 'Sugarcane', 'Maize', 'Soybean', 'Chilli', 'Wheat', 'Pulses'],
    remedies: [
      'Apply Gypsum @ 500 kg/ha if drainage is sluggish.',
      'Incorporate Farmyard Manure (FYM) or green manuring (Sunhemp/Dhaincha) to improve aeration.',
      'Avoid tillage when soil is overly wet to prevent compaction.'
    ]
  },
  red: {
    type: 'Red Sandy Loam Soil (Alfisols)',
    type_te: 'ఎర్ర నేల / ఇసుక రేగడి నేల',
    type_hi: 'लाल रेतीली दोमट मिट्टी',
    color: 'Reddish Brown to Deep Red (Rich in Iron oxides)',
    texture: 'Porous, light to medium loam with rapid drainage',
    phRange: '6.0 - 7.0 (Slightly Acidic to Neutral)',
    organicCarbon: 'Low to Medium (0.35 - 0.50%)',
    nitrogenStatus: 'Low',
    phosphorusStatus: 'Medium (Fixation prone)',
    potassiumStatus: 'Medium',
    waterHoldingCapacity: 'Moderate (Requires frequent light irrigations)',
    suitableCrops: ['Groundnut (Peanut)', 'Tomato', 'Brinjal', 'Mango', 'Pulses', 'Millets', 'Banana'],
    remedies: [
      'Apply agricultural lime @ 250-500 kg/ha if pH drops below 6.0.',
      'Regular application of Vermicompost (2 t/ha) to enhance water retention.',
      'Split nitrogen applications across growth stages to avoid leaching.'
    ]
  },
  alluvial: {
    type: 'Alluvial Loamy Soil (Inceptisols / Entisols)',
    type_te: 'ఒండ్రు మట్టి / నదీ తీర నేల',
    type_hi: 'जलोढ़ दोमट मिट्टी',
    color: 'Light Grey to Ash Brown',
    texture: 'Well-balanced loam / silt loam',
    phRange: '6.5 - 7.5 (Ideal Neutral)',
    organicCarbon: 'High (0.60 - 0.90%)',
    nitrogenStatus: 'Medium',
    phosphorusStatus: 'Medium to High',
    potassiumStatus: 'Adequate',
    waterHoldingCapacity: 'High & Well Aerated',
    suitableCrops: ['Rice (Paddy)', 'Wheat', 'Sugarcane', 'Tomato', 'Vegetables', 'Potato', 'Pulses'],
    remedies: [
      'Maintain balanced NPK fertilization as per crop requirement.',
      'Rotate with leguminous pulses to maintain biological soil fertility.',
      'Apply biofertilizers (Azospirillum / PSB @ 5 kg/ha).'
    ]
  },
  sandy: {
    type: 'Sandy Coastal / Riverbed Soil',
    type_te: 'ఇసుక నేల / తీరప్రాంత నేల',
    type_hi: 'बलुई / रेतीली मिट्टी',
    color: 'Yellowish Light Brown',
    texture: 'Coarse sand with high permeability',
    phRange: '6.0 - 7.2',
    organicCarbon: 'Very Low (<0.3%)',
    nitrogenStatus: 'Low (Severe leaching)',
    phosphorusStatus: 'Low',
    potassiumStatus: 'Low',
    waterHoldingCapacity: 'Low (Dries out quickly)',
    suitableCrops: ['Coconut', 'Watermelon', 'Groundnut', 'Cashew', 'Vegetables with drip irrigation'],
    remedies: [
      'Heavy mulching with paddy straw or coir pith to retain soil moisture.',
      'Adopt Drip fertigation to feed nutrients directly to root zones.',
      'Apply tank silt or bentonite clay to improve soil texture permanently.'
    ]
  }
};

// POST /api/soil/analyze
// Body: { soilColor, soilTexture, region, phEstimated }
router.post('/analyze', (req, res) => {
  const { soilColor = 'black', soilTexture = 'clayey' } = req.body;

  let key = 'black';
  const text = (soilColor + ' ' + soilTexture).toLowerCase();

  if (text.includes('red') || text.includes('brown')) {
    key = 'red';
  } else if (text.includes('alluvial') || text.includes('silt') || text.includes('grey') || text.includes('loam')) {
    key = 'alluvial';
  } else if (text.includes('sand') || text.includes('yellow') || text.includes('coarse')) {
    key = 'sandy';
  } else {
    key = 'black';
  }

  const profile = SOIL_PROFILES[key];

  res.json({
    soilType: profile.type,
    soilType_te: profile.type_te,
    soilType_hi: profile.type_hi,
    colorDescription: profile.color,
    texture: profile.texture,
    phEstimated: profile.phRange,
    organicCarbon: profile.organicCarbon,
    npkStatus: {
      nitrogen: profile.nitrogenStatus,
      phosphorus: profile.phosphorusStatus,
      potassium: profile.potassiumStatus
    },
    waterHoldingCapacity: profile.waterHoldingCapacity,
    recommendedCrops: profile.suitableCrops,
    managementTips: profile.remedies,
    disclaimer: 'Visual scanning provides indicative guidance. For precision input planning, test your soil samples at your nearest Govt Soil Testing Lab (KVK / Krishi Bhavan).'
  });
});

export default router;
