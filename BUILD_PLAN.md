# Build Plan — Task List for Antigravity

Work through phases in order. Each task is scoped to be independently completable.
Keep everything lightweight: no heavy dependencies, no GPU requirement, SQLite only.

## Phase 1 — Core UI & Static Data (scaffold provided, extend it)

- [ ] Wire up `LanguageSelector` to persist choice (localStorage) and switch `react-i18next` language
- [ ] Fill out `locales/en.json`, `hi.json`, `te.json` with all UI strings (scaffold has a starter set)
- [ ] Build out remaining feature card pages as simple placeholder pages: PestID, DiseaseAlerts,
      CropAdvisory, Fertilizer, Weather, SoilScanner, AskAnything (routes are stubbed in App.jsx)
- [ ] Connect SearchBar to `GET /api/search?q=` backend route; render autocomplete suggestions
- [ ] Expand `backend/data/crops.json` with full reference data for all 16 crops listed in the spec
      (symptoms, causes, remedies, precautions, fertilizer guidance per crop)
- [ ] Add disclaimer component (reusable) shown on every result/recommendation page

## Phase 2 — Real Image Analysis

- [ ] Add image upload + camera capture to `ImageUpload` component (file input + `getUserMedia`)
- [ ] Backend: add `POST /api/detect` route — for now, return a random/mocked result from
      `crops.json` so the full flow works end-to-end
- [ ] Swap mock for real inference:
      - Preferred: fine-tune MobileNetV2 or EfficientNet-Lite0 on PlantVillage dataset (or subset
        for the 16 target crops), export to TensorFlow.js, run inference **in the browser**
        (zero backend compute cost — good fit for small-machine hosting)
      - Alternative: export to TFLite, serve via a small Python FastAPI microservice if
        server-side inference is preferred
- [ ] Display confidence score + result card (Crop, Disease, Symptoms, Causes, Remedies, Precautions)

## Phase 3 — Voice & Multilingual Depth

- [ ] Implement `VoiceAssistant` component using Web Speech API:
      - `SpeechRecognition` for speech-to-text (mic button)
      - Route recognized text to Ask Anything / search
      - `SpeechSynthesisUtterance` for reading results aloud, respecting selected language
- [ ] Add "🔊 Listen to Result" button on the Result page using the same TTS utility
- [ ] Audit every page for missing i18n keys — no hardcoded English strings should remain

## Phase 4 — Weather, Alerts, Soil Scanner

- [ ] Backend: add `GET /api/weather?lat=&lon=` proxying OpenWeatherMap (or similar free API)
- [ ] Frontend: Weather page showing temp/humidity/rainfall/wind + simple farming tip logic
      (e.g. "rain expected — delay pesticide spraying")
- [ ] Disease Alerts: start with a manually curated seasonal JSON feed, render as alert cards
- [ ] Soil Scanner: image upload + basic heuristic/placeholder guidance, with a clear disclaimer
      that lab testing is needed for precise values

## Phase 5 — Polish

- [ ] Mobile responsiveness pass (test at 360px width minimum)
- [ ] Accessibility: large tap targets, sufficient color contrast, readable font sizes
- [ ] Image compression before upload (client-side, e.g. canvas resize) to keep requests small
- [ ] Lazy-load route components
- [ ] Add loading states + error handling to every API call

## Environment Constraints (keep in mind throughout)

- Target host: 1 vCPU / 1–2GB RAM VPS, no GPU
- No heavy frameworks (no Next.js SSR, no large UI kits)
- ML inference must either run client-side (TF.js) or via a small (<20MB) TFLite model
- Database: SQLite only, single file, no external DB service required
