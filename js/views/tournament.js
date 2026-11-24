/* DEBATA! – Arena Argumentów | js/views/tournament.js
   Widok: turniej – drużyny, rundy, ranking, finał. */
'use strict';
/* ---------------- TURNIEJ ---------------- */
function ranking(T){
  const R=Object.fromEntries(T.teams.map(t=>[t.id,{id:t.id,name:t.name,pl:0,w:0,d:0,l:0,pts:0,jury:0,votes:0}]));
  T.matches.filter(m=>m.status==='done').forEach(m=>{ const p=R[m.p], o=m.o?R[m.o]:null; if(!p) return;
    if(!o){ p.w++; p.pts+=3; return; }
    p.pl++; o.pl++; p.jury+=(+m.jury?.P||0); o.jury+=(+m.jury?.O||0); p.votes+=(+m.votes?.P||0); o.votes+=(+m.votes?.O||0);
    if(m.winner==='P'){ p.w++; p.pts+=3; o.l++; } else if(m.winner==='O'){ o.w++; o.pts+=3; p.l++; } else { p.d++; o.d++; p.pts++; o.pts++; } });
  return Object.values(R).sort((a,b)=>b.pts-a.pts||b.jury-a.jury||b.votes-a.votes);
}
VIEWS.tournament = () => {
  const T=S.tournament;
  if(!T) return `<h2>🏆 Turniej debat</h2><div class="card" style="max-width:640px"><p>Turniej pozwala kilku drużynom rywalizować w kolejnych rundach – każda runda ma inną tezę, a wyniki trafiają do tabeli.</p>
    <label class="f">Nazwa turnieju</label><input id="tName" class="inp" value="${L('Turniej debat','Debate tournament')} ${new Date().getFullYear()}">
    <label class="f">Format meczów</label><select id="tMode" class="inp"><option value="quick">szybka debata (krótsze mecze)</option><option value="full">pełna debata</option></select>
    <div class="row end" style="margin-top:.8rem"><button class="btn gold" data-a="tCreate">Utwórz turniej</button></div></div>`;
  const rk=ranking(T); const rounds=[...new Set(T.matches.map(m=>m.round))].sort((a,b)=>a-b);
  const nm=id=>esc((T.teams.find(t=>t.id===id)||{}).name||'?');
  return `<div class="row between"><h2>🏆 ${esc(T.name)}</h2><div class="row"><button class="btn ghost danger" data-a="tReset">Usuń turniej</button></div></div>
   <div class="grid2"><div>
    <div class="card"><div class="row between"><div class="sec-t" style="border:0;margin:0"><span class="par">§ 1</span> Drużyny (${T.teams.length})</div><button class="btn sm pri" data-a="tAddTeam">+ Drużyna</button></div>
     ${T.teams.length?T.teams.map((t,i)=>`<div class="hist-item"><div class="grow"><input class="inp" style="font-weight:700" data-bind="tournament.teams.${i}.name" value="${esc(t.name)}"><textarea class="inp small" rows="2" style="margin-top:.3rem;min-height:50px" data-bind="tournament.teams.${i}.members" placeholder="Członkowie (jedno imię w wierszu, w kolejności mówców)">${esc(t.members)}</textarea></div><button class="btn sm ghost danger" data-a="tDelTeam" data-id="${t.id}" aria-label="Usuń">✕</button></div>`).join(''):'<p class="empty">Dodaj co najmniej dwie drużyny.</p>'}</div>
    <div class="card"><div class="sec-t"><span class="par">§ 2</span> Ranking drużyn</div><div class="tblwrap"><table class="t"><thead><tr><th>#</th><th>Drużyna</th>${(isEN()?['P','W','D','L','Pts']:['M','W','R','P','Pkt']).map(x=>`<th>${x}</th>`).join('')}<th title="Suma punktów ważonych jury">Jury</th><th title="Głosy publiczności">Głosy</th></tr></thead><tbody>${rk.map((r,i)=>`<tr><td>${i+1}${i===0&&r.pts?' 🏆':''}</td><td><b>${esc(r.name)}</b></td><td>${r.pl}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td><b>${r.pts}</b></td><td>${r1(r.jury)}</td><td>${r.votes}</td></tr>`).join('')}</tbody></table></div><p class="tiny muted">Wygrana 3 pkt, remis 1 pkt. Przy równej liczbie punktów decyduje suma ocen jury, a potem głosy publiczności.</p></div>
   </div><div>
    <div class="card"><div class="row between"><div class="sec-t" style="border:0;margin:0"><span class="par">§ 3</span> Rundy i historia spotkań</div><div class="row"><button class="btn sm pri" data-a="tRound" ${T.teams.length<2?'disabled':''}>+ Nowa runda</button><button class="btn sm gold" data-a="tFinal" ${T.teams.length<2||!T.matches.some(m=>m.status==='done')?'disabled':''}>🏆 Finał</button></div></div>
     ${rounds.length?rounds.slice().reverse().map(r=>`<h4 style="margin-top:.8rem">${T.matches.find(m=>m.round===r&&m.final)?'Finał':'Runda '+r}</h4>${T.matches.filter(m=>m.round===r).map(m=>`<div class="match ${m.final?'final':''}">
       ${m.o?`<div class="grow"><span class="${m.winner==='P'?'win':''}" style="color:var(--P)">${nm(m.p)}</span> <span class="vs">vs</span> <span class="${m.winner==='O'?'win':''}" style="color:var(--O)">${nm(m.o)}</span><div class="tiny muted">„${esc(m.thesis.text)}” · ${nm(m.p)} broni tezy</div>${m.status==='done'?`<div class="small">${m.winner==='draw'?'Remis':'Wygrywa: <b>'+(m.winner==='P'?nm(m.p):nm(m.o))+'</b>'} · głosy ${m.votes.P}:${m.votes.O} · jury ${r1(m.jury.P)}:${r1(m.jury.O)}</div>`:''}</div>
        ${m.status!=='done'?`<button class="btn sm gold" data-a="tPlay" data-id="${m.id}">▶ Rozegraj</button><button class="btn sm" data-a="tResult" data-id="${m.id}">Wpisz wynik</button>`:`${m.debateId&&S.history.some(h=>h.id===m.debateId)?`<button class="btn sm" data-a="openReport" data-id="${m.debateId}">Raport</button>`:''}<button class="btn sm ghost" data-a="tResult" data-id="${m.id}">Popraw</button>`}`
       :`<div class="grow">${nm(m.p)} <span class="muted small">– wolny los (awans bez meczu)</span></div>`}</div>`).join('')}`).join(''):'<p class="empty">Utwórz pierwszą rundę – aplikacja dobierze pary i tezy.</p>'}</div>
   </div></div>`;
};
function tGenRound(final){
  const T=S.tournament; const round=(Math.max(0,...T.matches.map(m=>m.round))||0)+1;
  const used=new Set(T.matches.map(m=>m.thesis&&m.thesis.id)); const pool=S.theses.filter(t=>t.active&&!used.has(t.id)); const th=()=>clone(pick(pool.length?pool:S.theses.filter(t=>t.active)));
  const mk=(p,o)=>({id:uid(),round,p,o,thesis:th(),status:o?'planned':'done',winner:o?'':'P',votes:{P:0,O:0,U:0},jury:{P:0,O:0},debateId:null,final:!!final});
  if(final){ const rk=ranking(T); const m=mk(rk[0].id,rk[1].id); T.matches.push(m); return; }
  const played=(a,b)=>T.matches.some(m=>(m.p===a&&m.o===b)||(m.p===b&&m.o===a));
  let list = T.matches.length ? ranking(T).map(r=>r.id) : shuffle(T.teams.map(t=>t.id));
  if(list.length%2){ const byeCand=list.slice().reverse().find(id=>!T.matches.some(m=>m.p===id&&!m.o))||list[list.length-1]; list=list.filter(x=>x!==byeCand); T.matches.push(mk(byeCand,null)); }
  while(list.length){ const a=list.shift(); let j=list.findIndex(b=>!played(a,b)); if(j<0) j=0; const b=list.splice(j,1)[0]; const swap=Math.random()<.5; T.matches.push(mk(swap?b:a, swap?a:b)); }
}
