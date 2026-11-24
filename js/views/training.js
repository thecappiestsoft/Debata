/* DEBATA! – Arena Argumentów | js/views/training.js
   Widok: trening mówcy (7 kroków) i heurystyczna analiza wypowiedzi (PL). */
'use strict';
/* ---------------- TRENING MÓWCY ---------------- */
const CONNECT = {
  order:['po pierwsze','po drugie','po trzecie','następnie','ponadto','co więcej','przede wszystkim','wreszcie','poza tym','oprócz tego','najpierw'],
  cause:['ponieważ','gdyż','bowiem','dlatego że','z powodu','wynika to z','albowiem'],
  effect:['dlatego','zatem','więc','w związku z tym','wobec tego','w konsekwencji','wynika z tego','skutkiem'],
  example:['na przykład','np.','przykładem','dowodem','potwierdza to','świadczy o tym','jak pokazuje','przykład'],
  contrast:['jednak','natomiast','ale','chociaż','choć','mimo że','z drugiej strony','tymczasem','wprawdzie','nie zgadzam się','nie zgadzamy się'],
  concl:['podsumowując','reasumując','ostatecznie','w podsumowaniu','wnioskuję','dlatego uważam','dlatego uważamy','teza powinna']
};
const COLLOQ = ['no bo','spoko','masakra','w sumie','generalnie','mega','totalnie','serio','czaisz','ogarnąć','kumać','git','xd','lol','typu'];
const ERRORS = [['poszłem','poszedłem'],['wziąść','wziąć'],['włanczać','włączać'],['wyłanczać','wyłączać'],['w każdym bądź razie','w każdym razie / bądź co bądź'],['na dzień dzisiejszy','dziś, obecnie'],['okres czasu','okres'],['cofać się do tyłu','cofać się'],['fakt autentyczny','fakt'],['kontynuować dalej','kontynuować'],['spadać w dół','spadać'],['wracać z powrotem','wracać'],['tylko i wyłącznie','tylko / wyłącznie'],['przekonywujący','przekonujący'],['przekonywująco','przekonująco'],['poprostu','po prostu'],['narazie','na razie'],['wogóle','w ogóle'],['napewno','na pewno'],['naprzykład','na przykład'],['spowrotem','z powrotem'],['nie prawda','nieprawda'],['ilość ludzi','liczba ludzi'],['ilość osób','liczba osób'],['ilość uczniów','liczba uczniów'],['półtorej roku','półtora roku'],['bynajmniej','sprawdź znaczenie: „bynajmniej” = „wcale nie” (nie „przynajmniej”)']];
const OVERGEN = ['wszyscy wiedzą','każdy wie','to oczywiste','wszyscy','nigdy','zawsze','nikt nie'];
const ADHOM = ['głupi','głupie','głupia','bzdura','bzdury','nie macie pojęcia','nie znacie się','śmieszne'];
const STOP = new Set('które który która przez jednak bardzo może można tylko także również ponieważ dlatego jeżeli jeśli wtedy takie taki taka tego temu tym tych które kiedy gdzie czyli żeby aby więc zatem oraz bowiem gdyby nasze nasza nasz naszym wasze wasza nawet wiele jakie jaki jest są było była były będzie będą sobie siebie swoje swoją swojego'.split(' '));
function hasPhrase(text, ph){ const re=new RegExp('(^|[^\\p{L}])'+ph.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?=$|[^\\p{L}])','iu'); return re.test(text); }
function found(text, list){ return list.filter(p=>hasPhrase(text,p)); }
function analyzeTraining(tr){
  const en=isEN(), C=en?CONNECT_EN:CONNECT, Q=qq;
  const all=[tr.speech,tr.response,tr.summary,...tr.args.map(a=>[a.title,a.just,a.example].join(' '))].join('\n');
  const lower=all.toLowerCase(); const res={arg:[],struct:[],lang:[]}; let sa=0, ss=0, sl=0;
  const full=tr.args.filter(a=>a.title.trim()); const withJ=full.filter(a=>a.just.trim().split(/\s+/).length>=4), withE=full.filter(a=>a.example.trim().split(/\s+/).length>=3);
  if(!full.length) res.arg.push(['b',L('Nie przygotowano argumentów.','No arguments prepared.')]); else {
    res.arg.push([withJ.length===full.length?'g':'m',L(`Uzasadnienie ma ${withJ.length} z ${full.length} argumentów.`,`${withJ.length} of ${full.length} arguments have a justification.`)]);
    res.arg.push([withE.length===full.length?'g':'m',L(`Konkretny przykład ma ${withE.length} z ${full.length} argumentów.`,`${withE.length} of ${full.length} arguments have a concrete example.`)]);
    sa += (withJ.length/full.length)*2 + (withE.length/full.length)*2; }
  const cause=found(lower,[...C.cause,...C.effect]); if(cause.length){ res.arg.push(['g',L(`Łączysz twierdzenia z uzasadnieniem (${cause.slice(0,4).map(Q).join(', ')}).`,`You link claims to reasons (${cause.slice(0,4).map(Q).join(', ')}).`)]); sa+=1; } else res.arg.push(['m',L('Brakuje wyrażeń wskazujących na przyczynę i skutek (np. „ponieważ”, „wynika z tego”).','Cause-and-effect expressions are missing (e.g. “because”, “it follows that”).')]);
  if(found(lower,C.example).length){ res.arg.push(['g',L('W wypowiedzi pojawiają się przykłady wprowadzone wprost.','Examples are introduced explicitly.')]); sa+=1; }
  const og=found(lower,en?OVERGEN_EN:OVERGEN); if(og.length) res.arg.push(['m',L(`Uwaga na uogólnienia: ${og.map(Q).join(', ')} – czy masz na to dowód?`,`Watch out for generalisations: ${og.map(Q).join(', ')} – do you have evidence?`)]);
  const sp=tr.speech.toLowerCase();
  if(!tr.speech.trim()) res.struct.push(['b',L('Brak tekstu wystąpienia.','No speech text.')]); else {
    if(found(sp,C.order).length){ res.struct.push(['g',L('Wystąpienie ma czytelny porządek (wyliczenie argumentów).','The speech has a clear order (arguments are listed).')]); ss+=1.5; } else res.struct.push(['m',L('Uporządkuj wystąpienie: „po pierwsze…, po drugie…, ponadto…”.','Structure your speech: “firstly…, secondly…, moreover…”.')]);
    if(found(sp,en?STANCE_EN:STANCE_PL).length){ res.struct.push(['g',L('Na początku jasno określasz stanowisko wobec tezy.','You state your position on the motion clearly.')]); ss+=1; } else res.struct.push(['m',L('Zacznij od wyraźnego stanowiska: „Uważam, że teza…”.','Start with a clear position: “I believe the motion…”.')]);
  }
  const rp=tr.response.toLowerCase();
  if(!tr.response.trim()) res.struct.push(['b',L('Brak odpowiedzi na kontrargument.','No reply to the counterargument.')]); else { if(found(rp,C.contrast).length||found(rp,en?REF_EN:REF_PL).length){ res.struct.push(['g',L('Odnosisz się wprost do kontrargumentu.','You respond directly to the counterargument.')]); ss+=1.5; } else res.struct.push(['m',L('W odpowiedzi nazwij argument przeciwnika i powiedz, dlaczego się z nim nie zgadzasz.','In your reply, name the opponent’s argument and say why you disagree with it.')]); }
  const sm=tr.summary.toLowerCase();
  if(!tr.summary.trim()) res.struct.push(['b',L('Brak podsumowania.','No summary.')]); else { if(found(sm,C.concl).length){ res.struct.push(['g',L('Podsumowanie zawiera wyraźny wniosek.','The summary contains a clear conclusion.')]); ss+=1; } else res.struct.push(['m',L('Zakończ wnioskiem: „Podsumowując…, dlatego uważam, że…”.','End with a conclusion: “To sum up…, therefore I believe that…”.')]); }
  const errs=(en?ERRORS_EN:ERRORS).filter(([w])=>hasPhrase(lower,w)); errs.forEach(([w,c])=>res.lang.push(['b',`${Q(w)} → ${c}`]));
  const col=found(lower,en?COLLOQ_EN:COLLOQ); if(col.length) res.lang.push(['m',L(`Wyrażenia potoczne: ${col.map(Q).join(', ')} – w debacie lepiej użyć stylu oficjalnego.`,`Colloquial expressions: ${col.map(Q).join(', ')} – a formal style works better in a debate.`)]);
  const ah=found(lower,en?ADHOM_EN:ADHOM); if(ah.length) res.lang.push(['b',L(`Uwaga na kulturę dyskusji: ${ah.map(Q).join(', ')}. Oceniaj argumenty, nie ludzi.`,`Mind your manners: ${ah.map(Q).join(', ')}. Judge arguments, not people.`)]);
  const SW=en?STOP_EN:STOP; const words=(lower.match(/\p{L}{5,}/gu)||[]).filter(w=>!SW.has(w)); const cnt={}; words.forEach(w=>cnt[w]=(cnt[w]||0)+1);
  const rep=Object.entries(cnt).filter(([,n])=>n>=4).sort((a,b)=>b[1]-a[1]).slice(0,3); if(rep.length) res.lang.push(['m',L(`Powtórzenia: ${rep.map(([w,n])=>`${Q(w)} (${n}×)`).join(', ')} – poszukaj synonimów.`,`Repetition: ${rep.map(([w,n])=>`${Q(w)} (${n}×)`).join(', ')} – look for synonyms.`)]);
  const sents=all.split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(s=>s.split(/\s+/).length>2);
  const longS=sents.filter(s=>s.split(/\s+/).length>40).length; if(longS) res.lang.push(['m',L(`Bardzo długie zdania (${longS}) – rozważ podział, by słuchacze nadążyli.`,`Very long sentences (${longS}) – consider splitting them so listeners can follow.`)]);
  const low=sents.filter(s=>/^\p{Ll}/u.test(s)).length; if(low) res.lang.push(['m',L(`Zdania rozpoczęte małą literą: ${low}.`,`Sentences starting with a lowercase letter: ${low}.`)]);
  if(sents.length>=3 && sents.every(s=>s.split(/\s+/).length<7)) res.lang.push(['m',L('Same krótkie zdania – spróbuj łączyć myśli w zdania złożone („ponieważ”, „dlatego”, „mimo że”).','Only short sentences – try combining ideas into complex sentences (“because”, “therefore”, “although”).')]);
  sl = Math.max(0, 3 - errs.length - (col.length?1:0) - (ah.length?1:0) - (rep.length?0.5:0));
  if(!res.lang.length) res.lang.push(['g',L('Nie wykryto typowych błędów językowych ani wyrażeń potocznych.','No typical language errors or colloquialisms detected.')]);
  const lv=(v,max)=> v>=max*0.75?'g':v>=max*0.4?'m':'b';
  return {res, levels:{arg:lv(sa,6),struct:lv(ss,5),lang:lv(sl,3)}};
}
VIEWS.training = () => {
  const tr=S.training; if(!tr) { return `<div class="card"><p>Brak treningu.</p><button class="btn pri" data-a="training">Rozpocznij</button></div>`; }
  const steps=['Teza','Stanowisko','Argumenty','Wystąpienie','Kontrargument','Podsumowanie','Informacja zwrotna'];
  const s=tr.step; let body='';
  const sideTxt = tr.stance ? (tr.stance==='P'?'bronisz tezy (propozycja)':'występujesz przeciw tezie (opozycja)') : '';
  if(s===0){ const L=S.theses.filter(t=>t.active);
    body=`<div class="card"><div class="sec-t"><span class="par">1</span> Wybierz lub wylosuj tezę</div>
     ${tr.thesis?thesisBlock(tr.thesis.text,true,`<details class="ctx"><summary>Kontekst</summary><div class="small">${esc(tr.thesis.ctx)}</div></details>`):''}
     <div class="row" style="margin-top:.8rem"><select id="trCat" class="inp" style="width:auto"><option value="">Dowolna kategoria</option>${Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select><button class="btn gold" data-a="trRandom">🎲 Losuj tezę</button></div>
     <label class="f">…albo wybierz z listy</label><select class="inp" data-chg="trPick"><option value="">— wybierz —</option>${L.map(t=>`<option value="${t.id}" ${tr.thesis&&tr.thesis.id===t.id?'selected':''}>${esc(t.text)}</option>`).join('')}</select></div>`; }
  if(s===1) body=`<div class="card center"><div class="sec-t"><span class="par">2</span> Wylosuj stanowisko</div>${thesisBlock(tr.thesis.text,true)}
     <div class="coin ${tr.stance||''} ${ui.spin?'spin':''}">${tr.stance?(tr.stance==='P'?'ZA<br>tezą':'PRZECIW<br>tezie'):'?'}</div>
     ${tr.stance?`<p style="font-family:var(--serif);font-size:1.2rem">W tym treningu <b>${sideTxt}</b>.</p>`:''}<button class="btn gold" data-a="trStance">${tr.stance?'Losuj ponownie':'🎲 Losuj stanowisko'}</button></div>`;
  if(s===2) body=`<div class="card"><div class="sec-t"><span class="par">3</span> Przygotuj argumenty <span class="small muted" style="font-family:var(--sans);font-weight:400">– ${sideTxt}</span></div>
     ${tr.args.map((a,i)=>`<div class="argcard ${tr.stance}"><b style="font-family:var(--serif)">Argument ${i+1}</b><label class="f">Tytuł / teza argumentu</label><input class="inp" data-bind="training.args.${i}.title" value="${esc(a.title)}"><div class="g"><div><label class="f">Uzasadnienie</label><textarea class="inp" rows="2" data-bind="training.args.${i}.just">${esc(a.just)}</textarea></div><div><label class="f">Przykład</label><textarea class="inp" rows="2" data-bind="training.args.${i}.example">${esc(a.example)}</textarea></div></div></div>`).join('')}
     <div class="row"><button class="btn sm ghost" data-a="trAddArg" ${tr.args.length>=5?'disabled':''}>+ Kolejny argument</button><button class="btn sm ghost" data-a="sheet">📜 Ściągawka</button></div></div>`;
  if(s===3) body=`<div class="grid2"><div class="card"><div class="sec-t"><span class="par">4</span> Napisz krótkie wystąpienie</div><p class="small muted">Przedstaw stanowisko i 2–3 argumenty – tak, jak powiedział(a)byś je na forum klasy. Możesz włączyć timer i spróbować wygłosić tekst na głos.</p>
     <textarea class="inp zeszyt" rows="12" data-bind="training.speech">${esc(tr.speech)}</textarea></div>
     <div class="card center"><div class="small muted" style="font-family:var(--serif)">Ćwiczenie na czas</div>${timerHtml(true)}${timerCtl(tr.timer)}<div class="row" style="justify-content:center;margin-top:.5rem">${[60,120,180].map(v=>`<button class="btn sm ghost" data-a="trSetTime" data-s="${v}">${v/60} min</button>`).join('')}</div>
      <div style="text-align:left;margin-top:1rem"><h4>Twoje argumenty</h4><ul class="small">${tr.args.filter(a=>a.title).map(a=>`<li>${esc(a.title)}</li>`).join('')||'<li class="muted">—</li>'}</ul></div></div></div>`;
  if(s===4) body=`<div class="card"><div class="sec-t"><span class="par">5</span> Odpowiedz na kontrargument</div>
     ${tr.counter?`<div class="notice"><b>Wylosowany kontrargument dotyczy obszaru: „${esc(tr.counter)}”.</b><br>Wyobraź sobie, że przeciwnik mówi: <i>„Wasze stanowisko nie uwzględnia kwestii: ${esc(tr.counter)}”.</i> Odpowiedz na ten zarzut.</div>`:''}
     <button class="btn gold sm" data-a="trCounter">🎲 ${tr.counter?'Losuj inny':'Losuj kontrargument'}</button>
     ${tr.counter?`<textarea class="inp zeszyt" rows="7" style="margin-top:.7rem" data-bind="training.response" placeholder="Nie zgadzam się z tym zarzutem, ponieważ…">${esc(tr.response)}</textarea>`:''}</div>`;
  if(s===5) body=`<div class="card"><div class="sec-t"><span class="par">6</span> Przygotuj podsumowanie</div><p class="small muted">Przypomnij najważniejsze argumenty i sformułuj wniosek. Nie dodawaj nowych głównych argumentów.</p><textarea class="inp zeszyt" rows="6" data-bind="training.summary" placeholder="Podsumowując…">${esc(tr.summary)}</textarea></div>`;
  if(s===6){ const A=analyzeTraining(tr); const L={g:['g','mocna strona'],m:['m','do rozwinięcia'],b:['b','wymaga pracy']};
    const box=(k,t)=>`<div class="card"><div class="row between"><div class="sec-t" style="border:0;margin:0">${t}</div><span class="lvl ${L[A.levels[k]][0]}">${L[A.levels[k]][1]}</span></div><ul class="rem">${A.res[k].map(([lv,x])=>`<li class="${lv==='g'?'ok':''}">${esc(x)}</li>`).join('')}</ul></div>`;
    body=`<div class="notice info">Automatyczna analiza heurystyczna: sprawdza obecność uzasadnień, przykładów, wyrażeń porządkujących i typowych błędów. To wskazówki, nie ocena – <b>nie zależy od długości tekstu</b>. Najcenniejsza jest rozmowa z nauczycielem.</div>
     <div class="grid3">${box('arg','Jakość argumentacji')}${box('struct','Struktura wypowiedzi')}${box('lang','Poprawność językowa')}</div>
     <div class="card"><div class="sec-t"><span class="par">✓</span> Samoocena</div>${['Moje argumenty mają uzasadnienie','Podałem/podałam konkretne przykłady','Odniosłem/odniosłam się wprost do kontrargumentu','Podsumowanie nie wprowadza nowych argumentów','Zmieściłem/zmieściłam się w czasie'].map((x,i)=>`<label class="row small"><input type="checkbox" data-bind="training.self.${i}" ${tr.self[i]?'checked':''}> ${x}</label>`).join('')}</div>
     <div class="row end"><button class="btn" data-a="trNew">Nowy trening</button><button class="btn gold" data-a="trFinish">Zapisz i zakończ</button></div>`; }
  const canNext = (s===0&&tr.thesis)||(s===1&&tr.stance)||(s>=2&&s<6);
  return `<div class="row between"><h2>✒️ Trening mówcy</h2><button class="btn ghost" data-a="trNew">Zacznij od nowa</button></div>
   <div class="wizard">${steps.map((x,i)=>`<span class="wstep ${i===s?'on':''} ${i<s?'done':''}">${i+1}. ${x}</span>`).join('')}</div>${body}
   ${s<6?`<div class="row between"><div>${s>0?'<button class="btn ghost" data-a="trStep" data-d="-1">← Wstecz</button>':''}</div><button class="btn pri lg" data-a="trStep" data-d="1" ${canNext?'':'disabled'}>${s===5?'Pokaż informację zwrotną →':'Dalej →'}</button></div>`:''}`;
};
