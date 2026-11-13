// Sestaví webovou verzi pocitani-na-prijimacky.html z app/src/main/assets/index.html.
// <link rel="stylesheet" href="…"> (všechny za sebou) se nahradí jedním <style> blokem se stejným obsahem,
// aby webová verze zůstala jeden soubor. Pořadí pravidel se nemění.
// Použití: node nastroje/sestav-web.mjs          (zapíše soubor)
//          node nastroje/sestav-web.mjs --check  (jen ověří, že je soubor aktuální; konec s kódem 1 při rozdílu)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'app', 'src', 'main', 'assets');
const WEB = path.join(ROOT, 'pocitani-na-prijimacky.html');

export function sestavWeb(html, readAsset) {
  const re = /<link rel="stylesheet" href="([^"]+)">(\r?\n)?/g;
  let css = '';
  let eol = '\r\n';
  let n = 0;
  const marker = '\u0000STYLE\u0000';
  const out = html.replace(re, (m, href, nl) => {
    if (n === 0 && nl) eol = nl;
    css += readAsset(href);
    return n++ === 0 ? marker : '';
  });
  if (n === 0) return out;
  return out.replace(marker, `<style>${eol}${css}</style>${eol}`);
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
