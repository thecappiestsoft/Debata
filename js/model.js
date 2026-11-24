/* DEBATA! – Arena Argumentów | js/model.js
   Model debaty: tworzenie debaty, budowa etapów, role, zadania mówców, scenariusz marszałka, obliczanie ocen jury. */
'use strict';
/* =====================================================================
   DEBATA – MODEL
   ===================================================================== */
const emptyPrep = () => ({stance:'',args:[],predicted:[],evidence:{lit:'',hist:'',data:'',soc:'',life:''}});
function newDebate(mode){
  const st=S.settings, n = mode==='quick' ? 2 : st.speakers;
  const d = { id:uid(), name:(mode==='quick'?L('Szybka debata','Quick debate'):L('Debata oksfordzka','Oxford debate'))+' – '+new Date().toLocaleDateString(LOC()), mode, phase:'setup', setupStep:0,
    work:1, marshalApp:true, juryApp:true, jurorCount:0, teamSize:n, speakers:n,
    thesis:null, thesisId:null, teams:{P:{name:teamWord('P')},O:{name:teamWord('O')}}, people:[],
    times:clone(st.times[mode]), weights:clone(st.weights), scoring:st.scoring, events:clone(st.events), qaMode:st.qaMode, cheatsheet:st.cheatsheet,
    prep:{P:emptyPrep(),O:emptyPrep()}, stages:[], stageIdx:0, stageLog:{}, ticks:{}, timer:newTimer(0),
    qa:[], qaTurn:'O', rebuttals:{P:{},O:{}}, notes:[], points:[], badges:[], evlog:[], activeEvent:null,
    votes:{P:0,O:0,U:0}, hideVotes:false, voteMode:'counter',
    jury:{scores:{},notes:{P:{good:'',bad:''},O:{good:'',bad:''}},indiv:{},winner:'',confirmed:false},
    teacherComment:'', created:Date.now(), startedAt:null, endedAt:null, tournamentMatchId:null };
  fixSp(d); return d;
}
function fixSp(d){ const n=d.speakers; const sp=d.times.sp||[]; while(sp.length<n) sp.push(sp.length? sp[sp.length-1] : 180); sp.length=n; d.times.sp=sp;
  d.people.forEach(p=>{ const m=/^([PO])(\d)$/.exec(p.role||''); if(m && +m[2]>n) p.role=m[1]+'m'; }); }
function buildStages(d){
  const t=d.times, N=d.speakers, st=[]; const closingByLast = !(t.fin>0) && N>=2;
  st.push({key:'open',type:'open',label:'Otwarcie debaty',dur:t.open});
  const cnt = closingByLast ? N-1 : N;
  for(let i=1;i<=cnt;i++) for(const tm of ['P','O']) st.push({key:'s'+i+tm,type:'speech',team:tm,sp:i,label: i===1 ? 'Pierwsze wystąpienie' : (d.mode==='quick' ? 'Drugie wystąpienie' : 'Rozwinięcie argumentacji'),dur:t.sp[i-1]});
  st.push({key:'qa',type:'qa',label:'Pytania i odpowiedzi',dur:t.qa});
  if(t.rep>0) for(const tm of ['P','O']) st.push({key:'rep'+tm,type:'rebuttal',team:tm,label:'Replika',dur:t.rep});
  if(closingByLast) for(const tm of ['P','O']) st.push({key:'c'+tm,type:'closing',team:tm,sp:N,label:'Mowa końcowa',dur:t.sp[N-1]});
  else for(const tm of ['P','O']) st.push({key:'f'+tm,type:'closing',team:tm,sp:null,label:'Podsumowanie',dur:t.fin});
  st.push({key:'vote',type:'vote',label:'Głosowanie publiczności',dur:t.vote});
  st.push({key:'jury',type:'jury',label:'Ocena jury',dur:0});
  st.push({key:'sum',type:'summary',label:'Podsumowanie debaty',dur:0});
  return st;
}
function phaseNo(st){ return {open:1,qa:4,rebuttal:5,closing:6,vote:7,jury:8,summary:9}[st.type] || (st.sp===1?2:3); }
const DEF_TEAM = {P:['Propozycja','Proposition'],O:['Opozycja','Opposition']};
const teamName = (d,t) => { const n=(d.teams[t].name||'').trim(); return (!n || DEF_TEAM[t].includes(n)) ? teamWord(t) : n; };
function speakerOf(d,t,i){ const p=d.people.find(p=>p.role===t+i); return p ? p.name : `Mówca ${i}`; }
function speakerObj(d,t,i){ return d.people.find(p=>p.role===t+i); }
function teamMembers(d,t){ return d.people.filter(p=>p.role && p.role[0]===t && p.role.length===2).sort((a,b)=>a.role.localeCompare(b.role)); }
function roleLabel(d,r){ if(!r) return '—'; if(r==='marshal') return 'Marszałek'; if(r==='juror') return 'Juror'; if(r==='aud') return 'Publiczność';
  const m=/^([PO])(\d|m)$/.exec(r); if(m) return (m[2]==='m' ? 'członek drużyny' : m[2]+'. mówca')+' – '+teamName(d,m[1]); return r; }
