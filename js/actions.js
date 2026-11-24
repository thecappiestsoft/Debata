/* DEBATA! – Arena Argumentów | js/actions.js
   Akcje przycisków (obiekt A): wszystko, co dzieje się po kliknięciu elementu z atrybutem data-a. */
'use strict';
/* =====================================================================
   AKCJE
   ===================================================================== */
const A = {};
A.home = () => go('home');
A.theme = (ds) => { if(themeNow()===ds.t) return; S.settings.theme=ds.t; save(); applyTheme(); renderNav(); toast(ds.t==='dark'?L('Motyw ciemny','Dark theme'):L('Motyw jasny','Light theme')); };
A.lang = (ds) => { if(lang()===ds.l) return; S.settings.lang=ds.l; save(); $('.foot').innerHTML=ORIG.foot; $('.brand').innerHTML=ORIG.brand; render(); if(isEN()) trTree(document.body); toast(L('Język: polski','Language: English')); };
A.nav = (ds) => { if(ds.v==='debate') return A.resume(); go(ds.v); };
A.sheet = () => { ui.sheet=!ui.sheet; $('#drawer')&&$('#drawer').classList.toggle('open',ui.sheet); };
function startNew(mode){ const mk=()=>{ S.current=newDebate(mode); ui.juror=null; go('setup'); }; if(S.current && S.current.phase!=='setup') confirmBox('Trwa inna debata. Rozpoczęcie nowej spowoduje jej porzucenie (bez zapisu w historii). Kontynuować?', mk, 'Porzuć i rozpocznij nową', 'danger'); else mk(); }
A.newFull = () => startNew('full');
A.newQuick = () => startNew('quick');
A.resume = () => { const c=S.current; if(!c) return go('home'); if(c.phase==='setup') go('setup'); else if(c.phase==='prep') go('prep',{team:'P'}); else go('debate'); };
A.abandon = () => confirmBox('Porzucić bieżącą debatę? Dane tej debaty zostaną usunięte.', ()=>{ S.current=null; go('home'); }, 'Porzuć', 'danger');
/* setup */
A.setupStep = (ds) => { const d=S.current, i=+ds.i; if(i>=2 && !d.thesis){ toast('Najpierw wybierz tezę.','bad'); d.setupStep=1; save(); return render(); } d.setupStep=clamp(i,0,3); save(); render(); window.scrollTo(0,0); };
A.setMode = (ds) => { const d=S.current; d.mode=ds.m; d.speakers = ds.m==='quick'?2:S.settings.speakers; d.teamSize=d.speakers; d.times=clone(S.settings.times[ds.m]); fixSp(d); save(); render(); };
A.setWork = (ds) => { S.current.work=+ds.w; save(); render(); };
A.pickThesis = (ds) => { const t=S.theses.find(x=>x.id===ds.id); if(!t) return; S.current.thesis=clone(t); S.current.thesisId=t.id; save(); render(); toast('Wybrano tezę'); };
A.randomThesis = () => { const L=filteredTheses(); if(!L.length) return toast('Brak aktywnych tez dla wybranych filtrów.','bad'); const t=pick(L); A.pickThesis({id:t.id}); };
A.addCustomThesis = () => requireTeacher(()=>{ const f=readThesisForm(); if(!f) return; const t=Object.assign({id:'u'+uid(),active:true},f); S.theses.push(t); S.current.thesis=clone(t); S.current.thesisId=t.id; save(); render(); toast('Dodano tezę do biblioteki'); });
A.addNames = () => { const v=$('#names').value; const names=v.split(/[\n,;]+/).map(x=>x.trim()).filter(Boolean); if(!names.length) return toast('Wpisz co najmniej jedno imię.','bad'); names.forEach(n=>S.current.people.push({id:uid(),name:n,role:'aud'})); save(); render(); toast(`Dodano ${names.length} os.`); };
A.delPerson = (ds) => { S.current.people.splice(+ds.i,1); save(); render(); };
A.clearPeople = () => confirmBox('Usunąć wszystkich uczestników z listy?', ()=>{ S.current.people=[]; save(); render(); });
A.splitRandom = () => { const d=S.current, N=d.speakers, per=Math.max(N, +d.teamSize||N); const ppl=shuffle(d.people); let k=0; d.people.forEach(p=>p.role='aud');
  for(let i=1;i<=per;i++) for(const t of ['P','O']){ if(k<ppl.length){ ppl[k++].role = i<=N ? t+i : t+'m'; } }
  if(!d.marshalApp && k<ppl.length) ppl[k++].role='marshal';
  if(!d.juryApp){ for(let j=0;j<(+d.jurorCount||1) && k<ppl.length;j++) ppl[k++].role='juror'; }
  save(); render(); toast('Wylosowano podział klasy'); };
