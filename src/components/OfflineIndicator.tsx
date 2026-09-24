import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-600/95 backdrop-blur-md px-3.5 py-1 text-[11px] font-bold text-white shadow-lg animate-bounce border border-amber-300/40">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <span>Tryb Offline — Świat Kiddo działa z pamięci telefonu 🎒</span>
    </div>
  );
};
