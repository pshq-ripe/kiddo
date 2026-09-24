// Kiddo Friendship & Mailbox Manager

import { sound } from './sound';
import { addCoins } from './currencyManager';
import { addJournalEntry } from './journalManager';
import { unlockAchievement } from './achievementManager';

export interface FriendProfile {
  id: string;
  name: string;
  avatarEmoji: string;
  favoriteActivity: string;
  friendshipLevel: number; // 1 to 5
  friendshipPoints: number; // 0 to 100
  favoriteGift: string;
  lastInteractionText?: string;
  bio: string;
}

export interface RoomInvitation {
  id: string;
  targetRoomId: string; // 'apartment' | 'playground' | 'bakery' | 'artSchool' | 'beach'
  roomName: string; // e.g. 'Mieszkanie Przyjaciół'
  roomEmoji: string; // e.g. '🏠'
  activityName: string; // e.g. 'Wspólna herbatka i seans bajek w salonie 🧸'
  inviterId: string;
  inviterName: string;
  inviterEmoji: string;
  recipientId: string;
  recipientName: string;
  recipientEmoji: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: string;
}

export interface FriendMail {
  id: string;
  fromFriendId: string;
  fromFriendName: string;
  fromFriendEmoji: string;
  toFriendId?: string;
  toFriendName?: string;
  toFriendEmoji?: string;
  subject: string;
  message: string;
  gift?: {
    type: 'coins' | 'sticker' | 'snack';
    amount?: number;
    emoji: string;
    label: string;
  };
  invitation?: RoomInvitation;
  dateStr: string;
  isRead: boolean;
  isGiftClaimed: boolean;
}

export interface InvitationRoomDef {
  id: string;
  name: string;
  emoji: string;
  badge: string;
  activities: string[];
}

export const INVITATION_ROOMS: InvitationRoomDef[] = [
  {
    id: 'apartment',
    name: 'Mieszkanie Przyjaciół',
    emoji: '🏠',
    badge: 'Domek & Salon',
    activities: [
      'Wspólna herbatka i seans bajek w salonie 🧸',
      'Pieczenie pysznych gofrów w kuchni 🧇',
      'Zabawa w chowanego i budowanie bazy z poduszek 🏰'
    ]
  },
  {
    id: 'playground',
    name: 'Słoneczny Park i Plac Zabaw',
    emoji: '🎡',
    badge: 'Karuzela & Dinozaur',
    activities: [
      'Wyprawa na dinozaurzą zjeżdżalnię i huśtawki 🦖',
      'Zawody w kręceniu na karuzeli 🎠',
      'Piknik na zielonym trawniku i puszczanie baniek 🫧'
    ]
  },
  {
    id: 'bakery',
    name: 'Cukiernia i Bar Owocowy',
    emoji: '🍰',
    badge: 'Torty & Babeczki',
    activities: [
      'Wspólne dekorowanie truskawkowego tortu 🎂',
      'Miksowanie tęczowych koktajli owocowych 🍓',
      'Degustacja ciepłych babeczek z czekoladą 🧁'
    ]
  },
  {
    id: 'artSchool',
    name: 'Szkoła Talentów i Plastyka',
    emoji: '🎨',
    badge: 'Farby & Muzyka',
    activities: [
      'Malowanie wspólnego tęczowego obrazu farbami 🖌️',
      'Występ w teatrzyku kukiełkowym i maskarada 🎭',
      'Wesoły koncert na pianinie i cymbałkach 🎹'
    ]
  },
  {
    id: 'beach',
    name: 'Błękitna Plaża i Latarnia',
    emoji: '🏖️',
    badge: 'Morze & Zamki z Piasku',
    activities: [
      'Budowanie wielkiego zamku z piasku z muszelkami 🏰',
      'Wypatrywanie skaczących delfinów z latarni 🐬',
      'Rejs kolorową motorówką po falach ⛵'
    ]
  }
];

const FRIENDSHIP_STORAGE_KEY = 'kiddo_friends_data_v1';
const MAILBOX_STORAGE_KEY = 'kiddo_mailbox_data_v1';

