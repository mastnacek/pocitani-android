'use strict';
// Start aplikace: první vykreslení a napojení zarovnání na čtverečky. Načítá se jako poslední.

applySubject();
renderTopicChips();
renderSeg($('levelSeg'),()=>state.level,l=>{state.level=l;store.level=l;save();resetSeries()});
renderChips($('wsChips'),ws.topics,()=>{store.wsTopics=[...ws.topics];save()},null,TOPICS.filter(t=>subjOf(t)==='mat'));
renderSeg($('wsLevel'),()=>ws.level,l=>{ws.level=l;store.wsLevel=l;save()});
updateBadge();updateSession();newProblem();route();

if(window.ResizeObserver){
  // Sledují se jen bloky uvnitř listu (ne list sám): změna okrajů jejich velikost nemění, takže nevznikne smyčka.
  const ro=new ResizeObserver(gridSnap);
  const watch=()=>document.querySelectorAll('.sheet > *').forEach(el=>ro.observe(el));
  watch();
  const mo=new MutationObserver(()=>{watch();snapSoon()});
  document.querySelectorAll('.sheet').forEach(sh=>mo.observe(sh,{childList:true,attributes:true,attributeFilter:['hidden']}));
}
window.addEventListener('hashchange',snapSoon);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(snapSoon);
snapSoon();
