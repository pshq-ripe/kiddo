import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';

interface MobileStatusBarProps {
  isMusicPlaying: boolean;
  activeTabName: string;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({
  isMusicPlaying,
  activeTabName
}) => {
  const [time, setTime] = useState('09:41');
  const [islandExpanded, setIslandExpanded] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${mins}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleIslandClick = () => {
    sound.playPop(680);
    setIslandExpanded(prev => !prev);
    if (!islandExpanded) {
      setTimeout(() => setIslandExpanded(false), 3500);
    }
  };

  return (
    <div className="w-full h-11 px-6 pt-1.5 pb-0 flex items-center justify-between text-on-surface select-none z-40 shrink-0 font-sans">
      {/* Carrier / Clock */}
      <div className="w-20 flex items-center gap-1.5">
        <span className="font-bold text-[14px] tracking-tight">{time}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" title="Aktywny świat"></span>
      </div>

      {/* Dynamic Island */}
      <div
        onClick={handleIslandClick}
        className={`bg-black text-white rounded-full flex items-center justify-between cursor-pointer transition-all duration-300 shadow-sm ${
          islandExpanded
            ? 'w-56 h-8 px-3.5 bg-neutral-900 border border-neutral-700'
            : isMusicPlaying
            ? 'w-32 h-7 px-2.5 ring-2 ring-primary/40'
            : 'w-24 h-6 px-2'
        }`}
        title="Dynamic Island"
      >
        {islandExpanded ? (
          <div className="w-full flex items-center justify-between text-[11px] font-bold">
            <span className="flex items-center gap-1 text-primary-container truncate">
              <span className="material-symbols-outlined text-[15px]">smart_toy</span>
              <span>Kiddo App</span>
            </span>
            <span className="text-secondary-fixed text-[10px]">Świat Zabawy ✨</span>
          </div>
        ) : isMusicPlaying ? (
          <>
            {/* Camera lens */}
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-500/80"></div>
            </div>
            {/* Music Waveform Indicator */}
            <div className="flex items-center gap-1 text-secondary-container">
              <span className="text-[10px] animate-bounce font-bold">♫</span>
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-secondary-container animate-pulse rounded-full"></span>
                <span className="w-0.5 h-3 bg-primary-container animate-pulse rounded-full" style={{ animationDelay: '150ms' }}></span>
                <span className="w-0.5 h-1.5 bg-tertiary-fixed animate-pulse rounded-full" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
            {/* Sensor */}
            <div className="w-2 h-2 rounded-full bg-neutral-900"></div>
          </>
        ) : (
          <>
            {/* Left Camera Lens */}
            <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-blue-500/80"></div>
            </div>
            {/* Right Face Sensor */}
            <div className="w-2 h-2 rounded-full bg-neutral-900"></div>
          </>
        )}
      </div>

      {/* Network / Battery status */}
      <div className="w-20 flex items-center justify-end gap-1.5 text-on-surface">
        {/* Cellular 5G */}
        <div className="flex items-end gap-0.5 h-2.5">
          <div className="w-0.5 h-1 bg-on-surface rounded-sm"></div>
          <div className="w-0.5 h-1.5 bg-on-surface rounded-sm"></div>
          <div className="w-0.5 h-2 bg-on-surface rounded-sm"></div>
          <div className="w-0.5 h-2.5 bg-on-surface rounded-sm"></div>
        </div>

        {/* Wi-Fi Icon */}
        <span className="material-symbols-outlined text-[15px] leading-none">wifi</span>

        {/* Battery with 100% green fill */}
        <div className="flex items-center">
          <div className="w-5 h-2.5 rounded-[4px] border border-on-surface p-[1px] flex items-center">
            <div className="w-full h-full bg-green-500 rounded-[2px]"></div>
          </div>
          <div className="w-[1.5px] h-1.5 bg-on-surface rounded-r-sm"></div>
        </div>
      </div>
    </div>
  );
};
