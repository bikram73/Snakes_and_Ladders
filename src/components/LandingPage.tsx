import React, { useState } from 'react';
import { GameRules } from '../types/game';
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
  Trophy,
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

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartGame,
  initialRules,
  onUpdateRules,
}) => {
  // Main Mode: 'pvc' | 'multiplayer'
  const [selectedMainMode, setSelectedMainMode] = useState<'pvc' | 'multiplayer'>('pvc');

  // PvC Sub-option: 1 bot (2p total), 2 bots (3p total), 3 bots (4p total)
  const [pvcBotCount, setPvcBotCount] = useState<1 | 2 | 3>(1);

  // Multiplayer Sub-option: 2 players, 3 players, 4 players
  const [multiplayerPlayerCount, setMultiplayerPlayerCount] = useState<2 | 3 | 4>(2);

  // Player configurations for PvC
  const [humanPlayerName, setHumanPlayerName] = useState('Player 1');
  const [bot2Name, setBot2Name] = useState('Bot Nova');
  const [bot3Name, setBot3Name] = useState('Bot Blaze');
  const [bot4Name, setBot4Name] = useState('Bot Echo');

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
      configuredPlayers.push({
        name: humanPlayerName.trim() || 'Player 1',
        is_computer: false,
        avatar: '🔴',
        color: 'red',
      });

      configuredPlayers.push({
        name: bot2Name.trim() || 'Computer 1',
        is_computer: true,
        avatar: '🔵',
        color: 'blue',
      });

      if (pvcBotCount >= 2) {
        configuredPlayers.push({
          name: bot3Name.trim() || 'Computer 2',
          is_computer: true,
          avatar: '🟢',
          color: 'green',
        });
      }

      if (pvcBotCount >= 3) {
        configuredPlayers.push({
          name: bot4Name.trim() || 'Computer 3',
          is_computer: true,
          avatar: '🟡',
          color: 'yellow',
        });
      }
    } else {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 pb-10">
      {/* Top Navbar */}
      <header className="w-full max-w-4xl mx-auto px-4 py-3.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
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

      {/* Main Landing Content Container */}
      <main className="w-full max-w-3xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Visual Hero Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center gap-3">
          {/* Subtle background glow */}
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Decorative Board Visual Icon Row */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1.5 shadow-sm">
              <span>🎯 100 Squares</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow-sm">
              <span>🪜 9 Ladders</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-bold text-rose-400 flex items-center gap-1.5 shadow-sm">
              <span>🐍 10 Snakes</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-bold text-amber-300 flex items-center gap-1.5 shadow-sm">
              <span>🏆 Exact Finish</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Welcome to Snake & Ladder
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg leading-relaxed">
            Roll the dice, ascend ladders to skyrocket ahead, beware of slippery snakes, and race to square 100 to conquer the arena!
          </p>
        </div>

        {/* Step 1: Select Game Mode */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            Step 1: Choose Game Mode
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Mode 1: Player vs Computer */}
            <button
              onClick={() => {
                sound.playClick();
                setSelectedMainMode('pvc');
              }}
              className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer relative ${
                selectedMainMode === 'pvc'
                  ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  selectedMainMode === 'pvc'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                🤖
              </div>

              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white uppercase">
                    Mode 1: Player vs Computer
                  </span>
                  {selectedMainMode === 'pvc' && (
                    <span className="text-[10px] text-amber-400 font-black bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                      SELECTED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  Challenge 1, 2, or 3 smart automated bots with turn deliberation.
                </p>
              </div>
            </button>

            {/* Mode 2: Local Multiplayer */}
            <button
              onClick={() => {
                sound.playClick();
                setSelectedMainMode('multiplayer');
              }}
              className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer relative ${
                selectedMainMode === 'multiplayer'
                  ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  selectedMainMode === 'multiplayer'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                👥
              </div>

              <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white uppercase">
                    Mode 2: Local Multiplayer
                  </span>
                  {selectedMainMode === 'multiplayer' && (
                    <span className="text-[10px] text-amber-400 font-black bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40">
                      SELECTED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-snug">
                  Pass and play with 2, 3, or 4 human players on the same device.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Sub-options & Contender Customization Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col gap-5 shadow-xl">
          {selectedMainMode === 'pvc' ? (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Step 2: Choose Number of Computer Opponents
                </span>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setPvcBotCount(1);
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-center text-xs font-black transition-all cursor-pointer ${
                      pvcBotCount === 1
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                    }`}
                  >
                    1 Bot (C2)
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setPvcBotCount(2);
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-center text-xs font-black transition-all cursor-pointer ${
                      pvcBotCount === 2
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                    }`}
                  >
                    2 Bots (C2, C3)
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setPvcBotCount(3);
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-center text-xs font-black transition-all cursor-pointer ${
                      pvcBotCount === 3
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                    }`}
                  >
                    3 Bots (C2, C3, C4)
                  </button>
                </div>
              </div>

              {/* Contenders Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                    <span>🔴</span> You (Player 1)
                  </label>
                  <input
                    type="text"
                    value={humanPlayerName}
                    onChange={(e) => setHumanPlayerName(e.target.value)}
                    maxLength={14}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                    <span>🔵</span> Computer 1 (C2)
                  </label>
                  <input
                    type="text"
                    value={bot2Name}
                    onChange={(e) => setBot2Name(e.target.value)}
                    maxLength={14}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {pvcBotCount >= 2 && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>🟢</span> Computer 2 (C3)
                    </label>
                    <input
                      type="text"
                      value={bot3Name}
                      onChange={(e) => setBot3Name(e.target.value)}
                      maxLength={14}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                )}

                {pvcBotCount >= 3 && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-yellow-400 flex items-center gap-1.5">
                      <span>🟡</span> Computer 3 (C4)
                    </label>
                    <input
                      type="text"
                      value={bot4Name}
                      onChange={(e) => setBot4Name(e.target.value)}
                      maxLength={14}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Step 2: Choose Number of Human Players
                </span>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setMultiplayerPlayerCount(2);
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-center text-xs font-black transition-all cursor-pointer ${
                      multiplayerPlayerCount === 2
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                    }`}
                  >
                    2 Players (2P)
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setMultiplayerPlayerCount(3);
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-center text-xs font-black transition-all cursor-pointer ${
                      multiplayerPlayerCount === 3
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                    }`}
                  >
                    3 Players (3P)
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setMultiplayerPlayerCount(4);
                    }}
                    className={`py-2.5 px-2 rounded-xl border text-center text-xs font-black transition-all cursor-pointer ${
                      multiplayerPlayerCount === 4
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                    }`}
                  >
                    4 Players (4P)
                  </button>
                </div>
              </div>

              {/* Contenders Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {Array.from({ length: multiplayerPlayerCount }).map((_, idx) => {
                  const p = mpPlayers[idx];
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5"
                    >
                      <label className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
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
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Quick Match Rules Bar */}
          <div className="border-t border-slate-800 pt-3.5 flex flex-wrap items-center justify-between gap-2.5">
            <button
              onClick={() => {
                sound.playClick();
                const updated = { ...rules, exact100: !rules.exact100 };
                setRules(updated);
                onUpdateRules(updated);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                rules.exact100
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span>Exact 100:</span>
              <strong>{rules.exact100 ? 'ON' : 'OFF'}</strong>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                const updated = { ...rules, extraTurnOnSix: !rules.extraTurnOnSix };
                setRules(updated);
                onUpdateRules(updated);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                rules.extraTurnOnSix
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span>Extra Turn on 6:</span>
              <strong>{rules.extraTurnOnSix ? 'ON' : 'OFF'}</strong>
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Pawn Speed:</span>
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
                className="bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold rounded-lg px-2 py-1 cursor-pointer focus:outline-none"
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
            </div>
          </div>

          {/* Big Launch CTA Button */}
          <button
            onClick={handleStart}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-lg uppercase tracking-wider rounded-2xl shadow-2xl shadow-amber-500/25 flex items-center justify-center gap-3 transition-transform active:scale-98 cursor-pointer border-b-4 border-amber-600"
          >
            <Play className="w-5 h-5 fill-slate-950" /> START GAME
          </button>
        </div>
      </main>

      {/* Rules Modal */}
      {showHowToPlayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 flex flex-col gap-4 text-slate-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white uppercase">How To Play</h3>
              <button
                onClick={() => setShowHowToPlayModal(false)}
                className="text-xs px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
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
