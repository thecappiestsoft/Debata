/* DEBATA! – Arena Argumentów | js/events.js
   Obsługa zdarzeń: kliknięcia (data-a), pola formularzy (data-bind), skróty klawiszowe. */
'use strict';
/* =====================================================================
   ZDARZENIA
   ===================================================================== */
document.addEventListener('click', e => {
  const el=e.target.closest('[data-a]'); if(!el || el.disabled) return;
  const f=A[el.dataset.a]; if(!f){ console.warn('Brak akcji', el.dataset.a); return; }
  e.preventDefault(); try{ f(el.dataset, el, e); }catch(err){ console.error(err); toast('Błąd: '+err.message,'bad'); }
});
const CHG = {
  speakers: el => { const d=S.current; d.speakers=+el.value; if(d.teamSize<d.speakers) d.teamSize=d.speakers; fixSp(d); save(); render(); },
  settingsSpeakers: el => { const st=S.settings, n=+el.value; st.speakers=n; const sp=st.times.full.sp; while(sp.length<n) sp.push(180); sp.length=n; save(); render(); },
  trPick: el => { const t=S.theses.find(x=>x.id===el.value); if(t){ S.training.thesis=clone(t); S.training.stance=null; S.training.counter=''; save(); render(); } }
};
function onBind(e){
  const el=e.target;
  if(el.dataset.ui!==undefined){ ui[el.dataset.ui]=el.value; const tg=el.dataset.target; if(UIREND[tg]&&$('#'+tg)) $('#'+tg).innerHTML=UIREND[tg](); return; }
  if(el.dataset.chg && e.type==='change' && !el.dataset.bind){ CHG[el.dataset.chg](el); return; }
  const p=el.dataset.bind; if(!p) return;
  const isToggle = el.type==='checkbox'||el.tagName==='SELECT'||el.type==='radio';
  if(e.type==='input' && isToggle) return;
  if(e.type==='change' && !isToggle) { saveSoon(); return; }
  let v = el.type==='checkbox' ? el.checked : el.value;
  if(el.dataset.num!==undefined){ v = el.dataset.num==='min' ? Math.max(0,Math.round((parseFloat(String(v).replace(',','.'))||0)*60)) : (parseFloat(String(v).replace(',','.'))||0); }
  if(el.dataset.lines!==undefined) v = String(v).split('\n').map(x=>x.trim()).filter(Boolean);
  setPath(S,p,v); saveSoon();
  if(el.dataset.chg && CHG[el.dataset.chg]) { CHG[el.dataset.chg](el); return; }
  if(el.dataset.rr!==undefined) { save(); render(); return; }
  const live=el.dataset.live;
  if(live==='rem' && S.current){ const t=S.view.team||'P'; const r=$('#rem'); if(r) r.innerHTML=remindersHtml(S.current,t); const pl=$('#plan'); if(pl) pl.innerHTML=planHtml(S.current,t); }
}
document.addEventListener('input', onBind);
document.addEventListener('change', onBind);
document.addEventListener('keydown', e => {
  if(e.key==='Escape'){ const m=document.querySelector('.mback'); if(m){ m.remove(); return; } if(ui.sheet){ A.sheet(); return; } }
  if(e.key==='Enter' && e.target.id==='pinIn') A.pinUnlock();
  if(e.key==='Enter' && e.target.id==='m-pin'){ const b=[...document.querySelectorAll('.mbtns .btn')].pop(); b&&b.click(); }
  // spacja = start/pauza timera na ekranie debaty (gdy nie piszemy)
  if(e.code==='Space' && ['debate','prep'].includes(S.view.name) && !/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName) && !document.querySelector('.mback')){ e.preventDefault(); const t=activeTimer(); if(t){ t.running?A.tPause():A.tStart(); } }
});
window.addEventListener('beforeunload', save);
window.addEventListener('error', e => { console.error(e.error||e.message); });