A.startPrep = () => { const d=S.current; if(!d.thesis){ toast('Wybierz tezę.','bad'); d.setupStep=1; return render(); } fixSp(d); d.stages=buildStages(d); d.phase='prep'; d.timer=newTimer(d.times.prep); save(); go('prep',{team:'P'}); };
A.startDebateDirect = () => { const d=S.current; if(!d.thesis){ toast('Wybierz tezę.','bad'); d.setupStep=1; return render(); } fixSp(d); d.stages=buildStages(d); d.phase='prep'; A.startDebate(); };
A.backToSetup = () => { S.current.phase='setup'; S.current.setupStep=3; tPause(S.current.timer); go('setup'); };
/* prep */
A.prepTeam = (ds) => { S.view.team=ds.t; save(); render(); };
const prepOf = () => S.current.prep[S.view.team||'P'];
A.addArg = () => { prepOf().args.push({id:uid(),title:'',content:'',just:'',example:'',source:'',impact:'',speaker:''}); save(); render(); };
A.delArg = (ds) => confirmBox('Usunąć ten argument?', ()=>{ prepOf().args.splice(+ds.i,1); save(); render(); });
A.addPred = () => { prepOf().predicted.push({id:uid(),text:'',counter:''}); save(); render(); };
A.delPred = (ds) => { prepOf().predicted.splice(+ds.i,1); save(); render(); };
A.exportPrep = () => { const d=S.current, t=S.view.team||'P'; showData('Przygotowanie drużyny: '+teamName(d,t), JSON.stringify({type:'debata-prep',team:t,teamName:teamName(d,t),thesis:d.thesis.text,prep:d.prep[t]},null,1), `przygotowanie-${t==='P'?'propozycja':'opozycja'}.json`); };
A.importPrep = () => { const d=S.current, t=S.view.team||'P'; importData('Importuj przygotowanie do drużyny: '+teamName(d,t), data=>{ if(data.type!=='debata-prep'||!data.prep) throw new Error('to nie jest plik przygotowania drużyny'); const p=Object.assign(emptyPrep(),data.prep); p.evidence=Object.assign(emptyPrep().evidence,p.evidence||{}); d.prep[t]=p; save(); render(); toast('Zaimportowano przygotowanie'+(data.thesis&&data.thesis!==d.thesis.text?' (uwaga: inna teza w pliku)':'')); }); };
A.startDebate = () => { const d=S.current; tPause(d.timer); if(d.timer.touched) d.stageLog.prep={used:Math.round(d.timer.dur-tRem(d.timer)),dur:d.timer.dur};
  d.stages=buildStages(d); d.phase='debate'; d.stageIdx=0; d.startedAt=Date.now(); d.timer=newTimer(d.stages[0].dur); ui.dTab='notes'; save(); go('debate'); };
