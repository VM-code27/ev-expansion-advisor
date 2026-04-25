export interface WeatherData {
  temperature_f: number
  condition: string
  humidity: number
  wind_speed: number
  extreme_weather: boolean
  climate_score: number
}

export interface FuelData {
  avg_price: number
  national_avg: number
  price_delta: number
  trend: string
  pressure_score: number
}

export interface EVData {
  station_count: number
  ev_registrations: number | null
  adoption_rate: number
  growth_rate: number
  momentum_score: number
}

export interface SignalDetail {
  score: number
  insight: string
  raw_value: string
}

export interface Signals {
  fuel_pressure: SignalDetail
  ev_momentum: SignalDetail
  climate_fit: SignalDetail
}

export interface Risk {
  level: 'HIGH' | 'MEDIUM' | 'LOW'
  factor: string
  description: string
}

export interface ActionPhase {
  phase: number
  action: string
  timeline: string
}

export interface ActionPlan {
  stations_recommended: number
  priority_zones: string[]
  timeline: string
  investment_estimate: string
  phases: ActionPhase[]
}

export interface AnalysisResponse {
  city: string
  state: string
  decision: 'EXPAND' | 'HOLD' | 'AVOID'
  confidence: number
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  market_score: number
  summary: string
  signals: Signals
  risks: Risk[]
  action_plan: ActionPlan
  competitor_landscape: string
  roi_projection: string
  weather: WeatherData
  fuel: FuelData
  ev_data: EVData
}
