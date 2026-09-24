# Kiddo World (Świat Kiddo) - Aplikacja Edukacyjna & PWA / APK

Interaktywny, bezpieczny wirtualny świat dla dzieci z minigrami, tworzeniem postaci, adopcją zwierzątek, kalendarzem przygód i pokojami zabaw.

---

## 🚀 Jak uruchomić projekt lokalnie

### Wymagania:
- **Node.js**: wersja 18+ lub 20+
- **npm** / **bun** / **yarn** / **pnpm**

### 1. Instalacja zależności
```bash
npm install
```

### 2. Uruchomienie serwera deweloperskiego
```bash
npm run dev
```
Aplikacja uruchomi się pod adresem: `http://localhost:3000` (lub innym wskazanym w konsoli).

### 3. Zbudowanie wersji produkcyjnej
```bash
npm run build
```
Zoptymalizowane pliki produkcyjne trafią do folderu `dist/`.

---

## 📱 Jak zbudować plik APK na Androida

Projekt Android (Capacitor 8) jest już w folderze `android/` — grafiki i fonty są w środku, więc gra działa offline (poza obrazkami z `APP_IMAGES`, które nadal są pobierane z internetu).

### Metoda 1: skrypt (Linux / macOS)
Wymagania: Node.js 20+, Android Studio (daje Android SDK i JDK 21).
```bash
./build-apk.sh
```
Wynik: `kiddo-world-debug.apk` w głównym folderze. Skopiuj na telefon i zainstaluj (zezwól na „instalację z nieznanych źródeł”) albo `adb install -r kiddo-world-debug.apk`.

### Metoda 2: Android Studio
```bash
npm install
npm run build:android   # build web w trybie android + cap sync
```
Otwórz folder `android/` w Android Studio → **Build › Build App Bundle(s) / APK(s) › Build APK(s)**.

### Wersja web / PWA
`npm run build` → folder `dist/` na dowolny hosting; na telefonie „Dodaj do ekranu głównego”.

---

## 📂 Struktura projektu

- `src/`
  - `components/` - Komponenty UI:
    - `PlayZone.tsx` - Główny interaktywny pokój zabaw z fizyką i postaciami
    - `CharacterMaker.tsx` - Kreator postaci (9 nastrojów, kolory, ubranka, akcesoria)
    - `AdoptPetModal.tsx` - Schronisko i adopcja zwierzaków
    - `DailyAdventureCalendarModal.tsx` - Kalendarz przygód z prezentami
    - `MobileReleaseModal.tsx` - Centrum instalacji PWA, pobierania APK i ZIP
    - `PhoneSimulator.tsx` - Podgląd ramki smartfona z płynnym skalowaniem
  - `data/` - Bazy danych krain, zabawek, zwierząt, mebli i dźwięków
  - `hooks/` - Hooki (np. instalacja PWA, orientacja ekranu)
  - `types.ts` - Pełne definicje typów TypeScript
  - `utils/sound.ts` - Syntezator dźwięków Web Audio API
- `public/` - Ikony PWA (`192x192`, `512x512`, `maskable`), SVG, dźwięki
- `vite.config.ts` - Konfiguracja Vite + VitePWA (Service Worker, offline cache)
