'use strict';
// Generátory: rovnice a soustavy rovnic.

// ---- rovnice
function linSolve(A,C,v,dec){
  const f=dec?(x=>decStr(x)):(x=>fracH(x)); const x=F.div(C,A);
  if(F.eq(A,Fr(1))) return {x,steps:[]};
  if(F.eq(A,Fr(-1))) return {x,steps:[S(`Obě strany vynásobíme (−1), aby vyšlo ${K('samotné x')}.`,`${V(v)} = ${N(numH(x))}`)]};
  return {x,steps:[S(`${K(`Obě strany vydělíme číslem u ${V(v)}`)}. ${X('Tenhle poslední krok nevynechávej')}, bez něj je bod dolů.`,`${V(v)} = ${f(C)} : ${dec?decHp(A):fracHp(A)} = ${N(numH(x))}`)]};
}
const signed=(c,body)=>c.n<0?` ${MINUS} ${body}`:` + ${body}`;
const RZ='rovnice-zlomky';
function genEqSpecial(level){
  for(let t=0;t<500;t++){
    const a=ri(2,5),b=level===1?1:ri(1,4),c=riNZ(-9,9),d=level===1?0:ri(1,a*b-1),all=Math.random()<0.5;
    const co=a*b-d;let KK=a*c;if(!all){KK=a*c+riNZ(-9,9)}
    const R=[T(co,1),T(KK,0)];
    const lhs=`${a} · (${termsH(lin(b,c),'x')})${d?' '+MINUS+' '+(d===1?'':d)+V('x'):''}`;
    const steps=[S('Roznásobíme závorku:',`${termsH([T(a*b,1),T(a*c,0)].concat(d?[T(-d,1)]:[]),'x')} = ${termsH(R,'x')}`)];
    if(d)steps.push(S(`Sečteme členy s ${V('x')}:`,`${termsH([T(co,1),T(a*c,0)],'x')} = ${termsH(R,'x')}`));
    steps.push(S(`Členy s ${V('x')} převedeme doleva, čísla doprava (při převodu měníme znaménko):`,`${termsH([T(co,1),T(-co,1)],'x')} = ${termsH([T(KK,0),T(-a*c,0)],'x')}`));
    steps.push(S(`Členy s ${V('x')} se úplně odečetly:`,`0 · ${V('x')} = ${intH(KK-a*c)}`));
    if(all)steps.push(S(`Rovnost 0 = 0 platí vždycky, ať za ${V('x')} dosadíme jakékoli číslo. ${X('Závěr musíš napsat slovy')}, jinak přijdeš o bod:`,
      N('Rovnice má nekonečně mnoho řešení, řešením je každé reálné číslo.')));
    else steps.push(S(`Rovnost 0 = ${intH(KK-a*c)} neplatí nikdy, ať za ${V('x')} dosadíme cokoli. ${X('Závěr musíš napsat slovy')}, jinak přijdeš o bod:`,N('Rovnice nemá řešení.')));
    return{kind:'eq',v:'x',ans:{special:all?'all':'none'},task:'Řešte rovnici. Na papír piš celý postup, zkoušku zapisovat nemusíš.',
      trap:'Nejdřív roznásob závorku (oba členy), pak teprve převáděj. Co přejde na druhou stranu, změní znaménko.',
      prompt:`${lhs} = ${termsH(R,'x')}`,steps,plain:`${a}*(${b}*x+(${c}))-${d}*x=${polyPlain(sumT(R),'x')}`};
  }
}
function genEqSquares(){
  for(let t=0;t<3000;t++){
    const tpl=pick(['T1','T2','T3']);const x0=ri(-8,10);const task='Řešte rovnici. Na papír piš celý postup, zkoušku zapisovat nemusíš.';
    const trap='Členy x² se odečtou a zbude obyčejná lineární rovnice. Výsledek druhé mocniny nech v závorce, dokud neodstraníš mínus před ní.';
    if(tpl==='T1'){const a=riNZ(-6,6),b=riNZ(-9,9);const co=2*a-b;if(co===0)continue;const c=co*x0+a*a;
      const sq=[T(1,2),T(2*a,1),T(a*a,0)],pr=prodT([T(1,1)],lin(1,b)),neg=pr.map(x=>T(F.neg(x.c),x.k));const sl=linSolve(Fr(co),Fr(c-a*a),'x');
      return{kind:'eq',v:'x',ans:Fr(x0),task,trap,prompt:`(${termsH(lin(1,a),'x')})² ${MINUS} ${V('x')} · (${termsH(lin(1,b),'x')}) = ${intH(c)}`,
        steps:[S('Druhou mocninu závorky spočítáme podle vzorce:',`(${termsH(lin(1,a),'x')})² = ${termsH(sq,'x')}`),
          S(`Roznásobíme ${V('x')} · (…). ${K('Výsledek necháme v závorce')}, protože před ním je mínus:`,`${V('x')} · (${termsH(lin(1,b),'x')}) = ${termsH(pr,'x')}`),
          S(`Odstraníme závorku. ${X('Mínus před ní změní znaménka obou členů')}:`,`${termsH(sq.concat(neg),'x')} = ${intH(c)}`),
            S(`${V('x')}² ${MINUS} ${V('x')}² = 0, členy s ${V('x')}² se odečtou. Zbyde lineární rovnice:`,`${termsH([T(co,1),T(a*a,0)],'x')} = ${intH(c)}`),
          S('Číslo převedeme doprava a změníme mu znaménko:',`${mono(Fr(co),'x')} = ${intH(c-a*a)}`)].concat(sl.steps),plain:`(x+(${a}))^2-x*(x+(${b}))=${c}`}}
    if(tpl==='T2'){const a=riNZ(-6,6),b=riNZ(-6,6),c=riNZ(-6,6);const co=b-a-2*c;if(co===0)continue;const k0=-a*b-c*c;const d=co*x0+k0;
      const pr=prodT(lin(1,-a),lin(1,b)),sq=[T(1,2),T(2*c,1),T(c*c,0)],neg=sq.map(x=>T(F.neg(x.c),x.k));const sl=linSolve(Fr(co),Fr(d-k0),'x');
      return{kind:'eq',v:'x',ans:Fr(x0),task,trap,prompt:`(${termsH(lin(1,-a),'x')}) · (${termsH(lin(1,b),'x')}) ${MINUS} (${termsH(lin(1,c),'x')})² = ${intH(d)}`,
        steps:[S('První součin: každý člen s každým.',`(${termsH(lin(1,-a),'x')}) · (${termsH(lin(1,b),'x')}) = ${termsH(pr,'x')}`),
          S(`Druhou mocninu spočítáme podle vzorce a ${K('necháme ji v závorce')}, protože před ní je mínus:`,`(${termsH(lin(1,c),'x')})² = ${termsH(sq,'x')}`),
          S(`Odstraníme závorku, ${X('mínus změní znaménka všech tří členů')}:`,`${termsH(pr.concat(neg),'x')} = ${intH(d)}`),S(`Členy s ${V('x')}² se odečtou. Sečteme zbytek:`,`${termsH([T(co,1),
            T(k0,0)],'x')} = ${intH(d)}`),
          S('Číslo převedeme doprava:',`${mono(Fr(co),'x')} = ${intH(d-k0)}`)].concat(sl.steps),plain:`(x-(${a}))*(x+(${b}))-(x+(${c}))^2=${d}`}}
    if(tpl==='T3'){const p=pick([Fr(2),Fr(3),Fr(1,2)]),a=riNZ(-6,6),b=riNZ(-6,6);if(p.d===2&&(x0+a)%2!==0)continue;const co=F.add(p,Fr(2*b));if(F.isZero(co))continue;
      const e=F.add(F.sub(F.mul(p,Fr(x0+a)),Fr((x0-b)*(x0-b))),Fr(x0*x0));if(e.d!==1)continue;
      const pe=[T(p,1),T(F.mul(p,Fr(a)),0)],sq=[T(1,2),T(-2*b,1),T(b*b,0)],neg=sq.map(x=>T(F.neg(x.c),x.k));const k0=F.sub(F.mul(p,Fr(a)),Fr(b*b));const sl=linSolve(co,F.sub(e,k0),'x');
      const pH=p.d===1?`${p.n}`:frBox(1,2);
      return{kind:'eq',v:'x',ans:Fr(x0),task,trap,prompt:`${pH} · (${termsH(lin(1,a),'x')}) ${MINUS} (${termsH(lin(1,-b),'x')})² = ${intH(e.n)} ${MINUS} ${V('x')}²`,
        steps:[S('Roznásobíme první závorku:',`${pH} · (${termsH(lin(1,a),'x')}) = ${termsH(pe,'x')}`),S(`Druhou mocninu spočítáme podle vzorce a ${K('necháme ji v závorce')}, před ní je mínus:`,
          `(${termsH(lin(1,-b),'x')})² = ${termsH(sq,'x')}`),
          S(`Odstraníme závorku, ${X('mínus změní znaménka všech tří členů')}:`,`${termsH(pe.concat(neg),'x')} = ${intH(e.n)} ${MINUS} ${V('x')}²`),
          S(`Na obou stranách je ${MINUS}${V('x')}². Když k oběma stranám přičteme ${V('x')}², zmizí. Sečteme zbytek:`,`${termsH([T(co,1),T(k0,0)],'x')} = ${intH(e.n)}`),
          S('Číslo převedeme doprava:',`${mono(co,'x')} = ${fracH(F.sub(e,k0))}`)].concat(sl.steps),plain:`${frP(p)}*(x+(${a}))-(x-(${b}))^2=${e.n}-x^2`}}
  }
}
function genRovnice(level){
  const tp0=level===1?pick(['e1','e2','e1','e2','sp']):pick(['e3','e4','e5','e6','sq','sq','sp']);
  if(tp0==='sp')return genEqSpecial(level);
  if(tp0==='sq')return genEqSquares();
  for(let t=0;t<5000;t++){
    const v='x';const tp=tp0;
    const task='Řešte rovnici. Na papír piš celý postup, zkoušku zapisovat nemusíš.';
    if(tp==='e1'){const a=riNZ(-9,9),c=riNZ(-9,9);if(a===c)continue;const x0=ri(-9,12),b=riNZ(-15,15),d=(a-c)*x0+b;
      const L=[T(a,1),T(b,0)],R=[T(c,1),T(d,0)];const A=Fr(a-c),C=Fr(d-b);const s=linSolve(A,C,v);
      return{kind:'eq',v,ans:Fr(x0),task,trap:'Když člen převádíš na druhou stranu, <b class="hx">změní se mu znaménko</b>.',prompt:`${termsH(L,v)} = ${termsH(R,v)}`,
        steps:[S(`Členy s ${V(v)} převedeme na levou stranu, čísla na pravou. ${K('Co přejde na druhou stranu, změní znaménko.')}`,`${termsH([T(a,1),T(-c,1)],v)} = ${termsH([T(d,0),T(-b,0)],v)}`),
          S('Sečteme:',`${mono(A,v)} = ${fracH(C)}`)].concat(s.steps),
        plain:`${polyPlain(sumT(L),v)}=${polyPlain(sumT(R),v)}`}}
    if(tp==='e2'){const a=ri(2,6),b=riNZ(-9,9),c=riNZ(-12,12),d=riNZ(-6,6);if(a===d)continue;const x0=ri(-8,10);const B=-a*b+c;const E=(a-d)*x0+B;
      const R=[T(d,1),T(E,0)];const exp=[T(a,1),T(-a*b,0),T(c,0)];const A=Fr(a-d),C=Fr(E-B);const s=linSolve(A,C,v);
      return{kind:'eq',v,ans:Fr(x0),task,trap:'Nejdřív roznásob závorku (oba členy), pak teprve převáděj. Co přejde na druhou stranu, změní znaménko.',prompt:`${a} · (${termsH(lin(1,-b),
        v)})${signed(Fr(c),Math.abs(c))} = ${termsH(R,v)}`,
        steps:[S(`Roznásobíme závorku, číslo před ní ${K('násobí oba členy')}:`,`${termsH(exp,v)} = ${termsH(R,v)}`),S('Sečteme čísla na levé straně:',`${termsH([T(a,1),T(B,0)],v)} = ${termsH(R,v)}`),
          S(`Převedeme ${V(v)} doleva a čísla doprava, ${K('se změnou znaménka')}:`,`${termsH([T(a,1),T(-d,1)],v)} = ${termsH([T(E,0),T(-B,0)],v)}`),S('Sečteme:',`${mono(A,
            v)} = ${fracH(C)}`)].concat(s.steps),
        plain:`${a}*(${v}-(${b}))+(${c})=${polyPlain(sumT(R),v)}`}}
    if(tp==='e3'){const p=Fr(ri(1,9),10),q=ri(2,5),r=pick([2,4,5,6,8,10,12,15,20]);const rr=Fr(r,100);const s=Fr(ri(10,60),10);const TT=pick([Fr(1),Fr(1),Fr(1,2),Fr(2)]);
      const qr=F.mul(Fr(q),rr),qs=F.mul(Fr(q),s),A=F.add(p,qr),u=F.sub(TT,A);if(u.n<=0||decStr(u)===null)continue;
      let x0=ri(-10,30);if(TT.d===2&&x0%2)x0++;const tt=F.sub(F.mul(TT,Fr(x0)),qs);
      const rhs=termsH([T(tt,0),T(F.neg(u),1)],v,true);const sl=linSolve(TT,F.add(tt,qs),v,true);
      return{kind:'eq',v,ans:Fr(x0),task,trap:'Pozor na desetinná místa: <b class="hx">5 · 0,04 = 0,2</b>. Když chceš, můžeš celou rovnici vynásobit 100 a počítat s celými čísly.',prompt:`${monoD(p,
        v)} + ${q} · (${monoD(rr,v)} ${MINUS} ${decStr(s)}) = ${rhs}`,
        steps:[S('Roznásobíme závorku, číslo před ní násobí oba členy:',`${q} · (${monoD(rr,v)} ${MINUS} ${decStr(s)}) = ${monoD(qr,v)} ${MINUS} ${decStr(qs)}`),
          S('Rovnice teď vypadá takhle:',`${monoD(p,v)} + ${monoD(qr,v)} ${MINUS} ${decStr(qs)} = ${rhs}`),
          S(`Sečteme členy s ${V(v)} na levé straně:`,`${monoD(A,v)} ${MINUS} ${decStr(qs)} = ${rhs}`),
          S(`Člen ${MINUS}${monoD(u,v)} převedeme doleva (bude +), číslo ${MINUS}${decStr(qs)} doprava (bude +):`,`${monoD(TT,v)} = ${decStr(tt)} + ${decStr(qs)} = ${decStr(F.add(tt,
            qs))}`)].concat(sl.steps),
        plain:`${decP(p)}*x+${q}*(${decP(rr)}*x-${decP(s)})=${decP(tt)}-${decP(u)}*x`}}
    if(tp==='e4'){const b=ri(2,6),d=ri(2,6);if(b===d)continue;const a=riNZ(-9,9),c=riNZ(-9,9),x0=ri(-10,15);const e=F.sub(Fr(x0+a,b),Fr(x0-c,d));if(e.d!==1)continue;
      const L=lcm(b,d),m1=L/b,m2=L/d;const eL=e.n*L;const n1=termsH(lin(1,a),v),n2=termsH(lin(1,-c),v);
      const expd=[T(m1,1),T(m1*a,0),T(-m2,1),T(m2*c,0)];const A=Fr(m1-m2),B=m1*a+m2*c,C=Fr(eL-B);const sl=linSolve(A,C,v);
      const br=(m,s)=>m===1?`(${s})`:`${m} · (${s})`;
      return{kind:'eq',v,ans:Fr(x0),guide:RZ,task,trap:'Násob každý člen na obou stranách, <b class="hx">i číslo bez zlomku</b>. Čitatel dej do závorky, hlavně když je před zlomkem mínus.',
        prompt:`${frBox(n1,b)} ${MINUS} ${frBox(n2,d)} = ${intH(e.n)}`,
        steps:[S(`Celou rovnici vynásobíme společným jmenovatelem ${L}, aby zmizely zlomky. ${K('Násobíme každý člen na obou stranách')}, ${X(`i číslo ${intH(e.n)} vpravo`)}. Čitatele dáme do\
 závorek.`,`${br(m1,n1)} ${MINUS} ${br(m2,n2)} = ${intH(eL)}`),
          S(`Roznásobíme. ${X('Mínus před druhou závorkou změní obě znaménka')}:`,`${termsH(expd,v)} = ${intH(eL)}`),
          S('Sloučíme:',`${termsH([T(A,1),T(B,0)],v)} = ${intH(eL)}`),S('Číslo převedeme doprava:',`${mono(A,v)} = ${fracH(C)}`)].concat(sl.steps),
        plain:`(x+(${a}))/${b}-(x-(${c}))/${d}=${e.n}`}}
    if(tp==='e5'){const b=pick([2,2,4,5]),r=ri(1,4*b);if(r%b===0)continue;const D=Fr(r,b);if(decStr(D)===null)continue;const c=ri(1,4),a=riNZ(-9,9),x0=ri(-8,12);
      const num=F.sub(F.mul(D,Fr(x0)),F.add(Fr(a-x0,b),Fr(c*x0)));if(num.d!==1)continue;const e=num.n; // a−x over b + c x = D x − e  ⇒ e = D x0 − (a−x0)/b − c x0
      const bD=F.mul(D,Fr(b));if(bD.d!==1)continue;const co=b*c-1-bD.n;if(co===0)continue;const C=-b*e-a;const sl=linSolve(Fr(co),Fr(C),v);
      const rhs=termsH([T(D,1),T(-e,0)],v,true);
      return{kind:'eq',v,ans:Fr(x0),guide:RZ,task,trap:'Násob každý člen na obou stranách, <b class="hx">i ty bez zlomku</b>. Čitatel ve zlomku dej do závorky.',
        prompt:`${frBox(termsH([T(a,0),T(-1,1)],v),b)} + ${c===1?'':c}${V(v)} = ${rhs}`,
        steps:[S(`Celou rovnici vynásobíme číslem ${b}, aby zmizel zlomek. ${K('Násobíme každý člen na obou stranách.')} Zlomek se zkrátí a jeho čitatel zůstane v závorce.`,`(${termsH([T(a,0),T(-1,
          1)],v)}) + ${b} · ${c===1?'':c}${V(v)} = ${b} · ${decStr(D)}${V(v)} ${e>=0?MINUS:'+'} ${b} · ${Math.abs(e)}`),
          S('Spočítáme součiny a odstraníme závorku (před ní je plus, znaménka se nemění):',`${termsH([T(a,0),T(-1,1),T(b*c,1)],v)} = ${termsH([T(bD,1),T(-b*e,0)],v)}`),
          S(`Členy s ${V(v)} převedeme doleva, čísla doprava, se změnou znaménka:`,`${termsH([T(-1,1),T(b*c,1),T(-bD.n,1)],v)} = ${termsH([T(-b*e,0),T(-a,0)],v)}`),
          S('Sečteme:',`${mono(Fr(co),v)} = ${intH(C)}`)].concat(sl.steps),
        plain:`(${a}-x)/${b}+${c}*x=${decP(D)}*x-(${e})`}}
    if(tp==='e6'){const b=pick([2,3,4]),c=pick([2,3,4,6]),e=pick([2,3,4,6]),m=pick([1,1,2,3]),a=riNZ(-6,6),x0=ri(-9,12);if(b===c&&c===e)continue;
      const dd=F.sub(Fr(x0),F.mul(Fr(e),F.sub(F.mul(Fr(m),Fr(x0+a,b)),Fr(x0,c))));if(dd.d!==1||dd.n===0)continue;const d=dd.n;
      const L=lcm(lcm(b,c),e),k1=m*L/b,k2=L/c,k3=L/e;const co=k1-k2-k3;if(co===0)continue;
      const lhsT=[T(k1,1),T(k1*a,0),T(-k2,1)],rhsT=[T(k3,1),T(-k3*d,0)];const C=-k3*d-k1*a;const sl=linSolve(Fr(co),Fr(C),v);
      const f1=frBox(termsH(lin(1,a),v),b),f3=frBox(termsH(lin(1,-d),v),e);
      return{kind:'eq',v,ans:Fr(x0),guide:RZ,task,trap:'Vynásob celou rovnici společným jmenovatelem všech zlomků. Každý čitatel dej do závorky.',
        prompt:`${m===1?'':m+' · '}${f1} ${MINUS} ${frBox(V(v),c)} = ${f3}`,
        steps:[S(`Společný jmenovatel čísel ${b}, ${c} a ${e} je ${N(L)}. ${K('Celou rovnici jím vynásobíme')}. Každý zlomek se zkrátí a čitatele dáme do závorek.`,
          `${k1===1?'':k1+' · '}(${termsH(lin(1,a),v)}) ${MINUS} ${k2===1?'':k2}${V(v)} = ${k3===1?'':k3+' · '}(${termsH(lin(1,-d),v)})`),
          S('Roznásobíme závorky:',`${termsH(lhsT,v)} = ${termsH(rhsT,v)}`),
          S(`Členy s ${V(v)} převedeme doleva, čísla doprava, se změnou znaménka:`,`${termsH([T(k1,1),T(-k2,1),T(-k3,1)],v)} = ${termsH([T(-k3*d,0),T(-k1*a,0)],v)}`),
          S('Sečteme:',`${mono(Fr(co),v)} = ${intH(C)}`)].concat(sl.steps),
        plain:`${m}*(x+(${a}))/${b}-x/${c}=(x-(${d}))/${e}`}}
  }
}

