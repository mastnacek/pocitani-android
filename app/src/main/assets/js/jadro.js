'use strict';
// Jádro: zlomky, výrazy, zobrazení, parser, kontrola odpovědí a pomocné funkce pro text.

// ================= utility =================
const MINUS = '\u2212';
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){const t=a%b;a=b;b=t}return a};
const lcm=(a,b)=>Math.abs(a*b)/gcd(a,b);
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const riNZ=(a,b)=>{let v;do{v=ri(a,b)}while(v===0);return v};
const sgnR=()=>Math.random()<0.5?-1:1;

function Fr(n,d){ if(d===undefined)d=1; if(d===0)throw new Error('Dělení nulou.'); if(d<0){n=-n;d=-d} const g=gcd(n,d)||1; n=n/g; if(n===0)n=0; return {n:n,d:d/g} }
const F={
  add:(a,b)=>Fr(a.n*b.d+b.n*a.d,a.d*b.d),
  sub:(a,b)=>Fr(a.n*b.d-b.n*a.d,a.d*b.d),
  mul:(a,b)=>Fr(a.n*b.n,a.d*b.d),
  div:(a,b)=>{if(b.n===0)throw new Error('Dělení nulou.');return Fr(a.n*b.d,a.d*b.n)},
  neg:a=>Fr(-a.n,a.d),
  eq:(a,b)=>a.n===b.n&&a.d===b.d,
  isZero:a=>a.n===0,
  isInt:a=>a.d===1,
  abs:a=>Fr(Math.abs(a.n),a.d),
  pow:(a,k)=>{let r=Fr(1);for(let i=0;i<k;i++)r=F.mul(r,a);return r},
  dec:s=>{s=String(s).replace(',','.');let neg=false;if(s[0]==='-'){neg=true;s=s.slice(1)}const p=s.split('.');const f=p[1]||'';const n=parseInt((p[0]||'0')+f,10);return Fr(neg?-n:n,Math.pow(10,
    f.length))}
};

// ================= display =================
const V=v=>`<i>${v}</i>`;
const intH=n=>(n<0?MINUS:'')+Math.abs(n);
const frBox=(t,b)=>`<span class="fr"><span>${t}</span><span>${b}</span></span>`;
function fracH(f){ if(f.d===1) return intH(f.n); return (f.n<0?MINUS:'')+frBox(Math.abs(f.n),f.d) }
const fracHp=f=>f.n<0?`(${fracH(f)})`:fracH(f);
function rawH(n,d){ if(d===1) return intH(n); return (n<0?MINUS:'')+frBox(Math.abs(n),d) }
function decStr(f){
  let k=0; while(k<9 && Math.pow(10,k)%f.d!==0) k++;
  if(Math.pow(10,k)%f.d!==0) return null;
  const sc=f.n*(Math.pow(10,k)/f.d); const neg=sc<0; let s=String(Math.abs(sc));
  if(k>0){ s=s.padStart(k+1,'0'); s=s.slice(0,-k)+','+s.slice(-k); s=s.replace(/0+$/,'').replace(/,$/,'') }
  return (neg?MINUS:'')+s;
}
const decHp=f=>f.n<0?`(${decStr(f)})`:decStr(f);
const opS=op=>op==='+'?' + ':' '+MINUS+' ';
const frP=f=>f.d===1?(f.n<0?`(${f.n})`:`${f.n}`):`(${f.n}/${f.d})`;
const frSol=f=>f.d===1?`${f.n}`:`${f.n}/${f.d}`;
const decP=f=>{const s=decStr(f).replace(MINUS,'-').replace(',','.');return f.n<0?`(${s})`:s};
const decSol=f=>decStr(f).replace(MINUS,'-');
function numSol(f){ const s=decStr(f); return s!==null? s.replace(MINUS,'-') : frSol(f) }
function numH(f){ const s=decStr(f); return s!==null? s : fracH(f) }
const numHp=f=>f.n<0?`(${numH(f)})`:numH(f);

