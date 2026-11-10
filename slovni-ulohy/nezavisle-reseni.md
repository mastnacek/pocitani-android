> Záznam nezávislého řešení úloh 1–50 modelem gemini-3.8-flash (agent pi) z 10. 11. 2026, provedený na první verzi souboru (formát 1). Odpovědi se od té doby nezměnily; některé špatné možnosti A–E byly později nahrazeny hodnotami z typických chyb (viz pole „chyby“ v ulohy.json). Úlohy 51–53 vyřešil stejný model naslepo zvlášť, shoda u všech.

# Nezávislé řešení slovních úloh (ulohy.json)

Tento dokument obsahuje nezávislé řešení všech 50 slovních úloh z testovací sady pro žáky 9. tříd (příprava na přijímací zkoušky CERMAT).
Řešení bylo vypracováno **výhradně z polí `text` a `otazka`**, bez nahlížení do polí `nezname`, `pomocne`, `podminky`, `reseni`, `odpoved` a `spravne`. Porovnání s autorským řešením v JSONu proběhlo až po vyřešení všech úloh.

## Souhrn výsledků
- **Celkový počet úloh:** 50
- **Počet vyřešených úloh:** 50
- **Shoda s řešením v `ulohy.json`:** 50 / 50 (100 %)
- **Neshody v matematickém výsledku:** 0

---

## Přehled nezávislých řešení

