/* DEBATA! – Arena Argumentów | js/views/report.js
   Widok: raport po debacie, informacja zwrotna, rekomendacje, eksport CSV. */
'use strict';
/* ---------------- RAPORT ---------------- */
function feedbackFor(d,t){
  const a=juryAvg(d)[t]; const name=teamName(d,t); const scored=CRIT.filter(([k])=>a[k]!=null); const en=isEN();
  const G=en?CRIT_GOOD_EN:CRIT_GOOD, B=en?CRIT_BAD_EN:CRIT_BAD; const parts=[];
  if(scored.length){
    const sorted=scored.slice().sort((x,y)=>a[y[0]]-a[x[0]]);
    const good=sorted.filter(([k])=>a[k]>=4).slice(0,2).map(([k])=>G[k]);
    const bad=sorted.slice().reverse().filter(([k])=>a[k]<=3).slice(0,2).map(([k])=>B[k]);
    if(good.length) parts.push(en?`Team ${name} ${good.join(' and ')}.`:`Drużyna ${name} ${good.join(' i ')}.`);
    else parts.push(en?`No criterion was scored 4 or higher by the jury – team ${name} has clear room to grow.`:`Żadne z kryteriów nie zostało ocenione przez jury na 4 lub wyżej – drużyna ${name} ma wyraźne pole do rozwoju.`);
    if(bad.length) parts.push(en?`During the debate, ${bad.join(', and ')}.`:`W trakcie debaty ${bad.join(', a ')}.`);
  }
  const over=Object.values(d.stageLog).filter(l=>l.team===t && l.used>(l.allot||l.dur)+3).length;
  if(over) parts.push(en?`Speakers exceeded their time in ${over} ${over===1?'speech':'speeches'}.`:`Mówcy przekroczyli przydzielony czas w ${over} ${over===1?'wystąpieniu':'wystąpieniach'}.`);
  const qa=d.qa.filter(q=>q.ask===t).length; if(d.qa.length) parts.push(en?`The team asked ${qa} ${qa===1?'question':'questions'} in the Q&A.`:`Drużyna zadała ${qa} ${qa===1?'pytanie':(qa>=2&&qa<=4)?'pytania':'pytań'} w części pytań i odpowiedzi.`);
  const n=d.jury.notes[t]; if(n.good.trim()) parts.push((en?'The jury highlighted: ':'Jury podkreśliło: ')+n.good.trim().replace(/\.$/,'')+'.'); if(n.bad.trim()) parts.push((en?'To improve, according to the jury: ':'Do poprawy według jury: ')+n.bad.trim().replace(/\.$/,'')+'.');
  return parts.length ? parts.join(' ') : (en?`No jury scores or notes for team ${name} – no feedback was generated (the app does not invent observations nobody entered).`:`Brak ocen i notatek jury dla drużyny ${name} – informacja zwrotna nie została wygenerowana (aplikacja nie dopisuje obserwacji, których nikt nie wprowadził).`);
}
function recommendations(d){
  const TIP=isEN()?CRIT_TIP_EN:CRIT_TIP;
  const a=juryAvg(d), recs=[]; const crit=CRIT.map(([k])=>({k,v:mean([a.P[k],a.O[k]].filter(x=>x!=null))})).filter(x=>x.v!=null).sort((x,y)=>x.v-y.v);
  crit.slice(0,3).filter(x=>x.v<4).forEach(x=>recs.push(TIP[x.k]));
  if(Object.values(d.stageLog).some(l=>l.used>(l.allot||l.dur)+3) && !recs.includes(TIP.time)) recs.push(TIP.time);
  if(!d.qa.length) recs.push(L('Następnym razem przygotujcie po 2–3 pytania do argumentów przeciwników jeszcze w czasie przygotowania.','Next time, prepare 2–3 questions about the opponents’ arguments during the preparation phase.'));
  if(!d.notes.some(n=>n.kind==='counter') && !Object.values(d.rebuttals).some(r=>r&&r.why)) recs.push(L('Zwróćcie uwagę na bezpośrednie odpowiadanie na argumenty drugiej strony – to serce debaty oksfordzkiej.','Focus on replying directly to the other side’s arguments – that is the heart of an Oxford-style debate.'));
  if(!recs.length) recs.push(L('Spróbujcie trudniejszej tezy albo zamieńcie strony – drużyna broniąca dziś tezy niech następnym razem ją podważa.','Try a harder motion or switch sides – the team that supported the motion today should challenge it next time.'));
  return recs;
}
VIEWS.report = () => {
  const idx=S.history.findIndex(h=>h.id===S.view.id); const d=S.history[idx];
  if(!d) return `<div class="card"><p>Nie znaleziono raportu.</p><button class="btn" data-a="home">Strona główna</button></div>`;
  const vw=voteWinner(d.votes); const av=juryAvg(d);
  const others = d.people.filter(p=>['marshal','juror','aud'].includes(p.role));
  const best=d.notes.filter(n=>n.kind==='arg'), cnt=d.notes.filter(n=>n.kind==='counter'), rebs=['P','O'].filter(t=>d.rebuttals[t]&&(d.rebuttals[t].target||d.rebuttals[t].why));
  const allSpk=[]; for(const t of ['P','O']) for(let i=1;i<=d.speakers;i++){ const o=speakerObj(d,t,i); allSpk.push({t,i,id:o?o.id:t+i,name:o?o.name:'Mówca '+i}); }
  const indivRows = allSpk.filter(s=>d.jury.indiv[s.id] && Object.values(d.jury.indiv[s.id]).some(v=>+v>0));
  const cultPts = t => d.points.filter(p=>p.team===t&&p.skill==='cult').reduce((s,p)=>s+(+p.pts),0);
  const sec=(n,t)=>`<div class="sec-t"><span class="par">§ ${n}</span> ${t}</div>`;
  const dur = d.startedAt&&d.endedAt ? fmtDur((d.endedAt-d.startedAt)/1000) : '–';
  return `<div class="row between noprint" style="margin-bottom:.8rem"><button class="btn ghost" data-a="nav" data-v="history">← Historia</button>
    <div class="row"><button class="btn" data-a="print">🖨 Drukuj</button><button class="btn" data-a="print" data-pdf="1">Zapisz jako PDF</button><button class="btn" data-a="exportCsv" data-id="${d.id}">Eksport CSV</button><button class="btn" data-a="exportJson" data-id="${d.id}">Eksport JSON</button><button class="btn gold" data-a="newFull">Nowa debata</button></div></div>
   <article class="rep">
   <div class="card"><div class="row between"><div><div class="small muted" style="font-family:var(--serif);letter-spacing:.1em;text-transform:uppercase">Raport z debaty oksfordzkiej</div><h2>${esc(d.name)}</h2>
     <div class="small muted">${fdate(d.startedAt||d.created)} · ${d.mode==='quick'?'szybka debata':'pełna debata'} · czas trwania: ${dur}</div></div><div class="logo" style="color:var(--hd)">DEBATA<b style="color:var(--gold)">!</b></div></div>
     <div style="margin-top:.8rem">${thesisBlock(d.thesis.text,true)}</div></div>
   <div class="card">${sec(1,'Wynik debaty')}<div class="verdict">
     <div class="vcard"><div class="small muted">Głosowanie publiczności</div><div class="big">${vw==='P'||vw==='O'?esc(teamName(d,vw)):vw==='draw'?'Remis':'Brak głosów'}</div>${voteBars(Object.assign({},d,{hideVotes:false}))}</div>
     <div class="vcard"><div class="small muted">Werdykt jury</div><div class="big">${d.jury.confirmed?(d.jury.winner==='draw'?'Remis':esc(teamName(d,d.jury.winner))):'Niezatwierdzony'}</div>
      ${d.scoring?`<p>Wynik ważony (skala 1–5):<br><span class="tag P">${esc(teamName(d,'P'))}: ${r1(juryTotal(d,'P'))}</span> <span class="tag O">${esc(teamName(d,'O'))}: ${r1(juryTotal(d,'O'))}</span></p>`:''}
      ${!d.jury.confirmed?'<p class="small muted">Werdykt jury nie został zatwierdzony, dlatego nie jest ogłaszany.</p>':''}</div></div>
     <p class="small muted">Wynik publiczności i ocena jury są prezentowane osobno.</p></div>
   <div class="card">${sec(2,'Skład drużyn i role')}<div class="grid2">${['P','O'].map(t=>`<div><h4 style="color:var(--${t})">${esc(teamName(d,t))} <span class="small muted">(${t==='P'?'propozycja':'opozycja'})</span></h4><ol>${Array.from({length:d.speakers},(_,i)=>`<li>${esc(speakerOf(d,t,i+1))}</li>`).join('')}</ol>${d.people.filter(p=>p.role===t+'m').length?`<p class="small">Członkowie: ${d.people.filter(p=>p.role===t+'m').map(p=>esc(p.name)).join(', ')}</p>`:''}</div>`).join('')}</div>
     <p class="small">Marszałek: ${d.marshalApp?'aplikacja':esc(d.people.filter(p=>p.role==='marshal').map(p=>p.name).join(', ')||'—')} · Jury: ${d.juryApp?'nauczyciel':esc(d.people.filter(p=>p.role==='juror').map(p=>p.name).join(', ')||'—')}${others.filter(p=>p.role==='aud').length?` · Publiczność: ${others.filter(p=>p.role==='aud').length} os.`:''}</p></div>
   ${d.scoring?`<div class="card">${sec(3,'Ocena jury według kryteriów')}
     <div class="grid2"><div class="tblwrap"><table class="t"><thead><tr><th>Kryterium</th><th>Waga</th><th style="color:var(--P)">${esc(teamName(d,'P'))}</th><th style="color:var(--O)">${esc(teamName(d,'O'))}</th></tr></thead><tbody>${CRIT.map(([k,n])=>`<tr><td>${n}</td><td>×${String(d.weights[k]).replace('.',',')}</td><td>${r1(av.P[k])}</td><td>${r1(av.O[k])}</td></tr>`).join('')}<tr><th>Punkty ważone</th><th></th><th>${r1(juryPoints(d,'P'))}</th><th>${r1(juryPoints(d,'O'))}</th></tr></tbody></table></div>
     <div><div class="small muted" style="margin-bottom:.3rem">Mocne i słabe strony (średnia jury, 1–5)</div>${CRIT.map(([k,n])=>`<div class="pair"><span class="lb">${n}</span><span class="two"><span class="tr"><span class="fl" style="display:block;width:${(av.P[k]||0)*20}%;background:var(--P)"></span></span><span class="tr"><span class="fl" style="display:block;width:${(av.O[k]||0)*20}%;background:var(--O)"></span></span></span></div>`).join('')}
      <p class="tiny muted"><span style="color:var(--P)">■</span> ${esc(teamName(d,'P'))} &nbsp; <span style="color:var(--O)">■</span> ${esc(teamName(d,'O'))}</p></div></div></div>`:''}
   <div class="card">${sec(4,'Informacja zwrotna')}${['P','O'].map(t=>`<div class="feedback" style="border-color:var(--${t})">${esc(feedbackFor(d,t))}</div>`).join('')}<p class="tiny muted">Tekst powstaje wyłącznie z ocen, notatek jury i zapisów z przebiegu debaty.</p></div>
   <div class="card">${sec(5,'Najlepsze argumenty i kontrargumenty')}<div class="grid2">
     <div><h4>★ Najlepsze argumenty</h4>${best.length?best.map(n=>`<div class="note"><div class="bd">${n.team?`<span class="tag ${n.team}">${esc(teamName(d,n.team))}</span> `:''}${esc(n.text)}<div class="tiny muted">${esc(n.stage)}</div></div></div>`).join(''):'<p class="empty">Jury nie oznaczyło argumentów.</p>'}</div>
     <div><h4>⚔ Najskuteczniejsze kontrargumenty</h4>${cnt.length?cnt.map(n=>`<div class="note"><div class="bd">${n.team?`<span class="tag ${n.team}">${esc(teamName(d,n.team))}</span> `:''}${esc(n.text)}<div class="tiny muted">${esc(n.stage)}</div></div></div>`).join(''):'<p class="empty">Jury nie oznaczyło kontrargumentów.</p>'}
      ${rebs.map(t=>{const r=d.rebuttals[t];return `<div class="note"><div class="bd"><span class="tag ${t}">Replika: ${esc(teamName(d,t))}</span> ${r.target?`Polemika z: <i>${esc(r.target)}</i>. `:''}${esc(r.why||'')} ${r.own?'– '+esc(r.own):''}</div></div>`}).join('')}</div></div></div>
   <div class="card">${sec(6,'Wyróżnienia indywidualne')}
     ${d.badges.length?`<div>${d.badges.map(b=>{const B=BADGES.find(x=>x[0]===b.badge);return `<span class="badge">${B?B[3]:'🏅'} <b>${esc(B?B[1]:'')}</b> – ${esc(b.name)}</span>`}).join('')}</div>`:'<p class="empty">Nie przyznano odznak.</p>'}
     ${d.points.length?`<h4 style="margin-top:.8rem">Punkty za umiejętności</h4><div class="tblwrap"><table class="t"><thead><tr><th>Osoba / drużyna</th><th>Umiejętność</th><th>Pkt</th><th>Uwagi</th></tr></thead><tbody>${d.points.map(p=>`<tr><td><span class="tag ${p.team}">${p.team}</span> ${esc(p.memberName||teamName(d,p.team))}</td><td>${esc(SKILLS.find(s=>s[0]===p.skill)?.[1]||'')}</td><td>${p.pts}</td><td class="small">${esc(p.note||'')}</td></tr>`).join('')}</tbody></table></div>`:''}
     ${indivRows.length?`<h4 style="margin-top:.8rem">Ocena indywidualna mówców (1–5)</h4><div class="tblwrap"><table class="t"><thead><tr><th>Mówca</th>${INDIV.map(x=>`<th class="small">${x[1]}</th>`).join('')}<th>Średnia</th></tr></thead><tbody>${indivRows.map(s=>{const v=d.jury.indiv[s.id];const vals=INDIV.map(([k])=>+v[k]||0).filter(x=>x>0);return `<tr><td><span class="tag ${s.t}">${s.t}${s.i}</span> ${esc(s.name)}</td>${INDIV.map(([k])=>`<td>${+v[k]||'–'}</td>`).join('')}<td><b>${r1(mean(vals))}</b></td></tr>`}).join('')}</tbody></table></div>`:''}</div>
   <div class="card">${sec(7,'Kultura wypowiedzi')}<div class="grid2">${['P','O'].map(t=>`<div><b style="color:var(--${t})">${esc(teamName(d,t))}</b>: ocena jury ${r1(av[t].cult)} / 5${d.scoring?` · punkty za kulturę dyskusji: ${cultPts(t)}`:''}</div>`).join('')}</div></div>
   <div class="card">${sec(8,'Wykorzystanie czasu')}${Object.keys(d.stageLog).length?`<div class="tblwrap"><table class="t"><thead><tr><th>Etap</th><th>Plan</th><th>Wykorzystano</th><th></th></tr></thead><tbody>${d.stages.filter(s=>d.stageLog[s.key]).map(s=>{const l=d.stageLog[s.key];const ov=l.used>(l.allot||l.dur)+3;return `<tr><td>${esc(s.label)}${s.team?` <span class="tag ${s.team}">${esc(teamName(d,s.team))}</span>`:''}</td><td>${fmtDur(l.dur)}${l.allot&&l.allot!==l.dur?` <span class="tiny muted">(z dodatkowym: ${fmtDur(l.allot)})</span>`:''}</td><td>${fmtDur(l.used)}</td><td>${ov?'<span class="lvl b">przekroczono</span>':'<span class="lvl g">w limicie</span>'}</td></tr>`}).join('')}</tbody></table></div>`:'<p class="empty">Timer nie był uruchamiany – brak danych o czasie.</p>'}</div>
   <div class="card">${sec(9,'Pytania i odpowiedzi')}${d.qa.length?d.qa.map(q=>`<div class="qa"><span class="tag ${q.ask}">${esc(teamName(d,q.ask))} pyta</span><div class="q">${esc(q.q||'(pytanie zadane ustnie)')}</div>${q.a?`<div class="a">${esc(q.a)}</div>`:''}</div>`).join(''):'<p class="empty">Nie zapisano pytań.</p>'}
     ${d.evlog.length?`<h4>Wydarzenia specjalne</h4><ul>${d.evlog.map(e=>`<li>${esc(e.name)} – ${esc(teamName(d,e.team))}${e.extra?': '+esc(e.extra):''}</li>`).join('')}</ul>`:''}</div>
   <div class="card">${sec(10,'Komentarz nauczyciela')}<textarea class="inp zeszyt" rows="4" id="tcomm" data-bind="history.${idx}.teacherComment" placeholder="Uwagi dla klasy…">${esc(d.teacherComment)}</textarea><div class="printonly feedback" id="tcommp">${esc(d.teacherComment)||'—'}</div></div>
   <div class="card">${sec(11,'Rekomendacje i wskazówki do kolejnej debaty')}<ul>${recommendations(d).map(r=>`<li style="margin:.3rem 0">${esc(r)}</li>`).join('')}</ul></div>
   </article>`;
};
function csvOf(d){
  const R=[['Sekcja','Pole','Wartość']]; const add=(a,b,c)=>R.push([a,b,c]);
  add('Debata','Nazwa',d.name); add('Debata','Data',fdate(d.startedAt||d.created)); add('Debata','Tryb',d.mode==='quick'?'szybka':'pełna'); add('Debata','Teza',d.thesis.text);
  add('Debata','Czas trwania',d.startedAt&&d.endedAt?fmtDur((d.endedAt-d.startedAt)/1000):'');
  for(const t of ['P','O']){ add('Drużyna '+teamWord(t),'Nazwa',teamName(d,t)); for(let i=1;i<=d.speakers;i++) add('Drużyna '+teamWord(t),i+'. mówca',speakerOf(d,t,i)); }
  d.people.filter(p=>['marshal','juror','aud'].includes(p.role)).forEach(p=>add('Role',roleLabel(d,p.role),p.name));
  add('Głosowanie','Za propozycją',d.votes.P); add('Głosowanie','Za opozycją',d.votes.O); add('Głosowanie','Niezdecydowani',d.votes.U);
  add('Jury','Werdykt',d.jury.confirmed?(d.jury.winner==='draw'?'remis':teamName(d,d.jury.winner)):'niezatwierdzony');
  const av=juryAvg(d); CRIT.forEach(([k,n])=>{ add('Kryteria – '+teamName(d,'P'),n,av.P[k]==null?'':r1(av.P[k])); add('Kryteria – '+teamName(d,'O'),n,av.O[k]==null?'':r1(av.O[k])); });
  add('Jury','Wynik ważony '+teamName(d,'P'),r1(juryTotal(d,'P'))); add('Jury','Wynik ważony '+teamName(d,'O'),r1(juryTotal(d,'O')));
  d.notes.forEach(n=>add(n.kind==='arg'?'Najlepszy argument':n.kind==='counter'?'Kontrargument':'Notatka',n.team?teamName(d,n.team):'',n.text));
  d.points.forEach(p=>add('Punkty',(p.memberName||teamName(d,p.team))+' – '+(SKILLS.find(s=>s[0]===p.skill)?.[1]||''),p.pts));
  d.badges.forEach(b=>add('Odznaki',(BADGES.find(x=>x[0]===b.badge)||[])[1]||'',b.name));
  d.stages.filter(s=>d.stageLog[s.key]).forEach(s=>add('Czas',s.label+(s.team?' – '+teamName(d,s.team):''),fmtDur(d.stageLog[s.key].used)+' / '+fmtDur(d.stageLog[s.key].dur)));
  d.qa.forEach(q=>add('Pytania',teamName(d,q.ask),(q.q||'(ustnie)')+(q.a?' → '+q.a:'')));
  add('Informacja zwrotna',teamName(d,'P'),feedbackFor(d,'P')); add('Informacja zwrotna',teamName(d,'O'),feedbackFor(d,'O'));
  add('Nauczyciel','Komentarz',d.teacherComment); recommendations(d).forEach((r,i)=>add('Rekomendacje',String(i+1),r));
  return '﻿'+R.map(r=>r.map(c=>isEN()&&typeof c==='string'?trText(c):c).map(c=>'"'+String(c??'').replace(/"/g,'""')+'"').join(';')).join('\r\n');
}
