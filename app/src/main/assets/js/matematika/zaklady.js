'use strict';
// Generátory: celá čísla, násobení, přednost operací, dělitelnost, krácení.

// ---- základy: celá čísla, násobení, přednost, dělitelnost, krácení
const pN=n=>n<0?`(${intH(n)})`:`${n}`, pP=n=>n<0?`(${n})`:`${n}`;
// seznam čísel se znaménky: [5,-3,4] → 5 − 3 + 4
const sgnList=l=>l.map((v,i)=>i===0?intH(v):(v<0?opS('-')+(-v):opS('+')+v)).join('');
const riAbs=(a,b)=>{let v;do{v=riNZ(-b,b)}while(Math.abs(v)<a);return v}; // |v| v rozmezí a..b, náhodné znaménko
function genCela(level){
  for(let t=0;t<3000;t++){
    if(level===1){
      const a=riNZ(-20,20),b=riNZ(-20,20),op=pick(['+','-']);if(a>0&&b>0)continue;
      const y=op==='+'?b:-b,r=a+y;const steps=[];
      if(b<0)steps.push(S(op==='+'?`${K('Přičíst záporné číslo je totéž jako ho odečíst.')} Plus a mínus vedle sebe dají mínus.`:`${K('Odečíst záporné číslo je totéž jako ho přičíst.')} Mínus a mínus\
 vedle sebe dají plus.`,`${intH(a)}${opS(op)}(${intH(b)}) = ${sgnList([a,y])}`));
      steps.push(S(`Na číselné ose začneme na čísle ${intH(a)} a posuneme se o ${Math.abs(y)} ${y>0?'doprava, protože přičítáme':'doleva, protože odečítáme'}. Skončíme na čísle ${intH(r)}.`,
        `${sgnList([a,y])} = ${N(intH(r))}`));
      return{kind:'num',ans:Fr(r),task:'Vypočtěte.',prompt:`${intH(a)}${opS(op)}${pN(b)} =`,steps,plain:`${a}${op}${pP(b)}`,
        trap:'Dvě znaménka vedle sebe: + (−3) je totéž co − 3, ale <b class="hx">− (−3) je totéž co + 3</b>.'};
    }
    const first=riNZ(-25,25),items=[];for(let i=1,n=pick([4,4,5]);i<n;i++)items.push({op:pick(['+','-']),v:riNZ(-25,25)});
    const vals=[first].concat(items.map(x=>x.op==='+'?x.v:-x.v));
    if(!items.some(x=>x.v<0)||!vals.some(v=>v<0)||!vals.some(v=>v>0))continue;
    const r=vals.reduce((s,v)=>s+v,0),pos=vals.filter(v=>v>0),neg=vals.filter(v=>v<0).map(v=>-v);
    const Ps=pos.reduce((s,v)=>s+v,0),Ns=neg.reduce((s,v)=>s+v,0);
    const lhs=intH(first)+items.map(x=>opS(x.op)+pN(x.v)).join('');
    const steps=[S(`Nejdřív odstraníme závorky. ${K('Plus a mínus vedle sebe dají mínus, mínus a mínus dají plus.')}`,`${lhs} = ${sgnList(vals)}`),
      pos.length>1?S('Sečteme zvlášť všechna kladná čísla:',`${pos.join(' + ')} = ${Ps}`):S(`Kladné číslo je tu jen jedno: ${Ps}.`),
      neg.length>1?S('Sečteme zvlášť všechna záporná čísla, zatím bez mínusu:',`${neg.join(' + ')} = ${Ns}`):S(`Záporné číslo je tu jen jedno: ${MINUS}${Ns}.`),
      S(`Kladná dávají dohromady ${Ps}, záporná ${MINUS}${Ns}. ${Ps===Ns?'Je jich stejně, výsledek je nula.':(Ps>Ns?'Kladných je víc, výsledek je kladný.':'Záporných je víc, výsledek je záporný.')}`,
        `${Ps} ${MINUS} ${Ns} = ${N(intH(r))}`)];
    return{kind:'num',ans:Fr(r),task:'Vypočtěte.',prompt:`${lhs} =`,steps,plain:`${first}`+items.map(x=>x.op+pP(x.v)).join(''),
      trap:'<b class="hx">Nepočítej narychlo zleva doprava.</b> Sečti zvlášť kladná a zvlášť záporná čísla, pak je od sebe odečti.'};
  }
}
function signNote(fs){const k=fs.filter(v=>v<0).length;
  return k===0?'Všechna čísla jsou kladná, výsledek je kladný.':k===1?`Jedno číslo je záporné, proto je ${X('výsledek záporný')}.`:k===2?`Dvě záporná čísla: ${K('mínus krát mínus je plus')}.`:`Tři\
 záporná čísla: ${X('lichý počet mínusů dá mínus')}.`}
