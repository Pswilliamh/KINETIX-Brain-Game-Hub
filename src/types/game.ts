export type GameMode = 'arcade' | 'daily' | 'practice' | 'puzzle';

export type GameState =
  | 'TITLE_MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'ROUND_SUMMARY'
  | 'GAME_OVER'
  | 'MONUMENT_COMPLETE';

export interface BlockShape {
  id: string;
  name: string;
  cells: number[][]; // 1 for filled, 0 for empty
  colorIndex: number; // 1 to 4 corresponding to level palette colors
  cellLetters?: string[][]; // Optional letters on each cell for Scramble Words games
}

export interface TargetPattern {
  id: string;
  name: string;
  bonusPoints: number;
  bonusCredits: number;
  matrix: number[][]; // 3x3 matrix where 1 = required filled block, 0 = wildcard
}

export type PuzzleCategory =
  | 'Animals'
  | 'Cars & Rides'
  | 'Fruits & Treats'
  | 'Scramble Words'
  | 'Scramble Blocks'
  | 'Landmarks';

export interface TargetMonumentPuzzle {
  id: string;
  name: string;
  category: PuzzleCategory;
  emoji: string;
  location: string;
  difficultyLabel: string;
  bonusPoints: number;
  bonusCredits: number;
  description: string;
  // 8x8 matrix where 0 = empty sky, 1..4 = required structural block & color index
  blueprint: number[][];
  // 4 vibrant colors used for colorIndex 1..4 in this game
  colors: [string, string, string, string];
  // Optional 8x8 letter matrix for Scramble Words games
  letterGrid?: string[][];
}

export interface DifficultyPalette {
  level: number;
  tierName: string;
  bpm: number;
  bgCanvas: string;
  gridSurface: string;
  cellEmpty: string;
  borderHairline: string;
  accentPrimary: string;
  blockColors: string[]; // 4 distinct high-contrast block colors for this difficulty tier
}

export interface BlockSkin {
  id: string;
  name: string;
  subtitle: string;
  costCredits: number;
  unlockRequirementText: string;
  borderRadiusClass: string;
  innerStyle: 'matte' | 'hollow' | 'prism' | 'dot' | 'striated' | 'monolith';
}

export interface DigitalVaultItem {
  id: string;
  title: string;
  category: 'Strategy eBook' | 'Digital Guide' | 'Audio Pack' | 'Partner Portal';
  authorOrPartner: string;
  pagesOrFormat: string;
  unlockCostCredits: number;
  requiredPatternsToWinFree: number;
  coverImage?: string;
  externalPartnerUrl?: string;
  partnerSiteName?: string;
  description: string;
  downloadFilename: string;
  fullTextContent: string;
}

export interface PlayerProfileData {
  uid: string;
  displayName: string;
  credits: number;
  highScore: number;
  dailyHighScore: number;
  maxLevel: number;
  patternsCompleted: number;
  activeSkinId: string;
  unlockedSkins: string[];
  unlockedVaultItems: string[];
  dailyStreak: number;
  lastDailyClaimDate: string;
  drawTickets: number;
}

export const INITIAL_CREDITS = 100000;

export const DIFFICULTY_PALETTES: DifficultyPalette[] = [
  {
    level: 1,
    tierName: 'Cobalt Calm',
    bpm: 96,
    bgCanvas: '#0b0f17',
    gridSurface: '#131b2e',
    cellEmpty: '#1c263b',
    borderHairline: '#28354f',
    accentPrimary: '#38bdf8',
    blockColors: ['#38bdf8', '#818cf8', '#2dd4bf', '#60a5fa'],
  },
  {
    level: 2,
    tierName: 'Emerald Pulse',
    bpm: 108,
    bgCanvas: '#071412',
    gridSurface: '#0f2421',
    cellEmpty: '#16332f',
    borderHairline: '#214a44',
    accentPrimary: '#10b981',
    blockColors: ['#10b981', '#34d399', '#2dd4bf', '#a3e635'],
  },
  {
    level: 3,
    tierName: 'Amber Velocity',
    bpm: 120,
    bgCanvas: '#140f07',
    gridSurface: '#241a0d',
    cellEmpty: '#332514',
    borderHairline: '#4d381e',
    accentPrimary: '#f59e0b',
    blockColors: ['#f59e0b', '#fbbf24', '#fb923c', '#facc15'],
  },
  {
    level: 4,
    tierName: 'Crimson Overdrive',
    bpm: 132,
    bgCanvas: '#17090c',
    gridSurface: '#291016',
    cellEmpty: '#3b1720',
    borderHairline: '#57222f',
    accentPrimary: '#f43f5e',
    blockColors: ['#f43f5e', '#fb7185', '#e879f9', '#f97316'],
  },
  {
    level: 5,
    tierName: 'Solaris Zenith',
    bpm: 144,
    bgCanvas: '#0f0b17',
    gridSurface: '#1c152b',
    cellEmpty: '#291f3d',
    borderHairline: '#3f305e',
    accentPrimary: '#a855f7',
    blockColors: ['#a855f7', '#38bdf8', '#f43f5e', '#facc15'],
  },
];

