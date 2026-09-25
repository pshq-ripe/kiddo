import express from 'express';
import path from 'path';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { getFriendsForUser, upsertFriendForUser, deleteFriendForUser } from './src/db/friends.ts';
import { getMailsForUser, upsertMailForUser } from './src/db/mails.ts';
import { getGameStateForUser, upsertGameStateForUser } from './src/db/gameState.ts';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// API Routes

// 1. Sync User Profile upon Google Sign-In
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const dbUser = await getOrCreateUser(
      user.uid,
      user.email || 'unknown@user.com',
      user.name || undefined,
      user.picture || undefined
    );
    res.json({ success: true, user: dbUser });
  } catch (error: any) {
    console.error('Failed to sync user:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// 2. Friends endpoints
app.get('/api/friends', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const friends = await getFriendsForUser(user.uid);
    res.json({ success: true, friends });
  } catch (error: any) {
    console.error('Failed to get friends:', error);
    res.status(500).json({ error: error.message || 'Failed to get friends' });
  }
});

app.post('/api/friends', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const friend = req.body;
    if (!friend || !friend.id || !friend.name) {
      return res.status(400).json({ error: 'Missing friend id or name' });
    }
    const saved = await upsertFriendForUser(user.uid, friend);
    res.json({ success: true, friend: saved });
  } catch (error: any) {
    console.error('Failed to save friend:', error);
    res.status(500).json({ error: error.message || 'Failed to save friend' });
  }
});

app.delete('/api/friends/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const friendId = String(req.params.id);
    await deleteFriendForUser(user.uid, friendId);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete friend:', error);
    res.status(500).json({ error: error.message || 'Failed to delete friend' });
  }
});

// 3. Mails & Invitations endpoints
app.get('/api/mails', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const mails = await getMailsForUser(user.uid);
    res.json({ success: true, mails });
  } catch (error: any) {
    console.error('Failed to get mails:', error);
    res.status(500).json({ error: error.message || 'Failed to get mails' });
  }
});

app.post('/api/mails', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const mail = req.body;
    if (!mail || !mail.id) {
      return res.status(400).json({ error: 'Missing mail id' });
    }
    const saved = await upsertMailForUser(user.uid, mail);
    res.json({ success: true, mail: saved });
  } catch (error: any) {
    console.error('Failed to save mail:', error);
    res.status(500).json({ error: error.message || 'Failed to save mail' });
  }
});

// 4. Game State Sync endpoints (coins, characters, pets, dollhouse layout)
app.get('/api/game-state', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const state = await getGameStateForUser(user.uid);
    res.json({ success: true, state });
  } catch (error: any) {
    console.error('Failed to get game state:', error);
    res.status(500).json({ error: error.message || 'Failed to get game state' });
  }
});

app.post('/api/game-state', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const state = req.body;
    const saved = await upsertGameStateForUser(user.uid, state);
    res.json({ success: true, state: saved });
  } catch (error: any) {
    console.error('Failed to update game state:', error);
    res.status(500).json({ error: error.message || 'Failed to update game state' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Kiddo World server running on http://0.0.0.0:${port}`);
  });
}

startServer();
