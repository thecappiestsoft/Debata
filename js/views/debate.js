/* DEBATA! – Arena Argumentów | js/views/debate.js
   Widok: ekran debaty – etapy, pytania, replika, głosowanie, ocena jury, panel notatek/punktów/wydarzeń. */
'use strict';
/* ---------------- DEBATA ---------------- */
VIEWS.debate = () => {
  const d=S.current;
  if(!d){ S.view={name:'home'}; return VIEWS.home(); }
  if(d.phase==='setup'){ S.view={name:'setup'}; return VIEWS.setup(); }
  if(d.phase==='prep'){ S.view={name:'prep',team:'P'}; return VIEWS.prep(); }
  const st=d.stages[d.stageIdx]; const timed = st.dur>0 && !['jury','summary'].includes(st.type);
  const spk = st.team ? (st.sp ? `<div class="speaker">Głos ma: <b>${esc(speakerOf(d,st.team,st.sp))}</b> <span class="muted">– ${st.sp}. mówca, ${esc(teamName(d,st.team))}</span></div>` : `<div class="speaker">Głos ma: <b>${esc(teamName(d,st.team))}</b> <span class="muted">– wybrany mówca drużyny</span></div>`) : '';
  return `<div class="dhead"><div>${thesisBlock(d.thesis.text,true)}</div>
     <div class="row noprint"><span class="tag">${d.mode==='quick'?'Szybka debata':'Pełna debata'}</span><span class="tag gray">Etap ${d.stageIdx+1} z ${d.stages.length}</span>${d.tournamentMatchId?'<span class="tag">Turniej</span>':''}</div></div>
   <nav class="prog noprint" aria-label="Postęp debaty">${d.stages.map((s,i)=>`<button class="${i<d.stageIdx?'done':''} ${i===d.stageIdx?'on':''} ${s.team||''}" data-a="jumpStage" data-i="${i}" title="${esc(s.label)}">${ROMAN[phaseNo(s)]}. ${esc(s.label)}${s.team?' · '+(s.team==='P'?'P':'O'):''}</button>`).join('')}</nav>
   <div class="arena">${teamCol(d,'P',st)}
    <section class="card stagecard ${st.team?'t'+st.team:''}">
     <div class="stitle"><span class="roman">${ROMAN[phaseNo(st)]}</span>${esc(st.label)} ${st.team?`<span class="tag ${st.team}">${esc(teamName(d,st.team))}</span>`:''}</div>
     ${spk}
     ${d.activeEvent?`<div class="evban"><div><b>⚡ ${esc(d.activeEvent.name)}</b><div class="small">${esc(d.activeEvent.text)}</div></div><button class="btn sm" style="background:#fff;color:#16233f;border-color:#fff" data-a="clearEvent">Zamknij</button></div>`:''}
     ${timed ? timerHtml()+`<div class="noprint">${timerCtl(d.timer)}</div>` : ''}
     <div class="mctl noprint">
      <button class="btn ghost" data-a="prevStage" ${d.stageIdx===0?'disabled':''}>◀ Poprzedni etap</button>
      <button class="btn ghost" data-a="repeatStage" title="Powtórz bieżący etap">↺ Powtórz etap</button>
      <button class="btn ghost" data-a="pauseDebate">⏸ Wstrzymaj debatę</button>
      <button class="btn ghost" data-a="fullscreen" title="Pełny ekran (projektor)">⛶</button>
      ${st.type!=='summary'?`<button class="btn pri" data-a="nextStage">Następny etap ▶</button>`:''}
     </div>
     ${stageBody(d,st)}
    </section>
    ${teamCol(d,'O',st)}</div>
   ${!['jury','summary'].includes(st.type) ? toolsPanel(d,st) : ''}
   ${d.paused?`<div class="pause"><h2>Debata wstrzymana</h2><p style="font-family:var(--serif);font-size:1.2rem">„${esc(d.thesis.text)}”</p><button class="btn gold lg" data-a="resumeDebate">▶ Wznów debatę</button></div>`:''}`;
};
function teamCol(d,t,st){
  const mem = []; for(let i=1;i<=d.speakers;i++){ const o=speakerObj(d,t,i); const now = st.team===t && (st.sp===i || (!st.sp && st.type!=='qa')); mem.push(`<li class="${now&&st.sp===i?'now':''}"><span><span class="n">${i}.</span>${esc(o?o.name:'Mówca '+i)}</span>${d.scoring&&o&&memberPoints(d,o.id)?`<span>★${memberPoints(d,o.id)}</span>`:''}</li>`); }
  d.people.filter(p=>p.role===t+'m').forEach(p=>mem.push(`<li><span><span class="n">•</span>${esc(p.name)}</span></li>`));
  return `<aside class="teamcol t${t}"><div class="side">${t==='P'?'Propozycja · za tezą':'Opozycja · przeciw tezie'}</div><h3>${esc(teamName(d,t))}</h3><ol>${mem.join('')}</ol>${d.scoring?`<div class="pts">Punkty umiejętności: <b>${teamPoints(d,t)}</b></div>`:''}</aside>`;
}
function tasksHtml(d,st){ const T=stageTasks(d,st); if(!T.length) return ''; const tk=d.ticks[st.key]||{};
  return `<ul class="tasks">${T.map((x,i)=>`<li><label><input type="checkbox" data-bind="current.ticks.${st.key}.${i}" ${tk[i]?'checked':''}> ${esc(x)}</label></li>`).join('')}</ul>`; }
