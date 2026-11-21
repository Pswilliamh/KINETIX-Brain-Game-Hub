import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  AppLanguage,
  BLOCK_SKINS,
  BlockShape,
  GameMode,
  GameState,
  MONUMENT_PUZZLES,
  TARGET_PATTERNS,
  TargetMonumentPuzzle,
  TargetPattern,
  getPaletteForLevel,
} from '../types/game';
import {
  GRID_SIZE,
  canAnyShapeFit,
  canPlaceShape,
  createSeededRandom,
  findCompletedPatternZone,
  generateBlockBatch,
  generatePuzzleModeBatch,
  getMonumentProgress,
  getTodayDateKey,
  rotateShapeMatrix,
  selectNextPattern,
} from '../utils/patternEngine';
import { soundEngine } from '../utils/soundAndHaptics';
import { VisualExampleCard } from './VisualExampleCard';
import { AIHelperPanel, ComputedBestMove } from './AIHelperPanel';
import {
  RotateCw,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Vibrate,
  Share2,
  Sparkles,
  Gift,
  Calendar,
  CreditCard,
  Trophy,
  Check,
  Zap,
  GraduationCap,
  Undo2,
  Eye,
  Bot,
  Trash2,
  Gamepad2,
  BellRing,
  Landmark,
  ArrowRight,
  CheckCircle2,
  Play,
  Brain,
  BookOpen,
  X,
  Shuffle,
} from 'lucide-react';

export type ArenaSubScreen = 'play' | 'visual_example' | 'ai_helper';

interface ArcadeArenaProps {
  mode: GameMode;
  onModeChange: (newMode: GameMode) => void;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  isLightMode: boolean;
  isAdminUser: boolean;
  credits: number;
  highScore: number;
  dailyHighScore: number;
  patternsCompletedTotal: number;
  activeSkinId: string;
  dailyStreak: number;
  canClaimDailyBonus: boolean;
  onClaimDailyBonus: () => void;
  onRecordRunUpdate: (params: {
    score: number;
    level: number;
    patternsInRun: number;
    earnedCredits: number;
    mode: GameMode;
  }) => void;
  onClearPointsAdminOrPractice: (
    resetAllTime: boolean,
    resetCreditsToAmount?: number
  ) => void;
  clearSignal?: number;
  onOpenPayPalModal: () => void;
  onNavigateToVault: () => void;
  onShareScore: (customScore?: number) => void;
  copiedToast: boolean;
}

interface PracticeDrillPreset {
  id: string;
  title: string;
  instruction: string;
  targetPatternId: string;
  presetGrid: number[][];
  presetTray: BlockShape[];
}

interface UndoSnapshot {
  grid: number[][];
  tray: (BlockShape | null)[];
  score: number;
  level: number;
  combo: number;
  patternsInRun: number;
  targetPattern: TargetPattern;
  scrambledLetterGrid?: string[][];
}

/**
 * Creates a shuffled 8x8 letter matrix from a target letterGrid so every letter
 * is on its own square on the board and shuffled around for the child to swap & respell!
 */
function createShuffledLetterBoard(
  targetLetters: string[][],
  rng: () => number
): string[][] {
  const coords: { r: number; c: number; ch: string }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const ch = targetLetters[r]?.[c] || '';
      if (ch) {
        coords.push({ r, c, ch });
      }
    }
  }

  const chars = coords.map((item) => item.ch);
  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = chars[i];
    chars[i] = chars[j];
    chars[j] = temp;
  }

  // Ensure at least 80% of letters start out of place so children get a real scramble
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === coords[i].ch) {
      const swapIdx = (i + 1) % chars.length;
      const tmp = chars[i];
      chars[i] = chars[swapIdx];
      chars[swapIdx] = tmp;
    }
  }

  const board = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill('')
  );
  coords.forEach((coord, idx) => {
    board[coord.r][coord.c] = chars[idx];
  });
  return board;
}

function getLetterScrambleProgress(
  currentLetters: string[][],
  targetLetters?: string[][]
): {
  correctCount: number;
  totalLetters: number;
  percentage: number;
  isComplete: boolean;
} {
  if (!targetLetters) {
    return {
      correctCount: 0,
      totalLetters: 0,
      percentage: 0,
      isComplete: false,
    };
  }
  let correctCount = 0;
  let totalLetters = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const targetCh = targetLetters[r]?.[c] || '';
      if (targetCh) {
        totalLetters++;
        if (currentLetters[r]?.[c] === targetCh) {
          correctCount++;
        }
      }
    }
  }
  const percentage =
    totalLetters > 0 ? Math.round((correctCount / totalLetters) * 100) : 0;
  return {
    correctCount,
    totalLetters,
    percentage,
    isComplete: totalLetters > 0 && correctCount === totalLetters,
  };
}

const PRACTICE_DRILLS: PracticeDrillPreset[] = [
  {
    id: 'drill_harmonic_cross',
    title: 'Drill 1: 1-Move Harmonic Cross Completion',
    instruction:
      'Practice Drill 1: Place Slot #1 (Single Dot) at Row 4, Col 4 (or tap Quick-Place) to complete the Harmonic Cross and hear the Pattern & Block Set Chime!',
    targetPatternId: 'core_cross',
    presetGrid: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    presetTray: [
      { id: 'drill_1_a', name: 'Single Dot', cells: [[1]], colorIndex: 2 },
      { id: 'drill_1_b', name: 'Duo Bar H', cells: [[1, 1]], colorIndex: 3 },
      {
        id: 'drill_1_c',
        name: 'Square 2x2',
        cells: [
          [1, 1],
          [1, 1],
        ],
        colorIndex: 1,
      },
    ],
  },
  {
    id: 'drill_twin_pillars',
    title: 'Drill 2: Twin Pillars Vertical Alignment',
    instruction:
      'Practice Drill 2: The left pillar stands at Col 3. Place Slot #1 (Trio Beam V) at Row 3, Col 5 to complete the Twin Pillars 3x3 Target Pattern!',
    targetPatternId: 'parallel_pillars',
    presetGrid: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0, 0, 0, 0],
      [0, 0, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    presetTray: [
      {
        id: 'drill_2_a',
        name: 'Trio Beam V',
        cells: [[1], [1], [1]],
        colorIndex: 2,
      },
      {
        id: 'drill_2_b',
        name: 'Corner L',
        cells: [
          [1, 0],
          [1, 1],
        ],
        colorIndex: 4,
      },
      { id: 'drill_2_c', name: 'Single Dot', cells: [[1]], colorIndex: 1 },
    ],
  },
  {
    id: 'drill_line_and_pattern',
    title: 'Drill 3: Full 8-Block Row Clear + Combo Multiplier',
    instruction:
      'Practice Drill 3: Row 5 has 5 blocks filled. Place Slot #1 (Trio Beam H) at Row 5, Col 6 to clear the entire 8-cell row!',
    targetPatternId: 'monolith_block',
    presetGrid: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [3, 3, 3, 3, 3, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ],
    presetTray: [
      {
        id: 'drill_3_a',
        name: 'Trio Beam H',
        cells: [[1, 1, 1]],
        colorIndex: 3,
      },
      {
        id: 'drill_3_b',
        name: 'Square 2x2',
        cells: [
          [1, 1],
          [1, 1],
        ],
        colorIndex: 1,
      },
      { id: 'drill_3_c', name: 'Duo Bar V', cells: [[1], [1]], colorIndex: 2 },
    ],
  },
];

function doesPlacementFitStrictlyInBlueprint(
  shape: BlockShape,
  startRow: number,
  startCol: number,
  blueprint: number[][]
): boolean {
  for (let r = 0; r < shape.cells.length; r++) {
    for (let c = 0; c < shape.cells[0].length; c++) {
      if (shape.cells[r][c] === 1) {
        if ((blueprint[startRow + r]?.[startCol + c] || 0) === 0) {
          return false;
        }
      }
    }
  }
  return true;
}

function resolveSmartPlacementAnchor(
  grid: number[][],
  shape: BlockShape,
  clickedRow: number,
  clickedCol: number,
  blueprint?: number[][] | null
): { r: number; c: number } | null {
  const sRows = shape.cells.length;
  const sCols = shape.cells[0].length;

  // In Puzzle Mode, first prefer an anchor around the clicked cell that fits strictly inside the monument blueprint
  if (blueprint) {
    if (
      canPlaceShape(grid, shape, clickedRow, clickedCol) &&
      doesPlacementFitStrictlyInBlueprint(shape, clickedRow, clickedCol, blueprint)
    ) {
      return { r: clickedRow, c: clickedCol };
    }

    for (let dr = 0; dr < sRows; dr++) {
      for (let dc = 0; dc < sCols; dc++) {
        if (shape.cells[dr][dc] === 1) {
          const testR = clickedRow - dr;
          const testC = clickedCol - dc;
          if (
            canPlaceShape(grid, shape, testR, testC) &&
            doesPlacementFitStrictlyInBlueprint(shape, testR, testC, blueprint)
          ) {
            return { r: testR, c: testC };
          }
        }
      }
    }
  }

  if (canPlaceShape(grid, shape, clickedRow, clickedCol)) {
    return { r: clickedRow, c: clickedCol };
  }

  const centerR = clickedRow - Math.floor(sRows / 2);
  const centerC = clickedCol - Math.floor(sCols / 2);
  if (canPlaceShape(grid, shape, centerR, centerC)) {
    return { r: centerR, c: centerC };
  }

  for (let dr = 0; dr < sRows; dr++) {
    for (let dc = 0; dc < sCols; dc++) {
      if (shape.cells[dr][dc] === 1) {
        const testR = clickedRow - dr;
        const testC = clickedCol - dc;
        if (canPlaceShape(grid, shape, testR, testC)) {
          return { r: testR, c: testC };
        }
      }
    }
  }

  const clampedR = Math.min(Math.max(0, clickedRow), GRID_SIZE - sRows);
  const clampedC = Math.min(Math.max(0, clickedCol), GRID_SIZE - sCols);
  if (canPlaceShape(grid, shape, clampedR, clampedC)) {
    return { r: clampedR, c: clampedC };
  }

  return null;
}

