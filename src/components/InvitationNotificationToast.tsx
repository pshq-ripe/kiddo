import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { acceptInvitation } from '../utils/friendshipManager';

export interface InvitationToastDetail {
  mailId: string;
  inviterName: string;
  inviterEmoji: string;
  recipientName?: string;
  targetRoomId: string;
  roomName: string;
  roomEmoji: string;
  activityName: string;
}

interface Props {
  onAcceptMeeting?: (roomId: string, friendId: string, friendName: string, activityName: string) => void;
  onOpenMailbox?: (mailId?: string) => void;
}

export const InvitationNotificationToast: React.FC<Props> = ({
  onAcceptMeeting,
  onOpenMailbox
}) => {
  const [currentInvitation, setCurrentInvitation] = useState<InvitationToastDetail | null>(null);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<InvitationToastDetail>;
      if (customEvent.detail) {
        sound.playSparkle();
        setCurrentInvitation(customEvent.detail);
        setVisible(true);
      }
    };

    window.addEventListener('kiddo_invitation_toast', handleToast);
    return () => {
      window.removeEventListener('kiddo_invitation_toast', handleToast);
    };
  }, []);

  if (!currentInvitation || !visible) return null;

  const handleAccept = () => {
    sound.playFanfare();
    acceptInvitation(currentInvitation.mailId);
    setVisible(false);
    onAcceptMeeting?.(
      currentInvitation.targetRoomId,
      currentInvitation.mailId,
      currentInvitation.inviterName,
      currentInvitation.activityName
    );
  };

  const handleInspect = () => {
    sound.playPop();
    setVisible(false);
    onOpenMailbox?.(currentInvitation.mailId);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-14 left-1/2 -translate-x-1/2 z-55 w-[94%] max-w-[390px] animate-in fade-in slide-in-from-top-6 duration-300 select-none drop-shadow-xl"
    >
      <div className="bg-surface-container-lowest/98 backdrop-blur-md rounded-3xl p-3 sm:p-3.5 border-4 border-pink-400 flex flex-col gap-2 relative overflow-hidden shadow-2xl ring-4 ring-pink-200/50">
        
        {/* Background decorative glow */}
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-pink-300/30 rounded-full blur-xl pointer-events-none" />

        {/* Header Ribbon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-[12px] font-black animate-pulse">
              💌
            </span>
            <span className="text-[12px] font-black uppercase tracking-wider text-pink-700">
              Nowe Zaproszenie na Spotkanie!
            </span>
          </div>

          <button
            type="button"
            onClick={() => setVisible(false)}
            className="w-6 h-6 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center text-[12px] font-bold active:scale-90"
            aria-label="Zamknij powiadomienie"
          >
            ✕
          </button>
        </div>

        {/* Content Details */}
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-pink-100 to-rose-100 border-2 border-pink-400 flex items-center justify-center text-[26px] shadow-sm">
              {currentInvitation.inviterEmoji}
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 border border-white text-[12px] flex items-center justify-center shadow-xs">
              {currentInvitation.roomEmoji}
            </span>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <h4 className="font-black text-[14px] sm:text-[15px] text-on-surface leading-tight truncate">
              {currentInvitation.inviterName} zaprasza Cię!
            </h4>
            <div className="flex items-center gap-1 text-[12px] text-pink-800 font-bold mt-0.5 truncate">
              <span>Pokój:</span>
              <span className="text-on-surface truncate">{currentInvitation.roomName}</span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-semibold truncate italic mt-0.5">
              "{currentInvitation.activityName}"
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleInspect}
            className="py-2 px-3 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-extrabold text-[12px] flex items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            <span>Otwórz List</span>
            <span className="material-symbols-outlined text-[15px]">mail</span>
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="py-2 px-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-[12px] shadow-xs flex items-center justify-center gap-1 active:scale-95 transition-transform animate-pulse"
          >
            <span>Zaakceptuj i Idź!</span>
            <span>🚀</span>
          </button>
        </div>

      </div>
    </div>
  );
};
