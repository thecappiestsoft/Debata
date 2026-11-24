/* DEBATA! – Arena Argumentów | js/views/setup.js
   Widok: konfiguracja debaty (4 kroki: tryb, teza, drużyny i role, czas i zasady). */
'use strict';
/* ---------------- KONFIGURACJA DEBATY ---------------- */
VIEWS.setup = () => {
  const d=S.current; if(!d) { S.view={name:'home'}; return VIEWS.home(); }
  const step=d.setupStep||0, steps=['Tryb debaty','Teza','Drużyny i role','Czas i zasady'];
  const head = `<div class="row between"><h2>${d.mode==='quick'?'⚡ Szybka debata':'🏛️ Nowa debata'} <span class="muted small" style="font-family:var(--sans)">– konfiguracja</span></h2>${d.tournamentMatchId?'<span class="tag">Mecz turniejowy</span>':''}</div>
   <div class="wizard">${steps.map((s,i)=>`<button class="wstep ${i===step?'on':''} ${i<step?'done':''}" data-a="setupStep" data-i="${i}">${i+1}. ${s}</button>`).join('')}</div>`;
  let body='';
  if(step===0) body=setupMode(d); else if(step===1) body=setupThesis(d); else if(step===2) body=setupPeople(d); else body=setupTimes(d);
  const nav = `<div class="row between noprint" style="margin-top:1rem"><div>${step>0?`<button class="btn ghost" data-a="setupStep" data-i="${step-1}">← Wstecz</button>`:`<button class="btn ghost" data-a="home">Anuluj</button>`}</div>
    <div class="row">${step<3?`<button class="btn pri lg" data-a="setupStep" data-i="${step+1}">Dalej →</button>`:`<button class="btn ghost" data-a="startDebateDirect">Pomiń przygotowanie</button><button class="btn gold lg" data-a="startPrep">Rozpocznij przygotowanie →</button>`}</div></div>`;
  return head + body + nav;
};
function setupMode(d){
  const opt=(on,a,attrs,t,ds)=>`<button class="opt ${on?'on':''}" data-a="${a}" ${attrs}><b>${t}</b><div class="d">${ds}</div></button>`;
  return `<div class="card"><div class="sec-t"><span class="par">§ 1</span> Nazwa i tryb</div>
   <label class="f" for="dname">Nazwa debaty</label><input id="dname" class="inp" data-bind="current.name" value="${esc(d.name)}">
   <div class="grid2" style="margin-top:.8rem">
    ${opt(d.mode==='full','setMode','data-m="full"','Tryb A – pełna debata','Do 4 mówców w drużynie, wszystkie etapy: wystąpienia, pytania, repliki, mowy końcowe, głosowanie, jury.')}
    ${opt(d.mode==='quick','setMode','data-m="quick"','Tryb B – szybka debata','Maks. 2 mówców w drużynie, 3 min przygotowania, wystąpienia po 1 min, uproszczone głosowanie.')}
   </div></div>
   <div class="card"><div class="sec-t"><span class="par">§ 2</span> Organizacja pracy w klasie</div>
   <div class="grid3">
    ${opt(d.work===1,'setWork','data-w="1"','Jeden komputer i projektor','Nauczyciel obsługuje aplikację, uczniowie debatują ustnie. Ekran widzi cała klasa.')}
    ${opt(d.work===2,'setWork','data-w="2"','Komputer dla drużyny','Każda drużyna przygotowuje się na jednym urządzeniu, potem przenosi przygotowanie na komputer główny.')}
    ${opt(d.work===3,'setWork','data-w="3"','Kilka urządzeń','Uczniowie przygotowują argumenty na własnych urządzeniach.')}
   </div>
   ${d.work>1?`<div class="notice info"><b>Ważne:</b> aplikacja działa lokalnie i nie synchronizuje urządzeń przez sieć. Przygotowanie drużyny przenosi się na komputer główny przyciskami „Eksportuj / Importuj przygotowanie” (plik lub wklejony tekst). Głosowanie odbywa się na komputerze głównym – także w trybie anonimowym, gdy uczniowie podchodzą kolejno.</div>`:''}
   </div>
   <div class="card"><div class="sec-t"><span class="par">§ 3</span> Kto prowadzi i ocenia?</div>
    <label class="row"><input type="checkbox" data-bind="current.marshalApp" data-rr ${d.marshalApp?'checked':''}> Marszałka zastępuje aplikacja (wyświetla scenariusz otwarcia i prowadzi kolejność)</label>
    <label class="row" style="margin-top:.4rem"><input type="checkbox" data-bind="current.juryApp" data-rr ${d.juryApp?'checked':''}> Ocenę jury wprowadza nauczyciel (bez uczniów-jurorów)</label>
    <p class="small muted">Gdy odznaczysz te pola, w kroku 3 przypiszesz role marszałka i jurorów konkretnym uczniom.</p></div>`;
}
function filteredTheses(onlyActive=true){
  const q=ui.libQ.trim().toLowerCase(); const set=S.sets.find(s=>s.id===ui.libSet);
  return S.theses.filter(t=>(!onlyActive||t.active) && (!ui.libCat||t.cat===ui.libCat) && (!ui.libDiff||String(t.diff)===ui.libDiff) && (!set||set.ids.includes(t.id)) && (!q||(t.text+' '+(EN[t.text]||'')).toLowerCase().includes(q)));
}
function filtersHtml(target){
  return `<div class="row" style="margin-bottom:.7rem">
   <select class="inp" style="width:auto" data-ui="libCat" data-target="${target}"><option value="">Wszystkie kategorie</option>${Object.entries(CATS).map(([k,v])=>`<option value="${k}" ${ui.libCat===k?'selected':''}>${v}</option>`).join('')}</select>
   <select class="inp" style="width:auto" data-ui="libDiff" data-target="${target}"><option value="">Każdy poziom</option>${Object.entries(DIFFS).map(([k,v])=>`<option value="${k}" ${ui.libDiff===k?'selected':''}>${v}</option>`).join('')}</select>
   <select class="inp" style="width:auto" data-ui="libSet" data-target="${target}"><option value="">Bez zestawu</option>${S.sets.map(s=>`<option value="${s.id}" ${ui.libSet===s.id?'selected':''}>Zestaw: ${esc(s.name)}</option>`).join('')}</select>
   <input class="inp grow" style="min-width:180px" placeholder="Szukaj w treści tezy…" value="${esc(ui.libQ)}" data-ui="libQ" data-target="${target}"></div>`;
}
const diffStars = n => `<span class="diff" title="poziom: ${DIFFS[n]}">${'★'.repeat(n)}${'☆'.repeat(3-n)}</span>`;
function setupThesis(d){
  UIREND.tlist = () => { const L=filteredTheses(); return L.length ? L.map(t=>`<div class="tcard ${d.thesisId===t.id?'sel':''}"><div class="row between"><span class="tag">${esc(CATS[t.cat]||t.cat)}</span>${diffStars(t.diff)}</div><div class="tx">„${esc(t.text)}”</div><details class="small"><summary class="muted">Kontekst</summary>${esc(t.ctx)}</details><div><button class="btn sm ${d.thesisId===t.id?'gold':''}" data-a="pickThesis" data-id="${t.id}">${d.thesisId===t.id?'✓ Wybrana':'Wybierz'}</button></div></div>`).join('') : '<p class="empty">Brak tez spełniających kryteria.</p>'; };
  return `${d.thesis?`<div style="margin-bottom:1rem">${thesisBlock(d.thesis.text,false,`<div class="small" style="opacity:.85;margin-top:.3rem">${esc(CATS[d.thesis.cat]||'')} · poziom: ${DIFFS[d.thesis.diff]||'–'}</div>`)}</div>`:'<div class="notice">Wybierz tezę z biblioteki, wylosuj ją albo dodaj własną.</div>'}
   <div class="card"><div class="row between"><div class="sec-t" style="border:0;margin:0"><span class="par">§</span> Biblioteka tez</div><button class="btn gold" data-a="randomThesis">🎲 Losuj tezę</button></div>
    ${filtersHtml('tlist')}<div class="tlist" id="tlist">${UIREND.tlist()}</div></div>
   <details class="card"><summary style="cursor:pointer;font-family:var(--serif);font-weight:700;color:var(--hd)">✎ Dodaj własną tezę</summary>
    ${thesisForm({})}<div class="row end" style="margin-top:.6rem"><button class="btn pri" data-a="addCustomThesis">Dodaj i wybierz</button></div></details>`;
}
function thesisForm(t){
  return `<label class="f">Treść tezy</label><input id="tf-text" class="inp" value="${esc(t.text||'')}" placeholder="np. Szkoła powinna uczyć umiejętności praktycznych.">
  <div class="grid2"><div><label class="f">Kategoria</label><select id="tf-cat" class="inp">${Object.entries(CATS).map(([k,v])=>`<option value="${k}" ${t.cat===k?'selected':''}>${v}</option>`).join('')}</select></div>
  <div><label class="f">Poziom trudności</label><select id="tf-diff" class="inp">${Object.entries(DIFFS).map(([k,v])=>`<option value="${k}" ${String(t.diff||1)===k?'selected':''}>${v}</option>`).join('')}</select></div></div>
  <label class="f">Krótkie wyjaśnienie kontekstu <span class="muted small">(bez gotowych argumentów)</span></label><textarea id="tf-ctx" class="inp" rows="2">${esc(t.ctx||'')}</textarea>
  <div class="grid2"><div><label class="f">Kierunki argumentacji – propozycja <span class="muted small">(jeden w wierszu)</span></label><textarea id="tf-p" class="inp" rows="3">${esc((t.dirsP||[]).join('\n'))}</textarea></div>
  <div><label class="f">Kierunki argumentacji – opozycja</label><textarea id="tf-o" class="inp" rows="3">${esc((t.dirsO||[]).join('\n'))}</textarea></div></div>`;
}
function readThesisForm(){ const text=$('#tf-text').value.trim(); if(!text){ toast('Wpisz treść tezy.','bad'); return null; }
  const lines=s=>s.split('\n').map(x=>x.trim()).filter(Boolean);
  return {text,cat:$('#tf-cat').value,diff:+$('#tf-diff').value,ctx:$('#tf-ctx').value.trim(),dirsP:lines($('#tf-p').value),dirsO:lines($('#tf-o').value)}; }
