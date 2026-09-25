import React, { useState, useEffect } from 'react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { performFullCloudSync, pushGameStateToCloud } from '../utils/cloudSync.ts';
import { sound } from '../utils/sound.ts';

interface UserAuthSyncButtonProps {
  compact?: boolean;
}

export const UserAuthSyncButton: React.FC<UserAuthSyncButtonProps> = ({ compact = false }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSyncing(true);
        try {
          await performFullCloudSync(user);
        } finally {
          setIsSyncing(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    sound.playSparkle();
    setIsSyncing(true);
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      if (res.user) {
        sound.playFanfare();
        await performFullCloudSync(res.user);
      }
    } catch (err: any) {
      console.error('Sign-in error:', err);
      // If popup was closed by user, don't play error
      if (err.code !== 'auth/popup-closed-by-user') {
        sound.playPop(300);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = async () => {
    if (!currentUser) return;
    sound.playSparkle();
    setIsSyncing(true);
    try {
      await pushGameStateToCloud();
      await performFullCloudSync(currentUser);
      sound.playSuccess();
    } finally {
      setIsSyncing(false);
      setShowMenu(false);
    }
  };

  const handleSignOut = async () => {
    sound.playPop(420);
    try {
      await signOut(auth);
      setShowMenu(false);
    } catch (err) {
      console.error('Sign-out error:', err);
    }
  };

  if (!currentUser) {
    return (
      <button
        type="button"
        id="cloud-auth-sync-button"
        onClick={handleSignIn}
        disabled={isSyncing}
        title="Zaloguj się z Google, aby zsynchronizować przyjaciół i postępy na każdym urządzeniu"
        className={`rounded-full flex items-center gap-1 font-extrabold border shadow-xs transition-all active:scale-95 cursor-pointer ${
          compact
            ? 'px-2 h-9 bg-surface-container-low text-primary border-outline-variant/40 hover:bg-surface-container'
            : 'px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent hover:opacity-95 text-[12px]'
        }`}
      >
        <span className="text-[14px]">{isSyncing ? '⏳' : '☁️'}</span>
        <span className="text-[11px] font-black">
          {isSyncing ? 'Łączenie...' : 'Konto Google'}
        </span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        id="cloud-auth-user-button"
        onClick={() => {
          sound.playPop(520);
          setShowMenu(!showMenu);
        }}
        title={`Zalogowano jako ${currentUser.displayName || currentUser.email} (Chmura aktywna)`}
        className="h-9 px-2 rounded-full bg-surface-container-low hover:bg-surface-container border border-outline-variant/40 flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
      >
        {currentUser.photoURL ? (
          <img
            src={currentUser.photoURL}
            alt="Avatar"
            className="w-5 h-5 rounded-full object-cover border border-white"
          />
        ) : (
          <span className="text-[14px]">☁️</span>
        )}
        <span className="text-[11px] font-black text-on-surface max-w-[70px] truncate hidden sm:inline">
          {currentUser.displayName?.split(' ')[0] || 'Chmura'}
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </button>

      {/* Account Menu Dropdown */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-11 z-50 w-60 bg-surface rounded-2xl shadow-xl border border-outline-variant/30 p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-2.5 border-b border-outline-variant/20 pb-2">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black">
                  ☁️
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-[13px] text-on-surface truncate">
                  {currentUser.displayName || 'Użytkownik'}
                </span>
                <span className="text-[11px] text-on-surface-variant truncate">
                  {currentUser.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-xl font-bold">
              <span>✓ Synchronizacja chmury aktywna</span>
            </div>

            <div className="flex flex-col gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="w-full py-1.5 px-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-[12px] font-extrabold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <span>{isSyncing ? '⏳' : '🔄'}</span>
                <span>{isSyncing ? 'Pobieranie...' : 'Synchronizuj teraz'}</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-1.5 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12px] font-extrabold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <span>🚪</span>
                <span>Wyloguj z urządzenia</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
