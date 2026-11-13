'use strict';
// Seznam témat (matematika i čeština), generate() a stepHTML(). Načítá se po všech generátorech.

const TOPIC_GROUPS=['Základy počítání','Zlomky, mocniny, procenta','Výrazy','Rovnice','Slovní úlohy'];
// Pořadí = doporučené pořadí procvičování; každé téma staví na předchozích.
const TOPICS=[
  {id:'celacisla',g:0,name:'Celá čísla',ref:'sčítání a odčítání se zápornými čísly',gen:genCela},
  {id:'nasobeni',g:0,name:'Násobení a dělení',ref:'násobilka a znaménka',gen:genNasobeni},
  {id:'prednost',g:0,name:'Přednost operací',ref:'závorky, násobení, sčítání',gen:genPrednost},
  {id:'delitelnost',g:0,name:'Dělitelnost',ref:'největší společný dělitel a nejmenší společný násobek',gen:genDelitelnost},
  {id:'kraceni',g:1,name:'Krácení a převody',ref:'zlomek a desetinné číslo',gen:genKraceni},
  {id:'zlomky',g:1,name:'Zlomky',ref:'jako úloha 3.1',gen:genZlomky},
  {id:'desetinna',g:1,name:'Desetinná čísla',ref:'přednost operací',gen:genDesetinna},
  {id:'mocniny',g:1,name:'Mocniny a odmocniny',ref:'základ pro všechno ostatní',gen:genMocniny},
  {id:'slozene',g:1,name:'Složené zlomky',ref:'jako úloha 3.2',gen:genSlozene},
  {id:'procenta',g:1,name:'Procenta',ref:'slovní úlohy',gen:genProcenta},
  {id:'roznasobovani',g:2,name:'Roznásobování',ref:'jako úloha 4.3',gen:genRoznasobovani},
  {id:'vytykani',g:2,name:'Vytýkání',ref:'rozklad na součin',gen:genVytykani},
  {id:'vzorce',g:2,name:'Vzorce',ref:'jako úlohy 4.1 a 4.2',gen:genVzorce},
  {id:'rovnice',g:3,name:'Rovnice',ref:'jako úloha 5.1',gen:genRovnice},
  {id:'soustavy',g:3,name:'Soustavy rovnic',ref:'jako úloha 5.2',gen:genSoustavy},
  {id:'slovni',g:4,name:'Slovní úlohy',ref:'jako úlohy 1, 2 a 11 až 16',gen:genSlovni},
  {id:'promenna',g:4,name:'Slovní úlohy s proměnnou',ref:'vyjádři výrazem a dopočítej',gen:genPromenna}
];
const GUIDE_DEFAULT={celacisla:'celacisla',nasobeni:'nasobeni',prednost:'prednost',delitelnost:'delitelnost',kraceni:'kraceni',zlomky:'zlomky',slozene:'slozene',desetinna:'desetinna',
  mocniny:'mocniny',procenta:'procenta',roznasobovani:'roznasobovani',vytykani:'vytykani',vzorce:'umocneni',rovnice:'rovnice',soustavy:'soustavy',slovni:'slovni',promenna:'promenna'};
const TRAP_DEFAULT={desetinna:'Pořadí: závorka, pak násobení a dělení, nakonec sčítání a odčítání. <b class="hx">Nepočítej zleva doprava.</b>',
  mocniny:'Mocnina má přednost před násobením. <b class="hx">−3² = −9, ale (−3)² = 9.</b>',procenta:'Vždy si ujasni, <b class="hx">co je 100 %</b>, tedy z čeho procenta počítáš.',
    soustavy:'<b class="hx">Dopočítej obě neznámé.</b> Když spočítáš jen jednu, je bod dolů.'};
// Čeština: skupina témat a témata (generátory jsou v js/cestina/generatory.js).
const CJ_G=TOPIC_GROUPS.length;TOPIC_GROUPS.push('Pravopis');
TOPICS.push(
  {id:'cj-shoda',subj:'cj',g:CJ_G,name:'Shoda přísudku s podmětem',ref:'koncovky -i, -y, -a',gen:genShoda},
  {id:'cj-memne',subj:'cj',g:CJ_G,name:'Mě, nebo mně',ref:'tebe, nebo tobě?',gen:genMeMne}
);

function generate(topicId,level){
  const tp=TOPICS.find(t=>t.id===topicId);const p=tp.gen(level);
  p.topic=topicId;p.level=level;p.guide=p.guide||GUIDE_DEFAULT[topicId];p.trap=p.trap||TRAP_DEFAULT[topicId]||'';p.id=Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  if(!p.sol){
    if(p.kind==='num') p.sol=p.fraction||p.solFmt==='frac'?frSol(p.ans):numSol(p.ans);
    else if(p.kind==='poly') p.sol=polySol(p.ans,p.v);
    else if(p.kind==='eq') p.sol=p.ans.special?(p.ans.special==='none'?'nemá řešení':'nekonečně mnoho řešení'):numSol(p.ans);
    else if(p.kind==='sys') p.sol=[numSol(p.ans.x),numSol(p.ans.y)];
  }
  if(p.solH){} // slovní úloha si výsledek zformátuje sama (jednotka, možnost)
  else if(p.kind==='num') p.solH=p.fraction||p.solFmt==='frac'?fracH(p.ans):numH(p.ans);
  else if(p.kind==='poly') p.solH=polyH(p.ans,p.v,p.dec);
  else if(p.kind==='factor') p.solH=p.sol.replace(/-/g,MINUS).replace(/\^2/g,'²').replace(new RegExp(p.v,'g'),V(p.v));
  else if(p.kind==='eq') p.solH=p.ans.special?(p.ans.special==='none'?'Rovnice nemá řešení.':'Rovnice má nekonečně mnoho řešení (každé reálné číslo).'):`${V(p.v)} = ${numH(p.ans)}`;
  else p.solH=`${V('x')} = ${numH(p.ans.x)}, ${V('y')} = ${numH(p.ans.y)}`;
  return p;
}
function stepHTML(s){
  if(s.startsWith('#H#')) return `<li class="h">${s.slice(3)}</li>`;
  if(s.includes('class="say"')) return `<li>${s}</li>`;
  const m=s.match(/^([\s\S]*?[^\s]):\s([\s\S]+)$/);
  if(m) return `<li><span class="say">${m[1]}.</span><span class="m">${m[2]}</span></li>`;
  if(!s.replace(/<[^>]+>/g,'').includes('=')) return `<li><span class="say">${s}</span></li>`;
  return `<li><span class="m">${s}</span></li>`;
}