// ---- soustavy
const xyT=(a,b)=>{const l=[];if(a)l.push({c:Fr(a),v:'x'});if(b)l.push({c:Fr(b),v:'y'});return l.map((t,i)=>{const neg=t.c.n<0,ab=Math.abs(t.c.n),body=(ab===1?'':ab)+V(t.v);
  return i===0?(neg?MINUS:'')+body:(neg?' '+MINUS+' ':' + ')+body}).join('')||'0'};
const eqXY=(a,b,c)=>`${xyT(a,b)} = ${intH(c)}`;
function genSoustavy(level){
  for(let t=0;t<5000;t++){
    const tp=level===1?pick(['s1','s2','s2']):pick(['s3','s3','s4']);
    const task='Řešte soustavu rovnic. Na papír piš celý postup, zkoušku zapisovat nemusíš.';
    const x0=ri(-6,9),y0=ri(-8,9);
    if(tp==='s1'){const S=x0+y0,D=x0-y0;
      return{kind:'sys',ans:{x:Fr(x0),y:Fr(y0)},task,prompt:`<span class="sys">${eqXY(1,1,S)}<br>${eqXY(1,-1,D)}</span>`,
        steps:[`${K('Rovnice sečteme')}, ${V('y')} se odečte: 2${V('x')} = ${intH(S)} + ${D<0?'('+intH(D)+')':D} = ${intH(S+D)}`,`${V('x')} = ${intH(S+D)} : 2 = ${N(intH(x0))}`,
          `Dosadíme do první rovnice: ${intH(x0)} + ${V('y')} = ${intH(S)}, takže ${V('y')} = ${intH(S)} ${MINUS} ${x0<0?'('+intH(x0)+')':x0} = ${N(intH(y0))}`],
        eqs:[`x+y=${S}`,`x-y=${D}`]}}
    if(tp==='s2'){const a=riNZ(-4,4),c=riNZ(-5,5),d=riNZ(-5,5);if(c+d*a===0)continue;const b=y0-a*x0,e=c*x0+d*y0;
      const yH=termsH([T(a,1),T(b,0)],'x');const ex=[T(c,1),T(d*a,1),T(d*b,0)];const A=Fr(c+d*a),B=d*b;const sl=linSolve(A,Fr(e-B),'x');
      return{kind:'sys',ans:{x:Fr(x0),y:Fr(y0)},task,prompt:`<span class="sys">${V('y')} = ${yH}<br>${eqXY(c,d,e)}</span>`,
        steps:[`${K(`Z první rovnice dosadíme za ${V('y')} do druhé`)}: ${xyT(c,0)}${d<0?' '+MINUS+' ':' + '}${Math.abs(d)===1?'':Math.abs(d)+' · '}(${yH}) = ${intH(e)}`,
          `Roznásobíme: ${termsH(ex.map(x=>x),'x')} = ${intH(e)}`,`Sloučíme a číslo převedeme doprava: ${mono(A,'x')} = ${intH(e-B)}`].concat(sl.steps,
            [`Dosadíme do první rovnice: ${V('y')} = ${a===1?'':a===-1?MINUS:a+' · '}${a===1||a===-1?(x0<0?'('+intH(x0)+')':x0):(x0<0?'('+intH(x0)+')':x0)}${b===0?'':(b<0?' '+MINUS+' '+(-b):' +\
 '+b)} = ${N(intH(y0))}`]),
        eqs:[`y=${polyPlain(sumT([T(a,1),T(b,0)]),'x')}`,`${c}*x+(${d})*y=${e}`]}}
    if(tp==='s3'){const a=ri(2,6),d=ri(1,5);if(a===d)continue;const b=riNZ(-5,5);const c=a*x0-(y0+b),n=y0-d*x0;
      const eq2=`${termsH([T(d,1),T(n,0)],'x')} = ${V('y')}`;const inner=termsH([T(d,1),T(n,0)],'x');const inner2=termsH([T(d,1),T(n+b,0)],'x');
      const A=Fr(a-d),B=-(n+b);const sl=linSolve(A,Fr(c-B),'x');
      return{kind:'sys',ans:{x:Fr(x0),y:Fr(y0)},task,prompt:`<span class="sys">${a}${V('x')} ${MINUS} (${V('y')}${b<0?' '+MINUS+' '+(-b):' + '+b}) = ${intH(c)}<br>${eq2}</span>`,
        steps:[`Druhá rovnice už má vyjádřené ${V('y')} = ${inner}. Dosadíme do první:`,
          `${a}${V('x')} ${MINUS} (${inner}${b<0?' '+MINUS+' '+(-b):' + '+b}) = ${intH(c)}`,
          `Upravíme závorku: ${a}${V('x')} ${MINUS} (${inner2}) = ${intH(c)}`,
          `Odstraníme závorku, ${X('mínus před ní mění znaménka')}: ${termsH([T(a,1),T(-d,1),T(B,0)],'x')} = ${intH(c)}`,
          `${termsH([T(A,1),T(B,0)],'x')} = ${intH(c)}, takže ${mono(A,'x')} = ${intH(c-B)}`].concat(sl.steps,
            [`Dosadíme ${V('x')} = ${intH(x0)} do druhé rovnice: ${V('y')} = ${d===1?'':d+' · '}${x0<0?'('+intH(x0)+')':x0}${n===0?'':(n<0?' '+MINUS+' '+(-n):' + '+n)} = ${N(intH(y0))}`]),
        eqs:[`${a}*x-(y+(${b}))=${c}`,`${d}*x+(${n})=y`]}}
    if(tp==='s4'){const a1=riNZ(-5,5),b1=riNZ(-5,5),a2=riNZ(-5,5),b2=riNZ(-5,5);if(a1*b2-a2*b1===0)continue;if(Math.abs(b1)===1&&Math.abs(b2)===1&&Math.random()<0.5)continue;
      const c1=a1*x0+b1*y0,c2=a2*x0+b2*y0;const l=lcm(Math.abs(b1),Math.abs(b2));let k1=l/b1,k2=-l/b2;if(k1<0){k1=-k1;k2=-k2}
      const A=k1*a1+k2*a2,C=k1*c1+k2*c2;if(A===0)continue;const sl=linSolve(Fr(A),Fr(C),'x');
      const kH=k=>k<0?`(${MINUS}${-k})`:k;
      const steps=[];
      if(k1===1&&k2===1){steps.push(`Koeficienty u ${V('y')} jsou ${K('opačná čísla')}, takže rovnice můžeme rovnou sečíst a ${V('y')} se odečte.`)}
      else{steps.push(`Chceme, aby se ${K(`při sečtení rovnic odečetlo ${V('y')}`)}. ${k1===1?'První rovnici necháme':'První rovnici vynásobíme číslem '+kH(k1)}, ${k2===1?'druhou necháme':'druhou\
 vynásobíme číslem '+kH(k2)}:`);
      steps.push(`${eqXY(k1*a1,k1*b1,k1*c1)}<br>${eqXY(k2*a2,k2*b2,k2*c2)}`);}
      steps.push(`Sečteme rovnice: ${mono(Fr(A),'x')} = ${intH(C)}`);
      steps.push(...sl.steps);
      steps.push(`Dosadíme do první rovnice: ${a1===1?'':a1===-1?MINUS:a1+' · '}${x0<0?'('+intH(x0)+')':x0}${b1<0?' '+MINUS+' ':' + '}${Math.abs(b1)===1?'':Math.abs(b1)}${V('y')} = ${intH(c1)},\
 takže ${termsH([T(b1,1)],'y')} = ${intH(c1-a1*x0)} a ${V('y')} = ${N(intH(y0))}`);
      return{kind:'sys',ans:{x:Fr(x0),y:Fr(y0)},task,prompt:`<span class="sys">${eqXY(a1,b1,c1)}<br>${eqXY(a2,b2,c2)}</span>`,steps,eqs:[`${a1}*x+(${b1})*y=${c1}`,`${a2}*x+(${b2})*y=${c2}`]}}
  }
}