/* timer */
const curTimer = () => activeTimer();
A.tStart = () => { const t=curTimer(); if(!t) return; beep(523,60,.03); tStart(t); render(); };
A.tPause = () => { const t=curTimer(); if(t){ tPause(t); render(); } };
A.tReset = () => { const t=curTimer(); if(t){ tReset(t); render(); } };
A.tAdd = (ds) => { const t=curTimer(); if(!t) return; const f=()=>{ tAdd(t,+ds.s); render(); }; S.view.name==='debate' ? requireTeacher(f) : f(); };
/* stages */
function logStage(d){ const st=d.stages[d.stageIdx]; const t=d.timer; if(st && t && t.touched && st.dur>0){ tPause(t); d.stageLog[st.key]={used:Math.max(0,Math.round(t.dur-tRem(t))),dur:Math.round(t.planned),allot:Math.round(t.dur),team:st.team||null}; } }
function gotoStage(i){ const d=S.current; i=clamp(i,0,d.stages.length-1); logStage(d); d.stageIdx=i; d.timer=newTimer(d.stages[i].dur); d.activeEvent=null; ui.anon='cover'; ui.qaDraft=''; save(); render(); window.scrollTo({top:0,behavior:'smooth'}); }
A.nextStage = () => gotoStage(S.current.stageIdx+1);
A.prevStage = () => requireTeacher(()=>gotoStage(S.current.stageIdx-1));
A.repeatStage = () => requireTeacher(()=>{ const d=S.current, st=d.stages[d.stageIdx]; d.timer=newTimer(st.dur); delete d.stageLog[st.key]; save(); render(); toast('Etap rozpoczęty od nowa'); });
A.jumpStage = (ds) => { const i=+ds.i; if(i===S.current.stageIdx) return; if(i===S.current.stageIdx+1) return A.nextStage(); requireTeacher(()=>gotoStage(i)); };
A.pauseDebate = () => { const d=S.current; if(d.timer) tPause(d.timer); d.paused=true; save(); render(); };
A.resumeDebate = () => { S.current.paused=false; save(); render(); };
A.fullscreen = () => { try{ if(document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); }catch(e){ toast('Pełny ekran niedostępny w tej przeglądarce','bad'); } };
A.dTab = (ds) => { ui.dTab=ds.t; render(); };
/* notes / points / badges / events */
A.addNote = (ds) => { const d=S.current, txt=$('#noteTxt').value.trim(); if(!txt) return toast('Wpisz treść notatki.','bad'); const st=d.stages[d.stageIdx]; d.notes.push({id:uid(),kind:ds.k,team:$('#noteTeam').value,text:txt,stage:st.label+(st.team?' – '+teamName(d,st.team):''),t:Date.now()}); save(); render(); toast(ds.k==='arg'?'Oznaczono mocny argument':ds.k==='counter'?'Oznaczono skuteczny kontrargument':'Dodano notatkę'); };
A.delNote = (ds) => { const d=S.current; d.notes=d.notes.filter(n=>n.id!==ds.id); save(); render(); };
function memberSelect(d,id){ let o='<option value="">— cała drużyna —</option>'; for(const t of ['P','O']) for(let i=1;i<=d.speakers;i++){ const p=speakerObj(d,t,i); o+=`<option value="${t}|${p?p.id:t+i}|${esc(p?p.name:'Mówca '+i)}">${teamWord(t)} – ${esc(p?p.name:'Mówca '+i)}</option>`; } return `<select id="${id}" class="inp">${o}</select>`; }
A.awardPoints = () => requireTeacher(()=>{ const d=S.current, st=d.stages[d.stageIdx];
  modal('Przyznaj punkty za umiejętność', `<label class="f">Drużyna</label><select id="m-team" class="inp"><option value="P" ${st.team!=='O'?'selected':''}>${esc(teamName(d,'P'))}</option><option value="O" ${st.team==='O'?'selected':''}>${esc(teamName(d,'O'))}</option></select>
   <label class="f">Mówca (opcjonalnie)</label>${memberSelect(d,'m-mem')}
   <label class="f">Za co?</label><select id="m-skill" class="inp">${SKILLS.map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select>
   <label class="f">Liczba punktów</label><select id="m-pts" class="inp">${[1,2,3].map(v=>`<option>${v}</option>`).join('')}</select>
   <label class="f">Uzasadnienie (krótko)</label><input id="m-note" class="inp" placeholder="np. trafny przykład z „Lalki”">`,
   [{label:'Anuluj'},{label:'Przyznaj',cls:'pri',fn:()=>{ const mm=$('#m-mem').value.split('|'); const team = mm[0] ? mm[0] : $('#m-team').value; d.points.push({id:uid(),team,member:mm[1]||null,memberName:mm[2]||'',skill:$('#m-skill').value,pts:+$('#m-pts').value,note:$('#m-note').value.trim(),stage:st.label}); save(); render(); toast('Przyznano punkty'); }}]); });
A.delPoint = (ds) => requireTeacher(()=>{ const d=S.current; d.points=d.points.filter(p=>p.id!==ds.id); save(); render(); });
A.awardBadge = () => requireTeacher(()=>{ const d=S.current;
  modal('Przyznaj odznakę', `<label class="f">Odznaka</label><select id="m-b" class="inp">${BADGES.map(([k,n,ds,ic])=>`<option value="${k}">${ic} ${n} – ${ds}</option>`).join('')}</select>
   <label class="f">Dla kogo?</label><select id="m-who" class="inp">${['P','O'].map(t=>`<option value="${t}|team|${esc(teamName(d,t))}">Cała drużyna: ${esc(teamName(d,t))}</option>`).join('')}${(()=>{let o='';for(const t of ['P','O']) for(let i=1;i<=d.speakers;i++){const p=speakerObj(d,t,i);o+=`<option value="${t}|${p?p.id:t+i}|${esc(p?p.name:'Mówca '+i+' ('+teamName(d,t)+')')}">${esc(p?p.name:'Mówca '+i)} (${esc(teamName(d,t))})</option>`;}return o;})()}</select>
   <label class="f">Uzasadnienie</label><input id="m-note" class="inp">`,
   [{label:'Anuluj'},{label:'Przyznaj odznakę',cls:'gold',fn:()=>{ const w=$('#m-who').value.split('|'); d.badges.push({id:uid(),badge:$('#m-b').value,team:w[0],member:w[1],name:w[2],note:$('#m-note').value.trim()}); save(); render(); toast('Przyznano odznakę'); }}]); });
