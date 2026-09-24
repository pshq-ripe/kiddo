import React, { useState, useEffect } from 'react';
import { WeatherType, TabType } from '../types';
import { LOCATIONS, APP_IMAGES } from '../data/kiddoData';
import { sound } from '../utils/sound';
import { unlockAchievement } from '../utils/achievementManager';
import { addJournalEntry } from '../utils/journalManager';
import { getCoins } from '../utils/currencyManager';
import { getCalendarState, isRewardAvailableToday, CalendarState } from '../utils/calendarManager';
import { CALENDAR_DAYS } from '../data/calendarRewardsData';
import { DailyAdventureCalendarModal } from './DailyAdventureCalendarModal';
import { FriendshipManagerModal } from './FriendshipManagerModal';
import { getUnreadMailsCount, getFriendsList } from '../utils/friendshipManager';

interface WorldMapProps {
  weather: WeatherType;
  onWeatherChange: (w: WeatherType) => void;
  onNavigate: (tab: TabType, roomId?: string) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  weather,
  onWeatherChange,
  onNavigate
}) => {
  const [islandZoomed, setIslandZoomed] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isRewardAvailable, setIsRewardAvailable] = useState(() => isRewardAvailableToday());
  const [calendarState, setCalendarState] = useState<CalendarState>(() => getCalendarState());
  const [coins, setCoins] = useState<number>(() => getCoins());
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [unreadMails, setUnreadMails] = useState(() => getUnreadMailsCount());
  const [friendsCount, setFriendsCount] = useState(() => getFriendsList().length);

  useEffect(() => {
    const handleCalendar = () => {
      setIsRewardAvailable(isRewardAvailableToday());
      setCalendarState(getCalendarState());
    };
    const handleCoins = () => setCoins(getCoins());
    const handleMail = () => setUnreadMails(getUnreadMailsCount());
    const handleFriends = () => setFriendsCount(getFriendsList().length);

    window.addEventListener('kiddo_calendar_updated', handleCalendar);
    window.addEventListener('kiddo_coins_updated', handleCoins);
    window.addEventListener('kiddo_mailbox_updated', handleMail);
    window.addEventListener('kiddo_friends_updated', handleFriends);

    return () => {
      window.removeEventListener('kiddo_calendar_updated', handleCalendar);
      window.removeEventListener('kiddo_coins_updated', handleCoins);
      window.removeEventListener('kiddo_mailbox_updated', handleMail);
      window.removeEventListener('kiddo_friends_updated', handleFriends);
    };
  }, []);

  const currentDayNumber = (calendarState.currentDayIndex || 0) + 1;
  const currentDayDef = CALENDAR_DAYS.find(d => d.dayNumber === currentDayNumber) || CALENDAR_DAYS[0];

  const handleWeatherClick = (type: WeatherType) => {
    sound.playWeatherSound(type);
    onWeatherChange(type);
    unlockAchievement('weather_wizard');

    const weatherLabels: Record<WeatherType, string> = {
      sun: 'Słoneczny dzień ☀️',
      rainbow: 'Cudowna Tęcza 🌈',
      snow: 'Zimowy Śnieżek ❄️',
      rain: 'Ciepły Deszczyk 🌧️',
      night: 'Gwiaździsta Noc 🌙'
    };

    const weatherEmojis: Record<WeatherType, string> = {
      sun: '☀️',
      rainbow: '🌈',
      snow: '❄️',
      rain: '🌧️',
      night: '🌙'
    };

    addJournalEntry({
      title: `Zmiana pogody na: ${weatherLabels[type]}!`,
      note: type === 'snow'
        ? 'Biały puch pokrył całe Miasteczko Kiddo, wirują płatki śniegu i lepimy bałwanka!'
        : type === 'sun'
        ? 'Słońce świeci ciepłymi promieniami, a złote pyłki tańczą w powietrzu!'
        : type === 'rain'
        ? 'Wesołe kropelki deszczu pluskają w kałużach, a roślinki piją wodę!'
        : type === 'rainbow'
        ? 'Siedmiobarwna tęcza rozbłysła na niebie z deszczem migoczących gwiazdek!'
        : 'Zapadł cichy zmierzch, niebo usiane jest gwiazdami i świeci księżyc.',
      category: 'discovery',
      emoji: weatherEmojis[type],
      locationName: 'Miasteczko Kiddo'
    });
  };

  const handleLocationClick = (roomId: string) => {
    sound.playSparkle();
    unlockAchievement('world_explorer');
    const loc = LOCATIONS.find(l => l.id === roomId);
    if (loc) {
      addJournalEntry({
        title: `Wyprawa do: ${loc.name}! 🗺️`,
        note: `${loc.description}`,
        category: 'discovery',
        emoji: '📍',
        locationName: loc.name
      });
    }
    onNavigate('play-zone', roomId);
  };

  return (
    <div className="flex flex-col w-full pb-8 overflow-hidden select-none">
      {/* Quick Action Options: Kalendarz Przygód & Klub Przyjaciół */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 px-3.5 sm:px-4 mb-3.5">
        {/* Opcja: Kalendarz Przygód */}
        <button
          type="button"
          onClick={() => {
            sound.playSparkle();
            setIsCalendarOpen(true);
          }}
          className="bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-all active:scale-[0.98] shadow-2xs text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-[18px] sm:text-[20px] shrink-0">
              {isRewardAvailable ? '🎁' : '📅'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[13px] sm:text-[14px] text-on-surface truncate">
                Kalendarz
              </span>
              <span className="text-[11px] text-on-surface-variant font-medium truncate">
                {isRewardAvailable ? (
                  <span className="text-amber-800 font-bold">Odbierz prezent! ✨</span>
                ) : (
                  `Seria: ${calendarState.streakDays} dni 🔥`
                )}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline-variant text-[18px] group-hover:text-on-surface transition-colors shrink-0">
            chevron_right
          </span>
        </button>

        {/* Opcja: Klub Przyjaciół */}
        <button
          type="button"
          onClick={() => {
            sound.playSparkle();
            setIsFriendsModalOpen(true);
          }}
          className="bg-surface-container-low hover:bg-surface-container border border-outline-variant/30 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-all active:scale-[0.98] shadow-2xs text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-pink-100 border border-pink-200 flex items-center justify-center text-[18px] sm:text-[20px] shrink-0">
              {unreadMails > 0 ? '📬' : '🫂'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[13px] sm:text-[14px] text-on-surface truncate">
                Klub Przyjaciół
              </span>
              <span className="text-[11px] text-on-surface-variant font-medium truncate">
                {unreadMails > 0 ? (
                  <span className="text-rose-700 font-bold">{unreadMails} nowa poczta! 💌</span>
                ) : (
                  `${friendsCount} znajomych 💕`
                )}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline-variant text-[18px] group-hover:text-on-surface transition-colors shrink-0">
            chevron_right
          </span>
        </button>
      </div>

      {/* Weather Switcher: Sun, Rainbow, Snow, Rain, Stars */}
      <div className="px-3.5 sm:px-4 mb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-extrabold text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-primary">partly_cloudy_day</span>
              <span>Klimat i Efekty Pogodowe</span>
            </span>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Dotknij, aby zmienić efekt!
            </span>
          </div>

          <div className="bg-surface-container-high p-1 rounded-2xl flex items-center gap-1 shadow-sm border border-outline-variant/40 overflow-x-auto no-scrollbar">
            {[
              { id: 'sun', label: 'Słońce', icon: 'wb_sunny', color: 'text-amber-600' },
              { id: 'rainbow', label: 'Tęcza', icon: 'looks', color: 'text-fuchsia-600' },
              { id: 'snow', label: 'Śnieg', icon: 'ac_unit', color: 'text-sky-600' },
              { id: 'rain', label: 'Deszcz', icon: 'water_drop', color: 'text-cyan-600' },
              { id: 'night', label: 'Noc', icon: 'bedtime', color: 'text-indigo-600' }
            ].map(w => {
              const isSelected = weather === w.id;
              return (
                <button
                  key={w.id}
                  id={`weather-${w.id}`}
                  type="button"
                  onClick={() => handleWeatherClick(w.id as WeatherType)}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1 transition-all transform active:scale-95 shrink-0 ${
                    isSelected
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm ring-2 ring-primary/40 font-extrabold scale-102'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[17px] ${w.color}`}>
                    {w.icon}
                  </span>
                  <span>{w.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Island Sandbox */}
      <div className="relative px-3.5 sm:px-4 mb-5">
        {/* Floating clouds */}
        <div className="absolute -top-3 left-8 z-10 pointer-events-none">
          <div className="bg-surface-container-lowest text-secondary px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 text-[13px] font-bold border border-outline-variant/30">
            <span className="material-symbols-outlined text-[18px]">
              {weather === 'sun' ? 'sunny' : weather === 'rainbow' ? 'looks' : weather === 'snow' ? 'ac_unit' : weather === 'rain' ? 'water_drop' : 'nights_stay'}
            </span>
            <span>
              {weather === 'sun'
                ? 'Ciepły dzień'
                : weather === 'rainbow'
                ? 'Kolorowe niebo'
                : weather === 'snow'
                ? 'Śnieżny puch'
                : weather === 'rain'
                ? 'Wesoły deszczyk'
                : 'Magiczna noc'}
            </span>
          </div>
        </div>

        <div className="absolute top-2 right-8 z-10 pointer-events-none">
          <div className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full shadow-sm flex items-center gap-1 text-[13px] font-bold border border-tertiary/20">
            <span className="material-symbols-outlined text-[18px]">
              {weather === 'night' ? 'bedtime' : weather === 'snow' ? 'cloudy_snowing' : 'device_thermostat'}
            </span>
            <span>
              {weather === 'night' ? '14°C' : weather === 'snow' ? '-2°C' : weather === 'rain' ? '16°C' : weather === 'rainbow' ? '22°C' : '25°C'}
            </span>
          </div>
        </div>

        {/* Floating Island Hero Card */}
        <div className="relative w-full h-[230px] rounded-3xl overflow-hidden shadow-lg bg-surface-container border-4 border-surface-container-lowest group cursor-pointer"
             onClick={() => {
               sound.playBoing();
               setIslandZoomed(true);
             }}>
          <img
            alt="Wyspa Radości Kiddo World"
            src={APP_IMAGES.worldIsland}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-between p-4">
            <div className="flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-[28px] text-yellow-300">explore</span>
              <div>
                <div className="font-bold text-[22px] leading-none text-white drop-shadow">Wyspa Radości</div>
                <div className="text-[14px] text-white/90 font-medium">5 tętniących życiem miejsc</div>
              </div>
            </div>
            <button
              type="button"
              aria-label="Pełna mapa"
              onClick={(e) => {
                e.stopPropagation();
                sound.playPop();
                setIslandZoomed(true);
              }}
              className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center shadow-md active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[26px]">zoom_out_map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Location Cards */}
      <div className="px-3.5 sm:px-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">location_on</span>
            <span className="font-bold text-[22px] text-on-surface">Wybierz Przygodę</span>
          </div>
          <span className="text-[14px] text-secondary font-bold">Dotknij by wejść</span>
        </div>

        {LOCATIONS.map((loc, idx) => (
          <div
            key={loc.id}
            onClick={() => handleLocationClick(loc.id)}
            className="bg-surface-container-lowest rounded-3xl p-4 shadow-md flex flex-col gap-3 transform transition-all active:scale-[0.98] border-2 border-outline-variant/30 cursor-pointer hover:shadow-lg"
          >
            <div className="relative w-full h-40 rounded-2xl overflow-hidden bg-surface-container-high">
              <img
                src={loc.imageUrl}
                alt={loc.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
              {/* Badge */}
              <div className={`absolute top-2 left-2 ${loc.badgeBg} font-bold text-[13px] px-3 py-1 rounded-full shadow-sm flex items-center gap-1`}>
                <span className="material-symbols-outlined text-[16px]">{loc.badgeIcon}</span>
                <span>{loc.badge}</span>
              </div>

              {loc.friendsCount && (
                <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-sm text-on-surface px-3 py-1 rounded-full shadow-sm flex items-center gap-1 font-bold text-[12px] border border-outline-variant/30">
                  <span className="material-symbols-outlined text-secondary text-[16px]">group</span>
                  <span>{loc.friendsCount} Przyjaciół czeka!</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-col min-w-0 pr-2">
                <div className="font-bold text-[18px] text-on-surface leading-tight truncate">{loc.name}</div>
                <div className="text-[14px] text-on-surface-variant truncate font-medium">{loc.subtitle}</div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLocationClick(loc.id);
                }}
                className={`h-11 px-4 rounded-full font-bold text-[14px] shadow-sm flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform ${
                  idx === 0
                    ? 'bg-primary text-on-primary shadow-[0_4px_0px_#6e0028]'
                    : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                <span>{idx === 0 ? 'Odwiedź' : 'Wejdź'}</span>
                <span className="material-symbols-outlined text-[20px]">{idx === 0 ? 'door_front' : 'arrow_forward'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Play & Action Buttons */}
      <div className="px-3.5 sm:px-6 mt-5 flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            sound.playSparkle();
            onNavigate('play-zone', 'apartment');
          }}
          className="w-full min-h-[62px] py-3 px-4 sm:px-6 rounded-2xl sm:rounded-full bg-primary-container text-on-primary-container font-extrabold text-[16px] sm:text-[18px] flex items-center justify-center gap-2.5 sm:gap-3 shadow-[0_5px_0px_#ad2c4f] active:translate-y-1 active:shadow-[0_2px_0px_#ad2c4f] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[28px] sm:text-[32px] shrink-0 text-primary">play_circle</span>
          <span className="text-center leading-snug">Szybka Gra: Wskakuj do Domu!</span>
        </button>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              onNavigate('character-maker');
            }}
            className="min-h-[58px] py-2.5 px-3 rounded-2xl bg-surface-container-lowest text-on-surface font-bold text-[13px] sm:text-[14px] flex items-center justify-start gap-2.5 shadow-[0_3px_0px_#dbdad4] active:translate-y-0.5 active:shadow-[0_1px_0px_#dbdad4] border border-outline-variant/30 transition-all hover:bg-surface-container-low cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-primary-fixed/60 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[20px]">face</span>
            </div>
            <span className="leading-tight text-left">Kreator Postaci</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              onNavigate('backpack-drawer');
            }}
            className="min-h-[58px] py-2.5 px-3 rounded-2xl bg-surface-container-lowest text-on-surface font-bold text-[13px] sm:text-[14px] flex items-center justify-start gap-2.5 shadow-[0_3px_0px_#dbdad4] active:translate-y-0.5 active:shadow-[0_1px_0px_#dbdad4] border border-outline-variant/30 transition-all hover:bg-surface-container-low cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-secondary-fixed/60 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary text-[20px]">inventory_2</span>
            </div>
            <span className="leading-tight text-left">Schowek Zabawek</span>
          </button>
        </div>
      </div>

      {/* Island Zoom Modal */}
      {islandZoomed && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl p-4 shadow-2xl flex flex-col gap-4 border-4 border-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[28px]">explore</span>
                <span className="font-bold text-[20px] text-on-surface">Mapa Wyspy Radości</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setIslandZoomed(false);
                }}
                className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold active:scale-95"
              >
                ✕
              </button>
            </div>

            <div className="relative w-full h-72 rounded-2xl overflow-hidden shadow-inner">
              <img
                src={APP_IMAGES.worldIsland}
                alt="Wyspa Radości"
                className="w-full h-full object-cover"
              />
              {/* Interactive Location Pins */}
              {LOCATIONS.map((loc, i) => {
                const positions = [
                  { top: '35%', left: '42%' },
                  { top: '55%', left: '25%' },
                  { top: '30%', left: '70%' },
                  { top: '65%', left: '60%' },
                  { top: '75%', left: '40%' }
                ];
                const pos = positions[i] || { top: '50%', left: '50%' };
                return (
                  <button
                    key={loc.id}
                    type="button"
                    style={{ top: pos.top, left: pos.left }}
                    onClick={() => {
                      setIslandZoomed(false);
                      handleLocationClick(loc.id);
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 bg-primary text-white p-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1 active:scale-110 hover:scale-105 transition-transform"
                    title={loc.name}
                  >
                    <span className="material-symbols-outlined text-[16px]">{loc.badgeIcon}</span>
                    <span className="text-[11px] font-bold px-1 hidden sm:inline">{loc.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-[14px] text-on-surface-variant text-center font-semibold">
              Dotknij dowolnego miejsca na wyspie, aby przenieść się do zabawy!
            </p>
          </div>
        </div>
      )}

      {/* Daily Adventure Calendar Modal */}
      <DailyAdventureCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onNavigateToDecorate={() => onNavigate('play-zone', 'apartment')}
      />

      {/* Friendship & Mailbox Modal */}
      <FriendshipManagerModal
        isOpen={isFriendsModalOpen}
        onClose={() => setIsFriendsModalOpen(false)}
        onInviteToRoom={() => onNavigate('play-zone', 'apartment')}
        onStartParty={() => onNavigate('play-zone', 'apartment')}
        onAcceptMeeting={(roomId) => onNavigate('play-zone', roomId)}
      />
    </div>
  );
};
