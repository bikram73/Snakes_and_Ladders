import React, { useState, useEffect } from 'react';
import { sound } from '../utils/audio';
import { Users, Copy, Check, Play, Crown, ArrowLeft, Share2, Sparkles, Loader2 } from 'lucide-react';

interface RemoteRoomLobbyProps {
  roomCode: string;
  playerId: number;
  isHost: boolean;
  onStartMatch: () => void;
  onLeaveRoom: () => void;
}

export interface RoomState {
  code: string;
  host_id: number;
  status: 'lobby' | 'playing' | 'ended';
  max_players: number;
  players: Array<{
    id: number;
    name: string;
    position: number;
    is_computer: boolean;
    color: string;
    avatar: string;
  }>;
  current_player: number;
  game_over: boolean;
}

export const RemoteRoomLobby: React.FC<RemoteRoomLobbyProps> = ({
  roomCode,
  playerId,
  isHost,
  onStartMatch,
  onLeaveRoom,
}) => {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Poll room state in lobby
  useEffect(() => {
    let isMounted = true;

    const poll = async () => {
      try {
        const res = await fetch(`/api/room/state?room_code=${roomCode}&player_id=${playerId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && isMounted) {
          setRoom(data.room);
          if (data.room.status === 'playing') {
            onStartMatch();
          }
        }
      } catch (err) {
        console.error('Error polling room:', err);
      }
    };

    poll();
    const interval = setInterval(poll, 1200);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [roomCode, playerId, onStartMatch]);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/?room=${roomCode}` : `?room=${roomCode}`;

  const handleCopyLink = () => {
    sound.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleHostStart = async () => {
    sound.playPowerup();
    try {
      const res = await fetch('/api/room/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_code: roomCode, player_id: playerId }),
      });
      const data = await res.json();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 flex flex-col gap-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-xl font-black">
              🌐
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                Online Match Lobby
              </h2>
              <p className="text-xs text-slate-400">Share code or link with friends to join</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onLeaveRoom();
            }}
            className="text-xs font-bold text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Leave
          </button>
        </div>

        {/* Room Code & Invite Link Box */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Room Code
              </span>
              <span className="text-2xl sm:text-3xl font-black tracking-widest text-amber-400 font-mono">
                {roomCode}
              </span>
            </div>

            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                copied
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 truncate">
            {shareUrl}
          </p>
        </div>

        {/* Contenders Slot List */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span>Joined Contenders</span>
            <span className="font-mono text-amber-400">
              {playerCount} / {maxPlayers} Players
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
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    joined
                      ? isCurrentPlayer
                        ? 'bg-amber-500/15 border-amber-500/60 ring-1 ring-amber-400/40 text-amber-200'
                        : 'bg-slate-800/80 border-slate-700 text-slate-200'
                      : 'bg-slate-950/40 border-dashed border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{joined ? joined.avatar : '⏳'}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-black truncate max-w-[120px]">
                        {joined ? joined.name : `Waiting for Player ${idx + 1}...`}
                      </span>
                      {joined && (
                        <span className="text-[10px] text-slate-400">
                          {isSlotHost ? '👑 Room Host' : isCurrentPlayer ? '👤 You' : 'Contender'}
                        </span>
                      )}
                    </div>
                  </div>

                  {joined ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold text-center">
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        {isHost ? (
          <button
            onClick={handleHostStart}
            disabled={!isReady}
            className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl cursor-pointer ${
              isReady
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/25 active:scale-98 border-b-4 border-amber-600'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            }`}
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>{isReady ? 'START MATCH NOW' : 'WAITING FOR PLAYERS TO JOIN...'}</span>
          </button>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Waiting for Host to start the match...</span>
            </div>
            <span className="text-[11px] text-slate-400">
              The game will automatically launch for all players once the host starts!
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
