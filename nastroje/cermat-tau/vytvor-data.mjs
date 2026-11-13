// Spojí výsledky TAU (odpovedi/*.json) do data.js a vedle nich zkopíruje prohlizec.html.
// Použití: node nastroje/cermat-tau/vytvor-data.mjs <složka s odpovedi/> "<název předmětu>"
//   např.  node nastroje/cermat-tau/vytvor-data.mjs cermat-tau/cestina "Český jazyk"
//          node nastroje/cermat-tau/vytvor-data.mjs cermat-tau/matematika "Matematika"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.resolve(process.argv[2] || '.');
const title = process.argv[3] || 'CERMAT';
const prehled = JSON.parse(fs.readFileSync(path.join(dir, 'prehled-testu.json'), 'utf8'));
const nazev = Object.fromEntries(prehled.map((p) => [`${p.rok}-${p.termin}`, p.nazev]));

const numKey = (n) => n.split('.').map((x) => x.padStart(3, '0')).join('.');
const tests = [];

for (const f of fs.readdirSync(path.join(dir, 'odpovedi')).filter((f) => f.endsWith('.json')).sort().reverse()) {
  const key = f.replace('.json', '');
  const r = JSON.parse(fs.readFileSync(path.join(dir, 'odpovedi', f), 'utf8'));
  const groups = new Map();
  const tasks = [...r.tasks].sort((a, b) => numKey(a.taskNumber).localeCompare(numKey(b.taskNumber)));
  for (const t of tasks) {
    const g = t.bundleNumber || t.taskNumber.split('.')[0];
    if (!groups.has(g)) groups.set(g, { num: g, shared: t.bundleQuestionBlocks || [], tasks: [] });
    groups.get(g).tasks.push({
      id: t.taskId,
      num: t.taskNumber,
      type: t.taskTypeCode,
      points: t.maxPoints,
      blocks: t.questionBlocks || [],
      content: t.content || {},
      correct: t.correctAnswer,
      key: t.solutionKeyUrl,
    });
  }
  tests.push({ key, name: `${key.slice(0, 4)} · ${nazev[key] || key.slice(5)}`, groups: [...groups.values()] });
}

fs.writeFileSync(
  path.join(dir, 'data.js'),
  `window.TAU_TITLE = ${JSON.stringify(title)};\nwindow.TAU_DATA = ${JSON.stringify(tests)};\n`,
  'utf8',
);
fs.copyFileSync(path.join(here, 'prohlizec.html'), path.join(dir, 'prohlizec.html'));
console.log(`${title}: ${tests.length} testů, ${tests.reduce((s, t) => s + t.groups.length, 0)} skupin úloh, ` +
  `${tests.reduce((s, t) => s + t.groups.reduce((a, g) => a + g.tasks.length, 0), 0)} podúloh`);
