import React, { useState } from 'react';
import { sound } from '../utils/sound';
import { boostFriendship } from '../utils/friendshipManager';
import { addJournalEntry } from '../utils/journalManager';
import { addCoins } from '../utils/currencyManager';

interface FriendInteractionBubbleProps {
  char1Name: string;
  char1Id: string;
  char2Name: string;
  char2Id: string;
  onPerformAction: (actionText: string, emoji: string) => void;
  onClose: () => void;
}

export const FriendInteractionBubble: React.FC<FriendInteractionBubbleProps> = ({
  char1Name,
  char1Id,
  char2Name,
  char2Id,
  onPerformAction,
  onClose
}) => {
  const [activeEffect, setActiveEffect] = useState<string | null>(null);

  const interactions = [
    {
      id: 'high-five',
      label: 'Przybij Piątkę! ✋',
      emoji: '✋',
      soundFn: () => sound.playPop(850),
      speech: `${char1Name} i ${char2Name}: Ekipa Kiddo! Przybij piątkę! ✋⭐`,
      actionTitle: 'Wielka Piątka Przyjaciół'
    },
    {
      id: 'hug',
      label: 'Ciepły Przytulas 🤗',
      emoji: '💖',
      soundFn: () => sound.playSparkle(),
      speech: `${char1Name} i ${char2Name}: Najlepszy przytulasek na świecie! 🥰💕`,
      actionTitle: 'Ciepły Przytulas'
    },
    {
      id: 'dance',
      label: 'Wspólny Taniec 💃',
      emoji: '🎵',
      soundFn: () => sound.playBoing(),
      speech: `${char1Name} i ${char2Name}: Raz, dwa, trzy... zatańczmy wesoło! 🪩🎶`,
      actionTitle: 'Taniec Przyjaciół'
    },
    {
      id: 'snack',
      label: 'Podziel się Ciasteczkiem 🍪',
      emoji: '🍪',
      soundFn: () => sound.playNom(),
      speech: `${char1Name} częstuje ${char2Name} słodkim ciasteczkiem! Mniam! 🧁`,
      actionTitle: 'Słodki Poczęstunek'
    },
    {
      id: 'secret',
      label: 'Szept i Tajemnica 🤫',
      emoji: '🤫',
      soundFn: () => sound.playPop(620),
      speech: `${char1Name} szepcze do ${char2Name}: Hihi, to nasza mała tajemnica! 🤫✨`,
      actionTitle: 'Tajemny Szept'
    },
    {
      id: 'photo',
      label: 'Fotka Przyjaźni 📸',
      emoji: '📸',
      soundFn: () => sound.playCamera(),
      speech: `${char1Name} i ${char2Name}: Pamiątkowa fotka przyjaźni do albumu! 📸✌️`,
      actionTitle: 'Wspólne Zdjęcie'
    }
  ];

  const handleAction = (item: typeof interactions[0]) => {
    item.soundFn();
    setActiveEffect(item.emoji);

    // Boost friendship points
    boostFriendship(char1Id, 15, item.actionTitle);
    boostFriendship(char2Id, 15, item.actionTitle);

    // If it's a photo or snack, reward coins and journal entry!
    if (item.id === 'photo') {
      addCoins(15, `Pamiątkowe zdjęcie ${char1Name} i ${char2Name}`);
      addJournalEntry({
        title: `Zdjęcie Przyjaźni: ${char1Name} i ${char2Name}! 📸`,
        note: `Cudowna chwila zabawy i uśmiechu na scenie. Prawdziwi przyjaciele trzymają się razem!`,
        category: 'friendship',
        emoji: '📸',
        locationName: 'Scena Przygód Kiddo'
      });
    }

    onPerformAction(item.speech, item.emoji);

    setTimeout(() => {
      setActiveEffect(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur-md rounded-3xl p-2 shadow-2xl border-2 border-pink-400 flex flex-col items-center gap-1.5 min-w-[210px] animate-in zoom-in-90 duration-200">
      {/* Floating particles effect */}
      {activeEffect && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[32px] animate-bounce pointer-events-none drop-shadow-md">
          {activeEffect} {activeEffect} {activeEffect}
        </div>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between w-full px-1 border-b border-pink-100 pb-1">
        <span className="text-[11px] font-black text-pink-700 flex items-center gap-1">
          <span>💕</span>
          <span>Interakcja Przyjaciół</span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="w-5 h-5 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 text-[10px] font-bold flex items-center justify-center active:scale-90"
        >
          ✕
        </button>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-2 gap-1.5 w-full">
        {interactions.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleAction(item)}
            className="px-2 py-1.5 rounded-2xl bg-surface-container-low hover:bg-pink-50 border border-outline-variant/30 hover:border-pink-300 font-extrabold text-[10px] sm:text-[11px] text-on-surface flex items-center gap-1.5 active:scale-95 transition-all text-left"
          >
            <span className="text-[14px]">{item.emoji}</span>
            <span className="truncate">{item.label.split(' ')[0]} {item.label.split(' ')[1] || ''}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
