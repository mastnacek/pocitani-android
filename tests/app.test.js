// tests/app.test.js
// Automated test suite for Počítání na přijímačky (index.html)
// Pure Node.js test runner (node:test + node:assert), no external dependencies.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');
const {
  INDEX_HTML_PATH,
  WEB_HTML_PATH,
  scriptBlocks,
  evaluateExpr,
  loadAppContext
} = require('./helpers');
const {
  verifyPromennaIndependent,
  verifyPromennaMutation
} = require('./promenna-independent');

const app = loadAppContext();

describe('Počítání na přijímačky – komplexní testovací sada aplikace', () => {

  describe('(1) Syntaktická platnost všech <script> bloků', () => {
    it('všechny <script> bloky v index.html mají bezchybnou JavaScript syntaxi', () => {
      assert.ok(scriptBlocks.length >= 2, 'index.html musí obsahovat alespoň 2 skripty');
      for (let i = 0; i < scriptBlocks.length; i++) {
        assert.doesNotThrow(() => {
          new vm.Script(scriptBlocks[i]);
        }, `Skript blok ${i + 1} obsahuje syntaktickou chybu`);
      }
    });
  });

  describe('(2) Generování a ověřování příkladů (min. 300 pro každé téma a úroveň)', () => {
    for (const topic of app.TOPICS) {
      it(`téma: ${topic.id} (${topic.name}) – 300 příkladů pro L1 i L2`, () => {
        for (const level of [1, 2]) {
          for (let i = 0; i < 300; i++) {
            let p;
            assert.doesNotThrow(() => {
              p = app.generate(topic.id, level);
            }, `generate("${topic.id}", ${level}) vyhodil výjimku na iteraci ${i}`);

            assert.ok(p, `Příklad nesmí být null pro ${topic.id} L${level}`);

            // Ověření vzorového řešení p.sol
            const solInputs = (p.kind === 'sys' || p.kind === 'promenna') ? p.sol : [p.sol];
            const checkSol = app.check(p, solInputs);
            assert.strictEqual(
              checkSol.ok,
              true,
              `Vzorové řešení selhalo pro ${topic.id} L${level}: ${JSON.stringify(p.sol)}`
            );

            // Ověření, že chybná odpověď (výsledek + 1) selže pro kind num / eq / sys
            if (p.kind === 'num') {
              const wrongFr = app.F.add(p.ans, app.Fr(1));
              const wrongInput = p.decimal ? app.decStr(wrongFr).replace('\u2212', '-') : app.frSol(wrongFr);
              const checkWrong = app.check(p, [wrongInput]);
              assert.strictEqual(checkWrong.ok, false, `Chybná odpověď ${wrongInput} nečekaně prošla pro ${topic.id} L${level}`);
            } else if (p.kind === 'eq') {
              const wrongInput = p.ans.special ? '1' : app.frSol(app.F.add(p.ans, app.Fr(1)));
              const checkWrong = app.check(p, [wrongInput]);
              assert.strictEqual(checkWrong.ok, false, `Chybná odpověď ${wrongInput} nečekaně prošla pro rovnice L${level}`);
            } else if (p.kind === 'sys') {
              const wrongX = app.frSol(app.F.add(p.ans.x, app.Fr(1)));
              const checkWrong = app.check(p, [wrongX, p.sol[1]]);
              assert.strictEqual(checkWrong.ok, false, `Chybná odpověď x=${wrongX} nečekaně prošla pro soustavy L${level}`);
            }
          }
        }
      });
    }
  });

  describe('(3) Nezávislé přepočtení výsledků vlastním evaluátorem', () => {
    it('numerická témata s plain výrazem odpovídají ans (300 příkladů na úroveň)', () => {
      const numTopics = ['celacisla', 'nasobeni', 'prednost', 'delitelnost', 'kraceni', 'zlomky', 'desetinna', 'mocniny', 'slozene'];
      for (const tid of numTopics) {
        for (const level of [1, 2]) {
          for (let i = 0; i < 300; i++) {
            const p = app.generate(tid, level);
            assert.ok(p.plain, `Příklad pro ${tid} L${level} musí mít pole plain`);
            const evaluated = evaluateExpr(p.plain);
            const expected = p.ans.n / p.ans.d;
            assert.ok(
              Math.abs(evaluated - expected) < 1e-4,
              `Rozpor v přepočtu ${tid} L${level}: plain=${p.plain}, evaluátor=${evaluated}, ans=${expected}`
            );
          }
        }
      }
    });

    it('úpravy výrazů (roznasobovani, vytykani, vzorce) se shodují s ans po dosazení proměnných', () => {
      const polyTopics = ['roznasobovani', 'vytykani', 'vzorce'];
      const testValues = [-3, -1, 0, 1, 2, 5];
      for (const tid of polyTopics) {
        for (const level of [1, 2]) {
          for (let i = 0; i < 300; i++) {
            const p = app.generate(tid, level);
            const varName = p.v || 'x';
            for (const val of testValues) {
              const evaluated = evaluateExpr(p.plain, { [varName]: val });
              let expected = 0;
              for (let deg = 0; deg < p.ans.length; deg++) {
                const c = p.ans[deg];
                expected += (c.n / c.d) * Math.pow(val, deg);
              }
              assert.ok(
                Math.abs(evaluated - expected) < 1e-4,
                `Rozpor v polynomu ${tid} L${level} pro ${varName}=${val}: plain=${p.plain}`
              );
            }
          }
        }
      }
    });

    it('rovnice (rovnice): dosazení řešení do levé i pravé strany plain dává rovnost', () => {
      for (const level of [1, 2]) {
        for (let i = 0; i < 300; i++) {
          const p = app.generate('rovnice', level);
          const parts = p.plain.split('=');
          assert.strictEqual(parts.length, 2, `Výraz rovnice musí obsahovat jedno =: ${p.plain}`);
          const [lhsStr, rhsStr] = parts;
          const varName = p.v || 'x';

          if (!p.ans.special) {
            const root = p.ans.n / p.ans.d;
            const lhsVal = evaluateExpr(lhsStr, { [varName]: root });
            const rhsVal = evaluateExpr(rhsStr, { [varName]: root });
            assert.ok(
              Math.abs(lhsVal - rhsVal) < 1e-4,
              `Dosazení kořene x=${root} do rovnice L${level} ${p.plain} nesedí: L=${lhsVal}, P=${rhsVal}`
            );
          } else if (p.ans.special === 'all') {
            for (const testVal of [0, 1, 4]) {
              const lhsVal = evaluateExpr(lhsStr, { [varName]: testVal });
              const rhsVal = evaluateExpr(rhsStr, { [varName]: testVal });
              assert.ok(Math.abs(lhsVal - rhsVal) < 1e-4, `Rovnice s nekonečně mnoha řešeními nesedí: ${p.plain}`);
            }
          } else if (p.ans.special === 'none') {
            const lhsVal = evaluateExpr(lhsStr, { [varName]: 0 });
            const rhsVal = evaluateExpr(rhsStr, { [varName]: 0 });
            assert.ok(Math.abs(lhsVal - rhsVal) > 1e-4, `Rovnice bez řešení dala rovnost v x=0: ${p.plain}`);
          }
        }
      }
    });
  });

  describe('(4) Slovní úlohy (téma slovni)', () => {
    it('při opakovaném generování se objeví všech 53 úloh ze SLOVNI', () => {
      const seenIds = new Set();
      for (let i = 0; i < 1000 && seenIds.size < app.SLOVNI.length; i++) {
        const p = app.generate('slovni', 1);
        seenIds.add(p.slovni);
      }
      assert.strictEqual(seenIds.size, 53, `Musí se vygenerovat všech 53 úloh (vygenerováno: ${seenIds.size})`);
    });

    it('úroveň 1 (mc): každá špatná možnost vrátí radu a slovniPrompt obsahuje <mark class="pod">', () => {
      for (let i = 0; i < 300; i++) {
        const p = app.generate('slovni', 1);
        assert.strictEqual(p.kind, 'mc', 'Úroveň 1 slovních úloh musí být kind mc');

        for (const opt of ['A', 'B', 'C', 'D', 'E']) {
          if (opt === p.ans) continue;
          const checkRes = app.check(p, [opt]);
          assert.strictEqual(checkRes.ok, false, `Možnost ${opt} je špatná a nesmí projít`);

          if (p.chyby && p.chyby[opt]) {
            assert.strictEqual(
              checkRes.msg,
              p.chyby[opt].rada,
              `r.msg musí být PŘESNĚ p.chyby[${opt}].rada pro úlohu ${p.slovni}`
            );
            if (p.chyby[opt].pod) {
              assert.strictEqual(checkRes.pod, p.chyby[opt].pod, 'check() musí vrátit frázi k podtržení');
              const promptWithPod = app.slovniPrompt(p, checkRes.pod);
              const expectedTag = `<mark class="pod">${p.chyby[opt].pod}</mark>`;
              assert.ok(
                promptWithPod.includes(expectedTag),
                `slovniPrompt pro úlohu ${p.slovni} možnost ${opt} musí obsahovat přesně ${expectedTag}`
              );
            }
          }
        }
      }
    });

    it('v zadání, otázce, možnostech ani postupu nezůstane žádný nenahrazený slot {o1}', () => {
      for (let i = 0; i < 300; i++) {
        const p = app.generate('slovni', 1);
        const combined = `${p.text} ${p.otazka} ${p.prompt} ${p.steps.map(s => s.h || '').join(' ')}`;
        assert.doesNotMatch(combined, /\{o\d+\}/, `V úloze ${p.slovni} zůstal nenahrazený slot: ${combined}`);
      }
    });
  });

  describe('(5) Slovní úlohy s proměnnou (téma promenna)', () => {
    it('vzorové řešení projde a ekvivalentní zápis výroků projde', () => {
      for (const level of [1, 2]) {
        for (let i = 0; i < 300; i++) {
          const p = app.generate('promenna', level);
          const checkSol = app.check(p, p.sol);
          assert.strictEqual(checkSol.ok, true, `Vzorové řešení selhalo: ${JSON.stringify(p.sol)}`);

          const eqSol = [`(${p.sol[0]})*1`, `(${p.sol[1]})*1`, p.sol[2]];
          const checkEq = app.check(p, eqSol);
          assert.strictEqual(checkEq.ok, true, `Ekvivalentní zápis selhal: ${JSON.stringify(eqSol)}`);
        }
      }
    });

    it('každá typická chyba z p.chybyV vrátí příslušné chybové hlášení (rada)', () => {
      for (const level of [1, 2]) {
        for (let i = 0; i < 300; i++) {
          const p = app.generate('promenna', level);
          for (let part = 0; part < 2; part++) {
            for (const err of (p.chybyV[part] || [])) {
              const errExpr = app.polySol(err.p, p.v);
              const testInputs = part === 0 ? [errExpr, p.sol[1], p.sol[2]] : [p.sol[0], errExpr, p.sol[2]];
              const checkErr = app.check(p, testInputs);
              assert.strictEqual(checkErr.ok, false, `Typická chyba ${errExpr} nesmí projít`);
              assert.ok(
                checkErr.msg && checkErr.msg.includes(err.rada),
                `r.msg musí obsahovat přesně radu „${err.rada}“`
              );
            }
          }
        }
      }
    });

    it('nezávislý test všech 8 šablon PROMENNA (min. 200 iterací) z textu zadání', () => {
      for (let tIdx = 0; tIdx < app.PROMENNA.length; tIdx++) {
        let count = 0;
        while (count < 200) {
          const raw = app.PROMENNA[tIdx].f();
          if (!raw) continue;
          count++;
          const p = {
            v: raw.v,
            text: raw.text,
            q: raw.q,
            sol: [app.polySol(raw.e[0], raw.v), app.polySol(raw.e[1], raw.v), app.numSol(raw.x)]
          };
          verifyPromennaIndependent(tIdx, p, evaluateExpr);
        }
      }
    });

    it('mutační test: změna e2=LP(m,d) v dočasné kopii index.html selže v nezávislém testu', () => {
      verifyPromennaMutation(loadAppContext, evaluateExpr, INDEX_HTML_PATH);
    });

    it('výsledné řešení ans je kladné celé číslo', () => {
      for (const level of [1, 2]) {
        for (let i = 0; i < 300; i++) {
          const p = app.generate('promenna', level);
          assert.strictEqual(p.ans.d, 1, `Řešení v části c) musí být celé číslo: ${JSON.stringify(p.ans)}`);
          assert.ok(p.ans.n > 0, `Řešení v části c) musí být kladné: ${JSON.stringify(p.ans)}`);
        }
      }
    });
  });

  describe('(6) Spuštění validačních skriptů slovních úloh', () => {
    it('node slovni-ulohy/overit.js skončí s kódem 0', () => {
      const overitScript = path.join(__dirname, '../slovni-ulohy/overit.js');
      const res = spawnSync(process.execPath, [overitScript], { encoding: 'utf8' });
      assert.strictEqual(res.status, 0, `overit.js selhal:\n${res.stdout}\n${res.stderr}`);
    });

    it('node slovni-ulohy/overit.test.js skončí s kódem 0', () => {
      const overitTestScript = path.join(__dirname, '../slovni-ulohy/overit.test.js');
      const res = spawnSync(process.execPath, ['--test', overitTestScript], { encoding: 'utf8' });
      assert.strictEqual(res.status, 0, `overit.test.js selhal:\n${res.stdout}\n${res.stderr}`);
    });
  });

  describe('(7) Shoda obou kopií HTML stránky', () => {
    it('app/src/main/assets/index.html a pocitani-na-prijimacky.html jsou po odstranění CR identické', () => {
      const a = fs.readFileSync(INDEX_HTML_PATH, 'utf8').replace(/\r/g, '');
      const b = fs.readFileSync(WEB_HTML_PATH, 'utf8').replace(/\r/g, '');
      assert.strictEqual(a, b, 'Obsah obou HTML souborů se musí přesně shodovat');
    });
  });

});
