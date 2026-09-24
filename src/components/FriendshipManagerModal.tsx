import React, { useState, useEffect } from 'react';
import {
  FriendProfile,
  FriendMail,
  RoomInvitation,
  INVITATION_ROOMS,
  InvitationRoomDef,
  getFriendsList,
  getMailbox,
  sendGiftToFriend,
  sendRoomInvitation,
  acceptInvitation,
  declineInvitation,
  simulateIncomingFriendInvitation,
  claimMailGift,
  markMailAsRead,
  boostFriendship
} from '../utils/friendshipManager';
import { sound } from '../utils/sound';
import { getCoins, spendCoins } from '../utils/currencyManager';

interface FriendshipManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteToRoom?: (friendId: string, friendName: string) => void;
  onStartParty?: () => void;
  onAcceptMeeting?: (roomId: string, friendId: string, friendName: string, activityName?: string) => void;
  initialMailId?: string;
  initialTab?: 'friends' | 'mailbox' | 'invite' | 'send';
}

export const FriendshipManagerModal: React.FC<FriendshipManagerModalProps> = ({
  isOpen,
  onClose,
  onInviteToRoom,
  onStartParty,
  onAcceptMeeting,
  initialMailId,
  initialTab = 'friends'
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'mailbox' | 'invite' | 'send'>(initialTab);
  const [friends, setFriends] = useState<FriendProfile[]>(() => getFriendsList());
  const [mails, setMails] = useState<FriendMail[]>(() => getMailbox());
  const [selectedMail, setSelectedMail] = useState<FriendMail | null>(null);
  const [mailboxFilter, setMailboxFilter] = useState<'all' | 'invitations' | 'unread'>('all');

  // Invitation Form State
  const [inviterChar, setInviterChar] = useState<{ id: string; name: string; emoji: string }>({
    id: 'player',
    name: 'Twoja Postać',
    emoji: '⭐'
  });
  const [inviteRecipientId, setInviteRecipientId] = useState<string>('zosia');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('apartment');
  const [selectedActivity, setSelectedActivity] = useState<string>(
    INVITATION_ROOMS[0].activities[0]
  );
  const [invitationMessage, setInvitationMessage] = useState<string>(
    'Chodźmy razem na wesołą przygodę! Będzie wspaniała zabawa! 🎈'
  );
  const [inviteSuccess, setInviteSuccess] = useState<boolean>(false);

  // Send Gift Form state
  const [targetFriendId, setTargetFriendId] = useState<string>('');
  const [selectedGiftType, setSelectedGiftType] = useState<{
    id: 'snack' | 'sticker' | 'postcard' | 'coins';
    emoji: string;
    label: string;
    cost: number;
  }>({
    id: 'snack',
    emoji: '🧁',
    label: 'Cukierkowa Babeczka',
    cost: 15
  });
  const [greetingText, setGreetingText] = useState<string>('Jesteś moim najlepszym przyjacielem! 💖');
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);

  // Sync data updates
  useEffect(() => {
    const handleFriends = () => setFriends(getFriendsList());
    const handleMails = () => setMails(getMailbox());

    window.addEventListener('kiddo_friends_updated', handleFriends);
    window.addEventListener('kiddo_mailbox_updated', handleMails);

    return () => {
      window.removeEventListener('kiddo_friends_updated', handleFriends);
      window.removeEventListener('kiddo_mailbox_updated', handleMails);
    };
  }, []);

  // Update room activity when selected room changes
  const currentRoomDef = INVITATION_ROOMS.find(r => r.id === selectedRoomId) || INVITATION_ROOMS[0];

  useEffect(() => {
    if (currentRoomDef.activities.length > 0 && !currentRoomDef.activities.includes(selectedActivity)) {
      setSelectedActivity(currentRoomDef.activities[0]);
    }
  }, [selectedRoomId, currentRoomDef, selectedActivity]);

  // Handle opening specific mail if requested
  useEffect(() => {
    if (initialMailId && isOpen) {
      const found = mails.find(m => m.id === initialMailId);
      if (found) {
        setSelectedMail(found);
        setActiveTab('mailbox');
        markMailAsRead(found.id);
      }
    }
  }, [initialMailId, isOpen, mails]);

  if (!isOpen) return null;

  const unreadCount = mails.filter(m => !m.isRead || (!m.isGiftClaimed && m.gift)).length;
  const invitationsCount = mails.filter(m => m.invitation).length;
  const pendingInvitationsCount = mails.filter(m => m.invitation && m.invitation.status === 'pending').length;

  const giftOptions = [
    { id: 'snack' as const, emoji: '🧁', label: 'Słodka Babeczka', cost: 15 },
    { id: 'snack' as const, emoji: '🍪', label: 'Ciasteczko Przyjaźni', cost: 10 },
    { id: 'postcard' as const, emoji: '💌', label: 'Bajkowa Pocztówka', cost: 5 },
    { id: 'postcard' as const, emoji: '🌸', label: 'Pachnący Kwiatuszek', cost: 12 },
    { id: 'sticker' as const, emoji: '⭐', label: 'Złota Gwiazdka', cost: 20 },
    { id: 'sticker' as const, emoji: '🎈', label: 'Radosny Balonik', cost: 15 },
    { id: 'coins' as const, emoji: '🪙', label: 'Sakiewka 25 Monet', cost: 25 }
  ];

  // Send Gift Handler
  const handleSendGiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFriendId) return;

    const currentCoins = getCoins();
    if (selectedGiftType.cost > 0 && currentCoins < selectedGiftType.cost) {
      sound.playBoing();
      return;
    }

    if (selectedGiftType.cost > 0) {
      spendCoins(selectedGiftType.cost, `Wysłano prezent dla znajomego`);
    }

    sendGiftToFriend(
      targetFriendId,
      selectedGiftType.id,
      selectedGiftType.emoji,
      selectedGiftType.label,
      greetingText
    );

    sound.playCoin();
    setTimeout(() => sound.playSparkle(), 200);
    setSendSuccess(true);
    setTimeout(() => {
      setSendSuccess(false);
      setActiveTab('mailbox');
    }, 1400);
  };

  // Send Invitation Handler
  const handleSendInvitationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const recipientFriend = friends.find(f => f.id === inviteRecipientId) || friends[0];
    if (!recipientFriend) return;

    sound.playFanfare();

    sendRoomInvitation(
      inviterChar,
      {
        id: recipientFriend.id,
        name: recipientFriend.name,
        emoji: recipientFriend.avatarEmoji
      },
      currentRoomDef.id,
      selectedActivity,
      invitationMessage
    );

    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setActiveTab('mailbox');
    }, 1400);
  };

  // Accept Meeting Invitation
  const handleAcceptMeetingAction = (mail: FriendMail) => {
    sound.playFanfare();
    const res = acceptInvitation(mail.id);
    if (res.invitation) {
      onClose();
      onAcceptMeeting?.(
        res.invitation.targetRoomId,
        res.invitation.inviterId,
        res.invitation.inviterName,
        res.invitation.activityName
      );
    }
  };

  // Decline Meeting Invitation
  const handleDeclineMeetingAction = (mail: FriendMail) => {
    sound.playPop(380);
    declineInvitation(mail.id);
    if (selectedMail && selectedMail.id === mail.id) {
      setSelectedMail({
        ...selectedMail,
        invitation: selectedMail.invitation ? { ...selectedMail.invitation, status: 'declined' } : undefined
      });
    }
  };

  // Quick hug
  const handleQuickHug = (friend: FriendProfile) => {
    sound.playSparkle();
    boostFriendship(friend.id, 15, 'Ciepły Przytulas');
  };

  // Filtered mails
  const filteredMails = mails.filter(m => {
    if (mailboxFilter === 'invitations') return !!m.invitation;
    if (mailboxFilter === 'unread') return !m.isRead || (!m.isGiftClaimed && m.gift);
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300 p-3.5 sm:p-4 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/25 backdrop-blur-xs flex items-center justify-center text-[26px] shadow-inner shrink-0">
              🫂
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-[17px] sm:text-[19px] leading-tight drop-shadow-xs truncate">
                Klub Przyjaciół & Poczta
              </h2>
              <p className="text-[11px] sm:text-[12px] text-white/95 font-bold truncate">
                Wymieniaj listy, wysyłaj zaproszenia i spotykajcie się w pokojach!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playPop(380);
              onClose();
            }}
            aria-label="Zamknij"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-black text-[15px] transition-transform active:scale-90 shrink-0 ml-2"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation Navigation Pills */}
        <div className="flex items-center justify-around bg-surface-container-high p-1.5 border-b border-outline-variant/30 gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              sound.playPop(520);
              setActiveTab('friends');
              setSelectedMail(null);
            }}
            className={`flex-1 py-2 px-2.5 rounded-2xl font-black text-[12px] sm:text-[13px] flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
              activeTab === 'friends'
                ? 'bg-surface-container-lowest text-primary shadow-sm ring-2 ring-primary/30'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>👥</span>
            <span>Znajomi</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPop(560);
              setActiveTab('mailbox');
              setSelectedMail(null);
            }}
            className={`flex-1 py-2 px-2.5 rounded-2xl font-black text-[12px] sm:text-[13px] flex items-center justify-center gap-1 relative transition-all whitespace-nowrap ${
              activeTab === 'mailbox'
                ? 'bg-surface-container-lowest text-primary shadow-sm ring-2 ring-primary/30'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>📬</span>
            <span>Poczta</span>
            {pendingInvitationsCount > 0 ? (
              <span className="w-5 h-5 rounded-full bg-pink-500 text-white font-black text-[10px] flex items-center justify-center animate-bounce" title={`${pendingInvitationsCount} oczekujące zaproszenia`}>
                💌
              </span>
            ) : unreadCount > 0 ? (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white font-black text-[10px] flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPop(600);
              setActiveTab('invite');
              setSelectedMail(null);
            }}
            className={`flex-1 py-2 px-2.5 rounded-2xl font-black text-[12px] sm:text-[13px] flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
              activeTab === 'invite'
                ? 'bg-surface-container-lowest text-primary shadow-sm ring-2 ring-primary/30'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>💌</span>
            <span>Zaproszenie</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPop(640);
              setActiveTab('send');
              setSelectedMail(null);
            }}
            className={`flex-1 py-2 px-2.5 rounded-2xl font-black text-[12px] sm:text-[13px] flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
              activeTab === 'send'
                ? 'bg-surface-container-lowest text-primary shadow-sm ring-2 ring-primary/30'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>🎁</span>
            <span>Prezent</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-3.5 sm:p-4 overflow-y-auto flex-1 flex flex-col gap-3">
          
          {/* ================= TAB 1: FRIENDS LIST ================= */}
          {activeTab === 'friends' && (
            <div className="flex flex-col gap-3">
              {/* Quick Action Banner */}
              <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-rose-100 border-2 border-amber-300 rounded-3xl p-3 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-[28px] animate-bounce">🎈</span>
                  <div>
                    <h3 className="font-black text-[14px] text-amber-950">
                      Zorganizuj Imprezę lub Zabawę!
                    </h3>
                    <p className="text-[11px] text-amber-900/80 font-bold">
                      Zaproś znajomych do wybranego pokoju na spotkanie!
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      sound.playSparkle();
                      simulateIncomingFriendInvitation();
                    }}
                    title="Poproś o niespodziankowe zaproszenie od przyjaciela"
                    className="px-2.5 py-1.5 rounded-2xl bg-white hover:bg-pink-50 text-pink-700 font-extrabold text-[11px] border border-pink-300 shadow-2xs active:scale-95 transition-transform"
                  >
                    <span>Niespodzianka ✨</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playFanfare();
                      onStartParty?.();
                      onClose();
                    }}
                    className="px-3 py-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-black text-[12px] shadow-sm flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <span>Impreza 🎉</span>
                  </button>
                </div>
              </div>

              {/* Friends Cards */}
              <div className="flex flex-col gap-2.5">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-surface-container-low hover:bg-surface-container rounded-3xl p-3 border border-outline-variant/30 flex items-center justify-between gap-3 shadow-2xs transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="w-13 h-13 rounded-2xl bg-surface-container-lowest border-2 border-pink-300 flex items-center justify-center text-[28px] shrink-0 shadow-xs">
                        {friend.avatarEmoji}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-[15px] text-on-surface truncate">
                            {friend.name}
                          </h4>
                          {/* Friendship Hearts */}
                          <div className="flex items-center text-[12px] text-pink-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < friend.friendshipLevel ? 'opacity-100' : 'opacity-25'}>
                                ❤️
                              </span>
                            ))}
                          </div>
                        </div>

                        <p className="text-[11px] text-on-surface-variant font-semibold truncate mt-0.5">
                          {friend.favoriteActivity}
                        </p>

                        {friend.lastInteractionText && (
                          <span className="text-[10px] font-bold text-pink-600 bg-pink-100/70 rounded-full px-2 py-0.5 w-fit mt-1">
                            {friend.lastInteractionText}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Send Invitation shortcut button */}
                      <button
                        type="button"
                        onClick={() => {
                          sound.playPop(580);
                          setInviteRecipientId(friend.id);
                          setActiveTab('invite');
                        }}
                        title="Wyślij zaproszenie do wybranego pokoju"
                        className="px-2.5 py-1.5 rounded-2xl bg-pink-100 hover:bg-pink-200 text-pink-800 font-extrabold text-[11px] flex items-center gap-1 shadow-2xs active:scale-90 transition-transform"
                      >
                        <span>Zaproś</span>
                        <span>💌</span>
                      </button>

                      {/* Hug button */}
                      <button
                        type="button"
                        onClick={() => handleQuickHug(friend)}
                        title="Przytul znajomego (+15 pkt przyjaźni)"
                        className="w-8 h-8 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center text-[15px] shadow-2xs active:scale-90 transition-transform"
                      >
                        🤗
                      </button>

                      {/* Send Gift shortcut */}
                      <button
                        type="button"
                        onClick={() => {
                          sound.playPop();
                          setTargetFriendId(friend.id);
                          setActiveTab('send');
                        }}
                        title="Wyślij prezent"
                        className="w-8 h-8 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center text-[15px] shadow-2xs active:scale-90 transition-transform"
                      >
                        🎁
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 2: FRIENDSHIP MAILBOX & INVITATIONS ================= */}
          {activeTab === 'mailbox' && (
            <div className="flex flex-col gap-2.5">
              {/* Filter pills when in list view */}
              {!selectedMail && (
                <div className="flex items-center gap-1.5 pb-1 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setMailboxFilter('all')}
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${
                      mailboxFilter === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Wszystkie ({mails.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setMailboxFilter('invitations')}
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 transition-all ${
                      mailboxFilter === 'invitations'
                        ? 'bg-pink-500 text-white shadow-xs'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <span>💌 Zaproszenia ({invitationsCount})</span>
                    {pendingInvitationsCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-white text-pink-600 text-[9px] font-black flex items-center justify-center">
                        {pendingInvitationsCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMailboxFilter('unread')}
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${
                      mailboxFilter === 'unread'
                        ? 'bg-amber-500 text-white'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Nieodebrane ({unreadCount})
                  </button>
                </div>
              )}

              {selectedMail ? (
                /* Single Mail Detail View */
                <div className="bg-surface-container-low rounded-3xl p-4 border-2 border-amber-300 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-amber-300 flex items-center justify-center text-[22px]">
                        {selectedMail.fromFriendEmoji}
                      </div>
                      <div>
                        <h4 className="font-black text-[15px] text-on-surface">
                          {selectedMail.subject}
                        </h4>
                        <span className="text-[11px] text-on-surface-variant font-bold">
                          Od: {selectedMail.fromFriendName} • {selectedMail.dateStr}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedMail(null)}
                      className="px-2.5 py-1 rounded-xl bg-surface-container font-extrabold text-[11px] text-on-surface hover:bg-surface-container-high"
                    >
                      ← Wróć do listy
                    </button>
                  </div>

                  {/* Letter Message Body */}
                  <div className="bg-white/80 p-3.5 rounded-2xl border border-outline-variant/20 shadow-inner flex flex-col gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-pink-700">
                      Treść Wiadomości:
                    </span>
                    <p className="text-[13px] text-on-surface font-medium leading-relaxed">
                      {selectedMail.message}
                    </p>
                  </div>

                  {/* Dedicated Digital Room Invitation Card */}
                  {selectedMail.invitation && (
                    <div className="bg-gradient-to-r from-pink-100 via-rose-50 to-amber-100 rounded-2xl p-3.5 border-2 border-pink-400 flex flex-col gap-2.5 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-pink-500 text-white flex items-center justify-center text-[14px]">
                            💌
                          </span>
                          <div>
                            <span className="font-black text-[12px] text-pink-900 uppercase tracking-wide block">
                              Cyfrowe Zaproszenie na Spotkanie!
                            </span>
                            <span className="text-[11px] font-bold text-pink-950">
                              {selectedMail.invitation.inviterName} zaprasza {selectedMail.invitation.recipientName}
                            </span>
                          </div>
                        </div>

                        {selectedMail.invitation.status === 'accepted' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-300 flex items-center gap-1">
                            <span>✓ Zaakceptowane</span>
                          </span>
                        ) : selectedMail.invitation.status === 'declined' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-bold text-[10px]">
                            Odłożone na później
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-pink-200 text-pink-900 font-black text-[10px] border border-pink-300 animate-pulse">
                            Oczekuje na odpowiedź ⭐
                          </span>
                        )}
                      </div>

                      {/* Location & Activity Box */}
                      <div className="bg-white/90 rounded-xl p-2.5 border border-pink-200 flex items-center gap-2.5">
                        <div className="w-11 h-11 rounded-xl bg-pink-50 border border-pink-300 flex items-center justify-center text-[24px] shrink-0">
                          {selectedMail.invitation.roomEmoji}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-[13px] text-pink-950 truncate">
                            {selectedMail.invitation.roomName}
                          </span>
                          <span className="text-[11px] text-on-surface-variant font-semibold truncate">
                            Zabawa: "{selectedMail.invitation.activityName}"
                          </span>
                        </div>
                      </div>

                      {/* Invitation Actions */}
                      {selectedMail.invitation.status === 'pending' ? (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleDeclineMeetingAction(selectedMail)}
                            className="py-2 px-3 rounded-xl bg-white hover:bg-surface-container text-on-surface-variant font-bold text-[11px] border border-outline-variant/30 active:scale-95 transition-transform"
                          >
                            Innym razem 💬
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAcceptMeetingAction(selectedMail)}
                            className="py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-[12px] shadow-sm flex items-center justify-center gap-1 active:scale-95 transition-transform animate-pulse"
                          >
                            <span>Zaakceptuj i Idź! 🚀</span>
                          </button>
                        </div>
                      ) : selectedMail.invitation.status === 'accepted' ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (selectedMail.invitation) {
                              onClose();
                              onAcceptMeeting?.(
                                selectedMail.invitation.targetRoomId,
                                selectedMail.invitation.inviterId,
                                selectedMail.invitation.inviterName,
                                selectedMail.invitation.activityName
                              );
                            }
                          }}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-[12px] shadow-sm flex items-center justify-center gap-1 active:scale-95 transition-transform"
                        >
                          <span>Przejdź do tego Pokoju teraz! 🚪✨</span>
                        </button>
                      ) : null}
                    </div>
                  )}

                  {/* Mail Gift claim box */}
                  {selectedMail.gift && (
                    <div className="bg-gradient-to-r from-amber-200 to-yellow-100 rounded-2xl p-3 border-2 border-amber-400 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[28px] animate-bounce">{selectedMail.gift.emoji}</span>
                        <div>
                          <span className="text-[11px] font-extrabold text-amber-950 uppercase tracking-wider block">
                            Załączony Podarunek:
                          </span>
                          <span className="font-black text-[14px] text-amber-900">
                            {selectedMail.gift.label}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={selectedMail.isGiftClaimed}
                        onClick={() => {
                          if (claimMailGift(selectedMail.id)) {
                            setSelectedMail({ ...selectedMail, isGiftClaimed: true });
                          }
                        }}
                        className={`px-3 py-2 rounded-xl font-black text-[12px] shadow-sm transition-transform ${
                          selectedMail.isGiftClaimed
                            ? 'bg-emerald-500 text-white cursor-default'
                            : 'bg-amber-400 hover:bg-amber-500 text-amber-950 active:scale-95'
                        }`}
                      >
                        {selectedMail.isGiftClaimed ? 'Odebrano ✓' : 'Odbierz Prezent! 🎁'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Mailbox List */
                filteredMails.length === 0 ? (
                  <div className="text-center py-8 text-on-surface-variant flex flex-col items-center gap-2">
                    <span className="text-[36px]">📭</span>
                    <p className="font-bold text-[13px]">Brak wiadomości w tej kategorii</p>
                  </div>
                ) : (
                  filteredMails.map((mail) => (
                    <div
                      key={mail.id}
                      onClick={() => {
                        sound.playPop(520);
                        markMailAsRead(mail.id);
                        setSelectedMail(mail);
                      }}
                      className={`rounded-3xl p-3 border flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${
                        mail.invitation && mail.invitation.status === 'pending'
                          ? 'bg-rose-50/90 border-pink-300 shadow-xs ring-1 ring-pink-300/40'
                          : !mail.isRead
                          ? 'bg-amber-50 border-amber-300 shadow-xs'
                          : 'bg-surface-container-low border-outline-variant/30'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-2xl bg-surface-container-lowest border-2 border-amber-300 flex items-center justify-center text-[24px] shrink-0">
                          {mail.fromFriendEmoji}
                          {!mail.isRead && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                          )}
                          {mail.invitation && (
                            <span className="absolute -bottom-1 -left-1 w-5 h-5 bg-pink-500 text-white rounded-full text-[10px] flex items-center justify-center border border-white shadow-xs">
                              💌
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-[14px] text-on-surface truncate">
                              {mail.subject}
                            </h4>
                            {mail.invitation && (
                              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                                mail.invitation.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-pink-100 text-pink-800 animate-pulse'
                              }`}>
                                {mail.invitation.status === 'accepted' ? 'Spotkanie ✓' : 'Zaproszenie!'}
                              </span>
                            )}
                          </div>
                          <p className="text-[12px] text-on-surface-variant font-medium truncate">
                            {mail.message}
                          </p>
                          <span className="text-[10px] text-on-surface-variant font-bold mt-0.5">
                            {mail.fromFriendName} • {mail.dateStr}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-1.5">
                        {mail.invitation && mail.invitation.status === 'pending' ? (
                          <span className="text-[18px] animate-bounce" title="Oczekuje na akceptację">
                            💌
                          </span>
                        ) : mail.gift && !mail.isGiftClaimed ? (
                          <span className="text-[18px] animate-bounce" title="Zawiera prezent!">
                            🎁
                          </span>
                        ) : null}
                        <span className="material-symbols-outlined text-outline-variant text-[20px]">
                          chevron_right
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          )}

          {/* ================= TAB 3: SEND DIGITAL ROOM INVITATION ================= */}
          {activeTab === 'invite' && (
            <form onSubmit={handleSendInvitationSubmit} className="flex flex-col gap-3">
              {inviteSuccess && (
                <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-950 p-3 rounded-2xl flex items-center gap-2 font-black text-[13px] animate-in fade-in">
                  <span>💌</span>
                  <span>Cyfrowe zaproszenie wysłane! Odbiorca wkrótce odpowie!</span>
                </div>
              )}

              {/* Step 1: Who sends invitation */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-black text-on-surface flex items-center justify-between">
                  <span>1. Kto wysyła zaproszenie:</span>
                  <span className="text-[10px] font-bold text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full">
                    {inviterChar.name} {inviterChar.emoji}
                  </span>
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: 'player', name: 'Twoja Postać', emoji: '⭐' },
                    { id: 'zosia', name: 'Zosia', emoji: '🐱' },
                    { id: 'leos', name: 'Leoś', emoji: '🦁' },
                    { id: 'maja', name: 'Maja', emoji: '🎨' },
                    { id: 'franek', name: 'Franek', emoji: '🚀' }
                  ].map(char => (
                    <button
                      key={char.id}
                      type="button"
                      onClick={() => {
                        sound.playPop(520);
                        setInviterChar(char);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 transition-all shrink-0 ${
                        inviterChar.id === char.id
                          ? 'bg-pink-500 text-white shadow-xs scale-105'
                          : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      <span>{char.emoji}</span>
                      <span>{char.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Choose Recipient Friend */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-black text-on-surface">
                  2. Do kogo wysyłasz zaproszenie:
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {friends.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        sound.playPop(560);
                        setInviteRecipientId(f.id);
                      }}
                      className={`p-2 rounded-2xl flex flex-col items-center gap-1 border-2 transition-transform active:scale-95 ${
                        inviteRecipientId === f.id
                          ? 'bg-pink-100 border-pink-400 ring-2 ring-pink-400/40 scale-105 shadow-xs'
                          : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
                      }`}
                    >
                      <span className="text-[24px]">{f.avatarEmoji}</span>
                      <span className="text-[10px] font-bold text-on-surface truncate w-full text-center">
                        {f.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Choose Meeting Room */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-black text-on-surface">
                  3. Wybierz Pokój Spotkania:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INVITATION_ROOMS.map(room => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => {
                        sound.playPop(620);
                        setSelectedRoomId(room.id);
                      }}
                      className={`p-2 rounded-2xl flex items-center gap-2 border-2 text-left transition-all ${
                        selectedRoomId === room.id
                          ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400/30'
                          : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
                      }`}
                    >
                      <span className="text-[22px]">{room.emoji}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-[11px] text-on-surface leading-tight truncate">
                          {room.name}
                        </span>
                        <span className="text-[9px] text-on-surface-variant font-semibold truncate">
                          {room.badge}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4: Choose Activity */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-black text-on-surface">
                  4. Co będziecie razem robić w pokoju:
                </label>
                <div className="flex flex-col gap-1.5">
                  {currentRoomDef.activities.map(act => (
                    <button
                      key={act}
                      type="button"
                      onClick={() => {
                        sound.playSparkle();
                        setSelectedActivity(act);
                      }}
                      className={`p-2 rounded-xl text-[12px] font-bold text-left border transition-all flex items-center justify-between ${
                        selectedActivity === act
                          ? 'bg-pink-100 border-pink-400 text-pink-950 font-black shadow-2xs'
                          : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:bg-surface-container'
                      }`}
                    >
                      <span>{act}</span>
                      {selectedActivity === act && (
                        <span className="text-pink-600 text-[14px]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 5: Custom invitation note */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-black text-on-surface">
                  5. Dołącz wesoły liścik:
                </label>
                <textarea
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  rows={2}
                  maxLength={140}
                  className="w-full rounded-2xl p-2.5 bg-surface-container-low border border-outline-variant/40 text-[12px] font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Napisz kilka ciepłych słów..."
                />
              </div>

              {/* Submit Invitation button */}
              <button
                type="submit"
                className="w-full py-3 rounded-2xl font-black text-[13px] sm:text-[14px] flex items-center justify-center gap-2 shadow-md bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white transition-all active:scale-98"
              >
                <span>Wyślij Zaproszenie do Pokoju! 💌</span>
                <span>(+20 monet podarunkowych 🪙)</span>
              </button>
            </form>
          )}

          {/* ================= TAB 4: SEND POSTCARD & GIFT ================= */}
          {activeTab === 'send' && (
            <form onSubmit={handleSendGiftSubmit} className="flex flex-col gap-3">
              {sendSuccess && (
                <div className="bg-emerald-100 border-2 border-emerald-400 text-emerald-950 p-3 rounded-2xl flex items-center gap-2 font-black text-[13px] animate-in fade-in">
                  <span>✨</span>
                  <span>List i prezent wysłane! Przyjaciel wkrótce odpisze!</span>
                </div>
              )}

              {/* Step 1: Select recipient */}
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-black text-on-surface">
                  1. Wybierz Znajomego:
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {friends.map(f => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        sound.playPop(520);
                        setTargetFriendId(f.id);
                      }}
                      className={`p-2 rounded-2xl flex flex-col items-center gap-1 border-2 transition-transform active:scale-95 ${
                        targetFriendId === f.id
                          ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-400/40 scale-105 shadow-xs'
                          : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
                      }`}
                    >
                      <span className="text-[24px]">{f.avatarEmoji}</span>
                      <span className="text-[11px] font-bold text-on-surface truncate w-full text-center">
                        {f.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Choose Gift */}
              <div className="flex flex-col gap-1 mt-1">
                <label className="text-[12px] font-black text-on-surface">
                  2. Dołącz Miły Prezent:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {giftOptions.map(g => (
                    <button
                      key={g.label}
                      type="button"
                      onClick={() => {
                        sound.playSparkle();
                        setSelectedGiftType(g);
                      }}
                      className={`p-2.5 rounded-2xl flex items-center gap-2 border-2 transition-transform active:scale-95 text-left ${
                        selectedGiftType.label === g.label
                          ? 'bg-pink-100 border-pink-400 ring-2 ring-pink-400/30'
                          : 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
                      }`}
                    >
                      <span className="text-[24px]">{g.emoji}</span>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-extrabold text-on-surface leading-tight">
                          {g.label}
                        </span>
                        <span className="text-[10px] text-amber-700 font-bold">
                          {g.cost} monet 🪙
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Friendly Note message */}
              <div className="flex flex-col gap-1 mt-1">
                <label className="text-[12px] font-black text-on-surface">
                  3. Napisz parę miłych słów:
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    'Jesteś moim najlepszym przyjacielem! 💖',
                    'Dziękuję za wspólną zabawę! 🎈',
                    'Chodźmy na huśtawki do parku! 🌳',
                    'Mam dla Ciebie pyszny smakołyk! 🍰'
                  ].map((phrase) => (
                    <button
                      key={phrase}
                      type="button"
                      onClick={() => setGreetingText(phrase)}
                      className="px-2.5 py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-[10px] font-bold text-on-surface whitespace-nowrap active:scale-95"
                    >
                      {phrase}
                    </button>
                  ))}
                </div>
                <textarea
                  value={greetingText}
                  onChange={(e) => setGreetingText(e.target.value)}
                  rows={2}
                  maxLength={140}
                  className="w-full rounded-2xl p-2.5 bg-surface-container-low border border-outline-variant/40 text-[13px] font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Napisz coś wesołego..."
                />
              </div>

              {/* Submit send button */}
              <button
                type="submit"
                disabled={!targetFriendId}
                className={`w-full py-3 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 shadow-md transition-all ${
                  targetFriendId
                    ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-white hover:opacity-95 active:scale-98'
                    : 'bg-surface-container-highest text-on-surface-variant opacity-60 cursor-not-allowed'
                }`}
              >
                <span>Wyślij Pocztówkę i Prezent! 💌</span>
                <span>({selectedGiftType.cost} 🪙)</span>
              </button>
            </form>
          )}

        </div>

        {/* Footer info ribbon */}
        <div className="p-3 bg-surface-container-high/60 border-t border-outline-variant/30 flex items-center justify-between text-[11px] font-extrabold text-on-surface-variant">
          <span>❤️ Zaakceptuj zaproszenie, aby przenieść się do pokoju!</span>
          <span className="flex items-center gap-1 text-amber-900">
            <span>Skarbiec:</span>
            <span>{getCoins()} 🪙</span>
          </span>
        </div>

      </div>
    </div>
  );
};
