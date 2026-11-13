// Ověření slovních úloh ze souboru ulohy.json (node ulohy/slovni/overit.js [soubor.json]).
// Úloha projde, jen když:
//  1. hrubou silou přes celý rozsah neznámých existuje právě jedno řešení podmínek
//     (u úloh s „cil“ právě jedno nejlepší řešení) a všechny veličiny v „celociselne“ jsou celá čísla,
//  2. řešení je totožné s „reseni“ autora,
//  3. hodnota výrazu „odpoved.vyraz“ se rovná „odpoved.hodnota“,
//  4. správná možnost je jediná: hodnota u „spravne“ je výsledek a žádná jiná možnost výsledek není,
//  5. postup: každý krok s výpočtem sedí a poslední výpočet dává odpověď,
//  6. každá špatná číselná možnost má v „chyby“ výpočet z typické chyby, který dá právě ji, s popisem a radou
//     a s frází „podtrhnout“, která je doslova v zadání nebo otázce a není jen číslo,
//  7. sloty pro jména {o1} jsou deklarované v „osoby“ (rod m/f, výchozí jméno) a použité.
// Formát a zásady: FORMAT.md.
// Program neověří, že podmínky odpovídají textu. To musí pohlídat nezávislé řešení z textu (člověk nebo druhý model).
const fs = require('fs');
const path = require('path');
const soubor = process.argv[2] || path.join(__dirname, 'ulohy.json');
const ulohy = JSON.parse(fs.readFileSync(soubor, 'utf8'));
const EPS = 1e-9;
const blizko = (a, b) => Math.abs(a - b) <= EPS * Math.max(1, Math.abs(a), Math.abs(b));
const jeCele = v => blizko(v, Math.round(v));
const hodnotaMoznosti = m => {
  if (typeof m === 'number') return m;
  const z = /^\s*(-?\d+)\s*\/\s*(\d+)\s*$/.exec(m);
  return z ? +z[1] / +z[2] : null; // „jiný výsledek“ a jiný text nemá hodnotu
};

