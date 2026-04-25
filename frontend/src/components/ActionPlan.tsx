import { motion } from 'framer-motion'
import { Target, CheckCircle2, Circle } from 'lucide-react'
import { AnalysisResponse } from '../types'

interface Props { data: AnalysisResponse }

export default function ActionPlan({ data }: Props) {
  const { action_plan } = data

  return (
    <div className="space-y-3">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
        <Target className="w-3.5 h-3.5 text-cyan-700" />
        Action Plan
      </p>

      {/* Priority zones */}
      {action_plan.priority_zones.length > 0 && (
        <div className="panel p-3 space-y-1.5">
          <p className="text-[9px] text-gray-600 uppercase tracking-widest font-semibold">Priority Zones</p>
          {action_plan.priority_zones.map((z, i) => (
            <div key={z} className="flex items-center gap-2 text-xs text-gray-300">
              <span className="text-cyan-600 font-bold text-[10px] w-4 flex-shrink-0">{i + 1}.</span>
              {z}
            </div>
          ))}
        </div>
      )}

      {/* Phase timeline */}
      <div className="space-y-0">
        {action_plan.phases.map((phase, i) => (
          <motion.div
            key={phase.phase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.09 }}
            className="relative flex gap-3"
          >
            {/* Vertical connector line */}
            {i < action_plan.phases.length - 1 && (
              <div className="absolute left-[11px] top-7 bottom-0 w-px bg-white/6" />
            )}

            {/* Phase icon */}
            <div className="flex-shrink-0 mt-1">
              {i === 0 ? (
                <CheckCircle2 className="w-5 h-5 text-cyan-500" />
              ) : (
                <Circle className="w-5 h-5 text-gray-700" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-baseline justify-between mb-0.5">
                <span className="text-[10px] text-gray-600 uppercase tracking-widest font-semibold">
                  Phase {phase.phase}
                </span>
                <span className="text-[10px] text-cyan-700 font-mono">{phase.timeline}</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">{phase.action}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
