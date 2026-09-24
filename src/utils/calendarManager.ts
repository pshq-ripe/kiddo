// Adventure Calendar & Furniture Sticker Unlock Manager

import { CALENDAR_DAYS, CalendarRewardDay } from '../data/calendarRewardsData';
import { addCoins } from './currencyManager';
import { addJournalEntry } from './journalManager';
import { sound } from './sound';

const CALENDAR_STORAGE_KEY = 'kiddo_calendar_state';
const STICKERS_STORAGE_KEY = 'kiddo_unlocked_stickers';
const PALETTES_STORAGE_KEY = 'kiddo_unlocked_palettes';

export interface CalendarState {
  lastClaimDate: string | null; // e.g. "2026-09-24"
  currentDayIndex: number; // 0 to 6 (maps to Day 1 to 7)
  streakDays: number;
  totalClaimsCount: number;
  claimedDaysHistory: number[]; // e.g. [1, 2]
}

export const getTodayDateStr = (): string => {
  // Local date (not UTC) so the new day starts at local midnight
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

export const getCalendarState = (): CalendarState => {
  try {
    const raw = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.currentDayIndex === 'number') {
        return {
          lastClaimDate: parsed.lastClaimDate || null,
          currentDayIndex: Math.max(0, Math.min(6, parsed.currentDayIndex)),
          streakDays: Math.max(0, parsed.streakDays || 0),
          totalClaimsCount: Math.max(0, parsed.totalClaimsCount || 0),
          claimedDaysHistory: Array.isArray(parsed.claimedDaysHistory) ? parsed.claimedDaysHistory : []
        };
      }
    }
  } catch {
    // fallback
  }

  return {
    lastClaimDate: null,
    currentDayIndex: 0,
    streakDays: 0,
    totalClaimsCount: 0,
    claimedDaysHistory: []
  };
};

export const saveCalendarState = (state: CalendarState) => {
  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent('kiddo_calendar_updated', { detail: state }));
};

export const isRewardAvailableToday = (): boolean => {
  const state = getCalendarState();
  const today = getTodayDateStr();
  return state.lastClaimDate !== today;
};

// Returns unlocked sticker ids
export const getUnlockedStickerIds = (): string[] => {
  const defaultUnlocked = ['sticker-star', 'sticker-heart'];
  try {
    const raw = localStorage.getItem(STICKERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return Array.from(new Set([...defaultUnlocked, ...parsed]));
      }
    }
  } catch {
    // ignore
  }
  return defaultUnlocked;
};

export const addUnlockedSticker = (stickerId: string) => {
  const current = getUnlockedStickerIds();
  if (!current.includes(stickerId)) {
    const next = [...current, stickerId];
    try {
      localStorage.setItem(STICKERS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('kiddo_stickers_updated', { detail: next }));
  }
};

// Returns unlocked special furniture color palettes
export const getUnlockedPaletteIds = (): string[] => {
  const basePalettes = ['mint', 'strawberry', 'sun', 'lavender', 'sky', 'peach', 'wood', 'cream'];
  try {
    const raw = localStorage.getItem(PALETTES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return Array.from(new Set([...basePalettes, ...parsed]));
      }
    }
  } catch {
    // ignore
  }
  return basePalettes;
};

export const addUnlockedPalette = (paletteId: string) => {
  const current = getUnlockedPaletteIds();
  if (!current.includes(paletteId)) {
    const next = [...current, paletteId];
    try {
      localStorage.setItem(PALETTES_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('kiddo_palettes_updated', { detail: next }));
  }
};

// Claim today's adventure calendar box!
export const claimTodayAdventureReward = (): {
  success: boolean;
  day: CalendarRewardDay;
  newStreak: number;
} => {
  const state = getCalendarState();
  const today = getTodayDateStr();

  if (state.lastClaimDate === today) {
    const currentDay = CALENDAR_DAYS[state.currentDayIndex % CALENDAR_DAYS.length];
    return { success: false, day: currentDay, newStreak: state.streakDays };
  }

  const rewardDay = CALENDAR_DAYS[state.currentDayIndex % CALENDAR_DAYS.length];

  // 1. Grant coins
  addCoins(rewardDay.coins, `Kalendarz Przygód: Dzień ${rewardDay.dayNumber}`);

  // 2. Grant sticker if present
  if (rewardDay.sticker) {
    addUnlockedSticker(rewardDay.sticker.id);
  }

  // 3. Grant furniture reward if present
  if (rewardDay.furnitureReward && rewardDay.furnitureReward.type === 'palette') {
    addUnlockedPalette(rewardDay.furnitureReward.id);
  }

  // 4. Update audio and visual feedback
  sound.playGiftOpen();
  setTimeout(() => sound.playCoin(), 350);
  setTimeout(() => sound.playFanfare(), 650);

  // 5. Add Journal Entry
  addJournalEntry({
    title: `Odebrano nagrodę: ${rewardDay.title}! 🎁`,
    note: `Wspaniałe odkrycie w Kalendarzu Przygód! Zdobyto ${rewardDay.coins} wirtualnych monet${
      rewardDay.sticker ? ` oraz naklejkę ${rewardDay.sticker.emoji} ${rewardDay.sticker.name}` : ''
    }${
      rewardDay.furnitureReward ? ` i specjalny styl mebli: ${rewardDay.furnitureReward.name}` : ''
    }!`,
    category: 'discovery',
    emoji: rewardDay.sticker?.emoji || '🎁',
    locationName: 'Kalendarz Przygód'
  });

  // 6. Advance calendar state
  const nextStreak = state.streakDays + 1;
  const nextDayIndex = (state.currentDayIndex + 1) % CALENDAR_DAYS.length;
  // Start a fresh history when a new 7-day cycle begins
  const baseHistory = rewardDay.dayNumber === 1 ? [] : state.claimedDaysHistory;
  const nextClaimedHistory = Array.from(new Set([...baseHistory, rewardDay.dayNumber]));

  const nextState: CalendarState = {
    lastClaimDate: today,
    currentDayIndex: nextDayIndex,
    streakDays: nextStreak,
    totalClaimsCount: state.totalClaimsCount + 1,
    claimedDaysHistory: nextClaimedHistory
  };

  saveCalendarState(nextState);

  return {
    success: true,
    day: rewardDay,
    newStreak: nextStreak
  };
};

// Simulation helper for instant preview / parent testing
export const simulateNextCalendarDay = () => {
  const state = getCalendarState();
  const nextState: CalendarState = {
    ...state,
    lastClaimDate: null // unlocks today's claim immediately!
  };
  saveCalendarState(nextState);
  sound.playPop(600);
};

// Reset calendar to day 1
export const resetCalendarCycle = () => {
  const nextState: CalendarState = {
    lastClaimDate: null,
    currentDayIndex: 0,
    streakDays: 0,
    totalClaimsCount: 0,
    claimedDaysHistory: []
  };
  saveCalendarState(nextState);
  sound.playPop(450);
};
