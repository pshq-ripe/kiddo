import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CharacterItem, CharacterActionAnimation, EmotionType } from '../types';
import { sound } from '../utils/sound';
import { CharacterAvatar } from './CharacterAvatar';
import { unlockAchievement } from '../utils/achievementManager';
import { addJournalEntry } from '../utils/journalManager';
import {
  SKIN_SWATCHES,
  HAIR_SWATCHES,
  OUTFIT_SWATCHES,
  EMOTIONS_LIST
} from '../data/kiddoData';

interface CharacterMakerProps {
  onSaveCharacter: (char: CharacterItem) => void;
}

type MakerCategory = 'skin' | 'hair' | 'face' | 'outfits' | 'hats' | 'accessories';

export const CharacterMaker: React.FC<CharacterMakerProps> = ({ onSaveCharacter }) => {
  const [character, setCharacter] = useState<CharacterItem>({
    id: 'custom-' + Date.now(),
    name: 'Własny Przyjaciel',
    role: 'Stworzony Bohater',
    isCustom: true,
    skinColor: '#f9c9b0',
    hairStyle: 'buns',
    hairColor: '#785a00',
    eyeType: 'big-sparkle',
    mouthType: 'joy-open',
    outfit: 'dino',
    outfitColor: '#006a62',
    hat: 'cat-ears',
    glasses: 'heart',
    currentEmotion: 'Ekscytacja'
  });

  const [activeCategory, setActiveCategory] = useState<MakerCategory>('face');
  const [showToast, setShowToast] = useState(false);
  const [charName, setCharName] = useState('Puszek');
  const [stageRotated, setStageRotated] = useState(false);

  // Animated reaction states
  const [activeActionAnimation, setActiveActionAnimation] = useState<CharacterActionAnimation>('idle');
  const [isActionLooping, setIsActionLooping] = useState<boolean>(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSmiling, setIsSmiling] = useState(false);
  const [particles, setParticles] = useState<{ id: number; emoji: string; x: number; y: number }[]>([]);
  const [reactionNotice, setReactionNotice] = useState<string | null>(null);

  // Trigger interactive eye blinking
  const triggerBlink = () => {
    sound.playPop(540);
    setIsBlinking(true);
    setReactionNotice('Mrugnięcie! 😉');
    setTimeout(() => setIsBlinking(false), 520);
    setTimeout(() => setReactionNotice(null), 1800);
  };

  // Trigger interactive beaming smile with particle burst
  const triggerSmile = () => {
    sound.playBoing();
    setIsSmiling(true);
    setReactionNotice('Cudowny uśmiech! 😄');
    const emojis = ['✨', '💖', '😄', '⭐', '🌸', '🎶', '🎀'];
    const burst = Array.from({ length: 7 }, (_, i) => ({
      id: Date.now() + i,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      x: (Math.random() - 0.5) * 130,
      y: -25 - Math.random() * 55
    }));
    setParticles(burst);
    setTimeout(() => {
      setIsSmiling(false);
      setParticles([]);
    }, 1000);
    setTimeout(() => setReactionNotice(null), 1800);
  };

  // Trigger joy jumping (e.g. after receiving a calendar gift)
  const triggerJoyJumping = (customText?: string) => {
    sound.playFanfare();
    setActiveActionAnimation('jump-joy');
    setReactionNotice(customText || 'Hura! Skaczę z radości z prezentu w kalendarzu! 🎁🎉');
    try {
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#FF6B8B', '#FFD166', '#06D6A0', '#118AB2']
      });
    } catch {
      // ignore
    }

    const emojis = ['🎁', '⭐', '✨', '🎈', '💖', '🪙', '🎉'];
    const burst = emojis.map((emoji, i) => ({
      id: Date.now() + i,
      emoji,
      x: (Math.random() - 0.5) * 160,
      y: -35 - Math.random() * 60
    }));
    setParticles(burst);

    if (!isActionLooping) {
      setTimeout(() => {
        setActiveActionAnimation('idle');
        setParticles([]);
      }, 2600);
      setTimeout(() => setReactionNotice(null), 3400);
    }
  };

  // Trigger dance
  const triggerDance = () => {
    sound.playFanfare();
    setActiveActionAnimation('dance');
    setReactionNotice('Taniec imprezowy! 💃🎶');
    const emojis = ['🎵', '🎶', '💃', '✨', '🎉'];
    const burst = emojis.map((emoji, i) => ({
      id: Date.now() + i,
      emoji,
      x: (Math.random() - 0.5) * 150,
      y: -30 - Math.random() * 50
    }));
    setParticles(burst);

    if (!isActionLooping) {
      setTimeout(() => {
        setActiveActionAnimation('idle');
        setParticles([]);
      }, 2400);
      setTimeout(() => setReactionNotice(null), 3000);
    }
  };

  // Trigger specific game event reaction
  const triggerGameEventReaction = (
    eventType: 'calendar-gift' | 'invitation' | 'achievement' | 'snack' | 'weather'
  ) => {
    if (eventType === 'calendar-gift') {
      triggerJoyJumping('Hura! Otrzymano prezent z kalendarza przygód! 🎁✨');
    } else if (eventType === 'invitation') {
      sound.playSparkle();
      setActiveActionAnimation('heart-burst');
      setReactionNotice('List i zaproszenie do pokoju od przyjaciela! 💌💕');
      const emojis = ['💌', '💖', '💕', '🥰', '🌸'];
      const burst = emojis.map((emoji, i) => ({
        id: Date.now() + i,
        emoji,
        x: (Math.random() - 0.5) * 140,
        y: -35 - Math.random() * 50
      }));
      setParticles(burst);
      setTimeout(() => {
        if (!isActionLooping) setActiveActionAnimation('idle');
        setParticles([]);
      }, 2200);
      setTimeout(() => setReactionNotice(null), 3000);
    } else if (eventType === 'achievement') {
      sound.playFanfare();
      setActiveActionAnimation('dance');
      setReactionNotice('Taniec zwycięstwa! Zdobyto nową odznakę w grze! 🏆✨');
      const emojis = ['🏆', '🌟', '✨', '🎉', '👑'];
      const burst = emojis.map((emoji, i) => ({
        id: Date.now() + i,
        emoji,
        x: (Math.random() - 0.5) * 150,
        y: -35 - Math.random() * 50
      }));
      setParticles(burst);
      setTimeout(() => {
        if (!isActionLooping) setActiveActionAnimation('idle');
        setParticles([]);
      }, 2400);
      setTimeout(() => setReactionNotice(null), 3200);
    } else if (eventType === 'snack') {
      sound.playBoing();
      setActiveActionAnimation('wiggle');
      setReactionNotice('Mniam! Pyszna babeczka i smakołyk! 🧁😋');
      const emojis = ['🧁', '🍓', '🍰', '🍪', '😋'];
      const burst = emojis.map((emoji, i) => ({
        id: Date.now() + i,
        emoji,
        x: (Math.random() - 0.5) * 130,
        y: -30 - Math.random() * 45
      }));
      setParticles(burst);
      setTimeout(() => {
        if (!isActionLooping) setActiveActionAnimation('idle');
        setParticles([]);
      }, 1800);
      setTimeout(() => setReactionNotice(null), 2600);
    } else if (eventType === 'weather') {
      sound.playSparkle();
      setActiveActionAnimation('surprise');
      setReactionNotice('Ooooch! Spójrz, jak piękna tęcza na niebie! 🌈✨');
      const emojis = ['🌈', '☀️', '⭐', '✨', '🌧️'];
      const burst = emojis.map((emoji, i) => ({
        id: Date.now() + i,
        emoji,
        x: (Math.random() - 0.5) * 140,
        y: -35 - Math.random() * 50
      }));
      setParticles(burst);
      setTimeout(() => {
        if (!isActionLooping) setActiveActionAnimation('idle');
        setParticles([]);
      }, 1800);
      setTimeout(() => setReactionNotice(null), 2600);
    }
  };

  // Handle emotion selection
  const handleSelectEmotion = (emoName: EmotionType) => {
    sound.playSparkle();
    const found = EMOTIONS_LIST.find(e => e.name === emoName);
    setCharacter(p => ({ ...p, currentEmotion: emoName }));

    if (found) {
      setActiveActionAnimation(found.defaultAction);
      setReactionNotice(`${emoName}: ${found.quote}`);

      const emojis = [found.reaction, '✨', '⭐', '🎈'];
      const burst = emojis.map((emoji, i) => ({
        id: Date.now() + i,
        emoji,
        x: (Math.random() - 0.5) * 130,
        y: -30 - Math.random() * 45
      }));
      setParticles(burst);

      if (!isActionLooping) {
        setTimeout(() => {
          setActiveActionAnimation('idle');
          setParticles([]);
        }, 2200);
        setTimeout(() => setReactionNotice(null), 3000);
      }
    }
  };

  // Category definitions
  const categories: { id: MakerCategory; label: string; icon: string }[] = [
    { id: 'face', label: 'Emocje & Reakcje', icon: 'mood' },
    { id: 'skin', label: 'Skóra', icon: 'palette' },
    { id: 'hair', label: 'Fryzury', icon: 'face_retouching_natural' },
    { id: 'outfits', label: 'Ubrania', icon: 'checkroom' },
    { id: 'hats', label: 'Czapki', icon: 'theater_comedy' },
    { id: 'accessories', label: 'Dodatki', icon: 'auto_awesome' }
  ];

  // Randomize look
  const handleRandomize = () => {
    sound.playBoing();
    setStageRotated(prev => !prev);

    const randomSkin = SKIN_SWATCHES[Math.floor(Math.random() * SKIN_SWATCHES.length)];
    const randomHair = HAIR_SWATCHES[Math.floor(Math.random() * HAIR_SWATCHES.length)];
    const randomOutfitCol = OUTFIT_SWATCHES[Math.floor(Math.random() * OUTFIT_SWATCHES.length)];

    const hairStyles: CharacterItem['hairStyle'][] = ['buns', 'braids', 'spiky', 'bob', 'curly', 'short'];
    const outfits: CharacterItem['outfit'][] = ['dino', 'strawberry', 'astronaut', 'dungarees', 'sweater', 'casual'];
    const hats: CharacterItem['hat'][] = ['cat-ears', 'beanie', 'crown', 'cap', 'none'];
    const glassesList: CharacterItem['glasses'][] = ['heart', 'round', 'star', 'none'];
    const emotions = EMOTIONS_LIST.map(e => e.name);
    const chosenEmotion = emotions[Math.floor(Math.random() * emotions.length)];

    setCharacter(prev => ({
      ...prev,
      skinColor: randomSkin,
      hairColor: randomHair,
      outfitColor: randomOutfitCol,
      hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)],
      outfit: outfits[Math.floor(Math.random() * outfits.length)],
      hat: hats[Math.floor(Math.random() * hats.length)],
      glasses: glassesList[Math.floor(Math.random() * glassesList.length)],
      currentEmotion: chosenEmotion
    }));

    handleSelectEmotion(chosenEmotion);
  };

  // Reset look
  const handleReset = () => {
    sound.playPop(420);
    setCharacter({
      id: 'custom-' + Date.now(),
      name: 'Własny Przyjaciel',
      role: 'Stworzony Bohater',
      isCustom: true,
      skinColor: '#f9c9b0',
      hairStyle: 'buns',
      hairColor: '#785a00',
      eyeType: 'big-sparkle',
      mouthType: 'joy-open',
      outfit: 'dino',
      outfitColor: '#006a62',
      hat: 'cat-ears',
      glasses: 'heart',
      currentEmotion: 'Ekscytacja'
    });
    setActiveActionAnimation('jump-joy');
    setTimeout(() => setActiveActionAnimation('idle'), 1600);
  };

  // Save character
  const handleSave = () => {
    sound.playSuccess();
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#FF6B8B', '#2EC4B6', '#FFD166', '#9B5DE5']
      });
    } catch {
      // ignore
    }

    const savedChar: CharacterItem = {
      ...character,
      id: 'char-' + Date.now(),
      name: charName.trim() || 'Super Przyjaciel'
    };

    onSaveCharacter(savedChar);
    unlockAchievement('fashion_stylist');

    addJournalEntry({
      title: `Stworzono nową postać: ${savedChar.name}! 👗✨`,
      note: `W Kreatorze Postaci zaprojektowano nową stylizację dla bohatera: ${savedChar.name} z emocją: ${savedChar.currentEmotion}.`,
      category: 'creativity',
      emoji: '✨',
      characterName: savedChar.name
    });

    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2800);
  };

  // Active swatches based on category
  const activeSwatches =
    activeCategory === 'hair'
      ? HAIR_SWATCHES
      : activeCategory === 'outfits'
      ? OUTFIT_SWATCHES
      : SKIN_SWATCHES;

  return (
    <div className="flex flex-col w-full pb-8 select-none">
      {/* Status & Unlimited Banner */}
      <div className="px-3.5 sm:px-4 pt-2 pb-3">
        <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-amber-400 text-white rounded-2xl p-3 flex items-center justify-between shadow-md border-2 border-white/20">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 shadow-inner text-[20px]">
              ⭐
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-black text-[15px] truncate leading-tight drop-shadow-xs">
                Kreator Postaci & Animowane Emocje!
              </span>
              <span className="text-[12px] text-white/95 truncate leading-tight font-bold">
                Nadawaj nastroje, testuj skakanie z radości i reakcje na zdarzenia!
              </span>
            </div>
          </div>
          <div className="shrink-0 bg-white/25 backdrop-blur-xs text-white px-3 py-1 rounded-full text-center shadow-xs">
            <span className="font-black text-[12px]">Nowe Reakcje 🌟</span>
          </div>
        </div>
      </div>

      {/* Stage Area: Interactive Character & Rotating Podium */}
      <div className="relative px-3.5 sm:px-4 flex flex-col items-center justify-center pt-2 pb-4">
        {/* Floating Quick Actions: Losuj & Reset */}
        <div className="absolute left-3.5 sm:left-4 top-2 z-20 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={handleRandomize}
            title="Losuj wygląd i emocję"
            className="w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex flex-col items-center justify-center shadow-md active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">casino</span>
          </button>
          <span className="font-extrabold text-[11px] text-on-surface">Losuj</span>
        </div>

        <div className="absolute right-3.5 sm:right-4 top-2 z-20 flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={handleReset}
            title="Resetuj wygląd"
            className="w-11 h-11 rounded-full bg-surface-container-highest text-on-surface flex flex-col items-center justify-center shadow-md active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[22px]">replay</span>
          </button>
          <span className="font-extrabold text-[11px] text-on-surface">Reset</span>
        </div>

        {/* Central Toy Stage */}
        <div className="relative w-64 h-64 flex flex-col items-center justify-end">
          {/* Ambient Sparkles */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary-fixed text-[32px] absolute top-2 left-6 animate-pulse">
              star
            </span>
            <span className="material-symbols-outlined text-primary-container text-[24px] absolute top-8 right-8 animate-bounce">
              auto_awesome
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px] absolute bottom-16 left-2 animate-pulse">
              favorite
            </span>
          </div>

          {/* Floating Reaction Notice Badge */}
          <AnimatePresence>
            {reactionNotice && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.85 }}
                transition={{ duration: 0.25 }}
                className="absolute -top-6 z-50 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-xs border-2 border-pink-400 shadow-xl text-[12px] font-black text-pink-700 flex items-center gap-1.5 text-center max-w-[280px]"
              >
                <span>{reactionNotice}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Cheerful Emoji Particles */}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.3, 1.4, 1.2, 0.6],
                  x: p.x,
                  y: p.y
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="absolute z-50 pointer-events-none text-[24px]"
                style={{ left: '50%', top: '30%' }}
              >
                {p.emoji}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Character Canvas with interactive animated physics */}
          <div
            className={`transition-transform duration-300 ${
              stageRotated ? 'scale-105' : 'scale-100'
            }`}
          >
            <CharacterAvatar
              character={character}
              size="stage"
              isWaving={true}
              showReactionBubble={!reactionNotice}
              isBlinking={isBlinking}
              isSmiling={isSmiling}
              actionAnimation={activeActionAnimation}
              loopAnimation={isActionLooping}
              interactive={true}
              onEyeClick={triggerBlink}
              onMouthClick={triggerSmile}
              onClick={() => {
                triggerJoyJumping();
              }}
            />
          </div>

          {/* 3D Rotating Rainbow Podium */}
          <div className="relative w-56 h-12 -mt-4 z-0 flex items-center justify-center">
            <div className="absolute inset-0 rounded-[50%] bg-tertiary-container shadow-[0_8px_0px_#785a00] flex items-center justify-center">
              <div className="w-[90%] h-[82%] rounded-[50%] bg-secondary-fixed flex items-center justify-center shadow-[inset_0_3px_0px_rgba(255,255,255,0.6)]">
                <div className="w-[84%] h-[75%] rounded-[50%] bg-primary-fixed flex items-center justify-center">
                  <div className="w-[78%] h-[68%] rounded-[50%] bg-surface-container-lowest flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary-container/50 text-[20px] animate-spin-slow">
                      cached
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reaction Buttons Under Podium */}
        <div className="mt-2.5 flex items-center justify-center gap-1.5 z-20 flex-wrap max-w-sm">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => triggerJoyJumping()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-400 text-amber-950 shadow-sm text-[12px] font-black cursor-pointer border border-amber-300 active:scale-95"
            title="Postać skacze z radości po otrzymaniu prezentu w kalendarzu!"
          >
            <span>🎁</span>
            <span>Skacz z radości!</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={triggerDance}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-purple-100 text-purple-900 border border-purple-300 shadow-xs text-[12px] font-black cursor-pointer active:scale-95"
            title="Postać tańczy taniec radości"
          >
            <span>💃</span>
            <span>Zatańcz!</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsActionLooping(p => !p)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border shadow-xs text-[11px] font-black cursor-pointer transition-all active:scale-95 ${
              isActionLooping
                ? 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-300'
                : 'bg-surface-container-low text-on-surface border-outline-variant/40'
            }`}
            title="Włącz lub wyłącz ciągłe zapętlenie animacji"
          >
            <span>🔄</span>
            <span>{isActionLooping ? 'Animacja: Ciągła' : 'Pojedyncza'}</span>
          </motion.button>
        </div>

        {/* Character Name Input Field */}
        <div className="mt-2 flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-full border border-outline-variant/40 shadow-xs">
          <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
          <input
            type="text"
            value={charName}
            onChange={(e) => setCharName(e.target.value)}
            placeholder="Imię postaci..."
            className="bg-transparent font-black text-[13px] text-on-surface outline-none w-36"
          />
        </div>
      </div>

      {/* Horizontal Category Tool Belt Bar */}
      <div className="w-full overflow-x-auto no-scrollbar px-3.5 sm:px-4 py-1.5">
        <div className="flex items-center gap-2 min-w-max pb-1">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  sound.playPop(500);
                  setActiveCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-black text-[13px] sm:text-[14px] transition-all transform active:scale-95 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-md scale-102'
                    : 'bg-surface-container-high text-on-surface shadow-xs hover:bg-surface-container-highest'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Swatch Tray (for Skin, Hair, Outfits) */}
      {(activeCategory === 'skin' || activeCategory === 'hair' || activeCategory === 'outfits') && (
        <div className="px-3.5 sm:px-4 py-2">
          <div className="bg-surface-container-low rounded-2xl p-2.5 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar border border-outline-variant/30">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px] pl-1 shrink-0">
              format_color_fill
            </span>
            <div className="flex items-center gap-2 min-w-max">
              {activeSwatches.map((color) => {
                const isSelected =
                  activeCategory === 'skin'
                    ? character.skinColor === color
                    : activeCategory === 'hair'
                    ? character.hairColor === color
                    : character.outfitColor === color;

                return (
                  <button
                    key={color}
                    type="button"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      sound.playPop(620);
                      if (activeCategory === 'skin') {
                        setCharacter(p => ({ ...p, skinColor: color }));
                      } else if (activeCategory === 'hair') {
                        setCharacter(p => ({ ...p, hairColor: color }));
                      } else {
                        setCharacter(p => ({ ...p, outfitColor: color }));
                      }
                    }}
                    className={`w-9 h-9 rounded-full border-2 transition-all transform active:scale-90 flex items-center justify-center ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/40 scale-110 shadow-sm'
                        : 'border-white/80'
                    }`}
                  >
                    {isSelected && (
                      <span className="material-symbols-outlined text-white text-[18px] drop-shadow-sm">
                        check
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Drawer Category Items Grid */}
      <div className="px-3.5 sm:px-4 mt-2">
        <div className="bg-surface-container-low rounded-3xl p-4 border border-outline-variant/30 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
            <span className="font-black text-[16px] text-on-surface">
              {categories.find(c => c.id === activeCategory)?.label || 'Wybierz Styl'}
            </span>
            <span className="font-extrabold text-[11px] text-primary bg-primary-fixed/40 px-2.5 py-0.5 rounded-full border border-primary/20">
              {activeCategory === 'face' ? '9 Animowanych Nastrojów' : 'Garderoba & Styl'}
            </span>
          </div>

          {/* ================= CATEGORY: FACE & ANIMATED EMOTIONS ================= */}
          {activeCategory === 'face' && (
            <div className="flex flex-col gap-5">
              
              {/* 1. ANIMATED EMOTIONS SELECTOR (9 Expressions) */}
              <div>
                <span className="font-black text-[13px] text-on-surface-variant flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px] text-pink-500">theater_comedy</span>
                    <span>Wybierz Animowany Nastrój Postaci:</span>
                  </span>
                  <span className="text-[10px] text-pink-600 font-extrabold bg-pink-100 px-2 py-0.5 rounded-full">
                    Dotknij, aby zobaczyć ruch!
                  </span>
                </span>

                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                  {EMOTIONS_LIST.map((emo) => {
                    const isSelected = character.currentEmotion === emo.name;
                    return (
                      <button
                        key={emo.name}
                        type="button"
                        onClick={() => handleSelectEmotion(emo.name)}
                        className={`relative flex items-center gap-2.5 p-2.5 rounded-2xl shadow-xs transition-all active:scale-95 text-left border-2 ${
                          isSelected
                            ? 'bg-pink-50 border-pink-400 ring-2 ring-pink-400/30 font-black shadow-sm'
                            : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface hover:bg-surface-container-low'
                        }`}
                      >
                        <span className="text-[26px] shrink-0 animate-bounce">{emo.reaction}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-[12px] truncate">{emo.name}</span>
                          <span className="text-[10px] text-on-surface-variant font-semibold truncate">
                            {emo.quote}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px]">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. DEDICATED GAME EVENT REACTION SIMULATOR (Skakanie po prezencie, zaproszenia itp.) */}
              <div className="bg-gradient-to-r from-amber-100 via-rose-50 to-pink-100 rounded-2xl p-3.5 border-2 border-amber-300 flex flex-col gap-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[22px]">🎮</span>
                    <div>
                      <h4 className="font-black text-[13px] text-amber-950">
                        Symulator Reakcji na Zdarzenia w Grze:
                      </h4>
                      <p className="text-[11px] text-amber-900/80 font-bold">
                        Zobacz jak Twoja postać skacze z radości i reaguje na żywo!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  {/* Calendar Gift - Skakanie z radości */}
                  <button
                    type="button"
                    onClick={() => triggerGameEventReaction('calendar-gift')}
                    className="p-2.5 rounded-xl bg-white hover:bg-amber-50 border-2 border-amber-400 text-left flex items-center gap-2 shadow-2xs active:scale-95 transition-transform"
                  >
                    <span className="text-[24px] animate-bounce">🎁</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-[11px] text-amber-950 leading-tight">
                        Prezent w Kalendarzu
                      </span>
                      <span className="text-[9px] text-amber-800 font-bold">
                        Skakanie z radości! 🎉
                      </span>
                    </div>
                  </button>

                  {/* Room Invitation - Zaproszenie od przyjaciela */}
                  <button
                    type="button"
                    onClick={() => triggerGameEventReaction('invitation')}
                    className="p-2.5 rounded-xl bg-white hover:bg-pink-50 border-2 border-pink-400 text-left flex items-center gap-2 shadow-2xs active:scale-95 transition-transform"
                  >
                    <span className="text-[24px]">💌</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-[11px] text-pink-950 leading-tight">
                        Zaproszenie do Pokoju
                      </span>
                      <span className="text-[9px] text-pink-700 font-bold">
                        Serduszka i uścisk 💕
                      </span>
                    </div>
                  </button>

                  {/* Achievement - Nowe Osiągnięcie */}
                  <button
                    type="button"
                    onClick={() => triggerGameEventReaction('achievement')}
                    className="p-2.5 rounded-xl bg-white hover:bg-purple-50 border-2 border-purple-400 text-left flex items-center gap-2 shadow-2xs active:scale-95 transition-transform"
                  >
                    <span className="text-[24px]">🏆</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-[11px] text-purple-950 leading-tight">
                        Nowe Osiągnięcie
                      </span>
                      <span className="text-[9px] text-purple-800 font-bold">
                        Taniec mistrza! 👑
                      </span>
                    </div>
                  </button>

                  {/* Sweet Snack */}
                  <button
                    type="button"
                    onClick={() => triggerGameEventReaction('snack')}
                    className="p-2.5 rounded-xl bg-white hover:bg-rose-50 border-2 border-rose-300 text-left flex items-center gap-2 shadow-2xs active:scale-95 transition-transform"
                  >
                    <span className="text-[24px]">🧁</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-[11px] text-rose-950 leading-tight">
                        Słodki Smakołyk
                      </span>
                      <span className="text-[9px] text-rose-700 font-bold">
                        Mniam, pychotka! 😋
                      </span>
                    </div>
                  </button>

                  {/* Rainbow Weather */}
                  <button
                    type="button"
                    onClick={() => triggerGameEventReaction('weather')}
                    className="p-2.5 rounded-xl bg-white hover:bg-sky-50 border-2 border-sky-400 text-left flex items-center gap-2 shadow-2xs active:scale-95 transition-transform"
                  >
                    <span className="text-[24px]">🌈</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-[11px] text-sky-950 leading-tight">
                        Piękna Tęcza
                      </span>
                      <span className="text-[9px] text-sky-800 font-bold">
                        Błysk zachwytu! ✨
                      </span>
                    </div>
                  </button>

                  {/* Random Combo */}
                  <button
                    type="button"
                    onClick={triggerSmile}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-pink-400 to-rose-400 text-white text-left flex items-center gap-2 shadow-2xs active:scale-95 transition-transform"
                  >
                    <span className="text-[24px]">😄</span>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-[11px] leading-tight">
                        Szeroki Uśmiech
                      </span>
                      <span className="text-[9px] text-white/90 font-bold">
                        Iskry i błyski! ✨
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* 3. Eye Types */}
              <div>
                <span className="font-black text-[13px] text-on-surface-variant flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">visibility</span>
                  Oczy i spojrzenie:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'big-sparkle', label: 'Błyszczące ✦', icon: 'auto_awesome', desc: 'Duże anime oczka' },
                    { id: 'starry', label: 'Gwiezdne ★', icon: 'star', desc: 'Złote gwiazdki' },
                    { id: 'happy-curved', label: 'Radosne ^_^', icon: 'sentiment_very_satisfied', desc: 'Wesołe łuczki' },
                    { id: 'winking', label: 'Zalotne >_•', icon: 'sentiment_excited', desc: 'Puszcza oczko' }
                  ].map((eye) => {
                    const isSelected = character.eyeType === eye.id;
                    return (
                      <button
                        key={eye.id}
                        type="button"
                        onClick={() => {
                          setCharacter(p => ({ ...p, eyeType: eye.id as CharacterItem['eyeType'] }));
                          triggerBlink();
                        }}
                        className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl shadow-xs transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-primary-container text-on-primary-container ring-2 ring-primary border border-primary font-bold'
                            : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:bg-surface-container-low'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[24px] mb-0.5">{eye.icon}</span>
                        <span className="font-bold text-[12px]">{eye.label}</span>
                        <span className="text-[9px] opacity-75">{eye.desc}</span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Mouth Types */}
              <div>
                <span className="font-black text-[13px] text-on-surface-variant flex items-center gap-1.5 mb-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">mood</span>
                  Kształt uśmiechu:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'joy-open', label: 'Otwarty 😄', icon: 'sentiment_very_satisfied', desc: 'Ząbki i język' },
                    { id: 'big-smile', label: 'Szeroki 😊', icon: 'sentiment_satisfied', desc: 'Ciepły uśmieszek' },
                    { id: 'cat-mouth', label: 'Kociak :3', icon: 'pets', desc: 'Słodki pyszczek' },
                    { id: 'o-mouth', label: 'Zaskoczenie 😮', icon: 'sentiment_dissatisfied', desc: 'Okrągłe ooo' },
                    { id: 'pout', label: 'Dzióbek 😚', icon: 'face', desc: 'Zadziorny grymas' }
                  ].map((m) => {
                    const isSelected = character.mouthType === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setCharacter(p => ({ ...p, mouthType: m.id as CharacterItem['mouthType'] }));
                          triggerSmile();
                        }}
                        className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl shadow-xs transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-secondary-container text-on-secondary-container ring-2 ring-secondary border border-secondary font-bold'
                            : 'bg-surface-container-lowest text-on-surface border border-outline-variant/30 hover:bg-surface-container-low'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[22px] mb-0.5">{m.icon}</span>
                        <span className="font-bold text-[12px]">{m.label}</span>
                        <span className="text-[9px] opacity-75">{m.desc}</span>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-secondary text-white flex items-center justify-center text-[10px]">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* ================= CATEGORY: HAIR ================= */}
          {activeCategory === 'hair' && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'buns', label: 'Koczki', icon: 'face_6', color: 'bg-primary-fixed text-primary' },
                { id: 'braids', label: 'Warkoczyki', icon: 'face_3', color: 'bg-tertiary-fixed text-tertiary' },
                { id: 'spiky', label: 'Czuprynka', icon: 'face_5', color: 'bg-secondary-fixed text-secondary' },
                { id: 'bob', label: 'Klasyczny Bob', icon: 'face_4', color: 'bg-primary-fixed-dim text-primary' },
                { id: 'curly', label: 'Loki i Fale', icon: 'face_2', color: 'bg-secondary-container text-secondary' },
                { id: 'short', label: 'Krótka Fryzura', icon: 'sentiment_satisfied', color: 'bg-surface-container-high text-on-surface' }
              ].map((item) => {
                const isSelected = character.hairStyle === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      sound.playPop(580);
                      setCharacter(p => ({ ...p, hairStyle: item.id as CharacterItem['hairStyle'] }));
                    }}
                    className={`relative flex flex-col items-center justify-center p-3 bg-surface-container-lowest rounded-2xl shadow-xs active:translate-y-1 transition-all ${
                      isSelected ? 'ring-2 ring-primary border border-primary' : 'border border-outline-variant/20'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full ${item.color} flex items-center justify-center mb-1.5`}>
                      <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
                    </div>
                    <span className="font-bold text-[13px] text-on-surface text-center truncate w-full">
                      {item.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-secondary flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-on-secondary text-[14px]">check</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ================= CATEGORY: OUTFITS ================= */}
          {activeCategory === 'outfits' && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'dino', label: 'Dino Bluza', icon: 'cruelty_free', color: 'bg-secondary-container text-secondary' },
                { id: 'strawberry', label: 'Truskawka', icon: 'nutrition', color: 'bg-primary-fixed-dim text-primary' },
                { id: 'astronaut', label: 'Astronauta', icon: 'rocket_launch', color: 'bg-tertiary-fixed-dim text-tertiary' },
                { id: 'dungarees', label: 'Ogrodniczki', icon: 'child_friendly', color: 'bg-secondary-fixed text-secondary' },
                { id: 'sweater', label: 'Ciepły Sweterek', icon: 'checkroom', color: 'bg-primary-fixed text-primary' },
                { id: 'casual', label: 'Codzienny', icon: 'dry_cleaning', color: 'bg-surface-container-high text-on-surface' }
              ].map((item) => {
                const isSelected = character.outfit === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      sound.playPop(580);
                      setCharacter(p => ({ ...p, outfit: item.id as CharacterItem['outfit'] }));
                    }}
                    className={`relative flex flex-col items-center justify-center p-3 bg-surface-container-lowest rounded-2xl shadow-xs active:translate-y-1 transition-all ${
                      isSelected ? 'ring-2 ring-primary border border-primary' : 'border border-outline-variant/20'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full ${item.color} flex items-center justify-center mb-1.5`}>
                      <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
                    </div>
                    <span className="font-bold text-[13px] text-on-surface text-center truncate w-full">
                      {item.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-secondary flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-on-secondary text-[14px]">check</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ================= CATEGORY: HATS ================= */}
          {activeCategory === 'hats' && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'cat-ears', label: 'Uszy Kotka', icon: 'cruelty_free', color: 'bg-primary-fixed text-primary' },
                { id: 'beanie', label: 'Zimowa Czapka', icon: 'snowing', color: 'bg-tertiary-fixed text-tertiary' },
                { id: 'crown', label: 'Złota Korona', icon: 'crown', color: 'bg-tertiary-container text-white' },
                { id: 'cap', label: 'Czapka z daszkiem', icon: 'sports_baseball', color: 'bg-blue-100 text-blue-600' },
                { id: 'none', label: 'Bez nakrycia', icon: 'close', color: 'bg-surface-container-high text-on-surface-variant' }
              ].map((item) => {
                const isSelected = character.hat === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      sound.playPop(600);
                      setCharacter(p => ({ ...p, hat: item.id as CharacterItem['hat'] }));
                    }}
                    className={`relative flex flex-col items-center justify-center p-3 bg-surface-container-lowest rounded-2xl shadow-xs active:translate-y-1 transition-all ${
                      isSelected ? 'ring-2 ring-primary border border-primary' : 'border border-outline-variant/20'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full ${item.color} flex items-center justify-center mb-1.5`}>
                      <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
                    </div>
                    <span className="font-bold text-[13px] text-on-surface text-center truncate w-full">
                      {item.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-secondary flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-on-secondary text-[14px]">check</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ================= CATEGORY: ACCESSORIES ================= */}
          {activeCategory === 'accessories' && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'heart', label: 'Okulary Serca', icon: 'favorite', color: 'bg-primary-fixed text-primary' },
                { id: 'round', label: 'Okrągłe Okulary', icon: 'visibility', color: 'bg-secondary-fixed text-secondary' },
                { id: 'star', label: 'Gwiazdki Disco', icon: 'star', color: 'bg-tertiary-fixed text-tertiary' },
                { id: 'none', label: 'Bez okularów', icon: 'close', color: 'bg-surface-container-high text-on-surface-variant' }
              ].map((item) => {
                const isSelected = character.glasses === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      sound.playPop(620);
                      setCharacter(p => ({ ...p, glasses: item.id as CharacterItem['glasses'] }));
                    }}
                    className={`relative flex flex-col items-center justify-center p-3 bg-surface-container-lowest rounded-2xl shadow-xs active:translate-y-1 transition-all ${
                      isSelected ? 'ring-2 ring-primary border border-primary' : 'border border-outline-variant/20'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full ${item.color} flex items-center justify-center mb-1.5`}>
                      <span className="material-symbols-outlined text-[32px]">{item.icon}</span>
                    </div>
                    <span className="font-bold text-[13px] text-on-surface text-center truncate w-full">
                      {item.label}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-secondary flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-on-secondary text-[14px]">check</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

        </div>
      </div>

      {/* Floating Save FAB Button at the bottom */}
      <div className="fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4 z-40">
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white font-black text-[15px] shadow-xl flex items-center justify-center gap-2 transform active:scale-98 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[24px]">save</span>
          <span>Zapisz Postać i Nowe Reakcje! ✨</span>
        </button>
      </div>

      {/* Save Success Toast */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-2xl font-black text-[13px] flex items-center gap-2 animate-bounce">
          <span>🎉</span>
          <span>Postać {charName} została zapisana w Twojej garderobie!</span>
        </div>
      )}
    </div>
  );
};
