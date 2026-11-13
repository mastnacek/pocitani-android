'use strict';
// Trénink: výběr témat a obtížnosti, zadání příkladu, kontrola odpovědi, postup a souhrn série.

// ---------- chips ----------
function renderChips(el,set,onChange,multi,list){
  list=list||TOPICS;el.replaceChildren();
  // témata po skupinách a s pořadovým číslem, ať je vidět, co na co navazuje
  list.forEach((t,i)=>{
    if(!i||list[i-1].g!==t.g){const h=document.createElement('span');h.className='grp';h.textContent=TOPIC_GROUPS[t.g];el.appendChild(h)}
    const b=document.createElement('button');b.className='chip';b.type='button';b.dataset.id=t.id;b.textContent=`${i+1}. ${t.name}`;b.setAttribute('aria-pressed',set.has(t.id));
    if(isMastered(store.stats[t.id])){const m=document.createElement('span');m.className='mast';m.textContent=' ✓';m.title='zvládnuto (aspoň 80 % napoprvé)';b.appendChild(m)}
    b.onclick=()=>{if(multi&&!multi()){if(set.size===1&&set.has(t.id))return;set.clear();set.add(t.id)}else if(set.has(t.id)){if(set.size>1)set.delete(t.id)}else set.add(t.id);
      el.querySelectorAll('.chip').forEach(c=>c.setAttribute('aria-pressed',set.has(c.dataset.id)));onChange()};
    el.appendChild(b)});
}
function renderSeg(el,get,set){[...el.querySelectorAll('button')].forEach(b=>{b.setAttribute('aria-pressed',+b.dataset.level===get());b.onclick=()=>{set(+b.dataset.level);
  [...el.querySelectorAll('button')].forEach(x=>x.setAttribute('aria-pressed',+x.dataset.level===get()))}})}

