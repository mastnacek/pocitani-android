// tests/promenna-independent.js
// Independent mathematical solver for the 8 PROMENNA word problem templates.
// Strictly extracts input numbers from Czech text and question fields via regex
// and calculates expected expressions a), b) and result c) WITHOUT using p.e, p.ans or L.

const assert = require('node:assert/strict');

const ZLOMKY_MAP = {
  polovinu: 2,
  třetinu: 3,
  čtvrtinu: 4,
  pětinu: 5,
  šestinu: 6
};

const KRAT_MAP = {
  dvakrát: 2,
  třikrát: 3,
  čtyřikrát: 4
};

function parseNum(str) {
  return parseInt(str.replace(/[\s\u00A0]/g, ''), 10);
}

const TEMPLATE_SOLVERS = [
  // T0 Nábytek: stolek = x, židle = x + d, skříň = m*(x + d), celkem = R
  (text, q2) => {
    const mD = text.match(/o\s+(\d+(?:[\s\u00A0]\d+)*)\s+Kč\s+dražší\s+než\s+noční\s+stolek/);
    const mM = text.match(/(dvakrát|třikrát|čtyřikrát)\s+dražší\s+než\s+židle/);
    const mR = q2.match(/zaplatili\s+(\d+(?:[\s\u00A0]\d+)*)\s+Kč/);
    assert.ok(mD && mM && mR, `T0 regex selhal na: ${text}`);
    const d = parseNum(mD[1]), m = KRAT_MAP[mM[1]], R = parseNum(mR[1]);
    return {
      expectedA: (x) => x + d,
      expectedB: (x) => m * (x + d),
      expectedC: (R - (m + 1) * d) / (m + 2)
    };
  },
  // T1 Věk: Karolína = x, bratr = x + d, maminka = m*x, celkem = R
  (text, q2) => {
    const mD = text.match(/o\s+(\d+)\s+(?:roky|let)\s+starší/);
    const mM = text.match(/(dvakrát|třikrát|čtyřikrát)\s+starší\s+než/);
    const mR = q2.match(/dohromady\s+(\d+(?:[\s\u00A0]\d+)*)\s+let/);
    assert.ok(mD && mM && mR, `T1 regex selhal na: ${text}`);
    const d = parseNum(mD[1]), m = KRAT_MAP[mM[1]], R = parseNum(mR[1]);
    return {
      expectedA: (x) => x + d,
      expectedB: (x) => m * x,
      expectedC: (R - d) / (m + 2)
    };
  },
  // T2 Nápoje: čaj = x, káva = x + d, tržba = R
  (text, q2) => {
    const mPrices = text.match(/čaj\s+za\s+(\d+)\s+Kč\s+a\s+kávu\s+za\s+(\d+)\s+Kč/);
    const mD = text.match(/o\s+(\d+)\s+káv\s+více\s+než\s+čajů/);
    const mR = q2.match(/utržili\s+(\d+(?:[\s\u00A0]\d+)*)\s+Kč/);
    assert.ok(mPrices && mD && mR, `T2 regex selhal na: ${text}`);
    const pc = parseNum(mPrices[1]), pk = parseNum(mPrices[2]), d = parseNum(mD[1]), R = parseNum(mR[1]);
    return {
      expectedA: (x) => x + d,
      expectedB: (x) => pc * x + pk * (x + d),
      expectedC: (R - pk * d) / (pc + pk)
    };
  },
  // T3 Zahrada: kratší strana = x, delší strana = x + d, obvod = R
  (text, q2) => {
    const mD = text.match(/o\s+(\d+)\s+m\s+delší\s+než\s+kratší\s+strana/);
    const mR = q2.match(/Obvod\s+zahrady\s+je\s+(\d+(?:[\s\u00A0]\d+)*)\s+m/);
    assert.ok(mD && mR, `T3 regex selhal na: ${text}`);
    const d = parseNum(mD[1]), R = parseNum(mR[1]);
    return {
      expectedA: (x) => x + d,
      expectedB: (x) => 2 * (x + (x + d)),
      expectedC: (R - 2 * d) / 4
    };
  },
  // T4 Stromky: pondělí = x, úterý = (1 + 1/n)*x, středa = (1 + 1/n)*x - d, celkem = R
  (text, q2) => {
    const mW = text.match(/o\s+(polovinu|třetinu|čtvrtinu|pětinu|šestinu)\s+stromků\s+více/);
    const mD = text.match(/ve\s+středu\s+o\s+(\d+)\s+stromků\s+méně\s+než\s+v\s+úterý/);
    const mR = q2.match(/celkem\s+(\d+(?:[\s\u00A0]\d+)*)\s+stromků/);
    assert.ok(mW && mD && mR, `T4 regex selhal na: ${text}`);
    const n = ZLOMKY_MAP[mW[1]], d = parseNum(mD[1]), R = parseNum(mR[1]);
    return {
      expectedA: (x) => (1 + 1 / n) * x,
      expectedB: (x) => (1 + 1 / n) * x - d,
      expectedC: (R + d) * n / (3 * n + 2)
    };
  },
  // T5 Turisté: trasa = x, 1. den = x/n, 2. den = x/n + d, 3. den = r3
  (text, q2) => {
    const mW = text.match(/První\s+den\s+ušli\s+(polovinu|třetinu|čtvrtinu|pětinu|šestinu)\s+celé\s+trasy/);
    const mD = text.match(/druhý\s+den\s+o\s+(\d+)\s+km\s+více\s+než\s+první\s+den/);
    const mR = q2.match(/Třetí\s+den\s+ušli\s+(\d+(?:[\s\u00A0]\d+)*)\s+km/);
    assert.ok(mW && mD && mR, `T5 regex selhal na: ${text}`);
    const n = ZLOMKY_MAP[mW[1]], d = parseNum(mD[1]), r3 = parseNum(mR[1]);
    return {
      expectedA: (x) => x / n + d,
      expectedB: (x) => x - x / n - (x / n + d),
      expectedC: (r3 + d) * n / (n - 2)
    };
  },
  // T6 Účet: začátek = x, autobus = x/n, vstupenky = s, zbylo = zb
  (text, q2) => {
    const mW = text.match(/zaplatili\s+(polovinu|třetinu|čtvrtinu|pětinu|šestinu)\s+této\s+částky/);
    const mS = text.match(/vstupenky\s+do\s+muzea\s+ještě\s+(\d+(?:[\s\u00A0]\d+)*)\s+Kč/);
    const mR = q2.match(/zbylo\s+na\s+účtu\s+(\d+(?:[\s\u00A0]\d+)*)\s+Kč/);
    assert.ok(mW && mS && mR, `T6 regex selhal na: ${text}`);
    const n = ZLOMKY_MAP[mW[1]], s = parseNum(mS[1]), zb = parseNum(mR[1]);
    return {
      expectedA: (x) => x - x / n,
      expectedB: (x) => x - x / n - s,
      expectedC: (zb + s) * n / (n - 1)
    };
  },
  // T7 Kniha: stran = x, 1. týden = x/n, 2. týden = m*(x/n), zbývá = zb
  (text, q2) => {
    const mW = text.match(/První\s+týden\s+přečetla\s+(polovinu|třetinu|čtvrtinu|pětinu|šestinu)\s+knihy/);
    const mM = text.match(/druhý\s+týden\s+(dvakrát|třikrát|čtyřikrát)\s+více\s+stran/);
    const mR = q2.match(/Zbývá\s+jí\s+přečíst\s+(\d+(?:[\s\u00A0]\d+)*)\s+stran/);
    assert.ok(mW && mM && mR, `T7 regex selhal na: ${text}`);
    const n = ZLOMKY_MAP[mW[1]], m = KRAT_MAP[mM[1]], zb = parseNum(mR[1]);
    return {
      expectedA: (x) => (m / n) * x,
      expectedB: (x) => x - x / n - (m / n) * x,
      expectedC: zb * n / (n - 1 - m)
    };
  }
];

