import React, { useState, useEffect, useRef } from 'react';
import { CharacterItem, ToyProp, PhotoSnapshot, TabType, AdoptedPet, FurnitureItem, CharacterActionAnimation } from '../types';
import { APP_IMAGES, TOY_PROPS, LOCATIONS, PRESET_CHARACTERS } from '../data/kiddoData';
import { DEFAULT_ADOPTED_PETS } from '../data/petData';
import { sound } from '../utils/sound';
import { CharacterAvatar } from './CharacterAvatar';
import { PetSprite } from './PetSprite';
import { AdoptPetModal } from './AdoptPetModal';
import { PetActionSheet } from './PetActionSheet';
import { DollhouseFurniture, DEFAULT_FURNITURE_ITEMS, FurnitureColorPalette } from './DollhouseFurniture';
import { unlockAchievement } from '../utils/achievementManager';
import { addJournalEntry } from '../utils/journalManager';
import { captureDOMElement, savePhoto, getPhotos } from '../utils/photoGalleryManager';
import { FriendshipManagerModal } from './FriendshipManagerModal';
import { FriendInteractionBubble } from './FriendInteractionBubble';
import { getUnreadMailsCount } from '../utils/friendshipManager';

interface PlayZoneProps {
  characters: CharacterItem[];
  activeRoomId: string;
  onRoomChange: (roomId: string) => void;
  onNavigate: (tab: TabType) => void;
  onUpdateCharacter: (char: CharacterItem) => void;
}

interface PlacedEntity {
  id: string;
  type: 'character' | 'toy';
  dataId: string;
  name: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  itemHeld?: string;
  speech?: string;
}

