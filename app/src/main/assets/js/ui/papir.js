'use strict';
// Papír češtiny (zrnitost a textura listu).

// Papír pro češtinu (Leonardovy zápisníky). Dvě části:
// 1) zrnitost: dvě malé dlaždice z canvasu (jednou, jako bitmapa v CSS),
// 2) drawPaper(list): textura přes celý list do <canvas class="paper"> pod textem, bez opakujících se dlaždic.
//    Náhoda je odvozená ze souřadnic a data-seed (úloha), takže stejná úloha má vždy stejný papír
//    a když list povyroste (odhalené řešení), dosavadní část papíru se nezmění.
// Dřív tu byl SVG filtr feTurbulence: telefon (DPR 3) ho přepočítával při každém překreslení a klepnutí trvalo 400–1100 ms.
let grainDone=false;
function paperGrain(){
  if(grainDone)return;grainDone=true;
  try{
    const tile=(n,dens,alpha)=>{const c=document.createElement('canvas');c.width=c.height=n;const x=c.getContext('2d'),d=x.createImageData(n,n);
      for(let i=0;i<d.data.length;i+=4){const v=Math.random();d.data[i]=96;d.data[i+1]=64;d.data[i+2]=26;d.data[i+3]=v<dens?0:Math.round((v-dens)/(1-dens)*alpha)}
      x.putImageData(d,0,0);return c.toDataURL('image/png')};
    const r=document.documentElement.style;
    r.setProperty('--paper-grain',`url(${tile(173,.5,34)})`);
    r.setProperty('--paper-grain2',`url(${tile(241,.82,46)})`);
  }catch(e){}
}
// deterministická náhoda 0..1 z čísel (hash)
function paperHash(...a){let h=2166136261;for(const v of a){const t=String(v);for(let i=0;i<t.length;i++)h=Math.imul(h^t.charCodeAt(i),16777619)}
  h^=h>>>13;h=Math.imul(h,0x5bd1e995);h^=h>>>15;return (h>>>0)/4294967296}
function drawPaper(sheet){
  if(!sheet||subject!=='cj')return;
  let c=sheet.querySelector(':scope>canvas.paper');
  if(!c){c=document.createElement('canvas');c.className='paper';c.setAttribute('aria-hidden','true');sheet.prepend(c)}
  const W=sheet.clientWidth,H=sheet.clientHeight;if(!W||!H)return;
  const seed=sheet.dataset.seed||sheet.id;
  const dark=getComputedStyle(document.documentElement).colorScheme==='dark';
  const key=`${W}x${H}|${seed}|${dark}`;if(c.dataset.key===key)return;c.dataset.key=key;
  // textura je měkká: stačí nižší rozlišení, nejvýš ~4 Mpx (dlouhý list na tabletu)
  const k=Math.min(window.devicePixelRatio||1,1.5,Math.sqrt(4e6/(W*H)));
  c.width=Math.max(1,Math.round(W*k));c.height=Math.max(1,Math.round(H*k));
  const g=c.getContext('2d');g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,W,H);
  const cs=getComputedStyle(sheet),col=n=>cs.getPropertyValue(n).trim()||'rgba(0,0,0,0)';
  const R=(...a)=>paperHash(seed,...a);
  // 1) nerovnoměrné zažloutnutí: hrubá náhodná mřížka (pevná velikost buňky) rozmazaně zvětšená, dvě měřítka
  const toning=(cell,alpha,layer)=>{const nx=Math.ceil(W/cell)+2,ny=Math.ceil(H/cell)+2,m=document.createElement('canvas');m.width=nx;m.height=ny;
    const mx=m.getContext('2d');mx.fillStyle=col('--tone');
    for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const v=R(layer,x,y);mx.globalAlpha=v*v*alpha;mx.fillRect(x,y,1,1)}
    g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(m,-cell,-cell,nx*cell,ny*cell)};
  toning(220,.55,'a');toning(70,.28,'b');
  // 2) okraje: měkce tmavší po celém obvodu z překrývajících se kruhů (plynule nepravidelná šířka); rohy o něco tmavší
  const edge=col('--edge');
  const blob=(x,y,r,a)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,edge);gr.addColorStop(1,'rgba(0,0,0,0)');
    g.globalAlpha=a;g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)};
  for(let x=0;x<=W;x+=28){blob(x,0,34+R('t',x)*30,.7+R('ta',x)*.3);blob(x,H,34+R('b',x)*30,.7+R('ba',x)*.3)}
  for(let y=0;y<=H;y+=28){blob(0,y,34+R('l',y)*30,.7+R('la',y)*.3);blob(W,y,34+R('r',y)*30,.7+R('ra',y)*.3)}
  g.globalAlpha=1;
  for(const [cx,cy] of [[0,0],[W,0],[0,H],[W,H]]){const r=140+R('c',cx,cy)*90,gr=g.createRadialGradient(cx,cy,0,cx,cy,r);
    gr.addColorStop(0,edge);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(cx-r,cy-r,2*r,2*r)}
  // 3) stopy stáří (foxing): drobné hnědé skvrnky, v každém čtverci 300 px náhodně 0–4, občas shluk
  const fox=col('--foxing'),T=300;
  for(let ty=0;ty<H;ty+=T)for(let tx=0;tx<W;tx+=T){const n=Math.floor(R('f',tx,ty)*R('f2',tx,ty)*5);
    for(let i=0;i<n;i++){const x=tx+R('x',tx,ty,i)*T,y=ty+R('y',tx,ty,i)*T,r=.8+R('r',tx,ty,i)*R('r2',tx,ty,i)*2.6;
      const gr=g.createRadialGradient(x,y,0,x,y,r*2.2);gr.addColorStop(0,fox);gr.addColorStop(.45,fox);gr.addColorStop(1,'rgba(0,0,0,0)');
      g.globalAlpha=.35+R('a',tx,ty,i)*.65;g.fillStyle=gr;g.fillRect(x-r*2.2,y-r*2.2,r*4.4,r*4.4)}}
  g.globalAlpha=1;
  // 4) čáry ručního papíru (chain lines): velmi jemné svislé čáry po ~105 px, mírně zvlněné
  g.strokeStyle=col('--chain');g.lineWidth=1;
  for(let x=20+R('cx')*60,i=0;x<W;x+=95+R('cs',i)*25,i++){g.beginPath();g.moveTo(x,0);
    for(let y=0;y<=H;y+=60)g.lineTo(x+(R('w',i,y)-.5)*1.6,y);g.stroke()}
}
// list se zvětší (odhalené řešení, otočení tabletu) → papír se dokreslí na novou velikost
const paperRO=window.ResizeObserver?new ResizeObserver(es=>{for(const e of es)requestAnimationFrame(()=>drawPaper(e.target))}):null;
['sheet','cmSheet'].forEach(id=>{const el=$(id);if(el&&paperRO)paperRO.observe(el)});
// přepnutí světlého/tmavého režimu systému → jiné barvy papíru
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{drawPaper($('sheet'));drawPaper($('cmSheet'))})}catch(e){}
