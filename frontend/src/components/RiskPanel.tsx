import { motion } from 'framer-motion'
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react'
import { Risk } from '../types'

const LEVEL_CFG = {
  HIGH:   { Icon: ShieldAlert, color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20',    bar: 'bg-red-500',    label: 'High Risk' },
  MEDIUM: { Icon: Shield,      color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  bar: 'bg-amber-500',  label: 'Medium' },
  LOW:    { Icon: ShieldCheck, color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20',bar: 'bg-emerald-500',label: 'Low Risk' },
}

interface Props {
  risks: Risk[]
  compact?: boolean
}

export default function RiskPanel({ risks, compact = false }: Props) {
  if (compact) {
    return (
      <div className="flex items-start gap-3 flex-wrap">
        <span className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold flex-shrink-0 mt-0.5 self-center">
          Risks
        </span>
        {risks.map((r, i) => {
          const cfg = LEVEL_CFG[r.level]
          const Icon = cfg.Icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex items-start gap-2 flex-1 min-w-[170px] ${cfg.bg} border ${cfg.border} rounded-lg px-3 py-2`}
            >
              <Icon className={`w-3.5 h-3.5 ${cfg.color} flex-shrink-0 mt-0.5`} />
              <div className="min-w-0">
                <p className={`text-[10px] font-bold ${cfg.color}`}>{r.factor}</p>
                <p className="text-[10px] text-gray-500 leading-tight">{r.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Risk Assessment</p>
      {risks.map((r, i) => {
        const cfg = LEVEL_CFG[r.level]
        const Icon = cfg.Icon
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`panel p-4 ${cfg.bg} border ${cfg.border}`}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`w-1 h-6 rounded-full flex-shrink-0 ${cfg.bar}`} />
              <Icon className={`w-4 h-4 ${cfg.color}`} />
              <div>
                <p className={`text-xs font-bold ${cfg.color}`}>{r.factor}</p>
                <p className="text-[9px] text-gray-600 uppercase tracking-wider">{cfg.label}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed pl-[18px]">{r.description}</p>
          </motion.div>
        )
      })}
    </div>
  )
}