| ID | Typ úlohy | Výpočet (1–2 řádky) | Odpověď | Shoda s JSON |
| :--: | :---------- | :-------------------- | :-------- | :------------: |
| **1** | součet a rozdíl | $L + J = 3480, L = J + 620 \implies 2J + 620 = 3480 \implies 2J = 2860 \implies J = 1430$ obyvatel. | **1430** (B) | Ano |
| **2** | součet a rozdíl | $M + O = 96, M = 3O \implies 4O = 96 \implies O = 24 \implies M = 3 \cdot 24 = 72$ kartiček. | **72** (D) | Ano |
| **3** | součet a rozdíl | $D + CH = 54, CH = D + 8 \implies 2D + 8 = 54 \implies 2D = 46 \implies D = 23$ dívek. | **23** (A) | Ano |
| **4** | součet a rozdíl | $K + S = 268, K = S + 196 \implies 2S + 196 = 268 \implies 2S = 72 \implies S = 36$ Kč. | **36** (A) | Ano |
| **5** | součet a rozdíl | $(E + 20) + E + 2E = 160 \implies 4E = 140 \implies E = 35$ Kč; Lucie: $L = 2 \cdot 35 = 70$ Kč. | **70** (C) | Ano |
| **6** | poměr | $7x - 2x = 5x = 1{,}5\text{ kg} \implies x = 0{,}3\text{ kg}$; těžší balík: $7 \cdot 0{,}3 = 2{,}1$ kg. | **2,1** (C) | Ano |
| **7** | poměr | Celkem $3 + 4 = 7$ dílů; $1\text{ díl} = 4200 / 7 = 600$ Kč; Bára ($4\text{ díly}$) $= 4 \cdot 600 = 2400$ Kč. | **2400** (C) | Ano |
| **8** | poměr | Rozdíl $5 - 2 = 3\text{ díly} = 450 \implies 1\text{ díl} = 150$; celkem $(5 + 2) \cdot 150 = 1050$ knih. | **1050** (D) | Ano |
| **9** | poměr | Švestky: $2\text{ díly} = 14 \implies 1\text{ díl} = 7$; jabloně ($4\text{ díly}$) $= 4 \cdot 7 = 28$ jabloní. | **28** (C) | Ano |
| **10** | poměr | Obvod $= 2(3x + 5x) = 16x = 64\text{ cm} \implies x = 4\text{ cm}$; delší strana $= 5 \cdot 4 = 20$ cm. | **20** (B) | Ano |
| **11** | poměr | $1 + 6 = 7\text{ dílů} = 21\text{ dl} \implies 1\text{ díl} = 3\text{ dl}$; sirup tvoří 1 díl $= 3$ dl. | **3** (A) | Ano |
| **12** | procenta | Po 1. slevě: $2400 \cdot 0{,}80 = 1920$ Kč; po 2. slevě: $1920 \cdot 0{,}90 = 1728$ Kč. | **1728** (B) | Ano |
| **13** | procenta | $1{,}15 \cdot P = 92\text{ Kč} \implies P = 92 / 1{,}15 = 80$ Kč. | **80** (C) | Ano |
| **14** | procenta | Podíl: $(9 / 25) \cdot 100\,\% = 0{,}36 \cdot 100\,\% = 36\,\%$. | **36** (C) | Ano |
| **15** | procenta | $1{,}40 \cdot L = 630\text{ lidí} \implies L = 630 / 1{,}4 = 450$ lidí. | **450** (B) | Ano |
| **16** | procenta | $0{,}70 \cdot L = 168\text{ dětí} \implies L = 168 / 0{,}7 = 240$ dětí. | **240** (C) | Ano |
| **17** | procenta | Původně $0{,}65 \cdot 400 = 260$ míst; po příchodu 48 lidí: $(260 + 48) / 400 = 308 / 400 = 77\,\%$. | **77** (C) | Ano |
| **18** | procenta | Přírůstek $75\,\% - 60\,\% = 15\,\%$ kapacity odpovídá 18 místům $\implies 18 / 0{,}15 = 120$ míst. | **120** (D) | Ano |
| **19** | procenta | $M = 0{,}6 Z$; $M + Z = 1{,}6 Z = 56 \implies Z = 35$ žen; muži: $M = 56 - 35 = 21$ mužů. | **21** (A) | Ano |
| **20** | procenta | Zlevnění: $250 - 200 = 50$ Kč; relativně k původní ceně 250 Kč: $50 / 250 = 20\,\%$. | **20** (A) | Ano |
| **21** | procenta | Rozdíl: $4{,}5 - 3{,}6 = 0{,}9$ km; základ je Eliška (3,6 km): $0{,}9 / 3{,}6 = 25\,\%$. | **25** (C) | Ano |
| **22** | zlomek celku | Pátek: $120 + 120 / 4 = 120 + 30 = 150$ rohlíků. | **150** (C) | Ano |
| **23** | zlomek celku | $x + \frac{4}{3}x + \frac{3}{2}x = \frac{23}{6}x = 230 \implies x = 230 \cdot \frac{6}{23} = 60$ stromů. | **60** (B) | Ano |
| **24** | zlomek celku | Přečteno: $\frac{1}{3} + \frac{1}{4} = \frac{7}{12}$; zbývá: $\frac{5}{12} = 150\text{ stran} \implies \text{celkem } 150 \cdot \frac{12}{5} = 360$ stran. | **360** (C) | Ano |
| **25** | zlomek celku | Tom snědl $3/8$, Jirka $3/8 - 1/8 = 2/8$; celkem snědeno $5/8$, zůstalo: $1 - 5/8 = 3/8$ pizzy. | **3/8** (C) | Ano |
| **26** | zlomek celku | Dopoledne prodáno $240/4 = 60$, zbylo 180; odpoledne prodáno $180/3 = 60$; večer zbylo $180 - 60 = 120$ triček. | **120** (D) | Ano |
| **27** | zlomek celku | Přírůstek $\frac{5}{8} - \frac{2}{5} = \frac{9}{40}\text{ nádrže} = 180\text{ l} \implies \text{celá nádrž } 180 \cdot \frac{40}{9} = 800$ litrů. | **800** (D) | Ano |
| **28** | nepřímá úměrnost | Celková práce: $6 \cdot 10 = 60$ člověkodní; pro 4 malíře: $60 / 4 = 15$ dní. | **15** (C) | Ano |
| **29** | přímá úměrnost | 1 kg jablek stojí $98 / 4 = 24{,}5$ Kč; za 6 kg zaplatíme $6 \cdot 24{,}5 = 147$ Kč. | **147** (B) | Ano |
| **30** | přímá úměrnost | Rychlost čerpání $= 240 / 8 = 30\text{ l/min}$; na 390 litrů je třeba $390 / 30 = 13$ minut. | **13** (B) | Ano |
| **31** | nepřímá úměrnost | Kapacita krmiva: $12 \cdot 30 = 360$ koňodní; pro 18 koní vystačí na $360 / 18 = 20$ dní. | **20** (A) | Ano |
| **32** | poměr a úměrnost | Slabší stroj: $140 / 4 = 35$ ks/h; silnější stroj: $35 \cdot \frac{5}{2} = 87{,}5$ ks/h; za 6 h: $87{,}5 \cdot 6 = 525$ součástek. | **525** (C) | Ano |
| **33** | přímá úměrnost | Spotřeba na 375 km: $6{,}4 \cdot 3{,}75 = 24$ litrů benzínu. | **24** (B) | Ano |
| **34** | společná práce | Výkon: $\frac{1}{30} + \frac{1}{20} = \frac{5}{60} = \frac{1}{12}\text{ třídy/min} \implies$ společný čas je 12 minut. | **12** (B) | Ano |
| **35** | společná práce | Výkon: $\frac{1}{6} + \frac{1}{3} = \frac{3}{6} = \frac{1}{2}\text{ bazénu/h} \implies$ společný čas jsou 2 hodiny. | **2** (A) | Ano |
| **36** | společná práce | Rychlosti: matka $3/45 = 1/15$ kg/min, otec $2/60 = 1/30$ kg/min; společně $1/10$ kg/min; 5 kg oloupou za $5 / (1/10) = 50$ minut. | **50** (C) | Ano |
| **37** | společná práce | Výkon druhého: $\frac{1}{6} - \frac{1}{10} = \frac{2}{30} = \frac{1}{15}\text{ zdi/den} \implies$ sám zedník zeď postaví za 15 dní. | **15** (C) | Ano |
| **38** | jednotky | Trasa: $3{,}6\text{ km} = 360\,000\text{ cm}$; Ema: $360\,000 / 60 = 6000$ kroků; Filip: $360\,000 / 80 = 4500$ kroků; rozdíl: $6000 - 4500 = 1500$ kroků. | **1500** (C) | Ano |
| **39** | pohyb | Čas v hodinách: $t = 60 / 80 = 0{,}75\text{ h}$; v minutách: $0{,}75 \cdot 60 = 45$ minut. | **45** (B) | Ano |
| **40** | pohyb | Čas: $2\text{ h } 15\text{ min} = 2{,}25\text{ h}$; průměrná rychlost: $v = 54 / 2{,}25 = 24$ km/h. | **24** (C) | Ano |
| **41** | jednotky | Objem: $3\text{ l} = 30\text{ dl}$; počet sklenic: $30 / 2 = 15$ sklenic. | **15** (C) | Ano |
| **42** | jednotky | Objem ve 4 sklenicích: $4 \cdot 0{,}35\text{ l} = 1{,}4\text{ l} = 1400$ ml. | **1400** (B) | Ano |
| **43** | ceny a soustava | Rozdíl: $2\text{ rohlíky} = 23 - 13 = 10\text{ Kč} \implies 1\text{ rohlík} = 5$ Kč; $2\text{ housky} = 13 - 5 = 8\text{ Kč} \implies 1\text{ houska} = 4$ Kč. | **4** (B) | Ano |
| **44** | ceny a soustava | $110d + 180(120 - d) = 17680 \implies 21600 - 70d = 17680 \implies 70d = 3920 \implies d = 56$ dětí. | **56** (A) | Ano |
| **45** | ceny a soustava | $160(20 - B) + 190B = 3470 \implies 3200 + 30B = 3470 \implies 30B = 270 \implies B = 9$ turistů. | **9** (A) | Ano |
| **46** | ceny a soustava | $4A + 2(23 - A) = 76 \implies 2A + 46 = 76 \implies 2A = 30 \implies A = 15$ aut. | **15** (C) | Ano |
| **47** | celočíselné | Každý pár (1 auto + 1 autobus) zabere $1 + 3 = 4$ místa; počet autobusů: $60 / 4 = 15$ autobusů. | **15** (B) | Ano |
| **48** | celočíselné | Cyril: $C$; Petr: $C + 4$; Honza: $1{,}25 C$; $C + 4 = 1{,}25 C \implies 0{,}25 C = 4 \implies C = 16$; Petr: $16 + 4 = 20$ komiksů. | **20** (C) | Ano |
| **49** | celočíselné | $15x + 20y = 115 \implies 3x + 4y = 23$. Pro maximum lístků $x + y$: minimální $y = 2 \implies 3x = 15 \implies x = 5$; lístků celkem $5 + 2 = 7$. | **7** (C) | Ano |
| **50** | celočíselné | $6(10 - k_{10}) + 10 k_{10} = 76 \implies 60 + 4 k_{10} = 76 \implies 4 k_{10} = 16 \implies k_{10} = 4$ krabičky. | **4** (A) | Ano |

