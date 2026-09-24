import { AdoptedPet, PetSpecies } from '../types';
import { APP_IMAGES } from './kiddoData';

export interface AdoptableTemplate {
  species: PetSpecies;
  title: string;
  defaultName: string;
  avatarUrl?: string;
  iconName: string;
  badge: string;
  badgeColor: string;
  soundType: 'meow' | 'bark' | 'chirp' | 'squeak' | 'purr';
  personality: string;
  favoriteSnack: string;
  snackIcon: string;
  colorOptions: string[];
  description: string;
}

export const ADOPTABLE_PETS: AdoptableTemplate[] = [
  {
    species: 'cat',
    title: 'Kotek Przytulak',
    defaultName: 'Kosmo',
    avatarUrl: APP_IMAGES.kittenKosmo,
    iconName: 'pets',
    badge: 'Mruczek',
    badgeColor: 'bg-primary-container text-on-primary-container',
    soundType: 'meow',
    personality: 'Uwielbia drzemki na kanapie, głaskanie za uszkiem i ciepłe mleczko.',
    favoriteSnack: 'Chrupiąca Rybka',
    snackIcon: 'set_meal',
    colorOptions: ['#ffb74d', '#90a4ae', '#424242', '#ffffff', '#8d6e63'],
    description: 'Niezwykle miękki i wierny kotek, który mruczy za każdym razem, gdy go pogłaszczesz!'
  },
  {
    species: 'dog',
    title: 'Szczeniak Aport',
    defaultName: 'Bąbel',
    avatarUrl: APP_IMAGES.puppyBabel,
    iconName: 'pets',
    badge: 'Wesołek',
    badgeColor: 'bg-secondary-container text-on-secondary-container',
    soundType: 'bark',
    personality: 'Macha ogonkiem bez przerwy i zawsze biegnie pierwszy za rzuconą piłeczką!',
    favoriteSnack: 'Soczysta Kostka',
    snackIcon: 'pet_supplies',
    colorOptions: ['#d7ccc8', '#8d6e63', '#ffcc80', '#5d4037', '#ffffff'],
    description: 'Najradośniejszy piesek w całym Kiddo World. Zawsze dotrzyma kroku Twoim postaciom!'
  },
  {
    species: 'bunny',
    title: 'Puszysty Króliczek',
    defaultName: 'Puszek',
    iconName: 'cruelty_free',
    badge: 'Skoczek',
    badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed',
    soundType: 'squeak',
    personality: 'Robi urocze susy po pokoju i uwielbia chrupać soczyste marchewki.',
    favoriteSnack: 'Słodka Marchewka',
    snackIcon: 'nutrition',
    colorOptions: ['#ffffff', '#e0e0e0', '#d7ccc8', '#f8bbd0'],
    description: 'Długie uszka, różowy nosek i wielkie serce do wspólnych zabaw w domku!'
  },
  {
    species: 'corgi',
    title: 'Piesek Corgi',
    defaultName: 'Gucio',
    iconName: 'pets',
    badge: 'Królewski',
    badgeColor: 'bg-amber-100 text-amber-900',
    soundType: 'bark',
    personality: 'Krótkie łapki, serduszkowy kuperek i niespożyte zapasy uśmiechu.',
    favoriteSnack: 'Ciasteczko Maślane',
    snackIcon: 'cookie',
    colorOptions: ['#ffb300', '#fb8c00', '#d7ccc8'],
    description: 'Mały ciałem, wielki duchem! Corgi natychmiast rozweseli każdy kąt pokoju.'
  },
  {
    species: 'hamster',
    title: 'Chomiczek Śpioszek',
    defaultName: 'Chmurka',
    iconName: 'pest_control_rodent',
    badge: 'Kieszonkowy',
    badgeColor: 'bg-orange-100 text-orange-800',
    soundType: 'squeak',
    personality: 'Chowa ziarenka w policzkach i turla się po miękkim dywanie.',
    favoriteSnack: 'Ziarenko Słonecznika',
    snackIcon: 'grain',
    colorOptions: ['#ffe082', '#ffcc80', '#cfd8dc', '#ffffff'],
    description: 'Malutki przyjaciel, który zmieści się w dłoni każdej Twojej postaci.'
  },
  {
    species: 'panda',
    title: 'Panda Miniaturka',
    defaultName: 'Leonik',
    iconName: 'face',
    badge: 'Przytulak',
    badgeColor: 'bg-emerald-100 text-emerald-800',
    soundType: 'purr',
    personality: 'Spokojny mistrz tulenia, kocha zielone gałązki i poduszki.',
    favoriteSnack: 'Pęd Bambusa',
    snackIcon: 'grass',
    colorOptions: ['#37474f', '#8d6e63', '#4e342e'],
    description: 'Rzadki i uroczy gość prosto z bambusowego gaju, gotowy na wspólną herbatkę.'
  },
  {
    species: 'parrot',
    title: 'Kolorowa Papużka',
    defaultName: 'Lili',
    iconName: 'flutter_dash',
    badge: 'Śpiewaczka',
    badgeColor: 'bg-cyan-100 text-cyan-900',
    soundType: 'chirp',
    personality: 'Lata po pokoju, powtarza wesołe dźwięki i siada na ramieniu postaci.',
    favoriteSnack: 'Czerwone Jagódki',
    snackIcon: 'nutrition',
    colorOptions: ['#29b6f6', '#66bb6a', '#ffee58', '#ef5350'],
    description: 'Tęczowe piórka i radosne ćwierkanie, które doda energii każdemu wnętrzu!'
  },
  {
    species: 'dino',
    title: 'Baby Dinozaurek',
    defaultName: 'Kropek',
    iconName: 'egg',
    badge: 'Prehistoryczny',
    badgeColor: 'bg-lime-100 text-lime-900',
    soundType: 'purr',
    personality: 'Mimo że jest dinozaurem, nie gryzie! Pije mleczko z miseczki i macha ogonem.',
    favoriteSnack: 'Złote Jabłuszko',
    snackIcon: 'nutrition',
    colorOptions: ['#81c784', '#4db6ac', '#ba68c8', '#ffd54f'],
    description: 'Wykluł się z magicznego jajka prosto do Twojego pokoju zabaw.'
  }
];

