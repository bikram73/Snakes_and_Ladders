import React, { useState } from 'react';
import { GameMode } from '../types/game';
import { Bot, Users, User, Play, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface ModeSelectModalProps {
  onStart: (mode: GameMode, playerNames: string[]) => void;
  onCancel?: () => void;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({ onStart, onCancel }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('pvc');
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Computer');
  const [player3Name, setPlayer3Name] = useState('Player 3');
  const [player4Name, setPlayer4Name] = useState('Player 4');

  const handleModeChange = (mode: GameMode) => {
    sound.playClick();
    setSelectedMode(mode);
    if (mode === 'pvc') {
      setPlayer1Name('Player 1');
      setPlayer2Name('Computer');
    } else if (mode === 'two') {
      setPlayer1Name('Player 1');
      setPlayer2Name('Player 2');
    } else if (mode === 'four') {
      setPlayer1Name('Player 1');
      setPlayer2Name('Player 2');
      setPlayer3Name('Player 3');
      setPlayer4Name('Player 4');
    }
  };

  const handleStart = () => {
    sound.playPowerup();
    let names = [player1Name.trim() || 'Player 1', player2Name.trim() || (selectedMode === 'pvc' ? 'Computer' : 'Player 2')];
    if (selectedMode === 'four') {
      names.push(player3Name.trim() || 'Player 3', player4Name.trim() || 'Player 4');
    }
    onStart(selectedMode, names);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 flex flex-col gap-6 text-slate-100 animate-fade-in">
        {/* Title Header */}
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30 mb-3 border-2 border-amber-300">
            🐍
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            <span>SNAKE & LADDER</span>
          </h1>
          <p className="text-xs uppercase tracking-widest font-bold text-amber-400 mt-1">
            Classic Board Game
          </p>
          <p className="text-xs text-slate-400 mt-1">
            The classic game is ready! Choose your game mode:
          </p>
        </div>

        {/* Mode Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleModeChange('pvc')}
            className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
              selectedMode === 'pvc'
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-lg'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Bot className="w-6 h-6 text-cyan-400" />
            <span className="text-xs font-black uppercase">Player vs Computer</span>
            <span className="text-[10px] text-slate-400">1 Human + 1 AI</span>
          </button>

          <button
            onClick={() => handleModeChange('two')}
            className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
              selectedMode === 'two'
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-lg'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Users className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-black uppercase">Two Players</span>
            <span className="text-[10px] text-slate-400">2 Players Local</span>
          </button>

          <button
            onClick={() => handleModeChange('four')}
            className={`p-3.5 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer ${
              selectedMode === 'four'
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400 shadow-lg'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-6 h-6 text-purple-400" />
            <span className="text-xs font-black uppercase">Four Players</span>
            <span className="text-[10px] text-slate-400">4 Players Local</span>
          </button>
        </div>

        {/* Player Name Customization */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Player Configuration
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <span>🔴</span> Player 1 Name
              </label>
              <input
                type="text"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                maxLength={14}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <span>🔵</span> {selectedMode === 'pvc' ? 'Computer' : 'Player 2 Name'}
              </label>
              <input
                type="text"
                value={player2Name}
                disabled={selectedMode === 'pvc'}
                onChange={(e) => setPlayer2Name(e.target.value)}
                maxLength={14}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {selectedMode === 'four' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <span>🟢</span> Player 3 Name
                  </label>
                  <input
                    type="text"
                    value={player3Name}
                    onChange={(e) => setPlayer3Name(e.target.value)}
                    maxLength={14}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <span>🟡</span> Player 4 Name
                  </label>
                  <input
                    type="text"
                    value={player4Name}
                    onChange={(e) => setPlayer4Name(e.target.value)}
                    maxLength={14}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              onClick={() => {
                sound.playClick();
                onCancel();
              }}
              className="py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold cursor-pointer"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleStart}
            className="flex-1 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base uppercase tracking-wider rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" /> START GAME
          </button>
        </div>
      </div>
    </div>
  );
};
