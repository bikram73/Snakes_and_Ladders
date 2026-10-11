import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/audio';
import { gameApi } from '../utils/apiClient';
import { RoomState } from '../types/game';
import {
  Users,
  Copy,
  Check,
  Play,
  Crown,
  ArrowLeft,
  Share2,
  Sparkles,
  Loader2,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface RemoteRoomLobbyProps {
  roomCode: string;
  playerId: number;
  isHost: boolean;
  onStartMatch: () => void;
  onLeaveRoom: () => void;
  onRegenerateCode?: (newCode: string) => void;
}

export const RemoteRoomLobby: React.FC<RemoteRoomLobbyProps> = ({
  roomCode,
  playerId,
  isHost,
  onStartMatch,
  onLeaveRoom,
  onRegenerateCode,
}) => {
  const [currentCode, setCurrentCode] = useState<string>(roomCode);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const prevPlayerCountRef = useRef(1);

  // Poll room state in lobby
  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      try {
        const data = await gameApi.getRoomState(currentCode, playerId);
        if (data.success && data.room && isMounted) {
          setRoom(data.room);

          // Audio notification when a new player joins
          if (data.room.players.length > prevPlayerCountRef.current) {
            sound.playPowerup();
            const newest = data.room.players[data.room.players.length - 1];
            setNotification(`🎉 ${newest.name} joined the room!`);
            setTimeout(() => setNotification(null), 3500);
            prevPlayerCountRef.current = data.room.players.length;
          }

          if (data.room.status === 'playing') {
            onStartMatch();
          }
        }
      } catch (err) {
        console.error('Error polling room:', err);
      }
    };

    poll();
    const interval = setInterval(poll, 1100);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentCode, playerId, onStartMatch]);

  // Keep browser address bar in sync so copying the browser URL also works
  useEffect(() => {
    if (typeof window !== 'undefined' && window.history && window.history.replaceState && currentCode) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('room', currentCode);
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    }
  }, [currentCode]);

  // Build clean, robust shareable URL
  const getShareUrl = () => {
    if (typeof window === 'undefined') return `?room=${currentCode}`;
    const origin = window.location.origin;
    const pathname = window.location.pathname.replace(/\/+$/, '') || '';
    return `${origin}${pathname}/?room=${currentCode}`;
  };

  const shareUrl = getShareUrl();

  // Robust clipboard copy with fallback
  const copyTextToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      // fallback
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch (e) {
      return false;
    }
  };

  const handleCopyLink = async () => {
    sound.playClick();
    const ok = await copyTextToClipboard(shareUrl);
    if (ok) {
      setCopiedLink(true);
      setNotification('🔗 Invite Link copied to clipboard!');
      setTimeout(() => {
        setCopiedLink(false);
        setNotification(null);
      }, 2500);
    }
  };

  const handleCopyCode = async () => {
    sound.playClick();
    const ok = await copyTextToClipboard(currentCode);
    if (ok) {
      setCopiedCode(true);
      setNotification(`🔑 Room Code "${currentCode}" copied to clipboard!`);
      setTimeout(() => {
        setCopiedCode(false);
        setNotification(null);
      }, 2500);
    }
  };

  const handleNativeShare = async () => {
    sound.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Snake & Ladder match!',
          text: `Join my Snake & Ladder online game using Room Code: ${currentCode}`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback to copy link
      }
    }
    handleCopyLink();
  };

  const handleGenerateNewCode = async () => {
    if (!isHost || isRegenerating) return;
    sound.playPowerup();
    setIsRegenerating(true);
    setErrorMsg(null);

    try {
      const hostPlayer = room?.players.find((p) => p.id === playerId);
      const hostName = hostPlayer?.name || 'Host';
      const maxP = room?.max_players || 2;
      const exact100 = room?.rules.exact_finish ?? true;
      const extraTurnOnSix = room?.rules.extra_turn_on_six ?? true;

      const data = await gameApi.createRoom(hostName, maxP, exact100, extraTurnOnSix);
      setIsRegenerating(false);

      if (data.success && data.room_code) {
        setCurrentCode(data.room_code);
        if (data.room) {
          setRoom(data.room);
          prevPlayerCountRef.current = data.room.players.length;
        }
        if (onRegenerateCode) onRegenerateCode(data.room_code);
        if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
          try {
            const url = new URL(window.location.href);
            url.searchParams.set('room', data.room_code);
            window.history.replaceState({}, '', url.toString());
          } catch (e) {}
        }
        setNotification(`✨ New Room Code Generated: ${data.room_code}`);
        setTimeout(() => setNotification(null), 3000);
      } else {
        setErrorMsg(data.error || 'Failed to generate new code');
      }
    } catch (err) {
      setIsRegenerating(false);
      setErrorMsg('Failed to generate new room code');
    }
  };

  const handleLeave = async () => {
    sound.playClick();
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('room');
        url.searchParams.delete('join');
        url.searchParams.delete('code');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      } catch (e) {}
    }
    try {
      await gameApi.leaveRoom(currentCode, playerId);
    } catch (e) {}
    onLeaveRoom();
  };

  const handleHostStart = async () => {
    sound.playPowerup();
    try {
      const data = await gameApi.startRoom(currentCode, playerId);
      if (data.success) {
        onStartMatch();
      } else {
        setErrorMsg(data.error || 'Unable to start match');
      }
    } catch (err) {
      setErrorMsg('Failed to start match');
    }
  };

  const playerCount = room?.players.length || 1;
  const maxPlayers = room?.max_players || 2;
  const isReady = playerCount >= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-6 flex flex-col gap-4 sm:gap-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-2xl font-black shrink-0 shadow-inner">
              🌐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white uppercase">
                  Online Match Lobby
                </h2>
                {isHost && (
                  <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Host
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Share room code or invite link to start playing
              </p>
            </div>
          </div>

          <button
            onClick={handleLeave}
            className="text-xs font-bold text-slate-300 hover:text-rose-300 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-rose-950/60 border border-slate-700/80 hover:border-rose-700/60 cursor-pointer flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Leave
          </button>
        </div>

        {/* Room Code & Action Controls Box */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 sm:p-4.5 flex flex-col gap-3.5 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                5-Letter Room Code
              </span>
              <div className="flex items-center gap-2.5 mt-1">
                <span className="text-2xl sm:text-3xl font-black tracking-widest text-amber-400 font-mono select-all">
                  {currentCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className={`h-8 px-2.5 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
                    copiedCode
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400'
                  }`}
                  title="Copy 5-letter code"
                >
                  {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
            </div>

            {/* Action Buttons: New Code, Copy Link, Share */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              {isHost && (
                <button
                  onClick={handleGenerateNewCode}
                  disabled={isRegenerating}
                  className="h-10 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400 active:scale-98 shadow disabled:opacity-50 shrink-0"
                  title="Generate a fresh new Room Code"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  <span>{isRegenerating ? '...' : 'New Code'}</span>
                </button>
              )}

              <button
                onClick={handleCopyLink}
                className={`h-10 flex-1 sm:flex-initial px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                  copiedLink
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black active:scale-98'
                }`}
              >
                {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
              </button>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleNativeShare}
                  className="h-10 w-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 hover:border-amber-400 cursor-pointer flex items-center justify-center transition-colors shrink-0"
                  title="Share via WhatsApp or Apps"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Clickable Full Invite URL Banner */}
          <div
            onClick={handleCopyLink}
            className="group flex items-center justify-between gap-2.5 text-[11px] text-slate-400 font-mono bg-slate-900/90 hover:bg-slate-850 px-3.5 py-2.5 rounded-xl border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-colors"
            title="Click to copy invite link"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-amber-400 text-xs shrink-0">🔗</span>
              <span className="truncate select-all text-slate-300 group-hover:text-amber-300 transition-colors">
                {shareUrl}
              </span>
            </div>
            <span
              className={`text-[10px] font-sans font-black uppercase shrink-0 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                copiedLink
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-amber-400 border border-slate-700 group-hover:border-amber-500/40'
              }`}
            >
              {copiedLink ? '✓ Copied' : 'Copy'}
            </span>
          </div>

          {/* Quick Helper Tip */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>💡</span>
            <span>
              Friends can join by entering code <strong className="text-amber-400 font-mono">{currentCode}</strong> or clicking the link.
            </span>
          </div>
        </div>

        {/* Feedback / Notification banner */}
        {notification && (
          <div className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs font-black text-center animate-fade-in flex items-center justify-center gap-1.5 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Contenders Slot List */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-amber-400" /> Contenders in Lobby
            </span>
            <span className="font-mono text-amber-400 font-bold bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800 text-[11px]">
              {playerCount} / {maxPlayers} Ready
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {Array.from({ length: maxPlayers }).map((_, idx) => {
              const joined = room?.players[idx];
              const isSlotHost = idx === 0;
              const isCurrentPlayer = joined?.id === playerId;

              return (
                <div
                  key={idx}
                  className={`h-16 px-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    joined
                      ? isCurrentPlayer
                        ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-400/40 text-amber-200 shadow-md'
                        : 'bg-slate-800/80 border-slate-700 text-slate-200'
                      : 'bg-slate-950/50 border-dashed border-slate-800/90 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center text-xl shrink-0 shadow-sm">
                      {joined ? joined.avatar : '⏳'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-black truncate max-w-[130px] text-white">
                        {joined ? joined.name : `Slot ${idx + 1}`}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 truncate">
                        {joined
                          ? isSlotHost
                            ? '👑 Room Host'
                            : isCurrentPlayer
                            ? '👤 You'
                            : 'Contender'
                          : 'Waiting to join...'}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 pl-2">
                    {joined ? (
                      <span className="flex items-center gap-1.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        READY
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800">
                        <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-600" />
                        OPEN
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-950/90 border border-rose-800 text-rose-300 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        {isHost ? (
          <button
            onClick={handleHostStart}
            disabled={!isReady}
            className={`w-full h-13 sm:h-14 rounded-2xl font-black text-sm sm:text-base uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
              isReady
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/25 active:scale-98 border-b-4 border-amber-600'
                : 'bg-slate-800/80 text-slate-500 border border-slate-700/80 cursor-not-allowed opacity-60'
            }`}
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>{isReady ? 'START MATCH NOW' : `WAITING FOR PLAYERS (${playerCount}/${maxPlayers})...`}</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-center flex flex-col items-center justify-center gap-1.5">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-xs sm:text-sm font-black">
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Waiting for Host to start the match...</span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              The game will automatically launch for all players once the host starts!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