function roleOptions(d){ const o=[]; for(const t of ['P','O']){ for(let i=1;i<=d.speakers;i++) o.push([t+i, `${teamWord(t)}: ${i}. mówca`]); o.push([t+'m',`${teamWord(t)}: członek drużyny`]); } o.push(['marshal','Marszałek'],['juror','Juror'],['aud','Publiczność']); return o; }
function stageTasks(d,st){
  switch(st.type){
    case 'open': return ['Powitanie uczestników','Przedstawienie tematu i odczytanie tezy','Przedstawienie drużyn','Przypomnienie zasad','Rozpoczęcie debaty'];
    case 'speech': if(st.sp===1) return st.team==='P' ? ['Zdefiniuj kluczowe pojęcia','Przedstaw stanowisko drużyny','Wyjaśnij, jak należy rozumieć tezę','Przedstaw główne argumenty'] : ['Odnieś się do sposobu rozumienia tezy','Przedstaw stanowisko opozycji','Wskaż problemy w argumentacji propozycji','Przedstaw własne argumenty'];
      return ['Rozwiń argumenty drużyny','Podaj przykłady','Odnieś się do argumentów przeciwników','Wskaż słabe punkty stanowiska przeciwnego','Przedstaw kontrargumenty'];
    case 'qa': return ['Pytania dotyczą argumentów przedstawionych w debacie','Pytanie jest krótkie i jednoznaczne','Odpowiedź jest konkretna, bez unikania tematu'];
    case 'rebuttal': return ['Wskaż argument, z którym polemizujesz','Wyjaśnij, dlaczego się z nim nie zgadzasz','Przedstaw własne uzasadnienie','Odwołaj się do wcześniej przedstawionych dowodów'];
    case 'closing': return ['Przypomnij najważniejsze argumenty drużyny','Wskaż, które argumenty przeciwników zostały podważone','Wyjaśnij, dlaczego wasze stanowisko jest bardziej przekonujące','Przedstaw końcowy wniosek – bez nowych głównych argumentów'];
    default: return [];
  }
}
function marshalScript(d){
  const P=teamName(d,'P'), O=teamName(d,'O');
  if(isEN()) return `Ladies and gentlemen, welcome to this Oxford-style debate.\nToday’s topic belongs to the category: ${trText(CATS[d.thesis.cat]||'temat własny')}.\nThe motion is: “${trText(d.thesis.text).replace(/[.!?]$/,'')}”.\nThe proposition team, ${P}, will support the motion. The opposition team, ${O}, will speak against it.\nA reminder of the rules: speakers take the floor in the agreed order, we do not interrupt, we address arguments rather than people, and we respect speaking times.\nI declare the debate open. The floor goes to the first speaker of the proposition.`;
  return `Szanowni Państwo, witam na debacie oksfordzkiej.\nTemat dzisiejszej debaty dotyczy kategorii: ${CATS[d.thesis.cat]||'temat własny'}.\nTeza brzmi: „${d.thesis.text.replace(/[.!?]$/,'')}”.\nTezy będzie bronić drużyna propozycji – ${P}. Przeciwko tezie wystąpi drużyna opozycji – ${O}.\nPrzypominam zasady: mówcy zabierają głos w ustalonej kolejności, nie przerywamy sobie, odnosimy się do argumentów, a nie do osób, i szanujemy czas wystąpień.\nOgłaszam rozpoczęcie debaty. Głos ma pierwszy mówca propozycji.`;
}
function juryAvg(d){ const res={P:{},O:{}}; const js=Object.values(d.jury.scores||{});
  for(const t of ['P','O']) for(const [c] of CRIT){ const v=js.map(j=>j&&j[t]&&j[t][c]).filter(x=>x>0); res[t][c]=mean(v); } return res; }
function juryTotal(d,t){ const a=juryAvg(d)[t]; let s=0,ws=0; for(const [c] of CRIT){ const w=+(d.weights[c]??1); if(a[c]!=null && w>0){ s+=a[c]*w; ws+=w; } } return ws ? s/ws : null; }
function juryPoints(d,t){ const a=juryAvg(d)[t]; let s=0; for(const [c] of CRIT){ if(a[c]!=null) s+=a[c]*(+(d.weights[c]??1)); } return s; }
function jurors(d){ const j=d.people.filter(p=>p.role==='juror').map(p=>p.name); return (!d.juryApp && j.length) ? j : ['Jury (nauczyciel)']; }
function teamPoints(d,t){ return d.points.filter(p=>p.team===t).reduce((s,p)=>s+(+p.pts||0),0); }
function memberPoints(d,id){ return d.points.filter(p=>p.member===id).reduce((s,p)=>s+(+p.pts||0),0); }
function voteWinner(v){ if(v.P>v.O) return 'P'; if(v.O>v.P) return 'O'; return (v.P||v.O) ? 'draw' : ''; }
