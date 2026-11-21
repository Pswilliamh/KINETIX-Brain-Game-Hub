export type GameMode = 'arcade' | 'daily' | 'practice' | 'puzzle';

export type AppLanguage = 'bilingual' | 'id' | 'en';

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
  nameId?: string;
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

export interface WordTranslationPair {
  en: string;
  id: string;
  row: number;
  startCol: number;
  endCol: number;
  colorIndex: number;
}

export interface TargetMonumentPuzzle {
  id: string;
  name: string;
  nameId: string;
  category: PuzzleCategory;
  categoryId: string;
  emoji: string;
  location: string;
  difficultyLabel: string;
  bonusPoints: number;
  bonusCredits: number;
  brainSkillEn: string;
  brainSkillId: string;
  description: string;
  descriptionId: string;
  howItWorksEn: string;
  howItWorksId: string;
  // 8x8 matrix where 0 = empty sky, 1..4 = required structural block & color index
  blueprint: number[][];
  // 4 vibrant colors used for colorIndex 1..4 in this game
  colors: [string, string, string, string];
  // Optional 8x8 letter matrix for Scramble Words & Sentences games
  letterGrid?: string[][];
  // Full English sentence and Indonesian meaning for Sentence & Word Tile Shuffling games
  sentenceEn?: string;
  sentenceId?: string;
  wordTranslations?: WordTranslationPair[];
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
    tierName: 'LearnLink Navy & Turquoise',
    bpm: 96,
    bgCanvas: '#071731',
    gridSurface: '#0D244B',
    cellEmpty: '#133163',
    borderHairline: '#1E447D',
    accentPrimary: '#14B8C4',
    blockColors: ['#14B8C4', '#2DD4BF', '#38BDF8', '#FFFFFF'],
  },
  {
    level: 2,
    tierName: 'Deep Ocean Pulse',
    bpm: 108,
    bgCanvas: '#061A36',
    gridSurface: '#0C2852',
    cellEmpty: '#13376B',
    borderHairline: '#1E4D8C',
    accentPrimary: '#2DD4BF',
    blockColors: ['#2DD4BF', '#14B8C4', '#0EA5E9', '#E0F7FA'],
  },
  {
    level: 3,
    tierName: 'Azure Velocity',
    bpm: 120,
    bgCanvas: '#081B3A',
    gridSurface: '#102B59',
    cellEmpty: '#173B75',
    borderHairline: '#235299',
    accentPrimary: '#06B6D4',
    blockColors: ['#06B6D4', '#22D3EE', '#38BDF8', '#2DD4BF'],
  },
  {
    level: 4,
    tierName: 'Turquoise Drive',
    bpm: 132,
    bgCanvas: '#061D36',
    gridSurface: '#0B2C52',
    cellEmpty: '#123D6E',
    borderHairline: '#1C5694',
    accentPrimary: '#14B8C4',
    blockColors: ['#14B8C4', '#38BDF8', '#2DD4BF', '#67E8F9'],
  },
  {
    level: 5,
    tierName: 'Royal Navy Zenith',
    bpm: 144,
    bgCanvas: '#071731',
    gridSurface: '#0E2652',
    cellEmpty: '#153670',
    borderHairline: '#225096',
    accentPrimary: '#2DD4BF',
    blockColors: ['#2DD4BF', '#14B8C4', '#60A5FA', '#FFFFFF'],
  },
];

