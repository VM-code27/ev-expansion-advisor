import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { TrendingUp, Pause, TrendingDown, Clock, DollarSign, Zap } from 'lucide-react'
import { AnalysisResponse } from '../types'

const CONFIG = {
  EXPAND: {
    icon: TrendingUp,
    iconColor: 'text-green-400',
    bg: 'from-green-500/20 via-green-500/5 to-transparent',
    border: 'border-green-500/30',
    glow: 'shadow-green-500/10',
    badge: 'bg-green-500 text-white',
    ring: 'ring-green-500/30',
    textClass: 'text-green-400',
    headline: (city: string) => `${city} is ready to grow`,
    subtext: 'Strong signals support opening new charging stations here now.',
  },
  HOLD: {
    icon: Pause,
    iconColor: 'text-amber-400',
    bg: 'from-amber-500/20 via-amber-500/5 to-transparent',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/10',
    badge: 'bg-amber-500 text-white',
    ring: 'ring-amber-500/30',
    textClass: 'text-amber-400',
    headline: (city: string) => `${city} — wait and watch`,
    subtext: 'The market has potential but conditions aren\'t strong enough to invest right now.',
  },
  AVOID: {
    icon: TrendingDown,
    iconColor: 'text-red-400',
    bg: 'from-red-500/20 via-red-500/5 to-transparent',
    border: 'border-red-500/30',
    glow: 'shadow-red-500/10',
    badge: 'bg-red-500 text-white',
    ring: 'ring-red-500/30',
    textClass: 'text-red-400',
    headline: (city: string) => `${city} — not the right time`,
    subtext: 'Market barriers or oversaturation make expansion too risky right now.',
  },
}

const URGENCY_LABELS: Record<string, string> = {
  CRITICAL: '🔥 Act immediately',
  HIGH: '⚡ Act soon',
  MEDIUM: '📅 Plan ahead',
  LOW: '🕐 No rush',
}

interface Props { data: AnalysisResponse }

export default function DecisionCard({ data }: Props) {
  const cfg = CONFIG[data.decision]
  const Icon = cfg.icon
  const confidenceBars = Math.round(data.confidence / 20) // 1–5 bars

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-3xl border ${cfg.border} bg-gradient-to-br ${cfg.bg} p-7 shadow-2xl ${cfg.glow}`}
    >
      <div className="relative z-10 space-y-5">

        {/* Top row: badge + urgency */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-black tracking-wide ${cfg.badge}`}>
            <Icon className="w-4 h-4" />
            {data.decision}
          </span>
          <span className="text-sm text-gray-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            {URGENCY_LABELS[data.urgency]}
          </span>
        </div>

        {/* Headline */}
        <div>
          <h2 className="text-3xl font-black text-white leading-tight">
            {cfg.headline(data.city)}
          </h2>
          <p className="text-gray-400 text-sm mt-1">{cfg.subtext}</p>
        </div>

        {/* AI Summary */}
        <p className="text-gray-300 text-base leading-relaxed border-l-2 border-white/10 pl-4">
          {data.summary}
        </p>

        {/* Confidence */}
        <div className="flex items-center gap-3">
          <span className="text-gray-500 text-xs uppercase tracking-wider">How confident are we?</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-6 rounded-full transition-all ${
                  i < confidenceBars ? cfg.badge.split(' ')[0] : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <span className={`text-sm font-bold ${cfg.textClass}`}>{data.confidence}%</span>
        </div>

        {/* 3 key numbers */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <KeyStat
            icon={<Zap className="w-4 h-4 text-green-400" />}
            label="Stations to open"
            value={`${data.action_plan.stations_recommended}`}
          />
          <KeyStat
            icon={<DollarSign className="w-4 h-4 text-blue-400" />}
            label="Est. investment"
            value={data.action_plan.investment_estimate}
          />
          <KeyStat
            icon={<Clock className="w-4 h-4 text-purple-400" />}
            label="Best time to start"
            value={data.action_plan.timeline}
          />
        </div>

        {/* ROI note */}
        <p className="text-xs text-gray-600 border-t border-white/5 pt-3">
          💰 <span className="text-gray-400">{data.roi_projection}</span>
        </p>
      </div>
    </motion.div>
  )
}

function KeyStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-4 text-center space-y-1">
      <div className="flex justify-center">{icon}</div>
      <p className="text-white font-bold text-base leading-tight">{value}</p>
      <p className="text-gray-600 text-[10px] uppercase tracking-wider">{label}</p>
    </div>
  )
}
