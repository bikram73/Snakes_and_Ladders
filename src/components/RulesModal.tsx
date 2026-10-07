import React from 'react';
import { GameRules } from '../types/game';
import { BookOpen, X, Check, ShieldCheck, Dices, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface RulesModalProps {
  rules: GameRules;
  onUpdateRules: (newRules: GameRules) => void;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ rules, onUpdateRules, onClose }) => {
  const toggleRule = (key: keyof GameRules) => {
    sound.playClick();
    onUpdateRules({
      ...rules,
      [key]: !rules[key],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col gap-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Rules & How To Play</h2>
              <p className="text-xs text-slate-400">Classic guidelines and custom house rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* How to Play Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col gap-1.5">
            <span className="text-2xl">🎲</span>
            <h3 className="text-sm font-bold text-amber-300">1. Roll the Dice</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Take turns rolling the dice to advance your token step by step towards the summit.
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col gap-1.5">
            <span className="text-2xl">🪜</span>
            <h3 className="text-sm font-bold text-emerald-400">2. Climb Ladders</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Landing at the bottom of a ladder ascends you directly up to the top tile!
            </p>
          </div>

          <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl flex flex-col gap-1.5">
            <span className="text-2xl">🐍</span>
            <h3 className="text-sm font-bold text-rose-400">3. Avoid Snakes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Landing on a vicious snake head slides you all the way down to its tail!
            </p>
          </div>
        </div>

        {/* Custom House Rules Toggles */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Custom House Rules
          </h3>

          <div className="flex flex-col gap-2">
            {/* Exact 100 */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 hover:bg-slate-800 cursor-pointer transition-colors">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-bold text-slate-200">Exact Finish Required</span>
                <span className="text-xs text-slate-400">
                  Must land exactly on the final tile. Overshooting causes your token to bounce back!
                </span>
              </div>
              <input
                type="checkbox"
                checked={rules.exact100}
                onChange={() => toggleRule('exact100')}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </label>

            {/* Lucky 6 Bonus Turn */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 hover:bg-slate-800 cursor-pointer transition-colors">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-bold text-slate-200">Lucky 6 Bonus Roll</span>
                <span className="text-xs text-slate-400">
                  Rolling a 6 grants an immediate extra roll for your turn!
                </span>
              </div>
              <input
                type="checkbox"
                checked={rules.rollSixAgain}
                onChange={() => toggleRule('rollSixAgain')}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </label>

            {/* 3 Sixes Penalty */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 hover:bg-slate-800 cursor-pointer transition-colors">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-bold text-slate-200">Triple 6 Penalty</span>
                <span className="text-xs text-slate-400">
                  Rolling three consecutive 6s in a row voids your turn to prevent runaway luck.
                </span>
              </div>
              <input
                type="checkbox"
                checked={rules.threeSixesPenalty}
                onChange={() => toggleRule('threeSixesPenalty')}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </label>

            {/* Pawn Knockout */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 hover:bg-slate-800 cursor-pointer transition-colors">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-bold text-slate-200">Pawn Knockout Clash</span>
                <span className="text-xs text-slate-400">
                  Landing directly on another player&apos;s tile bumps them back 3 tiles!
                </span>
              </div>
              <input
                type="checkbox"
                checked={rules.allowKnockout}
                onChange={() => toggleRule('allowKnockout')}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </label>

            {/* Dual Dice */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 border border-slate-700/80 hover:bg-slate-800 cursor-pointer transition-colors">
              <div className="flex flex-col pr-4">
                <span className="text-sm font-bold text-slate-200">Double Dice Rush</span>
                <span className="text-xs text-slate-400">
                  Roll two dice together (sum 2-12) for hyper-fast race matches!
                </span>
              </div>
              <input
                type="checkbox"
                checked={rules.doubleDice}
                onChange={() => toggleRule('doubleDice')}
                className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl transition-transform active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
        >
          Got It, Let&apos;s Play!
        </button>
      </div>
    </div>
  );
};