// ---------- trainer ----------
function newProblem(fromMistake){
  if(!fromMistake&&state.series.i>=SERIES){showSummary();return}
  $('sheet').hidden=false;$('summary').hidden=true;
  let p;
  if(fromMistake){p=fromMistake;state.fromMistake=true}
  else{const ids=[...state.topics];p=generate(pick(ids),state.level);state.fromMistake=false;state.series.i++}
  state.cur=p;$('sheet').dataset.seed=p.id||'';state.attempts=0;state.counted=false;state.solved=false;state.shown=false;
  const t=TOPICS.find(x=>x.id===p.topic);
  $('tName').textContent=t.name;$('tRef').textContent=t.ref;
  if(fromMistake)$('tSrc').textContent='ze sešitu chyb';else renderDots(false);
  $('tick').hidden=true;$('answer').classList.remove('ok','nudge','rows');
  state.lastAnswer='';state.chat=[];$('ask').hidden=true;$('thread').replaceChildren();$('askIn').value='';
  $('nextBtn').textContent=(!fromMistake&&state.series.i>=SERIES)?'Ukázat výsledek série':L('Další příklad','Další úloha');
  $('task').textContent=p.task;
  setHTML($('prompt'),p.prompt);
  setHTML($('guideBody'),guideHTML(GUIDES[p.guide||p.topic],p.trap));$('guide').open=false;
  const a=$('answer');a.replaceChildren();
  const mk=(lab,id,cls)=>{const l=document.createElement('label');l.htmlFor=id;setHTML(l,lab);const i=document.createElement('input');i.id=id;i.type='text';i.autocomplete='off';i.spellcheck=false;
    i.setAttribute('autocapitalize','off');if(cls)i.className=cls;i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();if(state.solved)newProblem();else doCheck()}});
      a.appendChild(l);a.appendChild(i);return i};
  let first;
  if(p.kind==='sys'){first=mk('<i>x</i> =','in0','short');mk('<i>y</i> =','in1','short')}
  else if(p.kind==='promenna'){first=mk('a)','in0');mk('b)','in1');mk(`c) (${escT(p.unitTxt)})`,'in2','short');a.classList.add('rows')}
  else if(p.kind==='eq'){first=mk('<i>'+p.v+'</i> =','in0','short');const box=document.createElement('span');box.className='ins';[['nemá řešení','nemá řešení'],['nekonečně mnoho',
    'nekonečně mnoho řešení']].forEach(([lab,txt])=>{const b=document.createElement('button');b.type='button';b.textContent=lab;b.style.fontFamily='var(--ui)';b.style.fontSize='.85rem';b.onclick=()=>{
      first.value=txt;first.focus()};box.appendChild(b)});a.appendChild(box)}
  else if(p.kind==='mc'){
    // výběr A–E jako v záznamovém archu; volba se drží ve skrytém poli in0
    const hid=document.createElement('input');hid.type='hidden';hid.id='in0';a.appendChild(hid);
    const l=document.createElement('span');l.className='mclbl';l.textContent='Odpověď:';a.appendChild(l);
    const box=document.createElement('span');box.className='mcbox';box.setAttribute('role','group');box.setAttribute('aria-label','Možnosti A až E');
    Object.keys(p.opts).forEach(k=>{const b=document.createElement('button');b.type='button';b.className='mcbtn';b.textContent=k;b.setAttribute('aria-pressed','false');
      b.onclick=()=>{if(state.solved)return;hid.value=k;box.querySelectorAll('.mcbtn').forEach(x=>x.setAttribute('aria-pressed',x===b));};box.appendChild(b)});
    a.appendChild(box);first=box.querySelector('.mcbtn');
  }
  else{first=mk(p.unitTxt?`Výsledek (${escT(p.unitTxt)}):`:'Výsledek:','in0')}
  if(p.kind==='poly'||p.kind==='factor'){const box=document.createElement('span');box.className='ins';[['²','²'],['(','('],[')',')']].forEach(([lab,txt])=>{const b=document.createElement('button');
    b.type='button';b.textContent=lab;b.setAttribute('aria-label','Vložit '+lab);b.onclick=()=>insertAt(first,txt);box.appendChild(b)});a.appendChild(box)}
  const hints={num:p.fraction?'Zlomek piš s lomítkem, třeba −7/8. Celé číslo napiš normálně.':p.decimal?'Napiš desetinné číslo, třeba 0,375.':(p.unit?'Napiš jen číslo, jednotku nepiš.':'Napiš číslo.\
 Desetinná čárka i tečka fungují, zlomek s lomítkem.'),
    poly:'Mocninu napiš jako ^2 nebo tlačítkem ². Třeba 3'+p.v+'^2 − 5'+p.v+' + 1.',
    factor:p.mode==='common'?'Napiš jako součin, třeba 3'+p.v+'(2'+p.v+' − 5).':'Napiš jako součin závorek, třeba ('+p.v+' + 3)('+p.v+' − 3) nebo ('+p.v+' − 2)².',
    eq:'Napiš jen hodnotu '+p.v+'. Když rovnice nemá řešení nebo jich má nekonečně mnoho, klepni na tlačítko.',sys:'Napiš hodnotu x a hodnotu y.',
    promenna:'Do a) a b) napiš výraz s proměnnou, třeba x + x/4 nebo 3(x + 400). Do c) jen číslo.',
    mc:'Klepni na písmeno a pak na Zkontrolovat. Když si nevíš rady, dosaď možnosti do zadání.'};
  $('hint').textContent=p.hint||hints[p.kind];
  $('fb').textContent='';$('fb').className='fb';
  $('steps').hidden=true;$('steps').replaceChildren();
  $('checkBtn').disabled=false;$('showBtn').disabled=false;$('nextBtn').classList.remove('go');
  setTimeout(()=>first.focus({preventScroll:true}),0);
}
// puntíky série: hotové plné, aktuální obtažený, další prázdné (chyby se nebarví)
function renderDots(doneCur){
  const el=$('tSrc');el.replaceChildren();const w=document.createElement('span');w.className='dots';
  w.setAttribute('role','img');w.setAttribute('aria-label',`příklad ${state.series.i} z ${SERIES}`);
  for(let i=1;i<=SERIES;i++){const d=document.createElement('span');if(i<state.series.i||(i===state.series.i&&doneCur))d.className='d';else if(i===state.series.i)d.className='c';w.appendChild(d)}
  el.appendChild(w);
}
// učitelská fajfka na okraji listu u řádku s odpovědí
function showTick(){
  const t=$('tick'),a=$('answer');t.hidden=false;
  t.style.top=Math.round(a.offsetTop+a.offsetHeight/2-t.offsetHeight/2)+'px';
  t.classList.remove('draw');void t.offsetWidth;t.classList.add('draw');
}
function insertAt(inp,txt){const s=inp.selectionStart??inp.value.length,e=inp.selectionEnd??inp.value.length;inp.value=inp.value.slice(0,s)+txt+inp.value.slice(e);inp.focus();
  inp.selectionStart=inp.selectionEnd=s+txt.length}
