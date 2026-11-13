'use strict';
// Testy CERMAT: seznam, nahrávání, průchod testem a bodování.

// ---------- Testy CERMAT ----------
// Oficiální testy nejsou součástí aplikace (autorská práva CERMAT). Uživatel je do telefonu nahraje sám:
// složku cermat-tau/cestina (matematika) přetáhne do telefonu a tady ji vybere, nebo ji pošle přes adb.
// Aplikace je čte z /cermat/{předmět}/… (v Androidu soukromá složka aplikace, na webu složka cermat/ vedle stránky).
const CM_BASE=window.AndroidCfg?'/cermat/':'cermat/';
const CM_SUBJ={mat:'matematika',cj:'cestina'};
const CM_TERM={RT1:'1. řádný termín',RT2:'2. řádný termín',NT1:'1. náhradní termín',NT2:'2. náhradní termín'};
const CM_TERM_ORDER=['RT1','RT2','NT1','NT2'];
const cm={list:null,key:null,groups:[],i:0,ans:{},res:{},importing:false};
const cmEsc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cmDir=()=>CM_BASE+CM_SUBJ[subject]+'/';
const cmUrl=u=>u&&u.startsWith('/uploads/')?cmDir()+'obrazky/'+u.slice(9):u;
const cmImg=(u,alt)=>u?`<img class="cm-img" loading="lazy" src="${cmEsc(cmUrl(u))}" alt="${cmEsc(alt||'')}">`:'';
// HTML ze souborů CERMAT: bez skriptů a obsluh událostí.
// Pozor: výstup jde do setHTML() do app stránky. Odstraňujeme i base (přesměruje
// relativní URL), noscript a SMIL animate/set (href/javascript: umí nastavit
// až po sanitizaci). Tab/CR/LF prohlížeč z URL maže, tak je smazat i před testem
// na javascript: (obejití přes jav&#9;ascript:).
function cmClean(html){
  const t=document.createElement('template');t.innerHTML=String(html||'');
  t.content.querySelectorAll('script,iframe,object,embed,link,meta,style,form,base,noscript,animate,animateTransform,animateMotion,animateColor,set').forEach(e=>e.remove());
  t.content.querySelectorAll('*').forEach(e=>{for(const a of [...e.attributes]){
    const v=String(a.value).replace(/[\t\n\r\f]/g,'');
    if(/^on/i.test(a.name)||/^\s*(javascript|vbscript):/i.test(v))e.removeAttribute(a.name);
  }});
  return t.innerHTML;
}
const cmRich=x=>x==null?'':typeof x==='string'?cmEsc(x):(x.html?cmClean(x.html):cmEsc(x.text));
function cmBlocks(list,skip){
  return (list||[]).slice().sort((a,b)=>a.order-b.order).filter(b=>!skip||!skip.has(b.id)).map(b=>{
    const d=b.data||{};
    if(b.type==='image')return cmImg(d.url,d.alt);
    if(b.type==='task_type')return '';
    const h=d.html?cmClean(d.html):cmEsc(d.text||'');
    if(!h)return '';
    return `<div class="cm-${b.type==='heading'?'h':b.type==='note'?'n':'t'}">${h}</div>`;
  }).join('');
}
const cmNumKey=n=>String(n).split('.').map(x=>x.padStart(3,'0')).join('.');
const cmKeyName=k=>{const [r,t]=k.split('-');return `${r} · ${CM_TERM[t]||t}`};
function cmSaveRun(){store.cm=store.cm||{};store.cm[subject+':'+cm.key]={i:cm.i,ans:cm.ans,res:cm.res};save()}