export const PlayZone: React.FC<PlayZoneProps> = ({
  characters,
  activeRoomId,
  onRoomChange,
  onNavigate
}) => {
  // Director controls state
  const [isNight, setIsNight] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [lampOn, setLampOn] = useState(true);
  const [faucetOn, setFaucetOn] = useState(false);
  const [fridgeOpen, setFridgeOpen] = useState(true);
  const [tvChannel, setTvChannel] = useState(0);
  const [cameraFlash, setCameraFlash] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [photos, setPhotos] = useState<PhotoSnapshot[]>(() => getPhotos());
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  useEffect(() => {
    const handlePhotosUpdate = () => {
      setPhotos(getPhotos());
    };
    window.addEventListener('kiddo_photos_updated', handlePhotosUpdate);
    return () => {
      window.removeEventListener('kiddo_photos_updated', handlePhotosUpdate);
    };
  }, []);

  // Friendship & Mailbox states
  const [showFriendshipModal, setShowFriendshipModal] = useState<boolean>(false);
  const [unreadMailsCount, setUnreadMailsCount] = useState<number>(() => getUnreadMailsCount());
  const [activeFriendshipPair, setActiveFriendshipPair] = useState<{
    char1: { id: string; name: string };
    char2: { id: string; name: string };
  } | null>(null);
  const [partyActive, setPartyActive] = useState<boolean>(false);

  useEffect(() => {
    const handleMailUpdate = () => setUnreadMailsCount(getUnreadMailsCount());
    window.addEventListener('kiddo_mailbox_updated', handleMailUpdate);
    return () => window.removeEventListener('kiddo_mailbox_updated', handleMailUpdate);
  }, []);

  // Adopted Pets State with LocalStorage persistence
  const [adoptedPets, setAdoptedPets] = useState<AdoptedPet[]>(() => {
    try {
      const stored = localStorage.getItem('kiddo_adopted_pets');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_ADOPTED_PETS;
  });

  const [showAdoptModal, setShowAdoptModal] = useState<boolean>(false);
  const [selectedPetForAction, setSelectedPetForAction] = useState<AdoptedPet | null>(null);
  const [drawerFilter, setDrawerFilter] = useState<'all' | 'pets' | 'characters' | 'toys' | 'furniture'>('all');
  const [draggingPetId, setDraggingPetId] = useState<string | null>(null);
  const [draggingEntityId, setDraggingEntityId] = useState<string | null>(null);
  const [petBowlFull, setPetBowlFull] = useState<boolean>(true);

  // Dollhouse Furniture State with LocalStorage persistence
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>(() => {
    try {
      const stored = localStorage.getItem('kiddo_furniture_layout');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_FURNITURE_ITEMS;
  });

  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [draggingFurnitureId, setDraggingFurnitureId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('kiddo_furniture_layout', JSON.stringify(furnitureItems));
    } catch {
      // ignore
    }
  }, [furnitureItems]);

  const stageRef = useRef<HTMLDivElement>(null);

  // Playground interactive states
  const [carouselRotation, setCarouselRotation] = useState<number>(0);
  const [isSlideActive, setIsSlideActive] = useState<boolean>(false);
  const [sandboxCastleLevel, setSandboxCastleLevel] = useState<number>(1);

  // Bakery interactive states
  const [blenderActive, setBlenderActive] = useState<boolean>(false);
  const [cakeToppingIdx, setCakeToppingIdx] = useState<number>(0);
  const [ovenBaking, setOvenBaking] = useState<boolean>(false);

  // Art School interactive states
  const [easelPaintingIdx, setEaselPaintingIdx] = useState<number>(0);
  const [activePianoKey, setActivePianoKey] = useState<string | null>(null);

  // Beach interactive states
  const [dolphinJumping, setDolphinJumping] = useState<boolean>(false);
  const [beachBallBouncing, setBeachBallBouncing] = useState<boolean>(false);
  const [beachCastleLevel, setBeachCastleLevel] = useState<number>(1);

  useEffect(() => {
    try {
      localStorage.setItem('kiddo_adopted_pets', JSON.stringify(adoptedPets));
    } catch {
      // ignore
    }
  }, [adoptedPets]);

  // Global action animation triggered by game events (e.g. calendar gift, meeting invitations)
  const [globalCharacterAction, setGlobalCharacterAction] = useState<CharacterActionAnimation>('idle');

  useEffect(() => {
    const handleReactEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ actionAnimation?: CharacterActionAnimation; speech?: string }>;
      if (customEvent.detail?.actionAnimation) {
        setGlobalCharacterAction(customEvent.detail.actionAnimation);
        if (customEvent.detail.speech) {
          setActiveSpeech(customEvent.detail.speech);
          setTimeout(() => setActiveSpeech(null), 3500);
        }
        setTimeout(() => {
          setGlobalCharacterAction('idle');
        }, 2800);
      }
    };
    window.addEventListener('kiddo_character_react', handleReactEvent);
    return () => window.removeEventListener('kiddo_character_react', handleReactEvent);
  }, []);

  // Entities on stage
  const [placedEntities, setPlacedEntities] = useState<PlacedEntity[]>([
    {
      id: 'entity-char-zosia',
      type: 'character',
      dataId: 'zosia',
      name: 'Zosia',
      x: 25,
      y: 50,
      speech: 'Miau! 🐾'
    },
    {
      id: 'entity-char-leon',
      type: 'character',
      dataId: 'leon',
      name: 'Leon',
      x: 68,
      y: 52,
      speech: 'Mniam! Pyszna pizza!'
    },
    {
      id: 'entity-toy-mis',
      type: 'toy',
      dataId: 'mis',
      name: 'Miś',
      x: 42,
      y: 68
    }
  ]);

  const [activeSpeech, setActiveSpeech] = useState<string | null>(null);

  // TV shows
  const tvShows = [
    { title: 'Taniec!', sub: '♫ Truskawka ♫', icon: 'nutrition', color: 'text-primary' },
    { title: 'Wyścig!', sub: '★ Autka ★', icon: 'directions_car', color: 'text-secondary' },
    { title: 'Bajka!', sub: '♥ Dinozaur ♥', icon: 'cruelty_free', color: 'text-tertiary' },
    { title: 'Kosmos!', sub: '✦ Kotek Kosmo ✦', icon: 'rocket_launch', color: 'text-blue-500' }
  ];

  // Invite a specific friend to the room
  const handleInviteFriendToRoom = (friendId: string, friendName: string) => {
    const existing = placedEntities.find(e => e.type === 'character' && (e.dataId === friendId || e.name === friendName));
    if (existing) {
      setActiveSpeech(`${friendName}: Już tu jestem i świetnie się bawię! ✨`);
      setTimeout(() => setActiveSpeech(null), 2500);
      return;
    }

    const newX = 35 + Math.floor(Math.random() * 30);
    const newY = 48 + Math.floor(Math.random() * 10);
    const newEntity: PlacedEntity = {
      id: `entity-char-${friendId}-${Date.now()}`,
      type: 'character',
      dataId: friendId,
      name: friendName,
      x: newX,
      y: newY,
      speech: `Cześć! Dziękuję za zaproszenie! 🎈`
    };

    setPlacedEntities(prev => [...prev, newEntity]);
    sound.playSparkle();
    setActiveSpeech(`${friendName}: Cześć! Pobawmy się razem! 💕`);
    setTimeout(() => setActiveSpeech(null), 3000);
  };

  // Listen for meeting triggers from accepted room invitations
  useEffect(() => {
    const handleMeetingTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{
        roomId: string;
        friendId: string;
        friendName: string;
        friendEmoji?: string;
        activityName?: string;
      }>;
      if (customEvent.detail) {
        const { roomId, friendId, friendName, activityName } = customEvent.detail;
        if (roomId && roomId !== activeRoomId) {
          onRoomChange(roomId);
        }

        // Place friend on stage if not already there
        setPlacedEntities(prev => {
          const next = [...prev];
          const hasFriend = next.some(
            ent => ent.type === 'character' && (ent.dataId === friendId || ent.name === friendName)
          );
          if (!hasFriend) {
            next.push({
              id: `meet-char-${friendId}-${Date.now()}`,
              type: 'character',
              dataId: friendId,
              name: friendName,
              x: 48,
              y: 52,
              speech: `Hura! Zaczynajmy spotkanie! 💕`
            });
          }
          return next;
        });

        // Trigger speech and celebratory party sparkles
        setActiveSpeech(`${friendName}: Cześć! Cieszę się z naszego spotkania! Zaczynajmy: ${activityName || 'wspaniałą zabawę'}! 💕🎈`);
        sound.playFanfare();
        setPartyActive(true);
        setTimeout(() => setPartyActive(false), 4500);
        setTimeout(() => setActiveSpeech(null), 5500);
      }
    };

    window.addEventListener('kiddo_trigger_meeting', handleMeetingTrigger);
    return () => {
      window.removeEventListener('kiddo_trigger_meeting', handleMeetingTrigger);
    };
  }, [activeRoomId, onRoomChange]);

  // Trigger Friendship Party
  const handleStartFriendshipParty = () => {
    setPartyActive(true);
    sound.playFanfare();

    // Ensure at least 3 friends are on stage
    const charactersToParty = ['zosia', 'leos', 'maja', 'franek'];
    setPlacedEntities(prev => {
      const next = [...prev];
      const positions = [
        { x: 22, y: 52 },
        { x: 50, y: 50 },
        { x: 75, y: 53 }
      ];
      charactersToParty.slice(0, 3).forEach((cid, idx) => {
        const found = next.find(e => e.type === 'character' && e.dataId === cid);
        if (!found) {
          const charData = characters.find(c => c.id === cid) || PRESET_CHARACTERS.find(c => c.id === cid);
          next.push({
            id: `party-char-${cid}-${Date.now()}`,
            type: 'character',
            dataId: cid,
            name: charData?.name || (cid === 'zosia' ? 'Zosia' : cid === 'leos' ? 'Leoś' : 'Maja'),
            x: positions[idx].x,
            y: positions[idx].y,
            speech: 'Impreza przyjaciół Kiddo! 🎉'
          });
        }
      });
      return next;
    });

    setActiveSpeech('Wszyscy przyjaciele: Hura! Wielka Impreza Przyjaźni! 🎈🎉💃');
    addJournalEntry({
      title: 'Wielka Impreza Przyjaciół! 🎉',
      note: 'Zorganizowaliśmy wesołą imprezę na scenie z tańcami, balonami i mnóstwem śmiechu!',
      category: 'friendship',
      emoji: '🎈',
      locationName: 'Scena Przygód'
    });
    unlockAchievement('party_host');

    setTimeout(() => {
      setPartyActive(false);
      setActiveSpeech(null);
    }, 5500);
  };

  // Day / Night toggle
  const toggleDayNight = () => {
    sound.playPop(isNight ? 640 : 440);
    setIsNight(prev => !prev);
    unlockAchievement('day_night_director');
  };

  // Music toggle
  const toggleMusic = () => {
    sound.toggleMusic((playing) => {
      setIsMusicPlaying(playing);
      if (playing) {
        unlockAchievement('music_box');
      }
    });
  };

  // Lamp switch
  const toggleLamp = () => {
    sound.playClick();
    setLampOn(prev => !prev);
    unlockAchievement('lamp_switch');
  };

  // Faucet water
  const toggleFaucet = () => {
    sound.playWater();
    setFaucetOn(prev => !prev);
    unlockAchievement('water_fun');
  };

  // TV channel switch
  const cycleTv = () => {
    sound.playBoing();
    setTvChannel(prev => (prev + 1) % tvShows.length);
  };

  // Fridge toggle & snack spawn
  const handleFridgeClick = () => {
    sound.playPop(520);
    setFridgeOpen(prev => !prev);
    unlockAchievement('snack_time');
  };

  const handleSnackClick = (snackName: string, icon: string) => {
    sound.playSparkle();
    setActiveSpeech(`Ktoś zjadł: ${snackName}! ❤️`);
    setTimeout(() => setActiveSpeech(null), 2400);
    unlockAchievement('snack_time');

    addJournalEntry({
      title: `Poczęstunek: ${snackName}! 😋`,
      note: `Bohaterowie delektują się pysznym smakołykiem: ${snackName}.`,
      category: 'snack',
      emoji: '🍓',
      locationName: LOCATIONS.find(l => l.id === activeRoomId)?.name || 'Miasteczko Kiddo'
    });

    // Place snack on stage table
    const newSnack: PlacedEntity = {
      id: 'snack-' + Date.now(),
      type: 'toy',
      dataId: 'snack',
      name: snackName,
      x: 72,
      y: 65
    };
    setPlacedEntities(prev => [...prev, newSnack]);
  };

  // Playground handlers
  const handleCarouselClick = () => {
    sound.playSparkle();
    sound.playBoing();
    setCarouselRotation(prev => prev + 90);
    setActiveSpeech('Hura! Kręcimy się na karuzeli! 🎠🎡');
    setTimeout(() => setActiveSpeech(null), 2500);

    addJournalEntry({
      title: 'Zakręcono karuzelą w Parku! 🎠',
      note: 'Kucyki i jednorożce obróciły się wesoło pod słońcem!',
      category: 'play',
      emoji: '🎠',
      locationName: 'Słoneczny Park'
    });
  };

  const handleSlideClick = () => {
    sound.playBoing();
    setIsSlideActive(true);
    setTimeout(() => setIsSlideActive(false), 1200);
    setActiveSpeech('Zjazd ze zjeżdżalni dinozaura! Ziuuum! 🦕✨');
    setTimeout(() => setActiveSpeech(null), 2500);

    addJournalEntry({
      title: 'Zjazd ze zjeżdżalni dinozaura! 🦕',
      note: 'Ziuuum! Wesoły zjazd z zielonego dinozaura wprost na trawnik.',
      category: 'play',
      emoji: '🦕',
      locationName: 'Słoneczny Park'
    });
  };

  const handleSandboxClick = () => {
    sound.playPop(520);
    const nextLvl = (sandboxCastleLevel % 3) + 1;
    setSandboxCastleLevel(nextLvl);
    setActiveSpeech('Budujemy zamek w piaskownicy! 🏖️🏰');
    setTimeout(() => setActiveSpeech(null), 2200);

    addJournalEntry({
      title: `Budowa zamku w piaskownicy (Poziom ${nextLvl})! 🏖️`,
      note: 'W piaskownicy wzniesiono wspaniałe baszty i wały obronne.',
      category: 'creativity',
      emoji: '🏰',
      locationName: 'Słoneczny Park'
    });
  };

  // Bakery handlers
  const cakeToppings = [
    { name: 'Świeże Truskawki', icon: '🍓' },
    { name: 'Krem Czekoladowy', icon: '🍫' },
    { name: 'Tęczowa Posypka', icon: '🌈' },
    { name: 'Złote Gwiazdki', icon: '⭐' }
  ];

  const handleBlenderClick = () => {
    sound.playPop(620);
    setBlenderActive(true);
    unlockAchievement('snack_time');
    setTimeout(() => setBlenderActive(false), 1500);
    setActiveSpeech('Koktajl owocowy gotowy! Pycha! 🍓🍌🧃');
    setTimeout(() => setActiveSpeech(null), 2500);

    addJournalEntry({
      title: 'Zblendowano koktajl truskawkowy! 🍓',
      note: 'Świeże owoce zwirowały w mikserze cukierni na pyszny napój.',
      category: 'snack',
      emoji: '🥤',
      locationName: 'Cukiernia i Bar'
    });
  };

  const handleCakeClick = () => {
    sound.playSparkle();
    const nextIdx = (cakeToppingIdx + 1) % cakeToppings.length;
    setCakeToppingIdx(nextIdx);
    unlockAchievement('snack_time');
    const nextTop = cakeToppings[nextIdx];
    setActiveSpeech(`Nowa polewa: ${nextTop.name} ${nextTop.icon}! 🎂`);
    setTimeout(() => setActiveSpeech(null), 2200);

    addJournalEntry({
      title: `Nowa dekoracja tortu: ${nextTop.name}! 🎂`,
      note: `Tort w cukierni został ozdobiony motywem: ${nextTop.name}.`,
      category: 'snack',
      emoji: '🎂',
      locationName: 'Cukiernia i Bar'
    });
  };

  const handleOvenClick = () => {
    sound.playPop(480);
    setOvenBaking(prev => !prev);
    unlockAchievement('snack_time');
    setActiveSpeech('Babeczki w piecu pachną w całej cukierni! 🧁✨');
    setTimeout(() => setActiveSpeech(null), 2200);

    addJournalEntry({
      title: 'Wypiek babeczek w piecyku! 🧁',
      note: 'Cieplutkie muffinki upieczono w piecu z magicznym blaskiem.',
      category: 'snack',
      emoji: '🧁',
      locationName: 'Cukiernia i Bar'
    });
  };

  // Art School handlers
  const paintings = [
    { title: 'Tęcza nad Łąką', icon: '🌈', color: 'from-pink-300 via-yellow-200 to-sky-300' },
    { title: 'Kotek Kosmonauta', icon: '🐱🚀', color: 'from-indigo-900 via-purple-800 to-pink-700' },
    { title: 'Słoneczniki', icon: '🌻', color: 'from-amber-300 via-yellow-400 to-orange-400' },
    { title: 'Gwiezdna Galaktyka', icon: '✨🌙', color: 'from-blue-900 via-indigo-900 to-slate-900' }
  ];

  const handleEaselClick = () => {
    sound.playSparkle();
    const nextIdx = (easelPaintingIdx + 1) % paintings.length;
    setEaselPaintingIdx(nextIdx);
    const nextP = paintings[nextIdx];
    setActiveSpeech(`Namalowano: ${nextP.title} ${nextP.icon}! 🎨`);
    setTimeout(() => setActiveSpeech(null), 2200);

    addJournalEntry({
      title: `Namalowano obraz: ${nextP.title}! 🎨`,
      note: `W pracowni plastycznej powstało dzieło z motywem: ${nextP.title} ${nextP.icon}.`,
      category: 'creativity',
      emoji: '🎨',
      locationName: 'Szkoła Talentów'
    });
  };

  const pianoNotes = [
    { key: 'C', note: 'Do', freq: 523.25, color: 'bg-red-400' },
    { key: 'D', note: 'Re', freq: 587.33, color: 'bg-orange-400' },
    { key: 'E', note: 'Mi', freq: 659.25, color: 'bg-yellow-400' },
    { key: 'F', note: 'Fa', freq: 698.46, color: 'bg-green-400' },
    { key: 'G', note: 'Sol', freq: 783.99, color: 'bg-cyan-400' },
    { key: 'A', note: 'La', freq: 880.00, color: 'bg-blue-400' },
    { key: 'B', note: 'Si', freq: 987.77, color: 'bg-purple-400' }
  ];

  const handlePianoPlay = (item: typeof pianoNotes[0]) => {
    sound.playTone(item.freq, 0.35, 'triangle', 0.22);
    setActivePianoKey(item.key);
    setTimeout(() => setActivePianoKey(null), 200);

    addJournalEntry({
      title: `Koncert fortepianowy: nuta ${item.note}! 🎵`,
      note: 'Wesoła melodia rozbrzmiewa po całej szkole talentów.',
      category: 'creativity',
      emoji: '🎹',
      locationName: 'Szkoła Talentów'
    });
  };

  // Beach handlers
  const handleDolphinClick = () => {
    sound.playWater();
    sound.playBoing();
    setDolphinJumping(true);
    setTimeout(() => setDolphinJumping(false), 1400);
    setActiveSpeech('Delfinek wyskakuje z wody i pluska! 🐬🌊');
    setTimeout(() => setActiveSpeech(null), 2500);

    addJournalEntry({
      title: 'Skok wesołego delfinka! 🐬',
      note: 'Delfin wyskoczył z błękitnych fal oceanu i zrobił wielki plusk!',
      category: 'pets',
      emoji: '🐬',
      locationName: 'Błękitna Plaża'
    });
  };

  const handleBeachBallClick = () => {
    sound.playBoing();
    setBeachBallBouncing(true);
    setTimeout(() => setBeachBallBouncing(false), 800);

    addJournalEntry({
      title: 'Gra w piłkę na plaży! ⚽',
      note: 'Plażowa piłka poszybowała wysoko nad falami.',
      category: 'play',
      emoji: '🏖️',
      locationName: 'Błękitna Plaża'
    });
  };

  const handleBeachCastleClick = () => {
    sound.playSparkle();
    const nextLvl = (beachCastleLevel % 3) + 1;
    setBeachCastleLevel(nextLvl);
    setActiveSpeech('Dodano wieżyczkę do zamku z muszelek! 🏖️🐚');
    setTimeout(() => setActiveSpeech(null), 2200);

    addJournalEntry({
      title: `Zamek z morskich muszelek (Poziom ${nextLvl})! 🐚`,
      note: 'Na plaży zbudowano pałac z piasku ozdobiony muszlami i gwiazdami morskimi.',
      category: 'creativity',
      emoji: '🐚',
      locationName: 'Błękitna Plaża'
    });
  };

  // Camera snap with DOM view capture
  const takePhoto = async () => {
    sound.playCamera();
    setCameraFlash(true);
    setTimeout(() => setCameraFlash(false), 240);
    unlockAchievement('photo_snap');

    const roomNames: Record<string, string> = {
      apartment: 'Salon i Kuchnia Przyjaciół',
      playground: 'Słoneczny Park',
      bakery: 'Cukiernia i Bar Owocowy',
      artSchool: 'Szkoła Talentów',
      beach: 'Błękitna Plaża'
    };

    const roomEmojis: Record<string, string> = {
      apartment: '🏠',
      playground: '🌳',
      bakery: '🍰',
      artSchool: '🎨',
      beach: '🏖️'
    };

    let dataUrl = '';
    if (stageRef.current) {
      try {
        dataUrl = await captureDOMElement(stageRef.current);
      } catch (err) {
        console.warn('DOM capture error:', err);
      }
    }

    const newPhoto: PhotoSnapshot = {
      id: 'photo-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('pl-PL'),
      roomName: roomNames[activeRoomId] || 'Kiddo World',
      roomId: activeRoomId,
      caption: `Wspaniała pamiątka z pokoju: ${roomNames[activeRoomId] || 'Kiddo World'}!`,
      imageUrl: dataUrl,
      charactersCount: placedEntities.filter(e => e.type === 'character').length + 1,
      petsCount: adoptedPets.filter(p => p.isInRoom).length,
      emoji: roomEmojis[activeRoomId] || '📸',
      isFavorite: false
    };

    const updated = savePhoto(newPhoto);
    setPhotos(updated);

    setActiveSpeech('📸 Zrobiono zrzut ekranu! Zdjęcie czeka w Twojej Galerii w Plecaku!');
    setTimeout(() => setActiveSpeech(null), 3500);

    addJournalEntry({
      title: `Pamiątkowe zdjęcie w: ${roomNames[activeRoomId] || 'Kiddo World'}! 📸`,
      note: 'Przechwycono widok pokoju do Galerii Zdjęć w Plecaku!',
      category: 'creativity',
      emoji: '📷',
      locationName: roomNames[activeRoomId] || 'Kiddo World'
    });
  };

  // Spawn toy or character onto stage
  const spawnEntity = (type: 'character' | 'toy', dataId: string, name: string) => {
    sound.playBoing();
    const newX = 20 + Math.random() * 55;
    const newY = 45 + Math.random() * 25;

    setPlacedEntities(prev => [
      ...prev,
      {
        id: `entity-${Date.now()}`,
        type,
        dataId,
        name,
        x: newX,
        y: newY,
        speech: type === 'character' ? 'Hura! Jestem w pokoju!' : undefined
      }
    ]);
  };

  // Remove entity from stage
  const removeEntity = (id: string) => {
    sound.playPop(380);
    setPlacedEntities(prev => prev.filter(e => e.id !== id));
  };

  // Adopt a pet handler
  const handleAdoptPet = (newPet: AdoptedPet) => {
    setAdoptedPets(prev => [newPet, ...prev]);
    setActiveSpeech(`Nowy przyjaciel ${newPet.name} dołączył do pokoju! 🐾`);
    setTimeout(() => setActiveSpeech(null), 3000);

    addJournalEntry({
      title: `Zaadoptowano pupila: ${newPet.name}! 🐾🎉`,
      note: `Do wesołej paczki dołączył nowy zwierzak: ${newPet.name}. Czas na wspólną opiekę i zabawę!`,
      category: 'pets',
      emoji: '🐶',
      locationName: 'Kącik Pupili'
    });
  };

  const handleUpdatePet = (updated: AdoptedPet) => {
    setAdoptedPets(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    setSelectedPetForAction(updated);
  };

  const handleRemovePetFromRoom = (petId: string) => {
    setAdoptedPets(prev => prev.map(p => (p.id === petId ? { ...p, isInRoom: false } : p)));
  };

  const handleTogglePetInRoom = (petId: string) => {
    sound.playPop(600);
    setAdoptedPets(prev =>
      prev.map(p => {
        if (p.id === petId) {
          const nextInRoom = !p.isInRoom;
          if (nextInRoom) {
            sound.playPetSound(p.soundType);
            setActiveSpeech(`${p.name} wbiega do pokoju! 🐾`);
            setTimeout(() => setActiveSpeech(null), 2500);

            addJournalEntry({
              title: `${p.name} wkracza do pokoju zabaw! 🐾`,
              note: `Pupil ${p.name} bawi się z bohaterami w pokoju.`,
              category: 'pets',
              emoji: '🐾',
              locationName: LOCATIONS.find(l => l.id === activeRoomId)?.name
            });
          }
          return { ...p, isInRoom: nextInRoom };
        }
        return p;
      })
    );
  };

  const handlePetBowlClick = () => {
    sound.playSparkle();
    setPetBowlFull(true);
    unlockAchievement('pet_bowl');
    setAdoptedPets(prev =>
      prev.map(p => (p.isInRoom ? { ...p, happiness: Math.min(100, p.happiness + 20) } : p))
    );
    setActiveSpeech('Miseczka pełna mleczka i chrupek! Wszystkie zwierzaki się cieszą! 🥛🦴');
    setTimeout(() => setActiveSpeech(null), 3000);

    addJournalEntry({
      title: 'Świeże mleczko i chrupki w miseczce! 🥛🐾',
      note: 'Wszystkie zwierzątka w pokoju poczęstowały się pysznym posiłkiem.',
      category: 'pets',
      emoji: '🥣',
      locationName: LOCATIONS.find(l => l.id === activeRoomId)?.name
    });
  };

  // Dragging pets on stage
  const handlePetPointerDown = (e: React.PointerEvent, petId: string) => {
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setDraggingPetId(petId);
  };

  // Dollhouse Furniture Handlers
  const handleSelectFurniture = (id: string | null) => {
    setSelectedFurnitureId(id);
  };

  const handleFurniturePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setSelectedFurnitureId(id);
    setDraggingFurnitureId(id);
    sound.vibrate(8);
  };

  const handleRotateFurniture = (id: string, degreesDelta: number) => {
    setFurnitureItems(prev =>
      prev.map(f => {
        if (f.id === id) {
          let nextRot = (f.rotation + degreesDelta) % 360;
          if (nextRot > 180) nextRot -= 360;
          return { ...f, rotation: nextRot };
        }
        return f;
      })
    );
  };

  const handleSetRotationFurniture = (id: string, exactDegrees: number) => {
    setFurnitureItems(prev =>
      prev.map(f => (f.id === id ? { ...f, rotation: exactDegrees } : f))
    );
  };

  const handleFlipFurniture = (id: string) => {
    setFurnitureItems(prev =>
      prev.map(f => (f.id === id ? { ...f, flipped: !f.flipped } : f))
    );
  };

  const handleChangeFurnitureColor = (id: string, palette: FurnitureColorPalette) => {
    setFurnitureItems(prev =>
      prev.map(f => {
        if (f.id === id) {
          return {
            ...f,
            colorId: palette.id,
            colorTheme: palette.main,
            accentColor: palette.accent,
            colorName: palette.name
          };
        }
        return f;
      })
    );
    setActiveSpeech(`Mebel pomalowany na: ${palette.name}! ✨`);
    setTimeout(() => setActiveSpeech(null), 2400);

    addJournalEntry({
      title: `Projektant wnętrz: kolor ${palette.name}! 🎨`,
      note: 'W domku dla lalek zmieniono kolory mebli na bajkowe pastele.',
      category: 'creativity',
      emoji: '🛋️',
      locationName: 'Salon i Kuchnia Przyjaciół'
    });
  };

  const handleApplyFurnitureSticker = (id: string, stickerEmoji: string | null) => {
    setFurnitureItems(prev =>
      prev.map(f => {
        if (f.id === id) {
          return {
            ...f,
            sticker: stickerEmoji || undefined
          };
        }
        return f;
      })
    );

    if (stickerEmoji) {
      setActiveSpeech(`Przyklejono naklejkę ${stickerEmoji} na meblu! ✨`);
      setTimeout(() => setActiveSpeech(null), 2200);
      addJournalEntry({
        title: `Naklejka ${stickerEmoji} na meblu! ⭐`,
        note: `Ozdobiono mebel wesołą naklejką ${stickerEmoji}. Wygląda przeuroczo!`,
        category: 'creativity',
        emoji: stickerEmoji,
        locationName: 'Domek dla Lalek'
      });
    }
  };

  const handleRemoveFurniture = (id: string) => {
    setFurnitureItems(prev =>
      prev.map(f => (f.id === id ? { ...f, isInRoom: false } : f))
    );
    if (selectedFurnitureId === id) setSelectedFurnitureId(null);
  };

  const handleToggleFurnitureInRoom = (id: string) => {
    sound.playPop(520);
    setFurnitureItems(prev =>
      prev.map(f => (f.id === id ? { ...f, isInRoom: !f.isInRoom } : f))
    );
  };

  const handleResetFurnitureLayout = () => {
    sound.playSparkle();
    setFurnitureItems(DEFAULT_FURNITURE_ITEMS);
    setSelectedFurnitureId(null);
    setActiveSpeech('Układ mebli w domku został przywrócony! 🏠');
    setTimeout(() => setActiveSpeech(null), 2500);
  };

  const handleStagePointerMove = (e: React.PointerEvent) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(8, Math.min(92, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(20, Math.min(85, Math.round(((e.clientY - rect.top) / rect.height) * 100)));

    if (draggingFurnitureId) {
      const fX = Math.max(8, Math.min(92, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
      const fY = Math.max(28, Math.min(86, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
      setFurnitureItems(prev =>
        prev.map(f => (f.id === draggingFurnitureId ? { ...f, x: fX, y: fY } : f))
      );
    } else if (draggingPetId) {
      setAdoptedPets(prev =>
        prev.map(p => (p.id === draggingPetId ? { ...p, x, y } : p))
      );
    } else if (draggingEntityId) {
      setPlacedEntities(prev =>
        prev.map(item => (item.id === draggingEntityId ? { ...item, x, y } : item))
      );
    }
  };

  const handleStagePointerUp = (e: React.PointerEvent) => {
    if (draggingFurnitureId) {
      sound.playPop(520);
      sound.vibrate([8, 12]);
      setDraggingFurnitureId(null);
    }
    if (draggingPetId) {
      sound.vibrate(8);
      setDraggingPetId(null);
    }
    if (draggingEntityId) {
      sound.vibrate(8);
      setDraggingEntityId(null);
    }
  };

  return (
    <div className="flex flex-col w-full relative select-none pb-8">
      {/* Floating Director Bar */}
      <div className="px-3.5 sm:px-4 pt-2 pb-2.5 flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
        {/* Day/Night & Music */}
        <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-full shadow-[0_3px_0px_#dbdad4] border border-outline-variant/30 shrink-0">
          <button
            type="button"
            aria-label="Zmień porę dnia"
            onClick={toggleDayNight}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
              isNight
                ? 'bg-primary-container text-on-primary-container shadow-[0_3px_0px_#ad2c4f]'
                : 'bg-tertiary-fixed text-on-tertiary-fixed shadow-[0_3px_0px_#c09732]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {isNight ? 'bedtime' : 'wb_sunny'}
            </span>
          </button>

          <button
            type="button"
            aria-label="Włącz muzykę"
            onClick={toggleMusic}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 relative ${
              isMusicPlaying
                ? 'bg-secondary text-white shadow-[0_3px_0px_#00201d]'
                : 'bg-secondary-fixed text-on-secondary-fixed shadow-[0_3px_0px_#006a62]'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">music_note</span>
            {isMusicPlaying && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-container rounded-full flex items-center justify-center text-[10px] text-on-primary-container font-bold animate-bounce">
                ♪
              </span>
            )}
          </button>
        </div>

        {/* Adopt a Pet Button */}
        <button
          type="button"
          id="adopt-pet-director-btn"
          onClick={() => {
            sound.playPetSound('meow');
            setShowAdoptModal(true);
          }}
          className="h-10 px-3.5 rounded-full bg-primary text-on-primary font-bold text-[12px] flex items-center gap-1.5 shadow-[0_3px_0px_#6e0028] active:translate-y-0.5 active:shadow-[0_1px_0px_#6e0028] transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[19px]">pets</span>
          <span className="hidden min-[380px]:inline">Adoptuj</span>
          <span className="w-5 h-5 rounded-full bg-white text-primary text-[10px] flex items-center justify-center font-bold">
            {adoptedPets.length}
          </span>
        </button>

        {/* Friends & Mailbox Button */}
        <button
          type="button"
          id="friends-mailbox-director-btn"
          onClick={() => {
            sound.playSparkle();
            setShowFriendshipModal(true);
          }}
          className="h-10 px-3.5 rounded-full bg-pink-100 border border-pink-300 text-pink-900 font-extrabold text-[12px] flex items-center gap-1.5 shadow-[0_3px_0px_#f472b6] active:translate-y-0.5 active:shadow-[0_1px_0px_#f472b6] transition-all shrink-0 cursor-pointer"
          title="Klub Przyjaciół & Poczta Przyjaźni"
        >
          <span className="text-[17px]">🫂</span>
          <span className="hidden min-[380px]:inline">Znajomi</span>
          {unreadMailsCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold animate-bounce">
              {unreadMailsCount}
            </span>
          )}
        </button>

        {/* Quick Furniture Drawer Shortcut when in Apartment */}
        {activeRoomId === 'apartment' && (
          <button
            type="button"
            onClick={() => {
              sound.playPop(520);
              setDrawerFilter('furniture');
              setDrawerOpen(true);
            }}
            className="h-10 px-3 rounded-full bg-secondary-container text-on-secondary-container font-extrabold text-[12px] flex items-center gap-1.5 shadow-[0_3px_0px_#004d47] active:translate-y-0.5 active:shadow-[0_1px_0px_#004d47] transition-all shrink-0"
            title="Meble domku: przesuwaj, obracaj i koloruj!"
          >
            <span className="text-[16px]">🛋️</span>
            <span className="hidden min-[420px]:inline">Meble</span>
            <span className="w-5 h-5 rounded-full bg-white text-secondary text-[10px] flex items-center justify-center font-bold">
              {furnitureItems.filter(f => f.isInRoom).length}
            </span>
          </button>
        )}

        {/* Quick Room Switcher */}
        <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-full shadow-[0_2px_0px_#dbdad4] border border-outline-variant/30 shrink-0">
          {[
            { id: 'apartment', label: 'Salon', icon: 'cottage' },
            { id: 'playground', label: 'Park', icon: 'attractions' },
            { id: 'bakery', label: 'Cukiernia', icon: 'cake' },
            { id: 'artSchool', label: 'Pracownia', icon: 'palette' },
            { id: 'beach', label: 'Plaża', icon: 'beach_access' }
          ].map(r => {
            const isCur = activeRoomId === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  sound.playPop(520);
                  unlockAchievement('world_explorer');
                  onRoomChange(r.id);
                }}
                className={`px-2.5 py-1 rounded-full font-bold text-[12px] flex items-center gap-1 transition-all ${
                  isCur
                    ? 'bg-primary text-on-primary shadow-[0_2px_0px_#8c1038]'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{r.icon}</span>
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Camera Snapshot Button */}
        <button
          type="button"
          aria-label="Zrób zdjęcie"
          onClick={takePhoto}
          className="h-10 px-3 rounded-full bg-primary-container text-on-primary-container font-bold text-[13px] flex items-center gap-1 shadow-[0_3px_0px_#ad2c4f] active:scale-95 transition-all shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">photo_camera</span>
          <span className="hidden min-[400px]:inline">Pstryk!</span>
          {photos.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setShowPhotoModal(true);
              }}
              className="ml-0.5 w-4 h-4 rounded-full bg-white text-primary text-[10px] flex items-center justify-center font-bold"
            >
              {photos.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Dollhouse Playset Room */}
      <div
        className={`mx-3 sm:mx-3.5 relative rounded-3xl overflow-hidden shadow-[0_4px_0px_#dbdad4] border-4 border-surface-container-lowest transition-all duration-500 ${
          isNight
            ? 'bg-slate-900 brightness-85 hue-rotate-15'
            : lampOn
            ? 'bg-surface-container-low'
            : 'bg-surface-container brightness-90'
        }`}
      >
        <div
          ref={stageRef}
          onPointerMove={handleStagePointerMove}
          onPointerUp={handleStagePointerUp}
          onClick={() => setSelectedFurnitureId(null)}
          className="relative w-full h-[470px] overflow-hidden flex flex-col justify-between"
        >
          {/* Active Location Badge */}
          <div className="absolute top-2.5 left-3.5 z-30 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-outline-variant/30 flex items-center gap-1.5 pointer-events-none">
            <span className="material-symbols-outlined text-primary text-[16px]">
              {LOCATIONS.find(l => l.id === activeRoomId)?.badgeIcon || 'cottage'}
            </span>
            <span className="font-bold text-[12px] text-on-surface">
              {LOCATIONS.find(l => l.id === activeRoomId)?.name || 'Mieszkanie Przyjaciół'}
            </span>
          </div>

          {/* Wall Wallpaper / Scenic Backdrop */}
          {activeRoomId === 'apartment' ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-surface-container to-surface-container-low opacity-95">
                <svg className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                  <pattern id="stars-pattern" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
                    <path d="M24 16l2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7z" fill="#c09732" />
                    <circle cx="8" cy="8" r="2" fill="#ff6b8b" />
                    <circle cx="40" cy="38" r="2.5" fill="#70f8e8" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#stars-pattern)" />
                </svg>
              </div>

              {/* Living Room Window */}
              <div className="absolute top-6 left-28 w-28 h-36 rounded-2xl bg-secondary-fixed/40 p-2 shadow-inner flex flex-col justify-between overflow-hidden border border-secondary/30">
                <div className={`w-full h-full rounded-xl relative overflow-hidden flex items-end ${
                  isNight ? 'bg-indigo-950/80' : 'bg-secondary-fixed/70'
                }`}>
                  {isNight ? (
                    <>
                      <div className="w-4 h-4 rounded-full bg-yellow-200 absolute top-2 right-2 shadow-sm animate-pulse"></div>
                      <span className="text-[10px] text-yellow-100 absolute bottom-3 left-2 font-bold">★ ★ ★</span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-8 rounded-full bg-secondary opacity-30 -mb-2 -ml-2"></div>
                      <div className="w-16 h-10 rounded-full bg-secondary opacity-40 -mb-3 ml-2"></div>
                      <span className="material-symbols-outlined text-primary-fixed-dim absolute top-2 right-2 text-[20px] animate-pulse">
                        cloud
                      </span>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src={APP_IMAGES[activeRoomId as keyof typeof APP_IMAGES] || APP_IMAGES.apartment}
                alt="Tło pokoju"
                className="w-full h-full object-cover opacity-20 filter blur-[0.4px] scale-105"
              />
              <div className={`absolute inset-0 ${
                isNight
                  ? 'bg-gradient-to-b from-indigo-950/85 via-slate-900/80 to-slate-900/95'
                  : 'bg-gradient-to-b from-surface-container/60 via-surface-container-low/40 to-surface-container/85'
              }`} />
            </div>
          )}

          {/* Pennant Garland on Ceiling */}
          <div className="relative z-10 w-full flex justify-around pt-1 pointer-events-none">
            <div className="w-6 h-6 bg-primary-container clip-triangle transform rotate-12 rounded-sm shadow-sm"></div>
            <div className="w-6 h-6 bg-secondary-container clip-triangle transform -rotate-6 rounded-sm shadow-sm"></div>
            <div className="w-6 h-6 bg-tertiary-fixed clip-triangle transform rotate-6 rounded-sm shadow-sm"></div>
            <div className="w-6 h-6 bg-primary-fixed clip-triangle transform -rotate-12 rounded-sm shadow-sm"></div>
            <div className="w-6 h-6 bg-secondary-container clip-triangle transform rotate-12 rounded-sm shadow-sm"></div>
            <div className="w-6 h-6 bg-tertiary-container clip-triangle transform -rotate-3 rounded-sm shadow-sm"></div>
          </div>

          {/* Upper Zone: Interactive Hanging Lamp & Wall Clock */}
          <div className="relative z-10 px-6 flex justify-between items-start mt-2">
            {/* Hanging Lamp */}
            <button
              type="button"
              aria-label="Włącz lampę"
              onClick={toggleLamp}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-1 h-8 bg-on-surface-variant"></div>
              <div
                className={`w-12 h-8 rounded-t-full flex items-center justify-center shadow-md transition-all group-active:scale-95 ${
                  lampOn ? 'bg-tertiary-fixed-dim ring-4 ring-yellow-200/50' : 'bg-surface-container-highest'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${lampOn ? 'text-tertiary animate-pulse' : 'text-outline'}`}>
                  lightbulb
                </span>
              </div>
              {lampOn && <div className="w-3 h-3 rounded-full bg-tertiary-container animate-ping -mt-1"></div>}
            </button>

            {/* Wall Clock & Poster */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-surface-container-highest shadow-[0_3px_0px_#dbdad4] flex items-center justify-center border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary text-[24px]">schedule</span>
              </div>
              <div className="w-14 h-16 rounded-xl bg-surface-container-lowest p-1 shadow-sm rotate-3 flex flex-col items-center justify-center border border-outline-variant/30">
                <span className="material-symbols-outlined text-primary-container text-[24px] animate-pulse">favorite</span>
                <span className="font-bold text-[10px] text-outline">MIŁOŚĆ</span>
              </div>
            </div>
          </div>

          {/* Playset Area by Active Room */}
          <div className="relative z-20 w-full flex-1 flex items-end px-3 pb-8">
            {/* ================= SALON I KUCHNIA (APARTMENT) ================= */}
            {activeRoomId === 'apartment' && (
              <div className="w-full h-full relative">
                {/* Helpful Instruction Tip Bar */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-25 pointer-events-none">
                  <div className="bg-surface-container-lowest/90 backdrop-blur-xs px-3 py-1 rounded-full shadow-xs border border-outline-variant/30 flex items-center gap-1.5 text-[11px] font-bold text-on-surface">
                    <span>🛋️</span>
                    <span>Dotknij mebel, aby go przesunąć, obrócić ↻ i pomalować 🎨!</span>
                  </div>
                </div>

                {/* Wall Fixtures: Kitchen Sink & Radio */}
                <div className="absolute top-16 right-8 z-20 flex flex-col items-center">
                  <button
                    type="button"
                    aria-label="Włącz kran"
                    onClick={toggleFaucet}
                    className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shadow-sm relative group border border-outline-variant/30 active:scale-95 cursor-pointer"
                    title="Kran z wodą (dotknij by odkręcić!)"
                  >
                    <span className="material-symbols-outlined text-secondary text-[20px]">faucet</span>
                    {faucetOn && (
                      <div className="w-2.5 h-2.5 rounded-full bg-secondary-container animate-ping absolute -top-1 -right-1"></div>
                    )}
                  </button>
                  {faucetOn && (
                    <div className="text-secondary text-[13px] font-bold flex flex-col items-center animate-bounce">
                      <span>💧</span>
                    </div>
                  )}
                </div>

                <div className="absolute top-16 left-8 z-20">
                  <button
                    type="button"
                    aria-label="Grające radyjko"
                    onClick={() => {
                      sound.playSparkle();
                      setActiveSpeech('♫ Wesoła muzyczka leci! ♫');
                      setTimeout(() => setActiveSpeech(null), 2000);
                    }}
                    className="w-9 h-9 rounded-xl bg-tertiary-fixed flex items-center justify-center shadow-[0_3px_0px_#c09732] active:scale-95 transition-transform border border-tertiary/30 cursor-pointer"
                    title="Grające radyjko"
                  >
                    <span className="material-symbols-outlined text-on-tertiary-fixed text-[20px]">radio</span>
                  </button>
                </div>

                {/* Dynamic Placed Dollhouse Furniture Items on Stage */}
                {furnitureItems
                  .filter(f => f.isInRoom)
                  .map(item => (
                    <DollhouseFurniture
                      key={item.id}
                      item={item}
                      isSelected={selectedFurnitureId === item.id}
                      isDragging={draggingFurnitureId === item.id}
                      onSelect={handleSelectFurniture}
                      onPointerDown={handleFurniturePointerDown}
                      onRotate={handleRotateFurniture}
                      onSetRotation={handleSetRotationFurniture}
                      onFlip={handleFlipFurniture}
                      onChangeColor={handleChangeFurnitureColor}
                      onApplySticker={handleApplyFurnitureSticker}
                      onRemove={handleRemoveFurniture}
                      fridgeOpen={fridgeOpen}
                      onFridgeToggle={handleFridgeClick}
                      onSnackClick={handleSnackClick}
                      tvChannel={tvChannel}
                      onTvCycle={cycleTv}
                      tvShows={tvShows}
                      lampOn={lampOn}
                      onLampToggle={toggleLamp}
                    />
                  ))}
              </div>
            )}

            {/* ================= SŁONECZNY PARK I PLAC ZABAW ================= */}
            {activeRoomId === 'playground' && (
              <div className="w-full flex items-end justify-between">
                {/* Left: Dino Slide & Sandbox */}
                <div className="w-1/2 flex flex-col items-center relative pr-2">
                  <div
                    onClick={handleSlideClick}
                    className="absolute -top-32 left-2 flex flex-col items-center cursor-pointer group active:scale-95 transition-transform"
                    title="Dotknij, aby zjechać ze zjeżdżalni!"
                  >
                    <div className="bg-surface-container-lowest/90 px-2 py-0.5 rounded-full shadow-xs text-[10px] font-bold text-primary mb-1 border border-outline-variant/30 flex items-center gap-1">
                      <span>Zjeżdżalnia Dino</span>
                      <span className="material-symbols-outlined text-[12px]">touch_app</span>
                    </div>
                    <div className="relative w-36 h-28 flex items-center justify-center">
                      <div className="w-28 h-20 bg-emerald-500 rounded-3xl shadow-[0_5px_0px_#065f46] relative flex items-center justify-between p-2 border-2 border-emerald-400">
                        <span className="text-[28px]">🦕</span>
                        <div className="h-2 w-14 bg-yellow-300 rounded-full transform rotate-12 shadow-inner"></div>
                        <span className="text-[18px]">✨</span>
                      </div>
                      {isSlideActive && (
                        <div className="absolute top-2 right-6 animate-bounce text-2xl">⭐</div>
                      )}
                    </div>
                  </div>

                  <div
                    onClick={handleSandboxClick}
                    className="w-full max-w-[170px] h-20 bg-amber-300 rounded-t-3xl shadow-[0_6px_0px_#b45309] relative flex flex-col justify-end p-2.5 z-20 border-2 border-amber-500 cursor-pointer active:scale-95 transition-transform"
                    title="Piaskownica (dotknij by budować zamek!)"
                  >
                    <div className="flex items-center justify-around">
                      <span className="text-[20px]">{sandboxCastleLevel === 1 ? '🏖️' : sandboxCastleLevel === 2 ? '🏰' : '👑🏰'}</span>
                      <span className="text-[16px]">🪣</span>
                      <span className="text-[16px]">⛏️</span>
                    </div>
                    <span className="text-[9px] font-bold text-amber-900 text-center mt-1">Zamek z piasku (Poz. {sandboxCastleLevel})</span>
                  </div>
                </div>

                {/* Right: Spinning Carousel & Picnic Blanket */}
                <div className="w-1/2 flex flex-col items-center relative pl-2">
                  <div
                    onClick={handleCarouselClick}
                    className="absolute -top-34 right-2 flex flex-col items-center cursor-pointer group active:scale-95 transition-transform z-30"
                    title="Dotknij, aby zakręcić karuzelą!"
                  >
                    <div className="bg-surface-container-lowest/90 px-2 py-0.5 rounded-full shadow-xs text-[10px] font-bold text-secondary mb-1 border border-outline-variant/30 flex items-center gap-1">
                      <span>Karuzela Kucyków</span>
                      <span className="material-symbols-outlined text-[12px]">sync</span>
                    </div>
                    <div
                      style={{ transform: `rotate(${carouselRotation}deg)` }}
                      className="w-28 h-28 rounded-full bg-gradient-to-tr from-pink-300 via-amber-200 to-sky-300 shadow-[0_6px_0px_#db2777] border-4 border-white flex items-center justify-around transition-transform duration-700 ease-out p-1"
                    >
                      <span className="text-[22px]">🎠</span>
                      <span className="text-[20px]">🦄</span>
                      <span className="text-[22px]">🎠</span>
                    </div>
                  </div>

                  <div className="w-full max-w-[160px] h-20 bg-red-100 rounded-2xl shadow-[0_4px_0px_#f87171] relative flex flex-col justify-center items-center p-2 z-20 border-2 border-red-300">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSnackClick('Kawałek Arbuza', 'nutrition');
                        }}
                        title="Arbuz"
                        className="hover:scale-125 transition-transform"
                      >
                        <span className="text-[22px]">🍉</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSnackClick('Sok Jabłkowy', 'local_drink');
                        }}
                        title="Sok jabłkowy"
                        className="hover:scale-125 transition-transform"
                      >
                        <span className="text-[20px]">🧃</span>
                      </button>
                      <span className="text-[20px] animate-spin">🎡</span>
                    </div>
                    <span className="text-[10px] font-bold text-red-900 mt-1">Koc piknikowy</span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= CUKIERNIA I BAR OWOCOWY ================= */}
            {activeRoomId === 'bakery' && (
              <div className="w-full flex items-end justify-between">
                {/* Left: Blender & Layered Cake */}
                <div className="w-1/2 flex flex-col items-center relative pr-2">
                  <div
                    onClick={handleBlenderClick}
                    className="absolute -top-32 left-3 flex flex-col items-center cursor-pointer group active:scale-95 transition-transform z-30"
                    title="Dotknij miksera, by zblendować koktajl!"
                  >
                    <div className="bg-surface-container-lowest/90 px-2 py-0.5 rounded-full shadow-xs text-[10px] font-bold text-primary mb-1 border border-outline-variant/30 flex items-center gap-1">
                      <span>Mikser Owocowy</span>
                      <span className="material-symbols-outlined text-[12px]">blender</span>
                    </div>
                    <div className={`w-20 h-24 rounded-2xl bg-secondary-fixed/50 border-2 border-secondary p-1 flex flex-col justify-between items-center shadow-md ${blenderActive ? 'animate-bounce' : ''}`}>
                      <span className="text-[24px]">{blenderActive ? '🌪️🍓' : '🍓🍌'}</span>
                      <span className="text-[10px] font-bold text-secondary">
                        {blenderActive ? 'Miksujemy!' : 'Włącz'}
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={handleCakeClick}
                    className="w-full max-w-[170px] h-20 bg-rose-200 rounded-t-3xl shadow-[0_6px_0px_#f43f5e] relative flex flex-col justify-end p-2.5 z-20 border-2 border-rose-400 cursor-pointer active:scale-95 transition-transform"
                    title="Tort (dotknij by zmienić dekorację!)"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[26px]">🎂</span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-rose-900 leading-tight">
                          {cakeToppings[cakeToppingIdx].name}
                        </span>
                        <span className="text-[9px] text-rose-700">Dotknij by udekorować</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Pastry Display & Oven */}
                <div className="w-1/2 flex flex-col items-center relative pl-2">
                  <div className="absolute -top-34 right-2 w-32 bg-white/95 rounded-2xl shadow-[0_5px_0px_#e2e8f0] p-2 border-2 border-pink-300 z-30">
                    <div className="text-[10px] font-bold text-pink-600 text-center mb-1">Gablota Słodkości</div>
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSnackClick('Pączek z Posypką', 'donut_small');
                        }}
                        className="hover:scale-125 transition-transform text-[18px]"
                        title="Pączek"
                      >
                        🍩
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSnackClick('Francuski Rogalik', 'bakery_dining');
                        }}
                        className="hover:scale-125 transition-transform text-[18px]"
                        title="Rogalik"
                      >
                        🥐
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSnackClick('Tartaletka Owocowa', 'cake');
                        }}
                        className="hover:scale-125 transition-transform text-[18px]"
                        title="Tartaletka"
                      >
                        🧁
                      </button>
                    </div>
                  </div>

                  <div
                    onClick={handleOvenClick}
                    className={`w-full max-w-[160px] h-20 rounded-2xl shadow-[0_5px_0px_#db2777] relative flex flex-col justify-center items-center p-2 z-20 border-2 border-pink-400 cursor-pointer active:scale-95 transition-all ${
                      ovenBaking ? 'bg-amber-100 ring-2 ring-yellow-400' : 'bg-pink-200'
                    }`}
                    title="Piec cukierniczy (dotknij by piec babeczki!)"
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[24px] text-pink-700">microwave</span>
                      <span className="text-[20px]">{ovenBaking ? '🔥🧁' : '🧁'}</span>
                    </div>
                    <span className="text-[10px] font-bold text-pink-900 mt-0.5">
                      {ovenBaking ? 'Pieczenie w toku! ✨' : 'Ciepły piecyk'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ================= SZKOŁA TALENTÓW I PLASTYKA ================= */}
            {activeRoomId === 'artSchool' && (
              <div className="w-full flex items-end justify-between">
                {/* Left: Easel & Palette */}
                <div className="w-1/2 flex flex-col items-center relative pr-2">
                  <div
                    onClick={handleEaselClick}
                    className="absolute -top-34 left-3 flex flex-col items-center cursor-pointer group active:scale-95 transition-transform z-30"
                    title="Sztaluga (dotknij by zmienić arcydzieło!)"
                  >
                    <div className="bg-surface-container-lowest/90 px-2 py-0.5 rounded-full shadow-xs text-[10px] font-bold text-primary mb-1 border border-outline-variant/30 flex items-center gap-1">
                      <span>Sztaluga Artysty</span>
                      <span className="material-symbols-outlined text-[12px]">palette</span>
                    </div>
                    <div className={`w-28 h-24 rounded-2xl bg-gradient-to-tr ${paintings[easelPaintingIdx].color} border-4 border-amber-800 shadow-md p-1.5 flex flex-col items-center justify-between`}>
                      <span className="text-[26px]">{paintings[easelPaintingIdx].icon}</span>
                      <span className="text-[9px] font-bold bg-black/60 text-white px-2 py-0.5 rounded-full truncate max-w-full">
                        {paintings[easelPaintingIdx].title}
                      </span>
                    </div>
                    <div className="flex justify-between w-20 h-4 -mt-0.5">
                      <div className="w-1.5 h-full bg-amber-900 rounded-b"></div>
                      <div className="w-1.5 h-full bg-amber-900 rounded-b"></div>
                    </div>
                  </div>

                  <div className="w-full max-w-[170px] h-20 bg-amber-200 rounded-t-3xl shadow-[0_6px_0px_#92400e] relative flex flex-col justify-end p-2 z-20 border-2 border-amber-600">
                    <div className="flex items-center justify-around mb-1">
                      <span className="text-[20px]">🎨</span>
                      <span className="text-[18px]">🖌️</span>
                      <span className="text-[18px]">✨</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-900 text-center">Stół warsztatowy plastyki</span>
                  </div>
                </div>

                {/* Right: Musical Piano & Puppet Theatre */}
                <div className="w-1/2 flex flex-col items-center relative pl-2">
                  <div className="absolute -top-34 right-2 w-32 bg-red-600 rounded-2xl shadow-[0_5px_0px_#991b1b] p-1.5 border-2 border-yellow-400 z-30 flex flex-col items-center">
                    <div className="text-[9px] font-bold text-yellow-200 uppercase tracking-wider mb-0.5">Teatrzyk Kukiełek</div>
                    <div className="w-full h-12 bg-indigo-950 rounded-xl flex items-center justify-around">
                      <span className="text-[20px] animate-bounce">🎭</span>
                      <span className="text-[18px]">🎪</span>
                    </div>
                  </div>

                  <div className="w-full max-w-[170px] h-20 bg-slate-900 rounded-2xl shadow-[0_6px_0px_#0f172a] relative flex flex-col justify-between p-1.5 z-20 border-2 border-slate-700">
                    <div className="text-[9px] font-bold text-yellow-300 text-center">Pianinko (zagraj nutki! 🎵)</div>
                    <div className="grid grid-cols-7 gap-0.5 h-10 w-full">
                      {pianoNotes.map((pn) => {
                        const isHit = activePianoKey === pn.key;
                        return (
                          <button
                            key={pn.key}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePianoPlay(pn);
                            }}
                            className={`rounded-b-md flex flex-col items-center justify-end pb-1 font-bold text-[9px] transition-all active:scale-95 ${
                              isHit ? `${pn.color} text-white scale-95` : 'bg-white text-slate-800 hover:bg-slate-100'
                            }`}
                          >
                            <span>{pn.note}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= BŁĘKITNA PLAŻA I LATARNIA ================= */}
            {activeRoomId === 'beach' && (
              <div className="w-full flex items-end justify-between">
                {/* Left: Ocean Waves & Dolphin */}
                <div className="w-1/2 flex flex-col items-center relative pr-2">
                  <div
                    onClick={handleDolphinClick}
                    className="absolute -top-34 left-2 flex flex-col items-center cursor-pointer group active:scale-95 transition-transform z-30"
                    title="Dotknij delfinka, by wyskoczył z wody!"
                  >
                    <div className="bg-surface-container-lowest/90 px-2 py-0.5 rounded-full shadow-xs text-[10px] font-bold text-cyan-600 mb-1 border border-outline-variant/30 flex items-center gap-1">
                      <span>Delfinek w Falach</span>
                      <span className="material-symbols-outlined text-[12px]">water</span>
                    </div>
                    <div className="w-28 h-24 rounded-2xl bg-gradient-to-b from-sky-400 to-cyan-600 border-2 border-white shadow-md p-1.5 flex flex-col items-center justify-between relative overflow-hidden">
                      <div className={`transition-all duration-500 text-[32px] ${dolphinJumping ? '-translate-y-3 scale-110' : ''}`}>
                        🐬
                      </div>
                      <div className="w-full flex items-center justify-around text-white text-[12px]">
                        <span>🌊</span>
                        <span>💦</span>
                        <span>🌊</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-[170px] h-20 bg-sky-200 rounded-t-3xl shadow-[0_6px_0px_#0284c7] relative flex flex-col justify-end p-2 z-20 border-2 border-sky-400">
                    <div className="flex items-center justify-around mb-1">
                      <span className="text-[24px]">🏮</span>
                      <span className="text-[18px]">🐚</span>
                      <span className="text-[18px]">⛵</span>
                    </div>
                    <span className="text-[10px] font-bold text-sky-900 text-center">Latarnia Morska</span>
                  </div>
                </div>

                {/* Right: Beach Ball & Sandcastle */}
                <div className="w-1/2 flex flex-col items-center relative pl-2">
                  <div
                    onClick={handleBeachBallClick}
                    className={`absolute -top-32 right-3 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-sky-400 border-2 border-white shadow-md flex items-center justify-center cursor-pointer active:scale-95 transition-transform z-30 ${
                      beachBallBouncing ? 'animate-bounce' : ''
                    }`}
                    title="Piłka plażowa (dotknij by odbić!)"
                  >
                    <span className="text-[20px]">⚽</span>
                  </div>

                  <div
                    onClick={handleBeachCastleClick}
                    className="w-full max-w-[160px] h-20 bg-amber-300 rounded-2xl shadow-[0_6px_0px_#d97706] relative flex flex-col justify-center items-center p-2 z-20 border-2 border-amber-500 cursor-pointer active:scale-95 transition-transform"
                    title="Zamek plażowy (dotknij by rozbudować!)"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[26px]">
                        {beachCastleLevel === 1 ? '🏖️' : beachCastleLevel === 2 ? '🏰' : '👑🏰'}
                      </span>
                      <span className="text-[22px]">⛱️</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-950 mt-0.5">
                      Zamek z Muszelek (Poz. {beachCastleLevel})
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Themed Floor with Pet Nook across ALL rooms */}
          <div className={`h-11 w-full border-t-4 relative flex items-center justify-between px-3 z-20 shadow-inner ${
            activeRoomId === 'apartment'
              ? 'bg-amber-800/40 border-amber-900/30'
              : activeRoomId === 'playground'
              ? 'bg-emerald-600/60 border-emerald-700/40'
              : activeRoomId === 'bakery'
              ? 'bg-pink-100 border-pink-300/60'
              : activeRoomId === 'artSchool'
              ? 'bg-amber-900/50 border-amber-950/40'
              : 'bg-amber-200 border-amber-300/60'
          }`}>
            <div className="flex-1 flex justify-around opacity-40 text-on-surface text-[12px] font-mono select-none">
              {activeRoomId === 'playground' ? (
                <><span>🌱</span><span>🌸</span><span>🌿</span><span>🌼</span><span>🌱</span></>
              ) : activeRoomId === 'beach' ? (
                <><span>🐚</span><span>𓇼</span><span>🏖️</span><span>𓇼</span><span>🐚</span></>
              ) : activeRoomId === 'bakery' ? (
                <><span>🧁</span><span>🍩</span><span>🍰</span><span>🧁</span><span>🍪</span></>
              ) : activeRoomId === 'artSchool' ? (
                <><span>🎨</span><span>✏️</span><span>📐</span><span>🖌️</span><span>🎭</span></>
              ) : (
                <><span>///</span><span>\\\</span><span>///</span><span>\\\</span><span>///</span></>
              )}
            </div>

            {/* Interactive Pet Nook - Active across ALL rooms! */}
            <div className="flex items-center gap-2 z-30 -mt-6">
              {/* Pet Bed */}
              <div
                onClick={() => {
                  sound.playPetSound('purr');
                  setActiveSpeech('Cieplutkie legowisko dla pupili! 🐾');
                  setTimeout(() => setActiveSpeech(null), 2200);
                }}
                title="Legowisko dla pupili"
                className="w-12 h-7 rounded-full bg-amber-200 shadow-sm border-2 border-amber-400/60 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              >
                <span className="text-[12px]">🐾</span>
              </div>

              {/* Feeding Bowl */}
              <div
                onClick={handlePetBowlClick}
                title="Miseczka dla zwierząt (dotknij, aby napełnić!)"
                className="w-8 h-6 rounded-full bg-secondary-container shadow-sm border border-secondary/40 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
              >
                <span className="text-[11px]">{petBowlFull ? '🥛' : '🥣'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Placed Characters & Toys on Stage */}
        {placedEntities.map((entity) => {
          const char = entity.type === 'character'
            ? characters.find(c => c.id === entity.dataId) ||
              PRESET_CHARACTERS.find(c => c.id === entity.dataId) || {
                id: entity.dataId,
                name: entity.name,
                role: 'Przyjaciel',
                skinColor: '#f9c9b0',
                hairStyle: 'buns' as const,
                hairColor: '#b388ff',
                eyeType: 'big-sparkle' as const,
                mouthType: 'joy-open' as const,
                outfit: 'sweater' as const,
                outfitColor: '#ffea79',
                hat: 'cat-ears' as const,
                glasses: 'none' as const,
                currentEmotion: 'Radość' as const
              }
            : null;

          return (
            <div
              key={entity.id}
              style={{ left: `${entity.x}%`, top: `${entity.y}%` }}
              onPointerDown={(e) => {
                e.stopPropagation();
                try {
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                } catch {
                  // ignore
                }
                setDraggingEntityId(entity.id);
              }}
              onClick={() => {
                sound.playBoing();
                if (entity.speech) {
                  setActiveSpeech(`${entity.name}: ${entity.speech}`);
                  setTimeout(() => setActiveSpeech(null), 2500);
                } else if (char) {
                  const phrases = [
                    `${char.name}: Cześć! Pobawmy się! ✨`,
                    `${char.name}: Uwielbiam ten pokój! 💖`,
                    `${char.name}: Kiddo to najlepszy świat! 🎒`,
                    `${char.name}: Spójrz na moje ubranko! 🌟`
                  ];
                  const quote = phrases[Math.floor(Math.random() * phrases.length)];
                  setActiveSpeech(quote);
                  setTimeout(() => setActiveSpeech(null), 2500);
                }
              }}
              className="absolute z-35 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-grab active:cursor-grabbing touch-none select-none"
            >
              {/* Delete / Put away badge on hover or tap */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playPop(380);
                  removeEntity(entity.id);
                }}
                title={`Schowaj ${entity.name}`}
                className="opacity-0 group-hover:opacity-100 absolute -top-3 -right-3 w-6 h-6 bg-error text-white rounded-full text-[10px] flex items-center justify-center shadow-md z-40 transition-opacity active:scale-90"
              >
                ✕
              </button>

              {entity.type === 'character' && char ? (
                <div className="flex flex-col items-center">
                  <CharacterAvatar
                    character={char}
                    size="room"
                    isWaving={true}
                    actionAnimation={globalCharacterAction}
                    showReactionBubble={activeSpeech?.startsWith(`${entity.name}:`)}
                    reactionText={entity.speech}
                  />
                  {/* Floating Character Name Tag with emotion icon */}
                  <div className="mt-0.5 px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs shadow-md border border-outline-variant/30 text-[11px] font-extrabold text-on-surface flex items-center gap-1">
                    <span>{char.name}</span>
                    <span className="text-[12px]">
                      {char.currentEmotion === 'Radość'
                        ? '✨'
                        : char.currentEmotion === 'Śmiech'
                        ? '😄'
                        : char.currentEmotion === 'Śpiew'
                        ? '🎵'
                        : char.currentEmotion === 'Sen'
                        ? '💤'
                        : char.currentEmotion === 'Złość'
                        ? '😤'
                        : '💖'}
                    </span>
                  </div>

                  {/* Friend Interaction Trigger Button when other characters are on stage */}
                  {(() => {
                    const otherChars = placedEntities.filter(e => e.type === 'character' && e.id !== entity.id);
                    if (otherChars.length === 0) return null;
                    return (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playSparkle();
                          // find closest other character on stage
                          const closest = otherChars.reduce((prev, curr) => {
                            const dPrev = Math.hypot(prev.x - entity.x, prev.y - entity.y);
                            const dCurr = Math.hypot(curr.x - entity.x, curr.y - entity.y);
                            return dCurr < dPrev ? curr : prev;
                          }, otherChars[0]);

                          setActiveFriendshipPair({
                            char1: { id: entity.dataId, name: entity.name },
                            char2: { id: closest.dataId, name: closest.name }
                          });
                        }}
                        className="mt-1 px-2 py-0.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-black text-[10px] flex items-center gap-1 shadow-sm active:scale-90 transition-transform cursor-pointer border border-white"
                        title="Baw się ze znajomym: przybij piątkę, przytul lub zatańcz!"
                      >
                        <span>💕</span>
                        <span>Znajomi</span>
                      </button>
                    );
                  })()}

                  {/* Friend Interaction Popover Bubble */}
                  {activeFriendshipPair?.char1.id === entity.dataId && (
                    <FriendInteractionBubble
                      char1Name={activeFriendshipPair.char1.name}
                      char1Id={activeFriendshipPair.char1.id}
                      char2Name={activeFriendshipPair.char2.name}
                      char2Id={activeFriendshipPair.char2.id}
                      onPerformAction={(speech) => {
                        setActiveSpeech(speech);
                        setTimeout(() => setActiveSpeech(null), 3500);
                      }}
                      onClose={() => setActiveFriendshipPair(null)}
                    />
                  )}
                </div>
              ) : entity.type === 'toy' ? (
                <div className="p-2 bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/30 animate-bounce">
                  <span className="font-bold text-[12px] text-primary">{entity.name}</span>
                </div>
              ) : null}
            </div>
          );
        })}

        {/* Dynamic Adopted Pets on Stage */}
        {adoptedPets.filter(p => p.isInRoom).map((pet) => {
          const accompanyingChar = characters.find(c => c.id === pet.assignedCharacterId);
          return (
            <div
              key={pet.id}
              id={`stage-pet-${pet.id}`}
              style={{ left: `${pet.x}%`, top: `${pet.y}%` }}
              onPointerDown={(e) => handlePetPointerDown(e, pet.id)}
              onClick={(e) => {
                e.stopPropagation();
                sound.playPetSound(pet.soundType);
                setSelectedPetForAction(pet);
              }}
              title={`${pet.name} (${accompanyingChar ? `Towarzysz: ${accompanyingChar.name}` : 'Biega sam'}) - Dotknij by pogłaskać lub przeciągnij!`}
              className="absolute z-36 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-grab active:cursor-grabbing touch-none select-none"
            >
              {/* Pet Dismiss button on hover / tap */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  sound.playPop(420);
                  handleRemovePetFromRoom(pet.id);
                  setActiveSpeech(`${pet.name} poszedł odpocząć do domku 💤`);
                  setTimeout(() => setActiveSpeech(null), 2000);
                }}
                title="Schowaj pupila do legowiska"
                className="opacity-0 group-hover:opacity-100 absolute -top-3 -right-2 w-6 h-6 bg-secondary text-white rounded-full text-[10px] flex items-center justify-center shadow-md z-40 transition-opacity"
              >
                💤
              </button>

              <PetSprite
                pet={pet}
                accompanyingCharacter={accompanyingChar}
                size="md"
                isInteracting={activeSpeech?.includes(pet.name)}
              />
            </div>
          );
        })}

        {/* Global Speech Banner */}
        {activeSpeech && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 bg-white/95 px-4 py-1.5 rounded-full shadow-lg border-2 border-primary text-[14px] font-bold text-on-surface flex items-center gap-1.5 animate-bounce">
            <span className="material-symbols-outlined text-primary text-[18px]">chat_bubble</span>
            <span>{activeSpeech}</span>
          </div>
        )}

        {/* Friendship Party Animated Celebration Overlay */}
        {partyActive && (
          <div className="absolute inset-0 z-45 pointer-events-none overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-pink-500/15 backdrop-blur-[1px] animate-pulse" />
            <div className="text-[32px] sm:text-[40px] animate-bounce drop-shadow-md z-10 flex gap-2">
              <span>🎈</span>
              <span>🎉</span>
              <span>💃</span>
              <span>🥳</span>
              <span>✨</span>
              <span>🧁</span>
              <span>🎈</span>
            </div>
            <div className="mt-2 bg-white/95 px-4 py-1 rounded-full text-pink-700 font-black text-[13px] shadow-lg border-2 border-pink-400 z-10 animate-pulse">
              🎉 Wielka Impreza Przyjaciół w Pokoju! 🎉
            </div>
          </div>
        )}
      </div>

      {/* Quick Stickers & Props Carousel Strip */}
      <div className="px-6 mt-3 flex items-center justify-between gap-2 overflow-x-auto py-1 no-scrollbar">
        <span className="font-bold text-[14px] text-on-surface-variant flex items-center gap-1 shrink-0">
          <span className="material-symbols-outlined text-primary text-[18px]">magic_button</span> Przeciągnij do pokoju:
        </span>

        <div className="flex items-center gap-2">
          {TOY_PROPS.slice(0, 6).map((toy) => (
            <button
              key={toy.id}
              type="button"
              onClick={() => spawnEntity('toy', toy.id, toy.name)}
              title={toy.name}
              className="w-12 h-12 rounded-2xl bg-surface-container-lowest p-1.5 flex items-center justify-center shadow-[0_4px_0px_#dbdad4] active:translate-y-1 active:shadow-[0_1px_0px_#dbdad4] transition-all border border-outline-variant/30 hover:scale-105"
            >
              <span className={`material-symbols-outlined text-[26px] ${toy.colorText}`}>
                {toy.iconName}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Expandable Bottom Drawer: Pets, Characters & Toys */}
      <div className="mt-3 px-3 sm:px-3.5">
        <div
          onClick={() => {
            sound.playPop();
            setDrawerOpen(prev => !prev);
          }}
          className="w-full bg-surface-container rounded-3xl p-3.5 shadow-md cursor-pointer border-2 border-outline-variant/30"
        >
          {/* Drawer Handle */}
          <div className="flex flex-col items-center justify-center mb-2">
            <div className="w-14 h-1.5 bg-outline-variant rounded-full mb-1.5"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
                <span className="material-symbols-outlined text-[16px]">
                  {drawerOpen ? 'expand_more' : 'expand_less'}
                </span>
              </div>
              <span className="font-bold text-[18px] text-on-surface">Zwierzaki, Postacie i Zabawki</span>
              <span className="bg-secondary-fixed text-on-secondary-fixed font-bold text-[12px] px-2.5 py-0.5 rounded-full border border-secondary/20">
                {adoptedPets.length + characters.length + TOY_PROPS.length} gotowych
              </span>
            </div>
            <span className="text-[13px] text-on-surface-variant font-medium mt-0.5">
              Dotknij, aby wyjąć przyjaciół, pupili i zabawki do pokoju
            </span>

            {/* Filter category pills */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar max-w-full" onClick={e => e.stopPropagation()}>
              {[
                { id: 'all', label: 'Wszystko' },
                { id: 'furniture', label: `🛋️ Meble (${furnitureItems.filter(f => f.isInRoom).length}/${furnitureItems.length})` },
                { id: 'pets', label: `🐾 Zwierzaki (${adoptedPets.length})` },
                { id: 'characters', label: `👤 Postacie (${characters.length})` },
                { id: 'toys', label: `🧸 Zabawki (${TOY_PROPS.length})` }
              ].map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    sound.playPop(520);
                    setDrawerFilter(f.id as typeof drawerFilter);
                  }}
                  className={`px-3 py-1 rounded-full font-bold text-[11px] whitespace-nowrap transition-all ${
                    drawerFilter === f.id
                      ? 'bg-primary text-on-primary shadow-xs'
                      : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tray content */}
          <div className="flex items-center gap-3 overflow-x-auto py-2 no-scrollbar" onClick={e => e.stopPropagation()}>
            {/* 1. PETS SECTION */}
            {(drawerFilter === 'all' || drawerFilter === 'pets') && (
              <>
                {/* Adopt New Pet Button */}
                <div className="flex flex-col items-center shrink-0">
                  <button
                    type="button"
                    aria-label="Adoptuj nowego zwierzaka"
                    onClick={() => {
                      sound.playPetSound('meow');
                      setShowAdoptModal(true);
                    }}
                    className="w-16 h-16 rounded-2xl bg-secondary-container/50 border-dashed border-2 border-secondary flex flex-col items-center justify-center text-secondary active:scale-95 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[24px]">pets</span>
                    <span className="text-[10px] font-bold">+Adoptuj</span>
                  </button>
                  <span className="font-bold text-[11px] text-secondary mt-1">Adoptuj</span>
                </div>

                {/* Adopted Pets */}
                {adoptedPets.map((pet) => {
                  const char = characters.find(c => c.id === pet.assignedCharacterId);
                  return (
                    <div key={pet.id} className="flex flex-col items-center shrink-0">
                      <div
                        onClick={() => {
                          if (!pet.isInRoom) {
                            handleTogglePetInRoom(pet.id);
                          } else {
                            sound.playPetSound(pet.soundType);
                            setSelectedPetForAction(pet);
                          }
                        }}
                        title={pet.isInRoom ? `${pet.name} jest w pokoju (dotknij menu)` : `${pet.name} odpoczywa (dotknij by wezwać)`}
                        className={`w-16 h-16 rounded-2xl p-1 shadow-[0_4px_0px_#dbdad4] flex flex-col items-center justify-center active:scale-95 transition-transform cursor-pointer border relative ${
                          pet.isInRoom
                            ? 'bg-surface-container-lowest border-primary ring-2 ring-primary/30'
                            : 'bg-surface-container-high border-outline-variant/40 opacity-70'
                        }`}
                      >
                        <PetSprite pet={pet} accompanyingCharacter={char} size="sm" showCompanionBadge={false} />
                        {pet.isInRoom ? (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold shadow-xs">
                            ✓
                          </span>
                        ) : (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-surface-variant text-[9px] flex items-center justify-center">
                            💤
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-[11px] text-on-surface mt-1 truncate max-w-[68px]">
                        {pet.name}
                      </span>
                    </div>
                  );
                })}
              </>
            )}

            {/* 2. CHARACTERS SECTION */}
            {(drawerFilter === 'all' || drawerFilter === 'characters') && (
              <>
                {/* Create New Character Button */}
                <div className="flex flex-col items-center shrink-0">
                  <button
                    type="button"
                    aria-label="Stwórz nową postać"
                    onClick={() => onNavigate('character-maker')}
                    className="w-16 h-16 rounded-2xl bg-surface-container-highest border-dashed border-2 border-primary flex flex-col items-center justify-center text-primary active:scale-95 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[28px]">add</span>
                  </button>
                  <span className="font-bold text-[12px] text-on-surface mt-1">Stwórz</span>
                </div>

                {/* Spawnable Characters */}
                {characters.map((char) => (
                  <div key={char.id} className="flex flex-col items-center shrink-0">
                    <div
                      onClick={() => spawnEntity('character', char.id, char.name)}
                      className="w-16 h-16 rounded-2xl bg-surface-container-lowest p-1 shadow-[0_4px_0px_#dbdad4] flex items-center justify-center active:scale-95 transition-transform cursor-pointer border border-outline-variant/30 hover:border-primary"
                    >
                      {char.avatarUrl ? (
                        <img src={char.avatarUrl} alt={char.name} className="w-12 h-12 object-contain rounded-full" />
                      ) : (
                        <CharacterAvatar character={char} size="sm" isWaving={false} />
                      )}
                    </div>
                    <span className="font-bold text-[12px] text-on-surface mt-1 truncate max-w-[68px]">
                      {char.name}
                    </span>
                  </div>
                ))}
              </>
            )}

            {/* 3. TOYS SECTION */}
            {(drawerFilter === 'all' || drawerFilter === 'toys') && (
              <>
                {TOY_PROPS.map((toy) => (
                  <div key={toy.id} className="flex flex-col items-center shrink-0">
                    <div
                      onClick={() => spawnEntity('toy', toy.id, toy.name)}
                      className="w-16 h-16 rounded-2xl bg-surface-container-lowest p-1 shadow-[0_4px_0px_#dbdad4] flex items-center justify-center active:scale-95 transition-transform cursor-pointer border border-outline-variant/30 hover:border-secondary"
                    >
                      <span className={`material-symbols-outlined text-[32px] ${toy.colorText}`}>
                        {toy.iconName}
                      </span>
                    </div>
                    <span className="font-bold text-[12px] text-on-surface mt-1 truncate max-w-[68px]">
                      {toy.name}
                    </span>
                  </div>
                ))}
              </>
            )}

            {/* 4. DOLLHOUSE FURNITURE SECTION */}
            {(drawerFilter === 'all' || drawerFilter === 'furniture') && (
              <>
                {/* Reset Layout Button */}
                <div className="flex flex-col items-center shrink-0">
                  <button
                    type="button"
                    onClick={handleResetFurnitureLayout}
                    title="Przywróć początkowy układ i kolory mebli"
                    className="w-16 h-16 rounded-2xl bg-tertiary-container/60 border-dashed border-2 border-tertiary flex flex-col items-center justify-center text-on-tertiary-container active:scale-95 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[24px]">restart_alt</span>
                    <span className="text-[10px] font-bold">Przywróć</span>
                  </button>
                  <span className="font-bold text-[11px] text-tertiary mt-1">Reset</span>
                </div>

                {furnitureItems.map((item) => (
                  <div key={item.id} className="flex flex-col items-center shrink-0">
                    <div
                      onClick={() => handleToggleFurnitureInRoom(item.id)}
                      style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
                      className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 relative shadow-sm ${
                        item.isInRoom ? 'ring-2 ring-primary scale-105' : 'opacity-65'
                      }`}
                      title={item.isInRoom ? `${item.name} (${item.colorName}) jest w pokoju - kliknij by schować` : `Kliknij, aby dodać ${item.name} do pokoju`}
                    >
                      <span className="text-[22px]">
                        {item.type === 'sofa'
                          ? '🛋️'
                          : item.type === 'table'
                          ? '🪑'
                          : item.type === 'fridge'
                          ? '🧊'
                          : item.type === 'tv'
                          ? '📺'
                          : item.type === 'rug'
                          ? '🧶'
                          : item.type === 'bed'
                          ? '🛏️'
                          : item.type === 'armchair'
                          ? '🪑'
                          : item.type === 'lamp'
                          ? '💡'
                          : '🪴'}
                      </span>
                      <span className="text-[9px] font-bold text-center px-1 truncate w-full text-on-surface">
                        {item.isInRoom ? 'W pokoju' : '+Dodaj'}
                      </span>
                      {item.isInRoom && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-bold shadow-xs">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-[11px] text-on-surface mt-1 truncate max-w-[70px] text-center">
                      {item.name}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Camera Flash Animation */}
      {cameraFlash && (
        <div className="fixed inset-0 bg-white pointer-events-none z-50 transition-opacity duration-200 opacity-90 animate-ping"></div>
      )}

      {/* Adopt a Pet Modal */}
      <AdoptPetModal
        characters={characters}
        isOpen={showAdoptModal}
        onClose={() => setShowAdoptModal(false)}
        onAdoptPet={handleAdoptPet}
      />

      {/* Pet Action Sheet */}
      <PetActionSheet
        pet={selectedPetForAction}
        characters={characters}
        isOpen={Boolean(selectedPetForAction)}
        onClose={() => setSelectedPetForAction(null)}
        onUpdatePet={handleUpdatePet}
        onRemoveFromRoom={handleRemovePetFromRoom}
        onTriggerSpeech={(text) => {
          setActiveSpeech(text);
          setTimeout(() => setActiveSpeech(null), 3000);
        }}
      />

      {/* Snapshot Photos Album Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-3xl p-5 max-w-md w-full shadow-2xl border-4 border-primary flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[28px]">photo_library</span>
                <span className="font-bold text-[20px] text-on-surface">Album Pamiątek</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="w-10 h-10 rounded-full bg-surface-container-high text-on-surface font-bold flex items-center justify-center active:scale-95"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
              {photos.length === 0 ? (
                <p className="text-center text-on-surface-variant py-8 font-semibold">
                  Jeszcze nie zrobiono zdjęć. Użyj przycisku &quot;Pstryk!&quot;, aby uchwycić wspomnienia!
                </p>
              ) : (
                photos.slice(0, 10).map((photo) => (
                  <div
                    key={photo.id}
                    className="p-2.5 bg-surface-container rounded-2xl flex items-center justify-between border border-outline-variant/30 gap-2"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-14 h-11 rounded-xl bg-surface-container-highest overflow-hidden shrink-0 border border-white shadow-xs">
                        {photo.imageUrl || photo.thumbnailUrl ? (
                          <img
                            src={photo.imageUrl || photo.thumbnailUrl}
                            alt={photo.caption}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[20px]">camera</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[13px] text-on-surface truncate">{photo.roomName}</div>
                        <div className="text-[11px] text-on-surface-variant font-medium">Godzina: {photo.timestamp}</div>
                      </div>
                    </div>
                    <span className="text-[18px] shrink-0">{photo.emoji || '📸'}</span>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playSparkle();
                setShowPhotoModal(false);
                onNavigate('backpack-drawer');
              }}
              className="w-full py-2.5 px-4 rounded-full bg-primary text-on-primary font-bold text-[13px] flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">collections</span>
              <span>Otwórz Galerię w Plecaku 🎒</span>
            </button>
          </div>
        </div>
      )}

      {/* Friendship & Mailbox Modal */}
      <FriendshipManagerModal
        isOpen={showFriendshipModal}
        onClose={() => setShowFriendshipModal(false)}
        onInviteToRoom={handleInviteFriendToRoom}
        onStartParty={handleStartFriendshipParty}
        onAcceptMeeting={(roomId, friendId, friendName, activityName) => {
          if (roomId && roomId !== activeRoomId) {
            onRoomChange(roomId);
          }
        }}
      />
    </div>
  );
};
