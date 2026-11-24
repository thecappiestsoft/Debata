/* DEBATA! – Arena Argumentów | js/views/home.js
   Widok: strona główna. */
'use strict';
/* ---------------- STRONA GŁÓWNA ---------------- */
VIEWS.home = () => {
  const c=S.current;
  const resume = c ? `<div class="card resume"><div class="grow"><div class="tag">W toku</div> <b style="font-family:var(--serif);font-size:1.1rem">${esc(c.name)}</b><div class="small muted">${c.phase==='setup'?'Konfiguracja':c.phase==='prep'?'Przygotowanie drużyn':'Debata – etap: '+esc((c.stages[c.stageIdx]||{}).label||'')}${c.thesis?' · „'+esc(c.thesis.text)+'”':''}</div></div>
    <button class="btn gold" data-a="resume">Kontynuuj</button><button class="btn ghost" data-a="abandon">Porzuć</button></div>` : '';
  const tile=(a,ic,tt,ds,lt,cls='')=>`<button class="tile ${cls}" data-a="${a}"><span class="lt">${lt}</span><span class="ic">${ic}</span><span class="tt">${tt}</span><span class="ds">${ds}</span></button>`;
  const hist = S.history.slice(0,5);
  return `<section class="hero"><div class="big">DEBATA<b>!</b></div><div class="sub2">Arena Argumentów</div>
   <p class="lead">Narzędzie do prowadzenia debat oksfordzkich na lekcjach języka polskiego. Uczniowie mówią, słuchają i przekonują – aplikacja pilnuje kolejności, czasu i ocen.</p></section>
   ${resume}
   <div class="tiles">
    ${tile('newFull','🏛️','Nowa debata','Pełna debata oksfordzka: teza, drużyny, przygotowanie, wystąpienia, głosowanie i ocena jury.','A','main')}
    ${tile('newQuick','⚡','Szybka debata','Krótka forma na część lekcji: 2 mówców w drużynie, skrócone czasy.','B')}
    ${tile('training','✒️','Trening mówcy','Samodzielne ćwiczenie: stanowisko, argumenty, wystąpienie, odpowiedź na kontrargument.','C')}
    ${tile('tournament','🏆','Turniej debat','Rundy, tabela wyników, historia spotkań, ranking i finał.','D')}
    ${tile('teacher','🔑','Panel nauczyciela','Czasy, kryteria, wydarzenia specjalne, PIN, kopia zapasowa.','§')}
    ${tile('library','📚','Biblioteka tez',`${S.theses.length} tez w ${Object.keys(CATS).length} kategoriach, własne zestawy tematyczne.`,'§')}
   </div>
   <div class="card"><div class="sec-t"><span class="par">❦</span> Ostatnie debaty</div>
    ${hist.length ? hist.map(histItem).join('') : '<p class="empty">Nie przeprowadzono jeszcze żadnej debaty.</p>'}
    ${S.history.length>5?`<button class="btn sm ghost" data-a="nav" data-v="history">Cała historia (${S.history.length})</button>`:''}
   </div>
   ${!storageOk?'<div class="notice bad">Przeglądarka blokuje zapis lokalny – dane znikną po zamknięciu karty.</div>':''}`;
};
function histItem(h){
  const vw=voteWinner(h.votes), jw=h.jury.confirmed?h.jury.winner:'';
  const lab = w => w==='P'?`<span class="tag P">${esc(teamName(h,'P'))}</span>`:w==='O'?`<span class="tag O">${esc(teamName(h,'O'))}</span>`:w==='draw'?'<span class="tag gray">remis</span>':'<span class="tag gray">—</span>';
  return `<div class="hist-item"><div class="grow"><div class="nm">${esc(h.name)}</div><div class="small muted">${fdate(h.endedAt||h.created)} · „${esc(h.thesis?h.thesis.text:'')}”</div></div>
   <div class="small">Publiczność: ${lab(vw)} &nbsp; Jury: ${lab(jw)}</div><button class="btn sm" data-a="openReport" data-id="${h.id}">Raport</button></div>`;
}
