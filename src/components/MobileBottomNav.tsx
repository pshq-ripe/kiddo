import React from 'react';
import { TabType } from '../types';
import { sound } from '../utils/sound';

interface MobileBottomNavProps {
  activeTab: TabType;
  onNavigate: (tab: TabType) => void;
  characterCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onNavigate,
  characterCount
}) => {
  const tabs = [
    {
      id: 'world-map' as TabType,
      label: 'Świat',
      icon: 'explore',
      badge: null
    },
    {
      id: 'character-maker' as TabType,
      label: 'Kreator',
      icon: 'face_retouching_natural',
      badge: 'NOWOŚĆ'
    },
    {
      id: 'play-zone' as TabType,
      label: 'Zabawa',
      icon: 'toys',
      badge: null
    },
    {
      id: 'backpack-drawer' as TabType,
      label: 'Plecak',
      icon: 'backpack',
      badge: characterCount > 0 ? String(characterCount) : null
    }
  ];

  const handleTabClick = (tabId: TabType) => {
    sound.playPop(
      tabId === 'world-map' ? 520 : tabId === 'character-maker' ? 620 : tabId === 'play-zone' ? 700 : 560
    );
    onNavigate(tabId);
  };

  return (
    <nav className="w-full bg-surface-container-lowest/95 backdrop-blur-xl border-t border-outline-variant/30 select-none z-40 shrink-0">
      <div className="h-16 px-2 flex items-center justify-around gap-1 max-w-[420px] mx-auto">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={`mobile-tab-${tab.id}`}
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 py-1 px-2 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 active:scale-90 relative ${
                isActive
                  ? 'text-primary font-bold'
                  : 'text-on-surface-variant/70 hover:text-on-surface'
              }`}
            >
              {/* Active Tab Background Pill */}
              <div
                className={`flex items-center justify-center w-12 h-8 rounded-full transition-all duration-200 relative ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-sm scale-105'
                    : 'bg-transparent text-inherit'
                }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {tab.icon}
                </span>

                {/* Badge if present */}
                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-sm leading-tight ${
                      tab.id === 'character-maker'
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-tertiary text-on-tertiary'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[11px] leading-tight mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-primary' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Native Mobile Home Bar Indicator */}
      <div className="w-full pb-2 pt-0.5 flex justify-center items-center pointer-events-none">
        <div className="w-32 h-1 bg-neutral-900/30 rounded-full"></div>
      </div>
    </nav>
  );
};
