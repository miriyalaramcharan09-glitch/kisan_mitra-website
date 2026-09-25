/**
 * Gemini Multimodal Vision Diagnostic Service
 * Uses Google Gemini 1.5 Flash to perform true visual plant pathology diagnosis.
 */

export async function analyzePlantWithGemini({ apiKey, imageBase64, cropHint = '', symptomHint = '' }) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    throw new Error('No Gemini API key provided.');
  }

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new Error('No image provided for Gemini Vision analysis.');
  }

  // Extract pure base64 and mime type
  let mimeType = 'image/jpeg';
  let pureBase64 = imageBase64;
  const match = imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
  if (match) {
    mimeType = match[1];
    pureBase64 = match[2];
  }

  const systemInstruction = `
You are an expert plant pathologist, agronomist, and agricultural AI assistant specialized in Indian and global farming crops.
You will receive an image of a plant leaf/crop and optional context (Crop hint: "${cropHint || 'Unknown'}", Symptom hint: "${symptomHint || 'None'}").

Carefully inspect the visual details of the leaf: lesion shapes, margins, spots, fungal spores, insect damage, color variations, chlorosis, vein banding, necrosis, or signs of healthy foliage.

Respond ONLY with a valid JSON object strictly matching this schema:
{
  "crop": "Common English Crop Name (e.g. Tomato, Rice, Cotton, Chilli, etc.)",
  "crop_te": "Crop name in Telugu (e.g. టమోటా, వరి, ప్రత్తి)",
  "crop_hi": "Crop name in Hindi (e.g. टमाटर, धान, कपास)",
  "disease": "Exact Disease or Pest Name or 'Healthy Plant (No Disease Detected)'",
  "disease_te": "Disease name in Telugu",
  "disease_hi": "Disease name in Hindi",
  "severity": "Healthy" | "Low" | "Moderate" | "High" | "Critical",
  "confidence": 95,
  "symptoms": "Detailed visual description of what is visible on this specific leaf.",
  "causes": "Causative fungal/bacterial/viral/pest pathogen or physiological stress.",
  "organic_remedies": "Practical biological & eco-friendly remedies (Neem oil, Trichoderma, botanical extracts, bio-fungicides).",
  "chemical_remedies": "Specific chemical fungicides/insecticides with exact dosages per liter of water (e.g., Mancozeb 75% WP @ 2g/L).",
  "precautions": "Cultural practices, crop rotation, sanitation, irrigation precautions.",
  "suggestions": "Expert agronomist tips for maximizing recovery and yield.",
  "soil_type": "Ideal soil and drainage requirements.",
  "npk_ratio": "Recommended NPK ratio or booster.",
  "fertilizer": "Soil nutrition and foliar spray guidance.",
  "visualAnalysis": "Detailed 2-sentence note describing exactly what visual features on the leaf led to this diagnosis.",
  "audioText": {
    "en": "Clear spoken 2-sentence audio summary in English.",
    "te": "స్పష్టమైన రెండు వాక్యాల తెలుగు వాయిస్ సారాంశం.",
    "hi": "स्पष्ट दो वाक्यों का हिंदी वॉइस सारांश।"
  }
}
Do NOT wrap the JSON in Markdown code blocks like \`\`\`json. Output raw JSON only.
`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: systemInstruction },
          {
            inlineData: {
              mimeType: mimeType,
              data: pureBase64,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    let parsedErr = errText;
    try {
      const j = JSON.parse(errText);
      parsedErr = j.error?.message || errText;
    } catch {
      // keep raw
    }
    throw new Error(`Gemini API Error (${response.status}): ${parsedErr}`);
  }

  const result = await response.json();
  const textOutput = result.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textOutput) {
    throw new Error('Gemini returned an empty diagnosis response.');
  }

  // Parse JSON response
  let cleaned = textOutput.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsedData = JSON.parse(cleaned);
  parsedData.engine = 'Google Gemini 1.5 Flash Vision AI';

  return parsedData;
}
