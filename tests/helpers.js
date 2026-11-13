// tests/helpers.js
// Helpers for loading the WebView application and evaluating mathematical expressions.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const INDEX_HTML_PATH = path.join(__dirname, '../app/src/main/assets/index.html');
const WEB_HTML_PATH = path.join(__dirname, '../pocitani-na-prijimacky.html');

const indexHtmlContent = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

// <script> z index.html v pořadí dokumentu: vložený blok, nebo soubor podle src (cesta relativně k index.html)
function pageScripts(html, baseDir) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(m => {
    const src = /\bsrc="([^"]+)"/.exec(m[1]);
    return src
      ? { name: src[1], code: fs.readFileSync(path.join(baseDir, src[1]), 'utf8') }
      : { name: 'inline', code: m[2] };
  });
}

const pageScriptList = pageScripts(indexHtmlContent, path.dirname(INDEX_HTML_PATH));
const scriptBlocks = pageScriptList.map(s => s.code);

// Custom evaluator for plain math expressions (^, :, /, *, +, -, √, parens, decimals, implicit mul)
function evaluateExpr(str, vars = {}) {
  let s = str.replace(/([0-9])([a-zA-Z(√])/g, '$1*$2')
             .replace(/([a-zA-Z)])([a-zA-Z(√])/g, '$1*$2')
             .replace(/([)])([0-9])/g, '$1*$2');

  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (ch === ':' || ch === '/') { tokens.push({ type: 'DIV' }); i++; continue; }
    if (ch === '*') { tokens.push({ type: 'MUL' }); i++; continue; }
    if (ch === '+') { tokens.push({ type: 'ADD' }); i++; continue; }
    if (ch === '-') { tokens.push({ type: 'SUB' }); i++; continue; }
    if (ch === '^') { tokens.push({ type: 'POW' }); i++; continue; }
    if (ch === '√') { tokens.push({ type: 'SQRT' }); i++; continue; }
    if (ch === '(') { tokens.push({ type: 'LPAREN' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'RPAREN' }); i++; continue; }
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      while (i < s.length && /[0-9.]/.test(s[i])) { numStr += s[i]; i++; }
      tokens.push({ type: 'NUM', val: parseFloat(numStr) });
      continue;
    }
    if (/[a-zA-Z]/.test(ch)) {
      const v = ch.toLowerCase();
      const val = vars[v] !== undefined ? vars[v] : (vars[ch] !== undefined ? vars[ch] : 0);
      tokens.push({ type: 'NUM', val });
      i++;
      continue;
    }
    throw new Error(`Neznámý znak v evaluátoru: ${ch} ve výrazu: ${str}`);
  }

  let pos = 0;
  function peek() { return tokens[pos]; }
  function consume(type) {
    const t = tokens[pos];
    if (type && (!t || t.type !== type)) throw new Error(`Očekáván token ${type} na pozici ${pos}`);
    pos++;
    return t;
  }

  function parseExpr() { return parseAddSub(); }
  function parseAddSub() {
    let left = parseMulDiv();
    while (peek() && (peek().type === 'ADD' || peek().type === 'SUB')) {
      const op = consume().type;
      const right = parseMulDiv();
      left = op === 'ADD' ? left + right : left - right;
    }
    return left;
  }
  function parseMulDiv() {
    let left = parseUnary();
    while (peek() && (peek().type === 'MUL' || peek().type === 'DIV')) {
      const op = consume().type;
      const right = parseUnary();
      left = op === 'MUL' ? left * right : left / right;
    }
    return left;
  }
  function parseUnary() {
    if (peek() && peek().type === 'ADD') { consume(); return parseUnary(); }
    if (peek() && peek().type === 'SUB') { consume(); return -parseUnary(); }
    if (peek() && peek().type === 'SQRT') { consume(); return Math.sqrt(parseUnary()); }
    return parsePower();
  }
  function parsePower() {
    let left = parseAtom();
    if (peek() && peek().type === 'POW') {
      consume('POW');
      const right = parseUnary();
      left = Math.pow(left, right);
    }
    return left;
  }
  function parseAtom() {
    const t = peek();
    if (!t) throw new Error('Neočekávaný konec výrazu');
    if (t.type === 'NUM') { consume(); return t.val; }
    if (t.type === 'LPAREN') {
      consume('LPAREN');
      const val = parseExpr();
      consume('RPAREN');
      return val;
    }
    throw new Error(`Neočekávaný token ${t.type}`);
  }

  return parseExpr();
}

// Načte skripty aplikace (bez rozhraní) přes node:vm do izolovaného kontextu.
// transform(name, code) umožňuje v testech kód před spuštěním upravit (mutační test).
function loadAppContext(transform = (name, code) => code) {
  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    Math,
    Date,
    JSON,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Error,
    document: {
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      createElement: () => ({ style: {}, appendChild: () => {}, setAttribute: () => {} }),
      addEventListener: () => {}
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    }
  };
  sandbox.window = sandbox;
  sandbox.global = sandbox;
  sandbox.self = sandbox;

  const context = vm.createContext(sandbox);

  // Skripty v pořadí z index.html; rozhraní (IIFE na konci) se v testech nespouští
  for (const s of pageScriptList) {
    if (/^\s*\(function\s*\(\)\s*\{/.test(s.code)) continue;
    vm.runInContext(transform(s.name, s.code), context, { filename: s.name });
  }

  // Expose internal references
  vm.runInContext(`
    globalThis.__app = {
      TOPICS,
      SLOVNI,
      PROMENNA,
      generate,
      check,
      F,
      Fr,
      P,
      analyze,
      slovniPrompt,
      genSlovni,
      genPromenna,
      polySol,
      numSol,
      decStr,
      frSol,
      SHODA,
      MEMNE,
      CJ_ROD
    };
  `, context);

  return sandbox.__app;
}

module.exports = {
  INDEX_HTML_PATH,
  WEB_HTML_PATH,
  scriptBlocks,
  pageScripts,
  evaluateExpr,
  loadAppContext
};
