"""Stáhne všechny obrázky z odpovedi/*.json, které ještě nejsou v obrazky/.

Použití: python -X utf8 nastroje/cermat-tau/dostahni-obrazky.py <složka s odpovedi/ a obrazky/>
"""
import json
import re
import sys
import time
import urllib.request
from pathlib import Path

root = Path(sys.argv[1])
urls = set()
for f in (root / "odpovedi").glob("*.json"):
    urls |= set(re.findall(r'/uploads/[^"\s]+', f.read_text(encoding="utf-8")))

todo = sorted(u for u in urls if not (root / "obrazky" / u[len("/uploads/"):]).exists())
print("chybí", len(todo), "z", len(urls))
errors = 0
for u in todo:
    target = root / "obrazky" / u[len("/uploads/"):]
    target.parent.mkdir(parents=True, exist_ok=True)
    try:
        with urllib.request.urlopen("https://tau.cermat.gov.cz" + u, timeout=30) as r:
            data = r.read()
        if not data:
            raise ValueError("prázdná odpověď")
        target.write_bytes(data)
    except Exception as e:  # noqa: BLE001
        errors += 1
        print("chyba", u, e)
    time.sleep(0.3)
print("hotovo, chyb", errors)
