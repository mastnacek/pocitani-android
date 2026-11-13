# Čeština: zdroj vět pro pravopisné úlohy

Věty jsou vlastní, ve stylu přijímaček. Oficiální texty CERMAT se sem nekopírují.
Aplikace z vět skládá úlohy A–D: „Ve které větě je chyba?“ (3 věty správně, 1 špatně)
nebo „Která věta je napsaná správně?“ (1 správně, 3 špatně). Špatná věta vzniká jen záměnou
koncovky nebo tvaru, takže správnost je daná tímto souborem.

- Zdroj: `vety.json`
- Kontrola formátu: `node ulohy/cestina/vlozit.js --check`
- Vložení do aplikace: `node ulohy/cestina/vlozit.js` (přepíše blok mezi `/*CJ_START*/` a `/*CJ_END*/`
  v `app/src/main/assets/index.html`). Pak zkopíruj `index.html` do `pocitani-na-prijimacky.html`.
- Testy: `node --test tests/`

## `shoda`: shoda přísudku s podmětem

| pole | význam |
|---|---|
| `p` | podmět, jak je ve větě (`psi`, `Petr a Jana`) |
| `r` | rod podmětu: `mzi` mužský životný (-i), `mzn` mužský neživotný (-y), `z` ženský (-y), `s` střední (-a) |
| `t` | věta, `_` = koncovka příčestí hned za slovem (`honil_`). Může jich být víc (`byl_ … opraven_`). |
| `x` | jen u pastí (úroveň „Jako u přijímaček“): vlastní vysvětlení místo obecného |

## `memne`: mě, nebo mně

| pole | význam |
|---|---|
| `k` | správný tvar: `mě` (2. a 4. pád), `mně` (3. a 6. pád) |
| `d` | pád: 2, 3, 4, 6 |
| `t` | věta, `_` = místo pro tvar (právě jedno) |
| `z` | zkušební věta s tebe/tobě, když prosté dosazení nesedí (`ke mně` → `k tobě`) |
| `x` | jen u pastí: vlastní vysvětlení |

## Jak přidat větu

1. Přidej ji do `vety.json`.
2. Přidej její správný tvar i do nezávislé tabulky v `tests/cestina.test.js` (`SHODA_OK` nebo `MEMNE_OK`).
   Tabulku piš sám, ne kopií z `vety.json`: test porovnává dva nezávislé zápisy.
3. `node ulohy/cestina/vlozit.js`, zkopíruj `index.html` do webové verze a spusť `node --test tests/`.
