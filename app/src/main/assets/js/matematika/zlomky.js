'use strict';
// Generátory: zlomky, složené zlomky, desetinná čísla, mocniny a odmocniny, procenta.

function genZlomky(level){
  for(let t=0;t<3000;t++){
    const tp=level===1?pick(['as','as','md']):pick(['p31','p31','prec','pm','dec','dec','intmul','brkint']);
    if(tp==='dec'){const a=rfr(9,10),c=rfr(9,10),k=ri(1,49);if(k%10===0)continue;const dv=Fr(k,10);const op1=pick(['+','-']),op2=pick(['+','-']);
      const s1=addSub(a,dv,op1);if(F.isZero(s1.res))continue;const s2=addSub(s1.res,c,op2);if(!okFr(s2.res,60))continue;
      return{kind:'num',fraction:true,ans:s2.res,task:TASKF,trap:`Desetinné číslo nejdřív převeď na zlomek. Výsledek musí být zlomek v základním tvaru, ${X('desetinné číslo by stálo bod')}.`,
        prompt:`${fracH(a)}${opS(op1)}${decStr(dv)}${opS(op2)}${fracH(c)} =`,
        steps:[S(`Desetinné číslo převedeme na zlomek. Zlomky a desetinná čísla ${K('se v jednom výpočtu nemíchají')}, všechno musí být ve stejném tvaru.`,`${decStr(dv)} = ${frBox(k,
          10)}${dv.d!==10?' = '+fracH(dv):''}`),H(`${op1==='+'?'Sečteme':'Odečteme'} první dvě čísla`),...s1.steps,H(`Pak ${op2==='+'?'přičteme':'odečteme'} třetí`),...s2.steps],
        plain:`${frP(a)}${op1}${decP(dv)}${op2}${frP(c)}`}}
    if(tp==='intmul'){const k=ri(2,6),m=ri(2,9),a=rfr(9,10),c=rfr(9,10);const m1=mulSteps(Fr(k),a),m2=mulSteps(c,Fr(m));const op=pick(['+','-']);const s1=addSub(m1.res,m2.res,op);if(!okFr(s1.res,
      60)||m1.res.d===1&&m2.res.d===1)continue;
      return{kind:'num',fraction:true,ans:s1.res,task:TASKF,trap:`Celé číslo násobí ${X('jen čitatel')}. A obě násobení mají přednost před sčítáním a odčítáním.`,
        prompt:`${k} · ${fracH(a)}${opS(op)}${fracH(c)} · ${m} =`,
        steps:[H('Nejdřív obě násobení, mají přednost'),...m1.steps,...m2.steps,H(`Teď výsledky ${op==='+'?'sečteme':'odečteme'}`),...s1.steps],plain:`${k}*${frP(a)}${op}${frP(c)}*${m}`}}
    if(tp==='brkint'){const a=rfr(9,10),c=rfr(7,9),e=rfr(7,8);const rev=Math.random()<0.4;const s1=rev?addSub(Fr(1),e,'-'):addSub(e,Fr(1),'-');if(F.isZero(s1.res))continue;const m=mulSteps(c,s1.res);
      let tail;if(m.res.n<0){const ab=F.abs(m.res);const s2=addSub(a,ab,'-');tail={res:s2.res,steps:[S(`${K('Přičíst záporné číslo je totéž jako ho odečíst.')}`,
        `${fracH(a)} + (${fracH(m.res)}) = ${fracH(a)} ${MINUS} ${fracH(ab)}`),...s2.steps]}}else{const s2=addSub(a,m.res,'+');tail={res:s2.res,steps:s2.steps}}
      if(!okFr(tail.res,60))continue;
      return{kind:'num',fraction:true,ans:tail.res,task:TASKF,trap:`Pořadí: závorka, násobení, nakonec sčítání. Pozor na znaménko, ${X('výsledek závorky může být záporný')}.`,
        prompt:`${fracH(a)} + ${fracH(c)} · (${rev?'1 '+MINUS+' '+fracH(e):fracH(e)+' '+MINUS+' 1'}) =`,
        steps:[H('Nejdřív závorka'),...s1.steps,H('Pak násobení, má přednost před sčítáním'),...m.steps,H('Nakonec sčítání'),...tail.steps],
          plain:`${frP(a)}+${frP(c)}*(${rev?'1-'+frP(e):frP(e)+'-1'})`}}
    if(tp==='as'){const a=rfr(9,12),b=rfr(9,12);if(a.d===b.d)continue;const op=pick(['+','-']);const s=addSub(a,b,op);if(!okFr(s.res,60))continue;
      return{kind:'num',fraction:true,ans:s.res,task:TASKF,trap:`${X('Jmenovatele se nikdy nesčítají ani neodčítají.')} Nejdřív společný jmenovatel, pak počítáš jen s čitateli.`,
        prompt:`${fracH(a)}${opS(op)}${fracH(b)} =`,steps:s.steps,plain:`${frP(a)}${op}${frP(b)}`}}
    if(tp==='md'){const a=rfr(9,12),b=rfr(9,12);const op=pick(['*',':']);const s=op==='*'?mulSteps(a,b):divSteps(a,b);if(!okFr(s.res,60)||s.res.d===1)continue;
      return{kind:'num',fraction:true,ans:s.res,task:TASKF,
        trap:op==='*'?`Při násobení ${X('společný jmenovatel nepotřebuješ')}. Krátit můžeš i do kříže před násobením.`:`Dělit zlomkem = násobit převrácenou hodnotou. ${X('Obrací se jen druhý\
 zlomek')}, první zůstává.`,prompt:`${fracH(a)} ${op==='*'?'·':':'} ${fracH(b)} =`,steps:s.steps,plain:`${frP(a)}${op}(${frP(b)})`}}
    if(tp==='p31'){const a=rfr(9,12),b=rfr(9,12);if(a.d===b.d)continue;const op=pick(['+','-']);const s=addSub(a,b,op);if(F.isZero(s.res))continue;const e=rfr(7,9);const op2=pick([':',':','*']);
      const m=op2===':'?divSteps(s.res,e):mulSteps(s.res,e);if(!okFr(m.res,50))continue;
      return{kind:'num',fraction:true,ans:m.res,task:TASKF,trap:`${X('Nejdřív závorka')}, pak dělení. Výsledek nakonec zkrať.`,
        prompt:`(${fracH(a)}${opS(op)}${fracH(b)}) ${op2==='*'?'·':':'} ${fracH(e)} =`,
        steps:[H('Nejdřív závorka, ta má vždycky přednost'),...s.steps,H(`Teď výsledek závorky ${op2===':'?'vydělíme':'vynásobíme'} zlomkem ${fracH(e)}`),...m.steps],
        plain:`(${frP(a)}${op}${frP(b)})${op2}(${frP(e)})`}}
    if(tp==='prec'){const a=rfr(9,12),c=rfr(8,10),e=rfr(8,10);const m=mulSteps(c,e);const op=pick(['+','-']);if(m.res.d===1)continue;const s=addSub(a,m.res,op);if(!okFr(s.res,60))continue;
      return{kind:'num',fraction:true,ans:s.res,task:TASKF,trap:`Násobení má přednost před sčítáním a odčítáním. ${X('Nepočítej zleva doprava.')}`,
        prompt:`${fracH(a)}${opS(op)}${fracH(c)} · ${fracH(e)} =`,
        steps:[H('Nejdřív násobení, má přednost před sčítáním a odčítáním'),...m.steps,H(`Teď ${op==='+'?'přičteme':'odečteme'} výsledek násobení`),...s.steps],
          plain:`${frP(a)}${op}${frP(c)}*${frP(e)}`}}
    if(tp==='pm'){const a=rfr(6,8),b=rfr(6,8),c=rfr(6,8),d=rfr(6,8);if(a.d===b.d||c.d===d.d)continue;const s1=addSub(a,b,'+'),s2=addSub(c,d,'-');if(F.isZero(s2.res))continue;const m=mulSteps(s1.res,
      s2.res);if(!okFr(m.res,40))continue;
      return{kind:'num',fraction:true,ans:m.res,task:TASKF,trap:`${X('Každou závorku spočítej zvlášť')}, až potom násob.`,prompt:`(${fracH(a)} + ${fracH(b)}) · (${fracH(c)} ${MINUS} ${fracH(d)}) =`,
        steps:[H('První závorka'),...s1.steps,H('Druhá závorka'),...s2.steps,H('Výsledky obou závorek vynásobíme'),...m.steps],plain:`(${frP(a)}+${frP(b)})*(${frP(c)}-${frP(d)})`}}
  }
}

