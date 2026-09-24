import React from 'react';
import { motion } from 'framer-motion';
import { CharacterItem, CharacterActionAnimation } from '../types';
import { CharacterHead } from './CharacterHead';

export { CharacterHead };

interface CharacterAvatarProps {
  character: CharacterItem;
  size?: 'sm' | 'md' | 'lg' | 'room' | 'stage' | 'avatar';
  isWaving?: boolean;
  showReactionBubble?: boolean;
  reactionText?: string;
  onClick?: () => void;
  className?: string;
  isBlinking?: boolean;
  isSmiling?: boolean;
  actionAnimation?: CharacterActionAnimation;
  loopAnimation?: boolean;
  enableIdleAnimations?: boolean;
  interactive?: boolean;
  onEyeClick?: () => void;
  onMouthClick?: () => void;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  character,
  size = 'stage',
  isWaving = true,
  showReactionBubble = false,
  reactionText,
  onClick,
  className = '',
  isBlinking = false,
  isSmiling = false,
  actionAnimation = 'idle',
  loopAnimation = false,
  enableIdleAnimations = true,
  interactive = false,
  onEyeClick,
  onMouthClick
}) => {
  const {
    skinColor = '#f9c9b0',
    outfitColor = '#006a62',
    outfit = 'sweater',
    currentEmotion = 'Radość',
    heldItem
  } = character;

  // If size is 'avatar', render just the head
  if (size === 'avatar') {
    return (
      <div onClick={onClick} className={`inline-flex items-center justify-center ${className}`}>
        <CharacterHead
          character={character}
          size="100%"
          isBlinking={isBlinking}
          isSmiling={isSmiling}
          enableIdleAnimations={enableIdleAnimations}
          interactive={interactive}
          onEyeClick={onEyeClick}
          onMouthClick={onMouthClick}
        />
      </div>
    );
  }

  // Size configurations
  const containerClasses: Record<string, string> = {
    sm: 'w-16 h-22 scale-[0.85] origin-bottom',
    md: 'w-24 h-32',
    room: 'w-28 h-36',
    lg: 'w-36 h-46',
    stage: 'w-48 h-56'
  };

  // Dimensions of SVG inside container
  const svgDimensions: Record<string, { width: number; height: number }> = {
    sm: { width: 72, height: 96 },
    md: { width: 96, height: 128 },
    room: { width: 112, height: 144 },
    lg: { width: 140, height: 180 },
    stage: { width: 180, height: 230 }
  };

  const currentDim = svgDimensions[size] || svgDimensions.stage;

  // Emotion default bubble texts
  const emotionQuote =
    reactionText ||
    (currentEmotion === 'Ekscytacja'
      ? 'Skaczę z radości! 🎉'
      : currentEmotion === 'Radość'
      ? 'Cześć! ✨'
      : currentEmotion === 'Taniec'
      ? 'Tańczymy! 💃🎶'
      : currentEmotion === 'Serduszka'
      ? 'Uścisk! 💖'
      : currentEmotion === 'Śmiech'
      ? 'Haha! 😆'
      : currentEmotion === 'Śpiew'
      ? 'La la la! 🎵'
      : currentEmotion === 'Sen'
      ? 'Zzz... 😴'
      : currentEmotion === 'Złość'
      ? 'Grrr! 😤'
      : currentEmotion === 'Zdziwienie'
      ? 'Oooch! 😲'
      : 'Kiddo!');

  // Compute motion animation parameters based on actionAnimation
  const getMotionAnimation = () => {
    switch (actionAnimation) {
      case 'jump-joy':
        return {
          y: [0, -32, 2, -26, 1, -16, 0],
          scale: [1, 1.09, 0.94, 1.07, 0.96, 1.03, 1],
          rotate: [0, -5, 5, -4, 4, 0],
          transition: {
            duration: 1.1,
            ease: 'easeInOut' as const,
            repeat: loopAnimation ? Infinity : 0
          }
        };
      case 'dance':
        return {
          x: [-10, 10, -8, 8, -4, 4, 0],
          rotate: [-12, 12, -10, 10, -5, 5, 0],
          y: [0, -10, 0, -10, 0],
          transition: {
            duration: 1.2,
            ease: 'easeInOut' as const,
            repeat: loopAnimation ? Infinity : 0
          }
        };
      case 'cheer':
        return {
          y: [0, -22, 0, -22, 0],
          scale: [1, 1.07, 1, 1.07, 1],
          transition: {
            duration: 0.9,
            ease: 'easeOut' as const,
            repeat: loopAnimation ? Infinity : 0
          }
        };
      case 'surprise':
        return {
          y: [0, -30, -2, 0],
          scale: [1, 1.14, 0.98, 1],
          rotate: [0, -2, 2, 0],
          transition: { duration: 0.7, ease: 'easeOut' as const }
        };
      case 'heart-burst':
        return {
          scale: [1, 1.12, 0.96, 1.09, 1],
          rotate: [0, -4, 4, -2, 2, 0],
          transition: {
            duration: 1.0,
            ease: 'easeInOut' as const,
            repeat: loopAnimation ? Infinity : 0
          }
        };
      case 'wiggle':
        return {
          x: [-6, 6, -6, 6, -3, 3, 0],
          y: [0, -4, 0, -4, 0],
          transition: {
            duration: 0.8,
            ease: 'easeInOut' as const,
            repeat: loopAnimation ? Infinity : 0
          }
        };
      case 'sleep':
        return {
          rotate: [-3, 3, -3, 3, 0],
          y: [0, 3, 0, 3, 0],
          transition: { duration: 2.4, ease: 'easeInOut' as const, repeat: Infinity }
        };
      case 'pout':
        return {
          rotate: [-8, 0],
          x: [-6, 0],
          transition: { duration: 0.6, ease: 'easeInOut' as const }
        };
      default:
        if (isSmiling) {
          return {
            y: [0, -8, 0],
            scale: [1, 1.04, 1],
            transition: { duration: 0.6, ease: 'easeOut' as const }
          };
        }
        return { y: 0, scale: 1, rotate: 0, x: 0 };
    }
  };

  const isJoyJumping = actionAnimation === 'jump-joy';
  const isDancing = actionAnimation === 'dance';
  const isHeartBurst = actionAnimation === 'heart-burst';

  return (
    <motion.div
      onClick={onClick}
      animate={getMotionAnimation()}
      whileTap={{ scale: 0.96 }}
      className={`relative flex flex-col items-center select-none cursor-pointer group transition-transform ${containerClasses[size] || containerClasses.stage} ${className}`}
    >
      {/* Floating particles during joy jumping / excitement */}
      {isJoyJumping && (
        <div className="absolute -top-6 inset-x-0 pointer-events-none flex justify-around z-30">
          <span className="text-xl animate-bounce duration-500">✨</span>
          <span className="text-2xl animate-ping duration-700">🎁</span>
          <span className="text-xl animate-bounce duration-300">⭐</span>
        </div>
      )}

      {/* Floating music notes during dance */}
      {isDancing && (
        <div className="absolute -top-6 inset-x-0 pointer-events-none flex justify-around z-30">
          <span className="text-xl animate-bounce">🎵</span>
          <span className="text-xl animate-pulse">💃</span>
          <span className="text-xl animate-bounce">🎶</span>
        </div>
      )}

      {/* Floating hearts during heart burst */}
      {isHeartBurst && (
        <div className="absolute -top-6 inset-x-0 pointer-events-none flex justify-around z-30">
          <span className="text-xl animate-pulse">💖</span>
          <span className="text-xl animate-bounce">💕</span>
          <span className="text-xl animate-ping">🥰</span>
        </div>
      )}

      {/* Speech / Reaction Bubble */}
      {showReactionBubble && (
        <div className="absolute -top-11 z-40 bg-surface-container-lowest text-on-surface px-3 py-1 rounded-full shadow-lg text-[12px] font-extrabold flex items-center gap-1.5 border-2 border-primary/40 animate-bounce whitespace-nowrap">
          <span className="text-primary">💬</span>
          <span>{emotionQuote}</span>
        </div>
      )}

      {/* Full Scalable Vector Character Container */}
      <div className="relative flex flex-col items-center">
        {/* Head with 100% visible face, eyes, blush, and hair */}
        <div className="relative z-20 flex justify-center">
          <CharacterHead
            character={character}
            size={currentDim.width}
            isBlinking={isBlinking}
            isSmiling={isSmiling || isJoyJumping || isDancing}
            enableIdleAnimations={enableIdleAnimations}
            interactive={interactive}
            onEyeClick={onEyeClick}
            onMouthClick={onMouthClick}
            className="filter drop-shadow-sm transition-transform duration-200"
          />
        </div>

        {/* Torso & Chibi Body */}
        <div
          className="relative z-10 -mt-3.5 flex flex-col items-center"
          style={{ width: `${currentDim.width * 0.72}px` }}
        >
          {/* Main Outfit Torso */}
          <div
            style={{ backgroundColor: outfitColor }}
            className="w-full h-14 rounded-t-3xl rounded-b-xl flex flex-col items-center justify-center relative shadow-[inset_0_-3px_0px_rgba(0,0,0,0.15)] border border-black/5"
          >
            {/* Outfit Decal / Graphic */}
            <div className="w-6 h-6 bg-surface-container-lowest/90 rounded-full flex items-center justify-center shadow-xs">
              {outfit === 'dino' ? (
                <span className="material-symbols-outlined text-[16px] text-emerald-600">cruelty_free</span>
              ) : outfit === 'strawberry' ? (
                <span className="material-symbols-outlined text-[16px] text-pink-600">nutrition</span>
              ) : outfit === 'astronaut' ? (
                <span className="material-symbols-outlined text-[16px] text-blue-600">rocket_launch</span>
              ) : outfit === 'dungarees' ? (
                <span className="material-symbols-outlined text-[16px] text-amber-600">handyman</span>
              ) : outfit === 'casual' ? (
                <span className="material-symbols-outlined text-[16px] text-indigo-600">star</span>
              ) : (
                <span className="material-symbols-outlined text-[16px] text-rose-500">favorite</span>
              )}
            </div>

            {/* Left Arm: Animated Waving Hand / Cheering arms up */}
            <div
              className={`absolute -left-3 top-0 origin-top-right transition-transform ${
                isJoyJumping
                  ? '-rotate-45 -translate-y-1'
                  : isWaving
                  ? 'animate-wave'
                  : 'hover:-rotate-12'
              }`}
            >
              <div
                style={{ backgroundColor: outfitColor }}
                className="w-3.5 h-8 rounded-full flex items-end justify-center pb-0.5 shadow-sm border border-black/5"
              >
                {/* Cute cartoon round hand */}
                <div style={{ backgroundColor: skinColor }} className="w-3 h-3 rounded-full shadow-inner" />
              </div>
            </div>

            {/* Right Arm: Resting or Raised in Joy / Holding Prop */}
            <div
              className={`absolute -right-3 top-0 origin-top-left transition-transform ${
                isJoyJumping ? 'rotate-45 -translate-y-1' : ''
              }`}
            >
              <div
                style={{ backgroundColor: outfitColor }}
                className="w-3.5 h-8 rounded-full flex items-end justify-center pb-0.5 shadow-sm border border-black/5 relative"
              >
                <div style={{ backgroundColor: skinColor }} className="w-3 h-3 rounded-full shadow-inner" />

                {/* Held Item Slot */}
                {heldItem && (
                  <div className="absolute -right-3 -top-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center border border-amber-300 animate-pulse">
                    <span className="material-symbols-outlined text-[14px] text-amber-500">toys</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legs & Chunky Shoes */}
          <div className="w-12 flex justify-between mt-0.5">
            <div className="w-4 h-3.5 bg-neutral-800 rounded-full shadow-[0_2px_0px_#00000040] flex items-center justify-center">
              <div className="w-2.5 h-1 bg-white rounded-full opacity-60" />
            </div>
            <div className="w-4 h-3.5 bg-neutral-800 rounded-full shadow-[0_2px_0px_#00000040] flex items-center justify-center">
              <div className="w-2.5 h-1 bg-white rounded-full opacity-60" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
