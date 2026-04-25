import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { AnalysisResponse } from '../types'

const CITY_COORDS: Record<string, [number, number]> = {
  'New York City': [40.7128, -74.0060],
  'Buffalo':       [42.8864, -78.8784],
  'Rochester':     [43.1566, -77.6088],
  'Syracuse':      [43.0481, -76.1474],
  'Albany':        [42.6526, -73.7562],
  'Utica':         [43.1009, -75.2327],
  'Binghamton':    [42.0987, -75.9180],
  'White Plains':  [41.0340, -73.7629],
  'Nassau':        [40.7282, -73.7949],
  'Ithaca':        [42.4440, -76.5021],
  'Elmira':        [42.0898, -76.8077],
  'Watertown':     [43.9748, -75.9108],
  'Glens Falls':   [43.3095, -73.6440],
  'Kingston':      [41.9270, -74.0168],
  'Batavia':       [43.0003, -78.1875],
}

const DECISION_COLORS = {
  EXPAND: '#10b981',
  HOLD:   '#f59e0b',
  AVOID:  '#ef4444',
}

interface Props {
  data: AnalysisResponse | null
  onCityClick: (city: string) => void
  fillHeight?: boolean
}

export default function NYMap({ data, onCityClick, fillHeight = false }: Props) {
  const analyzedCity  = data?.city ?? null
  const decision      = data?.decision ?? null
  const zones         = data?.action_plan.priority_zones ?? []
  const stationCount  = data?.ev_data.station_count ?? null

  const mapHeight = fillHeight ? '100%' : '380px'

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: mapHeight,
        width: '100%',
        borderRadius: fillHeight ? 0 : '1rem',
        border: fillHeight ? 'none' : '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* Header badge */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-[#030712]/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/8">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-gray-300 font-medium">New York State · 15 Cities</span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-[#030712]/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/8 space-y-1">
        {[
          { color: '#10b981', label: 'Expand' },
          { color: '#f59e0b', label: 'Hold' },
          { color: '#ef4444', label: 'Avoid' },
          { color: '#374151', label: 'Not analyzed' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
            <span className="text-[10px] text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Priority zones */}
      {zones.length > 0 && (
        <div className="absolute top-3 right-3 z-[1000] bg-[#030712]/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-emerald-500/25 max-w-[180px]">
          <p className="text-[9px] text-emerald-400 font-semibold uppercase tracking-widest mb-1">Priority Zones</p>
          {zones.map((z, i) => (
            <p key={z} className="text-[10px] text-gray-300 flex items-center gap-1">
              <span className="text-emerald-400 font-bold">{i + 1}.</span> {z}
            </p>
          ))}
        </div>
      )}

      <MapContainer
        center={[42.9538, -75.5268]}
        zoom={7}
        style={{ height: '100%', width: '100%', background: '#060d1f' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap &copy; CARTO'
        />

        {Object.entries(CITY_COORDS).map(([city, coords]) => {
          const isAnalyzed = city === analyzedCity
          const color = isAnalyzed && decision ? DECISION_COLORS[decision] : '#374151'

          return (
            <CircleMarker
              key={city}
              center={coords}
              radius={isAnalyzed ? 13 : 6}
              pathOptions={{
                fillColor: color,
                fillOpacity: isAnalyzed ? 0.9 : 0.55,
                color: isAnalyzed ? '#ffffff' : color,
                weight: isAnalyzed ? 2.5 : 1,
              }}
              eventHandlers={{ click: () => onCityClick(city) }}
            >
              <Popup>
                <div style={{
                  background: '#0d1829', color: '#f8fafc',
                  padding: '10px 12px', borderRadius: '8px', minWidth: '140px',
                }}>
                  <p style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{city}</p>
                  {isAnalyzed && decision && (
                    <p style={{ fontSize: '11px', color, fontWeight: 600 }}>● {decision}</p>
                  )}
                  {isAnalyzed && stationCount !== null && (
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                      {stationCount} existing stations
                    </p>
                  )}
                  {!isAnalyzed && (
                    <p style={{ fontSize: '11px', color: '#6b7280' }}>Click to analyze</p>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
