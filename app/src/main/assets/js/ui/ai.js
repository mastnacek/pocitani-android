'use strict';
// Vysvětlování přes AI (OpenRouter) a nastavení klíče a modelu.

// ---------- AI vysvětlování ----------
const AI=window.AI_CONFIG||{};
const aiOn=()=>!!(AI.apiKey&&AI.model);
function htmlToText(h){
  if(h.startsWith('#H#'))return '\n'+htmlToText(h.slice(3))+':';
  const d=document.createElement('div');setHTML(d,h.replace(/<br\s*\/?>/g,'\n'));
  Array.from(d.querySelectorAll('.fr')).reverse().forEach(f=>{const t=f.children[0].textContent,b=f.children[1].textContent;const w=x=>/^[−-]?[\d,]+$/.test(x.trim())?x.trim():'('+x.trim()+')';
    f.replaceWith(w(t)+'/'+w(b))});
  d.querySelectorAll('.ov').forEach(o=>o.replaceWith('('+o.textContent+')'));
  d.querySelectorAll('sup').forEach(o=>o.replaceWith('^'+o.textContent));
  d.querySelectorAll('.say').forEach(o=>o.append(' '));
  d.querySelectorAll('.sep').forEach(o=>o.replaceWith(' a '));
  return d.textContent.replace(/[ \t]+/g,' ').trim();
}
function problemContext(){
  const p=state.cur;const t=TOPICS.find(x=>x.id===p.topic);
  return `Téma: ${t.name}\nZadání: ${p.task}\n${htmlToText(p.prompt)}\n\nOvěřený správný postup:\n${p.steps.map((s,
    i)=>'- '+htmlToText(s)).join('\n')}\n\nSprávný výsledek: ${htmlToText(p.solH)}\nOdpověď žákyně: ${state.lastAnswer||'(zatím nic nenapsala)'}${p.trap?'\nTypická past u tohoto příkladu:\
 '+htmlToText(p.trap):''}`;
}
const SYS='Jsi trpělivý doučovatel matematiky. Mluvíš s žákyní 9. třídy, která se připravuje na přijímací zkoušky z matematiky (CERMAT) a matematika jí moc nejde. Vysvětluj česky, jednoduše a krátce\
 (nejvýš asi 150 slov), po malých krocích, ke každému kroku řekni proč se dělá. Postup a výsledek, které dostaneš, jsou ověřené a správné: neměň je a nepočítej jinak. Když se ptá, kde udělala chybu,\
 porovnej její odpověď se správným postupem a řekni, ve kterém kroku se chyba nejspíš stala. Nevyčítej, povzbuď. Když něčemu nerozumí, zkus to vysvětlit jinak než v postupu, třeba na jednodušším\
 příkladu s malými čísly. Matematiku piš prostým textem: zlomky jako 3/4, mocniny jako x², násobení jako ·. Nepoužívej LaTeX, tabulky ani nadpisy.';
const SYS_CJ='Jsi trpělivý doučovatel češtiny. Mluvíš s žákyní 9. třídy, která se připravuje na přijímací zkoušky z češtiny (CERMAT). Vysvětluj česky, jednoduše a krátce (nejvýš asi 150 slov).\
 Vysvětlení a správná odpověď, které dostaneš, jsou ověřené: neměň je a nevymýšlej jiná pravidla. Když se ptá, kde udělala chybu, ukaž, které pravidlo přehlédla, a dej jednu podobnou větu na\
 procvičení. Nevyčítej, povzbuď. Piš prostým textem, bez tabulek a nadpisů.';
