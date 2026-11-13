'use strict';
// Záložky (hash v adrese) a překreslení témat.

// ---------- routing ----------
const VIEWS=['trenink','cermat','list','chyby','pruvodce','prehled'];
function renderGuides(){
  const g=L(GUIDE_GENERAL,GUIDE_GENERAL_CJ);let h=`<div class="gen"><h3>${g.title}</h3><ul>${g.items.map(x=>`<li>${x}</li>`).join('')}</ul></div><div class="glist">`;
  Object.keys(GUIDES).filter(k=>(GUIDES[k].subj||'mat')===subject).forEach(k=>{h+=`<details><summary>${GUIDES[k].title}</summary><div class="gbody">${guideHTML(GUIDES[k],'')}</div></details>`});
  setHTML($('pruvodceOut'),
    `<p class="note">V postupech a tipech: ${K('zvýrazněné')} je pravidlo, ${N('modře')} co je v kroku nové, ${X('červeně')} pozor na chybu.</p>`+h+'</div><p class="note">'+L('Bodování vychází z\
 klíčů správných řešení CERMATu z let 2023 až 2025. Body se mohou u konkrétní úlohy lišit, rozhoduje vždy zadání a klíč.',
   'Věty v úlohách jsou vlastní, ve stylu přijímaček. Oficiální testy procvičuj v aplikaci CERMAT TAU.')+'</p>');
}
function route(){
  const h=(location.hash||'').slice(1);const v=VIEWS.includes(h)&&!(h==='list'&&subject==='cj')?h:'trenink';
  VIEWS.forEach(x=>{$('v-'+x).hidden=x!==v});if(v!=='cermat')document.body.classList.remove('cm-open');
  document.querySelectorAll('nav.tabs a').forEach(a=>{if(a.dataset.view===v)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  if(v==='chyby')renderMistakes();if(v==='cermat')cmShowList();if(v==='prehled')renderStats();if(v==='pruvodce')renderGuides();
}
window.addEventListener('hashchange',route);

function renderTopicChips(){renderChips($('topicChips'),state.topics,()=>{store[SUBJ_DEF[subject].key]=[...state.topics];save();resetSeries()},()=>state.mix,subjTopics())}
