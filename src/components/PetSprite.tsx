import React from 'react';
import { AdoptedPet, CharacterItem } from '../types';
import { APP_IMAGES } from '../data/kiddoData';
import { CharacterHead } from './CharacterHead';

interface PetSpriteProps {
  pet: AdoptedPet;
  accompanyingCharacter?: CharacterItem;
  size?: 'sm' | 'md' | 'lg';
  isInteracting?: boolean;
  showCompanionBadge?: boolean;
  onClick?: () => void;
}

export const PetSprite: React.FC<PetSpriteProps> = ({
  pet,
  accompanyingCharacter,
  size = 'md',
  isInteracting = false,
  showCompanionBadge = true,
  onClick
}) => {
  const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  // Render photo if available and default color
  const hasPhoto = (pet.species === 'cat' && pet.color === '#ffb74d') || (pet.species === 'dog' && pet.color === '#d7ccc8');

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center cursor-pointer select-none group transition-transform ${
        isInteracting ? 'scale-115 animate-bounce' : 'hover:scale-105 active:scale-95'
      }`}
    >
      {/* Floating Love Heart on pet or happy state */}
      {isInteracting && (
        <span className="absolute -top-6 text-[18px] animate-bounce text-pink-500 pointer-events-none drop-shadow">
          💖
        </span>
      )}

      {/* Main Pet Visual Avatar */}
      <div className={`relative ${sizeMap[size]} flex items-center justify-center`}>
        {hasPhoto ? (
          <div className="w-full h-full relative">
            <img
              src={pet.species === 'cat' ? APP_IMAGES.kittenKosmo : APP_IMAGES.puppyBabel}
              alt={pet.name}
              className="w-full h-full object-contain filter drop-shadow-md rounded-2xl"
            />
            {/* Custom Collar Ribbon around pet */}
            <div
              style={{ backgroundColor: pet.collarColor }}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full shadow-xs border border-white/50"
            />
            {pet.accessory === 'bell' && (
              <span className="material-symbols-outlined text-[12px] text-yellow-400 absolute bottom-1 left-1/2 -translate-x-1/2 drop-shadow">
                notifications
              </span>
            )}
            {pet.accessory === 'bow' && (
              <span className="material-symbols-outlined text-[13px] text-pink-500 absolute bottom-1 left-1/2 -translate-x-1/2 drop-shadow">
                favorite
              </span>
            )}
            {pet.accessory === 'crown' && (
              <span className="material-symbols-outlined text-[14px] text-amber-400 absolute -top-1 left-1/2 -translate-x-1/2 drop-shadow animate-pulse">
                crown
              </span>
            )}
          </div>
        ) : (
          /* Expressive Vector SVG Pet for All Breeds & Custom Colors */
          <div className="w-full h-full relative flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md overflow-visible">
              {/* Ears */}
              {pet.species === 'cat' && (
                <>
                  <polygon points="25,45 15,15 45,30" fill={pet.color} />
                  <polygon points="27,42 20,20 42,32" fill="#ffb6c1" />
                  <polygon points="75,45 85,15 55,30" fill={pet.color} />
                  <polygon points="73,42 80,20 58,32" fill="#ffb6c1" />
                </>
              )}
              {pet.species === 'dog' && (
                <>
                  <path d="M 22 35 C 10 38 12 60 22 55 Z" fill={pet.color} />
                  <path d="M 78 35 C 90 38 88 60 78 55 Z" fill={pet.color} />
                </>
              )}
              {pet.species === 'corgi' && (
                <>
                  <polygon points="25,40 10,12 40,25" fill={pet.color} />
                  <polygon points="75,40 90,12 60,25" fill={pet.color} />
                </>
              )}
              {pet.species === 'bunny' && (
                <>
                  <ellipse cx="36" cy="20" rx="8" ry="22" fill={pet.color} transform="rotate(-10 36 20)" />
                  <ellipse cx="36" cy="20" rx="4" ry="16" fill="#ffb6c1" transform="rotate(-10 36 20)" />
                  <ellipse cx="64" cy="20" rx="8" ry="22" fill={pet.color} transform="rotate(10 64 20)" />
                  <ellipse cx="64" cy="20" rx="4" ry="16" fill="#ffb6c1" transform="rotate(10 64 20)" />
                </>
              )}
              {pet.species === 'panda' && (
                <>
                  <circle cx="28" cy="28" r="12" fill="#212121" />
                  <circle cx="72" cy="28" r="12" fill="#212121" />
                </>
              )}
              {pet.species === 'hamster' && (
                <>
                  <circle cx="30" cy="30" r="10" fill={pet.color} />
                  <circle cx="30" cy="30" r="6" fill="#ffb6c1" />
                  <circle cx="70" cy="30" r="10" fill={pet.color} />
                  <circle cx="70" cy="30" r="6" fill="#ffb6c1" />
                </>
              )}
              {pet.species === 'parrot' && (
                <>
                  <path d="M 50 15 Q 45 5 40 12" stroke="#ffeb3b" strokeWidth="4" strokeLinecap="round" fill="none" />
                  <path d="M 50 15 Q 52 2 48 10" stroke="#f44336" strokeWidth="3" strokeLinecap="round" fill="none" />
                </>
              )}
              {pet.species === 'dino' && (
                <>
                  <polygon points="50,15 45,5 55,5" fill="#4caf50" />
                  <polygon points="50,25 43,18 57,18" fill="#4caf50" />
                </>
              )}

              {/* Head Body */}
              <circle cx="50" cy="55" r="32" fill={pet.color} />

              {/* Cheeks */}
              <circle cx="32" cy="62" r="6" fill="#ff80ab" opacity="0.6" />
              <circle cx="68" cy="62" r="6" fill="#ff80ab" opacity="0.6" />

              {/* Eyes */}
              <circle cx="38" cy="50" r="4.5" fill="#212121" />
              <circle cx="36.5" cy="48.5" r="1.5" fill="#ffffff" />
              <circle cx="62" cy="50" r="4.5" fill="#212121" />
              <circle cx="60.5" cy="48.5" r="1.5" fill="#ffffff" />

              {/* Nose & Mouth */}
              <ellipse cx="50" cy="59" rx="3" ry="2.2" fill={pet.species === 'parrot' ? '#ff9800' : '#d81b60'} />
              <path
                d="M 46 62 Q 50 65 50 63 Q 50 65 54 62"
                stroke="#424242"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />

              {/* Collar & Accessory */}
              <path
                d="M 30 75 Q 50 82 70 75"
                stroke={pet.collarColor}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="50" cy="80" r="4" fill="#ffd700" />
            </svg>

            {/* Accessory Badge */}
            {pet.accessory === 'crown' && (
              <span className="material-symbols-outlined text-[16px] text-amber-400 absolute -top-2 left-1/2 -translate-x-1/2 drop-shadow">
                crown
              </span>
            )}
            {pet.accessory === 'bow' && (
              <span className="material-symbols-outlined text-[14px] text-pink-500 absolute -top-1 right-1 drop-shadow">
                favorite
              </span>
            )}
            {pet.accessory === 'bell' && (
              <span className="material-symbols-outlined text-[12px] text-yellow-400 absolute bottom-0 left-1/2 -translate-x-1/2 drop-shadow">
                notifications
              </span>
            )}
            {pet.accessory === 'bandana' && (
              <span className="material-symbols-outlined text-[13px] text-indigo-500 absolute bottom-0.5 left-1/2 -translate-x-1/2 drop-shadow">
                style
              </span>
            )}
          </div>
        )}

        {/* Small Companion Badge of the Character it accompanies */}
        {showCompanionBadge && accompanyingCharacter && (
          <div
            title={`Towarzysz postaci: ${accompanyingCharacter.name}`}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white p-0.5 shadow-md border border-primary flex items-center justify-center overflow-hidden"
          >
            <CharacterHead character={accompanyingCharacter} size={22} />
          </div>
        )}
      </div>

      {/* Pet Name Tag Pill */}
      <div className="mt-1 px-2 py-0.5 rounded-full bg-surface-container-lowest/95 shadow-xs border border-outline-variant/30 flex items-center gap-1 max-w-[85px]">
        <span className="text-[10px] leading-none">🐾</span>
        <span className="font-bold text-[11px] text-on-surface truncate leading-tight">
          {pet.name}
        </span>
      </div>
    </div>
  );
};