export const INITIAL_FRIENDS: FriendProfile[] = [
  {
    id: 'zosia',
    name: 'Zosia',
    avatarEmoji: '🐱',
    favoriteActivity: 'Zabawa z kotkami i malowanie tęczy',
    friendshipLevel: 3,
    friendshipPoints: 60,
    favoriteGift: 'Ciasteczko rybka 🐟',
    bio: 'Wesoła dziewczynka w opasce z uszkami kotka. Zawsze chętna na przytulaski!',
    lastInteractionText: 'Czeka na Ciebie w domku! 💕'
  },
  {
    id: 'leos',
    name: 'Leoś',
    avatarEmoji: '🦁',
    favoriteActivity: 'Układanie klocków i zjeżdżalnia dinozaura',
    friendshipLevel: 2,
    friendshipPoints: 40,
    favoriteGift: 'Dinozaur z klocków 🦖',
    bio: 'Mały odkrywca w żółtej bluzie. Uwielbia przybijać piątki i biegać po parku.',
    lastInteractionText: 'Zbudował dla Ciebie zamek z piasku! 🏰'
  },
  {
    id: 'maja',
    name: 'Maja',
    avatarEmoji: '🎨',
    favoriteActivity: 'Miksowanie babeczek i malowanie pejzaży',
    friendshipLevel: 2,
    friendshipPoints: 35,
    favoriteGift: 'Pędzel do akwareli 🖌️',
    bio: 'Artystka z fioletowym berecikiem. Tworzy najpiękniejsze rysunki w szkole sztuki.',
    lastInteractionText: 'Namalowała dla Ciebie serduszko! 💖'
  },
  {
    id: 'franek',
    name: 'Franek',
    avatarEmoji: '🚀',
    favoriteActivity: 'Badanie gwiazd i podglądanie delfinów',
    friendshipLevel: 1,
    friendshipPoints: 20,
    favoriteGift: 'Błyszcząca gwiazdka ⭐',
    bio: 'Marzyciel w kosmicznym kombinezonie. Uwielbia dzielić się ciekawostkami o kosmosie.',
    lastInteractionText: 'Pomachał Ci przez lunetę! 🔭'
  },
  {
    id: 'pola',
    name: 'Pola Weterynarz',
    avatarEmoji: '🩺',
    favoriteActivity: 'Opieka nad puszystymi pieskami i kotkami',
    friendshipLevel: 2,
    friendshipPoints: 50,
    favoriteGift: 'Chrupiące smaczki 🦴',
    bio: 'Troskliwa opiekunka zwierząt. Zawsze ma w kieszeni witaminki i plasterki z serduszkiem.',
    lastInteractionText: 'Pieski przesyłają Ci radosne hau-hau! 🐶'
  }
];

export const INITIAL_MAILS: FriendMail[] = [
  {
    id: 'mail-invite-zosia',
    fromFriendId: 'zosia',
    fromFriendName: 'Zosia',
    fromFriendEmoji: '🐱',
    subject: '💌 Zaproszenie na herbatkę do Mieszkania!',
    message: 'Cześć! Upiekłam pyszne ciasteczka w kuchni i przygotowałam poduszki w salonie. Wpadnij do mnie na wspólną herbatkę i wesołe zabawy!',
    invitation: {
      id: 'inv-zosia-apt',
      targetRoomId: 'apartment',
      roomName: 'Mieszkanie Przyjaciół',
      roomEmoji: '🏠',
      activityName: 'Wspólna herbatka i seans bajek w salonie 🧸',
      inviterId: 'zosia',
      inviterName: 'Zosia',
      inviterEmoji: '🐱',
      recipientId: 'player',
      recipientName: 'Ty',
      recipientEmoji: '⭐',
      status: 'pending',
      sentAt: 'Dzisiaj'
    },
    gift: {
      type: 'coins',
      amount: 25,
      emoji: '🪙',
      label: '25 monet na poczęstunek'
    },
    dateStr: 'Dzisiaj',
    isRead: false,
    isGiftClaimed: false
  },
  {
    id: 'mail-welcome',
    fromFriendId: 'zosia',
    fromFriendName: 'Zosia',
    fromFriendEmoji: '🐱',
    subject: 'Witaj w Miasteczku Przyjaciół! 💌',
    message: 'Cześć! Tak bardzo się cieszę, że jesteśmy znajomymi! Przyjdź do mojego domku, zrobimy sobie herbatkę z ciasteczkami!',
    gift: {
      type: 'coins',
      amount: 40,
      emoji: '🪙',
      label: '40 monet powitalnych'
    },
    dateStr: 'Wczoraj',
    isRead: false,
    isGiftClaimed: false
  },
  {
    id: 'mail-leos-dino',
    fromFriendId: 'leos',
    fromFriendName: 'Leoś',
    fromFriendEmoji: '🦁',
    subject: 'Przybij piątkę na placu zabaw! ✋',
    message: 'Hejka! Dzisiaj na placu zabaw wypróbowałem karuzelę, kręci się super szybko! Mam dla Ciebie naklejkę rakiety!',
    gift: {
      type: 'sticker',
      emoji: '🚀',
      label: 'Naklejka Rakiety Kosmicznej'
    },
    dateStr: 'Wczoraj',
    isRead: false,
    isGiftClaimed: false
  }
];