// ================= polynomials (array index = degree) =================
const P={
  norm:p=>{const r=p.map(x=>typeof x==='number'?Fr(x):x);while(r.length>1&&F.isZero(r[r.length-1]))r.pop();if(!r.length)r.push(Fr(0));return r},
  add:(a,b)=>{const n=Math.max(a.length,b.length),r=[];for(let i=0;i<n;i++)r.push(F.add(a[i]||Fr(0),b[i]||Fr(0)));return P.norm(r)},
  neg:a=>a.map(F.neg),
  sub:(a,b)=>P.add(a,P.neg(b)),
  mul:(a,b)=>{const r=[];for(let i=0;i<a.length+b.length-1;i++)r.push(Fr(0));a.forEach((x,i)=>b.forEach((y,j)=>{r[i+j]=F.add(r[i+j],F.mul(x,y))}));return P.norm(r)},
  eq:(a,b)=>{a=P.norm(a);b=P.norm(b);return a.length===b.length&&a.every((x,i)=>F.eq(x,b[i]))},
  nz:a=>P.norm(a).filter(c=>!F.isZero(c)).length
};
function monoBody(a,k,v,dec){ const one=a.n===1&&a.d===1; const cs=(k>0&&one)?'':(dec?decStr(a):fracH(a)); const vs=k===0?'':V(v)+(k===1?'':(k===2?'²':(k===3?'³':'<sup>'+k+'</sup>'))); return cs+vs }
// list of {c:Fr,k}
function termsH(list,v,dec){ const t=list.filter(x=>!F.isZero(x.c)); if(!t.length) return '0';
  return t.map((x,i)=>{const neg=x.c.n<0;const body=monoBody(F.abs(x.c),x.k,v,dec);return i===0?(neg?MINUS:'')+body:(neg?' '+MINUS+' ':' + ')+body}).join('') }
function polyTerms(p){ p=P.norm(p); const l=[]; for(let k=p.length-1;k>=0;k--) if(!F.isZero(p[k])) l.push({c:p[k],k}); return l }
const polyH=(p,v,dec)=>termsH(polyTerms(p),v,dec);
function polyPlain(p,v){ const l=polyTerms(p); if(!l.length) return '0'; return l.map(t=>{const cs=t.c.d===1?`${t.c.n}`:`(${t.c.n}/${t.c.d})`;
  return t.k===0?cs:`${cs}*${v}${t.k>1?'^'+t.k:''}`}).join('+').replace(/\+-/g,'-') }
function polySol(p,v){ const l=polyTerms(p); if(!l.length) return '0'; return l.map((t,i)=>{const a=Math.abs(t.c.n),dd=t.c.d; const cs=dd!==1?`${a}/${dd}`:((t.k>0&&a===1)?'':String(a));
  const s=t.c.n<0?'-':(i?'+':''); return s+cs+(t.k===0?'':v+(t.k>1?'^'+t.k:''))}).join('') }
const T=(c,k)=>({c:typeof c==='number'?Fr(c):c,k});
const sumT=list=>{let p=[Fr(0)];list.forEach(t=>{const q=[];for(let i=0;i<t.k;i++)q.push(Fr(0));q.push(t.c);p=P.add(p,q)});return p};
const prodT=(A,B)=>{const o=[];A.forEach(a=>B.forEach(b=>o.push(T(F.mul(a.c,b.c),a.k+b.k))));return o};
const lin=(a,b)=>[T(a,1),T(b,0)]; // a·v + b (written order)
const mono=(c,v)=>termsH([T(c,1)],v); // c·v
const monoD=(c,v)=>termsH([T(c,1)],v,true);