---

## Rozbor nejednoznačností, formulací a obhajitelných možností (distraktorů)

V žádné z 50 úloh nedošlo k věcné či početní chybě v zadání – všechny úlohy mají při standardním a korektním porozumění textu právě jedno jednoznačné řešení odpovídající autorskému klíči.

Níže uvádíme detailní rozbor úloh, kde by při méně pozorném čtení, alternativním jazykovém výkladu nebo častých žákovských miskoncepcích bylo možné obhajovat jinou nabízenou možnost A–E:

### 1. Úloha 49 (optimalizační podmínka vs. diofantická rovnice)
- **Zadání:** *„Na pouti stojí lístky na atrakce 15 Kč nebo 20 Kč. Ondra utratil přesně 115 Kč a chtěl mít co nejvíce lístků. Kolik lístků Ondra koupil?“*
- **Správná možnost:** **C (7 lístků)** – kombinace $5 \times 15\text{ Kč} + 2 \times 20\text{ Kč} = 115\text{ Kč}$ dává $5 + 2 = 7$ lístků.
- **Obhajitelná možnost při zanedbání optimalizace:** **B (6 lístků)**.
- **Důvod:** Diofantická rovnice $15x + 20y = 115$ pro nezáporná celá čísla $x, y$ má v daném oboru přesně **dvě celočíselná řešení**:
  1. $x = 5, y = 2 \implies x + y = 7$ lístků
  2. $x = 1, y = 5 \implies x + y = 6$ lístků ($1 \times 15 + 5 \times 20 = 115\text{ Kč}$)
  Pokud by žák přehlédl klauzuli *„a chtěl mít co nejvíce lístků“* a pouze nalezl platnou kombinaci lístků za 115 Kč, možnost **B (6)** je zcela korektním nákupem za 115 Kč.

