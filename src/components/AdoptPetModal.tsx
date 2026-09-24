import React, { useState } from 'react';
import { AdoptedPet, CharacterItem, PetSpecies } from '../types';
import { ADOPTABLE_PETS, COLLAR_COLORS, PET_ACCESSORIES, AdoptableTemplate } from '../data/petData';
import { PetSprite } from './PetSprite';
import { CharacterHead } from './CharacterHead';
import { sound } from '../utils/sound';
import { unlockAchievement } from '../utils/achievementManager';

interface AdoptPetModalProps {
  characters: CharacterItem[];
  isOpen: boolean;
  onClose: () => void;
  onAdoptPet: (newPet: AdoptedPet) => void;
}

export const AdoptPetModal: React.FC<AdoptPetModalProps> = ({
  characters,
  isOpen,
  onClose,
  onAdoptPet
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<AdoptableTemplate>(ADOPTABLE_PETS[0]);
  const [petName, setPetName] = useState<string>(ADOPTABLE_PETS[0].defaultName);
  const [selectedColor, setSelectedColor] = useState<string>(ADOPTABLE_PETS[0].colorOptions[0]);
  const [selectedCollar, setSelectedCollar] = useState<string>(COLLAR_COLORS[0].id);
  const [selectedAccessory, setSelectedAccessory] = useState<AdoptedPet['accessory']>('bell');
  const [assignedCharId, setAssignedCharId] = useState<string>(characters[0]?.id || '');
  const [adoptedSuccess, setAdoptedSuccess] = useState<AdoptedPet | null>(null);

  if (!isOpen) return null;

  const handleSelectTemplate = (tmpl: AdoptableTemplate) => {
    sound.playPetSound(tmpl.soundType);
    setSelectedTemplate(tmpl);
    setPetName(tmpl.defaultName);
    setSelectedColor(tmpl.colorOptions[0]);
  };

  const handleSoundTest = () => {
    sound.playPetSound(selectedTemplate.soundType);
  };

  const handleRandomName = () => {
    sound.playPop(620);
    const names = ['Puszek', 'Bąbel', 'Mimi', 'Chrupka', 'Piorun', 'Koko', 'Lusia', 'Pixel', 'Kropek', 'Fafik', 'Toffi'];
    const random = names[Math.floor(Math.random() * names.length)];
    setPetName(random);
  };

  const handleConfirmAdopt = () => {
    sound.playSuccess();
    const newPet: AdoptedPet = {
      id: `pet-${Date.now()}`,
      name: petName.trim() || selectedTemplate.defaultName,
      species: selectedTemplate.species,
      color: selectedColor,
      collarColor: selectedCollar,
      accessory: selectedAccessory,
      favoriteSnack: selectedTemplate.favoriteSnack,
      snackIcon: selectedTemplate.snackIcon,
      soundType: selectedTemplate.soundType,
      assignedCharacterId: assignedCharId || undefined,
      isInRoom: true,
      x: 35 + Math.random() * 30,
      y: 65 + Math.random() * 15,
      happiness: 100,
      adoptedAt: 'Dzisiaj',
      personality: selectedTemplate.personality
    };

    setAdoptedSuccess(newPet);
    unlockAchievement('adopt_pet');
    setTimeout(() => {
      onAdoptPet(newPet);
      setAdoptedSuccess(null);
      onClose();
    }, 1800);
  };

  // Preview Pet Item
  const previewPet: AdoptedPet = {
    id: 'preview',
    name: petName || selectedTemplate.defaultName,
    species: selectedTemplate.species,
    color: selectedColor,
    collarColor: selectedCollar,
    accessory: selectedAccessory,
    favoriteSnack: selectedTemplate.favoriteSnack,
    snackIcon: selectedTemplate.snackIcon,
    soundType: selectedTemplate.soundType,
    assignedCharacterId: assignedCharId,
    isInRoom: true,
    x: 50,
    y: 50,
    happiness: 100,
    adoptedAt: 'Teraz',
    personality: selectedTemplate.personality
  };

  const assignedCharacter = characters.find(c => c.id === assignedCharId);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 select-none animate-fadeIn">
      <div className="bg-surface-container-lowest rounded-3xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl border-4 border-primary overflow-hidden">
        {/* Modal Header */}
        <div className="bg-primary text-on-primary p-3.5 px-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">pets</span>
            </div>
            <div>
              <h2 className="font-bold text-[18px] leading-tight">Adoptuj Zwierzaka</h2>
              <p className="text-[12px] opacity-90">Salon Przyjaciół Zwierząt w Kiddo World</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white font-bold flex items-center justify-center active:scale-90 transition-transform"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-3.5 overflow-y-auto flex flex-col gap-3.5 no-scrollbar">
          {/* Pet Showcase Live Podium */}
          <div className="bg-gradient-to-b from-secondary-container/40 to-surface-container-low rounded-2xl p-3 flex items-center justify-around border border-secondary/20 shadow-inner relative">
            <div className="flex flex-col items-center">
              <PetSprite
                pet={previewPet}
                accompanyingCharacter={assignedCharacter}
                size="lg"
                isInteracting={false}
              />
              <button
                type="button"
                onClick={handleSoundTest}
                className="mt-1 px-2.5 py-1 rounded-full bg-white text-secondary font-bold text-[11px] shadow-xs flex items-center gap-1 active:scale-95 border border-secondary/30"
              >
                <span className="material-symbols-outlined text-[14px]">volume_up</span>
                <span>Głos pupila</span>
              </button>
            </div>

            <div className="flex flex-col gap-1 max-w-[170px]">
              <div className="flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${selectedTemplate.badgeColor}`}>
                  {selectedTemplate.badge}
                </span>
              </div>
              <h3 className="font-bold text-[16px] text-on-surface leading-tight">
                {selectedTemplate.title}
              </h3>
              <p className="text-[11px] text-on-surface-variant font-medium leading-tight line-clamp-3">
                {selectedTemplate.personality}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-primary font-bold mt-1">
                <span className="material-symbols-outlined text-[15px]">{selectedTemplate.snackIcon}</span>
                <span className="truncate">Lubi: {selectedTemplate.favoriteSnack}</span>
              </div>
            </div>
          </div>

          {/* 1. Choose Species Horizontal Scroller */}
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-[13px] text-on-surface">1. Wybierz gatunek zwierzaka:</span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {ADOPTABLE_PETS.map((tmpl) => {
                const isSelected = selectedTemplate.species === tmpl.species;
                return (
                  <button
                    key={tmpl.species}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl)}
                    className={`shrink-0 flex flex-col items-center p-2 rounded-2xl transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-md scale-102 ring-2 ring-primary'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest border border-outline-variant/30'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-white/40 flex items-center justify-center mb-1">
                      <span className="material-symbols-outlined text-[24px]">
                        {tmpl.iconName}
                      </span>
                    </div>
                    <span className="font-bold text-[11px] truncate max-w-[64px]">
                      {tmpl.defaultName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Pet Name Input & Suggestions */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[13px] text-on-surface">2. Nadaj imię zwierzakowi:</span>
              <button
                type="button"
                onClick={handleRandomName}
                className="text-[11px] text-primary font-bold flex items-center gap-0.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-[13px]">casino</span>
                <span>Losuj</span>
              </button>
            </div>
            <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/40 shadow-inner">
              <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Wpisz imię pupila..."
                maxLength={18}
                className="bg-transparent font-bold text-[14px] text-on-surface outline-none w-full"
              />
            </div>
          </div>

          {/* 3. Fur & Collar Color */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Fur Color */}
            <div className="flex flex-col gap-1">
              <span className="font-bold text-[12px] text-on-surface">Kolor futerka:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {selectedTemplate.colorOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    style={{ backgroundColor: c }}
                    onClick={() => {
                      sound.playPop(550);
                      setSelectedColor(c);
                    }}
                    className={`w-7 h-7 rounded-full shadow-xs shrink-0 transition-transform ${
                      selectedColor === c ? 'ring-2 ring-primary scale-110' : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Collar Color */}
            <div className="flex flex-col gap-1">
              <span className="font-bold text-[12px] text-on-surface">Kolor obróżki:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {COLLAR_COLORS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    title={col.name}
                    style={{ backgroundColor: col.id }}
                    onClick={() => {
                      sound.playPop(600);
                      setSelectedCollar(col.id);
                    }}
                    className={`w-7 h-7 rounded-full shadow-xs shrink-0 transition-transform ${
                      selectedCollar === col.id ? 'ring-2 ring-secondary scale-110' : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 4. Accessories */}
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[12px] text-on-surface">Dodatek / Ozdoba:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {PET_ACCESSORIES.map((acc) => {
                const isSelected = selectedAccessory === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => {
                      sound.playPop(650);
                      setSelectedAccessory(acc.id as typeof selectedAccessory);
                    }}
                    className={`px-2.5 py-1 rounded-full font-bold text-[11px] flex items-center gap-1 shrink-0 transition-all ${
                      isSelected
                        ? 'bg-secondary text-on-secondary shadow-xs scale-102'
                        : 'bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">{acc.icon}</span>
                    <span>{acc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Assign to Character (Companion Mode) */}
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[12px] text-on-surface">
              Kto będzie opiekunem w pokoju? (Towarzysz postaci):
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {/* Free Roam option */}
              <button
                type="button"
                onClick={() => {
                  sound.playPop(500);
                  setAssignedCharId('');
                }}
                className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-[12px] transition-all ${
                  assignedCharId === ''
                    ? 'bg-tertiary text-on-tertiary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">explore</span>
                <span>Biega sam</span>
              </button>

              {/* Characters */}
              {characters.map((char) => {
                const isAssigned = assignedCharId === char.id;
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => {
                      sound.playPop(580);
                      setAssignedCharId(char.id);
                    }}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[12px] transition-all ${
                      isAssigned
                        ? 'bg-primary text-on-primary shadow-sm scale-102'
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
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
        </div>

        {/* Modal Action Buttons */}
        <div className="p-3 bg-surface-container-low border-t border-outline-variant/30 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full bg-surface-container-high text-on-surface font-bold text-[14px] active:scale-95 transition-transform"
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleConfirmAdopt}
            className="flex-2 py-3 rounded-full bg-primary text-on-primary font-bold text-[14px] shadow-[0_4px_0px_#6e0028] active:translate-y-1 active:shadow-[0_1px_0px_#6e0028] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">volunteer_activism</span>
            <span>Adoptuj do Pokoju!</span>
          </button>
        </div>

        {/* Adoption Celebration Overlay Certificate */}
        {adoptedSuccess && (
          <div className="absolute inset-0 bg-primary/95 text-white flex flex-col items-center justify-center p-6 text-center z-50 animate-bounce">
            <div className="w-20 h-20 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl mb-3">
              <span className="material-symbols-outlined text-[44px]">verified</span>
            </div>
            <h3 className="font-bold text-[24px]">Certyfikat Adopcji! 🐾</h3>
            <p className="text-[16px] font-semibold mt-1">
              Gratulacje! {adoptedSuccess.name} to Twój nowy najlepszy przyjaciel!
            </p>
            {assignedCharacter && (
              <p className="text-[13px] bg-white/20 px-3 py-1 rounded-full mt-2 font-bold">
                Towarzysz postaci: {assignedCharacter.name}
              </p>
            )}
            <span className="text-[13px] mt-3 opacity-90">Biegnie już do pokoju zabaw... ✨</span>
          </div>
        )}
      </div>
    </div>
  );
};
