import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

const STEPS = [
  { label: 'Fetching live weather conditions',    delay: 0.0 },
  { label: 'Loading NY gas price data',           delay: 0.5 },
  { label: 'Querying NREL charging station API',  delay: 1.0 },
  { label: 'Reading NY DMV registration records', delay: 1.5 },
  { label: 'Running Claude AI market analysis',   delay: 2.0 },
  { label: 'Building strategy report',            delay: 2.5 },
]

export default function LoadingState() {
  return (
    <div
      className="flex flex-col items-center justify-center bg-dots"
      style={{ height: 'calc(100vh - 48px)' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/4 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10">
        {/* Spinner */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer pulse rings */}
          {[0, 1].map(i => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full border border-cyan-500/30"
              animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
            />
          ))}
          {/* Spinning ring */}
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-transparent border-t-cyan-400"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          {/* Center icon */}
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-1">
          <p className="text-white font-bold text-lg">Analyzing Market</p>
          <p className="text-gray-500 text-sm">Gathering live intelligence across 4 data sources…</p>
        </div>

        {/* Step list */}
        <div className="flex flex-col gap-2 w-72">
          {STEPS.map(({ label, delay }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: [0, 1, 0.35] }}
              transition={{ delay, duration: 1.4 }}
              className="flex items-center gap-3 text-xs text-gray-600"
            >
              <motion.div
                initial={{ backgroundColor: '#1f2937' }}
                animate={{ backgroundColor: ['#1f2937', '#06b6d4', '#1f2937'] }}
                transition={{ delay, duration: 1.4 }}
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              />
              <span>{label}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: delay + 0.3, duration: 0.9 }}
                className="ml-auto text-cyan-700 text-[10px]"
              >
                {i === STEPS.length - 1 ? '✓' : '...'}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
