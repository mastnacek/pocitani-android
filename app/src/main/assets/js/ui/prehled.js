'use strict';
// Přehled: úspěšnost podle témat a mazání statistik.

// ---------- stats ----------
// úspěšnost posledních (až) 20 prvních pokusů; starší data bez historie berou celkový poměr
const recentPc=s=>s.r&&s.r.length?Math.round(100*[...s.r].filter(c=>c==='1').length/s.r.length):(s.n?Math.round(100*s.ok/s.n):0);
// téma je zvládnuté: aspoň 10 příkladů a z posledních 20 aspoň 80 % napoprvé
function isMastered(s){return !!s&&s.n>=10&&recentPc(s)>=80}
function daysAgo(ts){if(!ts)return null;const a=new Date(),b=new Date(ts);a.setHours(0,0,0,0);b.setHours(0,0,0,0);return Math.round((a-b)/864e5)}
const agoTxt=n=>n===null?'zatím necvičeno':n<=0?'cvičeno dnes':n===1?'cvičeno včera':`cvičeno před ${n} dny`;
function renderStats(){
  const TL=subjTopics();
  const st=id=>store.stats[id]||{ok:0,n:0};
  let rows='';
  TL.forEach((t,i)=>{const s=st(t.id),pc=recentPc(s);
    if(!i||TL[i-1].g!==t.g)rows+=`<tr class="grp"><td colspan="4">${TOPIC_GROUPS[t.g]}</td></tr>`;
    rows+=`<tr><td>${i+1}. ${t.name}${isMastered(s)?' <span class="mast" title="zvládnuto">✓</span>':''}<small>${agoTxt(daysAgo(s.last))}</small></td><td>${s.n}</td><td>${s.n?pc+'\
 %':'–'}</td><td><div class="bar" role="img" aria-label="${pc} procent"><span style="width:${pc}%"></span></div></td></tr>`});
  // doporučení bez zamykání: první téma v pořadí, které ještě nejde, a nejdéle necvičené zvládnuté téma
  const nextI=TL.findIndex(t=>{const s=st(t.id);return s.n<10||recentPc(s)<80});
  const stale=TL.map((t,i)=>({t,i,d:daysAgo(st(t.id).last)})).filter(x=>st(x.t.id).n>=10&&x.d!==null&&x.d>=7).sort((a,b)=>b.d-a.d)[0];
  let tip='';
  if(nextI>=0){const s=st(TL[nextI].id);tip+=`<li><b>Na řadě:</b> ${nextI+1}. ${TL[nextI].name}${s.n?` (teď ${recentPc(s)} % napoprvé, cíl je 80 %)`:''}.</li>`}
  else tip+='<li><b>Všechna témata jdou aspoň na 80 %.</b> Míchej je dohromady jako v testu.</li>';
  if(stale)tip+=`<li><b>Zopakuj:</b> ${stale.i+1}. ${stale.t.name}, ${agoTxt(stale.d)}. Co se dlouho necvičí, zapomíná se.</li>`;
  const days=Object.keys(store.days).length;
  setHTML($('statsOut'),
    `<div class="gen"><h3>Jak postupovat</h3><ul>${tip}<li>Témata jsou seřazená tak, jak na sebe navazují. Postupuj odshora. Když téma jde napoprvé aspoň na 80 %, přidej další. Ke starším se občas\
 vrať, třeba přes „Míchat víc témat dohromady“.</li></ul></div><table class="stats"><thead><tr><th>Téma</th><th>${L('Příkladů',
   'Úloh')}</th><th>Napoprvé</th><th></th></tr></thead><tbody>${rows}</tbody></table><p class="note">Sloupec „Napoprvé“ počítá posledních 20 příkladů z tématu, takže ukazuje, jak to jde teď.\
 Trénovala jsi ${days} ${days===1?'den':(days>=2&&days<=4?'dny':'dní')}. V sešitu\
 chyb ${store.mistakes.length===1?'je':'je'} ${store.mistakes.length} ${store.mistakes.length===1?'příklad':(store.mistakes.length>=2&&store.mistakes.length<=4?'příklady':'příkladů')}.</p>`);
}
let resetArmed=false;
$('resetBtn').onclick=()=>{if(!resetArmed){resetArmed=true;$('resetBtn').textContent='Opravdu smazat? Klikni znovu.';setTimeout(()=>{resetArmed=false;
  $('resetBtn').textContent='Smazat statistiky a sešit chyb'},4000);return}
  store.stats={};store.mistakes=[];store.days={};save();resetArmed=false;$('resetBtn').textContent='Smazat statistiky a sešit chyb';updateBadge();renderStats();updateSession()};
