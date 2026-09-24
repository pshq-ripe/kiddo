# Kiddo World — analiza kodu i plan prac (workload)

_Analiza: 2026-09-24 · źródło: kod wygenerowany w Google AI Studio (folder `kiddo/`)_

## 0. Status — zrobione 2026-09-24

- ✅ Zależności: usunięte `@google/genai`, `express`, `dotenv`, `motion`, `esbuild`, `tsx`; `npm install` działa bez flag; `bun.lock` zastąpiony `package-lock.json`.
- ✅ Fonty lokalnie (`@fontsource/quicksand`, `material-symbols`) — bez internetu ikony nie zamieniały się już w napisy typu „chevron_right”. Poprawione nieistniejące ikony (`wink`, `bone`, `cherry`, `apple`).
- ✅ Kalendarz: lokalna data zamiast UTC; naprawiony drugi i kolejne tygodnie (dzień 1 był oznaczany jako odebrany); przyciski testowe „Następny dzień/↺” tylko w trybie dev.
- ✅ Dziennik: lokalna data. Zdjęcia: prawdziwa data zamiast stałego „Dziś”, mniejsze pliki (JPEG 0.72, skala 1), limit 25, przy braku miejsca usuwane najstarsze nieulubione (wcześniej nowe zdjęcie mogło zniknąć).
- ✅ Zapamiętywane: dźwięk wł./wył., wybrana postać.
- ✅ Na telefonie: brak sztucznego paska statusu i przycisku „zainstaluj”; w APK service worker wyłączony.
- ✅ Projekt Android (Capacitor 8, `pl.pshq.kiddoworld`, portret, ikony i splash z logo gry) + `build-apk.sh`; README zaktualizowane.
- ⏳ Nadal otwarte: grafiki `APP_IMAGES` z serwerów Google (pkt 5.1), IndexedDB dla zdjęć, pozycje postaci w pokoju, refaktoryzacja.

## 1. Podsumowanie

Kiddo World to **front-endowa gra PWA** (React 19 + Vite 8 + Tailwind 4) w stylu „cyfrowego domku dla lalek”: mapa świata z 5 lokacjami, kreator postaci, pokój zabaw z meblami/zabawkami/zwierzakami, plecak, kalendarz nagród, odznaki, dziennik, galeria zdjęć, „poczta” od wirtualnych przyjaciół. Całość po polsku, bez backendu, stan w `localStorage`.

**Werdykt:** projekt jest **grywalny i się buduje**, ale ma typowe cechy kodu z generatora: duże „god-komponenty”, zależność od obrazków hostowanych tymczasowo przez Google, zbędne zależności, symulator telefonu i ekran „wydania APK” widoczne dla dziecka. Do wersji „na telefon córki” potrzeba ok. **1–2 dni pracy** (sekcja 6, etap 1–2). Refaktoryzacja i rozwój — osobno.

## 2. Stack i struktura

| Obszar | Stan |
|---|---|
| Framework | React 19, TypeScript, Vite 8 (rolldown), Tailwind 4 |
| Animacje | `framer-motion` (używane) + `motion` (zainstalowane, **nieużywane**) |
| Efekty | `canvas-confetti`, Web Audio API (syntezator dźwięków, bez plików audio), `navigator.vibrate` |
| Zdjęcia | `html2canvas` — zrzut sceny pokoju do base64 |
| PWA | `vite-plugin-pwa` (autoUpdate, manifest, precache, orientacja portrait) |
| Backend | brak. `@google/genai`, `express`, `dotenv` w `dependencies`, ale **nieużywane** w `src/` (pozostałość szablonu AI Studio) |
| Stan | `useState` w `App`/`PlayZone` + moduły `utils/*Manager.ts` na `localStorage` + `window` CustomEvents jako „event bus” |
| Rozmiar | ~16,6 tys. linii TS/TSX, 43 pliki; bundle JS 978 kB (260 kB gzip), jeden chunk |

Największe pliki: `PlayZone.tsx` (2281 linii, ~45 `useState`), `CharacterMaker.tsx` (1084), `FriendshipManagerModal.tsx` (1066), `DollhouseFurniture.tsx` (970), `WeatherEffectsOverlay.tsx` (966), `CharacterHead.tsx` (900).

### Klucze w localStorage
`kiddo_characters`, `kiddo_adopted_pets`, `kiddo_furniture_layout`, `kiddo_virtual_coins`, `kiddo_achievements`, `kiddo_adventure_journal`, `kiddo_photo_gallery_v1`, `kiddo_calendar_state`, `kiddo_unlocked_stickers`, `kiddo_unlocked_palettes`, `kiddo_friends_data_v1`, `kiddo_mailbox_data_v1` (+ `sessionStorage: kiddo_calendar_auto_prompted`).

## 3. Funkcje (co jest w grze)

