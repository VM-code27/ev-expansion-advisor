# NY EV Expansion Advisor

> **Live app:** [ev-expansion-advisor.vercel.app](ev-expansion-advisor.vercel.app) &nbsp;|&nbsp; **API:** [https://ev-expansion-advisor-api.onrender.com](https://ev-expansion-advisor-api.onrender.com/api/health)

An AI-powered command-center dashboard that tells EV charging companies whether to **Expand, Hold, or Avoid** any of 15 New York State cities — using 100% real local data, live APIs, and plain-English analysis powered by Claude AI.

---

## Dashboard

- **Landing page** — search bar + EV charger illustration + live data source cards
- **Command-center layout** — three-panel dashboard after analysis:
  - Left sidebar: market signals (gas pressure, EV momentum, climate fit) with animated score bars
  - Center: interactive NY State map at full height, risk strip below
  - Right sidebar: key numbers, phased action plan timeline
- **Verdict banner** — full-width Expand / Hold / Avoid decision with confidence bars and urgency level

---

## How It Works

1. Pick a NY city from the search bar or map
2. The backend fetches **4 live data sources in parallel** — gas prices, EV registrations, charging station count, weather
3. Claude AI analyzes all signals and returns a structured JSON verdict
4. The dashboard renders immediately with decision, confidence score, signals, action plan, and risks

---

## Decision Logic

| Verdict | Market Score | Meaning |
|---------|-------------|---------|
| **EXPAND** | >= 72 | Gas above national avg, EV demand growing, market not saturated — invest now |
| **HOLD** | 50–71 | Mixed signals or timing concerns — revisit in 6–12 months |
| **AVOID** | < 50 | Market too small, oversaturated, or weak EV demand |

The AI injects today's date into every prompt so all timelines (Q3 2026, Q1 2027…) are always future-dated.

---

## Supported Cities

| City | Region | EV Registrations |
|------|--------|-----------------|
| New York City | Metro | 247,660 |
| Nassau | Long Island | 1,027,015 |
| Rochester | Western NY | 200,479 |
| Buffalo | Western NY | 151,248 |
| Albany | Capital Region | 189,664 |
| Syracuse | Central NY | 98,682 |
| Ithaca | Finger Lakes | 66,444 |
| Glens Falls | Capital Region | 39,841 |
| Binghamton | Southern Tier | 38,500 |
| Utica | Central NY | 35,888 |
| Kingston | Hudson Valley | 34,924 |
| White Plains | Hudson Valley | 258,870 |
| Watertown | North Country | 17,760 |
| Elmira | Southern Tier | 3,284 |
| Batavia | Western NY | 4,121 |

---

## Data Sources

| Signal | Source | Type |
|--------|--------|------|
| Gas prices (city-level) | `data/ny_gasoline.csv` — NY State DOT weekly survey | Local CSV |
| National avg gas price | EIA API | Live |
| EV registrations | `data/ny_ev_summary.json` — pre-aggregated from NY DMV | Local JSON |
| Charging station count | NREL Alternative Fuel Stations API | Live |
| Weather | OpenWeatherMap API | Live |
| Strategy verdict | Claude 3 Haiku via OpenRouter | Live AI |

> The 135 MB raw `ny_ev_registrations.csv` is excluded from git. Run `python scripts/aggregate_ev.py` once locally to regenerate `data/ny_ev_summary.json`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion |
| Map | React Leaflet + CartoDB dark tiles |
| Backend | Python 3.11 + FastAPI + httpx (async) |
| AI | Claude 3 Haiku via OpenRouter |
| Frontend hosting | Vercel (free) |
| Backend hosting | Render (free) |

---

## Project Structure

```
ev/
├── backend/
│   ├── main.py                     <- FastAPI app + CORS + UTF-8 fix
│   ├── runtime.txt                 <- Python 3.11 for Render
│   ├── .python-version             <- Python 3.11 for Render
│   ├── requirements.txt
│   ├── .env                        <- API keys (not in git)
│   ├── .env.example                <- Key names reference
│   ├── models/schemas.py
│   ├── routers/analyze.py          <- POST /api/analyze
│   └── services/
│       ├── weather_service.py      <- OpenWeatherMap
│       ├── fuel_service.py         <- NY CSV + EIA national avg
│       ├── ev_service.py           <- ny_ev_summary.json + NREL AFDC
│       └── ai_service.py           <- Claude via OpenRouter
├── frontend/
│   ├── src/
│   │   ├── App.tsx                 <- Navbar + Landing + Dashboard layout
│   │   ├── components/
│   │   │   ├── NYMap.tsx           <- Interactive Leaflet map
│   │   │   ├── CitySearch.tsx      <- Autocomplete search
│   │   │   ├── MetricsGrid.tsx     <- Signal cards with score bars
│   │   │   ├── ActionPlan.tsx      <- Phase timeline
│   │   │   ├── RiskPanel.tsx       <- Risk assessment (normal + compact)
│   │   │   └── LoadingState.tsx    <- Animated loading screen
│   │   └── api/client.ts           <- Fetch wrapper (dev proxy + prod URL)
│   └── vite.config.ts
├── data/
│   ├── ny_gasoline.csv             <- Weekly gas prices by city
│   └── ny_ev_summary.json          <- Pre-aggregated EV counts by city
├── scripts/
│   └── aggregate_ev.py             <- One-time script to rebuild summary from raw CSV
└── render.yaml                     <- Render auto-deploy config
```

---

## Local Development

### 1. Clone and set up API keys

```bash
git clone https://github.com/VM-code27/ev-expansion-advisor.git
cd ev-expansion-advisor
cp backend/.env.example backend/.env
# Edit backend/.env with your real keys
```

Required keys:

| Key | Where to get it | Cost |
|-----|----------------|------|
| `OPENROUTER_API_KEY` | openrouter.ai | Free $1 credit |
| `OPENWEATHER_API_KEY` | openweathermap.org | Free 1000 calls/day |
| `NREL_API_KEY` | developer.nrel.gov | Free |
| `EIA_API_KEY` | eia.gov | Free |

### 2. Run backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Run frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Deployment

### Backend → Render (free)

Render reads `render.yaml` automatically.

1. Push repo to GitHub
2. Render → **New → Blueprint** → connect repo
3. Add the 4 API keys in the Render dashboard under Environment
4. Deploy — takes ~3 min

Health check: `https://ev-expansion-advisor-api.onrender.com/api/health`

### Frontend → Vercel (free)

1. Vercel → **New Project** → import repo
2. Set Root Directory: `frontend`
3. Add environment variable: `VITE_API_URL=https://ev-expansion-advisor-api.onrender.com`
4. Deploy

> **Note:** Render's free tier sleeps after 15 min of inactivity. The first request after sleep takes ~30 seconds. All subsequent requests are instant.