function setupPeople(d){
  const opts=roleOptions(d);
  const counts = {}; d.people.forEach(p=>counts[p.role]=(counts[p.role]||0)+1);
  const warn=[]; for(const t of ['P','O']) for(let i=1;i<=d.speakers;i++){ if(!counts[t+i]) warn.push(`${teamWord(t)}: brak ${i}. mówcy`); if(counts[t+i]>1) warn.push(`${teamWord(t)}: ${i}. mówca przypisany ${counts[t+i]} razy`); }
  if(!d.marshalApp && !counts.marshal) warn.push('Nie wskazano marszałka');
  if(!d.juryApp && !counts.juror) warn.push('Nie wskazano jurorów');
  return `<div class="card"><div class="sec-t"><span class="par">§ 1</span> Drużyny</div><div class="grid2">
    <div><label class="f" style="color:var(--P)">Nazwa drużyny propozycji (broni tezy)</label><input class="inp" data-bind="current.teams.P.name" data-live="nav" value="${esc(d.teams.P.name)}"></div>
    <div><label class="f" style="color:var(--O)">Nazwa drużyny opozycji (przeciw tezie)</label><input class="inp" data-bind="current.teams.O.name" value="${esc(d.teams.O.name)}"></div></div>
    <div class="row" style="margin-top:.7rem"><label class="f" style="margin:0">Liczba mówców w drużynie</label>
     <select class="inp" style="width:auto" data-chg="speakers">${(d.mode==='quick'?[1,2]:[2,3,4]).map(n=>`<option ${d.speakers===n?'selected':''}>${n}</option>`).join('')}</select>
     <label class="f" style="margin:0 0 0 1rem">Osób w drużynie (przy losowaniu)</label><input type="number" min="1" max="10" class="inp num" data-bind="current.teamSize" data-num value="${d.teamSize}">
     ${!d.juryApp?`<label class="f" style="margin:0 0 0 1rem">Liczba jurorów</label><input type="number" min="0" max="6" class="inp num" data-bind="current.jurorCount" data-num value="${d.jurorCount}">`:''}</div></div>
   <div class="card"><div class="sec-t"><span class="par">§ 2</span> Uczestnicy</div>
    <div class="grid2"><div><label class="f" for="names">Wklej listę imion (jedno w wierszu lub po przecinku)</label><textarea id="names" class="inp zeszyt" rows="4" placeholder="Ania&#10;Bartek&#10;Celina"></textarea>
     <div class="row" style="margin-top:.5rem"><button class="btn pri" data-a="addNames">+ Dodaj do listy</button><button class="btn gold" data-a="splitRandom" ${d.people.length?'':'disabled'}>🎲 Losowy podział klasy</button>${d.people.length?'<button class="btn ghost danger" data-a="clearPeople">Wyczyść listę</button>':''}</div></div>
     <div class="small muted"><p><b>Jak to działa?</b> Dodaj uczniów, a potem wylosuj podział albo ręcznie wybierz rolę każdej osoby w tabeli.</p><p>Możesz też pominąć listę – na ekranie debaty pojawią się wtedy ogólne nazwy („Mówca 1”).</p>${warn.length?`<div class="notice"><b>Do uzupełnienia:</b><br>${warn.map(esc).join('<br>')}</div>`:(d.people.length?'<div class="notice info">✓ Wszystkie role mówców są obsadzone.</div>':'')}</div></div>
    ${d.people.length?`<div class="tblwrap" style="margin-top:.8rem"><table class="t ppl"><thead><tr><th>#</th><th>Imię</th><th>Rola</th><th></th></tr></thead><tbody>
      ${d.people.map((p,i)=>`<tr><td>${i+1}</td><td><input class="inp" data-bind="current.people.${i}.name" value="${esc(p.name)}"></td><td><select class="inp" data-bind="current.people.${i}.role" data-rr>${opts.map(([v,l])=>`<option value="${v}" ${p.role===v?'selected':''}>${l}</option>`).join('')}</select></td><td><button class="btn sm ghost" data-a="delPerson" data-i="${i}" aria-label="Usuń">✕</button></td></tr>`).join('')}
    </tbody></table></div>`:''}</div>`;
}
function timeRow(label, path, val){ return `<tr><td>${label}</td><td><input type="number" min="0" step="0.25" class="inp num" data-bind="${path}" data-num="min" value="${minVal(val)}"> min</td></tr>`; }
function setupTimes(d){
  const t=d.times, closingByLast=!(t.fin>0);
  let rows = timeRow('Przygotowanie','current.times.prep',t.prep) + timeRow('Otwarcie (marszałek)','current.times.open',t.open);
  for(let i=1;i<=d.speakers;i++) rows += timeRow(`${i}. mówca (każda drużyna)${closingByLast && i===d.speakers?' – mowa końcowa':''}`,`current.times.sp.${i-1}`,t.sp[i-1]);
  rows += timeRow('Pytania i odpowiedzi (łącznie)','current.times.qa',t.qa) + timeRow('Replika (każda drużyna; 0 = bez repliki)','current.times.rep',t.rep);
  if(d.mode==='quick') rows += timeRow('Podsumowanie (każda drużyna)','current.times.fin',t.fin);
  rows += timeRow('Głosowanie','current.times.vote',t.vote);
  return `<div class="grid2"><div class="card"><div class="sec-t"><span class="par">§ 1</span> Czas etapów</div><table class="t">${rows}</table><p class="small muted">Wartości w minutach (np. 1,5 = 1 min 30 s). W trakcie debaty czas można też wydłużać i skracać.</p></div>
   <div><div class="card"><div class="sec-t"><span class="par">§ 2</span> Zasady</div>
    <label class="row"><input type="checkbox" data-bind="current.scoring" ${d.scoring?'checked':''}> Punktacja, odznaki i ocena kryteriów</label>
    <label class="row" style="margin-top:.3rem"><input type="checkbox" data-bind="current.cheatsheet" ${d.cheatsheet?'checked':''}> Ściągawka z przydatnymi zwrotami</label>
    <label class="f">Pytania w etapie IV</label><select class="inp" data-bind="current.qaMode">${[['oral','zadawane ustnie'],['typed','wpisywane do aplikacji'],['pool','losowane z puli']].map(([v,l])=>`<option value="${v}" ${d.qaMode===v?'selected':''}>${l}</option>`).join('')}</select>
    <label class="f">Wydarzenia specjalne (uruchamia prowadzący)</label>${EVENTS.map(([k,n,ds])=>`<label class="row small" style="flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" data-bind="current.events.${k}" ${d.events[k]?'checked':''}> <b>${n}</b> – ${ds}</label>`).join('')}
   </div>
   <details class="card"><summary style="cursor:pointer;font-family:var(--serif);font-weight:700;color:var(--hd)">Wagi kryteriów oceny jury</summary>${weightsTable('current.weights',d.weights)}</details></div></div>`;
}
function weightsTable(path,w){ return `<table class="t">${CRIT.map(([k,n,ds])=>`<tr><td><b>${n}</b><div class="tiny muted">${ds}</div></td><td><select class="inp" style="width:auto" data-bind="${path}.${k}" data-num>${[0,0.5,1,1.5,2,3].map(v=>`<option value="${v}" ${+w[k]===v?'selected':''}>×${String(v).replace('.',',')}</option>`).join('')}</select></td></tr>`).join('')}</table><p class="tiny muted">Waga ×0 wyłącza kryterium z wyniku łącznego.</p>`; }
