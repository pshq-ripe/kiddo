import { JournalEntry, JournalCategory } from '../types';

const localDateStr = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;


const STORAGE_KEY = 'kiddo_adventure_journal';

export const JOURNAL_CATEGORIES: Record<
  JournalCategory,
  { label: string; icon: string; emoji: string; badgeColor: string; bgGradient: string }
> = {
  discovery: {
    label: 'Odkrycia',
    icon: 'explore',
    emoji: '🗺️',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    bgGradient: 'from-emerald-50 to-teal-50 border-emerald-200'
  },
  play: {
    label: 'Zabawa',
    icon: 'attractions',
    emoji: '🎠',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    bgGradient: 'from-sky-50 to-blue-50 border-sky-200'
  },
  pets: {
    label: 'Zwierzątka',
    icon: 'pets',
    emoji: '🐾',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    bgGradient: 'from-amber-50 to-orange-50 border-amber-200'
  },
  creativity: {
    label: 'Kreatywność',
    icon: 'palette',
    emoji: '🎨',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    bgGradient: 'from-purple-50 to-fuchsia-50 border-purple-200'
  },
  snack: {
    label: 'Smakołyki',
    icon: 'cake',
    emoji: '🍓',
    badgeColor: 'bg-pink-100 text-pink-900 border-pink-300',
    bgGradient: 'from-pink-50 to-rose-50 border-pink-200'
  },
  achievement: {
    label: 'Sukcesy',
    icon: 'military_tech',
    emoji: '⭐',
    badgeColor: 'bg-yellow-100 text-yellow-950 border-yellow-300',
    bgGradient: 'from-yellow-50 to-amber-50 border-yellow-200'
  },
  friendship: {
    label: 'Przyjaźń',
    icon: 'diversity_1',
    emoji: '💖',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    bgGradient: 'from-pink-50 to-rose-50 border-rose-200'
  }
};

const DEFAULT_ENTRIES: JournalEntry[] = [
  {
    id: 'entry_seed_1',
    timestamp: '10:00',
    friendlyDate: 'Dzisiaj, 10:00',
    dateStr: localDateStr(new Date()),
    title: 'Wielkie otwarcie Dziennika Przygód! 🎈',
    note: 'Zosia i Leon rozpoczęli swoją niesamowitą wyprawę po świecie Kiddo! Każda zabawa i spotkanie będą tu starannie zapisane.',
    category: 'discovery',
    icon: 'auto_stories',
    emoji: '📖',
    locationName: 'Miasteczko Kiddo',
    characterName: 'Zosia i Leon',
    isFavorite: true
  },
  {
    id: 'entry_seed_2',
    timestamp: '10:15',
    friendlyDate: 'Dzisiaj, 10:15',
    dateStr: localDateStr(new Date()),
    title: 'Szaleństwo w Słonecznym Parku 🦕',
    note: 'Wypróbowano wielką zjeżdżalnię dinozaura i zakręcono kolorową karuzelą kucyków!',
    category: 'play',
    icon: 'attractions',
    emoji: '🎠',
    locationName: 'Słoneczny Park',
    characterName: 'Zosia'
  },
  {
    id: 'entry_seed_3',
    timestamp: '10:30',
    friendlyDate: 'Dzisiaj, 10:30',
    dateStr: localDateStr(new Date()),
    title: 'Świeże babeczki z Cukierni 🧁',
    note: 'W Cukierni upieczono cieplutkie muffinki truskawkowe z tęczową posypką i zblendowano owocowy koktajl.',
    category: 'snack',
    icon: 'cake',
    emoji: '🍰',
    locationName: 'Cukiernia i Bar',
    characterName: 'Leon'
  }
];

let lastLoggedTitle: string = '';
let lastLoggedTime: number = 0;

export const getJournalEntries = (): JournalEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_ENTRIES;
};

export const saveJournalEntries = (entries: JournalEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // ignore
  }
};

export interface AddJournalEntryParams {
  title: string;
  note: string;
  category?: JournalCategory;
  icon?: string;
  emoji?: string;
  locationName?: string;
  characterName?: string;
  isFavorite?: boolean;
}

export const addJournalEntry = (params: AddJournalEntryParams): JournalEntry | null => {
  const now = Date.now();
  // Anti-spam debounce: same title within 3 seconds
  if (params.title === lastLoggedTitle && now - lastLoggedTime < 3000) {
    return null;
  }
  lastLoggedTitle = params.title;
  lastLoggedTime = now;

  const entries = getJournalEntries();

  const nowDate = new Date();
  const timeStr = nowDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = localDateStr(nowDate);

  const category = params.category || 'play';
  const categoryMeta = JOURNAL_CATEGORIES[category] || JOURNAL_CATEGORIES.play;

  const newEntry: JournalEntry = {
    id: `journal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: timeStr,
    friendlyDate: `Dzisiaj, ${timeStr}`,
    dateStr,
    title: params.title,
    note: params.note,
    category,
    icon: params.icon || categoryMeta.icon,
    emoji: params.emoji || categoryMeta.emoji,
    badgeColor: categoryMeta.badgeColor,
    locationName: params.locationName,
    characterName: params.characterName,
    isFavorite: params.isFavorite || false
  };

  // Prepend to top, keep max 100 entries
  const updated = [newEntry, ...entries].slice(0, 100);
  saveJournalEntries(updated);

  // Notify listeners across app
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('kiddo_journal_updated', {
        detail: newEntry
      })
    );
  }

  return newEntry;
};

export const deleteJournalEntry = (id: string): void => {
  const entries = getJournalEntries();
  const updated = entries.filter(e => e.id !== id);
  saveJournalEntries(updated);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kiddo_journal_updated'));
  }
};

export const toggleFavoriteEntry = (id: string): void => {
  const entries = getJournalEntries();
  const updated = entries.map(e => {
    if (e.id === id) {
      return { ...e, isFavorite: !e.isFavorite };
    }
    return e;
  });
  saveJournalEntries(updated);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kiddo_journal_updated'));
  }
};

export const clearJournal = (): void => {
  saveJournalEntries([]);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kiddo_journal_updated'));
  }
};

export const resetJournalToDefaults = (): void => {
  saveJournalEntries(DEFAULT_ENTRIES);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kiddo_journal_updated'));
  }
};

export const getJournalStats = () => {
  const entries = getJournalEntries();
  const categoriesCount: Record<string, number> = {};
  let favoritesCount = 0;

  entries.forEach(e => {
    categoriesCount[e.category] = (categoriesCount[e.category] || 0) + 1;
    if (e.isFavorite) favoritesCount += 1;
  });

  return {
    total: entries.length,
    favoritesCount,
    categoriesCount,
    latest: entries[0] || null
  };
};

// Global listener for automatic activity logging
if (typeof window !== 'undefined') {
  // Listen for achievement unlocks and automatically log them in the adventure journal!
  window.addEventListener('kiddo_achievement_unlocked', ((e: CustomEvent) => {
    const badge = e.detail;
    if (badge) {
      addJournalEntry({
        title: `Zdobyto odznakę: ${badge.title}! 🏆`,
        note: `Wielki sukces! ${badge.description} Naklejka: ${badge.stickerEmoji}`,
        category: 'achievement',
        icon: 'military_tech',
        emoji: badge.stickerEmoji || '⭐',
        isFavorite: true
      });
    }
  }) as EventListener);
}
