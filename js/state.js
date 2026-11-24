/* DEBATA! – Arena Argumentów | js/state.js
   Stan aplikacji i zapis w localStorage, ustawienia domyślne, PIN nauczyciela. */
'use strict';
/* =====================================================================
   STAN APLIKACJI (localStorage)
   ===================================================================== */
const KEY = 'debata-arena-v1';
let storageOk = true;
let S;
const ui = {libCat:'',libDiff:'',libSet:'',libQ:'',dTab:'notes',juror:null,anon:'cover',sheet:false};
function seedTheses(){ return THESES_SEED.map((t,i)=>({id:'t'+(i+1),cat:t[0],diff:t[1],text:t[2],ctx:t[3],dirsP:t[4].split('|'),dirsO:t[5].split('|'),active:true})); }
function defaults(){
  return { v:1, view:{name:'home'},
    settings:{pin:'',sound:true,scoring:true,cheatsheet:true,qaMode:'oral',speakers:4,
      events:{hard:true,persp:true,last:true,unexp:true},
      weights:Object.fromEntries(CRIT.map(c=>[c[0],1])),
      times:clone(DEF_TIMES), qPool:Q_POOL.slice()},
    theses:seedTheses(),
    sets:[{id:'set-lit',name:'Literatura i lektury',ids:['t1','t4','t6','t7','t8','t9','t10']},{id:'set-net',name:'Świat cyfrowy',ids:['t3','t11','t12','t13','t14','t15','t16','t17']}],
    history:[], trainings:[], tournament:null, current:null, training:null };
}
function load(){
  const D = defaults();
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw){ S = D; return; }
    const p = JSON.parse(raw);
    S = Object.assign(D, p);
    S.settings = Object.assign(defaults().settings, p.settings||{});
    S.settings.events = Object.assign(defaults().settings.events, (p.settings||{}).events||{});
    S.settings.weights = Object.assign(defaults().settings.weights, (p.settings||{}).weights||{});
    S.settings.times = Object.assign(clone(DEF_TIMES), (p.settings||{}).times||{});
    if(!Array.isArray(S.theses)||!S.theses.length) S.theses = seedTheses();
    if(!S.view||!S.view.name) S.view={name:'home'};
  }catch(e){ storageOk=false; S = D; }
}
let saveT=null;
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); storageOk=true; }catch(e){ if(storageOk) toast('Nie udało się zapisać danych w pamięci przeglądarki. Dane działają tylko do zamknięcia karty.','bad'); storageOk=false; } }
function saveSoon(){ clearTimeout(saveT); saveT=setTimeout(save,300); }

/* nauczyciel / PIN */
let teacherMem=false;
function isTeacher(){ if(!S.settings.pin) return true; try{ return sessionStorage.getItem('debata-t')==='1' || teacherMem; }catch(e){ return teacherMem; } }
function unlockTeacher(){ teacherMem=true; try{ sessionStorage.setItem('debata-t','1'); }catch(e){} }
function lockTeacher(){ teacherMem=false; try{ sessionStorage.removeItem('debata-t'); }catch(e){} }
function requireTeacher(cb){
  if(isTeacher()) return cb();
  modal('Wymagany PIN nauczyciela', `<p>Ta czynność jest dostępna tylko dla nauczyciela.</p><label class="f" for="m-pin">Kod PIN</label><input id="m-pin" class="inp" type="password" inputmode="numeric" autocomplete="off">`,
   [{label:'Anuluj'},{label:'Odblokuj',cls:'pri',fn:()=>{ if($('#m-pin').value===S.settings.pin){ unlockTeacher(); setTimeout(cb,0); return true; } toast('Nieprawidłowy PIN','bad'); return false; }}]);
}
