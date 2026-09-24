import React, { useState, useRef } from 'react';
import { FurnitureItem } from '../types';
import { sound } from '../utils/sound';
import { DEFAULT_FURNITURE_STICKERS, FurnitureSticker } from '../data/calendarRewardsData';
import {
  getUnlockedStickerIds,
  addUnlockedSticker,
  getUnlockedPaletteIds,
  addUnlockedPalette
} from '../utils/calendarManager';
import { getCoins, spendCoins } from '../utils/currencyManager';

export interface FurnitureColorPalette {
  id: string;
  name: string;
  main: string;
  accent: string;
  border: string;
  shadow: string;
  isSpecial?: boolean;
  cost?: number;
}

export const FURNITURE_PALETTES: FurnitureColorPalette[] = [
  { id: 'mint', name: 'Miętowy 🌿', main: '#70f8e8', accent: '#006a62', border: '#38dbca', shadow: '#004d47' },
  { id: 'strawberry', name: 'Truskawka 🍓', main: '#ff8da1', accent: '#ad2c4f', border: '#ff6b8b', shadow: '#8c1d3b' },
  { id: 'sun', name: 'Słoneczny ☀️', main: '#fde047', accent: '#a16207', border: '#eab308', shadow: '#713f12' },
  { id: 'lavender', name: 'Lawenda 💜', main: '#c084fc', accent: '#6b21a8', border: '#a855f7', shadow: '#581c87' },
  { id: 'sky', name: 'Błękit ☁️', main: '#38bdf8', accent: '#0369a1', border: '#0ea5e9', shadow: '#075985' },
  { id: 'peach', name: 'Brzoskwinia 🍑', main: '#fed7aa', accent: '#c2410c', border: '#fb923c', shadow: '#9a3412' },
  { id: 'wood', name: 'Ciepłe Drewno 🪵', main: '#d97706', accent: '#78350f', border: '#b45309', shadow: '#451a03' },
  { id: 'cream', name: 'Mleczny Krem 🍦', main: '#fef3c7', accent: '#78716c', border: '#fde68a', shadow: '#57534e' },
  // Special unlockable palettes for virtual coins & daily calendar
  { id: 'gold_royale', name: 'Złoty Blask 👑', main: '#fcd34d', accent: '#b45309', border: '#f59e0b', shadow: '#78350f', isSpecial: true, cost: 80 },
  { id: 'neon_cyber', name: 'Kosmiczny Neon 🌌', main: '#c084fc', accent: '#06b6d4', border: '#a855f7', shadow: '#4c1d95', isSpecial: true, cost: 100 },
  { id: 'candy_pastel', name: 'Cukierkowy Pastel 🍬', main: '#f472b6', accent: '#8b5cf6', border: '#ec4899', shadow: '#831843', isSpecial: true, cost: 90 }
];

