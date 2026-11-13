// Zapíše věty pro češtinu z vety.json do aplikace: celý soubor app/src/main/assets/js/data/cestina.js.
// Nejdřív zkontroluje formát vět; když některá neprojde, nic nevloží.
// Správnost tvarů ověřují testy (tests/cestina.test.js) proti nezávisle zapsaným tabulkám.
// Použití: node ulohy/cestina/vlozit.js [--check]   (--check jen zkontroluje, nic nezapíše)
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const cil = path.join(dir, '..', '..', 'app', 'src', 'main', 'assets', 'js', 'data', 'cestina.js');
const { shoda, memne } = JSON.parse(fs.readFileSync(path.join(dir, 'vety.json'), 'utf8'));

const chyby = [];
const vety = new Set();
const veta = (t, kde) => {
  if (!/^\p{Lu}/u.test(t) || !/[.!?]$/.test(t)) chyby.push(`${kde}: věta musí začínat velkým písmenem a končit tečkou: ${t}`);
  if (vety.has(t)) chyby.push(`${kde}: duplicitní věta: ${t}`);
  vety.add(t);
};
const ROD = ['mzi', 'mzn', 'z', 's'];
shoda.forEach((u, i) => {
  const kde = `shoda[${i}]`;
  const klice = Object.keys(u).filter(k => !['p', 'r', 't', 'x'].includes(k));
  if (klice.length) chyby.push(`${kde}: neznámé pole ${klice.join(', ')}`);
  if (!u.p || !u.t || !ROD.includes(u.r)) chyby.push(`${kde}: chybí p, t, nebo r není ${ROD.join('/')}`);
  else {
    if (!/\p{L}_/u.test(u.t)) chyby.push(`${kde}: ve větě chybí koncovka „_“ hned za slovem`);
    if (!u.t.toLowerCase().includes(u.p.toLowerCase())) chyby.push(`${kde}: podmět „${u.p}“ není ve větě`);
    veta(u.t, kde);
  }
});
memne.forEach((u, i) => {
  const kde = `memne[${i}]`;
  const klice = Object.keys(u).filter(k => !['k', 'd', 't', 'z', 'x'].includes(k));
  if (klice.length) chyby.push(`${kde}: neznámé pole ${klice.join(', ')}`);
  if (!['mě', 'mně'].includes(u.k)) chyby.push(`${kde}: k musí být mě, nebo mně`);
  if (u.k === 'mně' && ![3, 6].includes(u.d)) chyby.push(`${kde}: mně je jen ve 3. a 6. pádě`);
  if (u.k === 'mě' && ![2, 4].includes(u.d)) chyby.push(`${kde}: mě je jen ve 2. a 4. pádě`);
  if (!u.t || u.t.split('_').length !== 2) chyby.push(`${kde}: ve větě musí být právě jedno „_“`);
  else veta(u.t, kde);
  if (u.z) veta(u.z, `${kde}.z`);
});
for (const [jmeno, seznam] of [['shoda', shoda], ['memne', memne]]) {
  if (seznam.filter(u => !u.x).length < 6 || seznam.filter(u => u.x).length < 2) chyby.push(`${jmeno}: potřeba aspoň 6 běžných vět a 2 pasti`);
}
if (chyby.length) { console.error(chyby.join('\n')); console.error('Kontrola neprošla, nic jsem nevložil.'); process.exit(1); }
console.log(`Věty v pořádku: shoda ${shoda.length}, mě/mně ${memne.length}.`);
if (process.argv.includes('--check')) process.exit(0);

// JSON se při sestavení webové verze vkládá do <script>: rozbít „</“, aby se nedal ukončit tag
const BS = String.fromCharCode(92);
const js = o => JSON.stringify(o).split('</').join('<' + BS + '/')
  .split(String.fromCharCode(0x2028)).join(BS + 'u2028').split(String.fromCharCode(0x2029)).join(BS + 'u2029');
const src = [
  "'use strict';",
  '// Věty jsou ve zdroji ulohy/cestina/vety.json; tento soubor z něj generuje node ulohy/cestina/vlozit.js, ručně se needituje.',
  '// SHODA: p = podmět, r = rod, t = věta („_“ = koncovka příčestí), x = past s vlastním vysvětlením.',
  '// MEMNE: k = mě/mně, d = pád, t = věta („_“ = tvar zájmena), z = věta pro zkoušku tebe/tobě, x = past.',
  `const SHODA=${js(shoda)},MEMNE=${js(memne)};`,
  ''
].join('\n');
fs.mkdirSync(path.dirname(cil), { recursive: true });
fs.writeFileSync(cil, src);
console.log(`Zapsáno do ${path.relative(path.join(dir, '..', '..'), cil)}.`);