- **Mapa świata** (`WorldMap`) — 5 lokacji: Mieszkanie, Park/Plac zabaw, Cukiernia, Szkoła Talentów, Plaża; przełącznik pogody (słońce, tęcza, śnieg, deszcz, noc) z efektami.
- **Kreator postaci** — skóra, 6 fryzur, oczy, usta, 6 strojów, czapki, okulary; 9 emocji z animacjami. Postacie rysowane w SVG (`CharacterHead`), nie z obrazków.
- **Pokój zabaw** (`PlayZone`) — przeciąganie postaci/zwierzaków/mebli (pointer events), interaktywne przedmioty (TV, lampa, lodówka, kran, radio, karuzela, piekarnik, pianino, delfin…), tryb imprezy, aparat.
- **Zwierzaki** — adopcja 8 gatunków, karmienie, szczęście, akcesoria.
- **Meble** — kolory, naklejki, monety (start 120) na personalizację.
- **Kalendarz 7-dniowy** z nagrodami (monety, naklejki, palety), auto-otwarcie raz na sesję.
- **Odznaki** (17), **Dziennik przygód**, **Galeria zdjęć**, **Poczta i zaproszenia** od symulowanych przyjaciół (losowe wiadomości, prezenty).
- **Offline** (service worker) + przycisk instalacji PWA.

## 4. Stan techniczny — sprawdzone

| Test | Wynik |
|---|---|
| `npm install` | ❌ **nie przechodzi** — konflikt peer: `esbuild@^0.25` w devDeps vs `vite@8` wymaga `^0.27/^0.28`. Działa z `--legacy-peer-deps` (lub bun, jest `bun.lock`). |
| `tsc --noEmit` | ✅ 0 błędów |
| `vite build` | ✅ ok, ostrzeżenie o chunku > 500 kB; precache 17 plików / 1,34 MB |
| Testy / ESLint | brak |

## 5. Znalezione problemy (priorytety)

### 🔴 Krytyczne dla użytku na telefonie
1. **Obrazki z `lh3.googleusercontent.com/aida-public/...`** (`APP_IMAGES` w `data/kiddoData.ts`: tła lokacji, logo, avatary, zwierzaki) — to tymczasowe URL-e AI Studio. Mogą wygasnąć, a SW ich **nie cache’uje** (runtimeCaching obejmuje tylko fonty) → offline i po wygaśnięciu gra traci grafiki. **Pobrać do `public/assets/` i podmienić ścieżki.** (Stary `kiddo-world-project.zip` ma pusty katalog `public/assets/aistudio` — ślad, że miało to nastąpić.) Analogicznie 2 przykładowe zdjęcia z Unsplash w galerii.
2. **`npm install` się wysypuje** — podbić/usunąć `esbuild` z devDeps.
3. **Ekrany dla rodzica widoczne dla dziecka** — `PhoneSimulator` (ramka telefonu, kolory obudowy), `MobileReleaseModal` (QR, instrukcje APK, pobieranie ZIP z kodem przez `public/kiddo-world-project.zip`, QR generowany przez zewnętrzne `api.qrserver.com`). Na telefonie ramka się wyłącza, ale modal/przyciski warto ukryć za „bramką rodzica” lub usunąć.

### 🟠 Ważne
4. **Zdjęcia w localStorage jako base64 JPEG** (`photoGalleryManager`) — limit ~5 MB zapełni się po kilkunastu zdjęciach; wtedy zapis „po cichu” przycina do 30, a gdy i to nie wejdzie — zdjęcie ginie bez komunikatu. Przenieść do IndexedDB (np. `idb-keyval`) i ograniczyć liczbę/rozdzielczość.
5. **html2canvas + obrazki cross-origin** — przy `allowTaint` canvas może zostać „skażony” → `toDataURL` rzuca wyjątek → zapisuje się zastępcza grafika z gradientem zamiast zdjęcia sceny. Rozwiąże się razem z pkt 1 (lokalne assety). Do weryfikacji na urządzeniu.
6. **Kalendarz liczy dzień w UTC** (`toISOString`) — w Polsce „nowy dzień” zaczyna się o 1:00/2:00 zamiast o północy. Użyć lokalnej daty.
7. **Nie wszystko się zapisuje** — ustawienie dźwięku, aktywna postać (`activeCharacterId` zawsze wraca do `zosia`), pozycje postaci w pokoju (`placedEntities`) resetują się po restarcie.
8. **`window.confirm`** przy czyszczeniu dziennika — w PWA/TWA wygląda źle, dziecko może przypadkiem wyczyścić. Zamienić na własny modal (najlepiej też za bramką rodzica).
9. **README nieaktualne** — wymienia `PetShelterModal.tsx` i `MiniGameZone.tsx` (minigry: puzzle, pamięć, łapanie gwiazdek), których **nie ma w kodzie**. Minigier w grze brak.

