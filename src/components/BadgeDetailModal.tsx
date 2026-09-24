import React from 'react';
import { AchievementBadge } from '../types';
import { sound } from '../utils/sound';

interface Props {
  badge: AchievementBadge | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BadgeDetailModal: React.FC<Props> = ({ badge, isOpen, onClose }) => {
  if (!isOpen || !badge) return null;

  const isUnlocked = Boolean(badge.unlockedAt);

  const handleInspectSticker = () => {
    if (isUnlocked) {
      sound.playSparkle();
    } else {
      sound.playPop(340);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm bg-surface-container-lowest rounded-3xl p-5 shadow-2xl border-4 border-amber-300 flex flex-col items-center gap-3 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij podgląd odznaki"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center text-[13px] font-bold active:scale-90"
        >
          ✕
        </button>

        {/* Sticker Die-cut Visual */}
        <div
          onClick={handleInspectSticker}
          className="relative mt-2 cursor-pointer group"
          title="Dotknij naklejki by usłyszeć dźwięk!"
        >
          <div
            className={`w-28 h-28 rounded-3xl flex items-center justify-center text-[54px] shadow-lg transition-transform duration-300 group-hover:scale-105 active:scale-95 border-4 ${
              isUnlocked
                ? 'bg-gradient-to-tr from-amber-100 via-amber-50 to-yellow-200 border-white shadow-[0_8px_0_#d4b242]'
                : 'bg-surface-container-high border-dashed border-outline-variant text-on-surface-variant/40 grayscale brightness-90 shadow-[0_4px_0_#999]'
            }`}
          >
            {isUnlocked ? badge.stickerEmoji : '🔒'}
          </div>

          {isUnlocked && (
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-[14px] flex items-center justify-center shadow-md border-2 border-white animate-spin-slow">
              ★
            </div>
          )}
        </div>

        {/* Category & Rarity */}
        <div className="flex items-center gap-2 mt-1">
          <span className="bg-surface-container-high text-on-surface-variant px-2.5 py-0.5 rounded-full text-[11px] font-bold">
            {badge.categoryLabel}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
              badge.rarity === 'legendary'
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : badge.rarity === 'epic'
                ? 'bg-purple-100 text-purple-900 border-purple-300'
                : badge.rarity === 'rare'
                ? 'bg-sky-100 text-sky-900 border-sky-300'
                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}
          >
            {badge.rarityLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-extrabold text-[20px] text-on-surface text-center leading-tight">
          {badge.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-on-surface-variant text-center leading-relaxed px-2">
          {badge.description}
        </p>

        {/* Status Box */}
        <div
          className={`w-full rounded-2xl p-3 border flex flex-col gap-1 ${
            isUnlocked
              ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
              : 'bg-surface-container border-outline-variant/40 text-on-surface-variant'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-[13px]">
            <span className="material-symbols-outlined text-[18px]">
              {isUnlocked ? 'verified' : 'help'}
            </span>
            <span>{isUnlocked ? 'Naklejka wklejona do plecaka!' : 'Jak zdobyć tę naklejkę?'}</span>
          </div>

          <p className="text-[12px] opacity-90 pl-6">
            {isUnlocked
              ? `Zdobyto o godzinie: ${badge.unlockedAt}`
              : badge.hint}
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            sound.playSparkle();
            onClose();
          }}
          className="w-full mt-2 py-3 rounded-full bg-primary text-on-primary font-bold text-[14px] shadow-[0_3px_0_#6e0028] active:translate-y-0.5 active:shadow-[0_1px_0_#6e0028] transition-all"
        >
          {isUnlocked ? 'Cudownie! ✨' : 'Rozumiem, spróbuję! 👍'}
        </button>
      </div>
    </div>
  );
};
