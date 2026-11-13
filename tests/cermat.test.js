// tests/cermat.test.js
// Testy CERMAT v aplikaci: porovnání odpovědí a bodování podle klíče TAU.
// Modul se vyřízne z index.html (mezi „Testy CERMAT“ a „routing“) a spustí bez prohlížeče.
// Kontrola proti skutečným testům běží jen tam, kde jsou stažená data (cermat-tau/ není v gitu).
const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { INDEX_HTML_PATH } = require('./helpers');

const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
const start = html.indexOf('// ---------- Testy CERMAT ----------');
const end = html.indexOf('// ---------- routing ----------');
const code = html.slice(start, end);

function load() {
  const ctx = {
    window: {}, store: {}, save() {}, L: (m, c) => c, subject: 'cj', $: () => null, setHTML() {}, console,
    document: { createElement: () => ({ content: { querySelectorAll: () => [] }, set innerHTML(v) { this.h = v; }, get innerHTML() { return this.h; } }) }
  };
  vm.createContext(ctx);
  vm.runInContext(code + ';globalThis.__={cm,cmEval,cmScoreGroup,cmMax,cmMatch,cmTable,cmNumKey};', ctx);
  return ctx.__;
}
const m = load();
const group = (tasks) => ({ num: 'x', shared: [], tasks });
const score = (g, ans) => { m.cm.ans = ans; m.cm.res = {}; m.cmScoreGroup(g); return m.cm.res[g.num]; };

describe('Testy CERMAT: porovnání a bodování', () => {
  it('modul je v index.html', () => {
    assert.ok(start > 0 && end > start);
  });
  it('textová odpověď: mezery, velikost písmen, čísla a varianty', () => {
    const r = { trimWhitespace: true, caseSensitive: false };
    assert.ok(m.cmMatch('  Předmět ', 'předmět', [], r));
    assert.ok(m.cmMatch('přívlastek', 'přívlastek neshodný', ['přívlastek'], r));
    assert.ok(!m.cmMatch('', 'x', [], r));
    const n = { trimWhitespace: true, stripAllSpaces: true, compareAsNumber: true };
    assert.ok(m.cmMatch('2,5', '2.5', [], n));
    assert.ok(m.cmMatch('−5', '-5', [], n));
    assert.ok(m.cmMatch('1 250', '1250', [], n));
    assert.ok(!m.cmMatch('2,6', '2.5', [], n));
  });
  it('tabulka bodů: přesná hodnota a strop', () => {
    const t = [{ score: 0, points: 0 }, { score: 1, points: 0 }, { score: 2, points: 2 }];
    assert.strictEqual(m.cmTable(t, 2), 2);
    assert.strictEqual(m.cmTable(t, 1), 0);
    assert.strictEqual(m.cmTable(t, 5), 2);
    assert.strictEqual(m.cmTable({ entries: t }, 2), 2);
  });
  it('sada ANO/NE: body podle počtu správných', () => {
    const tab = [{ score: 0, points: 0 }, { score: 1, points: 0 }, { score: 2, points: 0 }, { score: 3, points: 1 }, { score: 4, points: 2 }];
    const tasks = [true, false, false, true].map((v, i) => ({ taskId: 't' + i, taskNumber: '8.' + (i + 1), taskTypeCode: 'ZDC', maxPoints: 0.5, correctAnswer: { value: v }, bundleScoringTable: tab, bundleMaxPoints: 2 }));
    const g = group(tasks);
    assert.strictEqual(score(g, { t0: '1', t1: '0', t2: '0', t3: '1' }).pts, 2);
    assert.strictEqual(score(g, { t0: '1', t1: '0', t2: '0', t3: '0' }).pts, 1);
    assert.strictEqual(score(g, { t0: '1', t1: '1', t2: '1', t3: '0' }).pts, 0);
    assert.strictEqual(m.cmMax(g), 2);
  });
  it('oprava chyb: body podle počtu chyb, na pořadí nezáleží', () => {
    const t = { taskId: 'p', taskNumber: '12', taskTypeCode: 'PRA', maxPoints: 3, content: {},
      correctAnswer: { errorScoring: true, orderSensitive: false, trimWhitespace: true, corrections: [{ correctForm: 'netvorovi' }, { correctForm: 'příteli' }, { correctForm: 'bytu' }],
        scoringTable: { entries: [{ score: 0, points: 3 }, { score: 1, points: 2 }, { score: 2, points: 1 }, { score: 3, points: 0 }] } } };
    const g = group([t]);
    assert.strictEqual(score(g, { p: ['bytu', 'netvorovi', 'příteli'] }).pts, 3);
    assert.strictEqual(score(g, { p: ['bytu', 'netvorovi', ''] }).pts, 2);
    assert.strictEqual(score(g, { p: ['bytu', 'netvorovi', 'kočka'] }).pts, 1, 'chybějící oprava + špatné slovo = 2 chyby');
    assert.strictEqual(score(g, {}).pts, 0);
  });
  it('přiřazování: body za každou správnou dvojici', () => {
    const t = { taskId: 'z', taskNumber: '15', taskTypeCode: 'ZPC', maxPoints: 6, content: {}, correctAnswer: { mapping: { '15.1': 'E', '15.2': 'A', '15.3': 'B' }, pointsPerPair: 2 } };
    assert.strictEqual(score(group([t]), { z: { '15.1': 'E', '15.2': 'A', '15.3': 'C' } }).pts, 4);
  });
  it('sada s tabulkou a podúloha mimo sadu se stejným číslem (3.1, 3.2 a 3.3) se boduje zvlášť', () => {
    const tab = [{ score: 0, points: 0 }, { score: 1, points: 1 }, { score: 2, points: 2 }];
    const oss = (id, max, inBundle) => ({ taskId: id, taskNumber: id, taskTypeCode: 'OSS', maxPoints: max, content: {}, correctAnswer: { validPoints: [0, 1, 2].slice(0, max + 1) },
      ...(inBundle ? { bundleScoringTable: tab, bundleMaxPoints: 2 } : {}) });
    const g = group([oss('3.1', 1, true), oss('3.2', 1, true), oss('3.3', 2, false)]);
    assert.strictEqual(m.cmMax(g), 4);
    assert.strictEqual(score(g, { '3.1': '1', '3.2': '1', '3.3': '2' }).pts, 4);
  });
});

