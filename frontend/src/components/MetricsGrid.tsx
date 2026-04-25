import { motion } from 'framer-motion'
import { Flame, Zap, Cloud } from 'lucide-react'
import { AnalysisResponse } from '../types'

const SIGNALS = [
  {
    key: 'fuel_pressure' as const,
    Icon: Flame,
    label: 'Gas Price Pressure',
    iconColor: 'text-amber-400',
    barColor: 'bg-amber-500',
    barBg: 'bg-amber-500/15',
  },
  {
    key: 'ev_momentum' as const,
    Icon: Zap,
    label: 'EV Adoption Momentum',
    iconColor: 'text-cyan-400',
    barColor: 'bg-cyan-500',
    barBg: 'bg-cyan-500/15',
  },
  {
    key: 'climate_fit' as const,
    Icon: Cloud,
    label: 'Climate Suitability',
    iconColor: 'text-sky-400',
    barColor: 'bg-sky-500',
    barBg: 'bg-sky-500/15',
  },
]

interface Props { data: AnalysisResponse }

export default function MetricsGrid({ data }: Props) {
  return (
    <div className="space-y-2.5">
      {SIGNALS.map(({ key, Icon, label, iconColor, barColor, barBg }, i) => {
        const signal = data.signals[key]
        const score = Math.max(0, Math.min(100, signal.score))
        return (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="panel p-3 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                <span className="text-[10px] text-gray-400 font-medium">{label}</span>
              </div>
              <span className="text-sm font-black text-white">{score}</span>
            </div>

            {/* Score bar */}
            <div className={`score-track ${barBg}`}>
              <motion.div
                className={`h-full rounded-full ${barColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.6, delay: i * 0.07 + 0.2, ease: 'easeOut' }}
              />
            </div>

            {/* Raw value + insight */}
            <div>
              <p className="text-[10px] text-gray-600 font-mono">{signal.raw_value}</p>
              <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{signal.insight}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
