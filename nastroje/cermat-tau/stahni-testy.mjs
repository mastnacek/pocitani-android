// Stáhne zadání testů jednotné přijímací zkoušky z CERMAT TAU (veřejné API procvičovací aplikace).
// Použití: node nastroje/cermat-tau/stahni-testy.mjs <cílová složka> <předmět MA|CJ> [ročník=9] [--jen 2026-RT1]
// Vytvoří <složka>/catalog.json, prehled-testu.json, testy/{rok}-{termín}.json a obrazky/tasks/... (obrázky zadání).
// Už stažené soubory přeskočí. Mezi dotazy čeká, ať server nezatěžuje.
import fs from 'node:fs';
import path from 'node:path';

const H = 'https://tau.cermat.gov.cz';
const [dir, subject, gradeArg] = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && all[i - 1] !== '--jen');
const jen = process.argv.includes('--jen') ? process.argv[process.argv.indexOf('--jen') + 1] : null;
const grade = gradeArg || '9';
if (!dir || !['MA', 'CJ'].includes(subject)) {
  console.error('Použití: node stahni-testy.mjs <cílová složka> <MA|CJ> [ročník] [--jen 2026-RT1]');
  process.exit(1);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, binary) {
  const res = await fetch(H + url, { headers: { Accept: binary ? '*/*' : 'application/json' } });
  if (!res.ok) throw new Error(`GET ${url}: ${res.status}`);
  return binary ? Buffer.from(await res.arrayBuffer()) : res.json();
}

fs.mkdirSync(path.join(dir, 'testy'), { recursive: true });
const catalog = await get('/api/v1/catalog');
fs.writeFileSync(path.join(dir, 'catalog.json'), JSON.stringify(catalog, null, 1), 'utf8');
const exams = catalog.examTypes.filter((e) => e.code === 'JPZ')
  .flatMap((e) => e.subjects).filter((s) => s.code === subject)
  .flatMap((s) => s.grades).filter((g) => g.code === grade)
  .flatMap((g) => g.exams)
  .filter((x) => !jen || `${x.year}-${x.sessionType}` === jen);
if (!exams.length) { console.error('V katalogu nic neodpovídá zadání.'); process.exit(1); }

const prehled = [];
for (const x of exams) {
  const key = `${x.year}-${x.sessionType}`;
  const target = path.join(dir, 'testy', key + '.json');
  let test;
  if (fs.existsSync(target)) test = JSON.parse(fs.readFileSync(target, 'utf8'));
  else {
    test = await get(`/api/v1/student/exams/${x.id}`);
    fs.writeFileSync(target, JSON.stringify(test, null, 1), 'utf8');
    await sleep(1000);
  }
  const urls = [...new Set(JSON.stringify(test).match(/\/uploads\/[^"\s]+/g) || [])];
  let nove = 0;
  for (const u of urls) {
    const img = path.join(dir, 'obrazky', u.slice('/uploads/'.length));
    if (fs.existsSync(img)) continue;
    fs.mkdirSync(path.dirname(img), { recursive: true });
    fs.writeFileSync(img, await get(u, true));
    nove++;
    await sleep(300);
  }
  const uloh = test.bundles.reduce((s, b) => s + b.tasks.length, 0);
  prehled.push({ rok: x.year, termin: x.sessionType, nazev: x.name, id: x.id, uloh, obrazku: urls.length });
  console.log(`${key}: ${uloh} úloh, obrázků ${urls.length} (nově ${nove})`);
}
if (!jen) fs.writeFileSync(path.join(dir, 'prehled-testu.json'), JSON.stringify(prehled, null, 1), 'utf8');
