import React, { useState, useEffect } from 'react';
import {
  User,
  Sparkles,
  Dice5,
  Check,
  X,
  Shield,
  Palette,
  Anchor,
  Flame,
} from 'lucide-react';
import {
  AVATAR_OPTIONS,
  generateRandomPlayerName,
  getStoredPlayerProfile,
  savePlayerProfile,
  PlayerProfile,
} from '../utils/playerStorage';
import { sound } from '../utils/audio';

interface InitialPlayerModalProps {
  isOpen: boolean;
  isFirstTime?: boolean;
  onClose: () => void;
  onSave: (profile: PlayerProfile) => void;
}

export const InitialPlayerModal: React.FC<InitialPlayerModalProps> = ({
  isOpen,
  isFirstTime = false,
  onClose,
  onSave,
}) => {
  const currentProfile = getStoredPlayerProfile();
  const [name, setName] = useState(currentProfile.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(currentProfile.avatar || '🔴');
  const [selectedColor, setSelectedColor] = useState(currentProfile.color || 'red');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const p = getStoredPlayerProfile();
      setName(p.name || '');
      setSelectedAvatar(p.avatar || '🔴');
      setSelectedColor(p.color || 'red');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRandomize = () => {
    sound.playClick();
    const newName = generateRandomPlayerName();
    setName(newName);
    // pick a random avatar
    const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
    setSelectedAvatar(randomAvatar.emoji);
    setSelectedColor(randomAvatar.color);
    setError(null);
  };

  const handleSelectAvatar = (option: (typeof AVATAR_OPTIONS)[0]) => {
    sound.playClick();
    setSelectedAvatar(option.emoji);
    setSelectedColor(option.color);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your player name');
      return;
    }

    sound.playPowerup();
    const saved = savePlayerProfile({
      name: trimmed,
      avatar: selectedAvatar,
      color: selectedColor,
    });

    onSave(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-amber-500/20 text-slate-100 relative flex flex-col gap-4 sm:gap-5"
        role="dialog"
        aria-modal="true"
      >
        {/* Close button (only available if not mandatory first-time with empty name) */}
        {!isFirstTime && (
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-1.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/30 border-2 border-amber-300">
            {selectedAvatar || '🦈'}
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2 mt-1">
            {isFirstTime ? 'Welcome to Snakes & Ladders!' : 'Player Profile'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs font-medium">
            {isFirstTime
              ? 'Enter your player name to store in your browser for all game modes & online rooms.'
              : 'Update your display name and avatar stored on this device.'}
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="playerNameInput" className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Player Name
              </label>
              <button
                type="button"
                onClick={handleRandomize}
                className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer transition-colors"
                title="Generate Random Name"
              >
                <Dice5 className="w-3.5 h-3.5 text-amber-400" /> Randomize
              </button>
            </div>

            <div className="relative">
              <input
                id="playerNameInput"
                type="text"
                maxLength={20}
                autoFocus
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="e.g. Captain Nemo"
                className={`w-full px-4 py-3 rounded-2xl bg-slate-950/90 border text-white font-bold text-sm sm:text-base outline-none transition-all placeholder:text-slate-600 ${
                  error
                    ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/40'
                    : 'border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                {name.length}/20
              </span>
            </div>
            {error && <span className="text-xs font-bold text-rose-400">{error}</span>}
          </div>

          {/* Avatar Choice */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-cyan-400" /> Choose Token Avatar
            </label>
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {AVATAR_OPTIONS.map((opt) => {
                const isSelected = selectedAvatar === opt.emoji;
                return (
                  <button
                    key={opt.emoji}
                    type="button"
                    onClick={() => handleSelectAvatar(opt)}
                    className={`h-11 sm:h-12 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-md scale-105'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-600 hover:bg-slate-800/40 text-slate-300'
                    }`}
                    title={opt.label}
                  >
                    <span>{opt.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2 leading-relaxed">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Your name and game states are preserved in your local browser storage, allowing you to resume matches after refreshing.
            </span>
          </div>

          {/* Submit CTA */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isFirstTime ? 'Save & Start Playing' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
