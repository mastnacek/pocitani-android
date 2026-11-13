// Vloží slovní úlohy z ulohy.json do aplikace (app/src/main/assets/index.html, mezi značky SLOVNI_START/SLOVNI_END).
// Nejdřív spustí overit.js; když některá úloha neprojde, nic nevloží.
// Do aplikace jdou jen pole potřebná za běhu (bez podmínek a záznamu o ověření).
// Použití: node ulohy/slovni/vlozit.js
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const dir = __dirname;
const html = path.join(dir, '..', '..', 'app', 'src', 'main', 'assets', 'index.html');

const over = spawnSync(process.execPath, [path.join(dir, 'overit.js')], { encoding: 'utf8' });
if (over.status !== 0) { process.stdout.write(over.stdout); console.error('Ověření neprošlo, nic jsem nevložil.'); process.exit(1); }

const ulohy = JSON.parse(fs.readFileSync(path.join(dir, 'ulohy.json'), 'utf8'));
const data = ulohy.map(u => ({
  id: u.id, typ: u.typ, text: u.text, otazka: u.otazka, osoby: u.osoby,
  odpoved: { hodnota: u.odpoved.hodnota, jednotka: u.odpoved.jednotka, zobrazeni: u.odpoved.zobrazeni },
  moznosti: u.moznosti, spravne: u.spravne,
  chyby: Object.fromEntries(Object.entries(u.chyby || {}).map(([k, c]) => [k, { rada: c.rada, podtrhnout: c.podtrhnout }])),
  postup: u.postup,
}));
// JSON uvnitř <script>: rozbít „</“, aby se nedal ukončit tag
const LS = String.fromCharCode(0x2028), PS = String.fromCharCode(0x2029);
const BS = String.fromCharCode(92); // zp\u011btn\u00e9 lom\u00edtko
const json = JSON.stringify(data).split('</').join('<' + BS + '/').split(LS).join(BS + 'u2028').split(PS).join(BS + 'u2029');

let src = fs.readFileSync(html, 'utf8');
const re = /\/\*SLOVNI_START\*\/[\s\S]*?\/\*SLOVNI_END\*\//;
if (!re.test(src)) { console.error('V index.html chybí značky SLOVNI_START/SLOVNI_END.'); process.exit(1); }
src = src.replace(re, () => `/*SLOVNI_START*/const SLOVNI=${json};/*SLOVNI_END*/`);
fs.writeFileSync(html, src);
console.log(`Vloženo ${data.length} slovních úloh do ${path.relative(path.join(dir, '..', '..'), html)} (${(json.length / 1024).toFixed(1)} kB).`);
