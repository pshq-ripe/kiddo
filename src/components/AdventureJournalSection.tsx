import React, { useState, useEffect } from 'react';
import { JournalEntry, JournalCategory, TabType } from '../types';
import {
  getJournalEntries,
  addJournalEntry,
  deleteJournalEntry,
  toggleFavoriteEntry,
  clearJournal,
  resetJournalToDefaults,
  getJournalStats,
  JOURNAL_CATEGORIES
} from '../utils/journalManager';
import { sound } from '../utils/sound';

interface Props {
  activeCharacterName?: string;
  onNavigate?: (tab: TabType) => void;
  onShowToast?: (msg: string) => void;
}

export const AdventureJournalSection: React.FC<Props> = ({
  activeCharacterName = 'Mój Bohater',
  onNavigate,
  onShowToast
}) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'favorites' | JournalCategory>('all');
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newNote, setNewNote] = useState<string>('');
  const [newEmoji, setNewEmoji] = useState<string>('⭐');
  const [newCategory, setNewCategory] = useState<JournalCategory>('play');
  const [readingEntryId, setReadingEntryId] = useState<string | null>(null);

  const refreshEntries = () => {
    setEntries(getJournalEntries());
  };

  useEffect(() => {
    refreshEntries();

    const handleUpdate = () => {
      refreshEntries();
    };

    window.addEventListener('kiddo_journal_updated', handleUpdate);
    return () => {
      window.removeEventListener('kiddo_journal_updated', handleUpdate);
    };
  }, []);

  const stats = getJournalStats();

  const filteredEntries = entries.filter(entry => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'favorites') return entry.isFavorite;
    return entry.category === selectedCategory;
  });

  const handleToggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playSparkle();
    toggleFavoriteEntry(id);
    if (onShowToast) {
      onShowToast('Zaktualizowano ulubione wspomnienie! ⭐');
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playPop(380);
    deleteJournalEntry(id);
    if (onShowToast) {
      onShowToast('Wpis usunięty z Dziennika.');
    }
  };

  const handleReadEntry = (entry: JournalEntry) => {
    sound.playPop(540);
    setReadingEntryId(entry.id);

    // Speak aloud using Web Speech API if supported
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`${entry.title}. ${entry.note}`);
        utterance.lang = 'pl-PL';
        utterance.rate = 0.95;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      } catch {
        // speech synthesis not available, ignore
      }
    }

    setTimeout(() => {
      setReadingEntryId(null);
    }, 4000);
  };

  const handleCreateCustomNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      if (onShowToast) onShowToast('Wpisz tytuł przygody! ✏️');
      return;
    }

    sound.playFanfare();
    sound.playSparkle();

    addJournalEntry({
      title: newTitle.trim(),
      note: newNote.trim() || 'Wspaniałe wspomnienie ze wspólnej zabawy w Miasteczku!',
      emoji: newEmoji,
      category: newCategory,
      characterName: activeCharacterName,
      locationName: 'Pamiętnik',
      isFavorite: true
    });

    setNewTitle('');
    setNewNote('');
    setIsAddingNote(false);

    if (onShowToast) {
      onShowToast('Zapisano nową przygodę w Dzienniku! 📖✨');
    }
  };

  const quickPrompts = [
    { title: 'Niezapomniana zabawa! 🎈', emoji: '🎉', cat: 'play' as JournalCategory },
    { title: 'Spotkanie z pupilkiem 🐾', emoji: '🐶', cat: 'pets' as JournalCategory },
    { title: 'Pyszny podwieczorek 🍰', emoji: '🍓', cat: 'snack' as JournalCategory },
    { title: 'Kolorowy obraz namalowany 🎨', emoji: '🌈', cat: 'creativity' as JournalCategory }
  ];

  return (
    <div className="flex flex-col gap-3.5 select-none pb-4">
      {/* Journal Header Banner */}
      <div className="bg-gradient-to-r from-sky-200 via-indigo-100 to-purple-200 rounded-3xl p-4 shadow-sm border-2 border-indigo-300/80 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md animate-pulse">
              <span className="material-symbols-outlined text-[26px]">auto_stories</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-[17px] text-indigo-950 leading-tight">
                  Dziennik Przygód
                </h3>
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Auto-Kronika
                </span>
              </div>
              <p className="text-[12px] text-indigo-900/80 font-medium">
                Automatyczny pamiętnik Twoich zabaw, odkryć i sukcesów!
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="bg-white/90 text-indigo-950 font-black text-[13px] px-3 py-1 rounded-full shadow-xs border border-indigo-200">
              {stats.total} {stats.total === 1 ? 'wpis' : stats.total < 5 ? 'wpisy' : 'wpisów'}
            </span>
            {stats.favoritesCount > 0 && (
              <span className="text-[10px] font-bold text-amber-700 mt-0.5 flex items-center gap-0.5">
                <span>⭐</span> {stats.favoritesCount} ulubionych
              </span>
            )}
          </div>
        </div>

        {/* Quick action bar */}
        <div className="flex items-center justify-between pt-1 border-t border-indigo-200/60 mt-1">
          <div className="flex items-center gap-1 text-[11px] text-indigo-900 font-bold">
            <span className="material-symbols-outlined text-[16px] text-indigo-600">history_edu</span>
            <span>Bohater: <strong className="text-indigo-950">{activeCharacterName}</strong></span>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playPop(520);
              setIsAddingNote(!isAddingNote);
            }}
            className="px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[12px] shadow-sm active:scale-95 transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isAddingNote ? 'close' : 'edit_note'}
            </span>
            <span>{isAddingNote ? 'Zamknij' : 'Dodaj notatkę'}</span>
          </button>
        </div>
      </div>

      {/* Custom Note Composer Form */}
      {isAddingNote && (
        <form
          onSubmit={handleCreateCustomNote}
          className="bg-surface-container-highest rounded-3xl p-3.5 border-2 border-indigo-300 shadow-md flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-[14px] text-on-surface flex items-center gap-1.5">
              <span>✍️</span> Wpisz własne wspomnienie
            </span>
            <span className="text-[11px] text-on-surface-variant font-medium">
              Dodaj do kroniki
            </span>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  sound.playPop(480);
                  setNewTitle(p.title);
                  setNewEmoji(p.emoji);
                  setNewCategory(p.cat);
                }}
                className="px-2 py-1 rounded-xl bg-surface-container text-on-surface text-[11px] font-semibold hover:bg-primary/10 border border-outline-variant/30 active:scale-95 transition-transform flex items-center gap-1"
              >
                <span>{p.emoji}</span>
                <span>{p.title}</span>
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div className="flex gap-2">
            {/* Emoji picker */}
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-on-surface-variant mb-1">Naklejka</label>
              <div className="flex gap-1">
                {['⭐', '🎈', '💖', '🦄', '🐾', '🍰', '🎨', '🚀'].map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => {
                      sound.playPop(600);
                      setNewEmoji(em);
                    }}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-[16px] transition-transform ${
                      newEmoji === em
                        ? 'bg-indigo-600 text-white scale-110 shadow-xs'
                        : 'bg-surface-container text-on-surface hover:scale-105'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <input
              type="text"
              placeholder="Tytuł przygody, np. Odkrycie wielkiego zamku!"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              maxLength={40}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-[13px] font-bold text-on-surface focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Krótki opis lub wspomnienie (opcjonalnie)..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              maxLength={150}
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-[12px] font-medium text-on-surface resize-none focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNote(false)}
              className="px-3 py-1.5 rounded-full text-[12px] font-bold text-on-surface-variant hover:bg-surface-container"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-[12px] font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">bookmark_add</span>
              <span>Zapisz w Pamiętniku</span>
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-3.5 sm:-mx-4 px-3.5 sm:px-4 py-0.5">
        {[
          { id: 'all', label: 'Wszystkie', icon: 'list_alt' },
          { id: 'favorites', label: '⭐ Ulubione', icon: 'star' },
          { id: 'play', label: '🎠 Zabawa', icon: 'attractions' },
          { id: 'discovery', label: '🗺️ Odkrycia', icon: 'explore' },
          { id: 'pets', label: '🐾 Zwierzaki', icon: 'pets' },
          { id: 'snack', label: '🍰 Smakołyki', icon: 'cake' },
          { id: 'creativity', label: '🎨 Twórczość', icon: 'palette' },
          { id: 'achievement', label: '🏆 Sukcesy', icon: 'military_tech' }
        ].map(cat => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                sound.playPop(520);
                setSelectedCategory(cat.id as any);
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full font-bold text-[12px] transition-all flex items-center gap-1 active:scale-95 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Journal Entries List */}
      <div className="flex flex-col gap-2.5">
        {filteredEntries.length === 0 ? (
          <div className="bg-surface-container-high rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-2 border border-outline-variant/30">
            <span className="text-[40px] animate-bounce">📖</span>
            <h4 className="font-extrabold text-[15px] text-on-surface">Brak wpisów w tej kategorii</h4>
            <p className="text-[12px] text-on-surface-variant max-w-xs">
              Baw się w pokoju, twórz postacie, karm pupili i odkrywaj nowe miejsca — notatki pojawią się tu same!
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className="mt-1 px-3 py-1.5 rounded-full bg-indigo-600 text-white font-bold text-[11px] shadow-xs active:scale-95"
            >
              Pokaż wszystkie wpisy
            </button>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const catMeta = JOURNAL_CATEGORIES[entry.category] || JOURNAL_CATEGORIES.play;
            const isReading = readingEntryId === entry.id;

            return (
              <div
                key={entry.id}
                onClick={() => handleReadEntry(entry)}
                className={`group relative bg-gradient-to-r ${catMeta.bgGradient} rounded-2xl p-3 shadow-xs border transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.99] flex flex-col gap-2 ${
                  isReading ? 'ring-2 ring-indigo-500 scale-[1.01]' : 'border-outline-variant/20'
                }`}
              >
                {/* Header row: Category pill, timestamp, actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[18px] leading-none shrink-0">
                      {entry.emoji || catMeta.emoji}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${catMeta.badgeColor}`}>
                      {catMeta.label}
                    </span>
                    {entry.locationName && (
                      <span className="text-[10px] font-bold text-on-surface-variant bg-surface-container/70 px-2 py-0.5 rounded-full border border-outline-variant/20 truncate max-w-[110px]">
                        📍 {entry.locationName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-on-surface-variant/80 mr-1">
                      {entry.timestamp}
                    </span>

                    {/* Favorite Star Button */}
                    <button
                      type="button"
                      title={entry.isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                      onClick={(e) => handleToggleFav(entry.id, e)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90 ${
                        entry.isFavorite
                          ? 'text-amber-500 bg-amber-100 hover:bg-amber-200'
                          : 'text-on-surface-variant hover:text-amber-500 hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {entry.isFavorite ? 'star' : 'star_border'}
                      </span>
                    </button>

                    {/* Delete Note Button */}
                    <button
                      type="button"
                      title="Usuń wpis"
                      onClick={(e) => handleDelete(entry.id, e)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant/60 hover:text-error hover:bg-error-container/30 transition-transform active:scale-90 opacity-40 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </div>

                {/* Entry Content */}
                <div className="flex flex-col">
                  <h4 className="font-extrabold text-[14px] text-on-surface leading-snug">
                    {entry.title}
                  </h4>
                  <p className="text-[12px] text-on-surface-variant font-medium mt-0.5 leading-relaxed">
                    {entry.note}
                  </p>
                </div>

                {/* Footer metadata */}
                <div className="flex items-center justify-between pt-1 border-t border-black/5 text-[10px] font-bold text-on-surface-variant/70">
                  <div className="flex items-center gap-1">
                    {entry.characterName && (
                      <span>Uczestnik: <strong>{entry.characterName}</strong></span>
                    )}
                  </div>

                  <span className="flex items-center gap-0.5 text-indigo-700 group-hover:underline">
                    <span className="material-symbols-outlined text-[12px]">volume_up</span>
                    <span>{isReading ? 'Czytanie na głos...' : 'Dotknij, aby odsłuchać'}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer controls: Clear & Restore */}
      <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-on-surface-variant">
        <span>Zapisano w pamięci urządzenia 💾</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playSparkle();
              resetJournalToDefaults();
              if (onShowToast) onShowToast('Przywrócono przykładowe wspomnienia! 🎈');
            }}
            className="hover:underline font-bold text-indigo-700"
          >
            Przywróć wpisy początkowe
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Czy na pewno chcesz wyczyścić Dziennik Przygód?')) {
                sound.playPop(300);
                clearJournal();
                if (onShowToast) onShowToast('Dziennik Przygód został wyczyszczony.');
              }
            }}
            className="hover:underline text-error font-medium"
          >
            Wyczyść kronikę
          </button>
        </div>
      </div>
    </div>
  );
};
