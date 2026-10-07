import React, { useState } from 'react';
import { BotPersonality, Player } from '../types/game';
import { Users, Bot, User, Plus, Trash2, Play, Sparkles, Check } from 'lucide-react';
import { sound } from '../utils/audio';

const AVATARS = ['🦁', '🐉', '🚀', '👑', '🧙', '🤖', '🦄', '🦊', '⚡', '💎', '🦅', '🐯', '🔥', '🪐', '🐼', '🏎️'];

const COLOR_THEMES = [
  { name: 'Amber Gold', bg: 'bg-gradient-to-br from-amber-400 to-yellow-600', ring: 'ring-amber-400', hex: '#f59e0b' },
  { name: 'Emerald Jade', bg: 'bg-gradient-to-br from-emerald-400 to-teal-600', ring: 'ring-emerald-400', hex: '#10b981' },
  { name: 'Crimson Ruby', bg: 'bg-gradient-to-br from-rose-500 to-red-700', ring: 'ring-rose-400', hex: '#f43f5e' },
  { name: 'Cyber Cyan', bg: 'bg-gradient-to-br from-cyan-400 to-blue-600', ring: 'ring-cyan-400', hex: '#06b6d4' },
  { name: 'Royal Purple', bg: 'bg-gradient-to-br from-purple-400 to-indigo-700', ring: 'ring-purple-400', hex: '#a855f7' },
  { name: 'Neon Pink', bg: 'bg-gradient-to-br from-pink-400 to-rose-600', ring: 'ring-pink-400', hex: '#ec4899' },
];

const BOT_PERSONALITIES: { type: BotPersonality; label: string; desc: string; icon: string }[] = [
  { type: 'balanced', label: 'Balanced', desc: 'Standard steady play', icon: '⚖️' },
  { type: 'speedy', label: 'Speedy', desc: 'Fast rolls & quick turns', icon: '⚡' },
  { type: 'cautious', label: 'Cautious', desc: 'Careful & methodical', icon: '🛡️' },
  { type: 'dramatic', label: 'Dramatic', desc: 'Loves high-stakes chaos', icon: '🎭' },
];

interface PlayerSetupModalProps {
  initialPlayers: Player[];
  onStartGame: (players: Player[]) => void;
  onClose?: () => void;
}

