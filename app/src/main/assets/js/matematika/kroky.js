'use strict';
// Pomocné funkce pro postupy řešení (kroky, zvýraznění) společné všem generátorům.

// ================= generators =================
function rfr(maxD,maxN){maxN=maxN||maxD*2;for(;;){const d=ri(2,maxD),n=ri(1,maxN);if(gcd(n,d)===1)return Fr(n,d)}}
const S=(say,math)=>`<span class="say">${say}</span>`+(math?`<span class="m">${math}</span>`:'');
const H=t=>'#H#'+t;
const SEP='<span class="sep">a</span>';
// Zvýraznění v postupech a tipech (všude stejný význam, nejvýš jedno pravidlo na krok):
// K = pravidlo / klíčové slovo (zvýrazňovač), N = co je v kroku nové (modře), X = pozor, past (červeně).
const K=t=>`<b class="hk">${t}</b>`, N=t=>`<b class="hn">${t}</b>`, X=t=>`<b class="hx">${t}</b>`;
function addSub(a,b,op){
  const L=lcm(a.d,b.d),ka=L/a.d,kb=L/b.d,an=a.n*ka,bn=b.n*kb,rn=op==='+'?an+bn:an-bn,res=Fr(rn,L);
  const steps=[];
  if(a.d!==b.d){
    const ints=a.d===1||b.d===1;
    if(!ints) steps.push(S(a.d===L||b.d===L
      ?`Zlomky mají různé jmenovatele (${a.d} a ${b.d}), takže je nejdřív musíme převést na stejný. Číslo ${L} jde vydělit ${a.d} i ${b.d}, proto bude ${K('společný jmenovatel')} ${N(L)}.`
      :`Zlomky mají různé jmenovatele (${a.d} a ${b.d}), takže je nejdřív musíme převést na stejný. Hledáme ${K('nejmenší číslo, které jde vydělit')} ${a.d} i ${b.d}. To je ${N(L)}, bude to společný\
 jmenovatel.`));
    const ext=(f,k)=>f.d===1?`${intH(f.n)} = ${N(rawH(f.n*L,L))}`:(k===1?null:`${fracH(f)} = ${(f.n<0?MINUS:'')+frBox(Math.abs(f.n)+' · '+k,f.d+' · '+k)} = ${N(rawH(f.n*k,L))}`);
    const ex=[ext(a,ka),ext(b,kb)].filter(Boolean);
    const who=[];if(a.d!==1&&ka!==1)who.push(`${fracH(a)} číslem ${ka}`);if(b.d!==1&&kb!==1)who.push(`${fracH(b)} číslem ${kb}`);
    steps.push(S(ints?`Celé číslo zapíšeme jako zlomek se jmenovatelem ${L}.`
      :`Zlomky rozšíříme na jmenovatele ${L}. Rozšířit znamená ${K('vynásobit čitatel i jmenovatel stejným číslem')}, hodnota zlomku se tím nezmění. Rozšiřujeme ${who.join(' a ')}.`,ex.join(SEP)));
  }
  steps.push(S(`${op==='+'?'Sečteme':'Odečteme'} čitatele (čísla nahoře). ${K(`Jmenovatel ${L} zůstane stejný`)}, ten se ${op==='+'?'nesčítá':'neodečítá'}.`,
    `${rawH(an,L)}${opS(op)}${rawH(bn,L)} = ${frBox(intH(an)+opS(op)+(bn<0?'('+intH(bn)+')':bn),L)} = ${N(rawH(rn,L))}`));
  if(res.d!==L&&rn!==0){const g=gcd(rn,L);
    steps.push(S(`Výsledek zkrátíme. Krátit znamená ${K('vydělit čitatel i jmenovatel stejným číslem')}. ${Math.abs(rn)} i ${L} jdou vydělit ${g}, takže:\
 čitatel ${Math.abs(rn)} : ${g} = ${Math.abs(rn)/g}, jmenovatel ${L} : ${g} = ${L/g}.`,`${rawH(rn,L)} = ${(rn<0?MINUS:'')+frBox(Math.abs(rn)+' : '+g,L+' : '+g)} = ${N(fracH(res))}`))}
  return{res,steps,L};
}
function mulSteps(x,y,say){
  const res=F.mul(x,y);const sg=((x.n<0)!==(y.n<0)&&res.n!==0)?MINUS:'';
  const rn=Math.abs(x.n*y.n),rd=x.d*y.d;const steps=[];
  if(x.d===1&&y.d===1){steps.push(S('Vynásobíme.',`${fracHp(x)} · ${fracHp(y)} = ${N(fracH(res))}`));return{res,steps}}
  const top=`${Math.abs(x.n)} · ${Math.abs(y.n)}`,bot=[x.d,y.d].filter(d=>d!==1).join(' · ');
  const intOne=(x.d===1)!==(y.d===1),kk=x.d===1?Math.abs(x.n):Math.abs(y.n);
  steps.push(S(say||(intOne?`Celé číslo ${kk} vynásobíme ${K('jen s čitatelem')}, jmenovatel zůstane. (${kk} je totéž co zlomek ${kk}/1.)`:`Násobíme zlomky: ${K('čitatel krát čitatel (nahoře),\
 jmenovatel krát jmenovatel (dole)')}.`)+(sg?` Jedno číslo je záporné a druhé kladné, proto vyjde ${X('záporný výsledek')}.`:''),
    `${fracHp(x)} · ${fracHp(y)} = ${sg}${frBox(top,bot)} = ${N(sg+rawH(rn,rd))}`));
  if(rn===0)return{res,steps};
  const g=gcd(rn,rd);
  if(g>1){
    steps.push(S(`Výsledek zkrátíme. Krátit znamená ${K('vydělit čitatel i jmenovatel stejným číslem')}. ${rn} i ${rd} jdou vydělit ${g}, takže: čitatel ${rn} : ${g} = ${rn/g},\
 jmenovatel ${rd} : ${g} = ${rd/g}.`,`${sg}${rawH(rn,rd)} = ${sg}${frBox(rn+' : '+g,rd+' : '+g)} = ${N(fracH(res))}`));
    const c1=gcd(Math.abs(x.n),y.d),c2=gcd(Math.abs(y.n),x.d);const pr=[];
    if(c1>1)pr.push(`${Math.abs(x.n)} nahoře a ${y.d} dole vydělit ${c1}`);if(c2>1)pr.push(`${Math.abs(y.n)} nahoře a ${x.d} dole vydělit ${c2}`);
    if(pr.length)steps.push(S(`Tip na příště: ${K('krátit jde už před násobením')}, „do kříže“. Tady stačí ${pr.join(' a ')}. Pak se násobí menší čísla a je menší šance udělat chybu.`));
  }
  return{res,steps};
}
function divSteps(x,y){
  const r=Fr(y.d,y.n);
  const steps=[S(`Dělit zlomkem znamená ${K('násobit jeho převrácenou hodnotou')}. Převrácenou hodnotu dostaneme tak, že prohodíme čitatel a jmenovatel: z ${fracH(y)} je ${N(fracH(r))}. ${X('Obrací\
 se jen druhé číslo')}, první zůstane, jak je.`,`${fracHp(x)} : ${fracHp(y)} = ${fracHp(x)} · ${N(fracHp(r))}`)];
  const m=mulSteps(x,r);return{res:m.res,steps:steps.concat(m.steps)};
}
const okFr=(f,lim)=>f.n!==0&&Math.abs(f.n)<=lim&&f.d<=lim;
const TASKF='Vypočtěte a výsledek zapište zlomkem v základním tvaru.';
