import httpx
import os
from dotenv import load_dotenv
from models.schemas import WeatherData

load_dotenv()

OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5"

async def get_weather(city: str, state: str) -> WeatherData:
    api_key = os.getenv("OPENWEATHER_API_KEY")
    query = f"{city},{state},US" if state else f"{city},US"

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f"{OPENWEATHER_BASE}/weather",
            params={"q": query, "appid": api_key, "units": "imperial"},
        )
        resp.raise_for_status()
        data = resp.json()

    temp = data["main"]["temp"]
    condition = data["weather"][0]["main"]
    description = data["weather"][0]["description"]
    humidity = data["main"]["humidity"]
    wind = data["wind"]["speed"]

    extreme = condition in ("Thunderstorm", "Snow", "Extreme", "Tornado", "Hurricane")
    climate_score = _compute_climate_score(temp, condition, humidity, wind)

    return WeatherData(
        temperature_f=round(temp, 1),
        condition=description.title(),
        humidity=humidity,
        wind_speed=round(wind, 1),
        extreme_weather=extreme,
        climate_score=round(climate_score, 1),
    )


def _compute_climate_score(temp: float, condition: str, humidity: int, wind: float) -> float:
    score = 70.0

    # Ideal EV charging weather: 50-80°F, clear/cloudy, low wind
    if 50 <= temp <= 80:
        score += 20
    elif 32 <= temp < 50 or 80 < temp <= 95:
        score += 8
    elif temp < 32:
        score -= 15  # extreme cold hurts EV range → increases demand but operational challenge
    elif temp > 95:
        score -= 10

    if condition in ("Clear", "Clouds"):
        score += 10
    elif condition in ("Rain", "Drizzle"):
        score -= 5
    elif condition in ("Snow", "Thunderstorm", "Extreme"):
        score -= 20

    if wind > 30:
        score -= 5

    return max(0.0, min(100.0, score))