// ---- složené zlomky
function blkSingle(){const a=rfr(9,12);return{html:fracH(a),plain:frP(a),val:a,steps:[],single:true}}
function blkInt(){const k=ri(2,9);return{html:`${k}`,plain:`${k}`,val:Fr(k),steps:[],single:true}}
function blkAddSub(){for(;;){const a=rfr(8,10),b=rfr(8,10);if(a.d===b.d)continue;const op=pick(['+','-']);const s=addSub(a,b,op);if(F.isZero(s.res))continue;return{
  html:`${fracH(a)}${opS(op)}${fracH(b)}`,plain:`${frP(a)}${op}${frP(b)}`,val:s.res,steps:s.steps}}}
function blkPowMul(){
  const p=pick([1,1,2]),r=ri(2,7),op=pick(['+','-']);
  const q=Fr(op==='+'?p*r+1:p*r-1,r);const sq=F.pow(q,2);
  const sqn=q.n*q.n;const divs=[];for(let i=2;i<=12;i++)if(sqn%i===0)divs.push(i);
  const m=r*pick([1,1,2]),n=divs.length&&Math.random()<0.8?pick(divs):ri(2,9);const mf=Fr(m,n);
  if(mf.d===1)return null;
  const ms=mulSteps(sq,mf);
  return{html:`(${p}${opS(op)}${frBox(1,r)})² · ${fracH(mf)}`,plain:`(${p}${op}1/${r})^2*${frP(mf)}`,val:ms.res,
    steps:[S(`Nejdřív závorka. Číslo ${p} zapíšeme jako zlomek se jmenovatelem ${r} (${p} = ${frBox(p*r,r)}) a ${op==='+'?'sečteme':'odečteme'} čitatele.`,`${p}${opS(op)}${frBox(1,r)} = ${rawH(p*r,
      r)}${opS(op)}${frBox(1,r)} = ${fracH(q)}`),
      S(`Zlomek umocníme na druhou: na druhou umocníme ${K('zvlášť čitatel a zvlášť jmenovatel')}.`,`(${fracH(q)})² = ${frBox(q.n+'²',q.d+'²')} = ${fracH(sq)}`),...ms.steps]}
}
function blkAddMul(){const a=rfr(6,8),c=rfr(6,8),e=rfr(6,8);const m=mulSteps(c,e);const op=pick(['+','-']);if(m.res.d===1)return null;const s=addSub(a,m.res,op);if(F.isZero(s.res))return null;
  return{html:`${fracH(a)}${opS(op)}${fracH(c)} · ${fracH(e)}`,plain:`${frP(a)}${op}${frP(c)}*${frP(e)}`,val:s.res,
    steps:[S(`${K('Násobení má přednost')} před sčítáním a odčítáním, takže začneme jím.`),...m.steps,...s.steps]}}
