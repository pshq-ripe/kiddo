import { AchievementBadge } from '../types';
import { INITIAL_ACHIEVEMENTS } from '../data/achievementsData';
import { sound } from './sound';

const STORAGE_KEY = 'kiddo_achievements';

export interface UnlockedRecord {
  unlockedAt: string;
}

export const getStoredAchievements = (): Record<string, UnlockedRecord> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  // Default: welcome badge for new visitors
  return {
    world_explorer: {
      unlockedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  };
};

export const saveStoredAchievements = (records: Record<string, UnlockedRecord>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
};

export const isAchievementUnlocked = (id: string): boolean => {
  const records = getStoredAchievements();
  return Boolean(records[id]);
};

export const unlockAchievement = (id: string): AchievementBadge | null => {
  const records = getStoredAchievements();
  if (records[id]) {
    return null; // Already unlocked
  }

  const badge = INITIAL_ACHIEVEMENTS.find(b => b.id === id);
  if (!badge) return null;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  records[id] = { unlockedAt: timeStr };
  saveStoredAchievements(records);

  // Play fanfare sound and celebrate
  sound.playFanfare();
  sound.playSparkle();

  const unlockedBadge: AchievementBadge = {
    ...badge,
    unlockedAt: timeStr
  };

  // Dispatch global window event so any screen/overlay can react
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('kiddo_achievement_unlocked', {
        detail: unlockedBadge
      })
    );
  }

  // Check if >= 5 achievements reached to unlock the Legendary "super_collector" badge
  const unlockedCount = Object.keys(records).length;
  if (unlockedCount >= 5 && !records['super_collector']) {
    setTimeout(() => {
      unlockAchievement('super_collector');
    }, 1500);
  }

  return unlockedBadge;
};

export const getAllBadges = (): AchievementBadge[] => {
  const records = getStoredAchievements();
  return INITIAL_ACHIEVEMENTS.map(badge => {
    const record = records[badge.id];
    return {
      ...badge,
      unlockedAt: record ? record.unlockedAt : undefined
    };
  });
};

export const getAchievementStats = () => {
  const all = getAllBadges();
  const unlocked = all.filter(b => Boolean(b.unlockedAt));
  return {
    total: all.length,
    unlockedCount: unlocked.length,
    percentage: Math.round((unlocked.length / all.length) * 100)
  };
};
