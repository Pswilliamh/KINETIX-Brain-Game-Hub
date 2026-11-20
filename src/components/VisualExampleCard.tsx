import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Gamepad2,
  Landmark,
} from 'lucide-react';

interface VisualStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  badgeText: string;
  board: number[][]; // 5x5 mini board: 0 = empty, 1 = existing block, 2 = active incoming piece, 3 = completed pattern glow, 4 = blueprint ghost
  trayHighlight: number;
}

const DEMO_STEPS: VisualStep[] = [
  {
    stepNumber: 1,
    title: '1. Puzzle Mode: Assemble Concrete Landmarks (NYC Skyline & Eiffel Tower)',
    subtitle:
      'In Puzzle Mode, the 8x8 board displays a glowing architectural blueprint silhouette of iconic targets like the NYC Skyline or Eiffel Tower. Your tray deals blocks carved specifically to fit the remaining blueprint cells!',
    badgeText: 'Target Image: NYC Skyline / Eiffel Tower (+1,500 PTS · +25,000 CR)',
    board: [
      [0, 0, 4, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [1, 1, 0, 1, 1],
    ],
    trayHighlight: 0,
  },
  {
    stepNumber: 2,
    title: '2. Snap Blocks onto the Blueprint Silhouette (Or Tap Quick-Place)',
    subtitle:
      'Tap any glowing blueprint cell on the grid — or tap the selected tray block a second time (or click AI Auto-Move) to snap the block directly into its exact architectural slot on the skyline.',
    badgeText: 'Precision Blueprint Snap Locked at Spire Tip',
    board: [
      [0, 0, 2, 0, 0],
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [1, 1, 0, 1, 1],
    ],
    trayHighlight: 0,
  },
  {
    stepNumber: 3,
    title: '3. 100% Monument Assembled! Level Complete Chime & Credit Windfall',
    subtitle:
      'Completing all blocks of the NYC Skyline or Eiffel Tower triggers the Level Complete harmonic bell chime, awards +1,500 to +2,000 Points & +25,000+ Credits, and unlocks your next world landmark!',
    badgeText: 'MONUMENT ASSEMBLED! +1,500 PTS · +25,000 CREDITS',
    board: [
      [0, 0, 3, 0, 0],
      [0, 0, 3, 0, 0],
      [0, 3, 3, 3, 0],
      [0, 3, 0, 3, 0],
      [3, 3, 0, 3, 3],
    ],
    trayHighlight: 1,
  },
];

interface VisualExampleCardProps {
  onStartGuidedDrill?: () => void;
  onStartPuzzleMode?: () => void;
  onReturnToArena?: () => void;
  isPracticeMode: boolean;
  isPuzzleMode?: boolean;
}

export const VisualExampleCard: React.FC<VisualExampleCardProps> = ({
  onStartGuidedDrill,
  onStartPuzzleMode,
  onReturnToArena,
  isPracticeMode,
  isPuzzleMode,
}) => {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = window.setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % DEMO_STEPS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const currentStep = DEMO_STEPS[activeStepIdx];

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs text-sky-600 dark:text-sky-400 font-mono">
            DEDICATED VISUAL EXAMPLE SCREEN
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-0.5">
            How Landmark Puzzle Assembly & Block Sets Work
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoPlay((p) => !p)}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
            title={autoPlay ? 'Pause Visual Demo' : 'Play Visual Demo'}
          >
            {autoPlay ? (
              <Pause className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setAutoPlay(false);
              setActiveStepIdx((prev) => (prev + 1) % DEMO_STEPS.length);
            }}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Step selector tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-xl">
        {DEMO_STEPS.map((s, idx) => (
          <button
            key={s.stepNumber}
            type="button"
            onClick={() => {
              setAutoPlay(false);
              setActiveStepIdx(idx);
            }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeStepIdx === idx
                ? 'bg-sky-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Step {s.stepNumber}
          </button>
        ))}
      </div>

      {/* Animated Mini Board + Target Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5">
        {/* 5x5 Animated Demonstration Grid */}
        <div className="md:col-span-5 flex flex-col items-center gap-3">
          <div className="grid grid-cols-5 gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
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
                  extraClass = 'scale-105 shadow-sm';
                } else if (cell === 4) {
                  bg = '#38bdf833';
                  border = '#38bdf8';
                  extraClass = 'border-dashed animate-pulse';
                }

                return (
                  <div
                    key={`${rIdx}_${cIdx}`}
                    style={{ backgroundColor: bg, borderColor: border }}
                    className={`w-9 h-9 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${extraClass}`}
                  >
                    {cell === 2 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-950" />
                    )}
                    {cell === 3 && (
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    )}
                    {cell === 4 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div className="text-xs font-mono text-slate-600 dark:text-slate-400 text-center">
            {currentStep.badgeText}
          </div>
        </div>

        {/* Step Explanation & Action */}
        <div className="md:col-span-7 space-y-4">
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
            {currentStep.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentStep.subtitle}
          </p>

          {/* Mini Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs border border-dashed border-sky-400 bg-sky-400/20 inline-block" />
              <span>Target Blueprint</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-sky-500 inline-block" />
              <span>Assembled Blocks</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block" />
              <span>Incoming Piece</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
              <span>100% Complete</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {onStartPuzzleMode && (
              <button
                type="button"
                onClick={onStartPuzzleMode}
                className="flex-1 py-2.5 px-4 bg-violet-500 hover:bg-violet-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Landmark className="w-4 h-4" />
                <span>
                  {isPuzzleMode
                    ? 'Continue Puzzle Mode (NYC & Eiffel)'
                    : 'Play Puzzle Mode (NYC Skyline & Eiffel Tower)'}
                </span>
              </button>
            )}

            {onStartGuidedDrill && (
              <button
                type="button"
                onClick={onStartGuidedDrill}
                className="py-2.5 px-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isPracticeMode ? 'Load Practice Drill' : 'Practice Drill'}
                </span>
              </button>
            )}

            {onReturnToArena && (
              <button
                type="button"
                onClick={onReturnToArena}
                className="py-2.5 px-3.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Back to Game</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
