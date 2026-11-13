'use strict';
// Přepínání předmětů (matematika / čeština).

function applySubject(){
  if(subject==='cj')paperGrain();
  document.documentElement.dataset.subject=subject;
  if(subject==='cj')requestAnimationFrame(()=>{drawPaper($('sheet'));drawPaper($('cmSheet'))});
  document.querySelectorAll('#subjSeg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.subj===subject));
  $('showBtn').textContent=L('Ukázat postup','Ukázat vysvětlení');
  $('askIn').placeholder=L('Třeba: proč se tady obrací zlomek?','Třeba: proč se tady píše -y?');
}
function setSubject(s){
  if(s===subject)return;subject=s;store.subject=s;save();
  state.topics=loadTopics();if(!state.mix&&state.topics.size>1)state.topics=new Set([[...state.topics][0]]);
  applySubject();renderTopicChips();updateBadge();route();resetSeries();
}
document.querySelectorAll('#subjSeg button').forEach(b=>b.onclick=()=>setSubject(b.dataset.subj));
