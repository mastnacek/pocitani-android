'use strict';
// Generátor slovních úloh (data SLOVNI jsou v js/data/slovni.js) a formátování pro ně.

const JMENA={f:['Ája','Bára','Eliška','Ema','Jana','Klára','Lucie','Nela','Petra','Tereza','Adéla','Karolína','Zuzana','Marie'],
  m:['Adam','Filip','Jakub','Jirka','Martin','Matěj','Ondra','Petr','Tomáš','Vojta','David','Lukáš','Šimon','Honza']};
const fmtExpr=e=>String(e).replace(/\d+(?:\.\d+)?/g,m=>fmtNum(+m)).replace(/\*/g,' · ').replace(/\//g,' : ').replace(/-/g,' '+MINUS+' ').replace(/\+/g,' + ').replace(/\s+/g,' ').replace(/\( /g,
  '(').replace(/ \)/g,')').trim();
const toFr=v=>{if(typeof v==='string'){const m=/^\s*(-?\d+)\s*\/\s*(\d+)\s*$/.exec(v);return m?Fr(+m[1],+m[2]):null}return F.dec(String(v))};
function fmtOpt(v,unit){
  if(typeof v==='string'){const f=toFr(v);return f?fracH(f):escT(v)}
  return fmtNum(v)+(unit?' '+escT(unit):'');
}
// zadání slovní úlohy; po chybě s podtrženou frází, kterou žák nejspíš přehlédl
function slovniPrompt(p,pod){
  let t=escT(p.text),q=escT(p.otazka);
  if(pod){const ep=escT(pod);const mark=s=>s.includes(ep)?s.replace(ep,`<mark class="pod">${ep}</mark>`):s;if(t.includes(ep))t=mark(t);else q=mark(q)}
  const opts=p.kind==='mc'?`<span class="opts">${Object.entries(p.opts).map(([k,h])=>`<span><b>${k})</b> ${h}</span>`).join('')}</span>`:'';
  return `<span class="txt">${t}<br><b>${q}</b>${opts}</span>`;
}
const slovniPosledni=[];
function genSlovni(level){
  if(!SLOVNI.length)throw new Error('Chybí data slovních úloh.');
  let u;for(let t=0;t<60;t++){u=pick(SLOVNI);if(!slovniPosledni.includes(u.id))break}
  slovniPosledni.push(u.id);if(slovniPosledni.length>Math.min(20,SLOVNI.length-1))slovniPosledni.shift();
  // personalizace: jména se dosazují jen v 1. pádě a podle rodu, matematika zůstává stejná
  const map={};
  for(const [k,o] of Object.entries(u.osoby||{})){const pool=JMENA[o.rod].filter(j=>!Object.values(map).includes(j));map[k]=pick(pool)}
  const sub=s=>String(s||'').replace(/\{(\w+)\}/g,(m,k)=>map[k]||m);
  const unit=u.odpoved.jednotka||'',mc=level===1;
  const chyby={};
  for(const [l,c] of Object.entries(u.chyby||{}))chyby[l]={rada:sub(c.rada),pod:sub(c.podtrhnout),fr:typeof u.moznosti[l]==='number'||/\//.test(u.moznosti[l])?toFr(u.moznosti[l]):null};
  const opts={};for(const [l,v] of Object.entries(u.moznosti))opts[l]=fmtOpt(v,unit);
  const p={kind:mc?'mc':'num',slovni:u.id,text:sub(u.text),otazka:sub(u.otazka),unit:true,unitTxt:unit,opts,chyby,
    ans:mc?u.spravne:toFr(u.odpoved.zobrazeni||u.odpoved.hodnota),
    task:mc?'Vyberte správnou odpověď. Na papír si úlohu spočítejte, nebo dosaďte možnosti do zadání.':'Vypočtěte. Napište jen číslo, jednotku nepište.',
    steps:u.postup.map(k=>S(escT(sub(k.text)),k.vypocet?`${fmtExpr(k.vypocet)} = ${fmtNum(k.vysledek)}`:'')),
    trap:'Než začneš počítat, podtrhni si v zadání, na co se ptají a od čeho se počítá.'};
  const val=u.odpoved.zobrazeni?fracH(toFr(u.odpoved.zobrazeni)):fmtNum(u.odpoved.hodnota);
  p.prompt=slovniPrompt(p);p.plain=`${p.text} ${p.otazka}`;
  p.sol=mc?u.spravne:(u.odpoved.zobrazeni||String(u.odpoved.hodnota));
  p.solH=mc?`${u.spravne}) ${opts[u.spravne]}${u.spravne==='E'?` (výsledek je ${val}${unit?' '+escT(unit):''})`:''}`:`${val}${unit?' '+escT(unit):''}`;
  return p;
}
