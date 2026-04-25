import httpx
import os
from pathlib import Path
from models.schemas import EVData

NREL_BASE = "https://developer.nrel.gov/api/alt-fuel-stations/v1.json"

# NY state EV adoption stats (DOE 2023)
NY_EV_ADOPTION_RATE = 8.4   # % of new vehicle registrations that are BEV/PHEV
NY_EV_GROWTH_RATE   = 34.8  # YoY growth %

# ZIP code prefix → city mapping for NY registration CSV
NY_ZIP_CITY: dict[str, list[str]] = {
    "new york city": ["100", "101", "102", "103", "104"],
    "new york":      ["100", "101", "102", "103", "104"],
    "nyc":           ["100", "101", "102", "103", "104"],
    "white plains":  ["105", "106"],
    "nassau":        ["110", "111", "112", "113", "114", "115", "116", "117", "118"],
    "albany":        ["120", "121", "122", "123"],
    "glens falls":   ["128"],
    "syracuse":      ["130", "131", "132"],
    "utica":         ["133", "134", "135"],
    "watertown":     ["136"],
    "binghamton":    ["137", "138", "139"],
    "buffalo":       ["140", "141", "142"],
    "batavia":       ["143"],
    "rochester":     ["144", "145", "146"],
    "ithaca":        ["147", "148"],
    "elmira":        ["149"],
    "kingston":      ["124"],
}


def _count_registrations(city: str) -> int | None:
    """Return pre-aggregated EV registration count for a city from ny_ev_summary.json."""
    import json
    path = Path(__file__).parent.parent.parent / "data" / "ny_ev_summary.json"
    if not path.exists():
        return None
    try:
        summary: dict[str, int] = json.loads(path.read_text(encoding="utf-8"))
        # Try exact city name match (title-cased) first, then lowercase scan
        for key, count in summary.items():
            if key.lower() == city.lower().strip():
                return count if count > 0 else None
    except Exception:
        pass
    return None


async def _nrel_station_count(city: str) -> int:
    """Fetch live EV charging station count from NREL AFDC for a NY city."""
    api_key = os.getenv("NREL_API_KEY", "DEMO_KEY")
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                NREL_BASE,
                params={
                    "api_key": api_key,
                    "fuel_type": "ELEC",
                    "city": city,
                    "state": "NY",
                    "status": "E",
                },
            )
        if resp.status_code == 200:
            return int(resp.json().get("total_results", 0))
    except Exception:
        pass
    return 0


async def get_ev_data(city: str) -> EVData:
    station_count = await _nrel_station_count(city)
    ev_registrations = _count_registrations(city)

    momentum_score = _momentum_score(station_count, ev_registrations)

    return EVData(
        station_count=station_count,
        ev_registrations=ev_registrations,
        adoption_rate=NY_EV_ADOPTION_RATE,
        growth_rate=NY_EV_GROWTH_RATE,
        momentum_score=round(momentum_score, 1),
    )


def _momentum_score(stations: int, registrations: int | None) -> float:
    score = 45.0

    # NY state baseline is already strong (8.4% adoption, 34.8% growth)
    score += 20.0

    # Existing stations = market already validating demand
    if stations >= 300:   score += 20
    elif stations >= 100: score += 14
    elif stations >= 50:  score += 8
    elif stations >= 20:  score += 3

    # Local registrations from real CSV
    if registrations is not None:
        if registrations >= 50000:   score += 15
        elif registrations >= 20000: score += 10
        elif registrations >= 5000:  score += 6
        elif registrations >= 1000:  score += 3

    return max(0.0, min(100.0, score))
