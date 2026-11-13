'use strict';
// Sešit chyb: příklady, které napoprvé nevyšly.

// ---------- mistakes ----------
const myMistakes=()=>store.mistakes.filter(m=>{const t=TOPICS.find(x=>x.id===m.topic);return t&&subjOf(t)===subject});
function updateBadge(){const b=$('mbadge');const n=myMistakes().length;b.hidden=!n;b.textContent=n}
function renderMistakes(){
  const el=$('mlist');
  const list=myMistakes();
  if(!list.length){setHTML(el,`<div class="empty">Sešit chyb je prázdný. ${L('Příklady','Úlohy')}, které napoprvé nevyjdou, se sem uloží samy.</div>`);return}
  el.replaceChildren();
  list.slice().reverse().forEach(p=>{const t=TOPICS.find(x=>x.id===p.topic);const d=document.createElement('div');d.className='mitem';
    setHTML(d,`<div><small>${t.name}</small>${p.subj==='cj'?`<div><b>${escT(p.task)}</b></div>`:''}<div class="p">${p.prompt}</div></div><div class="actions"><button class="btn"\
 type="button">${L('Spočítat znovu','Zkusit znovu')}</button><button class="btn ghost" type="button">Odebrat</button></div>`);
    const [again,del]=d.querySelectorAll('button');
    again.onclick=()=>{location.hash='trenink';setTimeout(()=>newProblem(p),0)};
    del.onclick=()=>{store.mistakes=store.mistakes.filter(m=>m.id!==p.id);save();updateBadge();renderMistakes()};
    el.appendChild(d)});
}
