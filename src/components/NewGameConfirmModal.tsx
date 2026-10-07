import React from 'react';
import { AlertCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface NewGameConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const NewGameConfirmModal: React.FC<NewGameConfirmModalProps> = ({
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 flex flex-col gap-4 text-slate-100 text-center animate-fade-in">
        <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-lg font-black text-white">Start a new game?</h3>
          <p className="text-xs text-slate-400 mt-1">
            Your current game progress will be lost.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onCancel();
            }}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            CANCEL
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onConfirm();
            }}
            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            NEW GAME
          </button>
        </div>
      </div>
    </div>
  );
};