function esc(s){return s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))}
function fmtAI(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>')}
// Jediné místo, kudy se do DOMU vkládá HTML (fragment se parsuje stejně jako innerHTML).
function setHTML(el,html){el.replaceChildren(document.createRange().createContextualFragment(html))}
function addMsg(cls,html){const d=document.createElement('div');d.className='msg '+cls;setHTML(d,html);$('thread').appendChild(d);return d}
function showAsk(){
  if(!aiOn())return;
  $('ask').hidden=false;const q=$('quick');q.replaceChildren();
  const opts=['Vysvětli mi postup podrobněji','Proč se to dělá zrovna takhle?'];
  if(state.lastAnswer&&!state.solved)opts.unshift('Kde jsem udělala chybu?');
  opts.forEach(o=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=o;b.onclick=()=>askAI(o);q.appendChild(b)});
}
async function askAI(text){
  text=(text||'').trim();if(!text)return;
  const btn=$('askBtn');btn.disabled=true;$('askIn').value='';
  addMsg('me',esc(text));
  if(!state.chat.length)state.chat.push({role:'user',content:problemContext()+'\n\nOtázka žákyně: '+text});
  else state.chat.push({role:'user',content:text});
  const wait=addMsg('ai','Přemýšlím…');
  wait.scrollIntoView({block:'nearest'});
  try{
    const r=await fetch(AI.url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+AI.apiKey,'X-Title':'Pocitani na prijimacky'},
      body:JSON.stringify({model:AI.model,messages:[{role:'system',content:L(SYS,SYS_CJ)}].concat(state.chat),max_tokens:4000,temperature:0.3,reasoning:{effort:'high'}})});
    const data=await r.json();
    if(!r.ok)throw new Error((data&&data.error&&data.error.message)||('HTTP '+r.status));
    const ch=data.choices&&data.choices[0]||{};
    const ans=ch.message&&ch.message.content||'';
    if(!ans)throw new Error('Model nevrátil žádnou odpověď.');
    state.chat.push({role:'assistant',content:ans});
    setHTML(wait,fmtAI(ans));
    if(ch.finish_reason==='length'){const pn=document.createElement('p');pn.className='note';pn.style.margin='8px 0 0';
      pn.textContent='(Odpověď se ořízla – dosáhla limitu tokenů. Napiš „pokračuj“ nebo se zeptej konkrétněji.)';wait.appendChild(pn)};
    wait.scrollIntoView({block:'nearest'});
  }catch(e){
    state.chat.pop();wait.className='msg err';wait.textContent='Vysvětlení se nepodařilo načíst: '+e.message+'. Zkontroluj připojení k internetu.';
  }finally{btn.disabled=false}
}
$('askBtn').onclick=()=>askAI($('askIn').value);
$('askIn').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();askAI($('askIn').value)}});

// Když se na mobilu otevře klávesnice, rolováme zaměřené pole do středu viditelné
// plochy, aby nezůstalo schované pod klávesnicí (WebView se zmenší až během animace).
document.addEventListener('focusin',e=>{
  const el=e.target;
  if(!el||!el.matches||!el.matches('input:not([type=checkbox]),textarea'))return;
  const go=()=>{try{el.scrollIntoView({block:'center',behavior:'smooth'})}catch(_){el.scrollIntoView()}};
  setTimeout(go,250);setTimeout(go,700);
});

// ---------- nastavení klíče a modelu přímo v aplikaci ----------
// Zadaný klíč/model se ukládá do localStorage zařízení a má přednost před local.properties (most AndroidCfg).
const AIKEY='barunka-matika-ai';
try{const raw=localStorage.getItem(AIKEY);if(raw){const s=JSON.parse(raw);if(s.key)AI.apiKey=s.key;if(s.model)AI.model=s.model}}catch(e){}
const aiDlg=$('aiDialog');
function syncAsk(){if(!aiOn()){$('ask').hidden=true}else if(!$('steps').hidden)showAsk()}
$('settingsBtn').onclick=()=>{$('aiKey').value=AI.apiKey||'';$('aiModel').value=AI.model||'';$('settingsBtn').setAttribute('aria-expanded','true');aiDlg.showModal();setTimeout(()=>$('aiKey').focus(),
  50)};
$('aiCancel').onclick=()=>aiDlg.close();
aiDlg.addEventListener('click',e=>{if(e.target!==aiDlg)return;const r=aiDlg.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)aiDlg.close()});
aiDlg.addEventListener('close',()=>$('settingsBtn').setAttribute('aria-expanded','false'));
$('aiSave').onclick=()=>{
  const k=$('aiKey').value.trim(),m=$('aiModel').value.trim();
  AI.apiKey=k;AI.model=m;
  try{localStorage.setItem(AIKEY,JSON.stringify({key:k,model:m}))}catch(e){}
  aiDlg.close();syncAsk();
};
