import React, { useState, useEffect } from 'react';
import { AchievementBadge, TabType } from '../types';
import { sound } from '../utils/sound';

interface Props {
  onNavigate?: (tab: TabType) => void;
}

export const AchievementCelebrationToast: React.FC<Props> = ({ onNavigate }) => {
  const [currentBadge, setCurrentBadge] = useState<AchievementBadge | null>(null);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleUnlocked = (e: Event) => {
      const customEvent = e as CustomEvent<AchievementBadge>;
      if (customEvent.detail) {
        setCurrentBadge(customEvent.detail);
        setVisible(true);

        const timer = setTimeout(() => {
          setVisible(false);
          setTimeout(() => setCurrentBadge(null), 400);
        }, 4800);

        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('kiddo_achievement_unlocked', handleUnlocked);
    return () => {
      window.removeEventListener('kiddo_achievement_unlocked', handleUnlocked);
    };
  }, []);

  if (!currentBadge || !visible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      onClick={() => {
        sound.playPop();
        if (onNavigate) {
          onNavigate('backpack-drawer');
        }
        setVisible(false);
      }}
      className="fixed top-12 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[360px] cursor-pointer animate-in fade-in slide-in-from-top-6 duration-300"
    >
      <div className="bg-surface-container-lowest/98 backdrop-blur-md rounded-3xl p-3.5 shadow-2xl border-4 border-amber-400 flex items-center gap-3 relative overflow-hidden select-none ring-4 ring-amber-200/50">
        {/* Sparkle background glow */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-300/30 rounded-full blur-xl pointer-events-none"></div>

        {/* Big Sticker Avatar */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-100 to-amber-200 border-2 border-amber-400 flex items-center justify-center text-[30px] shadow-md animate-bounce">
            {currentBadge.stickerEmoji}
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
            ★
          </span>
        </div>

        {/* Text info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold tracking-wider text-amber-700 uppercase bg-amber-100 px-1.5 py-0.5 rounded-full">
              ✨ Nowa Naklejka!
            </span>
            <span className="text-[10px] font-semibold text-on-surface-variant">
              {currentBadge.rarityLabel}
            </span>
          </div>

          <h4 className="font-extrabold text-[15px] text-on-surface truncate leading-tight mt-0.5">
            {currentBadge.title}
          </h4>

          <p className="text-[11px] text-on-surface-variant line-clamp-1 leading-snug">
            {currentBadge.description}
          </p>

          <span className="text-[10px] font-bold text-primary flex items-center gap-0.5 mt-0.5">
            <span>Dotknij, by otworzyć w plecaku</span>
            <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
          </span>
        </div>

        {/* Close icon */}
        <button
          type="button"
          aria-label="Zamknij powiadomienie"
          onClick={(e) => {
            e.stopPropagation();
            setVisible(false);
          }}
          className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-[12px] shrink-0 active:scale-90"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
