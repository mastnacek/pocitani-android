# Mapa úloh přijímaček z češtiny (9. ročník)

Zdroj: 16 testů z oficiální procvičovací aplikace CERMAT TAU (roky 2023–2026, vždy 1. a 2. řádný
a 1. a 2. náhradní termín), stažené lokálně do `cermat-tau/cestina/` (mimo git, postup v `nastroje/cermat-tau/README.md`). Celkem 715 podúloh.
Popisy úloh jsou vlastními slovy, texty testů se nekopírují. Výchozí texty jsou v TAU většinou
jako obrázky, takže rozbor vychází z otázek, možností, pokynů a oficiálních oblastí úloh.

Test má 30 úloh za 50 bodů. V TAU jsou testy 2024 za 58 bodů: ano/ne úlohy tam mají 1 bod
za každé tvrzení místo 0,5 bodu, ostatní stavba je stejná.

## Formáty odpovědí (průměr bodů na test)

| formát | ø bodů na test | jak vypadá | podíl |
|---|---|---|---|
| výběr jedné z A–D | 17 | 17 úloh po 1 bodu: tvrzení o textu, správně napsaná věta, význam slova, slovní druh… | 34 % |
| pravopisná a jazyková oprava do polí | 10 | najdi v textu chybně napsaná slova a zapiš je správně (3–4 b), vypiš slova určitého druhu (2–3 b), podmět a přísudek věty (1 b) | 20 % |
| ano/ne (4 tvrzení) | 8 | 4 tvrzení po 0,5 bodu: odpovídá výchozímu textu? je věta napsaná správně? | 16 % |
| přiřazování A–E nebo A–F | 7 | úloha 6 (3 b) a úloha 30 (4 b): věty ke skladbě, slovesa k vidu, tvary ke spisovnosti, významy slov, druhy vedlejších vět, básnické prostředky | 14 % |
| krátká otevřená odpověď | 5 | doplň správný tvar slova do věty, napiš slovo podle zadání, urči druh větného členu, doplň frazém | 10 % |
| uspořádání částí textu | 3 | seřaď 6 částí textu do správného pořadí (3 b) | 6 % |

Uzavřené formáty (A–D, ano/ne, přiřazování, uspořádání) dávají asi **35 bodů z 50**.

## Stavba testu

Test je postavený kolem 6 až 8 výchozích textů. Ke každému patří několik úloh za sebou:
- **umělecký text**: úryvek prózy nebo báseň (úlohy 1–4, 18–23 apod.),
- **naučný nebo publicistický text**: historie, technika, věda (ano/ne k obsahu, význam slov, slovní druhy),
- **„TEXT 2“ s definicí pojmu**: krátký výklad (např. přesah ve verši, typy charakteristiky, pomnožná podstatná jména, činitelská jména), podle kterého se řeší otázka k jinému textu. Úloha prověřuje, jestli žák pochopí a použije novou definici,
- **samostatné věty**: pravopis, skladba, spisovnost.

Stálá místa (ve všech 16 testech):
- **úloha 1**: správně napsaná věta nebo pravopisná chyba ve výchozím textu (A–D),
- **úlohy 2–4**: porozumění uměleckému textu, básnické prostředky (personifikace, přesah, rým),
- **úloha 6 nebo 5**: přiřazování ke skladbě věty (větné členy, podmět a přísudek) nebo k vidu sloves,
- **jedna úloha s pravopisnou opravou za 4 body** (najdi a oprav chyby v textu),
- **ano/ne ke správnosti zápisu vět** (čárky, shoda, tvary),
- **uspořádání textu (3 b)**: úloha 14 nebo 15,
- **úloha 30**: přiřazování za 4 body (spisovnost, druhy vedlejších vět, významy slova, básnické prostředky).

## Oficiální oblasti (ø bodů na test, z 12 testů s označením; rok 2024 oblasti nemá)

| oblast | ø bodů | typické úlohy |
|---|---|---|
| **E – porozumění textu** | 14,5 | ano/ne k obsahu naučného textu (4 tvrzení), co z textu vyplývá, kdo mluví přímou řečí, záměr a funkce textu, uspořádání textu, vztah mezi slovy (slovo a materiál, část a celek), řešení podle definice z TEXTU 2 |
| **D – morfologie** | 10,3 | doplnit správný tvar slova do věty, vypsat z textu slova určitého druhu (zájmena, podstatná jména), vid sloves (dokonavé a nedokonavé), přechodníky, pád a číslo, spisovnost tvarů (začli, vypla, ty auta), zájmeno a to, k čemu odkazuje |
| **A – pravopis** | 8,3 | najdi a oprav chyby v textu (i/y, shoda podmětu s přísudkem, mě/mně, předpony s/z, zdvojené souhlásky, velká písmena, přejatá slova di/dy), správně napsaná věta, čárky ve větách a souvětích (ano/ne) |
| **C – syntax** | 6,8 | podmět a přísudek (základní skladební dvojice, zapsat), druh větného členu (příslovečné určení času, místa, podmínky…), větné členy ve větě (přiřazování), druh vedlejší věty, spojovací výraz v souvětí, větná stavba |
| **B – lexikologie** | 6,3 | význam slova v kontextu, synonyma a antonyma, citové zabarvení, frazémy a ustálená spojení (doplnit, vysvětlit), tvoření slov (příbuzné slovo podle zadání, vzor skloňování), přejatá slova |
| **F – sloh a literatura** | 3,3 | literární druh a žánr (próza, poezie, sci-fi, nonsens, satira), vypravěč, slohový útvar (úvaha, popis, líčení, charakteristika), rým, verš, sloka, posouzení slohové práce |

## Co by šlo procvičovat v aplikaci

Aplikace je zatím jen na matematiku. Kdyby přibyla čeština, dají se dobře **generovat a strojově
ověřovat** hlavně krátké jazykové úlohy, které nepotřebují dlouhý výchozí text:

1. **Pravopis ve větách** (ø 8 b): i/y po obojetných souhláskách a ve vyjmenovaných slovech, shoda
   podmětu s přísudkem, mě/mně, s/z, velká písmena, čárky v souvětí. Formát ano/ne a „najdi a oprav“.
   Ověření: sada správných vět a z nich řízeně vytvořené chyby (víme, kde je chyba).
2. **Podmět a přísudek, druh větného členu, druh vedlejší věty** (ø 7 b): věty s anotací.
3. **Slovní druhy, vid sloves, pády, spisovnost tvarů** (ø 10 b): slovník tvarů s mluvnickými kategoriemi.
4. **Význam slov, synonyma, antonyma, frazémy** (ø 6 b): slovník s ověřenými dvojicemi.
5. **Porozumění textu** (ø 14,5 b, největší oblast): potřebuje výchozí text a ověřená tvrzení. Strojově
   se ověřuje špatně, šlo by to jen s pečlivě připravenou a ručně zkontrolovanou sadou nebo s AI
   a nezávislou kontrolou dvou modelů. Pro trénink porozumění je nejlepší řešit celé testy v TAU.

Pro slabšího žáka se nejvíc vyplatí: nikdy nenechat prázdnou uzavřenou úlohu (35 bodů z 50 je
uzavřených), u ano/ne k obsahu textu hledat odpověď přímo v textu, a pravopis vět (opakuje se
každý rok ve stejné podobě).