export const LIGHT_DIFFICULTY_PALETTES: DifficultyPalette[] = [
  {
    level: 1,
    tierName: 'Cobalt Calm',
    bpm: 96,
    bgCanvas: '#f8fafc',
    gridSurface: '#ffffff',
    cellEmpty: '#e2e8f0',
    borderHairline: '#cbd5e1',
    accentPrimary: '#0284c7',
    blockColors: ['#0284c7', '#4f46e5', '#0d9488', '#2563eb'],
  },
  {
    level: 2,
    tierName: 'Emerald Pulse',
    bpm: 108,
    bgCanvas: '#f0fdf4',
    gridSurface: '#ffffff',
    cellEmpty: '#dcfce7',
    borderHairline: '#bbf7d0',
    accentPrimary: '#059669',
    blockColors: ['#059669', '#10b981', '#0d9488', '#65a30d'],
  },
  {
    level: 3,
    tierName: 'Amber Velocity',
    bpm: 120,
    bgCanvas: '#fffbeb',
    gridSurface: '#ffffff',
    cellEmpty: '#fef3c7',
    borderHairline: '#fde68a',
    accentPrimary: '#d97706',
    blockColors: ['#d97706', '#ea580c', '#ca8a04', '#f59e0b'],
  },
  {
    level: 4,
    tierName: 'Crimson Overdrive',
    bpm: 132,
    bgCanvas: '#fff1f2',
    gridSurface: '#ffffff',
    cellEmpty: '#ffe4e6',
    borderHairline: '#fecdd3',
    accentPrimary: '#e11d48',
    blockColors: ['#e11d48', '#db2777', '#9333ea', '#ea580c'],
  },
  {
    level: 5,
    tierName: 'Solaris Zenith',
    bpm: 144,
    bgCanvas: '#faf5ff',
    gridSurface: '#ffffff',
    cellEmpty: '#f3e8ff',
    borderHairline: '#e9d5ff',
    accentPrimary: '#7c3aed',
    blockColors: ['#7c3aed', '#0284c7', '#e11d48', '#d97706'],
  },
];

export function getPaletteForLevel(
  level: number,
  isLightMode: boolean = false
): DifficultyPalette {
  const source = isLightMode ? LIGHT_DIFFICULTY_PALETTES : DIFFICULTY_PALETTES;
  const index = Math.min(Math.max(level - 1, 0), source.length - 1);
  return {
    ...source[index],
    level,
    bpm: Math.min(96 + (level - 1) * 10, 168),
  };
}

export const BLOCK_SKINS: BlockSkin[] = [
  {
    id: 'swiss_matte',
    name: 'Swiss Matte',
    subtitle: 'Architectural flat blocks with crisp hairline bevel',
    costCredits: 0,
    unlockRequirementText: 'Default Starter Skin',
    borderRadiusClass: 'rounded-md',
    innerStyle: 'matte',
  },
  {
    id: 'bauhaus_frame',
    name: 'Bauhaus Frame',
    subtitle: 'High-contrast geometric hollow structural outline',
    costCredits: 25000,
    unlockRequirementText: '25,000 Credits or Level 2',
    borderRadiusClass: 'rounded-none',
    innerStyle: 'hollow',
  },
  {
    id: 'kinetic_dot',
    name: 'Kinetic Core',
    subtitle: 'Precision center node inside tactile tile',
    costCredits: 40000,
    unlockRequirementText: '40,000 Credits or 5 Patterns',
    borderRadiusClass: 'rounded-lg',
    innerStyle: 'dot',
  },
  {
    id: 'prism_bevel',
    name: 'Anodized Prism',
    subtitle: 'Double-layered directional inner chamber',
    costCredits: 60000,
    unlockRequirementText: '60,000 Credits or Level 4',
    borderRadiusClass: 'rounded-sm',
    innerStyle: 'prism',
  },
  {
    id: 'acoustic_striated',
    name: 'Acoustic Ribbed',
    subtitle: 'Rhythmic parallel grooves synced to pulse',
    costCredits: 85000,
    unlockRequirementText: '85,000 Credits or 12 Patterns',
    borderRadiusClass: 'rounded-md',
    innerStyle: 'striated',
  },
  {
    id: 'obsidian_monolith',
    name: 'Obsidian Monolith',
    subtitle: 'Ultra-minimal dark core with luminous rim',
    costCredits: 120000,
    unlockRequirementText: '120,000 Credits or Score 5,000+',
    borderRadiusClass: 'rounded-none',
    innerStyle: 'monolith',
  },
];