export const PlayerSetupModal: React.FC<PlayerSetupModalProps> = ({
  initialPlayers,
  onStartGame,
  onClose,
}) => {
  const [players, setPlayers] = useState<Player[]>(
    initialPlayers.length > 0
      ? initialPlayers
      : [
          {
            id: 'p1',
            name: 'Player 1',
            isAi: false,
            avatar: '🦁',
            color: COLOR_THEMES[0].hex,
            bgGradient: COLOR_THEMES[0].bg,
            ringColor: COLOR_THEMES[0].ring,
            position: 1,
            consecutiveSixes: 0,
            isFrozen: false,
            turnsPlayed: 0,
            stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
          },
          {
            id: 'p2',
            name: 'Bot Nova',
            isAi: true,
            botPersonality: 'balanced',
            avatar: '🤖',
            color: COLOR_THEMES[1].hex,
            bgGradient: COLOR_THEMES[1].bg,
            ringColor: COLOR_THEMES[1].ring,
            position: 1,
            consecutiveSixes: 0,
            isFrozen: false,
            turnsPlayed: 0,
            stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
          },
        ]
  );

  const [activeTabPlayerIndex, setActiveTabPlayerIndex] = useState<number>(0);

  const addPlayer = () => {
    if (players.length >= 4) return;
    sound.playClick();
    const newIdx = players.length;
    const colorTheme = COLOR_THEMES[newIdx % COLOR_THEMES.length];
    const avatar = AVATARS[newIdx % AVATARS.length];
    const isBot = newIdx > 0;

    const newPlayer: Player = {
      id: `p_${Date.now()}_${newIdx}`,
      name: isBot ? `Bot ${['Echo', 'Blaze', 'Zephyr', 'Orion'][newIdx % 4]}` : `Player ${newIdx + 1}`,
      isAi: isBot,
      botPersonality: isBot ? 'balanced' : undefined,
      avatar,
      color: colorTheme.hex,
      bgGradient: colorTheme.bg,
      ringColor: colorTheme.ring,
      position: 1,
      consecutiveSixes: 0,
      isFrozen: false,
      turnsPlayed: 0,
      stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
    };

    setPlayers([...players, newPlayer]);
    setActiveTabPlayerIndex(newIdx);
  };

  const removePlayer = (index: number) => {
    if (players.length <= 2) return;
    sound.playClick();
    const updated = players.filter((_, i) => i !== index);
    setPlayers(updated);
    if (activeTabPlayerIndex >= updated.length) {
      setActiveTabPlayerIndex(updated.length - 1);
    }
  };

  const updatePlayer = (index: number, updates: Partial<Player>) => {
    const updated = [...players];
    updated[index] = { ...updated[index], ...updates };
    setPlayers(updated);
  };

  const setQuickMatch = (mode: 'solo1' | 'solo3' | 'pass2' | 'party4') => {
    sound.playClick();
    if (mode === 'solo1') {
      setPlayers([
        {
          id: 'p1',
          name: 'Player',
          isAi: false,
          avatar: '🦁',
          color: COLOR_THEMES[0].hex,
          bgGradient: COLOR_THEMES[0].bg,
          ringColor: COLOR_THEMES[0].ring,
          position: 1,
          consecutiveSixes: 0,
          isFrozen: false,
          turnsPlayed: 0,
          stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
        },
        {
          id: 'p2',
          name: 'Bot Nova',
          isAi: true,
          botPersonality: 'balanced',
          avatar: '🤖',
          color: COLOR_THEMES[1].hex,
          bgGradient: COLOR_THEMES[1].bg,
          ringColor: COLOR_THEMES[1].ring,
          position: 1,
          consecutiveSixes: 0,
          isFrozen: false,
          turnsPlayed: 0,
          stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
        },
      ]);
    } else if (mode === 'solo3') {
      setPlayers([
        {
          id: 'p1',
          name: 'Player',
          isAi: false,
          avatar: '🦁',
          color: COLOR_THEMES[0].hex,
          bgGradient: COLOR_THEMES[0].bg,
          ringColor: COLOR_THEMES[0].ring,
          position: 1,
          consecutiveSixes: 0,
          isFrozen: false,
          turnsPlayed: 0,
          stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
        },
        {
          id: 'p2',
          name: 'Bot Blaze',
          isAi: true,
          botPersonality: 'speedy',
          avatar: '🔥',
          color: COLOR_THEMES[2].hex,
          bgGradient: COLOR_THEMES[2].bg,
          ringColor: COLOR_THEMES[2].ring,
          position: 1,
          consecutiveSixes: 0,
          isFrozen: false,
          turnsPlayed: 0,
          stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
        },
        {
          id: 'p3',
          name: 'Bot Echo',
          isAi: true,
          botPersonality: 'cautious',
          avatar: '🧙',
          color: COLOR_THEMES[4].hex,
          bgGradient: COLOR_THEMES[4].bg,
          ringColor: COLOR_THEMES[4].ring,
          position: 1,
          consecutiveSixes: 0,
          isFrozen: false,
          turnsPlayed: 0,
          stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
        },
        {
          id: 'p4',
          name: 'Bot Orion',
          isAi: true,
          botPersonality: 'dramatic',
          avatar: '🚀',
          color: COLOR_THEMES[3].hex,
          bgGradient: COLOR_THEMES[3].bg,
          ringColor: COLOR_THEMES[3].ring,
          position: 1,
          consecutiveSixes: 0,
          isFrozen: false,
          turnsPlayed: 0,
          stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
        },
      ]);
    } else if (mode === 'pass2') {
      setPlayers([
        {
          id: 'p1',
          name: 'Player 1',
          isAi: false,
          avatar: '🦁',
          color: COLOR_THEMES[0].hex,
          bgGradient: COLOR_THEMES[0].bg,
          ringColor: COLOR_THEMES[0].ring,
          position: 1,
          consecutiveSixes: 0,
          isFrozen: false,
          turnsPlayed: 0,
          stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
        },
        {
          id: 'p2',
          name: 'Player 2',
          isAi: false,
          avatar: '🦊',
          color: COLOR_THEMES[1].hex,
          bgGradient: COLOR_THEMES[1].bg,
          ringColor: COLOR_THEMES[1].ring,
          position: 1,
          consecutiveSixes: 0,
          isFrozen: false,
          turnsPlayed: 0,
          stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
        },
      ]);
    } else if (mode === 'party4') {
      setPlayers([
        {
          id: 'p1',
          name: 'Player 1',
          isAi: false,
          avatar: '👑',
          color: COLOR_THEMES[0].hex,
          bgGradient: COLOR_THEMES[0].bg,
          ringColor: COLOR_THEMES[0].ring,
          position: 1,
          consecutiveSixes: 0,
          isFrozen: false,
          turnsPlayed: 0,
          stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
        },
        {
          id: 'p2',
          name: 'Player 2',
          isAi: false,
          avatar: '🦄',
          color: COLOR_THEMES[5].hex,
          bgGradient: COLOR_THEMES[5].bg,
          ringColor: COLOR_THEMES[5].ring,
          position: 1,
          consecutiveSixes: 0,
          isFrozen: false,
          turnsPlayed: 0,
          stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
        },
        {
          id: 'p3',
          name: 'Player 3',
          isAi: false,
          avatar: '🐉',
          color: COLOR_THEMES[1].hex,
          bgGradient: COLOR_THEMES[1].bg,
          ringColor: COLOR_THEMES[1].ring,
          position: 1,
          consecutiveSixes: 0,
          isFrozen: false,
          turnsPlayed: 0,
          stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
        },
        {
          id: 'p4',
          name: 'Player 4',
          isAi: false,
          avatar: '🚀',
          color: COLOR_THEMES[3].hex,
          bgGradient: COLOR_THEMES[3].bg,
          ringColor: COLOR_THEMES[3].ring,
          position: 1,
          consecutiveSixes: 0,
          isFrozen: false,
          turnsPlayed: 0,
          stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
        },
      ]);
    }
  };

  const handleStart = () => {
    sound.playPowerup();
    onStartGame(players);
  };

  const curr = players[activeTabPlayerIndex] || players[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col gap-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Roster & Player Setup</h2>
              <p className="text-xs text-slate-400">Assemble 2 to 4 human and AI bot contenders</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs px-2.5 py-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer"
            >
              Close
            </button>
          )}
        </div>

        {/* Quick Presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Quick Match Presets</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setQuickMatch('solo1')}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer text-left"
            >
              👤 vs 🤖 1 Bot
            </button>
            <button
              onClick={() => setQuickMatch('solo3')}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer text-left"
            >
              👤 vs 🤖 3 Bots
            </button>
            <button
              onClick={() => setQuickMatch('pass2')}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer text-left"
            >
              👥 2 Players Local
            </button>
            <button
              onClick={() => setQuickMatch('party4')}
              className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-slate-200 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer text-left"
            >
              🎉 4 Player Pass
            </button>
          </div>
        </div>

        {/* Player Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {players.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => {
                setActiveTabPlayerIndex(idx);
                sound.playClick();
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
                activeTabPlayerIndex === idx
                  ? 'bg-slate-800 border-amber-500 text-white shadow-md'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-base">{p.avatar}</span>
              <span>{p.name || `P${idx + 1}`}</span>
              {p.isAi && <span className="text-[10px] bg-slate-700 px-1 py-0.2 rounded text-amber-300">BOT</span>}
            </button>
          ))}

          {players.length < 4 && (
            <button
              onClick={addPlayer}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 border border-dashed border-slate-600 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> Add ({players.length}/4)
            </button>
          )}
        </div>

        {/* Active Player Editor Card */}
        {curr && (
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-400">
                  Editing: {curr.name}
                </span>
              </div>
              {players.length > 2 && (
                <button
                  onClick={() => removePlayer(activeTabPlayerIndex)}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/50 hover:bg-rose-900/50 px-2.5 py-1 rounded-lg border border-rose-800/50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>

            {/* Name and Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Contender Name</label>
                <input
                  type="text"
                  value={curr.name}
                  onChange={(e) => updatePlayer(activeTabPlayerIndex, { name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 font-bold"
                  maxLength={16}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Control Type</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      updatePlayer(activeTabPlayerIndex, { isAi: false });
                      sound.playClick();
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      !curr.isAi
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> Human
                  </button>
                  <button
                    onClick={() => {
                      updatePlayer(activeTabPlayerIndex, {
                        isAi: true,
                        botPersonality: curr.botPersonality || 'balanced',
                      });
                      sound.playClick();
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      curr.isAi
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" /> AI Bot
                  </button>
                </div>
              </div>
            </div>

            {/* Bot Personality if AI */}
            {curr.isAi && (
              <div className="flex flex-col gap-1.5 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-xs font-bold text-slate-300">Bot Personality</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {BOT_PERSONALITIES.map((b) => (
                    <button
                      key={b.type}
                      onClick={() => {
                        updatePlayer(activeTabPlayerIndex, { botPersonality: b.type });
                        sound.playClick();
                      }}
                      className={`p-2 rounded-lg border text-left flex flex-col transition-colors cursor-pointer ${
                        curr.botPersonality === b.type
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-sm font-bold flex items-center gap-1">
                        <span>{b.icon}</span> {b.label}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{b.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Avatar Token Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-400">Token Symbol / Mascot</span>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    onClick={() => {
                      updatePlayer(activeTabPlayerIndex, { avatar: av });
                      sound.playClick();
                    }}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-transform cursor-pointer ${
                      curr.avatar === av
                        ? 'bg-amber-500/30 border-amber-400 scale-110 shadow-lg'
                        : 'bg-slate-800 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-slate-400">Token Aura & Color</span>
              <div className="flex flex-wrap gap-2.5">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => {
                      updatePlayer(activeTabPlayerIndex, {
                        color: theme.hex,
                        bgGradient: theme.bg,
                        ringColor: theme.ring,
                      });
                      sound.playClick();
                    }}
                    className={`w-8 h-8 rounded-full ${theme.bg} flex items-center justify-center border-2 transition-transform cursor-pointer ${
                      curr.color === theme.hex ? 'border-white scale-115 ring-2 ring-amber-400' : 'border-slate-800'
                    }`}
                    title={theme.name}
                  >
                    {curr.color === theme.hex && <Check className="w-4 h-4 text-white drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Start Game CTA */}
        <button
          onClick={handleStart}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 text-base transition-transform active:scale-98 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-slate-950" /> Start Grand Match
        </button>
      </div>
    </div>
  );
};
