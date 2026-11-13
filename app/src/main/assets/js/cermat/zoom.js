'use strict';
// Zvětšení obrázku v testu CERMAT přes celou obrazovku.

// ---------- zvětšení obrázku přes celou obrazovku ----------
// Klepnutí na obrázek v testu: celá obrazovka, zvětšení dvěma prsty nebo dvojitým klepnutím, posun prstem.
// Zavírá se křížkem nebo tlačítkem Zpět (otevření přidá záznam do historie, Zpět ho odebere).
const zoom={el:null,img:null,st:null,s:1,x:0,y:0,pts:new Map(),pinch:null,moved:0,lastTap:0};
function zoomClamp(){
  const W=zoom.st.clientWidth,H=zoom.st.clientHeight,w=zoom.img.offsetWidth*zoom.s,h=zoom.img.offsetHeight*zoom.s;
  zoom.x=w<=W?(W-w)/2:Math.min(0,Math.max(W-w,zoom.x));
  zoom.y=h<=H?(H-h)/2:Math.min(0,Math.max(H-h,zoom.y));
  zoom.img.style.transform=`translate(${zoom.x}px,${zoom.y}px) scale(${zoom.s})`;
}
// výchozí velikost: celý obrázek na obrazovce; zvětšit jde 4× oproti šířce obrazovky (obrázky mají ~620 px, víc rozmazává)
function zoomFit(){
  const W=zoom.st.clientWidth,H=zoom.st.clientHeight,nw=zoom.img.naturalWidth||W,nh=zoom.img.naturalHeight||H;
  const w=Math.min(W,H*nw/nh);zoom.img.style.width=w+'px';zoom.max=4*Math.max(1,W/w);
  zoom.s=1;zoom.x=0;zoom.y=0;zoomClamp();
}
function zoomTo(s,cx,cy){ // nové měřítko, bod (cx,cy) na obrazovce zůstane na místě
  s=Math.min(zoom.max||4,Math.max(1,s));
  const p={x:(cx-zoom.x)/zoom.s,y:(cy-zoom.y)/zoom.s};
  zoom.s=s;zoom.x=cx-s*p.x;zoom.y=cy-s*p.y;zoomClamp();
}
function zoomOpen(src){
  if(!zoom.el){
    const el=document.createElement('div');el.className='zoom';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-label','Zvětšený obrázek');
    setHTML(el,'<div class="zoom-stage"><img alt="" draggable="false"></div><button type="button" class="zoom-x" aria-label="Zavřít">✕</button><p class="zoom-hint">Roztáhni dvěma prsty nebo dvakrát\
 klepni. Na šířku je text větší.</p>');
    document.body.appendChild(el);zoom.el=el;zoom.img=el.querySelector('img');zoom.st=el.querySelector('.zoom-stage');
    el.querySelector('.zoom-x').onclick=()=>history.back();
    zoom.img.onload=zoomFit;
    const st=zoom.st,pos=e=>{const r=st.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
    st.addEventListener('pointerdown',e=>{st.setPointerCapture(e.pointerId);zoom.pts.set(e.pointerId,pos(e));zoom.moved=0;zoom.el.classList.add('used');
      if(zoom.pts.size===2){const [a,b]=[...zoom.pts.values()];zoom.pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:zoom.s}}});
    st.addEventListener('pointermove',e=>{
      if(!zoom.pts.has(e.pointerId))return;const prev=zoom.pts.get(e.pointerId),p=pos(e);zoom.pts.set(e.pointerId,p);
      if(zoom.pts.size>=2&&zoom.pinch){const [a,b]=[...zoom.pts.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);
        zoomTo(zoom.pinch.s*d/Math.max(1,zoom.pinch.d),(a.x+b.x)/2,(a.y+b.y)/2);zoom.moved=99}
      else{zoom.x+=p.x-prev.x;zoom.y+=p.y-prev.y;zoom.moved+=Math.abs(p.x-prev.x)+Math.abs(p.y-prev.y);zoomClamp()}
    });
    const up=e=>{if(!zoom.pts.has(e.pointerId))return;const p=zoom.pts.get(e.pointerId);zoom.pts.delete(e.pointerId);
      if(zoom.pts.size<2)zoom.pinch=null;
      if(e.type==='pointerup'&&zoom.pts.size===0&&zoom.moved<10){const now=Date.now();
        if(now-zoom.lastTap<320){zoomTo(zoom.s>1.2?1:Math.max(2.5,zoom.max/2.5),p.x,p.y);zoom.lastTap=0}else zoom.lastTap=now}};
    ['pointerup','pointercancel'].forEach(t=>st.addEventListener(t,up));
    window.addEventListener('popstate',()=>{if(!zoom.el.hidden){zoom.el.hidden=true;document.body.classList.remove('zoomed');zoom.pts.clear()}});
    window.addEventListener('resize',()=>{if(!zoom.el.hidden)zoomFit()});
  }
  zoom.el.classList.remove('used');zoom.s=1;zoom.x=0;zoom.y=0;zoom.img.style.transform='';
  zoom.el.hidden=false;document.body.classList.add('zoomed');
  if(zoom.img.getAttribute('src')===src&&zoom.img.complete)zoomFit();else zoom.img.src=src;
  history.pushState({zoom:1},'');
}
$('cmSheet')?.addEventListener('click',e=>{const im=e.target.closest('.cm-img');if(im){e.preventDefault();zoomOpen(im.getAttribute('src'))}});