function parseAndCalculatePromenna(templateIdx, p) {
  const solver = TEMPLATE_SOLVERS[templateIdx];
  assert.ok(solver, `Neznámý index šablony: ${templateIdx}`);
  return solver(p.text, p.q[2]);
}

function verifyPromennaIndependent(templateIdx, p, evaluateExpr) {
  const { expectedA, expectedB, expectedC } = parseAndCalculatePromenna(templateIdx, p);

  // Porovnání hodnot výrazů a) a b) v několika bodech x
  const testPoints = [0, 1, 5, 20, 50];
  for (const testX of testPoints) {
    const valA = evaluateExpr(p.sol[0], { [p.v]: testX });
    const expA = expectedA(testX);
    assert.ok(
      Math.abs(valA - expA) < 1e-4,
      `T${templateIdx} výraz a) nesedí pro ${p.v}=${testX}: sol[0]=${p.sol[0]}, eval=${valA}, exp=${expA}`
    );

    const valB = evaluateExpr(p.sol[1], { [p.v]: testX });
    const expB = expectedB(testX);
    assert.ok(
      Math.abs(valB - expB) < 1e-4,
      `T${templateIdx} výraz b) nesedí pro ${p.v}=${testX}: sol[1]=${p.sol[1]}, eval=${valB}, exp=${expB}`
    );
  }

  // Porovnání výsledku c)
  const solC = parseFloat(p.sol[2]);
  assert.ok(
    Math.abs(solC - expectedC) < 1e-4,
    `T${templateIdx} výsledek c) nesedí: sol[2]=${p.sol[2]}, exp=${expectedC}`
  );
}

function verifyPromennaMutation(loadAppContext, evaluateExpr) {
  let zmeneno = 0;
  const mutatedApp = loadAppContext((name, code) => {
    const nove = code.replace('e2=LP(m,m*d)', 'e2=LP(m,d)');
    if (nove !== code) zmeneno++;
    return nove;
  });
  assert.ok(zmeneno > 0, 'Mutace se nikde neuplatnila: v kódu chybí e2=LP(m,m*d)');
  const raw = mutatedApp.PROMENNA[0].f();
  const mutatedP = {
    v: raw.v,
    text: raw.text,
    q: raw.q,
    sol: [mutatedApp.polySol(raw.e[0], raw.v), mutatedApp.polySol(raw.e[1], raw.v), mutatedApp.numSol(raw.x)]
  };

  assert.throws(
    () => verifyPromennaIndependent(0, mutatedP, evaluateExpr),
    /AssertionError/,
    'Nezávislý ověřovač musí odhalit chybu v e2 (nábytek)'
  );
}

module.exports = {
  ZLOMKY_MAP,
  KRAT_MAP,
  parseNum,
  parseAndCalculatePromenna,
  verifyPromennaIndependent,
  verifyPromennaMutation
};