function computeBestMoveForTray(
  grid: number[][],
  tray: (BlockShape | null)[],
  targetPattern: TargetPattern,
  activeMonument?: TargetMonumentPuzzle | null
): ComputedBestMove | null {
  let bestMove: ComputedBestMove | null = null;
  let bestScore = -999999;

  for (let tIdx = 0; tIdx < tray.length; tIdx++) {
    const shape = tray[tIdx];
    if (!shape) continue;

    let testCells = shape.cells;
    for (let rot = 0; rot < 4; rot++) {
      const candidateShape: BlockShape = { ...shape, cells: testCells };

      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          if (!canPlaceShape(grid, candidateShape, r, c)) continue;

          // PUZZLE MODE SCORING: Prioritize assembling the concrete target monument (NYC Skyline, Eiffel Tower, etc.)
          if (activeMonument) {
            let blueprintHits = 0;
            let exactColorHits = 0;
            let skySpills = 0;

            const sim = grid.map((row) => [...row]);
            for (let sr = 0; sr < testCells.length; sr++) {
              for (let sc = 0; sc < testCells[0].length; sc++) {
                if (testCells[sr][sc] === 1) {
                  const tr = r + sr;
                  const tc = c + sc;
                  sim[tr][tc] = shape.colorIndex;
                  const targetCellVal = activeMonument.blueprint[tr]?.[tc] || 0;
                  if (targetCellVal > 0) {
                    blueprintHits++;
                    if (targetCellVal === shape.colorIndex) {
                      exactColorHits++;
                    }
                  } else {
                    skySpills++;
                  }
                }
              }
            }

            const progressAfter = getMonumentProgress(
              sim,
              activeMonument.blueprint
            );
            let moveVal =
              blueprintHits * 320 +
              exactColorHits * 75 -
              skySpills * 850 +
              r * 4; // Slightly prefer building from foundation upward
            if (progressAfter.isComplete) {
              moveVal += 5000;
            }

            if (moveVal > bestScore) {
              bestScore = moveVal;
              let reason = `Snaps ${shape.name} onto the ${activeMonument.name} blueprint at Row ${
                r + 1
              }, Col ${c + 1} (${blueprintHits} structural block${
                blueprintHits === 1 ? '' : 's'
              } assembled).`;
              if (progressAfter.isComplete) {
                reason = `FINAL LANDMARK PIECE! Places ${shape.name} at Row ${
                  r + 1
                }, Col ${c + 1} to complete 100% of the ${
                  activeMonument.name
                } for +${activeMonument.bonusPoints} PTS and +${activeMonument.bonusCredits.toLocaleString()} Credits!`;
              }

              bestMove = {
                trayIndex: tIdx,
                shapeName: shape.name,
                rotationsNeeded: rot,
                rotatedCells: testCells.map((row) => [...row]),
                row: r,
                col: c,
                completesPattern: progressAfter.isComplete,
                linesCleared: 0,
                reasonSummary: reason,
              };
            }
            continue;
          }

          // STANDARD ARCADE / DAILY / PRACTICE SCORING
          const sim = grid.map((row) => [...row]);
          for (let sr = 0; sr < testCells.length; sr++) {
            for (let sc = 0; sc < testCells[0].length; sc++) {
              if (testCells[sr][sc] === 1) {
                sim[r + sr][c + sc] = shape.colorIndex;
              }
            }
          }

          let moveVal = 15;
          const completesPattern =
            findCompletedPatternZone(sim, targetPattern) !== null;
          if (completesPattern) {
            moveVal += 1000;
          }

          let linesCleared = 0;
          for (let rr = 0; rr < GRID_SIZE; rr++) {
            if (sim[rr].every((v) => v !== 0)) linesCleared++;
          }
          for (let cc = 0; cc < GRID_SIZE; cc++) {
            let full = true;
            for (let rr = 0; rr < GRID_SIZE; rr++) {
              if (sim[rr][cc] === 0) {
                full = false;
                break;
              }
            }
            if (full) linesCleared++;
          }
          moveVal += linesCleared * 300;

          let patternOverlap = 0;
          for (let pr = 0; pr < 3; pr++) {
            for (let pc = 0; pc < 3; pc++) {
              if (
                targetPattern.matrix[pr][pc] === 1 &&
                sim[2 + pr][2 + pc] !== 0
              ) {
                patternOverlap += 18;
              }
            }
          }
          moveVal += patternOverlap;

          const distFromCenter = Math.abs(r - 3) + Math.abs(c - 3);
          moveVal += Math.max(0, 12 - distFromCenter);

          if (moveVal > bestScore) {
            bestScore = moveVal;
            let reason = `Places ${shape.name} at Row ${r + 1}, Col ${
              c + 1
            } to build toward the ${targetPattern.name} pattern in the center zone.`;
            if (completesPattern && linesCleared > 0) {
              reason = `HYPER MOVE! Completes ${targetPattern.name} AND clears ${linesCleared} line(s) simultaneously!`;
            } else if (completesPattern) {
              reason = `Completes the 3x3 Target Pattern (${targetPattern.name}) immediately for +${targetPattern.bonusPoints} PTS and +${targetPattern.bonusCredits.toLocaleString()} Credits!`;
            } else if (linesCleared > 0) {
              reason = `Clears ${linesCleared} full line(s) immediately and boosts your rhythm combo multiplier!`;
            }

            bestMove = {
              trayIndex: tIdx,
              shapeName: shape.name,
              rotationsNeeded: rot,
              rotatedCells: testCells.map((row) => [...row]),
              row: r,
              col: c,
              completesPattern,
              linesCleared,
              reasonSummary: reason,
            };
          }
        }
      }

      testCells = rotateShapeMatrix(testCells);
    }
  }

  return bestMove;
}

