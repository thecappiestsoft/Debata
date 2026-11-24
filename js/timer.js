/* DEBATA! – Arena Argumentów | js/timer.js
   Timer etapów: start, pauza, reset, ±30 s, kolory końcówki czasu, sygnały. */
'use strict';
/* =====================================================================
   TIMER
   ===================================================================== */
const newTimer = d => ({dur:d||0, planned:d||0, rem:d||0, running:false, start:0, touched:false});
const tRem = t => t.running ? t.rem - (Date.now()-t.start)/1000 : t.rem;
function tStart(t){ if(t.running) return; t.running=true; t.start=Date.now(); t.touched=true; save(); }
function tPause(t){ if(!t.running) return; t.rem=tRem(t); t.running=false; save(); }
function tReset(t){ t.rem=t.planned; t.dur=t.planned; t.running=false; t._last=null; save(); }
function tAdd(t,s){ const r=tRem(t); t.rem += s; t.dur = Math.max(1, t.dur + s); if(t.running){ t.rem = r + s; t.start = Date.now(); } save(); }
function activeTimer(){ const v=S.view.name; if((v==='debate'||v==='prep') && S.current && S.current.timer) return S.current.timer; if(v==='training' && S.training && S.training.timer) return S.training.timer; return null; }
function timerHtml(sm){ return `<div class="timer ${sm?'sm':''}" id="timer" role="timer"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="trk" cx="60" cy="60" r="54"/><circle class="rng" id="tring" cx="60" cy="60" r="54" stroke-dasharray="339.3" stroke-dashoffset="0"/></svg><div class="tval" id="tval">0:00</div><div class="tlab" id="tlab">pozostało</div></div>`; }
function timerCtl(t){ return `<div class="tctl noprint">
  ${t.running ? `<button class="btn pri" data-a="tPause">⏸ Pauza</button>` : `<button class="btn pri" data-a="tStart">▶ Start</button>`}
  <button class="btn ghost" data-a="tReset" title="Przywróć czas etapu">⟲ Reset</button>
  <button class="btn ghost" data-a="tAdd" data-s="-30" title="Skróć o 30 s">−30 s</button>
  <button class="btn ghost" data-a="tAdd" data-s="30" title="Wydłuż o 30 s">+30 s</button></div>`; }
function tick(){
  const t=activeTimer(); const el=$('#tval'); if(!t||!el) return;
  const r=tRem(t), box=$('#timer'), ring=$('#tring');
  el.textContent = fmt(r);
  const thr = Math.min(30, Math.max(5, t.dur*0.2));
  box.classList.toggle('over', r<0); box.classList.toggle('warn', r>=0 && r<=thr && t.dur>0);
  $('#tlab').textContent = r<0 ? 'ponad limit' : (t.running ? 'pozostało' : (t.touched ? 'wstrzymano' : 'gotowe'));
  const C=339.3, frac = t.dur>0 ? clamp(r/t.dur,0,1) : 0; ring.setAttribute('stroke-dashoffset', r<0 ? 0 : C*(1-frac));
  if(t.running){ const prev=t._last; if(prev!=null){ if(prev>10 && r<=10 && r>0) beep(660,160); if(prev>0 && r<=0){ beep(880,320); setTimeout(()=>beep(660,420),380); } } t._last=r; }
}
setInterval(tick, 250);
