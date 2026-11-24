/* DEBATA! – Arena Argumentów | js/views/teacher.js
   Widok: panel nauczyciela (czasy, ocenianie, wydarzenia, pytania, PIN, kopia zapasowa). */
'use strict';
/* ---------------- PANEL NAUCZYCIELA ---------------- */
VIEWS.teacher = () => {
  if(!isTeacher()) return `<div class="card" style="max-width:420px;margin:2rem auto;text-align:center"><h2>🔒 Panel nauczyciela</h2><p class="muted">Wpisz kod PIN, aby odblokować panel.</p><input id="pinIn" type="password" inputmode="numeric" class="inp" style="text-align:center;font-size:1.4rem;letter-spacing:.3em" autocomplete="off"><div style="margin-top:.8rem"><button class="btn pri" data-a="pinUnlock">Odblokuj</button></div></div>`;
  const st=S.settings, c=S.current;
  const tt=(m)=>{ const t=st.times[m]; let r=timeRow('Przygotowanie',`settings.times.${m}.prep`,t.prep)+timeRow('Otwarcie',`settings.times.${m}.open`,t.open); t.sp.forEach((v,i)=>r+=timeRow(`${i+1}. mówca${m==='full'&&i===t.sp.length-1?' (mowa końcowa)':''}`,`settings.times.${m}.sp.${i}`,v)); r+=timeRow('Pytania',`settings.times.${m}.qa`,t.qa)+timeRow('Replika',`settings.times.${m}.rep`,t.rep); if(m==='quick') r+=timeRow('Podsumowanie',`settings.times.${m}.fin`,t.fin); r+=timeRow('Głosowanie',`settings.times.${m}.vote`,t.vote); return `<table class="t">${r}</table>`; };
  return `<div class="row between"><h2>🔑 Panel nauczyciela</h2><div class="row">${st.pin?'<button class="btn ghost" data-a="lock">🔒 Zablokuj panel</button>':''}<button class="btn" data-a="nav" data-v="library">📚 Biblioteka tez</button></div></div>
   ${c?`<div class="card resume"><div class="grow"><b>Bieżąca debata:</b> ${esc(c.name)} <span class="small muted">(${c.phase==='setup'?'konfiguracja':c.phase==='prep'?'przygotowanie':'etap: '+esc(c.stages[c.stageIdx].label)})</span></div><button class="btn gold" data-a="resume">Przejmij kontrolę</button><button class="btn ghost danger" data-a="abandon">Zakończ bez zapisu</button></div>`:''}
   <div class="grid2"><div>
    <div class="card"><div class="sec-t"><span class="par">§ 1</span> Nowa debata</div><div class="row"><button class="btn pri" data-a="newFull">Tryb A – pełna</button><button class="btn" data-a="newQuick">Tryb B – szybka</button><button class="btn" data-a="training">Tryb C – trening</button><button class="btn" data-a="nav" data-v="tournament">Tryb D – turniej</button></div></div>
    <div class="card"><div class="sec-t"><span class="par">§ 2</span> Domyślne czasy – pełna debata</div>${tt('full')}<div class="row" style="margin-top:.5rem"><label class="small">Domyślna liczba mówców: <select class="inp" style="width:auto" data-bind="settings.speakers" data-num data-chg="settingsSpeakers">${[2,3,4].map(n=>`<option ${st.speakers===n?'selected':''}>${n}</option>`).join('')}</select></label></div></div>
    <div class="card"><div class="sec-t"><span class="par">§ 3</span> Domyślne czasy – szybka debata</div>${tt('quick')}<button class="btn sm ghost" data-a="resetTimes">Przywróć czasy domyślne</button></div>
   </div><div>
    <div class="card"><div class="sec-t"><span class="par">§ 4</span> Ocenianie</div>
     <label class="row"><input type="checkbox" data-bind="settings.scoring" ${st.scoring?'checked':''}> Punktacja, odznaki i ocena kryteriów włączone</label>
     <details style="margin-top:.5rem"><summary style="cursor:pointer;color:var(--hd);font-weight:600">Wagi kryteriów</summary>${weightsTable('settings.weights',st.weights)}</details></div>
    <div class="card"><div class="sec-t"><span class="par">§ 5</span> Wydarzenia specjalne</div>${EVENTS.map(([k,n,ds])=>`<label class="row small" style="margin:.2rem 0;flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" data-bind="settings.events.${k}" ${st.events[k]?'checked':''}> <b>${n}</b> – ${ds}</label>`).join('')}</div>
    <div class="card"><div class="sec-t"><span class="par">§ 6</span> Pytania i pomoce</div>
     <label class="f">Domyślny sposób zadawania pytań</label><select class="inp" data-bind="settings.qaMode">${[['oral','ustnie'],['typed','wpisywane do aplikacji'],['pool','losowane z puli']].map(([v,l])=>`<option value="${v}" ${st.qaMode===v?'selected':''}>${l}</option>`).join('')}</select>
     <label class="f">Pula pytań (jedno w wierszu; {arg} zastępowany jest tytułem argumentu przeciwnika)</label><textarea class="inp" rows="5" data-bind="settings.qPool" data-lines>${esc(poolFor().join('\n'))}</textarea>
     <label class="row" style="margin-top:.5rem"><input type="checkbox" data-bind="settings.cheatsheet" ${st.cheatsheet?'checked':''}> Ściągawka ze zwrotami dostępna</label>
     <label class="row"><input type="checkbox" data-bind="settings.sound" ${st.sound?'checked':''}> Delikatny sygnał dźwiękowy pod koniec czasu</label> <button class="btn sm ghost" data-a="testBeep">♪ Test dźwięku</button></div>
    <div class="card"><div class="sec-t"><span class="par">§ 7</span> Zabezpieczenie</div>
     <p class="small">${st.pin?'Panel jest chroniony kodem PIN. Chronione są też: przyznawanie punktów, zatwierdzanie werdyktu, przeskakiwanie etapów i edycja biblioteki.':'Panel nie jest chroniony. Ustaw PIN, jeśli z komputera korzystają też uczniowie.'}</p>
     <div class="row"><button class="btn" data-a="setPin">${st.pin?'Zmień PIN':'Ustaw PIN'}</button>${st.pin?'<button class="btn ghost danger" data-a="removePin">Usuń PIN</button>':''}</div></div>
    <div class="card"><div class="sec-t"><span class="par">§ 8</span> Dane</div><p class="small muted">Wszystkie dane są przechowywane wyłącznie lokalnie w tej przeglądarce. Uczniowie nie zakładają kont.</p>
     <div class="row"><button class="btn" data-a="backup">Kopia zapasowa</button><button class="btn" data-a="restore">Przywróć z kopii</button><button class="btn danger" data-a="resetAll">Usuń wszystkie dane</button></div></div>
   </div></div>`;
};
