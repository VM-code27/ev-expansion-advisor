# NY EV Expansion Advisor

An AI-powered tool that tells EV charging companies whether to **Expand, Hold, or Avoid** any of 15 New York State cities — using 100% real local data and plain-English explanations.

---

## What It Does

1. You pick a NY city (New York City, Buffalo, Albany, etc.)
2. The app pulls **real weekly gas prices** from your NY State CSV, **real EV registrations** from the NY DMV dataset, **live weather**, and **live charging station counts**
3. Claude AI analyzes all signals and returns a clear **Expand / Hold / Avoid** verdict
4. The result shows up as a plain-English dashboard with a **NY State map**, confidence score, risk breakdown, and a phased action plan with real budget estimates

---

## Supported Cities (15 total)

| City | Region | Has Local Gas Data | Has ZIP Registration Data |
|------|--------|-------------------|--------------------------|
| New York City | Metro | ✅ | ✅ |
| Buffalo | Western NY | ✅ | ✅ |
| Rochester | Western NY | ✅ | ✅ |
| Syracuse | Central NY | ✅ | ✅ |
| Albany | Capital Region | ✅ | ✅ |
| Utica | Central NY | ✅ | ✅ |
| Binghamton | Southern Tier | ✅ | ✅ |
| White Plains | Hudson Valley | ✅ | ✅ |
| Nassau | Long Island | ✅ | ✅ |
| Ithaca | Finger Lakes | ✅ | ✅ |
| Elmira | Southern Tier | ✅ | ✅ |
| Watertown | North Country | ✅ | ✅ |
| Glens Falls | Capital Region | ✅ | ✅ |
| Kingston | Hudson Valley | ✅ | ✅ |
| Batavia | Western NY | ✅ | ✅ |

---

## Data Sources (all real, no estimates)

| Signal | Source |
|--------|--------|
| Gas prices (city-level) | `data/ny_gasoline.csv` — NY State DOT weekly survey |
| National avg gas price | EIA live API (for comparison delta) |
| EV registrations (ZIP-level) | `data/ny_ev_registrations.csv` — NY DMV data |
| Charging station count | NREL Alternative Fuel Stations API (live) |
| Weather | OpenWeatherMap API (live) |
| Strategy decision | Claude via OpenRouter AI |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion |
| Map | React Leaflet + CartoDB dark tiles (free, no API key) |
| Charts | Recharts |
| Backend | Python 3.11 + FastAPI + httpx |
| AI | OpenRouter → `anthropic/claude-3-haiku` |

---

## Project Structure

```
ev/
├── backend/
│   ├── main.py
│   ├── .env                        ← API keys
│   ├── models/schemas.py
│   ├── routers/analyze.py          ← POST /api/analyze (NY cities only)
│   └── services/
│       ├── weather_service.py      ← OpenWeatherMap
│       ├── fuel_service.py         ← NY CSV + EIA national avg
│       ├── ev_service.py           ← NY DMV CSV + NREL AFDC
│       └── ai_service.py           ← OpenRouter / Claude (with current date)
├── frontend/src/
│   ├── App.tsx                     ← Main layout
│   └── components/
│       ├── NYMap.tsx               ← Interactive NY state map
│       ├── CitySearch.tsx          ← NY city autocomplete
│       ├── DecisionCard.tsx        ← Expand/Hold/Avoid verdict
│       ├── MetricsGrid.tsx         ← 3 signal cards (layman friendly)
│       ├── ActionPlan.tsx          ← Phased game plan
│       └── RiskPanel.tsx           ← Plain English risk breakdown
└── data/
    ├── ny_gasoline.csv             ← Weekly gas prices by NY city
    └── ny_ev_registrations.csv    ← EV registrations by ZIP code
```

---

## Setup

### 1. API Keys

Edit `backend/.env`:
```
OPENROUTER_API_KEY=your_key     # openrouter.ai — $1 free credit on signup
OPENWEATHER_API_KEY=your_key    # openweathermap.org — 1000 free calls/day
NREL_API_KEY=your_KEY           # developer.nrel.gov — DEMO_KEY works for dev
EIA_API_KEY=your_key            # eia.gov — free, used for live national gas avg
```

### 2. Run Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`

---

## How the Decision Works

| Verdict | Market Score | What it means |
|---------|-------------|---------------|
| **EXPAND** | ≥ 72 | Gas is expensive, EV demand is growing, market isn't saturated — invest now |
| **HOLD** | 50–71 | Promising but mixed signals — wait 6–12 months |
| **AVOID** | < 50 | Market too small, oversaturated, or demand is too low |

The AI uses today's actual date so all timeline recommendations (Q3 2026, Q1 2027, etc.) are always in the future.

---

## Deployment (Free)

### Backend → Railway
1. Push to GitHub
2. Railway → New Project → Deploy from repo → root: `backend`
3. Add env vars in Railway dashboard
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend → Vercel
1. Vercel → New Project → root: `frontend`
2. Add env var: `VITE_API_URL=https://your-app.railway.app`
3. In `src/api/client.ts` change `BASE` to:
   ```ts
   const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'
   ```
