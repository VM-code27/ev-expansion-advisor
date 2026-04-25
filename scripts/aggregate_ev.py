"""
Run once locally to produce data/ny_ev_summary.json from the 135 MB CSV.
The summary is tiny (~1 KB) and safe to commit to git.
"""
import csv
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"

NY_ZIP_CITY: dict[str, list[str]] = {
    "New York City": ["100", "101", "102", "103", "104"],
    "White Plains":  ["105", "106"],
    "Nassau":        ["110", "111", "112", "113", "114", "115", "116", "117", "118"],
    "Kingston":      ["124"],
    "Albany":        ["120", "121", "122", "123"],
    "Glens Falls":   ["128"],
    "Syracuse":      ["130", "131", "132"],
    "Utica":         ["133", "134", "135"],
    "Watertown":     ["136"],
    "Binghamton":    ["137", "138", "139"],
    "Buffalo":       ["140", "141", "142"],
    "Batavia":       ["143"],
    "Rochester":     ["144", "145", "146"],
    "Ithaca":        ["147", "148"],
    "Elmira":        ["149"],
}

counts: dict[str, int] = {city: 0 for city in NY_ZIP_CITY}

csv_path = DATA_DIR / "ny_ev_registrations.csv"
print(f"Reading {csv_path} ...")

with open(csv_path, newline="", encoding="utf-8-sig") as f:
    reader = csv.DictReader(f)
    for row in reader:
        z = row.get("ZIP Code", "").strip()
        for city, prefixes in NY_ZIP_CITY.items():
            if any(z.startswith(p) for p in prefixes):
                counts[city] += 1
                break

out_path = DATA_DIR / "ny_ev_summary.json"
out_path.write_text(json.dumps(counts, indent=2), encoding="utf-8")
print(f"Written to {out_path}")
for city, n in counts.items():
    print(f"  {city:<20} {n:>6} registrations")