### 🟡 Jakość / dług techniczny
10. `PlayZone.tsx` — 2281 linii, logika wszystkich 5 pokoi, zwierzaków, mebli, zdjęć i imprez w jednym komponencie; każda zmiana stanu re-renderuje całą scenę. Rozbić na komponenty per pokój + hook stanu.
11. Stan rozproszony: część w React, część w modułach z `localStorage` + CustomEvents (`kiddo_coins_updated`, `kiddo_achievement_unlocked`…). Działa, ale trudno debugować. Docelowo jeden store (Zustand z `persist`) + wersjonowanie/migracje schematu.
12. Zbędne zależności: `@google/genai`, `express`, `dotenv`, `@types/express`, `motion` (duplikat `framer-motion`), `sharp` (tylko do `scripts/generate-icons.js` — może zostać w dev). `metadata.json` deklaruje `SERVER_SIDE_GEMINI_API`, którego nie ma.
13. Bundle 978 kB w jednym chunku — lazy-load modali (kreator, galeria, poczta, release) i `html2canvas`.
14. `index.html`: `user-scalable=no, maximum-scale=1` — ok dla gry, ale warto świadomie. Fonty (Quicksand, Material Symbols) z Google Fonts — pierwszy start wymaga internetu; lepiej hostować lokalnie (`@fontsource`).
15. Brak testów, lintera, CI, repozytorium git w folderze.
16. Śmieci w folderze: `kiddo-world.zip` (= aktualny kod), `kiddo-world-project.zip` (starszy snapshot, ten sam `src`) — także skopiowany do `public/`, więc trafia na hosting.

## 6. Plan prac (workload)

Szacunki dla jednej osoby, z pomocą AI.

### Etap 1 — „Działa stabilnie na telefonie” (~1 dzień)
| # | Zadanie | Est. |
|---|---|---|
| 1.1 | `git init`, usunąć zipy z repo i z `public/`, `.gitignore` | 0,25 h |
| 1.2 | Naprawić zależności (esbuild), wyrzucić nieużywane paczki, `npm install` bez flag | 0,5 h |
| 1.3 | Pobrać wszystkie obrazki `APP_IMAGES` + Unsplash do `public/assets/`, podmienić URL-e, dodać do precache (`globPatterns` + webp/jpg) | 1–1,5 h |
| 1.4 | Fonty lokalnie (`@fontsource/quicksand`, Material Symbols) | 0,5 h |
| 1.5 | Ukryć `MobileReleaseModal`/przełączniki symulatora (flaga `import.meta.env.DEV` albo bramka rodzica: np. przytrzymaj 3 s / proste działanie) | 1 h |
| 1.6 | Kalendarz na lokalnej dacie | 0,25 h |
| 1.7 | Hosting (Cloudflare Pages / Netlify / Vercel lub własny serwer w domu) + instalacja PWA na telefonie, test offline | 1 h |

### Etap 2 — „Nie traci postępów” (~0,5–1 dzień)
| # | Zadanie | Est. |
|---|---|---|
| 2.1 | Galeria zdjęć → IndexedDB, limit i kompresja, komunikat gdy brak miejsca | 2 h |
| 2.2 | Persistencja: dźwięk, aktywna postać, pozycje w pokojach | 1 h |
| 2.3 | Własny modal zamiast `window.confirm`, akcje destrukcyjne za bramką rodzica | 1 h |
| 2.4 | Eksport/import zapisu gry (JSON) w panelu rodzica — backup przed czyszczeniem przeglądarki / zmianą telefonu | 1,5 h |
| 2.5 | Test na docelowym telefonie: dotyk, przeciąganie, dźwięk po pierwszym tapnięciu, wydajność animacji pogody | 1 h |

### Etap 3 — Porządki w kodzie (~2–3 dni, opcjonalnie)
- Rozbicie `PlayZone` na `rooms/*` + `usePlayZoneState` (1 dzień).
- Wspólny store (Zustand + `persist` z wersją schematu) zamiast rozproszonych managerów i CustomEvents (1 dzień).
- Code-splitting modali i `html2canvas`, ESLint + Prettier, Vitest dla managerów (kalendarz, monety, odznaki) (0,5–1 dzień).
- Aktualizacja README.

### Etap 4 — Rozwój (wg pomysłów córki)
- Minigry obiecane w README (memory, puzzle, łapanie gwiazdek) — ~0,5 dnia każda.
- Personalizacja: imię córki, jej zwierzak, własne postacie członków rodziny.
- Czytanie tekstów na głos (Web Speech API, `pl-PL`) — pomoc dla dziecka, które jeszcze słabo czyta.
- Kontrola czasu gry w panelu rodzica.
- Opcjonalnie APK przez Capacitor/Bubblewrap (dopiero po etapie 1 — hostowane PWA zwykle wystarcza).

## 7. Rekomendacja

Zacząć od **etapu 1 + 2.1–2.2**: bez lokalnych grafik gra może pewnego dnia „opustoszeć”, a bez IndexedDB zdjęcia córki będą znikać. Hostowane PWA zainstalowane na ekranie głównym wystarczy — APK nie jest potrzebne na start. Refaktoryzację `PlayZone` robić dopiero przy dodawaniu nowych pokoi/funkcji.