function blkRootSq(){const s=ri(2,10),t=ri(2,4),u=ri(2,9),Tt=t*t;if(Tt%u===0||gcd(Tt,u)>1)return null;const op=pick(['-','+']);const r=addSub(Fr(s),Fr(Tt,u),op);if(F.isZero(r.res))return null;
  return{html:`√<span class="ov">${s*s}</span>${opS(op)}${frBox(t+'²',u)}`,plain:`√${s*s}${op}${t}^2/${u}`,val:r.res,
    steps:[S(`${K('Nejdřív odmocnina a mocnina.')} Odmocnina z ${s*s} je ${s}, protože ${s} · ${s} = ${s*s}. A ${t}² = ${t} · ${t} = ${Tt}.`,`√${s*s} = ${s}${SEP}${frBox(t+'²',u)} = ${frBox(Tt,u)}`),
      ...r.steps]}}
function blkRootFrac(){const a=ri(1,6),b=ri(2,9);if(gcd(a,b)>1)return null;const c=rfr(6,8);const op=pick(['+','-']);const r=addSub(Fr(a,b),c,op);if(F.isZero(r.res))return null;
  return{html:`√<span class="ov">${frBox(a*a,b*b)}</span>${opS(op)}${fracH(c)}`,plain:`√(${a*a}/${b*b})${op}${frP(c)}`,val:r.res,
    steps:[S(`Odmocninu ze zlomku spočítáme tak, že ${K('odmocníme zvlášť čitatel a zvlášť jmenovatel')}: √${a*a} = ${a} a √${b*b} = ${b}.`,`√<span class="ov">${frBox(a*a,b*b)}</span> = ${frBox(a,
      b)}`),...r.steps]}}