function overUlohu(u) {
  const chyby = [];
  const nezname = Object.keys(u.nezname);
  const pomocne = Object.entries(u.pomocne || {});
  // výrazy převedeme na funkce jednou; pomocné veličiny se počítají postupně
  const fnPom = [];
  const jmena = [...nezname];
  for (const [k, vyraz] of pomocne) { fnPom.push([k, new Function(...jmena, `return (${vyraz});`)]); jmena.push(k); }
  const fnPodm = u.podminky.map(p => {
    const [l, r] = p.split('=');
    if (r === undefined) throw new Error(`podmínka bez „=“: ${p}`);
    return [new Function(...jmena, `return (${l});`), new Function(...jmena, `return (${r});`)];
  });
  const fnOdp = new Function(...jmena, `return (${u.odpoved.vyraz});`);
  const fnCil = u.cil ? new Function(...jmena, `return (${u.cil.max || u.cil.min});`) : null;
  const spocti = hodnoty => { const h = [...hodnoty]; for (const [, f] of fnPom) h.push(f(...h)); return h; };
  const vyhovuje = h => fnPodm.every(([l, r]) => blizko(l(...h), r(...h)))
    && (u.celociselne || []).every(k => jeCele(h[jmena.indexOf(k)]));

  // hrubá síla přes všechny kombinace celých hodnot neznámých
  const rozsahy = nezname.map(k => u.nezname[k]);
  const reseni = [];
  const projdi = (i, akt) => {
    if (i === rozsahy.length) { const h = spocti(akt); if (vyhovuje(h)) reseni.push(h); return; }
    for (let v = rozsahy[i][0]; v <= rozsahy[i][1]; v++) { akt.push(v); projdi(i + 1, akt); akt.pop(); }
  };
  projdi(0, []);

  let vybrana = reseni;
  if (fnCil && reseni.length) {
    const hodn = reseni.map(h => fnCil(...h));
    const nej = u.cil.max ? Math.max(...hodn) : Math.min(...hodn);
    vybrana = reseni.filter((h, i) => blizko(hodn[i], nej));
  }
  if (vybrana.length !== 1) chyby.push(`řešení není jediné (nalezeno ${vybrana.length})`);
  else {
    const h = vybrana[0];
    for (const [k, v] of Object.entries(u.reseni)) if (!blizko(h[jmena.indexOf(k)], v)) chyby.push(`řešení ${k}=${h[jmena.indexOf(k)]}, autor uvádí ${v}`);
    const odp = fnOdp(...h);
    if (!blizko(odp, u.odpoved.hodnota)) chyby.push(`odpověď vychází ${odp}, uvedeno ${u.odpoved.hodnota}`);
  }
  // možnosti A–E
  const vals = Object.fromEntries(Object.entries(u.moznosti).map(([k, m]) => [k, hodnotaMoznosti(m)]));
  const spravneJeJiny = vals[u.spravne] === null;
  const shodne = Object.keys(vals).filter(k => vals[k] !== null && blizko(vals[k], u.odpoved.hodnota));
  if (spravneJeJiny) { if (shodne.length) chyby.push(`„jiný výsledek“ je správně, ale výsledek je i u ${shodne.join(', ')}`); }
  else if (shodne.length !== 1 || shodne[0] !== u.spravne) chyby.push(`výsledek je u možností [${shodne.join(', ')}], správně má být ${u.spravne}`);
  const cisla = Object.values(vals).filter(v => v !== null);
  if (new Set(cisla.map(v => v.toFixed(9))).size !== cisla.length) chyby.push('dvě možnosti mají stejnou hodnotu');
  overPostup(u, chyby);
  overChyby(u, vals, chyby);
  overOsoby(u, chyby);
  return { reseni: reseni.length, chyby };
}

// výpočet v postupu a u chyb: jen čísla, + - * / ( ) a desetinná tečka
function spocitej(vyraz) {
  if (typeof vyraz !== 'string' || !/^[\d\s+\-*/().]+$/.test(vyraz)) throw new Error(`nepovolený výpočet „${vyraz}“`);
  const v = new Function(`return (${vyraz});`)();
  if (typeof v !== 'number' || !isFinite(v)) throw new Error(`výpočet „${vyraz}“ nedává číslo`);
  return v;
}

// postup: kroky s výpočtem se přepočítají, poslední výpočet musí dát odpověď
function overPostup(u, chyby) {
  if (!Array.isArray(u.postup) || !u.postup.length) { chyby.push('chybí postup'); return; }
  let posledni = null;
  u.postup.forEach((k, i) => {
    if (typeof k !== 'object' || !k || typeof k.text !== 'string' || !k.text.trim()) { chyby.push(`krok ${i + 1}: chybí text (krok musí být objekt s polem text)`); return; }
    if (k.vypocet === undefined && k.vysledek === undefined) return;
    if (k.vypocet === undefined || typeof k.vysledek !== 'number') { chyby.push(`krok ${i + 1}: vypocet a vysledek musí být spolu`); return; }
    try { const v = spocitej(k.vypocet); if (!blizko(v, k.vysledek)) chyby.push(`krok ${i + 1}: ${k.vypocet} = ${v}, uvedeno ${k.vysledek}`); posledni = k.vysledek; }
    catch (e) { chyby.push(`krok ${i + 1}: ${e.message}`); }
  });
  if (posledni === null) chyby.push('postup nemá žádný krok s výpočtem');
  else if (!blizko(posledni, u.odpoved.hodnota)) chyby.push(`poslední výpočet postupu dává ${posledni}, odpověď je ${u.odpoved.hodnota}`);
}

