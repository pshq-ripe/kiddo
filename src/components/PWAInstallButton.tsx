import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { sound } from '../utils/sound';
import { MobileReleaseModal } from './MobileReleaseModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full' | 'header';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'compact'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // If already running in standalone PWA mode on phone, we don't need to prompt
  if (isInstalled) {
    return null;
  }

  const handleAction = async () => {
    sound.playSparkle();
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowModal(true);
      }
    } else {
      setShowModal(true);
    }
  };

  if (variant === 'header') {
    return (
      <>
        <button
          type="button"
          id="pwa-header-install-btn"
          aria-label="Pobierz na telefon"
          title="Zainstaluj grę na telefonie"
          onClick={handleAction}
          className={`h-9 px-2.5 rounded-full flex items-center gap-1.5 transition-all active:scale-90 border bg-gradient-to-r from-amber-400 to-pink-500 text-white font-extrabold text-[11px] shadow-xs hover:brightness-105 shrink-0 ${className}`}
        >
          <span className="material-symbols-outlined text-[17px]">install_mobile</span>
          <span className="hidden xs:inline">Na telefon</span>
        </button>

        <MobileReleaseModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  if (variant === 'full') {
    return (
      <>
        <button
          type="button"
          onClick={handleAction}
          className={`w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-500 to-indigo-500 text-white font-extrabold text-[14px] flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-98 transition-all ${className}`}
        >
          <span className="material-symbols-outlined text-[20px]">smartphone</span>
          <span>Zainstaluj Kiddo World na telefonie 📲</span>
        </button>

        <MobileReleaseModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleAction}
        className={`px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 font-bold text-[12px] flex items-center gap-1.5 transition-all active:scale-95 border border-primary/20 ${className}`}
      >
        <span className="material-symbols-outlined text-[16px]">install_mobile</span>
        <span>Zainstaluj na telefonie</span>
      </button>

      <MobileReleaseModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  );
};
