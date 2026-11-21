import React, { useState, useEffect } from 'react';
import {
  AppLanguage,
  MONUMENT_PUZZLES,
  PuzzleCategory,
} from '../types/game';
import {
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Gamepad2,
  Brain,
  BookOpen,
  Languages,
} from 'lucide-react';

interface VisualStep {
  stepNumber: number;
  titleEn: string;
  titleId: string;
  subtitleEn: string;
  subtitleId: string;
  badgeTextEn: string;
  badgeTextId: string;
  board: number[][];
}

const DEMO_STEPS: VisualStep[] = [
  {
    stepNumber: 1,
    titleEn: '1. Choose Any of the 30 Brain Workout Games!',
    titleId: '1. Pilih Salah Satu dari 30 Permainan Latihan Otak!',
    subtitleEn:
      'Pick Animals, Cars, Fruits, Scramble Words, Scramble Blocks, or World Landmarks from the top menu. Tap "Guide" anytime if you want to see the glowing outline on the 8×8 board!',
    subtitleId:
      'Pilih kategori Hewan, Mobil, Buah, Susun Kata, Susun Balok, atau Monumen Dunia di menu atas. Ketuk tombol "Guide/Panduan" kapan saja untuk melihat garis bantuan di papan 8×8!',
    badgeTextEn: 'Step 1: Observe the Target Picture or Word',
    badgeTextId: 'Langkah 1: Amati Gambar atau Kata Sasaran',
    board: [
      [0, 0, 4, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [1, 1, 0, 1, 1],
    ],
  },
  {
    stepNumber: 2,
    titleEn: '2. Rotate & Place Your 3 Blocks onto the Board',
    titleId: '2. Putar & Pasang 3 Balok ke Papan Permainan',
    subtitleEn:
      'Tap a block in your 3-piece tray, tap "Rotate" to turn it, and tap the board (or tap "Place" for instant smart placement) to build the picture or spell the word!',
    subtitleId:
      'Pilih balok di nampan bawah, ketuk "Putar/Rotate" untuk memutar arahnya, lalu ketuk kotak papan (atau tombol "Pasang/Place") untuk menyusun gambar atau mengeja kata!',
    badgeTextEn: 'Step 2: Hand-Eye Coordination & Spatial Logic',
    badgeTextId: 'Langkah 2: Koordinasi Mata-Tangan & Logika Ruang',
    board: [
      [0, 0, 2, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [1, 1, 0, 1, 1],
    ],
  },
  {
    stepNumber: 3,
    titleEn: '3. Celebrate with Chimes, Confetti & Bonus Points!',
    titleId: '3. Rayakan dengan Bunyi Lonceng, Konfeti & Poin!',
    subtitleEn:
      'Every 3-block set rings a musical chime with confetti, and finishing 100% of the picture or word unlocks a grand celebration and advances you to the next brain workout!',
    subtitleId:
      'Setiap 3 balok selesai akan membunyikan lonceng musik dan konfeti, dan saat gambar atau kata selesai 100%, kamu mendapat perayaan juara dan lanjut ke permainan berikutnya!',
    badgeTextEn: '100% Complete! Chimes + Confetti Celebration',
    badgeTextId: '100% Selesai! Perayaan Lonceng + Konfeti Juara',
    board: [
      [0, 0, 3, 0, 0],
      [0, 0, 3, 0, 0],
      [0, 3, 3, 3, 0],
      [0, 3, 0, 3, 0],
      [3, 3, 0, 3, 3],
    ],
  },
];

interface VisualExampleCardProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  activeMonumentIndex: number;
  onSelectAndPlayMonument: (index: number) => void;
  onStartGuidedDrill?: () => void;
  onStartPuzzleMode?: () => void;
  onStartCandyGame?: () => void;
  onStartCheckersGame?: () => void;
  onStartMazeGame?: () => void;
  onReturnToArena?: () => void;
  isPracticeMode: boolean;
  isPuzzleMode?: boolean;
}

const CATEGORIES: { key: PuzzleCategory; labelEn: string; labelId: string }[] = [
  { key: 'Scramble Words', labelEn: '🔤 Scramble Words & Sentences (12)', labelId: '🔤 Susun Kalimat & Kata (12)' },
  { key: 'Animals', labelEn: '🦁 Animals', labelId: '🦁 Hewan' },
  { key: 'Cars & Rides', labelEn: '🏎️ Cars & Rides', labelId: '🏎️ Mobil & Kendaraan' },
  { key: 'Fruits & Treats', labelEn: '🍓 Fruits & Treats', labelId: '🍓 Buah & Makanan' },
  { key: 'Scramble Blocks', labelEn: '🎲 Scramble Blocks', labelId: '🎲 Susun Balok' },
  { key: 'Landmarks', labelEn: '🗽 Landmarks', labelId: '🗽 Monumen Dunia' },
];

export const VisualExampleCard: React.FC<VisualExampleCardProps> = ({
  language,
  onLanguageChange,
  activeMonumentIndex,
  onSelectAndPlayMonument,
  onStartGuidedDrill,
  onStartCandyGame,
  onStartCheckersGame,
  onStartMazeGame,
  onReturnToArena,
}) => {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<PuzzleCategory | 'ALL'>('ALL');

  useEffect(() => {
    if (!autoPlay) return;
    const timer = window.setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % DEMO_STEPS.length);
    }, 3600);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const currentStep = DEMO_STEPS[activeStepIdx];

  const filteredGames = MONUMENT_PUZZLES.map((game, index) => ({
    game,
    index,
  })).filter(
    (item) => selectedCategory === 'ALL' || item.game.category === selectedCategory
  );

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-[#0D244B] border border-[#C5E4EC] dark:border-[#1E447D] rounded-2xl p-4 sm:p-6 space-y-5 shadow-sm">
      {/* Top Header + Language Switcher + Back to Game */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C5E4EC] dark:border-[#1E447D] pb-4">
        <div>
          <div className="text-xs text-[#0D949E] dark:text-[#2DD4BF] font-mono font-bold flex items-center gap-1.5">
            <Brain className="w-4 h-4" />
            <span>
              {language === 'id'
                ? `PORTAL LATIHAN OTAK ANAK & PANDUAN ${MONUMENT_PUZZLES.length} PERMAINAN`
                : language === 'en'
                ? `CHILDREN’S BRAIN WORKOUT PORTAL & ${MONUMENT_PUZZLES.length}-GAME GUIDE`
                : `BRAIN WORKOUT PORTAL · PORTAL LATIHAN OTAK ANAK (${MONUMENT_PUZZLES.length} GAMES)`}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold font-display text-[#0B2249] dark:text-white mt-0.5">
            {language === 'id'
              ? 'Cara Bermain & Manfaat Latihan Otak Setiap Permainan'
              : language === 'en'
              ? 'How Each Game Works & Brain Exercise Benefits'
              : 'How Each Game Works · Cara Bermain & Manfaat Latihan Otak'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Language Switcher Pills */}
          <div className="flex items-center gap-1 bg-[#E8F5F8] dark:bg-[#071731] p-1 rounded-xl border border-[#C5E4EC] dark:border-[#1E447D]">
            <Languages className="w-3.5 h-3.5 text-[#14B8C4] ml-1" />
            <button
              type="button"
              onClick={() => onLanguageChange('bilingual')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                language === 'bilingual'
                  ? 'bg-[#14B8C4] text-[#062134]'
                  : 'text-[#355275] dark:text-[#A9C8E8]'
              }`}
            >
              🇮🇩+🇬🇧 Bilingual
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('id')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                language === 'id'
                  ? 'bg-[#0B2249] dark:bg-[#2DD4BF] text-white dark:text-[#062134]'
                  : 'text-[#355275] dark:text-[#A9C8E8]'
              }`}
            >
              🇮🇩 Bahasa
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                language === 'en'
                  ? 'bg-[#0B2249] dark:bg-[#2DD4BF] text-white dark:text-[#062134]'
                  : 'text-[#355275] dark:text-[#A9C8E8]'
              }`}
            >
              🇬🇧 English
            </button>
          </div>

          {onReturnToArena && (
            <button
              type="button"
              onClick={onReturnToArena}
              className="py-2 px-3 bg-[#0B2249] dark:bg-[#14B8C4] hover:bg-[#12336B] dark:hover:bg-[#2DD4BF] text-white dark:text-[#062134] font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>
                {language === 'id'
                  ? 'Kembali Bermain'
                  : language === 'en'
                  ? 'Back to Game'
                  : 'Back to Game / Main'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Featured Classic & Educational Arcade Games: Brain Maze, Candy Match-3 & Checkers */}
      {(onStartMazeGame || onStartCandyGame || onStartCheckersGame) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {onStartMazeGame && (
            <div className="bg-[#F2F9FB] dark:bg-[#071731] border border-[#14B8C4]/50 rounded-xl p-3.5 flex flex-col justify-between gap-2.5">
              <div className="space-y-1">
                <div className="text-sm font-extrabold text-[#0B2249] dark:text-white flex items-center gap-1.5">
                  <span>🌽</span>
                  <span>
                    {language === 'id'
                      ? 'Labirin Edukasi (3 Tema)'
                      : 'Brain Maze (3 Themes)'}
                  </span>
                </div>
                <p className="text-[11px] text-[#355275] dark:text-[#CBE7F0] leading-snug">
                  {language === 'id'
                    ? 'Labirin Jagung (Kosakata Inggris), Balap Mobil (Hitung Cepat), & Kura-Kura vs Kelinci!'
                    : 'Corn Maze (English Vocab), Race Car (Turbo Math), & Tortoise vs. Hare live fable race!'}
                </p>
              </div>
              <button
                type="button"
                onClick={onStartMazeGame}
                className="w-full py-2 px-3 bg-[#14B8C4] hover:bg-[#0EA5B7] text-[#062134] font-extrabold text-xs rounded-lg whitespace-nowrap cursor-pointer flex items-center justify-center gap-1"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'id' ? 'Main Labirin' : 'Play Maze'}</span>
              </button>
            </div>
          )}

          {onStartCandyGame && (
            <div className="bg-[#F2F9FB] dark:bg-[#071731] border border-[#14B8C4]/50 rounded-xl p-3.5 flex flex-col justify-between gap-2.5">
              <div className="space-y-1">
                <div className="text-sm font-extrabold text-[#0B2249] dark:text-white flex items-center gap-1.5">
                  <span>🍬</span>
                  <span>
                    {language === 'id'
                      ? 'Permen Match-3'
                      : 'Candy Match-3'}
                  </span>
                </div>
                <p className="text-[11px] text-[#355275] dark:text-[#CBE7F0] leading-snug">
                  {language === 'id'
                    ? 'Tukar & cocokkan 3+ permen! Buat Permen Garis (4) & Bom Pelangi (5) dengan konfeti.'
                    : 'Swap & match 3+ candies! Create Striped Line Blasters (4) & Rainbow Bombs (5) with combos.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onStartCandyGame}
                className="w-full py-2 px-3 bg-[#14B8C4] hover:bg-[#0EA5B7] text-[#062134] font-extrabold text-xs rounded-lg whitespace-nowrap cursor-pointer flex items-center justify-center gap-1"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'id' ? 'Main Permen' : 'Play Candy'}</span>
              </button>
            </div>
          )}

          {onStartCheckersGame && (
            <div className="bg-[#F2F9FB] dark:bg-[#071731] border border-[#14B8C4]/50 rounded-xl p-3.5 flex flex-col justify-between gap-2.5">
              <div className="space-y-1">
                <div className="text-sm font-extrabold text-[#0B2249] dark:text-white flex items-center gap-1.5">
                  <span>🔴</span>
                  <span>
                    {language === 'id'
                      ? 'Catur Dam (Checkers)'
                      : 'Checkers / Dam'}
                  </span>
                </div>
                <p className="text-[11px] text-[#355275] dark:text-[#CBE7F0] leading-snug">
                  {language === 'id'
                    ? 'Lompati bidak lawan, lompat ganda & jadi Raja! Lawan Bot atau 2 Pemain.'
                    : 'Jump pieces, chain double-jumps & crown Kings! Play vs AI Bot or 2 Players.'}
                </p>
              </div>
              <button
                type="button"
                onClick={onStartCheckersGame}
                className="w-full py-2 px-3 bg-[#0B2249] dark:bg-[#2DD4BF] hover:bg-[#12336B] dark:hover:bg-[#5EEAD4] text-white dark:text-[#062134] font-extrabold text-xs rounded-lg whitespace-nowrap cursor-pointer flex items-center justify-center gap-1"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{language === 'id' ? 'Main Dam' : 'Play Checkers'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Animated 3-Step Visual Tutorial */}
      <div className="bg-[#F2F9FB] dark:bg-[#071731] border border-[#C5E4EC] dark:border-[#1E447D] rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.stepNumber}
                type="button"
                onClick={() => {
                  setAutoPlay(false);
                  setActiveStepIdx(idx);
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeStepIdx === idx
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-slate-200/70 dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                {language === 'id'
                  ? `Langkah ${s.stepNumber}`
                  : `Step ${s.stepNumber}`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setAutoPlay((p) => !p)}
              className="p-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
              title="Play/Pause Demo"
            >
              {autoPlay ? (
                <Pause className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <Play className="w-3.5 h-3.5 text-emerald-500" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setAutoPlay(false);
                setActiveStepIdx((prev) => (prev + 1) % DEMO_STEPS.length);
              }}
              className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'id' ? 'Lanjut' : 'Next'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* 5x5 Animated Demonstration Grid */}
          <div className="md:col-span-4 flex flex-col items-center gap-2">
            <div className="grid grid-cols-5 gap-1.5 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              {currentStep.board.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  let bg = '#cbd5e1';
                  let border = 'transparent';
                  let extraClass = '';

                  if (cell === 1) {
                    bg = '#0284c7';
                    border = '#38bdf8';
                  } else if (cell === 2) {
                    bg = '#f59e0b';
                    border = '#fde047';
                    extraClass = 'animate-pulse scale-105';
                  } else if (cell === 3) {
                    bg = '#10b981';
                    border = '#6ee7b7';
                    extraClass = 'scale-105';
                  } else if (cell === 4) {
                    bg = '#38bdf833';
                    border = '#38bdf8';
                    extraClass = 'border-dashed animate-pulse';
                  }

                  return (
                    <div
                      key={`${rIdx}_${cIdx}`}
                      style={{ backgroundColor: bg, borderColor: border }}
                      className={`w-8 h-8 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${extraClass}`}
                    >
                      {cell === 3 && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 text-center">
              {language === 'id'
                ? currentStep.badgeTextId
                : currentStep.badgeTextEn}
            </div>
          </div>

          {/* Bilingual Step Explanation */}
          <div className="md:col-span-8 space-y-2">
            {(language === 'en' || language === 'bilingual') && (
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  🇬🇧 {currentStep.titleEn}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {currentStep.subtitleEn}
                </p>
              </div>
            )}

            {(language === 'id' || language === 'bilingual') && (
              <div
                className={`space-y-1 ${
                  language === 'bilingual'
                    ? 'pt-2 border-t border-slate-200 dark:border-slate-800'
                    : ''
                }`}
              >
                <h3 className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300">
                  🇮🇩 {currentStep.titleId}
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentStep.subtitleId}
                </p>
              </div>
            )}

            {onStartGuidedDrill && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onStartGuidedDrill}
                  className="py-1.5 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {language === 'id'
                      ? 'Coba Latihan Terpandu (Practice Mode)'
                      : language === 'en'
                      ? 'Try Guided Practice Session'
                      : 'Try Practice Drill · Coba Latihan Terpandu'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete 30-Game Brain Workout Guide & Picker */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-500" />
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {language === 'id'
                ? `Daftar Lengkap ${MONUMENT_PUZZLES.length} Permainan Latihan Otak & Kalimat Bahasa Inggris`
                : language === 'en'
                ? `All ${MONUMENT_PUZZLES.length} Brain Workout & English Sentence Games — How They Work`
                : `All ${MONUMENT_PUZZLES.length} Brain Workout & Sentence Games · Daftar Lengkap & Cara Bermain`}
            </h3>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-sky-500 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {language === 'id'
                ? `Semua (${MONUMENT_PUZZLES.length})`
                : `All (${MONUMENT_PUZZLES.length})`}
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer ${
                  selectedCategory === cat.key
                    ? 'bg-sky-500 text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {language === 'id' ? cat.labelId : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of 30 Bilingual Brain Workout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[540px] overflow-y-auto pr-1">
          {filteredGames.map(({ game, index }) => {
            const isCurrent = index === activeMonumentIndex;
            return (
              <div
                key={game.id}
                className={`rounded-xl border p-3.5 space-y-2.5 transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#CCF5F8]/50 dark:bg-[#12336B] border-[#14B8C4]'
                    : 'bg-[#F2F9FB] dark:bg-[#071731] border-[#C5E4EC] dark:border-[#1E447D]'
                }`}
              >
                <div className="space-y-2">
                  {/* Card Header with Mini 8x8 Preview & Bilingual Title */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      {/* Mini 8x8 Blueprint / Letter Square Preview */}
                      <div className="grid grid-cols-8 gap-[1px] p-1 bg-white dark:bg-[#0D244B] rounded-lg border border-[#C5E4EC] dark:border-[#1E447D] shrink-0">
                        {game.blueprint.map((row, rIdx) =>
                          row.map((val, cIdx) => {
                            const letterCh =
                              game.letterGrid?.[rIdx]?.[cIdx] || '';
                            return (
                              <div
                                key={`${game.id}_${rIdx}_${cIdx}`}
                                style={{
                                  backgroundColor:
                                    val > 0
                                      ? game.colors[(val - 1) % 4]
                                      : '#0B224922',
                                }}
                                className="w-2.5 h-2.5 flex items-center justify-center text-[6px] font-black text-slate-950 leading-none rounded-[1px]"
                              >
                                {letterCh}
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div>
                        <div className="text-[10px] font-mono font-bold text-[#0D949E] dark:text-[#2DD4BF] uppercase">
                          #{index + 1} · {game.category} / {game.categoryId}
                        </div>
                        <h4 className="text-sm font-extrabold text-[#0B2249] dark:text-white leading-snug">
                          {game.emoji}{' '}
                          {language === 'id'
                            ? game.nameId
                            : language === 'en'
                            ? game.name
                            : `${game.name} · ${game.nameId}`}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectAndPlayMonument(index)}
                      className="px-2.5 py-1.5 bg-[#14B8C4] hover:bg-[#0EA5B7] text-[#062134] font-extrabold text-[11px] rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>
                        {language === 'id'
                          ? 'Mainkan'
                          : language === 'en'
                          ? 'Play'
                          : 'Play / Main'}
                      </span>
                    </button>
                  </div>

                  {/* Full English Sentence + Indonesian Translation Box for Scramble Words/Sentences */}
                  {game.sentenceEn && (
                    <div className="bg-[#E8F5F8] dark:bg-[#0D244B] border border-[#14B8C4]/40 rounded-lg px-2.5 py-1.5 space-y-0.5">
                      <div className="text-xs font-extrabold font-mono text-[#0B2249] dark:text-[#2DD4BF]">
                        🔤 &ldquo;{game.sentenceEn}&rdquo;
                      </div>
                      {game.sentenceId && (
                        <div className="text-[11px] font-semibold text-[#0D949E] dark:text-[#CCF5F8]">
                          🇮🇩 Arti: &ldquo;{game.sentenceId}&rdquo;
                        </div>
                      )}
                    </div>
                  )}

                  {/* Brain Workout Skill Badge */}
                  <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg px-2.5 py-1.5 text-[11px]">
                    <span className="font-extrabold text-sky-700 dark:text-sky-300">
                      🧠{' '}
                      {language === 'id'
                        ? 'Latihan Otak: '
                        : language === 'en'
                        ? 'Brain Workout: '
                        : 'Brain Workout / Latihan Otak: '}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {language === 'id'
                        ? game.brainSkillId
                        : language === 'en'
                        ? game.brainSkillEn
                        : `${game.brainSkillEn} (${game.brainSkillId})`}
                    </span>
                  </div>

                  {/* English Description & How It Works */}
                  {(language === 'en' || language === 'bilingual') && (
                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <p>
                        <strong className="text-slate-900 dark:text-white">
                          🇬🇧 About:
                        </strong>{' '}
                        {game.description}
                      </p>
                      <p>
                        <strong className="text-sky-600 dark:text-sky-400">
                          How to Play:
                        </strong>{' '}
                        {game.howItWorksEn}
                      </p>
                    </div>
                  )}

                  {/* Bahasa Indonesia Description & How It Works */}
                  {(language === 'id' || language === 'bilingual') && (
                    <div
                      className={`text-xs text-slate-700 dark:text-slate-300 space-y-1 ${
                        language === 'bilingual'
                          ? 'pt-1.5 border-t border-slate-200/70 dark:border-slate-800/80'
                          : ''
                      }`}
                    >
                      <p>
                        <strong className="text-emerald-700 dark:text-emerald-400">
                          🇮🇩 Tentang Permainan:
                        </strong>{' '}
                        {game.descriptionId}
                      </p>
                      <p>
                        <strong className="text-amber-600 dark:text-amber-400">
                          Cara Bermain:
                        </strong>{' '}
                        {game.howItWorksId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
