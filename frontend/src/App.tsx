import { useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, AlertCircle, ChevronRight, Globe2,
  Gauge, Building2, Cpu, MapPin,
  TrendingUp, TrendingDown, Minus,
  Activity, Radio, ArrowUpRight
} from 'lucide-react'
import CitySearch from './components/CitySearch'
import MetricsGrid from './components/MetricsGrid'
import ActionPlan from './components/ActionPlan'
import RiskPanel from './components/RiskPanel'
import LoadingState from './components/LoadingState'
import NYMap from './components/NYMap'
import { analyzeCity } from './api/client'
import { AnalysisResponse } from './types'

const QUICK_CITIES = [
  { name: 'New York City', region: 'Metro' },
  { name: 'Buffalo',       region: 'Western NY' },
  { name: 'Albany',        region: 'Capital' },
  { name: 'Rochester',     region: 'Western NY' },
  { name: 'Syracuse',      region: 'Central NY' },
  { name: 'Ithaca',        region: 'Finger Lakes' },
]

const DECISION_CFG = {
  EXPAND: {
    Icon: TrendingUp,
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/25',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500 text-white',
    bar: 'bg-emerald-500',
    headline: (city: string) => `${city} is primed for growth`,
  },
  HOLD: {
    Icon: Minus,
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/25',
    text: 'text-amber-400',
    badge: 'bg-amber-500 text-white',
    bar: 'bg-amber-500',
    headline: (city: string) => `${city} — wait for stronger signals`,
  },
  AVOID: {
    Icon: TrendingDown,
    bg: 'bg-red-500/8',
    border: 'border-red-500/25',
    text: 'text-red-400',
    badge: 'bg-red-500 text-white',
    bar: 'bg-red-500',
    headline: (city: string) => `${city} — not the right time`,
  },
}

const URGENCY_MAP: Record<string, string> = {
  CRITICAL: 'Act Immediately',
  HIGH:     'Act Soon',
  MEDIUM:   'Plan Ahead',
  LOW:      'No Rush',
}

