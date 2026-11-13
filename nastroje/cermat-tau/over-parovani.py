"""Ověří, že stažené výsledky (odpovedi/) sedí na testy (testy/).

Použití: python -X utf8 nastroje/cermat-tau/over-parovani.py <složka s testy/ a odpovedi/>
Kontroluje: ID testu, množinu taskId, čísla úloh, totožnost zadání (questionBlocks),
typ úlohy, body, existenci správné odpovědi, unikátnost a umístění obrázků řešení.
"""
import collections
import json
import os
import sys
from pathlib import Path

root = Path(sys.argv[1])
problems = []
types = collections.Counter()
missing_answer = collections.Counter()
key_owner = {}
stats = collections.Counter()


def norm_blocks(blocks):
    return [
        (b.get("type"), json.dumps(b.get("data"), sort_keys=True, ensure_ascii=False))
        for b in sorted(blocks or [], key=lambda b: b.get("order", 0))
    ]


for tf in sorted((root / "testy").glob("*.json")):
    rf = root / "odpovedi" / tf.name
    if not rf.exists():
        problems.append(f"{tf.name}: chybí výsledky")
        continue
    test = json.loads(tf.read_text(encoding="utf-8"))
    res = json.loads(rf.read_text(encoding="utf-8"))
    tasks = {t["id"]: t for b in test["bundles"] for t in b["tasks"]}
    rtasks = {t["taskId"]: t for t in res["tasks"]}
    if res.get("examId", test["id"]) != test["id"]:
        problems.append(f"{tf.name}: examId nesedí")
    if set(tasks) != set(rtasks):
        problems.append(f"{tf.name}: taskId nesedí ({len(tasks)} vs {len(rtasks)})")
    for tid, t in tasks.items():
        r = rtasks.get(tid)
        if not r:
            continue
        stats["úloh"] += 1
        n = f"{tf.name} {t['taskNumber']}"
        if t["taskNumber"] != r["taskNumber"]:
            problems.append(f"{n}: číslo úlohy {r['taskNumber']}")
        if t["taskType"]["code"] != r["taskTypeCode"]:
            problems.append(f"{n}: typ {r['taskTypeCode']}")
        if float(t["points"]) != float(r["maxPoints"]):
            problems.append(f"{n}: body {t['points']} vs {r['maxPoints']}")
        if norm_blocks(t["questionBlocks"]) != norm_blocks(r["questionBlocks"]):
            problems.append(f"{n}: zadání se liší")
        if t["bundleQuestionBlocks"] and norm_blocks(t["bundleQuestionBlocks"]) != norm_blocks(r["bundleQuestionBlocks"]):
            problems.append(f"{n}: společné zadání se liší")
        types[r["taskTypeCode"]] += 1
        if not r["correctAnswer"]:
            missing_answer[r["taskTypeCode"]] += 1
        k = r.get("solutionKeyUrl")
        if k:
            stats["s klíčem"] += 1
            if f"/{test['id']}/" not in k:
                problems.append(f"{n}: klíč z jiného testu {k}")
            if not (root / "obrazky" / k[len("/uploads/"):]).exists():
                problems.append(f"{n}: klíč chybí na disku")
            key_owner.setdefault(k, []).append((tf.name, t["taskNumber"]))
        # všechny obrázky zadání musí být lokálně
        for u in __import__("re").findall(r'/uploads/[^"]+', json.dumps(r, ensure_ascii=False)):
            if not (root / "obrazky" / u[len("/uploads/"):]).exists():
                problems.append(f"{n}: chybí obrázek {u}")

shared = {k: v for k, v in key_owner.items() if len(v) > 1}
for k, v in shared.items():
    # sdílený klíč je v pořádku jen v rámci jedné skupiny (např. 8.1–8.4)
    if len({(f, num.split(".")[0]) for f, num in v}) > 1:
        problems.append(f"klíč sdílí různé úlohy: {v}")

print(dict(stats), "typy:", dict(types))
print("bez správné odpovědi:", dict(missing_answer) or "žádná")
print("sdílené klíče (v rámci skupiny):", len(shared))
print("PROBLÉMY:", len(problems))
for p in sorted(set(problems))[:40]:
    print("  ", p)
