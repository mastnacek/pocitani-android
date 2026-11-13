'use strict';
// Generátory: roznásobování, vytýkání, vzorce.

// ---- roznásobování
const VARS=['x','y','a','k'];
function genRoznasobovani(level){
  for(let t=0;t<3000;t++){
    const v=pick(VARS);const task='Upravte na co nejjednodušší tvar bez závorek.';
    const tp=level===1?pick(['r1','r2','r3']):pick(['r4','r5','r6','r7','r8']);
    if(tp==='r1'){const a=ri(2,7),b=ri(1,6),c=riNZ(-9,9),d=ri(2,7),e=ri(1,6),f=riNZ(-9,9);
      const B=lin(b,c),E=lin(e,f);const p1=prodT([T(a,0)],B),p2=prodT([T(-d,0)],E);const res=sumT(p1.concat(p2));if(P.nz(res)===0)continue;
      return{kind:'poly',v,ans:res,task,trap:'Mínus před číslem a závorkou <b class="hx">mění znaménka obou členů</b> v závorce.',prompt:`${a} · (${termsH(B,v)}) ${MINUS} ${d} · (${termsH(E,v)}) =`,
        steps:[S(`Číslo před závorkou vynásobí ${K('každý člen v závorce')}.`,`${a} · (${termsH(B,v)}) = ${termsH(p1,v)}`),
          S(`Druhou závorku násobíme číslem ${MINUS}${d}, ${K('i s tím mínusem')}. Proto se ${X('změní znaménka obou členů')}.`,`${MINUS}${d} · (${termsH(E,v)}) = ${termsH(p2,v)}`),
            S(`Sečteme členy se stejnou mocninou: ${K('zvlášť členy s proměnnou, zvlášť čísla')}.`,`${termsH(p1.concat(p2),v)} = ${N(polyH(res,v))}`)],plain:`${a}*(${polyPlain(sumT(B),
              v)})-${d}*(${polyPlain(sumT(E),v)})`}}
    if(tp==='r2'||tp==='r3'){const a=tp==='r2'?1:ri(2,5),c=tp==='r2'?1:ri(1,4),b=riNZ(-9,9),d=riNZ(-9,9);const A=lin(a,b),B=lin(c,d);const pr=prodT(A,B);const res=sumT(pr);
      return{kind:'poly',v,ans:res,task,trap:'Dvě závorky: každý člen první závorky násobíš každým členem druhé. Vzniknou 4 součiny.',prompt:`(${termsH(A,v)}) · (${termsH(B,v)}) =`,
        steps:[S(`${K('Každý člen první závorky vynásobíme každým členem druhé závorky.')} Vzniknou čtyři součiny. Pozor na znaménka: ${X('mínus krát mínus je plus')}.`,termsH(pr,v)),
          S('Sečteme členy se stejnou mocninou:',N(polyH(res,v)))],plain:`(${polyPlain(sumT(A),v)})*(${polyPlain(sumT(B),v)})`}}
    if(tp==='r4'){const a=riNZ(-9,9),b=ri(1,9),c=ri(2,5);const A=lin(1,a),B=lin(1,-b);const sq=[T(1,2),T(2*a,1),T(a*a,0)];const pr=prodT(B,[T(c,1)]);const res=sumT(sq.concat(pr));
      return{kind:'poly',v,ans:res,task,trap:`Druhá mocnina závorky má tři členy: (${V(v)} + 3)² = ${V(v)}² + 6${V(v)} + 9, <b class="hx">ne ${V(v)}² + 9</b>.`,prompt:`(${termsH(A,v)})² + (${termsH(B,
        v)}) · ${c}${V(v)} =`,
        steps:[S(`Druhou mocninu spočítáme podle vzorce ${K(`(první ${a>0?'+':MINUS} druhý)² = první² ${a>0?'+':MINUS} 2 · první · druhý + druhý²`)}. Tenhle vzorec najdeš i v testu.`,`(${termsH(A,
          v)})² = ${V(v)}² ${a>0?'+':MINUS} 2 · ${V(v)} · ${Math.abs(a)} + ${Math.abs(a)}² = ${termsH(sq,v)}`),S(`Závorku vynásobíme ${c}${V(v)}: každý člen zvlášť.`,`(${termsH(B,
            v)}) · ${c}${V(v)} = ${termsH(pr,v)}`),S('Sečteme členy se stejnou mocninou:',`${termsH(sq.concat(pr),v)} = ${N(polyH(res,v))}`)],
        plain:`(${polyPlain(sumT(A),v)})^2+(${polyPlain(sumT(B),v)})*${c}*${v}`}}
    if(tp==='r5'){const a=ri(2,15),m=ri(1,3),c=ri(1,4),b=c+m,d=ri(2,6),e=ri(2,9),p=-ri(2,5),q=ri(1,-p-1),s=p+q,g=ri(1,9);
      const A=lin(1,-a),D=lin(d,-e);const p1=prodT(A,[T(m,1)]);const p2=prodT([T(-s,0)],D);const all=p1.concat(p2,[T(-g,0)]);const res=sumT(all);
      return{kind:'poly',v,ans:res,task,trap:'Nejdřív zjednoduš to, co je uvnitř závorek, teprve potom násob.',prompt:`(${termsH(A,
        v)}) · (${b}${V(v)} ${MINUS} ${c===1?'':c}${V(v)}) ${MINUS} (${termsH(D,v)}) · (${MINUS}${-p} + ${q}) ${MINUS} ${g} =`,
        steps:[S(`${K('Nejdřív zjednodušíme obsah závorek')}, ve kterých jsou podobné členy. Ušetříš si spoustu práce.`,`${b}${V(v)} ${MINUS} ${c===1?'':c}${V(v)} = ${mono(Fr(m),
          v)}${SEP}${MINUS}${-p} + ${q} = ${MINUS}${-s}`),
          S('První součin:',`(${termsH(A,v)}) · ${mono(Fr(m),v)} = ${termsH(p1,v)}`),
          S(`Druhý součin. Před závorkou je mínus a násobíme číslem ${MINUS}${-s}: ${X('mínus krát mínus je plus')}.`,`${MINUS}(${termsH(D,v)}) · (${MINUS}${-s}) = ${termsH(p2,v)}`),
          S(`Sečteme všechno i s posledním ${MINUS}${g}:`,`${termsH(all,v)} = ${N(polyH(res,v))}`)],
        plain:`(${polyPlain(sumT(A),v)})*(${b}*${v}-${c}*${v})-(${polyPlain(sumT(D),v)})*(${p}+${q})-${g}`}}
    if(tp==='r6'){const a=ri(2,4),b=riNZ(-9,9),c=ri(1,9),d=riNZ(-9,9);const A=lin(a,b),B=lin(1,-c),Dd=lin(1,d);const p1=prodT(A,B);const sq=[T(1,2),T(2*d,1),T(d*d,0)];const nsq=sq.map(x=>T(F.neg(x.c),
      x.k));const res=sumT(p1.concat(nsq));
      return{kind:'poly',v,ans:res,task,trap:'Výsledek druhé mocniny nech v závorce, dokud neodstraníš mínus před ní. <b class="hx">Jinak změníš znaménko jen u prvního členu.</b>',prompt:`(${termsH(A,
        v)}) · (${termsH(B,v)}) ${MINUS} (${termsH(Dd,v)})² =`,
        steps:[S('První součin: každý člen s každým.',`(${termsH(A,v)}) · (${termsH(B,v)}) = ${termsH(p1,v)} = ${polyH(sumT(p1),v)}`),
          S(`Druhou mocninu spočítáme podle vzorce. ${K('Výsledek necháme v závorce')}, protože před ní je mínus.`,`(${termsH(Dd,v)})² = ${termsH(sq,v)}`),
            S(`${X('Mínus před závorkou změní znaménka všech tří členů')}:`,`${MINUS}(${termsH(sq,v)}) = ${termsH(nsq,v)}`),S('Sečteme:',`${termsH(sumT(p1).length?polyTerms(sumT(p1)).concat(nsq):nsq,
              v)} = ${N(polyH(res,v))}`)],
        plain:`(${polyPlain(sumT(A),v)})*(${polyPlain(sumT(B),v)})-(${polyPlain(sumT(Dd),v)})^2`}}
    if(tp==='r7'){const a=ri(1,3),b=riNZ(-5,5),c=ri(2,9),d=ri(2,5),e=riNZ(-6,6);
      const A=lin(a,b),E=lin(1,-e);const sq1=[T(a*a,2),T(2*a*b,1),T(b*b,0)];const sq2=[T(1,2),T(-2*e,1),T(e*e,0)];const nsq2=sq2.map(x=>T(F.mul(x.c,Fr(-d)),x.k));const all=sq1.concat([T(-c,1)],nsq2);
        const res=sumT(all);if(P.nz(res)<2)continue;
      return{kind:'poly',v,ans:res,task,trap:`U ${MINUS}${d} · (…)² <b class="hx">nejdřív umocni závorku</b>, pak teprve násob číslem ${d}. Mocnina má přednost před násobením.`,
        prompt:`(${termsH(A,v)})² ${MINUS} ${V(v)} · ${c} ${MINUS} ${d} · (${termsH(E,v)})² =`,
        steps:[S('První závorku umocníme podle vzorce (první + druhý)² = první² + 2 · první · druhý + druhý².',`(${termsH(A,v)})² = ${termsH(sq1,v)}`),
          S(`Prostřední člen je jen součin: ${V(v)} · ${c} = ${c}${V(v)}, s mínusem před ním ${MINUS}${c}${V(v)}.`),
          S(`U ${MINUS}${d} · (${termsH(E,v)})² ${K('má přednost mocnina')}. Nejdřív tedy umocníme závorku a výsledek necháme v závorce:`,`(${termsH(E,v)})² = ${termsH(sq2,v)}`),
          S(`Teď závorku vynásobíme číslem ${MINUS}${d}. Násobíme každý člen a ${X('mínus změní všechna znaménka')}:`,`${MINUS}${d} · (${termsH(sq2,v)}) = ${termsH(nsq2,v)}`),
          S('Všechno sepíšeme za sebe a sečteme členy se stejnou mocninou:',`${termsH(all,v)} = ${N(polyH(res,v))}`)],
        plain:`(${a}*${v}+(${b}))^2-${v}*${c}-${d}*(${v}-(${e}))^2`}}
    if(tp==='r8'){const a=ri(2,4),b=ri(1,5),c=ri(2,3),d=ri(1,2),e=ri(2,4),f=ri(1,5),g=ri(1,5),h=ri(2,3);
      const p1=prodT([T(1,1)],lin(a,-b)),p2=prodT([T(c+d,1)],lin(e,f)),p3=[T(g*g,0),T(-h*h,2)];const all=p1.concat(p2,p3);const res=sumT(all);
      return{kind:'poly',v,ans:res,task,trap:'Mínus před závorkou se záporným obsahem dává plus. Poslední součin je vzorec (a − b)(a + b) = a² − b².',
        prompt:`${V(v)} · (${termsH(lin(a,-b),v)}) ${MINUS} (${MINUS}${c}${V(v)} ${MINUS} ${d===1?'':d}${V(v)}) · (${termsH(lin(e,f),v)}) + (${g} ${MINUS} ${h}${V(v)}) · (${g} + ${h}${V(v)}) =`,
        steps:[S('První součin:',`${V(v)} · (${termsH(lin(a,-b),v)}) = ${termsH(p1,v)}`),
          S(`Ve druhé závorce sečteme podobné členy: ${MINUS}${c}${V(v)} ${MINUS} ${d===1?'':d}${V(v)} = ${MINUS}${c+d}${V(v)}. Před závorkou je mínus, takže ${X('mínus krát mínus dá plus')}.`,
            `${MINUS}(${MINUS}${c+d}${V(v)}) · (${termsH(lin(e,f),v)}) = ${c+d}${V(v)} · (${termsH(lin(e,f),v)}) = ${termsH(p2,v)}`),
          S(`Třetí součin je vzorec ${K('(první − druhý)(první + druhý) = první² − druhý²')}. Nemusíš násobit každý s každým.`,
            `(${g} ${MINUS} ${h}${V(v)})(${g} + ${h}${V(v)}) = ${g}² ${MINUS} (${h}${V(v)})² = ${termsH(p3,v)}`),
          S('Sečteme všechno:',`${termsH(all,v)} = ${N(polyH(res,v))}`)],
        plain:`${v}*(${a}*${v}-${b})-(-${c}*${v}-${d}*${v})*(${e}*${v}+${f})+(${g}-${h}*${v})*(${g}+${h}*${v})`}}
  }
}

