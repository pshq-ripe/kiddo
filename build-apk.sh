#!/usr/bin/env bash
# Buduje plik APK (wersja testowa/debug) gry Kiddo World.
# Wymagania: Node.js 20+, JDK 21, Android SDK (najprościej: zainstalowane Android Studio).
set -euo pipefail
cd "$(dirname "$0")"

# --- Android SDK ---
if [ -z "${ANDROID_HOME:-}" ]; then
  for d in "$HOME/Android/Sdk" "$HOME/Library/Android/sdk"; do
    [ -d "$d" ] && export ANDROID_HOME="$d" && break
  done
fi
if [ -z "${ANDROID_HOME:-}" ]; then
  echo "Brak Android SDK. Zainstaluj Android Studio albo ustaw ANDROID_HOME." >&2
  exit 1
fi
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

# --- JDK 21 (Android Studio ma go w środku) ---
if [ -z "${JAVA_HOME:-}" ]; then
  for d in /opt/android-studio/jbr "$HOME/android-studio/jbr" /snap/android-studio/current/jbr \
           "/Applications/Android Studio.app/Contents/jbr/Contents/Home"; do
    [ -d "$d" ] && export JAVA_HOME="$d" && break
  done
fi
java_major=$("${JAVA_HOME:+$JAVA_HOME/bin/}java" -version 2>&1 | head -1 | sed -E 's/.*"([0-9]+).*/\1/')
if [ "${java_major:-0}" -lt 21 ]; then
  echo "Potrzebny JDK 21+ (znaleziono: ${java_major:-brak}). Ustaw JAVA_HOME." >&2
  exit 1
fi

# --- Web build + synchronizacja z projektem Android ---
[ -d node_modules ] || npm install --no-audit --no-fund
npm run build:android

# --- APK ---
(cd android && chmod +x gradlew && ./gradlew assembleDebug)
cp android/app/build/outputs/apk/debug/app-debug.apk ./kiddo-world-debug.apk
echo
echo "Gotowe: $(pwd)/kiddo-world-debug.apk"
echo "Skopiuj plik na telefon i otwórz go (zezwól na instalację z nieznanych źródeł)."
echo "Albo przez USB: adb install -r kiddo-world-debug.apk"
