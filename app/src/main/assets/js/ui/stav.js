'use strict';
// Stav aplikace: uložiště (localStorage), aktuální předmět, téma a série příkladů.

const KEY='barunka-matika-v1';
let store={stats:{},mistakes:[],days:{}};
try{const raw=localStorage.getItem(KEY);if(raw){const s=JSON.parse(raw);store=Object.assign(store,s)}}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(store))}catch(e){}}
const today=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};

const $=id=>document.getElementById(id);
const SERIES=10;
// předmět: matematika, nebo čeština; vybraná témata si každý předmět pamatuje zvlášť
const subjOf=t=>t.subj||'mat';
const SUBJ_DEF={mat:{key:'topics',def:'celacisla'},cj:{key:'topicsCj',def:'cj-shoda'}};
let subject=store.subject==='cj'?'cj':'mat';
const L=(m,c)=>subject==='cj'?c:m;
const subjTopics=()=>TOPICS.filter(t=>subjOf(t)===subject);
function loadTopics(){const d=SUBJ_DEF[subject];const s=new Set((store[d.key]||[d.def]).filter(id=>subjTopics().some(t=>t.id===id)));if(!s.size)s.add(d.def);return s}
const state={topics:loadTopics(),mix:!!store.mix,level:store.level||1,cur:null,attempts:0,counted:false,solved:false,shown:false,fromMistake:false,lastAnswer:'',chat:[],series:{i:0,ok:0}};
if(!state.mix&&state.topics.size>1)state.topics=new Set([[...state.topics][0]]);
const ws={topics:new Set(store.wsTopics||['zlomky','rovnice']),level:store.wsLevel||1};
