'use strict';
// Generátor slovních úloh s proměnnou (šablony PROMENNA jsou v js/data/promenna.js).

// ---- slovní úloha s proměnnou (v testech 2023–2026 v 11 ze 16): a), b) vyjádři výrazem, c) dopočítej
const LP=(a,b)=>P.norm([typeof b==='number'?Fr(b):b,typeof a==='number'?Fr(a):a]); // a·v + b
const ZLOMKY_SLOVY={2:'polovinu',3:'třetinu',4:'čtvrtinu',5:'pětinu',6:'šestinu'};
const KRAT={2:'dvakrát',3:'třikrát',4:'čtyřikrát'};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const evalP=(p,x)=>P.norm(p).reduce((s,c,i)=>F.add(s,F.mul(c,F.pow(x,i))),Fr(0));
// kroky řešení lineární rovnice L(v) = R
function linKroky(L,R,v,uvod){
  L=P.norm(L);const a=L[1]||Fr(0),b=L[0];const st=[S(uvod,`${polyH(L,v)} = ${numH(R)}`)];let r=R;
  if(!F.isZero(b)){r=F.sub(R,b);st.push(S(`${K('Číslo převedeme na druhou stranu')} a změníme mu znaménko:`,`${termsH([T(a,1)],v)} = ${numH(r)}`))}
  const x=F.div(r,a);
  if(!F.eq(a,Fr(1)))st.push(S(`${K(`Obě strany vydělíme číslem u ${V(v)}`)}:`,`${V(v)} = ${numH(r)} : ${fracHp(a)} = ${N(numH(x))}`));
  return{x,st};
}
function genPromenna(level){
  const pool=PROMENNA.filter(t=>t.lv===level);
  for(let t=0;t<500;t++){
    const s=pick(pool).f();if(!s)continue;
    const {v}=s;const sol=linKroky(s.L,s.R,v,s.uvod);if(!F.eq(sol.x,s.x))throw new Error('šablona nesedí');
    const steps=[H('a) první výraz'),S(s.kroky[0][0],s.kroky[0][1]),H('b) druhý výraz'),S(s.kroky[1][0],s.kroky[1][1]),H('c) výpočet'),...sol.st];
    const prompt=`<span class="txt">${s.text}<span class="opts"><span><b>a)</b> ${s.q[0]}</span><span><b>b)</b> ${s.q[1]}</span><span><b>c)</b> ${s.q[2]}</span></span></span>`;
    // typická chyba, která náhodou vyjde stejně jako správný výraz (např. polovina), se nehlásí
    const chybyV=s.chyby.map((list,k)=>list.filter(c=>!P.eq(c.p,s.e[k])));
    return{kind:'promenna',v,e:s.e,ans:s.x,unitTxt:s.unit,unit:true,chybyV,
      task:'Slovní úloha s proměnnou. Do a) a b) napište výraz, do c) výsledek. Na papír piš celý postup.',
      prompt,steps,plain:`${s.text} a) ${s.q[0]} b) ${s.q[1]} c) ${s.q[2]}`,
      sol:[polySol(s.e[0],v),polySol(s.e[1],v),numSol(s.x)],
      solH:`a) ${polyH(s.e[0],v)}, b) ${polyH(s.e[1],v)}, c) ${numH(s.x)} ${escT(s.unit)}`,
      trap:'Každou větu zadání přepiš na výraz. Když s celým výrazem dál násobíš nebo ho odečítáš, dej ho do závorky.'};
  }
}
