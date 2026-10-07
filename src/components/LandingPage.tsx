import React, { useState } from 'react';
import { GameRules, Player } from '../types/game';
import { sound } from '../utils/audio';
import {
  Bot,
  Users,
  Play,
  Volume2,
  VolumeX,
  BookOpen,
  Sparkles,
  Shield,
  Zap,
  RotateCcw,
  Check,
  Crown,
  Dice5,
} from 'lucide-react';

interface LandingPageProps {
  onStartGame: (
    mode: 'pvc' | 'multiplayer',
    players: Array<{ name: string; is_computer: boolean; avatar: string; color: string }>,
    rules: GameRules
  ) => void;
  initialRules: GameRules;
  onUpdateRules: (rules: GameRules) => void;
}

const AVATARS = ['🦁', '🤖', '👑', '🐉', '🦊', '⚡', '🚀', '🧙', '🐯', '🐼', '🦄', '💎'];

const COLOR_THEMES = [
  { name: 'Red', color: 'red', avatar: '🔴', hex: '#ef4444' },
  { name: 'Blue', color: 'blue', avatar: '🔵', hex: '#3b82f6' },
  { name: 'Green', color: 'green', avatar: '🟢', hex: '#10b981' },
  { name: 'Yellow', color: 'yellow', avatar: '🟡', hex: '#f59e0b' },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartGame,
  initialRules,
  onUpdateRules,
}) => {
  // Main Category Mode: 'pvc' | 'multiplayer'
  const [selectedMainMode, setSelectedMainMode] = useState<'pvc' | 'multiplayer'>('pvc');

  // PvC Sub-option: 1 bot (2p total), 2 bots (3p total), 3 bots (4p total)
  const [pvcBotCount, setPvcBotCount] = useState<1 | 2 | 3>(1);

  // Multiplayer Sub-option: 2 players, 3 players, 4 players
  const [multiplayerPlayerCount, setMultiplayerPlayerCount] = useState<2 | 3 | 4>(2);

  // Player configurations for PvC
  const [humanPlayerName, setHumanPlayerName] = useState('Player 1');
  const [humanPlayerAvatar, setHumanPlayerAvatar] = useState('🦁');

  const [bot2Name, setBot2Name] = useState('Bot Nova');
  const [bot2Avatar, setBot2Avatar] = useState('🤖');

  const [bot3Name, setBot3Name] = useState('Bot Blaze');
  const [bot3Avatar, setBot3Avatar] = useState('🔥');

  const [bot4Name, setBot4Name] = useState('Bot Echo');
  const [bot4Avatar, setBot4Avatar] = useState('⚡');

  // Player configurations for Multiplayer
  const [mpPlayers, setMpPlayers] = useState([
    { name: 'Player 1', avatar: '🔴', color: 'red' },
    { name: 'Player 2', avatar: '🔵', color: 'blue' },
    { name: 'Player 3', avatar: '🟢', color: 'green' },
    { name: 'Player 4', avatar: '🟡', color: 'yellow' },
  ]);

  // House Rules Settings
  const [rules, setRules] = useState<GameRules>(initialRules);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);

  const toggleSound = () => {
    const next = !rules.soundEnabled;
    sound.enabled = next;
    if (next) sound.playClick();
    const updated = { ...rules, soundEnabled: next };
    setRules(updated);
    onUpdateRules(updated);
  };

  const handleStart = () => {
    sound.playPowerup();

    let configuredPlayers: Array<{ name: string; is_computer: boolean; avatar: string; color: string }> = [];

    if (selectedMainMode === 'pvc') {
      // 1 Human + N bots
      configuredPlayers.push({
        name: humanPlayerName.trim() || 'Player 1',
        is_computer: false,
        avatar: humanPlayerAvatar || '🔴',
        color: 'red',
      });

      configuredPlayers.push({
        name: bot2Name.trim() || 'Bot 1',
        is_computer: true,
        avatar: bot2Avatar || '🔵',
        color: 'blue',
      });

      if (pvcBotCount >= 2) {
        configuredPlayers.push({
          name: bot3Name.trim() || 'Bot 2',
          is_computer: true,
          avatar: bot3Avatar || '🟢',
          color: 'green',
        });
      }

      if (pvcBotCount >= 3) {
        configuredPlayers.push({
          name: bot4Name.trim() || 'Bot 3',
          is_computer: true,
          avatar: bot4Avatar || '🟡',
          color: 'yellow',
        });
      }
    } else {
      // Local Multiplayer (2, 3, or 4 humans)
      const count = multiplayerPlayerCount;
      for (let i = 0; i < count; i++) {
        const p = mpPlayers[i];
        configuredPlayers.push({
          name: p.name.trim() || `Player ${i + 1}`,
          is_computer: false,
          avatar: p.avatar,
          color: p.color,
        });
      }
    }

    onStartGame(selectedMainMode, configuredPlayers, rules);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between pb-10">
      {/* Top Navbar */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 border border-amber-300">
            🐍
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              SNAKE & LADDER
            </h1>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              Classic Board Game
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setShowHowToPlayModal(true);
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={rules.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {rules.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Hero Banner */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider">
            <span>✨ 100 Squares of Pure Excitement</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Choose Your Game Arena
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Select a game mode, configure your contenders, and roll the dice to climb ladders and dodge serpents to square 100!
          </p>
        </div>

        {/* Step 1: Main Game Mode Selection */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            Step 1: Select Game Mode
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode 1: Player vs Computer */}
            <button
              onClick={() => {
                sound.playClick();
                setSelectedMainMode('pvc');
              }}
              className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer relative overflow-hidden ${
                selectedMainMode === 'pvc'
                  ? 'bg-gradient-to-br from-slate-900 to-slate-850 border-amber-500 ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                  selectedMainMode === 'pvc'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                🤖
              </div>

              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-white">
                    Mode 1: Player vs Computer (PvC)
                  </span>
                  {selectedMainMode === 'pvc' && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Challenge smart AI bots with automatic deliberation and moves. Choose 1, 2, or 3 computer opponents!
                </p>
                <div className="flex items-center gap-2 mt-3 text-[11px] font-bold text-amber-400">
                  <span>1 vs 1 Bot (C2)</span>
                  <span>•</span>
                  <span>1 vs 2 Bots (C2, C3)</span>
                  <span>•</span>
                  <span>1 vs 3 Bots (C2, C3, C4)</span>
                </div>
              </div>
            </button>

            {/* Mode 2: Local Multiplayer */}
            <button
              onClick={() => {
                sound.playClick();
                setSelectedMainMode('multiplayer');
              }}
              className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all cursor-pointer relative overflow-hidden ${
                selectedMainMode === 'multiplayer'
                  ? 'bg-gradient-to-br from-slate-900 to-slate-850 border-amber-500 ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                  selectedMainMode === 'multiplayer'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                👥
              </div>

              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-base font-black text-white">
                    Mode 2: Local Multiplayer / Pass & Play
                  </span>
                  {selectedMainMode === 'multiplayer' && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">
                      ✓
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Play on the same screen with family and friends. Pass the device between turns with 2, 3, or 4 human players!
                </p>
                <div className="flex items-center gap-2 mt-3 text-[11px] font-bold text-emerald-400">
                  <span>Two Players (2P)</span>
                  <span>•</span>
                  <span>Three Players (3P)</span>
                  <span>•</span>
                  <span>Four Players (4P)</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Sub-options & Player Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 shadow-xl">
          {/* Sub-mode option tabs */}
          {selectedMainMode === 'pvc' ? (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Step 2: Choose Number of Computer Opponents
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    setPvcBotCount(1);
                  }}
                  className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    pvcBotCount === 1
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-base font-black">1 vs 1 Bot</span>
                  <span className="text-[11px] text-slate-400">Player 1 vs Computer (C2)</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setPvcBotCount(2);
                  }}
                  className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    pvcBotCount === 2
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-base font-black">1 vs 2 Bots</span>
                  <span className="text-[11px] text-slate-400">Player 1 vs C2 & C3</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setPvcBotCount(3);
                  }}
                  className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    pvcBotCount === 3
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-base font-black">1 vs 3 Bots</span>
                  <span className="text-[11px] text-slate-400">Player 1 vs C2, C3 & C4</span>
                </button>
              </div>

              {/* Contender Name Customization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Human Player */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
                  <label className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <span>🔴</span> You (Player 1)
                  </label>
                  <input
                    type="text"
                    value={humanPlayerName}
                    onChange={(e) => setHumanPlayerName(e.target.value)}
                    maxLength={14}
                    placeholder="Enter your name"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Computer 1 */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
                  <label className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <span>🔵</span> Computer 1 (C2)
                  </label>
                  <input
                    type="text"
                    value={bot2Name}
                    onChange={(e) => setBot2Name(e.target.value)}
                    maxLength={14}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Computer 2 */}
                {pvcBotCount >= 2 && (
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
                    <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>🟢</span> Computer 2 (C3)
                    </label>
                    <input
                      type="text"
                      value={bot3Name}
                      onChange={(e) => setBot3Name(e.target.value)}
                      maxLength={14}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                )}

                {/* Computer 3 */}
                {pvcBotCount >= 3 && (
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2">
                    <label className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                      <span>🟡</span> Computer 3 (C4)
                    </label>
                    <input
                      type="text"
                      value={bot4Name}
                      onChange={(e) => setBot4Name(e.target.value)}
                      maxLength={14}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Step 2: Choose Number of Human Players
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    setMultiplayerPlayerCount(2);
                  }}
                  className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    multiplayerPlayerCount === 2
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-base font-black">Two Players (2P)</span>
                  <span className="text-[11px] text-slate-400">Player 1 vs Player 2</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setMultiplayerPlayerCount(3);
                  }}
                  className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    multiplayerPlayerCount === 3
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-base font-black">Three Players (3P)</span>
                  <span className="text-[11px] text-slate-400">Player 1, 2 & 3</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    setMultiplayerPlayerCount(4);
                  }}
                  className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    multiplayerPlayerCount === 4
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="text-base font-black">Four Players (4P)</span>
                  <span className="text-[11px] text-slate-400">Player 1, 2, 3 & 4</span>
                </button>
              </div>

              {/* Player Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {Array.from({ length: multiplayerPlayerCount }).map((_, idx) => {
                  const p = mpPlayers[idx];
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-2"
                    >
                      <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <span>{p.avatar}</span> Player {idx + 1} Name
                      </label>
                      <input
                        type="text"
                        value={p.name}
                        onChange={(e) => {
                          const updated = [...mpPlayers];
                          updated[idx].name = e.target.value;
                          setMpPlayers(updated);
                        }}
                        maxLength={14}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick House Rules Configuration */}
          <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> Match Rules & Options
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Exact 100 */}
              <button
                onClick={() => {
                  sound.playClick();
                  const updated = { ...rules, exact100: !rules.exact100 };
                  setRules(updated);
                  onUpdateRules(updated);
                }}
                className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                  rules.exact100
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Exact 100 Rule</span>
                  <span className="text-[10px] text-slate-400">Must land exactly on 100</span>
                </div>
                <span className="text-xs font-black">{rules.exact100 ? 'ON' : 'OFF'}</span>
              </button>

              {/* Extra Turn on 6 */}
              <button
                onClick={() => {
                  sound.playClick();
                  const updated = { ...rules, extraTurnOnSix: !rules.extraTurnOnSix };
                  setRules(updated);
                  onUpdateRules(updated);
                }}
                className={`p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-colors ${
                  rules.extraTurnOnSix
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Extra Turn on 6</span>
                  <span className="text-[10px] text-slate-400">Rolling 6 grants another roll</span>
                </div>
                <span className="text-xs font-black">{rules.extraTurnOnSix ? 'ON' : 'OFF'}</span>
              </button>

              {/* Animation Speed */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Pawn Speed</span>
                  <span className="text-[10px] text-slate-400">Step animation speed</span>
                </div>
                <select
                  value={rules.animationSpeed}
                  onChange={(e) => {
                    sound.playClick();
                    const updated = {
                      ...rules,
                      animationSpeed: e.target.value as 'slow' | 'normal' | 'fast',
                    };
                    setRules(updated);
                    onUpdateRules(updated);
                  }}
                  className="bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-amber-400 px-2 py-1 cursor-pointer focus:outline-none"
                >
                  <option value="slow">Slow</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Fast</option>
                </select>
              </div>
            </div>
          </div>

          {/* Launch Arena Button */}
          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-lg uppercase tracking-wider rounded-2xl shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-3 transition-transform active:scale-98 cursor-pointer border-b-4 border-amber-600"
          >
            <Play className="w-6 h-6 fill-slate-950" /> START GAME
          </button>
        </div>
      </main>

      {/* Rules Modal */}
      {showHowToPlayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 flex flex-col gap-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white uppercase">How To Play</h3>
              <button
                onClick={() => setShowHowToPlayModal(false)}
                className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="flex flex-col gap-2.5 text-xs text-slate-300">
              <p>1. Each player starts outside the board at square 0.</p>
              <p>2. Roll the dice to determine how many squares to move.</p>
              <p>3. <strong>🪜 Ladder:</strong> Land at the bottom to climb upwards.</p>
              <p>4. <strong>🐍 Snake:</strong> Land on a snake head to slide down to its tail.</p>
              <p>5. Exact 100 is required to win. The first player to reach 100 wins!</p>
            </div>

            <button
              onClick={() => setShowHowToPlayModal(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