function blkIntMinus(){const k=ri(1,5),f=rfr(7,9);const op=pick(['-','+']);const r=addSub(Fr(k),f,op);if(F.isZero(r.res))return null;return{html:`${k}${opS(op)}${fracH(f)}`,plain:`${k}${op}${frP(f)}`,
  val:r.res,steps:r.steps}}
function blkDecMix(){const a=rfr(7,9),c=rfr(7,9),k=ri(11,49);if(k%10===0)return null;const dv=Fr(k,10);const op2=pick(['+','-']);const s1=addSub(a,dv,'+');const s2=addSub(s1.res,c,op2);
  if(F.isZero(s2.res))return null;
  return{html:`${fracH(a)} + ${decStr(dv)}${opS(op2)}${fracH(c)}`,plain:`${frP(a)}+${decP(dv)}${op2}${frP(c)}`,val:s2.res,steps:[S(`Desetinné číslo ${K('převedeme na zlomek')}, se zlomky se nemíchá.`,
    `${decStr(dv)} = ${frBox(k,10)}${dv.d!==10?' = '+fracH(dv):''}`),...s1.steps,...s2.steps]}}
function blkDec(){const k=ri(1,9);const dv=Fr(k,10);return{html:decStr(dv),plain:decP(dv),val:dv,steps:[S(`Desetinné číslo ${K('převedeme na zlomek')}.`,`${decStr(dv)} = ${frBox(k,
  10)}${dv.d!==10?' = '+fracH(dv):''}`)]}}
function blkDivNeg(){const a=rfr(7,8),b=rfr(7,8);if(a.d===b.d)return null;const s=addSub(a,b,'-');if(F.isZero(s.res))return null;const e=rfr(6,7);const d=divSteps(s.res,F.neg(e));
  return{html:`(${fracH(a)} ${MINUS} ${fracH(b)}) : (${MINUS}${fracH(e)})`,plain:`(${frP(a)}-${frP(b)}):(-${frP(e)})`,val:d.res,steps:[S('Nejdřív závorka.'),...s.steps,
    S(`Pak dělení. Dělíme záporným číslem, tak ${X('hlídej znaménko výsledku')}.`),...d.steps]}}
function genSlozene(level){
  for(let t=0;t<5000;t++){
    let N,D;
    if(level===1){N=pick([blkAddSub,blkSingle])();D=N.single?blkAddSub():pick([blkSingle,blkInt,blkAddSub])()}
    else{N=pick([blkPowMul,blkPowMul,blkAddMul,blkDecMix,blkDivNeg])();D=pick([blkRootSq,blkRootSq,blkRootFrac,blkIntMinus,blkDec,blkAddSub])()}
    if(!N||!D||F.isZero(D.val)||F.isZero(N.val))continue;
    const d=divSteps(N.val,D.val);if(!okFr(d.res,level===1?40:30))continue;
    const steps=[S(`Složený zlomek počítáme po částech: ${K('nejdřív zvlášť všechno nad hlavní zlomkovou čarou, pak zvlášť všechno pod ní')}, a nakonec obojí vydělíme.`)];
    if(N.steps.length)steps.push(H('Čitatel (nad hlavní čarou)'),...N.steps);
    if(D.steps.length)steps.push(H('Jmenovatel (pod hlavní čarou)'),...D.steps);
    steps.push(H(`Teď máme ${fracH(N.val)} nad čarou a ${fracH(D.val)} pod čarou. Hlavní zlomková čára znamená dělení`),...d.steps);
    return{kind:'num',fraction:true,ans:d.res,trap:`Počítej zvlášť čitatel (nahoře) a zvlášť jmenovatel (dole), pak vyděl. ${X('Výraz nikdy nenásob společným jmenovatelem')}, to je 0 bodů.`,
      task:'Vypočtěte a výsledek zapište zlomkem v základním tvaru. Na papír piš celý postup.',
      prompt:`<span class="fr big"><span>${N.html}</span><span>${D.html}</span></span> =`,steps,plain:`(${N.plain})/(${D.plain})`};
  }
}