// ================= parser =================
function tokenize(s){
  s=String(s).replace(/[\u2212\u2013\u2014]/g,'-').replace(/[·×⋅]/g,'*').replace(/÷/g,':');
  const toks=[];let i=0;
  while(i<s.length){const ch=s[i];
    if(/\s/.test(ch)){i++;continue}
    if(/[0-9]/.test(ch)){let j=i;while(j<s.length&&/[0-9]/.test(s[j]))j++;if((s[j]===','||s[j]==='.')&&/[0-9]/.test(s[j+1]||'')){j++;while(j<s.length&&/[0-9]/.test(s[j]))j++}toks.push({t:'num',
      v:F.dec(s.slice(i,j))});i=j;continue}
    if(/[a-zA-Z]/.test(ch)){toks.push({t:'var',v:ch.toLowerCase()});i++;continue}
    if(ch==='²'){toks.push({t:'sup',v:2});i++;continue}
    if(ch==='³'){toks.push({t:'sup',v:3});i++;continue}
    if('+-*/:^()√'.includes(ch)){toks.push({t:ch});i++;continue}
    throw new Error('Tomuhle znaku nerozumím: „'+ch+'“.');
  }
  return toks;
}
function parse(s){
  const toks=tokenize(s);let pos=0;
  const peek=()=>toks[pos],next=()=>toks[pos++];
  function expr(){let n=term();while(peek()&&(peek().t==='+'||peek().t==='-')){const op=next().t;n={t:op==='+'?'add':'sub',a:n,b:term()}}return n}
  function term(){let n=unary();for(;;){const p=peek();if(!p)break;
    if(p.t==='*'){next();n={t:'mul',a:n,b:unary()}}
    else if(p.t==='/'||p.t===':'){next();n={t:'div',a:n,b:unary()}}
    else if(p.t==='num'||p.t==='var'||p.t==='('||p.t==='√'){n={t:'mul',a:n,b:power()}}
    else break}return n}
  function unary(){const p=peek();if(p&&p.t==='-'){next();return{t:'neg',a:unary()}}if(p&&p.t==='+'){next();return unary()}return power()}
  function power(){let b=atom();for(;;){const p=peek();
    if(p&&p.t==='^'){next();const e=next();if(!e||e.t!=='num'||e.v.d!==1||e.v.n<0||e.v.n>6)throw new Error('Mocninu napiš jako ^2 nebo ².');b={t:'pow',a:b,e:e.v.n}}
    else if(p&&p.t==='sup'){next();b={t:'pow',a:b,e:p.v}}
    else break}return b}
  function atom(){const p=next();if(!p)throw new Error('Výraz nečekaně končí.');
    if(p.t==='num')return{t:'num',v:p.v};
    if(p.t==='var')return{t:'var',v:p.v};
    if(p.t==='('){const e=expr();const c=next();if(!c||c.t!==')')throw new Error('Chybí zavírací závorka.');return{t:'par',a:e}}
    if(p.t==='√')return{t:'sqrt',a:atom()};
    if(p.t===')')throw new Error('Přebývá zavírací závorka.');
    throw new Error('Na tomhle místě nečekám „'+p.t+'“.')}
  if(!toks.length)throw new Error('Napiš výsledek.');
  const r=expr();if(pos<toks.length)throw new Error(toks[pos].t===')'?'Přebývá zavírací závorka.':'Zápisu nerozumím, zkontroluj ho.');return r;
}
function isqrt(n){if(n<0)return null;const r=Math.round(Math.sqrt(n));return r*r===n?r:null}
function evalAst(n,ctx){
  switch(n.t){
    case 'num':return[n.v];
    case 'var':ctx.vars.add(n.v);return[Fr(0),Fr(1)];
    case 'add':return P.add(evalAst(n.a,ctx),evalAst(n.b,ctx));
    case 'sub':return P.sub(evalAst(n.a,ctx),evalAst(n.b,ctx));
    case 'mul':return P.mul(evalAst(n.a,ctx),evalAst(n.b,ctx));
    case 'neg':return P.neg(evalAst(n.a,ctx));
    case 'par':return evalAst(n.a,ctx);
    case 'div':{const d=P.norm(evalAst(n.b,ctx));if(d.length>1)throw new Error('Dělit tu jde jen číslem.');if(F.isZero(d[0]))throw new Error('Dělení nulou.');return evalAst(n.a,ctx).map(c=>F.div(c,
      d[0]))}
    case 'pow':{const b=evalAst(n.a,ctx);let r=[Fr(1)];for(let i=0;i<n.e;i++)r=P.mul(r,b);return r}
    case 'sqrt':{const v=P.norm(evalAst(n.a,ctx));if(v.length>1)throw new Error('Odmocninu napiš jako číslo.');const a=isqrt(v[0].n),b=isqrt(v[0].d);
      if(a===null||b===null)throw new Error('Tuhle odmocninu neumím, napiš výsledek jako číslo.');return[Fr(a,b)]}
  }
  throw new Error('Zápisu nerozumím.');
}
function analyze(s){const ast=parse(s);const ctx={vars:new Set()};const poly=evalAst(ast,ctx);return{ast,poly:P.norm(poly),vars:[...ctx.vars]}}
function countTerms(n){if(n.t==='add'||n.t==='sub')return countTerms(n.a)+countTerms(n.b);if(n.t==='neg')return countTerms(n.a);return 1}
function factorsOf(n){
  if(n.t==='mul')return factorsOf(n.a).concat(factorsOf(n.b));
  if(n.t==='pow'){const f=factorsOf(n.a);let r=[];for(let i=0;i<n.e;i++)r=r.concat(f);return r}
  if(n.t==='neg')return[{t:'num',v:Fr(-1)}].concat(factorsOf(n.a));
  if(n.t==='par'){const i=n.a;if(i.t==='mul'||i.t==='pow'||i.t==='neg'||i.t==='par')return factorsOf(i);return[n]}
  return[n];
}

