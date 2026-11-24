/* DEBATA! – Arena Argumentów | js/utils.js
   Funkcje pomocnicze: $, esc, uid, formatowanie czasu i dat, setPath. */
'use strict';
/* =====================================================================
   NARZĘDZIA
   ===================================================================== */
const $ = (s,r=document)=>r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Math.random().toString(36).slice(2,10);
const clone = o => JSON.parse(JSON.stringify(o));
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; };
const pick = a => a[Math.floor(Math.random()*a.length)];
const mean = a => a.length ? a.reduce((x,y)=>x+y,0)/a.length : null;
const r1 = v => v==null ? '–' : (Math.round(v*10)/10).toLocaleString(LOC());
function fmt(sec){ const neg = sec < 0; const s = neg ? Math.floor(-sec) : Math.ceil(sec); return (neg?'+':'') + Math.floor(s/60) + ':' + String(s%60).padStart(2,'0'); }
function fmtDur(sec){ sec=Math.round(sec||0); const m=Math.floor(sec/60), s=sec%60; return (m?m+' min ':'')+s+' s'; }
const fdate = ts => ts ? new Date(ts).toLocaleString(LOC(),{dateStyle:'medium',timeStyle:'short'}) : '–';
const minVal = s => Math.round((s/60)*100)/100;
function setPath(o,p,v){ const ks=p.split('.'); let x=o; for(let i=0;i<ks.length-1;i++){ if(x[ks[i]]==null) x[ks[i]] = /^\d+$/.test(ks[i+1]) ? [] : {}; x=x[ks[i]]; } x[ks[ks.length-1]]=v; }
const teamWord = t => t==='P' ? L('Propozycja','Proposition') : L('Opozycja','Opposition');
const other = t => t==='P' ? 'O' : 'P';