const DATA = path.join(__dirname, '..', 'cermat-tau');
describe('Testy CERMAT: skutečné testy (jen s lokálními daty)', { skip: !fs.existsSync(DATA) && 'cermat-tau/ není stažené' }, () => {
  const correct = (t) => {
    const a = t.correctAnswer || {};
    switch (t.taskTypeCode) {
      case 'ZMC': return a.correctOption;
      case 'ZDC': return a.value ? '1' : '0';
      case 'ZPC': return { ...a.mapping };
      case 'ZUS': return [...a.correctOrder];
      case 'OUP': return a.expectedAnswer;
      case 'PRA': return a.corrections.map(k => k.correctForm);
      case 'OSS': return String(Math.max(...(a.validPoints || [0])));
    }
  };
  for (const subj of ['cestina', 'matematika']) {
    const dir = path.join(DATA, subj, 'odpovedi');
    if (!fs.existsSync(dir)) continue;
    it(`${subj}: správné odpovědi dají plný počet bodů, prázdné nulu`, () => {
      for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.json'))) {
        const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        const groups = new Map();
        data.tasks.slice().sort((a, b) => m.cmNumKey(a.taskNumber).localeCompare(m.cmNumKey(b.taskNumber))).forEach(t => {
          const k = t.bundleNumber || String(t.taskNumber).split('.')[0];
          if (!groups.has(k)) groups.set(k, { num: k, shared: [], tasks: [] });
          groups.get(k).tasks.push(t);
        });
        let total = 0;
        for (const g of groups.values()) {
          const ans = {};
          g.tasks.forEach(t => { ans[t.taskId] = correct(t); });
          const r = score(g, ans);
          total += r.max;
          assert.strictEqual(r.pts, r.max, `${f} úloha ${g.num}`);
          assert.strictEqual(score(g, {}).pts, 0, `${f} úloha ${g.num} bez odpovědi`);
        }
        assert.strictEqual(total, data.maxPoints, `${f}: součet maxim = maximum testu`);
      }
    });
  }
});