function stageBody(d,st){
  switch(st.type){
    case 'open': return d.marshalApp ? `<div class="sec-t"><span class="par">❧</span> Scenariusz marszałka</div><div class="script">${esc(marshalScript(d))}</div>${tasksHtml(d,st)}` : `<div class="sec-t"><span class="par">❧</span> Zadania marszałka – ${esc((d.people.find(p=>p.role==='marshal')||{}).name||'marszałek')}</div>${tasksHtml(d,st)}<p class="small muted">Na ekranie widoczna jest teza i nazwy drużyn.</p>`;
    case 'speech': case 'closing': return `<div class="sec-t"><span class="par">❧</span> Zadania mówcy</div>${tasksHtml(d,st)}${speakerPlan(d,st)}`;
    case 'qa': return qaBody(d,st);
    case 'rebuttal': return rebuttalBody(d,st);
    case 'vote': return voteBody(d);
    case 'jury': return juryBody(d);
    case 'summary': return summaryBody(d);
  }
  return '';
}
function speakerPlan(d,st){
  const p=d.prep[st.team]; const a = st.sp ? p.args.filter(x=>String(x.speaker)===String(st.sp)) : p.args;
  if(!a.length) return '';
  return `<details class="noprint" style="margin-top:.5rem"><summary class="small" style="cursor:pointer;color:var(--hd)"><b>Plan z przygotowania</b> (${a.length} argument${a.length===1?'':'y'}) – podgląd dla prowadzącego</summary><ul class="small">${a.map(x=>`<li><b>${esc(x.title||'(bez tytułu)')}</b>${x.example?` – przykład: ${esc(x.example)}`:''}</li>`).join('')}</ul></details>`;
}
function qaBody(d,st){
  const ask=d.qaTurn, ans=other(ask), mode=d.qaMode;
  return `${tasksHtml(d,st)}
   <div class="turn"><span class="tag ${ask}" style="font-size:.95rem">Pyta: ${esc(teamName(d,ask))}</span><span class="arrow">➜</span><span class="tag ${ans}" style="font-size:.95rem">Odpowiada: ${esc(teamName(d,ans))}</span><button class="btn sm ghost noprint" data-a="qaSwap">⇄ Zamień</button></div>
   <div class="tabs noprint">${[['oral','Ustnie'],['typed','Wpisywane'],['pool','Z puli']].map(([k,l])=>`<button class="${mode===k?'on':''}" data-a="qaMode" data-m="${k}">${l}</button>`).join('')}</div>
   ${mode==='oral' ? `<div class="center noprint"><p class="small muted">Pytanie i odpowiedź padają ustnie. Zapisz, że pytanie zostało zadane – kolejka przejdzie na drugą drużynę.</p><button class="btn pri" data-a="qaOral">✓ Pytanie zadane i omówione</button></div>`
   : `<div class="noprint">${mode==='pool'?`<div class="row" style="margin-bottom:.4rem"><button class="btn gold sm" data-a="qaDraw">🎲 Wylosuj pytanie do argumentów drużyny ${esc(teamName(d,ans))}</button></div>`:''}
      <label class="f" for="qaQ">Pytanie (${esc(teamName(d,ask))})</label><textarea id="qaQ" class="inp" rows="2">${esc(ui.qaDraft||'')}</textarea>
      <label class="f" for="qaA">Odpowiedź (${esc(teamName(d,ans))})</label><textarea id="qaA" class="inp" rows="2"></textarea>
      <div class="row end" style="margin-top:.4rem"><button class="btn pri" data-a="qaSave">Zapisz pytanie i odpowiedź</button></div></div>`}
   <div class="sec-t" style="margin-top:1rem"><span class="par">❧</span> Przebieg pytań (${d.qa.length})</div>
   ${d.qa.length ? d.qa.map((q,i)=>`<div class="qa"><div class="row between"><span class="tag ${q.ask}">${esc(teamName(d,q.ask))} pyta</span><button class="btn sm ghost noprint" data-a="qaDel" data-i="${i}" aria-label="Usuń">✕</button></div><div class="q">${esc(q.q||'(pytanie zadane ustnie)')}</div>${q.a?`<div class="a">${esc(q.a)}</div>`:''}</div>`).join('') : '<p class="empty">Nie zadano jeszcze pytań.</p>'}`;
}
function rebuttalBody(d,st){
  const t=st.team, r=d.rebuttals[t]||{}, opp=other(t);
  const opts=[...d.prep[opp].args.map(a=>a.title).filter(Boolean), ...d.notes.filter(n=>n.team===opp&&n.kind==='arg').map(n=>n.text)];
  return `${tasksHtml(d,st)}<div class="sec-t"><span class="par">✎</span> Zapis repliki <span class="small muted" style="font-family:var(--sans);font-weight:400">(opcjonalnie – do raportu)</span></div>
   <label class="f">Argument, z którym polemizujemy</label><input class="inp" list="oppArgs" data-bind="current.rebuttals.${t}.target" value="${esc(r.target||'')}"><datalist id="oppArgs">${opts.map(o=>`<option value="${esc(o)}">`).join('')}</datalist>
   <div class="grid2"><div><label class="f">Dlaczego się nie zgadzamy?</label><textarea class="inp" rows="2" data-bind="current.rebuttals.${t}.why">${esc(r.why||'')}</textarea></div>
   <div><label class="f">Nasze uzasadnienie</label><textarea class="inp" rows="2" data-bind="current.rebuttals.${t}.own">${esc(r.own||'')}</textarea></div></div>
   <label class="f">Odwołanie do przedstawionych dowodów</label><input class="inp" data-bind="current.rebuttals.${t}.evidence" value="${esc(r.evidence||'')}">`;
}
function voteBars(d){ const v=d.votes, tot=v.P+v.O+v.U||0; const pc=x=>tot?Math.round(x/tot*100):0;
  return `<div class="bars">${[['P',teamName(d,'P'),'var(--P)'],['U','Niezdecydowani','#8b877c'],['O',teamName(d,'O'),'var(--O)']].map(([k,l,c])=>`<div class="bar"><span class="lb">${esc(l)}</span><span class="tr"><span class="fl" style="width:${pc(v[k])}%;background:${c};display:block"></span></span><span class="v">${v[k]} (${pc(v[k])}%)</span></div>`).join('')}</div><p class="small muted center">Oddano głosów: ${tot}</p>`; }
