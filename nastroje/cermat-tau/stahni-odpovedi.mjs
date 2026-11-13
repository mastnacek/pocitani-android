// Stáhne správné odpovědi k testům z CERMAT TAU: založí sezení, hned ho ukončí a přečte výsledky.
// Použití: node nastroje/cermat-tau/stahni-odpovedi.mjs <složka předmětu, např. cermat-tau/cestina>
import fs from 'node:fs';
import path from 'node:path';

const H = 'https://tau.cermat.gov.cz';
const dir = process.argv[2];
const out = path.join(dir, 'odpovedi');
fs.mkdirSync(out, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(url, method = 'GET') {
  const res = await fetch(H + url, { method, headers: { 'Content-Type': 'application/json', Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${method} ${url}: ${res.status}`);
  return res.json();
}

for (const f of fs.readdirSync(path.join(dir, 'testy')).filter((f) => f.endsWith('.json')).sort()) {
  const target = path.join(out, f);
  if (fs.existsSync(target)) { console.log('mám', f); continue; }
  const test = JSON.parse(fs.readFileSync(path.join(dir, 'testy', f), 'utf8'));
  const s = await api(`/api/v1/student/exams/${test.id}/sessions`, 'POST');
  await sleep(800);
  await api(`/api/v1/student/sessions/${s.sessionId}/end`, 'POST');
  await sleep(800);
  const r = await api(`/api/v1/student/sessions/${s.sessionId}/results`);
  fs.writeFileSync(target, JSON.stringify(r, null, 1));
  console.log('staženo', f, r.tasks.length, 'úloh');
  await sleep(1500);
}
