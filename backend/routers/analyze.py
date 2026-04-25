import asyncio
from fastapi import APIRouter, HTTPException
from models.schemas import AnalyzeRequest, AnalysisResponse, SignalDetail, Signals, Risk, ActionPlan, ActionPhase
from services.weather_service import get_weather
from services.fuel_service import get_fuel_data
from services.ev_service import get_ev_data
from services.ai_service import run_analysis

router = APIRouter(prefix="/api", tags=["analysis"])

NY_CITIES = {
    "new york city", "nyc", "new york",
    "buffalo", "rochester", "syracuse", "albany",
    "utica", "binghamton", "white plains", "nassau",
    "ithaca", "elmira", "watertown", "glens falls",
    "kingston", "batavia",
}


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_city(request: AnalyzeRequest):
    city = request.city.strip().title()
    city_lower = request.city.strip().lower()

    if request.state and request.state.upper() != "NY":
        raise HTTPException(
            status_code=400,
            detail=f"This advisor covers New York State only. '{city}' is outside NY."
        )

    if city_lower not in NY_CITIES:
        raise HTTPException(
            status_code=400,
            detail=(
                f"'{city}' is not in the supported list. "
                "Supported cities: New York City, Buffalo, Rochester, Syracuse, Albany, "
                "Utica, Binghamton, White Plains, Nassau, Ithaca, Elmira, "
                "Watertown, Glens Falls, Kingston, Batavia."
            )
        )

    try:
        weather, fuel, ev = await asyncio.gather(
            get_weather(city, "NY"),
            get_fuel_data(city),
            get_ev_data(city),
        )
    except Exception as e:
       print("DATA FETCH ERROR:", repr(e))
       raise HTTPException(status_code=502, detail=f"Data fetch error: {repr(e)}")

    try:
        ai_result = await run_analysis(city, "NY", weather, fuel, ev)
    except Exception as e:
       print("AI ANALYSIS ERROR:", repr(e))
       raise HTTPException(status_code=502, detail=f"AI analysis error: {repr(e)}")

    try:
        signals = Signals(
            fuel_pressure=SignalDetail(**ai_result["signals"]["fuel_pressure"]),
            ev_momentum=SignalDetail(**ai_result["signals"]["ev_momentum"]),
            climate_fit=SignalDetail(**ai_result["signals"]["climate_fit"]),
        )
        risks = [Risk(**r) for r in ai_result["risks"]]
        ap_data = ai_result["action_plan"]
        action_plan = ActionPlan(
            stations_recommended=ap_data["stations_recommended"],
            priority_zones=ap_data["priority_zones"],
            timeline=ap_data["timeline"],
            investment_estimate=ap_data["investment_estimate"],
            phases=[ActionPhase(**p) for p in ap_data["phases"]],
        )
        return AnalysisResponse(
            city=city,
            state="NY",
            decision=ai_result["decision"],
            confidence=float(ai_result["confidence"]),
            urgency=ai_result["urgency"],
            market_score=float(ai_result["market_score"]),
            summary=ai_result["summary"],
            signals=signals,
            risks=risks,
            action_plan=action_plan,
            competitor_landscape=ai_result["competitor_landscape"],
            roi_projection=ai_result["roi_projection"],
            weather=weather,
            fuel=fuel,
            ev_data=ev,
        )
    except (KeyError, TypeError) as e:
        raise HTTPException(status_code=500, detail=f"Response parsing error: {str(e)}")


@router.get("/health")
async def health():
    return {"status": "ok", "scope": "New York State"}
