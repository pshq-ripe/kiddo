import React, { useState, useEffect } from 'react';
import { CharacterItem, ToyProp, TabType, EmotionType } from '../types';
import { APP_IMAGES, TOY_PROPS, EMOTIONS_LIST } from '../data/kiddoData';
import { sound } from '../utils/sound';
import { BadgesAlbumSection } from './BadgesAlbumSection';
import { AdventureJournalSection } from './AdventureJournalSection';
import { PhotoGallerySection } from './PhotoGallerySection';
import { MobileReleaseModal } from './MobileReleaseModal';
import { CharacterHead } from './CharacterHead';
import { unlockAchievement, getAchievementStats } from '../utils/achievementManager';
import { addJournalEntry, getJournalStats } from '../utils/journalManager';
import { getPhotos } from '../utils/photoGalleryManager';

interface BackpackDrawerProps {
  characters: CharacterItem[];
  activeCharacterId: string;
  onSelectCharacter: (charId: string) => void;
  onUpdateCharacter: (char: CharacterItem) => void;
  onNavigate: (tab: TabType, roomId?: string) => void;
}

export const BackpackDrawer: React.FC<BackpackDrawerProps> = ({
  characters,
  activeCharacterId,
  onSelectCharacter,
  onUpdateCharacter,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'journal' | 'badges' | 'characters' | 'food' | 'toys' | 'home'>('photos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [journalCount, setJournalCount] = useState<number>(() => getJournalStats().total);
  const [photosCount, setPhotosCount] = useState<number>(() => getPhotos().length);
  const [showReleaseModal, setShowReleaseModal] = useState(false);

  useEffect(() => {
    const handleJournalUpdate = () => {
      setJournalCount(getJournalStats().total);
    };
    const handlePhotosUpdate = () => {
      setPhotosCount(getPhotos().length);
    };
    window.addEventListener('kiddo_journal_updated', handleJournalUpdate);
    window.addEventListener('kiddo_photos_updated', handlePhotosUpdate);
    return () => {
      window.removeEventListener('kiddo_journal_updated', handleJournalUpdate);
      window.removeEventListener('kiddo_photos_updated', handlePhotosUpdate);
    };
  }, []);

  const stats = getAchievementStats();
  const activeChar = characters.find(c => c.id === activeCharacterId) || characters[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleSelectChar = (char: CharacterItem) => {
    sound.playPop(560);
    onSelectCharacter(char.id);
    showToast(`Wybrano postać: ${char.name}`);
  };

  const handleEmotionChange = (emotion: EmotionType, reaction: string) => {
    sound.playBoing();
    const updated: CharacterItem = {
      ...activeChar,
      currentEmotion: emotion
    };
    onUpdateCharacter(updated);
    showToast(`${activeChar.name} czuje teraz: ${emotion}! ${reaction}`);
    // Unlock Emotion Master badge
    unlockAchievement('emotion_master');
    // Log to Adventure Journal
    addJournalEntry({
      title: `${activeChar.name} wyraża nastrój: ${emotion}! 🎭`,
      note: `Reakcja postaci: "${reaction}". Bohaterowie dzielą się swoimi uczuciami!`,
      category: 'creativity',
      emoji: '🎭',
      characterName: activeChar.name
    });
  };

  const handleGiveProp = (prop: ToyProp) => {
    sound.playSparkle();
    const updated: CharacterItem = {
      ...activeChar,
      heldItem: prop.id
    };
    onUpdateCharacter(updated);
    showToast(`${activeChar.name} trzyma w rączce: ${prop.name}! ✨`);
    // Unlock Give Prop badge
    unlockAchievement('give_prop');
    // Log to Adventure Journal
    addJournalEntry({
      title: `${activeChar.name} bierze: ${prop.name}! 🧸`,
      note: `Do rączki powędrował przedmiot: ${prop.name} (${prop.subtitle}).`,
      category: 'play',
      emoji: '🧸',
      characterName: activeChar.name
    });
  };

  const handleRemoveProp = () => {
    sound.playPop(420);
    const updated: CharacterItem = {
      ...activeChar,
      heldItem: undefined
    };
    onUpdateCharacter(updated);
    showToast(`${activeChar.name} odłożył zabawkę do plecaka! 🧹`);
    addJournalEntry({
      title: `${activeChar.name} chowa zabawkę do plecaka`,
      note: 'Rączki postaci są puste i wolne do nowych zabaw.',
      category: 'play',
      emoji: '🧹',
      characterName: activeChar.name
    });
  };

  const handleReset = () => {
    sound.playPop(360);
    if (activeChar.heldItem) {
      onUpdateCharacter({
        ...activeChar,
        heldItem: undefined
      });
      showToast(`${activeChar.name} odłożył zabawkę! Skarbiec uporządkowany! 🧹`);
    } else {
      showToast('Wszystkie zabawki uporządkowane w skarbcu! 🧹');
    }
  };

  // Filter props by category
  const filteredProps = TOY_PROPS.filter(p => {
    if (activeTab === 'food') return p.category === 'food';
    if (activeTab === 'toys') return p.category === 'toys' || p.category === 'pets';
    if (activeTab === 'home') return p.category === 'home';
    return true;
  });

  return (
    <div className="flex flex-col w-full relative pb-8 select-none">
      {/* Playroom Scene Backdrop */}
      <div className="relative w-full h-[230px] overflow-hidden rounded-b-3xl shadow-inner border-b-4 border-surface-container-highest">
        <div
          className="bg-cover bg-center w-full h-full transform scale-105 filter blur-[1.5px] brightness-[0.88]"
          style={{ backgroundImage: `url('${APP_IMAGES.backpackRoomBackdrop}')` }}
        />

        {/* Floating Playful Characters on Backdrop */}
        <div className="absolute inset-0 flex items-center justify-around px-6 pointer-events-none">
          <div className="flex flex-col items-center animate-bounce duration-1000" style={{ animationDuration: '3.2s' }}>
            <div className="w-16 h-16 rounded-full bg-surface-container-lowest p-1 shadow-md flex items-center justify-center border-2 border-primary/20">
              <img
                src={APP_IMAGES.tomekAvatar}
                alt="Tomek"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="mt-1 bg-surface-container-lowest/90 text-on-surface px-2.5 py-0.5 rounded-full font-bold text-[11px] shadow-sm border border-outline-variant/30">
              Tomek
            </span>
          </div>

          <div className="flex flex-col items-center animate-pulse duration-1000">
            <div className="w-14 h-14 rounded-full bg-secondary-container p-1 shadow-md flex items-center justify-center border-2 border-secondary/30">
              <span className="material-symbols-outlined text-secondary text-[32px]">pets</span>
            </div>
            <span className="mt-1 bg-surface-container-lowest/90 text-on-surface px-2.5 py-0.5 rounded-full font-bold text-[11px] shadow-sm border border-outline-variant/30">
              Puszek
            </span>
          </div>
        </div>

        {/* Snapshot trigger from drawer */}
        <div className="absolute top-2 right-4">
          <button
            type="button"
            onClick={() => {
              sound.playSparkle();
              onNavigate('play-zone');
            }}
            className="bg-surface-container-lowest/90 text-primary active:scale-95 px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 font-bold text-[13px] border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[18px]">door_front</span>
            <span>Do Pokoju!</span>
          </button>
        </div>
      </div>

      {/* Backpack Drawer Sheet Overlay */}
      <div className="relative -mt-6 bg-surface-container-low rounded-t-3xl px-3.5 sm:px-4 pt-3 pb-6 shadow-2xl flex flex-col gap-4 border-t-4 border-surface-container-lowest">
        {/* Mobile Sheet Handle */}
        <div className="w-12 h-1.5 bg-outline-variant/60 rounded-full mx-auto mb-1"></div>

        {/* Drawer Header & Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[24px]">backpack</span>
            </div>
            <div>
              <h2 className="font-bold text-[19px] text-on-surface leading-tight">Worek Skarbów</h2>
              <p className="text-[12px] text-on-surface-variant font-medium">Dotknij lub wybierz do zabawy!</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="backpack-mobile-btn"
              title="Wydanie na telefon"
              onClick={() => {
                sound.playSparkle();
                setShowReleaseModal(true);
              }}
              className="h-10 px-2.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-extrabold text-[11px] shadow-xs active:scale-95 transition-transform flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[17px]">install_mobile</span>
              <span className="hidden xs:inline">Na telefon</span>
            </button>

            <button
              type="button"
              id="reset-btn"
              title="Zresetuj zabawki"
              onClick={handleReset}
              className="h-10 px-3 rounded-full bg-surface-container text-error active:scale-95 transition-transform flex items-center gap-1 font-bold text-[12px] shadow-sm border border-error/20"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              <span className="hidden sm:inline">Zresetuj</span>
            </button>

            <button
              type="button"
              id="close-drawer-btn"
              title="Do pokoju"
              onClick={() => onNavigate('play-zone')}
              className="w-10 h-10 rounded-full bg-primary text-on-primary active:scale-90 transition-transform flex items-center justify-center shadow-md"
            >
              <span className="material-symbols-outlined text-[24px]">keyboard_arrow_down</span>
            </button>
          </div>
        </div>

        {/* Delight & Badges / Journal / Photos Mini-Banner */}
        <div className="flex flex-col gap-2">
          <div className="w-full bg-gradient-to-r from-pink-100 via-sky-50 to-indigo-100 border border-pink-200/80 rounded-2xl p-2.5 px-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[22px] shrink-0 animate-bounce" style={{ animationDuration: '2.5s' }}>
                📸
              </span>
              <div className="truncate">
                <span className="font-extrabold text-[13px] text-indigo-950 block leading-tight truncate">
                  Galeria Pamiątek & Kronika
                </span>
                <span className="text-[11px] text-indigo-900/80 font-medium">
                  {photosCount} zdjęć z pokoi • {journalCount} wpisów • {stats.unlockedCount}/{stats.total} odznak
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  sound.playSparkle();
                  setActiveTab('photos');
                }}
                className={`px-2.5 py-1 rounded-full font-bold text-[11px] shadow-xs active:scale-95 transition-all ${
                  activeTab === 'photos'
                    ? 'bg-pink-600 text-white ring-2 ring-pink-500'
                    : 'bg-white/90 text-pink-950 border border-pink-300 hover:bg-pink-100'
                }`}
              >
                Zdjęcia 📸
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playSparkle();
                  setActiveTab('journal');
                }}
                className={`px-2.5 py-1 rounded-full font-bold text-[11px] shadow-xs active:scale-95 transition-all ${
                  activeTab === 'journal'
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-500'
                    : 'bg-white/90 text-indigo-950 border border-indigo-300 hover:bg-indigo-100'
                }`}
              >
                Dziennik 📖
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playSparkle();
                  setActiveTab('badges');
                }}
                className={`px-2.5 py-1 rounded-full font-bold text-[11px] shadow-xs active:scale-95 transition-all ${
                  activeTab === 'badges'
                    ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-500'
                    : 'bg-white/90 text-amber-950 border border-amber-300 hover:bg-amber-100'
                }`}
              >
                Odznaki ⭐
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-3.5 sm:-mx-4 px-3.5 sm:px-4">
          {[
            { id: 'photos', label: `📸 Galeria Zdjęć (${photosCount})`, icon: 'photo_library' },
            { id: 'journal', label: `📖 Dziennik Przygód (${journalCount})`, icon: 'auto_stories' },
            { id: 'badges', label: `⭐ Odznaki & Naklejki (${stats.unlockedCount})`, icon: 'military_tech' },
            { id: 'characters', label: `Moje Postacie (${characters.length})`, icon: 'group' },
            { id: 'food', label: 'Jedzenie & Smakołyki', icon: 'lunch_dining' },
            { id: 'toys', label: 'Zabawki & Zwierzaki', icon: 'smart_toy' },
            { id: 'home', label: 'Akcesoria domowe', icon: 'chair' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  sound.playPop(520);
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`shrink-0 h-10 px-3.5 rounded-full font-bold text-[13px] flex items-center gap-1.5 transition-all active:scale-95 ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-md scale-102 shadow-[0_3px_0px_#6e0028]'
                    : 'bg-surface-container-high text-on-surface-variant shadow-sm hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* View Section Switcher */}
        {activeTab === 'photos' ? (
          <PhotoGallerySection onNavigate={onNavigate} />
        ) : activeTab === 'journal' ? (
          <AdventureJournalSection
            activeCharacterName={activeChar.name}
            onNavigate={onNavigate}
            onShowToast={showToast}
          />
        ) : activeTab === 'badges' ? (
          <BadgesAlbumSection onNavigate={onNavigate} />
        ) : (
          <>
            {/* Character Carousel */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[15px] text-on-surface">Wybierz postać:</span>
                <span className="font-bold text-[12px] text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full border border-primary/20">
                  {activeChar.name} (aktywna)
                </span>
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 -mx-3.5 sm:-mx-4 px-3.5 sm:px-4 no-scrollbar">
                {/* New Character Button */}
                <button
                  type="button"
                  onClick={() => onNavigate('character-maker')}
                  className="shrink-0 w-[74px] h-[96px] rounded-2xl bg-surface-container-high active:scale-95 flex flex-col items-center justify-center gap-1 shadow-md text-on-surface-variant border-2 border-dashed border-outline-variant transition-transform hover:border-primary"
                >
                  <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-[28px]">add</span>
                  </div>
                  <span className="font-bold text-[11px] text-center text-primary">Nowa</span>
                </button>

                {/* Character Cards */}
                {characters.map((char) => {
                  const isSelected = char.id === activeChar.id;
                  return (
                    <div
                      key={char.id}
                      onClick={() => handleSelectChar(char)}
                      className={`char-card shrink-0 w-[80px] h-[100px] rounded-2xl bg-surface-container-lowest p-1.5 flex flex-col items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95 transition-all ${
                        isSelected ? 'ring-3 ring-primary border border-primary' : 'border border-outline-variant/30'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-primary-fixed/40 p-0.5 flex items-center justify-center shadow-xs">
                        <CharacterHead character={char} size={50} />
                      </div>
                      <span className="font-bold text-[12px] truncate w-full text-center text-on-surface">
                        {char.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Emotion Expression Picker for active character */}
            <div className="bg-surface-container rounded-3xl p-3.5 flex flex-col gap-2 shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[14px] text-on-surface flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">mood</span>
                  Wyraz twarzy {activeChar.name}:
                </span>
                <span className="font-bold text-[13px] text-secondary">
                  {activeChar.currentEmotion}!{' '}
                  {EMOTIONS_LIST.find(e => e.name === activeChar.currentEmotion)?.reaction || '😊'}
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {EMOTIONS_LIST.map((emo) => {
                  const isSelected = activeChar.currentEmotion === emo.name;
                  return (
                    <button
                      key={emo.name}
                      type="button"
                      onClick={() => handleEmotionChange(emo.name, emo.reaction)}
                      className={`emotion-btn flex flex-col items-center justify-center p-2 rounded-2xl bg-surface-container-lowest shadow-sm active:scale-90 transition-transform ${
                        isSelected ? 'ring-2 ring-primary border border-primary' : 'border border-outline-variant/20'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[26px] ${emo.color}`}>
                        {emo.icon}
                      </span>
                      <span className="font-bold text-[11px] mt-0.5 text-on-surface truncate">
                        {emo.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Give Props to Hand */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[16px] text-on-surface">Daj do rączki:</span>
                <span className="text-[12px] text-on-surface-variant font-medium">Dotknij by wręczyć</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {/* Empty hand / Drop prop option */}
                <div
                  onClick={handleRemoveProp}
                  title="Schowaj trzymany przedmiot"
                  className={`prop-item bg-surface-container-high rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-md active:scale-95 cursor-pointer transition-transform group border ${
                    !activeChar.heldItem ? 'ring-2 ring-primary border-primary bg-primary-fixed/20' : 'border-outline-variant/30 hover:border-outline'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-highest flex items-center justify-center mb-1 text-on-surface-variant group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[32px]">
                      {!activeChar.heldItem ? 'check' : 'pan_tool'}
                    </span>
                  </div>
                  <span className="font-bold text-[13px] text-center text-on-surface leading-none truncate w-full">
                    Pusta rączka
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-medium truncate w-full text-center">
                    {!activeChar.heldItem ? 'Rączka wolna' : 'Dotknij by odłożyć'}
                  </span>
                </div>

                {filteredProps.map((prop) => {
                  const isHeld = activeChar.heldItem === prop.id;
                  return (
                    <div
                      key={prop.id}
                      onClick={() => handleGiveProp(prop)}
                      className={`prop-item bg-surface-container-lowest rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-md active:scale-95 cursor-pointer transition-transform group border ${
                        isHeld ? 'ring-2 ring-secondary border-secondary' : 'border-outline-variant/30'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-2xl ${prop.colorBg} flex items-center justify-center mb-1`}>
                        <span className={`material-symbols-outlined text-[34px] ${prop.colorText} group-hover:scale-110 transition-transform`}>
                          {prop.iconName}
                        </span>
                      </div>
                      <span className="font-bold text-[13px] text-center text-on-surface leading-none truncate w-full">
                        {prop.name}
                      </span>
                      <span className="text-[10px] text-on-surface-variant font-medium truncate w-full text-center">
                        {prop.subtitle}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-secondary-container animate-bounce">
          <span className="material-symbols-outlined text-secondary-container text-[20px]">check_circle</span>
          <span className="font-bold text-[14px]">{toastMessage}</span>
        </div>
      )}

      {/* Mobile Release Modal */}
      <MobileReleaseModal
        isOpen={showReleaseModal}
        onClose={() => setShowReleaseModal(false)}
      />
    </div>
  );
};
