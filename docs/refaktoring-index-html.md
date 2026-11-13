# Plán: rozdělení `index.html` do souborů

Stav k verzi 1.19 (commit `a04bbbc`). Cíl: přerostlý `app/src/main/assets/index.html` (2 525 řádků, 309 kB,
řádek až 54 570 znaků) rozdělit na menší soubory **bez jakékoli změny chování**. Plán je pro programátora,
který ho provede samostatně; po každém kroku musí projít všechny kontroly níže.

## Výchozí stav (ověřeno)

| část | velikost | co obsahuje |
|---|---|---|
| `<style>` (1 blok) | 27 kB, 371 ř. | základní vzhled, téma češtiny (papír), testy CERMAT, zvětšení obrázku, tisk (`@media print` 4×) |
| markup v `<body>` | 7 kB, 106 ř. | hlavička, záložky, sekce `v-*`, dialog AI |
| `<script>` 0 | 0,6 kB | `window.AI_CONFIG` + most `AndroidCfg` |
| `<script>` 1 | 180 kB, 1 167 ř. | `Fr`, `F`, `P`, parser výrazů, `check()`, 22 generátorů `gen*`, `TOPICS`, `generate()`, data `SLOVNI` (57 kB, mezi `/*SLOVNI_START*/…/*SLOVNI_END*/`), `PROMENNA` (9,5 kB), čeština (`CJ_*`, `SHODA`/`MEMNE` mezi `/*CJ_START*/…/*CJ_END*/`, `genShoda`, `genMeMne`) |
| `<script>` 2 | 82 kB, 854 ř. | rozhraní v jednom IIFE `(function(){'use strict'; … })()`: texty průvodce (`GUIDES`, 26 kB), store/stav, předměty, trénink, AI, nastavení, pracovní list, sešit chyb, přehled, papír češtiny (`drawPaper`), Testy CERMAT (`cm*`), zvětšení obrázku (`zoom*`), routing, `gridSnap` |

Mezi top-level jmény bloku 1 (137) a IIFE (106) **není žádná kolize** (ověřeno skriptem).

Na struktuře závisí:
- `tests/helpers.js` `loadAppContext()` spouští `blocks[0]` a `blocks[1]` z `index.html` ve `vm` a vystavuje vybraná jména,
- `tests/cermat.test.js` vyřezává kód mezi komentáři `// ---------- Testy CERMAT ----------` a `// ---------- routing ----------`,
- `tests/app.test.js` (test „Shoda obou kopií HTML stránky“) vyžaduje, aby `pocitani-na-prijimacky.html` byla shodná s `index.html`,
- `ulohy/slovni/vlozit.js` a `ulohy/cestina/vlozit.js` přepisují bloky mezi značkami přímo v `index.html`,
- `MainActivity` načítá `https://appassets.androidplatform.net/assets/index.html` přes `WebViewAssetLoader.AssetsPathHandler`
  (podsložky v `assets/` obslouží bez úprav).

## Cílová struktura

Klasické skripty (`<script src>`), **ne ES moduly**: webová verze běží i ze `file://` a testy spouštějí kód ve `vm`
se sdílenými globálními jmény. Klasické skripty sdílejí globální lexikální prostor, takže `const` z jednoho souboru
je vidět v dalším. Každý soubor začíná `'use strict';`.

