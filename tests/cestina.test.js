// tests/cestina.test.js
// Čeština: generátory úloh A–D (shoda přísudku s podmětem, mě/mně).
// Správné tvary jsou tu zapsané znovu a nezávisle na aplikaci. Každá nová věta ve slovníku
// proto musí přibýt i sem, jinak test spadne a připomene kontrolu.
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { loadAppContext } = require('./helpers');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const app = loadAppContext();
const L = ['A', 'B', 'C', 'D'];

// podmět -> správná koncovka příčestí
const SHODA_OK = {
  psi: 'i', kluci: 'i', hasiči: 'i', turisté: 'i', sousedé: 'i', vojáci: 'i', holubi: 'i', koně: 'i',
  žáci: 'i', rybáři: 'i', sportovci: 'i', lidé: 'i', rodiče: 'i', 'Petr a Jana': 'i', 'kočky a psi': 'i',
  stromy: 'y', vlaky: 'y', hrady: 'y', mosty: 'y', kameny: 'y', potoky: 'y', autobusy: 'y', obchody: 'y',
  hřiby: 'y', koše: 'y', stroje: 'y',
  ženy: 'y', kočky: 'y', dívky: 'y', sovy: 'y', lavice: 'y', řeky: 'y', myši: 'y', babičky: 'y', lodě: 'y',
  děti: 'y', husy: 'y',
  auta: 'a', kuřata: 'a', okna: 'a', jablka: 'a', letadla: 'a', kola: 'a', telata: 'a', děvčata: 'a'
};
// věta -> správný tvar zájmena
const MEMNE_OK = {
  'Babička _ k narozeninám upekla dort.': 'mně', 'Zavolej _ hned, jak dorazíš.': 'mně',
  'Ten film se _ vůbec nelíbil.': 'mně', 'Kamarád _ půjčil svoje kolo.': 'mně',
  'Poraďte _, prosím, kudy na nádraží.': 'mně', 'Přijď zítra ke _ na návštěvu.': 'mně',
  'Naproti _ seděl neznámý chlapec.': 'mně', 'Celý večer o _ mluvili.': 'mně', 'Při _ stál celou dobu.': 'mně',
  'Na _ teď nezáleží, rozhodněte sami.': 'mně', 'Kvůli _ zmeškali autobus.': 'mně',
  'Ve _ se v tu chvíli všechno sevřelo.': 'mně',
  'Bez _ to nezvládnete.': 'mě', 'Od _ dostal k svátku knihu.': 'mě', 'U _ doma je pořád veselo.': 'mě',
  'Do _ na chodbě omylem vrazil spolužák.': 'mě', 'Místo _ půjde na schůzku sestra.': 'mě',
  'Pozvali _ na oslavu.': 'mě', 'Ta kniha _ hodně zaujala.': 'mě', 'Pro _ si přijede tatínek.': 'mě',
  'Spolužáci _ zvolili předsedou třídy.': 'mě', 'Počkej na _ před školou.': 'mě', 'Neboj se o _, zvládnu to.': 'mě'
};

// všechny správně napsané věty, poskládané jen z tabulek výše
const CORRECT = new Set([
  ...app.SHODA.map(u => u.t.replace(/_/g, SHODA_OK[u.p])),
  ...app.MEMNE.map(u => u.t.replace('_', MEMNE_OK[u.t]))
]);
const unescape = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

describe('Čeština: slovník', () => {
  it('každá věta shody má nezávisle ověřenou koncovku a sedí s rodem v aplikaci', () => {
    for (const u of app.SHODA) {
      assert.ok(u.p in SHODA_OK, `chybí v testu: ${u.p}`);
      assert.strictEqual(app.CJ_ROD[u.r].e, SHODA_OK[u.p], `rod u „${u.p}“`);
      assert.ok(u.t.includes('_') && /^\p{Lu}/u.test(u.t) && u.t.endsWith('.'), u.t);
      assert.ok(u.t.toLowerCase().includes(u.p.toLowerCase()), `podmět „${u.p}“ ve větě`);
    }
    assert.strictEqual(new Set(app.SHODA.map(u => u.t)).size, app.SHODA.length, 'duplicitní věta');
  });
  it('každá věta mě/mně má nezávisle ověřený tvar a jedno místo k doplnění', () => {
    for (const u of app.MEMNE) {
      assert.ok(u.t in MEMNE_OK, `chybí v testu: ${u.t}`);
      assert.strictEqual(u.k, MEMNE_OK[u.t], u.t);
      assert.strictEqual(u.t.split('_').length, 2, u.t);
      assert.strictEqual(u.k === 'mně' ? [3, 6].includes(u.d) : [2, 4].includes(u.d), true, `pád u „${u.t}“`);
    }
  });
});

