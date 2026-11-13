# Slovní úlohy: ověřitelný formát (verze 2)

Cíl: slovní úlohy pro přijímačky (typy z testů CERMAT), u kterých program sám ověří výsledek,
postup i špatné možnosti, a které jde personalizovat bez rizika, že se změní matematika.
Ověření: `node ulohy/slovni/overit.js`, testy ověřovače: `node ulohy/slovni/overit.test.js`.

## Zásady (z čeho vycházejí)

1. **Formální model odděleně od textu, výsledek z programu.** Text převedeme na neznámé a podmínky,
   program hrubou silou najde všechna řešení a úloha projde jen s právě jedním řešením
   (obdobně generování úloh s kontrolou spuštěním kódu, TemplateMath, arXiv 2411.18104,
   a kontrola shody programu a slovního řešení, Prove, arXiv 2410.12608).
2. **Nezávislé řešení z textu.** Program neověří, že podmínky odpovídají textu. Proto každou úlohu
   vyřeší druhý model nebo člověk jen z textu a otázky, bez klíče; neshoda = úloha se zahodí.
   Záznam o tom je v poli `overeni`.
3. **Ověřitelný postup.** Každý krok s čísly má `vypocet` (čistá aritmetika) a `vysledek`;
   program přepočítá každý krok a poslední výpočet musí dát odpověď
   (kontrola po krocích, „Let's Verify Step by Step“, arXiv 2305.20050).
4. **Špatné možnosti z typických chyb.** Každá špatná číselná možnost má v `chyby` výpočet, kterým
   vznikne z konkrétní chyby žáka, popis chyby a radu. Program ověří, že výpočet dá právě tu možnost.
   Rada se žákovi ukáže, když tu možnost zvolí (diagnostické možnosti; LLM bez vedení vymýšlí
   možnosti, které typickým chybám odpovídají málo, arXiv 2405.05144).
5. **Správná může být i E („jiný výsledek“).** Jinak se žák naučí, že E nikdy neplatí.
6. **Personalizace jen kontextu, ne matematiky.** Jména jsou proměnné `{o1}` s rodem (`m`/`f`), aby
   seděl tvar slovesa (našetřil/našetřila). Čísla, podmínky ani možnosti se nemění, ověření tedy platí
   pro každé dosazení. Zájmová personalizace (sport, hudba…) zlepšuje převod textu na výpočet
   (Walkington, 2013), ale nová zájmová varianta textu je nový text: musí znovu projít nezávislým řešením.
   Jména se dosazují jen v 1. pádě, kde je tvar stejný pro každé jméno daného rodu.
7. **Vzorové řešení, žádné nucené „vysvětli proč“.** Správně vyřešené vzorové příklady pomáhají
   (metaanalýza g ≈ 0,48), přidané výzvy k sebevysvětlení v průměru ne (Barbieri a kol., 2023).
   Postup se proto ukazuje po pokusu, krátce a po krocích.
8. **V zadání se předem nic nezvýrazňuje.** V testu zvýraznění není a zvýrazněná čísla svádějí
   k „chytání čísel“ bez pochopení textu. Až po špatné odpovědi se v zadání podtrhne fráze,
   kterou žák s danou chybou nejspíš přehlédl (pole `podtrhnout` u chyby), a ukáže se rada.
   Podtrhávají se vztahy („o 40 % více než loni“, „z nové ceny“), ne samotná čísla.
9. **Text pro slabšího žáka:** jedna otázka na konci, krátké věty, reálná čísla a jednotky,
   výsledek v celých číslech nebo jednoduchých desetinných číslech, jednotka u otázky.

## Pole úlohy

| pole | význam |
|---|---|
| `id`, `typ`, `vzor` | číslo, typ úlohy, odkaz na podobnou úlohu CERMAT |
| `text`, `otazka` | zadání a otázka; mohou obsahovat `{o1}`… |
| `osoby` | `{ "o1": { "rod": "f", "jmeno": "Petra" } }` – výchozí jména pro sloty |
| `nezname` | `{ "x": [min, max] }` – celočíselný rozsah pro hledání řešení |
| `pomocne` | `{ "p": "0.35*x" }` – pomocné veličiny (počítají se postupně) |
| `podminky` | `["p + t + 720 = x"]` – rovnice z textu, každá věta textu = jedna podmínka nebo veličina |
| `cil` | volitelně `{ "max": "a+b" }` nebo `{ "min": … }`, když text žádá nejvíc/nejméně |
| `celociselne` | veličiny, které musí vyjít celé |
| `odpoved` | `{ "vyraz": "x", "hodnota": 3000, "jednotka": "Kč", "zobrazeni": "3/8" }` |
| `reseni` | hodnoty neznámých podle autora (musí sedět s nalezeným řešením) |
| `moznosti`, `spravne` | A–E; E bývá „jiný výsledek“; `spravne` může být i `E` |
| `chyby` | `{ "A": { "vypocet": "2400*0.7", "popis": "…", "rada": "…", "podtrhnout": "novou cenu ještě o 10 %" } }` pro každou špatnou číselnou možnost; `podtrhnout` je přesný úsek textu nebo otázky (vztah, ne jen číslo), který se po této chybě podtrhne |
| `postup` | `[{ "text": "…", "vypocet": "2400*0.8", "vysledek": 1920 }, { "text": "…" }]` |
| `overeni` | záznam nezávislého řešení: `{ "nezavisle": "model nebo člověk", "datum": "2026-11-10", "shoda": true }` |

`vypocet` smí obsahovat jen čísla, `+ - * / ( )` a desetinnou tečku.