export const DEFAULT_FURNITURE_ITEMS: FurnitureItem[] = [
  {
    id: 'furn-sofa',
    type: 'sofa',
    name: 'Wygodna Kanapa',
    x: 28,
    y: 75,
    rotation: 0,
    flipped: false,
    colorId: 'mint',
    colorTheme: '#70f8e8',
    accentColor: '#006a62',
    colorName: 'Miętowy 🌿',
    isInRoom: true
  },
  {
    id: 'furn-table',
    type: 'table',
    name: 'Stół Jadalny',
    x: 74,
    y: 78,
    rotation: 0,
    flipped: false,
    colorId: 'wood',
    colorTheme: '#d97706',
    accentColor: '#78350f',
    colorName: 'Ciepłe Drewno 🪵',
    isInRoom: true
  },
  {
    id: 'furn-fridge',
    type: 'fridge',
    name: 'Pastelowa Lodówka',
    x: 88,
    y: 44,
    rotation: 0,
    flipped: false,
    colorId: 'strawberry',
    colorTheme: '#ff8da1',
    accentColor: '#ad2c4f',
    colorName: 'Truskawka 🍓',
    isInRoom: true
  },
  {
    id: 'furn-tv',
    type: 'tv',
    name: 'Kreskówkowy Telewizor',
    x: 18,
    y: 45,
    rotation: 0,
    flipped: false,
    colorId: 'cream',
    colorTheme: '#fef3c7',
    accentColor: '#78716c',
    colorName: 'Mleczny Krem 🍦',
    isInRoom: true
  },
  {
    id: 'furn-rug',
    type: 'rug',
    name: 'Puszysty Dywanik',
    x: 48,
    y: 84,
    rotation: 0,
    flipped: false,
    colorId: 'peach',
    colorTheme: '#fed7aa',
    accentColor: '#c2410c',
    colorName: 'Brzoskwinia 🍑',
    isInRoom: true
  },
  {
    id: 'furn-armchair',
    type: 'armchair',
    name: 'Fotel Przytulanka',
    x: 46,
    y: 70,
    rotation: -4,
    flipped: false,
    colorId: 'lavender',
    colorTheme: '#c084fc',
    accentColor: '#6b21a8',
    colorName: 'Lawenda 💜',
    isInRoom: false
  },
  {
    id: 'furn-bed',
    type: 'bed',
    name: 'Bajkowe Łóżeczko',
    x: 52,
    y: 62,
    rotation: 0,
    flipped: false,
    colorId: 'sky',
    colorTheme: '#38bdf8',
    accentColor: '#0369a1',
    colorName: 'Błękit ☁️',
    isInRoom: false
  },
  {
    id: 'furn-lamp',
    type: 'lamp',
    name: 'Stojąca Lampa',
    x: 8,
    y: 56,
    rotation: 0,
    flipped: false,
    colorId: 'sun',
    colorTheme: '#fde047',
    accentColor: '#a16207',
    colorName: 'Słoneczny ☀️',
    isInRoom: false
  },
  {
    id: 'furn-plant',
    type: 'plant',
    name: 'Doniczkowa Monstera',
    x: 93,
    y: 72,
    rotation: 0,
    flipped: false,
    colorId: 'mint',
    colorTheme: '#70f8e8',
    accentColor: '#006a62',
    colorName: 'Miętowy 🌿',
    isInRoom: false
  }
];

interface DollhouseFurnitureProps {
  item: FurnitureItem;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: (id: string | null) => void;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onRotate: (id: string, degreesDelta: number) => void;
  onSetRotation: (id: string, exactDegrees: number) => void;
  onFlip: (id: string) => void;
  onChangeColor: (id: string, palette: FurnitureColorPalette) => void;
  onApplySticker?: (id: string, stickerEmoji: string | null) => void;
  onRemove: (id: string) => void;
  // Specific interactive extras
  fridgeOpen?: boolean;
  onFridgeToggle?: () => void;
  onSnackClick?: (name: string, icon: string) => void;
  tvChannel?: number;
  onTvCycle?: () => void;
  tvShows?: Array<{ title: string; sub: string; icon: string; color: string }>;
  lampOn?: boolean;
  onLampToggle?: () => void;
}