function record(ok){
  if(state.counted)return;state.counted=true;
  const p=state.cur;const s=store.stats[p.topic]||(store.stats[p.topic]={ok:0,n:0});const wasM=isMastered(s);s.n++;if(ok)s.ok++;
  s.last=Date.now();s.r=((s.r||'')+(ok?'1':'0')).slice(-20); // posledních 20 prvních pokusů: ukazuje, jak to jde teď
  if(isMastered(s)!==wasM)renderTopicChips();
  const d=today();const day=store.days[d]||(store.days[d]={ok:0,n:0});day.n++;if(ok)day.ok++;
  if(!state.fromMistake&&ok)state.series.ok++;
  if(state.fromMistake&&ok){store.mistakes=store.mistakes.filter(m=>m.id!==p.id)}
  if(!ok&&!store.mistakes.some(m=>m.id===p.id)){store.mistakes.push(p);if(store.mistakes.length>60)store.mistakes.shift()}
  save();updateBadge();updateSession();
}
function doCheck(){
  if(state.solved)return;
  const p=state.cur;const ins=p.kind==='sys'?[$('in0').value,$('in1').value]:p.kind==='promenna'?[$('in0').value,$('in1').value,$('in2').value]:[$('in0').value];
  const r=check(p,ins);const fb=$('fb');
  if(!r.format)state.lastAnswer=p.kind==='sys'?`x = ${ins[0]}, y = ${ins[1]}`:ins[0];
  if(r.format){fb.className='fb neutral';fb.textContent=r.msg;return}
  state.attempts++;
  if(r.ok){
    record(true);state.solved=true;
    fb.className='fb ok';fb.textContent=state.attempts===1&&!state.shown?'Správně.':'Správně, tentokrát napodruhé. Do statistiky se počítá první pokus.';
    if(state.fromMistake&&state.attempts===1&&!state.shown)fb.textContent='Správně. Příklad jsem vyřadil ze sešitu chyb.';
    $('answer').classList.add('ok');showTick();
    showSteps(L('Porovnej se svým postupem','Vysvětlení'));
    $('checkBtn').disabled=true;$('nextBtn').classList.add('go');$('nextBtn').focus();
  }else{
    record(false);
    const an=$('answer');an.classList.remove('nudge');void an.offsetWidth;an.classList.add('nudge');
    fb.className='fb bad';fb.textContent=r.msg+(r.near?'':L(' Zkus to znovu, nebo si ukaž postup.',' Zkus to znovu, nebo si ukaž vysvětlení.'));
    // slovní úloha: podtrhni v zadání frázi, kterou žák s touto chybou nejspíš přehlédl
    if(p.text!==undefined&&r.pod!==undefined)setHTML($('prompt'),slovniPrompt(p,r.pod));
    if(p.trap&&!r.pod){const tip=document.createElement('div');tip.className='fbtip';setHTML(tip,'<b>Tip:</b> '+p.trap);fb.appendChild(tip)}
  }
}
function showSteps(title){
  const p=state.cur;const box=$('steps');
  setHTML(box,`<h3>${title}</h3><ol class="stp">${p.steps.map(stepHTML).join('')}</ol><p class="result"><b>${L('Výsledek','Odpověď')}:</b> ${p.solH}</p>`);
  box.hidden=false;
  // kroky naskočí postupně, jako by je někdo psal
  box.classList.remove('rev');void box.offsetWidth;box.classList.add('rev');
  box.querySelectorAll('.stp>li,.result').forEach((li,i)=>li.style.animationDelay=Math.min(i*70,1000)+'ms');
  if(!state.fromMistake)renderDots(true);
  showAsk();
}
function showSummary(){
  const s=state.series;$('sheet').hidden=true;const el=$('summary');el.hidden=false;
  const msg=s.ok===SERIES?'Celá série bez chyby.':(s.ok>=SERIES*0.7?'Dobrá série. Chyby najdeš v sešitu chyb.':'Tohle téma chce ještě trénink. Projdi si sešit chyb a zkus další sérii.');
  const st=s.ok===SERIES?['s1','Výborně']:(s.ok>=SERIES*0.7?['s2','Dobrá práce']:['s3','Pokračuj']);
  setHTML(el,`<h2>Série hotová</h2><p class="big">${s.ok} z ${SERIES}<span class="stamp ${st[0]}" aria-hidden="true">${st[1]}</span></p><p>správně napoprvé. ${msg}</p><div class="actions"><button\
 class="btn" id="againBtn" type="button">Další série</button><a class="btn ghost" href="#chyby" style="text-decoration:none">Sešit chyb</a></div>`);
  $('againBtn').onclick=()=>{state.series={i:0,ok:0};newProblem()};$('againBtn').focus();
}
function resetSeries(){state.series={i:0,ok:0};newProblem()}
$('checkBtn').onclick=doCheck;
$('nextBtn').onclick=()=>newProblem();
$('showBtn').onclick=()=>{if(!state.solved&&!state.counted){record(false)}state.shown=true;showSteps(L('Správný postup','Vysvětlení'));$('showBtn').disabled=true};
$('mixToggle').checked=state.mix;
$('mixToggle').onchange=()=>{state.mix=$('mixToggle').checked;store.mix=state.mix;if(!state.mix&&state.topics.size>1){const f=[...state.topics][0];state.topics.clear();state.topics.add(f);
  renderTopicChips()}store.topics=[...state.topics];save()};
function updateSession(){const d=store.days[today()];$('session').textContent=d&&d.n?`Dnes: ${d.ok} z ${d.n} správně napoprvé.`:'Dnes zatím žádný příklad.'}