A.delBadge = (ds) => requireTeacher(()=>{ const d=S.current; d.badges=d.badges.filter(b=>b.id!==ds.id); save(); render(); });
A.runEvent = (ds) => { const d=S.current, E=EVENTS.find(e=>e[0]===ds.k), t=ds.t, tn=teamName(d,t);
  const fire=(text,extra)=>{ d.activeEvent={name:E[1],text}; d.evlog.push({k:E[0],name:E[1],team:t,extra:extra||'',t:Date.now()}); save(); render(); };
  if(ds.k==='hard') fire(L(`Drużyna ${tn} otrzymuje dodatkowe pytanie od publiczności.`,`Team ${tn} receives an extra question from the audience.`));
  else if(ds.k==='last'){ if(d.timer&&d.stages[d.stageIdx].dur>0) tAdd(d.timer,30); fire(L(`Drużyna ${tn} otrzymuje dodatkowe 30 sekund na odpowiedź.`,`Team ${tn} gets an extra 30 seconds to answer.`)); }
  else if(ds.k==='persp'){ const m=teamMembers(d,t); modal('Zmiana perspektywy',`<label class="f">Który uczeń wskazuje mocny argument strony przeciwnej?</label><select id="m-st" class="inp">${m.length?m.map(p=>`<option>${esc(p.name)}</option>`).join(''):`<option>dowolny mówca drużyny ${esc(tn)}</option>`}</select>`,[{label:'Anuluj'},{label:'Uruchom',cls:'gold',fn:()=>{ const n=$('#m-st').value; fire(L(`${n} (${tn}) wskazuje jeden mocny argument strony przeciwnej.`,`${n} (${tn}) names one strong argument for the other side.`),n); }}]); }
  else if(ds.k==='unexp'){ const opp=other(t); const args=[...d.prep[opp].args.map(a=>a.title).filter(Boolean),...d.thesis[opp==='P'?'dirsP':'dirsO']||[]];
    modal('Nieoczekiwany kontrargument',`<p class="small">Wybierz lub wpisz argument, na który drużyna ${esc(tn)} musi natychmiast zareagować.</p><input id="m-arg" class="inp" list="m-args"><datalist id="m-args">${args.map(a=>`<option value="${esc(a)}">`).join('')}</datalist>`,[{label:'Anuluj'},{label:'Uruchom',cls:'gold',fn:()=>{ const a=$('#m-arg').value.trim(); if(!a){ toast('Wpisz argument.','bad'); return false; } fire(L(`Drużyna ${tn} musi natychmiast odpowiedzieć na argument: „${a}”.`,`Team ${tn} must respond immediately to the argument: “${a}”.`),a); }}]); }
};
A.clearEvent = () => { S.current.activeEvent=null; save(); render(); };
/* QA */
A.qaSwap = () => { S.current.qaTurn=other(S.current.qaTurn); save(); render(); };
A.qaMode = (ds) => { S.current.qaMode=ds.m; save(); render(); };
A.qaOral = () => { const d=S.current; d.qa.push({id:uid(),ask:d.qaTurn,q:'',a:'',src:'oral'}); d.qaTurn=other(d.qaTurn); save(); render(); toast('Zapisano. Teraz pyta: '+teamName(d,d.qaTurn)); };
A.qaDraw = () => { const d=S.current, ans=other(d.qaTurn); const args=[...d.prep[ans].args.map(a=>a.title).filter(Boolean),...d.notes.filter(n=>n.team===ans&&n.kind==='arg').map(n=>n.text)];
  const pool=poolFor().filter(Boolean); let q;
  if(args.length && pool.length) q=pick(pool).replace(/\{arg\}/g, pick(args).replace(/[.?!]+$/,''));
  else { q=pick(isEN()?Q_GENERIC_EN:Q_GENERIC); toast('Brak zapisanych argumentów tej drużyny – wylosowano pytanie ogólne.'); }
  ui.qaDraft=q; render(); };
