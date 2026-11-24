/* DEBATA! – Arena Argumentów | js/views/history.js
   Widok: historia debat i treningów. */
'use strict';
/* ---------------- HISTORIA ---------------- */
VIEWS.history = () => `<div class="row between"><h2>Historia debat</h2><div class="row">${S.history.length?'<button class="btn ghost" data-a="exportHistory">Eksport historii (JSON)</button>':''}</div></div>
  <div class="card">${S.history.length?S.history.map(h=>histItem(h).replace('</button></div>',`</button><button class="btn sm ghost danger" data-a="delHistory" data-id="${h.id}" aria-label="Usuń">✕</button></div>`)).join(''):'<p class="empty">Historia jest pusta. Raport każdej zakończonej debaty zapisuje się tutaj automatycznie.</p>'}</div>
  ${S.trainings.length?`<div class="card"><div class="sec-t"><span class="par">✒</span> Treningi mówcy</div>${S.trainings.map(t=>`<div class="hist-item"><div class="grow"><div class="nm">„${esc(t.thesis.text)}”</div><div class="small muted">${fdate(t.ended)} · stanowisko: ${t.stance==='P'?'za tezą':'przeciw tezie'}</div></div></div>`).join('')}</div>`:''}`;