export const DollhouseFurniture: React.FC<DollhouseFurnitureProps> = ({
  item,
  isSelected,
  isDragging,
  onSelect,
  onPointerDown,
  onRotate,
  onSetRotation,
  onFlip,
  onChangeColor,
  onApplySticker,
  onRemove,
  fridgeOpen = false,
  onFridgeToggle,
  onSnackClick,
  tvChannel = 0,
  onTvCycle,
  tvShows,
  lampOn = true,
  onLampToggle
}) => {
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [showStickerPicker, setShowStickerPicker] = useState<boolean>(false);
  const [unlockedStickers, setUnlockedStickers] = useState<string[]>(() => getUnlockedStickerIds());
  const [unlockedPalettes, setUnlockedPalettes] = useState<string[]>(() => getUnlockedPaletteIds());
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const rotateHandleRef = useRef<HTMLDivElement>(null);

  // Sync unlocked items across applet
  React.useEffect(() => {
    const handleStickersUpdated = () => setUnlockedStickers(getUnlockedStickerIds());
    const handlePalettesUpdated = () => setUnlockedPalettes(getUnlockedPaletteIds());
    window.addEventListener('kiddo_stickers_updated', handleStickersUpdated);
    window.addEventListener('kiddo_palettes_updated', handlePalettesUpdated);
    return () => {
      window.removeEventListener('kiddo_stickers_updated', handleStickersUpdated);
      window.removeEventListener('kiddo_palettes_updated', handlePalettesUpdated);
    };
  }, []);

  // Quick double tap to rotate 45 degrees
  const handleItemTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapTime < 320) {
      sound.playBoing();
      onRotate(item.id, 45);
    } else {
      onSelect(isSelected ? null : item.id);
    }
    setLastTapTime(now);
  };

  // Rotating touch gesture on rotation handle
  const handleRotateHandlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const itemElem = (e.currentTarget as HTMLElement).closest('[data-furniture-id]');
    if (!itemElem) return;

    const rect = itemElem.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handlePointerMove = (moveEvt: PointerEvent) => {
      const rad = Math.atan2(moveEvt.clientY - centerY, moveEvt.clientX - centerX);
      let deg = Math.round(rad * (180 / Math.PI)) + 90;
      if (deg > 180) deg -= 360;
      if (deg < -180) deg += 360;
      onSetRotation(item.id, deg);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      sound.playPop(580);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const transformStyle = {
    transform: `rotate(${item.rotation}deg) scaleX(${item.flipped ? -1 : 1})`,
    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
  };

  return (
    <div
      data-furniture-id={item.id}
      style={{ left: `${item.x}%`, top: `${item.y}%` }}
      onPointerDown={(e) => onPointerDown(e, item.id)}
      onClick={handleItemTap}
      className={`absolute -translate-x-1/2 -translate-y-1/2 select-none touch-none cursor-grab active:cursor-grabbing ${
        isSelected ? 'z-40' : item.type === 'rug' ? 'z-15' : 'z-25'
      }`}
    >
      {/* ========================================================================= */}
      {/* FLOATING ACTION HALO / CONTROLS (WHEN SELECTED)                           */}
      {/* ========================================================================= */}
      {isSelected && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-surface-container-lowest/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xl border-2 border-primary animate-in fade-in zoom-in duration-150"
        >
          {/* Quick Rotate Button (+45°) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playPop(640);
              onRotate(item.id, 45);
            }}
            title="Obróć o 45 stopni (możesz też kliknąć dwukrotnie mebel!)"
            className="w-7 h-7 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[16px]">rotate_right</span>
          </button>

          {/* Flip Left / Right Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playPop(520);
              onFlip(item.id);
            }}
            title="Odbij w poziomie"
            className="w-7 h-7 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[16px]">flip</span>
          </button>

          {/* Sticker Decorator Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playPop(560);
              setShowStickerPicker(!showStickerPicker);
              setShowColorPicker(false);
            }}
            title="Przyklej lub zmień naklejkę na meblu!"
            className={`w-7 h-7 rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-transform ${
              item.sticker
                ? 'bg-amber-300 text-yellow-950 ring-2 ring-amber-400 shadow-xs'
                : 'bg-surface-container-highest text-on-surface'
            }`}
          >
            <span className="text-[14px] leading-none">{item.sticker || '⭐'}</span>
          </button>

          {/* Color Picker Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playSparkle();
              setShowColorPicker(!showColorPicker);
              setShowStickerPicker(false);
            }}
            style={{ backgroundColor: item.colorTheme }}
            title="Zmień kolor mebla"
            className="w-7 h-7 rounded-full border-2 border-white shadow-xs flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[14px]" style={{ color: item.accentColor }}>
              palette
            </span>
          </button>

          {/* Hide / Put Away Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sound.playPop(380);
              onRemove(item.id);
            }}
            title="Schowaj mebel do skrzyni"
            className="w-7 h-7 rounded-full bg-error-container text-on-error-container flex items-center justify-center hover:scale-110 active:scale-95 transition-transform text-[12px] font-bold"
          >
            ✕
          </button>

          {/* Interactive Circular Rotation Handle */}
          <div
            ref={rotateHandleRef}
            onPointerDown={handleRotateHandlePointerDown}
            title="Przeciągnij ten uchwyt po okręgu, aby swobodnie obracać mebel!"
            className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 transition-transform shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STICKER PICKER BUBBLE MENU                                                */}
      {/* ========================================================================= */}
      {isSelected && showStickerPicker && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-32 left-1/2 -translate-x-1/2 z-55 flex items-center gap-1.5 bg-surface-container-lowest/98 backdrop-blur-md px-3 py-1.5 rounded-full shadow-2xl border-2 border-amber-300 max-w-[340px] overflow-x-auto animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          {/* Remove sticker option */}
          <button
            type="button"
            onClick={() => {
              sound.playPop(480);
              onApplySticker?.(item.id, null);
              setShowStickerPicker(false);
            }}
            title="Usuń naklejkę z mebla"
            className="w-7 h-7 shrink-0 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-[12px] font-bold hover:scale-110 active:scale-95 transition-transform"
          >
            ✕
          </button>

          {DEFAULT_FURNITURE_STICKERS.map((stk) => {
            const isUnlocked = stk.cost === 0 || stk.isUnlockedDefault || unlockedStickers.includes(stk.id);
            const isCurrent = item.sticker === stk.emoji;

            return (
              <button
                key={stk.id}
                type="button"
                onClick={() => {
                  if (isUnlocked) {
                    sound.playPop(700);
                    onApplySticker?.(item.id, stk.emoji);
                    setShowStickerPicker(false);
                  } else {
                    const currentCoins = getCoins();
                    if (currentCoins >= stk.cost) {
                      if (spendCoins(stk.cost, `Kupiono naklejkę ${stk.name} na mebel`)) {
                        addUnlockedSticker(stk.id);
                        sound.playCoin();
                        onApplySticker?.(item.id, stk.emoji);
                        setShowStickerPicker(false);
                      }
                    } else {
                      sound.playBoing();
                    }
                  }
                }}
                title={
                  isUnlocked
                    ? `Przyklej naklejkę: ${stk.name}`
                    : `Kup naklejkę: ${stk.name} za ${stk.cost} monet`
                }
                className={`relative w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[18px] transition-all hover:scale-125 active:scale-95 ${
                  isCurrent
                    ? 'bg-amber-200 ring-2 ring-amber-500 scale-110 shadow-xs'
                    : isUnlocked
                    ? 'bg-surface-container-high hover:bg-surface-container-highest shadow-2xs'
                    : 'bg-surface-container opacity-75'
                }`}
              >
                <span>{stk.emoji}</span>
                {!isUnlocked && (
                  <span className="absolute -bottom-1 -right-1 text-[8px] font-extrabold bg-amber-500 text-white px-1 rounded-full shadow-xs leading-tight">
                    {stk.cost}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* COLOR PICKER BUBBLE MENU                                                  */}
      {/* ========================================================================= */}
      {isSelected && showColorPicker && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute -top-28 left-1/2 -translate-x-1/2 z-55 flex items-center gap-1.5 bg-surface-container-lowest/98 backdrop-blur-md px-3 py-1.5 rounded-full shadow-2xl border border-outline-variant/40 animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          {FURNITURE_PALETTES.map((pal) => {
            const isUnlocked = !pal.isSpecial || unlockedPalettes.includes(pal.id);
            const isCurrent = item.colorId === pal.id;

            return (
              <button
                key={pal.id}
                type="button"
                onClick={() => {
                  if (pal.isSpecial && !isUnlocked) {
                    const cost = pal.cost || 80;
                    if (getCoins() >= cost) {
                      if (spendCoins(cost, `Odblokowano styl mebla: ${pal.name}`)) {
                        addUnlockedPalette(pal.id);
                        sound.playCoin();
                        setTimeout(() => sound.playSparkle(), 180);
                        onChangeColor(item.id, pal);
                        setShowColorPicker(false);
                      }
                    } else {
                      sound.playBoing();
                    }
                    return;
                  }
                  sound.playSparkle();
                  onChangeColor(item.id, pal);
                  setShowColorPicker(false);
                }}
                style={{ backgroundColor: pal.main }}
                title={
                  isUnlocked
                    ? pal.name
                    : `Odblokuj styl: ${pal.name} za ${pal.cost || 80} monet 🪙`
                }
                className={`relative w-6 h-6 rounded-full border-2 transition-all hover:scale-125 active:scale-95 ${
                  isCurrent ? 'border-primary ring-2 ring-primary/40 scale-110' : 'border-white shadow-xs'
                }`}
              >
                {pal.isSpecial && !isUnlocked && (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] text-yellow-950 font-bold">
                    🔒
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SELECTION OUTLINE GLOW                                                    */}
      {/* ========================================================================= */}
      {isSelected && (
        <div className="absolute -inset-2.5 rounded-3xl border-2 border-dashed border-primary/70 animate-pulse pointer-events-none" />
      )}

      {/* ========================================================================= */}
      {/* FURNITURE PIECE RENDERING (STYLED ACCORDING TO COLOR THEME & GESTURES)     */}
      {/* ========================================================================= */}
      <div
        style={transformStyle}
        className={`relative transition-shadow ${isDragging ? 'scale-105 filter drop-shadow-xl' : 'filter drop-shadow-md'}`}
      >
        {/* Applied Decorative Sticker Badge on the furniture piece */}
        {item.sticker && (
          <div
            title={`Naklejka: ${item.sticker}`}
            className="absolute -top-3 -right-3 z-40 w-7 h-7 rounded-full bg-white/95 backdrop-blur-xs shadow-md border-2 border-amber-400 flex items-center justify-center text-[16px] animate-bounce pointer-events-none select-none"
          >
            {item.sticker}
          </div>
        )}
        {/* 1. SOFA (MODULAR KANAPA) */}
        {item.type === 'sofa' && (
          <div className="relative w-44 h-24 flex flex-col justify-end">
            {/* Soft Tufted Backrest */}
            <div
              style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
              className="w-full h-16 rounded-t-3xl border-2 shadow-[0_5px_0px_rgba(0,0,0,0.18)] flex items-center justify-around px-3 pt-1"
            >
              <div
                style={{ backgroundColor: item.accentColor }}
                className="w-2.5 h-2.5 rounded-full opacity-40 shadow-inner"
              />
              <div
                style={{ backgroundColor: item.accentColor }}
                className="w-2.5 h-2.5 rounded-full opacity-40 shadow-inner"
              />
              <div
                style={{ backgroundColor: item.accentColor }}
                className="w-2.5 h-2.5 rounded-full opacity-40 shadow-inner"
              />
            </div>

            {/* Comfy Seat Cushion */}
            <div
              style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
              className="w-full h-9 rounded-2xl border-2 shadow-[0_6px_0px_rgba(0,0,0,0.22)] -mt-2 flex items-center justify-between px-3"
            >
              {/* Wooden Round Legs */}
              <div className="absolute -bottom-2.5 left-4 w-3.5 h-3 bg-amber-800 rounded-b-md shadow-xs"></div>
              <div className="absolute -bottom-2.5 right-4 w-3.5 h-3 bg-amber-800 rounded-b-md shadow-xs"></div>
            </div>

            {/* Armrests */}
            <div
              style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
              className="absolute bottom-1 -left-2 w-5 h-12 rounded-2xl border-2 shadow-sm"
            />
            <div
              style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
              className="absolute bottom-1 -right-2 w-5 h-12 rounded-2xl border-2 shadow-sm"
            />

            {/* Decorative Throw Pillows with Accent Colors */}
            <div
              style={{ backgroundColor: item.accentColor }}
              className="absolute bottom-4 left-3 w-7 h-7 rounded-xl shadow-xs -rotate-12 border border-white/60 flex items-center justify-center text-[10px]"
            >
              ⭐
            </div>
            <div className="absolute bottom-4 right-3 w-7 h-7 rounded-xl bg-white shadow-xs rotate-12 border border-primary/20 flex items-center justify-center text-[10px]">
              💖
            </div>
          </div>
        )}

        {/* 2. DINING TABLE (STÓŁ JADALNY) */}
        {item.type === 'table' && (
          <div className="relative w-40 flex flex-col items-center">
            {/* Table Surface */}
            <div
              style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
              className="w-full h-8 rounded-2xl border-2 shadow-[0_6px_0px_rgba(0,0,0,0.2)] flex items-center justify-around px-2 relative z-10"
            >
              <div className="h-5 px-2 bg-surface-container-lowest rounded-full flex items-center gap-1.5 shadow-sm -mt-2 border border-outline-variant/30">
                <span className="text-[13px]">🍪</span>
                <span className="text-[13px]">🧃</span>
                <span className="text-[13px]">🧁</span>
              </div>
            </div>

            {/* Chairs & Table Legs */}
            <div className="w-full flex justify-between px-4 h-11 relative">
              <div
                style={{ backgroundColor: item.accentColor }}
                className="w-3.5 h-full rounded-b-md shadow-xs"
              />
              <div
                style={{ backgroundColor: item.accentColor }}
                className="w-3.5 h-full rounded-b-md shadow-xs"
              />

              {/* Tucked-in Chair Backrests */}
              <div
                style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
                className="absolute -top-3 left-1 w-6 h-6 rounded-t-xl border-2 shadow-xs"
              />
              <div
                style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
                className="absolute -top-3 right-1 w-6 h-6 rounded-t-xl border-2 shadow-xs"
              />
            </div>
          </div>
        )}

        {/* 3. FRIDGE (PASTELOWA LODÓWKA ZE SMAKOŁYKAMI) */}
        {item.type === 'fridge' && (
          <div className="flex flex-col items-center">
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (onFridgeToggle) onFridgeToggle();
              }}
              style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
              className={`w-32 rounded-3xl p-2 border-2 shadow-[0_6px_0px_rgba(0,0,0,0.22)] cursor-pointer flex flex-col justify-between relative transition-all ${
                fridgeOpen ? 'h-52' : 'h-44'
              }`}
            >
              {fridgeOpen ? (
                <>
                  {/* Shelf 1 */}
                  <div className="h-13 bg-white/95 rounded-xl p-1 flex items-center justify-around shadow-inner mb-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSnackClick) onSnackClick('Babeczka Truskawkowa', 'bakery_dining');
                      }}
                      className="hover:scale-120 active:scale-95 transition-transform"
                      title="Babeczka truskawkowa"
                    >
                      <span className="material-symbols-outlined text-primary text-[20px]">bakery_dining</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSnackClick) onSnackClick('Pyszne Mleczko', 'water_bottle');
                      }}
                      className="hover:scale-120 active:scale-95 transition-transform"
                      title="Mleko"
                    >
                      <span className="material-symbols-outlined text-secondary text-[20px]">water_bottle</span>
                    </button>
                  </div>

                  {/* Shelf 2 */}
                  <div className="h-13 bg-white/95 rounded-xl p-1 flex items-center justify-around shadow-inner mb-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSnackClick) onSnackClick('Sok Pomarańczowy', 'local_drink');
                      }}
                      className="hover:scale-120 active:scale-95 transition-transform"
                      title="Sok"
                    >
                      <span className="material-symbols-outlined text-amber-500 text-[20px]">local_drink</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSnackClick) onSnackClick('Kawałek Pizzy', 'local_pizza');
                      }}
                      className="hover:scale-120 active:scale-95 transition-transform"
                      title="Pizza"
                    >
                      <span className="material-symbols-outlined text-rose-500 text-[20px]">local_pizza</span>
                    </button>
                  </div>

                  {/* Bottom Drawer */}
                  <div className="h-11 bg-white/80 rounded-xl p-1 flex items-center justify-around shadow-inner">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSnackClick) onSnackClick('Lody Waniliowe', 'icecream');
                      }}
                      className="hover:scale-120 active:scale-95 transition-transform"
                      title="Lody"
                    >
                      <span className="material-symbols-outlined text-pink-500 text-[18px]">icecream</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSnackClick) onSnackClick('Mini Burger', 'lunch_dining');
                      }}
                      className="hover:scale-120 active:scale-95 transition-transform"
                      title="Burger"
                    >
                      <span className="material-symbols-outlined text-amber-600 text-[18px]">lunch_dining</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-1">
                  <span className="text-[28px]">🍓</span>
                  <span className="text-[11px] font-extrabold text-on-surface bg-white/70 px-2 py-0.5 rounded-full shadow-xs">
                    Dotknij by otworzyć
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-[13px]">
                    <span>⭐</span>
                    <span>🌸</span>
                  </div>
                </div>
              )}

              {/* Fridge Handle */}
              <div
                style={{ backgroundColor: item.accentColor }}
                className="absolute top-10 left-1.5 w-1.5 h-10 rounded-full shadow-sm"
              />
            </div>
          </div>
        )}

        {/* 4. CARTOON TV (KRESKÓWKOWY TELEWIZOR) */}
        {item.type === 'tv' && (
          <div className="flex flex-col items-center">
            {/* TV Stand / Case */}
            <div
              style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
              className="w-32 bg-surface-container-highest p-2 rounded-2xl shadow-[0_5px_0px_rgba(0,0,0,0.18)] flex flex-col items-center border-2"
            >
              {/* Antenna */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-3">
                <div className="w-0.5 h-3.5 bg-outline -rotate-25 rounded-full"></div>
                <div className="w-0.5 h-3.5 bg-outline rotate-25 rounded-full"></div>
              </div>

              {/* Screen */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTvCycle) onTvCycle();
                }}
                className="w-full h-18 rounded-xl bg-secondary-fixed/60 flex flex-col items-center justify-center overflow-hidden relative cursor-pointer active:scale-95 transition-transform border border-secondary/30"
              >
                {tvShows && tvShows[tvChannel] ? (
                  <div className="flex flex-col items-center animate-pulse">
                    <span className={`material-symbols-outlined text-[24px] ${tvShows[tvChannel].color}`}>
                      {tvShows[tvChannel].icon}
                    </span>
                    <span className="font-extrabold text-[10px] text-on-secondary-container">
                      {tvShows[tvChannel].title}
                    </span>
                    <span className="text-[8px] text-on-secondary-container font-medium">
                      {tvShows[tvChannel].sub}
                    </span>
                  </div>
                ) : (
                  <span className="text-[12px] font-bold">♫ Muzyka ♫</span>
                )}
              </div>

              {/* TV Buttons & Speaker */}
              <div className="w-full flex items-center justify-between px-1.5 mt-1.5">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-outline"></div>
                  <div className="w-2 h-2 rounded-full bg-outline"></div>
                </div>
                <div className="w-8 h-1 bg-outline-variant rounded-full"></div>
              </div>
            </div>

            {/* TV Legs */}
            <div className="w-24 flex justify-between px-2">
              <div className="w-2 h-2 bg-amber-900 rounded-b-md"></div>
              <div className="w-2 h-2 bg-amber-900 rounded-b-md"></div>
            </div>
          </div>
        )}

        {/* 5. STARRY RUG (PUSZYSTY DYWANIK) */}
        {item.type === 'rug' && (
          <div
            style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
            className="w-48 h-12 rounded-full border-2 shadow-inner flex items-center justify-around px-4"
          >
            <span className="text-[14px]">⭐</span>
            <span className="text-[12px]">✨</span>
            <span className="text-[14px]">🌸</span>
            <span className="text-[12px]">✨</span>
            <span className="text-[14px]">⭐</span>
          </div>
        )}

        {/* 6. COZY BED (BAJKOWE ŁÓŻECZKO) */}
        {item.type === 'bed' && (
          <div className="relative w-40 flex flex-col items-center">
            {/* Curved Headboard */}
            <div
              style={{ backgroundColor: item.accentColor }}
              className="w-full h-14 rounded-t-3xl shadow-sm flex items-start justify-center pt-1 text-[14px]"
            >
              👑
            </div>

            {/* Mattress & Blanket */}
            <div
              style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
              className="w-full h-14 rounded-2xl border-2 shadow-[0_6px_0px_rgba(0,0,0,0.2)] -mt-6 relative flex flex-col justify-between p-1.5 z-10"
            >
              {/* Fluffy Pillows */}
              <div className="flex justify-around">
                <div className="w-12 h-6 rounded-xl bg-white shadow-xs border border-primary/20 flex items-center justify-center text-[10px]">
                  ☁️
                </div>
                <div className="w-12 h-6 rounded-xl bg-white shadow-xs border border-primary/20 flex items-center justify-center text-[10px]">
                  ☁️
                </div>
              </div>

              {/* Folded Blanket edge */}
              <div
                style={{ backgroundColor: item.accentColor }}
                className="w-full h-3 rounded-full opacity-70"
              />
            </div>

            {/* Bed Post Legs */}
            <div className="w-full flex justify-between px-3 h-2">
              <div className="w-3 h-3 bg-amber-900 rounded-b-md"></div>
              <div className="w-3 h-3 bg-amber-900 rounded-b-md"></div>
            </div>
          </div>
        )}

        {/* 7. COZY ARMCHAIR (FOTEL PRZYTULANKA) */}
        {item.type === 'armchair' && (
          <div className="relative w-28 h-24 flex flex-col justify-end items-center">
            {/* High Backrest with Ears */}
            <div
              style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
              className="w-24 h-16 rounded-t-3xl border-2 shadow-sm flex items-center justify-center"
            >
              <span className="text-[16px]">💖</span>
            </div>

            {/* Deep Cushion */}
            <div
              style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
              className="w-26 h-9 rounded-2xl border-2 shadow-[0_5px_0px_rgba(0,0,0,0.2)] -mt-2 z-10"
            />

            {/* Armrests */}
            <div
              style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
              className="absolute bottom-1 -left-1.5 w-4 h-10 rounded-2xl border-2"
            />
            <div
              style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
              className="absolute bottom-1 -right-1.5 w-4 h-10 rounded-2xl border-2"
            />

            {/* Legs */}
            <div className="w-20 flex justify-between px-2 -mt-1">
              <div className="w-2.5 h-2.5 bg-amber-800 rounded-b-md"></div>
              <div className="w-2.5 h-2.5 bg-amber-800 rounded-b-md"></div>
            </div>
          </div>
        )}

        {/* 8. FLOOR LAMP (STOJĄCA LAMPA) */}
        {item.type === 'lamp' && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (onLampToggle) onLampToggle();
            }}
            className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
          >
            {/* Lampshade */}
            <div
              style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
              className={`w-14 h-10 rounded-t-full border-2 flex items-center justify-center shadow-md relative ${
                lampOn ? 'ring-4 ring-yellow-200/60' : 'opacity-85'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${lampOn ? 'text-amber-500 animate-pulse' : 'text-outline'}`}>
                lightbulb
              </span>
              {lampOn && (
                <div className="absolute -inset-2 bg-yellow-200/30 rounded-full blur-xs pointer-events-none"></div>
              )}
            </div>

            {/* Pole */}
            <div
              style={{ backgroundColor: item.accentColor }}
              className="w-2 h-16 shadow-xs"
            />

            {/* Heavy Base */}
            <div
              style={{ backgroundColor: item.accentColor }}
              className="w-12 h-3 rounded-full shadow-sm"
            />
          </div>
        )}

        {/* 9. PLANT (DONICZKOWA MONSTERA) */}
        {item.type === 'plant' && (
          <div className="flex flex-col items-center">
            {/* Leaves */}
            <div className="flex items-center -space-x-2 -mb-2">
              <span className="text-[26px] -rotate-12 transform">🌿</span>
              <span className="text-[30px] transform">🪴</span>
              <span className="text-[26px] rotate-12 transform">🌿</span>
            </div>

            {/* Ceramic Pot */}
            <div
              style={{ backgroundColor: item.colorTheme, borderColor: item.accentColor }}
              className="w-11 h-10 rounded-b-2xl border-2 shadow-[0_4px_0px_rgba(0,0,0,0.2)] flex items-center justify-center"
            >
              <span className="text-[11px]">🌸</span>
            </div>
          </div>
        )}
      </div>

      {/* Item Name Tag on selection */}
      {isSelected && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-surface-container-highest/90 text-on-surface px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-sm border border-outline-variant/30 flex items-center gap-1">
          <span>{item.name}</span>
          <span className="text-[9px] text-primary">({item.colorName})</span>
        </div>
      )}
    </div>
  );
};
