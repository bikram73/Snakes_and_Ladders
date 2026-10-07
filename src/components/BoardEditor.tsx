import React, { useState } from 'react';
import { BoardConfig, Ladder, Snake, SpecialTileType } from '../types/game';
import { SPECIAL_TILE_DEFS, validateBoardConfig } from '../utils/boardPresets';
import { Plus, Trash2, CheckCircle2, AlertCircle, Sparkles, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';

interface BoardEditorProps {
  currentConfig: BoardConfig;
  onSave: (config: BoardConfig) => void;
  onClose: () => void;
  onTileClickFromBoard: (tileNum: number) => void;
  selectedTile: number | null;
}

export const BoardEditor: React.FC<BoardEditorProps> = ({
  currentConfig,
  onSave,
  onClose,
  selectedTile,
}) => {
  const [boardName, setBoardName] = useState(currentConfig.name);
  const [size, setSize] = useState<number>(currentConfig.size);
  const [snakes, setSnakes] = useState<Snake[]>([...currentConfig.snakes]);
  const [ladders, setLadders] = useState<Ladder[]>([...currentConfig.ladders]);
  const [specialTiles, setSpecialTiles] = useState<Record<number, SpecialTileType>>({
    ...currentConfig.specialTiles,
  });

  const [editorMode, setEditorMode] = useState<'add_snake' | 'add_ladder' | 'add_special' | 'delete'>('add_snake');
  const [pendingStartTile, setPendingStartTile] = useState<number | null>(null);
  const [selectedSpecialType, setSelectedSpecialType] = useState<SpecialTileType>('speed_boost');
  const [validationError, setValidationError] = useState<string | null>(null);

  // When board tile is clicked in editor mode
  const handleBoardTileSelected = (tileNum: number) => {
    sound.playClick();
    setValidationError(null);

    const maxTile = size * size;
    if (tileNum < 1 || tileNum > maxTile) return;

    if (editorMode === 'delete') {
      // Remove any snake/ladder/special on this tile
      setSnakes(snakes.filter((s) => s.head !== tileNum && s.tail !== tileNum));
      setLadders(ladders.filter((l) => l.bottom !== tileNum && l.top !== tileNum));
      const newSpec = { ...specialTiles };
      delete newSpec[tileNum];
      setSpecialTiles(newSpec);
      return;
    }

    if (editorMode === 'add_special') {
      const newSpec = { ...specialTiles };
      newSpec[tileNum] = selectedSpecialType;
      setSpecialTiles(newSpec);
      return;
    }

    if (editorMode === 'add_snake') {
      if (pendingStartTile === null) {
        if (tileNum === 1) {
          setValidationError("Snake head cannot be on Start tile (1)!");
          return;
        }
        if (tileNum === maxTile) {
          setValidationError("Snake head cannot be on Winning tile!");
          return;
        }
        setPendingStartTile(tileNum);
      } else {
        if (tileNum >= pendingStartTile) {
          setValidationError(`Snake tail must be lower than head (head: ${pendingStartTile}, selected tail: ${tileNum})`);
          setPendingStartTile(null);
          return;
        }
        const newSnake: Snake = {
          id: `snake_${Date.now()}`,
          head: pendingStartTile,
          tail: tileNum,
          name: `Custom Viper ${snakes.length + 1}`,
        };
        setSnakes([...snakes, newSnake]);
        setPendingStartTile(null);
      }
    }

    if (editorMode === 'add_ladder') {
      if (pendingStartTile === null) {
        if (tileNum === maxTile) {
          setValidationError("Ladder bottom cannot be on the finish tile!");
          return;
        }
        setPendingStartTile(tileNum);
      } else {
        if (tileNum <= pendingStartTile) {
          setValidationError(`Ladder top must be higher than bottom (bottom: ${pendingStartTile}, selected top: ${tileNum})`);
          setPendingStartTile(null);
          return;
        }
        const newLadder: Ladder = {
          id: `ladder_${Date.now()}`,
          bottom: pendingStartTile,
          top: tileNum,
          name: `Custom Ladder ${ladders.length + 1}`,
        };
        setLadders([...ladders, newLadder]);
        setPendingStartTile(null);
      }
    }
  };

  const handleSaveAndPlay = () => {
    const configToValidate: BoardConfig = {
      id: `custom_${Date.now()}`,
      name: boardName.trim() || 'My Custom Board',
      size,
      snakes,
      ladders,
      specialTiles,
    };

    const res = validateBoardConfig(configToValidate);
    if (!res.valid) {
      setValidationError(res.error || 'Invalid board configuration');
      return;
    }

    sound.playPowerup();
    onSave(configToValidate);
  };

  const clearAll = () => {
    sound.playClick();
    setSnakes([]);
    setLadders([]);
    setSpecialTiles({});
    setPendingStartTile(null);
    setValidationError(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-black tracking-wide">Board Creator & Editor</h2>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Basic Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Board Name</label>
          <input
            type="text"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            placeholder="e.g. Inferno Mountain"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Board Grid Size</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSize(10);
                sound.playClick();
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                size === 10
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
            >
              10x10 (100 Tiles)
            </button>
            <button
              onClick={() => {
                setSize(7);
                sound.playClick();
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                size === 7
                  ? 'bg-amber-500 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
              }`}
            >
              7x7 Blitz (49 Tiles)
            </button>
          </div>
        </div>
      </div>

      {/* Tool Selector */}
      <div className="flex flex-col gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Editor Tool</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => {
              setEditorMode('add_snake');
              setPendingStartTile(null);
              sound.playClick();
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              editorMode === 'add_snake'
                ? 'bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-900/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            🐍 Add Snake
          </button>

          <button
            onClick={() => {
              setEditorMode('add_ladder');
              setPendingStartTile(null);
              sound.playClick();
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              editorMode === 'add_ladder'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-900/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            🪜 Add Ladder
          </button>

          <button
            onClick={() => {
              setEditorMode('add_special');
              setPendingStartTile(null);
              sound.playClick();
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              editorMode === 'add_special'
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-900/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            ⚡ Special Tile
          </button>

          <button
            onClick={() => {
              setEditorMode('delete');
              setPendingStartTile(null);
              sound.playClick();
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              editorMode === 'delete'
                ? 'bg-amber-600 text-white border-amber-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" /> Eraser
          </button>
        </div>

        {/* Special Tile Type Picker */}
        {editorMode === 'add_special' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 mt-1">
            {(Object.keys(SPECIAL_TILE_DEFS) as SpecialTileType[]).map((type) => {
              const def = SPECIAL_TILE_DEFS[type];
              return (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedSpecialType(type);
                    sound.playClick();
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                    selectedSpecialType === type
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <span>{def.icon}</span>
                  <span>{def.title}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tool Instruction Prompt */}
        <div className="text-xs text-amber-300/90 font-medium bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-500/20">
          {editorMode === 'add_snake' && (
            <span>
              {pendingStartTile === null
                ? '👉 Click a tile on the board for the Snake HEAD (higher tile)'
                : `👉 Snake Head set at ${pendingStartTile}. Now click a lower tile for the TAIL`}
            </span>
          )}
          {editorMode === 'add_ladder' && (
            <span>
              {pendingStartTile === null
                ? '👉 Click a tile on the board for the Ladder BOTTOM (lower tile)'
                : `👉 Ladder Bottom set at ${pendingStartTile}. Now click a higher tile for the TOP`}
            </span>
          )}
          {editorMode === 'add_special' && (
            <span>👉 Click any board tile to place the selected special power tile</span>
          )}
          {editorMode === 'delete' && (
            <span>👉 Click any tile on the board to erase snakes, ladders, or power tiles on it</span>
          )}
        </div>
      </div>

      {/* Validation alert */}
      {validationError && (
        <div className="flex items-center gap-2 text-rose-300 text-xs bg-rose-950/60 p-2.5 rounded-lg border border-rose-800/80">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Board summary stats */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-3">
          <span>Snakes: <strong className="text-rose-400">{snakes.length}</strong></span>
          <span>Ladders: <strong className="text-emerald-400">{ladders.length}</strong></span>
          <span>Specials: <strong className="text-cyan-400">{Object.keys(specialTiles).length}</strong></span>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear All
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSaveAndPlay}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" /> Save & Play Custom Board
        </button>
      </div>
    </div>
  );
};