// špatné možnosti: každá číselná špatná možnost má výpočet z typické chyby, který dá právě ji
function overChyby(u, vals, chyby) {
  const ch = u.chyby || {};
  for (const [k, v] of Object.entries(vals)) {
    if (k === u.spravne || v === null) continue;
    const c = ch[k];
    if (!c) { chyby.push(`možnost ${k}: chybí popis chyby, ze které vznikne`); continue; }
    if (!c.popis || !c.rada) chyby.push(`možnost ${k}: chybí popis nebo rada`);
    // po chybě se v zadání podtrhne fráze, kterou žák přehlédl: musí v zadání doslova být a nesmí to být jen číslo
    if (!c.podtrhnout) chyby.push(`možnost ${k}: chybí podtrhnout`);
    else if (!`${u.text}\n${u.otazka}`.includes(c.podtrhnout)) chyby.push(`možnost ${k}: fráze „${c.podtrhnout}“ není v zadání ani v otázce`);
    else if (!/\p{L}/u.test(c.podtrhnout)) chyby.push(`možnost ${k}: podtrhnout je jen číslo, má to být vztah`);
    try { const x = spocitej(c.vypocet); if (!blizko(x, v)) chyby.push(`možnost ${k}: výpočet chyby ${c.vypocet} = ${x}, možnost je ${v}`); }
    catch (e) { chyby.push(`možnost ${k}: ${e.message}`); }
  }
  for (const k of Object.keys(ch)) if (!(k in vals) || k === u.spravne) chyby.push(`chyby.${k}: taková špatná možnost není`);
}

// personalizace: každý {slot} v textech je deklarovaný v „osoby“ s rodem a výchozím jménem a každý slot se použije
function overOsoby(u, chyby) {
  const texty = [u.text, u.otazka, ...(u.postup || []).map(k => (k && k.text) || ''), ...Object.values(u.chyby || {}).flatMap(c => [c.popis || '', c.rada || ''])];
  const pouzite = new Set(texty.join('\n').match(/\{[^{}]*\}/g) || []);
  const osoby = u.osoby || {};
  for (const s of pouzite) { const k = s.slice(1, -1); if (!osoby[k]) chyby.push(`slot ${s} není v „osoby“`); }
  // jméno se dosazuje jen v 1. pádě; po předložce nebo slovese s jiným pádem by vznikl špatný tvar („pro Eliška“)
  const spatnyPad = /(?:^|[\s(„'"])(pro|od|do|z|ze|u|k|ke|s|se|o|na|po|při|bez|mezi|místo|oproti|podle|kvůli|proti|patří|žádá)\s+\{[^{}]*\}/i;
  for (const t of texty) { const m = spatnyPad.exec(t); if (m) chyby.push(`slot po „${m[1]}“ není v 1. pádě: „${t.slice(Math.max(0, m.index), m.index + 40)}…“`); }
  for (const [k, o] of Object.entries(osoby)) {
    if (!pouzite.has(`{${k}}`)) chyby.push(`slot {${k}} se v textu nepoužívá`);
    if (!o || !['m', 'f'].includes(o.rod) || !o.jmeno) chyby.push(`slot {${k}}: chybí rod (m/f) nebo výchozí jméno`);
  }
}

let spatne = 0;
for (const u of ulohy) {
  let r;
  try { r = overUlohu(u); } catch (e) { r = { reseni: 0, chyby: ['chyba ve výrazu: ' + e.message] }; }
  const ok = !r.chyby.length;
  if (!ok) spatne++;
  console.log(`${String(u.id).padStart(2)} ${ok ? 'OK   ' : 'CHYBA'} ${u.typ.padEnd(18)} odpověď ${u.odpoved.zobrazeni || u.odpoved.hodnota} ${u.odpoved.jednotka}${ok ? '' : '  → ' + r.chyby.join('; ')}`);
}
console.log(`\nÚloh: ${ulohy.length}, prošlo: ${ulohy.length - spatne}, chyby: ${spatne}`);
process.exit(spatne ? 1 : 0);