function voteBody(d){
  const anon = d.voteMode==='anon';
  const opt = `<div class="row noprint" style="justify-content:center;margin-bottom:.5rem"><div class="tabs" style="margin:0">${[['counter','Liczenie głosów (ręce w górę)'],['anon','Głosowanie anonimowe przy komputerze']].map(([k,l])=>`<button class="${d.voteMode===k?'on':''}" data-a="voteMode" data-m="${k}">${l}</button>`).join('')}</div></div>`;
  let body;
  if(anon){
    body = ui.anon==='choose' ? `<div class="anon"><h3>Na którą drużynę głosujesz?</h3><div class="row" style="justify-content:center"><button class="btn P lg" data-a="anonVote" data-k="P">${esc(teamName(d,'P'))}</button><button class="btn lg" data-a="anonVote" data-k="U">Niezdecydowany/a</button><button class="btn O lg" data-a="anonVote" data-k="O">${esc(teamName(d,'O'))}</button></div></div>`
      : `<div class="anon"><h3>Głosowanie anonimowe</h3><p>Podejdź do komputera i kliknij, aby oddać głos. Ekran ukryje wybór po zagłosowaniu.</p><button class="btn gold lg" data-a="anonNext">Oddaję głos</button><p class="small" style="opacity:.75">Liczba oddanych głosów: ${d.votes.P+d.votes.O+d.votes.U}</p></div>`;
  } else {
    body = `<div class="votes">${[['P',teamName(d,'P')],['U','Niezdecydowani'],['O',teamName(d,'O')]].map(([k,l])=>`<div class="vbox ${k}"><div class="l">${esc(l)}</div><div class="c">${d.hideVotes?'?':d.votes[k]}</div><div class="row noprint" style="justify-content:center;margin-top:.5rem"><button class="btn sm" data-a="vote" data-k="${k}" data-s="-1" aria-label="Odejmij głos">−1</button><button class="btn" data-a="vote" data-k="${k}" data-s="1">+1 głos</button></div></div>`).join('')}</div>`;
  }
  return `${opt}${body}<div class="row noprint" style="justify-content:center"><label class="small"><input type="checkbox" data-bind="current.hideVotes" data-rr ${d.hideVotes?'checked':''}> Ukryj wyniki do końca głosowania</label><button class="btn sm ghost danger" data-a="voteReset">Wyzeruj głosy</button></div>
   ${d.hideVotes?'<p class="center small muted">Wyniki są ukryte.</p>':voteBars(d)}
   <p class="small muted center">Wynik publiczności jest prezentowany osobno i nie musi być zgodny z oceną jury.</p>`;
}
function scaleBtns(path,val,cls){ return `<span class="scale">${[1,2,3,4,5].map(v=>`<button class="${+val===v?'on '+cls:''}" data-a="setScore" data-p="${path}" data-v="${v}" aria-label="${v}">${v}</button>`).join('')}</span>`; }
function juryBody(d){
  if(!d.scoring) return `<div class="notice info">Punktacja kryteriów jest wyłączona dla tej debaty. Jury może wskazać zwycięzcę i zapisać uwagi.</div>${juryNotes(d)}${juryVerdict(d)}`;
  const J=jurors(d); if(!ui.juror||!J.includes(ui.juror)) ui.juror=J[0];
  const sc=(d.jury.scores[ui.juror]=d.jury.scores[ui.juror]||{P:{},O:{}});
  const jk = encodeURIComponent(ui.juror);
  const tot = t=>juryTotal(d,t);
  const speakers = []; for(const t of ['P','O']) for(let i=1;i<=d.speakers;i++){ const o=speakerObj(d,t,i); speakers.push({t,i,id:o?o.id:t+i,name:o?o.name:'Mówca '+i}); }
  return `<p class="small muted">Oceny w skali 1–5. ${J.length>1?'Każdy juror wybiera swoje imię i ocenia osobno – wynik to średnia ocen jurorów.':''}</p>
   ${J.length>1?`<div class="tabs">${J.map(j=>`<button class="${ui.juror===j?'on':''}" data-a="pickJuror" data-j="${esc(j)}">${esc(j)}</button>`).join('')}</div>`:''}
   <div class="tblwrap"><table class="t"><thead><tr><th>Kryterium</th><th style="color:var(--P)">${esc(teamName(d,'P'))}</th><th style="color:var(--O)">${esc(teamName(d,'O'))}</th><th>Waga</th></tr></thead><tbody>
    ${CRIT.map(([k,n,ds])=>`<tr><td><b>${n}</b><div class="tiny muted">${ds}</div></td><td>${scaleBtns(`S:${jk}:P:${k}`,sc.P[k],'P')}</td><td>${scaleBtns(`S:${jk}:O:${k}`,sc.O[k],'O')}</td><td class="small">×${String(d.weights[k]).replace('.',',')}</td></tr>`).join('')}
    <tr><td><b>Wynik ważony (średnia jurorów)</b></td><td><b style="font-size:1.1rem;color:var(--P)">${r1(tot('P'))}</b> / 5</td><td><b style="font-size:1.1rem;color:var(--O)">${r1(tot('O'))}</b> / 5</td><td></td></tr></tbody></table></div>
   ${juryNotes(d)}
   <details class="card flat" style="margin-top:.8rem"><summary style="cursor:pointer;font-family:var(--serif);font-weight:700;color:var(--hd)">Ocena indywidualna mówców</summary>
    <div class="tblwrap"><table class="t"><thead><tr><th>Mówca</th>${INDIV.map(x=>`<th class="small">${x[1]}</th>`).join('')}</tr></thead><tbody>
     ${speakers.map(s=>`<tr><td><span class="tag ${s.t}">${s.t}${s.i}</span> ${esc(s.name)}</td>${INDIV.map(([k])=>`<td><select class="inp" style="width:auto;padding:.2rem" data-bind="current.jury.indiv.${s.id}.${k}" data-num><option value="0">–</option>${[1,2,3,4,5].map(v=>`<option ${(+((d.jury.indiv[s.id]||{})[k])===v)?'selected':''}>${v}</option>`).join('')}</select></td>`).join('')}</tr>`).join('')}
    </tbody></table></div></details>
   ${juryVerdict(d)}`;
}
function juryNotes(d){ return `<div class="grid2" style="margin-top:.8rem">${['P','O'].map(t=>`<div><div class="sec-t" style="color:var(--${t})">${esc(teamName(d,t))}</div><label class="f">Mocne strony</label><textarea class="inp" rows="2" data-bind="current.jury.notes.${t}.good">${esc(d.jury.notes[t].good)}</textarea><label class="f">Obszary do poprawy</label><textarea class="inp" rows="2" data-bind="current.jury.notes.${t}.bad">${esc(d.jury.notes[t].bad)}</textarea></div>`).join('')}</div>`; }
function juryVerdict(d){
  const tp=juryTotal(d,'P'), to=juryTotal(d,'O'); const sug = tp==null||to==null ? '' : (tp>to?'P':to>tp?'O':'draw');
  return `<div class="card flat" style="margin-top:.8rem;border-color:var(--gold)"><div class="sec-t"><span class="par">⚖</span> Werdykt jury</div>
   ${sug?`<p class="small">Sugestia na podstawie ocen: <b>${sug==='draw'?'remis':esc(teamName(d,sug))}</b>. Ostateczną decyzję podejmuje jury lub nauczyciel.</p>`:'<p class="small muted">Wprowadź oceny, aby zobaczyć sugestię.</p>'}
   <div class="row"><select class="inp" style="width:auto" data-bind="current.jury.winner" data-rr><option value="">— wybierz —</option><option value="P" ${d.jury.winner==='P'?'selected':''}>${esc(teamName(d,'P'))}</option><option value="O" ${d.jury.winner==='O'?'selected':''}>${esc(teamName(d,'O'))}</option><option value="draw" ${d.jury.winner==='draw'?'selected':''}>Remis</option></select>
   ${d.jury.confirmed?`<span class="tag" style="font-size:.9rem">✓ Zatwierdzono</span><button class="btn sm ghost" data-a="unconfirmJury">Cofnij zatwierdzenie</button>`:`<button class="btn gold" data-a="confirmJury" ${d.jury.winner?'':'disabled'}>Zatwierdź werdykt jury</button>`}</div></div>`;
}
function summaryBody(d){
  const vw=voteWinner(d.votes);
  return `<div class="verdict"><div class="vcard"><div class="small muted">Głosowanie publiczności</div><div class="big">${vw==='P'||vw==='O'?esc(teamName(d,vw)):vw==='draw'?'Remis':'Brak głosów'}</div>${voteBars(d)}</div>
   <div class="vcard"><div class="small muted">Werdykt jury</div><div class="big">${d.jury.confirmed?(d.jury.winner==='draw'?'Remis':esc(teamName(d,d.jury.winner))):'Niezatwierdzony'}</div>${d.scoring?`<p class="small">Wynik ważony: ${esc(teamName(d,'P'))} ${r1(juryTotal(d,'P'))} · ${esc(teamName(d,'O'))} ${r1(juryTotal(d,'O'))}</p>`:''}${!d.jury.confirmed?'<p class="small muted">Aplikacja nie ogłasza zwycięzcy jury bez zatwierdzenia. Wróć do etapu „Ocena jury”, aby zatwierdzić werdykt.</p>':''}</div></div>
   <div class="center" style="margin-top:1rem"><button class="btn gold lg" data-a="finish">Zakończ debatę i pokaż raport</button></div>`;
}
function toolsPanel(d,st){
  const tabs=[['notes','Notatki jury']]; if(d.scoring) tabs.push(['points','Punkty i odznaki']); if(EVENTS.some(e=>d.events[e[0]])) tabs.push(['events','Wydarzenia specjalne']); if(d.cheatsheet) tabs.push(['sheet','Ściągawka']);
  if(!tabs.find(t=>t[0]===ui.dTab)) ui.dTab='notes';
  let body='';
  if(ui.dTab==='notes') body=`<div class="grid2"><div><textarea id="noteTxt" class="inp" rows="3" placeholder="Notatka do bieżącego etapu, np. trafny argument, pytanie, uwaga o kulturze wypowiedzi…"></textarea>
     <div class="row" style="margin-top:.4rem"><select id="noteTeam" class="inp" style="width:auto"><option value="${st.team||''}">${st.team?esc(teamName(d,st.team)):'— drużyna —'}</option>${['P','O'].filter(x=>x!==st.team).map(x=>`<option value="${x}">${esc(teamName(d,x))}</option>`).join('')}${st.team?'<option value="">— ogólna —</option>':''}</select>
      <button class="btn sm" data-a="addNote" data-k="note">Dodaj notatkę</button><button class="btn sm gold" data-a="addNote" data-k="arg">★ Mocny argument</button><button class="btn sm pri" data-a="addNote" data-k="counter">⚔ Skuteczny kontrargument</button></div>
     <p class="tiny muted">Notatki oznaczone ★ i ⚔ trafią do raportu jako najlepsze argumenty i kontrargumenty. Raport korzysta wyłącznie z wpisanych tu obserwacji.</p></div>
     <div style="max-height:260px;overflow:auto">${d.notes.length?d.notes.slice().reverse().map(n=>`<div class="note"><span>${n.kind==='arg'?'★':n.kind==='counter'?'⚔':'✎'}</span><div class="bd">${n.team?`<span class="tag ${n.team}">${esc(teamName(d,n.team))}</span> `:''}${esc(n.text)}<div class="tiny muted">${esc(n.stage)}</div></div><button class="btn sm ghost" data-a="delNote" data-id="${n.id}" aria-label="Usuń">✕</button></div>`).join(''):'<p class="empty">Brak notatek.</p>'}</div></div>`;
  if(ui.dTab==='points') body=`<div class="row"><button class="btn pri" data-a="awardPoints">+ Przyznaj punkty</button><button class="btn gold" data-a="awardBadge">🏅 Przyznaj odznakę</button><span class="small muted">Punkty i odznaki przyznaje juror lub nauczyciel – nie są naliczane automatycznie.</span></div>
     <div class="grid2" style="margin-top:.6rem"><div><div class="sec-t">Punkty</div>${d.points.length?d.points.slice().reverse().map(p=>`<div class="note"><span class="tag ${p.team}">+${p.pts}</span><div class="bd"><b>${esc(SKILLS.find(s=>s[0]===p.skill)?.[1]||p.skill)}</b> – ${esc(p.memberName||teamName(d,p.team))}${p.note?`<div class="tiny muted">${esc(p.note)}</div>`:''}</div><button class="btn sm ghost" data-a="delPoint" data-id="${p.id}" aria-label="Usuń">✕</button></div>`).join(''):'<p class="empty">Brak punktów.</p>'}</div>
     <div><div class="sec-t">Odznaki</div>${d.badges.length?d.badges.map(b=>{const B=BADGES.find(x=>x[0]===b.badge);return `<div class="note"><span>${B?B[3]:'🏅'}</span><div class="bd"><b>${esc(B?B[1]:b.badge)}</b> – ${esc(b.name)}${b.note?`<div class="tiny muted">${esc(b.note)}</div>`:''}</div><button class="btn sm ghost" data-a="delBadge" data-id="${b.id}" aria-label="Usuń">✕</button></div>`}).join(''):'<p class="empty">Brak odznak.</p>'}</div></div>`;
  if(ui.dTab==='events') body=`<div class="grid2">${EVENTS.filter(e=>d.events[e[0]]).map(([k,n,ds])=>`<div class="card flat" style="margin:0"><b style="font-family:var(--serif)">${n}</b><p class="small muted">${ds}</p><div class="row"><button class="btn sm P" data-a="runEvent" data-k="${k}" data-t="P">${esc(teamName(d,'P'))}</button><button class="btn sm O" data-a="runEvent" data-k="${k}" data-t="O">${esc(teamName(d,'O'))}</button></div></div>`).join('')}</div>
     ${d.evlog.length?`<p class="small muted" style="margin-top:.6rem">Uruchomione: ${d.evlog.map(e=>esc(e.name)+' ('+esc(teamName(d,e.team))+')').join(', ')}</p>`:''}`;
  if(ui.dTab==='sheet') body=`<div class="phr grid2">${PHRASES.map(([h,l])=>`<div><h4>${esc(h)}</h4><ul>${l.map(x=>`<li>„${esc(x)}”</li>`).join('')}</ul></div>`).join('')}</div>`;
  return `<section class="card noprint"><div class="tabs">${tabs.map(([k,l])=>`<button class="${ui.dTab===k?'on':''}" data-a="dTab" data-t="${k}">${l}</button>`).join('')}</div>${body}</section>`;
}