export const LIGHT_DIFFICULTY_PALETTES: DifficultyPalette[] = [
  {
    level: 1,
    tierName: 'LearnLink Navy & Turquoise',
    bpm: 96,
    bgCanvas: '#EEF8FB',
    gridSurface: '#FFFFFF',
    cellEmpty: '#E4F3F7',
    borderHairline: '#C5E4EC',
    accentPrimary: '#14B8C4',
    blockColors: ['#0B2249', '#14B8C4', '#0891B2', '#1D4ED8'],
  },
  {
    level: 2,
    tierName: 'Lagoon Pulse',
    bpm: 108,
    bgCanvas: '#ECFAFA',
    gridSurface: '#FFFFFF',
    cellEmpty: '#DFF4F5',
    borderHairline: '#BCE4E8',
    accentPrimary: '#0D949E',
    blockColors: ['#0D949E', '#0B2249', '#14B8C4', '#0284C7'],
  },
  {
    level: 3,
    tierName: 'Azure Clarity',
    bpm: 120,
    bgCanvas: '#F0F9FC',
    gridSurface: '#FFFFFF',
    cellEmpty: '#E1F2F8',
    borderHairline: '#C2E2EE',
    accentPrimary: '#0891B2',
    blockColors: ['#0891B2', '#12336B', '#14B8C4', '#0369A1'],
  },
  {
    level: 4,
    tierName: 'Turquoise Crest',
    bpm: 132,
    bgCanvas: '#ECF9FA',
    gridSurface: '#FFFFFF',
    cellEmpty: '#DCF2F5',
    borderHairline: '#B8E0E8',
    accentPrimary: '#14B8C4',
    blockColors: ['#14B8C4', '#0B2249', '#0E7490', '#2563EB'],
  },
  {
    level: 5,
    tierName: 'Royal Navy Zenith',
    bpm: 144,
    bgCanvas: '#EEF7FB',
    gridSurface: '#FFFFFF',
    cellEmpty: '#E2F1F8',
    borderHairline: '#BFDDEC',
    accentPrimary: '#0B2249',
    blockColors: ['#0B2249', '#14B8C4', '#0284C7', '#0D9488'],
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
    nameId: 'Salib Harmoni',
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
    nameId: 'Kunci Empat Sudut',
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
    nameId: 'Garis Miring Tiga',
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
    nameId: 'Pilar Kembar',
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
    nameId: 'Panah Puncak',
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
    nameId: 'Kotak Padat 2x2',
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
  // ANIMALS / HEWAN (6 FUN PICTURE GAMES)
  // ===========================================================================
  {
    id: 'golden_lion',
    name: 'Golden Lion',
    nameId: 'Singa Emas Pemberani',
    category: 'Animals',
    categoryId: 'Hewan',
    emoji: '🦁',
    location: 'Serengeti Safari',
    difficultyLabel: '36 Blocks · Animal',
    bonusPoints: 1600,
    bonusCredits: 26000,
    brainSkillEn: 'Bilateral Symmetry & Visual Focus',
    brainSkillId: 'Simetri Kiri-Kanan & Fokus Visual',
    description:
      'Assemble the king of beasts with a blazing amber mane, golden face, and bright safari eyes.',
    descriptionId:
      'Susun gambar Raja Hutan dengan surai keemasan, wajah gagah, dan mata yang bersinar.',
    howItWorksEn:
      'Tap "Guide" to see the Lion outline, or build from memory! Start by placing the brown mane around the edges, then fill the yellow face and dark eyes in the center.',
    howItWorksId:
      'Ketuk tombol "Guide/Panduan" untuk melihat garis Singa! Mulailah memasang balok cokelat untuk surai di pinggir, lalu isi wajah kuning dan mata di bagian tengah.',
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
    nameId: 'Lumba-Lumba Laut',
    category: 'Animals',
    categoryId: 'Hewan',
    emoji: '🐬',
    location: 'Coral Reef Lagoon',
    difficultyLabel: '26 Blocks · Animal',
    bonusPoints: 1550,
    bonusCredits: 25000,
    brainSkillEn: 'Curved Shape Recognition & Spatial Flow',
    brainSkillId: 'Pengenalan Bentuk Lengkung & Ruang',
    description:
      'Build the leaping turquoise dolphin cresting over sparkling ocean waves.',
    descriptionId:
      'Bangun gambar lumba-lumba biru yang melompat gembira di atas ombak laut.',
    howItWorksEn:
      'Place the dark blue ocean wave across the bottom row first, then stack the light-blue body blocks curving upward toward the top fin.',
    howItWorksId:
      'Pasang baris ombak biru tua di paling bawah terlebih dahulu, lalu susun balok tubuh lumba-lumba biru muda melengkung ke atas.',
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
    nameId: 'Kupu-Kupu Pelangi',
    category: 'Animals',
    categoryId: 'Hewan',
    emoji: '🦋',
    location: 'Tropical Canopy',
    difficultyLabel: '34 Blocks · Animal',
    bonusPoints: 1700,
    bonusCredits: 28000,
    brainSkillEn: 'Mirror-Image Thinking & Pattern Balance',
    brainSkillId: 'Logika Cermin & Keseimbangan Pola',
    description:
      'Snap symmetric magenta, cyan, and gold butterfly wings into full bloom.',
    descriptionId:
      'Susun sayap kupu-kupu berwarna merah muda, biru, dan emas yang indah dan seimbang.',
    howItWorksEn:
      'Notice how the left wing and right wing are mirror images! Whatever block you place on the left wing, mirror it on the right wing around the purple center body.',
    howItWorksId:
      'Perhatikan sayap kiri dan kanan saling bercermin! Setiap balok yang dipasang di sayap kiri, pasang juga di sayap kanan mengapit badan ungu di tengah.',
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
    nameId: 'Panda Hutan Bambu',
    category: 'Animals',
    categoryId: 'Hewan',
    emoji: '🐼',
    location: 'Chengdu Forest',
    difficultyLabel: '34 Blocks · Animal',
    bonusPoints: 1650,
    bonusCredits: 27000,
    brainSkillEn: 'Contrast Recognition & Detail Memory',
    brainSkillId: 'Pengenalan Kontras & Memori Detail',
    description:
      'Construct the adorable giant panda with round ears, dark eye patches, and green bamboo.',
    descriptionId:
      'Susun panda lucu dengan telinga bulat, lingkar mata hitam, dan batang bambu hijau.',
    howItWorksEn:
      'Build the green vertical bamboo stalks on the left and right edges, then assemble the white panda face and dark ears in the middle columns.',
    howItWorksId:
      'Susun batang bambu hijau di kolom paling kiri dan kanan, lalu rangkai wajah panda putih beserta telinga hitamnya di bagian tengah.',
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
    nameId: 'Anak Anjing Ceria',
    category: 'Animals',
    categoryId: 'Hewan',
    emoji: '🐶',
    location: 'Sunny Park',
    difficultyLabel: '32 Blocks · Animal',
    bonusPoints: 1500,
    bonusCredits: 25000,
    brainSkillEn: 'Part-to-Whole Assembly & Patience',
    brainSkillId: 'Menyusun Bagian ke Utuh & Kesabaran',
    description:
      'Assemble the playful golden retriever puppy with floppy ears and a bright red collar.',
    descriptionId:
      'Susun anak anjing emas yang ramah lengkap dengan telinga panjang dan kalung merah.',
    howItWorksEn:
      'Place the brown floppy ears at the top corners, build the golden face in the middle, and snap the red horizontal collar bar across Row 6.',
    howItWorksId:
      'Pasang telinga cokelat di sudut atas, susun wajah emas di tengah, lalu pasang kalung merah mendatar pada Baris ke-6.',
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
    nameId: 'Burung Hantu Bijak',
    category: 'Animals',
    categoryId: 'Hewan',
    emoji: '🦉',
    location: 'Moonlit Oak',
    difficultyLabel: '32 Blocks · Animal',
    bonusPoints: 1600,
    bonusCredits: 26000,
    brainSkillEn: 'Vertical Layering & Concentration',
    brainSkillId: 'Penyusunan Bertingkat & Konsentrasi',
    description:
      'Build the nocturnal owl perched on an emerald branch with glowing golden eyes.',
    descriptionId:
      'Bangun burung hantu malam yang bertengger di dahan hijau dengan mata emas.',
    howItWorksEn:
      'Start from the green tree branch on the bottom row, add the golden claws, then build the purple owl feathers and bright yellow eyes upward.',
    howItWorksId:
      'Mulailah dari dahan pohon hijau di baris paling bawah, tambahkan cakar kuning, lalu susun bulu ungu dan mata kuning hingga ke puncak kepala.',
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
  // CARS & RIDES / MOBIL & KENDARAAN (5 FUN VEHICLE GAMES)
  // ===========================================================================
  {
    id: 'turbo_race_car',
    name: 'Turbo Race Car',
    nameId: 'Mobil Balap Turbo',
    category: 'Cars & Rides',
    categoryId: 'Mobil & Kendaraan',
    emoji: '🏎️',
    location: 'Grand Prix Circuit',
    difficultyLabel: '28 Blocks · Cars',
    bonusPoints: 1750,
    bonusCredits: 29000,
    brainSkillEn: 'Horizontal Engineering & Shape Rotation',
    brainSkillId: 'Konstruksi Mendatar & Rotasi Bentuk',
    description:
      'Build the crimson Formula turbo racer with rear spoiler, cockpit visor, and slick tires.',
    descriptionId:
      'Rakit mobil balap Formula merah lengkap dengan sayap belakang, kaca helm, dan roda balap.',
    howItWorksEn:
      'Place the two 2x2 gray wheels at the bottom first, then lay the long red chassis beams across the center and add the blue cockpit visor on top.',
    howItWorksId:
      'Pasang dua roda kotak 2x2 abu-abu di bawah terlebih dahulu, lalu rentangkan bodi mobil merah di tengah dan pasang kaca biru di atasnya.',
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
    nameId: 'Mobil Polisi Patroli',
    category: 'Cars & Rides',
    categoryId: 'Mobil & Kendaraan',
    emoji: '🚓',
    location: 'Neo Metro Highway',
    difficultyLabel: '30 Blocks · Cars',
    bonusPoints: 1700,
    bonusCredits: 28000,
    brainSkillEn: 'Structural Grouping & Color Matching',
    brainSkillId: 'Pengelompokan Struktur & Pencocokan Warna',
    description:
      'Assemble the high-speed interceptor with red-and-blue roof sirens and armored wheels.',
    descriptionId:
      'Rakit mobil patroli polisi dengan lampu sirine merah-biru di atap dan roda kokoh.',
    howItWorksEn:
      'Snap the dark tires in Rows 6–7, build the blue-and-white doors in the middle, and crown the roof with the red and blue siren lights.',
    howItWorksId:
      'Pasang roda hitam di Baris 6–7, bangun pintu mobil biru-putih di tengah, dan letakkan lampu sirine merah-biru di puncak atap.',
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
    nameId: 'Truk Monster Raksasa',
    category: 'Cars & Rides',
    categoryId: 'Mobil & Kendaraan',
    emoji: '🛻',
    location: 'Stadium Dirt Arena',
    difficultyLabel: '34 Blocks · Cars',
    bonusPoints: 1800,
    bonusCredits: 30000,
    brainSkillEn: 'Foundation Planning & Multi-Block Fit',
    brainSkillId: 'Perencanaan Pondasi & Penempatan Balok',
    description:
      'Snap together the lifted emerald monster truck with giant off-road tires and flame stripes.',
    descriptionId:
      'Susun truk monster hijau raksasa dengan roda besar dan garis kuning menyala.',
    howItWorksEn:
      'Build the two huge 3x3 gray off-road tires on the bottom half of the board, then construct the green truck cab and blue windshield on top.',
    howItWorksId:
      'Bangun dua roda besar ukuran 3x3 di bagian bawah papan terlebih dahulu, lalu susun kabin truk hijau dan kaca biru di atasnya.',
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
    nameId: 'Roket Luar Angkasa',
    category: 'Cars & Rides',
    categoryId: 'Mobil & Kendaraan',
    emoji: '🚀',
    location: 'Orbital Launchpad',
    difficultyLabel: '30 Blocks · Ride',
    bonusPoints: 1850,
    bonusCredits: 31000,
    brainSkillEn: 'Vertical Alignment & Sequencing',
    brainSkillId: 'Kesejajaran Tegak & Urutan Langkah',
    description:
      'Launch the interplanetary rocket with nose cone, porthole window, booster fins, and thruster fire.',
    descriptionId:
      'Luncurkan roket antariksa dengan ujung merah, jendela kaca, sayap pendorong, dan api roket.',
    howItWorksEn:
      'Assemble the central white rocket tube in Columns 3–6, attach the red side fins, and ignite the yellow thruster flames at the bottom!',
    howItWorksId:
      'Susun tabung roket putih di Kolom 3–6, pasang sayap merah di samping kiri-kanan, dan nyalakan api kuning di bagian bawah!',
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
    nameId: 'Perahu Layar Samudra',
    category: 'Cars & Rides',
    categoryId: 'Mobil & Kendaraan',
    emoji: '⛵',
    location: 'Aegean Sea',
    difficultyLabel: '30 Blocks · Ride',
    bonusPoints: 1600,
    bonusCredits: 26000,
    brainSkillEn: 'Triangle Geometry & Spatial Balance',
    brainSkillId: 'Geometri Segitiga & Keseimbangan',
    description:
      'Hoist the billowing white and golden sails above a mahogany hull and azure sea.',
    descriptionId:
      'Kembangkan layar putih dan tiang emas di atas perahu kayu cokelat dan laut biru.',
    howItWorksEn:
      'Fill the blue water across Row 8, place the brown boat hull above the water, then raise the golden mast and white triangular sails.',
    howItWorksId:
      'Isi air laut biru di Baris ke-8, pasang badan perahu cokelat di atas air, lalu tegakkan tiang kuning dan layar putih berbentuk segitiga.',
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
  // FRUITS & FUN TREATS / BUAH & MAKANAN (5 JUICY GAMES)
  // ===========================================================================
  {
    id: 'sweet_strawberry',
    name: 'Sweet Strawberry',
    nameId: 'Stroberi Merah Manis',
    category: 'Fruits & Treats',
    categoryId: 'Buah & Makanan',
    emoji: '🍓',
    location: 'Summer Orchard',
    difficultyLabel: '30 Blocks · Fruit',
    bonusPoints: 1550,
    bonusCredits: 25000,
    brainSkillEn: 'Tapered Shape Logic & Fine Motor Control',
    brainSkillId: 'Logika Bentuk Meruncing & Motorik Halus',
    description:
      'Assemble the ruby-red strawberry crowned with emerald leaves and golden berry seeds.',
    descriptionId:
      'Susun buah stroberi merah segar lengkap dengan mahkota daun hijau dan biji keemasan.',
    howItWorksEn:
      'Place the green leaf crown at the top (Rows 1–2), then build the red berry heart tapering down to a narrow point at Row 7.',
    howItWorksId:
      'Pasang mahkota daun hijau di bagian atas (Baris 1–2), lalu susun buah stroberi merah yang mengecil hingga ke ujung bawah di Baris ke-7.',
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
    nameId: 'Semangka Segar',
    category: 'Fruits & Treats',
    categoryId: 'Buah & Makanan',
    emoji: '🍉',
    location: 'Beach Picnic',
    difficultyLabel: '32 Blocks · Fruit',
    bonusPoints: 1600,
    bonusCredits: 26000,
    brainSkillEn: 'Curved Arc Construction & Layering',
    brainSkillId: 'Menyusun Lengkungan & Lapisan Warna',
    description:
      'Snap together the crisp green rind, sweet crimson melon slice, and dark seeds.',
    descriptionId:
      'Susun potongan buah semangka merah manis dengan kulit hijau segar dan biji hitam.',
    howItWorksEn:
      'Build the curved green rind along the bottom arc first, then fill the bright red fruit wedges above it.',
    howItWorksId:
      'Susun kulit semangka hijau melengkung di bagian bawah terlebih dahulu, kemudian isi daging buah merah segar di atasnya.',
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
    nameId: 'Nanas Emas Tropis',
    category: 'Fruits & Treats',
    categoryId: 'Buah & Makanan',
    emoji: '🍍',
    location: 'Aloha Island',
    difficultyLabel: '32 Blocks · Fruit',
    bonusPoints: 1650,
    bonusCredits: 27000,
    brainSkillEn: 'Alternating Checkerboard Patterning',
    brainSkillId: 'Pola Selang-Seling & Ketelitian',
    description:
      'Build the tropical diamond-patterned pineapple with spiky emerald palm leaves.',
    descriptionId:
      'Bangun buah nanas tropis bermotif berlian kuning-oranye dengan daun hijau di pucuknya.',
    howItWorksEn:
      'Assemble the green spiky crown in Rows 1–3, then complete the oval golden pineapple body below.',
    howItWorksId:
      'Susun daun hijau nanas di Baris 1–3, lalu lengkapi badan buah nanas kuning keemasan di bagian bawahnya.',
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
    nameId: 'Buah Ceri Kembar',
    category: 'Fruits & Treats',
    categoryId: 'Buah & Makanan',
    emoji: '🍒',
    location: 'Retro Bonus Stage',
    difficultyLabel: '26 Blocks · Fruit',
    bonusPoints: 1600,
    bonusCredits: 26000,
    brainSkillEn: 'Diagonal Path Tracing & Pairing',
    brainSkillId: 'Jalur Diagonal & Pasangan Bentuk',
    description:
      'Complete the classic arcade double cherries with connected green stems and shine highlights.',
    descriptionId:
      'Lengkapi sepasang buah ceri merah manis yang terhubung oleh tangkai daun hijau.',
    howItWorksEn:
      'Build the two round red cherries in the lower half first, then trace the diagonal green stems up to the top-right leaf!',
    howItWorksId:
      'Susun dua buah ceri bulat merah di bagian bawah dulu, lalu hubungkan tangkai hijau miring ke daun di kanan atas!',
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
    nameId: 'Potongan Pizza Keju',
    category: 'Fruits & Treats',
    categoryId: 'Buah & Makanan',
    emoji: '🍕',
    location: 'Napoli Pizzeria',
    difficultyLabel: '30 Blocks · Treat',
    bonusPoints: 1700,
    bonusCredits: 28000,
    brainSkillEn: 'Inverted Triangle Spatial Reasoning',
    brainSkillId: 'Penalaran Ruang Segitiga Terbalik',
    description:
      'Assemble the golden crust, melted mozzarella triangle, and sizzling pepperoni rounds.',
    descriptionId:
      'Susun pinggiran roti pizza, keju kuning berbentuk segitiga, dan topping pepperoni merah.',
    howItWorksEn:
      'Place the 8-block golden crust across the very top row (Row 1), then build the yellow cheese triangle narrowing down toward the bottom tip.',
    howItWorksId:
      'Pasang 8 balok pinggiran roti cokelat di baris paling atas (Baris 1), lalu susun segitiga keju kuning meruncing ke ujung bawah.',
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
  // SCRAMBLE SENTENCES & WORDS / SUSUN KALIMAT & KATA BAHASA INGGRIS (12 GAMES!)
  // Every letter is on its own square on the 8x8 board. All letter squares are
  // shuffled so children can swap/move squares around to respell the entire
  // English sentence or word and learn both English spelling and comprehension!
  // ===========================================================================
  {
    id: 'sentence_find_airport',
    name: 'Sentence: Can You Help Me Find The Airport?',
    nameId: 'Kalimat: Bisakah Bantu Saya Cari Bandara?',
    category: 'Scramble Words',
    categoryId: 'Susun Kata & Kalimat',
    emoji: '✈️',
    location: 'English Travel Sentence #1',
    difficultyLabel: '26 Letters · 7 Words',
    bonusPoints: 2400,
    bonusCredits: 40000,
    sentenceEn: 'CAN YOU HELP ME FIND THE AIRPORT',
    sentenceId: 'Bisakah kamu membantu saya menemukan bandara?',
    brainSkillEn: 'English Sentence Structure, Spelling & Travel Conversation',
    brainSkillId: 'Menyusun Kalimat Bahasa Inggris, Ejaan & Percakapan Perjalanan',
    description:
      'Every letter is on its own square! Tap and swap the shuffled letter squares on the 8x8 board to respell the full sentence: "CAN YOU HELP ME FIND THE AIRPORT" (Bisakah kamu membantu saya menemukan bandara?).',
    descriptionId:
      'Setiap huruf berada di kotaknya sendiri! Ketuk dua kotak huruf yang teracak untuk menukar posisinya hingga tersusun kalimat lengkap: "CAN YOU HELP ME FIND THE AIRPORT" (Bisakah kamu membantu saya menemukan bandara?).',
    howItWorksEn:
      '1) Tap any scrambled letter square on the 8x8 board, then tap another square to swap them! 2) Or tap "Fix 1 Letter" for a hint, or "🔊 Speak" to hear the English sentence aloud. Row 1: CAN YOU · Row 3: HELP ME · Row 5: FIND THE · Row 7: AIRPORT.',
    howItWorksId:
      '1) Ketuk kotak huruf yang belum tepat di papan 8x8, lalu ketuk kotak huruf lain untuk menukarnya! 2) Atau ketuk "Bantu 1 Huruf" untuk petunjuk, atau "🔊 Suara" untuk mendengar pengucapan Bahasa Inggrisnya. Baris 1: CAN YOU · Baris 3: HELP ME · Baris 5: FIND THE · Baris 7: AIRPORT.',
    colors: ['#38bdf8', '#10b981', '#f59e0b', '#a855f7'],
    wordTranslations: [
      { en: 'CAN', id: 'Bisakah', row: 0, startCol: 0, endCol: 2, colorIndex: 1 },
      { en: 'YOU', id: 'Kamu', row: 0, startCol: 4, endCol: 6, colorIndex: 2 },
      { en: 'HELP', id: 'Membantu', row: 2, startCol: 0, endCol: 3, colorIndex: 3 },
      { en: 'ME', id: 'Saya', row: 2, startCol: 5, endCol: 6, colorIndex: 4 },
      { en: 'FIND', id: 'Menemukan', row: 4, startCol: 0, endCol: 3, colorIndex: 1 },
      { en: 'THE', id: 'Itu / Sang', row: 4, startCol: 5, endCol: 7, colorIndex: 2 },
      { en: 'AIRPORT', id: 'Bandara', row: 6, startCol: 0, endCol: 6, colorIndex: 3 },
    ],
    blueprint: [
      [1, 1, 1, 0, 2, 2, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 3, 3, 0, 4, 4, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 0, 2, 2, 2],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 3, 3, 3, 3, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    letterGrid: createLetterGridFromRows([
      'CAN.YOU.',
      '........',
      'HELP.ME.',
      '........',
      'FIND.THE',
      '........',
      'AIRPORT.',
      '........',
    ]),
  },
  {
    id: 'sentence_call_taxi',
    name: 'Sentence: Please Help Me Call A Taxi',
    nameId: 'Kalimat: Tolong Bantu Saya Panggil Taksi',
    category: 'Scramble Words',
    categoryId: 'Susun Kata & Kalimat',
    emoji: '🚕',
    location: 'English Travel Sentence #2',
    difficultyLabel: '21 Letters · 6 Words',
    bonusPoints: 2350,
    bonusCredits: 39000,
    sentenceEn: 'PLEASE HELP ME CALL A TAXI',
    sentenceId: 'Tolong bantu saya memanggil taksi.',
    brainSkillEn: 'Polite English Requests & Practical Spelling',
    brainSkillId: 'Kalimat Permintaan Sopan Bahasa Inggris & Ejaan Praktis',
    description:
      'Unscramble the letter squares on the board to spell the polite everyday sentence: "PLEASE HELP ME CALL A TAXI" (Tolong bantu saya memanggil taksi)!',
    descriptionId:
      'Susun dan tukar kotak-kotak huruf di papan untuk mengeja kalimat sopan sehari-hari: "PLEASE HELP ME CALL A TAXI" (Tolong bantu saya memanggil taksi)!',
    howItWorksEn:
      'Swap any two letter squares on the 8x8 board until every word is green! Row 1: PLEASE · Row 3: HELP ME · Row 5: CALL A · Row 7: TAXI.',
    howItWorksId:
      'Tukar dua kotak huruf di papan 8x8 sampai semua huruf berwarna hijau! Baris 1: PLEASE (Tolong) · Baris 3: HELP ME (Bantu Saya) · Baris 5: CALL A (Panggil Sebuah) · Baris 7: TAXI (Taksi).',
    colors: ['#f59e0b', '#38bdf8', '#10b981', '#ec4899'],
    wordTranslations: [
      { en: 'PLEASE', id: 'Tolong', row: 0, startCol: 1, endCol: 6, colorIndex: 1 },
      { en: 'HELP', id: 'Bantu', row: 2, startCol: 0, endCol: 3, colorIndex: 2 },
      { en: 'ME', id: 'Saya', row: 2, startCol: 5, endCol: 6, colorIndex: 3 },
      { en: 'CALL', id: 'Panggil / Telepon', row: 4, startCol: 0, endCol: 3, colorIndex: 4 },
      { en: 'A', id: 'Sebuah', row: 4, startCol: 5, endCol: 5, colorIndex: 1 },
      { en: 'TAXI', id: 'Taksi', row: 6, startCol: 2, endCol: 5, colorIndex: 3 },
    ],
    blueprint: [
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [2, 2, 2, 2, 0, 3, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [4, 4, 4, 4, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 3, 3, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    letterGrid: createLetterGridFromRows([
      '.PLEASE.',
      '........',
      'HELP.ME.',
      '........',
      'CALL.A..',
      '........',
      '..TAXI..',
      '........',
    ]),
  },
  {
    id: 'sentence_learn_english',
    name: 'Sentence: I Love To Read And Learn English',
    nameId: 'Kalimat: Saya Suka Membaca Dan Belajar Bahasa Inggris',
    category: 'Scramble Words',
    categoryId: 'Susun Kata & Kalimat',
    emoji: '📚',
    location: 'English Classroom Sentence #3',
    difficultyLabel: '26 Letters · 7 Words',
    bonusPoints: 2400,
    bonusCredits: 40000,
    sentenceEn: 'I LOVE TO READ AND LEARN ENGLISH',
    sentenceId: 'Saya suka membaca dan belajar Bahasa Inggris.',
    brainSkillEn: 'Positive Learning Habits & English Verb Phrases',
    brainSkillId: 'Semangat Belajar & Ungkapan Kata Kerja Bahasa Inggris',
    description:
      'Shuffle and swap the letter tiles to spell: "I LOVE TO READ AND LEARN ENGLISH" (Saya suka membaca dan belajar Bahasa Inggris)!',
    descriptionId:
      'Tukar kotak huruf yang teracak untuk menyusun kalimat semangat belajar: "I LOVE TO READ AND LEARN ENGLISH" (Saya suka membaca dan belajar Bahasa Inggris)!',
    howItWorksEn:
      'Tap two letter squares to swap them into the right spots: Row 1 = I LOVE · Row 3 = TO READ · Row 5 = AND · Row 6 = LEARN · Row 8 = ENGLISH.',
    howItWorksId:
      'Ketuk dua kotak huruf untuk menukar posisinya hingga tepat: Baris 1 = I LOVE (Saya Suka) · Baris 3 = TO READ (Membaca) · Baris 5 = AND (Dan) · Baris 6 = LEARN (Belajar) · Baris 8 = ENGLISH (Bahasa Inggris).',
    colors: ['#ec4899', '#38bdf8', '#10b981', '#f59e0b'],
    wordTranslations: [
      { en: 'I', id: 'Saya', row: 0, startCol: 0, endCol: 0, colorIndex: 1 },
      { en: 'LOVE', id: 'Suka / Cinta', row: 0, startCol: 2, endCol: 5, colorIndex: 1 },
      { en: 'TO', id: 'Untuk', row: 2, startCol: 0, endCol: 1, colorIndex: 2 },
      { en: 'READ', id: 'Membaca', row: 2, startCol: 3, endCol: 6, colorIndex: 2 },
      { en: 'AND', id: 'Dan', row: 4, startCol: 0, endCol: 2, colorIndex: 3 },
      { en: 'LEARN', id: 'Belajar', row: 5, startCol: 2, endCol: 6, colorIndex: 3 },
      { en: 'ENGLISH', id: 'Bahasa Inggris', row: 7, startCol: 0, endCol: 6, colorIndex: 4 },
    ],
    blueprint: [
      [1, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [2, 2, 0, 2, 2, 2, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 3, 0, 0, 0, 0, 0],
      [0, 0, 3, 3, 3, 3, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [4, 4, 4, 4, 4, 4, 4, 0],
    ],
    letterGrid: createLetterGridFromRows([
      'I.LOVE..',
      '........',
      'TO.READ.',
      '........',
      'AND.....',
      '..LEARN.',
      '........',
      'ENGLISH.',
    ]),
  },
  {
    id: 'sentence_where_school_bus',
    name: 'Sentence: Where Is The School Bus Today?',
    nameId: 'Kalimat: Di Mana Bus Sekolah Hari Ini?',
    category: 'Scramble Words',
    categoryId: 'Susun Kata & Kalimat',
    emoji: '🚌',
    location: 'English Question Sentence #4',
    difficultyLabel: '24 Letters · 6 Words',
    bonusPoints: 2350,
    bonusCredits: 39000,
    sentenceEn: 'WHERE IS THE SCHOOL BUS TODAY',
    sentenceId: 'Di mana bus sekolah hari ini?',
    brainSkillEn: 'Asking Questions in English ("Where Is...") & Spelling',
    brainSkillId: 'Membuat Kalimat Tanya Bahasa Inggris ("Where Is...") & Ejaan',
    description:
      'Move the scrambled letter squares around the 8x8 board to ask: "WHERE IS THE SCHOOL BUS TODAY" (Di mana bus sekolah hari ini?)!',
    descriptionId:
      'Pindahkan dan tukar kotak-kotak huruf di papan 8x8 untuk menyusun kalimat tanya: "WHERE IS THE SCHOOL BUS TODAY" (Di mana bus sekolah hari ini?)!',
    howItWorksEn:
      'Swap any two letter squares to respell each word! Row 1: WHERE IS · Row 3: THE · Row 5: SCHOOL · Row 7: BUS · Row 8: TODAY.',
    howItWorksId:
      'Tukar dua kotak huruf untuk mengeja setiap kata! Baris 1: WHERE IS (Di mana) · Baris 3: THE (Itu) · Baris 5: SCHOOL (Sekolah) · Baris 7: BUS (Bus) · Baris 8: TODAY (Hari ini).',
    colors: ['#38bdf8', '#fbbf24', '#10b981', '#a855f7'],
    wordTranslations: [
      { en: 'WHERE', id: 'Di mana', row: 0, startCol: 0, endCol: 4, colorIndex: 1 },
      { en: 'IS', id: 'Adalah / Berada', row: 0, startCol: 6, endCol: 7, colorIndex: 1 },
      { en: 'THE', id: 'Itu', row: 2, startCol: 2, endCol: 4, colorIndex: 2 },
      { en: 'SCHOOL', id: 'Sekolah', row: 4, startCol: 1, endCol: 6, colorIndex: 3 },
      { en: 'BUS', id: 'Bus', row: 6, startCol: 0, endCol: 2, colorIndex: 2 },
      { en: 'TODAY', id: 'Hari Ini', row: 7, startCol: 3, endCol: 7, colorIndex: 4 },
    ],
    blueprint: [
      [1, 1, 1, 1, 1, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 2, 2, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 3, 3, 3, 3, 3, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [2, 2, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 4, 4, 4, 4, 4],
    ],
    letterGrid: createLetterGridFromRows([
      'WHERE.IS',
      '........',
      '..THE...',
      '........',
      '.SCHOOL.',
      '........',
      'BUS.....',
      '...TODAY',
    ]),
  },
  {
    id: 'sentence_thank_you_friend',
    name: 'Sentence: Thank You Very Much My Good Friend',
    nameId: 'Kalimat: Terima Kasih Banyak Teman Baikku',
    category: 'Scramble Words',
    categoryId: 'Susun Kata & Kalimat',
    emoji: '🤝',
    location: 'English Kindness Sentence #5',
    difficultyLabel: '28 Letters · 7 Words',
    bonusPoints: 2450,
    bonusCredits: 41000,
    sentenceEn: 'THANK YOU VERY MUCH MY GOOD FRIEND',
    sentenceId: 'Terima kasih banyak teman baikku.',
    brainSkillEn: 'Gratitude & Friendship Expressions in English',
    brainSkillId: 'Ungkapan Terima Kasih & Persahabatan dalam Bahasa Inggris',
    description:
      'Unscramble the letter tiles to spell the warm expression of gratitude: "THANK YOU VERY MUCH MY GOOD FRIEND" (Terima kasih banyak teman baikku)!',
    descriptionId:
      'Susun kotak-kotak huruf yang teracak untuk mengeja kalimat persahabatan: "THANK YOU VERY MUCH MY GOOD FRIEND" (Terima kasih banyak teman baikku)!',
    howItWorksEn:
      'Tap any two letter squares to swap them! Row 1: THANK · Row 2: YOU · Row 4: VERY · Row 5: MUCH · Row 7: MY GOOD · Row 8: FRIEND.',
    howItWorksId:
      'Ketuk dua kotak huruf untuk menukar tempatnya! Baris 1: THANK · Baris 2: YOU (Terima kasih) · Baris 4: VERY · Baris 5: MUCH (Banyak) · Baris 7: MY GOOD (Baikku) · Baris 8: FRIEND (Teman).',
    colors: ['#10b981', '#38bdf8', '#f59e0b', '#ec4899'],
    wordTranslations: [
      { en: 'THANK', id: 'Terima Kasih', row: 0, startCol: 0, endCol: 4, colorIndex: 1 },
      { en: 'YOU', id: 'Kamu', row: 1, startCol: 5, endCol: 7, colorIndex: 1 },
      { en: 'VERY', id: 'Sangat', row: 3, startCol: 0, endCol: 3, colorIndex: 2 },
      { en: 'MUCH', id: 'Banyak', row: 4, startCol: 4, endCol: 7, colorIndex: 2 },
      { en: 'MY', id: '-ku / Milikku', row: 6, startCol: 0, endCol: 1, colorIndex: 3 },
      { en: 'GOOD', id: 'Baik', row: 6, startCol: 3, endCol: 6, colorIndex: 3 },
      { en: 'FRIEND', id: 'Teman / Sahabat', row: 7, startCol: 1, endCol: 6, colorIndex: 4 },
    ],
    blueprint: [
      [1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [2, 2, 2, 2, 0, 0, 0, 0],
      [0, 0, 0, 0, 2, 2, 2, 2],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 0, 3, 3, 3, 3, 0],
      [0, 4, 4, 4, 4, 4, 4, 0],
    ],
    letterGrid: createLetterGridFromRows([
      'THANK...',
      '.....YOU',
      '........',
      'VERY....',
      '....MUCH',
      '........',
      'MY.GOOD.',
      '.FRIEND.',
    ]),
  },
  {
    id: 'sentence_drink_water',
    name: 'Sentence: May I Have Some Clean Water Please',
    nameId: 'Kalimat: Bolehkah Saya Minta Air Bersih Tolong',
    category: 'Scramble Words',
    categoryId: 'Susun Kata & Kalimat',
    emoji: '💧',
    location: 'English Daily Needs Sentence #6',
    difficultyLabel: '28 Letters · 7 Words',
    bonusPoints: 2450,
    bonusCredits: 41000,
    sentenceEn: 'MAY I HAVE SOME CLEAN WATER PLEASE',
    sentenceId: 'Bolehkah saya minta air bersih, tolong?',
    brainSkillEn: 'Polite Daily Needs Conversation & English Spelling',
    brainSkillId: 'Percakapan Sopan Kebutuhan Sehari-hari & Ejaan Bahasa Inggris',
    description:
      'Swap the scrambled letter squares to spell: "MAY I HAVE SOME CLEAN WATER PLEASE" (Bolehkah saya minta air bersih, tolong?)!',
    descriptionId:
      'Tukar kotak-kotak huruf di papan untuk menyusun kalimat sopan: "MAY I HAVE SOME CLEAN WATER PLEASE" (Bolehkah saya minta air bersih, tolong?)!',
    howItWorksEn:
      'Tap any two letter squares to swap them into place! Row 1: MAY I · Row 2: HAVE · Row 4: SOME · Row 5: CLEAN · Row 7: WATER · Row 8: PLEASE.',
    howItWorksId:
      'Ketuk dua kotak huruf untuk menukar posisinya! Baris 1: MAY I (Bolehkah saya) · Baris 2: HAVE (Minta/Punya) · Baris 4: SOME (Sedikit) · Baris 5: CLEAN (Bersih) · Baris 7: WATER (Air) · Baris 8: PLEASE (Tolong).',
    colors: ['#38bdf8', '#2dd4bf', '#10b981', '#a855f7'],
    wordTranslations: [
      { en: 'MAY', id: 'Bolehkah', row: 0, startCol: 0, endCol: 2, colorIndex: 1 },
      { en: 'I', id: 'Saya', row: 0, startCol: 4, endCol: 4, colorIndex: 1 },
      { en: 'HAVE', id: 'Minta / Punya', row: 1, startCol: 3, endCol: 6, colorIndex: 2 },
      { en: 'SOME', id: 'Beberapa / Sedikit', row: 3, startCol: 0, endCol: 3, colorIndex: 3 },
      { en: 'CLEAN', id: 'Bersih', row: 4, startCol: 3, endCol: 7, colorIndex: 3 },
      { en: 'WATER', id: 'Air', row: 6, startCol: 0, endCol: 4, colorIndex: 1 },
      { en: 'PLEASE', id: 'Tolong', row: 7, startCol: 2, endCol: 7, colorIndex: 4 },
    ],
    blueprint: [
      [1, 1, 1, 0, 1, 0, 0, 0],
      [0, 0, 0, 2, 2, 2, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 3, 3, 0, 0, 0, 0],
      [0, 0, 0, 3, 3, 3, 3, 3],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 0, 0, 0],
      [0, 0, 4, 4, 4, 4, 4, 4],
    ],
    letterGrid: createLetterGridFromRows([
      'MAY.I...',
      '...HAVE.',
      '........',
      'SOME....',
      '...CLEAN',
      '........',
      'WATER...',
      '..PLEASE',
    ]),
  },
  {
    id: 'sentence_what_is_name',
    name: 'Sentence: Hello What Is Your Name My Friend',
    nameId: 'Kalimat: Halo Siapa Namamu Temanku',
    category: 'Scramble Words',
    categoryId: 'Susun Kata & Kalimat',
    emoji: '👋',
    location: 'English Greeting Sentence #7',
    difficultyLabel: '27 Letters · 7 Words',
    bonusPoints: 2400,
    bonusCredits: 40000,
    sentenceEn: 'HELLO WHAT IS YOUR NAME MY FRIEND',
    sentenceId: 'Halo, siapa namamu temanku?',
    brainSkillEn: 'Introducing Yourself & Making Friends in English',
    brainSkillId: 'Memperkenalkan Diri & Berteman dalam Bahasa Inggris',
    description:
      'Shuffle the letter tiles on the 8x8 board to greet a new friend in English: "HELLO WHAT IS YOUR NAME MY FRIEND" (Halo, siapa namamu temanku?)!',
    descriptionId:
      'Susun kotak-kotak huruf di papan 8x8 untuk menyapa teman baru dalam Bahasa Inggris: "HELLO WHAT IS YOUR NAME MY FRIEND" (Halo, siapa namamu temanku?)!',
    howItWorksEn:
      'Swap any two letter squares on the board! Row 1: HELLO · Row 3: WHAT IS · Row 5: YOUR · Row 6: NAME · Row 8: MY FRIEND.',
    howItWorksId:
      'Tukar dua kotak huruf di papan! Baris 1: HELLO (Halo) · Baris 3: WHAT IS (Apa/Siapa) · Baris 5: YOUR (Milikmu) · Baris 6: NAME (Nama) · Baris 8: MY FRIEND (Temanku).',
    colors: ['#f59e0b', '#38bdf8', '#10b981', '#ec4899'],
    wordTranslations: [
      { en: 'HELLO', id: 'Halo', row: 0, startCol: 1, endCol: 5, colorIndex: 1 },
      { en: 'WHAT', id: 'Apa / Siapa', row: 2, startCol: 0, endCol: 3, colorIndex: 2 },
      { en: 'IS', id: 'Adalah', row: 2, startCol: 5, endCol: 6, colorIndex: 2 },
      { en: 'YOUR', id: 'Milikmu / -mu', row: 4, startCol: 0, endCol: 3, colorIndex: 3 },
      { en: 'NAME', id: 'Nama', row: 5, startCol: 4, endCol: 7, colorIndex: 3 },
      { en: 'MY', id: '-ku', row: 7, startCol: 0, endCol: 1, colorIndex: 4 },
      { en: 'FRIEND', id: 'Teman', row: 7, startCol: 2, endCol: 7, colorIndex: 4 },
    ],
    blueprint: [
      [0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [2, 2, 2, 2, 0, 2, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 3, 3, 0, 0, 0, 0],
      [0, 0, 0, 0, 3, 3, 3, 3],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [4, 4, 4, 4, 4, 4, 4, 4],
    ],
    letterGrid: createLetterGridFromRows([
      '.HELLO..',
      '........',
      'WHAT.IS.',
      '........',
      'YOUR....',
      '....NAME',
      '........',
      'MYFRIEND',
    ]),
  },
  {
    id: 'sentence_god_bless_you',
    name: 'Sentence: God Bless You Always With Joy',
    nameId: 'Kalimat: Tuhan Memberkatimu Selalu Dengan Sukacita',
    category: 'Scramble Words',
    categoryId: 'Susun Kata & Kalimat',
    emoji: '🙏',
    location: 'English Blessing Sentence #8',
    difficultyLabel: '24 Letters · 6 Words',
    bonusPoints: 2500,
    bonusCredits: 42000,
    sentenceEn: 'GOD BLESS YOU ALWAYS WITH JOY',
    sentenceId: 'Tuhan memberkatimu selalu dengan sukacita.',
    brainSkillEn: 'Encouragement, Positive Values & English Sentence Spelling',
    brainSkillId: 'Kalimat Doa, Semangat Positif & Ejaan Bahasa Inggris',
    description:
      'Swap the scrambled letter squares to spell the uplifting blessing: "GOD BLESS YOU ALWAYS WITH JOY" (Tuhan memberkatimu selalu dengan sukacita)!',
    descriptionId:
      'Tukar kotak-kotak huruf di papan 8x8 untuk menyusun kalimat penuh berkat: "GOD BLESS YOU ALWAYS WITH JOY" (Tuhan memberkatimu selalu dengan sukacita)!',
    howItWorksEn:
      'Tap any two letter squares to swap them! Row 1: GOD · Row 3: BLESS · Row 4: YOU · Row 6: ALWAYS · Row 8: WITH JOY.',
    howItWorksId:
      'Ketuk dua kotak huruf untuk menukar posisinya! Baris 1: GOD (Tuhan) · Baris 3: BLESS (Memberkati) · Baris 4: YOU (Kamu) · Baris 6: ALWAYS (Selalu) · Baris 8: WITH JOY (Dengan Sukacita).',
    colors: ['#fbbf24', '#38bdf8', '#10b981', '#a855f7'],
    wordTranslations: [
      { en: 'GOD', id: 'Tuhan', row: 0, startCol: 2, endCol: 4, colorIndex: 1 },
      { en: 'BLESS', id: 'Memberkati', row: 2, startCol: 0, endCol: 4, colorIndex: 2 },
      { en: 'YOU', id: 'Kamu', row: 3, startCol: 5, endCol: 7, colorIndex: 2 },
      { en: 'ALWAYS', id: 'Selalu', row: 5, startCol: 1, endCol: 6, colorIndex: 3 },
      { en: 'WITH', id: 'Dengan', row: 7, startCol: 0, endCol: 3, colorIndex: 4 },
      { en: 'JOY', id: 'Sukacita', row: 7, startCol: 5, endCol: 7, colorIndex: 1 },
    ],
    blueprint: [
      [0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [2, 2, 2, 2, 2, 0, 0, 0],
      [0, 0, 0, 0, 0, 2, 2, 2],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 3, 3, 3, 3, 3, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [4, 4, 4, 4, 0, 1, 1, 1],
    ],
    letterGrid: createLetterGridFromRows([
      '..GOD...',
      '........',
      'BLESS...',
      '.....YOU',
      '........',
      '.ALWAYS.',
      '........',
      'WITH.JOY',
    ]),
  },
  {
    id: 'scramble_word_arcade',
    name: 'Word Scramble: PLAY, GAME & WIN',
    nameId: 'Susun Kata: BERMAIN, PERMAINAN & MENANG',
    category: 'Scramble Words',
    categoryId: 'Susun Kata & Kalimat',
    emoji: '🔤',
    location: 'Letter Tile Arena #9',
    difficultyLabel: '18 Letters · 4 Words',
    bonusPoints: 1900,
    bonusCredits: 32000,
    sentenceEn: 'SMILE PLAY GAME WIN',
    sentenceId: 'Senyum, Bermain, Permainan, Menang!',
    brainSkillEn: 'English-Indonesian Core Action Words & Spelling Memory',
    brainSkillId: 'Kosakata Dasar Bahasa Inggris-Indonesia & Memori Ejaan',
    description:
      'Swap the scrambled letter squares on the 8x8 board to spell 4 fun English words: SMILE (Senyum), PLAY (Bermain), GAME (Permainan), and WIN (Menang)!',
    descriptionId:
      'Tukar kotak-kotak huruf yang teracak di papan 8x8 untuk mengeja 4 kata Bahasa Inggris: SMILE (Senyum), PLAY (Bermain), GAME (Permainan), dan WIN (Menang)!',
    howItWorksEn:
      'Every letter is on its own square! Tap two letter squares to swap them: Row 2 = SMILE, Row 4 = PLAY, Row 6 = GAME, Row 8 = WIN.',
    howItWorksId:
      'Setiap huruf ada di kotaknya sendiri! Ketuk dua kotak huruf untuk menukarnya: Baris 2 = SMILE (Senyum), Baris 4 = PLAY (Bermain), Baris 6 = GAME (Permainan), Baris 8 = WIN (Menang).',
    colors: ['#38bdf8', '#a855f7', '#10b981', '#f59e0b'],
    wordTranslations: [
      { en: 'SMILE', id: 'Senyum', row: 1, startCol: 1, endCol: 5, colorIndex: 1 },
      { en: 'PLAY', id: 'Bermain', row: 3, startCol: 2, endCol: 5, colorIndex: 2 },
      { en: 'GAME', id: 'Permainan', row: 5, startCol: 2, endCol: 5, colorIndex: 3 },
      { en: 'WIN', id: 'Menang', row: 7, startCol: 2, endCol: 4, colorIndex: 4 },
    ],
    blueprint: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 2, 2, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 3, 3, 3, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 4, 4, 4, 0, 0, 0],
    ],
    letterGrid: createLetterGridFromRows([
      '........',
      '.SMILE..',
      '........',
      '..PLAY..',
      '........',
      '..GAME..',
      '........',
      '..WIN...',
    ]),
  },
  {
    id: 'scramble_word_animals',
    name: 'Word Scramble: ANIMALS (LION, BEAR, WOLF, DUCK)',
    nameId: 'Susun Kata: NAMA HEWAN (Singa, Beruang, Serigala, Bebek)',
    category: 'Scramble Words',
    categoryId: 'Susun Kata & Kalimat',
    emoji: '🐾',
    location: 'Safari Word Grid #10',
    difficultyLabel: '16 Letters · 4 Animals',
    bonusPoints: 1850,
    bonusCredits: 30000,
    sentenceEn: 'LION BEAR WOLF DUCK',
    sentenceId: 'Singa, Beruang, Serigala, Bebek',
    brainSkillEn: 'Bilingual Animal Vocabulary & Letter Sequencing',
    brainSkillId: 'Kosakata Nama Hewan Bahasa Inggris & Urutan Huruf',
    description:
      'Swap the shuffled letter squares on the board to spell 4 animals in English: LION (Singa), BEAR (Beruang), WOLF (Serigala), and DUCK (Bebek)!',
    descriptionId:
      'Tukar kotak huruf yang teracak di papan untuk mengeja 4 nama hewan dalam Bahasa Inggris: LION (Singa), BEAR (Beruang), WOLF (Serigala), dan DUCK (Bebek)!',
    howItWorksEn:
      'Tap any two letter squares to swap them! Row 1 (Gold) = LION, Row 3 (Green) = BEAR, Row 5 (Blue) = WOLF, Row 7 (Pink) = DUCK.',
    howItWorksId:
      'Ketuk dua kotak huruf untuk menukar posisinya! Baris 1 (Kuning) = LION (Singa), Baris 3 (Hijau) = BEAR (Beruang), Baris 5 (Biru) = WOLF (Serigala), Baris 7 (Merah Muda) = DUCK (Bebek).',
    colors: ['#f59e0b', '#10b981', '#38bdf8', '#ec4899'],
    wordTranslations: [
      { en: 'LION', id: 'Singa', row: 0, startCol: 1, endCol: 4, colorIndex: 1 },
      { en: 'BEAR', id: 'Beruang', row: 2, startCol: 2, endCol: 5, colorIndex: 2 },
      { en: 'WOLF', id: 'Serigala', row: 4, startCol: 1, endCol: 4, colorIndex: 3 },
      { en: 'DUCK', id: 'Bebek', row: 6, startCol: 2, endCol: 5, colorIndex: 4 },
    ],
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
    id: 'scramble_word_fruits',
    name: 'Word Scramble: FRUITS (APPLE, MANGO, BERRY, PEACH)',
    nameId: 'Susun Kata: BUAH SEGAR (Apel, Mangga, Beri, Persik)',
    category: 'Scramble Words',
    categoryId: 'Susun Kata & Kalimat',
    emoji: '🍎',
    location: 'Orchard Word Grid #11',
    difficultyLabel: '20 Letters · 4 Fruits',
    bonusPoints: 1850,
    bonusCredits: 30000,
    sentenceEn: 'APPLE MANGO BERRY PEACH',
    sentenceId: 'Apel, Mangga, Beri, Buah Persik',
    brainSkillEn: 'Bilingual Fruit Names & Letter Grouping',
    brainSkillId: 'Mengenal Nama Buah Bahasa Inggris & Pengelompokan Huruf',
    description:
      'Unscramble the letter squares on the 8x8 board to spell 4 healthy fruits: APPLE (Apel), MANGO (Mangga), BERRY (Beri), and PEACH (Persik)!',
    descriptionId:
      'Tukar kotak huruf yang teracak di papan 8x8 untuk mengeja 4 nama buah: APPLE (Apel), MANGO (Mangga), BERRY (Beri), dan PEACH (Buah Persik)!',
    howItWorksEn:
      'Swap any two letter squares on the board! Row 1 = APPLE, Row 3 = MANGO, Row 5 = BERRY, Row 7 = PEACH.',
    howItWorksId:
      'Tukar dua kotak huruf di papan! Baris 1 = APPLE (Apel), Baris 3 = MANGO (Mangga), Baris 5 = BERRY (Beri), Baris 7 = PEACH (Persik).',
    colors: ['#f43f5e', '#fbbf24', '#ec4899', '#fb923c'],
    wordTranslations: [
      { en: 'APPLE', id: 'Apel', row: 0, startCol: 1, endCol: 5, colorIndex: 1 },
      { en: 'MANGO', id: 'Mangga', row: 2, startCol: 1, endCol: 5, colorIndex: 2 },
      { en: 'BERRY', id: 'Buah Beri', row: 4, startCol: 1, endCol: 5, colorIndex: 3 },
      { en: 'PEACH', id: 'Buah Persik', row: 6, startCol: 1, endCol: 5, colorIndex: 4 },
    ],
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
    id: 'scramble_word_family',
    name: 'Word Scramble: FAMILY & HOME (MOTHER, FATHER, SISTER, FAMILY)',
    nameId: 'Susun Kata: KELUARGA (Ibu, Ayah, Saudari, Keluarga)',
    category: 'Scramble Words',
    categoryId: 'Susun Kata & Kalimat',
    emoji: '🏡',
    location: 'Family Word Grid #12',
    difficultyLabel: '24 Letters · 4 Words',
    bonusPoints: 2100,
    bonusCredits: 36000,
    sentenceEn: 'MOTHER FATHER SISTER FAMILY',
    sentenceId: 'Ibu, Ayah, Saudara Perempuan, Keluarga',
    brainSkillEn: 'Family Vocabulary & 6-Letter English Word Spelling',
    brainSkillId: 'Kosakata Keluarga Bahasa Inggris & Ejaan Kata 6 Huruf',
    description:
      'Swap the scrambled letter squares to spell 4 important family words: MOTHER (Ibu), FATHER (Ayah), SISTER (Saudari), and FAMILY (Keluarga)!',
    descriptionId:
      'Tukar kotak huruf yang teracak untuk mengeja 4 kata keluarga dalam Bahasa Inggris: MOTHER (Ibu), FATHER (Ayah), SISTER (Saudari), dan FAMILY (Keluarga)!',
    howItWorksEn:
      'Tap any two letter squares to swap them into place: Row 1 = MOTHER, Row 3 = FATHER, Row 5 = SISTER, Row 7 = FAMILY.',
    howItWorksId:
      'Ketuk dua kotak huruf untuk menukar posisinya: Baris 1 = MOTHER (Ibu), Baris 3 = FATHER (Ayah), Baris 5 = SISTER (Saudari), Baris 7 = FAMILY (Keluarga).',
    colors: ['#10b981', '#38bdf8', '#ec4899', '#fbbf24'],
    wordTranslations: [
      { en: 'MOTHER', id: 'Ibu / Bunda', row: 0, startCol: 1, endCol: 6, colorIndex: 1 },
      { en: 'FATHER', id: 'Ayah / Bapak', row: 2, startCol: 1, endCol: 6, colorIndex: 2 },
      { en: 'SISTER', id: 'Saudara Perempuan', row: 4, startCol: 1, endCol: 6, colorIndex: 3 },
      { en: 'FAMILY', id: 'Keluarga', row: 6, startCol: 1, endCol: 6, colorIndex: 4 },
    ],
    blueprint: [
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 2, 2, 2, 2, 2, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 3, 3, 3, 3, 3, 3, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 4, 4, 4, 4, 4, 4, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    letterGrid: createLetterGridFromRows([
      '.MOTHER.',
      '........',
      '.FATHER.',
      '........',
      '.SISTER.',
      '........',
      '.FAMILY.',
      '........',
    ]),
  },

  // ===========================================================================
  // SCRAMBLE BLOCKS & FUN ARCADE ICONS / SUSUN BALOK (4 GAMES)
  // ===========================================================================
  {
    id: 'scramble_rainbow_cube',
    name: 'Scramble Blocks: Color Cube',
    nameId: 'Susun Balok: Kubus 4 Warna',
    category: 'Scramble Blocks',
    categoryId: 'Susun Balok',
    emoji: '🎲',
    location: '4-Quadrant Color Matrix',
    difficultyLabel: '36 Blocks · Scramble',
    bonusPoints: 1800,
    bonusCredits: 30000,
    brainSkillEn: 'Quadrant Sorting & Color Categorization',
    brainSkillId: 'Pengelompokan Empat Zona & Warna',
    description:
      'Unscramble the 4 color quadrants by snapping matching cyan, gold, rose, and emerald blocks into their zones!',
    descriptionId:
      'Kelompokkan 4 kotak warna dengan menyusun balok biru, kuning, merah muda, dan hijau ke dalam zona masing-masing!',
    howItWorksEn:
      'The center 6x6 square is divided into four 3x3 color rooms: Top-Left = Blue, Top-Right = Gold, Bottom-Left = Red, Bottom-Right = Green. Sort each block into its color room!',
    howItWorksId:
      'Kotak tengah dibagi menjadi empat ruang warna ukuran 3x3: Kiri-Atas = Biru, Kanan-Atas = Kuning, Kiri-Bawah = Merah, Kanan-Bawah = Hijau. Masukkan balok sesuai warnanya!',
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
    nameId: 'Susun Balok: Benteng Istana',
    category: 'Scramble Blocks',
    categoryId: 'Susun Balok',
    emoji: '🧱',
    location: 'Pixel Citadel',
    difficultyLabel: '36 Blocks · Scramble',
    bonusPoints: 1850,
    bonusCredits: 31000,
    brainSkillEn: 'Geometric Interlocking & Architecture',
    brainSkillId: 'Menyambung Bentuk Geometri & Arsitektur',
    description:
      'Interlock scrambled L-blocks, T-blocks, and 2x2 squares to raise the symmetric arcade fortress!',
    descriptionId:
      'Sambungkan balok huruf L, balok T, dan kotak 2x2 untuk membangun benteng istana yang kokoh!',
    howItWorksEn:
      'Build the long purple foundation wall on Row 7 first, raise the twin corner towers at the top-left and top-right, and lock the red gatehouse in the center.',
    howItWorksId:
      'Bangun dinding pondasi ungu di Baris ke-7 dulu, dirikan dua menara sudut di kiri-atas dan kanan-atas, lalu kunci gerbang merah di tengah.',
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
    nameId: 'Gitar Musik Bintang',
    category: 'Scramble Blocks',
    categoryId: 'Susun Balok',
    emoji: '🎸',
    location: 'Main Stage Arena',
    difficultyLabel: '28 Blocks · Fun Picture',
    bonusPoints: 1750,
    bonusCredits: 29000,
    brainSkillEn: 'Diagonal Alignment & Rhythm Coordination',
    brainSkillId: 'Koordinasi Garis Miring & Musik',
    description:
      'Assemble the V-wing electric guitar body, golden pickups, fretboard neck, and headstock!',
    descriptionId:
      'Rakit gitar musik berwarna merah menyala lengkap dengan senar emas dan leher gitar!',
    howItWorksEn:
      'Build the red guitar body in the bottom-left corner, then extend the white-and-gold guitar neck diagonally up to the top-right tuning pegs.',
    howItWorksId:
      'Susun badan gitar merah di pojok kiri-bawah, lalu panjangkan leher gitar miring ke arah pojok kanan-atas.',
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
    nameId: 'Mahkota Permata Emas',
    category: 'Scramble Blocks',
    categoryId: 'Susun Balok',
    emoji: '👑',
    location: 'Grand Treasure Vault',
    difficultyLabel: '32 Blocks · Fun Picture',
    bonusPoints: 2000,
    bonusCredits: 35000,
    brainSkillEn: 'Peak Symmetry & Pattern Precision',
    brainSkillId: 'Ketelitian Puncak & Simetri Permata',
    description:
      'Forge the 24-karat golden crown studded with ruby, sapphire, and emerald jewels!',
    descriptionId:
      'Tempa mahkota raja emas yang dihiasi batu permata merah delima, safir biru, dan zamrud hijau!',
    howItWorksEn:
      'Lay the golden headband across Row 7, build the three crown peaks rising up to Row 2, and snap the colorful jewel blocks inside the crown.',
    howItWorksId:
      'Pasang lingkar dasar mahkota emas di Baris ke-7, bangun tiga puncak mahkota ke arah atas, dan hiasi dengan balok permata warna-warni.',
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
  // ICONIC WORLD LANDMARKS / MONUMEN DUNIA (5 ORIGINAL GAMES)
  // ===========================================================================
  {
    id: 'nyc_skyline',
    name: 'NYC Skyline',
    nameId: 'Gedung Pencakar Langit NYC',
    category: 'Landmarks',
    categoryId: 'Monumen Dunia',
    emoji: '🗽',
    location: 'Manhattan, New York',
    difficultyLabel: '34 Blocks · Landmark',
    bonusPoints: 1500,
    bonusCredits: 25000,
    brainSkillEn: 'Height Comparison & Architectural Planning',
    brainSkillId: 'Perbandingan Tinggi & Perencanaan Bangunan',
    description:
      'Assemble the Empire State Building lightning spire, the Chrysler Tower crown, and illuminated Midtown skyscrapers across the Manhattan waterfront.',
    descriptionId:
      'Susun deretan gedung pencakar langit New York lengkap dengan menara Empire State dan lampu kota yang berkilau.',
    howItWorksEn:
      'Build from the bottom waterfront upward: erect the teal tower on the left, the tall blue Empire State tower in Columns 2–4, and the purple tower on the right.',
    howItWorksId:
      'Bangun dari dasar gedung ke arah atas: susun gedung hijau-toska di kiri, menara biru tinggi di Kolom 2–4, dan gedung ungu di sebelah kanan.',
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
    nameId: 'Menara Eiffel Paris',
    category: 'Landmarks',
    categoryId: 'Monumen Dunia',
    emoji: '🗼',
    location: 'Champ de Mars, Paris',
    difficultyLabel: '28 Blocks · Landmark',
    bonusPoints: 1650,
    bonusCredits: 28000,
    brainSkillEn: 'Structural Balance & Pyramid Geometry',
    brainSkillId: 'Keseimbangan Struktur & Bentuk Menara',
    description:
      'Construct Gustave Eiffel’s 1889 iron lattice landmark: four wide foundation piers, the sweeping grand arch, two observation decks, and the glowing Paris pinnacle.',
    descriptionId:
      'Bangun Menara Eiffel yang terkenal di Paris: mulai dari kaki menara yang lebar, balkon tengah, hingga puncak menara yang bercahaya.',
    howItWorksEn:
      'Place the wide golden legs in the bottom corners, connect them with the horizontal observation decks in Rows 6 and 4, and raise the central spire to Row 1.',
    howItWorksId:
      'Pasang kedua kaki menara di sudut kiri-bawah dan kanan-bawah, hubungkan dengan dek mendatar di Baris 6 dan 4, lalu tegakkan puncak menara hingga Baris 1.',
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
    nameId: 'Jembatan Golden Gate',
    category: 'Landmarks',
    categoryId: 'Monumen Dunia',
    emoji: '🌉',
    location: 'San Francisco, California',
    difficultyLabel: '32 Blocks · Landmark',
    bonusPoints: 1750,
    bonusCredits: 30000,
    brainSkillEn: 'Bridge Engineering & Grid Coordinates',
    brainSkillId: 'Konstruksi Jembatan & Koordinat Papan',
    description:
      'Build the twin International Orange suspension towers, sweeping catenary cables, the 8-block main roadway span, and the Pacific bay water below.',
    descriptionId:
      'Bangun jembatan gantung merah terkenal di San Francisco lengkap dengan dua tiang kembar, kabel gantung, jalan raya, dan air laut biru.',
    howItWorksEn:
      'Build the blue water on Row 8, erect the two tall vertical red towers in Column 2 and Column 7, and connect them with the full 8-block road across Row 5.',
    howItWorksId:
      'Pasang air laut biru di Baris 8, dirikan dua tiang merah tegak di Kolom 2 dan Kolom 7, lalu sambungkan jalan jembatan mendatar sepanjang Baris 5.',
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
    nameId: 'Patung Liberty',
    category: 'Landmarks',
    categoryId: 'Monumen Dunia',
    emoji: '🗽',
    location: 'Liberty Island, New York',
    difficultyLabel: '30 Blocks · Landmark',
    bonusPoints: 1800,
    bonusCredits: 32000,
    brainSkillEn: 'Asymmetric Balance & Detail Observation',
    brainSkillId: 'Keseimbangan Bentuk & Ketelitian Visual',
    description:
      'Assemble Lady Liberty’s raised golden torch flame, seven-spired oxidized copper crown, and harbor pedestal.',
    descriptionId:
      'Susun Patung Liberty hijau toska lengkap dengan obor api emas yang diangkat tinggi dan mahkota bersegi tujuh.',
    howItWorksEn:
      'Build the green pedestal base in Rows 6–8, raise the torch arm in Column 2 with the yellow flame at the top-left, and assemble the spiked crown on the right.',
    howItWorksId:
      'Susun pondasi patung hijau di Baris 6–8, angkat lengan obor di Kolom 2 dengan api kuning di kiri-atas, lalu rangkai mahkota di sisi kanan.',
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
    nameId: 'Pagoda Tokyo Jepang',
    category: 'Landmarks',
    categoryId: 'Monumen Dunia',
    emoji: '🏯',
    location: 'Asakusa, Tokyo',
    difficultyLabel: '32 Blocks · Landmark',
    bonusPoints: 2000,
    bonusCredits: 35000,
    brainSkillEn: 'Rhythmic Repetition & Tiered Symmetry',
    brainSkillId: 'Pengulangan Pola & Tingkat Simetri',
    description:
      'Place the tiered vermilion temple eaves, central timber core, lantern balconies, and golden Sorin spire.',
    descriptionId:
      'Bangun menara Pagoda bertingkat di Tokyo dengan atap merah berjenjang, lentera ungu, dan puncak emas.',
    howItWorksEn:
      'Notice the repeating pattern: wide red roofs on Rows 6, 4, and 2 alternating with narrower purple-and-gold lantern floors!',
    howItWorksId:
      'Perhatikan pola berulangnya: atap merah lebar di Baris 6, 4, dan 2 berselang-seling dengan lantai lentera ungu-emas!',
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
