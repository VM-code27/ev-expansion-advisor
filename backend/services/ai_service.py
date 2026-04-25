import os
import json
import httpx
from datetime import date
from models.schemas import WeatherData, FuelData, EVData

OPENROUTER_BASE = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "anthropic/claude-3-haiku"


def _build_prompt(city: str, state: str, weather: WeatherData, fuel: FuelData, ev: EVData) -> str:
    today = date.today().strftime("%B %d, %Y")
    reg_line = f"\n- Local EV Registrations in City: {ev.ev_registrations:,}" if ev.ev_registrations else ""

    prompt = f"""You are a strict EV market analyst. Today is {today}. Evaluate whether an EV charging company should expand into {city}, NY right now.

## REAL LOCAL DATA (sourced from NY State datasets)

Gas Prices (from NY State DOT weekly survey)
- {city} gas price: ${fuel.avg_price}/gal
- US national average: ${fuel.national_avg}/gal
- Difference: ${fuel.price_delta:+.2f}/gal vs national
- Recent trend: {fuel.trend}

EV Adoption (from NY DMV registration data)
- Existing charging stations in {city}: {ev.station_count}{reg_line}
- NY state EV adoption: {ev.adoption_rate}% of new car sales
- NY state YoY EV growth: {ev.growth_rate}%

Current Weather in {city}
- Temperature: {weather.temperature_f} F, {weather.condition}
- Humidity: {weather.humidity}%, Wind: {weather.wind_speed} mph

## DECISION RULES - apply these strictly:

EXPAND (score >= 72): Gas prices are above national average AND EV demand is growing AND market is not saturated.

HOLD (score 50-71): Market has mixed signals, moderate competition, or timing concerns.

AVOID (score < 50): Market too small, saturated, or weak EV demand.

Important: {city} already has {ev.station_count} charging stations. High station counts (200+) in smaller cities indicate saturation.

All timeline references must use dates from {today} forward.

## RESPOND ONLY WITH JSON:

{{
  "decision": "EXPAND" | "HOLD" | "AVOID",
  "confidence": <0-100>,
  "urgency": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "market_score": <0-100>,
  "summary": "<2 sentences, simple business meaning>",
  "signals": {{
    "fuel_pressure": {{
      "score": <0-100>,
      "insight": "<1 sentence>",
      "raw_value": "${fuel.avg_price}/gal vs ${fuel.national_avg}/gal"
    }},
    "ev_momentum": {{
      "score": <0-100>,
      "insight": "<1 sentence>",
      "raw_value": "{ev.growth_rate}% growth"
    }},
    "climate_fit": {{
      "score": <0-100>,
      "insight": "<1 sentence>",
      "raw_value": "{weather.temperature_f}F {weather.condition}"
    }}
  }},
  "risks": [
    {{"level": "HIGH"|"MEDIUM"|"LOW", "factor": "<name>", "description": "<1 sentence>"}},
    {{"level": "HIGH"|"MEDIUM"|"LOW", "factor": "<name>", "description": "<1 sentence>"}},
    {{"level": "HIGH"|"MEDIUM"|"LOW", "factor": "<name>", "description": "<1 sentence>"}}
  ],
  "action_plan": {{
    "stations_recommended": <integer>,
    "priority_zones": ["<area1>", "<area2>", "<area3>"],
    "timeline": "<e.g., Q3 2026>",
    "investment_estimate": "<range>",
    "phases": [
      {{"phase": 1, "action": "<step>", "timeline": "<range>"}},
      {{"phase": 2, "action": "<step>", "timeline": "<range>"}},
      {{"phase": 3, "action": "<step>", "timeline": "<range>"}}
    ]
  }},
  "competitor_landscape": "<1 sentence>",
  "roi_projection": "<1 sentence>"
}}
"""

    # Safety cleanup (removes any hidden unicode issues)
    prompt = prompt.replace("—", "-").replace("–", "-")

    return prompt


async def run_analysis(city: str, state: str, weather: WeatherData, fuel: FuelData, ev: EVData) -> dict:
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY not set")

    prompt = _build_prompt(city, state, weather, fuel, ev)

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "user",
                "content": prompt.encode("utf-8").decode("utf-8")
            }
        ],
        "temperature": 0.2,
        "max_tokens": 1800,
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://ev-expansion-advisor.app",
        "X-Title": "EV Expansion Advisor",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(OPENROUTER_BASE, json=payload, headers=headers)
        resp.raise_for_status()
        # Explicit UTF-8 decode avoids Windows 'ascii' codec errors with Unicode chars
        result = json.loads(resp.content.decode('utf-8'))

    raw = result["choices"][0]["message"]["content"]
    # Normalise smart Unicode punctuation to ASCII before JSON parsing
    raw = (raw
        .replace('—', '-').replace('–', '-')
        .replace('‘', "'").replace('’', "'")
        .replace('“', '"').replace('”', '"')
        .replace('…', '...')
    ).strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]

    return json.loads(raw.strip())