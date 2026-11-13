'use strict';
// Zarovnání obsahu listu na čtverečky (funkce; napojení na události je v start.js).

// Zarovnání na čtverečky: každý blok v listu musí začínat na čáře mřížky.
// Zlomky, tlačítka a zalomené řádky mají libovolnou výšku, proto se mezera pod blokem dorovná na násobek čtverečku.
function gridSnap(){
  document.querySelectorAll('.sheet').forEach(sh=>{
    if(!sh.getClientRects().length)return;
    const G=parseFloat(getComputedStyle(sh).getPropertyValue('--g'))||22;
    for(const c of sh.children){
      c.style.marginBottom='';
      const cs=getComputedStyle(c);if(cs.display==='none'||cs.position==='absolute')continue;
      const mb=parseFloat(cs.marginBottom)||0;
      // horní hranu listu měříme pokaždé znovu: prohlížeč může mezitím posunout stránku (scroll anchoring)
      const rem=((c.getBoundingClientRect().bottom-sh.getBoundingClientRect().top+mb)%G+G)%G;
      if(rem>0.5&&G-rem>0.5)c.style.marginBottom=(mb+G-rem)+'px';
    }
  });
}
let snapRaf=0;const snapSoon=()=>{cancelAnimationFrame(snapRaf);snapRaf=requestAnimationFrame(gridSnap)};
