import React, { useState, useEffect } from 'react';
import { GameRules, SharkThemeId, SharkLayoutPresetId } from '../types/game';
import { sound } from '../utils/audio';
import { gameApi } from '../utils/apiClient';
import { detectRoomCodeFromCurrentUrl, extractRoomCode } from '../utils/roomLink';
import { AnimatedBoardHero } from './AnimatedBoardHero';
import { SHARK_THEMES, SHARK_THEMES_LIST } from '../utils/sharkThemes';
import { SHARK_LAYOUT_PRESETS, SHARK_LAYOUT_PRESETS_LIST } from '../utils/boardPresets';
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
  Globe,
  Share2,
  Check,
  Trophy,
  Palette,
  Compass,
} from 'lucide-react';

interface LandingPageProps {
  onStartGame: (
    mode: 'pvc' | 'multiplayer',
    players: Array<{ name: string; is_computer: boolean; avatar: string; color: string }>,
    rules: GameRules
  ) => void;
  onOpenRemoteLobby: (roomCode: string, playerId: number, isHost: boolean) => void;
  initialRules: GameRules;
  onUpdateRules: (rules: GameRules) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartGame,
  onOpenRemoteLobby,
  initialRules,
  onUpdateRules,
}) => {
  // Main Mode: 'pvc' | 'multiplayer' | 'remote'
  const [selectedMainMode, setSelectedMainMode] = useState<'pvc' | 'multiplayer' | 'remote'>('pvc');

  // PvC Sub-option: 1 bot (2p total), 2 bots (3p total), 3 bots (4p total)
  const [pvcBotCount, setPvcBotCount] = useState<1 | 2 | 3>(1);

  // Multiplayer Sub-option: 2 players, 3 players, 4 players
  const [multiplayerPlayerCount, setMultiplayerPlayerCount] = useState<2 | 3 | 4>(2);

  // Remote Sub-tab: 'host' | 'join'
  const [remoteSubTab, setRemoteSubTab] = useState<'host' | 'join'>('host');
  const [remoteMaxPlayers, setRemoteMaxPlayers] = useState<2 | 3 | 4>(2);
  const [hostPlayerName, setHostPlayerName] = useState('Host');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [joinPlayerName, setJoinPlayerName] = useState('Guest');
  const [remoteError, setRemoteError] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [hasInviteFromUrl, setHasInviteFromUrl] = useState(false);

  // Check URL query params, hash, and full URL for Netlify share links (?room=CODE, #room=CODE)
  useEffect(() => {
    const detected = detectRoomCodeFromCurrentUrl();
    if (detected) {
      setSelectedMainMode('remote');
      setRemoteSubTab('join');
      setJoinRoomCode(detected);
      setHasInviteFromUrl(true);
    }
  }, []);

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

  const handleStartLocal = () => {
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
      onStartGame('pvc', configuredPlayers, rules);
    } else if (selectedMainMode === 'multiplayer') {
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
      onStartGame('multiplayer', configuredPlayers, rules);
    }
  };

  const handleCreateRemoteRoom = async () => {
    sound.playPowerup();
    setIsCreatingRoom(true);
    setRemoteError(null);
    try {
      const data = await gameApi.createRoom(
        hostPlayerName.trim() || 'Host',
        remoteMaxPlayers,
        rules.exact100,
        rules.extraTurnOnSix,
        rules.sharkTheme || 'great-white',
        rules.sharkLayout || 'reef-patrol'
      );

      setIsCreatingRoom(false);
      if (data.success) {
        onOpenRemoteLobby(data.room_code, data.player_id, true);
      } else {
        setRemoteError(data.error || 'Failed to create room');
      }
    } catch (err) {
      setIsCreatingRoom(false);
      setRemoteError('Failed to create room');
    }
  };

  const handleJoinRemoteRoom = async () => {
    sound.playClick();
    const cleanCode = extractRoomCode(joinRoomCode);
    if (!cleanCode || cleanCode.length < 4) {
      setRemoteError('Please enter a valid 5-character Room Code.');
      return;
    }

    setIsCreatingRoom(true);
    setRemoteError(null);
    try {
      const data = await gameApi.joinRoom(
        cleanCode,
        joinPlayerName.trim() || 'Guest'
      );

      setIsCreatingRoom(false);
      if (data.success) {
        onOpenRemoteLobby(data.room_code, data.player_id, false);
      } else {
        setRemoteError(data.error || 'Failed to join room. Please check the code.');
      }
    } catch (err: any) {
      setIsCreatingRoom(false);
      setRemoteError(err?.message || 'Failed to join room');
    }
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
        {/* Prominent Invite Link Banner when opening via shared link (?room=CODE) */}
        {hasInviteFromUrl && joinRoomCode && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-yellow-500/20 border-2 border-amber-400 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg shrink-0">
                🎮
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider">
                    Online Room Invite
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/20 text-amber-300 font-mono font-black text-sm tracking-widest border border-amber-400/40">
                    {joinRoomCode}
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-1">
                  You've been invited by the host! Enter your name and join the arena.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                value={joinPlayerName}
                onChange={(e) => setJoinPlayerName(e.target.value)}
                maxLength={14}
                placeholder="Your Name"
                className="flex-1 sm:w-36 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleJoinRemoteRoom}
                disabled={isCreatingRoom}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 disabled:opacity-50 transition-all border-b-2 border-amber-600"
              >
                <span>{isCreatingRoom ? 'Joining...' : '🚀 Join Room Now'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Animated Live Game Showcase Hero */}
        <AnimatedBoardHero
          initialThemeId={rules.sharkTheme || 'great-white'}
          initialLayoutId={rules.sharkLayout || 'reef-patrol'}
          onThemeSelect={(themeId) => {
            const upd = { ...rules, sharkTheme: themeId };
            setRules(upd);
            onUpdateRules(upd);
          }}
        />

        {/* Step 1: Select Game Mode (3 Modes: PvC, Multiplayer, Remote) */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            Step 1: Choose Game Mode
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mode 1: Player vs Computer */}
            <button
              onClick={() => {
                sound.playClick();
                setSelectedMainMode('pvc');
              }}
              className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer relative ${
                selectedMainMode === 'pvc'
                  ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${selectedMainMode === 'pvc' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800'}`}>
                    🤖
                  </div>
                  <span className="text-xs font-black text-white uppercase">
                    Mode 1: PvC
                  </span>
                </div>
                {selectedMainMode === 'pvc' && (
                  <span className="text-[10px] text-amber-400 font-black">ACTIVE</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                1 vs 1, 2, or 3 smart automated bots.
              </p>
            </button>

            {/* Mode 2: Local Multiplayer */}
            <button
              onClick={() => {
                sound.playClick();
                setSelectedMainMode('multiplayer');
              }}
              className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer relative ${
                selectedMainMode === 'multiplayer'
                  ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${selectedMainMode === 'multiplayer' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800'}`}>
                    👥
                  </div>
                  <span className="text-xs font-black text-white uppercase">
                    Mode 2: Local
                  </span>
                </div>
                {selectedMainMode === 'multiplayer' && (
                  <span className="text-[10px] text-amber-400 font-black">ACTIVE</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Pass & Play for 2, 3, or 4 human players.
              </p>
            </button>

            {/* Mode 3: Remote Online Mode */}
            <button
              onClick={() => {
                sound.playClick();
                setSelectedMainMode('remote');
              }}
              className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition-all cursor-pointer relative ${
                selectedMainMode === 'remote'
                  ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${selectedMainMode === 'remote' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800'}`}>
                    🌐
                  </div>
                  <span className="text-xs font-black text-white uppercase">
                    Mode 3: Remote
                  </span>
                </div>
                {selectedMainMode === 'remote' && (
                  <span className="text-[10px] text-amber-400 font-black">ACTIVE</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Play with friends via Room Code / Link (2, 3, or 4 Players).
              </p>
            </button>
          </div>
        </div>

        {/* Step 2: Sub-options & Contender Customization Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col gap-5 shadow-xl">
          {/* Mode 1: PvC Config */}
          {selectedMainMode === 'pvc' && (
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
          )}

          {/* Mode 2: Local Multiplayer Config */}
          {selectedMainMode === 'multiplayer' && (
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

          {/* Mode 3: Remote Online Mode Config */}
          {selectedMainMode === 'remote' && (
            <div className="flex flex-col gap-4">
              {/* Host vs Join Tabs */}
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    sound.playClick();
                    setRemoteSubTab('host');
                    setRemoteError(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    remoteSubTab === 'host'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  👑 Host a Room
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    setRemoteSubTab('join');
                    setRemoteError(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    remoteSubTab === 'join'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🔗 Join via Code / Link
                </button>
              </div>

              {remoteSubTab === 'host' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Room Player Capacity:
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          sound.playClick();
                          setRemoteMaxPlayers(2);
                        }}
                        className={`py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                          remoteMaxPlayers === 2
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                            : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                        }`}
                      >
                        2 Players
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick();
                          setRemoteMaxPlayers(3);
                        }}
                        className={`py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                          remoteMaxPlayers === 3
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                            : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                        }`}
                      >
                        3 Players
                      </button>
                      <button
                        onClick={() => {
                          sound.playClick();
                          setRemoteMaxPlayers(4);
                        }}
                        className={`py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                          remoteMaxPlayers === 4
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                            : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                        }`}
                      >
                        4 Players
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-amber-400">
                      👑 Your Name (Room Host)
                    </label>
                    <input
                      type="text"
                      value={hostPlayerName}
                      onChange={(e) => setHostPlayerName(e.target.value)}
                      maxLength={14}
                      placeholder="e.g. Host Alex"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-amber-400">
                        🔑 Enter 5-Letter Room Code or Paste Link
                      </label>
                      <button
                        type="button"
                        onClick={async () => {
                          sound.playClick();
                          try {
                            if (navigator.clipboard && navigator.clipboard.readText) {
                              const text = await navigator.clipboard.readText();
                              const clean = extractRoomCode(text);
                              if (clean) {
                                setJoinRoomCode(clean);
                                setRemoteError(null);
                              }
                            }
                          } catch (e) {}
                        }}
                        className="text-[10px] font-bold text-amber-300 hover:text-amber-200 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 cursor-pointer flex items-center gap-1 transition-colors"
                      >
                        <span>📋 Paste</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={joinRoomCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        const clean = extractRoomCode(val);
                        setJoinRoomCode(clean);
                        if (remoteError) setRemoteError(null);
                      }}
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData('text');
                        const clean = extractRoomCode(pasted);
                        if (clean) {
                          e.preventDefault();
                          setJoinRoomCode(clean);
                          if (remoteError) setRemoteError(null);
                        }
                      }}
                      maxLength={250}
                      placeholder="e.g. 7KF9A or paste invite link"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm font-black text-amber-300 font-mono tracking-widest focus:outline-none focus:border-amber-400 uppercase"
                    />
                    {joinRoomCode && joinRoomCode.length >= 4 ? (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 pt-0.5">
                        <span>✓ Code ready:</span>
                        <span className="font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {joinRoomCode}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 pt-0.5">
                        Paste the full invite link or type the 5-letter room code from your host.
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-300">
                      👤 Your Contender Name
                    </label>
                    <input
                      type="text"
                      value={joinPlayerName}
                      onChange={(e) => setJoinPlayerName(e.target.value)}
                      maxLength={14}
                      placeholder="e.g. Player Chris"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {remoteError && (
                <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-800 text-rose-200 text-xs font-bold text-center animate-fade-in flex flex-col gap-1 shadow-lg">
                  <span className="text-rose-400 font-black">⚠️ Connection Error</span>
                  <span>{remoteError}</span>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Shark Board Theme & Hazard Layout Selection */}
          <div className="border-t border-slate-800 pt-4 flex flex-col gap-4">
            {/* Visual Themes */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-cyan-400" /> Choose Shark Board Theme
                </span>
                <span className="text-[11px] text-cyan-300 font-mono font-bold">
                  {SHARK_THEMES[rules.sharkTheme || 'great-white']?.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Custom predator graphics, ocean textures, and board colors.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SHARK_THEMES_LIST.map((th) => {
                  const isSelected = (rules.sharkTheme || 'great-white') === th.id;
                  return (
                    <button
                      key={th.id}
                      onClick={() => {
                        sound.playClick();
                        const updated = { ...rules, sharkTheme: th.id };
                        setRules(updated);
                        onUpdateRules(updated);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-slate-850 border-cyan-400 ring-2 ring-cyan-400/50 shadow-md scale-[1.01]'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl">{th.icon}</span>
                          <span className="text-xs font-black text-white truncate">{th.name.split(' ')[0]}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />}
                      </div>
                      <span className="text-[10px] text-cyan-300 font-mono truncate opacity-90">
                        {th.speciesTitle.split('(')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layout Presets */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-400" /> Shark Board Hazard Layout Preset
                </span>
                <span className="text-[11px] text-amber-300 font-mono font-bold">
                  {SHARK_LAYOUT_PRESETS[rules.sharkLayout || 'reef-patrol']?.name}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SHARK_LAYOUT_PRESETS_LIST.map((layout) => {
                  const isSelected = (rules.sharkLayout || 'reef-patrol') === layout.id;
                  return (
                    <button
                      key={layout.id}
                      onClick={() => {
                        sound.playClick();
                        const updated = { ...rules, sharkLayout: layout.id };
                        setRules(updated);
                        onUpdateRules(updated);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                        isSelected
                          ? 'bg-slate-850 border-amber-400 ring-2 ring-amber-400/50 shadow-md scale-[1.01]'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{layout.icon}</span>
                        {isSelected && <Check className="w-3 h-3 text-amber-400 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-black text-white truncate">{layout.name}</span>
                      <span className="text-[9px] text-amber-300 font-mono">
                        {layout.difficulty} • {Object.keys(layout.snakes).length} 🦈
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

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
          {selectedMainMode === 'remote' ? (
            <button
              onClick={remoteSubTab === 'host' ? handleCreateRemoteRoom : handleJoinRemoteRoom}
              disabled={isCreatingRoom || (remoteSubTab === 'join' && joinRoomCode.length < 4)}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-lg uppercase tracking-wider rounded-2xl shadow-2xl shadow-amber-500/25 flex items-center justify-center gap-3 transition-transform active:scale-98 cursor-pointer border-b-4 border-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>🌐</span>
              <span>
                {isCreatingRoom
                  ? 'CONNECTING TO ONLINE ROOM...'
                  : remoteSubTab === 'host'
                  ? 'CREATE ONLINE ROOM & GET CODE'
                  : joinRoomCode.length < 4
                  ? 'ENTER 5-LETTER CODE TO JOIN'
                  : 'JOIN ONLINE ROOM NOW'}
              </span>
            </button>
          ) : (
            <button
              onClick={handleStartLocal}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-lg uppercase tracking-wider rounded-2xl shadow-2xl shadow-amber-500/25 flex items-center justify-center gap-3 transition-transform active:scale-98 cursor-pointer border-b-4 border-amber-600"
            >
              <Play className="w-5 h-5 fill-slate-950" /> START GAME
            </button>
          )}
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