export const getFriendsList = (): FriendProfile[] => {
  try {
    const raw = localStorage.getItem(FRIENDSHIP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_FRIENDS;
};

export const saveFriendsList = (friends: FriendProfile[]): void => {
  try {
    localStorage.setItem(FRIENDSHIP_STORAGE_KEY, JSON.stringify(friends));
    window.dispatchEvent(new CustomEvent('kiddo_friends_updated'));
  } catch {
    // ignore
  }
};

export const getMailbox = (): FriendMail[] => {
  try {
    const raw = localStorage.getItem(MAILBOX_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return INITIAL_MAILS;
};

export const saveMailbox = (mails: FriendMail[]): void => {
  try {
    localStorage.setItem(MAILBOX_STORAGE_KEY, JSON.stringify(mails));
    window.dispatchEvent(new CustomEvent('kiddo_mailbox_updated'));
  } catch {
    // ignore
  }
};

export const getUnreadMailsCount = (): number => {
  const mails = getMailbox();
  return mails.filter(m => !m.isRead || (!m.isGiftClaimed && m.gift)).length;
};

// Boost friendship points when doing interactions (hug, high-five, dance, snack)
export const boostFriendship = (friendId: string, pointsDelta = 15, interactionName = 'Zabawa'): { levelUp: boolean; newLevel: number } => {
  const friends = getFriendsList();
  let levelUp = false;
  let newLevel = 1;

  const updated = friends.map(f => {
    if (f.id === friendId) {
      let pts = f.friendshipPoints + pointsDelta;
      let lvl = f.friendshipLevel;

      while (pts >= 100 && lvl < 5) {
        pts -= 100;
        lvl += 1;
        levelUp = true;
      }

      newLevel = lvl;

      return {
        ...f,
        friendshipPoints: Math.min(100, pts),
        friendshipLevel: lvl,
        lastInteractionText: `${interactionName} z Tobą! ✨`
      };
    }
    return f;
  });

  saveFriendsList(updated);

  if (levelUp) {
    sound.playFanfare();
    unlockAchievement('best_friends_forever');
  }

  return { levelUp, newLevel };
};

// Send a postcard / gift to a friend and receive an automated cheerful response in the mailbox
export const sendGiftToFriend = (
  friendId: string,
  giftType: 'snack' | 'sticker' | 'postcard' | 'coins',
  giftEmoji: string,
  giftLabel: string,
  customNote?: string
): boolean => {
  const friends = getFriendsList();
  const friend = friends.find(f => f.id === friendId);
  if (!friend) return false;

  // Add points
  boostFriendship(friendId, 25, `Wysłano prezent: ${giftLabel}`);

  // Create immediate entry in journal
  addJournalEntry({
    title: `Prezent dla przyjaciela: ${friend.name}! 🎁`,
    note: `Wysłano ${giftLabel} ${giftEmoji} z miłą wiadomością do ${friend.name}. Prawdziwa przyjaźń to skarb!`,
    category: 'friendship',
    emoji: giftEmoji,
    locationName: 'Poczta Przyjaźni Kiddo'
  });

  // Schedule an instant response letter from the friend!
  const responseQuotes: Record<string, string[]> = {
    zosia: [
      'Ojej, dziękuję za ten cudowny podarunek! Przytulam Cię mocno łapkami i przesyłam mruczące całuski! 🐾💕',
      'Ale niespodzianka! Bardzo poprawiło mi to humorek. Zrobiłam dla Ciebie pamiątkowy rysunek motylka! 🦋'
    ],
    leos: [
      'Hura! Jesteś super przyjacielem! Podzielę się z Tobą moim skarbem z placu zabaw! 🦖⭐',
      'To wspaniałe! Przybijam wielką piątkę! Czekam na Ciebie na huśtawkach! 🎈'
    ],
    maja: [
      'Cudowny prezent, aż zainspirował mnie do upieczenia nowej tęczowej tarty! Przesyłam słodkie monety na smakołyki! 🍰',
      'Dziękuję z całego serduszka! Przygotowałam dla Ciebie specjalny pastelowy stempelek! 🌸'
    ],
    franek: [
      'Gwiezdne dzięki! Taki podarunek zasługuje na wystrzałową rakietę radości! Odbierz mały kosmiczny bonus! 🚀✨',
      'Fantastycznie! Od razu weselej patrzy się w niebo z takim przyjacielem! 🪐'
    ],
    pola: [
      'Pieski merdają ogonkami ze szczęścia, a ja dziękuję Ci za pamięć! Przesyłam paczkę serdeczności! 🐶💖',
      'Zwierzątka i ja bardzo dziękujemy! Twoja przyjaźń to najpiękniejsze lekarstwo na smutki! 🐱'
    ]
  };

  const quotes = responseQuotes[friendId] || [
    'Dziękuję za Twój piękny prezent! Cieszę się, że jesteśmy najlepszymi znajomymi! 💖'
  ];
  const replyMessage = quotes[Math.floor(Math.random() * quotes.length)];

  const replyMail: FriendMail = {
    id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fromFriendId: friend.id,
    fromFriendName: friend.name,
    fromFriendEmoji: friend.avatarEmoji,
    subject: `Odpowiedź od ${friend.name}: Dziękuję! 💌`,
    message: replyMessage,
    gift: {
      type: 'coins',
      amount: 30,
      emoji: '🪙',
      label: '30 monet w podziękowaniu'
    },
    dateStr: 'Właśnie teraz',
    isRead: false,
    isGiftClaimed: false
  };

  const currentMails = getMailbox();
  saveMailbox([replyMail, ...currentMails]);

  return true;
};

// Claim gift from friend's letter
export const claimMailGift = (mailId: string): boolean => {
  const mails = getMailbox();
  let claimed = false;

  const updated = mails.map(m => {
    if (m.id === mailId && !m.isGiftClaimed && m.gift) {
      claimed = true;
      if (m.gift.type === 'coins' && m.gift.amount) {
        addCoins(m.gift.amount, `Prezent w liście od ${m.fromFriendName}`);
      }
      return {
        ...m,
        isRead: true,
        isGiftClaimed: true
      };
    }
    return m;
  });

  if (claimed) {
    sound.playCoin();
    setTimeout(() => sound.playSparkle(), 150);
    saveMailbox(updated);
  }

  return claimed;
};

// Mark mail as read
export const markMailAsRead = (mailId: string): void => {
  const mails = getMailbox();
  const updated = mails.map(m => (m.id === mailId ? { ...m, isRead: true } : m));
  saveMailbox(updated);
};

// Send a digital room invitation letter to a friend
export const sendRoomInvitation = (
  inviter: { id: string; name: string; emoji: string },
  recipient: { id: string; name: string; emoji: string },
  targetRoomId: string,
  activityName: string,
  customMessage?: string
): { success: boolean; mailId: string } => {
  const roomDef = INVITATION_ROOMS.find(r => r.id === targetRoomId) || INVITATION_ROOMS[0];
  const mailId = `mail-invite-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const invitationId = `inv-${Date.now()}`;

  const messageText = customMessage?.trim() ||
    `Hej ${recipient.name}! Zapraszam Cię do: ${roomDef.name} na naszą wspólną przygodę: "${activityName}". Będzie mnóstwo śmiechu i zabawy! Przyjdziesz?`;

  const newInvitation: RoomInvitation = {
    id: invitationId,
    targetRoomId: roomDef.id,
    roomName: roomDef.name,
    roomEmoji: roomDef.emoji,
    activityName,
    inviterId: inviter.id,
    inviterName: inviter.name,
    inviterEmoji: inviter.emoji,
    recipientId: recipient.id,
    recipientName: recipient.name,
    recipientEmoji: recipient.emoji,
    status: 'pending',
    sentAt: 'Właśnie teraz'
  };

  const mail: FriendMail = {
    id: mailId,
    fromFriendId: inviter.id,
    fromFriendName: inviter.name,
    fromFriendEmoji: inviter.emoji,
    toFriendId: recipient.id,
    toFriendName: recipient.name,
    toFriendEmoji: recipient.emoji,
    subject: `💌 Zaproszenie na spotkanie: ${roomDef.name}!`,
    message: messageText,
    gift: {
      type: 'coins',
      amount: 20,
      emoji: '🪙',
      label: '20 monet na wspólną wyprawę'
    },
    invitation: newInvitation,
    dateStr: 'Właśnie teraz',
    isRead: false,
    isGiftClaimed: false
  };

  const currentMails = getMailbox();
  saveMailbox([mail, ...currentMails]);

  // Boost relationship points
  boostFriendship(recipient.id, 20, `Zaproszenie do ${roomDef.name}`);

  // Dispatch toast notification for recipient
  window.dispatchEvent(
    new CustomEvent('kiddo_invitation_toast', {
      detail: {
        mailId,
        inviterName: inviter.name,
        inviterEmoji: inviter.emoji,
        recipientName: recipient.name,
        targetRoomId: roomDef.id,
        roomName: roomDef.name,
        roomEmoji: roomDef.emoji,
        activityName
      }
    })
  );

  // If the recipient is an NPC friend, simulate their excited reply!
  const isRecipientFriend = INITIAL_FRIENDS.some(f => f.id === recipient.id);
  if (isRecipientFriend) {
    setTimeout(() => {
      const replyQuotes = [
        `Hura! Z radością przyjmuję zaproszenie do ${roomDef.name}! Już nie mogę się doczekać "${activityName}"! Do zobaczenia na miejscu! 🎉💕`,
        `Wspaniale! Bardzo chętnie się z Tobą spotkam w ${roomDef.name}! Zrobię dla nas coś pysznego! 🧁✨`,
        `Super pomysł! Przybijam wielką piątkę i już biegnę do ${roomDef.name}! 🚀`
      ];
      const replyMsg = replyQuotes[Math.floor(Math.random() * replyQuotes.length)];

      const acceptanceMail: FriendMail = {
        id: `reply-inv-${Date.now()}`,
        fromFriendId: recipient.id,
        fromFriendName: recipient.name,
        fromFriendEmoji: recipient.emoji,
        subject: `🎉 ${recipient.name} przyjął zaproszenie do: ${roomDef.name}!`,
        message: replyMsg,
        invitation: {
          ...newInvitation,
          status: 'accepted'
        },
        gift: {
          type: 'coins',
          amount: 30,
          emoji: '🪙',
          label: '30 monet na powitanie w pokoju'
        },
        dateStr: 'Przed chwilą',
        isRead: false,
        isGiftClaimed: false
      };

      const updated = getMailbox();
      saveMailbox([acceptanceMail, ...updated]);

      window.dispatchEvent(
        new CustomEvent('kiddo_invitation_toast', {
          detail: {
            mailId: acceptanceMail.id,
            inviterName: recipient.name,
            inviterEmoji: recipient.emoji,
            recipientName: inviter.name,
            targetRoomId: roomDef.id,
            roomName: roomDef.name,
            roomEmoji: roomDef.emoji,
            activityName: `Potwierdzone spotkanie: ${activityName}! 🎈`
          }
        })
      );
    }, 2200);
  }

  return { success: true, mailId };
};

// Accept meeting invitation
export const acceptInvitation = (mailId: string): { success: boolean; invitation?: RoomInvitation } => {
  const mails = getMailbox();
  let acceptedInv: RoomInvitation | undefined;

  const updated = mails.map(m => {
    if (m.id === mailId && m.invitation) {
      acceptedInv = { ...m.invitation, status: 'accepted' };
      return {
        ...m,
        isRead: true,
        invitation: acceptedInv
      };
    }
    return m;
  });

  if (acceptedInv) {
    saveMailbox(updated);

    // Boost friendship and give rewards
    boostFriendship(acceptedInv.inviterId, 30, `Spotkanie w: ${acceptedInv.roomName}`);
    addCoins(25, `Spotkanie z przyjacielem w ${acceptedInv.roomName}`);

    // Claim gift if available
    claimMailGift(mailId);

    // Add journal memory
    addJournalEntry({
      title: `Wesołe Spotkanie w: ${acceptedInv.roomName}! 💌`,
      note: `${acceptedInv.inviterName} i ${acceptedInv.recipientName} spotkali się na: ${acceptedInv.activityName}. Przyjaźń to najlepsza przygoda!`,
      category: 'friendship',
      emoji: acceptedInv.roomEmoji,
      locationName: acceptedInv.roomName
    });

    sound.playFanfare();
    unlockAchievement('best_friends_forever');

    // Trigger meeting transition event
    window.dispatchEvent(
      new CustomEvent('kiddo_trigger_meeting', {
        detail: {
          roomId: acceptedInv.targetRoomId,
          friendId: acceptedInv.inviterId,
          friendName: acceptedInv.inviterName,
          friendEmoji: acceptedInv.inviterEmoji,
          activityName: acceptedInv.activityName
        }
      })
    );
  }

  return { success: !!acceptedInv, invitation: acceptedInv };
};

// Decline meeting invitation
export const declineInvitation = (mailId: string): void => {
  const mails = getMailbox();
  const updated = mails.map(m => {
    if (m.id === mailId && m.invitation) {
      return {
        ...m,
        isRead: true,
        invitation: { ...m.invitation, status: 'declined' as const }
      };
    }
    return m;
  });
  saveMailbox(updated);
};

// Simulate a surprise incoming digital invitation from an NPC friend
export const simulateIncomingFriendInvitation = (specifiedFriendId?: string): FriendMail => {
  const friends = getFriendsList();
  const friend = specifiedFriendId
    ? friends.find(f => f.id === specifiedFriendId) || friends[0]
    : friends[Math.floor(Math.random() * friends.length)];

  const randomRoom = INVITATION_ROOMS[Math.floor(Math.random() * INVITATION_ROOMS.length)];
  const randomActivity = randomRoom.activities[Math.floor(Math.random() * randomRoom.activities.length)];

  const mailId = `mail-invite-surprise-${Date.now()}`;
  const invitationId = `inv-surprise-${Date.now()}`;

  const invitation: RoomInvitation = {
    id: invitationId,
    targetRoomId: randomRoom.id,
    roomName: randomRoom.name,
    roomEmoji: randomRoom.emoji,
    activityName: randomActivity,
    inviterId: friend.id,
    inviterName: friend.name,
    inviterEmoji: friend.avatarEmoji,
    recipientId: 'player',
    recipientName: 'Ty',
    recipientEmoji: '⭐',
    status: 'pending',
    sentAt: 'Właśnie teraz'
  };

  const mail: FriendMail = {
    id: mailId,
    fromFriendId: friend.id,
    fromFriendName: friend.name,
    fromFriendEmoji: friend.avatarEmoji,
    subject: `💌 Zaproszenie na spotkanie od: ${friend.name}!`,
    message: `Cześć! Wpadł mi do główki fantastyczny pomysł! Chodźmy razem do: ${randomRoom.name} na ${randomActivity}! Będziemy się świetnie bawić! Czekam na Ciebie! 💖`,
    gift: {
      type: 'coins',
      amount: 25,
      emoji: '🪙',
      label: '25 monet na wspólną zabawę'
    },
    invitation,
    dateStr: 'Przed chwilą',
    isRead: false,
    isGiftClaimed: false
  };

  const currentMails = getMailbox();
  saveMailbox([mail, ...currentMails]);

  window.dispatchEvent(
    new CustomEvent('kiddo_invitation_toast', {
      detail: {
        mailId,
        inviterName: friend.name,
        inviterEmoji: friend.avatarEmoji,
        recipientName: 'Ty',
        targetRoomId: randomRoom.id,
        roomName: randomRoom.name,
        roomEmoji: randomRoom.emoji,
        activityName: randomActivity
      }
    })
  );

  return mail;
};
