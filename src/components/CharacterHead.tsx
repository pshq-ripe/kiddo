import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CharacterItem } from '../types';

interface CharacterHeadProps {
  character: CharacterItem;
  size?: number | string; // e.g. 40, 56, '100%'
  className?: string;
  showHat?: boolean;
  showGlasses?: boolean;
  isBlinking?: boolean;
  isSmiling?: boolean;
  enableIdleAnimations?: boolean;
  interactive?: boolean;
  onEyeClick?: () => void;
  onMouthClick?: () => void;
}

export const CharacterHead: React.FC<CharacterHeadProps> = ({
  character,
  size = 48,
  className = '',
  showHat = true,
  showGlasses = true,
  isBlinking = false,
  isSmiling = false,
  enableIdleAnimations = true,
  interactive = false,
  onEyeClick,
  onMouthClick
}) => {
  const [internalBlink, setInternalBlink] = useState(false);
  const [internalSmile, setInternalSmile] = useState(false);

  const activeBlink = isBlinking || internalBlink;
  const activeSmile = isSmiling || internalSmile;

  const handleEyeClick = (e: React.MouseEvent) => {
    if (onEyeClick) {
      onEyeClick();
    } else if (interactive) {
      e.stopPropagation();
      setInternalBlink(true);
      setTimeout(() => setInternalBlink(false), 480);
    }
  };

  const handleMouthClick = (e: React.MouseEvent) => {
    if (onMouthClick) {
      onMouthClick();
    } else if (interactive) {
      e.stopPropagation();
      setInternalSmile(true);
      setTimeout(() => setInternalSmile(false), 750);
    }
  };

  const {
    skinColor = '#f9c9b0',
    hairColor = '#785a00',
    hairStyle = 'buns',
    eyeType = 'big-sparkle',
    mouthType = 'joy-open',
    hat = 'none',
    hatColor = '#ff6b8b',
    glasses = 'none',
    currentEmotion = 'Radość'
  } = character;

  // Eyebrow color (soft deep version of hair)
  const browColor = hairColor === '#2c1810' || hairColor === '#1a1a1a' ? '#1c1917' : hairColor;

  // Motion animation definitions
  const eyeBlinkAnimation = activeBlink
    ? {
        scaleY: [1, 0.08, 1, 0.08, 1],
        transition: { duration: 0.45, ease: 'easeInOut' as const }
      }
    : enableIdleAnimations && currentEmotion !== 'Sen'
    ? {
        scaleY: [1, 1, 1, 0.08, 1, 1, 1],
        transition: {
          duration: 3.8,
          repeat: Infinity,
          times: [0, 0.72, 0.85, 0.9, 0.94, 0.97, 1],
          ease: 'easeInOut' as const
        }
      }
    : { scaleY: 1 };

  const mouthSmileAnimation = activeSmile
    ? {
        scale: [1, 1.35, 1.2, 1],
        y: [0, -3.5, -2, 0],
        transition: { duration: 0.75, ease: 'easeOut' as const }
      }
    : enableIdleAnimations
    ? {
        scale: [1, 1.06, 1],
        y: [0, -0.8, 0],
        transition: {
          duration: 2.8,
          repeat: Infinity,
          ease: 'easeInOut' as const
        }
      }
    : { scale: 1, y: 0 };

  const cheeksAnimation = activeSmile
    ? {
        scale: [1, 1.28, 1.15, 1],
        opacity: [0.8, 1, 0.95, 0.8],
        transition: { duration: 0.75, ease: 'easeOut' as const }
      }
    : { scale: 1, opacity: 0.8 };

  const eyebrowsAnimation = activeSmile
    ? {
        y: [0, -4, -2.5, 0],
        transition: { duration: 0.75, ease: 'easeOut' as const }
      }
    : activeBlink
    ? {
        y: [0, 1.8, 0, 1.8, 0],
        transition: { duration: 0.45, ease: 'easeInOut' as const }
      }
    : { y: 0 };

  return (
    <svg
      viewBox="20 4 120 116"
      style={{ width: typeof size === 'number' ? `${size}px` : size, height: typeof size === 'number' ? `${size}px` : size }}
      className={`shrink-0 select-none overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft cheek blush gradient */}
        <radialGradient id={`blush-glow-${character.id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff4d6d" stopOpacity="0.65" />
          <stop offset="70%" stopColor="#ff758f" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ff758f" stopOpacity="0" />
        </radialGradient>

        {/* Eye depth gradient */}
        <linearGradient id={`eye-grad-${character.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="65%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#3f3f46" />
        </linearGradient>

        {/* Gold shine for crown / star glasses */}
        <linearGradient id={`gold-shine-${character.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffe066" />
          <stop offset="50%" stopColor="#ffd166" />
          <stop offset="100%" stopColor="#f4a261" />
        </linearGradient>
      </defs>

      {/* ============================================================ */}
      {/* LAYER 0: BACK HAIR (Drawn behind the head so it never covers the face) */}
      {/* ============================================================ */}
      <g id="hair-back">
        {hairStyle === 'buns' && (
          <>
            {/* Left Big Bun */}
            <circle cx="34" cy="36" r="18" fill={hairColor} />
            <circle cx="34" cy="36" r="14" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeDasharray="4 3" />
            {/* Left Bun Scrunchie */}
            <ellipse cx="44" cy="45" rx="5" ry="8" fill="#70f8e8" transform="rotate(-30 44 45)" />

            {/* Right Big Bun */}
            <circle cx="126" cy="36" r="18" fill={hairColor} />
            <circle cx="126" cy="36" r="14" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeDasharray="4 3" />
            {/* Right Bun Scrunchie */}
            <ellipse cx="116" cy="45" rx="5" ry="8" fill="#ff6b8b" transform="rotate(30 116 45)" />
          </>
        )}

        {hairStyle === 'braids' && (
          <>
            {/* Left Braid cascading behind ear */}
            <g>
              <ellipse cx="28" cy="62" rx="9" ry="8" fill={hairColor} />
              <ellipse cx="25" cy="74" rx="8" ry="7" fill={hairColor} />
              <ellipse cx="23" cy="85" rx="7" ry="6.5" fill={hairColor} />
              <ellipse cx="22" cy="96" rx="6" ry="6" fill={hairColor} />
              {/* Braid ribbon tie */}
              <rect x="17" y="87" width="10" height="4" rx="2" fill="#ff6b8b" />
            </g>
            {/* Right Braid cascading behind ear */}
            <g>
              <ellipse cx="132" cy="62" rx="9" ry="8" fill={hairColor} />
              <ellipse cx="135" cy="74" rx="8" ry="7" fill={hairColor} />
              <ellipse cx="137" cy="85" rx="7" ry="6.5" fill={hairColor} />
              <ellipse cx="138" cy="96" rx="6" ry="6" fill={hairColor} />
              {/* Braid ribbon tie */}
              <rect x="133" y="87" width="10" height="4" rx="2" fill="#70f8e8" />
            </g>
          </>
        )}

        {hairStyle === 'curly' && (
          <g>
            {/* Cloud of bouncy curls behind head */}
            <circle cx="34" cy="42" r="15" fill={hairColor} />
            <circle cx="28" cy="58" r="14" fill={hairColor} />
            <circle cx="30" cy="74" r="13" fill={hairColor} />
            <circle cx="126" cy="42" r="15" fill={hairColor} />
            <circle cx="132" cy="58" r="14" fill={hairColor} />
            <circle cx="130" cy="74" r="13" fill={hairColor} />
            <path d="M 38,36 C 45,18 115,18 122,36 Z" fill={hairColor} />
          </g>
        )}

        {hairStyle === 'bob' && (
          <g>
            {/* Sleek rounded bob volume in the back */}
            <path
              d="M 28,52 C 24,75 30,96 46,98 C 42,88 38,72 40,54 Z"
              fill={hairColor}
            />
            <path
              d="M 132,52 C 136,75 130,96 114,98 C 118,88 122,72 120,54 Z"
              fill={hairColor}
            />
            <path
              d="M 30,50 C 35,20 125,20 130,50 Z"
              fill={hairColor}
            />
          </g>
        )}

        {hairStyle === 'spiky' && (
          <g>
            {/* Anime spiky tufts behind crown */}
            <polygon points="46,38 32,22 52,28" fill={hairColor} />
            <polygon points="62,28 54,10 74,20" fill={hairColor} />
            <polygon points="98,28 106,10 86,20" fill={hairColor} />
            <polygon points="114,38 128,22 108,28" fill={hairColor} />
          </g>
        )}

        {hairStyle === 'short' && (
          <g>
            {/* Soft back volume for short hair */}
            <path d="M 36,44 C 44,22 116,22 124,44 Z" fill={hairColor} />
          </g>
        )}
      </g>

      {/* ============================================================ */}
      {/* LAYER 1: EARS & HEAD BASE (Smooth, adorable chibi face base) */}
      {/* ============================================================ */}
      <g id="ears">
        {/* Left Ear */}
        <ellipse cx="34" cy="71" rx="8.5" ry="10" fill={skinColor} />
        <ellipse cx="35" cy="71" rx="5" ry="6.5" fill="#f4a261" opacity="0.45" />

        {/* Right Ear */}
        <ellipse cx="126" cy="71" rx="8.5" ry="10" fill={skinColor} />
        <ellipse cx="125" cy="71" rx="5" ry="6.5" fill="#f4a261" opacity="0.45" />
      </g>

      <g id="head-base">
        {/* Main Head Shape - wide, sweet, rounded cheeks and soft chin */}
        <path
          d="M 40,48 C 40,24 120,24 120,48 C 124,70 124,94 104,105 C 92,111 68,111 56,105 C 36,94 36,70 40,48 Z"
          fill={skinColor}
        />
        {/* Subtle chin 3D contour shadow */}
        <path
          d="M 58,105 C 70,110 90,110 102,105 C 94,108.5 86,110 80,110 C 74,110 66,108.5 58,105 Z"
          fill="rgba(0,0,0,0.08)"
        />
      </g>

      {/* ============================================================ */}
      {/* LAYER 2: FACIAL FEATURES (PROMINENT, VIBRANT, 100% VISIBLE) */}
      {/* ============================================================ */}
      <g id="facial-features">
        {/* Rosy Cheeks - Big, glowing and sweet */}
        <motion.g
          id="cheeks"
          animate={cheeksAnimation}
          style={{ transformOrigin: '80px 80px' }}
        >
          {/* Left Cheek */}
          <ellipse cx="50" cy="80" rx="10" ry="6" fill={`url(#blush-glow-${character.id})`} />
          <circle cx="48" cy="78" r="1.6" fill="#ffffff" opacity="0.85" />
          <circle cx="52.5" cy="81" r="1" fill="#ffffff" opacity="0.85" />

          {/* Right Cheek */}
          <ellipse cx="110" cy="80" rx="10" ry="6" fill={`url(#blush-glow-${character.id})`} />
          <circle cx="108" cy="78" r="1.6" fill="#ffffff" opacity="0.85" />
          <circle cx="112.5" cy="81" r="1" fill="#ffffff" opacity="0.85" />
        </motion.g>

        {/* Eyebrows - Expressive, matching emotions */}
        <motion.g id="eyebrows" animate={eyebrowsAnimation}>
          {currentEmotion === 'Złość' ? (
            <>
              {/* Slanted determined angry/pout brows */}
              <path d="M 51,53 L 68,58" stroke={browColor} strokeWidth="3" strokeLinecap="round" />
              <path d="M 92,58 L 109,53" stroke={browColor} strokeWidth="3" strokeLinecap="round" />
            </>
          ) : currentEmotion === 'Zdziwienie' ? (
            <>
              {/* Surprised high arched brows */}
              <path d="M 51,50 Q 59,44 68,49" stroke={browColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 92,49 Q 101,44 109,50" stroke={browColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </>
          ) : currentEmotion === 'Śmiech' ? (
            <>
              {/* Joyful raised brows */}
              <path d="M 51,51 Q 60,46 68,50" stroke={browColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 92,50 Q 100,46 109,51" stroke={browColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </>
          ) : currentEmotion === 'Sen' ? (
            <>
              {/* Sleepy gentle brows */}
              <path d="M 52,55 Q 60,56 67,57" stroke={browColor} strokeWidth="2.4" strokeLinecap="round" fill="none" />
              <path d="M 93,57 Q 100,56 108,55" stroke={browColor} strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              {/* Default sweet happy curved brows */}
              <path d="M 51,54 Q 60,49 68,53" stroke={browColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
              <path d="M 92,53 Q 100,49 109,54" stroke={browColor} strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </>
          )}
        </motion.g>

        {/* Eyes - Large, sparkling, animated with character personality */}
        <g
          id="eyes"
          onClick={handleEyeClick}
          className={interactive || onEyeClick ? 'cursor-pointer' : ''}
        >
          {(interactive || onEyeClick) && <title>Kliknij, aby mrugnąć!</title>}
          {/* SLEEP EMOTION: Sweet closed sleeping curved lashes */}
          {currentEmotion === 'Sen' ? (
            <>
              {/* Left sleeping eye */}
              <motion.g
                animate={{ y: [0, -0.8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              >
                <path d="M 52,69 Q 60,76 68,69" stroke="#1c1917" strokeWidth="3.2" strokeLinecap="round" fill="none" />
                <path d="M 66,70 L 70,68" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
              </motion.g>
              {/* Right sleeping eye */}
              <motion.g
                animate={{ y: [0, -0.8, 0] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              >
                <path d="M 92,69 Q 100,76 108,69" stroke="#1c1917" strokeWidth="3.2" strokeLinecap="round" fill="none" />
                <path d="M 106,70 L 110,68" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
              </motion.g>
              {/* Cute sleeping Zzz bubble */}
              <motion.g
                animate={{ y: [-1, -6, -1], opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
              >
                <text x="116" y="58" fill="#3b82f6" fontSize="13" fontWeight="bold" opacity="0.9">z</text>
                <text x="123" y="50" fill="#60a5fa" fontSize="10" fontWeight="bold" opacity="0.8">z</text>
              </motion.g>
            </>
          ) : currentEmotion === 'Śmiech' ? (
            /* LAUGH EMOTION: Joyful crescent squinting smiling eyes */
            <>
              <motion.g
                animate={activeSmile ? { scale: [1, 1.2, 1], y: [0, -1.5, 0] } : eyeBlinkAnimation}
                style={{ transformOrigin: '60px 72px' }}
              >
                <path d="M 52,72 Q 60,62 68,72" stroke="#1c1917" strokeWidth="3.6" strokeLinecap="round" fill="none" />
                <path d="M 68,71 L 71,68" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
              </motion.g>
              <motion.g
                animate={activeSmile ? { scale: [1, 1.2, 1], y: [0, -1.5, 0] } : eyeBlinkAnimation}
                style={{ transformOrigin: '100px 72px' }}
              >
                <path d="M 92,72 Q 100,62 108,72" stroke="#1c1917" strokeWidth="3.6" strokeLinecap="round" fill="none" />
                <path d="M 108,71 L 111,68" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
              </motion.g>
            </>
          ) : eyeType === 'happy-curved' ? (
            /* HAPPY-CURVED EYES */
            <>
              <motion.g animate={eyeBlinkAnimation} style={{ transformOrigin: '60px 71px' }}>
                <path d="M 52,71 Q 60,61 68,71" stroke="#18181b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <path d="M 68,70 L 71,67" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
              </motion.g>
              <motion.g animate={eyeBlinkAnimation} style={{ transformOrigin: '100px 71px' }}>
                <path d="M 92,71 Q 100,61 108,71" stroke="#18181b" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                <path d="M 108,70 L 111,67" stroke="#18181b" strokeWidth="2" strokeLinecap="round" />
              </motion.g>
            </>
          ) : eyeType === 'winking' ? (
            /* WINKING: Left eye sparkles, Right eye winks */
            <>
              {/* Left sparkling eye */}
              <motion.g animate={eyeBlinkAnimation} style={{ transformOrigin: '60px 68px' }}>
                <ellipse cx="60" cy="68" rx="8.5" ry="10" fill={`url(#eye-grad-${character.id})`} />
                <path d="M 50.5,62 Q 60,59.5 69.5,62" stroke="#09090b" strokeWidth="2.8" strokeLinecap="round" />
                {/* Highlights */}
                <ellipse cx="57" cy="65" rx="3.5" ry="4" fill="#ffffff" />
                <circle cx="63.5" cy="71" r="1.8" fill="#ffffff" />
                <circle cx="56" cy="72" r="1" fill="#ffffff" opacity="0.8" />
              </motion.g>
              {/* Right winking eye */}
              <motion.g
                animate={activeBlink ? { scale: [1, 1.25, 1], y: [0, -1, 0] } : {}}
                style={{ transformOrigin: '100px 70px' }}
              >
                <path d="M 92,70 Q 100,61 108,70" stroke="#18181b" strokeWidth="3.6" strokeLinecap="round" fill="none" />
                <path d="M 108,69 L 111,66" stroke="#18181b" strokeWidth="2.2" strokeLinecap="round" />
                {/* Little winking sparkle star */}
                <motion.path
                  animate={
                    activeBlink
                      ? { rotate: [0, 45, -30, 0], scale: [1, 1.45, 1] }
                      : { rotate: [0, 15, -15, 0] }
                  }
                  transition={
                    activeBlink
                      ? { duration: 0.45 }
                      : { repeat: Infinity, duration: 2.4, ease: 'easeInOut' }
                  }
                  style={{ transformOrigin: '100px 61px' }}
                  d="M 100,56 L 101,60 L 105,61 L 101,62 L 100,66 L 99,62 L 95,61 L 99,60 Z"
                  fill="#ffd166"
                />
              </motion.g>
            </>
          ) : eyeType === 'starry' ? (
            /* STARRY EYES: Brilliant stars in pupils */
            <>
              {/* Left Starry Eye */}
              <motion.g animate={eyeBlinkAnimation} style={{ transformOrigin: '60px 68px' }}>
                <ellipse cx="60" cy="68" rx="8.5" ry="10" fill={`url(#eye-grad-${character.id})`} />
                <path d="M 50.5,62 Q 60,59.5 69.5,62" stroke="#09090b" strokeWidth="2.8" strokeLinecap="round" />
                {/* 4-point golden star highlight */}
                <motion.path
                  animate={activeSmile ? { rotate: [0, 90, 180], scale: [1, 1.25, 1] } : { rotate: [0, 12, 0] }}
                  transition={activeSmile ? { duration: 0.75 } : { repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  style={{ transformOrigin: '60px 68px' }}
                  d="M 60,62 L 61.5,66.5 L 66,68 L 61.5,69.5 L 60,74 L 58.5,69.5 L 54,68 L 58.5,66.5 Z"
                  fill="#ffe066"
                />
                <circle cx="56.5" cy="64.5" r="1.5" fill="#ffffff" />
                <circle cx="63.5" cy="71.5" r="1.2" fill="#ffffff" />
              </motion.g>
              {/* Right Starry Eye */}
              <motion.g animate={eyeBlinkAnimation} style={{ transformOrigin: '100px 68px' }}>
                <ellipse cx="100" cy="68" rx="8.5" ry="10" fill={`url(#eye-grad-${character.id})`} />
                <path d="M 90.5,62 Q 100,59.5 109.5,62" stroke="#09090b" strokeWidth="2.8" strokeLinecap="round" />
                {/* 4-point golden star highlight */}
                <motion.path
                  animate={activeSmile ? { rotate: [0, 90, 180], scale: [1, 1.25, 1] } : { rotate: [0, -12, 0] }}
                  transition={activeSmile ? { duration: 0.75 } : { repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  style={{ transformOrigin: '100px 68px' }}
                  d="M 100,62 L 101.5,66.5 L 106,68 L 101.5,69.5 L 100,74 L 98.5,69.5 L 94,68 L 98.5,66.5 Z"
                  fill="#ffe066"
                />
                <circle cx="96.5" cy="64.5" r="1.5" fill="#ffffff" />
                <circle cx="103.5" cy="71.5" r="1.2" fill="#ffffff" />
              </motion.g>
            </>
          ) : (
            /* BIG-SPARKLE EYES (Default Chibi/Anime look) */
            <>
              {/* Left Big Sparkle Eye */}
              <motion.g animate={eyeBlinkAnimation} style={{ transformOrigin: '60px 68px' }}>
                <ellipse cx="60" cy="68" rx="8.5" ry="10" fill={`url(#eye-grad-${character.id})`} />
                <path d="M 50.5,62 Q 60,59.5 69.5,62" stroke="#09090b" strokeWidth="2.8" strokeLinecap="round" />
                {/* Eyelash flick */}
                <path d="M 68,62.5 L 71.5,60.5" stroke="#09090b" strokeWidth="2" strokeLinecap="round" />
                {/* Big white highlight */}
                <ellipse cx="57" cy="65" rx="3.5" ry="4" fill="#ffffff" />
                {/* Secondary twinkle reflection */}
                <circle cx="63.5" cy="71" r="1.8" fill="#ffffff" />
                <circle cx="56" cy="72" r="1" fill="#ffffff" opacity="0.8" />
              </motion.g>
              {/* Right Big Sparkle Eye */}
              <motion.g animate={eyeBlinkAnimation} style={{ transformOrigin: '100px 68px' }}>
                <ellipse cx="100" cy="68" rx="8.5" ry="10" fill={`url(#eye-grad-${character.id})`} />
                <path d="M 90.5,62 Q 100,59.5 109.5,62" stroke="#09090b" strokeWidth="2.8" strokeLinecap="round" />
                {/* Eyelash flick */}
                <path d="M 108,62.5 L 111.5,60.5" stroke="#09090b" strokeWidth="2" strokeLinecap="round" />
                {/* Big white highlight */}
                <ellipse cx="97" cy="65" rx="3.5" ry="4" fill="#ffffff" />
                {/* Secondary twinkle reflection */}
                <circle cx="103.5" cy="71" r="1.8" fill="#ffffff" />
                <circle cx="96" cy="72" r="1" fill="#ffffff" opacity="0.8" />
              </motion.g>
            </>
          )}
        </g>

        {/* Cute Button Nose - Centered between eyes and mouth */}
        <g id="nose">
          <ellipse cx="80" cy="77" rx="3" ry="2.2" fill="#e76f51" opacity="0.4" />
          <circle cx="79.2" cy="76.2" r="0.8" fill="#ffffff" opacity="0.7" />
        </g>

        {/* Mouth - Expressive, clearly visible, animated smiling with Framer Motion */}
        <motion.g
          id="mouth"
          animate={mouthSmileAnimation}
          onClick={handleMouthClick}
          className={interactive || onMouthClick ? 'cursor-pointer' : ''}
          style={{ transformOrigin: '80px 90px' }}
        >
          {(interactive || onMouthClick) && <title>Kliknij, aby się uśmiechnąć!</title>}
          {currentEmotion === 'Śpiew' ? (
            /* SINGING MOUTH: Open musical vocal shape + music notes */
            <g>
              <ellipse cx="80" cy="90" rx="6.5" ry="7.5" fill="#880e4f" stroke="#4a0026" strokeWidth="1.5" />
              <ellipse cx="80" cy="92" rx="4.5" ry="4" fill="#ff7096" />
              {/* Floating musical note */}
              <motion.text
                animate={{ y: [-1, -4, -1], rotate: [0, 8, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                x="89"
                y="87"
                fill="#ff4081"
                fontSize="12"
                fontWeight="bold"
              >
                ♪
              </motion.text>
            </g>
          ) : currentEmotion === 'Złość' || mouthType === 'pout' ? (
            /* POUT / ANGRY MOUTH: Cute determined little downward pout */
            <path
              d="M 74,93 Q 80,87.5 86,93"
              stroke="#751a2d"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
            />
          ) : currentEmotion === 'Zdziwienie' || mouthType === 'o-mouth' ? (
            /* SURPRISED 'O' MOUTH */
            <g>
              <ellipse cx="80" cy="90" rx="5" ry="6.5" fill="#880e4f" stroke="#4a0026" strokeWidth="1.5" />
              <circle cx="78.5" cy="88" r="1.5" fill="#ffffff" opacity="0.8" />
            </g>
          ) : mouthType === 'cat-mouth' ? (
            /* CAT-MOUTH (:3) */
            <g>
              <path
                d="M 73,88 Q 76.5,93 80,89.5 Q 83.5,93 87,88"
                stroke="#690a20"
                strokeWidth="2.8"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="80" cy="91.5" r="1.5" fill="#ff85a1" />
            </g>
          ) : mouthType === 'big-smile' ? (
            /* BIG-SMILE: Wide beaming curved grin */
            <g>
              <path
                d="M 71,87 Q 80,98 89,87"
                stroke="#690a20"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Cheek corner dimples */}
              <path d="M 70,85.5 Q 69,87 70,88.5" stroke="#690a20" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 90,85.5 Q 91,87 90,88.5" stroke="#690a20" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            /* JOY-OPEN: Cheerful open smile with white teeth & rosy tongue */
            <g>
              <path
                d="M 72,87 C 72,87 74,101 80,101 C 86,101 88,87 88,87 Z"
                fill="#880e4f"
                stroke="#4a0026"
                strokeWidth="1.5"
              />
              {/* White upper teeth arc */}
              <path
                d="M 73.5,87.5 C 75.5,90.5 84.5,90.5 86.5,87.5 Z"
                fill="#ffffff"
              />
              {/* Rosy tongue */}
              <path
                d="M 74.5,95.5 C 76.5,92.5 83.5,92.5 85.5,95.5 C 83.5,99.5 76.5,99.5 74.5,95.5 Z"
                fill="#ff7096"
              />
            </g>
          )}
        </motion.g>
      </g>

      {/* ============================================================ */}
      {/* LAYER 3: FRONT HAIR & BANGS (Resting high on forehead only!) */}
      {/* CRITICAL: Bangs stop above eyebrows so face is 100% visible! */}
      {/* ============================================================ */}
      <g id="hair-front">
        {hairStyle === 'buns' && (
          <g>
            {/* Arched cute fringe high on forehead */}
            <path
              d="M 38,44 C 45,28 115,28 122,44 C 114,42 104,36 94,38 C 84,40 76,40 66,38 C 56,36 46,42 38,44 Z"
              fill={hairColor}
            />
            {/* Soft hair strand highlight */}
            <path
              d="M 52,32 C 65,27 95,27 108,32"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Left temple wisps */}
            <path d="M 38,44 C 36,54 38,62 40,65 C 39,58 39,50 40,44 Z" fill={hairColor} />
            {/* Right temple wisps */}
            <path d="M 122,44 C 124,54 122,62 120,65 C 121,58 121,50 120,44 Z" fill={hairColor} />
          </g>
        )}

        {hairStyle === 'braids' && (
          <g>
            {/* Neat French fringe above browline */}
            <path
              d="M 38,44 C 44,28 116,28 122,44 C 112,41 98,40 80,43 C 62,40 48,41 38,44 Z"
              fill={hairColor}
            />
            <path
              d="M 50,33 C 65,28 95,28 110,33"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Side framing strands */}
            <path d="M 38,44 C 36,56 36,66 38,70 C 37,60 38,50 40,44 Z" fill={hairColor} />
            <path d="M 122,44 C 124,56 124,66 122,70 C 123,60 122,50 120,44 Z" fill={hairColor} />
          </g>
        )}

        {hairStyle === 'curly' && (
          <g>
            {/* Bouncy cute curls resting at crown / top hairline */}
            <circle cx="50" cy="36" r="10" fill={hairColor} />
            <circle cx="68" cy="32" r="11" fill={hairColor} />
            <circle cx="92" cy="32" r="11" fill={hairColor} />
            <circle cx="110" cy="36" r="10" fill={hairColor} />
            <circle cx="80" cy="35" r="9" fill={hairColor} />
            <circle cx="68" cy="30" r="3" fill="rgba(255,255,255,0.25)" />
            <circle cx="92" cy="30" r="3" fill="rgba(255,255,255,0.25)" />
          </g>
        )}

        {hairStyle === 'bob' && (
          <g>
            {/* Chic straight bob bangs cut clean and high */}
            <path
              d="M 38,46 C 45,26 115,26 122,46 C 110,42 98,39 80,41 C 62,39 50,42 38,46 Z"
              fill={hairColor}
            />
            <path
              d="M 48,33 C 62,28 98,28 112,33"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Sleek bob side curves */}
            <path d="M 38,46 C 35,60 36,75 40,82 C 37,70 36,58 39,46 Z" fill={hairColor} />
            <path d="M 122,46 C 125,60 124,75 120,82 C 123,70 124,58 121,46 Z" fill={hairColor} />
          </g>
        )}

        {hairStyle === 'spiky' && (
          <g>
            {/* Dynamic anime bangs swept sideways above brows */}
            <polygon points="46,44 58,26 68,40" fill={hairColor} />
            <polygon points="66,40 82,22 92,39" fill={hairColor} />
            <polygon points="90,39 108,25 116,44" fill={hairColor} />
            <path d="M 38,44 C 44,28 116,28 122,44 C 110,42 95,38 80,41 C 65,38 50,42 38,44 Z" fill={hairColor} />
          </g>
        )}

        {hairStyle === 'short' && (
          <g>
            {/* Neat textured crop */}
            <path
              d="M 38,44 C 45,26 115,26 122,44 C 112,41 98,38 80,40 C 62,38 48,41 38,44 Z"
              fill={hairColor}
            />
            <polygon points="62,40 70,32 78,41" fill={hairColor} />
            <polygon points="82,41 90,32 98,40" fill={hairColor} />
          </g>
        )}
      </g>

      {/* ============================================================ */}
      {/* LAYER 4: GLASSES (Translucent lenses so eyes shine through!) */}
      {/* ============================================================ */}
      {showGlasses && glasses !== 'none' && (
        <g id="glasses">
          {glasses === 'heart' && (
            <g>
              {/* Left Heart */}
              <path
                d="M 47,64 C 47,59 52,57 57,61 C 62,57 67,59 67,64 C 67,71 57,78 57,78 C 57,78 47,71 47,64 Z"
                fill="#ff4081"
                fillOpacity="0.22"
                stroke="#d81b60"
                strokeWidth="2.5"
              />
              <path d="M 49,63 C 49,60 52,59 54,61" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />

              {/* Right Heart */}
              <path
                d="M 93,64 C 93,59 98,57 103,61 C 108,57 113,59 113,64 C 113,71 103,78 103,78 C 103,78 93,71 93,64 Z"
                fill="#ff4081"
                fillOpacity="0.22"
                stroke="#d81b60"
                strokeWidth="2.5"
              />
              <path d="M 95,63 C 95,60 98,59 100,61" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />

              {/* Bridge */}
              <path d="M 67,65 Q 80,63 93,65" stroke="#d81b60" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {glasses === 'round' && (
            <g>
              {/* Left Round */}
              <circle
                cx="60"
                cy="68"
                r="13"
                fill="#00e5ff"
                fillOpacity="0.18"
                stroke="#00838f"
                strokeWidth="2.5"
              />
              {/* Lens shine reflection */}
              <path d="M 52,62 L 56,58" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
              <path d="M 54,67 L 62,59" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

              {/* Right Round */}
              <circle
                cx="100"
                cy="68"
                r="13"
                fill="#00e5ff"
                fillOpacity="0.18"
                stroke="#00838f"
                strokeWidth="2.5"
              />
              {/* Lens shine reflection */}
              <path d="M 92,62 L 96,58" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
              <path d="M 94,67 L 102,59" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

              {/* Bridge */}
              <path d="M 73,67 Q 80,63 87,67" stroke="#00838f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {glasses === 'star' && (
            <g>
              {/* Left Star Frame */}
              <polygon
                points="60,55 63,63 72,64 65,70 67,79 60,74 53,79 55,70 48,64 57,63"
                fill="#ffd600"
                fillOpacity="0.24"
                stroke="#f57f17"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              {/* Right Star Frame */}
              <polygon
                points="100,55 103,63 112,64 105,70 107,79 100,74 93,79 95,70 88,64 97,63"
                fill="#ffd600"
                fillOpacity="0.24"
                stroke="#f57f17"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              {/* Bridge */}
              <path d="M 72,66 Q 80,63 88,66" stroke="#f57f17" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </g>
          )}
        </g>
      )}

      {/* ============================================================ */}
      {/* LAYER 5: HATS & ACCESSORIES (Perched on crown above forehead) */}
      {/* ============================================================ */}
      {showHat && hat !== 'none' && (
        <g id="hat">
          {hat === 'cat-ears' && (
            <g>
              {/* Headband base arc */}
              <path
                d="M 38,40 C 45,24 115,24 122,40"
                stroke="#d81b60"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Left Cat Ear */}
              <polygon points="40,38 48,10 65,30" fill={hatColor || '#ff4081'} stroke="#c2185b" strokeWidth="1.5" />
              <polygon points="44,34 50,16 61,29" fill="#ffcdd2" />

              {/* Right Cat Ear */}
              <polygon points="120,38 112,10 95,30" fill={hatColor || '#ff4081'} stroke="#c2185b" strokeWidth="1.5" />
              <polygon points="116,34 110,16 99,29" fill="#ffcdd2" />

              {/* Little cute center bow or bell */}
              <circle cx="80" cy="27" r="3.5" fill="#ffd166" stroke="#c09732" strokeWidth="1" />
            </g>
          )}

          {hat === 'crown' && (
            <g>
              {/* 3-Point Royal Gold Crown */}
              <polygon
                points="52,34 56,12 70,24 80,6 90,24 104,12 108,34"
                fill={`url(#gold-shine-${character.id})`}
                stroke="#c09732"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              {/* Crown Base Band with jewels */}
              <rect x="52" y="32" width="56" height="6" rx="3" fill="#c09732" />
              <circle cx="80" cy="35" r="2" fill="#e91e63" />
              <circle cx="66" cy="35" r="1.6" fill="#00bcd4" />
              <circle cx="94" cy="35" r="1.6" fill="#00bcd4" />

              {/* Peak Jewels */}
              <circle cx="80" cy="6" r="3" fill="#e91e63" />
              <circle cx="56" cy="12" r="2.5" fill="#00bcd4" />
              <circle cx="104" cy="12" r="2.5" fill="#00bcd4" />
            </g>
          )}

          {hat === 'beanie' && (
            <g>
              {/* Cozy knit pom-pom */}
              <circle cx="80" cy="8" r="8" fill="#ffd166" />
              <circle cx="80" cy="8" r="5" fill="#ffffff" opacity="0.3" />

              {/* Beanie main dome */}
              <path
                d="M 44,38 C 42,16 118,16 116,38 Z"
                fill={hatColor || '#c09732'}
              />

              {/* Ribbed knit brim */}
              <rect
                x="40"
                y="34"
                width="80"
                height="10"
                rx="5"
                fill="#ffdf9b"
                stroke="#c09732"
                strokeWidth="1.5"
              />
              {/* Ribbed lines */}
              <line x1="55" y1="35" x2="55" y2="43" stroke="#c09732" strokeWidth="1" />
              <line x1="70" y1="35" x2="70" y2="43" stroke="#c09732" strokeWidth="1" />
              <line x1="80" y1="35" x2="80" y2="43" stroke="#c09732" strokeWidth="1" />
              <line x1="90" y1="35" x2="90" y2="43" stroke="#c09732" strokeWidth="1" />
              <line x1="105" y1="35" x2="105" y2="43" stroke="#c09732" strokeWidth="1" />
            </g>
          )}

          {hat === 'cap' && (
            <g>
              {/* Baseball cap dome */}
              <path
                d="M 44,38 C 44,18 116,18 116,38 Z"
                fill="#2563eb"
              />
              {/* Cap button on crown */}
              <circle cx="80" cy="20" r="3" fill="#1d4ed8" />

              {/* Curved visor brim */}
              <path
                d="M 36,38 C 55,34 105,34 124,38 C 112,46 48,46 36,38 Z"
                fill="#1d4ed8"
              />
            </g>
          )}
        </g>
      )}
    </svg>
  );
};
