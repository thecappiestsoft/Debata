/* DEBATA! – Arena Argumentów | js/views/library.js
   Widok: biblioteka tez i zestawy tematyczne. */
'use strict';
/* ---------------- BIBLIOTEKA ---------------- */
VIEWS.library = () => {
  UIREND.llist = () => { const L=filteredTheses(false); return L.length? `<div class="tblwrap"><table class="t"><thead><tr><th>Teza</th><th>Kategoria</th><th>Poziom</th><th>Aktywna</th><th></th></tr></thead><tbody>${L.map(t=>`<tr class="${t.active?'':'muted'}"><td style="font-family:var(--serif)">„${esc(t.text)}”<div class="tiny muted">${esc(t.ctx)}</div></td><td class="small">${esc(CATS[t.cat]||t.cat)}</td><td>${diffStars(t.diff)}</td><td><button class="btn sm ${t.active?'':'ghost'}" data-a="toggleThesis" data-id="${t.id}">${t.active?'✓ tak':'nie'}</button></td><td style="white-space:nowrap"><button class="btn sm" data-a="editThesis" data-id="${t.id}">Edytuj</button> <button class="btn sm ghost danger" data-a="delThesis" data-id="${t.id}" aria-label="Usuń">✕</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">Brak tez spełniających kryteria.</p>'; };
  return `<div class="row between"><h2>📚 Biblioteka tez</h2><div class="row"><button class="btn pri" data-a="editThesis">+ Nowa teza</button></div></div>
   <div class="card"><p class="small muted">${S.theses.length} tez · ${S.theses.filter(t=>t.active).length} aktywnych. Nieaktywne tezy nie pojawiają się przy wyborze i losowaniu.</p>${filtersHtml('llist')}<div id="llist">${UIREND.llist()}</div></div>
   <div class="card"><div class="row between"><div class="sec-t" style="border:0;margin:0"><span class="par">§</span> Zestawy tematyczne</div><button class="btn sm pri" data-a="editSet">+ Nowy zestaw</button></div>
    ${S.sets.length?S.sets.map(s=>`<div class="hist-item"><div class="grow"><b>${esc(s.name)}</b> <span class="small muted">(${s.ids.filter(id=>S.theses.some(t=>t.id===id)).length} tez)</span></div><button class="btn sm" data-a="editSet" data-id="${s.id}">Edytuj</button><button class="btn sm ghost danger" data-a="delSet" data-id="${s.id}">✕</button></div>`).join(''):'<p class="empty">Brak zestawów.</p>'}</div>`;
};