### 2. Úloha 21 (základ procentuálního srovnání)
- **Zadání:** *„Eliška ušla 3,6 km, Petr ušel 4,5 km. O kolik procent delší cestu ušel Petr než Eliška?“*
- **Správná možnost:** **C (25 %)** – základem srovnání je cesta Elišky ($3{,}6\text{ km}$), rozdíl $0{,}9 / 3{,}6 = 25\,\%$.
- **Možnost B (20 %):** Žáci často chybují ve volbě základu a dělí rozdíl dráhou Petra ($0{,}9 / 4{,}5 = 20\,\%$). To odpovídá otázce *„O kolik procent kratší cestu ušla Eliška než Petr?“*.
- **Možnost D (125 %):** Odpovídá otázce *„Kolik procent cesty Elišky ušel Petr?“* ($4{,}5 / 3{,}6 = 125\,\%$).

### 3. Úloha 20 (základ při zlevnění)
- **Zadání:** *„Cena vstupenky klesla z 250 Kč na 200 Kč. O kolik procent vstupenka zlevnila?“*
- **Správná možnost:** **A (20 %)** – zlevnění o 50 Kč z původní ceny 250 Kč ($50 / 250 = 20\,\%$).
- **Možnost B (25 %):** Častá chyba počítání procent ze zlevněné ceny ($50 / 200 = 25\,\%$).

### 4. Úloha 12 (skládání slev)
- **Zadání:** *„Bunda stála 2 400 Kč. Nejdříve ji zlevnili o 20 %, potom novou cenu ještě o 10 %. Kolik korun stojí bunda teď?“*
- **Správná možnost:** **B (1728 Kč)** – postupné násobení $2400 \cdot 0{,}80 \cdot 0{,}90$.
- **Možnost A (1680 Kč):** Velmi častá žákovská miskoncepce sčítání procentních bodů ($20\,\% + 10\,\% = 30\,\%$ z původní ceny $2400 \cdot 0{,}70 = 1680\text{ Kč}$). Ačkoliv text jasně říká *„potom novou cenu ještě o 10 %“*, možnost A je typickým silným distraktorem.

