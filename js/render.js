/* DEBATA! – Arena Argumentów | js/render.js
   Mechanizm renderowania widoków, menu górne (z przełącznikami PL/EN i jasny/ciemny), ściągawka. */
'use strict';
/* =====================================================================
   RENDER
   ===================================================================== */
const app = $('#app');
const VIEWS = {};
const UIREND = {};
function render(){
  const fn = VIEWS[S.view.name] || VIEWS.home; let html;
  try{ html = fn(); }catch(e){ console.error(e); html = `<div class="card notice bad"><b>Wystąpił błąd widoku.</b> ${esc(e.message)}<div class="row" style="margin-top:.6rem"><button class="btn pri" data-a="home">Wróć na stronę główną</button></div></div>`; }
  app.innerHTML = html + drawerHtml();
  document.documentElement.lang = lang(); document.title = L('DEBATA! – Arena Argumentów','DEBATA! – Arena of Arguments');
  renderNav(); tick();
}
function go(name, extra={}){ S.view = Object.assign({name}, extra); save(); render(); window.scrollTo(0,0); }
function renderNav(){
  const v=S.view.name; const b=(n,l)=>`<button class="${v===n?'on':''}" data-a="nav" data-v="${n}">${l}</button>`;
  $('#nav').innerHTML = b('home','Start') + (S.current && S.current.phase!=='setup' ? b('debate','▶ Debata') : '') + b('library','Biblioteka tez') + b('history','Historia') + b('tournament','Turniej') + b('teacher', (S.settings.pin ? (isTeacher()?'🔓 ':'🔒 ') : '')+'Panel nauczyciela') + `<span class="langsw" role="group" aria-label="Język / Language"><button class="${isEN()?'':'on'}" data-a="lang" data-l="pl" aria-pressed="${!isEN()}">PL</button><button class="${isEN()?'on':''}" data-a="lang" data-l="en" aria-pressed="${isEN()}">EN</button></span>` + `<span class="themesw" role="group" aria-label="Motyw"><button class="${themeNow()==='light'?'on':''}" data-a="theme" data-t="light" title="Jasny motyw" aria-label="Jasny motyw" aria-pressed="${themeNow()==='light'}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg></button><button class="${themeNow()==='dark'?'on':''}" data-a="theme" data-t="dark" title="Ciemny motyw" aria-label="Ciemny motyw" aria-pressed="${themeNow()==='dark'}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.6 8.6 0 1 0 10.8 10.8z"/></svg></button></span>`;
}
function thesisBlock(text, sm, ctx){ return `<div class="thesis ${sm?'sm':''}"><div class="tq">Teza debaty</div><blockquote>„${esc(text)}”</blockquote>${ctx||''}</div>`; }
function drawerHtml(){
  return `<aside class="drawer ${ui.sheet?'open':''}" id="drawer" aria-label="Ściągawka"><div class="row between"><h3 style="margin:0">Ściągawka mówcy</h3><button class="btn sm ghost" data-a="sheet">✕ Zamknij</button></div>
  <p class="small muted">Gotowe zwroty pomagają zacząć zdanie – treść argumentu musi być Wasza.</p>
  <div class="phr">${PHRASES.map(([h,l])=>`<h4>${esc(h)}</h4><ul>${l.map(x=>`<li>„${esc(x)}”</li>`).join('')}</ul>`).join('')}
  <h4>Uwaga na błędy logiczne</h4><ul>${FALLACIES.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div></aside>`;
}
