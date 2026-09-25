import React, { useState, useEffect } from 'react';
import { TabType, CharacterItem, WeatherType } from '../types';
import { APP_IMAGES } from '../data/kiddoData';
import { sound } from '../utils/sound';
import { addJournalEntry } from '../utils/journalManager';
import { getCoins } from '../utils/currencyManager';
import { isRewardAvailableToday } from '../utils/calendarManager';
import { PWAInstallButton } from './PWAInstallButton';
import { CharacterHead } from './CharacterHead';
import { DailyAdventureCalendarModal } from './DailyAdventureCalendarModal';
import { FriendshipManagerModal } from './FriendshipManagerModal';
import { getUnreadMailsCount } from '../utils/friendshipManager';
import { UserAuthSyncButton } from './UserAuthSyncButton';

interface MobileAppHeaderProps {
  activeTab: TabType;
  title: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeCharacter: CharacterItem;
  onNavigate: (tab: TabType) => void;
  weather?: WeatherType;
  onWeatherChange?: (weather: WeatherType) => void;
}

export const MobileAppHeader: React.FC<MobileAppHeaderProps> = ({
  activeTab,
  title,
  soundEnabled,
  onToggleSound,
  activeCharacter,
  onNavigate,
  weather = 'sun',
  onWeatherChange
}) => {
  const [coins, setCoins] = useState<number>(() => getCoins());
  const [isCalendarAvailable, setIsCalendarAvailable] = useState<boolean>(() => isRewardAvailableToday());
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);
  const [unreadMailsCount, setUnreadMailsCount] = useState<number>(() => getUnreadMailsCount());
  const [isFriendshipModalOpen, setIsFriendshipModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleCoins = () => setCoins(getCoins());
    const handleCalendar = () => setIsCalendarAvailable(isRewardAvailableToday());
    const handleMailbox = () => setUnreadMailsCount(getUnreadMailsCount());

    window.addEventListener('kiddo_coins_updated', handleCoins);
    window.addEventListener('kiddo_calendar_updated', handleCalendar);
    window.addEventListener('kiddo_mailbox_updated', handleMailbox);

    return () => {
      window.removeEventListener('kiddo_coins_updated', handleCoins);
      window.removeEventListener('kiddo_calendar_updated', handleCalendar);
      window.removeEventListener('kiddo_mailbox_updated', handleMailbox);
    };
  }, []);

  const weatherOrder: WeatherType[] = ['sun', 'rainbow', 'snow', 'rain', 'night'];

  const cycleWeather = () => {
    if (!onWeatherChange) return;
    const currentIndex = weatherOrder.indexOf(weather);
    const nextIndex = (currentIndex + 1) % weatherOrder.length;
    const nextWeather = weatherOrder[nextIndex];

    sound.playWeatherSound(nextWeather);
    onWeatherChange(nextWeather);

    const labels: Record<WeatherType, string> = {
      sun: 'Słoneczny dzień ☀️',
      rainbow: 'Cudowna Tęcza 🌈',
      snow: 'Zimowy Śnieżek ❄️',
      rain: 'Ciepły Deszczyk 🌧️',
      night: 'Gwiaździsta Noc 🌙'
    };

    addJournalEntry({
      title: `Pogoda zmieniona: ${labels[nextWeather]}!`,
      note: nextWeather === 'snow'
        ? 'Opadający śnieg otulił Miasteczko Kiddo. Czas na zimowe szaleństwo!'
        : nextWeather === 'sun'
        ? 'Jasne, animowane słońce rozświetla cały świat zabawy!'
        : nextWeather === 'rain'
        ? 'Deszczyk stuka w szyby i tworzy wesołe kałuże!'
        : nextWeather === 'rainbow'
        ? 'Magiczna tęcza lśni kolorami z deszczem iskierek!'
        : 'Spokojna noc rozpostarła gwieździste niebo z księżycem.',
      category: 'discovery',
      emoji: nextWeather === 'snow' ? '❄️' : nextWeather === 'rain' ? '🌧️' : nextWeather === 'rainbow' ? '🌈' : nextWeather === 'night' ? '🌙' : '☀️',
      locationName: 'Miasteczko Kiddo'
    });
  };

  const weatherIcons: Record<WeatherType, { icon: string; color: string; label: string }> = {
    sun: { icon: 'wb_sunny', color: 'text-amber-500', label: 'Słońce' },
    rainbow: { icon: 'looks', color: 'text-fuchsia-500', label: 'Tęcza' },
    snow: { icon: 'ac_unit', color: 'text-sky-500', label: 'Śnieg' },
    rain: { icon: 'water_drop', color: 'text-cyan-500', label: 'Deszcz' },
    night: { icon: 'bedtime', color: 'text-indigo-500', label: 'Noc' }
  };
  return (
    <header className="w-full bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/30 select-none z-30 shrink-0">
      <div className="h-14 px-4 flex items-center justify-between gap-2 max-w-[420px] mx-auto">
        {/* App Title & Logo */}
        <div
          onClick={() => {
            sound.playPop(520);
            onNavigate('world-map');
          }}
          className="flex items-center gap-2.5 min-w-0 cursor-pointer active:scale-95 transition-transform"
        >
          <img
            alt="Kiddo World"
            src={APP_IMAGES.logo}
            className="w-8 h-8 object-contain shrink-0 drop-shadow-sm"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-extrabold text-[11px] text-primary tracking-wide leading-none uppercase">
              Kiddo App
            </span>
            <span className="font-bold text-[18px] text-on-surface truncate leading-tight">
              {title}
            </span>
          </div>
        </div>

        {/* Right Action Icons: Weather, Sound & Active Character Avatar */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Cloud Auth & Multi-Device Sync Button */}
          <UserAuthSyncButton compact={true} />

          {/* Quick PWA Mobile Install Action Button */}
          <PWAInstallButton variant="header" />

          {/* Quick Weather Toggle Button */}
          {onWeatherChange && (
            <button
              type="button"
              id="mobile-weather-toggle"
              aria-label={`Zmień pogodę: obecnie ${weatherIcons[weather].label}`}
              title={`Efekt pogodowy: ${weatherIcons[weather].label} (kliknij, aby zmienić)`}
              onClick={cycleWeather}
              className="px-2.5 h-9 rounded-full flex items-center gap-1 transition-all active:scale-90 border bg-surface-container-low border-outline-variant/40 shadow-xs hover:bg-surface-container"
            >
              <span className={`material-symbols-outlined text-[19px] ${weatherIcons[weather].color}`}>
                {weatherIcons[weather].icon}
              </span>
              <span className="text-[11px] font-extrabold text-on-surface">
                {weatherIcons[weather].label}
              </span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            type="button"
            id="mobile-sound-toggle"
            aria-label="Wycisz lub włącz dźwięki"
            onClick={onToggleSound}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 border ${
              soundEnabled
                ? 'bg-surface-container-low text-primary border-outline-variant/40 shadow-xs'
                : 'bg-surface-container-highest text-on-surface-variant/50 border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {soundEnabled ? 'volume_up' : 'volume_off'}
            </span>
          </button>

          {/* Daily Adventure Calendar & Coins Button */}
          <button
            type="button"
            id="header-calendar-button"
            aria-label="Kalendarz Przygód i Wirtualne Monety"
            title={`Kalendarz Przygód: masz ${coins} monet!${isCalendarAvailable ? ' Prezent czeka do odebrania!' : ''}`}
            onClick={() => {
              sound.playSparkle();
              setIsCalendarModalOpen(true);
            }}
            className={`px-2 h-9 rounded-full flex items-center gap-1 transition-all active:scale-90 border relative shadow-xs cursor-pointer ${
              isCalendarAvailable
                ? 'bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-400/50'
                : 'bg-surface-container-low border-outline-variant/40 text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="text-[14px]">🎁</span>
            <span className="text-[11px] font-extrabold flex items-center gap-0.5">
              <span>🪙</span>
              <span>{coins}</span>
            </span>
            {isCalendarAvailable && (
              <span className="absolute -top-1 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          {/* Friends & Mailbox Header Button */}
          <button
            type="button"
            id="header-friends-button"
            aria-label="Klub Przyjaciół i Poczta"
            title={`Klub Przyjaciół & Poczta Przyjaźni${unreadMailsCount > 0 ? ` (Masz ${unreadMailsCount} nieodebranych wiadomości!)` : ''}`}
            onClick={() => {
              sound.playSparkle();
              setIsFriendshipModalOpen(true);
            }}
            className={`px-2 h-9 rounded-full flex items-center gap-1 transition-all active:scale-90 border relative shadow-xs cursor-pointer ${
              unreadMailsCount > 0
                ? 'bg-rose-100 border-rose-300 text-rose-950 ring-2 ring-rose-400/40'
                : 'bg-surface-container-low border-outline-variant/40 text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="text-[14px]">📬</span>
            {unreadMailsCount > 0 ? (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white font-black text-[9px] flex items-center justify-center animate-bounce">
                {unreadMailsCount}
              </span>
            ) : (
              <span className="text-[11px] font-extrabold text-on-surface hidden min-[480px]:inline">
                Znajomi
              </span>
            )}
          </button>

          {/* Active Character Profile Quick Avatar */}
          <button
            type="button"
            id="mobile-profile-button"
            onClick={() => {
              sound.playPop(580);
              onNavigate('backpack-drawer');
            }}
            title={`Aktywna postać: ${activeCharacter?.name || 'Przyjaciel'}`}
            className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center relative shadow-xs active:scale-90 transition-transform border-2 border-white overflow-hidden ring-1 ring-primary/20"
          >
            {activeCharacter ? (
              <CharacterHead character={activeCharacter} size={32} />
            ) : (
              <span className="material-symbols-outlined text-primary text-[18px]">person</span>
            )}

            {/* Active Character Mini Emoji */}
            {activeCharacter?.currentEmotion && (
              <span className="absolute bottom-0 right-0 text-[9px] leading-none bg-white rounded-full p-[1px] shadow-xs">
                {activeCharacter.currentEmotion === 'Radość' ? '😊' : activeCharacter.currentEmotion === 'Śmiech' ? '😄' : '✨'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Adventure Calendar Modal */}
      <DailyAdventureCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        onNavigateToDecorate={() => {
          setIsCalendarModalOpen(false);
          onNavigate('play-zone');
        }}
      />

      {/* Friendship & Mailbox Modal */}
      <FriendshipManagerModal
        isOpen={isFriendshipModalOpen}
        onClose={() => setIsFriendshipModalOpen(false)}
        onInviteToRoom={() => {
          setIsFriendshipModalOpen(false);
          onNavigate('play-zone');
        }}
        onStartParty={() => {
          setIsFriendshipModalOpen(false);
          onNavigate('play-zone');
        }}
      />
    </header>
  );
};
