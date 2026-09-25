import { db } from './index.ts';
import { mails } from './schema.ts';
import { eq, and } from 'drizzle-orm';

export interface MailRecord {
  id: string;
  fromFriendId: string;
  fromFriendName: string;
  fromFriendEmoji: string;
  subject: string;
  message: string;
  giftType?: string;
  giftAmount?: number;
  giftEmoji?: string;
  giftLabel?: string;
  isRead?: boolean;
  isGiftClaimed?: boolean;
  invitationData?: string;
  dateStr?: string;
}

export async function getMailsForUser(userUid: string) {
  try {
    return await db.select().from(mails).where(eq(mails.userUid, userUid));
  } catch (error) {
    console.error('Error in getMailsForUser:', error);
    throw new Error('Failed to fetch mailbox from database', { cause: error });
  }
}

export async function upsertMailForUser(userUid: string, mail: MailRecord) {
  try {
    const result = await db.insert(mails)
      .values({
        id: mail.id,
        userUid,
        fromFriendId: mail.fromFriendId,
        fromFriendName: mail.fromFriendName,
        fromFriendEmoji: mail.fromFriendEmoji,
        subject: mail.subject,
        message: mail.message,
        giftType: mail.giftType || null,
        giftAmount: mail.giftAmount ?? null,
        giftEmoji: mail.giftEmoji || null,
        giftLabel: mail.giftLabel || null,
        isRead: mail.isRead ?? false,
        isGiftClaimed: mail.isGiftClaimed ?? false,
        invitationData: mail.invitationData || null,
        dateStr: mail.dateStr || 'Dzisiaj',
      })
      .onConflictDoUpdate({
        target: mails.id,
        set: {
          isRead: mail.isRead ?? false,
          isGiftClaimed: mail.isGiftClaimed ?? false,
          invitationData: mail.invitationData || null,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Error in upsertMailForUser:', error);
    throw new Error('Failed to save mail to database', { cause: error });
  }
}