// ================= checking =================
const normIn=s=>String(s==null?'':s).trim().replace(/[\u2212\u2013\u2014]/g,'-');
function checkNumber(raw,ans,opts){
  opts=opts||{};
  let s=normIn(raw).replace(/\s+/g,'');
  if(opts.unit) s=s.replace(/(%|kč|kc|korun|let|lidí|žáků|km|cm|m)$/i,'');
  if(!s) return{format:true,msg:'Napiš výsledek.'};
  if(!/^-?\d+([.,]\d+)?(\/-?\d+)?$/.test(s)) return{format:true,msg:'Sem napiš jen výsledné číslo, třeba −7/8 nebo 2,5.'};
  let r;try{r=analyze(s)}catch(e){return{format:true,msg:e.message}}
  if(!F.eq(r.poly[0],ans)) return{ok:false,msg:'Výsledek nesedí.'};
  if(opts.decimal&&s.includes('/')) return{ok:false,near:true,msg:'Hodnota sedí, ale výsledek zapiš desetinným číslem.'};
  if(opts.fraction){
    if(/[.,]/.test(s)) return{ok:false,near:true,msg:'Hodnota sedí, ale výsledek zapiš zlomkem.'};
    const m=s.match(/^-?(\d+)\/-?(\d+)$/);
    if(m&&gcd(+m[1],+m[2])>1&&+m[2]!==1) return{ok:false,near:true,msg:'Hodnota sedí, ale zlomek jde ještě zkrátit. U přijímaček chtějí základní tvar.'};
  }
  return{ok:true};
}
function checkPoly(raw,prob){
  const s=normIn(raw);if(!s)return{format:true,msg:'Napiš výsledek.'};
  let r;try{r=analyze(s)}catch(e){return{format:true,msg:e.message}}
  const bad=r.vars.filter(x=>x!==prob.v);if(bad.length)return{format:true,msg:`V příkladu je proměnná ${prob.v}, ne ${bad[0]}.`};
  if(!P.eq(r.poly,prob.ans))return{ok:false,msg:'Výsledek nesedí.'};
  if(/[()]/.test(s))return{ok:false,near:true,msg:'Hodnota sedí, ale výsledek má být bez závorek.'};
  if(countTerms(r.ast)>Math.max(1,P.nz(r.poly)))return{ok:false,near:true,msg:'Skoro. Ještě sečti členy se stejnou mocninou.'};
  return{ok:true};
}
function checkFactor(raw,prob){
  const s=normIn(raw);if(!s)return{format:true,msg:'Napiš výsledek.'};
  let r;try{r=analyze(s)}catch(e){return{format:true,msg:e.message}}
  const bad=r.vars.filter(x=>x!==prob.v);if(bad.length)return{format:true,msg:`V příkladu je proměnná ${prob.v}, ne ${bad[0]}.`};
  if(!P.eq(r.poly,prob.ans))return{ok:false,msg:'Výsledek nesedí. Zkus svůj součin roznásobit, má vyjít zadaný výraz.'};
  const root=r.ast;
  if(root.t==='add'||root.t==='sub')return{ok:false,near:true,msg:'Hodnota sedí, ale výraz má být zapsaný jako součin.'};
  const fs=factorsOf(root).map(f=>P.norm(evalAst(f,{vars:new Set()})));
  if(prob.mode==='common'){
    const multi=fs.filter(p=>P.nz(p)>=2);
    if(multi.length!==1)return{ok:false,near:true,msg:'Vytkni společného činitele před jednu závorku.'};
    const m=multi[0];
    if(!m.every(c=>c.d===1)||m.reduce((g,c)=>gcd(g,c.n),0)>1)return{ok:false,near:true,msg:'Hodnota sedí, ale ze závorky jde ještě vytknout číslo.'};
    if(F.isZero(m[0]))return{ok:false,near:true,msg:'Hodnota sedí, ale ze závorky jde ještě vytknout '+prob.v+'.'};
  }else{
    const nc=fs.filter(p=>p.length>1);
    if(nc.length<2||nc.some(p=>p.length>2))return{ok:false,near:true,msg:'Hodnota sedí, ale rozlož výraz až na součin dvou závorek.'};
  }
  return{ok:true};
}
function check(prob,inputs){
  switch(prob.kind){
    case 'num':{
      const r=checkNumber(inputs[0],prob.ans,{fraction:prob.fraction,decimal:prob.decimal,unit:prob.unit});
      // slovní úloha: když číslo odpovídá typické chybě, ukaž radu k ní a podtrhni přehlédnutou frázi
      if(!r.ok&&!r.format&&!r.near&&prob.chyby){
        let v=null;try{v=analyze(normIn(inputs[0]).replace(/\s+/g,'').replace(/(%|kč|kc|korun|let|lidí|žáků|km|cm|m)$/i,'')).poly[0]}catch(e){}
        if(v)for(const c of Object.values(prob.chyby))if(c.fr&&F.eq(v,c.fr))return{ok:false,msg:c.rada,pod:c.pod};
      }
      return r;
    }
    case 'promenna':{
      // a), b) výraz s proměnnou: uzná se každý ekvivalentní zápis; c) číslo
      const zpr=[];let vse=true,pod;
      for(let i=0;i<2;i++){const s=normIn(inputs[i]),cast=i?'b)':'a)';
        if(!s)return{format:true,msg:`Doplň výraz do části ${cast}`};
        let r;try{r=analyze(s)}catch(e){return{format:true,msg:`${cast} ${e.message}`}}
        const bad=r.vars.filter(x=>x!==prob.v);if(bad.length)return{format:true,msg:`${cast} V úloze je proměnná ${prob.v}, ne ${bad[0]}.`};
        if(P.eq(r.poly,prob.e[i])){zpr.push(`${cast} sedí.`);continue}
        vse=false;const ch=(prob.chybyV[i]||[]).find(c=>P.eq(r.poly,c.p));zpr.push(`${cast} nesedí. `+(ch?ch.rada:'Zkontroluj, co přesně říká věta v zadání.'));
      }
      const c=checkNumber(inputs[2],prob.ans,{unit:true});
      if(c.format)return{format:true,msg:'c) '+c.msg};
      if(c.ok)zpr.push('c) sedí.');else{vse=false;zpr.push('c) nesedí. Sestav rovnici z výrazů a vyřeš ji.')}
      return vse?{ok:true}:{ok:false,msg:zpr.join(' ')};
    }
    case 'mc':{
      const v=String(inputs[0]||'');if(!v)return{format:true,msg:'Vyber jednu možnost A až E.'};
      if(v===prob.ans)return{ok:true};
      const c=prob.chyby&&prob.chyby[v];
      return{ok:false,msg:c?c.rada:'Tahle možnost nesedí. Dosaď ji do zadání a zkontroluj.',pod:c&&c.pod};
    }
    case 'poly':return checkPoly(inputs[0],prob);
    case 'factor':return checkFactor(inputs[0],prob);
    case 'eq':{
      const raw=normIn(inputs[0]);const tt=raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      const isNone=/nema|zadn|prazdn|∅|\{\s*\}/.test(tt),isAll=/nekonec|kazde|vsechn|^\s*r\s*$/.test(tt);
      if(isNone||isAll){
        if(!prob.ans.special)return{ok:false,msg:'Tahle rovnice jedno řešení má. Počítej dál, až ti vyjde x = číslo.'};
        if(isNone&&isAll)return{format:true,msg:'Vyber jen jednu možnost.'};
        return(prob.ans.special==='none')===isNone?{ok:true}:{ok:false,msg:'Tohle nesedí. Podívej se, jaká rovnost ti zbyla, když se členy s x odečetly: 0 = 0, nebo 0 = jiné číslo?'};
      }
      const s=raw.replace(/\s+/g,'').replace(new RegExp('^'+prob.v+'=','i'),'');
      if(prob.ans.special){const r=checkNumber(s,Fr(0),{});if(r.format)return r;return{ok:false,msg:'Výsledek nesedí. Zkontroluj, co se stalo s členy s x.'}}
      return checkNumber(s,prob.ans,{});
    }
    case 'sys':{
      const a=checkNumber(normIn(inputs[0]).replace(/\s+/g,'').replace(/^x=/i,''),prob.ans.x,{});
      const b=checkNumber(normIn(inputs[1]).replace(/\s+/g,'').replace(/^y=/i,''),prob.ans.y,{});
      if(a.format)return{format:true,msg:'U x: '+a.msg};
      if(b.format)return{format:true,msg:'U y: '+b.msg};
      if(a.ok&&b.ok)return{ok:true};
      if(a.ok)return{ok:false,msg:'x sedí, y ne. Zkontroluj dosazení.'};
      if(b.ok)return{ok:false,msg:'y sedí, x ne.'};
      return{ok:false,msg:'Ani jedna neznámá nesedí.'};
    }
  }
  return{ok:false,msg:'?'};
}

const escT=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
// české číslo: desetinná čárka, mezera mezi tisíci; víc než 3 desetinná místa se zaokrouhlí s „≈“
function fmtNum(n){
  if(typeof n==='string')return n;
  const r=Math.round(n*1000)/1000,approx=Math.abs(r-n)>1e-9;let [i,d]=String(Math.abs(r)).split('.');
  if(i.length>=4)i=i.replace(/\B(?=(\d{3})+(?!\d))/g,' ');
  return (approx?'≈ ':'')+(r<0?MINUS:'')+i+(d?','+d:'');
}
