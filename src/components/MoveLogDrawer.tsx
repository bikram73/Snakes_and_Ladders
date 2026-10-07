import React from 'react';
import { MoveLog } from '../types/game';
import { History, X } from 'lucide-react';

interface MoveLogDrawerProps {
  logs: MoveLog[];
  isOpen: boolean;
  onToggle: () => void;
}

export const MoveLogDrawer: React.FC<MoveLogDrawerProps> = ({ logs, isOpen, onToggle }) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-slate-900 border-l border-slate-800 shadow-2xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-sm text-slate-100">Match Log</h3>
          <span className="text-xs text-slate-400 font-mono">({logs.length})</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {logs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
            No moves yet. Roll the dice to start!
          </div>
        ) : (
          [...logs].reverse().map((log) => {
            let icon = '🎲';
            let badgeBg = 'bg-slate-800 text-slate-300';

            if (log.actionType === 'ladder') {
              icon = '🪜';
              badgeBg = 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300';
            } else if (log.actionType === 'snake') {
              icon = '🐍';
              badgeBg = 'bg-rose-950/80 border-rose-800/80 text-rose-300';
            } else if (log.actionType === 'special') {
              icon = '⚡';
              badgeBg = 'bg-cyan-950/80 border-cyan-800/80 text-cyan-300';
            } else if (log.actionType === 'knockout') {
              icon = '💥';
              badgeBg = 'bg-amber-950/80 border-amber-800/80 text-amber-300';
            } else if (log.actionType === 'win') {
              icon = '🏆';
              badgeBg = 'bg-amber-500/20 border-amber-500 text-amber-300';
            }

            return (
              <div
                key={log.id}
                className={`p-2.5 rounded-xl border text-xs flex flex-col gap-1 transition-colors ${badgeBg}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>{log.playerAvatar}</span>
                    <span>{log.playerName}</span>
                  </div>
                  <span className="text-[10px] opacity-70 font-mono">
                    Roll: {log.diceRoll.join('+')}
                  </span>
                </div>

                <p className="text-[11px] leading-snug opacity-90">{log.message}</p>

                <div className="flex items-center justify-between text-[10px] opacity-60 pt-0.5 border-t border-white/10">
                  <span>{icon} {log.actionType.toUpperCase()}</span>
                  <span>
                    Tile {log.fromPos} ➔ {log.toPos}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
