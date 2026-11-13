'use strict';
/* ===== Nastavení vysvětlování přes OpenRouter =====
   Klíč NIKDY nedávej do veřejně sdílené verze stránky.
   Prázdný klíč = tlačítko „Zeptej se“ se nezobrazí. */
window.AI_CONFIG = {
  apiKey: '',                       // sk-or-v1-...
  model:  '',                       // slug modelu z openrouter.ai/models
  url:    'https://openrouter.ai/api/v1/chat/completions'
};
// V Android aplikaci se klíč a model načtou z local.properties přes most AndroidCfg.
try{ if(window.AndroidCfg){ const k=AndroidCfg.key(), m=AndroidCfg.model(); if(k) AI_CONFIG.apiKey=k; if(m) AI_CONFIG.model=m; } }catch(e){}
