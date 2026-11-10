# Počítání na přijímačky – Android

Tenký obal (WebView) kolem `app/src/main/assets/index.html`. Vše běží v telefonu,
internet je potřeba jen pro vysvětlování přes OpenRouter (a pro webové fonty; bez nich se použijí systémové).

## Jak to vypadá
Ukázka z telefonu (verze 1.7, zrychleno): správná odpověď a postup, výběr tématu, špatná odpověď s tipem, sešit chyb, přehled a pracovní list.
Video ve větším rozlišení: [docs/demo.mp4](docs/demo.mp4).

<img src="docs/demo.gif" width="300" alt="Ukázka používání aplikace">

Snímky z telefonu (verze 1.7).

| Trénink | Příklad | Za co jsou body |
|:---:|:---:|:---:|
| <img src="docs/screenshots/01-trenink.png" width="240" alt="Výběr tématu a obtížnosti"> | <img src="docs/screenshots/02-priklad.png" width="240" alt="Příklad na čtverečkovaném papíře"> | <img src="docs/screenshots/03-bodovani.png" width="240" alt="Bodování podle klíče Cermatu"> |
| **Pracovní list** | **Průvodce** | |
| <img src="docs/screenshots/04-pracovni-list.png" width="240" alt="Pracovní list k vytištění"> | <img src="docs/screenshots/05-pruvodce.png" width="240" alt="Jak přijímačky fungují"> | |

## Build
1. `cp local.properties.example local.properties` a doplň `sdk.dir`, `OPENROUTER_KEY`, `OPENROUTER_MODEL`.
2. Otevři v Android Studiu (vygeneruje Gradle wrapper), nebo `gradle wrapper && ./gradlew assembleRelease`.
3. APK: `app/build/outputs/apk/release/app-release.apk` → nainstaluj (`adb install ...`).

Verze AGP/Kotlinu/knihoven jsou z doby psaní; pokud Studio nabídne novější, klidně aktualizuj.

## Klíč
- Klíč lze od verze 1.1 zadat přímo v aplikaci: tlačítko ⚙ v pravém horním rohu („Vysvětlování přes AI“). Uloží se do localStorage zařízení, má přednost před `local.properties` a do gitu ani APK se nedostane.
- Alternativně (stejně jako dřív) se dá klíč i model zapsat do `local.properties` → `BuildConfig`; z APK se ale dají vytáhnout.
- Na openrouter.ai nastav u klíče **kreditní limit**.

## Aktualizace stránky
Novou verzi HTML stačí nakopírovat přes `app/src/main/assets/index.html` a znovu sestavit.
Data (statistiky, sešit chyb) jsou v localStorage WebView a aktualizaci aplikace přežijí
(odinstalace je smaže).
