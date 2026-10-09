export type SharkThemeId =
  | 'great-white'
  | 'hammerhead'
  | 'megalodon'
  | 'cyber-shark'
  | 'pirate-shark'
  | 'classic-snake';

export type SharkLayoutPresetId =
  | 'reef-patrol'
  | 'shark-frenzy'
  | 'treasure-dive'
  | 'megalodon-gauntlet';

export interface SharkThemeConfig {
  id: SharkThemeId;
  name: string;
  speciesTitle: string;
  icon: string;
  tagline: string;
  description: string;
  
  // Board styling
  boardOuterBorder: string;
  boardOuterBg: string;
  boardInnerGridBg: string;
  
  // Tile styling
  tileEvenBg: string;
  tileOddBg: string;
  tileBorder: string;
  tileNumberColor: string;
  
  // Start & Finish
  startBg: string;
  startText: string;
  startBadge: string;
  finishBg: string;
  finishText: string;
  finishBadge: string;
  
  // SVG gradients and colors
  svgDefsId: {
    sharkBodyGrad: string;
    sharkUnderbellyGrad: string;
    sharkDorsalGrad: string;
    ladderRailGrad: string;
    ladderRungColor: string;
  };
  
  // Naming terminology
  hazardName: string; // 'Shark' | 'Snake'
  hazardEmoji: string;
  ladderName: string; // 'Diver Ladder' | 'Bamboo Kelp' | 'Laser Conduit'
  ladderEmoji: string;
  
  // Particle & water ambience
  ambientBadge: string;
  ambientTextColor: string;
}

