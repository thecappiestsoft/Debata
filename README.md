# DEBATA! – Arena Argumentów

Aplikacja webowa do prowadzenia debat oksfordzkich na lekcjach języka polskiego.
Czysty HTML + CSS + JavaScript: bez frameworków, bez kroku budowania, bez serwera.

© 2026 CappySoft.pl

---

## Uruchomienie

- **Lokalnie:** otwórz `index.html` w przeglądarce (dwuklik). Działa także z `file://` i bez internetu.
- **Na serwerze:** wgraj cały katalog na dowolny hosting statyczny. Konfiguracja nie jest potrzebna.

Dane zapisują się w `localStorage` przeglądarki pod kluczem `debata-arena-v1`.

---

## Struktura plików

```
debata/
├── index.html              Szkielet strony: nagłówek, <main id="app">, stopka; dołącza CSS i JS
├── README.md
├── css/
│   ├── base.css            Zmienne kolorów (:root), typografia, wszystkie komponenty
│   ├── dark.css            Tryb ciemny + wygląd przełącznika motywu
│   └── print.css           Wydruk raportu / PDF
└── js/
    ├── data.js             Stałe: tezy (PL), kategorie, kryteria, odznaki, wydarzenia, pytania, zwroty, czasy
    ├── i18n.js             Wersja angielska: tłumaczenia tez i UI, tłumacz DOM
    ├── utils.js            $, esc, uid, fmt (czas), fdate, setPath
    ├── state.js            Stan S, domyślne ustawienia, load/save (localStorage), PIN
    ├── ui.js               modal, confirmBox, toast, download, import/eksport danych, beep
    ├── timer.js            Timer etapów
    ├── model.js            Model debaty: newDebate, buildStages, role, zadania mówców, oceny jury
    ├── render.js           render(), go(), menu górne (PL|EN, ☀|☾), ściągawka
    ├── views/
    │   ├── home.js         Strona główna
    │   ├── setup.js        Konfiguracja debaty (4 kroki)
    │   ├── prep.js         Przygotowanie drużyn (A–F)
    │   ├── debate.js       Ekran debaty (etapy, pytania, głosowanie, jury)
    │   ├── report.js       Raport, informacja zwrotna, eksport CSV
    │   ├── history.js      Historia
    │   ├── teacher.js      Panel nauczyciela
    │   ├── library.js      Biblioteka tez
    │   ├── training.js     Trening mówcy + analiza wypowiedzi
    │   └── tournament.js   Turniej
    ├── actions.js          Wszystkie akcje przycisków (obiekt A)
    ├── events.js           Obsługa kliknięć, pól formularzy, klawiatury
    └── main.js             Start aplikacji
```

### Kolejność ładowania skryptów

Pliki JS to zwykłe skrypty (nie moduły ES). Dzielą jeden zakres globalny, dzięki czemu
aplikacja działa także po otwarciu z dysku. **Kolejność w `index.html` ma znaczenie:**
dane → i18n → narzędzia → stan → UI → timer → model → render → widoki → akcje → zdarzenia → `main.js`.
Nowy plik dodaj przed `main.js`.

---

## Jak to działa (w skrócie)

| Element | Gdzie | Opis |
|---|---|---|
| Stan | `state.js` | Jeden obiekt `S` (ustawienia, tezy, historia, bieżąca debata `S.current`, turniej, trening). `save()` zapisuje go do localStorage. |
| Widoki | `views/*.js` | Każdy widok to funkcja `VIEWS.nazwa = () => '...HTML...'`. `render()` wstawia wynik do `#app`. Przejście: `go('nazwa')`. |
| Akcje | `actions.js` | Przycisk z `data-a="nazwa"` wywołuje `A.nazwa(dataset)`. Pozostałe atrybuty `data-*` trafiają do akcji jako `ds`. |
| Pola formularzy | `events.js` | `data-bind="ścieżka.w.S"` zapisuje wartość pola prosto do stanu, np. `data-bind="current.teams.P.name"`. Dodatkowo: `data-num` (liczba), `data-num="min"` (minuty → sekundy), `data-rr` (przerenderuj po zmianie), `data-lines` (tekst → tablica linii). |
| Timer | `timer.js` | Obiekt `{dur, planned, rem, running, start}`. Odświeżany co 250 ms funkcją `tick()`. |
| Etapy debaty | `model.js` → `buildStages()` | Lista etapów budowana z ustawień czasu i liczby mówców. |

---

## Gdzie wprowadzać typowe poprawki

