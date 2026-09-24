import React, { useState, useEffect } from 'react';
import { CALENDAR_DAYS, CalendarRewardDay } from '../data/calendarRewardsData';
import {
  getCalendarState,
  isRewardAvailableToday,
  claimTodayAdventureReward,
  simulateNextCalendarDay,
  resetCalendarCycle,
  CalendarState
} from '../utils/calendarManager';
import { getCoins } from '../utils/currencyManager';
import { sound } from '../utils/sound';
import { CharacterAvatar } from './CharacterAvatar';
import { PRESET_CHARACTERS } from '../data/kiddoData';
import { CharacterItem } from '../types';

interface DailyAdventureCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDecorate?: () => void;
}

export const DailyAdventureCalendarModal: React.FC<DailyAdventureCalendarModalProps> = ({
  isOpen,
  onClose,
  onNavigateToDecorate
}) => {
  const [calendarState, setCalendarState] = useState<CalendarState>(() => getCalendarState());
  const [isAvailable, setIsAvailable] = useState<boolean>(() => isRewardAvailableToday());
  const [coins, setCoins] = useState<number>(() => getCoins());
  const [unboxingDay, setUnboxingDay] = useState<CalendarRewardDay | null>(null);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [sparkleParticles, setSparkleParticles] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);

  const [activeCharacter] = useState<CharacterItem>(() => {
    try {
      const saved = localStorage.getItem('kiddo_characters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      }
    } catch {
      // ignore
    }
    return PRESET_CHARACTERS[0];
  });

  const refreshState = () => {
    setCalendarState(getCalendarState());
    setIsAvailable(isRewardAvailableToday());
    setCoins(getCoins());
  };

  useEffect(() => {
    refreshState();

    const handleCalendarUpdate = () => refreshState();
    const handleCoinsUpdate = () => setCoins(getCoins());

    window.addEventListener('kiddo_calendar_updated', handleCalendarUpdate);
    window.addEventListener('kiddo_coins_updated', handleCoinsUpdate);

    return () => {
      window.removeEventListener('kiddo_calendar_updated', handleCalendarUpdate);
      window.removeEventListener('kiddo_coins_updated', handleCoinsUpdate);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentDayIndex = calendarState.currentDayIndex;
  const currentRewardDay = CALENDAR_DAYS[currentDayIndex];

  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;

    // Trigger celebration particles
    const emojis = ['🪙', '✨', '⭐', '🎈', '💖', '🎁', '🎉'];
    const particles = Array.from({ length: 14 }).map((_, i) => ({
      id: Date.now() + i,
      x: 30 + Math.random() * 40,
      y: 30 + Math.random() * 40,
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    }));
    setSparkleParticles(particles);

    const result = claimTodayAdventureReward();
    if (result.success) {
      setUnboxingDay(result.day);
      setShowCelebration(true);
      refreshState();
    }
  };

  const handleSimulateNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    simulateNextCalendarDay();
    refreshState();
  };

  const handleResetCycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetCalendarCycle();
    refreshState();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[420px] max-h-[92vh] bg-surface-container-lowest rounded-3xl shadow-2xl border-4 border-amber-300 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Floating Confetti / Sparkles when claimed */}
        {sparkleParticles.map((p) => (
          <div
            key={p.id}
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            className="absolute pointer-events-none text-2xl z-50 animate-ping duration-700"
          >
            {p.emoji}
          </div>
        ))}

        {/* Modal Header */}
        <div className="relative px-5 pt-4 pb-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-yellow-950 flex flex-col items-center border-b-2 border-amber-400/50">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij kalendarz"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-yellow-950 flex items-center justify-center font-bold text-[14px] shadow-sm active:scale-95 transition-transform cursor-pointer"
          >
            ✕
          </button>

          {/* Title and Streak badge */}
          <div className="flex items-center gap-2">
            <span className="text-[26px]">📅</span>
            <h2 className="font-extrabold text-[20px] tracking-tight">Kalendarz Przygód</h2>
            <span className="text-[26px]">🎁</span>
          </div>

          <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-yellow-900/10 text-[12px] font-bold">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-0.5 rounded-full shadow-xs">
              <span>🔥</span>
              <span>
                Seria: <strong className="text-amber-800">{calendarState.streakDays} dni</strong>
              </span>
            </div>

            {/* Virtual Coins Wallet */}
            <div className="flex items-center gap-1.5 bg-yellow-950 text-amber-200 px-3 py-0.5 rounded-full shadow-xs">
              <span className="text-[14px]">🪙</span>
              <span className="font-extrabold text-[13px]">{coins}</span>
              <span className="text-[10px] text-amber-300/80">monet</span>
            </div>
          </div>
        </div>

        {/* Content Body: Calendar Days Grid */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          <div className="text-center">
            <p className="text-[13px] text-on-surface-variant font-medium">
              Odbieraj codziennie wesołe nagrody: <strong className="text-on-surface">monety</strong> na mebelki i{' '}
              <strong className="text-on-surface">naklejki</strong> do dekoracji!
            </p>
          </div>

          {/* 7-Days Visual Track */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
            {CALENDAR_DAYS.map((day, idx) => {
              // Only days before the current one in this week's cycle count as claimed (fixes week 2+)
              const isPastClaimed = idx < currentDayIndex && calendarState.claimedDaysHistory.includes(day.dayNumber);
              const isToday = idx === currentDayIndex;
              const isLockedFuture = !isPastClaimed && !isToday;

              return (
                <div
                  key={day.dayNumber}
                  className={`relative rounded-2xl p-2.5 flex flex-col items-center justify-between border-2 transition-all ${
                    day.dayNumber === 7 ? 'col-span-3 sm:col-span-2 bg-gradient-to-br from-amber-100 via-rose-50 to-purple-100 border-amber-400' : ''
                  } ${
                    isPastClaimed
                      ? 'bg-surface-container-high/60 border-outline-variant/30 opacity-75'
                      : isToday
                      ? 'bg-amber-50/90 border-amber-500 shadow-md ring-2 ring-amber-400/60 scale-[1.02]'
                      : 'bg-surface-container-low border-outline-variant/20 opacity-60'
                  }`}
                >
                  {/* Day Label Header */}
                  <div className="w-full flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold text-on-surface-variant uppercase">
                      Dzień {day.dayNumber}
                    </span>
                    {isPastClaimed ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    ) : isToday ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                    ) : (
                      <span className="material-symbols-outlined text-[12px] text-on-surface-variant/40">lock</span>
                    )}
                  </div>

                  {/* Icon Box / Mystery Present */}
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center my-1 relative shadow-xs ${
                      isPastClaimed
                        ? 'bg-surface-container text-on-surface-variant/50'
                        : isToday
                        ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-yellow-950 animate-pulse'
                        : 'bg-surface-container text-on-surface-variant/40'
                    }`}
                  >
                    {isPastClaimed ? (
                      <span className="text-[22px]">🎁</span>
                    ) : isToday ? (
                      <span className="text-[26px]">{day.sticker?.emoji || '🎁'}</span>
                    ) : (
                      <span className="text-[20px]">🎁</span>
                    )}

                    {/* Mini Coin Chip */}
                    <div className="absolute -bottom-1.5 -right-1 bg-amber-500 text-white font-extrabold text-[9px] px-1 rounded-full shadow-xs">
                      +{day.coins}
                    </div>
                  </div>

                  {/* Reward subtitle text */}
                  <span className="text-[10px] font-bold text-center text-on-surface truncate w-full mt-0.5">
                    {day.badgeText}
                  </span>

                  {/* Status Badge */}
                  <span
                    className={`text-[9px] font-bold mt-1 px-1.5 py-0.5 rounded-full ${
                      isPastClaimed
                        ? 'bg-emerald-100 text-emerald-800'
                        : isToday && isAvailable
                        ? 'bg-amber-400 text-yellow-950 font-extrabold animate-bounce'
                        : isToday && !isAvailable
                        ? 'bg-amber-200 text-amber-900'
                        : 'text-on-surface-variant/60'
                    }`}
                  >
                    {isPastClaimed
                      ? 'Odebrano'
                      : isToday && isAvailable
                      ? 'Do odbioru!'
                      : isToday && !isAvailable
                      ? 'Jutro kolejny'
                      : 'Czeka'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Today's Special Claim Area */}
          <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300/80 shadow-sm flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[22px]">{currentRewardDay?.sticker?.emoji || '✨'}</span>
              <div className="text-center">
                <h4 className="font-extrabold text-[15px] text-amber-950 leading-tight">
                  {currentRewardDay?.title}
                </h4>
                <p className="text-[11px] text-amber-900/80 font-medium">
                  {currentRewardDay?.subtitle}
                </p>
              </div>
            </div>

            {/* Rewards Breakdown Bar */}
            <div className="flex items-center gap-2 my-2">
              <div className="flex items-center gap-1 bg-amber-200 text-amber-950 px-2.5 py-1 rounded-xl text-[12px] font-extrabold shadow-2xs">
                <span>🪙</span>
                <span>+{currentRewardDay?.coins} monet</span>
              </div>
              {currentRewardDay?.sticker && (
                <div className="flex items-center gap-1 bg-rose-200 text-rose-950 px-2.5 py-1 rounded-xl text-[12px] font-extrabold shadow-2xs">
                  <span>{currentRewardDay.sticker.emoji}</span>
                  <span>Naklejka {currentRewardDay.sticker.name}</span>
                </div>
              )}
            </div>

            {/* Big Action Button */}
            {isAvailable ? (
              <button
                type="button"
                onClick={handleClaim}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-yellow-950 font-extrabold text-[16px] shadow-[0_4px_0px_#b45309] active:translate-y-1 active:shadow-[0_1px_0px_#b45309] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span className="text-[20px] animate-bounce">🎁</span>
                <span>Otwórz Dzisiejszy Prezent!</span>
              </button>
            ) : (
              <div className="w-full py-2.5 px-3 rounded-2xl bg-surface-container-high/80 text-on-surface-variant flex items-center justify-center gap-2 text-[12px] font-bold">
                <span className="text-emerald-600 text-[16px]">✓</span>
                <span>Dzisiejszy prezent odebrany! Wróć jutro po Dzień {(currentDayIndex % 7) + 1}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Helpful Navigation & Developer Testing Shortcuts */}
        <div className="px-4 py-2.5 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between gap-2">
          {onNavigateToDecorate ? (
            <button
              type="button"
              onClick={() => {
                sound.playPop(520);
                onClose();
                onNavigateToDecorate();
              }}
              className="text-[12px] font-extrabold text-secondary flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>🛋️</span>
              <span>Użyj monet w domku</span>
            </button>
          ) : (
            <div className="text-[11px] text-on-surface-variant">Zabawa w Miasteczku Kiddo ✨</div>
          )}

          {/* Discreet Parent / Tester quick simulate next day button */}
          {import.meta.env.DEV && (<div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleSimulateNext}
              title="Testuj kolejny dzień (dla szybkiego sprawdzenia)"
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-transform"
            >
              ⚡ Następny dzień
            </button>
            <button
              type="button"
              onClick={handleResetCycle}
              title="Zacznij cykl od nowa"
              className="text-[10px] font-bold px-1.5 py-1 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-transform"
            >
              ↺
            </button>
          </div>)}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CELEBRATION UNBOXING MODAL POPUP                                          */}
      {/* ========================================================================= */}
      {showCelebration && unboxingDay && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowCelebration(false);
          }}
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-surface-container-lowest rounded-3xl p-6 text-center shadow-2xl border-4 border-amber-400 relative overflow-hidden flex flex-col items-center animate-in zoom-in-90 duration-300"
          >
            {/* Glowing background burst */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-100/70 via-transparent to-transparent pointer-events-none" />

            {/* Character actively jumping with joy upon receiving the calendar gift! */}
            <div className="relative -mt-1 mb-2 flex flex-col items-center">
              <CharacterAvatar
                character={{
                  ...activeCharacter,
                  currentEmotion: 'Ekscytacja'
                }}
                size="sm"
                actionAnimation="jump-joy"
                loopAnimation={true}
                showReactionBubble={true}
                reactionText="Skaczę z radości! Prezent dla mnie! 🎁✨"
              />
            </div>

            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-400 flex items-center justify-center text-[30px] shadow-lg mb-2 animate-bounce">
              {unboxingDay.sticker?.emoji || '🎁'}
            </div>

            <h3 className="font-extrabold text-[20px] text-amber-950 mb-0.5">
              Hura! Prezent Otwarty! 🎉
            </h3>
            <p className="text-[12px] text-amber-900/80 font-medium mb-3">
              Twoje nagrody trafiły do skarbca i plecaka:
            </p>

            {/* Rewards showcase box */}
            <div className="w-full bg-amber-50 rounded-2xl p-3 border-2 border-amber-200/80 mb-4 flex flex-col gap-2">
              <div className="flex items-center justify-between px-2 py-1 bg-white rounded-xl shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="text-[20px]">🪙</span>
                  <span className="font-bold text-[13px] text-on-surface">Złote Monety</span>
                </div>
                <span className="font-extrabold text-[15px] text-amber-700">+{unboxingDay.coins}</span>
              </div>

              {unboxingDay.sticker && (
                <div className="flex items-center justify-between px-2 py-1 bg-white rounded-xl shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">{unboxingDay.sticker.emoji}</span>
                    <span className="font-bold text-[13px] text-on-surface truncate">
                      {unboxingDay.sticker.name}
                    </span>
                  </div>
                  <span className="font-extrabold text-[11px] text-primary bg-primary-fixed/50 px-2 py-0.5 rounded-full">
                    Naklejka
                  </span>
                </div>
              )}

              {unboxingDay.furnitureReward && (
                <div className="flex items-center justify-between px-2 py-1 bg-white rounded-xl shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[20px]">🎨</span>
                    <span className="font-bold text-[13px] text-on-surface truncate">
                      {unboxingDay.furnitureReward.name}
                    </span>
                  </div>
                  <span className="font-extrabold text-[11px] text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded-full">
                    Styl Mebli
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              className="w-full h-12 rounded-2xl bg-amber-400 hover:bg-amber-300 text-yellow-950 font-extrabold text-[16px] shadow-[0_4px_0px_#b45309] active:translate-y-1 active:shadow-[0_1px_0px_#b45309] transition-all cursor-pointer"
            >
              Świetnie! 🎈
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
