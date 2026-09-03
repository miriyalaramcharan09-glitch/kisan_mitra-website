# Kisan Mitra 🌾 — AI-Based Agricultural Disease Identifier

Lightweight, multilingual (Telugu / Hindi / English) smart farming web app.
Designed to run on small machines: no heavy ML server required for Phase 1,
SQLite for storage, client-side voice via Web Speech API.

## Structure

```
kisan-mitra/
├── frontend/     React + Vite + Tailwind (client-side, lightweight)
└── backend/      Express + SQLite (lightweight API)
```

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev        # starts on http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev         # starts on http://localhost:5173
```

## Phase 1 Scope (this scaffold)

- ✅ Language selector (EN / HI / TE) with i18n
- ✅ Home page with feature cards, search bar
- ✅ Mocked crop disease "detection" result page (real ML model plugs in later)
- ✅ SQLite-backed crop/disease/fertilizer reference data + search API
- ✅ Voice: Web Speech API stub for speech-to-text and text-to-speech (client-side, zero server cost)

## Next Phases (see BUILD_PLAN.md)

- Phase 2: Real image upload → lightweight ML model (MobileNetV2/TFLite or TF.js in-browser)
- Phase 3: Full voice assistant flow, complete i18n coverage
- Phase 4: Weather API, disease alerts, soil scanner
- Phase 5: Polish, accessibility, performance

## Notes for Antigravity

This scaffold is intentionally minimal — components and routes are stubbed
with clear TODOs so an agentic coding session can extend them feature-by-feature.
Start with `BUILD_PLAN.md` for a phased task list.
