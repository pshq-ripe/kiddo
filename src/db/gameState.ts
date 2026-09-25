import { db } from './index.ts';
import { userGameState } from './schema.ts';
import { eq } from 'drizzle-orm';

export interface GameStateRecord {
  coins?: number;
  charactersData?: string;
  petsData?: string;
  furnitureLayout?: string;
}

export async function getGameStateForUser(userUid: string) {
  try {
    const records = await db.select().from(userGameState).where(eq(userGameState.userUid, userUid));
    return records[0] || null;
  } catch (error) {
    console.error('Error in getGameStateForUser:', error);
    throw new Error('Failed to fetch game state from database', { cause: error });
  }
}

export async function upsertGameStateForUser(userUid: string, state: GameStateRecord) {
  try {
    const existing = await getGameStateForUser(userUid);
    if (!existing) {
      const inserted = await db.insert(userGameState)
        .values({
          userUid,
          coins: state.coins ?? 100,
          charactersData: state.charactersData || null,
          petsData: state.petsData || null,
          furnitureLayout: state.furnitureLayout || null,
        })
        .returning();
      return inserted[0];
    } else {
      const updated = await db.update(userGameState)
        .set({
          coins: state.coins !== undefined ? state.coins : existing.coins,
          charactersData: state.charactersData !== undefined ? state.charactersData : existing.charactersData,
          petsData: state.petsData !== undefined ? state.petsData : existing.petsData,
          furnitureLayout: state.furnitureLayout !== undefined ? state.furnitureLayout : existing.furnitureLayout,
          updatedAt: new Date(),
        })
        .where(eq(userGameState.userUid, userUid))
        .returning();
      return updated[0];
    }
  } catch (error) {
    console.error('Error in upsertGameStateForUser:', error);
    throw new Error('Failed to update game state in database', { cause: error });
  }
}
