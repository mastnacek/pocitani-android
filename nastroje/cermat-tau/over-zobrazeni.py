"""Vykreslí prohlizec.html pro každý test v headless Chrome a ověří DOM proti odpovedi/.

Použití: python -X utf8 nastroje/cermat-tau/over-zobrazeni.py <složka s prohlizec.html>
Ověřuje: každá podúloha má v pravém sloupci odpověď, nic nepadá do JSON fallbacku (<pre>),
každý solutionKeyUrl i obrázek bodovacího klíče (rubricLevels) je zobrazený u správné podúlohy
a všechny obrázky na stránce existují na disku.
"""
import html
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

CHROME = os.environ.get("CHROME", r"C:\Program Files\Google\Chrome\Application\chrome.exe")
root = Path(sys.argv[1]).resolve()
profile = tempfile.mkdtemp(prefix="chr-")
problems = []
checked = 0

for rf in sorted((root / "odpovedi").glob("*.json")):
    key = rf.stem
    url = (root / "prohlizec.html").as_uri() + f"?test={key}&all=1"
    dom = subprocess.run(
        [CHROME, "--headless=new", "--disable-gpu", f"--user-data-dir={profile}",
         "--virtual-time-budget=3000", "--dump-dom", url],
        capture_output=True, encoding="utf-8", errors="replace", timeout=60,
    ).stdout
    dom = re.sub(r"<script.*?</script>", "", dom, flags=re.S)
    if '<main id="out">' not in dom or 'class="group"' not in dom:
        problems.append(f"{key}: stránka se nevykreslila")
    if "<pre>" in dom:
        problems.append(f"{key}: JSON fallback <pre>")
    # obrázky na stránce
    for s in set(re.findall(r'<img[^>]+src="([^"]+)"', dom)):
        if not (root / html.unescape(s)).exists():
            problems.append(f"{key}: chybí soubor {s}")
    # rozsekat pravý sloupec podle podúloh
    parts = dict(re.findall(r'data-task="([^"]+)">(.*?)(?=<div class="task" data-task=|</div>\s*</section>)', dom, re.S))
    res = json.loads(rf.read_text(encoding="utf-8"))
    seen_keys = set()
    for t in res["tasks"]:
        checked += 1
        n = f"{key} {t['taskNumber']}"
        part = parts.get(t["taskId"])
        if part is None:
            problems.append(f"{n}: podúloha chybí ve stránce")
            continue
        text = re.sub(r"<[^>]+>", "", part).strip()
        if len(text) < 1 and "<img" not in part:
            problems.append(f"{n}: prázdná odpověď")
        a, c = t["correctAnswer"] or {}, t["content"] or {}
        tt = t["taskTypeCode"]
        if tt == "ZMC" and f"<b>{a['correctOption']})</b>" not in part:
            problems.append(f"{n}: chybí možnost {a['correctOption']}")
        if tt == "ZDC" and (c.get("trueLabel", "ANO") if a["value"] else c.get("falseLabel", "NE")) not in part:
            problems.append(f"{n}: chybí ANO/NE")
        if tt == "OUP" and html.escape(a["expectedAnswer"], quote=True) not in part:
            problems.append(f"{n}: chybí {a['expectedAnswer']}")
        if tt == "PRA":
            for k in a["corrections"]:
                if html.escape(k["correctForm"], quote=True) not in part:
                    problems.append(f"{n}: chybí oprava {k['correctForm']}")
        if tt == "ZPC":
            for k, v in a["mapping"].items():
                if f"→ {v})" not in part:
                    problems.append(f"{n}: chybí přiřazení {k}→{v}")
        if tt == "ZUS" and " – ".join(a["correctOrder"]) not in part:
            problems.append(f"{n}: chybí pořadí")
        if tt == "OSS":
            for lv in c.get("rubricLevels") or []:
                if lv.get("imageUrl") and "obrazky/" + lv["imageUrl"][9:] not in part:
                    problems.append(f"{n}: chybí bodovací klíč {lv['points']} b")
        k = t.get("solutionKeyUrl")
        if k:
            if "obrazky/" + k[9:] in part:
                seen_keys.add(k)
            elif k not in seen_keys:
                problems.append(f"{n}: řešení není u podúlohy")
    print(key, "ok" if not any(p.startswith(key) for p in problems) else "PROBLÉM")

print("ověřeno podúloh:", checked, "| problémů:", len(problems))
for p in problems[:40]:
    print("  ", p)