export const PET_ACCESSORIES = [
  { id: 'none', label: 'Brak', icon: 'close' },
  { id: 'bow', label: 'Kokardka', icon: 'favorite' },
  { id: 'bell', label: 'Dzwoneczek', icon: 'notifications' },
  { id: 'bandana', label: 'Apaszka', icon: 'style' },
  { id: 'crown', label: 'Korona', icon: 'crown' },
  { id: 'cape', label: 'Pelerynka', icon: 'shield' }
];

export const COLLAR_COLORS = [
  { id: '#e91e63', name: 'Różowa' },
  { id: '#00bcd4', name: 'Morska' },
  { id: '#ff9800', name: 'Bursztynowa' },
  { id: '#9c27b0', name: 'Fioletowa' },
  { id: '#4caf50', name: 'Limonkowa' },
  { id: '#ffeb3b', name: 'Złota' }
];

export const DEFAULT_ADOPTED_PETS: AdoptedPet[] = [
  {
    id: 'pet-kosmo',
    name: 'Kosmo',
    species: 'cat',
    color: '#ffb74d',
    collarColor: '#e91e63',
    accessory: 'bell',
    favoriteSnack: 'Chrupiąca Rybka',
    snackIcon: 'set_meal',
    soundType: 'meow',
    assignedCharacterId: 'zosia', // Accompanies Zosia
    isInRoom: true,
    x: 32,
    y: 68,
    happiness: 95,
    adoptedAt: 'Dziś',
    personality: 'Mruczek z dzwoneczkiem Zosi'
  },
  {
    id: 'pet-babel',
    name: 'Bąbel',
    species: 'dog',
    color: '#d7ccc8',
    collarColor: '#00bcd4',
    accessory: 'bandana',
    favoriteSnack: 'Soczysta Kostka',
    snackIcon: 'pet_supplies',
    soundType: 'bark',
    assignedCharacterId: 'leon', // Accompanies Leon
    isInRoom: true,
    x: 62,
    y: 72,
    happiness: 90,
    adoptedAt: 'Dziś',
    personality: 'Wierny kompan Leona'
  }
];

export const PET_TRICKS = [
  { id: 'paw', label: 'Daj łapkę! 🐾', response: 'posłusznie podaje milutką łapkę!', sound: 'meow' },
  { id: 'spin', label: 'Zrób fikołka! 🌀', response: 'kręci radosny piruet w powietrzu!', sound: 'bark' },
  { id: 'dance', label: 'Zatańcz! 💃', response: 'podskakuje w rytm muzyki z bajki!', sound: 'chirp' },
  { id: 'snack', label: 'Poproś o smakołyk! 🦴', response: 'patrzy wielkimi maślanymi oczami!', sound: 'purr' }
];
