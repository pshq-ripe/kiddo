import React, { useState } from 'react';
import { AdoptedPet, CharacterItem } from '../types';
import { PET_TRICKS } from '../data/petData';
import { PetSprite } from './PetSprite';
import { CharacterHead } from './CharacterHead';
import { sound } from '../utils/sound';
import { unlockAchievement } from '../utils/achievementManager';

interface PetActionSheetProps {
  pet: AdoptedPet | null;
  characters: CharacterItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdatePet: (updated: AdoptedPet) => void;
  onRemoveFromRoom: (petId: string) => void;
  onTriggerSpeech: (text: string) => void;
}

export const PetActionSheet: React.FC<PetActionSheetProps> = ({
  pet,
  characters,
  isOpen,
  onClose,
  onUpdatePet,
  onRemoveFromRoom,
  onTriggerSpeech
}) => {
  const [petReaction, setPetReaction] = useState<string | null>(null);

  if (!isOpen || !pet) return null;

  const accompanyingChar = characters.find(c => c.id === pet.assignedCharacterId);

  const showReaction = (text: string) => {
    setPetReaction(text);
    onTriggerSpeech(`${pet.name}: ${text}`);
    setTimeout(() => {
      setPetReaction(null);
    }, 2500);
  };

  // Cuddle & Pet
  const handleCuddle = () => {
    sound.playPetSound(pet.soundType);
    const updated: AdoptedPet = {
      ...pet,
      happiness: Math.min(100, pet.happiness + 10)
    };
    onUpdatePet(updated);
    const cuddles = [
      `Mruu... Uwielbiam Cię! ❤️`,
      `*macha ogonkiem z radości* 🐾`,
      `Hau! Jeszcze więcej głaskania! ✨`,
      `*przytula się do nogi* 🥰`
    ];
    const reaction = cuddles[Math.floor(Math.random() * cuddles.length)];
    showReaction(reaction);
    unlockAchievement('pet_care');
  };

  // Feed Snack
  const handleFeed = () => {
    sound.playSparkle();
    const updated: AdoptedPet = {
      ...pet,
      happiness: Math.min(100, pet.happiness + 15)
    };
    onUpdatePet(updated);
    showReaction(`Mniam mniam! Pyszna ${pet.favoriteSnack}! 😋`);
    unlockAchievement('pet_care');
  };

  // Perform Trick
  const handleTrick = (trick: typeof PET_TRICKS[0]) => {
    sound.playBoing();
    showReaction(trick.response);
  };

  // Move near companion
  const handleFollowCompanion = () => {
    if (!accompanyingChar) return;
    sound.playPop(580);
    // Find character position or preset near left side (sofa) or right side (kitchen)
    const targetX = accompanyingChar.id === 'zosia' ? 32 : accompanyingChar.id === 'leon' ? 62 : 45;
    const targetY = 68;

    const updated: AdoptedPet = {
      ...pet,
      x: targetX,
      y: targetY
    };
    onUpdatePet(updated);
    showReaction(`Biegnę do ${accompanyingChar.name}! 🐾`);
  };

  // Change companion
  const handleChangeCompanion = (charId?: string) => {
    sound.playPop(520);
    const updated: AdoptedPet = {
      ...pet,
      assignedCharacterId: charId
    };
    onUpdatePet(updated);
    if (charId) {
      const char = characters.find(c => c.id === charId);
      showReaction(`Jestem teraz z ${char?.name || 'nowym przyjacielem'}! 🎉`);
    } else {
      showReaction(`Biegam swobodnie po całym pokoju! 🏃‍♂️`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0 select-none animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-t-3xl w-full max-w-md p-4 shadow-2xl border-t-4 border-primary flex flex-col gap-3.5 max-h-[85vh] overflow-y-auto no-scrollbar animate-slideUp">
        {/* Sheet Top Handle & Close */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-1.5 bg-outline-variant/60 rounded-full mx-auto -ml-3"></div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface flex items-center justify-center font-bold active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* Pet Profile Header */}
        <div className="flex items-center gap-3 bg-surface-container-low rounded-2xl p-3 border border-outline-variant/30">
          <div className="shrink-0">
            <PetSprite
              pet={pet}
              accompanyingCharacter={accompanyingChar}
              size="md"
              isInteracting={Boolean(petReaction)}
            />
          </div>

          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[18px] text-on-surface truncate leading-tight">
                {pet.name}
              </h3>
              <div className="flex items-center gap-1 text-[12px] font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">
                <span>❤️</span>
                <span>{pet.happiness}%</span>
              </div>
            </div>

            <p className="text-[12px] text-on-surface-variant font-medium truncate mt-0.5">
              {accompanyingChar
                ? `Towarzysz: ${accompanyingChar.name}`
                : 'Samodzielny odkrywca pokoju'}
            </p>

            {/* Quick sound replay */}
            <div className="flex items-center gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => sound.playPetSound(pet.soundType)}
                className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-bold text-[11px] flex items-center gap-1 active:scale-95"
              >
                <span className="material-symbols-outlined text-[13px]">volume_up</span>
                <span>Głos</span>
              </button>
              <span className="text-[11px] text-secondary font-bold truncate">
                Przysmak: {pet.favoriteSnack}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Speech Banner */}
        {petReaction && (
          <div className="bg-primary-fixed text-on-primary-fixed px-3.5 py-2 rounded-2xl text-[13px] font-bold flex items-center gap-2 border border-primary/20 animate-bounce">
            <span className="material-symbols-outlined text-primary text-[18px]">chat</span>
            <span>{petReaction}</span>
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* Pet / Cuddle */}
          <button
            type="button"
            onClick={handleCuddle}
            className="p-3 rounded-2xl bg-primary text-on-primary shadow-[0_3px_0px_#6e0028] active:translate-y-1 active:shadow-[0_1px_0px_#6e0028] transition-all flex items-center justify-center gap-2 font-bold text-[13px]"
          >
            <span className="material-symbols-outlined text-[20px]">favorite</span>
            <span>Pogłaszcz! 💕</span>
          </button>

          {/* Feed */}
          <button
            type="button"
            onClick={handleFeed}
            className="p-3 rounded-2xl bg-secondary text-on-secondary shadow-[0_3px_0px_#00201d] active:translate-y-1 active:shadow-[0_1px_0px_#00201d] transition-all flex items-center justify-center gap-2 font-bold text-[13px]"
          >
            <span className="material-symbols-outlined text-[20px]">{pet.snackIcon || 'cookie'}</span>
            <span>Daj smakołyk! 🦴</span>
          </button>
        </div>

        {/* Tricks Strip */}
        <div className="flex flex-col gap-1.5">
          <span className="font-bold text-[13px] text-on-surface">Poproś o sztuczkę:</span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {PET_TRICKS.map((trick) => (
              <button
                key={trick.id}
                type="button"
                onClick={() => handleTrick(trick)}
                className="shrink-0 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-[12px] flex items-center gap-1 active:scale-95 shadow-xs border border-outline-variant/30"
              >
                <span>{trick.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Assign Companion Switcher */}
        <div className="flex flex-col gap-1.5">
          <span className="font-bold text-[13px] text-on-surface">
            Z kim ma spacerować po pokoju? (Towarzysz):
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => handleChangeCompanion(undefined)}
              className={`shrink-0 px-3 py-1 rounded-full font-bold text-[11px] transition-all ${
                !pet.assignedCharacterId
                  ? 'bg-tertiary text-on-tertiary shadow-xs'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              Samodzielnie
            </button>
            {characters.map((char) => {
              const isAssigned = pet.assignedCharacterId === char.id;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => handleChangeCompanion(char.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] transition-all ${
                    isAssigned
                      ? 'bg-primary text-on-primary shadow-xs scale-102'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center">
                    <CharacterHead character={char} size={20} />
                  </div>
                  <span>{char.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Position Helpers */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/30">
          {accompanyingChar && (
            <button
              type="button"
              onClick={handleFollowCompanion}
              className="text-[12px] font-bold text-primary flex items-center gap-1 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">near_me</span>
              <span>Biegnij do {accompanyingChar.name}!</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              sound.playPop(400);
              onRemoveFromRoom(pet.id);
              onClose();
            }}
            className="text-[12px] font-bold text-error flex items-center gap-1 active:scale-95 ml-auto"
          >
            <span className="material-symbols-outlined text-[16px]">bedtime</span>
            <span>Odpocznij w legowisku (schowaj)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
