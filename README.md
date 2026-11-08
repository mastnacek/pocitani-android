# Počítání na přijímačky – Android

Tenký obal (WebView) kolem `app/src/main/assets/index.html`. Vše běží v telefonu,
internet je potřeba jen pro vysvětlování přes OpenRouter (a pro webové fonty; bez nich se použijí systémové).

## Build
1. `cp local.properties.example local.properties` a doplň `sdk.dir`, `OPENROUTER_KEY`, `OPENROUTER_MODEL`.
2. Otevři v Android Studiu (vygeneruje Gradle wrapper), nebo `gradle wrapper && ./gradlew assembleRelease`.
3. APK: `app/build/outputs/apk/release/app-release.apk` → nainstaluj (`adb install ...`).

Verze AGP/Kotlinu/knihoven jsou z doby psaní; pokud Studio nabídne novější, klidně aktualizuj.

## Klíč
- Klíč je v `local.properties` → `BuildConfig`, ne v HTML ani v gitu.
- Z APK se dá vytáhnout. Na openrouter.ai nastav u klíče **kreditní limit** a APK nikam nesdílej.

## Aktualizace stránky
Novou verzi HTML stačí nakopírovat přes `app/src/main/assets/index.html` a znovu sestavit.
Data (statistiky, sešit chyb) jsou v localStorage WebView a aktualizaci aplikace přežijí
(odinstalace je smaže).