// ---- desetinná čísla
const d1=(a,b)=>Fr(ri(a,b),10);
function genDesetinna(level){
  const divs=[Fr(2),Fr(4),Fr(5),Fr(1,2),Fr(1,5),Fr(2,5),Fr(1,4),Fr(3,10)];
  for(let t=0;t<3000;t++){
    const tp=level===1?pick(['abc','aqv','abpc']):pick(['xyzwv','xyvwz','xyzwv']);
    const task='Vypočtěte. Dodržuj přednost operací.';
    if(tp==='abc'){const a=d1(5,99),b=pick([Fr(ri(2,9)),d1(2,19)]),c=d1(2,59);const op=pick(['+','-']);const m=F.mul(b,c),r=op==='+'?F.add(a,m):F.sub(a,m);
      return{kind:'num',ans:r,task,prompt:`${decStr(a)}${opS(op)}${decStr(b)} · ${decStr(c)} =`,steps:[`${K('Násobení má přednost')}: ${decStr(b)} · ${decStr(c)} = ${decStr(m)}`,
        `${decStr(a)}${opS(op)}${decStr(m)} = ${N(decStr(r))}`],plain:`${decP(a)}${op}${decP(b)}*${decP(c)}`}}
    if(tp==='aqv'){const v=pick(divs),q=d1(2,40),w=F.mul(q,v),a=d1(5,99);const op=pick(['+','-']);const r=op==='+'?F.add(a,q):F.sub(a,q);
      return{kind:'num',ans:r,task,prompt:`${decStr(a)}${opS(op)}${decStr(w)} : ${decStr(v)} =`,steps:[`${K('Dělení má přednost')}: ${decStr(w)} : ${decStr(v)} = ${decStr(q)}`,
        `${decStr(a)}${opS(op)}${decStr(q)} = ${N(decStr(r))}`],plain:`${decP(a)}${op}${decP(w)}:${decP(v)}`}}
    if(tp==='abpc'){const a=pick([Fr(ri(2,9)),d1(2,9)]),b=d1(10,60),c=d1(2,40);const op=pick(['+','-']);const s=op==='+'?F.add(b,c):F.sub(b,c);const r=F.mul(a,s);
      return{kind:'num',ans:r,task,prompt:`${decStr(a)} · (${decStr(b)}${opS(op)}${decStr(c)}) =`,steps:[`${K('Nejdřív závorka')}: ${decStr(b)}${opS(op)}${decStr(c)} = ${decStr(s)}`,
        `${decStr(a)} · ${decHp(s)} = ${N(decStr(r))}`],plain:`${decP(a)}*(${decP(b)}${op}${decP(c)})`}}
    if(tp==='xyzwv'){const x=d1(2,9),y=d1(5,60),z=d1(5,60);const s=F.sub(y,z);if(F.isZero(s))continue;const m=F.mul(x,s);const v=pick(divs),q=d1(2,30),w=F.mul(q,v);const op=pick(['+','-']);
      const r=op==='+'?F.add(m,q):F.sub(m,q);
      return{kind:'num',ans:r,task,prompt:`${decStr(x)} · (${decStr(y)} ${MINUS} ${decStr(z)})${opS(op)}${decStr(w)} : ${decStr(v)} =`,
        steps:[`${K('Nejdřív závorka')}: ${decStr(y)} ${MINUS} ${decStr(z)} = ${decStr(s)}`,
          `Pak násobení a dělení: ${decStr(x)} · ${decHp(s)} = ${decStr(m)} a ${decStr(w)} : ${decStr(v)} = ${decStr(q)}`,`Nakonec: ${decStr(m)}${opS(op)}${decStr(q)} = ${N(decStr(r))}`],
        plain:`${decP(x)}*(${decP(y)}-${decP(z)})${op}${decP(w)}:${decP(v)}`}}
    if(tp==='xyvwz'){const v=pick(divs),q=d1(-30,40);if(F.isZero(q))continue;const y=d1(2,50),x=F.add(F.mul(q,v),y);if(x.n<=0)continue;const w=d1(2,9),z=d1(2,30),m=F.mul(w,z),r=F.sub(q,m);
      const xy=F.sub(x,y);
      return{kind:'num',ans:r,task,prompt:`(${decStr(x)} ${MINUS} ${decStr(y)}) : ${decStr(v)} ${MINUS} ${decStr(w)} · ${decStr(z)} =`,
        steps:[`${K('Nejdřív závorka')}: ${decStr(x)} ${MINUS} ${decStr(y)} = ${decStr(xy)}`,
          `Pak dělení a násobení: ${decHp(xy)} : ${decStr(v)} = ${decStr(q)} a ${decStr(w)} · ${decStr(z)} = ${decStr(m)}`,`Nakonec: ${decStr(q)} ${MINUS} ${decStr(m)} = ${N(decStr(r))}`],
        plain:`(${decP(x)}-${decP(y)}):${decP(v)}-${decP(w)}*${decP(z)}`}}
  }
}