// --- seznam testů a nahrávání ---
async function cmShowList(){
  cm.key=null;$('cmSheet').hidden=true;$('cmList').hidden=false;document.body.classList.remove('cm-open');
  let list=null;
  try{const r=await fetch(cmDir()+'prehled-testu.json',{cache:'no-store'});if(r.ok)list=await r.json()}catch(e){}
  cm.list=Array.isArray(list)?list.slice().sort((a,b)=>b.rok-a.rok||CM_TERM_ORDER.indexOf(a.termin)-CM_TERM_ORDER.indexOf(b.termin)):null;
  const subjName=L('matematiky','češtiny'),folder=CM_SUBJ[subject];
  let h='';
  if(cm.list&&cm.list.length){
    h+=`<p class="note">Oficiální testy z ${subjName} z aplikace CERMAT TAU. Řeš na papír, odpověď zadej sem a hned uvidíš správné řešení a zdůvodnění.</p><div class="cm-tests">`;
    for(const t of cm.list){
      const key=`${t.rok}-${t.termin}`,run=(store.cm||{})[subject+':'+key];
      const sc=run?cmScore(run.res):null;
      h+=`<button class="cm-test" type="button"\
 data-key="${cmEsc(key)}"><b>${cmEsc(cmKeyName(key))}</b><small>${sc&&sc.max?`${fmtPts(sc.pts)} z ${fmtPts(sc.max)} b`:run?'rozpracováno':'nezačato'}</small></button>`;
    }
    h+='</div>';
  }else{
    h+=`<div class="empty"><b>Testy z ${subjName} zatím nejsou v telefonu.</b> Do aplikace se nevkládají, nahraješ si je sama:<ol>
      <li>Připoj telefon k počítači kabelem a v telefonu zvol <b>Přenos souborů</b>.</li>
      <li>V počítači otevři složku <code>cermat-tau</code> a přetáhni složku <code>${folder}</code> do telefonu, třeba do složky <b>Download</b>.</li>
      <li>Tady klepni na <b>Nahrát testy</b> a vyber ve složce Download složku <code>${folder}</code>. Aplikace si testy zkopíruje k sobě, pak fungují i bez kabelu a bez internetu. Kopii v Download\
 pak můžeš smazat.</li></ol></div>`;
  }
  if(window.AndroidCfg&&AndroidCfg.cermatImport){
    h+=`<div class="actions"><button class="btn${cm.list?' ghost':''}" id="cmImport" type="button">${cm.list?'Nahrát znovu nebo aktualizovat':'Nahrát testy'}</button></div>
      <div class="cm-prog" id="cmProg" hidden><progress id="cmBar" max="1" value="0"></progress><span id="cmProgTxt"></span></div>`;
    let dir='';try{dir=AndroidCfg.cermatDir()}catch(e){}
    if(dir)h+=`<details class="cm-adb"><summary>Nahrání přes adb</summary><p class="note">Složka jde do telefonu poslat i příkazem:</p><pre>adb push\
 cermat-tau/${folder} ${cmEsc(dir)}/</pre></details>`;
  }else if(!cm.list){
    h+=`<p class="note">Ve webové verzi dej vedle stránky složku <code>cermat/${folder}</code> (kopii <code>cermat-tau/${folder}</code>) a otevři stránku přes webový server.</p>`;
  }
  setHTML($('cmList'),h);
  $('cmList').querySelectorAll('.cm-test').forEach(b=>b.onclick=()=>cmOpen(b.dataset.key));
  if($('cmImport'))$('cmImport').onclick=()=>{
    if(cm.importing)return;
    if(!AndroidCfg.cermatImport()){cmProgShow('Nahrávání už běží.');return}
    cm.importing=true;$('cmImport').disabled=true;cmProgShow('Vyber složku s testy…');
  };
}
const fmtMB=b=>(b/1048576).toFixed(b<10485760?1:0).replace('.',',')+' MB';
function cmProgShow(txt,frac){
  const p=$('cmProg');if(!p)return;p.hidden=false;$('cmProgTxt').textContent=txt;
  const bar=$('cmBar');if(frac==null)bar.removeAttribute('value');else bar.value=frac;
}
// volá Android (MainActivity) během importu
window.cermatProgress=function(p){
  if(p.phase==='scan')cmProgShow('Hledám testy ve vybrané složce…');
  else if(p.phase==='copy')cmProgShow(`Kopíruji ${p.files} z ${p.totalFiles} souborů (${fmtMB(p.bytes)} z ${fmtMB(p.totalBytes)})`,p.totalBytes?p.bytes/p.totalBytes:null);
  else{
    cm.importing=false;if($('cmImport'))$('cmImport').disabled=false;
    if(p.phase==='done'){const s=String(p.subjects||'').split(',').map(x=>x==='cestina'?'čeština':x).join(', ');cmShowList().then(()=>cmProgShow(`Hotovo: ${s}. Testy jsou v telefonu.`,1))}
    else if(p.phase==='error')cmProgShow('Nepodařilo se: '+(p.msg||'neznámá chyba'));
    else cmProgShow('Nahrávání zrušeno.');
  }
};

