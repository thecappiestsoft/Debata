/* DEBATA! – Arena Argumentów | js/main.js
   Start aplikacji: motyw jasny/ciemny, wczytanie danych, uruchomienie tłumaczeń i pierwsze renderowanie. */
'use strict';
/* START */
function themeNow(){ const t=S&&S.settings&&S.settings.theme; if(t==='dark'||t==='light') return t; try{ return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'; }catch(e){ return 'light'; } }
function applyTheme(){ document.documentElement.dataset.theme=themeNow(); }
try{ matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{ if(!S.settings.theme){ applyTheme(); renderNav(); } }); }catch(e){}
window.addEventListener('beforeprint',()=>{ document.documentElement.dataset.theme='light'; });
window.addEventListener('afterprint',applyTheme);
load();
applyTheme();
startI18n();
if(S.view.name==='report' && !S.history.some(h=>h.id===S.view.id)) S.view={name:'home'};
render();
