import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
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
} from 'lucide-react';

export type ArenaSubScreen = 'play' | 'visual_example' | 'ai_helper';

interface ArcadeArenaProps {
  mode: GameMode;
  onModeChange: (newMode: GameMode) => void;
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

interface UndoSnapshot {
  grid: number[][];
  tray: (BlockShape | null)[];
  score: number;
  level: number;
  combo: number;
  patternsInRun: number;
  targetPattern: TargetPattern;
}

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

  // Separate Screen Switcher: 'play' (Dedicated Game Screen), 'visual_example' (Visual Example Screen), 'ai_helper' (AI Helper Screen)
  const [subScreen, setSubScreen] = useState<ArenaSubScreen>('play');

  // Concrete Monument Puzzle State (NYC Skyline, Eiffel Tower, Golden Gate Bridge, Statue of Liberty, Tokyo Pagoda)
  const [monumentIdx, setMonumentIdx] = useState<number>(0);
  const [completedMonumentIds, setCompletedMonumentIds] = useState<string[]>(
    []
  );
  // Start with a clean blank 8x8 grid from scratch (user can toggle guide outline if desired)
  const [showBlueprintGuideOnBoard, setShowBlueprintGuideOnBoard] =
    useState<boolean>(false);
  const activeMonument: TargetMonumentPuzzle =
    MONUMENT_PUZZLES[monumentIdx % MONUMENT_PUZZLES.length];

  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [grid, setGrid] = useState<number[][]>(() =>
    Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0))
  );
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

  const monumentProgress = React.useMemo(
    () => getMonumentProgress(grid, activeMonument.blueprint),
    [grid, activeMonument.blueprint]
  );

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

      setMonumentIdx(safeIdx);
      setGrid(emptyGrid);
      setTray(tailoredBatch);
      setSelectedTrayIdx(0);
      setScore(0);
      setCombo(0);
      setUndoHistory([]);
      setGameState('PLAYING');
      if (clearPatternFromScratch) {
        setShowBlueprintGuideOnBoard(false);
        setShowAIHintOnBoard(false);
      }
      setSubScreen('play');
      setLastFeedbackBanner(
        `Started ${monument.emoji} ${monument.name} From Scratch! Place blocks to build the target.`
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
    const firstAvail = last.tray.findIndex((s) => s !== null);
    setSelectedTrayIdx(firstAvail !== -1 ? firstAvail : 0);
    setUndoHistory((prev) => prev.slice(0, -1));
    setGameState('PLAYING');
    soundEngine.playBlockRotate();
    setLastFeedbackBanner('Move Undone · Try a different placement!');
  };

  const handleRotateSelected = useCallback(() => {
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
  }, [gameState, selectedTrayIdx, tray]);

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
      // PUZZLE MODE BRANCH: 30 Games (Animals, Cars, Fruits, Scramble Words, etc.)
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
            `🎉 ${activeMonument.emoji} ${activeMonument.name} COMPLETE! (+${monumentBonusPts} PTS)`
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
  }, [bestMove, executePlacementAtAnchor, gameState]);

  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'PLAYING') {
      setGameState('PLAYING');
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
        if (selectedTrayIdx !== null && tray[selectedTrayIdx]) {
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
    hoverCoord && selectedShape
      ? resolveSmartPlacementAnchor(
          grid,
          selectedShape,
          hoverCoord.r,
          hoverCoord.c,
          mode === 'puzzle' ? activeMonument.blueprint : null
        )
      : null;

  const isCellInHoverPreview = (r: number, c: number): boolean => {
    if (!selectedShape) return false;
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
    if (!showAIHintOnBoard || !bestMove) return false;
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

  const nextMonumentInList =
    MONUMENT_PUZZLES[(monumentIdx + 1) % MONUMENT_PUZZLES.length];

  return (
    <div className="max-w-[440px] mx-auto">
      {/* ===================================================================== */}
      {/* SCREEN 2: DEDICATED VISUAL EXAMPLE SCREEN                             */}
      {/* ===================================================================== */}
      {subScreen === 'visual_example' && (
        <VisualExampleCard
          isPracticeMode={mode === 'practice'}
          isPuzzleMode={mode === 'puzzle'}
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
          className="rounded-2xl border border-slate-200 dark:border-slate-800/90 p-2.5 sm:p-3.5 transition-colors duration-300 space-y-2 shadow-sm"
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
                    onModeChange('daily');
                    startNewGame('daily');
                  }}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    mode === 'daily'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onModeChange('practice');
                    loadPracticeDrill(0);
                  }}
                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                    mode === 'practice'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Practice
                </button>
              </div>

              {/* Compact Score & Credits Readout */}
              <div className="flex items-center gap-2 font-mono text-right">
                <div>
                  <span className="text-[10px] text-slate-400 block leading-none">
                    SCORE
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {score.toLocaleString()}
                  </span>
                </div>
                <div className="pl-2 border-l border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-amber-500 block leading-none">
                    CREDITS
                  </span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {credits.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Row 2: Compact 30-Game Selector / Pattern Bar + Guide & Audio Toggles */}
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

                  {/* Categorized 30-Game Selector Dropdown */}
                  <select
                    value={monumentIdx}
                    onChange={(e) =>
                      loadMonumentPuzzle(Number(e.target.value), true)
                    }
                    className="bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-[11px] font-bold rounded-lg px-1.5 py-1 focus:outline-none cursor-pointer truncate min-w-0 flex-1"
                    aria-label="Select Fun Game or Puzzle"
                  >
                    {(
                      [
                        'Animals',
                        'Cars & Rides',
                        'Fruits & Treats',
                        'Scramble Words',
                        'Scramble Blocks',
                        'Landmarks',
                      ] as const
                    ).map((cat) => (
                      <optgroup key={cat} label={`── ${cat} ──`}>
                        {MONUMENT_PUZZLES.map((mon, idx) =>
                          mon.category === cat ? (
                            <option key={mon.id} value={idx}>
                              {mon.emoji} {mon.name}
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
                    title="Next Fun Game (30 Games Available!)"
                  >
                    🎲 Next
                  </button>

                  <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap shrink-0">
                    {monumentProgress.percentage}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
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
                    Target: {targetPattern.name}
                  </span>
                </div>
              )}

              {/* Quick Compact Utility Icons: Guide Outline, Undo, Sound */}
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
                    title="Toggle Blueprint Guide Outline on 8x8 Grid"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{showBlueprintGuideOnBoard ? 'On' : 'Guide'}</span>
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
                  const inPreview = isCellInHoverPreview(rIdx, cIdx);
                  const inAIHint = isCellInAIHint(rIdx, cIdx);
                  const previewValid = resolvedHoverAnchor !== null;

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
                      {/* Scramble Word Letter on Placed Block */}
                      {cellValue > 0 && targetLetter ? (
                        <span className="text-xs sm:text-sm font-mono font-black text-slate-950 drop-shadow-xs select-none">
                          {targetLetter}
                        </span>
                      ) : null}

                      {/* Scramble Word Faint Guide Letter when Guide is ON */}
                      {cellValue === 0 &&
                        !inAIHint &&
                        !inPreview &&
                        isUnfilledBlueprintCell &&
                        targetLetter && (
                          <span className="text-[10px] font-mono font-extrabold text-slate-700 dark:text-slate-200 opacity-75 select-none">
                            {targetLetter}
                          </span>
                        )}

                      {cellValue === 0 && inAIHint && !inPreview && (
                        <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-300">
                          {targetLetter || 'AI'}
                        </span>
                      )}
                      {cellValue === 0 &&
                        !inAIHint &&
                        !inPreview &&
                        isUnfilledBlueprintCell &&
                        !targetLetter &&
                        blueprintHex && (
                          <span
                            style={{ backgroundColor: blueprintHex }}
                            className="w-1.5 h-1.5 rounded-full opacity-75"
                          />
                        )}
                      {cellValue > 0 &&
                        !targetLetter &&
                        activeSkin.innerStyle === 'dot' && (
                          <span className="w-2 h-2 rounded-full bg-slate-950/75" />
                        )}
                      {cellValue > 0 &&
                        !targetLetter &&
                        activeSkin.innerStyle === 'prism' && (
                          <span className="w-3.5 h-3.5 border border-white/65" />
                        )}
                      {cellValue > 0 &&
                        !targetLetter &&
                        activeSkin.innerStyle === 'striated' && (
                          <span className="w-full h-1 bg-slate-950/45" />
                        )}
                      {cellValue > 0 &&
                        !targetLetter &&
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

            {/* OVERLAY: MONUMENT_COMPLETE */}
            {gameState === 'MONUMENT_COMPLETE' && (
              <div className="absolute inset-0 bg-slate-950/92 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 border border-violet-500/50">
                <div className="text-3xl">{activeMonument.emoji}</div>
                <div className="space-y-1">
                  <div className="text-[11px] text-emerald-400 font-mono font-bold uppercase">
                    100% {activeMonument.category} Complete!
                  </div>
                  <h3 className="text-xl font-extrabold font-display text-white">
                    {activeMonument.name}
                  </h3>
                  <p className="text-xs font-mono text-amber-400">
                    +{activeMonument.bonusPoints * Math.max(1, level - 1)} PTS ·
                    +{activeMonument.bonusCredits.toLocaleString()} CR
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => loadMonumentPuzzle(monumentIdx + 1, true)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <span>
                      Next: {nextMonumentInList.emoji} {nextMonumentInList.name}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => loadMonumentPuzzle(monumentIdx, true)}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
                  >
                    Replay
                  </button>
                </div>
              </div>
            )}

            {/* OVERLAY: PAUSED */}
            {gameState === 'PAUSED' && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 border border-slate-800">
                <h3 className="text-xl font-bold font-display text-white">
                  Game Paused
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setGameState('PLAYING')}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg"
                  >
                    Resume
                  </button>
                  <button
                    onClick={() => startNewGame(mode)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg"
                  >
                    Start Fresh
                  </button>
                </div>
              </div>
            )}

            {/* OVERLAY: GAME_OVER */}
            {gameState === 'GAME_OVER' && (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 border border-slate-800">
                <h3 className="text-xl font-extrabold font-display text-white">
                  Final Score: {score.toLocaleString()}
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => startNewGame(mode)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start New Game</span>
                  </button>
                  <button
                    onClick={handleContinueWithCredits}
                    className="px-3 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg"
                  >
                    Continue (10K CR)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* COMPACT BOTTOM DOCK: 3-Piece Tray + 4 Essential Gameplay Buttons */}
          <div className="w-full max-w-[360px] sm:max-w-[400px] mx-auto bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 space-y-2 shadow-xs">
            {/* 3-Piece Tray Cards (Compact height so they fit right under the board) */}
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
                          {isSelected ? 'Tap to Place' : shape.name}
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
                          Done
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 4 Essential Gameplay Buttons in 1 Clean Row */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => startNewGame(mode)}
                className="py-2 px-2 bg-emerald-500 hover:bg-emerald-400 text-[11px] font-extrabold text-slate-950 rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                title="Start New Game From Scratch"
              >
                <Play className="w-3 h-3 fill-current shrink-0" />
                <span>Start</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (selectedTrayIdx !== null && tray[selectedTrayIdx]) {
                    handleQuickPlaceBlock(selectedTrayIdx);
                  } else {
                    handleExecuteAIBestMove();
                  }
                }}
                disabled={!bestMove}
                className="py-2 px-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-[11px] font-extrabold text-slate-950 rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                title="Auto-Place Selected Block"
              >
                <Zap className="w-3 h-3 shrink-0" />
                <span>Place</span>
              </button>

              <button
                type="button"
                onClick={handleRotateSelected}
                disabled={selectedTrayIdx === null || !tray[selectedTrayIdx]}
                className="py-2 px-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-[11px] font-bold text-slate-800 dark:text-sky-400 rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                title="Rotate Selected Block"
              >
                <RotateCw className="w-3 h-3 shrink-0" />
                <span>Rotate</span>
              </button>

              <button
                type="button"
                onClick={() => handleClearPointsButton(true, 0)}
                className="py-2 px-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-[11px] font-extrabold text-rose-600 dark:text-rose-300 rounded-lg transition-colors flex items-center justify-center gap-1 whitespace-nowrap cursor-pointer"
                title="Clear All Credits, Points, High Score & Board to 0"
              >
                <Trash2 className="w-3 h-3 shrink-0" />
                <span>Clear 0</span>
              </button>
            </div>

            {/* Quiet Bottom Links for Separate Screens (Visual Example & AI Coach) */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/70 text-[10px] text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={() => setSubScreen('visual_example')}
                className="hover:text-sky-500 flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>Visual Example</span>
              </button>

              <button
                type="button"
                onClick={() => setSubScreen('ai_helper')}
                className="hover:text-emerald-400 flex items-center gap-1 cursor-pointer"
              >
                <Bot className="w-3 h-3" />
                <span>AI Helper Screen</span>
              </button>

              <button
                type="button"
                onClick={() => handleClearPointsButton(true, 100000)}
                className="hover:text-amber-400 cursor-pointer"
              >
                Reset 100K CR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