// ---- vytýkání
function genVytykani(level){
  for(let t=0;t<3000;t++){
    const v=pick(VARS);const tp=level===1?pick(['k','k','x']):pick(['kx','k3','kx3','up','up']);
    if(tp==='up'){const r=ri(3,9),p=pick([2,3]),q=ri(2,5);const A=r-1,Bc=p*p*q;const g=gcd(A,Bc);
      const exp=[Fr(0),Fr(-Bc),Fr(A)],inner=[Fr(-Bc/g),Fr(A/g)];const outH=(g===1?'':g)+V(v),outS=(g===1?'':g)+v;
      const steps=[S(`Nejdřív výraz upravíme. ${V(v)} · (${MINUS}${V(v)}) = ${MINUS}${V(v)}² (plus krát mínus je mínus). U ${p}² · ${q}${V(v)} má přednost mocnina: ${p}² = ${p*p},\
 takže ${p*p} · ${q}${V(v)} = ${Bc}${V(v)}.`,`${MINUS}${V(v)}² ${MINUS} ${Bc}${V(v)} + ${r}${V(v)}²`),
        S(`Sečteme členy s ${V(v)}²: ${MINUS}${V(v)}² + ${r}${V(v)}² = ${A}${V(v)}².`,polyH(exp,v))];
      if(g>1)steps.push(S(`Největší společný dělitel čísel ${A} a ${Bc} je ${g}. Oba členy navíc obsahují ${V(v)}, takže vytkneme ${outH}.`));
        else steps.push(S(`Čísla ${A} a ${Bc} nemají společného dělitele, ale oba členy obsahují ${V(v)}, takže vytkneme ${V(v)}.`));
      steps.push(S(`${K('Každý člen vydělíme tím, co vytýkáme')}, a výsledky napíšeme do závorky:`,`${polyH(exp,v)} = ${N(`${outH}(${polyH(inner,v)})`)}`));
      steps.push(S('Kontrola: když závorku roznásobíš, musí vyjít upravený výraz.'));
      return{kind:'factor',mode:'common',v,ans:exp,task:'Upravte a rozložte na součin vytknutím.',trap:'Nejdřív výraz uprav a sečti podobné členy, teprve potom vytýkej.',
        prompt:`${V(v)} · (${MINUS}${V(v)}) ${MINUS} ${p}² · ${q}${V(v)} + ${r}${V(v)}² =`,steps,sol:`${outS}(${polySol(inner,v)})`,plain:`${v}*(-${v})-${p}^2*${q}*${v}+${r}*${v}^2`};
    }
    let k=ri(2,9),withX=false,inner;
    if(tp==='k'){const a=ri(1,9),b=riNZ(-9,9);if(gcd(a,b)>1)continue;inner=[Fr(b),Fr(a)]}
    else if(tp==='x'){k=1;withX=true;const a=ri(2,9),b=riNZ(-9,9);if(gcd(a,b)>1)continue;inner=[Fr(b),Fr(a)]}
    else if(tp==='kx'){withX=true;const a=ri(1,7),b=riNZ(-9,9);if(gcd(a,b)>1)continue;inner=[Fr(b),Fr(a)]}
    else if(tp==='k3'){const a=ri(1,5),b=riNZ(-9,9),c=riNZ(-9,9);if(gcd(gcd(a,b),c)>1)continue;inner=[Fr(c),Fr(b),Fr(a)]}
    else{withX=true;const a=ri(1,5),b=riNZ(-7,7),c=riNZ(-7,7);if(gcd(gcd(a,b),c)>1)continue;inner=[Fr(c),Fr(b),Fr(a)]}
    const outer=withX?[Fr(0),Fr(k)]:[Fr(k)];const exp=P.mul(outer,inner);
    const outH=(k===1?'':k)+(withX?V(v):'');const outS=(k===1?'':k)+(withX?v:'');
    const coefs=polyTerms(exp).map(x=>Math.abs(x.c.n));
    const steps=[];
    if(k>1)steps.push(S(`Hledáme ${K('největší číslo, kterým jdou vydělit všechny koeficienty')} ${coefs.join(', ')}. Je to ${N(k)}.`));
    if(withX)steps.push(S(`Každý člen obsahuje ${V(v)}, takže vytkneme i ${V(v)}.`));
    steps.push(S(`${K(`Každý člen vydělíme činitelem ${outH}`)} a výsledky napíšeme do závorky:`,`${polyH(exp,v)} = ${N(`${outH}(${polyH(inner,v)})`)}`));
    steps.push(S(`Kontrola: když závorku roznásobíš, musí vyjít zadaný výraz. ${X('V závorce už nesmí jít nic dalšího vytknout.')}`));
    return{kind:'factor',mode:'common',v,ans:exp,task:'Rozložte na součin vytknutím. Vytkněte co nejvíc (číslo i proměnnou).',
      trap:'Vytkni největší společný dělitel čísel i proměnnou, kterou mají všechny členy. Kontroluj roznásobením.',prompt:`${polyH(exp,v)} =`,steps,sol:`${outS}(${polySol(inner,v)})`,
        plain:polyPlain(exp,v)};
  }
}

