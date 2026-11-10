// tests/helpers.js
// Helpers for loading the WebView application and evaluating mathematical expressions.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const INDEX_HTML_PATH = path.join(__dirname, '../app/src/main/assets/index.html');
const WEB_HTML_PATH = path.join(__dirname, '../pocitani-na-prijimacky.html');

const indexHtmlContent = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

function extractScripts(html) {
  return [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
}

const scriptBlocks = extractScripts(indexHtmlContent);

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

// Load second script block ('use strict';) via node:vm into an isolated context
function loadAppContext(htmlPath = INDEX_HTML_PATH) {
  const content = htmlPath === INDEX_HTML_PATH ? indexHtmlContent : fs.readFileSync(htmlPath, 'utf8');
  const blocks = htmlPath === INDEX_HTML_PATH ? scriptBlocks : extractScripts(content);

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

  // Run script 0 (OpenRouter config)
  vm.runInContext(blocks[0], context);

  // Run script 1 (Core logic starting with 'use strict';)
  vm.runInContext(blocks[1], context);

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
      frSol
    };
  `, context);

  return sandbox.__app;
}

module.exports = {
  INDEX_HTML_PATH,
  WEB_HTML_PATH,
  scriptBlocks,
  extractScripts,
  evaluateExpr,
  loadAppContext
};