export default function App() {
  const [data, setData] = useState<AnalysisResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSearch(city: string) {
    setLoading(true)
    setError(null)
    setData(null)
    try {
      const result = await analyzeCity(city, 'NY')
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Check your API keys.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#030712] min-h-screen text-white">

      {/* ── Sticky Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-12 border-b border-white/5 bg-[#030712]/95 backdrop-blur-xl">
        <div className="h-full flex items-center px-5 gap-4">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-bold tracking-tight">EV Expansion Advisor</p>
              <p className="text-[9px] text-gray-600 uppercase tracking-widest">New York State</p>
            </div>
          </div>

          {data && (
            <div className="flex items-center gap-1.5 ml-4 text-xs">
              <button onClick={() => setData(null)} className="text-gray-500 hover:text-white transition-colors">
                Markets
              </button>
              <ChevronRight className="w-3 h-3 text-gray-700" />
              <span className="text-white font-medium">{data.city}, NY</span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-5">
            {loading && <span className="text-xs text-cyan-400 animate-pulse">Fetching live data…</span>}
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Radio className="w-3 h-3 text-emerald-500" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Page content ── */}
      <div className="pt-12">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="load" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingState />
            </motion.div>
          )}
          {!loading && !data && (
            <motion.div key="land" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Landing onSearch={handleSearch} error={error} />
            </motion.div>
          )}
          {!loading && data && (
            <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Dashboard data={data} onSearch={handleSearch} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─────────────────────────── LANDING ─────────────────────────── */
function Landing({ onSearch, error }: { onSearch: (c: string) => void; error: string | null }) {
  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col">

      {/* Hero */}
      <div className="relative flex-1 flex items-center overflow-hidden bg-dots">
        {/* Atmospheric glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 left-1/3 w-[700px] h-[500px] bg-cyan-500/4 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-emerald-500/4 rounded-full blur-[110px]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left — copy + search */}
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/25 bg-cyan-500/8 text-cyan-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                AI-Powered Market Intelligence · New York State
              </span>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
              <h1 className="text-5xl xl:text-6xl font-black tracking-tight leading-[1.08] mb-4">
                Should you open an
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
                  EV charging station
                </span>
                <br />
                in New York?
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                Pick a city, get a clear <strong className="text-white">Expand · Hold · Avoid</strong> verdict
                backed by real gas prices, EV registrations, and live market signals.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="space-y-3">
              <CitySearch onSearch={onSearch} loading={false} />
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <p className="text-gray-600 text-[10px] uppercase tracking-widest font-semibold mb-2">Popular Markets</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_CITIES.map((c, i) => (
                  <motion.button
                    key={c.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.04 }}
                    onClick={() => onSearch(c.name)}
                    className="group flex items-center gap-2 px-3 py-1.5 panel panel-hover rounded-lg text-sm text-gray-400 hover:text-white"
                  >
                    <MapPin className="w-3 h-3 text-gray-700 group-hover:text-cyan-400 transition-colors" />
                    {c.name}
                    <span className="text-[9px] text-gray-700 border border-white/6 rounded px-1">{c.region}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — illustration + data cards */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="hidden lg:flex flex-col gap-4"
          >
            <div className="relative panel p-8 flex items-center justify-center overflow-hidden" style={{ minHeight: 300 }}>
              <div className="absolute inset-0 bg-grid opacity-50" />
              <EVChargerIllustration />
              <div className="absolute top-5 right-5 panel px-3 py-2 text-right">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider">NY EV Growth</p>
                <p className="text-2xl font-black text-emerald-400">+34.8%</p>
                <p className="text-[9px] text-gray-600">year-over-year</p>
              </div>
              <div className="absolute bottom-5 left-5 panel px-3 py-2">
                <p className="text-[9px] text-gray-600 uppercase tracking-wider">Avg Gas · NY</p>
                <p className="text-2xl font-black text-amber-400">$3.85+</p>
                <p className="text-[9px] text-gray-600">per gallon</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Gauge className="w-4 h-4" />, label: 'Gas Prices', sub: 'NY DOT Weekly', color: 'text-amber-400' },
                { icon: <Building2 className="w-4 h-4" />, label: 'EV Registrations', sub: 'NY DMV Dataset', color: 'text-cyan-400' },
                { icon: <Activity className="w-4 h-4" />, label: 'Charging Stations', sub: 'NREL AFDC Live', color: 'text-emerald-400' },
                { icon: <Cpu className="w-4 h-4" />, label: 'AI Analysis', sub: 'Claude AI Engine', color: 'text-purple-400' },
              ].map(s => (
                <div key={s.label} className="panel p-3 flex items-center gap-2.5">
                  <span className={s.color}>{s.icon}</span>
                  <div>
                    <p className="text-xs font-semibold text-white">{s.label}</p>
                    <p className="text-[10px] text-gray-600">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer strip */}
      <div className="border-t border-white/4 bg-white/1 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-8 flex-wrap">
          {[
            { icon: <Globe2 className="w-3 h-3" />, text: '15 NY Cities' },
            { icon: <Activity className="w-3 h-3" />, text: 'Real Gas Prices' },
            { icon: <Building2 className="w-3 h-3" />, text: 'Live EV Data' },
            { icon: <Cpu className="w-3 h-3" />, text: 'Claude AI' },
          ].map(s => (
            <div key={s.text} className="flex items-center gap-1.5 text-xs text-gray-600">
              <span className="text-cyan-800">{s.icon}</span>{s.text}
            </div>
          ))}
          <p className="ml-auto text-[10px] text-gray-700">100% real data · no guesswork</p>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── DASHBOARD ─────────────────────────── */
function Dashboard({ data, onSearch }: { data: AnalysisResponse; onSearch: (c: string) => void }) {
  const dc = DECISION_CFG[data.decision]
  const Icon = dc.Icon
  const bars = Math.round(data.confidence / 20)

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 48px)' }}>

      {/* Verdict banner */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex-shrink-0 ${dc.bg} border-b ${dc.border} px-5 py-2.5 flex items-center gap-4 flex-wrap`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-black tracking-widest ${dc.badge}`}>
            <Icon className="w-3.5 h-3.5" />
            {data.decision}
          </span>
          <span className={`text-sm font-bold ${dc.text}`}>{dc.headline(data.city)}</span>
        </div>

        <p className="text-gray-500 text-xs flex-1 min-w-0 truncate hidden md:block">{data.summary}</p>

        <div className="flex items-center gap-4 ml-auto flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-600 uppercase tracking-wider">Confidence</span>
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`w-4 h-1.5 rounded-full ${i < bars ? dc.bar : 'bg-white/10'}`} />
              ))}
            </div>
            <span className={`text-xs font-bold ${dc.text}`}>{data.confidence}%</span>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${dc.border} ${dc.text}`}>
            {URGENCY_MAP[data.urgency]}
          </span>
        </div>
      </motion.div>

      {/* 3-column layout */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* LEFT — Signals sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-72 flex-shrink-0 overflow-y-auto border-r border-white/5 bg-black/20 p-4 space-y-3"
        >
          <SidebarLabel icon={<Activity className="w-3.5 h-3.5" />}>Market Signals</SidebarLabel>
          <MetricsGrid data={data} />

          <SidebarLabel icon={<ArrowUpRight className="w-3.5 h-3.5" />}>ROI Outlook</SidebarLabel>
          <div className="panel p-3">
            <p className="text-gray-300 text-xs leading-relaxed">{data.roi_projection}</p>
          </div>

          <SidebarLabel icon={<Building2 className="w-3.5 h-3.5" />}>Competition</SidebarLabel>
          <div className="panel p-3">
            <p className="text-gray-300 text-xs leading-relaxed">{data.competitor_landscape}</p>
          </div>

          <SidebarLabel icon={<Globe2 className="w-3.5 h-3.5" />}>AI Summary</SidebarLabel>
          <div className="panel p-3">
            <p className="text-gray-300 text-xs leading-relaxed">{data.summary}</p>
          </div>
        </motion.div>

        {/* CENTER — Map + risk strip */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 min-h-0">
            <NYMap data={data} onCityClick={onSearch} fillHeight />
          </div>
          <div className="flex-shrink-0 border-t border-white/5 bg-black/30 p-3">
            <RiskPanel risks={data.risks} compact />
          </div>
        </div>

        {/* RIGHT — Action plan sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="w-80 flex-shrink-0 overflow-y-auto border-l border-white/5 bg-black/20 p-4 space-y-4"
        >
          <SidebarLabel icon={<Gauge className="w-3.5 h-3.5" />}>Key Numbers</SidebarLabel>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Stations', value: String(data.action_plan.stations_recommended) },
              { label: 'Investment', value: data.action_plan.investment_estimate },
              { label: 'Timeline', value: data.action_plan.timeline },
              { label: 'Score', value: `${Math.round(data.market_score)}/100` },
            ].map(s => (
              <div key={s.label} className="panel p-3 text-center">
                <p className="text-white font-bold text-sm leading-tight">{s.value}</p>
                <p className="text-gray-600 text-[9px] uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <ActionPlan data={data} />
        </motion.div>
      </div>
    </div>
  )
}

function SidebarLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-widest font-semibold pt-1">
      <span className="text-cyan-700">{icon}</span>
      {children}
    </div>
  )
}

function EVChargerIllustration() {
  return (
    <svg viewBox="0 0 220 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-44 h-60 relative z-10">
      <rect x="60" y="20" width="100" height="200" rx="10" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.2)" strokeWidth="1.5" />
      <rect x="75" y="38" width="70" height="52" rx="6" fill="rgba(6,182,212,0.1)" stroke="rgba(6,182,212,0.25)" strokeWidth="1" />
      <rect x="83" y="48" width="44" height="3" rx="1.5" fill="rgba(6,182,212,0.55)" />
      <rect x="83" y="56" width="32" height="3" rx="1.5" fill="rgba(6,182,212,0.3)" />
      <rect x="83" y="64" width="38" height="3" rx="1.5" fill="rgba(6,182,212,0.3)" />
      <rect x="83" y="72" width="28" height="3" rx="1.5" fill="rgba(16,185,129,0.5)" />
      <circle cx="88" cy="108" r="5" fill="rgba(16,185,129,0.7)" />
      <circle cx="110" cy="108" r="5" fill="rgba(6,182,212,0.5)" />
      <circle cx="132" cy="108" r="5" fill="rgba(255,255,255,0.1)" />
      <rect x="77" y="128" width="66" height="44" rx="6" fill="rgba(6,182,212,0.07)" stroke="rgba(6,182,212,0.22)" strokeWidth="1" />
      <path d="M105 140 L118 152 L108 152 L120 164" stroke="rgba(6,182,212,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M110 218 C 110 255, 60 265, 48 295" stroke="rgba(6,182,212,0.25)" strokeWidth="7" strokeLinecap="round" fill="none" />
      <circle cx="47" cy="299" r="9" fill="rgba(6,182,212,0.15)" stroke="rgba(6,182,212,0.35)" strokeWidth="1.5" />
      <circle cx="47" cy="299" r="4" fill="rgba(6,182,212,0.45)" />
      <rect x="50" y="218" width="120" height="16" rx="4" fill="rgba(6,182,212,0.04)" stroke="rgba(6,182,212,0.12)" strokeWidth="1" />
    </svg>
  )
}