A.qaSave = () => { const d=S.current, q=$('#qaQ').value.trim(), a=$('#qaA').value.trim(); if(!q) return toast('Wpisz pytanie.','bad'); d.qa.push({id:uid(),ask:d.qaTurn,q,a,src:d.qaMode}); d.qaTurn=other(d.qaTurn); ui.qaDraft=''; save(); render(); };
A.qaDel = (ds) => { S.current.qa.splice(+ds.i,1); save(); render(); };
/* vote */
A.vote = (ds) => { const v=S.current.votes; v[ds.k]=Math.max(0,(v[ds.k]||0)+(+ds.s)); save(); render(); };
A.voteMode = (ds) => { S.current.voteMode=ds.m; ui.anon='cover'; if(ds.m==='anon') S.current.hideVotes=true; save(); render(); };
A.anonNext = () => { ui.anon='choose'; render(); };
A.anonVote = (ds) => { S.current.votes[ds.k]++; ui.anon='cover'; save(); render(); toast('Głos został oddany. Dziękujemy!'); };
A.voteReset = () => requireTeacher(()=>confirmBox('Wyzerować wszystkie głosy?',()=>{ S.current.votes={P:0,O:0,U:0}; save(); render(); }));
/* jury */
A.pickJuror = (ds) => { ui.juror=ds.j; render(); };
A.setScore = (ds) => { const [,j,t,c]=ds.p.split(':'); const d=S.current, jn=decodeURIComponent(j); const sc=(d.jury.scores[jn]=d.jury.scores[jn]||{P:{},O:{}}); sc[t]=sc[t]||{}; sc[t][c] = sc[t][c]===+ds.v ? 0 : +ds.v; save(); render(); };
A.confirmJury = () => requireTeacher(()=>{ const d=S.current; if(!d.jury.winner) return toast('Wybierz werdykt.','bad'); d.jury.confirmed=true; save(); render(); toast('Werdykt jury zatwierdzony'); });
A.unconfirmJury = () => requireTeacher(()=>{ S.current.jury.confirmed=false; save(); render(); });
/* finish */
A.finish = () => requireTeacher(()=>{ const d=S.current; logStage(d); d.phase='done'; d.endedAt=Date.now(); d.paused=false;
  const copy=clone(d); delete copy.timer; S.history=S.history.filter(h=>h.id!==copy.id); S.history.unshift(copy);
  if(d.tournamentMatchId && S.tournament){ const m=S.tournament.matches.find(x=>x.id===d.tournamentMatchId); if(m){ m.status='done'; m.winner = d.jury.confirmed ? d.jury.winner : (voteWinner(d.votes)||'draw'); m.votes=clone(d.votes); m.jury={P:juryPoints(d,'P'),O:juryPoints(d,'O')}; m.debateId=d.id; } }
  S.current=null; go('report',{id:copy.id}); toast('Raport zapisano w historii'); });
