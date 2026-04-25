import os
import csv
import httpx
from pathlib import Path
from datetime import datetime
from models.schemas import FuelData

EIA_BASE = "https://api.eia.gov/v2/petroleum/pri/gnd/data/"

NY_CITY_MAP = {
    "albany":       "Albany Average ($/gal)",
    "buffalo":      "Buffalo Average ($/gal)",
    "rochester":    "Rochester Average ($/gal)",
    "syracuse":     "Syracuse Average ($/gal)",
    "new york":     "New York City Average ($/gal)",
    "new york city":"New York City Average ($/gal)",
    "nyc":          "New York City Average ($/gal)",
    "binghamton":   "Binghamton Average ($/gal)",
    "utica":        "Utica Average ($/gal)",
    "ithaca":       "Ithaca Average ($/gal)",
    "kingston":     "Kingston Average ($/gal)",
    "white plains": "White Plains Average ($/gal)",
    "nassau":       "Nassau Average ($/gal)",
    "elmira":       "Elmira Average ($/gal)",
    "watertown":    "Watertown Average ($/gal)",
    "batavia":      "Batavia Average ($/gal)",
    "glens falls":  "Glens Falls Average ($/gal)",
}

FALLBACK_NATIONAL = 3.45


def _load_ny_csv() -> tuple[dict[str, dict], float]:
    """
    Parse ny_gasoline.csv.
    Returns ({city_key: {price, trend}}, ny_state_avg).
    """
    path = Path(__file__).parent.parent.parent / "data" / "ny_gasoline.csv"
    if not path.exists():
        return {}, FALLBACK_NATIONAL

    rows: list[dict] = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            rows.append(row)

    if not rows:
        return {}, FALLBACK_NATIONAL

    def _date(r: dict) -> datetime:
        try:
            return datetime.strptime(r["Date"].strip('"'), "%m/%d/%Y")
        except Exception:
            return datetime.min

    rows.sort(key=_date, reverse=True)
    latest, prev = rows[0], rows[1] if len(rows) > 1 else None

    city_data: dict[str, dict] = {}
    prices: list[float] = []

    for city_key, col in NY_CITY_MAP.items():
        try:
            current = float(latest[col].strip('"'))
            prices.append(current)
            trend = "stable"
            if prev:
                diff = current - float(prev[col].strip('"'))
                if diff > 0.05:
                    trend = "rising"
                elif diff < -0.05:
                    trend = "falling"
            city_data[city_key] = {"price": current, "trend": trend}
        except Exception:
            continue

    ny_avg = round(sum(prices) / len(prices), 3) if prices else FALLBACK_NATIONAL
    return city_data, ny_avg


async def _eia_national_avg() -> float:
    """Fetch live US national average gas price from EIA. Falls back to static value."""
    api_key = os.getenv("EIA_API_KEY")
    if not api_key:
        return FALLBACK_NATIONAL

    for product in ["EPD2D", "EPMR", "EPMM"]:
        try:
            async with httpx.AsyncClient(timeout=8) as client:
                resp = await client.get(
                    EIA_BASE,
                    params={
                        "api_key": api_key,
                        "frequency": "weekly",
                        "data[0]": "value",
                        "facets[duoarea][]": "NUS",
                        "facets[product][]": product,
                        "sort[0][column]": "period",
                        "sort[0][direction]": "desc",
                        "length": "1",
                    },
                )
            if resp.status_code == 200:
                rows = resp.json().get("response", {}).get("data", [])
                if rows and rows[0].get("value") is not None:
                    return float(rows[0]["value"])
        except Exception:
            continue

    return FALLBACK_NATIONAL


async def get_fuel_data(city: str) -> FuelData:
    city_lower = city.lower().strip()

    city_data, ny_avg = _load_ny_csv()
    national_avg = await _eia_national_avg()

    if city_lower in city_data:
        city_price = city_data[city_lower]["price"]
        trend = city_data[city_lower]["trend"]
    else:
        # City not in CSV (shouldn't happen after router validation) — use NY state avg
        city_price = ny_avg
        trend = "stable"

    delta = round(city_price - national_avg, 3)

    return FuelData(
        avg_price=round(city_price, 2),
        national_avg=round(national_avg, 2),
        price_delta=round(delta, 2),
        trend=trend,
        pressure_score=round(_pressure_score(city_price, national_avg, trend), 1),
    )


def _pressure_score(price: float, national: float, trend: str) -> float:
    score = 50.0
    delta = price - national

    if delta >= 0.50:   score += 30
    elif delta >= 0.25: score += 20
    elif delta >= 0.10: score += 10
    elif delta < -0.25: score -= 20
    elif delta < -0.10: score -= 10

    if price >= 4.50:   score += 20
    elif price >= 4.00: score += 12
    elif price >= 3.50: score += 5
    elif price < 3.00:  score -= 10

    if trend == "rising":   score += 10
    elif trend == "falling": score -= 8

    return max(0.0, min(100.0, score))