```
app/src/main/assets/
  index.html                      jen markup + <link> a <script src> v pevném pořadí (~130 ř.)
  css/
    zaklad.css                    proměnné, layout, list (.sheet), trénink, přehled, tisk
    cestina.css                   přepínač předmětů, téma a papír češtiny
    cermat.css                    Testy CERMAT, tablet, zvětšení obrázku
  js/
    config.js                     dnešní <script> 0
    jadro.js                      Fr, F, P, parser, analyze, check, pomocné funkce (escT, fmtNum …)
    matematika/
      zaklady.js                  celá čísla, násobení, přednost, dělitelnost, krácení
      zlomky.js                   zlomky, složené zlomky, desetinná čísla, mocniny, procenta
      vyrazy.js                   roznásobování, vytýkání, vzorce
      rovnice.js                  rovnice, soustavy
      slovni.js                   genSlovni, slovniPrompt, JMENA, fmtOpt …
      promenna.js                 genPromenna (data PROMENNA v data/)
    cestina/
      generatory.js               CJ_*, cjPick, cjMC, genShoda, genMeMne
    temata.js                     TOPIC_GROUPS, TOPICS (+ témata češtiny), GUIDE_DEFAULT, TRAP_DEFAULT, generate, stepHTML
    data/
      slovni.js                   const SLOVNI=[…];   generuje ulohy/slovni/vlozit.js
      promenna.js                 const PROMENNA=[…];
      cestina.js                  const SHODA=[…],MEMNE=[…];   generuje ulohy/cestina/vlozit.js
    ui/
      pruvodce-texty.js           GUIDE_GENERAL, GUIDE_GENERAL_CJ, GUIDES, guideHTML
      stav.js                     store, save, today, $, předměty (subject, L, subjTopics, loadTopics), state
      trenink.js                  chips, renderSeg, newProblem, renderDots, showTick, doCheck, showSteps, souhrn série
      ai.js                       AI vysvětlování + nastavení klíče
      pracovni-list.js, sesit-chyb.js, prehled.js
      papir.js                    paperGrain, drawPaper, ResizeObserver papíru
      routing.js                  VIEWS, renderGuides, route, applySubject, setSubject, start aplikace
      gridsnap.js                 zarovnání na čtverečky
    cermat/
      testy.js                    cm* (seznam, nahrávání, průchod testem, bodování)
      zoom.js                     zoom* (zvětšení obrázku)
```

Pravidla:
- žádný řádek kódu delší než 200 znaků; výjimka jen pro generované soubory v `js/data/`,
- soubor nad ~400 řádků rozdělit dál podle obsahu,
- pořadí skriptů v `index.html` = pořadí závislostí; start aplikace (dnešní konec IIFE: `applySubject()`, `renderTopicChips()`,
  `newProblem()`, `route()` …) až v posledním souboru `ui/routing.js` (nebo `ui/start.js`),
- jména globálů, klíče `localStorage` (`barunka-matika-v1`, `barunka-matika-ai`), ID prvků a CSS třídy se **nemění**,
- komentáře v kódu zůstávají (česky), přesouvají se spolu s kódem.

## Postup (každý krok = samostatný commit, po každém všechny kontroly)

0. **Základ pro porovnání.** Než se cokoli změní, nahrát referenční výstup (viz Kontroly, bod 3) ze stávající verze
   a uložit ho mimo git (např. `%TEMP%`). `git pull` před začátkem: na repozitáři pracuje i jiný agent.
1. **CSS ven.** `<style>` rozdělit do `css/zaklad.css`, `css/cestina.css`, `css/cermat.css`, v `index.html` tři `<link>`.
   Pořadí pravidel zachovat (kaskáda), `@media print` nechat u pravidel, ke kterým patří.
2. **Data ven.** `SLOVNI`, `PROMENNA`, `SHODA`/`MEMNE` do `js/data/*.js`. Upravit `ulohy/slovni/vlozit.js`
   a `ulohy/cestina/vlozit.js`, aby zapisovaly do `js/data/slovni.js` a `js/data/cestina.js` (celý soubor,
   bez značek v `index.html`). Oba skripty musí zůstat idempotentní a dál nejdřív ověřovat (`overit.js`, `--check`).
   Aktualizovat `ulohy/*/FORMAT.md` a komentáře, které značky zmiňují.
3. **Jádro a generátory ven.** Blok 1 rozdělit podle cílové struktury. `tests/helpers.js` přepsat tak, aby místo
   `blocks[0]`/`blocks[1]` načetl `js/config.js`, `js/jadro.js`, `js/data/*.js`, `js/matematika/*.js`,
   `js/cestina/*.js`, `js/temata.js` v pořadí z `index.html` (pořadí číst z `<script src>` v `index.html`, ne opisovat ručně,
   a vynechat `js/ui/*` a `js/cermat/*`). Vystavená jména (`__app`) zůstávají stejná.
