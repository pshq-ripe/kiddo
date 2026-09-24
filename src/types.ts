export type TabType = 'world-map' | 'character-maker' | 'play-zone' | 'backpack-drawer';

export type WeatherType = 'sun' | 'rainbow' | 'snow' | 'rain' | 'night';

export type PetSpecies = 'cat' | 'dog' | 'bunny' | 'hamster' | 'corgi' | 'panda' | 'parrot' | 'dino';

export interface AdoptedPet {
  id: string;
  name: string;
  species: PetSpecies;
  color: string;
  collarColor: string;
  accessory?: 'bow' | 'bell' | 'bandana' | 'crown' | 'cape' | 'none';
  favoriteSnack: string;
  snackIcon: string;
  soundType: 'meow' | 'bark' | 'chirp' | 'squeak' | 'purr';
  assignedCharacterId?: string; // id of character this pet accompanies
  isInRoom: boolean;
  x: number; // percentage in room
  y: number;
  happiness: number; // 0-100
  adoptedAt: string;
  personality: string;
}

export type EmotionType =
  | 'Radość'
  | 'Śmiech'
  | 'Ekscytacja'
  | 'Taniec'
  | 'Serduszka'
  | 'Zdziwienie'
  | 'Śpiew'
  | 'Sen'
  | 'Złość';

export type CharacterActionAnimation =
  | 'idle'
  | 'jump-joy'
  | 'dance'
  | 'cheer'
  | 'surprise'
  | 'heart-burst'
  | 'wiggle'
  | 'sleep'
  | 'pout';

export interface CharacterItem {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  isCustom?: boolean;
  skinColor: string;
  hairStyle: 'buns' | 'braids' | 'spiky' | 'bob' | 'curly' | 'short';
  hairColor: string;
  eyeType: 'big-sparkle' | 'happy-curved' | 'winking' | 'starry';
  mouthType: 'joy-open' | 'big-smile' | 'o-mouth' | 'pout' | 'cat-mouth';
  outfit: 'dino' | 'strawberry' | 'astronaut' | 'dungarees' | 'sweater' | 'casual';
  outfitColor: string;
  hat: 'cat-ears' | 'beanie' | 'crown' | 'cap' | 'none';
  hatColor?: string;
  glasses: 'heart' | 'round' | 'star' | 'none';
  heldItem?: string; // id of item in hand
  currentEmotion: EmotionType;
  x?: number; // relative position in room percentage
  y?: number;
}

export interface ToyProp {
  id: string;
  name: string;
  category: 'toys' | 'food' | 'home' | 'pets';
  subtitle: string;
  iconName: string;
  imageUrl?: string;
  colorBg: string;
  colorText: string;
  soundEffect?: string;
}

export interface RoomLocation {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  badge: string;
  badgeIcon: string;
  badgeBg: string;
  badgeText: string;
  imageUrl: string;
  isFavorite?: boolean;
  friendsCount?: number;
  bgAtmosphere?: string;
}

export interface RoomInteractiveState {
  tvChannel: number;
  lampOn: boolean;
  faucetOn: boolean;
  fridgeOpen: boolean;
  radioPlaying: boolean;
  timeOfDay: 'day' | 'evening' | 'night';
  heldProps: Record<string, string>; // characterId -> propId
  placedProps: { id: string; propId: string; x: number; y: number }[];
}

export interface FurnitureItem {
  id: string;
  type: 'sofa' | 'table' | 'bed' | 'fridge' | 'tv' | 'rug' | 'armchair' | 'lamp' | 'plant';
  name: string;
  x: number;
  y: number;
  rotation: number;
  flipped?: boolean;
  colorId: string;
  colorTheme: string;
  accentColor: string;
  colorName: string;
  isInRoom: boolean;
  sticker?: string; // decorative sticker applied on furniture (e.g. ⭐, 🐱, 🌈)
  isSpecialUnlocked?: boolean;
}

export interface PhotoSnapshot {
  id: string;
  timestamp: string;
  date?: string;
  roomName: string;
  roomId?: string;
  caption: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  charactersCount?: number;
  petsCount?: number;
  emoji?: string;
  isFavorite?: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  hint: string;
  category: 'rooms' | 'pets' | 'world' | 'fashion' | 'social';
  categoryLabel: string;
  icon: string;
  stickerEmoji: string;
  colorBg: string;
  colorBorder: string;
  colorText: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  rarityLabel: string;
  unlockedAt?: string;
}

export type JournalCategory = 'discovery' | 'play' | 'pets' | 'creativity' | 'achievement' | 'snack' | 'friendship';

export interface JournalEntry {
  id: string;
  timestamp: string; // e.g. "14:35"
  friendlyDate: string; // e.g. "Dzisiaj, 14:35"
  dateStr: string;
  title: string;
  note: string;
  category: JournalCategory;
  icon: string; // Material symbol icon
  emoji: string; // Friendly kid emoji
  badgeColor?: string;
  locationName?: string;
  characterName?: string;
  isFavorite?: boolean;
}
