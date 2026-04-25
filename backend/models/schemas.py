from pydantic import BaseModel
from typing import Optional


class AnalyzeRequest(BaseModel):
    city: str
    state: Optional[str] = None


class WeatherData(BaseModel):
    temperature_f: float
    condition: str
    humidity: int
    wind_speed: float
    extreme_weather: bool
    climate_score: float


class FuelData(BaseModel):
    avg_price: float
    national_avg: float
    price_delta: float
    trend: str
    pressure_score: float


class EVData(BaseModel):
    station_count: int
    ev_registrations: Optional[int]
    adoption_rate: float
    growth_rate: float
    momentum_score: float


class SignalDetail(BaseModel):
    score: float
    insight: str
    raw_value: str


class Signals(BaseModel):
    fuel_pressure: SignalDetail
    ev_momentum: SignalDetail
    climate_fit: SignalDetail


class Risk(BaseModel):
    level: str
    factor: str
    description: str


class ActionPhase(BaseModel):
    phase: int
    action: str
    timeline: str


class ActionPlan(BaseModel):
    stations_recommended: int
    priority_zones: list[str]
    timeline: str
    investment_estimate: str
    phases: list[ActionPhase]


class AnalysisResponse(BaseModel):
    city: str
    state: str
    decision: str
    confidence: float
    urgency: str
    market_score: float
    summary: str
    signals: Signals
    risks: list[Risk]
    action_plan: ActionPlan
    competitor_landscape: str
    roi_projection: str
    weather: WeatherData
    fuel: FuelData
    ev_data: EVData
