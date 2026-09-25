import { db } from './index.ts';
import { friends } from './schema.ts';
import { eq, and } from 'drizzle-orm';

export interface FriendRecord {
  id: string;
  name: string;
  avatarEmoji: string;
  favoriteActivity?: string;
  friendshipLevel: number;
  friendshipPoints: number;
  favoriteGift?: string;
  bio?: string;
  lastInteractionText?: string;
}

export async function getFriendsForUser(userUid: string) {
  try {
    return await db.select().from(friends).where(eq(friends.userUid, userUid));
  } catch (error) {
    console.error('Error in getFriendsForUser:', error);
    throw new Error('Failed to fetch friends from database', { cause: error });
  }
}

export async function upsertFriendForUser(userUid: string, friend: FriendRecord) {
  try {
    const result = await db.insert(friends)
      .values({
        id: friend.id,
        userUid,
        name: friend.name,
        avatarEmoji: friend.avatarEmoji || '🐱',
        favoriteActivity: friend.favoriteActivity || 'Wspólna wesoła zabawa 🎈',
        friendshipLevel: friend.friendshipLevel || 1,
        friendshipPoints: friend.friendshipPoints || 10,
        favoriteGift: friend.favoriteGift || 'Ciasteczko 🍪',
        bio: friend.bio || 'Wesoły przyjaciel ze świata Kiddo.',
        lastInteractionText: friend.lastInteractionText || 'Właśnie dołączył do listy przyjaciół! ✨',
      })
      .onConflictDoUpdate({
        target: friends.id,
        set: {
          name: friend.name,
          avatarEmoji: friend.avatarEmoji || '🐱',
          favoriteActivity: friend.favoriteActivity || 'Wspólna wesoła zabawa 🎈',
          friendshipLevel: friend.friendshipLevel || 1,
          friendshipPoints: friend.friendshipPoints || 10,
          favoriteGift: friend.favoriteGift || 'Ciasteczko 🍪',
          bio: friend.bio || 'Wesoły przyjaciel ze świata Kiddo.',
          lastInteractionText: friend.lastInteractionText || null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error in upsertFriendForUser:', error);
    throw new Error('Failed to save friend to database', { cause: error });
  }
}

export async function deleteFriendForUser(userUid: string, friendId: string) {
  try {
    await db.delete(friends).where(
      and(
        eq(friends.userUid, userUid),
        eq(friends.id, friendId)
      )
    );
    return { success: true };
  } catch (error) {
    console.error('Error in deleteFriendForUser:', error);
    throw new Error('Failed to remove friend from database', { cause: error });
  }
}