// --- průchod testem ---
async function cmOpen(key){
  let data;
  try{const r=await fetch(cmDir()+'odpovedi/'+key+'.json');if(!r.ok)throw 0;data=await r.json()}
  catch(e){setHTML($('cmList'),`<div class="empty">Test ${cmEsc(cmKeyName(key))} se nepodařilo načíst. Nahraj testy znovu.</div>`);return}
  const groups=new Map();
  data.tasks.slice().sort((a,b)=>cmNumKey(a.taskNumber).localeCompare(cmNumKey(b.taskNumber))).forEach(t=>{
    const g=t.bundleNumber||String(t.taskNumber).split('.')[0];
    if(!groups.has(g))groups.set(g,{num:g,shared:t.bundleQuestionBlocks||[],tasks:[]});
    groups.get(g).tasks.push(t);
  });
  cm.key=key;cm.groups=[...groups.values()];
  const run=(store.cm||{})[subject+':'+key]||{};
  cm.i=Math.min(run.i||0,cm.groups.length-1);cm.ans=run.ans||{};cm.res=run.res||{};
  $('cmList').hidden=true;$('cmSheet').hidden=false;document.body.classList.add('cm-open');cmRender();
}
// tabulkou sady se boduje jen část skupiny: podúlohy s bundleScoringTable (třeba 3.1, 3.2), ostatní (3.3) zvlášť
const cmTab=g=>g.tasks.find(t=>t.bundleScoringTable);
const cmMax=g=>{const b=cmTab(g);return (b?(b.bundleMaxPoints||Math.max(...b.bundleScoringTable.map(e=>e.points))):0)+g.tasks.filter(t=>!t.bundleScoringTable).reduce((s,t)=>s+(t.maxPoints||0),0)};
function cmScore(res){let pts=0,max=0;for(const r of Object.values(res||{}))if(r&&r.checked){pts+=r.pts;max+=r.max}return{pts,max}}
const fmtPts=n=>String(Math.round(n*10)/10).replace('.',',');