// ---- mocniny a odmocniny
const MT={
  sq:()=>{const k=ri(2,15);return{html:`${k}²`,plain:`${k}^2`,val:Fr(k*k),expl:`${k}² = ${k} · ${k} = ${k*k}`}},
  cube:()=>{const k=ri(2,5);return{html:`${k}³`,plain:`${k}^3`,val:Fr(k*k*k),expl:`${k}³ = ${k} · ${k} · ${k} = ${k*k*k}`}},
  root:()=>{const k=ri(2,20);return{html:`√<span class="ov">${k*k}</span>`,plain:`√${k*k}`,val:Fr(k),expl:`√${k*k} = ${k}, protože ${k}² = ${k*k}`}},
  negPar:()=>{const k=ri(2,9);return{html:`(${MINUS}${k})²`,plain:`(-${k})^2`,val:Fr(k*k),expl:`(${MINUS}${k})² = (${MINUS}${k}) · (${MINUS}${k}) = ${k*k}, ${K('mínus krát mínus je plus')}`}},
  negCube:()=>{const k=ri(2,4);return{html:`(${MINUS}${k})³`,plain:`(-${k})^3`,val:Fr(-k*k*k),
    expl:`(${MINUS}${k})³ = (${MINUS}${k}) · (${MINUS}${k}) · (${MINUS}${k}) = ${MINUS}${k*k*k}, ${K('lichá mocnina záporného čísla je záporná')}`}},
  prod:()=>{const c=ri(2,5),k=ri(2,6);return{html:`${c} · ${k}²`,plain:`${c}*${k}^2`,val:Fr(c*k*k),expl:`${K('nejdřív mocnina, pak násobení')}: ${c} · ${k}² = ${c} · ${k*k} = ${c*k*k}`}},
  fracSq:()=>{const f=rfr(6,7);const s=F.pow(f,2);return{html:`(${fracH(f)})²`,plain:`${frP(f)}^2`,val:s,expl:`(${fracH(f)})² = ${frBox(f.n+'²',f.d+'²')} = ${fracH(s)}`}},
  rootFrac:()=>{let a,b;do{a=ri(1,9);b=ri(2,10)}while(gcd(a,b)>1);return{html:`√<span class="ov">${frBox(a*a,b*b)}</span>`,plain:`√(${a*a}/${b*b})`,val:Fr(a,b),expl:`√<span class="ov">${frBox(a*a,
    b*b)}</span> = ${frBox(a,b)}, ${K('odmocníme zvlášť čitatel i jmenovatel')}`}},
  decSq:()=>{const k=ri(1,9),f=Fr(k,10),s=F.pow(f,2);return{html:`0,${k}²`,plain:`0.${k}^2`,val:s,expl:`0,${k}² = 0,${k} · 0,${k} = ${decStr(s)}, ${K('desetinná místa se sčítají')}`}},
  leadNeg:()=>{const k=ri(2,9);return{html:`${MINUS}${k}²`,plain:`-${k}^2`,val:Fr(-k*k),expl:`${MINUS}${k}² = ${MINUS}${k*k}. Pozor, ${X('mínus není v závorce, takže se nemocní')}`}}
};
function genMocniny(level){
  for(let t=0;t<2000;t++){
    let terms,fmt=numH,fmtP=numHp;
    if(level===1){terms=[0,1,2].map(()=>MT[pick(['sq','sq','root','root','cube'])]())}
    else{const g=pick(['int','int','frac','dec']);
      if(g==='int'){terms=[MT[pick(['leadNeg','root','sq','prod'])]()];for(let i=0;i<pick([2,3]);i++)terms.push(MT[pick(['negPar','negCube','root','prod','sq'])]())}
      else if(g==='frac'){fmt=fracH;fmtP=fracHp;terms=[MT.fracSq(),MT[pick(['rootFrac','root','fracSq'])]()];if(Math.random()<0.5)terms.push(MT.rootFrac())}
      else{terms=[MT.decSq(),MT[pick(['root','sq'])]()];if(Math.random()<0.5)terms.push(MT.decSq())}}
    const ops=terms.map((_,i)=>i===0?'+':pick(['+','-']));
    let res=Fr(0);terms.forEach((x,i)=>{res=ops[i]==='+'?F.add(res,x.val):F.sub(res,x.val)});
    if(Math.abs(res.n)>999||res.d>200)continue;
    if(fmt===numH&&decStr(res)===null){fmt=fracH;fmtP=fracHp}
    const prompt=terms.map((x,i)=>i===0?x.html:opS(ops[i])+x.html).join('')+' =';
    const plain=terms.map((x,i)=>i===0?x.plain:ops[i]+x.plain).join('');
    const sum=terms.map((x,i)=>i===0?fmt(x.val):opS(ops[i])+fmtP(x.val)).join('');
    return{kind:'num',ans:res,task:'Vypočtěte.',prompt,steps:terms.map(x=>x.expl).concat([`Dosadíme a spočítáme: ${sum} = ${N(fmt(res))}`]),plain,solFmt:fmt===fracH?'frac':'dec'};
  }
}

