'use strict';
// Generátory pravopisu pro češtinu (data SHODA a MEMNE jsou v js/data/cestina.js).

// ================= ČEŠTINA =================
// Vlastní věty ve stylu přijímaček (ne oficiální zadání CERMAT). Úloha A–D: najdi větu s chybou,
// nebo jedinou správně napsanou větu. Chybná varianta vzniká záměnou koncovky, takže správnost je daná slovníkem.
const CJ_L=['A','B','C','D'];

// ---- shoda přísudku s podmětem: '_' = koncovka příčestí (honil_ -> honili) ----
const CJ_ROD={mzi:{n:'rodu mužského životného',e:'i',w:'y'},mzn:{n:'rodu mužského neživotného',e:'y',w:'i'},z:{n:'rodu ženského',e:'y',w:'i'},s:{n:'rodu středního',e:'a',w:'y'}};

const shodaFill=(u,ok)=>u.t.replace(/_/g,ok?CJ_ROD[u.r].e:CJ_ROD[u.r].w);
const shodaWords=(u,ok)=>(u.t.match(/[\p{L}]+_/gu)||[]).map(w=>w.replace('_',ok?CJ_ROD[u.r].e:CJ_ROD[u.r].w));
const shodaWhy=u=>u.x||`Podmět ${u.p} je ${CJ_ROD[u.r].n}, proto -${CJ_ROD[u.r].e}.`;
const memneFill=(u,ok)=>u.t.replace('_',ok?u.k:(u.k==='mně'?'mě':'mně'));
const memneTest=u=>u.z||u.t.replace('_',u.k==='mně'?'tobě':'tebe');
const memneWhy=u=>u.x||`Zkouška: „${memneTest(u)}“ Sedí ${u.k==='mně'?'tobě':'tebe'}, to je ${u.d}. pád, proto ${u.k}.`;

// vybere 4 různé věty; na úrovni 2 aspoň jednu past; ok(u) = podmínka pestrosti výběru
function cjPick(pool,level,ok){
  const base=pool.filter(u=>!u.x),traps=pool.filter(u=>u.x);
  for(let t=0;t<200;t++){
    const n=level===2?ri(1,2):0,sel=[];
    while(sel.length<4){const u=pick(sel.length<n?traps:base);if(!sel.includes(u))sel.push(u)}
    for(let i=sel.length-1;i>0;i--){const j=ri(0,i);[sel[i],sel[j]]=[sel[j],sel[i]]}
    if(!ok||ok(sel))return sel;
  }
  throw new Error('Nepodařilo se vybrat věty.');
}

// společná úloha A–D: mode 'chyba' = právě jedna věta je špatně, 'spravne' = právě jedna je dobře
function cjMC(sel,cfg){
  const mode=pick(['chyba','spravne']),odd=ri(0,3);
  const good=i=>mode==='chyba'?i!==odd:i===odd;
  const opts={},chyby={},steps=[];
  sel.forEach((u,i)=>{
    const k=CJ_L[i],ok=good(i);opts[k]=escT(cfg.fill(u,ok));
    const fix=cfg.words(u,true).map(K).join(', ');
    steps.push(S(`<b>${k})</b> ${ok?'Správně.':X('Chyba.')} ${escT(cfg.why(u))}${ok?'':` Správně: ${fix}.`}`));
    if(i!==odd)chyby[k]={rada:ok?`Věta ${k} je napsaná správně. ${cfg.why(u)}`:`Ve větě ${k} je chyba. ${cfg.why(u)}`};
  });
  const u=sel[odd],ans=CJ_L[odd];
  const p={kind:'mc',subj:'cj',opts,chyby,ans,sol:ans,mode,
    task:mode==='chyba'?cfg.taskChyba:cfg.taskSpravne,
    prompt:`<span class="txt cj"><span class="opts">${CJ_L.map(k=>`<span><b>${k})</b> ${opts[k]}</span>`).join('')}</span></span>`,
    steps:[H(cfg.head),...steps],
    solH:mode==='chyba'?`${ans}) ${opts[ans]} Správně: ${escT(cfg.fill(u,true))}`:`${ans}) ${opts[ans]}`,
    hint:'Klepni na písmeno a pak na Zkontrolovat. Každou větu si přečti celou.',
    trap:cfg.trap,guide:cfg.guide};
  p.plain=CJ_L.map(k=>`${k}) ${cfg.fill(sel[CJ_L.indexOf(k)],good(CJ_L.indexOf(k)))}`).join(' ');
  return p;
}
function genShoda(level){
  // aspoň tři různé rody, ať se nedá hádat podle jednoho
  const sel=cjPick(SHODA,level,s=>new Set(s.map(u=>u.r)).size>=3);
  return cjMC(sel,{fill:shodaFill,words:shodaWords,why:shodaWhy,guide:'cj-shoda',
    taskChyba:'Ve které z následujících vět je chyba ve shodě přísudku s podmětem?',
    taskSpravne:'Která z následujících vět je napsaná pravopisně správně?',
    head:'Najdi podmět (kdo, co?) a urči jeho rod.',
    trap:'Nejdřív najdi podmět a urči rod. Pozor na děti (ty děti → -y), lidi (ti lidé → -i) a děvčata (ta děvčata → -a).'});
}
function genMeMne(level){
  // obě podoby ve výběru, jinak by stačilo hádat
  const sel=cjPick(MEMNE,level,s=>s.some(u=>u.k==='mě')&&s.some(u=>u.k==='mně'));
  return cjMC(sel,{fill:memneFill,words:u=>[u.k],why:memneWhy,guide:'cj-memne',
    taskChyba:'Ve které z následujících vět je chyba v zápisu mě / mně?',
    taskSpravne:'Která z následujících vět je napsaná pravopisně správně?',
    head:'Dosaď tebe, nebo tobě. Kde jde tobě, píše se mně. Kde jde tebe, píše se mě.',
    trap:'Dosaď do věty tebe, nebo tobě. Tobě → mně (3. a 6. pád), tebe → mě (2. a 4. pád).'});
}
