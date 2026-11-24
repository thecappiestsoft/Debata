/* DEBATA! – Arena Argumentów | js/ui.js
   Okna dialogowe (modal), powiadomienia (toast), pobieranie i import plików, sygnał dźwiękowy. */
'use strict';
/* =====================================================================
   MODAL, TOAST, POBIERANIE, DŹWIĘK
   ===================================================================== */
function modal(title, body, btns=[{label:'Zamknij'}]){
  document.querySelectorAll('.mback').forEach(m=>m.remove());
  const w=document.createElement('div'); w.className='mback';
  w.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h3>${esc(title)}</h3><div class="mbody">${body}</div><div class="mbtns"></div></div>`;
  btns.forEach(b=>{ const x=document.createElement('button'); x.className='btn '+(b.cls||'ghost'); x.textContent=b.label; x.onclick=()=>{ const r=b.fn?b.fn():true; if(r!==false) w.remove(); }; w.querySelector('.mbtns').append(x); });
  w.addEventListener('mousedown',e=>{ if(e.target===w) w.remove(); });
  document.body.append(w);
  const f=w.querySelector('.mbody input:not([type=checkbox]):not([type=file]),.mbody textarea,.mbody select'); if(f) f.focus();
  return w;
}
function confirmBox(msg, fn, ok='Tak', cls='pri'){ modal('Potwierdzenie', `<p>${msg}</p>`, [{label:'Anuluj'},{label:ok,cls,fn:()=>{ setTimeout(fn,0); return true; }}]); }
function toast(msg, kind=''){ const t=document.createElement('div'); t.className='toast '+kind; t.textContent=msg; $('#toasts').append(t); setTimeout(()=>t.remove(), 3200); }
function download(name, text, type='text/plain'){
  try{ const blob=new Blob([text],{type}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.append(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},800); toast('Przygotowano plik: '+name); }
  catch(e){ toast('Pobieranie pliku nie powiodło się w tej przeglądarce.','bad'); }
}
function showData(title, text, fname){
  modal(title, `<p class="small muted">Możesz pobrać plik albo skopiować dane i wkleić je na innym urządzeniu (pole „Importuj”).</p><textarea id="m-data" class="inp" rows="10" readonly>${esc(text)}</textarea>`,
    [{label:'Zamknij'},{label:'Kopiuj',fn:()=>{ const t=$('#m-data'); t.select(); try{ navigator.clipboard.writeText(t.value).then(()=>toast('Skopiowano do schowka'),()=>{document.execCommand('copy');toast('Skopiowano');}); }catch(e){ document.execCommand('copy'); toast('Skopiowano'); } return false; }},{label:'Pobierz plik',cls:'pri',fn:()=>{ download(fname,text,'application/json'); return false; }}]);
}
function importData(title, onData){
  modal(title, `<label class="f">Wybierz plik .json</label><input type="file" id="m-file" accept=".json,application/json" class="inp"><label class="f">…albo wklej dane</label><textarea id="m-paste" class="inp" rows="6"></textarea>`,
   [{label:'Anuluj'},{label:'Importuj',cls:'pri',fn:()=>{
      const f=$('#m-file').files[0], txt=$('#m-paste').value.trim();
      const handle = s => { try{ onData(JSON.parse(s)); }catch(e){ toast('Nie udało się odczytać danych: '+e.message,'bad'); } };
      if(f){ const r=new FileReader(); r.onload=()=>handle(r.result); r.onerror=()=>toast('Błąd odczytu pliku','bad'); r.readAsText(f); return true; }
      if(txt){ handle(txt); return true; }
      toast('Wybierz plik lub wklej dane.','bad'); return false; }}]);
}
let AC=null;
function beep(f=880, ms=180, vol=.08){
  if(!S.settings.sound) return;
  try{ AC = AC || new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==='suspended') AC.resume();
    const o=AC.createOscillator(), g=AC.createGain(), t=AC.currentTime; o.type='sine'; o.frequency.value=f;
    g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+ms/1000); o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+ms/1000+.03);
  }catch(e){}
}
