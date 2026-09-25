import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

// Users table linked to Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Friends table: user's friends list
export const friends = pgTable('friends', {
  id: text('id').primaryKey(), // custom friend ID string
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  avatarEmoji: text('avatar_emoji').notNull().default('🐱'),
  favoriteActivity: text('favorite_activity').default('Wspólna wesoła zabawa 🎈'),
  friendshipLevel: integer('friendship_level').notNull().default(1),
  friendshipPoints: integer('friendship_points').notNull().default(10),
  favoriteGift: text('favorite_gift').default('Ciasteczko 🍪'),
  bio: text('bio').default('Wesoły przyjaciel ze świata Kiddo.'),
  lastInteractionText: text('last_interaction_text').default('Właśnie dołączył do listy przyjaciół! ✨'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Mails / Invitations table
export const mails = pgTable('mails', {
  id: text('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull(),
  fromFriendId: text('from_friend_id').notNull(),
  fromFriendName: text('from_friend_name').notNull(),
  fromFriendEmoji: text('from_friend_emoji').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  giftType: text('gift_type'),
  giftAmount: integer('gift_amount'),
  giftEmoji: text('gift_emoji'),
  giftLabel: text('gift_label'),
  isRead: boolean('is_read').notNull().default(false),
  isGiftClaimed: boolean('is_gift_claimed').notNull().default(false),
  invitationData: text('invitation_data'), // JSON string of RoomInvitation
  dateStr: text('date_str').notNull().default('Dzisiaj'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Game state sync (coins, characters roster, pets, room furniture layout)
export const userGameState = pgTable('user_game_state', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid')
    .references(() => users.uid, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  coins: integer('coins').notNull().default(100),
  charactersData: text('characters_data'), // JSON array of CharacterItem
  petsData: text('pets_data'), // JSON array of AdoptedPet
  furnitureLayout: text('furniture_layout'), // JSON array of FurnitureItem
  updatedAt: timestamp('updated_at').defaultNow(),
});
