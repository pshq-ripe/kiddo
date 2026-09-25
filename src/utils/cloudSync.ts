import { auth, googleAuthProvider } from '../lib/firebase.ts';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFriendsList, saveFriendsList, FriendProfile } from './friendshipManager.ts';
import { getMailbox, saveMailbox, FriendMail } from './friendshipManager.ts';
import { getCoins, setCoins } from './currencyManager.ts';

// Get current user auth token
export async function getAuthToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch (err) {
    console.error('Failed to get user auth token:', err);
    return null;
  }
}

// Sync user record to PostgreSQL database
export async function syncUserWithBackend(user: User): Promise<void> {
  try {
    const token = await user.getIdToken();
    await fetch('/api/auth/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        displayName: user.displayName,
        photoURL: user.photoURL,
        email: user.email,
      }),
    });
  } catch (err) {
    console.error('Failed to sync user with backend:', err);
  }
}

// Fetch friends from Cloud SQL
export async function syncFriendsFromCloud(): Promise<FriendProfile[] | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/friends', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && Array.isArray(data.friends)) {
      const mappedFriends: FriendProfile[] = data.friends.map((f: any) => ({
        id: f.id,
        name: f.name,
        avatarEmoji: f.avatarEmoji || '🐱',
        favoriteActivity: f.favoriteActivity || 'Wspólna wesoła zabawa 🎈',
        friendshipLevel: f.friendshipLevel || 1,
        friendshipPoints: f.friendshipPoints || 10,
        favoriteGift: f.favoriteGift || 'Ciasteczko 🍪',
        bio: f.bio || 'Wesoły przyjaciel ze świata Kiddo.',
        lastInteractionText: f.lastInteractionText || undefined,
      }));

      saveFriendsList(mappedFriends);
      return mappedFriends;
    }
  } catch (err) {
    console.error('Failed to fetch friends from cloud:', err);
  }
  return null;
}

// Push a single friend to Cloud SQL
export async function pushFriendToCloud(friend: FriendProfile): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;

  try {
    await fetch('/api/friends', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(friend),
    });
  } catch (err) {
    console.error('Failed to push friend to cloud:', err);
  }
}

// Delete a friend from Cloud SQL
export async function deleteFriendFromCloud(friendId: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;

  try {
    await fetch(`/api/friends/${encodeURIComponent(friendId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    console.error('Failed to delete friend from cloud:', err);
  }
}

// Fetch mailbox and invitations from Cloud SQL
export async function syncMailsFromCloud(): Promise<FriendMail[] | null> {
  const token = await getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/mails', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success && Array.isArray(data.mails)) {
      const mappedMails: FriendMail[] = data.mails.map((m: any) => ({
        id: m.id,
        fromFriendId: m.fromFriendId,
        fromFriendName: m.fromFriendName,
        fromFriendEmoji: m.fromFriendEmoji,
        subject: m.subject,
        message: m.message,
        gift: m.giftType
          ? {
              type: m.giftType,
              amount: m.giftAmount,
              emoji: m.giftEmoji || '🎁',
              label: m.giftLabel || 'Prezent',
            }
          : undefined,
        invitation: m.invitationData ? JSON.parse(m.invitationData) : undefined,
        dateStr: m.dateStr || 'Dzisiaj',
        isRead: m.isRead ?? false,
        isGiftClaimed: m.isGiftClaimed ?? false,
      }));

      saveMailbox(mappedMails);
      return mappedMails;
    }
  } catch (err) {
    console.error('Failed to fetch mails from cloud:', err);
  }
  return null;
}

// Push a single mail / invitation to Cloud SQL
export async function pushMailToCloud(mail: FriendMail): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;

  try {
    await fetch('/api/mails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: mail.id,
        fromFriendId: mail.fromFriendId,
        fromFriendName: mail.fromFriendName,
        fromFriendEmoji: mail.fromFriendEmoji,
        subject: mail.subject,
        message: mail.message,
        giftType: mail.gift?.type,
        giftAmount: mail.gift?.amount,
        giftEmoji: mail.gift?.emoji,
        giftLabel: mail.gift?.label,
        isRead: mail.isRead,
        isGiftClaimed: mail.isGiftClaimed,
        invitationData: mail.invitation ? JSON.stringify(mail.invitation) : undefined,
        dateStr: mail.dateStr,
      }),
    });
  } catch (err) {
    console.error('Failed to push mail to cloud:', err);
  }
}

// Sync overall game state (coins, characters, adopted pets, dollhouse layout)
export async function syncGameStateFromCloud(): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;

  try {
    const res = await fetch('/api/game-state', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.state) {
      const state = data.state;
      if (typeof state.coins === 'number') {
        setCoins(state.coins);
      }
      if (state.charactersData) {
        try {
          localStorage.setItem('kiddo_characters_roster', state.charactersData);
          window.dispatchEvent(new CustomEvent('kiddo_characters_updated'));
        } catch {
          // ignore
        }
      }
      if (state.petsData) {
        try {
          localStorage.setItem('kiddo_adopted_pets', state.petsData);
        } catch {
          // ignore
        }
      }
      if (state.furnitureLayout) {
        try {
          localStorage.setItem('kiddo_dollhouse_furniture', state.furnitureLayout);
        } catch {
          // ignore
        }
      }
    }
  } catch (err) {
    console.error('Failed to sync game state from cloud:', err);
  }
}

// Push local game state to Cloud SQL
export async function pushGameStateToCloud(): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;

  try {
    const coins = getCoins();
    const charactersData = localStorage.getItem('kiddo_characters_roster') || undefined;
    const petsData = localStorage.getItem('kiddo_adopted_pets') || undefined;
    const furnitureLayout = localStorage.getItem('kiddo_dollhouse_furniture') || undefined;

    await fetch('/api/game-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        coins,
        charactersData,
        petsData,
        furnitureLayout,
      }),
    });
  } catch (err) {
    console.error('Failed to push game state to cloud:', err);
  }
}

// Full sync after login
export async function performFullCloudSync(user: User): Promise<void> {
  await syncUserWithBackend(user);
  await Promise.all([
    syncFriendsFromCloud(),
    syncMailsFromCloud(),
    syncGameStateFromCloud(),
  ]);
}