// ---- procenta
function genProcenta(level){
  const nice=[5,10,15,20,25,30,40,50,60,75,12,35,45,80];
  for(let t=0;t<3000;t++){
    const tp=level===1?pick(['cast','kolik','zvys','sniz']):pick(['cast','kolik','zcelku','puvodni','okolik','zvys']);
    if(tp==='cast'){const p=pick(nice);const base=100/gcd(p,100);const Z=base*ri(1,Math.floor(2000/base));if(Z<20)continue;const r=Z*p/100;const one=Fr(Z,100);
      const ctx=pick([`Kolik je ${p} % z ${Z}?`,`Ve škole je ${Z} žáků a ${p} % z nich dojíždí autobusem. Kolik žáků dojíždí?`,
        `Nemocnice má ${Z} lůžek, ${p} % z nich je na interně. Kolik lůžek je na interně?`]);
      return{kind:'num',unit:true,ans:Fr(r),task:'Vypočtěte.',prompt:`<span class="txt">${ctx}</span>`,steps:[`1 % z ${Z} je ${Z} : 100 = ${decStr(one)}`,`${p} % je ${p} · ${decStr(one)} = ${N(r)}`,
        `Jinak: ${p} % = ${decStr(Fr(p,100))}, takže ${decStr(Fr(p,100))} · ${Z} = ${r}`]}}
    if(tp==='kolik'){const B=pick([20,25,40,50,80,120,150,200,250,300,400,500,800]);const opts=[];for(let p=5;p<=95;p+=5)if(B*p%100===0)opts.push(p);const p=pick(opts);const A=B*p/100;
      const ctx=pick([`Kolik procent je ${A} z ${B}?`,`V testu bylo ${B} bodů a Bára získala ${A}. Kolik procent bodů získala?`]);
      return{kind:'num',unit:true,ans:Fr(p),task:'Vypočtěte.',prompt:`<span class="txt">${ctx}</span>`,steps:[`${K('Část vydělíme celkem')}: ${A} : ${B} = ${decStr(Fr(A,B))}`,`${decStr(Fr(A,
        B))} je ${N(p+' %')}, protože ${K('1 = 100 %')}`]}}
    if(tp==='zvys'||tp==='sniz'){const p=pick(nice);const base=100/gcd(p,100);const Z=base*ri(1,Math.floor(3000/base));if(Z<50)continue;const ch=Z*p/100;const r=tp==='zvys'?Z+ch:Z-ch;
      const ctx=tp==='zvys'?`Cena ${Z} Kč se zvýšila o ${p} %. Kolik korun stojí zboží teď?`:`Bunda stála ${Z} Kč, teď je ve slevě ${p} %. Kolik korun stojí po slevě?`;
      const k=tp==='zvys'?Fr(100+p,100):Fr(100-p,100);
      return{kind:'num',unit:true,ans:Fr(r),task:'Vypočtěte.',prompt:`<span class="txt">${ctx}</span>`,steps:[`${p} % z ${Z} je ${Z} : 100 · ${p} = ${ch}`,
        tp==='zvys'?`${Z} + ${ch} = ${N(r+' Kč')}`:`${Z} ${MINUS} ${ch} = ${N(r+' Kč')}`,
          `Rychleji: ${tp==='zvys'?'nová cena je':'po slevě platíme'} ${tp==='zvys'?100+p:100-p} % původní ceny, tedy ${Z} · ${decStr(k)} = ${r}`]}}
    if(tp==='zcelku'){const p=pick(nice);const base=100/gcd(p,100);const Xc=base*ri(1,Math.floor(1500/base));if(Xc<20)continue;const A=Xc*p/100;
      return{kind:'num',unit:true,ans:Fr(Xc),task:'Vypočtěte.',prompt:`<span class="txt">${p} % neznámého čísla je ${A}. Jaké je to číslo?</span>`,
        steps:[`${p} % … ${A}, takže 1 % … ${A} : ${p} = ${numH(Fr(A,p))}`,`100 % … ${numH(Fr(A,p))} · 100 = ${N(Xc)}`]}}
    if(tp==='puvodni'){const p=pick([10,20,25,30,40,50,15]);const base=100/gcd(100-p,100);const Xc=base*ri(1,Math.floor(3000/base));if(Xc<50)continue;const C=Xc*(100-p)/100;
      return{kind:'num',unit:true,ans:Fr(Xc),task:'Vypočtěte.',trap:'<b class="hx">K ceně po slevě nepřičítej procenta.</b> Sleva byla z původní ceny, ne z nové.',
        prompt:`<span class="txt">Po slevě ${p} % stojí boty ${C} Kč. Kolik korun stály před slevou?</span>`,
        steps:[`Po slevě ${p} % ${K(`platíme ${100-p} % původní ceny`)}, takže ${100-p} % … ${C} Kč`,`1 % … ${C} : ${100-p} = ${numH(Fr(C,100-p))} Kč`,`100 % … ${numH(Fr(C,
          100-p))} · 100 = ${N(Xc+' Kč')}`,`Pozor, ${X(`nejde jen přičíst ${p} % k ${C}`)}. Procenta se počítají z původní ceny.`]}}
    if(tp==='okolik'){const p=pick(nice);const base=100/gcd(p,100);const B=base*ri(1,Math.floor(800/base));if(B<10)continue;const A=B+B*p/100;
      return{kind:'num',unit:true,ans:Fr(p),task:'Vypočtěte.',prompt:`<span class="txt">O kolik procent je číslo ${A} větší než číslo ${B}?</span>`,
        trap:'Procenta počítáš z čísla, se kterým porovnáváš, tedy <b class="hx">z toho za slovem „než“</b>.',steps:[`Rozdíl: ${A} ${MINUS} ${B} = ${A-B}`,
          `${K(`Porovnáváme s číslem ${B} (to je 100 %)`)}: ${A-B} : ${B} = ${decStr(Fr(A-B,B))}, tedy ${N(p+' %')}`]}}
  }
}
