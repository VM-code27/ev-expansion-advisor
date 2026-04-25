import { useState, useRef, useEffect, type FormEvent } from 'react'
import { Search, MapPin, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NY_CITIES = [
  { city: 'New York City', label: 'New York City', region: 'Metro' },
  { city: 'Buffalo',       label: 'Buffalo',       region: 'Western NY' },
  { city: 'Rochester',     label: 'Rochester',     region: 'Western NY' },
  { city: 'Syracuse',      label: 'Syracuse',      region: 'Central NY' },
  { city: 'Albany',        label: 'Albany',        region: 'Capital Region' },
  { city: 'Utica',         label: 'Utica',         region: 'Central NY' },
  { city: 'Binghamton',    label: 'Binghamton',    region: 'Southern Tier' },
  { city: 'White Plains',  label: 'White Plains',  region: 'Hudson Valley' },
  { city: 'Nassau',        label: 'Nassau',        region: 'Long Island' },
  { city: 'Ithaca',        label: 'Ithaca',        region: 'Finger Lakes' },
  { city: 'Elmira',        label: 'Elmira',        region: 'Southern Tier' },
  { city: 'Watertown',     label: 'Watertown',     region: 'North Country' },
  { city: 'Glens Falls',   label: 'Glens Falls',   region: 'Capital Region' },
  { city: 'Kingston',      label: 'Kingston',      region: 'Hudson Valley' },
  { city: 'Batavia',       label: 'Batavia',       region: 'Western NY' },
]

interface Props {
  onSearch: (city: string) => void
  loading: boolean
}

export default function CitySearch({ onSearch, loading }: Props) {
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState<typeof NY_CITIES>([])
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 1) { setFiltered([]); return }
    const q = query.toLowerCase()
    setFiltered(NY_CITIES.filter(c => c.city.toLowerCase().startsWith(q)).slice(0, 8))
  }, [query])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(city: string) {
    setQuery(city)
    setOpen(false)
    onSearch(city)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    const match = NY_CITIES.find(c => c.city.toLowerCase() === query.toLowerCase().trim())
    onSearch(match ? match.city : query.trim())
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <MapPin className="w-5 h-5 text-green-400" />
        </div>

        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search a New York city — e.g. Buffalo, Albany…"
          disabled={loading}
          className="w-full pl-12 pr-36 py-4 bg-white/5 border border-white/15 rounded-2xl text-white placeholder-gray-600 text-base focus:outline-none focus:border-green-500/50 focus:bg-white/[0.07] focus:shadow-lg focus:shadow-green-500/5 transition-all duration-200 disabled:opacity-50"
        />

        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="absolute right-2 top-2 bottom-2 px-6 bg-green-500 hover:bg-green-400 active:bg-green-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl flex items-center gap-2 transition-all duration-150 disabled:cursor-not-allowed shadow-md shadow-green-500/20"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}>
                <Zap className="w-4 h-4" />
              </motion.div>
              Analyzing…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Analyze
            </span>
          )}
        </button>
      </form>

      <AnimatePresence>
        {open && filtered.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 top-full mt-2 w-full bg-gray-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            {filtered.map(c => (
              <li key={c.city}>
                <button
                  type="button"
                  onMouseDown={() => handleSelect(c.city)}
                  className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-white/[0.08] transition-colors duration-100 group"
                >
                  <MapPin className="w-4 h-4 text-gray-600 group-hover:text-green-400 transition-colors flex-shrink-0" />
                  <span className="text-white font-medium text-sm">{c.label}</span>
                  <span className="ml-auto text-gray-600 text-xs">{c.region}</span>
                </button>
              </li>
            ))}
            <li className="px-5 py-2 border-t border-white/5 text-gray-700 text-[10px]">
              All prices & registrations from real local data
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