export const TARGET_PATTERNS: TargetPattern[] = [
  {
    id: 'core_cross',
    name: 'Harmonic Cross',
    bonusPoints: 450,
    bonusCredits: 12000,
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  {
    id: 'corner_frame',
    name: 'Four-Point Lock',
    bonusPoints: 400,
    bonusCredits: 10000,
    matrix: [
      [1, 0, 1],
      [0, 0, 0],
      [1, 0, 1],
    ],
  },
  {
    id: 'diagonal_cascade',
    name: 'Triad Diagonal',
    bonusPoints: 350,
    bonusCredits: 9000,
    matrix: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
  },
  {
    id: 'parallel_pillars',
    name: 'Twin Pillars',
    bonusPoints: 500,
    bonusCredits: 15000,
    matrix: [
      [1, 0, 1],
      [1, 0, 1],
      [1, 0, 1],
    ],
  },
  {
    id: 'chevron_crest',
    name: 'Apex Chevron',
    bonusPoints: 420,
    bonusCredits: 11000,
    matrix: [
      [0, 1, 0],
      [1, 0, 1],
      [1, 0, 1],
    ],
  },
  {
    id: 'monolith_block',
    name: 'Solid 2x2 Anchor',
    bonusPoints: 320,
    bonusCredits: 8000,
    matrix: [
      [1, 1, 0],
      [1, 1, 0],
      [0, 0, 0],
    ],
  },
];

function createLetterGridFromRows(rows: string[]): string[][] {
  return rows.map((rowStr) =>
    rowStr
      .padEnd(8, ' ')
      .slice(0, 8)
      .split('')
      .map((ch) => (ch === '.' || ch === ' ' ? '' : ch))
  );
}

export const MONUMENT_PUZZLES: TargetMonumentPuzzle[] = [
  // ===========================================================================
  // ANIMALS (6 FUN PICTURE GAMES)
  // ===========================================================================
  {
    id: 'golden_lion',
    name: 'Golden Lion',
    category: 'Animals',
    emoji: '🦁',
    location: 'Serengeti Safari',
    difficultyLabel: '36 Blocks · Animal',
    bonusPoints: 1600,
    bonusCredits: 26000,
    description: 'Assemble the king of beasts with a blazing amber mane, golden face, and bright safari eyes.',
    colors: ['#d97706', '#fbbf24', '#1e293b', '#f43f5e'],
    blueprint: [
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 2, 1, 1, 2, 1, 1],
      [1, 2, 2, 2, 2, 2, 2, 1],
      [1, 2, 3, 2, 2, 3, 2, 1],
      [1, 2, 2, 4, 4, 2, 2, 1],
      [0, 1, 2, 2, 2, 2, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 2, 0, 0, 2, 0, 0],
    ],
  },
  {
    id: 'ocean_dolphin',
    name: 'Ocean Dolphin',
    category: 'Animals',
    emoji: '🐬',
    location: 'Coral Reef Lagoon',
    difficultyLabel: '26 Blocks · Animal',
    bonusPoints: 1550,
    bonusCredits: 25000,
    description: 'Build the leaping turquoise dolphin cresting over sparkling ocean waves.',
    colors: ['#06b6d4', '#38bdf8', '#e0f2fe', '#0284c7'],
    blueprint: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 2, 2, 1, 0, 0],
      [0, 1, 2, 3, 2, 2, 1, 0],
      [0, 1, 2, 3, 3, 0, 0, 0],
      [0, 0, 1, 2, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 1, 0, 0],
      [4, 4, 4, 4, 4, 4, 4, 4],
    ],
  },
  {
    id: 'neon_butterfly',
    name: 'Neon Butterfly',
    category: 'Animals',
    emoji: '🦋',
    location: 'Tropical Canopy',
    difficultyLabel: '34 Blocks · Animal',
    bonusPoints: 1700,
    bonusCredits: 28000,
    description: 'Snap symmetric magenta, cyan, and gold butterfly wings into full bloom.',
    colors: ['#ec4899', '#38bdf8', '#fbbf24', '#a855f7'],
    blueprint: [
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 2, 1, 0, 0, 1, 2, 1],
      [1, 3, 2, 4, 4, 2, 3, 1],
      [0, 1, 1, 4, 4, 1, 1, 0],
      [0, 1, 2, 4, 4, 2, 1, 0],
      [1, 3, 1, 4, 4, 1, 3, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: 'bamboo_panda',
    name: 'Bamboo Panda',
    category: 'Animals',
    emoji: '🐼',
    location: 'Chengdu Forest',
    difficultyLabel: '34 Blocks · Animal',
    bonusPoints: 1650,
    bonusCredits: 27000,
    description: 'Construct the adorable giant panda with round ears, dark eye patches, and green bamboo.',
    colors: ['#334155', '#e2e8f0', '#10b981', '#f43f5e'],
    blueprint: [
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 1, 2, 2, 2, 2, 1, 0],
      [0, 2, 1, 2, 2, 1, 2, 0],
      [0, 2, 1, 2, 2, 1, 2, 0],
      [0, 2, 2, 1, 1, 2, 2, 0],
      [3, 0, 2, 2, 2, 2, 0, 3],
      [3, 0, 1, 2, 2, 1, 0, 3],
      [3, 0, 1, 0, 0, 1, 0, 3],
    ],
  },
  {
    id: 'happy_puppy',
    name: 'Happy Puppy',
    category: 'Animals',
    emoji: '🐶',
    location: 'Sunny Park',
    difficultyLabel: '32 Blocks · Animal',
    bonusPoints: 1500,
    bonusCredits: 25000,
    description: 'Assemble the playful golden retriever puppy with floppy ears and a bright red collar.',
    colors: ['#f59e0b', '#78350f', '#f43f5e', '#1e293b'],
    blueprint: [
      [0, 2, 2, 0, 0, 2, 2, 0],
      [2, 2, 1, 1, 1, 1, 2, 2],
      [2, 0, 1, 4, 4, 1, 0, 2],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 4, 4, 1, 0, 0],
      [0, 0, 3, 3, 3, 3, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 0, 0, 1, 0, 0],
    ],
  },
  {
    id: 'night_owl',
    name: 'Wise Night Owl',
    category: 'Animals',
    emoji: '🦉',
    location: 'Moonlit Oak',
    difficultyLabel: '32 Blocks · Animal',
    bonusPoints: 1600,
    bonusCredits: 26000,
    description: 'Build the nocturnal owl perched on an emerald branch with glowing golden eyes.',
    colors: ['#8b5cf6', '#fbbf24', '#c084fc', '#10b981'],
    blueprint: [
      [0, 1, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 1, 2, 1, 1, 2, 1, 0],
      [0, 1, 1, 2, 2, 1, 1, 0],
      [0, 1, 3, 3, 3, 3, 1, 0],
      [0, 1, 3, 3, 3, 3, 1, 0],
      [0, 0, 2, 0, 0, 2, 0, 0],
      [4, 4, 4, 4, 4, 4, 4, 4],
    ],
  },

  // ===========================================================================
  // CARS & RIDES (5 FUN VEHICLE GAMES)
  // ===========================================================================
  {
    id: 'turbo_race_car',
    name: 'Turbo Race Car',
    category: 'Cars & Rides',
    emoji: '🏎️',
    location: 'Grand Prix Circuit',
    difficultyLabel: '28 Blocks · Cars',
    bonusPoints: 1750,
    bonusCredits: 29000,
    description: 'Build the crimson Formula turbo racer with rear spoiler, cockpit visor, and slick tires.',
    colors: ['#ef4444', '#38bdf8', '#fbbf24', '#475569'],
    blueprint: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 2, 2, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 3, 0],
      [1, 1, 1, 1, 1, 1, 1, 3],
      [0, 4, 4, 0, 0, 4, 4, 0],
      [0, 4, 4, 0, 0, 4, 4, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: 'cyber_police_car',
    name: 'Cyber Police Cruiser',
    category: 'Cars & Rides',
    emoji: '🚓',
    location: 'Neo Metro Highway',
    difficultyLabel: '30 Blocks · Cars',
    bonusPoints: 1700,
    bonusCredits: 28000,
    description: 'Assemble the high-speed interceptor with red-and-blue roof sirens and armored wheels.',
    colors: ['#3b82f6', '#ef4444', '#e2e8f0', '#334155'],
    blueprint: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 2, 1, 0, 0, 0],
      [0, 0, 1, 3, 3, 1, 0, 0],
      [0, 1, 3, 3, 3, 3, 1, 0],
      [1, 1, 1, 3, 3, 1, 1, 1],
      [1, 4, 4, 1, 1, 4, 4, 1],
      [0, 4, 4, 0, 0, 4, 4, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: 'monster_truck',
    name: 'Mega Monster Truck',
    category: 'Cars & Rides',
    emoji: '🛻',
    location: 'Stadium Dirt Arena',
    difficultyLabel: '34 Blocks · Cars',
    bonusPoints: 1800,
    bonusCredits: 30000,
    description: 'Snap together the lifted emerald monster truck with giant off-road tires and flame stripes.',
    colors: ['#10b981', '#fbbf24', '#38bdf8', '#475569'],
    blueprint: [
      [0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 1, 3, 3, 1, 0, 0],
      [1, 1, 1, 1, 2, 2, 1, 1],
      [1, 2, 2, 1, 1, 1, 2, 1],
      [0, 0, 4, 0, 0, 4, 0, 0],
      [0, 4, 4, 4, 4, 4, 4, 0],
      [0, 4, 2, 4, 4, 2, 4, 0],
      [0, 4, 4, 4, 4, 4, 4, 0],
    ],
  },
  {
    id: 'super_rocket',
    name: 'Super Rocket Ship',
    category: 'Cars & Rides',
    emoji: '🚀',
    location: 'Orbital Launchpad',
    difficultyLabel: '30 Blocks · Ride',
    bonusPoints: 1850,
    bonusCredits: 31000,
    description: 'Launch the interplanetary rocket with nose cone, porthole window, booster fins, and thruster fire.',
    colors: ['#f43f5e', '#e2e8f0', '#38bdf8', '#fbbf24'],
    blueprint: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 2, 2, 1, 0, 0],
      [0, 0, 2, 3, 3, 2, 0, 0],
      [0, 0, 2, 2, 2, 2, 0, 0],
      [0, 1, 2, 2, 2, 2, 1, 0],
      [1, 1, 2, 2, 2, 2, 1, 1],
      [1, 0, 0, 4, 4, 0, 0, 1],
      [0, 0, 4, 4, 4, 4, 0, 0],
    ],
  },
  {
    id: 'sunset_sailboat',
    name: 'Sunset Sailboat',
    category: 'Cars & Rides',
    emoji: '⛵',
    location: 'Aegean Sea',
    difficultyLabel: '30 Blocks · Ride',
    bonusPoints: 1600,
    bonusCredits: 26000,
    description: 'Hoist the billowing white and golden sails above a mahogany hull and azure sea.',
    colors: ['#f8fafc', '#fbbf24', '#d97706', '#0ea5e9'],
    blueprint: [
      [0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 1, 2, 1, 0, 0, 0],
      [0, 1, 1, 2, 1, 1, 0, 0],
      [0, 1, 1, 2, 1, 1, 1, 0],
      [0, 0, 0, 2, 0, 0, 0, 0],
      [0, 3, 3, 3, 3, 3, 3, 0],
      [0, 0, 3, 3, 3, 3, 0, 0],
      [4, 4, 4, 4, 4, 4, 4, 4],
    ],
  },

  // ===========================================================================
  // FRUITS & FUN TREATS (5 JUICY GAMES)
  // ===========================================================================
  {
    id: 'sweet_strawberry',
    name: 'Sweet Strawberry',
    category: 'Fruits & Treats',
    emoji: '🍓',
    location: 'Summer Orchard',
    difficultyLabel: '30 Blocks · Fruit',
    bonusPoints: 1550,
    bonusCredits: 25000,
    description: 'Assemble the ruby-red strawberry crowned with emerald leaves and golden berry seeds.',
    colors: ['#10b981', '#f43f5e', '#fbbf24', '#fb7185'],
    blueprint: [
      [0, 0, 1, 0, 0, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 2, 2, 3, 2, 2, 2, 0],
      [0, 2, 3, 2, 2, 3, 2, 0],
      [0, 2, 2, 2, 3, 2, 2, 0],
      [0, 0, 2, 3, 2, 2, 0, 0],
      [0, 0, 0, 2, 2, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: 'juicy_watermelon',
    name: 'Juicy Watermelon',
    category: 'Fruits & Treats',
    emoji: '🍉',
    location: 'Beach Picnic',
    difficultyLabel: '32 Blocks · Fruit',
    bonusPoints: 1600,
    bonusCredits: 26000,
    description: 'Snap together the crisp green rind, sweet crimson melon slice, and dark seeds.',
    colors: ['#10b981', '#f43f5e', '#334155', '#86efac'],
    blueprint: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 2, 2, 2, 0, 0],
      [0, 2, 2, 3, 2, 3, 2, 0],
      [2, 2, 3, 2, 2, 2, 2, 2],
      [1, 2, 2, 2, 3, 2, 2, 1],
      [0, 1, 4, 4, 4, 4, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: 'golden_pineapple',
    name: 'Golden Pineapple',
    category: 'Fruits & Treats',
    emoji: '🍍',
    location: 'Aloha Island',
    difficultyLabel: '32 Blocks · Fruit',
    bonusPoints: 1650,
    bonusCredits: 27000,
    description: 'Build the tropical diamond-patterned pineapple with spiky emerald palm leaves.',
    colors: ['#10b981', '#fbbf24', '#d97706', '#34d399'],
    blueprint: [
      [0, 0, 1, 0, 0, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 2, 3, 2, 3, 0, 0],
      [0, 2, 3, 2, 3, 2, 3, 0],
      [0, 2, 2, 3, 2, 3, 2, 0],
      [0, 2, 3, 2, 3, 2, 3, 0],
      [0, 0, 2, 2, 2, 2, 0, 0],
    ],
  },
  {
    id: 'twin_cherries',
    name: 'Twin Arcade Cherries',
    category: 'Fruits & Treats',
    emoji: '🍒',
    location: 'Retro Bonus Stage',
    difficultyLabel: '26 Blocks · Fruit',
    bonusPoints: 1600,
    bonusCredits: 26000,
    description: 'Complete the classic arcade double cherries with connected green stems and shine highlights.',
    colors: ['#10b981', '#e11d48', '#fda4af', '#4ade80'],
    blueprint: [
      [0, 0, 0, 0, 1, 1, 4, 0],
      [0, 0, 0, 1, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0, 1, 0, 0],
      [1, 2, 2, 0, 2, 2, 2, 0],
      [2, 3, 2, 2, 2, 3, 2, 0],
      [2, 2, 2, 0, 2, 2, 2, 0],
      [0, 2, 0, 0, 0, 2, 0, 0],
    ],
  },
  {
    id: 'pizza_slice',
    name: 'Pepperoni Pizza Slice',
    category: 'Fruits & Treats',
    emoji: '🍕',
    location: 'Napoli Pizzeria',
    difficultyLabel: '30 Blocks · Treat',
    bonusPoints: 1700,
    bonusCredits: 28000,
    description: 'Assemble the golden crust, melted mozzarella triangle, and sizzling pepperoni rounds.',
    colors: ['#d97706', '#facc15', '#e11d48', '#10b981'],
    blueprint: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 2, 2, 2, 2, 1, 0],
      [0, 2, 3, 2, 2, 3, 2, 0],
      [0, 0, 2, 2, 4, 2, 0, 0],
      [0, 0, 2, 3, 2, 2, 0, 0],
      [0, 0, 0, 2, 2, 0, 0, 0],
      [0, 0, 0, 2, 2, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },

  // ===========================================================================
  // SCRAMBLE WORDS (5 INTERACTIVE LETTER-BLOCK WORD GAMES!)
  // ===========================================================================
  {
    id: 'scramble_word_arcade',
    name: 'Word Scramble: PLAY & WIN',
    category: 'Scramble Words',
    emoji: '🔤',
    location: 'Letter Block Arena',
    difficultyLabel: '22 Letters · Word Game',
    bonusPoints: 1900,
    bonusCredits: 32000,
    description: 'Unscramble and place the letter blocks on the 8x8 board to spell KINETIX, PLAY, GAME, and WIN!',
    colors: ['#38bdf8', '#a855f7', '#10b981', '#f59e0b'],
    blueprint: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 2, 2, 2, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 3, 3, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 4, 4, 4, 0, 0, 0],
    ],
    letterGrid: createLetterGridFromRows([
      '........',
      'KINETIX.',
      '........',
      '.PLAY...',
      '........',
      '..GAME..',
      '........',
      '..WIN...',
    ]),
  },
  {
    id: 'scramble_word_animals',
    name: 'Word Scramble: ANIMALS',
    category: 'Scramble Words',
    emoji: '🐾',
    location: 'Safari Word Grid',
    difficultyLabel: '20 Letters · Word Game',
    bonusPoints: 1850,
    bonusCredits: 30000,
    description: 'Place the scrambled letter blocks to spell LION, BEAR, WOLF, and DUCK across the board!',
    colors: ['#f59e0b', '#10b981', '#38bdf8', '#ec4899'],
    blueprint: [
      [0, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 2, 2, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 3, 3, 3, 3, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 4, 4, 4, 4, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    letterGrid: createLetterGridFromRows([
      '.LION...',
      '........',
      '..BEAR..',
      '........',
      '.WOLF...',
      '........',
      '..DUCK..',
      '........',
    ]),
  },
  {
    id: 'scramble_word_cars',
    name: 'Word Scramble: SUPER CARS',
    category: 'Scramble Words',
    emoji: '🏁',
    location: 'Speedway Word Grid',
    difficultyLabel: '20 Letters · Word Game',
    bonusPoints: 1900,
    bonusCredits: 31000,
    description: 'Unscramble the racing letter blocks to spell TURBO, SPEED, DRIFT, and FAST!',
    colors: ['#ef4444', '#fbbf24', '#38bdf8', '#a855f7'],
    blueprint: [
      [0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 2, 2, 2, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 3, 3, 3, 3, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 4, 4, 4, 4, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    letterGrid: createLetterGridFromRows([
      '.TURBO..',
      '........',
      '.SPEED..',
      '........',
      '.DRIFT..',
      '........',
      '..FAST..',
      '........',
    ]),
  },
  {
    id: 'scramble_word_fruits',
    name: 'Word Scramble: FRUITS',
    category: 'Scramble Words',
    emoji: '🍎',
    location: 'Orchard Word Grid',
    difficultyLabel: '20 Letters · Word Game',
    bonusPoints: 1850,
    bonusCredits: 30000,
    description: 'Snap the scrambled fruit letter blocks into place to spell APPLE, MANGO, BERRY, and PEACH!',
    colors: ['#f43f5e', '#fbbf24', '#ec4899', '#fb923c'],
    blueprint: [
      [0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 2, 2, 2, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 3, 3, 3, 3, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 4, 4, 4, 4, 4, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    letterGrid: createLetterGridFromRows([
      '.APPLE..',
      '........',
      '.MANGO..',
      '........',
      '.BERRY..',
      '........',
      '.PEACH..',
      '........',
    ]),
  },
  {
    id: 'scramble_word_jackpot',
    name: 'Word Scramble: JACKPOT PRIZE',
    category: 'Scramble Words',
    emoji: '💎',
    location: 'VIP Winner Grid',
    difficultyLabel: '20 Letters · Word Game',
    bonusPoints: 2100,
    bonusCredits: 36000,
    description: 'Unscramble the championship letter tiles to spell PRIZE, LUCKY, BONUS, and CHAMP!',
    colors: ['#10b981', '#fbbf24', '#38bdf8', '#a855f7'],
    blueprint: [
      [0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 2, 2, 2, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 3, 3, 3, 3, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 4, 4, 4, 4, 4, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    letterGrid: createLetterGridFromRows([
      '.PRIZE..',
      '........',
      '.LUCKY..',
      '........',
      '.BONUS..',
      '........',
      '.CHAMP..',
      '........',
    ]),
  },

  // ===========================================================================
  // SCRAMBLE BLOCKS & FUN ARCADE ICONS (4 GAMES)
  // ===========================================================================
  {
    id: 'scramble_rainbow_cube',
    name: 'Scramble Blocks: Color Cube',
    category: 'Scramble Blocks',
    emoji: '🎲',
    location: '4-Quadrant Color Matrix',
    difficultyLabel: '36 Blocks · Scramble',
    bonusPoints: 1800,
    bonusCredits: 30000,
    description: 'Unscramble the 4 color quadrants by snapping matching cyan, gold, rose, and emerald blocks into their zones!',
    colors: ['#38bdf8', '#fbbf24', '#f43f5e', '#10b981'],
    blueprint: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 2, 2, 2, 0],
      [0, 1, 1, 1, 2, 2, 2, 0],
      [0, 1, 1, 1, 2, 2, 2, 0],
      [0, 3, 3, 3, 4, 4, 4, 0],
      [0, 3, 3, 3, 4, 4, 4, 0],
      [0, 3, 3, 3, 4, 4, 4, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: 'scramble_tetris_fortress',
    name: 'Scramble Blocks: Arcade Fortress',
    category: 'Scramble Blocks',
    emoji: '🧱',
    location: 'Pixel Citadel',
    difficultyLabel: '36 Blocks · Scramble',
    bonusPoints: 1850,
    bonusCredits: 31000,
    description: 'Interlock scrambled L-blocks, T-blocks, and 2x2 squares to raise the symmetric arcade fortress!',
    colors: ['#a855f7', '#38bdf8', '#f43f5e', '#fbbf24'],
    blueprint: [
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 4, 4, 0, 1, 1],
      [2, 2, 2, 4, 4, 2, 2, 2],
      [0, 2, 3, 3, 3, 3, 2, 0],
      [0, 2, 3, 0, 0, 3, 2, 0],
      [1, 1, 3, 0, 0, 3, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },
  {
    id: 'electric_guitar',
    name: 'Rock Star Electric Guitar',
    category: 'Scramble Blocks',
    emoji: '🎸',
    location: 'Main Stage Arena',
    difficultyLabel: '28 Blocks · Fun Picture',
    bonusPoints: 1750,
    bonusCredits: 29000,
    description: 'Assemble the V-wing electric guitar body, golden pickups, fretboard neck, and headstock!',
    colors: ['#f43f5e', '#fbbf24', '#e2e8f0', '#38bdf8'],
    blueprint: [
      [0, 0, 0, 0, 0, 2, 2, 0],
      [0, 0, 0, 0, 2, 3, 0, 0],
      [0, 0, 0, 0, 3, 0, 0, 0],
      [0, 0, 1, 3, 1, 0, 0, 0],
      [0, 1, 1, 2, 1, 1, 0, 0],
      [1, 1, 2, 2, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 0, 0, 0],
      [0, 1, 0, 0, 1, 0, 0, 0],
    ],
  },
  {
    id: 'royal_diamond_crown',
    name: 'Royal Diamond Crown',
    category: 'Scramble Blocks',
    emoji: '👑',
    location: 'Grand Treasure Vault',
    difficultyLabel: '32 Blocks · Fun Picture',
    bonusPoints: 2000,
    bonusCredits: 35000,
    description: 'Forge the 24-karat golden crown studded with ruby, sapphire, and emerald jewels!',
    colors: ['#fbbf24', '#f43f5e', '#38bdf8', '#10b981'],
    blueprint: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 1, 1, 0, 0, 1],
      [1, 1, 0, 1, 1, 0, 1, 1],
      [1, 2, 1, 1, 1, 1, 2, 1],
      [1, 1, 3, 1, 1, 3, 1, 1],
      [1, 4, 1, 2, 2, 1, 4, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
  },

  // ===========================================================================
  // ICONIC WORLD LANDMARKS (5 ORIGINAL GAMES)
  // ===========================================================================
  {
    id: 'nyc_skyline',
    name: 'NYC Skyline',
    category: 'Landmarks',
    emoji: '🗽',
    location: 'Manhattan, New York',
    difficultyLabel: '34 Blocks · Landmark',
    bonusPoints: 1500,
    bonusCredits: 25000,
    description:
      'Assemble the Empire State Building lightning spire, the Chrysler Tower crown, and illuminated Midtown skyscrapers across the Manhattan waterfront.',
    colors: ['#38bdf8', '#fbbf24', '#818cf8', '#2dd4bf'],
    blueprint: [
      [0, 0, 2, 0, 0, 0, 0, 0],
      [0, 0, 1, 0, 0, 2, 0, 0],
      [0, 1, 1, 1, 0, 3, 0, 0],
      [0, 1, 2, 1, 0, 3, 3, 0],
      [4, 1, 1, 1, 0, 3, 2, 0],
      [4, 4, 1, 1, 3, 3, 3, 1],
      [4, 2, 1, 2, 3, 2, 3, 1],
      [4, 4, 1, 1, 3, 3, 3, 1],
    ],
  },
  {
    id: 'eiffel_tower',
    name: 'Eiffel Tower',
    category: 'Landmarks',
    emoji: '🗼',
    location: 'Champ de Mars, Paris',
    difficultyLabel: '28 Blocks · Landmark',
    bonusPoints: 1650,
    bonusCredits: 28000,
    description:
      'Construct Gustave Eiffel’s 1889 iron lattice landmark: four wide foundation piers, the sweeping grand arch, two observation decks, and the glowing Paris pinnacle.',
    colors: ['#f59e0b', '#fbbf24', '#fb923c', '#38bdf8'],
    blueprint: [
      [0, 0, 0, 2, 2, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 2, 2, 2, 2, 0, 0],
      [0, 0, 1, 3, 3, 1, 0, 0],
      [0, 2, 2, 2, 2, 2, 2, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 1, 1],
    ],
  },
  {
    id: 'golden_gate',
    name: 'Golden Gate Bridge',
    category: 'Landmarks',
    emoji: '🌉',
    location: 'San Francisco, California',
    difficultyLabel: '32 Blocks · Landmark',
    bonusPoints: 1750,
    bonusCredits: 30000,
    description:
      'Build the twin International Orange suspension towers, sweeping catenary cables, the 8-block main roadway span, and the Pacific bay water below.',
    colors: ['#f43f5e', '#fb7185', '#fbbf24', '#38bdf8'],
    blueprint: [
      [0, 1, 0, 0, 0, 0, 1, 0],
      [0, 1, 3, 0, 0, 3, 1, 0],
      [3, 1, 0, 3, 3, 0, 1, 3],
      [0, 1, 0, 0, 0, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 2, 2, 2, 2, 1, 0],
      [0, 1, 0, 0, 0, 0, 1, 0],
      [4, 4, 4, 4, 4, 4, 4, 4],
    ],
  },
  {
    id: 'statue_of_liberty',
    name: 'Statue of Liberty',
    category: 'Landmarks',
    emoji: '🗽',
    location: 'Liberty Island, New York',
    difficultyLabel: '30 Blocks · Landmark',
    bonusPoints: 1800,
    bonusCredits: 32000,
    description:
      'Assemble Lady Liberty’s raised golden torch flame, seven-spired oxidized copper crown, and harbor pedestal.',
    colors: ['#10b981', '#34d399', '#fbbf24', '#2dd4bf'],
    blueprint: [
      [0, 3, 0, 0, 1, 0, 0, 0],
      [3, 3, 3, 1, 0, 1, 0, 0],
      [0, 2, 0, 0, 1, 0, 1, 0],
      [0, 1, 0, 1, 1, 1, 0, 0],
      [0, 1, 0, 2, 3, 2, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 2, 2, 1, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
    ],
  },
  {
    id: 'tokyo_pagoda',
    name: 'Tokyo Pagoda',
    category: 'Landmarks',
    emoji: '🏯',
    location: 'Asakusa, Tokyo',
    difficultyLabel: '32 Blocks · Landmark',
    bonusPoints: 2000,
    bonusCredits: 35000,
    description:
      'Place the tiered vermilion temple eaves, central timber core, lantern balconies, and golden Sorin spire.',
    colors: ['#f43f5e', '#fbbf24', '#a855f7', '#38bdf8'],
    blueprint: [
      [0, 0, 0, 2, 2, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 3, 3, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 3, 2, 2, 3, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 3, 2, 2, 3, 0, 0],
      [0, 2, 2, 2, 2, 2, 2, 0],
    ],
  },
];

export const BASE_SHAPES: Omit<BlockShape, 'id' | 'colorIndex'>[] = [
  { name: 'Single Dot', cells: [[1]] },
  { name: 'Duo Bar H', cells: [[1, 1]] },
  { name: 'Duo Bar V', cells: [[1], [1]] },
  { name: 'Trio Beam H', cells: [[1, 1, 1]] },
  { name: 'Trio Beam V', cells: [[1], [1], [1]] },
  {
    name: 'Corner L',
    cells: [
      [1, 0],
      [1, 1],
    ],
  },
  {
    name: 'Corner J',
    cells: [
      [0, 1],
      [1, 1],
    ],
  },
  {
    name: 'Square 2x2',
    cells: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    name: 'T-Node',
    cells: [
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
  {
    name: 'Diagonal Step',
    cells: [
      [1, 0],
      [0, 1],
    ],
  },
  {
    name: 'Plus Micro',
    cells: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
  },
];

export const DIGITAL_VAULT_ITEMS: DigitalVaultItem[] = [
  {
    id: 'kinetix_mastery_ebook',
    title: 'KINETIX Mastery: Geometric Puzzle Strategy Guide',
    category: 'Strategy eBook',
    authorOrPartner: 'Alexa Vance · Swiss Arcade Press',
    pagesOrFormat: 'Full Interactive Edition + Printable Guide (.TXT / .MD)',
    unlockCostCredits: 35000,
    requiredPatternsToWinFree: 2,
    coverImage: '/src/assets/images/reward_arcade_guide_cover_1795149414420.jpg',
    externalPartnerUrl: 'https://standardebooks.org',
    partnerSiteName: 'Standard eBooks Public Domain Library',
    description:
      'Complete spatial parity breakdown, 3x3 pattern recognition heuristics, and high-tempo combo chaining for competitive leaderboard play.',
    downloadFilename: 'KINETIX_Mastery_Geometric_Strategy_Guide.txt',
    fullTextContent: `====================================================================
KINETIX MASTERY: GEOMETRIC PUZZLE STRATEGY GUIDE
By Alexa Vance — Returning Player Exclusive Digital Edition
====================================================================

CHAPTER 1: THE LAW OF CENTER PARITY
In an 8x8 minimalist grid, every piece placement alters both row/column
line density and 3x3 Target Pattern potential. Amateur players rush to clear
single lines immediately; grandmasters preserve the central 4x4 core to
trigger Target Patterns (such as the Harmonic Cross or Twin Pillars) which
yield 350 to 500 bonus points AND +15,000 Credits in a single move.

CHAPTER 2: DYNAMIC RHYTHM SYNCHRONIZATION
As your score crosses every 600-point threshold, the game shifts palette
tiers and raises the Web Audio synthesizer tempo from 96 BPM (Cobalt Calm)
up to 144+ BPM (Solaris Zenith). Use the rhythmic pulse as a pacing metronome:
place two structural blocks on the downbeat and complete the pattern or line
clear on the fourth bar for maximum multiplier retention.

CHAPTER 3: TRAY ROTATION & CORNER ANCHORING
Always keep at least one 3x3 corner zone open for Square 2x2 or Plus Micro
blocks. When rotating pieces with the Rotate button or [R] key, visualize
where the negative space (0-cells) lands relative to your active Target Pattern.

CHAPTER 4: EARNING MONTHLY $50 GIVEAWAY TICKETS
Every completed pattern and daily challenge run increases your credit bank
and unlocks additional entries into the monthly $50 prize pool.
====================================================================`,
  },
  {
    id: 'sonic_synthesis_manual',
    title: 'Sonic Synthesis: Architectures of Rhythm & Pulse',
    category: 'Digital Guide',
    authorOrPartner: 'Dr. Julian K. · Minimal Audio Lab',
    pagesOrFormat: 'Complete Technical Handbook (.TXT)',
    unlockCostCredits: 45000,
    requiredPatternsToWinFree: 4,
    coverImage: '/src/assets/images/reward_synth_ebook_cover_1795149414761.jpg',
    externalPartnerUrl: 'https://archive.org/details/texts',
    partnerSiteName: 'Internet Archive Open Digital Texts',
    description:
      'Deep-dive guide into pentatonic procedural audio generation, Web Audio API polyphony, and tactile haptic synchronization in modern arcade design.',
    downloadFilename: 'Sonic_Synthesis_Architectures_of_Rhythm.txt',
    fullTextContent: `====================================================================
SONIC SYNTHESIS: ARCHITECTURES OF RHYTHM & PULSE
A Manual of Electronic Sound, Beat Creation & Tactile Feedback
====================================================================

1. PENTATONIC HARMONIC SCALING
Why do minimalist rhythm puzzle games feel hypnotic rather than fatiguing?
By tuning every block snap to an A-Minor / C-Major pentatonic frequency table
(220Hz, 261.63Hz, 293.66Hz, 329.63Hz, 392.00Hz, 440Hz, 523.25Hz), every rapid
chain of placements composes a consonant melody in real time.

2. HAPTIC ENVELOPE PAIRING
A tactile click feels sharpest when paired with a 12ms hardware vibration
pulse (navigator.vibrate(12)) and a triangle-wave oscillator with an
exponential decay of 95ms. Pattern completions combine a three-step upward
arpeggio with a [30, 40, 70]ms multi-burst haptic envelope.

3. LEVEL INTENSITY MODULATION
Each difficulty tier shifts both visual wavelength and filter cutoff frequency,
opening the low-pass filter from 900Hz at Level 1 to 3800Hz at Level 5+.
====================================================================`,
  },
  {
    id: 'spatial_speedrun_workbook',
    title: 'The 100,000 Credit High-Score Speedrun Workbook',
    category: 'Digital Guide',
    authorOrPartner: 'KINETIX Competitive League',
    pagesOrFormat: 'Pro Tournament Cheat Sheet + Seed Atlas',
    unlockCostCredits: 25000,
    requiredPatternsToWinFree: 1,
    externalPartnerUrl: 'https://www.gutenberg.org',
    partnerSiteName: 'Project Gutenberg Free eBooks',
    description:
      'Step-by-step daily seed routing guide, combo multiplier math tables, and instant downloadable checklist for top-10 leaderboard finishes.',
    downloadFilename: 'KINETIX_Speedrun_Workbook_2026.txt',
    fullTextContent: `====================================================================
THE 100,000 CREDIT HIGH-SCORE SPEEDRUN WORKBOOK
Official Competitive Reference Sheet
====================================================================

SCORING MATHEMATICS:
- Single Cell Placed: +15 pts × Current Level
- Full Row or Column Cleared: +180 pts × Line Count² × Combo Multiplier
- 3x3 Target Pattern Completed: +320 to +500 pts + Instant Credit Bonus!
- Simultaneous Line Clear + Pattern Match: 2.5X HYPER PULSE BONUS

DAILY CHALLENGE SEED ROUTING:
In Daily Challenge mode, the pseudo-random generator uses today's UTC date
seed. Every player globally receives the exact same sequence of blocks and
target patterns—making it a pure test of spatial skill!
====================================================================`,
  },
];