A.openReport = (ds) => go('report',{id:ds.id});
A.print = (ds) => { const t=$('#tcomm'), p=$('#tcommp'); if(t&&p) p.textContent=t.value||'—'; toast(ds.pdf?'W oknie drukowania wybierz „Zapisz jako PDF”. Jeśli okno się nie pojawi, otwórz aplikację z pliku HTML.':'Jeśli okno drukowania się nie pojawi, otwórz aplikację z pliku HTML.'); setTimeout(()=>{ try{ window.print(); }catch(e){ toast('Drukowanie niedostępne w tej przeglądarce','bad'); } },150); };
A.exportCsv = (ds) => { const d=S.history.find(h=>h.id===ds.id); if(!d) return; const fn=`raport-debaty-${new Date(d.endedAt||d.created).toISOString().slice(0,10)}.csv`, txt=csvOf(d); modal('Eksport CSV',`<p class="small muted">Plik CSV (separator: średnik) otworzysz w Excelu lub Arkuszach. Jeśli pobieranie jest zablokowane, skopiuj dane i wklej do arkusza.</p><textarea id="m-data" class="inp" rows="8" readonly>${esc(txt.replace(/^\ufeff/,''))}</textarea>`,[{label:'Zamknij'},{label:'Kopiuj',fn:()=>{ const t=$('#m-data'); t.select(); try{ navigator.clipboard.writeText(t.value).then(()=>toast('Skopiowano'),()=>{document.execCommand('copy');toast('Skopiowano');}); }catch(e){ document.execCommand('copy'); toast('Skopiowano'); } return false; }},{label:'Pobierz plik',cls:'pri',fn:()=>{ download(fn,txt,'text/csv;charset=utf-8'); return false; }}]); };
A.exportJson = (ds) => { const d=S.history.find(h=>h.id===ds.id); if(d) showData('Dane debaty (JSON)', JSON.stringify(d,null,1), 'debata-'+d.id+'.json'); };
A.exportHistory = () => showData('Historia debat (JSON)', JSON.stringify({type:'debata-history',history:S.history},null,1), 'historia-debat.json');
A.delHistory = (ds) => requireTeacher(()=>confirmBox('Usunąć ten raport z historii?',()=>{ S.history=S.history.filter(h=>h.id!==ds.id); save(); render(); },'Usuń','danger'));
/* teacher */
A.teacher = () => go('teacher');
A.pinUnlock = () => { if($('#pinIn').value===S.settings.pin){ unlockTeacher(); render(); toast('Panel odblokowany'); } else toast('Nieprawidłowy PIN','bad'); };
A.lock = () => { lockTeacher(); go('home'); toast('Panel zablokowany'); };
A.setPin = () => modal(S.settings.pin?'Zmień PIN':'Ustaw PIN',`<label class="f">Nowy PIN (4–8 cyfr)</label><input id="m-p1" type="password" inputmode="numeric" class="inp"><label class="f">Powtórz PIN</label><input id="m-p2" type="password" inputmode="numeric" class="inp">`,[{label:'Anuluj'},{label:'Zapisz',cls:'pri',fn:()=>{ const a=$('#m-p1').value, b=$('#m-p2').value; if(!/^\d{4,8}$/.test(a)){ toast('PIN musi mieć 4–8 cyfr.','bad'); return false; } if(a!==b){ toast('PIN-y się różnią.','bad'); return false; } S.settings.pin=a; unlockTeacher(); save(); render(); toast('PIN zapisany'); }}]);
A.removePin = () => confirmBox('Usunąć PIN? Panel nauczyciela będzie dostępny bez zabezpieczenia.',()=>{ S.settings.pin=''; save(); render(); });
A.resetTimes = () => { S.settings.times=clone(DEF_TIMES); S.settings.speakers=4; save(); render(); toast('Przywrócono domyślne czasy'); };
A.testBeep = () => { const s=S.settings.sound; S.settings.sound=true; beep(880,300); S.settings.sound=s; };
A.backup = () => { const c=clone(S); c.view={name:'home'}; showData('Kopia zapasowa wszystkich danych', JSON.stringify({type:'debata-backup',data:c}), 'debata-kopia-'+new Date().toISOString().slice(0,10)+'.json'); };
A.restore = () => importData('Przywróć dane z kopii', data=>{ if(data.type!=='debata-backup'||!data.data) throw new Error('to nie jest kopia zapasowa aplikacji'); localStorage.setItem(KEY, JSON.stringify(data.data)); load(); S.view={name:'teacher'}; save(); render(); toast('Przywrócono dane'); });
A.resetAll = () => confirmBox('Usunąć WSZYSTKIE dane (historia, własne tezy, ustawienia, turniej)? Tej operacji nie można cofnąć.',()=>{ try{ localStorage.removeItem(KEY); }catch(e){} lockTeacher(); S=defaults(); save(); go('home'); toast('Dane usunięte'); },'Usuń wszystko','danger');
/* library */
A.library = () => go('library');
A.toggleThesis = (ds) => requireTeacher(()=>{ const t=S.theses.find(x=>x.id===ds.id); t.active=!t.active; save(); render(); });
A.delThesis = (ds) => requireTeacher(()=>confirmBox('Usunąć tezę z biblioteki?',()=>{ S.theses=S.theses.filter(t=>t.id!==ds.id); S.sets.forEach(s=>s.ids=s.ids.filter(i=>i!==ds.id)); save(); render(); },'Usuń','danger'));
A.editThesis = (ds) => requireTeacher(()=>{ const t=ds.id?S.theses.find(x=>x.id===ds.id):{};
  modal(ds.id?'Edytuj tezę':'Nowa teza', thesisForm(t)+`<label class="f">Zestawy tematyczne</label>${S.sets.length?S.sets.map(s=>`<label class="row small"><input type="checkbox" class="m-set" value="${s.id}" ${t.id&&s.ids.includes(t.id)?'checked':''}> ${esc(s.name)}</label>`).join(''):'<p class="small muted">Brak zestawów.</p>'}<label class="row" style="margin-top:.5rem"><input type="checkbox" id="tf-act" ${t.active!==false?'checked':''}> Teza aktywna</label>`,
   [{label:'Anuluj'},{label:'Zapisz',cls:'pri',fn:()=>{ const f=readThesisForm(); if(!f) return false; let x=t; if(!ds.id){ x={id:'u'+uid()}; S.theses.unshift(x); } Object.assign(x,f,{active:$('#tf-act').checked}); const sel=[...document.querySelectorAll('.m-set')].filter(c=>c.checked).map(c=>c.value); S.sets.forEach(s=>{ s.ids=s.ids.filter(i=>i!==x.id); if(sel.includes(s.id)) s.ids.push(x.id); }); save(); render(); toast('Zapisano tezę'); }}]); });
