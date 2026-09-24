// Kiddo Virtual Coins Management for Furniture & Room Personalization

const STORAGE_KEY = 'kiddo_virtual_coins';
const DEFAULT_COINS = 120; // Friendly starting balance for kids to customize furniture right away

export const getCoins = (): number => {
  try {
    const val = localStorage.getItem(STORAGE_KEY);
    if (val !== null) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_COINS;
};

export const addCoins = (amount: number, reason?: string): number => {
  const current = getCoins();
  const next = Math.max(0, current + amount);
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // ignore
  }

  // Notify components across applet
  window.dispatchEvent(
    new CustomEvent('kiddo_coins_updated', {
      detail: { coins: next, diff: amount, reason }
    })
  );

  return next;
};

export const spendCoins = (amount: number, reason?: string): boolean => {
  const current = getCoins();
  if (current < amount) {
    return false;
  }
  const next = current - amount;
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    // ignore
  }

  window.dispatchEvent(
    new CustomEvent('kiddo_coins_updated', {
      detail: { coins: next, diff: -amount, reason }
    })
  );

  return true;
};

export const canAfford = (amount: number): boolean => {
  return getCoins() >= amount;
};