| Chcę zmienić… | Plik |
|---|---|
| Kolory, czcionki, odstępy | `css/base.css` (zmienne w `:root`) |
| Kolory trybu ciemnego | `css/dark.css` |
| Wygląd wydruku raportu | `css/print.css` |
| Dodać / poprawić tezę z biblioteki | `js/data.js` → `THESES_SEED` **oraz** angielską wersję w `js/i18n.js` → `THESES_EN` (ta sama pozycja na liście) |
| Kryteria oceny jury, odznaki, wydarzenia specjalne | `js/data.js` (`CRIT`, `BADGES`, `EVENTS`) + tłumaczenia w `js/i18n.js` |
| Zwroty w ściągawce, pula pytań | `js/data.js` (`PHRASES`, `Q_POOL`) + `js/i18n.js` (`Q_POOL_EN`) |
| Domyślne czasy etapów | `js/data.js` → `DEF_TIMES` |
| Kolejność / rodzaje etapów debaty | `js/model.js` → `buildStages()`, zadania mówców: `stageTasks()` |
| Tekst marszałka na otwarcie | `js/model.js` → `marshalScript()` |
| Informacja zwrotna i rekomendacje w raporcie | `js/views/report.js` → `feedbackFor()`, `recommendations()` |
| Analiza wypowiedzi w treningu (błędy, spójniki) | `js/views/training.js` (PL) i `js/i18n.js` (`CONNECT_EN`, `ERRORS_EN`…) |
| Punktacja turnieju | `js/views/tournament.js` → `ranking()` |
| Zachowanie przycisku | `js/actions.js` (szukaj `A.nazwa`, nazwa z atrybutu `data-a`) |
| Menu górne, przełączniki PL/EN i jasny/ciemny | `js/render.js` → `renderNav()` |
| Stopka, nagłówek | `index.html` |

---

## Tłumaczenia (PL / EN)

Kod źródłowy i szablony są po polsku. Wersję angielską daje plik `js/i18n.js`:

1. **Słownik `EN`** – dokładne tłumaczenia tekstów: `'Tekst polski':'English text'`.
2. **Reguły `ENRX`** – wyrażenia regularne dla tekstów ze zmiennymi, np. `Etap 3 z 15` → `Stage 3 of 15`.
3. **Tłumacz DOM** – `MutationObserver` w trybie EN podmienia teksty i atrybuty (`placeholder`, `title`, `aria-label`) zaraz po wyrenderowaniu. Treści wpisane przez użytkownika w `<textarea>` są pomijane.
4. **Teksty generowane** (scenariusz marszałka, informacja zwrotna, analiza treningu) wybierają język w kodzie: funkcja `L('polski','English')`.

**Dodajesz nowy tekst w interfejsie?** Dopisz parę do słownika `EN` w `i18n.js`. Inaczej w wersji angielskiej zostanie po polsku.

---

## Motyw jasny / ciemny

- Atrybut `data-theme="light|dark"` na `<html>` ustawia `applyTheme()` w `main.js`.
- Wybór jest zapisany w `S.settings.theme`. Bez wyboru motyw jest zgodny z ustawieniem systemu (`prefers-color-scheme`).
- W CSS teksty nagłówków używają zmiennej `--hd`, a tła granatowe zmiennej `--navy`. Dzięki temu w trybie ciemnym tło zostaje ciemne, a tekst robi się jasny.
- Przed drukiem motyw przełącza się na jasny (`beforeprint`).

---

## Ograniczenia i uwagi

- **Brak synchronizacji między urządzeniami.** Przygotowanie drużyny przenosi się ręcznie przyciskami Eksportuj / Importuj (JSON).
- **Pobieranie plików i drukowanie** mogą być zablokowane, gdy aplikacja działa w osadzonej ramce (iframe). Lokalnie i na zwykłym hostingu działają normalnie.
- **Zmiana struktury danych** w `S`: przy wczytywaniu `load()` scala zapisane dane z `defaults()`. Nowe pola ustawień dodawaj w `defaults()`, a starsze dane uzupełnią się same.
- **Kopia zapasowa:** Panel nauczyciela → Dane → Kopia zapasowa (pełny JSON stanu).

---

## Szybki test po zmianach

Po każdej zmianie przejdź w przeglądarce cały scenariusz:

1. Nowa debata → wybór tezy → losowy podział klasy → przygotowanie.
2. Debata: wszystkie etapy → głosowanie → ocena jury → raport.
3. Przełącz PL → EN i jasny → ciemny na kilku ekranach.
4. Sprawdź konsolę przeglądarki (F12): nie powinno być błędów.
