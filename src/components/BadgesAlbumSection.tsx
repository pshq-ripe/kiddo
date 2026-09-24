import React, { useState, useEffect } from 'react';
import { AchievementBadge, TabType } from '../types';
import { getAllBadges, getAchievementStats } from '../utils/achievementManager';
import { DEFAULT_FURNITURE_STICKERS, FurnitureSticker } from '../data/calendarRewardsData';
import { getUnlockedStickerIds } from '../utils/calendarManager';
import { getCoins } from '../utils/currencyManager';
import { BadgeDetailModal } from './BadgeDetailModal';
import { sound } from '../utils/sound';

interface Props {
  onNavigate?: (tab: TabType, roomId?: string) => void;
}

export const BadgesAlbumSection: React.FC<Props> = ({ onNavigate }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked' | 'rooms' | 'pets' | 'world' | 'fashion' | 'social' | 'furniture_stickers'>('all');
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [unlockedStickers, setUnlockedStickers] = useState<string[]>(() => getUnlockedStickerIds());
  const [coins, setCoins] = useState<number>(() => getCoins());

  useEffect(() => {
    const handleStickers = () => setUnlockedStickers(getUnlockedStickerIds());
    const handleCoins = () => setCoins(getCoins());

    window.addEventListener('kiddo_stickers_updated', handleStickers);
    window.addEventListener('kiddo_coins_updated', handleCoins);

    return () => {
      window.removeEventListener('kiddo_stickers_updated', handleStickers);
      window.removeEventListener('kiddo_coins_updated', handleCoins);
    };
  }, []);

  const allBadges = getAllBadges();
  const stats = getAchievementStats();

  const filteredBadges = allBadges.filter(badge => {
    const isUnlocked = Boolean(badge.unlockedAt);
    if (filter === 'unlocked') return isUnlocked;
    if (filter === 'locked') return !isUnlocked;
    if (filter === 'rooms') return badge.category === 'rooms';
    if (filter === 'pets') return badge.category === 'pets';
    if (filter === 'world') return badge.category === 'world';
    if (filter === 'fashion') return badge.category === 'fashion';
    if (filter === 'social') return badge.category === 'social';
    return true;
  });

  const handleSelectBadge = (badge: AchievementBadge) => {
    if (badge.unlockedAt) {
      sound.playSparkle();
    } else {
      sound.playPop(480);
    }
    setSelectedBadge(badge);
  };

  return (
    <div className="flex flex-col gap-3.5 select-none">
      {/* Album Header Banner & Progress */}
      <div className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-100 rounded-3xl p-4 shadow-sm border-2 border-amber-300/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">military_tech</span>
            </div>
            <div>
              <h3 className="font-extrabold text-[16px] text-amber-950 leading-tight">
                Album Odznak & Naklejek
              </h3>
              <p className="text-[12px] text-amber-900/80 font-medium">
                Zdobywaj naklejki za odkrywanie świata i zabawy w pokojach!
              </p>
            </div>
          </div>

          <span className="bg-amber-400/90 text-amber-950 font-black text-[13px] px-3 py-1 rounded-full shadow-xs">
            {stats.unlockedCount} / {stats.total}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-1">
          <div className="w-full h-3 rounded-full bg-amber-300/60 overflow-hidden p-0.5 border border-amber-400/40">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(8, stats.percentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-bold text-amber-900 px-1">
            <span>Poziom Odkrywcy: {stats.unlockedCount >= 10 ? 'Złoty Mistrz 🏆' : stats.unlockedCount >= 5 ? 'Zuch Zwiadowca ⭐' : 'Początkujący 🌟'}</span>
            <span>{stats.percentage}% zebrane</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-3.5 sm:-mx-4 px-3.5 sm:px-4 py-0.5">
        {[
          { id: 'all', label: 'Wszystkie' },
          { id: 'social', label: 'Przyjaźń 💕' },
          { id: 'furniture_stickers', label: `🛋️ Naklejki Meblowe (${unlockedStickers.length}/${DEFAULT_FURNITURE_STICKERS.length})` },
          { id: 'unlocked', label: `✨ Zdobyte (${stats.unlockedCount})` },
          { id: 'locked', label: `🔒 Do zdobycia (${stats.total - stats.unlockedCount})` },
          { id: 'rooms', label: 'Pokoje' },
          { id: 'pets', label: 'Zwierzaki' },
          { id: 'world', label: 'Świat' },
          { id: 'fashion', label: 'Moda' }
        ].map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              sound.playPop(540);
              setFilter(f.id as typeof filter);
            }}
            className={`px-3 py-1 rounded-full font-bold text-[12px] whitespace-nowrap transition-all active:scale-95 ${
              filter === f.id
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Furniture Stickers Showcase (When selected or overview) */}
      {filter === 'furniture_stickers' ? (
        <div className="flex flex-col gap-3">
          <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-[14px] text-amber-950">
                Naklejki do Personalizacji Mebli 🛋️
              </h4>
              <p className="text-[12px] text-amber-900/80">
                Odbieraj je codziennie w Kalendarzu Przygód lub kupuj za monety (masz {coins} 🪙)!
              </p>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  onNavigate('play-zone', 'apartment');
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 font-extrabold text-[12px] text-amber-950 shrink-0 shadow-xs active:scale-95"
              >
                Idź do Domku 🏠
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {DEFAULT_FURNITURE_STICKERS.map((stk) => {
              const isUnlocked = stk.cost === 0 || stk.isUnlockedDefault || unlockedStickers.includes(stk.id);
              return (
                <div
                  key={stk.id}
                  onClick={() => {
                    if (isUnlocked) {
                      sound.playSparkle();
                    } else {
                      sound.playPop(500);
                    }
                  }}
                  className={`rounded-2xl p-3 flex flex-col items-center text-center gap-1.5 border transition-all ${
                    isUnlocked
                      ? 'bg-surface-container-lowest border-amber-300 shadow-[0_2px_0_#d8b848]'
                      : 'bg-surface-container-high/60 border-dashed border-outline-variant/40 opacity-70'
                  }`}
                >
                  <span className="text-[32px]">{stk.emoji}</span>
                  <span className="font-bold text-[13px] text-on-surface line-clamp-1">
                    {stk.name}
                  </span>
                  <span className="text-[11px] font-semibold text-on-surface-variant">
                    {isUnlocked ? '✓ W kolekcji' : `${stk.cost} monet 🪙`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Standard Stickers / Badges Grid */
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {filteredBadges.map(badge => {
          const isUnlocked = Boolean(badge.unlockedAt);
          return (
            <div
              key={badge.id}
              onClick={() => handleSelectBadge(badge)}
              title={`${badge.title} - ${isUnlocked ? 'Zdobyta!' : badge.hint}`}
              className={`rounded-2xl p-2 flex flex-col items-center justify-between text-center cursor-pointer transition-transform active:scale-95 border relative group ${
                isUnlocked
                  ? 'bg-surface-container-lowest border-amber-300 shadow-[0_3px_0_#d8b848] hover:-translate-y-0.5'
                  : 'bg-surface-container-high/60 border-dashed border-outline-variant/50 opacity-60 shadow-none'
              }`}
            >
              {/* Unlocked Sparkle Pin */}
              {isUnlocked && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold flex items-center justify-center shadow-xs">
                  ★
                </span>
              )}

              {/* Die-cut Sticker Disc */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[28px] my-1 transition-transform group-hover:scale-110 ${
                  isUnlocked
                    ? `${badge.colorBg} border-2 border-white shadow-xs`
                    : 'bg-surface-container border border-outline-variant/30 text-outline-variant'
                }`}
              >
                {isUnlocked ? badge.stickerEmoji : '🔒'}
              </div>

              {/* Badge Title */}
              <span className="font-bold text-[12px] text-on-surface leading-tight line-clamp-1 w-full mt-0.5">
                {badge.title}
              </span>

              {/* Rarity or Category label */}
              <span className="text-[10px] text-on-surface-variant font-medium truncate w-full mt-0.5">
                {isUnlocked ? badge.rarityLabel : 'Dotknij po radę'}
              </span>
            </div>
          );
        })}
      </div>
      )}

      {filter !== 'furniture_stickers' && filteredBadges.length === 0 && (
        <div className="p-8 text-center bg-surface-container rounded-2xl text-on-surface-variant text-[13px] font-medium">
          Brak naklejek w tej kategorii.
        </div>
      )}

      {/* Interactive Badge Detail Modal */}
      <BadgeDetailModal
        badge={selectedBadge}
        isOpen={Boolean(selectedBadge)}
        onClose={() => setSelectedBadge(null)}
      />
    </div>
  );
};