function cmControl(t){
  const c=t.content||{},a=cm.ans[t.taskId],id=cmEsc(t.taskId);
  const btn=(v,lab,on)=>`<button type="button" class="mcbtn" data-t="${id}" data-v="${cmEsc(v)}" aria-pressed="${on}">${cmEsc(lab)}</button>`;
  switch(t.taskTypeCode){
    case 'ZMC':return `<span class="mcbox">${(c.options||[]).map(o=>btn(o.label,o.label,a===o.label)).join('')}</span>`;
    case 'ZDC':return `<span class="mcbox">${btn('1',c.trueLabel||'ANO',a==='1')}${btn('0',c.falseLabel||'NE',a==='0')}</span>`;
    case 'ZPC':{
      const alts=(c.alternatives||[]).map(o=>o.label);
      return (c.assignments||[]).map(s=>{const lab=(s.text||'').match(/^(\S+?)\)/)?.[1]||s.label;
        return `<label class="cm-row">${cmEsc(lab)} → <select data-t="${id}" data-k="${cmEsc(s.label)}"><option value=""></option>${alts.map(x=>`<option${(a||{
          })[s.label]===x?' selected':''}>${cmEsc(x)}</option>`).join('')}</select></label>`}).join('');
    }
    case 'ZUS':{
      const labs=(c.items||[]).map(o=>o.label);
      return `<div class="cm-order">${labs.map((_,
        i)=>`<label>${i+1}. <select data-t="${id}" data-k="${i}"><option value=""></option>${labs.map(x=>`<option${(a||[])[i]===x?'\
 selected':''}>${cmEsc(x)}</option>`).join('')}</select></label>`).join('')}</div>`;
    }
    case 'OUP':return `<label class="cm-row">${cmRich(c.prefix)} <input type="text" data-t="${id}" value="${cmEsc(a||'')}" autocomplete="off" spellcheck="false"\
 autocapitalize="off"> ${cmRich(c.suffix)}</label>`;
    case 'PRA':{
      const n=(t.correctAnswer.corrections||[]).length||c.numberOfCorrections||1;
      return Array.from({length:n},(_,i)=>{const f=(c.fieldLabels||[])[i]||{};
        return `<label class="cm-row">${cmRich(f.prefix)} <input type="text" data-t="${id}" data-k="${i}" value="${cmEsc((a||[])[i]||'')}" autocomplete="off" spellcheck="false"\
 autocapitalize="off"> ${cmRich(f.suffix)}</label>`}).join('');
    }
    case 'OSS':return '<p class="note">Úlohu vyřeš na papír i s postupem. Po kontrole ji ohodnoť podle bodovacího klíče.</p>';
    default:return '';
  }
}
function cmQuestion(t,skip){
  const c=t.content||{};let h=cmBlocks(t.questionBlocks,skip);
  const opt=o=>`<div class="cm-opt"><b>${cmEsc(o.label)})</b> ${o.textHtml?cmClean(o.textHtml):cmEsc(o.text)}${cmImg(o.imageUrl,o.imageAlt)}</div>`;
  if(c.options)h+=c.options.map(opt).join('');
  if(c.assignments)h+=c.assignments.map(o=>`<div class="cm-opt">${o.textHtml?cmClean(o.textHtml):cmEsc(o.text)}${cmImg(o.imageUrl,o.imageAlt)}</div>`).join('');
  if(c.alternatives)h+='<hr>'+c.alternatives.map(opt).join('');
  if(c.items)h+=c.items.map(o=>`<div class="cm-opt">${o.textHtml?cmClean(o.textHtml):cmEsc(o.text)}</div>`).join('');
  return h;
}
// porovnání textové odpovědi podle pravidel z klíče TAU
function cmNorm(s,r){
  s=String(s??'');if(r.trimWhitespace!==false)s=s.trim();
  if(r.stripAllSpaces)s=s.replace(/\s+/g,'');else s=s.replace(/\s+/g,' ');
  s=s.replace(/[−–]/g,'-');if(!r.caseSensitive)s=s.toLocaleLowerCase('cs');return s;
}
function cmMatch(input,expected,variants,r){
  const ins=cmNorm(input,r);if(!ins)return false;
  const all=[expected,...(variants||[])];
  if(r.compareAsNumber){const num=x=>{const v=parseFloat(cmNorm(x,{...r,stripAllSpaces:true}).replace(',','.'));return isNaN(v)?null:v};
    const v=num(ins);if(v!==null&&/^-?[\d\s]+([.,]\d+)?$/.test(ins.trim()))return all.some(e=>{const ev=num(e);return ev!==null&&Math.abs(ev-v)<=(r.numericPrecision||1e-9)})}
  return all.some(e=>cmNorm(e,r)===ins);
}
const cmTable=(tab,score)=>{const e=(Array.isArray(tab)?tab:tab&&tab.entries)||[];if(!e.length)return null;const m=Math.max(...e.map(x=>x.score));const s=Math.min(score,m);
  const hit=e.find(x=>x.score===s);return hit?hit.points:0};