function genNasobeni(level){
  for(let t=0;t<3000;t++){
    const task='Vypočtěte.';
    const tp=level===1?pick(['mul','mul','div','div','tens']):pick(['smul','sdiv','three','big']);
    if(tp==='mul'){const a=ri(3,10),b=ri(3,10),r=a*b;const steps=[S('Násobilka.',`${a} · ${b} = ${r}`)];
      if(b>=6&&b!==10)steps.push(S('Když si nejsi jistá, rozděl si to na pětku a zbytek:',`${a} · ${b} = ${a} · 5 + ${a} · ${b-5} = ${5*a} + ${a*(b-5)} = ${r}`));
      return{kind:'num',ans:Fr(r),task,prompt:`${a} · ${b} =`,steps,plain:`${a}*${b}`,trap:'Násobilku do 10 · 10 je potřeba umět zpaměti, v testu není kalkulačka.'}}
    if(tp==='div'){const a=ri(2,10),b=ri(2,10),n=a*b;
      return{kind:'num',ans:Fr(b),task,prompt:`${n} : ${a} =`,steps:[S(`Dělení je opak násobení. Hledáme číslo, které když vynásobíme ${a}, dostaneme ${n}.`,
        `${a} · ${b} = ${n}, takže ${n} : ${a} = ${b}`)],plain:`${n}:${a}`,
        trap:'Dělení si ověř násobením: výsledek krát dělitel musí dát dělence.'}}
    if(tp==='tens'){const a=ri(2,9),b=ri(2,9),z=pick([10,100]),r=a*z*b;
      return{kind:'num',ans:Fr(r),task,prompt:`${a*z} · ${b} =`,steps:[S('Vynásobíme čísla bez nul:',`${a} · ${b} = ${a*b}`),S(`A připíšeme ${z===10?'jednu nulu':'dvě nuly'}:`,
        `${a*z} · ${b} = ${r}`)],plain:`${a*z}*${b}`,
        trap:'Nuly na konci odlož stranou, vynásob zbytek a nuly pak připiš.'}}
    if(tp==='smul'){const a=riAbs(2,12),b=riAbs(2,12);if(a>0&&b>0)continue;const r=a*b;
      return{kind:'num',ans:Fr(r),task,prompt:`${intH(a)} · ${pN(b)} =`,steps:[S('Nejdřív vynásobíme čísla bez znamének:',`${Math.abs(a)} · ${Math.abs(b)} = ${Math.abs(r)}`),S(signNote([a,b]),
        `${intH(a)} · ${pN(b)} = ${N(intH(r))}`)],plain:`${a}*${pP(b)}`,
        trap:'<b class="hx">Plus krát mínus je mínus</b>, mínus krát mínus je plus.'}}
    if(tp==='sdiv'){const q=riAbs(2,12),d=riAbs(2,12);if(q>0&&d>0)continue;const n=q*d;
      return{kind:'num',ans:Fr(q),task,prompt:`${intH(n)} : ${pN(d)} =`,steps:[S('Nejdřív vydělíme čísla bez znamének:',`${Math.abs(n)} : ${Math.abs(d)} = ${Math.abs(q)}`),S(signNote([n,
        d])+' U dělení platí stejné pravidlo jako u násobení.',`${intH(n)} : ${pN(d)} = ${N(intH(q))}`)],plain:`${n}:${pP(d)}`,
        trap:'Znaménko u dělení se určuje stejně jako u násobení.'}}
    if(tp==='three'){const f=[riAbs(2,6),riAbs(2,6),riAbs(2,6)];if(f.every(v=>v>0))continue;const r=f[0]*f[1]*f[2];
      return{kind:'num',ans:Fr(r),task,prompt:`${intH(f[0])} · ${pN(f[1])} · ${pN(f[2])} =`,steps:[S('Nejdřív vynásobíme čísla bez znamének:',
        `${Math.abs(f[0])} · ${Math.abs(f[1])} · ${Math.abs(f[2])} = ${Math.abs(f[0]*f[1])} · ${Math.abs(f[2])} = ${Math.abs(r)}`),S('Teď znaménko. Spočítáme záporná čísla. '+signNote(f),
          `${intH(f[0])} · ${pN(f[1])} · ${pN(f[2])} = ${N(intH(r))}`)],
        plain:`${f[0]}*${pP(f[1])}*${pP(f[2])}`,trap:'Sudý počet mínusů dá plus, <b class="hx">lichý počet mínusů dá mínus</b>.'}}
    if(tp==='big'){const a=ri(13,49),b=ri(3,9);if(a%10===0)continue;const s=pick([1,1,-1]),A=s*a,r=A*b,tn=a-a%10,on=a%10;
      const steps=[S(`Větší číslo rozložíme na desítky a jednotky: ${a} = ${tn} + ${on}. Každou část vynásobíme zvlášť a sečteme.`,
        `${a} · ${b} = ${tn} · ${b} + ${on} · ${b} = ${tn*b} + ${on*b} = ${a*b}`)];
      if(s<0)steps.push(S(signNote([A,b]),`${intH(A)} · ${b} = ${intH(r)}`));
      return{kind:'num',ans:Fr(r),task,prompt:`${intH(A)} · ${b} =`,steps,plain:`${A}*${b}`,trap:'Rozlož číslo na desítky a jednotky. Násobit 30 · 6 a 7 · 6 je snazší než 37 · 6 naráz.'}}
  }
}
function genPrednost(level){
  const task='Vypočtěte. Dodržuj přednost operací.';
  for(let t=0;t<3000;t++){
    if(level===1){const tp=pick(['p1','p2','p3']);
      if(tp==='p1'){const b=ri(2,9),c=ri(2,9),op=pick(['+','-']);const a=op==='+'?ri(2,30):ri(b*c,b*c+30);const m=b*c,r=op==='+'?a+m:a-m;
        return{kind:'num',ans:Fr(r),task,prompt:`${a}${opS(op)}${b} · ${c} =`,steps:[S(`${K('Násobení má přednost')} před sčítáním a odčítáním.`,`${b} · ${c} = ${m}`),
          S(`Teď ${op==='+'?'sečteme':'odečteme'}:`,`${a}${opS(op)}${m} = ${N(r)}`)],plain:`${a}${op}${b}*${c}`,
          trap:'<b class="hx">Nepočítej zleva doprava.</b> Násobení má přednost.'}}
      if(tp==='p2'){const c=ri(2,9),op=pick(['+','-']);let a=ri(2,15),b=ri(2,15);if(op==='-'&&a<=b)continue;const s=op==='+'?a+b:a-b,r=s*c;
        return{kind:'num',ans:Fr(r),task,prompt:`(${a}${opS(op)}${b}) · ${c} =`,steps:[S(`${K('Závorka má přednost')} před vším ostatním.`,`${a}${opS(op)}${b} = ${s}`),
          S('Výsledek závorky vynásobíme:',`${s} · ${c} = ${N(r)}`)],plain:`(${a}${op}${b})*${c}`,
          trap:'Nejdřív závorka, potom násobení.'}}
      const a=ri(2,9),b=ri(2,9),d=ri(2,9),k=ri(2,9),c=d*k,m=a*b;if(m<k)continue;
      return{kind:'num',ans:Fr(m-k),task,prompt:`${a} · ${b} ${MINUS} ${c} : ${d} =`,steps:[S(`${K('Násobení a dělení mají přednost')} před odčítáním. Spočítáme obě:`,
        `${a} · ${b} = ${m}${SEP}${c} : ${d} = ${k}`),S('Teď odečteme:',`${m} ${MINUS} ${k} = ${N(m-k)}`)],plain:`${a}*${b}-${c}:${d}`,
        trap:'Násobení i dělení spočítej dřív než odčítání.'};
    }
    const tp=pick(['q1','q2','q3']);
    if(tp==='q1'){const a=riAbs(2,6),b=riNZ(-9,9),c=riNZ(-9,9),e=riAbs(2,6),k=riNZ(-9,9);if(b===c)continue;const d=e*k,s=b-c,m=a*s,r=m+k;
      return{kind:'num',ans:Fr(r),task,prompt:`${intH(a)} · (${intH(b)} ${MINUS} ${pN(c)}) + ${pN(d)} : ${pN(e)} =`,
        steps:[S(`${K('Nejdřív závorka.')}`,`${intH(b)} ${MINUS} ${pN(c)} = ${intH(s)}`),S('Pak násobení a dělení, ty mají přednost před sčítáním:',
          `${intH(a)} · ${pN(s)} = ${intH(m)}${SEP}${intH(d)} : ${pN(e)} = ${intH(k)}`),S('Nakonec sečteme:',`${intH(m)} + ${pN(k)} = ${N(intH(r))}`)],
        plain:`${a}*(${b}-${pP(c)})+${pP(d)}:${pP(e)}`,trap:'Pořadí: závorka, násobení a dělení, sčítání. <b class="hx">Hlídej znaménka.</b>'}}
    if(tp==='q2'){const a=riNZ(-20,20),b=riAbs(2,6),c=riNZ(-9,9),d=riNZ(-9,9);const s=c+d;if(s===0)continue;const m=b*s,r=a-m;
      return{kind:'num',ans:Fr(r),task,prompt:`${intH(a)} ${MINUS} ${pN(b)} · (${intH(c)} + ${pN(d)}) =`,
        steps:[S(`${K('Nejdřív závorka.')}`,`${intH(c)} + ${pN(d)} = ${intH(s)}`),S('Pak násobení, má přednost před odčítáním:',`${pN(b)} · ${pN(s)} = ${intH(m)}`),
          S(`Nakonec odečteme výsledek násobení. ${X('Pozor na znaménka.')}`,`${intH(a)} ${MINUS} ${pN(m)} = ${N(intH(r))}`)],
        plain:`${a}-${pP(b)}*(${c}+${pP(d)})`,trap:`<b class="hx">Neodčítej ${intH(a)} ${MINUS} ${pN(b)} jako první.</b> Násobení má přednost.`}}
    const c=riAbs(2,6),k=riNZ(-9,9),b=riNZ(-9,9),a=b+c*k,d=riAbs(2,6),e=riNZ(-9,9);if(a===0)continue;const m=d*e,r=k-m;
    return{kind:'num',ans:Fr(r),task,prompt:`(${intH(a)} ${MINUS} ${pN(b)}) : ${pN(c)} ${MINUS} ${pN(d)} · ${pN(e)} =`,
      steps:[S(`${K('Nejdřív závorka.')}`,`${intH(a)} ${MINUS} ${pN(b)} = ${intH(c*k)}`),S('Pak dělení a násobení:',`${intH(c*k)} : ${pN(c)} = ${intH(k)}${SEP}${pN(d)} · ${pN(e)} = ${intH(m)}`),
        S('Nakonec odečteme:',`${intH(k)} ${MINUS} ${pN(m)} = ${N(intH(r))}`)],
      plain:`(${a}-${pP(b)}):${pP(c)}-${pP(d)}*${pP(e)}`,trap:'Závorka, pak dělení a násobení, nakonec odčítání.'};
  }
}
const divisorsOf=n=>{const r=[];for(let i=1;i<=n;i++)if(n%i===0)r.push(i);return r};
function genDelitelnost(level){
  for(let t=0;t<3000;t++){
    if(pick(['nsd','nsn'])==='nsd'){
      const g=level===1?ri(2,9):ri(2,15),m=ri(1,level===1?6:9),n=ri(2,level===1?6:9);if(m===n||gcd(m,n)!==1)continue;
      const a=g*m,b=g*n;if(Math.max(a,b)>(level===1?60:150))continue;const da=divisorsOf(a),db=divisorsOf(b),com=da.filter(x=>db.includes(x));
      return{kind:'num',ans:Fr(g),task:'Vypočtěte.',prompt:`<span class="txt">Najdi největšího společného dělitele čísel ${a} a ${b}.</span>`,
        steps:[S(`Vypíšeme všechna čísla, kterými jde vydělit ${a} (dělitele):`,`${a}: ${da.join(', ')}`),S(`Totéž pro číslo ${b}:`,`${b}: ${db.join(', ')}`),
          S(`V obou seznamech jsou čísla ${com.join(', ')}. ${K('Největší z nich')} je ${g}.`,`D(${a}; ${b}) = ${N(g)}`)],plain:`${g}`,
        trap:'Největší společný dělitel nemůže být větší než menší z obou čísel. Použiješ ho při krácení zlomků.'};
    }
    const a=ri(2,level===1?12:30),b=ri(level===1?2:4,level===1?12:30);if(a===b)continue;const L=lcm(a,b),big=Math.max(a,b),small=Math.min(a,b);
    if(L/big>(level===1?6:8)||(level===2&&L<30))continue;const mult=[];for(let i=1;i*big<=L;i++)mult.push(i*big);
    return{kind:'num',ans:Fr(L),task:'Vypočtěte.',prompt:`<span class="txt">Najdi nejmenší společný násobek čísel ${a} a ${b}.</span>`,
      steps:[S(`Vypisujeme násobky většího čísla ${big} a hledáme ${K(`první, který jde vydělit i číslem ${small}`)}:`,mult.join(', ')),
        S(`${L} : ${small} = ${L/small}, to jde beze zbytku. Nejmenší společný násobek je tedy ${L}. Stejně se hledá nejmenší společný jmenovatel zlomků.`,`n(${a}; ${b}) = ${N(L)}`)],plain:`${L}`,
      trap:`Součin ${a} · ${b} = ${a*b} je společný násobek, ale ne vždy nejmenší.`};
  }
}
function genKraceni(level){
  for(let t=0;t<3000;t++){
    const tp=level===1?pick(['krat','krat','d2z']):pick(['krat','d2z','z2d']);
    if(tp==='krat'){const q=ri(2,level===1?10:15),p=ri(1,2*q),k=ri(2,level===1?9:15);if(gcd(p,q)!==1)continue;const n=p*k,d=q*k;
      return{kind:'num',fraction:true,ans:Fr(p,q),task:'Zkraťte zlomek na základní tvar.',prompt:`${frBox(n,d)} =`,
        steps:[S(`Hledáme ${K(`největší číslo, kterým jdou vydělit čitatel ${n} i jmenovatel ${d}`)}. Je to ${N(k)}. Když ho hned nevidíš, krať postupně menšími čísly (2, 3, 5…), dokud to jde.`),
          S('Čitatel i jmenovatel vydělíme stejným číslem, hodnota zlomku se tím nezmění:',`${frBox(n,d)} = ${frBox(n+' : '+k,d+' : '+k)} = ${N(fracH(Fr(p,q)))}`),
          S(`Čísla ${p} a ${q} už společného dělitele nemají, zlomek je v základním tvaru.`)],plain:`${n}/${d}`,
        trap:'Krátí se čitatel i jmenovatel stejným číslem. Krať, dokud to jde.'}}
    if(tp==='d2z'){const pl=level===1?pick([1,2]):pick([1,2,2,3]),den=Math.pow(10,pl),k=ri(1,den-1);if(k%10===0)continue;const n=pick([0,0,0,1,2])*den+k,g=gcd(n,den);if(g===1)continue;
      const res=Fr(n,den),dec=decStr(res);
      return{kind:'num',fraction:true,ans:res,task:'Převeďte na zlomek v základním tvaru.',prompt:`${dec} =`,
        steps:[S(`Číslo ${dec} má ${pl} ${pl===1?'desetinné místo':'desetinná místa'}, proto ho zapíšeme jako ${K(`zlomek se jmenovatelem ${den}`)}.`,`${dec} = ${frBox(n,den)}`),
          S(`Zkrátíme. ${n} i ${den} jdou vydělit ${g}:`,`${frBox(n,den)} = ${frBox(n+' : '+g,den+' : '+g)} = ${N(fracH(res))}`)],plain:`${n}/${den}`,
        trap:'Počet desetinných míst = počet nul ve jmenovateli: 0,35 = 35/100.'}}
    const q=pick([2,4,5,8,20,25,50]),p=ri(1,2*q);if(gcd(p,q)!==1)continue;const P=[10,100,1000].find(x=>x%q===0),k=P/q,res=Fr(p,q),zeros=String(P).length-1;
    return{kind:'num',decimal:true,ans:res,task:'Převeďte na desetinné číslo.',prompt:`${frBox(p,q)} =`,
      steps:[S(`Zlomek rozšíříme tak, aby ${K(`ve jmenovateli bylo ${P}`)}. Protože ${q} · ${k} = ${P}, násobíme čitatel i jmenovatel číslem ${k}.`,`${frBox(p,q)} = ${frBox(p+' · '+k,
        q+' · '+k)} = ${frBox(p*k,P)}`),
        S(`Jmenovatel ${P} má ${zeros} ${zeros===1?'nulu':'nuly'}, takže výsledek má ${zeros} ${zeros===1?'desetinné místo':'desetinná místa'}.`,`${frBox(p*k,P)} = ${N(decStr(res))}`)],
          plain:`${p}/${q}`,
      trap:'Rozšiř zlomek na jmenovatel 10, 100 nebo 1000. Nebo vyděl čitatel jmenovatelem.'};
  }
}
