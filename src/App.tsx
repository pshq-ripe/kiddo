import { useState, useEffect } from 'react';
import { TabType, WeatherType, CharacterItem } from './types';
import { PRESET_CHARACTERS } from './data/kiddoData';
import { sound } from './utils/sound';
import { isRewardAvailableToday } from './utils/calendarManager';
import { WorldMap } from './components/WorldMap';
import { CharacterMaker } from './components/CharacterMaker';
import { PlayZone } from './components/PlayZone';
import { BackpackDrawer } from './components/BackpackDrawer';
import { PhoneSimulator } from './components/PhoneSimulator';
import { AchievementCelebrationToast } from './components/AchievementCelebrationToast';
import { DailyAdventureCalendarModal } from './components/DailyAdventureCalendarModal';
import { InvitationNotificationToast } from './components/InvitationNotificationToast';
import { FriendshipManagerModal } from './components/FriendshipManagerModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('world-map');
  const [weather, setWeather] = useState<WeatherType>('sun');
  const [activeRoomId, setActiveRoomId] = useState<string>('apartment');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const enabled = localStorage.getItem('kiddo_sound_enabled') !== 'false';
      sound.enabled = enabled;
      return enabled;
    } catch {
      return true;
    }
  });
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [isDailyCalendarOpen, setIsDailyCalendarOpen] = useState<boolean>(false);
  const [isGlobalFriendsOpen, setIsGlobalFriendsOpen] = useState<boolean>(false);
  const [selectedMailIdForModal, setSelectedMailIdForModal] = useState<string | undefined>(undefined);

  // Auto prompt daily calendar on first launch of the session if reward is waiting
  useEffect(() => {
    try {
      const hasPrompted = sessionStorage.getItem('kiddo_calendar_auto_prompted');
      if (!hasPrompted && isRewardAvailableToday()) {
        sessionStorage.setItem('kiddo_calendar_auto_prompted', 'true');
        const timer = setTimeout(() => {
          setIsDailyCalendarOpen(true);
        }, 900);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  // Characters roster with LocalStorage persistence
  const [characters, setCharacters] = useState<CharacterItem[]>(() => {
    try {
      const stored = localStorage.getItem('kiddo_characters');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return PRESET_CHARACTERS;
  });

  const [activeCharacterId, setActiveCharacterId] = useState<string>(() => {
    try {
      return localStorage.getItem('kiddo_active_character') || 'zosia';
    } catch {
      return 'zosia';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('kiddo_active_character', activeCharacterId);
    } catch {
      // ignore
    }
  }, [activeCharacterId]);

  useEffect(() => {
    try {
      localStorage.setItem('kiddo_characters', JSON.stringify(characters));
    } catch {
      // ignore
    }
  }, [characters]);

  // Handle Tab Navigation with phone-style audio and vibration
  const handleNavigate = (tab: TabType, roomId?: string) => {
    sound.playPop(tab === 'world-map' ? 520 : tab === 'character-maker' ? 620 : tab === 'play-zone' ? 680 : 540);
    setActiveTab(tab);
    if (roomId) {
      setActiveRoomId(roomId);
    }
  };

  // Sound toggle
  const toggleSound = () => {
    const nextState = !soundEnabled;
    sound.enabled = nextState;
    setSoundEnabled(nextState);
    try {
      localStorage.setItem('kiddo_sound_enabled', String(nextState));
    } catch {
      // ignore
    }
    if (nextState) {
      sound.playPop(620);
    }
  };

  // Add saved character from Maker
  const handleSaveCharacter = (newChar: CharacterItem) => {
    setCharacters(prev => [newChar, ...prev]);
    setActiveCharacterId(newChar.id);
  };

  // Update existing character (emotion, prop, etc.)
  const handleUpdateCharacter = (updated: CharacterItem) => {
    setCharacters(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  // Polish Tab Title Map for mobile header
  const titleMap: Record<TabType, string> = {
    'world-map': 'Świat Przygód',
    'character-maker': 'Kreator Postaci',
    'play-zone': 'Pokój Zabaw',
    'backpack-drawer': 'Mój Plecak'
  };

  const activeChar = characters.find(c => c.id === activeCharacterId) || characters[0];

  return (
    <PhoneSimulator
      activeTab={activeTab}
      title={titleMap[activeTab]}
      soundEnabled={soundEnabled}
      onToggleSound={toggleSound}
      activeCharacter={activeChar}
      characterCount={characters.length}
      onNavigate={handleNavigate}
      isMusicPlaying={isMusicPlaying || sound.musicPlaying}
      weather={weather}
      onWeatherChange={setWeather}
    >
      {activeTab === 'world-map' && (
        <WorldMap
          weather={weather}
          onWeatherChange={setWeather}
          onNavigate={handleNavigate}
        />
      )}

      {activeTab === 'character-maker' && (
        <CharacterMaker onSaveCharacter={handleSaveCharacter} />
      )}

      {activeTab === 'play-zone' && (
        <PlayZone
          characters={characters}
          activeRoomId={activeRoomId}
          onRoomChange={setActiveRoomId}
          onNavigate={handleNavigate}
          onUpdateCharacter={handleUpdateCharacter}
        />
      )}

      {activeTab === 'backpack-drawer' && (
        <BackpackDrawer
          characters={characters}
          activeCharacterId={activeCharacterId}
          onSelectCharacter={setActiveCharacterId}
          onUpdateCharacter={handleUpdateCharacter}
          onNavigate={handleNavigate}
        />
      )}

      {/* Global Achievement Celebration Banner */}
      <AchievementCelebrationToast onNavigate={handleNavigate} />

      {/* Global Room Invitation Toast Banner */}
      <InvitationNotificationToast
        onAcceptMeeting={(roomId, _friendId, friendName, activityName) => {
          handleNavigate('play-zone', roomId);
        }}
        onOpenMailbox={(mailId) => {
          setSelectedMailIdForModal(mailId);
          setIsGlobalFriendsOpen(true);
        }}
      />

      {/* Daily Adventure Calendar Modal */}
      <DailyAdventureCalendarModal
        isOpen={isDailyCalendarOpen}
        onClose={() => setIsDailyCalendarOpen(false)}
        onNavigateToDecorate={() => {
          setIsDailyCalendarOpen(false);
          handleNavigate('play-zone', 'apartment');
        }}
      />

      {/* Global Friendship & Invitations Modal */}
      <FriendshipManagerModal
        isOpen={isGlobalFriendsOpen}
        initialMailId={selectedMailIdForModal}
        initialTab="mailbox"
        onClose={() => {
          setIsGlobalFriendsOpen(false);
          setSelectedMailIdForModal(undefined);
        }}
        onAcceptMeeting={(roomId) => {
          setIsGlobalFriendsOpen(false);
          setSelectedMailIdForModal(undefined);
          handleNavigate('play-zone', roomId);
        }}
        onInviteToRoom={() => {
          setIsGlobalFriendsOpen(false);
          handleNavigate('play-zone', 'apartment');
        }}
        onStartParty={() => {
          setIsGlobalFriendsOpen(false);
          handleNavigate('play-zone', 'apartment');
        }}
      />
    </PhoneSimulator>
  );
}
