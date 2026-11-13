// tests/struktura.test.js
// Hlídá strukturu zdrojů aplikace po rozdělení index.html: krátká stránka, krátké řádky a soubory,
// každý skript a styl je odkázaný z index.html a existuje.
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { INDEX_HTML_PATH } = require('./helpers');

const ASSETS = path.dirname(INDEX_HTML_PATH);
const MAX_RADEK = 200;     // znaků na řádek (mimo js/data/)
const MAX_SOUBOR = 400;    // řádků na zdrojový soubor (mimo js/data/)
const MAX_INDEX = 300;     // řádků v index.html

function soubory(dir, pripona) {
  const out = [];
  for (const e of fs.readdirSync(path.join(ASSETS, dir), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...soubory(rel, pripona));
    else if (e.name.endsWith(pripona)) out.push(rel);
  }
  return out;
}
const radky = rel => fs.readFileSync(path.join(ASSETS, rel), 'utf8').replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');
const zdroje = [...soubory('css', '.css'), ...soubory('js', '.js')];
const bezDat = zdroje.filter(f => !f.startsWith('js/data/'));
const html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

describe('Struktura zdrojů aplikace', () => {
  it(`index.html má jen markup a odkazy (do ${MAX_INDEX} řádků, žádný vložený <style> ani <script> s kódem)`, () => {
    assert.ok(radky('index.html').length <= MAX_INDEX, `index.html má ${radky('index.html').length} řádků`);
    assert.ok(!/<style\b/i.test(html), 'v index.html zůstal <style>');
    assert.ok(![...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].some(m => !/\bsrc=/.test(m[1])), 'v index.html zůstal vložený <script>');
  });

  it(`žádný řádek v css/ a js/ (mimo js/data/) není delší než ${MAX_RADEK} znaků`, () => {
    const spatne = [];
    for (const f of bezDat) radky(f).forEach((r, i) => { if (r.length > MAX_RADEK) spatne.push(`${f}:${i + 1} (${r.length})`); });
    assert.deepEqual(spatne, []);
  });

  it(`žádný zdrojový soubor (mimo js/data/) nemá víc než ${MAX_SOUBOR} řádků`, () => {
    const spatne = bezDat.filter(f => radky(f).length > MAX_SOUBOR).map(f => `${f} (${radky(f).length})`);
    assert.deepEqual(spatne, []);
  });

  it('každý soubor v css/ a js/ je odkázaný z index.html a každý odkaz míří na existující soubor', () => {
    const odkazy = [...html.matchAll(/<(?:script src|link rel="stylesheet" href)="([^"]+)"/g)].map(m => m[1]).filter(h => !/^https?:/.test(h));
    assert.equal(new Set(odkazy).size, odkazy.length, 'duplicitní odkaz v index.html');
    for (const o of odkazy) assert.ok(fs.existsSync(path.join(ASSETS, o)), `chybí soubor ${o}`);
    assert.deepEqual(zdroje.filter(f => !odkazy.includes(f)).sort(), [], 'soubor není odkázaný z index.html');
  });

  it('každý skript začíná direktivou \'use strict\' a neobsahuje „</script“', () => {
    for (const f of zdroje.filter(f => f.endsWith('.js'))) {
      const text = fs.readFileSync(path.join(ASSETS, f), 'utf8');
      assert.ok(/^'use strict';\r?\n/.test(text), `${f} nezačíná 'use strict';`);
      assert.ok(!/<\/script/i.test(text), `${f} obsahuje „</script“`);
    }
  });
});
