// ulohy/slovni/overit.test.js
// Automated tests for ulohy/slovni/overit.js using pure Node.js (node:test and node:assert)
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

const OVERIT_BIN = path.join(__dirname, 'overit.js');

describe('Ověřovací skript slovních úloh (overit.js)', () => {
  let tempDir;

  before(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'overit-test-'));
  });

  after(() => {
    try {
      if (tempDir && fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch {}
  });

  // Base valid problem template in Format 2
  const createBaseProblem = () => ({
    id: 1,
    typ: 'součet a rozdíl',
    vzor: 'součet a rozdíl dvou čísel',
    text: 'Obce Lipová a Javorník mají dohromady 3 480 obyvatel. Lipová má o 620 obyvatel více než Javorník.',
    otazka: 'Kolik obyvatel má Javorník?',
    nezname: { j: [0, 3480] },
    pomocne: { l: 'j+620' },
    podminky: ['j+l=3480'],
    celociselne: ['j'],
    odpoved: { vyraz: 'j', hodnota: 1430, jednotka: 'obyvatel' },
    reseni: { j: 1430, l: 2050 },
    moznosti: { A: 2860, B: 1430, C: 1740, D: 2050, E: 'jiný výsledek' },
    spravne: 'B',
    postup: [
      { text: 'Kdyby měly obě obce stejně obyvatel jako Javorník, měly by dohromady o 620 méně.', vypocet: '3480-620', vysledek: 2860 },
      { text: 'Tento zbytek rozdělíme rovným dílem mezi obě obce, čímž získáme počet obyvatel Javorníku.', vypocet: '2860/2', vysledek: 1430 }
    ],
    chyby: {
      A: {
        vypocet: '3480-620',
        popis: 'Odečten pouze rozdíl 620 obyvatel bez následného rozdělení zbytku dvěma.',
        rada: 'Číslo 2 860 představuje obyvatele obou obcí bez přebytku Lipové. Rozděl tento zbytek ještě dvěma: 2 860 / 2 = 1 430.',
        podtrhnout: 'mají dohromady 3 480 obyvatel'
      },
      C: {
        vypocet: '3480/2',
        popis: 'Rozdělení celkového počtu obyvatel napůl bez zohlednění rozdílu mezi obcemi.',
        rada: 'Obce nemají stejný počet obyvatel. Nejdříve odečti rozdíl 620 a teprve zbytek děl dvěma: (3 480 - 620) / 2 = 1 430.',
        podtrhnout: 'Lipová má o 620 obyvatel více než Javorník'
      },
      D: {
        vypocet: '(3480+620)/2',
        popis: 'Spočítán počet obyvatel Lipové místo Javorníku.',
        rada: 'Pozor, otázka se ptá na Javorník. Lipová má 2 050 obyvatel, Javorník má o 620 méně: 2 050 - 620 = 1 430 obyvatel.',
        podtrhnout: 'Kolik obyvatel má Javorník?'
      }
    },
    overeni: {
      nezavisle: 'gemini-3.8-flash (pi)',
      datum: '2026-11-10',
      shoda: true
    }
  });

  function runOverit(testProblems) {
    const tempFile = path.join(tempDir, `test-${Date.now()}-${Math.random().toString(36).slice(2)}.json`);
    fs.writeFileSync(tempFile, JSON.stringify(testProblems, null, 2), 'utf8');
    const proc = spawnSync(process.execPath, [OVERIT_BIN, tempFile], { encoding: 'utf8' });
    try { fs.unlinkSync(tempFile); } catch {}
    return {
      status: proc.status,
      stdout: proc.stdout || '',
      stderr: proc.stderr || ''
    };
  }

  it('1. správná sada úloh projde s návratovým kódem 0', () => {
    const problems = [createBaseProblem()];
    const res = runOverit(problems);
    assert.strictEqual(res.status, 0, 'Skript měl skončit s kódem 0');
    assert.match(res.stdout, /1\s+OK\s+součet a rozdíl/, 'Měl vypsat stav OK');
    assert.match(res.stdout, /Úloh: 1, prošlo: 1, chyby: 0/, 'Měl hlásit 0 chyb');
  });

  it('2. zachytí chybný výsledek (nesoulad hodnoty odpovědi nebo řešení)', () => {
    const problem = createBaseProblem();
    problem.odpoved.hodnota = 9999;

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1 při chybě');
    assert.match(res.stdout, /CHYBA/, 'Měl vypsat CHYBA');
    assert.match(res.stdout, /odpověď vychází 1430, uvedeno 9999/, 'Měl specifikovat nesoulad v odpovědi');
  });

  it('3. zachytí nejednoznačné řešení (více možných řešení splňujících podmínky)', () => {
    const problem = createBaseProblem();
    problem.nezname = { j: [1, 5] };
    problem.podminky = ['j=j'];

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1 pro nejednoznačné řešení');
    assert.match(res.stdout, /řešení není jediné \(nalezeno 5\)/, 'Měl zachytit vícenásobné řešení');
  });

  it('4. zachytí duplicitní hodnoty mezi možnostmi A–E', () => {
    const problem = createBaseProblem();
    problem.moznosti.A = 1430; // Shodné s možností B (1430)
    problem.chyby.A.vypocet = '2860/2';

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1 při duplicitních možnostech');
    assert.match(res.stdout, /dvě možnosti mají stejnou hodnotu/, 'Měl hlásit duplicitu v možnostech');
  });

  it('5. zachytí neceločíselné řešení pro veličinu označenou v celociselne', () => {
    const problem = createBaseProblem();
    problem.nezname = { j: [1, 5] };
    problem.pomocne = { p: 'j/2' };
    problem.podminky = ['j=3'];
    problem.celociselne = ['p'];

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1 při nesplnění celočíselnosti');
    assert.match(res.stdout, /řešení není jediné \(nalezeno 0\)/, 'Měl najít 0 celočíselných řešení');
  });

  it('6. zachytí neplatnou syntaxi výrazu (chyba při překladu)', () => {
    const problem = createBaseProblem();
    problem.podminky = ['j +++* 2 = 3480'];

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1 při chybě syntaxe');
    assert.match(res.stdout, /chyba ve výrazu:/, 'Měl zachytit syntaktickou chybu');
  });

  it('7. úspěšně ověří úlohu s polem cil (max) a správnou možností E („jiný výsledek“)', () => {
    const problem = {
      id: 70,
      typ: 'celočíselné',
      vzor: 'celočíselné optimum',
      text: 'Na pouti stojí lístky na atrakce 15 Kč nebo 20 Kč. Ondra utratil přesně 115 Kč a chtěl mít co nejvíce lístků.',
      otazka: 'Kolik lístků Ondra koupil?',
      nezname: { x: [0, 10], y: [0, 10] },
      pomocne: { listky: 'x+y', utrata: '15*x+20*y' },
      podminky: ['utrata=115'],
      celociselne: ['x', 'y'],
      cil: { max: 'listky' },
      odpoved: { vyraz: 'listky', hodnota: 7, jednotka: 'lístků' },
      reseni: { x: 5, y: 2, listky: 7, utrata: 115 },
      moznosti: { A: 1, B: 2, C: 3, D: 4, E: 'jiný výsledek' },
      spravne: 'E',
      postup: [
        { text: 'Pro co nejvíce lístků koupíme 5 lístků po 15 Kč a 2 po 20 Kč.', vypocet: '5+2', vysledek: 7 }
      ],
      chyby: {
        A: { vypocet: '1', popis: 'Zvolen nákup pouze jednoho lístku.', rada: 'Za 115 Kč lze koupit více lístků.', podtrhnout: 'co nejvíce lístků' },
        B: { vypocet: '2', popis: 'Zvolen nákup pouze dvou lístků.', rada: 'Za 115 Kč lze koupit více lístků.', podtrhnout: 'co nejvíce lístků' },
        C: { vypocet: '3', popis: 'Zvolen nákup pouze tří lístků.', rada: 'Za 115 Kč lze koupit více lístků.', podtrhnout: 'co nejvíce lístků' },
        D: { vypocet: '4', popis: 'Zvolen nákup pouze čtyř lístků.', rada: 'Za 115 Kč lze koupit více lístků.', podtrhnout: 'co nejvíce lístků' }
      },
      overeni: {
        nezavisle: 'gemini-3.8-flash (pi)',
        datum: '2026-11-10',
        shoda: true
      }
    };

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 0, 'Skript měl skončit s kódem 0');
    assert.match(res.stdout, /70\s+OK\s+celočíselné/, 'Měl vypsat stav OK');
    assert.match(res.stdout, /Úloh: 1, prošlo: 1, chyby: 0/, 'Měl hlásit 0 chyb');
  });

  it('8. zachytí chybný výpočet v kroku postupu', () => {
    const problem = createBaseProblem();
    problem.postup[0].vysledek = 9999; // 3480-620 = 2860, ale uvedeno 9999

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1 při chybě v postupu');
    assert.match(res.stdout, /krok 1: 3480-620 = 2860, uvedeno 9999/, 'Měl nahlásit chybu výpočtu v kroku postupu');
  });

  it('9. zachytí, když poslední výpočet postupu nedává odpověď', () => {
    const problem = createBaseProblem();
    problem.postup.push({ text: 'Další krok', vypocet: '100+10', vysledek: 110 });

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1, když poslední krok nedává odpověď');
    assert.match(res.stdout, /poslední výpočet postupu dává 110, odpověď je 1430/, 'Měl hlásit nesoulad posledního výpočtu');
  });

  it('10. zachytí špatnou možnost bez popisu chyby', () => {
    const problem = createBaseProblem();
    delete problem.chyby.A; // možnost A nemá záznam v chyby

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1 při chybějícím popisu chyby');
    assert.match(res.stdout, /možnost A: chybí popis chyby, ze které vznikne/, 'Měl hlásit chybějící popis chyby');
  });

  it('11. zachytí, když výpočet chyby nedává hodnotu možnosti', () => {
    const problem = createBaseProblem();
    problem.chyby.A.vypocet = '3480-100'; // dává 3380, ale možnost A je 2860

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1 při nesouladu výpočtu chyby');
    assert.match(res.stdout, /možnost A: výpočet chyby 3480-100 = 3380, možnost je 2860/, 'Měl hlásit nesoulad výpočtu chyby');
  });

  it('12. zachytí nedeklarovaný slot {o9}', () => {
    const problem = createBaseProblem();
    problem.text = 'Obce {o9} a Javorník mají dohromady 3 480 obyvatel.';

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1 při nedeklarovaném slotu');
    assert.match(res.stdout, /slot \{o9\} není v „osoby“/, 'Měl hlásit nedeklarovaný slot');
  });

  it('13. zachytí deklarovaný, ale nepoužitý slot', () => {
    const problem = createBaseProblem();
    problem.osoby = { o1: { rod: 'm', jmeno: 'Martin' } }; // o1 je deklarován, ale nikde v textu nepoužit

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1 při nepoužitém slotu');
    assert.match(res.stdout, /slot \{o1\} se v textu nepoužívá/, 'Měl hlásit nepoužitý slot');
  });

  it('14. zachytí chybějící pole podtrhnout u špatné možnosti', () => {
    const problem = createBaseProblem();
    delete problem.chyby.A.podtrhnout;

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1 při chybějícím podtrhnout');
    assert.match(res.stdout, /možnost A: chybí podtrhnout/, 'Měl hlásit chybějící podtrhnout');
  });

  it('15. zachytí frázi v podtrhnout, která není v zadání ani v otázce', () => {
    const problem = createBaseProblem();
    problem.chyby.A.podtrhnout = 'neexistující text v zadání';

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1 pro neexistující frázi');
    assert.match(res.stdout, /možnost A: fráze „neexistující text v zadání“ není v zadání ani v otázce/, 'Měl hlásit neexistující frázi');
  });

  it('16. zachytí, když podtrhnout je pouze číslo bez písmen', () => {
    const problem = createBaseProblem();
    problem.chyby.A.podtrhnout = '3 480'; // Pouze číslo ze zadání bez písmen/vztahu

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1 pro podtrhnout pouze s číslem');
    assert.match(res.stdout, /možnost A: podtrhnout je jen číslo, má to být vztah/, 'Měl hlásit, že podtrhnout je jen číslo');
  });

  it('17. zachytí jméno ve slotu po předložce (není v 1. pádě)', () => {
    const problem = createBaseProblem();
    problem.osoby = { o1: { rod: 'f', jmeno: 'Eliška' } };
    problem.chyby.A.rada = 'Základem je trasa pro {o1}.'; // po dosazení „pro Eliška“
    problem.text = problem.text + ' {o1} to spočítala.';

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 1, 'Skript měl skončit s kódem 1 při slotu po předložce');
    assert.match(res.stdout, /slot po „pro“ není v 1\. pádě/, 'Měl hlásit slot po předložce');
  });

  it('18. jméno ve slotu v 1. pádě projde', () => {
    const problem = createBaseProblem();
    problem.osoby = { o1: { rod: 'f', jmeno: 'Eliška' } };
    problem.text = problem.text + ' {o1} to spočítala.';

    const res = runOverit([problem]);
    assert.strictEqual(res.status, 0, 'Slot v 1. pádě má projít');
  });
});