export const SHARK_THEMES: Record<SharkThemeId, SharkThemeConfig> = {
  'great-white': {
    id: 'great-white',
    name: 'Great White Abyss',
    speciesTitle: 'Carcharodon Carcharias (Apex Predator)',
    icon: '🦈',
    tagline: 'Deep Ocean Trench & Stealth Jaws',
    description: 'Venture into the pitch-black oceanic abyss. Hydrodynamic Great Whites stalk the open waters while submarine diving ladders offer salvation.',
    boardOuterBorder: 'border-cyan-500/60 shadow-[0_0_35px_rgba(6,182,212,0.25)]',
    boardOuterBg: 'bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950',
    boardInnerGridBg: 'bg-slate-950/90',
    tileEvenBg: 'bg-gradient-to-br from-cyan-950/60 to-slate-900/90',
    tileOddBg: 'bg-gradient-to-br from-slate-900/90 to-blue-950/70',
    tileBorder: 'border-cyan-900/40 hover:border-cyan-500/50',
    tileNumberColor: 'text-cyan-200/90',
    startBg: 'bg-gradient-to-br from-cyan-700 to-blue-900 text-white border-cyan-400',
    startText: 'SURFACE DOCK',
    startBadge: '🤿 START',
    finishBg: 'bg-gradient-to-br from-cyan-400 via-sky-300 to-blue-500 text-slate-950 border-cyan-200',
    finishText: 'ABYSS APEX',
    finishBadge: '🔱 GOAL',
    svgDefsId: {
      sharkBodyGrad: 'gwSharkBody',
      sharkUnderbellyGrad: 'gwSharkBelly',
      sharkDorsalGrad: 'gwSharkFin',
      ladderRailGrad: 'gwLadderRail',
      ladderRungColor: '#bae6fd',
    },
    hazardName: 'Great White',
    hazardEmoji: '🦈',
    ladderName: 'Diver Ladder',
    ladderEmoji: '🪜',
    ambientBadge: '🌊 Deep Ocean Currents',
    ambientTextColor: 'text-cyan-400',
  },

  'hammerhead': {
    id: 'hammerhead',
    name: 'Hammerhead Reef',
    speciesTitle: 'Sphyrna Mokarran (Reef Hunter)',
    icon: '🔨',
    tagline: 'Tropical Turquoise Lagoon & Coral Spalls',
    description: 'Warm tropical reef waters bustling with exotic marine life. Hammerhead predators roam the outer atoll as bamboo kelp ladders climb towards safety.',
    boardOuterBorder: 'border-emerald-500/60 shadow-[0_0_35px_rgba(16,185,129,0.25)]',
    boardOuterBg: 'bg-gradient-to-b from-emerald-950 via-teal-950 to-slate-950',
    boardInnerGridBg: 'bg-teal-950/80',
    tileEvenBg: 'bg-gradient-to-br from-teal-950/70 to-emerald-900/40',
    tileOddBg: 'bg-gradient-to-br from-slate-900/90 to-teal-900/50',
    tileBorder: 'border-teal-800/40 hover:border-emerald-400/50',
    tileNumberColor: 'text-emerald-200/90',
    startBg: 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white border-emerald-300',
    startText: 'CORAL HARBOR',
    startBadge: '🏝️ START',
    finishBg: 'bg-gradient-to-br from-emerald-300 via-teal-200 to-cyan-400 text-slate-950 border-emerald-100',
    finishText: 'REEF CITADEL',
    finishBadge: '👑 GOAL',
    svgDefsId: {
      sharkBodyGrad: 'hhSharkBody',
      sharkUnderbellyGrad: 'hhSharkBelly',
      sharkDorsalGrad: 'hhSharkFin',
      ladderRailGrad: 'hhLadderRail',
      ladderRungColor: '#a7f3d0',
    },
    hazardName: 'Hammerhead',
    hazardEmoji: '🔨',
    ladderName: 'Kelp Bamboo',
    ladderEmoji: '🎋',
    ambientBadge: '🪸 Tropical Coral Reef',
    ambientTextColor: 'text-emerald-400',
  },

  'megalodon': {
    id: 'megalodon',
    name: 'Megalodon Magma Trench',
    speciesTitle: 'Otodus Megalodon (Primeval Leviathan)',
    icon: '🌋',
    tagline: 'Volcanic Deep Seafloor & Magma Geysers',
    description: 'Submerged volcanic fissures where prehistoric behemoths reign supreme. Fiery Megalodons strike from molten crevices while obsidian chain ladders hoist brave divers.',
    boardOuterBorder: 'border-rose-600/70 shadow-[0_0_40px_rgba(225,29,72,0.35)]',
    boardOuterBg: 'bg-gradient-to-b from-stone-950 via-stone-900 to-rose-950',
    boardInnerGridBg: 'bg-stone-950/95',
    tileEvenBg: 'bg-gradient-to-br from-rose-950/60 to-stone-900/90',
    tileOddBg: 'bg-gradient-to-br from-stone-900/90 to-amber-950/50',
    tileBorder: 'border-rose-900/50 hover:border-orange-500/60',
    tileNumberColor: 'text-orange-200/90',
    startBg: 'bg-gradient-to-br from-orange-700 to-rose-900 text-white border-orange-400',
    startText: 'MAGMA CRUST',
    startBadge: '🔥 START',
    finishBg: 'bg-gradient-to-br from-amber-400 via-orange-400 to-rose-600 text-stone-950 border-amber-200',
    finishText: 'LEVIATHAN CROWN',
    finishBadge: '🌋 GOAL',
    svgDefsId: {
      sharkBodyGrad: 'mgSharkBody',
      sharkUnderbellyGrad: 'mgSharkBelly',
      sharkDorsalGrad: 'mgSharkFin',
      ladderRailGrad: 'mgLadderRail',
      ladderRungColor: '#fed7aa',
    },
    hazardName: 'Megalodon',
    hazardEmoji: '🌋',
    ladderName: 'Obsidian Chains',
    ladderEmoji: '⛓️',
    ambientBadge: '🔥 Primeval Magma Trench',
    ambientTextColor: 'text-orange-400',
  },

  'cyber-shark': {
    id: 'cyber-shark',
    name: 'Cyber Mecha-Shark',
    speciesTitle: 'Unit-07 Cyber-Carcharias (Synthwave)',
    icon: '⚡',
    tagline: 'Neon Cyberpunk Grid & Titanium Chompers',
    description: 'A neon-drenched sci-fi aquatic cyberspace. Mecha-Sharks with pulsing cyber circuits and plasma thrusters patrol the high-tech digital conduit matrix.',
    boardOuterBorder: 'border-fuchsia-500/70 shadow-[0_0_40px_rgba(217,70,239,0.3)]',
    boardOuterBg: 'bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950',
    boardInnerGridBg: 'bg-slate-950/95',
    tileEvenBg: 'bg-gradient-to-br from-purple-950/70 to-slate-900/90',
    tileOddBg: 'bg-gradient-to-br from-slate-900/90 to-cyan-950/60',
    tileBorder: 'border-fuchsia-800/40 hover:border-cyan-400/60',
    tileNumberColor: 'text-fuchsia-200/90',
    startBg: 'bg-gradient-to-br from-fuchsia-600 to-purple-900 text-white border-fuchsia-300',
    startText: 'CYBER DOCK 01',
    startBadge: '⚡ START',
    finishBg: 'bg-gradient-to-br from-cyan-300 via-fuchsia-400 to-violet-500 text-slate-950 border-cyan-200',
    finishText: 'CORE MATRIX',
    finishBadge: '💎 GOAL',
    svgDefsId: {
      sharkBodyGrad: 'cySharkBody',
      sharkUnderbellyGrad: 'cySharkBelly',
      sharkDorsalGrad: 'cySharkFin',
      ladderRailGrad: 'cyLadderRail',
      ladderRungColor: '#e0e7ff',
    },
    hazardName: 'Mecha-Shark',
    hazardEmoji: '⚡',
    ladderName: 'Laser Conduit',
    ladderEmoji: '🚀',
    ambientBadge: '🌐 Neon Cyber Grid',
    ambientTextColor: 'text-fuchsia-400',
  },

  'pirate-shark': {
    id: 'pirate-shark',
    name: 'Pirate Shark Cove',
    speciesTitle: 'Captain Blood-Fin (Sunken Galleon)',
    icon: '🏴‍☠️',
    tagline: 'Shipwreck Timbers & Dubloon Plunder',
    description: 'Sunken pirate brigantines and treasure coves. Swashbuckling pirate sharks sporting tricorn hats and scars guard sunken doubloons behind ship rigging nets.',
    boardOuterBorder: 'border-amber-600/70 shadow-[0_0_35px_rgba(217,119,6,0.25)]',
    boardOuterBg: 'bg-gradient-to-b from-stone-950 via-stone-900 to-amber-950',
    boardInnerGridBg: 'bg-stone-950/90',
    tileEvenBg: 'bg-gradient-to-br from-amber-950/60 to-stone-900/90',
    tileOddBg: 'bg-gradient-to-br from-stone-900/90 to-yellow-950/50',
    tileBorder: 'border-amber-800/40 hover:border-amber-400/50',
    tileNumberColor: 'text-amber-200/90',
    startBg: 'bg-gradient-to-br from-amber-700 to-stone-800 text-white border-amber-400',
    startText: 'PIRATE DOCK',
    startBadge: '⚓ START',
    finishBg: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 text-stone-950 border-yellow-100',
    finishText: 'TREASURE VAULT',
    finishBadge: '💰 GOAL',
    svgDefsId: {
      sharkBodyGrad: 'piSharkBody',
      sharkUnderbellyGrad: 'piSharkBelly',
      sharkDorsalGrad: 'piSharkFin',
      ladderRailGrad: 'piLadderRail',
      ladderRungColor: '#fef08a',
    },
    hazardName: 'Pirate Shark',
    hazardEmoji: '🏴‍☠️',
    ladderName: 'Ship Rigging',
    ladderEmoji: '🪜',
    ambientBadge: '⚓ Sunken Pirate Cove',
    ambientTextColor: 'text-amber-400',
  },

  'classic-snake': {
    id: 'classic-snake',
    name: 'Classic Serpent',
    speciesTitle: 'Retro Serpents & Golden Ladders',
    icon: '🐍',
    tagline: 'Heritage Board Game Arena',
    description: 'The beloved traditional board game look with slithering serpents and polished golden ladders on a midnight slate arena.',
    boardOuterBorder: 'border-slate-700/80 shadow-[0_0_30px_rgba(100,116,139,0.2)]',
    boardOuterBg: 'bg-slate-900',
    boardInnerGridBg: 'bg-slate-950/90',
    tileEvenBg: 'bg-slate-800/85 text-amber-50',
    tileOddBg: 'bg-slate-850 text-amber-100',
    tileBorder: 'border-slate-800/70 hover:border-slate-600',
    tileNumberColor: 'text-slate-300',
    startBg: 'bg-gradient-to-br from-emerald-700 to-teal-800 text-white border-emerald-400',
    startText: 'START',
    startBadge: '🏁 START',
    finishBg: 'bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 text-slate-950 border-amber-300',
    finishText: 'VICTORY',
    finishBadge: '🏆 GOAL',
    svgDefsId: {
      sharkBodyGrad: 'clSnakeBody',
      sharkUnderbellyGrad: 'clSnakeBelly',
      sharkDorsalGrad: 'clSnakeFin',
      ladderRailGrad: 'clLadderRail',
      ladderRungColor: '#fef9c3',
    },
    hazardName: 'Snake',
    hazardEmoji: '🐍',
    ladderName: 'Golden Ladder',
    ladderEmoji: '🪜',
    ambientBadge: '🎲 Classic Arena',
    ambientTextColor: 'text-slate-400',
  },
};

export const SHARK_THEMES_LIST: SharkThemeConfig[] = Object.values(SHARK_THEMES);
