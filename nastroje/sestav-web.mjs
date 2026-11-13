// Sestaví webovou verzi pocitani-na-prijimacky.html z app/src/main/assets/index.html.
// <link rel="stylesheet" href="…"> (všechny za sebou) se nahradí jedním <style> blokem se stejným obsahem
// a každé <script src="…"></script> se nahradí <script> s obsahem souboru, aby webová verze zůstala jeden soubor.
// Pořadí pravidel i skriptů se nemění. Konce řádků vložených souborů se sjednotí podle index.html.
// Použití: node nastroje/sestav-web.mjs          (zapíše soubor)
//          node nastroje/sestav-web.mjs --check  (jen ověří, že je soubor aktuální; konec s kódem 1 při rozdílu)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'app', 'src', 'main', 'assets');
const WEB = path.join(ROOT, 'pocitani-na-prijimacky.html');

export function sestavWeb(html, readAsset) {
  const prvniEol = /\r?\n/.exec(html);
  const eol = prvniEol ? prvniEol[0] : '\r\n';
  const sjednot = t => {
    const s = t.replace(/\r?\n/g, eol);
    return s.endsWith(eol) ? s : s + eol;
  };
  const re = /<link rel="stylesheet" href="([^"]+)">(\r?\n)?/g;
  let css = '';
  let n = 0;
  const marker = '\u0000STYLE\u0000';
  let out = html.replace(re, (m, href) => {
    css += sjednot(readAsset(href));
    return n++ === 0 ? marker : '';
  });
  if (n > 0) out = out.replace(marker, `<style>${eol}${css}</style>${eol}`);
  return out.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
    const kod = readAsset(src);
    // „</script“ uvnitř vloženého kódu by předčasně ukončilo <script> ve webové verzi
    if (/<\/script/i.test(kod)) throw new Error(`${src} obsahuje „</script“, nejde vložit do stránky`);
    return `<script>${eol}${sjednot(kod)}</script>`;
  });
}

export function sestavWebSoubor() {
  const html = fs.readFileSync(path.join(ASSETS, 'index.html'), 'utf8');
  return sestavWeb(html, href => fs.readFileSync(path.join(ASSETS, href), 'utf8'));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const vysledek = sestavWebSoubor();
  if (process.argv.includes('--check')) {
    const aktualni = fs.readFileSync(WEB, 'utf8');
    if (aktualni !== vysledek) { console.error('pocitani-na-prijimacky.html není aktuální: spusť node nastroje/sestav-web.mjs'); process.exit(1); }
    console.log('pocitani-na-prijimacky.html je aktuální');
  } else {
    fs.writeFileSync(WEB, vysledek);
    console.log('zapsáno ' + path.relative(ROOT, WEB));
  }
}