// vyhodnotí podúlohu: ok (true/false/null), raw = body nebo počet do tabulky skupiny, pts = body bez tabulky
function cmEval(t){
  const a=cm.ans[t.taskId],ca=t.correctAnswer||{},max=t.maxPoints||0;
  switch(t.taskTypeCode){
    case 'ZMC':{const ok=a===ca.correctOption;return{ok,raw:+ok,pts:ok?max:0}}
    case 'ZDC':{const ok=a!=null&&(a==='1')===!!ca.value;return{ok,raw:+ok,pts:ok?max:0}}
    case 'ZPC':{const m=ca.mapping||{};const good=Object.entries(m).filter(([k,v])=>(a||{})[k]===v).length;
      const pts=Math.min(max,good*(ca.pointsPerPair||1));return{ok:good===Object.keys(m).length,raw:pts,pts}}
    case 'ZUS':{const ok=(ca.correctOrder||[]).every((x,i)=>(a||[])[i]===x);return{ok,raw:+ok,pts:ok?max:0}}
    case 'OUP':{const ok=cmMatch(a,ca.expectedAnswer,ca.acceptedVariants,ca);return{ok,raw:+ok,pts:ok?max:0}}
    case 'PRA':{
      const cor=ca.corrections||[],vals=(a||[]).map(x=>String(x||''));const used=new Set();let good=0;
      cor.forEach((k,i)=>{const r={...ca,...k};
        if(ca.orderSensitive){if(cmMatch(vals[i],k.correctForm,k.acceptedVariants,r)){good++;used.add(i)}}
        else{const j=vals.findIndex((v,jj)=>!used.has(jj)&&cmMatch(v,k.correctForm,k.acceptedVariants,r));if(j>=0){good++;used.add(j)}}});
      const wrong=vals.filter((v,j)=>v.trim()&&!used.has(j)).length;
      const tab=ca.scoringTable||t.taskScoringTable;
      const score=ca.errorScoring?(cor.length-good)+wrong:good;
      const pts=tab?cmTable(tab,score):(good===cor.length&&!wrong?max:0);
      return{ok:good===cor.length&&!wrong,raw:pts,pts}}
    case 'OSS':{const v=a==null?null:+a;return{ok:null,raw:v||0,pts:v||0,self:true}}
    default:return{ok:null,raw:0,pts:0};
  }
}
function cmCorrect(t){
  const c=t.content||{},a=t.correctAnswer||{};
  const vars=v=>v&&v.length?` <span class="var">(uznává se i: ${v.map(cmEsc).join(', ')})</span>`:'';
  switch(t.taskTypeCode){
    case 'ZMC':{const o=(c.options||[]).find(o=>o.label===a.correctOption);return `<b>${cmEsc(a.correctOption)})</b> ${o?(o.textHtml?cmClean(o.textHtml):cmEsc(o.text)):''}`}
    case 'ZDC':return `<b>${cmEsc(a.value?(c.trueLabel||'ANO'):(c.falseLabel||'NE'))}</b>`;
    case 'ZPC':{const asg=Object.fromEntries((c.assignments||[]).map(o=>[o.label,o]));
      return Object.entries(a.mapping||{}).map(([k,v])=>`${cmEsc((asg[k]?.text||'').match(/^(\S+?)\)/)?.[1]||k)} → <b>${cmEsc(v)}</b>`).join(', ')}
    case 'ZUS':return `<b>${(a.correctOrder||[]).map(cmEsc).join(' – ')}</b>`;
    case 'OUP':return `${cmRich(c.prefix)} <b>${cmEsc(a.expectedAnswer)}</b> ${cmRich(c.suffix)}${vars(a.acceptedVariants)}`;
    case 'PRA':return (a.corrections||[]).map((k,i)=>`${cmRich(((c.fieldLabels||[])[i]||{
      }).prefix)} <b>${cmEsc(k.correctForm)}</b>${vars(k.acceptedVariants)}`).join(', ')+(a.orderSensitive===false?' <span class="var">(na pořadí nezáleží)</span>':'');
    case 'OSS':return 'podle bodovacího klíče';
    default:return '';
  }
}
function cmRender(){
  const g=cm.groups[cm.i],res=cm.res[g.num],multi=g.tasks.length>1,sc=cmScore(cm.res);
  const doneN=Object.values(cm.res).filter(r=>r&&r.checked).length;
  let h=`<div class="sheet-head"><span><b>${cmEsc(cmKeyName(cm.key))}</b>\
 úloha ${cmEsc(g.num)} (${cm.i+1} z ${cm.groups.length})</span><span>${doneN?`${fmtPts(sc.pts)} z ${fmtPts(sc.max)} b`:''}</span></div>`;
  // Výchozí text (obrázek zadání) jde do vlastního sloupce: na tabletu na šířku zůstává vlevo, úlohy jsou vpravo.
  const byOrder=l=>(l||[]).slice().sort((a,b)=>a.order-b.order);
  let srcImgs=byOrder(g.shared).filter(b=>b.type==='image');
  const skip=new Set(srcImgs.map(b=>b.id));
  if(!srcImgs.length&&!multi){const qb=byOrder(g.tasks[0].questionBlocks);
    if(qb[0]&&qb[0].type==='image'&&qb.some(b=>b.type!=='image'&&b.type!=='task_type')){srcImgs=[qb[0]];skip.add(qb[0].id)}}
  const split=srcImgs.length>0;
  h+=`<div class="cm-q${split?' cm-split':''}">${split?`<div class="cm-src">${cmBlocks(srcImgs)}</div>`:''}<div class="cm-tasks">${cmBlocks(g.shared,skip)}`;
  for(const t of g.tasks){
    const r=res&&res.checked?res.per[t.taskId]:null;
    h+=`<div class="cm-task${r?(r.ok===true?' ok':r.ok===false?' bad':''):''}">${multi?`<span class="cm-num">${cmEsc(t.taskNumber)}</span>`:''}${cmQuestion(t,
      skip)}<div class="cm-ans">${cmControl(t)}</div>`;
    if(r){
      if(t.taskTypeCode==='OSS'){
        const lv=((t.content||{}).rubricLevels||[]).slice().sort((x,y)=>y.points-x.points);
        h+=`<div class="cm-sol">${lv.map(l=>`<div class="cm-lv"><b>Bodovací klíč – ${l.points} b</b>${cmImg(l.imageUrl,'bodovací klíč')}</div>`).join('')}
          <div class="cm-self"><span>Kolik bodů ti dáš?</span> ${((t.correctAnswer||{}).validPoints||[0,
            1]).map(v=>`<button type="button" class="mcbtn" data-self="${cmEsc(t.taskId)}" data-v="${v}" aria-pressed="${String(cm.ans[t.taskId])===String(v)}">${v}</button>`).join('')}</div></div>`;
      }else h+=`<div class="cm-sol"><span class="${r.ok?'yes':'no'}">${r.ok?'Správně.':'Správně je:'}</span> ${r.ok?'':cmCorrect(t)}</div>`;
    }
    if(r&&t.solutionKeyUrl)h+=`<details class="cm-why"${multi?'':' open'}><summary>Řešení a zdůvodnění</summary>${cmImg(t.solutionKeyUrl,'řešení')}</details>`;
    h+='</div>';
  }
  if(res&&res.checked)h+=`<p class="fb ${res.pts===res.max?'ok':'neutral'}">Za úlohu ${fmtPts(res.pts)} z ${fmtPts(res.max)} b.${g.tasks.some(t=>t.taskTypeCode==='OSS')?' Body za postup si přiděl\
 podle klíče.':''}</p>`;
  h+=`<div class="actions">${res&&res.checked?'':'<button class="btn" type="button" id="cmCheck">Zkontrolovat</button>'}
    <button class="btn ghost" type="button" id="cmPrev"${cm.i?'':' disabled'}>Předchozí</button>
    <button class="btn ghost${res&&res.checked?' go':''}" type="button" id="cmNext">${cm.i<cm.groups.length-1?'Další úloha':'Výsledek testu'}</button>
    <button class="btn ghost" type="button" id="cmBack">Seznam testů</button></div></div></div>`;
  $('cmSheet').dataset.seed=cm.key+'-'+g.num;setHTML($('cmSheet'),h);drawPaper($('cmSheet'));
  const sh=$('cmSheet');
  sh.querySelectorAll('.mcbtn[data-t]').forEach(b=>b.onclick=()=>{if(res&&res.checked)return;cm.ans[b.dataset.t]=b.dataset.v;
    sh.querySelectorAll(`.mcbtn[data-t="${CSS.escape(b.dataset.t)}"]`).forEach(x=>x.setAttribute('aria-pressed',x===b))});
  sh.querySelectorAll('.mcbtn[data-self]').forEach(b=>b.onclick=()=>{cm.ans[b.dataset.self]=b.dataset.v;cmScoreGroup(g);cmSaveRun();cmRender()});
  sh.querySelectorAll('select[data-t],input[data-t]').forEach(el=>{
    if(res&&res.checked)el.disabled=true;
    el.oninput=el.onchange=()=>{const t=g.tasks.find(x=>x.taskId===el.dataset.t);const k=el.dataset.k;
      if(k==null)cm.ans[t.taskId]=el.value;
      else if(t.taskTypeCode==='ZPC'){cm.ans[t.taskId]={...(cm.ans[t.taskId]||{}),[k]:el.value}}
      else{const arr=(cm.ans[t.taskId]||[]).slice();arr[+k]=el.value;cm.ans[t.taskId]=arr}};
  });
  if($('cmCheck'))$('cmCheck').onclick=()=>{cmScoreGroup(g);cmSaveRun();cmRender()};
  $('cmPrev').onclick=()=>{cm.i--;cmSaveRun();cmRender();sh.scrollIntoView()};
  $('cmNext').onclick=()=>{if(cm.i<cm.groups.length-1){cm.i++;cmSaveRun();cmRender();sh.scrollIntoView()}else cmSummary()};
  $('cmBack').onclick=()=>{cmSaveRun();cmShowList()};
}
function cmScoreGroup(g){
  const per={};let pts=0,raw=0;const b=cmTab(g);
  for(const t of g.tasks){const r=cmEval(t);per[t.taskId]=r;if(t.bundleScoringTable)raw+=r.raw;else pts+=r.pts}
  if(b)pts+=cmTable(b.bundleScoringTable,raw);
  cm.res[g.num]={checked:true,per,pts,max:cmMax(g)};
}
function cmSummary(){
  const sc=cmScore(cm.res),n=cm.groups.filter(g=>!(cm.res[g.num]&&cm.res[g.num].checked)).length;
  setHTML($('cmSheet'),`<h2>${cmEsc(cmKeyName(cm.key))}</h2><p class="big">${fmtPts(sc.pts)} z ${fmtPts(sc.max)} b</p>
    <p>${n?`Nezkontrolovaných úloh: ${n}. `:''}Body jsou podle klíče CERMAT TAU. U úloh s postupem jsou to body, které sis přidělila sama.</p>
    <div class="actions"><button class="btn" type="button" id="cmAgain">Začít test znovu</button><button class="btn ghost" type="button" id="cmBack2">Seznam testů</button></div>`);
  $('cmAgain').onclick=()=>{cm.i=0;cm.ans={};cm.res={};cmSaveRun();cmRender()};
  $('cmBack2').onclick=()=>cmShowList();
}