describe('Čeština: zdroj vět', () => {
  it('node ulohy/cestina/vlozit.js --check skončí s kódem 0', () => {
    const r = spawnSync(process.execPath, [path.join(__dirname, '../ulohy/cestina/vlozit.js'), '--check'], { encoding: 'utf8' });
    assert.strictEqual(r.status, 0, r.stdout + r.stderr);
  });
  it('věty v aplikaci jsou shodné s ulohy/cestina/vety.json (po úpravě spusť vlozit.js)', () => {
    const src = JSON.parse(fs.readFileSync(path.join(__dirname, '../ulohy/cestina/vety.json'), 'utf8'));
    assert.strictEqual(JSON.stringify(app.SHODA), JSON.stringify(src.shoda));
    assert.strictEqual(JSON.stringify(app.MEMNE), JSON.stringify(src.memne));
  });
});

describe('Čeština: generované úlohy', () => {
  const topics = app.TOPICS.filter(t => t.subj === 'cj');
  it('témata češtiny existují a mají předmět cj', () => {
    assert.deepStrictEqual([...topics.map(t => t.id)], ['cj-shoda', 'cj-memne']);
    assert.ok(app.TOPICS.filter(t => !t.subj).length >= 17, 'matematická témata zůstala');
  });
  for (const t of topics) {
    for (const level of [1, 2]) {
      it(`${t.id}, úroveň ${level}: právě jedna odpověď sedí se zadáním`, () => {
        for (let n = 0; n < 400; n++) {
          const p = app.generate(t.id, level);
          assert.strictEqual(p.kind, 'mc');
          assert.deepStrictEqual([...Object.keys(p.opts)], L);
          const texts = L.map(k => unescape(p.opts[k]));
          assert.strictEqual(new Set(texts).size, 4, 'čtyři různé věty');
          const ok = texts.map(x => CORRECT.has(x));
          const odd = L.indexOf(p.ans);
          if (p.mode === 'chyba') {
            assert.strictEqual(ok.filter(Boolean).length, 3, texts.join(' | '));
            assert.strictEqual(ok[odd], false, `odpověď ${p.ans} má být chybná věta`);
          } else {
            assert.strictEqual(p.mode, 'spravne');
            assert.strictEqual(ok.filter(Boolean).length, 1, texts.join(' | '));
            assert.strictEqual(ok[odd], true, `odpověď ${p.ans} má být správná věta`);
          }
          assert.ok(app.check(p, [p.ans]).ok);
          for (const k of L.filter(k => k !== p.ans)) {
            const r = app.check(p, [k]);
            assert.strictEqual(r.ok, false);
            assert.ok(r.msg && r.msg.startsWith(p.mode === 'chyba' ? `Věta ${k} je napsaná správně` : `Ve větě ${k} je chyba`), r.msg);
          }
          assert.ok(app.check(p, ['']).format);
          // past jen na vyšší úrovni
          const pool = t.id === 'cj-shoda' ? app.SHODA : app.MEMNE;
          // každá věta (i chybná) vznikla ze šablony ve slovníku jen doplněním koncovky nebo tvaru
          const used = texts.map(x => pool.find(u => matches(u, x)));
          const traps = used.filter(u => u && u.x).length;
          if (level === 1) assert.strictEqual(traps, 0, 'na úrovni 1 nejsou pasti');
          else assert.ok(traps >= 1, 'na úrovni 2 je aspoň jedna past');
          assert.strictEqual(used.filter(Boolean).length, 4, 'každá věta pochází ze slovníku');
          assert.ok(p.steps.length === 5 && p.solH && p.trap && p.guide === t.id);
        }
      });
    }
  }
});

// věta x vznikla ze šablony u (doplněním libovolné koncovky / tvaru)
function matches(u, x) {
  const re = new RegExp('^' + u.t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/_/g, '(?:i|y|a|mě|mně)') + '$', 'u');
  return re.test(x);
}
