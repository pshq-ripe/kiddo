// Daily Adventure Calendar Rewards Configuration

export interface CalendarRewardDay {
  dayNumber: number; // 1 to 7
  title: string;
  subtitle: string;
  coins: number;
  sticker?: {
    id: string;
    emoji: string;
    name: string;
    category: string;
  };
  furnitureReward?: {
    id: string;
    name: string;
    type: 'palette' | 'item';
    description: string;
  };
  boxIcon: string;
  boxColor: string;
  badgeText: string;
}

export const CALENDAR_DAYS: CalendarRewardDay[] = [
  {
    dayNumber: 1,
    title: 'Dzień 1: Błyszczący Start',
    subtitle: 'Wesołe powitanie w Miasteczku Kiddo!',
    coins: 60,
    sticker: {
      id: 'sticker-star',
      emoji: '⭐',
      name: 'Błyszcząca Gwiazdka',
      category: 'Magia'
    },
    boxIcon: 'star',
    boxColor: 'from-amber-400 to-yellow-500 text-yellow-950',
    badgeText: 'Gwiazdka'
  },
  {
    dayNumber: 2,
    title: 'Dzień 2: Złoty Blask Mebli',
    subtitle: 'Ekskluzywny styl mebli dla Twojego domku!',
    coins: 80,
    furnitureReward: {
      id: 'gold_royale',
      name: 'Złoty Blask 👑',
      type: 'palette',
      description: 'Królewska, błyszcząca paleta barw do każdego mebla w domku!'
    },
    sticker: {
      id: 'sticker-sparkles',
      emoji: '✨',
      name: 'Złote Iskierki',
      category: 'Magia'
    },
    boxIcon: 'palette',
    boxColor: 'from-amber-300 to-amber-500 text-amber-950',
    badgeText: 'Styl Mebli'
  },
  {
    dayNumber: 3,
    title: 'Dzień 3: Tęczowa Przygoda',
    subtitle: 'Urocza naklejka tęczy na mebelki i do plecaka!',
    coins: 90,
    sticker: {
      id: 'sticker-rainbow',
      emoji: '🌈',
      name: 'Cudowna Tęcza',
      category: 'Przygoda'
    },
    boxIcon: 'looks',
    boxColor: 'from-fuchsia-400 to-pink-500 text-pink-950',
    badgeText: 'Tęcza'
  },
  {
    dayNumber: 4,
    title: 'Dzień 4: Przyjaciel Kiciuś',
    subtitle: 'Słodki kotek na Twoją ulubioną kanapę lub lodówkę!',
    coins: 100,
    sticker: {
      id: 'sticker-cat',
      emoji: '🐱',
      name: 'Wesoły Kiciuś',
      category: 'Zwierzaki'
    },
    boxIcon: 'pets',
    boxColor: 'from-emerald-400 to-teal-500 text-teal-950',
    badgeText: 'Kotek'
  },
  {
    dayNumber: 5,
    title: 'Dzień 5: Kosmiczny Neon',
    subtitle: 'Nocna, lśniąca paleta barw mebli!',
    coins: 120,
    furnitureReward: {
      id: 'neon_cyber',
      name: 'Kosmiczny Neon 🌌',
      type: 'palette',
      description: 'Lśniąca, futurystyczna paleta fioletowo-cyjanowa dla mebli!'
    },
    sticker: {
      id: 'sticker-rocket',
      emoji: '🚀',
      name: 'Szybka Rakieta',
      category: 'Kosmos'
    },
    boxIcon: 'rocket_launch',
    boxColor: 'from-indigo-400 to-purple-600 text-purple-950',
    badgeText: 'Neon + Rakieta'
  },
  {
    dayNumber: 6,
    title: 'Dzień 6: Słodki Dzień Deserów',
    subtitle: 'Pyszne lody i wielka sakwa monet!',
    coins: 140,
    sticker: {
      id: 'sticker-icecream',
      emoji: '🍦',
      name: 'Truskawkowe Lody',
      category: 'Słodycze'
    },
    boxIcon: 'icecream',
    boxColor: 'from-rose-400 to-red-400 text-rose-950',
    badgeText: 'Lody'
  },
  {
    dayNumber: 7,
    title: 'Dzień 7: Wielka Skrzynia Skarbów',
    subtitle: 'Królewska korona i góra wirtualnych monet!',
    coins: 220,
    sticker: {
      id: 'sticker-crown',
      emoji: '👑',
      name: 'Złota Korona Przygód',
      category: 'Królewskie'
    },
    furnitureReward: {
      id: 'candy_pastel',
      name: 'Cukierkowy Pastel 🍬',
      type: 'palette',
      description: 'Cudowna, cukierkowa paleta barw w pastelowych odcieniach!'
    },
    boxIcon: 'military_tech',
    boxColor: 'from-amber-400 via-rose-400 to-violet-500 text-amber-950',
    badgeText: 'Skarb Tygodnia'
  }
];

// Available Furniture Decorative Stickers (kids can apply these onto furniture items)
export interface FurnitureSticker {
  id: string;
  emoji: string;
  name: string;
  cost: number; // 0 if obtained from calendar or starting
  isUnlockedDefault?: boolean;
}

export const DEFAULT_FURNITURE_STICKERS: FurnitureSticker[] = [
  { id: 'sticker-star', emoji: '⭐', name: 'Złota Gwiazdka', cost: 0, isUnlockedDefault: true },
  { id: 'sticker-heart', emoji: '💖', name: 'Różowe Serduszko', cost: 0, isUnlockedDefault: true },
  { id: 'sticker-sparkles', emoji: '✨', name: 'Iskierki Magii', cost: 30 },
  { id: 'sticker-rainbow', emoji: '🌈', name: 'Wesoła Tęcza', cost: 45 },
  { id: 'sticker-cat', emoji: '🐱', name: 'Słodki Kotek', cost: 40 },
  { id: 'sticker-dog', emoji: '🐶', name: 'Corgi Przyjaciel', cost: 40 },
  { id: 'sticker-icecream', emoji: '🍦', name: 'Chłodne Lody', cost: 35 },
  { id: 'sticker-rocket', emoji: '🚀', name: 'Rakieta Kosmiczna', cost: 50 },
  { id: 'sticker-crown', emoji: '👑', name: 'Królewska Korona', cost: 70 },
  { id: 'sticker-flower', emoji: '🌸', name: 'Kwiatek Wiśni', cost: 25 },
  { id: 'sticker-teddy', emoji: '🧸', name: 'Pluszowy Miś', cost: 35 },
  { id: 'sticker-pizza', emoji: '🍕', name: 'Pyszna Pizza', cost: 30 },
  { id: 'sticker-butterfly', emoji: '🦋', name: 'Niebieski Motyl', cost: 40 },
  { id: 'sticker-gem', emoji: '💎', name: 'Błękitny Diament', cost: 65 }
];
