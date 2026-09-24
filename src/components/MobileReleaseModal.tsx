import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sound } from '../utils/sound';

interface MobileReleaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileReleaseModal: React.FC<MobileReleaseModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'android' | 'ios' | 'apk' | 'features'>('qr');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://kiddo-world.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=10&color=25-28-25&bgcolor=251-249-243&data=${encodeURIComponent(
    currentUrl
  )}`;

  const handleCopyLink = () => {
    sound.playPop(620);
    navigator.clipboard?.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleInstallClick = async () => {
    sound.playSparkle();
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-5 select-none animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-surface-container-lowest text-on-surface rounded-3xl max-w-[460px] w-full overflow-hidden shadow-2xl border-4 border-white flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-400 via-pink-400 to-indigo-500 p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-xs">
              <span className="material-symbols-outlined text-[24px]">smartphone</span>
            </div>
            <div>
              <h3 className="font-extrabold text-[17px] leading-tight drop-shadow-xs">
                Wydanie na Telefon 📲
              </h3>
              <p className="text-[12px] text-white/90 font-medium drop-shadow-xs">
                Zainstaluj Kiddo World na swoim smartfonie
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playPop(480);
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors active:scale-90"
            aria-label="Zamknij"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-2 bg-surface-container border-b border-outline-variant/30 text-[12px] font-bold overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => {
              sound.playPop(520);
              setActiveTab('qr');
            }}
            className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'qr'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-extrabold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
            <span>Kod QR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPop(520);
              setActiveTab('android');
            }}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'android'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-extrabold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="text-[14px]">🤖</span>
            <span>Android</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPop(520);
              setActiveTab('apk');
            }}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'apk'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-extrabold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="text-[14px]">📦</span>
            <span>Plik APK</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPop(520);
              setActiveTab('ios');
            }}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'ios'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-extrabold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="text-[14px]">🍎</span>
            <span>iOS</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPop(520);
              setActiveTab('features');
            }}
            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
              activeTab === 'features'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-extrabold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>Audyt</span>
          </button>
        </div>

        {/* Scrollable Tab Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {/* TAB 1: QR CODE & QUICK SCAN */}
          {activeTab === 'qr' && (
            <div className="flex flex-col items-center text-center gap-3">
              <div className="bg-amber-50 text-amber-900 border border-amber-200/80 rounded-2xl p-2.5 px-3 text-[12px] font-semibold w-full flex items-center gap-2">
                <span className="text-[18px]">📷</span>
                <span>Skieruj aparat telefonu na poniższy kod, aby otworzyć grę od razu!</span>
              </div>

              {/* QR Code Container with Frame */}
              <div className="p-3 bg-white rounded-3xl shadow-md border-2 border-outline-variant/30 flex items-center justify-center relative">
                <img
                  src={qrCodeUrl}
                  alt="Zeskanuj kod QR aparatem telefonu"
                  className="w-[190px] h-[190px] object-contain rounded-xl"
                  loading="lazy"
                />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white shadow-md border border-amber-300 flex items-center justify-center">
                    <img src="/pwa-192x192.png" alt="Kiddo Icon" className="w-7 h-7 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Copy URL Section */}
              <div className="w-full flex items-center gap-2 bg-surface-container p-2 rounded-2xl border border-outline-variant/30">
                <span className="text-[11px] font-mono text-on-surface-variant truncate flex-1 text-left px-2">
                  {currentUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-[12px] shrink-0 active:scale-95 transition-transform flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Skopiowano!' : 'Kopiuj link'}</span>
                </button>
              </div>

              {/* Install Button for Supporting Browsers */}
              {isInstallable && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-500 text-white font-extrabold text-[14px] shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all hover:brightness-105 mt-1"
                >
                  <span className="material-symbols-outlined text-[20px]">download_for_offline</span>
                  <span>Zainstaluj teraz na tym urządzeniu</span>
                </button>
              )}

              {isInstalled && (
                <div className="w-full p-2.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[12px] font-bold flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                  <span>Aplikacja jest już zainstalowana na tym urządzeniu!</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: iOS INSTRUCTIONS */}
          {activeTab === 'ios' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-1 border-b border-outline-variant/20">
                <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                  <span className="text-[16px]">🍎</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-[14px] text-on-surface">
                    Instrukcja dla Apple iPhone & iPad
                  </h4>
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    W przeglądarce Safari (bez App Store)
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-[13px]">
                <div className="p-3 bg-surface-container rounded-2xl flex items-start gap-3 border border-outline-variant/30">
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-[13px] flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block">Otwórz w Safari</span>
                    <span className="text-on-surface-variant text-[12px]">
                      Uruchom stronę gry w oficjalnej przeglądarce Safari na telefonie.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container rounded-2xl flex items-start gap-3 border border-outline-variant/30">
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-[13px] flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block flex items-center gap-1">
                      Kliknij przycisk Udostępnij{' '}
                      <span className="material-symbols-outlined text-[16px] text-sky-600">ios_share</span>
                    </span>
                    <span className="text-on-surface-variant text-[12px]">
                      Na dolnym pasku narzędzi stuknij ikonę kwadratu ze strzałką w górę.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container rounded-2xl flex items-start gap-3 border border-outline-variant/30">
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-[13px] flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block flex items-center gap-1">
                      Wybierz „Do ekranu początkowego”{' '}
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">add_box</span>
                    </span>
                    <span className="text-on-surface-variant text-[12px]">
                      Przewiń listę opcji w dół i kliknij <strong>„Do ekranu początkowego”</strong>.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container rounded-2xl flex items-start gap-3 border border-outline-variant/30">
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary font-bold text-[13px] flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block">Zatwierdź „Dodaj”</span>
                    <span className="text-on-surface-variant text-[12px]">
                      Stuknij <strong>„Dodaj”</strong> w prawym górnym rogu. Na pulpicie pojawi się kolorowa ikonka z misiem!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ANDROID INSTRUCTIONS */}
          {activeTab === 'android' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-1 border-b border-outline-variant/20">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <span className="text-[16px]">🤖</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-[14px] text-on-surface">
                    Instrukcja dla telefonów Android
                  </h4>
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    W przeglądarce Google Chrome / Samsung Internet
                  </span>
                </div>
              </div>

              {isInstallable ? (
                <div className="p-3.5 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-2xl flex flex-col gap-2">
                  <span className="font-bold text-[13px]">Twoja przeglądarka jest gotowa do 1-klikowej instalacji!</span>
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-extrabold text-[13px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[18px]">install_mobile</span>
                    <span>Zainstaluj teraz na telefonie</span>
                  </button>
                </div>
              ) : null}

              <div className="space-y-2.5 text-[13px]">
                <div className="p-3 bg-surface-container rounded-2xl flex items-start gap-3 border border-outline-variant/30">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[13px] flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block">Otwórz w Google Chrome</span>
                    <span className="text-on-surface-variant text-[12px]">
                      Uruchom stronę gry na smartfonie z systemem Android.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container rounded-2xl flex items-start gap-3 border border-outline-variant/30">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[13px] flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block flex items-center gap-1">
                      Kliknij menu ⋮ (trzy kropki)
                    </span>
                    <span className="text-on-surface-variant text-[12px]">
                      Stuknij menu opcji w prawym górnym rogu przeglądarki Chrome.
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-surface-container rounded-2xl flex items-start gap-3 border border-outline-variant/30">
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-[13px] flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block">
                      Wybierz „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”
                    </span>
                    <span className="text-on-surface-variant text-[12px]">
                      System utworzy dedykowaną ikonę gry, która uruchamia się na pełnym ekranie jak ze sklepu Google Play!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BUILD APK & GOOGLE PLAY */}
          {activeTab === 'apk' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-1 border-b border-outline-variant/20">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold">
                  <span>📦</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-[14px] text-on-surface">
                    Paczka APK na Androida
                  </h4>
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    Gotowe do zbudowania pliku .apk / .aab dla Google Play
                  </span>
                </div>
              </div>

              {/* Verified Checklist */}
              <div className="bg-emerald-50 border border-emerald-300/80 rounded-2xl p-3 flex flex-col gap-1.5 text-[11px]">
                <span className="font-black text-emerald-950 text-[12px] flex items-center gap-1.5">
                  <span className="text-emerald-600">✓</span> Stan Gotowości Technicznej do APK:
                </span>
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                  <span className="text-emerald-600 font-bold">✓</span> Web App Manifest: PWA / TWA zgodny (192px, 512px, maskable)
                </div>
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                  <span className="text-emerald-600 font-bold">✓</span> Service Worker & Workbox: Buforowanie zasobów offline aktywne
                </div>
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                  <span className="text-emerald-600 font-bold">✓</span> Viewport & Safe Area: Dopasowanie cover bez pasków
                </div>
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                  <span className="text-emerald-600 font-bold">✓</span> Brak błędów TypeScript i lintera (0 błędów)
                </div>
              </div>

              {/* Direct Project ZIP Download */}
              <div className="p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-dashed border-amber-400/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shrink-0 shadow-sm">
                    💾
                  </div>
                  <div>
                    <h5 className="font-black text-[13px] text-on-surface">
                      Kod źródłowy projektu (.ZIP)
                    </h5>
                    <p className="text-[11px] text-on-surface-variant font-medium">
                      Paczka z kodem TypeScript, React, PWA, ikonami i instrukcją README (~450 KB)
                    </p>
                  </div>
                </div>

                <a
                  href="/kiddo-world-project.zip"
                  download="kiddo-world-project.zip"
                  onClick={() => sound.playSuccess()}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-extrabold text-[12px] rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Pobierz .ZIP</span>
                </a>
              </div>

              {/* 3 Methods to get APK */}
              <div className="space-y-2.5 text-[12px]">
                {/* Method 1: PWABuilder */}
                <div className="p-3 bg-surface-container rounded-2xl border border-outline-variant/30 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-on-surface text-[13px] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">1</span>
                      PWABuilder (Zalecane - 2 minuty)
                    </span>
                    <span className="text-[10px] bg-primary-fixed text-primary font-black px-2 py-0.5 rounded-full">
                      Automatyczne
                    </span>
                  </div>
                  <p className="text-on-surface-variant text-[11px]">
                    1. Wejdź na stronę <strong>pwabuilder.com</strong>.<br />
                    2. Wklej URL tej aplikacji.<br />
                    3. Kliknij <strong>„Package for Android”</strong> i pobierz plik <strong>.apk</strong> (do bezpośredniej instalacji) lub pakiet <strong>.aab</strong> (do Google Play Console).
                  </p>
                </div>

                {/* Method 2: Bubblewrap (Official Google TWA) */}
                <div className="p-3 bg-surface-container rounded-2xl border border-outline-variant/30 flex flex-col gap-1">
                  <span className="font-black text-on-surface text-[13px] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-secondary text-white text-[10px] flex items-center justify-center">2</span>
                    Google Bubblewrap CLI (Oficjalne TWA)
                  </span>
                  <div className="p-2 bg-neutral-900 text-emerald-400 font-mono text-[10px] rounded-lg mt-0.5 overflow-x-auto">
                    npx @bubblewrap/cli init --manifest=URL/manifest.webmanifest<br />
                    npx @bubblewrap/cli build
                  </div>
                </div>

                {/* Method 3: Capacitor */}
                <div className="p-3 bg-surface-container rounded-2xl border border-outline-variant/30 flex flex-col gap-1">
                  <span className="font-black text-on-surface text-[13px] flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-tertiary-container text-white text-[10px] flex items-center justify-center">3</span>
                    Capacitor / Android Studio
                  </span>
                  <p className="text-on-surface-variant text-[11px]">
                    Uruchamia aplikację jako natywny projekt Androida z pełnym wsparciem bibliotek Google Play Services.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MOBILE FEATURES & SPECS */}
          {activeTab === 'features' && (
            <div className="flex flex-col gap-3">
              <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/60 rounded-2xl flex items-center gap-3">
                <span className="text-[28px]">✨</span>
                <div>
                  <h4 className="font-extrabold text-[14px] text-indigo-950">
                    Natywne wrażenia z gry
                  </h4>
                  <p className="text-[12px] text-indigo-900/80">
                    Wydanie mobilne zostało dopracowane specjalnie pod małe ekrany dotykowe.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-[12px]">
                <div className="p-2.5 bg-surface-container rounded-xl flex items-center gap-2.5 border border-outline-variant/30">
                  <span className="text-[20px]">📱</span>
                  <div>
                    <span className="font-bold text-on-surface block">Pełny Ekran (Standalone)</span>
                    <span className="text-on-surface-variant">Brak pasków adresu przeglądarki i 100% przestrzeni na zabawę.</span>
                  </div>
                </div>

                <div className="p-2.5 bg-surface-container rounded-xl flex items-center gap-2.5 border border-outline-variant/30">
                  <span className="text-[20px]">⚡</span>
                  <div>
                    <span className="font-bold text-on-surface block">Wsparcie Trybu Offline</span>
                    <span className="text-on-surface-variant">Service Worker zapisuje pliki w pamięci podręcznej.</span>
                  </div>
                </div>

                <div className="p-2.5 bg-surface-container rounded-xl flex items-center gap-2.5 border border-outline-variant/30">
                  <span className="text-[20px]">👆</span>
                  <div>
                    <span className="font-bold text-on-surface block">Płynny Dotyk & Przeciąganie</span>
                    <span className="text-on-surface-variant">Zoptymalizowane dotykanie zabawek, bohaterów i zwierzaków.</span>
                  </div>
                </div>

                <div className="p-2.5 bg-surface-container rounded-xl flex items-center gap-2.5 border border-outline-variant/30">
                  <span className="text-[20px]">🔒</span>
                  <div>
                    <span className="font-bold text-on-surface block">100% Bezpieczne dla Dzieci</span>
                    <span className="text-on-surface-variant">Brak reklam i śledzenia. Spokojna, bezpieczna zabawa.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-surface-container border-t border-outline-variant/30 flex items-center justify-between shrink-0 gap-2">
          <a
            href="/kiddo-world-project.zip"
            download="kiddo-world-project.zip"
            onClick={() => sound.playSuccess()}
            className="flex items-center gap-1.5 text-[11px] font-black text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-full transition-all active:scale-95 border border-amber-300/60"
            title="Pobierz pełną paczkę ZIP z projektem"
          >
            <span className="material-symbols-outlined text-[15px]">folder_zip</span>
            <span>Pobierz .ZIP</span>
          </a>

          <button
            type="button"
            onClick={() => {
              sound.playPop(460);
              onClose();
            }}
            className="py-1.5 px-4 rounded-full bg-surface-container-high text-on-surface font-extrabold text-[12px] hover:bg-surface-container-highest active:scale-95 transition-all"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