4. **Rozhraní ven.** IIFE zrušit, obsah rozdělit do `js/ui/*.js` a `js/cermat/*.js`. Před tím skriptem ověřit,
   že žádné top-level jméno se nekryje s jiným souborem ani s vlastností `window`, která by vadila (`name`, `status`,
   `top`, `close`, `print`, `history`, `length`, `event` …); kolizi přejmenovat jen uvnitř souboru. `tests/cermat.test.js`
   upravit, aby četl `js/cermat/testy.js` (a co potřebuje), ne výřez z `index.html`.
5. **Webová verze sestavením.** Nový `nastroje/sestav-web.mjs`: z `index.html` vloží obsah `<link>` a `<script src>`
   přímo do stránky a zapíše `pocitani-na-prijimacky.html` (CRLF jako dnes), aby webová verze zůstala jeden soubor.
   Test „Shoda obou kopií“ nahradit testem, že výstup `sestav-web.mjs` je shodný s commitnutým souborem.
6. **Dokumentace.** README (sekce Struktura, Aktualizace stránky), `ulohy/*/FORMAT.md`, komentáře s odkazy na `index.html`.
   Přidat test, který hlídá délku řádků (kromě `js/data/`) a že `index.html` je pod ~300 řádky.

## Kontroly po každém kroku

1. `node --test tests/` — všechno zelené (dnes 52/52, po změnách testů aspoň stejné pokrytí).
2. `node ulohy/slovni/vlozit.js` a `node ulohy/cestina/vlozit.js` — po spuštění žádná změna v gitu (idempotence).
3. **Stejné chování v prohlížeči.** Stránku obsloužit přes `python -m http.server` (z `file://` nejde načíst data testů)
   a v headless Chrome nebo Playwrightu s **pevným `Math.random`** (seedovaný PRNG vložený před ostatní skripty) pro oba
   předměty a záložky `trenink`, `cermat`, `list`, `chyby`, `pruvodce`, `prehled` uložit `innerHTML` hlavních sekcí
   a seznam chyb z konzole (`window.onerror`, `console.error`). Výstup musí být **shodný se základem z kroku 0**
   a bez chyb v konzoli. Pro záložku `cermat` použít data z `cermat-tau/` (v gitu nejsou, jen lokálně; složka `cermat/`
   vedle stránky, např. junction) a projít aspoň otevření testu, výběr, kontrolu a další úlohu.
4. Vizuálně jeden snímek trénink + test na šířku 1280×800 v obou předmětech, porovnat se základem.
5. Pozor na Windows: Git Bash přepisuje cesty začínající `/` (`MSYS_NO_PATHCONV=1`), headless Chrome s
   `--virtual-time-budget` umí viset (dávat `timeout`). **Nikdy** neukončovat procesy přes `taskkill /IM chrome.exe`
   (zavře uživatelův prohlížeč); vlastní headless procesy hledat podle `--user-data-dir` v příkazové řádce.

## Mimo rozsah

- žádné změny funkcí, vzhledu, textů ani dat; žádné nové závislosti v aplikaci,
- neměnit `MainActivity.kt`, `CermatData.kt` ani Gradle (kromě verze na konci: `versionCode`/`versionName` +1),
- nesahat na `cermat-tau/` (data CERMAT, mimo git) a na necommitnuté OCR skripty v `nastroje/cermat-tau/`
  (`ocr.py`, `ladeni-ocr.py`, `korektura.*`) — o nich rozhodne uživatel zvlášť,
- APK nesestavovat; sestavuje uživatel jinde.

## Hotovo, když

- `index.html` má jen markup a odkazy (do ~300 řádků), žádný zdrojový soubor nemá přes ~400 řádků,
- všechny kontroly výše prošly na posledním commitu, commity jsou po krocích, na konci `git push`,
- APK by po sestavení načetlo stránku ze stejných `assets/` (podsložky `css/`, `js/`) bez úprav Kotlinu.
