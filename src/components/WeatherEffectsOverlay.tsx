import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { WeatherType } from '../types';
import { sound } from '../utils/sound';
import { unlockAchievement } from '../utils/achievementManager';

interface WeatherEffectsOverlayProps {
  weather: WeatherType;
  onWeatherChange?: (weather: WeatherType) => void;
}

interface RainSplashItem {
  id: string;
  x: number;
  y: number;
  size: number;
  word: string;
  beads: {
    id: number;
    targetX: number;
    targetY: number;
    size: number;
    color: string;
  }[];
}

interface SnowBloomItem {
  id: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
  word: string;
  sparkles: {
    id: number;
    targetX: number;
    targetY: number;
    char: string;
    rot: number;
    color: string;
  }[];
}

interface GenericBurstItem {
  id: string;
  x: number;
  y: number;
  icon: string;
  word: string;
  color: string;
  borderColor: string;
}

export const WeatherEffectsOverlay: React.FC<WeatherEffectsOverlayProps> = ({
  weather,
  onWeatherChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchTime = useRef<number>(0);

  // Interactive Touch Reaction States
  const [rainSplashes, setRainSplashes] = useState<RainSplashItem[]>([]);
  const [snowBlooms, setSnowBlooms] = useState<SnowBloomItem[]>([]);
  const [genericBursts, setGenericBursts] = useState<GenericBurstItem[]>([]);

  // Counters for child satisfaction & achievements
  const [rainSplashedCount, setRainSplashedCount] = useState<number>(0);
  const [snowBloomedCount, setSnowBloomedCount] = useState<number>(0);
  const [sunExcited, setSunExcited] = useState<boolean>(false);

  // Splash words pool
  const rainWords = ['Plusk! 💦', 'Kap! 💧', 'Chlap!', 'Plusk, plusk! 🌊', 'Ochlap! ✨'];
  const snowWords = ['Rozkwit! ❄️', 'Kryształek! 💎', 'Puch! ✻', 'Igiełka! ❅', 'Cud! ✨'];

  // Trigger Raindrop Splashing / Shattering Effect
  const triggerRainSplash = (x: number, y: number, customSize = 48) => {
    sound.playRainSplash();

    const splashId = `splash-${Date.now()}-${Math.random()}`;
    const word = rainWords[Math.floor(Math.random() * rainWords.length)];

    // 8-10 water droplet beads shooting radially with gravity arc
    const beadCount = 8;
    const beads = Array.from({ length: beadCount }, (_, i) => {
      const angle = (i * (360 / beadCount) + (Math.random() - 0.5) * 25) * (Math.PI / 180);
      const dist = 28 + Math.random() * 26;
      return {
        id: i,
        targetX: Math.cos(angle) * dist,
        targetY: Math.sin(angle) * dist + 16, // Gravity pull downward
        size: 3 + Math.random() * 4,
        color: i % 2 === 0 ? '#38bdf8' : '#0ea5e9'
      };
    });

    const newSplash: RainSplashItem = {
      id: splashId,
      x,
      y,
      size: customSize,
      word,
      beads
    };

    setRainSplashes(prev => [...prev.slice(-12), newSplash]);
    setRainSplashedCount(prev => {
      const next = prev + 1;
      if (next === 10) {
        unlockAchievement('weather_wizard');
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
        sound.playSuccess();
      }
      return next;
    });

    // Cleanup splash after animation completes
    setTimeout(() => {
      setRainSplashes(prev => prev.filter(s => s.id !== splashId));
    }, 850);
  };

  // Trigger Snowflake Blooming / Crystal Blossom Effect
  const triggerSnowBloom = (x: number, y: number, customSize = 64) => {
    sound.playSnowBloom();

    const bloomId = `bloom-${Date.now()}-${Math.random()}`;
    const word = snowWords[Math.floor(Math.random() * snowWords.length)];
    const chars = ['❄️', '❅', '✻', '✨', '💎', '★', '•'];

    // 8 crystal sparkles and shards drifting outward
    const sparkleCount = 8;
    const sparkles = Array.from({ length: sparkleCount }, (_, i) => {
      const angle = (i * (360 / sparkleCount) + (Math.random() - 0.5) * 20) * (Math.PI / 180);
      const dist = 32 + Math.random() * 32;
      return {
        id: i,
        targetX: Math.cos(angle) * dist,
        targetY: Math.sin(angle) * dist,
        char: chars[i % chars.length],
        rot: (Math.random() - 0.5) * 90,
        color: i % 2 === 0 ? '#e0f2fe' : '#7dd3fc'
      };
    });

    const newBloom: SnowBloomItem = {
      id: bloomId,
      x,
      y,
      size: customSize,
      rotation: Math.random() * 60 - 30,
      word,
      sparkles
    };

    setSnowBlooms(prev => [...prev.slice(-12), newBloom]);
    setSnowBloomedCount(prev => {
      const next = prev + 1;
      if (next === 10) {
        unlockAchievement('weather_wizard');
        confetti({ particleCount: 35, spread: 70, origin: { y: 0.6 } });
        sound.playSuccess();
      }
      return next;
    });

    // Cleanup bloom after animation completes
    setTimeout(() => {
      setSnowBlooms(prev => prev.filter(b => b.id !== bloomId));
    }, 1050);
  };

  // Generic Burst for Sun, Rainbow, Night
  const triggerGenericBurst = (x: number, y: number) => {
    const burstId = `burst-${Date.now()}-${Math.random()}`;
    let icon = '✨';
    let word = 'Iskierka! ✨';
    let color = '#fef08a';
    let borderColor = '#facc15';

    if (weather === 'sun') {
      icon = '☀️';
      word = 'Ciepełko! ☀️';
      color = '#fde047';
      borderColor = '#f59e0b';
      sound.playSparkle();
    } else if (weather === 'rainbow') {
      icon = '🌈';
      word = 'Magia! 🌈';
      color = '#f472b6';
      borderColor = '#c084fc';
      sound.playSparkle();
    } else if (weather === 'night') {
      icon = '🌟';
      word = 'Gwiezdny pył! 🌟';
      color = '#bae6fd';
      borderColor = '#38bdf8';
      sound.playSparkle();
    }

    const newBurst: GenericBurstItem = {
      id: burstId,
      x,
      y,
      icon,
      word,
      color,
      borderColor
    };

    setGenericBursts(prev => [...prev.slice(-10), newBurst]);
    setTimeout(() => {
      setGenericBursts(prev => prev.filter(b => b.id !== burstId));
    }, 850);
  };

  // Global Passive Touch Listener on Phone Screen Container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Attach to parent element (the phone screen viewport)
    const targetElement = container.parentElement || container;

    const handlePointerDown = (e: PointerEvent) => {
      // Don't trigger if user explicitly clicked navigation or interactive top buttons
      const target = e.target as HTMLElement | null;
      if (target?.closest('button') || target?.closest('a') || target?.closest('[data-no-weather-tap]')) {
        // Still allow button clicks without creating overlay distortion
        return;
      }

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Ensure tap is within the screen bounds
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

      lastTouchTime.current = Date.now();

      if (weather === 'rain') {
        triggerRainSplash(x, y);
      } else if (weather === 'snow') {
        triggerSnowBloom(x, y);
      } else {
        triggerGenericBurst(x, y);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Respond to touch drag / finger swipe across screen with throttle
      if (e.buttons === 0 && e.pointerType === 'mouse') return;

      const now = Date.now();
      if (now - lastTouchTime.current < 110) return; // Smooth 110ms throttle

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x < 0 || x > rect.width || y < 0 || y > rect.height) return;

      lastTouchTime.current = now;

      if (weather === 'rain') {
        triggerRainSplash(x, y, 36);
      } else if (weather === 'snow') {
        triggerSnowBloom(x, y, 48);
      }
    };

    targetElement.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });
    targetElement.addEventListener('pointermove', handlePointerMove, { capture: true, passive: true });

    return () => {
      targetElement.removeEventListener('pointerdown', handlePointerDown, { capture: true });
      targetElement.removeEventListener('pointermove', handlePointerMove, { capture: true });
    };
  }, [weather]);

  // Pre-configured snowflakes for snow variant
  const snowflakes = [
    { id: 1, left: '6%', size: 'text-[22px]', duration: '5.2s', delay: '0s', char: '❄' },
    { id: 2, left: '16%', size: 'text-[16px]', duration: '6.8s', delay: '1.2s', char: '❅' },
    { id: 3, left: '26%', size: 'text-[26px]', duration: '4.6s', delay: '2.4s', char: '❄' },
    { id: 4, left: '38%', size: 'text-[18px]', duration: '7.2s', delay: '0.5s', char: '✻' },
    { id: 5, left: '48%', size: 'text-[20px]', duration: '5.8s', delay: '3.1s', char: '❅' },
    { id: 6, left: '58%', size: 'text-[24px]', duration: '5.0s', delay: '1.8s', char: '❄' },
    { id: 7, left: '68%', size: 'text-[17px]', duration: '6.5s', delay: '0.9s', char: '✻' },
    { id: 8, left: '78%', size: 'text-[28px]', duration: '4.8s', delay: '2.8s', char: '❄' },
    { id: 9, left: '88%', size: 'text-[19px]', duration: '6.0s', delay: '1.5s', char: '❅' },
    { id: 10, left: '94%', size: 'text-[14px]', duration: '7.5s', delay: '3.6s', char: '•' },
    { id: 11, left: '12%', size: 'text-[24px]', duration: '5.5s', delay: '4.0s', char: '❄' },
    { id: 12, left: '32%', size: 'text-[18px]', duration: '6.2s', delay: '4.5s', char: '❅' },
    { id: 13, left: '64%', size: 'text-[20px]', duration: '5.1s', delay: '3.9s', char: '❄' },
    { id: 14, left: '82%', size: 'text-[16px]', duration: '6.9s', delay: '4.2s', char: '✻' }
  ];

  // Pre-configured raindrops for rain variant
  const raindrops = [
    { id: 1, left: '8%', height: 'h-6', duration: '1.1s', delay: '0s' },
    { id: 2, left: '18%', height: 'h-7', duration: '0.9s', delay: '0.3s' },
    { id: 3, left: '28%', height: 'h-5', duration: '1.3s', delay: '0.6s' },
    { id: 4, left: '39%', height: 'h-7', duration: '1.0s', delay: '0.1s' },
    { id: 5, left: '49%', height: 'h-6', duration: '1.2s', delay: '0.5s' },
    { id: 6, left: '61%', height: 'h-7', duration: '0.95s', delay: '0.2s' },
    { id: 7, left: '72%', height: 'h-5', duration: '1.15s', delay: '0.7s' },
    { id: 8, left: '82%', height: 'h-7', duration: '1.05s', delay: '0.4s' },
    { id: 9, left: '92%', height: 'h-6', duration: '0.85s', delay: '0.15s' },
    { id: 10, left: '14%', height: 'h-5', duration: '1.25s', delay: '0.8s' },
    { id: 11, left: '54%', height: 'h-6', duration: '1.0s', delay: '0.65s' },
    { id: 12, left: '76%', height: 'h-7', duration: '0.9s', delay: '0.35s' }
  ];

  // Stars for night variant
  const stars = [
    { id: 1, top: '8%', left: '15%', size: 'text-[14px]', delay: '0s', pulse: 'animate-pulse' },
    { id: 2, top: '14%', left: '72%', size: 'text-[18px]', delay: '0.7s', pulse: 'animate-ping' },
    { id: 3, top: '22%', left: '35%', size: 'text-[12px]', delay: '1.2s', pulse: 'animate-pulse' },
    { id: 4, top: '28%', left: '88%', size: 'text-[16px]', delay: '0.3s', pulse: 'animate-pulse' },
    { id: 5, top: '35%', left: '10%', size: 'text-[11px]', delay: '1.8s', pulse: 'animate-ping' },
    { id: 6, top: '42%', left: '55%', size: 'text-[15px]', delay: '0.9s', pulse: 'animate-pulse' },
    { id: 7, top: '50%', left: '25%', size: 'text-[13px]', delay: '1.5s', pulse: 'animate-pulse' },
    { id: 8, top: '58%', left: '80%', size: 'text-[16px]', delay: '0.5s', pulse: 'animate-ping' },
    { id: 9, top: '65%', left: '42%', size: 'text-[12px]', delay: '2.1s', pulse: 'animate-pulse' },
    { id: 10, top: '75%', left: '18%', size: 'text-[14px]', delay: '1.1s', pulse: 'animate-pulse' }
  ];

  // Sun sparkles
  const sunSpecks = [
    { id: 1, left: '75%', top: '22%', delay: '0s', duration: '3.8s' },
    { id: 2, left: '60%', top: '16%', delay: '1.2s', duration: '4.2s' },
    { id: 3, left: '85%', top: '28%', delay: '2.0s', duration: '3.5s' },
    { id: 4, left: '68%', top: '34%', delay: '0.7s', duration: '4.5s' },
    { id: 5, left: '82%', top: '12%', delay: '2.7s', duration: '3.2s' }
  ];

  const handleSunTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playSparkle();
    sound.playBoing();
    setSunExcited(true);
    setTimeout(() => setSunExcited(false), 900);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      triggerGenericBurst(rect.width - 50, 50);
    }
    if (onWeatherChange) {
      // playful sun tap
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden z-25 select-none transition-all duration-700"
    >
      {/* ========================================================================= */}
      {/* INTERACTIVE HINT & DISCOVERY PILL                                         */}
      {/* ========================================================================= */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-35 pointer-events-auto">
        {weather === 'rain' && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              const rect = containerRef.current?.getBoundingClientRect();
              if (rect) triggerRainSplash(rect.width / 2, 70);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/85 backdrop-blur-xs text-white border border-cyan-400/50 shadow-md text-[11px] font-extrabold cursor-pointer"
            title="Dotknij, aby rozbijać krople deszczu!"
          >
            <span className="text-[14px]">🌧️</span>
            <span>Dotknij, aby rozbić krople!</span>
            {rainSplashedCount > 0 && (
              <span className="bg-cyan-500 text-cyan-950 px-1.5 py-0.2 rounded-full font-black text-[10px]">
                {rainSplashedCount} 💦
              </span>
            )}
          </motion.button>
        )}

        {weather === 'snow' && (
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              const rect = containerRef.current?.getBoundingClientRect();
              if (rect) triggerSnowBloom(rect.width / 2, 70);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/85 backdrop-blur-xs text-white border border-sky-300/50 shadow-md text-[11px] font-extrabold cursor-pointer"
            title="Dotknij, aby płatki śniegu rozkwitały!"
          >
            <span className="text-[14px]">❄️</span>
            <span>Dotknij, aby płatki rozkwitły!</span>
            {snowBloomedCount > 0 && (
              <span className="bg-sky-400 text-sky-950 px-1.5 py-0.2 rounded-full font-black text-[10px]">
                {snowBloomedCount} ❄️
              </span>
            )}
          </motion.button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. ANIMATED SUN VARIANT ('sun')                                           */}
      {/* ========================================================================= */}
      {weather === 'sun' && (
        <div className="absolute inset-0 transition-opacity duration-700">
          {/* Gentle warm golden atmospheric gradient at top */}
          <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-amber-300/20 via-yellow-200/10 to-transparent"></div>

          {/* Glowing Radial Golden Aura */}
          <div className="absolute top-3 right-3 w-40 h-40 rounded-full bg-radial from-amber-300/35 via-yellow-200/15 to-transparent blur-xl animate-sun-pulse"></div>

          {/* Interactive Smiling Cartoon Sun in Top-Right Corner */}
          <motion.div
            onClick={handleSunTap}
            animate={sunExcited ? { rotate: [0, 180, 360], scale: [1, 1.25, 1] } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute top-4 right-4 pointer-events-auto cursor-pointer group transition-transform active:scale-90"
            title="Dotknij wesołego słoneczka! ☀️"
          >
            {/* Spinning Sun Rays Disc */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 animate-sun-rays flex items-center justify-center">
                {/* 12 Sunbeam Rays */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
                  <div
                    key={deg}
                    style={{ transform: `rotate(${deg}deg) translateY(-22px)` }}
                    className="absolute w-2 h-7 rounded-full bg-gradient-to-t from-amber-400 to-yellow-300 shadow-xs"
                  />
                ))}
              </div>

              {/* Sun Core Disc with Happy Face */}
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-yellow-100 shadow-[0_4px_16px_rgba(245,158,11,0.5)] border-2 border-yellow-200 flex flex-col items-center justify-center animate-sun-pulse">
                {/* Eyes */}
                <div className="flex items-center gap-2.5 mt-1">
                  <div className="w-2 h-2.5 bg-amber-950 rounded-full flex items-start justify-end p-[1px]">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                  <div className="w-2 h-2.5 bg-amber-950 rounded-full flex items-start justify-end p-[1px]">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                </div>

                {/* Rosy Cheeks & Smile */}
                <div className="flex items-center justify-between w-9 mt-0.5 px-0.5">
                  <div className="w-2 h-1.5 rounded-full bg-pink-400/80"></div>
                  {/* Smile */}
                  <div className="w-3.5 h-2 border-b-2 border-amber-950 rounded-full"></div>
                  <div className="w-2 h-1.5 rounded-full bg-pink-400/80"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating warm sun dust / golden sparkles */}
          {sunSpecks.map(speck => (
            <div
              key={speck.id}
              style={{
                left: speck.left,
                top: speck.top,
                animationDelay: speck.delay,
                animationDuration: speck.duration
              }}
              className="absolute pointer-events-none animate-sun-speck text-amber-400 drop-shadow-sm font-bold text-[14px]"
            >
              ✦
            </div>
          ))}

          {/* Tiny gentle drifting clouds */}
          <div className="absolute top-16 left-6 animate-cloud-drift opacity-60">
            <div className="bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-bold text-sky-700 shadow-xs flex items-center gap-1 border border-white">
              <span>☁️</span>
              <span>Ciepły wiaterek</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ANIMATED FALLING SNOW VARIANT ('snow')                                 */}
      {/* ========================================================================= */}
      {weather === 'snow' && (
        <div className="absolute inset-0 transition-opacity duration-700">
          {/* Icy winter cool atmospheric vignette */}
          <div className="absolute inset-0 bg-radial from-transparent via-cyan-900/5 to-sky-400/15 pointer-events-none"></div>

          {/* Floating Winter Cloud at Top */}
          <div className="absolute top-2 left-4 animate-cloud-drift opacity-90">
            <div className="bg-sky-100/90 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-extrabold text-sky-900 shadow-sm border border-sky-200 flex items-center gap-1.5">
              <span className="text-[14px]">🌨️</span>
              <span>Zimowy Śnieżek</span>
              <span className="bg-sky-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">-2°C</span>
            </div>
          </div>

          {/* Interactive Falling Snowflakes across the viewport */}
          {snowflakes.map(flake => (
            <div
              key={flake.id}
              style={{
                left: flake.left,
                top: '-24px',
                animationDelay: flake.delay,
                animationDuration: flake.duration
              }}
              className={`absolute animate-snowfall pointer-events-auto cursor-pointer p-3 -m-3 select-none ${flake.size}`}
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const parentRect = containerRef.current?.getBoundingClientRect();
                if (parentRect) {
                  triggerSnowBloom(
                    rect.left + rect.width / 2 - parentRect.left,
                    rect.top + rect.height / 2 - parentRect.top,
                    72
                  );
                }
              }}
              title="Dotknij płatka śniegu, aby rozkwitł! ❄️"
            >
              <span className="text-white drop-shadow-[0_2px_6px_rgba(56,189,248,0.85)] font-bold active:scale-125 transition-transform inline-block">
                {flake.char}
              </span>
            </div>
          ))}

          {/* Fluffy Snowdrifts & Little Snowman Peeking at Bottom */}
          <div className="absolute bottom-16 inset-x-0 pointer-events-none flex items-end justify-between px-3">
            {/* Snowbank left */}
            <div className="bg-gradient-to-t from-sky-100/90 to-sky-50/40 backdrop-blur-xs px-3.5 py-1.5 rounded-t-2xl border-t border-sky-200/80 shadow-xs flex items-center gap-1">
              <span className="text-[14px]">⛄</span>
              <span className="text-[10px] font-bold text-sky-900">Ulepiliśmy bałwanka!</span>
            </div>

            {/* Snowbank right */}
            <div className="bg-gradient-to-t from-sky-100/90 to-sky-50/40 backdrop-blur-xs px-3 py-1 rounded-t-2xl border-t border-sky-200/80 shadow-xs flex items-center gap-1">
              <span className="text-[13px]">❄️</span>
              <span className="text-[10px] font-extrabold text-sky-800">Dotknij płatków!</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. ANIMATED RAIN VARIANT ('rain')                                         */}
      {/* ========================================================================= */}
      {weather === 'rain' && (
        <div className="absolute inset-0 transition-opacity duration-700">
          {/* Subtle fresh rain cool gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900/10 via-cyan-900/5 to-teal-900/10 pointer-events-none"></div>

          {/* Top Rain Cloud */}
          <div className="absolute top-2 right-4 animate-cloud-drift opacity-90">
            <div className="bg-cyan-100/95 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-extrabold text-cyan-950 shadow-sm border border-cyan-200 flex items-center gap-1.5">
              <span className="text-[14px]">🌧️</span>
              <span>Ciepły Deszczyk</span>
              <span className="text-[10px] font-bold text-cyan-800">Plusk, plusk!</span>
            </div>
          </div>

          {/* Interactive Falling Rain Streaks */}
          {raindrops.map(drop => (
            <div
              key={drop.id}
              style={{
                left: drop.left,
                top: '-30px',
                animationDelay: drop.delay,
                animationDuration: drop.duration
              }}
              className="absolute animate-rainfall pointer-events-auto cursor-pointer p-3.5 -m-3.5 flex items-center justify-center select-none"
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const parentRect = containerRef.current?.getBoundingClientRect();
                if (parentRect) {
                  triggerRainSplash(
                    rect.left + rect.width / 2 - parentRect.left,
                    rect.top + rect.height / 2 - parentRect.top,
                    56
                  );
                }
              }}
              title="Dotknij kropli deszczu, aby ją rozbić! 💦"
            >
              <div
                className={`w-[3px] ${drop.height} bg-gradient-to-b from-cyan-200 via-cyan-400 to-sky-500 rounded-full opacity-85 shadow-[0_0_6px_rgba(56,189,248,0.8)]`}
              />
            </div>
          ))}

          {/* Puddle Splash Ripples at the bottom */}
          <div className="absolute bottom-20 inset-x-0 flex justify-around pointer-events-none px-6">
            <div className="relative w-8 h-3 flex items-center justify-center">
              <div className="w-7 h-2.5 rounded-full border border-cyan-400/80 animate-rain-ripple"></div>
            </div>
            <div className="relative w-8 h-3 flex items-center justify-center" style={{ animationDelay: '0.4s' }}>
              <div className="w-8 h-3 rounded-full border border-sky-400/80 animate-rain-ripple" style={{ animationDelay: '0.5s' }}></div>
            </div>
            <div className="relative w-8 h-3 flex items-center justify-center" style={{ animationDelay: '0.8s' }}>
              <div className="w-6 h-2 rounded-full border border-teal-400/80 animate-rain-ripple" style={{ animationDelay: '0.9s' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ANIMATED RAINBOW VARIANT ('rainbow')                                   */}
      {/* ========================================================================= */}
      {weather === 'rainbow' && (
        <div className="absolute inset-0 transition-opacity duration-700">
          {/* Rainbow Arc stretching across top-center */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-[160%] max-w-[580px] h-[280px] rounded-full overflow-hidden pointer-events-none animate-rainbow-glow">
            <div
              className="w-full h-full rounded-full border-[26px] border-transparent"
              style={{
                background: 'radial-gradient(ellipse at 50% 100%, transparent 68%, rgba(244,63,94,0.45) 70%, rgba(249,115,22,0.45) 74%, rgba(234,179,8,0.45) 78%, rgba(34,197,94,0.45) 82%, rgba(14,165,233,0.45) 86%, rgba(168,85,247,0.45) 90%, transparent 92%)'
              }}
            />
          </div>

          {/* Rainbow Pill Header */}
          <div className="absolute top-2 left-4 animate-bounce" style={{ animationDuration: '3s' }}>
            <div className="bg-white/90 backdrop-blur-xs px-3 py-1 rounded-full text-[11px] font-extrabold text-fuchsia-900 shadow-sm border border-fuchsia-200 flex items-center gap-1.5">
              <span>🌈</span>
              <span>Magiczna Tęcza</span>
              <span>✨</span>
            </div>
          </div>

          {/* Shimmering Magical Stars & Sparkles */}
          {[
            { id: 1, top: '15%', left: '20%', char: '✨', delay: '0s', color: 'text-amber-400' },
            { id: 2, top: '22%', left: '75%', char: '💖', delay: '1.2s', color: 'text-pink-400' },
            { id: 3, top: '35%', left: '45%', char: '⭐', delay: '0.6s', color: 'text-yellow-400' },
            { id: 4, top: '48%', left: '15%', char: '🦄', delay: '2.0s', color: 'text-purple-400' },
            { id: 5, top: '55%', left: '80%', char: '✦', delay: '1.5s', color: 'text-sky-400' },
            { id: 6, top: '65%', left: '32%', char: '✨', delay: '0.9s', color: 'text-amber-300' }
          ].map(item => (
            <div
              key={item.id}
              style={{ top: item.top, left: item.left, animationDelay: item.delay }}
              className={`absolute animate-pulse text-[18px] drop-shadow-sm pointer-events-none ${item.color}`}
            >
              {item.char}
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ANIMATED NIGHT VARIANT ('night')                                       */}
      {/* ========================================================================= */}
      {weather === 'night' && (
        <div className="absolute inset-0 transition-opacity duration-700">
          {/* Deep Night Ambient Indigo Shading */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/35 via-indigo-950/20 to-purple-950/30 pointer-events-none"></div>

          {/* Glowing Crescent Moon in Top-Right */}
          <div className="absolute top-3 right-4 flex items-center gap-1.5">
            <div className="relative">
              <span className="text-[34px] leading-none drop-shadow-[0_0_12px_rgba(254,240,138,0.9)] animate-pulse">
                🌙
              </span>
              <span className="absolute -top-1 -right-1 text-[12px] animate-ping">✨</span>
            </div>
            <div className="bg-indigo-950/80 text-yellow-200 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-yellow-300/40">
              Gwiaździsta Noc
            </div>
          </div>

          {/* Shooting Star (Meteor) Streaking across the sky */}
          <div className="absolute top-20 right-10 w-24 h-[2px] bg-gradient-to-l from-white via-yellow-200 to-transparent rounded-full animate-shooting-star pointer-events-none drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"></div>

          {/* Twinkling Stars scattered */}
          {stars.map(star => (
            <div
              key={star.id}
              style={{ top: star.top, left: star.left, animationDelay: star.delay }}
              className={`absolute text-yellow-200 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)] pointer-events-none ${star.size} ${star.pulse}`}
            >
              ★
            </div>
          ))}

          {/* Floating Fireflies at the bottom */}
          <div className="absolute bottom-20 left-12 animate-bounce opacity-80" style={{ animationDuration: '4s' }}>
            <div className="w-2 h-2 rounded-full bg-lime-300 shadow-[0_0_8px_#bef264]"></div>
          </div>
          <div className="absolute bottom-24 right-16 animate-bounce opacity-80" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-300 shadow-[0_0_10px_#fde047]"></div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DYNAMIC ACTIVE EFFECT BURSTS: RAIN SHATTERS & SNOW BLOOMS              */}
      {/* ========================================================================= */}

      {/* ACTIVE RAINDROP SPLASHES / SHATTERS */}
      <AnimatePresence>
        {rainSplashes.map(splash => (
          <div
            key={splash.id}
            className="absolute pointer-events-none z-40 select-none"
            style={{ left: splash.x, top: splash.y }}
          >
            {/* Water Ripple Wave expanding from touch point */}
            <motion.div
              initial={{ scale: 0.1, opacity: 0.95 }}
              animate={{ scale: [0.1, 1.8], opacity: [0.95, 0] }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-cyan-400 bg-cyan-400/15 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
            />

            {/* Inner quick secondary ripple */}
            <motion.div
              initial={{ scale: 0.05, opacity: 0.8 }}
              animate={{ scale: [0.05, 1.1], opacity: [0.8, 0] }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-sky-200 bg-transparent"
            />

            {/* Water droplet beads spraying radially with gravity */}
            {splash.beads.map(bead => (
              <motion.div
                key={bead.id}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: bead.targetX,
                  y: bead.targetY,
                  scale: [1, 1.2, 0.2],
                  opacity: [1, 0.85, 0]
                }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                style={{ width: bead.size * 2, height: bead.size * 2 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-cyan-200 via-sky-400 to-blue-500 shadow-[0_1px_4px_rgba(14,165,233,0.6)] border border-white/70 flex items-center justify-center"
              >
                <div className="w-1 h-1 rounded-full bg-white self-start ml-0.5 mt-0.5 opacity-90"></div>
              </motion.div>
            ))}

            {/* Center Water Splash Crown */}
            <motion.div
              initial={{ scale: 0.3, y: 0, opacity: 1 }}
              animate={{ scale: [0.3, 1.4, 0.7], y: [0, -12, 4], opacity: [1, 1, 0] }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-[22px] filter drop-shadow-[0_2px_6px_rgba(56,189,248,0.8)]"
            >
              💦
            </motion.div>

            {/* Playful Floating Water Splash Word */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: [0, 1, 1, 0], y: -36, scale: 1.05 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-cyan-900/90 text-cyan-100 text-[11px] font-black px-2 py-0.5 rounded-full border border-cyan-300/60 shadow-lg"
            >
              {splash.word}
            </motion.div>
          </div>
        ))}
      </AnimatePresence>

      {/* ACTIVE SNOWFLAKE BLOOMS */}
      <AnimatePresence>
        {snowBlooms.map(bloom => (
          <div
            key={bloom.id}
            className="absolute pointer-events-none z-40 select-none"
            style={{ left: bloom.x, top: bloom.y }}
          >
            {/* Expanding Frost Shimmer Ring */}
            <motion.div
              initial={{ scale: 0.1, opacity: 0.9 }}
              animate={{ scale: [0.1, 1.7], opacity: [0.9, 0] }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border-2 border-sky-300 bg-sky-200/20 blur-xs shadow-[0_0_16px_rgba(186,230,253,0.8)]"
            />

            {/* Magnificent 6-fold Crystal Snowflake Blooming SVG */}
            <motion.div
              initial={{ scale: 0, rotate: bloom.rotation - 40, opacity: 0.95 }}
              animate={{
                scale: [0, 1.35, 1.15],
                rotate: [bloom.rotation - 40, bloom.rotation + 20, bloom.rotation + 35],
                opacity: [0.95, 1, 0]
              }}
              transition={{ duration: 0.95, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-24 h-24 flex items-center justify-center"
            >
              <svg
                viewBox="-40 -40 80 80"
                className="w-full h-full filter drop-shadow-[0_0_12px_rgba(56,189,248,0.95)]"
              >
                <defs>
                  <linearGradient id={`ice-grad-${bloom.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="50%" stopColor="#bae6fd" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                  <radialGradient id={`ice-glow-${bloom.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Ambient Ice Glow */}
                <circle cx="0" cy="0" r="36" fill={`url(#ice-glow-${bloom.id})`} />

                {/* 6 symmetric crystal branches with dendrites */}
                {[0, 60, 120, 180, 240, 300].map(angle => (
                  <g key={angle} transform={`rotate(${angle})`}>
                    {/* Main stem */}
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="-32"
                      stroke={`url(#ice-grad-${bloom.id})`}
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />
                    {/* Outer V-branch dendrites */}
                    <line
                      x1="0"
                      y1="-20"
                      x2="-8"
                      y2="-28"
                      stroke={`url(#ice-grad-${bloom.id})`}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    <line
                      x1="0"
                      y1="-20"
                      x2="8"
                      y2="-28"
                      stroke={`url(#ice-grad-${bloom.id})`}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    {/* Inner V-branch dendrites */}
                    <line
                      x1="0"
                      y1="-11"
                      x2="-6"
                      y2="-17"
                      stroke={`url(#ice-grad-${bloom.id})`}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <line
                      x1="0"
                      y1="-11"
                      x2="6"
                      y2="-17"
                      stroke={`url(#ice-grad-${bloom.id})`}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    {/* Tip diamond */}
                    <polygon points="0,-33 -2.5,-30 0,-27 2.5,-30" fill="#ffffff" />
                  </g>
                ))}

                {/* Center sparkling hexagon gem */}
                <polygon
                  points="0,-7 6,-3.5 6,3.5 0,7 -6,3.5 -6,-3.5"
                  fill="#e0f2fe"
                  stroke="#38bdf8"
                  strokeWidth="1.6"
                />
                <circle cx="0" cy="0" r="2.8" fill="#ffffff" />
              </svg>
            </motion.div>

            {/* Drifting ice crystal sparkles and stars */}
            {bloom.sparkles.map(s => (
              <motion.div
                key={s.id}
                initial={{ x: 0, y: 0, scale: 0.4, opacity: 1, rotate: 0 }}
                animate={{
                  x: s.targetX,
                  y: s.targetY,
                  scale: [0.4, 1.3, 0],
                  opacity: [1, 1, 0],
                  rotate: s.rot
                }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-[16px] drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"
              >
                {s.char}
              </motion.div>
            ))}

            {/* Playful Floating Frost Word */}
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.8 }}
              animate={{ opacity: [0, 1, 1, 0], y: -40, scale: 1.05 }}
              transition={{ duration: 0.85, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-sky-950/90 text-sky-100 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-sky-300/60 shadow-lg"
            >
              {bloom.word}
            </motion.div>
          </div>
        ))}
      </AnimatePresence>

      {/* GENERIC BURSTS FOR SUN / RAINBOW / NIGHT */}
      <AnimatePresence>
        {genericBursts.map(burst => (
          <div
            key={burst.id}
            className="absolute pointer-events-none z-40 select-none"
            style={{ left: burst.x, top: burst.y }}
          >
            {/* Expanding Glow Aura */}
            <motion.div
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: [0.2, 1.6], opacity: [1, 0] }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              style={{ borderColor: burst.borderColor }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 bg-white/20 shadow-lg"
            />

            {/* Center Icon */}
            <motion.div
              initial={{ scale: 0.3, rotate: -20, opacity: 1 }}
              animate={{ scale: [0.3, 1.4, 0.6], rotate: [ -20, 20, 45], opacity: [1, 1, 0] }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-[26px] drop-shadow-md"
            >
              {burst.icon}
            </motion.div>

            {/* Floating text */}
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.8 }}
              animate={{ opacity: [0, 1, 1, 0], y: -34, scale: 1.05 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-900/90 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full border border-amber-300/60 shadow-lg"
            >
              {burst.word}
            </motion.div>
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