// ---- vzorce
function genVzorce(level){
  for(let t=0;t<3000;t++){
    const v=pick(VARS);const tp=level===1?pick(['e1','e2','f1','e1','f1']):pick(['e3','e4','f2','f3','f4','e5','e5','e6','e7','f5','f6','f7']);
    const pv=(b)=>b===1?V(v):`${b}${V(v)}`;const pq=(b)=>b===1?`${V(v)}²`:`(${b}${V(v)})²`;
    const U='umocneni',R='rozklad';
    if(tp==='e1'||tp==='e3'){const b=tp==='e1'?1:ri(2,5),a=ri(1,9),s=pick([1,-1]);if(gcd(a,b)>1&&tp==='e3')continue;const res=[Fr(a*a),Fr(2*a*b*s),Fr(b*b)];const sg=s>0?'+':MINUS;
      return{kind:'poly',v,ans:res,guide:U,task:'Umocněte podle vzorce (výsledek bez závorek).',
        trap:'Druhá mocnina dvojčlenu má tři členy. <b class="hx">Prostřední člen 2 · první · druhý nesmíš vynechat.</b>',prompt:`(${pv(b)} ${sg} ${a})² =`,
        steps:[S(`Vzorec: ${K(`(první ${sg} druhý)² = první² ${sg} 2 · první · druhý + druhý²`)}. První člen je ${pv(b)}, druhý ${a}.`),S('Dosadíme a spočítáme každý člen:',
          `${pq(b)} ${sg} 2 · ${pv(b)} · ${a} + ${a}² = ${N(polyH(res,v))}`)],plain:`(${b}*${v}${s>0?'+':'-'}${a})^2`}}
    if(tp==='e2'||tp==='e4'){const b=tp==='e2'?1:ri(2,5),a=ri(1,12);const res=[Fr(-a*a),Fr(0),Fr(b*b)];const first=pick([0,1]);
      const f1=`(${pv(b)} + ${a})`,f2=`(${pv(b)} ${MINUS} ${a})`;
      return{kind:'poly',v,ans:res,guide:U,task:'Roznásobte podle vzorce (výsledek bez závorek).',trap:'(a + b)(a − b) = a² − b². Prostřední členy se odečtou, vyjdou jen dva členy.',
        prompt:`${first?f1+' · '+f2:f2+' · '+f1} =`,
        steps:[S(`Vzorec: ${K(`(první + druhý)(první ${MINUS} druhý) = první² ${MINUS} druhý²`)}. Když bys násobila každý s každým, prostřední členy se odečtou.`),S('Dosadíme:',
          `${pq(b)} ${MINUS} ${a}² = ${N(polyH(res,v))}`)],plain:`(${b}*${v}+${a})*(${b}*${v}-${a})`}}
    if(tp==='e5'||tp==='e6'){
      const dec=tp==='e6';let A,B;
      if(dec){A=Fr(ri(1,9),10);B=pick([Fr(ri(1,9),10),Fr(ri(1,5))])}
      else{const ch=pick(['A','B','AB']);A=ch==='B'?Fr(ri(2,5)):rfr(5,4);B=ch==='A'?Fr(ri(1,6)):rfr(5,4)}
      const s=pick([1,-1]),varFirst=Math.random()<0.6;
      const tv=T(A,1),tc=T(B,0);const t1=varFirst?tv:tc,t2r=varFirst?tc:tv;const t2=T(s>0?t2r.c:F.neg(t2r.c),t2r.k);const t2a=T(F.abs(t2.c),t2.k);
      const sq1=prodT([t1],[t1]),mid=prodT([T(F.mul(Fr(2),t1.c),t1.k)],[t2a]),sq2=prodT([t2a],[t2a]);
      const res=sumT(sq1.concat(mid.map(x=>T(s>0?x.c:F.neg(x.c),x.k)),sq2));
      const sg=s>0?'+':MINUS;const h1=termsH([t1],v,dec),h2=termsH([t2a],v,dec);
      return{kind:'poly',v,dec,ans:res,guide:U,task:dec?'Umocněte a zjednodušte (výsledek bez závorek).':'Umocněte a zjednodušte. Zlomky zapište v základním tvaru.',
        trap:dec?'0,3² = 0,09, <b class="hx">ne 0,9</b>. Při násobení desetinných čísel se počty desetinných míst sčítají.':'Zlomek umocníš tak, že umocníš čitatel i jmenovatel. U prostředního členu\
 2 · první · druhý nezapomeň zkrátit.',
        prompt:`(${termsH([t1,t2],v,dec)})² =`,
        steps:[S(`Vzorec: ${K(`(první ${sg} druhý)² = první² ${sg} 2 · první · druhý + druhý²`)}. První člen je ${h1}, druhý ${h2}.`),
          S(dec?'První člen na druhou. Číslo i proměnnou umocníme zvlášť, desetinná místa se sčítají:':'První člen na druhou. Umocníme čitatel, jmenovatel i proměnnou:',`(${h1})² = ${termsH(sq1,v,
            dec)}`),
          S(`Prostřední člen: 2 · první · druhý. ${K('Nejdřív vynásob čísla, pak zkrať.')}`,`2 · ${h1} · ${h2} = ${termsH(mid,v,dec)}`),
          S('Druhý člen na druhou:',`(${h2})² = ${termsH(sq2,v,dec)}`),
          S(`Výsledek. Znaménko prostředního členu je ${s>0?'plus':'mínus'}, stejné jako v závorce. Pořadí členů nevadí, uznává se jakékoli.`,N(polyH(res,v,dec)))],
        plain:`(${polyPlain(sumT([t1,t2]),v)})^2`}}
    if(tp==='e7'){const q=ri(2,5),m=ri(1,4),rev=Math.random()<0.4;const c=rev?F.sub(Fr(m),Fr(1,q)):F.sub(Fr(1,q),Fr(m));const res=[Fr(0),Fr(0),F.mul(c,c)];
      const inner=rev?`${m===1?'':m}${V(v)} ${MINUS} ${frBox(V(v),q)}`:`${frBox(V(v),q)} ${MINUS} ${m===1?'':m}${V(v)}`;
      const conv=rev?`${frBox(m*q+V(v),q)} ${MINUS} ${frBox(V(v),q)}`:`${frBox(V(v),q)} ${MINUS} ${frBox(m*q+V(v),q)}`;
      return{kind:'poly',v,ans:res,guide:U,task:'Umocněte a zjednodušte. Výsledek zapište zlomkem v základním tvaru.',
        trap:'Oba členy v závorce obsahují stejnou proměnnou. Nejdřív je sečti (odečti), pak teprve umocňuj.',prompt:`(${inner})² =`,
        steps:[S(`Pozor: ${X(`oba členy v závorce obsahují ${V(v)}`)}, jsou to podobné členy. Nejdřív je tedy odečteme. Převedeme je na společného jmenovatele ${q}.`,
          `${inner} = ${conv} = ${termsH([T(c,1)],v)}`),
          S('Teď umocníme jediný člen: zvlášť čitatel, jmenovatel i proměnnou. Záporné číslo na druhou je kladné.',`(${termsH([T(c,1)],v)})² = ${frBox(Math.abs(c.n)+'²',
            c.d+'²')}${V(v)}² = ${N(polyH(res,v))}`),
          S('Šlo by to i vzorcem, ale vyšlo by totéž s mnohem větší šancí na chybu.')],
        plain:rev?`(${m}*${v}-${v}/${q})^2`:`(${v}/${q}-${m}*${v})^2`}}
    if(tp==='f1'||tp==='f2'){const b=tp==='f1'?1:ri(2,5),a=ri(1,12);if(gcd(a,b)>1)continue;const exp=[Fr(-a*a),Fr(0),Fr(b*b)];
      return{kind:'factor',mode:'formula',v,ans:exp,guide:R,task:'Rozložte na součin pomocí vzorce.',
        trap:'Najdi, z čeho jsou oba členy druhou mocninou. Výsledek je součin dvou závorek: jedna s plus, druhá s mínus.',prompt:`${polyH(exp,v)} =`,
        steps:[S(`Vzorec: ${K(`první² ${MINUS} druhý² = (první + druhý)(první ${MINUS} druhý)`)}. Hledáme, z čeho jsou oba členy druhou mocninou.`),
          S(`${b*b===1?'':b*b}${V(v)}² = ${pq(b)} a ${a*a} = ${a}²:`,`${polyH(exp,v)} = ${pq(b)} ${MINUS} ${a}² = ${N(`(${pv(b)} + ${a})(${pv(b)} ${MINUS} ${a})`)}`)],
            sol:`(${b===1?'':b}${v}+${a})(${b===1?'':b}${v}-${a})`,plain:polyPlain(exp,v)}}
    if(tp==='f3'){const b=pick([1,1,2,3]),a=ri(1,9),s=pick([1,-1]);if(gcd(a,b)>1)continue;const exp=[Fr(a*a),Fr(2*a*b*s),Fr(b*b)];const sg=s>0?'+':MINUS;
      return{kind:'factor',mode:'formula',v,ans:exp,guide:R,task:'Rozložte na součin pomocí vzorce.',
        trap:'Prostřední člen musí být přesně 2 · první · druhý. Znaménko v závorce je stejné jako u prostředního členu.',prompt:`${polyH(exp,v)} =`,
        steps:[S(`Vzorec: ${K(`první² ${sg} 2 · první · druhý + druhý² = (první ${sg} druhý)²`)}. První a poslední člen jsou druhé mocniny: ${pq(b)} a ${a}².`),
          S('Ověříme prostřední člen a zapíšeme součin:',`2 · ${pv(b)} · ${a} = ${termsH([T(2*a*b,1)],v)}, sedí, takže ${polyH(exp,v)} = ${N(`(${pv(b)} ${sg} ${a})²`)}`)],
            sol:`(${b===1?'':b}${v}${s>0?'+':'-'}${a})^2`,plain:polyPlain(exp,v)}}
    if(tp==='f4'){const n=ri(4,15),NN=n*n;const ds=[];for(let a=2;a<=30;a++)if(NN%a===0&&a!==n&&NN/a<=40&&NN/a>=2)ds.push(a);if(!ds.length)continue;const a=pick(ds),b=NN/a;
      const plus=Math.random()<0.5;
      const exp=[Fr(-NN),Fr(0),Fr(1)];
      const prompt=plus?`${V(v)} · (${V(v)} + ${a}) ${MINUS} ${a} · (${V(v)} + ${b}) =`:`${V(v)} · (${V(v)} ${MINUS} ${a}) + ${a} · (${V(v)} ${MINUS} ${b}) =`;
      const ex=plus?`${V(v)}² + ${a}${V(v)} ${MINUS} ${a}${V(v)} ${MINUS} ${NN}`:`${V(v)}² ${MINUS} ${a}${V(v)} + ${a}${V(v)} ${MINUS} ${NN}`;
      return{kind:'factor',mode:'formula',v,ans:exp,guide:R,task:'Upravte a výsledný výraz rozložte na součin pomocí vzorce.',
        trap:'Nejdřív roznásob a uprav, rozkládáš až výsledek. <b class="hx">Za úpravu bez rozkladu body nejsou.</b>',prompt,
        steps:[S('Roznásobíme obě závorky:',ex),S(`Členy s ${V(v)} se odečtou:`,`${V(v)}² ${MINUS} ${NN}`),
          S(`Teď vzorec první² ${MINUS} druhý² = (první + druhý)(první ${MINUS} druhý). ${NN} = ${n}² (tabulka druhých mocnin 11 až 20 je v testu).`,
            `${V(v)}² ${MINUS} ${n}² = ${N(`(${V(v)} + ${n})(${V(v)} ${MINUS} ${n})`)}`)],sol:`(${v}+${n})(${v}-${n})`,
        plain:plus?`${v}*(${v}+${a})-${a}*(${v}+${b})`:`${v}*(${v}-${a})+${a}*(${v}-${b})`}}
    if(tp==='f5'){const n=ri(2,12),d=ri(1,9),c=n*n+d;const exp=[Fr(n*n),Fr(0),Fr(-1)];
      return{kind:'factor',mode:'formula',v,ans:exp,guide:R,task:'Upravte a výsledný výraz rozložte na součin pomocí vzorce.',
        trap:'Mínus před závorkou <b class="hx">mění znaménka všech členů uvnitř</b>: −(1 − x²) = −1 + x².',prompt:`${c} ${MINUS} (${d} ${MINUS} ${V(v)}²) ${MINUS} ${V(v)} · 2${V(v)} =`,
        steps:[S(`Odstraníme závorku. ${X('Mínus před ní změní znaménka obou členů.')} A ${V(v)} · 2${V(v)} = 2${V(v)}².`,`${c} ${MINUS} ${d} + ${V(v)}² ${MINUS} 2${V(v)}²`),
          S(`Sečteme čísla a členy s ${V(v)}²:`,`${n*n} ${MINUS} ${V(v)}²`),
            S(`Rozdíl druhých mocnin: ${n*n} = ${n}², takže použijeme první² ${MINUS} druhý² = (první + druhý)(první ${MINUS} druhý). Pozor, první je tady číslo ${n}.`,
              `${n}² ${MINUS} ${V(v)}² = ${N(`(${n} + ${V(v)})(${n} ${MINUS} ${V(v)})`)}`)],
        sol:`(${n}+${v})(${n}-${v})`,plain:`${c}-(${d}-${v}^2)-${v}*2*${v}`}}
    if(tp==='f6'){const n=ri(2,12),k=ri(2,6);if(gcd(n,k)>1)continue;const exp=[Fr(n*n),Fr(0),Fr(-k*k)];
      return{kind:'factor',mode:'formula',v,ans:exp,guide:R,task:'Rozložte na součin podle vzorce.',trap:`(${MINUS}${k}${V(v)})² = ${k*k}${V(v)}². <b class="hx">Mínus v závorce na druhou zmizí.</b>`,
        prompt:`${n*n} ${MINUS} (${MINUS}${k}${V(v)})² =`,
        steps:[S(`Nejdřív druhá mocnina. ${X('Mínus je uvnitř závorky, takže se umocní taky')}: (${MINUS}${k}${V(v)}) · (${MINUS}${k}${V(v)}) = ${k*k}${V(v)}².`,`${n*n} ${MINUS} ${k*k}${V(v)}²`),
          S(`Rozdíl druhých mocnin: ${n*n} = ${n}² a ${k*k}${V(v)}² = (${k}${V(v)})².`,`${n}² ${MINUS} (${k}${V(v)})² = ${N(`(${n} + ${k}${V(v)})(${n} ${MINUS} ${k}${V(v)})`)}`)],
        sol:`(${n}+${k}${v})(${n}-${k}${v})`,plain:`${n*n}-(-${k}*${v})^2`}}
    if(tp==='f7'){const b=pick([1,2,3]),a=ri(1,9),s=pick([1,-1]);if(gcd(a,b)>1)continue;const exp=[Fr(a*a),Fr(2*a*b*s),Fr(b*b)];const sg=s>0?'+':MINUS;
      return{kind:'factor',mode:'formula',v,ans:exp,guide:R,task:'Upravte a výsledný výraz rozložte na součin pomocí vzorce.',
        trap:'Trojčlen po úpravě ještě není výsledek. <b class="hx">Bez rozkladu na součin dostaneš jen polovinu bodů.</b>',
        prompt:`${V(v)} · (${b*b===1?'':b*b}${V(v)} ${sg} ${2*a*b}) + ${a*a} =`,
        steps:[S('Roznásobíme závorku:',polyH(exp,v)),
          S(`Tenhle trojčlen je vzorec ${K(`první² ${sg} 2 · první · druhý + druhý²`)}. První člen je ${pq(b)}, poslední ${a}². Prostřední musí být 2 · ${pv(b)} · ${a} = ${2*a*b}${V(v)}, a to sedí.`),
            S('Zapíšeme jako součin:',`${polyH(exp,v)} = ${N(`(${pv(b)} ${sg} ${a})²`)}`)],
        sol:`(${b===1?'':b}${v}${s>0?'+':'-'}${a})^2`,plain:`${v}*(${b*b}*${v}${s>0?'+':'-'}${2*a*b})+${a*a}`}}
  }
}