### 5. Úloha 13, 15 a 16 (výpočet základu ze změněné hodnoty)
- **Úloha 13:** Jízdenka po zdražení o 15 % stojí 92 Kč. Správně **C (80 Kč)**. Možnost **B (78,2 Kč)** vznikne chybným odečtením 15 % z 92 Kč ($92 - 13{,}8 = 78{,}2$).
- **Úloha 15:** 630 lidí je o 40 % více než loni. Správně **B (450)**. Možnost **A (378)** vznikne chybným odečtením 40 % z 630 ($630 - 252 = 378$).
- **Úloha 16:** 168 dětí je o 30 % méně než loni. Správně **C (240)**. Možnost **A (218,4)** vznikne přičtením 30 % ze 168 ($168 + 50{,}4 = 218{,}4$).

### 6. Úloha 34 a 35 (společná práce – sčítání a průměrování časů)
- **Úloha 34:** Anna 30 min, Bedřich 20 min. Správně **B (12 min)**. Možnost **C (25 min)** je aritmetický průměr $(30+20)/2$, možnost **D (50 min)** je součet časů $30 + 20$.
- **Úloha 35:** Potrubí za 6 h a za 3 h. Správně **A (2 h)**. Možnost **C (4,5 h)** je průměr $(6+3)/2$, možnost **D (9 h)** je součet.

### 7. Úloha 39 a 40 (převody jednotek času u rychlosti)
- **Úloha 39:** $60\text{ km}$ při $80\text{ km/h} \implies 0{,}75\text{ h}$. Správně **B (45 minut)**. Možnost **D (75)** je typické zmatení desetinné části hodiny $0{,}75\text{ h}$ se 75 minutami.
- **Úloha 40:** $54\text{ km}$ za $2\text{ h } 15\text{ min}$. Správně **C (24 km/h)**. Pokud žák chybně dosadí čas jako $2{,}15\text{ h}$, vyjde $54 / 2{,}15 \doteq 25{,}116\text{ km/h}$, což odpovídá nabízené možnosti **D (25,2 km/h)**.

### 8. Úlohy na soustavy rovnic se záměnou hledané neznámé
V úlohách se dvěma veličinami jsou mezi možnostmi A–D systematicky zařazeny hodnoty druhé (komplementární) veličiny:
- **Úloha 1:** Javorník má 1430 (B); distractor D (2050) je Lipová.
- **Úloha 2:** Martin má 72 (D); distractor A (24) je Ondra.
- **Úloha 3:** Dívek je 23 (A); distractor C (31) jsou chlapci.
- **Úloha 4:** Sešit stojí 36 (A); distractor D (232) je kniha.
- **Úloha 5:** Lucie má 70 (C); distractor A (35) je Eva, B (55) je Jana.
- **Úloha 6:** Těžší balík váží 2,1 kg (C); distractor A (0,6 kg) je lehčí balík.
- **Úloha 7:** Bára má 2400 Kč (C); distractor A (1800 Kč) je Adam.
- **Úloha 9:** Jabloní je 28 (C); distractor B (21) jsou hrušně.
- **Úloha 19:** Mužů je 21 (A); distractor D (35) jsou ženy.
- **Úloha 43:** Houska stojí 4 Kč (B); distractor C (5 Kč) je rohlík.
- **Úloha 44:** Dětí bylo 56 (A); distractor C (64) jsou dospělí.
- **Úloha 45:** Menu B mělo 9 lidí (A); distractor B (11) mělo menu A.
- **Úloha 46:** Aut je 15 (C); distractor A (8) jsou motorky.
- **Úloha 48:** Petr má 20 (C); distractor A (16) je Cyril.
- **Úloha 50:** Krabiček po 10 vejcích je 4 (A); distractor B (6) jsou krabičky po 6 vejcích.

### 9. Možnost E („jiný výsledek“)
V žádné z 50 úloh v `ulohy.json` není správnou volbou možnost **E („jiný výsledek“)**. Přestože tato volba slouží v testech CERMAT jako psychologická záchranná brzda / distractor, pro všech 50 úloh je přesná číselná hodnota přítomna mezi možnostmi A–D.