A.editSet = (ds) => requireTeacher(()=>{ const s=ds.id?S.sets.find(x=>x.id===ds.id):{name:'',ids:[]};
  modal(ds.id?'Edytuj zestaw':'Nowy zestaw tematyczny',`<label class="f">Nazwa zestawu</label><input id="m-sn" class="inp" value="${esc(s.name)}"><label class="f">Tezy w zestawie</label><div style="max-height:300px;overflow:auto;border:1px solid var(--line);border-radius:8px;padding:.4rem">${S.theses.map(t=>`<label class="row small" style="margin:.15rem 0;flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" class="m-st" value="${t.id}" ${s.ids.includes(t.id)?'checked':''}> ${esc(t.text)}</label>`).join('')}</div>`,
   [{label:'Anuluj'},{label:'Zapisz',cls:'pri',fn:()=>{ const n=$('#m-sn').value.trim(); if(!n){ toast('Podaj nazwę.','bad'); return false; } const ids=[...document.querySelectorAll('.m-st')].filter(c=>c.checked).map(c=>c.value); if(ds.id){ s.name=n; s.ids=ids; } else S.sets.push({id:'set-'+uid(),name:n,ids}); save(); render(); toast('Zapisano zestaw'); }}]); });
A.delSet = (ds) => requireTeacher(()=>confirmBox('Usunąć zestaw? Tezy pozostaną w bibliotece.',()=>{ S.sets=S.sets.filter(s=>s.id!==ds.id); if(ui.libSet===ds.id) ui.libSet=''; save(); render(); }));
/* training */
function newTraining(){ return {id:uid(),step:0,thesis:null,stance:null,args:[{title:'',just:'',example:''},{title:'',just:'',example:''},{title:'',just:'',example:''}],speech:'',counter:'',response:'',summary:'',self:{},timer:newTimer(120),started:Date.now()}; }
A.training = () => { if(!S.training) S.training=newTraining(); go('training'); };
A.trNew = () => { S.training=newTraining(); save(); render(); };
A.trRandom = () => { const c=$('#trCat').value; const L=S.theses.filter(t=>t.active&&(!c||t.cat===c)); if(!L.length) return toast('Brak tez w tej kategorii.','bad'); S.training.thesis=clone(pick(L)); S.training.stance=null; S.training.counter=''; save(); render(); };
A.trStance = () => { S.training.stance=Math.random()<.5?'P':'O'; S.training.counter=''; ui.spin=true; save(); render(); setTimeout(()=>{ui.spin=false;},1000); };
A.trAddArg = () => { S.training.args.push({title:'',just:'',example:''}); save(); render(); };
A.trSetTime = (ds) => { const t=S.training.timer; t.planned=+ds.s; tReset(t); render(); };
A.trCounter = () => { const tr=S.training; const dirs=(tr.stance==='P'?tr.thesis.dirsO:tr.thesis.dirsP)||[]; const L=dirs.filter(x=>x!==tr.counter); tr.counter = L.length?pick(L):(dirs[0]||'inny sposób rozumienia kluczowego pojęcia z tezy'); save(); render(); };
A.trStep = (ds) => { const tr=S.training; tPause(tr.timer); tr.step=clamp(tr.step+(+ds.d),0,6); if(tr.step===4&&!tr.counter) A.trCounter(); save(); render(); window.scrollTo(0,0); };
A.trFinish = () => { const tr=clone(S.training); delete tr.timer; tr.ended=Date.now(); S.trainings.unshift(tr); S.trainings=S.trainings.slice(0,30); S.training=null; save(); go('home'); toast('Trening zapisany w historii'); };
/* tournament */
A.tournament = () => go('tournament');
A.tCreate = () => { S.tournament={name:$('#tName').value.trim()||L('Turniej debat','Debate tournament'),mode:$('#tMode').value,teams:[],matches:[]}; save(); render(); };
A.tReset = () => requireTeacher(()=>confirmBox('Usunąć turniej wraz z wynikami? Raporty rozegranych debat pozostaną w historii.',()=>{ S.tournament=null; save(); render(); },'Usuń','danger'));
A.tAddTeam = () => { const T=S.tournament; T.teams.push({id:uid(),name:L('Drużyna ','Team ')+(T.teams.length+1),members:''}); save(); render(); };
A.tDelTeam = (ds) => { const T=S.tournament; if(T.matches.some(m=>m.p===ds.id||m.o===ds.id)) return toast('Drużyna ma rozegrane lub zaplanowane mecze – nie można jej usunąć.','bad'); T.teams=T.teams.filter(t=>t.id!==ds.id); save(); render(); };
A.tRound = () => { const T=S.tournament; if(T.matches.some(m=>m.status!=='done')) return confirmBox('Nie wszystkie mecze bieżącej rundy mają wynik. Mimo to utworzyć nową rundę?',()=>{ tGenRound(); save(); render(); }); tGenRound(); save(); render(); };
A.tFinal = () => confirmBox('Utworzyć finał między dwiema najlepszymi drużynami rankingu?',()=>{ tGenRound(true); save(); render(); });
A.tResult = (ds) => requireTeacher(()=>{ const T=S.tournament, m=T.matches.find(x=>x.id===ds.id); const nm=id=>esc(T.teams.find(t=>t.id===id).name);
  modal('Wynik meczu',`<p><b style="color:var(--P)">${nm(m.p)}</b> (propozycja) vs <b style="color:var(--O)">${nm(m.o)}</b> (opozycja)</p>
   <label class="f">Zwycięzca (werdykt jury)</label><select id="m-w" class="inp"><option value="P" ${m.winner==='P'?'selected':''}>${nm(m.p)}</option><option value="O" ${m.winner==='O'?'selected':''}>${nm(m.o)}</option><option value="draw" ${m.winner==='draw'?'selected':''}>Remis</option></select>
   <div class="grid2"><div><label class="f">Głosy za propozycją</label><input id="m-vp" type="number" min="0" class="inp" value="${m.votes.P}"></div><div><label class="f">Głosy za opozycją</label><input id="m-vo" type="number" min="0" class="inp" value="${m.votes.O}"></div>
   <div><label class="f">Punkty jury – propozycja</label><input id="m-jp" type="number" min="0" step="0.1" class="inp" value="${m.jury.P}"></div><div><label class="f">Punkty jury – opozycja</label><input id="m-jo" type="number" min="0" step="0.1" class="inp" value="${m.jury.O}"></div></div>`,
   [{label:'Anuluj'},{label:'Zapisz wynik',cls:'pri',fn:()=>{ m.winner=$('#m-w').value; m.votes={P:+$('#m-vp').value||0,O:+$('#m-vo').value||0,U:0}; m.jury={P:+$('#m-jp').value||0,O:+$('#m-jo').value||0}; m.status='done'; save(); render(); toast('Zapisano wynik'); }}]); });
A.tPlay = (ds) => { const T=S.tournament, m=T.matches.find(x=>x.id===ds.id); const go2=()=>{ const d=newDebate(T.mode||'quick'); const tp=T.teams.find(t=>t.id===m.p), to=T.teams.find(t=>t.id===m.o);
   d.name=`${T.name} – ${m.final?L('finał','final'):L('runda ','round ')+m.round}: ${tp.name} vs ${to.name}`; d.teams={P:{name:tp.name},O:{name:to.name}}; d.thesis=clone(m.thesis); d.thesisId=m.thesis.id; d.tournamentMatchId=m.id;
   for(const [t,team] of [['P',tp],['O',to]]) team.members.split('\n').map(x=>x.trim()).filter(Boolean).forEach((n,i)=>d.people.push({id:uid(),name:n,role:i<d.speakers?t+(i+1):t+'m'}));
   d.setupStep=2; S.current=d; go('setup'); };
  if(S.current && S.current.phase!=='setup') confirmBox('Trwa inna debata. Porzucić ją i rozpocząć mecz turniejowy?',go2,'Porzuć i rozpocznij','danger'); else go2(); };
