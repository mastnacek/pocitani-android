# Oficiální testy CERMAT TAU: stažení, klíč a prohlížeč

Nástroje stáhnou testy jednotné přijímací zkoušky (9. ročník, 2023–2026) z veřejného API
procvičovací aplikace [CERMAT TAU](https://tau.cermat.gov.cz), doplní k nim správné odpovědi
a sestaví lokální prohlížeč, kde je zadání vedle odpovědi a oficiálního řešení.

**Stažená data nejsou v gitu** (`cermat-tau/` je v `.gitignore`): jsou chráněná autorským právem
CERMAT. Neposílej je do repozitáře ani nekopíruj do aplikace. Slouží jen pro rozbor typů úloh
(`docs/mapa-uloh-cermat.md`, `docs/mapa-uloh-cermat-cj.md`).

## Struktura dat (lokálně)

```
cermat-tau/
  matematika/            předmět MA
  cestina/               předmět CJ
    catalog.json         katalog všech testů v TAU
    prehled-testu.json   16 testů: rok, termín, id, počet úloh a obrázků
    testy/               zadání: {rok}-{termín}.json (RT1, RT2, NT1, NT2)
    odpovedi/            výsledky TAU se správnými odpověďmi: {rok}-{termín}.json
    obrazky/tasks/{id testu}/  obrázky zadání, řešení a bodovacích klíčů
    data.js, prohlizec.html    vygenerovaný prohlížeč (otevřít dvojklikem)
```

## Postup od nuly

Spouštěj z kořene repozitáře. Skripty čekají mezi dotazy a už stažené soubory přeskočí.

```bash
node nastroje/cermat-tau/stahni-testy.mjs   cermat-tau/matematika MA
node nastroje/cermat-tau/stahni-odpovedi.mjs cermat-tau/matematika
python -X utf8 nastroje/cermat-tau/dostahni-obrazky.py cermat-tau/matematika
python -X utf8 nastroje/cermat-tau/over-parovani.py   cermat-tau/matematika
node nastroje/cermat-tau/vytvor-data.mjs     cermat-tau/matematika "Matematika"
python -X utf8 nastroje/cermat-tau/over-zobrazeni.py  cermat-tau/matematika
```

Pro češtinu stejně se složkou `cermat-tau/cestina`, předmětem `CJ` a názvem `"Český jazyk"`.

Do aplikace v telefonu se složka předmětu nahraje přetažením a volbou **Testy CERMAT → Nahrát testy** (postup v hlavním `README.md`).

| skript | co dělá |
|---|---|
| `stahni-testy.mjs` | katalog, zadání testů a obrázky zadání (`--jen 2026-RT1` stáhne jeden test) |
| `stahni-odpovedi.mjs` | ke každému testu založí v TAU prázdné sezení, ukončí ho a uloží výsledky se správnými odpověďmi |
| `dostahni-obrazky.py` | stáhne obrázky z výsledků, které ještě chybí (řešení, bodovací klíče) |
| `over-parovani.py` | ověří, že výsledky sedí na testy: id, čísla, typy, body, zadání, umístění obrázků |
| `vytvor-data.mjs` | vytvoří `data.js` a zkopíruje `prohlizec.html` do složky předmětu |
| `over-zobrazeni.py` | vykreslí prohlížeč v headless Chrome a u každé podúlohy ověří odpověď a řešení (`CHROME=` cesta k prohlížeči) |
