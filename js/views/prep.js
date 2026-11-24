/* DEBATA! – Arena Argumentów | js/views/prep.js
   Widok: przygotowanie drużyn (sekcje A–F, lista kontrolna). */
'use strict';
/* ---------------- PRZYGOTOWANIE ---------------- */
VIEWS.prep = () => {
  const d=S.current; if(!d||d.phase!=='prep'){ S.view={name:'home'}; return VIEWS.home(); }
  const t=S.view.team||'P', p=d.prep[t];
  const dirs = `<details class="ctx"><summary>Kontekst tezy</summary><div class="small" style="opacity:.9">${esc(d.thesis.ctx||'Brak opisu kontekstu.')}</div></details>
   <details class="ctx"><summary>Podpowiedź: możliwe kierunki argumentacji (${teamWord(t).toLowerCase()})</summary><div class="small" style="opacity:.9">${(t==='P'?d.thesis.dirsP:d.thesis.dirsO||[]).length?`Obszary, które warto przemyśleć: ${(t==='P'?d.thesis.dirsP:d.thesis.dirsO).map(esc).join(' · ')}. <i>To tylko kierunki – argumenty i uzasadnienia przygotujcie sami.</i>`:'Brak podpowiedzi dla tej tezy.'}</div></details>`;
  const speakers = Array.from({length:d.speakers},(_,i)=>i+1);
  return `<div class="dhead"><div>${thesisBlock(d.thesis.text,true,dirs)}</div>
    <div class="card" style="margin:0;text-align:center;min-width:250px"><div class="small muted" style="font-family:var(--serif)">Czas przygotowania</div>${timerHtml(true)}${timerCtl(d.timer)}</div></div>
   <div class="row between noprint" style="margin-bottom:.8rem"><h2 style="margin:0">Przygotowanie stanowisk</h2>
    <div class="row">${d.cheatsheet?'<button class="btn ghost" data-a="sheet">📜 Ściągawka</button>':''}<button class="btn ghost" data-a="backToSetup">← Konfiguracja</button><button class="btn gold lg" data-a="startDebate">Rozpocznij debatę →</button></div></div>
   <div class="teamtabs">${['P','O'].map(x=>`<button class="${x} ${t===x?'on':''}" data-a="prepTeam" data-t="${x}">${x==='P'?'▲':'▼'} ${esc(teamName(d,x))}${teamName(d,x)!==teamWord(x)?` <span class="small" style="font-family:var(--sans);font-weight:400">· ${x==='P'?'propozycja':'opozycja'}</span>`:''}</button>`).join('')}</div>
   <div class="prepgrid"><div>
    <div class="card"><div class="sec-t"><span class="par">A</span> Nasze stanowisko</div>
     <textarea class="inp zeszyt" rows="4" data-bind="current.prep.${t}.stance" data-live="rem" placeholder="Jak rozumiemy tezę i dlaczego ${t==='P'?'jej bronimy':'się jej sprzeciwiamy'}…">${esc(p.stance)}</textarea></div>
    <div class="card"><div class="row between"><div class="sec-t" style="border:0;margin:0"><span class="par">B</span> Główne argumenty</div><button class="btn sm pri" data-a="addArg">+ Dodaj argument</button></div>
     ${p.args.length? p.args.map((a,i)=>`<div class="argcard ${t}"><div class="row between"><b style="font-family:var(--serif)">Argument ${i+1}</b><div class="row"><label class="small">Mówca: <select class="inp" style="width:auto;padding:.2rem" data-bind="current.prep.${t}.args.${i}.speaker" data-live="rem"><option value="">—</option>${speakers.map(s=>`<option value="${s}" ${String(a.speaker)===String(s)?'selected':''}>${s}. ${esc(speakerOf(d,t,s))}</option>`).join('')}</select></label><button class="btn sm ghost" data-a="delArg" data-i="${i}" aria-label="Usuń argument">✕</button></div></div>
       <label class="f">Tytuł</label><input class="inp" data-bind="current.prep.${t}.args.${i}.title" data-live="rem" value="${esc(a.title)}" placeholder="Krótka nazwa argumentu">
       <label class="f">Treść</label><textarea class="inp" rows="2" data-bind="current.prep.${t}.args.${i}.content">${esc(a.content)}</textarea>
       <div class="g"><div><label class="f">Uzasadnienie (dlaczego to ważne?)</label><textarea class="inp" rows="2" data-bind="current.prep.${t}.args.${i}.just" data-live="rem">${esc(a.just)}</textarea></div>
       <div><label class="f">Przykład</label><textarea class="inp" rows="2" data-bind="current.prep.${t}.args.${i}.example" data-live="rem">${esc(a.example)}</textarea></div>
       <div><label class="f">Możliwe źródło</label><input class="inp" data-bind="current.prep.${t}.args.${i}.source" value="${esc(a.source)}"></div>
       <div><label class="f">Przewidywany wpływ na odbiorców</label><input class="inp" data-bind="current.prep.${t}.args.${i}.impact" value="${esc(a.impact)}" placeholder="np. przekona osoby, które…"></div></div></div>`).join('') : '<p class="empty">Dodajcie pierwszy argument.</p>'}</div>
    <div class="card"><div class="row between"><div class="sec-t" style="border:0;margin:0"><span class="par">C</span> Przewidywane argumenty przeciwników</div><button class="btn sm pri" data-a="addPred">+ Dodaj</button></div>
     ${p.predicted.length? p.predicted.map((x,i)=>`<div class="row" style="margin:.35rem 0"><span class="tag ${other(t)}">${i+1}</span><input class="inp grow" data-bind="current.prep.${t}.predicted.${i}.text" data-live="rem" value="${esc(x.text)}" placeholder="Co może powiedzieć druga strona?"><button class="btn sm ghost" data-a="delPred" data-i="${i}" aria-label="Usuń">✕</button></div>`).join('') : '<p class="empty">Jakie argumenty może przedstawić druga strona?</p>'}</div>
    <div class="card"><div class="sec-t"><span class="par">D</span> Nasze kontrargumenty</div>
     ${p.predicted.length? p.predicted.map((x,i)=>`<div style="margin:.5rem 0"><label class="f">Odpowiedź na: <i>${esc(x.text||'(argument '+(i+1)+')')}</i></label><textarea class="inp" rows="2" data-bind="current.prep.${t}.predicted.${i}.counter" data-live="rem">${esc(x.counter||'')}</textarea></div>`).join('') : '<p class="empty">Najpierw dopiszcie przewidywane argumenty (C).</p>'}</div>
    <div class="card"><div class="sec-t"><span class="par">E</span> Przykłady i dowody</div><div class="grid2">
     ${[['lit','Przykłady literackie'],['hist','Wydarzenia historyczne'],['data','Dane'],['soc','Obserwacje społeczne'],['life','Przykłady z życia codziennego']].map(([k,l])=>`<div><label class="f">${l}</label><textarea class="inp zeszyt" rows="3" data-bind="current.prep.${t}.evidence.${k}">${esc(p.evidence[k])}</textarea></div>`).join('')}</div></div>
   </div>
   <aside class="prepside">
    <div class="card"><div class="sec-t"><span class="par">✓</span> Lista kontrolna</div><ul class="rem" id="rem">${remindersHtml(d,t)}</ul></div>
    <div class="card"><div class="sec-t"><span class="par">F</span> Podział zadań</div><div id="plan">${planHtml(d,t)}</div></div>
    <div class="card"><div class="sec-t"><span class="par">⇄</span> Przenoszenie przygotowania</div>
     <p class="small muted">Dla pracy na kilku urządzeniach: wyeksportuj przygotowanie drużyny i zaimportuj je na komputerze prowadzącego. Aplikacja nie synchronizuje urządzeń automatycznie.</p>
     <div class="row"><button class="btn sm" data-a="exportPrep">Eksportuj</button><button class="btn sm" data-a="importPrep">Importuj</button></div></div>
   </aside></div>`;
};
function remindersHtml(d,t){
  const p=d.prep[t], L=[]; const it=(ok,txt)=>L.push(`<li class="${ok?'ok':''}">${esc(txt)}</li>`);
  it(p.stance.trim().length>0,'Stanowisko drużyny opisane (A)');
  it(p.args.length>=2,'Co najmniej 2 argumenty (B)');
  p.args.forEach((a,i)=>{ const n=a.title||('Argument '+(i+1)); if(!a.just.trim()) it(false,`„${n}” – dopiszcie uzasadnienie`); if(!a.example.trim()) it(false,`„${n}” – brakuje konkretnego przykładu`); });
  if(p.args.length && p.args.every(a=>a.just.trim()&&a.example.trim())) it(true,'Każdy argument ma uzasadnienie i przykład');
  it(p.predicted.length>0,'Przewidziane argumenty przeciwników (C)');
  p.predicted.forEach((x,i)=>{ if(!(x.counter||'').trim()) it(false,`Brak odpowiedzi na przewidywany argument ${i+1} (D)`); });
  it(p.args.length>0 && p.args.every(a=>a.speaker),'Argumenty przypisane mówcom (F)');
  return L.join('');
}
function planHtml(d,t){ const p=d.prep[t]; let h='';
  for(let i=1;i<=d.speakers;i++){ const a=p.args.filter(x=>String(x.speaker)===String(i)); h+=`<div style="margin:.35rem 0"><b class="small">${i}. ${esc(speakerOf(d,t,i))}</b><div class="small muted">${a.length?a.map(x=>'• '+esc(x.title||'(bez tytułu)')).join('<br>'):'— brak przypisanych argumentów'}</div></div>`; }
  return h; }
