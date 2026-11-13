'use strict';
// Pracovní list (jen matematika): tiskový list s příklady a řešením.

// ---------- worksheet ----------
function makeWorksheet(){
  const n=+$('wsCount').value;const ids=[...ws.topics];const list=[];
  for(let i=0;i<n;i++)list.push(generate(ids[i%ids.length],ws.level));
  const d=new Date();const date=`${d.getDate()}. ${d.getMonth()+1}. ${d.getFullYear()}`;
  const names=ids.map(id=>TOPICS.find(t=>t.id===id).name.toLowerCase()).join(', ');
  const item=(p,i)=>`<div class="ws-item"><div class="q"><span class="n">${i+1}.</span><div><div class="t">${p.task}</div><div class="p">${p.prompt}</div></div></div><div\
 class="ws-space"></div></div>`;
  const sol=(p,i)=>`<div class="ws-item"><div class="q"><span class="n">${i+1}.</span><div class="p">${p.prompt}</div></div>${p.trap?`<p class="ws-trap"><b>Pozor:</b> ${p.trap}</p>`:''}<ol\
 class="stp">${p.steps.map(stepHTML).join('')}</ol><p style="margin:4px 0 0 2.2em"><b>Výsledek:</b> <span style="font-family:var(--math)">${p.solH}</span></p></div>`;
  setHTML($('wsOut'),`<div class="worksheet"><h2>Pracovní list</h2><p class="meta">${date}, ${names}, ${ws.level===1?'základ':'úroveň přijímaček'}</p>${list.map(item).join('')}<div\
 class="solutions"><h2>Řešení</h2>${list.map(sol).join('')}</div></div>`);
  $('wsPrint').disabled=false;
}
$('wsMake').onclick=makeWorksheet;
$('wsPrint').onclick=()=>{try{if(window.AndroidCfg&&AndroidCfg.print){AndroidCfg.print();return}}catch(e){}$('wsPrintNote').hidden=false;try{window.print()}catch(e){}};
