import React, { useState, ReactNode } from 'react';
import { MobileStatusBar } from './MobileStatusBar';
import { MobileAppHeader } from './MobileAppHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { WeatherEffectsOverlay } from './WeatherEffectsOverlay';
import { MobileReleaseModal } from './MobileReleaseModal';
import { OfflineIndicator } from './OfflineIndicator';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { TabType, CharacterItem, WeatherType } from '../types';
import { sound } from '../utils/sound';

interface PhoneSimulatorProps {
  children: ReactNode;
  activeTab: TabType;
  title: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeCharacter: CharacterItem;
  characterCount: number;
  onNavigate: (tab: TabType, roomId?: string) => void;
  isMusicPlaying: boolean;
  weather: WeatherType;
  onWeatherChange: (weather: WeatherType) => void;
}

type PhoneColor = 'titanium' | 'midnight' | 'sakura' | 'gold';

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  children,
  activeTab,
  title,
  soundEnabled,
  onToggleSound,
  activeCharacter,
  characterCount,
  onNavigate,
  isMusicPlaying,
  weather,
  onWeatherChange
}) => {
  const { isInstalled, isMobile } = usePWAInstall();

  // Mobile device simulation state
  const [deviceMode, setDeviceMode] = useState<'framed' | 'fullscreen'>('framed');
  const [phoneColor, setPhoneColor] = useState<PhoneColor>('titanium');
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);

  // If running on a real mobile device or installed as standalone PWA, enforce full screen
  const isActualMobile = isInstalled || isMobile;
  const effectiveMode = isActualMobile ? 'fullscreen' : deviceMode;

  const colorStyles: Record<PhoneColor, { rim: string; bezel: string; label: string; dot: string }> = {
    titanium: {
      rim: 'border-[#383b42] shadow-[0_0_0_2px_#595d66]',
      bezel: 'bg-[#1e2024]',
      label: 'Tytan',
      dot: 'bg-[#50545c]'
    },
    midnight: {
      rim: 'border-[#1b2333] shadow-[0_0_0_2px_#2d3b55]',
      bezel: 'bg-[#0f1420]',
      label: 'Midnight',
      dot: 'bg-[#22334f]'
    },
    sakura: {
      rim: 'border-[#e8bac3] shadow-[0_0_0_2px_#f5d3db]',
      bezel: 'bg-[#f7e4e8]',
      label: 'Róż',
      dot: 'bg-[#f2aab8]'
    },
    gold: {
      rim: 'border-[#d4c399] shadow-[0_0_0_2px_#faeed2]',
      bezel: 'bg-[#f5ebd7]',
      label: 'Złoto',
      dot: 'bg-[#deb966]'
    }
  };

  const handleDeviceModeToggle = () => {
    sound.playPop(550);
    setDeviceMode(prev => (prev === 'framed' ? 'fullscreen' : 'framed'));
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#ece8df] via-[#f5f2eb] to-[#e4e0d5] flex flex-col items-center justify-start sm:py-6 select-none overflow-x-hidden antialiased">
      {/* Offline connectivity indicator */}
      <OfflineIndicator />

      {/* Top Floating Mobile Simulator Controls for Desktop */}
      {!isActualMobile && (
        <div className="w-full max-w-[540px] px-4 mb-3 flex items-center justify-between text-on-surface text-[13px] z-50">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></div>
            <span className="font-extrabold text-[13px] tracking-wide text-primary">
              KIDDO PHONE APP
            </span>
            <span className="hidden sm:inline-block text-[11px] font-bold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
              Wydanie Mobilne
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Color Switcher */}
            {effectiveMode === 'framed' && (
              <div className="hidden sm:flex items-center gap-1 bg-surface-container-lowest p-1 rounded-full shadow-xs border border-outline-variant/30">
                {(Object.keys(colorStyles) as PhoneColor[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    title={`Kolor obudowy: ${colorStyles[c].label}`}
                    onClick={() => {
                      sound.playPop(640);
                      setPhoneColor(c);
                    }}
                    className={`w-4 h-4 rounded-full ${colorStyles[c].dot} transition-transform active:scale-90 ${
                      phoneColor === c ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'opacity-80'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Toggle Phone Frame / Fullscreen View */}
            <button
              type="button"
              onClick={handleDeviceModeToggle}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest text-on-surface font-bold text-[12px] shadow-sm border border-outline-variant/30 active:scale-95 transition-all hover:bg-surface-container-low"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">
                {effectiveMode === 'framed' ? 'fullscreen' : 'smartphone'}
              </span>
              <span>{effectiveMode === 'framed' ? 'Pełny ekran' : 'Ramka telefonu'}</span>
            </button>

            {/* Direct Project ZIP button */}
            <a
              href="/kiddo-world-project.zip"
              download="kiddo-world-project.zip"
              onClick={() => sound.playSuccess()}
              title="Pobierz pełną paczkę ZIP z projektem (.zip)"
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-lowest text-amber-700 font-extrabold text-[12px] shadow-sm border border-amber-300/70 hover:bg-amber-50 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[15px] text-amber-600">folder_zip</span>
              <span>Pobierz .ZIP</span>
            </a>

            {/* Release for mobile button */}
            <button
              type="button"
              onClick={() => {
                sound.playSparkle();
                setIsReleaseModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-pink-500 text-white font-extrabold text-[12px] shadow-sm active:scale-95 transition-all hover:brightness-105"
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
              <span>Na telefon 📲</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Smartphone Shell Container */}
      <div
        className={`w-full transition-all duration-300 flex justify-center items-center ${
          effectiveMode === 'framed'
            ? 'sm:max-w-[428px] sm:min-h-[880px] sm:max-h-[94vh]'
            : 'max-w-[480px] min-h-screen'
        }`}
      >
        {/* Physical Smartphone Case (Rendered in framed mode on larger screens) */}
        <div
          className={`w-full h-full flex flex-col relative transition-all duration-300 ${
            effectiveMode === 'framed'
              ? `sm:rounded-[52px] sm:p-[10px] sm:border-[8px] ${colorStyles[phoneColor].rim} ${colorStyles[phoneColor].bezel} phone-shadow`
              : 'rounded-none p-0 border-0 shadow-none'
          }`}
        >
          {/* Side Hardware Buttons (Visual details for authentic phone body) */}
          {effectiveMode === 'framed' && (
            <>
              {/* Left Silent / Action switch */}
              <div className="hidden sm:block absolute -left-[14px] top-[100px] w-[5px] h-[28px] bg-[#3a3d45] rounded-l-md shadow-xs"></div>
              {/* Left Volume Up */}
              <div className="hidden sm:block absolute -left-[14px] top-[146px] w-[5px] h-[52px] bg-[#3a3d45] rounded-l-md shadow-xs"></div>
              {/* Left Volume Down */}
              <div className="hidden sm:block absolute -left-[14px] top-[210px] w-[5px] h-[52px] bg-[#3a3d45] rounded-l-md shadow-xs"></div>
              {/* Right Power Button */}
              <div className="hidden sm:block absolute -right-[14px] top-[165px] w-[5px] h-[75px] bg-[#3a3d45] rounded-r-md shadow-xs"></div>
              {/* Top Speaker Ear Slit in bezel */}
              <div className="hidden sm:block absolute top-[6px] left-1/2 -translate-x-1/2 w-14 h-[4px] bg-[#0c0d10] rounded-full z-50"></div>
            </>
          )}

          {/* Inner Phone Screen Display Glass */}
          <div
            className={`w-full flex-1 flex flex-col overflow-hidden bg-surface relative ${
              effectiveMode === 'framed'
                ? 'sm:rounded-[42px] sm:h-[840px] sm:max-h-[88vh]'
                : 'min-h-screen'
            }`}
          >
            {/* Phone OS Status Bar (Time, Dynamic Island, Battery/Signal) */}
            {/* On a real phone the OS draws its own status bar: only keep the safe-area gap */}
            {isActualMobile ? (
              <div className="shrink-0" style={{ height: 'env(safe-area-inset-top, 0px)' }} />
            ) : (
              <MobileStatusBar
                isMusicPlaying={isMusicPlaying}
                activeTabName={title}
              />
            )}

            {/* In-App Mobile Header */}
            <MobileAppHeader
              activeTab={activeTab}
              title={title}
              soundEnabled={soundEnabled}
              onToggleSound={onToggleSound}
              activeCharacter={activeCharacter}
              onNavigate={onNavigate}
              weather={weather}
              onWeatherChange={onWeatherChange}
            />

            {/* Weather Animated Effects Overlay (Sun, Snow, Rain, Rainbow, Night) */}
            <WeatherEffectsOverlay
              weather={weather}
              onWeatherChange={onWeatherChange}
            />

            {/* Scrollable Mobile App Screen Viewport */}
            <div className="flex-1 w-full overflow-y-auto overflow-x-hidden no-scrollbar relative flex flex-col overscroll-contain">
              {children}
            </div>

            {/* Fixed Mobile Tab Bar & Native Home Gesture Bar */}
            <MobileBottomNav
              activeTab={activeTab}
              onNavigate={onNavigate}
              characterCount={characterCount}
            />
          </div>
        </div>
      </div>

      {/* Mobile Release & PWA Modal */}
      <MobileReleaseModal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
      />
    </div>
  );
};