export const ArcadeArena: React.FC<ArcadeArenaProps> = ({
  mode,
  onModeChange,
  isLightMode,
  language,
  onLanguageChange,
  credits,
  highScore,
  dailyHighScore,
  activeSkinId,
  canClaimDailyBonus,
  onClaimDailyBonus,
  onRecordRunUpdate,
  onClearPointsAdminOrPractice,
  clearSignal,
  onOpenPayPalModal,
  onNavigateToVault,
  onShareScore,
  copiedToast,
}) => {
  const rngRef = useRef<() => number>(
    createSeededRandom(`KINETIX_ARCADE_${Date.now()}`)
  );
  const batchCountRef = useRef<number>(1);

  // Separate Screen Switcher: 'play' (Dedicated Game Screen), 'visual_example' (Visual Example & 30-Game Guide Screen), 'ai_helper' (AI Helper Screen)
  const [subScreen, setSubScreen] = useState<ArenaSubScreen>('play');

  // Concrete Monument Puzzle State (37 Brain Workout & English Sentence Games)
  const initialWordPuzzleIdx = Math.max(
    0,
    MONUMENT_PUZZLES.findIndex((m) => m.id === 'sentence_find_airport')
  );
  const [monumentIdx, setMonumentIdx] = useState<number>(initialWordPuzzleIdx);
  const [completedMonumentIds, setCompletedMonumentIds] = useState<string[]>(
    []
  );
  // Start with a clean blank 8x8 grid from scratch (user can toggle guide outline if desired)
  const [showBlueprintGuideOnBoard, setShowBlueprintGuideOnBoard] =
    useState<boolean>(false);
  // Clean on-board modal for "How It Works / Cara Bermain & Brain Workout Description" without adding vertical scroll
  const [showHowItWorksModal, setShowHowItWorksModal] =
    useState<boolean>(false);

  const activeMonument: TargetMonumentPuzzle =
    MONUMENT_PUZZLES[monumentIdx % MONUMENT_PUZZLES.length];
  const isLetterScrambleGame = Boolean(
    mode === 'puzzle' && activeMonument.letterGrid
  );

  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0))
  );
  // Shuffled 8x8 letter matrix when playing a Scramble Sentence / Word game
  const [scrambledLetterGrid, setScrambledLetterGrid] = useState<string[][]>(
    () => {
      const startPuzzle = MONUMENT_PUZZLES[initialWordPuzzleIdx];
      return startPuzzle?.letterGrid
        ? createShuffledLetterBoard(startPuzzle.letterGrid, rngRef.current)
        : Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
    }
  );
  // Currently selected letter square {r, c} on the 8x8 board waiting to be swapped with another square
  const [swapSelectedCell, setSwapSelectedCell] = useState<{
    r: number;
    c: number;
  } | null>(null);

  const [tray, setTray] = useState<(BlockShape | null)[]>(() => {
    const empty = Array.from({ length: GRID_SIZE }, () =>
      Array(GRID_SIZE).fill(0)
    );
    return mode === 'puzzle'
      ? generatePuzzleModeBatch(
          empty,
          MONUMENT_PUZZLES[0].blueprint,
          rngRef.current,
          1,
          MONUMENT_PUZZLES[0].letterGrid
        )
      : generateBlockBatch(rngRef.current, 1);
  });
  const [selectedTrayIdx, setSelectedTrayIdx] = useState<number | null>(0);
  const [hoverCoord, setHoverCoord] = useState<{ r: number; c: number } | null>(
    null
  );
  const [isDraggingBlock, setIsDraggingBlock] = useState<boolean>(false);

  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [combo, setCombo] = useState<number>(0);
  const [patternsInRun, setPatternsInRun] = useState<number>(0);
  const [earnedCreditsInRun, setEarnedCreditsInRun] = useState<number>(0);
  const [targetPattern, setTargetPattern] = useState<TargetPattern>(() =>
    selectNextPattern(rngRef.current)
  );

  // Practice Session & AI Hint states (start with clean blank board from scratch)
  const [practiceDrillIdx, setPracticeDrillIdx] = useState<number>(0);
  const [undoHistory, setUndoHistory] = useState<UndoSnapshot[]>([]);
  const [showAIHintOnBoard, setShowAIHintOnBoard] = useState<boolean>(false);
  const [chimeAlert, setChimeAlert] = useState<string | null>(null);

  // Audio & Haptics controls
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [hapticsOn, setHapticsOn] = useState<boolean>(true);
  const [beatStep, setBeatStep] = useState<number>(0);
  const [tactileShake, setTactileShake] = useState<boolean>(false);
  const [lastFeedbackBanner, setLastFeedbackBanner] = useState<string>(
    mode === 'puzzle'
      ? `Start From Scratch: Build the ${MONUMENT_PUZZLES[0].name} on the blank 8x8 board (or tap Guide Outline)!`
      : 'Tap any grid cell to place the selected block, or tap the selected block again to Quick-Place!'
  );

  const palette = getPaletteForLevel(level, isLightMode);
  const activeSkin =
    BLOCK_SKINS.find((s) => s.id === activeSkinId) || BLOCK_SKINS[0];

  const monumentProgress = React.useMemo(() => {
    if (mode === 'puzzle' && activeMonument.letterGrid) {
      const letterProg = getLetterScrambleProgress(
        scrambledLetterGrid,
        activeMonument.letterGrid
      );
      return {
        filledRequired: letterProg.correctCount,
        totalRequired: letterProg.totalLetters,
        percentage: letterProg.percentage,
        isComplete: letterProg.isComplete,
      };
    }
    return getMonumentProgress(grid, activeMonument.blueprint);
  }, [
    grid,
    activeMonument.blueprint,
    activeMonument.letterGrid,
    mode,
    scrambledLetterGrid,
  ]);

  const bestMove = React.useMemo(
    () =>
      computeBestMoveForTray(
        grid,
        tray,
        targetPattern,
        mode === 'puzzle' ? activeMonument : null
      ),
    [grid, tray, targetPattern, mode, activeMonument]
  );

  const triggerVisualShake = useCallback(() => {
    setTactileShake(true);
    window.setTimeout(() => setTactileShake(false), 190);
  }, []);

  const flashChimeAlert = useCallback((label: string) => {
    setChimeAlert(label);
    window.setTimeout(() => {
      setChimeAlert((prev) => (prev === label ? null : prev));
    }, 2400);
  }, []);

  const speakEnglishTextAloud = useCallback((textToSpeak: string) => {
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(textToSpeak);
        utter.lang = 'en-US';
        utter.rate = 0.88; // Clear, child-friendly slower English pronunciation
        window.speechSynthesis.speak(utter);
      }
    } catch {
      // Ignore on unsupported browsers
    }
  }, []);

  useEffect(() => {
    if (gameState === 'PLAYING' && subScreen === 'play') {
      soundEngine.startRhythmLoop(palette.bpm, level, (beat) => {
        setBeatStep(beat);
      });
    } else {
      soundEngine.stopRhythmLoop();
    }
    return () => {
      soundEngine.stopRhythmLoop();
    };
  }, [gameState, level, palette.bpm, subScreen]);

  const loadMonumentPuzzle = useCallback(
    (targetIndex: number, clearPatternFromScratch: boolean = true) => {
      const safeIdx =
        ((targetIndex % MONUMENT_PUZZLES.length) + MONUMENT_PUZZLES.length) %
        MONUMENT_PUZZLES.length;
      const monument = MONUMENT_PUZZLES[safeIdx];
      setMonumentIdx(safeIdx);
      setSwapSelectedCell(null);
      setScore(0);
      setCombo(0);
      setUndoHistory([]);
      setGameState('PLAYING');

      if (monument.letterGrid) {
        // Scramble Sentence / Word Mode: Every letter square is placed on the 8x8 board and shuffled!
        const filledBlueprintGrid = monument.blueprint.map((row) => [...row]);
        const shuffledBoard = createShuffledLetterBoard(
          monument.letterGrid,
          rngRef.current
        );
        setGrid(filledBlueprintGrid);
        setScrambledLetterGrid(shuffledBoard);
        setTray([null, null, null]);
        setSelectedTrayIdx(null);
        setShowBlueprintGuideOnBoard(false);
        setShowAIHintOnBoard(false);
        setSubScreen('play');
        setLastFeedbackBanner(
          `Tap any 2 shuffled letter squares to swap them and spell: "${
            monument.sentenceEn || monument.name
          }"!`
        );
        soundEngine.playBlockSelect();
        return;
      }

      const emptyGrid = Array.from({ length: GRID_SIZE }, () =>
        Array(GRID_SIZE).fill(0)
      );
      batchCountRef.current = 1;
      const tailoredBatch = generatePuzzleModeBatch(
        emptyGrid,
        monument.blueprint,
        rngRef.current,
        1,
        monument.letterGrid
      );

      setGrid(emptyGrid);
      setScrambledLetterGrid(
        Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''))
      );
      setTray(tailoredBatch);
      setSelectedTrayIdx(0);
      if (clearPatternFromScratch) {
        setShowBlueprintGuideOnBoard(false);
        setShowAIHintOnBoard(false);
      }
      setSubScreen('play');
      setLastFeedbackBanner(
        `Started ${monument.emoji} ${monument.name} / ${monument.nameId} From Scratch! Place blocks to build the target.`
      );
      soundEngine.playBlockSelect();
    },
    []
  );

  const loadPracticeDrill = useCallback((drillIndex: number) => {
    const drill = PRACTICE_DRILLS[drillIndex % PRACTICE_DRILLS.length];
    const matchedPattern =
      TARGET_PATTERNS.find((p) => p.id === drill.targetPatternId) ||
      TARGET_PATTERNS[0];

    setPracticeDrillIdx(drillIndex % PRACTICE_DRILLS.length);
    setGrid(drill.presetGrid.map((r) => [...r]));
    setTray(
      drill.presetTray.map((s) => ({
        ...s,
        cells: s.cells.map((r) => [...r]),
      }))
    );
    setSelectedTrayIdx(0);
    setSwapSelectedCell(null);
    setTargetPattern(matchedPattern);
    setUndoHistory([]);
    setGameState('PLAYING');
    setShowAIHintOnBoard(true);
    setSubScreen('play');
    setLastFeedbackBanner(drill.instruction);
    soundEngine.playBlockSelect();
  }, []);

  const startNewGame = useCallback(
    (selectedMode: GameMode = mode) => {
      if (selectedMode === 'practice') {
        loadPracticeDrill(0);
        return;
      }
      if (selectedMode === 'puzzle') {
        loadMonumentPuzzle(monumentIdx, true);
        return;
      }

      const seedStr =
        selectedMode === 'daily'
          ? `KINETIX_DAILY_${getTodayDateKey()}`
          : `KINETIX_ARCADE_${Date.now()}_${Math.random()}`;
      rngRef.current = createSeededRandom(seedStr);
      batchCountRef.current = 1;

      const emptyGrid = Array.from({ length: GRID_SIZE }, () =>
        Array(GRID_SIZE).fill(0)
      );
      const initialBatch = generateBlockBatch(rngRef.current, 1);
      const firstPattern = selectNextPattern(rngRef.current);

      setGrid(emptyGrid);
      setTray(initialBatch);
      setSelectedTrayIdx(0);
      setSwapSelectedCell(null);
      setScore(0);
      setLevel(1);
      setCombo(0);
      setPatternsInRun(0);
      setEarnedCreditsInRun(0);
      setUndoHistory([]);
      setTargetPattern(firstPattern);
      setShowAIHintOnBoard(false);
      setLastFeedbackBanner(
        selectedMode === 'daily'
          ? `Daily Seed ${getTodayDateKey()} Started From Scratch · Tap any grid cell to place block`
          : `New Arcade Game Started From Scratch · Tap any grid cell to place block`
      );
      setGameState('PLAYING');
      setSubScreen('play');
      soundEngine.playBlockSelect();
    },
    [loadMonumentPuzzle, loadPracticeDrill, mode, monumentIdx]
  );

  // Sync when Clear Credits & Points is clicked in the top App header bar
  useEffect(() => {
    if (!clearSignal) return;
    setScore(0);
    setLevel(1);
    setCombo(0);
    setPatternsInRun(0);
    setEarnedCreditsInRun(0);
    setSwapSelectedCell(null);

    if (mode === 'puzzle' && activeMonument.letterGrid) {
      setGrid(activeMonument.blueprint.map((row) => [...row]));
      setScrambledLetterGrid(
        createShuffledLetterBoard(activeMonument.letterGrid, rngRef.current)
      );
      setTray([null, null, null]);
      setSelectedTrayIdx(null);
    } else {
      const emptyGrid = Array.from({ length: GRID_SIZE }, () =>
        Array(GRID_SIZE).fill(0)
      );
      setGrid(emptyGrid);
      const freshBatch =
        mode === 'puzzle'
          ? generatePuzzleModeBatch(
              emptyGrid,
              activeMonument.blueprint,
              rngRef.current,
              1,
              activeMonument.letterGrid
            )
          : generateBlockBatch(rngRef.current, 1);
      setTray(freshBatch);
      setSelectedTrayIdx(0);
    }

    setUndoHistory([]);
    setShowBlueprintGuideOnBoard(false);
    setShowAIHintOnBoard(false);
    setGameState('PLAYING');
    setLastFeedbackBanner(
      'All Credits, Points, High Scores, and Puzzle Pattern Cleared to 0 — Ready to Start From Scratch!'
    );
  }, [clearSignal, mode, activeMonument.blueprint, activeMonument.letterGrid]);

  // Clear stray blocks placed outside the monument blueprint in Puzzle Mode
  const handleCleanStraySkyBlocks = () => {
    if (mode !== 'puzzle') return;
    setGrid((prev) =>
      prev.map((row, r) =>
        row.map((val, c) => (activeMonument.blueprint[r][c] > 0 ? val : 0))
      )
    );
    soundEngine.playBlockRotate();
    setLastFeedbackBanner(
      `Cleaned stray sky blocks outside the ${activeMonument.name} blueprint!`
    );
  };

  // Clear Points & Credits handler (resets 659,090+ credits, best score, patterns, and clears puzzle board to start from scratch)
  const handleClearPointsButton = (
    resetAllTimeAndCredits: boolean = true,
    creditsAmount: number = 0
  ) => {
    setScore(0);
    setLevel(1);
    setCombo(0);
    setPatternsInRun(0);
    setEarnedCreditsInRun(0);
    setSwapSelectedCell(null);

    if (mode === 'puzzle' && activeMonument.letterGrid) {
      setGrid(activeMonument.blueprint.map((row) => [...row]));
      setScrambledLetterGrid(
        createShuffledLetterBoard(activeMonument.letterGrid, rngRef.current)
      );
      setTray([null, null, null]);
      setSelectedTrayIdx(null);
    } else {
      const emptyGrid = Array.from({ length: GRID_SIZE }, () =>
        Array(GRID_SIZE).fill(0)
      );
      setGrid(emptyGrid);
      const freshBatch =
        mode === 'puzzle'
          ? generatePuzzleModeBatch(
              emptyGrid,
              activeMonument.blueprint,
              rngRef.current,
              1,
              activeMonument.letterGrid
            )
          : generateBlockBatch(rngRef.current, 1);
      setTray(freshBatch);
      setSelectedTrayIdx(0);
    }

    setUndoHistory([]);
    setShowBlueprintGuideOnBoard(false);
    setShowAIHintOnBoard(false);
    setGameState('PLAYING');
    onClearPointsAdminOrPractice(resetAllTimeAndCredits, creditsAmount);
    soundEngine.playBlockSetCompleteChime(triggerVisualShake);
    flashChimeAlert(
      resetAllTimeAndCredits
        ? `All Credits (${creditsAmount.toLocaleString()} CR), Points & Puzzle Board Cleared to 0!`
        : 'Puzzle Pattern Cleared to Start From Scratch (0% Built)!'
    );
    setLastFeedbackBanner(
      resetAllTimeAndCredits
        ? `All Credits (${creditsAmount.toLocaleString()} CR), High Scores & Puzzle Board Reset to 0!`
        : 'Puzzle Board & Pattern Cleared · Start Building From Scratch!'
    );
  };

  const handleUndoMove = () => {
    if (undoHistory.length === 0) return;
    const last = undoHistory[undoHistory.length - 1];
    setGrid(last.grid);
    setTray(last.tray);
    setScore(last.score);
    setLevel(last.level);
    setCombo(last.combo);
    setPatternsInRun(last.patternsInRun);
    setTargetPattern(last.targetPattern);
    if (last.scrambledLetterGrid) {
      setScrambledLetterGrid(last.scrambledLetterGrid);
    }
    setSwapSelectedCell(null);
    const firstAvail = last.tray.findIndex((s) => s !== null);
    setSelectedTrayIdx(firstAvail !== -1 ? firstAvail : 0);
    setUndoHistory((prev) => prev.slice(0, -1));
    setGameState('PLAYING');
    soundEngine.playBlockRotate();
    setLastFeedbackBanner('Move Undone · Try a different placement!');
  };

  /**
   * Swaps two letter squares (r1, c1) and (r2, c2) on the 8x8 board for Scramble Sentence/Word games
   */
  const executeLetterSquareSwap = useCallback(
    (r1: number, c1: number, r2: number, c2: number) => {
      if (!activeMonument.letterGrid) return;
      if (r1 === r2 && c1 === c2) {
        setSwapSelectedCell(null);
        return;
      }

      const char1 = scrambledLetterGrid[r1]?.[c1] || '';
      const char2 = scrambledLetterGrid[r2]?.[c2] || '';
      if (!char1 || !char2) return;

      setUndoHistory((prev) => [
        ...prev.slice(-14),
        {
          grid: grid.map((r) => [...r]),
          tray: tray.map((t) =>
            t ? { ...t, cells: t.cells.map((r) => [...r]) } : null
          ),
          score,
          level,
          combo,
          patternsInRun,
          targetPattern,
          scrambledLetterGrid: scrambledLetterGrid.map((r) => [...r]),
        },
      ]);

      const nextLetters = scrambledLetterGrid.map((r) => [...r]);
      nextLetters[r1][c1] = char2;
      nextLetters[r2][c2] = char1;

      const prevProg = getLetterScrambleProgress(
        scrambledLetterGrid,
        activeMonument.letterGrid
      );
      const nextProg = getLetterScrambleProgress(
        nextLetters,
        activeMonument.letterGrid
      );

      // Check if an entire row or word was just completed!
      let completedWordEn = '';
      let completedWordId = '';
      if (activeMonument.wordTranslations) {
        for (const w of activeMonument.wordTranslations) {
          let wasCorrectBefore = true;
          let isCorrectNow = true;
          for (let cc = w.startCol; cc <= w.endCol; cc++) {
            const targetCh = activeMonument.letterGrid[w.row]?.[cc] || '';
            if (scrambledLetterGrid[w.row]?.[cc] !== targetCh) {
              wasCorrectBefore = false;
            }
            if (nextLetters[w.row]?.[cc] !== targetCh) {
              isCorrectNow = false;
            }
          }
          if (!wasCorrectBefore && isCorrectNow) {
            completedWordEn = w.en;
            completedWordId = w.id;
            break;
          }
        }
      }

      const newlyCorrectDelta = Math.max(
        0,
        nextProg.correctCount - prevProg.correctCount
      );
      const swapPoints =
        (newlyCorrectDelta > 0 ? newlyCorrectDelta * 65 : 10) * level +
        (completedWordEn ? 250 : 0) +
        (nextProg.isComplete ? activeMonument.bonusPoints * level : 0);
      const swapCredits =
        newlyCorrectDelta * 300 +
        (completedWordEn ? 1500 : 0) +
        (nextProg.isComplete ? activeMonument.bonusCredits : 0);

      const nextScore = score + swapPoints;
      const nextCombo = newlyCorrectDelta > 0 ? combo + 1 : 0;
      const nextPatterns = nextProg.isComplete
        ? patternsInRun + 1
        : patternsInRun;
      const nextLevel = nextProg.isComplete ? level + 1 : level;

      setScrambledLetterGrid(nextLetters);
      setSwapSelectedCell(null);
      setScore(nextScore);
      setCombo(nextCombo);
      setPatternsInRun(nextPatterns);
      setLevel(nextLevel);
      setEarnedCreditsInRun((prev) => prev + swapCredits);

      if (nextProg.isComplete) {
        soundEngine.playLevelCompleteChime(triggerVisualShake);
        confetti({
          particleCount: 95,
          spread: 90,
          origin: { y: 0.55 },
        });
        flashChimeAlert(
          `🎉 "${
            activeMonument.sentenceEn || activeMonument.name
          }" SPELLED 100%! (+${swapPoints} PTS)`
        );
        if (activeMonument.sentenceEn && soundOn) {
          speakEnglishTextAloud(activeMonument.sentenceEn);
        }
        setCompletedMonumentIds((prev) =>
          Array.from(new Set([...prev, activeMonument.id]))
        );
        setGameState('MONUMENT_COMPLETE');
      } else if (completedWordEn) {
        soundEngine.playBlockSetCompleteChime(triggerVisualShake);
        confetti({
          particleCount: 30,
          spread: 60,
          origin: { y: 0.65 },
        });
        flashChimeAlert(
          `🔔 WORD SPELLED: "${completedWordEn}" = "${completedWordId}"! (${nextProg.percentage}%)`
        );
        if (soundOn) {
          speakEnglishTextAloud(completedWordEn);
        }
      } else if (newlyCorrectDelta > 0) {
        soundEngine.playBlockPlace(nextCombo, level);
      } else {
        soundEngine.playBlockRotate();
      }

      onRecordRunUpdate({
        score: nextScore,
        level: nextLevel,
        patternsInRun: nextPatterns,
        earnedCredits: swapCredits,
        mode,
      });
    },
    [
      activeMonument,
      combo,
      flashChimeAlert,
      grid,
      level,
      mode,
      onRecordRunUpdate,
      patternsInRun,
      score,
      scrambledLetterGrid,
      soundOn,
      speakEnglishTextAloud,
      targetPattern,
      tray,
      triggerVisualShake,
    ]
  );

  /**
   * Smart Hint for Children: Automatically finds 1 misplaced letter square and swaps it into its correct position!
   */
  const handleAutoFixOneLetter = useCallback(() => {
    if (!activeMonument.letterGrid) return;
    if (gameState !== 'PLAYING') {
      setGameState('PLAYING');
    }

    // If the child already tapped one misplaced cell, fix that specific square first!
    let targetR = -1;
    let targetC = -1;

    if (
      swapSelectedCell &&
      activeMonument.letterGrid[swapSelectedCell.r]?.[swapSelectedCell.c] &&
      scrambledLetterGrid[swapSelectedCell.r]?.[swapSelectedCell.c] !==
        activeMonument.letterGrid[swapSelectedCell.r]?.[swapSelectedCell.c]
    ) {
      targetR = swapSelectedCell.r;
      targetC = swapSelectedCell.c;
    } else {
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const needed = activeMonument.letterGrid[r]?.[c] || '';
          if (needed && scrambledLetterGrid[r]?.[c] !== needed) {
            targetR = r;
            targetC = c;
            break;
          }
        }
        if (targetR !== -1) break;
      }
    }

    if (targetR === -1 || targetC === -1) return;
    const neededChar = activeMonument.letterGrid[targetR][targetC];

    // Find another misplaced cell currently holding neededChar
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (r === targetR && c === targetC) continue;
        const currentAtCell = scrambledLetterGrid[r]?.[c] || '';
        const targetAtCell = activeMonument.letterGrid[r]?.[c] || '';
        if (currentAtCell === neededChar && currentAtCell !== targetAtCell) {
          executeLetterSquareSwap(targetR, targetC, r, c);
          return;
        }
      }
    }
  }, [
    activeMonument.letterGrid,
    executeLetterSquareSwap,
    gameState,
    scrambledLetterGrid,
    swapSelectedCell,
  ]);

  /**
   * Re-shuffles all letter squares on the 8x8 board
   */
  const handleReshuffleLetterBoard = useCallback(() => {
    if (!activeMonument.letterGrid) return;
    setGrid(activeMonument.blueprint.map((row) => [...row]));
    setScrambledLetterGrid(
      createShuffledLetterBoard(activeMonument.letterGrid, rngRef.current)
    );
    setSwapSelectedCell(null);
    setGameState('PLAYING');
    soundEngine.playBlockRotate();
    flashChimeAlert(
      language === 'id'
        ? '🔀 Kotak Huruf Diacak Ulang! Ketuk 2 kotak untuk menukar huruf.'
        : '🔀 Letter Squares Shuffled! Tap any 2 squares to swap letters.'
    );
  }, [
    activeMonument.blueprint,
    activeMonument.letterGrid,
    flashChimeAlert,
    language,
  ]);

  const handleRotateSelected = useCallback(() => {
    if (isLetterScrambleGame) {
      handleReshuffleLetterBoard();
      return;
    }
    if (selectedTrayIdx === null) return;
    if (gameState !== 'PLAYING') {
      setGameState('PLAYING');
    }
    const currentShape = tray[selectedTrayIdx];
    if (!currentShape) return;

    const rotatedCells = rotateShapeMatrix(currentShape.cells);
    setTray((prev) =>
      prev.map((item, idx) =>
        idx === selectedTrayIdx && item
          ? { ...item, cells: rotatedCells }
          : item
      )
    );
    soundEngine.playBlockRotate();
    setLastFeedbackBanner(`Rotated ${currentShape.name} 90° · Ready to place`);
  }, [
    gameState,
    handleReshuffleLetterBoard,
    isLetterScrambleGame,
    selectedTrayIdx,
    tray,
  ]);

  const executePlacementAtAnchor = useCallback(
    (
      trayIndex: number,
      anchorR: number,
      anchorC: number,
      overrideCells?: number[][]
    ) => {
      const rawShape = tray[trayIndex];
      if (!rawShape) return;

      const shape: BlockShape = overrideCells
        ? { ...rawShape, cells: overrideCells }
        : rawShape;

      if (!canPlaceShape(grid, shape, anchorR, anchorC)) {
        soundEngine.triggerHaptic(25, triggerVisualShake);
        setLastFeedbackBanner(
          'That spot is occupied — tap an open space or click AI Auto-Move!'
        );
        return;
      }

      setUndoHistory((prev) => [
        ...prev.slice(-14),
        {
          grid: grid.map((r) => [...r]),
          tray: tray.map((t) =>
            t ? { ...t, cells: t.cells.map((r) => [...r]) } : null
          ),
          score,
          level,
          combo,
          patternsInRun,
          targetPattern,
        },
      ]);

      // 1. Place the shape onto a cloned grid
      const nextGrid = grid.map((r) => [...r]);
      let cellsPlacedCount = 0;
      let blueprintCellsMatched = 0;

      for (let r = 0; r < shape.cells.length; r++) {
        for (let c = 0; c < shape.cells[0].length; c++) {
          if (shape.cells[r][c] === 1) {
            const tr = anchorR + r;
            const tc = anchorC + c;
            // In Puzzle Mode, lock the placed cell with the monument's target color if it lands on a blueprint cell
            const targetBlueprintColor =
              mode === 'puzzle' ? activeMonument.blueprint[tr]?.[tc] || 0 : 0;
            nextGrid[tr][tc] =
              targetBlueprintColor > 0
                ? targetBlueprintColor
                : shape.colorIndex;
            cellsPlacedCount++;
            if (targetBlueprintColor > 0) {
              blueprintCellsMatched++;
            }
          }
        }
      }

      // =======================================================================
      // PUZZLE MODE BRANCH: Picture & Block Games
      // =======================================================================
      if (mode === 'puzzle') {
        const nextProgress = getMonumentProgress(
          nextGrid,
          activeMonument.blueprint
        );
        const monumentJustCompleted = nextProgress.isComplete;

        const placementPoints =
          (blueprintCellsMatched * 35 +
            (cellsPlacedCount - blueprintCellsMatched) * 5) *
          level;
        const monumentBonusPts = monumentJustCompleted
          ? activeMonument.bonusPoints * level
          : 0;
        const monumentBonusCredits = monumentJustCompleted
          ? activeMonument.bonusCredits
          : 0;

        const turnScoreDelta = placementPoints + monumentBonusPts;
        const turnCreditDelta =
          blueprintCellsMatched * 250 + monumentBonusCredits;

        const nextScore = score + turnScoreDelta;
        const nextEarnedCredits = earnedCreditsInRun + turnCreditDelta;
        const nextPatternsInRun = monumentJustCompleted
          ? patternsInRun + 1
          : patternsInRun;
        const nextLevel = monumentJustCompleted ? level + 1 : level;
        const nextCombo = blueprintCellsMatched > 0 ? combo + 1 : 0;

        const updatedTray = tray.map((item, idx) =>
          idx === trayIndex ? null : item
        );
        const blockSetCompleted = updatedTray.every((item) => item === null);
        let finalTray = updatedTray;

        if (blockSetCompleted && !monumentJustCompleted) {
          batchCountRef.current += 1;
          finalTray = generatePuzzleModeBatch(
            nextGrid,
            activeMonument.blueprint,
            rngRef.current,
            batchCountRef.current,
            activeMonument.letterGrid
          );
        }

        if (monumentJustCompleted) {
          soundEngine.playLevelCompleteChime(triggerVisualShake);
          flashChimeAlert(
            `🎉 ${activeMonument.emoji} ${activeMonument.name} / ${activeMonument.nameId} SELESAI! (+${monumentBonusPts} PTS)`
          );
          setCompletedMonumentIds((prev) =>
            Array.from(new Set([...prev, activeMonument.id]))
          );
          confetti({
            particleCount: 90,
            spread: 90,
            origin: { y: 0.55 },
          });
          setLastFeedbackBanner(
            `GAME COMPLETE: ${activeMonument.emoji} ${activeMonument.name}! +${monumentBonusPts} PTS · +${monumentBonusCredits.toLocaleString()} Credits!`
          );
          setGameState('MONUMENT_COMPLETE');
        } else if (blockSetCompleted) {
          soundEngine.playBlockSetCompleteChime(triggerVisualShake);
          confetti({
            particleCount: 28,
            spread: 60,
            origin: { y: 0.65 },
          });
          flashChimeAlert(
            `🔔 BLOCK SET CHIME! ${nextProgress.percentage}% of ${activeMonument.emoji} ${activeMonument.name} Built`
          );
          setLastFeedbackBanner(
            `3-Block Set Completed! ${activeMonument.name}: ${nextProgress.filledRequired}/${nextProgress.totalRequired} Blocks (${nextProgress.percentage}%)`
          );
        } else {
          soundEngine.playBlockPlace(nextCombo, level);
          setLastFeedbackBanner(
            `Assembled ${shape.name} (+${placementPoints} PTS) · ${activeMonument.name}: ${nextProgress.filledRequired}/${nextProgress.totalRequired} (${nextProgress.percentage}%)`
          );
        }

        // If any stray blocks prevent remaining pieces from fitting, auto-clean stray sky blocks in Puzzle Mode
        if (!monumentJustCompleted && !canAnyShapeFit(nextGrid, finalTray)) {
          for (let rr = 0; rr < GRID_SIZE; rr++) {
            for (let cc = 0; cc < GRID_SIZE; cc++) {
              if (activeMonument.blueprint[rr][cc] === 0) {
                nextGrid[rr][cc] = 0;
              }
            }
          }
          batchCountRef.current += 1;
          finalTray = generatePuzzleModeBatch(
            nextGrid,
            activeMonument.blueprint,
            rngRef.current,
            batchCountRef.current,
            activeMonument.letterGrid
          );
        }

        const nextAvailableIdx = finalTray.findIndex((item) => item !== null);
        setGrid(nextGrid);
        setTray(finalTray);
        setSelectedTrayIdx(nextAvailableIdx !== -1 ? nextAvailableIdx : null);
        setScore(nextScore);
        setLevel(nextLevel);
        setCombo(nextCombo);
        setPatternsInRun(nextPatternsInRun);
        setEarnedCreditsInRun(nextEarnedCredits);

        onRecordRunUpdate({
          score: nextScore,
          level: nextLevel,
          patternsInRun: nextPatternsInRun,
          earnedCredits: turnCreditDelta,
          mode,
        });
        return;
      }

      // =======================================================================
      // STANDARD ARCADE / DAILY / PRACTICE BRANCH
      // =======================================================================
      // 2. Check if the 3x3 Target Pattern was completed
      const matchedZone = findCompletedPatternZone(nextGrid, targetPattern);
      let patternBonusPts = 0;
      let patternBonusCredits = 0;
      let nextPatternsInRun = patternsInRun;
      let nextTarget = targetPattern;

      if (matchedZone) {
        patternBonusPts = targetPattern.bonusPoints * level;
        patternBonusCredits = targetPattern.bonusCredits;
        nextPatternsInRun += 1;

        for (let pr = 0; pr < 3; pr++) {
          for (let pc = 0; pc < 3; pc++) {
            if (targetPattern.matrix[pr][pc] === 1) {
              nextGrid[matchedZone.row + pr][matchedZone.col + pc] = 0;
            }
          }
        }

        nextTarget = selectNextPattern(rngRef.current, targetPattern.id);
        setTargetPattern(nextTarget);
        confetti({
          particleCount: 42,
          spread: 65,
          origin: { y: 0.6 },
        });
      }

      // 3. Check for full 8-cell rows and columns
      const fullRows: number[] = [];
      const fullCols: number[] = [];

      for (let r = 0; r < GRID_SIZE; r++) {
        if (nextGrid[r].every((val) => val !== 0)) {
          fullRows.push(r);
        }
      }
      for (let c = 0; c < GRID_SIZE; c++) {
        let colFull = true;
        for (let r = 0; r < GRID_SIZE; r++) {
          if (nextGrid[r][c] === 0) {
            colFull = false;
            break;
          }
        }
        if (colFull) fullCols.push(c);
      }

      const totalLinesCleared = fullRows.length + fullCols.length;
      fullRows.forEach((r) => {
        for (let c = 0; c < GRID_SIZE; c++) nextGrid[r][c] = 0;
      });
      fullCols.forEach((c) => {
        for (let r = 0; r < GRID_SIZE; r++) nextGrid[r][c] = 0;
      });

      // 4. Calculate points, combo, credits, and difficulty level progression
      const nextCombo =
        totalLinesCleared > 0 || matchedZone ? combo + 1 : 0;
      const placementPoints = cellsPlacedCount * 15 * level;
      const lineClearPoints =
        totalLinesCleared > 0
          ? 180 * totalLinesCleared * totalLinesCleared * Math.max(1, nextCombo)
          : 0;
      const lineClearCredits = totalLinesCleared * 2500;

      const turnScoreDelta = placementPoints + lineClearPoints + patternBonusPts;
      const turnCreditDelta =
        cellsPlacedCount * 150 + lineClearCredits + patternBonusCredits;

      const nextScore = score + turnScoreDelta;
      const nextEarnedCredits = earnedCreditsInRun + turnCreditDelta;
      const nextLevel = Math.floor(nextScore / 700) + 1;

      // 5. Update tray & check if all 3 blocks in the set are completed
      const updatedTray = tray.map((item, idx) =>
        idx === trayIndex ? null : item
      );
      const blockSetCompleted = updatedTray.every((item) => item === null);
      let finalTray = updatedTray;

      if (blockSetCompleted) {
        batchCountRef.current += 1;
        finalTray = generateBlockBatch(rngRef.current, batchCountRef.current);
      }

      // 6. Trigger Distinct Audio Bell Chimes
      if (nextLevel > level) {
        soundEngine.playLevelCompleteChime(triggerVisualShake);
        flashChimeAlert(
          `LEVEL ${level} COMPLETE CHIME! Welcome to Level ${nextLevel}`
        );
        confetti({
          particleCount: 55,
          spread: 75,
          origin: { y: 0.5 },
        });
      } else if (matchedZone) {
        soundEngine.playPatternComplete(triggerVisualShake);
        flashChimeAlert(`PATTERN SET COMPLETE CHIME! +${patternBonusPts} PTS`);
      } else if (blockSetCompleted) {
        soundEngine.playBlockSetCompleteChime(triggerVisualShake);
        flashChimeAlert('BLOCK SET COMPLETE CHIME! Fresh 3-Piece Set Dealt');
      } else if (totalLinesCleared > 0) {
        soundEngine.playLineClear(
          totalLinesCleared,
          nextCombo,
          triggerVisualShake
        );
      } else {
        soundEngine.playBlockPlace(nextCombo, level);
      }

      if (matchedZone && totalLinesCleared > 0) {
        setLastFeedbackBanner(
          `HYPER PULSE! ${targetPattern.name} + ${totalLinesCleared} Line(s) Cleared · +${turnScoreDelta} PTS`
        );
      } else if (matchedZone) {
        setLastFeedbackBanner(
          `PATTERN COMPLETED: ${targetPattern.name}! +${patternBonusPts} PTS · +${patternBonusCredits.toLocaleString()} CR`
        );
      } else if (blockSetCompleted) {
        setLastFeedbackBanner(
          `3-Block Set Completed! Bell Chime Ringing · New Block Set Ready`
        );
      } else if (totalLinesCleared > 0) {
        setLastFeedbackBanner(
          `${totalLinesCleared} Line(s) Cleared · ${nextCombo}x Rhythm Combo · +${turnScoreDelta} PTS`
        );
      } else {
        setLastFeedbackBanner(
          `Placed ${shape.name} (+${placementPoints} PTS) · Target: ${nextTarget.name}`
        );
      }

      const nextAvailableIdx = finalTray.findIndex((item) => item !== null);

      setGrid(nextGrid);
      setTray(finalTray);
      setSelectedTrayIdx(nextAvailableIdx !== -1 ? nextAvailableIdx : null);
      setScore(nextScore);
      setLevel(nextLevel);
      setCombo(nextCombo);
      setPatternsInRun(nextPatternsInRun);
      setEarnedCreditsInRun(nextEarnedCredits);

      if (!canAnyShapeFit(nextGrid, finalTray)) {
        if (mode === 'practice') {
          const autoCleared = nextGrid.map((row, r) =>
            row.map((val, c) =>
              r >= 2 && r <= 5 && c >= 2 && c <= 5 ? 0 : val
            )
          );
          setGrid(autoCleared);
          setLastFeedbackBanner(
            'Practice Session Auto-Cleared Center 4x4 so you can keep practicing!'
          );
        } else {
          soundEngine.playGameOver(triggerVisualShake);
          setGameState('GAME_OVER');
        }
      }

      onRecordRunUpdate({
        score: nextScore,
        level: nextLevel,
        patternsInRun: nextPatternsInRun,
        earnedCredits: turnCreditDelta,
        mode,
      });
    },
    [
      activeMonument,
      combo,
      earnedCreditsInRun,
      flashChimeAlert,
      grid,
      level,
      mode,
      onRecordRunUpdate,
      patternsInRun,
      score,
      targetPattern,
      tray,
      triggerVisualShake,
    ]
  );

  const handleExecuteAIBestMove = useCallback(() => {
    if (isLetterScrambleGame) {
      handleAutoFixOneLetter();
      return;
    }
    if (!bestMove) return;
    if (gameState !== 'PLAYING') {
      setGameState('PLAYING');
    }
    setSelectedTrayIdx(bestMove.trayIndex);
    executePlacementAtAnchor(
      bestMove.trayIndex,
      bestMove.row,
      bestMove.col,
      bestMove.rotatedCells
    );
  }, [
    bestMove,
    executePlacementAtAnchor,
    gameState,
    handleAutoFixOneLetter,
    isLetterScrambleGame,
  ]);

  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'PLAYING') {
      setGameState('PLAYING');
    }

    // SCRAMBLE SENTENCE / WORD MODE: Tap 2 letter squares on the 8x8 board to swap them!
    if (isLetterScrambleGame && activeMonument.letterGrid) {
      const clickedChar = scrambledLetterGrid[row]?.[col] || '';
      if (!clickedChar) return; // Empty space between words

      if (!swapSelectedCell) {
        setSwapSelectedCell({ r: row, c: col });
        soundEngine.playBlockSelect();
        return;
      }

      if (swapSelectedCell.r === row && swapSelectedCell.c === col) {
        setSwapSelectedCell(null);
        soundEngine.playBlockRotate();
        return;
      }

      executeLetterSquareSwap(
        swapSelectedCell.r,
        swapSelectedCell.c,
        row,
        col
      );
      return;
    }

    const activeIdx =
      selectedTrayIdx !== null && tray[selectedTrayIdx]
        ? selectedTrayIdx
        : tray.findIndex((s) => s !== null);

    if (activeIdx === -1 || activeIdx === null) return;
    const shape = tray[activeIdx];
    if (!shape) return;

    const smartAnchor = resolveSmartPlacementAnchor(
      grid,
      shape,
      row,
      col,
      mode === 'puzzle' ? activeMonument.blueprint : null
    );
    if (!smartAnchor) {
      soundEngine.triggerHaptic(25, triggerVisualShake);
      setLastFeedbackBanner(
        'Cannot fit block at that spot — try the glowing AI Hint zone or tap AI Auto-Move!'
      );
      return;
    }

    executePlacementAtAnchor(activeIdx, smartAnchor.r, smartAnchor.c);
  };

  const handleQuickPlaceBlock = useCallback(
    (idxToPlace: number) => {
      if (isLetterScrambleGame) {
        handleAutoFixOneLetter();
        return;
      }
      if (gameState !== 'PLAYING') {
        setGameState('PLAYING');
      }
      const shape = tray[idxToPlace];
      if (!shape) return;

      const singleTrayMove = computeBestMoveForTray(
        grid,
        tray.map((item, idx) => (idx === idxToPlace ? item : null)),
        targetPattern,
        mode === 'puzzle' ? activeMonument : null
      );

      if (singleTrayMove) {
        executePlacementAtAnchor(
          idxToPlace,
          singleTrayMove.row,
          singleTrayMove.col,
          singleTrayMove.rotatedCells
        );
        return;
      }

      soundEngine.triggerHaptic(25, triggerVisualShake);
      setLastFeedbackBanner(
        'No valid placement for this block — select another block in your tray!'
      );
    },
    [
      activeMonument,
      executePlacementAtAnchor,
      gameState,
      grid,
      handleAutoFixOneLetter,
      isLetterScrambleGame,
      mode,
      targetPattern,
      tray,
      triggerVisualShake,
    ]
  );

  const handleTrayBlockClick = (idx: number) => {
    const shape = tray[idx];
    if (!shape) return;

    if (gameState !== 'PLAYING') {
      setGameState('PLAYING');
    }

    if (selectedTrayIdx === idx) {
      handleQuickPlaceBlock(idx);
    } else {
      setSelectedTrayIdx(idx);
      soundEngine.playBlockSelect();
      setLastFeedbackBanner(
        `Selected ${shape.name} · Tap any grid square to place, or tap this block again to Quick-Place!`
      );
    }
  };

  useEffect(() => {
    if (!isDraggingBlock) return;
    const handleGlobalPointerUp = () => {
      if (
        isDraggingBlock &&
        hoverCoord &&
        selectedTrayIdx !== null &&
        tray[selectedTrayIdx]
      ) {
        const shape = tray[selectedTrayIdx]!;
        const anchor = resolveSmartPlacementAnchor(
          grid,
          shape,
          hoverCoord.r,
          hoverCoord.c,
          mode === 'puzzle' ? activeMonument.blueprint : null
        );
        if (anchor) {
          executePlacementAtAnchor(selectedTrayIdx, anchor.r, anchor.c);
        }
      }
      setIsDraggingBlock(false);
    };
    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  }, [
    isDraggingBlock,
    hoverCoord,
    selectedTrayIdx,
    tray,
    grid,
    executePlacementAtAnchor,
    mode,
    activeMonument.blueprint,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }
      if (gameState !== 'PLAYING' || subScreen !== 'play') return;
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRotateSelected();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (isLetterScrambleGame) {
          handleAutoFixOneLetter();
        } else if (selectedTrayIdx !== null && tray[selectedTrayIdx]) {
          handleQuickPlaceBlock(selectedTrayIdx);
        }
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        handleExecuteAIBestMove();
      } else if (e.key === '1' && tray[0]) {
        handleTrayBlockClick(0);
      } else if (e.key === '2' && tray[1]) {
        handleTrayBlockClick(1);
      } else if (e.key === '3' && tray[2]) {
        handleTrayBlockClick(2);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleContinueWithCredits = () => {
    if (credits < 10000) {
      onOpenPayPalModal();
      return;
    }
    const rescuedGrid = grid.map((row, r) =>
      row.map((val, c) => (r >= 2 && r <= 5 && c >= 2 && c <= 5 ? 0 : val))
    );
    setGrid(rescuedGrid);
    setGameState('PLAYING');
    soundEngine.playPatternComplete(triggerVisualShake);
    onRecordRunUpdate({
      score,
      level,
      patternsInRun,
      earnedCredits: -10000,
      mode,
    });
    setLastFeedbackBanner(
      'Arena Core Cleared (-10,000 CR) · Keep your high-score run alive!'
    );
  };

  const activeBlockColors =
    mode === 'puzzle' ? activeMonument.colors : palette.blockColors;

  const selectedShape =
    selectedTrayIdx !== null ? tray[selectedTrayIdx] : null;
  const resolvedHoverAnchor =
    hoverCoord && selectedShape && !isLetterScrambleGame
      ? resolveSmartPlacementAnchor(
          grid,
          selectedShape,
          hoverCoord.r,
          hoverCoord.c,
          mode === 'puzzle' ? activeMonument.blueprint : null
        )
      : null;

  const isCellInHoverPreview = (r: number, c: number): boolean => {
    if (isLetterScrambleGame || !selectedShape) return false;
    const anchor = resolvedHoverAnchor || hoverCoord;
    if (!anchor) return false;

    const relR = r - anchor.r;
    const relC = c - anchor.c;
    if (
      relR >= 0 &&
      relR < selectedShape.cells.length &&
      relC >= 0 &&
      relC < selectedShape.cells[0].length
    ) {
      return selectedShape.cells[relR][relC] === 1;
    }
    return false;
  };

  const isCellInAIHint = (r: number, c: number): boolean => {
    if (isLetterScrambleGame || !showAIHintOnBoard || !bestMove) return false;
    const relR = r - bestMove.row;
    const relC = c - bestMove.col;
    if (
      relR >= 0 &&
      relR < bestMove.rotatedCells.length &&
      relC >= 0 &&
      relC < bestMove.rotatedCells[0].length
    ) {
      return bestMove.rotatedCells[relR][relC] === 1;
    }
    return false;
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundEngine.soundEnabled = next;
  };

  const toggleHaptics = () => {
    const next = !hapticsOn;
    setHapticsOn(next);
    soundEngine.hapticsEnabled = next;
  };

  const cycleLanguage = () => {
    const nextLang: AppLanguage =
      language === 'bilingual' ? 'id' : language === 'id' ? 'en' : 'bilingual';
    onLanguageChange(nextLang);
    soundEngine.playBlockSelect();
  };

  const nextMonumentInList =
    MONUMENT_PUZZLES[(monumentIdx + 1) % MONUMENT_PUZZLES.length];

  const showId = language === 'id' || language === 'bilingual';
  const showEn = language === 'en' || language === 'bilingual';

  return (
    <div className="max-w-[440px] mx-auto">
      {/* ===================================================================== */}
      {/* SCREEN 2: DEDICATED VISUAL EXAMPLE & 37-GAME BRAIN WORKOUT GUIDE      */}
      {/* ===================================================================== */}
      {subScreen === 'visual_example' && (
        <VisualExampleCard
          isPracticeMode={mode === 'practice'}
          isPuzzleMode={mode === 'puzzle'}
          language={language}
          onLanguageChange={onLanguageChange}
          activeMonumentIndex={monumentIdx}
          onSelectAndPlayMonument={(idx) => {
            onModeChange('puzzle');
            loadMonumentPuzzle(idx, true);
          }}
          onStartPuzzleMode={() => {
            onModeChange('puzzle');
            loadMonumentPuzzle(monumentIdx, true);
          }}
          onStartGuidedDrill={() => {
            onModeChange('practice');
            loadPracticeDrill(0);
          }}
          onReturnToArena={() => setSubScreen('play')}
        />
      )}

      {/* ===================================================================== */}
      {/* SCREEN 3: DEDICATED GEMINI AI HELPER SCREEN                           */}
      {/* ===================================================================== */}
      {subScreen === 'ai_helper' && (
        <AIHelperPanel
          grid={grid}
          tray={tray}
          targetPattern={targetPattern}
          activeMonument={mode === 'puzzle' ? activeMonument : null}
          bestMove={bestMove}
          isShowingHintOnBoard={showAIHintOnBoard}
          onToggleHintOnBoard={() => setShowAIHintOnBoard((prev) => !prev)}
          onExecuteBestMove={handleExecuteAIBestMove}
          onReturnToArena={() => setSubScreen('play')}
        />
      )}

      {/* ===================================================================== */}
      {/* SCREEN 1: CLUTTER-FREE, ZERO-SCROLL GAME SCREEN                       */}
      {/* ===================================================================== */}
      {subScreen === 'play' && (
        <div
          style={{ backgroundColor: palette.bgCanvas }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800/90 p-2.5 sm:p-3 transition-colors duration-300 space-y-2 shadow-sm"
        >
          {/* Compact Top Bar: Mode Switcher + Score + Credits + Essential Icons */}
          <div
            style={{
              backgroundColor: palette.gridSurface,
              borderColor: palette.borderHairline,
            }}
            className="border rounded-xl px-2.5 py-2 space-y-1.5"
          >
            {/* Row 1: Mode Pills + Score & Credits */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onModeChange('puzzle');
                    loadMonumentPuzzle(monumentIdx, true);
                  }}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    mode === 'puzzle'
                      ? 'bg-violet-500 text-slate-950'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Puzzle
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Quick jump directly to the first Sentence Scramble game ("CAN YOU HELP ME FIND THE AIRPORT")
                    onModeChange('puzzle');
                    const firstSentenceIdx = MONUMENT_PUZZLES.findIndex(
                      (m) => m.category === 'Scramble Words'
                    );
                    loadMonumentPuzzle(
                      firstSentenceIdx !== -1 ? firstSentenceIdx : 0,
                      true
                    );
                  }}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    isLetterScrambleGame
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15'
                  }`}
                  title="Jump directly to English Sentence & Word Scramble Games"
                >
                  🔤 {language === 'id' ? 'Kalimat' : 'Words'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onModeChange('arcade');
                    startNewGame('arcade');
                  }}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    mode === 'arcade'
                      ? 'bg-sky-500 text-slate-950'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Arcade
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onModeChange('practice');
                    loadPracticeDrill(0);
                  }}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    mode === 'practice'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {language === 'id' ? 'Latihan' : 'Practice'}
                </button>
              </div>

              {/* Compact Score & Credits Readout */}
              <div className="flex items-center gap-2 font-mono text-right">
                <div>
                  <span className="text-[10px] text-slate-400 block leading-none">
                    {language === 'id' ? 'SKOR' : 'SCORE'}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {score.toLocaleString()}
                  </span>
                </div>
                <div className="pl-2 border-l border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-amber-500 block leading-none">
                    {language === 'id' ? 'KOIN' : 'CREDITS'}
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {credits.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2: Compact 37-Game Selector / Pattern Bar + Guide & Audio Toggles */}
            <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-200/70 dark:border-slate-800/80">
              {mode === 'puzzle' ? (
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {/* Mini 8x8 Target Icon */}
                  <div className="grid grid-cols-8 gap-[1px] p-0.5 bg-white dark:bg-slate-950 rounded border border-slate-300 dark:border-slate-800 shrink-0">
                    {activeMonument.blueprint.map((row, rIdx) =>
                      row.map((val, cIdx) => (
                        <div
                          key={`mini_${rIdx}_${cIdx}`}
                          style={{
                            backgroundColor:
                              val > 0
                                ? activeMonument.colors[(val - 1) % 4]
                                : isLightMode
                                ? '#f1f5f9'
                                : '#0f172a',
                          }}
                          className="w-1 h-1"
                        />
                      ))
                    )}
                  </div>

                  {/* Categorized 37-Game Selector Dropdown (Scramble Sentences & Words listed first for easy access!) */}
                  <select
                    value={monumentIdx}
                    onChange={(e) =>
                      loadMonumentPuzzle(Number(e.target.value), true)
                    }
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-[11px] font-bold rounded-lg px-1.5 py-1 focus:outline-none cursor-pointer truncate min-w-0 flex-1"
                    aria-label="Select Brain Workout Game"
                  >
                    {(
                      [
                        {
                          en: 'Scramble Words',
                          id: 'Susun Kalimat & Kata Inggris',
                        },
                        { en: 'Animals', id: 'Hewan Lucu' },
                        { en: 'Cars & Rides', id: 'Kendaraan' },
                        { en: 'Fruits & Treats', id: 'Buah & Camilan' },
                        { en: 'Scramble Blocks', id: 'Susun Balok' },
                        { en: 'Landmarks', id: 'Monumen Dunia' },
                      ] as const
                    ).map((cat) => (
                      <optgroup
                        key={cat.en}
                        label={
                          language === 'id'
                            ? `── ${cat.id} ──`
                            : language === 'en'
                            ? `── ${cat.en} ──`
                            : `── ${cat.en} / ${cat.id} ──`
                        }
                      >
                        {MONUMENT_PUZZLES.map((mon, idx) =>
                          mon.category === cat.en ? (
                            <option key={mon.id} value={idx}>
                              {mon.emoji}{' '}
                              {language === 'id'
                                ? mon.nameId
                                : language === 'en'
                                ? mon.name
                                : `${mon.name} / ${mon.nameId}`}
                            </option>
                          ) : null
                        )}
                      </optgroup>
                    ))}
                  </select>

                  {/* 1-Tap Next Game Button */}
                  <button
                    type="button"
                    onClick={() => loadMonumentPuzzle(monumentIdx + 1, true)}
                    className="px-1.5 py-1 rounded-md bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/40 text-violet-700 dark:text-violet-300 text-[10px] font-extrabold whitespace-nowrap cursor-pointer shrink-0"
                    title="Next Brain Workout Game"
                  >
                    🎲 {language === 'id' ? 'Lanjut' : 'Next'}
                  </button>

                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap shrink-0">
                    {monumentProgress.percentage}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="grid grid-cols-3 gap-0.5 p-0.5 bg-white dark:bg-slate-950 rounded border border-slate-300 dark:border-slate-800 shrink-0">
                    {targetPattern.matrix.map((row, rIdx) =>
                      row.map((val, cIdx) => (
                        <div
                          key={`${rIdx}_${cIdx}`}
                          style={{
                            backgroundColor:
                              val === 1
                                ? palette.accentPrimary
                                : isLightMode
                                ? '#e2e8f0'
                                : '#1e293b',
                          }}
                          className="w-1.5 h-1.5"
                        />
                      ))
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {language === 'id'
                      ? `Target: ${targetPattern.nameId || targetPattern.name}`
                      : language === 'en'
                      ? `Target: ${targetPattern.name}`
                      : `${targetPattern.name} / ${targetPattern.nameId || ''}`}
                  </span>
                </div>
              )}

              {/* Quick Compact Utility Icons: Answer Key / Guide, Undo, Sound */}
              <div className="flex items-center gap-1 shrink-0">
                {mode === 'puzzle' && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowBlueprintGuideOnBoard((prev) => !prev)
                    }
                    className={`px-1.5 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                      showBlueprintGuideOnBoard
                        ? 'bg-violet-500 text-slate-950 border-violet-400'
                        : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                    title={
                      isLetterScrambleGame
                        ? 'Show Small Target Letter Hints in Each Square'
                        : 'Toggle Blueprint Guide Outline on 8x8 Grid'
                    }
                  >
                    <Eye className="w-3 h-3" />
                    <span>
                      {showBlueprintGuideOnBoard
                        ? 'On'
                        : language === 'id'
                        ? 'Kunci'
                        : 'Peek'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleUndoMove}
                  disabled={undoHistory.length === 0}
                  className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-35 cursor-pointer"
                  title="Undo Last Move"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={toggleSound}
                  className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
                    soundOn
                      ? 'bg-sky-500/15 border-sky-500/40 text-sky-600 dark:text-sky-400'
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-400'
                  }`}
                  title="Toggle Sound & Chimes"
                >
                  {soundOn ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Row 3: Slim Brain Workout Bar + 1-Tap "Cara Main / How It Works" + Language Switcher */}
            <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-200/70 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Brain className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 truncate">
                  {mode === 'puzzle'
                    ? language === 'id'
                      ? activeMonument.brainSkillId
                      : language === 'en'
                      ? activeMonument.brainSkillEn
                      : `${activeMonument.brainSkillEn} · ${activeMonument.brainSkillId}`
                    : language === 'id'
                    ? 'Latihan Otak: Memori Spasial & Fokus Pola 3×3'
                    : language === 'en'
                    ? 'Brain Workout: Spatial Working Memory & 3×3 Pattern Focus'
                    : 'Brain Workout / Latihan Otak: 3×3 Pattern & Line Focus'}
                </span>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* 1-Tap Bilingual Description & How It Works Overlay Button */}
                <button
                  type="button"
                  onClick={() => setShowHowItWorksModal((prev) => !prev)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border transition-colors cursor-pointer flex items-center gap-1 ${
                    showHowItWorksModal
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                  }`}
                  title="Read Game Description & How It Works (English & Bahasa Indonesia)"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>
                    {language === 'id'
                      ? 'Cara Main'
                      : language === 'en'
                      ? 'How It Works'
                      : 'Cara Main / How?'}
                  </span>
                </button>

                {/* 1-Tap Language Cycle Pill (ID+EN / ID / EN) */}
                <button
                  type="button"
                  onClick={cycleLanguage}
                  className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-extrabold text-slate-700 dark:text-slate-200 cursor-pointer"
                  title="Switch Language: Bilingual (EN+ID) / Bahasa Indonesia / English"
                >
                  {language === 'bilingual'
                    ? '🇮🇩+🇬🇧'
                    : language === 'id'
                    ? '🇮🇩 ID'
                    : '🇬🇧 EN'}
                </button>
              </div>
            </div>
          </div>

          {/* Transient Chime Alert (Only appears for 2s when a chime rings) */}
          {chimeAlert && (
            <div className="bg-amber-500/20 border border-amber-500/50 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5">
              <BellRing className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{chimeAlert}</span>
            </div>
          )}

          {/* 8x8 Tactile Grid Container — Immediately Visible Without Scrolling */}
          <div className="relative w-full aspect-square max-w-[360px] sm:max-w-[400px] mx-auto">
            <div
              style={{
                backgroundColor: palette.gridSurface,
                borderColor:
                  beatStep === 0
                    ? palette.accentPrimary
                    : palette.borderHairline,
              }}
              onMouseLeave={() => setHoverCoord(null)}
              className={`w-full h-full p-2 rounded-2xl border-2 grid grid-cols-8 gap-1 sm:gap-1.5 transition-colors duration-150 ${
                tactileShake ? 'animate-tactile-shake' : ''
              }`}
            >
              {grid.map((row, rIdx) =>
                row.map((cellValue, cIdx) => {
                  const blueprintTargetVal =
                    mode === 'puzzle'
                      ? activeMonument.blueprint[rIdx]?.[cIdx] || 0
                      : 0;
                  const blueprintHex =
                    blueprintTargetVal > 0
                      ? activeMonument.colors[(blueprintTargetVal - 1) % 4]
                      : null;
                  const targetLetter =
                    mode === 'puzzle'
                      ? activeMonument.letterGrid?.[rIdx]?.[cIdx] || ''
                      : '';

                  // ===========================================================
                  // LETTER SCRAMBLE BOARD BRANCH (Every letter on its own square, shuffled!)
                  // ===========================================================
                  if (isLetterScrambleGame && activeMonument.letterGrid) {
                    const currentScrambledChar =
                      scrambledLetterGrid[rIdx]?.[cIdx] || '';
                    const isLetterTile = Boolean(targetLetter);
                    const isCorrectlySpelled =
                      isLetterTile && currentScrambledChar === targetLetter;
                    const isSelectedForSwap =
                      swapSelectedCell?.r === rIdx &&
                      swapSelectedCell?.c === cIdx;

                    const tileBg = !isLetterTile
                      ? palette.cellEmpty
                      : isSelectedForSwap
                      ? '#38bdf8'
                      : isCorrectlySpelled
                      ? '#10b981'
                      : blueprintHex || '#f59e0b';

                    const tileBorder = !isLetterTile
                      ? 'transparent'
                      : isSelectedForSwap
                      ? '#ffffff'
                      : isCorrectlySpelled
                      ? '#34d399'
                      : '#fde047';

                    return (
                      <button
                        key={`scramble_${rIdx}_${cIdx}`}
                        type="button"
                        disabled={!isLetterTile}
                        onClick={() => handleCellClick(rIdx, cIdx)}
                        style={{
                          backgroundColor: tileBg,
                          borderColor: tileBorder,
                        }}
                        className={`w-full h-full rounded-lg border-2 flex flex-col items-center justify-center relative transition-all duration-150 focus:outline-none ${
                          !isLetterTile
                            ? 'opacity-30 cursor-default'
                            : isSelectedForSwap
                            ? 'scale-110 z-10 shadow-lg cursor-pointer ring-2 ring-sky-300'
                            : 'hover:scale-105 cursor-pointer shadow-xs'
                        }`}
                        aria-label={
                          isLetterTile
                            ? `Letter Square ${currentScrambledChar} at Row ${
                                rIdx + 1
                              } Column ${cIdx + 1}`
                            : `Empty Space`
                        }
                      >
                        {isLetterTile && (
                          <>
                            <span
                              className={`text-sm sm:text-base font-mono font-black leading-none select-none ${
                                isSelectedForSwap
                                  ? 'text-slate-950'
                                  : isCorrectlySpelled
                                  ? 'text-slate-950'
                                  : 'text-slate-950'
                              }`}
                            >
                              {currentScrambledChar}
                            </span>

                            {/* Small checkmark when letter is in the right spot, or target letter hint when Peek/Kunci is ON */}
                            {isCorrectlySpelled ? (
                              <span className="absolute top-0.5 right-0.5 text-[8px] font-black text-slate-950/80 leading-none">
                                ✓
                              </span>
                            ) : showBlueprintGuideOnBoard ? (
                              <span className="absolute bottom-0.5 right-0.5 text-[8px] font-mono font-extrabold text-slate-950/85 bg-white/75 px-0.5 rounded leading-none">
                                {targetLetter}
                              </span>
                            ) : null}
                          </>
                        )}
                      </button>
                    );
                  }

                  // ===========================================================
                  // STANDARD BLOCK PLACEMENT CELL RENDERING
                  // ===========================================================
                  const inPreview = isCellInHoverPreview(rIdx, cIdx);
                  const inAIHint = isCellInAIHint(rIdx, cIdx);
                  const previewValid = resolvedHoverAnchor !== null;

                  const blockHex =
                    cellValue > 0
                      ? activeBlockColors[(cellValue - 1) % 4]
                      : inPreview && selectedShape
                      ? activeBlockColors[
                          (selectedShape.colorIndex - 1) % 4
                        ]
                      : palette.cellEmpty;

                  const isUnfilledBlueprintCell =
                    mode === 'puzzle' &&
                    showBlueprintGuideOnBoard &&
                    cellValue === 0 &&
                    blueprintTargetVal > 0;

                  return (
                    <button
                      key={`${rIdx}_${cIdx}`}
                      type="button"
                      onPointerEnter={() =>
                        setHoverCoord({ r: rIdx, c: cIdx })
                      }
                      onClick={() => handleCellClick(rIdx, cIdx)}
                      style={{
                        backgroundColor:
                          cellValue > 0
                            ? activeSkin.innerStyle === 'hollow' ||
                              activeSkin.innerStyle === 'monolith'
                              ? isLightMode
                                ? '#f8fafc'
                                : '#0b0f17'
                              : blockHex
                            : inPreview
                            ? previewValid
                              ? `${blockHex}99`
                              : '#ef444455'
                            : inAIHint
                            ? '#10b98138'
                            : isUnfilledBlueprintCell && blueprintHex
                            ? `${blueprintHex}28`
                            : palette.cellEmpty,
                        borderColor:
                          cellValue > 0
                            ? mode === 'puzzle' && blueprintTargetVal === 0
                              ? '#f59e0b'
                              : blockHex
                            : inPreview
                            ? previewValid
                              ? blockHex
                              : '#ef4444'
                            : inAIHint
                            ? '#10b981'
                            : isUnfilledBlueprintCell && blueprintHex
                            ? `${blueprintHex}99`
                            : 'transparent',
                      }}
                      className={`w-full h-full ${
                        activeSkin.borderRadiusClass
                      } border-2 flex items-center justify-center relative transition-transform duration-100 focus:outline-none cursor-pointer ${
                        cellValue > 0
                          ? 'scale-100'
                          : inAIHint && !inPreview
                          ? 'animate-pulse-target border-dashed'
                          : isUnfilledBlueprintCell
                          ? 'border-dashed hover:scale-[1.03]'
                          : 'hover:scale-[1.03]'
                      }`}
                      aria-label={`Grid Row ${rIdx + 1} Column ${cIdx + 1}`}
                    >
                      {cellValue === 0 && inAIHint && !inPreview && (
                        <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-300">
                          AI
                        </span>
                      )}
                      {cellValue === 0 &&
                        !inAIHint &&
                        !inPreview &&
                        isUnfilledBlueprintCell &&
                        blueprintHex && (
                          <span
                            style={{ backgroundColor: blueprintHex }}
                            className="w-1.5 h-1.5 rounded-full opacity-75"
                          />
                        )}
                      {cellValue > 0 &&
                        activeSkin.innerStyle === 'dot' && (
                          <span className="w-2 h-2 rounded-full bg-slate-950/75" />
                        )}
                      {cellValue > 0 &&
                        activeSkin.innerStyle === 'prism' && (
                          <span className="w-3.5 h-3.5 border border-white/65" />
                        )}
                      {cellValue > 0 &&
                        activeSkin.innerStyle === 'striated' && (
                          <span className="w-full h-1 bg-slate-950/45" />
                        )}
                      {cellValue > 0 &&
                        activeSkin.innerStyle === 'monolith' && (
                          <span
                            style={{ backgroundColor: blockHex }}
                            className="w-2.5 h-2.5"
                          />
                        )}
                    </button>
                  );
                })
              )}
            </div>

            {/* OVERLAY: BILINGUAL BRAIN WORKOUT & HOW IT WORKS CARD (Zero-Scroll On-Board Popup) */}
            {showHowItWorksModal && (
              <div className="absolute inset-0 bg-slate-950/94 backdrop-blur-md rounded-2xl p-3.5 flex flex-col justify-between text-left border-2 border-emerald-500/60 z-20 overflow-y-auto">
                <div className="space-y-2">
                  {/* Top Header + Language Switcher + Close Button */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-2xl shrink-0">
                        {mode === 'puzzle' ? activeMonument.emoji : '🧠'}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                          {mode === 'puzzle'
                            ? `${activeMonument.category} / ${activeMonument.categoryId}`
                            : 'Arcade Pattern Workout / Latihan Pola'}
                        </div>
                        <h3 className="text-sm font-extrabold font-display text-white truncate">
                          {mode === 'puzzle'
                            ? `${activeMonument.name} · ${activeMonument.nameId}`
                            : `${targetPattern.name} · ${
                                targetPattern.nameId || ''
                              }`}
                        </h3>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowHowItWorksModal(false)}
                      className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer shrink-0"
                      aria-label="Close How It Works"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick 3-Mode Language Pill Bar inside Modal */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    {(
                      [
                        { id: 'bilingual', label: '🇮🇩+🇬🇧 Bilingual' },
                        { id: 'id', label: '🇮🇩 Bahasa Indonesia' },
                        { id: 'en', label: '🇬🇧 English' },
                      ] as { id: AppLanguage; label: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onLanguageChange(opt.id)}
                        className={`flex-1 py-1 px-1.5 rounded text-[10px] font-extrabold transition-colors cursor-pointer ${
                          language === opt.id
                            ? 'bg-emerald-500 text-slate-950'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Brain Workout Skill Badge */}
                  <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-lg p-2 space-y-0.5">
                    <div className="text-[10px] font-mono font-bold uppercase text-emerald-300 flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      <span>
                        {language === 'id'
                          ? 'Manfaat Latihan Otak:'
                          : language === 'en'
                          ? 'Brain Workout Benefit:'
                          : 'Brain Workout / Manfaat Latihan Otak:'}
                      </span>
                    </div>
                    {showEn && (
                      <p className="text-[11px] font-bold text-white leading-snug">
                        🇬🇧{' '}
                        {mode === 'puzzle'
                          ? activeMonument.brainSkillEn
                          : 'Spatial Working Memory, 3×3 Pattern Recognition & Line Planning'}
                      </p>
                    )}
                    {showId && (
                      <p className="text-[11px] font-semibold text-emerald-200 leading-snug">
                        🇮🇩{' '}
                        {mode === 'puzzle'
                          ? activeMonument.brainSkillId
                          : 'Memori Kerja Spasial, Pengenalan Pola 3×3 & Perencanaan Baris'}
                      </p>
                    )}
                  </div>

                  {/* Game Description (EN & ID) */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase text-sky-400">
                      {language === 'id'
                        ? 'Tentang Permainan Ini:'
                        : language === 'en'
                        ? 'About This Game:'
                        : 'About This Game / Tentang Permainan:'}
                    </div>
                    {showEn && (
                      <p className="text-[11px] text-slate-200 leading-snug">
                        🇬🇧{' '}
                        {mode === 'puzzle'
                          ? activeMonument.description
                          : 'Arrange polyomino blocks anywhere on the 8×8 board to form the 3×3 target shape or clear full 8-cell rows and columns.'}
                      </p>
                    )}
                    {showId && (
                      <p className="text-[11px] text-amber-200/95 leading-snug">
                        🇮🇩{' '}
                        {mode === 'puzzle'
                          ? activeMonument.descriptionId
                          : 'Susun balok pada papan 8×8 untuk membentuk pola target 3×3 atau penuhi baris dan kolom 8 kotak.'}
                      </p>
                    )}
                  </div>

                  {/* Step-by-Step How It Works (EN & ID) */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2 space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase text-violet-400">
                      {language === 'id'
                        ? 'Cara Bermain (Langkah demi Langkah):'
                        : language === 'en'
                        ? 'How It Works (Step-by-Step):'
                        : 'How It Works / Cara Bermain:'}
                    </div>
                    {showEn && (
                      <p className="text-[11px] text-slate-200 leading-snug">
                        🇬🇧{' '}
                        {mode === 'puzzle'
                          ? activeMonument.howItWorksEn
                          : '1) Pick any block below. 2) Tap Rotate (R) if needed. 3) Tap the 8×8 grid (or tap Place) to complete the target pattern!'}
                      </p>
                    )}
                    {showId && (
                      <p className="text-[11px] text-emerald-200 leading-snug">
                        🇮🇩{' '}
                        {mode === 'puzzle'
                          ? activeMonument.howItWorksId
                          : '1) Pilih balok di bawah. 2) Ketuk Putar bila perlu. 3) Ketuk papan 8×8 (atau ketuk Pasang) untuk menyelesaikan pola!'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Action Buttons inside Modal */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowHowItWorksModal(false);
                      setSubScreen('visual_example');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] font-bold cursor-pointer"
                  >
                    📚{' '}
                    {language === 'id'
                      ? 'Katalog Semua Game'
                      : 'All Games Guide'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (mode === 'puzzle') {
                        setShowBlueprintGuideOnBoard(true);
                      }
                      setShowHowItWorksModal(false);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-extrabold cursor-pointer flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>
                      {language === 'id'
                        ? 'Mulai Main!'
                        : language === 'en'
                        ? 'Play Now!'
                        : 'Mainkan / Play!'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* OVERLAY: MONUMENT_COMPLETE */}
            {gameState === 'MONUMENT_COMPLETE' && (
              <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 border border-violet-500/50">
                <div className="text-3xl">{activeMonument.emoji}</div>
                <div className="space-y-1">
                  <div className="text-[11px] text-emerald-400 font-mono font-bold uppercase">
                    100% {activeMonument.category} / {activeMonument.categoryId}{' '}
                    Selesai!
                  </div>
                  <h3 className="text-lg font-extrabold font-display text-white">
                    {activeMonument.sentenceEn
                      ? `"${activeMonument.sentenceEn}"`
                      : `${activeMonument.name} · ${activeMonument.nameId}`}
                  </h3>
                  {activeMonument.sentenceId && (
                    <p className="text-xs font-bold text-amber-300">
                      🇮🇩 &ldquo;{activeMonument.sentenceId}&rdquo;
                    </p>
                  )}
                  <p className="text-[11px] text-emerald-300 font-semibold">
                    🧠 {activeMonument.brainSkillEn} /{' '}
                    {activeMonument.brainSkillId}
                  </p>
                  <p className="text-xs font-mono text-amber-400">
                    +{activeMonument.bonusPoints * Math.max(1, level - 1)} PTS ·
                    +{activeMonument.bonusCredits.toLocaleString()} CR
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {activeMonument.sentenceEn && (
                    <button
                      type="button"
                      onClick={() =>
                        speakEnglishTextAloud(activeMonument.sentenceEn!)
                      }
                      className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>
                        {language === 'id' ? 'Dengar Kalimat' : 'Hear Sentence'}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => loadMonumentPuzzle(monumentIdx + 1, true)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <span>
                      {language === 'id' ? 'Lanjut:' : 'Next:'}{' '}
                      {nextMonumentInList.emoji}{' '}
                      {language === 'id'
                        ? nextMonumentInList.nameId
                        : nextMonumentInList.name}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => loadMonumentPuzzle(monumentIdx, true)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    {language === 'id' ? 'Acak Lagi' : 'Shuffle Again'}
                  </button>
                </div>
              </div>
            )}

            {/* OVERLAY: PAUSED */}
            {gameState === 'PAUSED' && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 border border-slate-800">
                <h3 className="text-xl font-bold font-display text-white">
                  {language === 'id' ? 'Permainan Dijeda' : 'Game Paused'}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGameState('PLAYING')}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg"
                  >
                    {language === 'id' ? 'Lanjutkan' : 'Resume'}
                  </button>
                  <button
                    onClick={() => startNewGame(mode)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg"
                  >
                    {language === 'id' ? 'Mulai Baru' : 'Start Fresh'}
                  </button>
                </div>
              </div>
            )}

            {/* OVERLAY: GAME_OVER */}
            {gameState === 'GAME_OVER' && (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 border border-slate-800">
                <h3 className="text-xl font-extrabold font-display text-white">
                  {language === 'id' ? 'Skor Akhir:' : 'Final Score:'}{' '}
                  {score.toLocaleString()}
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => startNewGame(mode)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {language === 'id' ? 'Mulai Baru' : 'Start New Game'}
                    </span>
                  </button>
                  <button
                    onClick={handleContinueWithCredits}
                    className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg"
                  >
                    {language === 'id'
                      ? 'Lanjut (10K Koin)'
                      : 'Continue (10K CR)'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* COMPACT BOTTOM DOCK: Either English Sentence/Word Comprehension & Tile Shuffler OR 3-Piece Block Tray */}
          <div className="w-full max-w-[360px] sm:max-w-[400px] mx-auto bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-2 shadow-xs">
            {isLetterScrambleGame ? (
              /* ============================================================= */
              /* ENGLISH SENTENCE & WORD SCRAMBLE COMPREHENSION DOCK           */
              /* ============================================================= */
              <div className="space-y-1.5">
                {/* Target English Sentence + Bahasa Indonesia Meaning + Speak Button */}
                <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 space-y-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase text-sky-600 dark:text-sky-400">
                      {swapSelectedCell
                        ? language === 'id'
                          ? `✨ Huruf "${
                              scrambledLetterGrid[swapSelectedCell.r]?.[
                                swapSelectedCell.c
                              ]
                            }" dipilih — Ketuk kotak lain untuk menukar!`
                          : `✨ Letter "${
                              scrambledLetterGrid[swapSelectedCell.r]?.[
                                swapSelectedCell.c
                              ]
                            }" selected — Tap another square to swap!`
                        : language === 'id'
                        ? '👆 Ketuk 2 kotak huruf di papan untuk menukar & mengeja:'
                        : '👆 Tap any 2 letter squares on board to swap & spell:'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        speakEnglishTextAloud(
                          activeMonument.sentenceEn || activeMonument.name
                        )
                      }
                      className="px-2 py-0.5 rounded bg-sky-500 hover:bg-sky-400 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Listen to English Pronunciation"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{language === 'id' ? 'Suara' : 'Speak'}</span>
                    </button>
                  </div>

                  {/* Full Target English Sentence */}
                  <div className="text-xs sm:text-sm font-mono font-black tracking-wide text-slate-900 dark:text-white leading-snug">
                    🇬🇧 &ldquo;{activeMonument.sentenceEn || activeMonument.name}&rdquo;
                  </div>

                  {/* Full Indonesian Meaning */}
                  {activeMonument.sentenceId && (
                    <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 leading-snug">
                      🇮🇩 Artinya: &ldquo;{activeMonument.sentenceId}&rdquo;
                    </div>
                  )}

                  {/* Word-by-Word Interactive Vocabulary Chips (Tap any word to hear it spoken!) */}
                  {activeMonument.wordTranslations && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {activeMonument.wordTranslations.map((w, wIdx) => {
                        let wordDone = true;
                        for (let cc = w.startCol; cc <= w.endCol; cc++) {
                          if (
                            scrambledLetterGrid[w.row]?.[cc] !==
                            activeMonument.letterGrid?.[w.row]?.[cc]
                          ) {
                            wordDone = false;
                            break;
                          }
                        }
                        return (
                          <button
                            key={`${w.en}_${wIdx}`}
                            type="button"
                            onClick={() => speakEnglishTextAloud(w.en)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                              wordDone
                                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-700 dark:text-emerald-300'
                                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                            title={`Tap to hear "${w.en}" (${w.id})`}
                          >
                            <span>{wordDone ? '✓' : '•'}</span>
                            <span className="font-black">{w.en}</span>
                            <span className="text-[9px] opacity-80">
                              ({w.id})
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ============================================================= */
              /* 3-PIECE BLOCK TRAY FOR PICTURE & ARCADE GAMES                 */
              /* ============================================================= */
              <div className="grid grid-cols-3 gap-2">
                {tray.map((shape, idx) => {
                  const isSelected = selectedTrayIdx === idx && shape !== null;
                  const hex = shape
                    ? activeBlockColors[(shape.colorIndex - 1) % 4]
                    : '#94a3b8';

                  return (
                    <button
                      key={shape ? shape.id : `empty_${idx}`}
                      type="button"
                      disabled={!shape}
                      onPointerDown={() => {
                        if (shape) {
                          setSelectedTrayIdx(idx);
                          setIsDraggingBlock(true);
                        }
                      }}
                      onClick={() => handleTrayBlockClick(idx)}
                      className={`min-h-[78px] rounded-lg border-2 flex flex-col items-center justify-between p-1.5 transition-all cursor-pointer ${
                        !shape
                          ? 'bg-slate-100/50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800/40 opacity-35 cursor-default'
                          : isSelected
                          ? 'bg-sky-50/70 dark:bg-slate-950 border-sky-500 dark:border-sky-400'
                          : 'bg-slate-50 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      {shape ? (
                        <>
                          <div className="flex-1 flex items-center justify-center my-0.5">
                            <div
                              style={{
                                gridTemplateColumns: `repeat(${shape.cells[0].length}, minmax(0, 1fr))`,
                              }}
                              className="grid gap-0.5"
                            >
                              {shape.cells.map((r, rIdx) =>
                                r.map((val, cIdx) => {
                                  const cellChar =
                                    shape.cellLetters?.[rIdx]?.[cIdx] || '';
                                  return (
                                    <div
                                      key={`${rIdx}_${cIdx}`}
                                      style={{
                                        backgroundColor:
                                          val === 1 ? hex : 'transparent',
                                      }}
                                      className={`${
                                        cellChar ? 'w-4 h-4' : 'w-3 h-3'
                                      } rounded-[2px] flex items-center justify-center`}
                                    >
                                      {val === 1 && cellChar ? (
                                        <span className="text-[9px] font-mono font-black text-slate-950 leading-none">
                                          {cellChar}
                                        </span>
                                      ) : null}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                          <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center leading-tight">
                            {isSelected
                              ? language === 'id'
                                ? 'Ketuk Pasang'
                                : 'Tap to Place'
                              : shape.name}
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center">
                          <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
                            {language === 'id' ? 'Selesai' : 'Done'}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 4 Essential Gameplay Buttons in 1 Clean Row */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() =>
                  isLetterScrambleGame
                    ? handleReshuffleLetterBoard()
                    : startNewGame(mode)
                }
                className="py-2 px-2 bg-emerald-500 hover:bg-emerald-400 text-[11px] font-extrabold text-slate-950 rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                title={
                  isLetterScrambleGame
                    ? 'Shuffle Letter Squares on the Board'
                    : 'Start New Game From Scratch / Mulai Permainan Baru'
                }
              >
                {isLetterScrambleGame ? (
                  <>
                    <Shuffle className="w-3 h-3 shrink-0" />
                    <span>{language === 'id' ? 'Acak' : 'Shuffle'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current shrink-0" />
                    <span>{language === 'id' ? 'Mulai' : 'Start'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isLetterScrambleGame) {
                    handleAutoFixOneLetter();
                  } else if (
                    selectedTrayIdx !== null &&
                    tray[selectedTrayIdx]
                  ) {
                    handleQuickPlaceBlock(selectedTrayIdx);
                  } else {
                    handleExecuteAIBestMove();
                  }
                }}
                disabled={!isLetterScrambleGame && !bestMove}
                className="py-2 px-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-[11px] font-extrabold text-slate-950 rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                title={
                  isLetterScrambleGame
                    ? 'Auto-Swap 1 Misplaced Letter Square Into Correct Position'
                    : 'Auto-Place Selected Block / Pasang Otomatis'
                }
              >
                <Zap className="w-3 h-3 shrink-0" />
                <span>
                  {isLetterScrambleGame
                    ? language === 'id'
                      ? 'Bantu 1'
                      : 'Fix 1'
                    : language === 'id'
                    ? 'Pasang'
                    : 'Place'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isLetterScrambleGame) {
                    loadMonumentPuzzle(monumentIdx + 1, true);
                  } else {
                    handleRotateSelected();
                  }
                }}
                disabled={
                  !isLetterScrambleGame &&
                  (selectedTrayIdx === null || !tray[selectedTrayIdx])
                }
                className="py-2 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-[11px] font-bold text-slate-800 dark:text-sky-400 rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                title={
                  isLetterScrambleGame
                    ? 'Go to Next Sentence / Kalimat Berikutnya'
                    : 'Rotate Selected Block / Putar Balok'
                }
              >
                {isLetterScrambleGame ? (
                  <>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <span>{language === 'id' ? 'Kalimat' : 'Next'}</span>
                  </>
                ) : (
                  <>
                    <RotateCw className="w-3 h-3 shrink-0" />
                    <span>{language === 'id' ? 'Putar' : 'Rotate'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleClearPointsButton(true, 0)}
                className="py-2 px-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-[11px] font-extrabold text-rose-600 dark:text-rose-300 rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                title="Clear All Credits, Points, High Score & Board to 0"
              >
                <Trash2 className="w-3 h-3 shrink-0" />
                <span>{language === 'id' ? 'Reset 0' : 'Clear 0'}</span>
              </button>
            </div>

            {/* Quiet Bottom Links for Separate Screens (All Games Guide & AI Coach) */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/70 text-[10px] text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => setSubScreen('visual_example')}
                className="hover:text-sky-500 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <BookOpen className="w-3 h-3" />
                <span>
                  {language === 'id'
                    ? 'Panduan Semua Game'
                    : language === 'en'
                    ? 'All Games Guide'
                    : 'Panduan Game / Guide'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSubScreen('ai_helper')}
                className="hover:text-emerald-400 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Bot className="w-3 h-3" />
                <span>
                  {language === 'id'
                    ? 'Bantuan AI'
                    : language === 'en'
                    ? 'AI Helper'
                    : 'AI Helper / Bantuan AI'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleClearPointsButton(true, 100000)}
                className="hover:text-amber-400 cursor-pointer"
              >
                Reset 100K
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
