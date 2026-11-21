import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { AppLanguage } from '../types/game';
import { soundEngine } from '../utils/soundAndHaptics';
import {
  Play,
  Shuffle,
  Lightbulb,
  BookOpen,
  X,
  Brain,
  Volume2,
  VolumeX,
  ArrowRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface CandyCrushGameProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  isLightMode: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
  onScoreUpdate: (params: {
    score: number;
    level: number;
    earnedCredits: number;
    completedLevel?: boolean;
  }) => void;
  clearSignal?: number;
}

type CandySpecial = 'none' | 'striped-h' | 'striped-v' | 'rainbow';

interface CandyCell {
  id: number;
  type: number; // 0..5
  special: CandySpecial;
}

const BOARD_SIZE = 8;
const NUM_TYPES = 6;

const CANDY_THEMES = [
  {
    emoji: '🍓',
    nameEn: 'Strawberry',
    nameId: 'Stroberi',
    bg: '#EF4444',
    border: '#FCA5A5',
    glow: 'rgba(239, 68, 68, 0.45)',
  },
  {
    emoji: '🍊',
    nameEn: 'Tangerine',
    nameId: 'Jeruk',
    bg: '#F97316',
    border: '#FDBA74',
    glow: 'rgba(249, 115, 22, 0.45)',
  },
  {
    emoji: '⭐',
    nameEn: 'Lemon Star',
    nameId: 'Bintang Lemon',
    bg: '#EAB308',
    border: '#FEF08A',
    glow: 'rgba(234, 179, 8, 0.45)',
  },
  {
    emoji: '🍏',
    nameEn: 'Mint Apple',
    nameId: 'Apel Hijau',
    bg: '#10B981',
    border: '#6EE7B7',
    glow: 'rgba(16, 185, 129, 0.45)',
  },
  {
    emoji: '💎',
    nameEn: 'Ocean Gem',
    nameId: 'Permata Biru',
    bg: '#0EA5E9',
    border: '#7DD3FC',
    glow: 'rgba(14, 165, 233, 0.45)',
  },
  {
    emoji: '🍇',
    nameEn: 'Grape Drop',
    nameId: 'Anggur',
    bg: '#8B5CF6',
    border: '#C4B5FD',
    glow: 'rgba(139, 92, 246, 0.45)',
  },
];

let nextCandyUid = 1;
function makeCandy(type?: number, special: CandySpecial = 'none'): CandyCell {
  return {
    id: nextCandyUid++,
    type: type !== undefined ? type : Math.floor(Math.random() * NUM_TYPES),
    special,
  };
}

interface MatchGroup {
  cells: { r: number; c: number }[];
  orientation: 'h' | 'v';
  type: number;
}

function findMatchGroups(board: (CandyCell | null)[][]): MatchGroup[] {
  const groups: MatchGroup[] = [];

  // Horizontal runs
  for (let r = 0; r < BOARD_SIZE; r++) {
    let c = 0;
    while (c < BOARD_SIZE) {
      const cell = board[r][c];
      if (!cell || cell.special === 'rainbow') {
        c++;
        continue;
      }
      let end = c + 1;
      while (
        end < BOARD_SIZE &&
        board[r][end] &&
        board[r][end]!.special !== 'rainbow' &&
        board[r][end]!.type === cell.type
      ) {
        end++;
      }
      if (end - c >= 3) {
        const cells: { r: number; c: number }[] = [];
        for (let k = c; k < end; k++) cells.push({ r, c: k });
        groups.push({ cells, orientation: 'h', type: cell.type });
      }
      c = end;
    }
  }

  // Vertical runs
  for (let c = 0; c < BOARD_SIZE; c++) {
    let r = 0;
    while (r < BOARD_SIZE) {
      const cell = board[r][c];
      if (!cell || cell.special === 'rainbow') {
        r++;
        continue;
      }
      let end = r + 1;
      while (
        end < BOARD_SIZE &&
        board[end][c] &&
        board[end][c]!.special !== 'rainbow' &&
        board[end][c]!.type === cell.type
      ) {
        end++;
      }
      if (end - r >= 3) {
        const cells: { r: number; c: number }[] = [];
        for (let k = r; k < end; k++) cells.push({ r: k, c });
        groups.push({ cells, orientation: 'v', type: cell.type });
      }
      r = end;
    }
  }

  return groups;
}

function findAnyValidSwap(
  board: (CandyCell | null)[][]
): [{ r: number; c: number }, { r: number; c: number }] | null {
  const dirs = [
    [0, 1],
    [1, 0],
  ];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const a = board[r][c];
      if (!a) continue;
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= BOARD_SIZE || nc >= BOARD_SIZE) continue;
        const b = board[nr][nc];
        if (!b) continue;

        if (a.special === 'rainbow' || b.special === 'rainbow') {
          return [
            { r, c },
            { r: nr, c: nc },
          ];
        }
        if (a.type === b.type) continue;

        const copy = board.map((row) => [...row]);
        copy[r][c] = b;
        copy[nr][nc] = a;
        if (findMatchGroups(copy).length > 0) {
          return [
            { r, c },
            { r: nr, c: nc },
          ];
        }
      }
    }
  }
  return null;
}

function createInitialCandyBoard(): CandyCell[][] {
  for (let attempt = 0; attempt < 40; attempt++) {
    const board: CandyCell[][] = Array.from({ length: BOARD_SIZE }, () =>
      Array(BOARD_SIZE).fill(null)
    );
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const forbidden = new Set<number>();
        if (
          c >= 2 &&
          board[r][c - 1].type === board[r][c - 2].type
        ) {
          forbidden.add(board[r][c - 1].type);
        }
        if (
          r >= 2 &&
          board[r - 1][c].type === board[r - 2][c].type
        ) {
          forbidden.add(board[r - 1][c].type);
        }
        const candidates = [0, 1, 2, 3, 4, 5].filter((t) => !forbidden.has(t));
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        board[r][c] = makeCandy(pick);
      }
    }
    if (findAnyValidSwap(board)) {
      return board;
    }
  }
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => makeCandy())
  );
}

function shuffleExistingBoard(board: CandyCell[][]): CandyCell[][] {
  const flat: CandyCell[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      flat.push(board[r][c]);
    }
  }
  for (let attempt = 0; attempt < 25; attempt++) {
    for (let i = flat.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flat[i], flat[j]] = [flat[j], flat[i]];
    }
    const next: CandyCell[][] = Array.from({ length: BOARD_SIZE }, (_, r) =>
      flat.slice(r * BOARD_SIZE, (r + 1) * BOARD_SIZE)
    );
    if (findMatchGroups(next).length === 0 && findAnyValidSwap(next)) {
      return next;
    }
  }
  return createInitialCandyBoard();
}

export const CandyCrushGame: React.FC<CandyCrushGameProps> = ({
  language,
  onLanguageChange,
  isLightMode,
  soundOn,
  onToggleSound,
  onScoreUpdate,
  clearSignal,
}) => {
  const [board, setBoard] = useState<CandyCell[][]>(() =>
    createInitialCandyBoard()
  );
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(
    null
  );
  const [poppingKeys, setPoppingKeys] = useState<Set<string>>(new Set());
  const [hintPair, setHintPair] = useState<
    [{ r: number; c: number }, { r: number; c: number }] | null
  >(null);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [levelScore, setLevelScore] = useState<number>(0);
  const [movesLeft, setMovesLeft] = useState<number>(22);
  const [comboCount, setComboCount] = useState<number>(0);
  const [status, setStatus] = useState<'PLAYING' | 'LEVEL_UP' | 'OUT_OF_MOVES'>(
    'PLAYING'
  );
  const [bannerText, setBannerText] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);

  const dragStartRef = useRef<{
    r: number;
    c: number;
    x: number;
    y: number;
  } | null>(null);
  const timersRef = useRef<number[]>([]);
  const mountedRef = useRef<boolean>(true);

  const targetScore = 1000 + (level - 1) * 650;
  const progressPct = Math.min(
    100,
    Math.round((levelScore / targetScore) * 100)
  );

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      if (mountedRef.current) fn();
    }, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearTimers();
    };
  }, [clearTimers]);

  const flashBanner = useCallback(
    (msg: string) => {
      setBannerText(msg);
      schedule(() => {
        setBannerText((prev) => (prev === msg ? null : prev));
      }, 2200);
    },
    [schedule]
  );

  const resetEntireGame = useCallback(() => {
    clearTimers();
    setBoard(createInitialCandyBoard());
    setSelected(null);
    setPoppingKeys(new Set());
    setHintPair(null);
    setIsAnimating(false);
    setLevel(1);
    setScore(0);
    setLevelScore(0);
    setMovesLeft(22);
    setComboCount(0);
    setStatus('PLAYING');
    setBannerText(null);
    soundEngine.playBlockSelect();
  }, [clearTimers]);

  useEffect(() => {
    if (clearSignal) {
      resetEntireGame();
    }
  }, [clearSignal, resetEntireGame]);

  const advanceToNextLevel = useCallback(() => {
    clearTimers();
    const nextLvl = level + 1;
    setLevel(nextLvl);
    setLevelScore(0);
    setMovesLeft(22 + Math.min(6, nextLvl));
    setBoard(createInitialCandyBoard());
    setSelected(null);
    setHintPair(null);
    setPoppingKeys(new Set());
    setIsAnimating(false);
    setComboCount(0);
    setStatus('PLAYING');
    soundEngine.playBlockSelect();
  }, [clearTimers, level]);

  const resolveBoardCascades = useCallback(
    (
      startingBoard: CandyCell[][],
      initialScore: number,
      initialLevelScore: number,
      remainingMoves: number,
      swapOrigin?: { r: number; c: number },
      chainStep: number = 1
    ) => {
      const groups = findMatchGroups(startingBoard);
      if (groups.length === 0) {
        // Done cascading! Check win/lose/shuffle
        const curTarget = 1000 + (level - 1) * 650;
        if (initialLevelScore >= curTarget) {
          setStatus('LEVEL_UP');
          setIsAnimating(false);
          soundEngine.playLevelCompleteChime();
          confetti({ particleCount: 95, spread: 85, origin: { y: 0.55 } });
          onScoreUpdate({
            score: initialScore,
            level: level + 1,
            earnedCredits: 12000 + level * 2500,
            completedLevel: true,
          });
          return;
        }

        if (remainingMoves <= 0) {
          setStatus('OUT_OF_MOVES');
          setIsAnimating(false);
          soundEngine.playGameOver();
          return;
        }

        // Auto-shuffle if deadlocked
        if (!findAnyValidSwap(startingBoard)) {
          const reshuffled = shuffleExistingBoard(startingBoard);
          setBoard(reshuffled);
          flashBanner(
            language === 'id'
              ? '🔀 Tidak ada langkah — Papan permen diacak otomatis!'
              : '🔀 No moves left — Board auto-shuffled!'
          );
          soundEngine.playBlockRotate();
        }
        setIsAnimating(false);
        return;
      }

      // Build clearing set + determine special power-ups to spawn
      const toClear = new Set<string>();
      const cellCounts = new Map<string, number>();
      groups.forEach((g) => {
        g.cells.forEach(({ r, c }) => {
          const key = `${r},${c}`;
          toClear.add(key);
          cellCounts.set(key, (cellCounts.get(key) || 0) + 1);
        });
      });

      const spawns: { r: number; c: number; type: number; special: CandySpecial }[] =
        [];
      const usedSpawnKeys = new Set<string>();

      groups.forEach((g) => {
        const intersecting = g.cells.find(
          ({ r, c }) => (cellCounts.get(`${r},${c}`) || 0) > 1
        );
        if (g.cells.length >= 5 || intersecting) {
          const anchor = intersecting || swapOrigin || g.cells[Math.floor(g.cells.length / 2)];
          const key = `${anchor.r},${anchor.c}`;
          if (!usedSpawnKeys.has(key)) {
            usedSpawnKeys.add(key);
            spawns.push({
              r: anchor.r,
              c: anchor.c,
              type: g.type,
              special: 'rainbow',
            });
          }
        } else if (g.cells.length === 4) {
          const inGroupSwap =
            swapOrigin &&
            g.cells.some((p) => p.r === swapOrigin.r && p.c === swapOrigin.c)
              ? swapOrigin
              : g.cells[1];
          const key = `${inGroupSwap.r},${inGroupSwap.c}`;
          if (!usedSpawnKeys.has(key)) {
            usedSpawnKeys.add(key);
            spawns.push({
              r: inGroupSwap.r,
              c: inGroupSwap.c,
              type: g.type,
              special: g.orientation === 'h' ? 'striped-v' : 'striped-h',
            });
          }
        }
      });

      // Trigger any existing Striped Candies caught in the clear!
      const expanded = new Set<string>(toClear);
      const queue = Array.from(toClear);
      while (queue.length > 0) {
        const key = queue.shift()!;
        const [rr, cc] = key.split(',').map(Number);
        const cell = startingBoard[rr]?.[cc];
        if (!cell) continue;
        if (cell.special === 'striped-h') {
          for (let col = 0; col < BOARD_SIZE; col++) {
            const k = `${rr},${col}`;
            if (!expanded.has(k)) {
              expanded.add(k);
              queue.push(k);
            }
          }
        } else if (cell.special === 'striped-v') {
          for (let row = 0; row < BOARD_SIZE; row++) {
            const k = `${row},${cc}`;
            if (!expanded.has(k)) {
              expanded.add(k);
              queue.push(k);
            }
          }
        }
      }

      const clearedCount = expanded.size;
      const pointsEarned = clearedCount * 45 * chainStep;
      const creditsEarned = clearedCount * 120 * chainStep;
      const nextScore = initialScore + pointsEarned;
      const nextLevelScore = initialLevelScore + pointsEarned;

      setPoppingKeys(expanded);
      setComboCount(chainStep);
      setScore(nextScore);
      setLevelScore(nextLevelScore);

      onScoreUpdate({
        score: nextScore,
        level,
        earnedCredits: creditsEarned,
      });

      if (spawns.length > 0 || chainStep >= 2 || clearedCount >= 5) {
        soundEngine.playPatternComplete();
        confetti({
          particleCount: Math.min(60, 18 + chainStep * 12),
          spread: 65,
          origin: { y: 0.6 },
        });
        flashBanner(
          chainStep >= 2
            ? language === 'id'
              ? `🔥 KOMBO ${chainStep}x! +${pointsEarned} Poin!`
              : `🔥 ${chainStep}x SWEET COMBO! +${pointsEarned} PTS!`
            : language === 'id'
            ? `⚡ PERMEN SPESIAL! +${pointsEarned} Poin!`
            : `⚡ POWER CANDY CREATED! +${pointsEarned} PTS!`
        );
      } else {
        soundEngine.playLineClear(1, chainStep);
      }

      schedule(() => {
        // Clear & apply spawns
        const nextGrid: (CandyCell | null)[][] = startingBoard.map((row) => [
          ...row,
        ]);
        expanded.forEach((key) => {
          const [rr, cc] = key.split(',').map(Number);
          nextGrid[rr][cc] = null;
        });
        spawns.forEach((sp) => {
          nextGrid[sp.r][sp.c] = makeCandy(sp.type, sp.special);
        });

        // Apply gravity column by column
        const fallen: CandyCell[][] = Array.from({ length: BOARD_SIZE }, () =>
          Array(BOARD_SIZE).fill(null)
        );
        for (let c = 0; c < BOARD_SIZE; c++) {
          let writeRow = BOARD_SIZE - 1;
          for (let r = BOARD_SIZE - 1; r >= 0; r--) {
            if (nextGrid[r][c] !== null) {
              fallen[writeRow][c] = nextGrid[r][c]!;
              writeRow--;
            }
          }
          while (writeRow >= 0) {
            fallen[writeRow][c] = makeCandy();
            writeRow--;
          }
        }

        setPoppingKeys(new Set());
        setBoard(fallen);

        schedule(() => {
          resolveBoardCascades(
            fallen,
            nextScore,
            nextLevelScore,
            remainingMoves,
            undefined,
            chainStep + 1
          );
        }, 170);
      }, 200);
    },
    [flashBanner, language, level, onScoreUpdate, schedule]
  );

  const attemptSwap = useCallback(
    (r1: number, c1: number, r2: number, c2: number) => {
      if (isAnimating || status !== 'PLAYING') return;
      if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;

      const a = board[r1][c1];
      const b = board[r2][c2];
      if (!a || !b) return;

      setSelected(null);
      setHintPair(null);

      // Special Case: Rainbow Bomb Swap!
      if (a.special === 'rainbow' || b.special === 'rainbow') {
        setIsAnimating(true);
        const remainingMoves = Math.max(0, movesLeft - 1);
        setMovesLeft(remainingMoves);

        const expanded = new Set<string>();
        expanded.add(`${r1},${c1}`);
        expanded.add(`${r2},${c2}`);

        if (a.special === 'rainbow' && b.special === 'rainbow') {
          // Double Rainbow clears entire board!
          for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
              expanded.add(`${r},${c}`);
            }
          }
        } else {
          const targetType = a.special === 'rainbow' ? b.type : a.type;
          for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
              if (board[r][c].type === targetType) {
                expanded.add(`${r},${c}`);
              }
            }
          }
        }

        const pts = expanded.size * 70;
        const creds = expanded.size * 220;
        const nextScore = score + pts;
        const nextLevelScore = levelScore + pts;

        setPoppingKeys(expanded);
        setScore(nextScore);
        setLevelScore(nextLevelScore);
        soundEngine.playLevelCompleteChime();
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.55 } });
        flashBanner(
          language === 'id'
            ? `🌈 BOM PELANGI! +${pts} Poin!`
            : `🌈 RAINBOW BLAST! +${pts} PTS!`
        );
        onScoreUpdate({
          score: nextScore,
          level,
          earnedCredits: creds,
        });

        schedule(() => {
          const nextGrid: (CandyCell | null)[][] = board.map((row) => [...row]);
          expanded.forEach((key) => {
            const [rr, cc] = key.split(',').map(Number);
            nextGrid[rr][cc] = null;
          });

          const fallen: CandyCell[][] = Array.from({ length: BOARD_SIZE }, () =>
            Array(BOARD_SIZE).fill(null)
          );
          for (let c = 0; c < BOARD_SIZE; c++) {
            let writeRow = BOARD_SIZE - 1;
            for (let r = BOARD_SIZE - 1; r >= 0; r--) {
              if (nextGrid[r][c] !== null) {
                fallen[writeRow][c] = nextGrid[r][c]!;
                writeRow--;
              }
            }
            while (writeRow >= 0) {
              fallen[writeRow][c] = makeCandy();
              writeRow--;
            }
          }

          setPoppingKeys(new Set());
          setBoard(fallen);
          schedule(() => {
            resolveBoardCascades(
              fallen,
              nextScore,
              nextLevelScore,
              remainingMoves,
              undefined,
              2
            );
          }, 180);
        }, 230);
        return;
      }

      // Standard adjacent swap
      const swapped = board.map((row) => [...row]);
      swapped[r1][c1] = b;
      swapped[r2][c2] = a;

      if (findMatchGroups(swapped).length === 0) {
        soundEngine.playBlockRotate();
        flashBanner(
          language === 'id'
            ? 'Cocokkan 3 atau lebih permen yang sama!'
            : 'Match 3 or more identical candies in a row!'
        );
        return;
      }

      const remainingMoves = Math.max(0, movesLeft - 1);
      setIsAnimating(true);
      setBoard(swapped);
      setMovesLeft(remainingMoves);
      soundEngine.playBlockPlace(1, level);

      schedule(() => {
        resolveBoardCascades(
          swapped,
          score,
          levelScore,
          remainingMoves,
          { r: r2, c: c2 },
          1
        );
      }, 120);
    },
    [
      board,
      flashBanner,
      isAnimating,
      language,
      level,
      levelScore,
      movesLeft,
      onScoreUpdate,
      resolveBoardCascades,
      schedule,
      score,
      status,
    ]
  );

  const handleTileClick = (r: number, c: number) => {
    if (isAnimating || status !== 'PLAYING') return;
    if (!selected) {
      setSelected({ r, c });
      soundEngine.playBlockSelect();
      return;
    }
    if (selected.r === r && selected.c === c) {
      setSelected(null);
      return;
    }
    if (Math.abs(selected.r - r) + Math.abs(selected.c - c) === 1) {
      attemptSwap(selected.r, selected.c, r, c);
    } else {
      setSelected({ r, c });
      soundEngine.playBlockSelect();
    }
  };

  const handlePointerDown = (
    e: React.PointerEvent,
    r: number,
    c: number
  ) => {
    if (isAnimating || status !== 'PLAYING') return;
    dragStartRef.current = { r, c, x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartRef.current || isAnimating || status !== 'PLAYING') return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) < 22 && Math.abs(dy) < 22) return;

    const { r, c } = dragStartRef.current;
    dragStartRef.current = null;
    if (Math.abs(dx) > Math.abs(dy)) {
      const targetC = c + (dx > 0 ? 1 : -1);
      if (targetC >= 0 && targetC < BOARD_SIZE) {
        attemptSwap(r, c, r, targetC);
      }
    } else {
      const targetR = r + (dy > 0 ? 1 : -1);
      if (targetR >= 0 && targetR < BOARD_SIZE) {
        attemptSwap(r, c, targetR, c);
      }
    }
  };

  const handlePointerUp = () => {
    dragStartRef.current = null;
  };

  const handleShowHint = () => {
    if (isAnimating || status !== 'PLAYING') return;
    const pair = findAnyValidSwap(board);
    if (pair) {
      setHintPair(pair);
      soundEngine.playBlockSelect();
    } else {
      setBoard(shuffleExistingBoard(board));
      soundEngine.playBlockRotate();
    }
  };

  const handleManualShuffle = () => {
    if (isAnimating || status !== 'PLAYING') return;
    setBoard((prev) => shuffleExistingBoard(prev));
    setSelected(null);
    setHintPair(null);
    soundEngine.playBlockRotate();
    flashBanner(
      language === 'id' ? '🔀 Permen diacak ulang!' : '🔀 Candies shuffled!'
    );
  };

  const showEn = language === 'en' || language === 'bilingual';
  const showId = language === 'id' || language === 'bilingual';

  return (
    <div className="space-y-2">
      {/* Compact Candy HUD Strip */}
      <div className="bg-[#F2F9FB] dark:bg-[#0D244B] border border-[#C5E4EC] dark:border-[#1E447D] rounded-xl px-2.5 py-2 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-base leading-none">🍬</span>
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-[#0B2249] dark:text-white truncate">
                {language === 'id'
                  ? `Permen Match-3 · Level ${level}`
                  : language === 'en'
                  ? `Candy Match-3 · Level ${level}`
                  : `Candy Match-3 / Permen · Lvl ${level}`}
              </div>
              <div className="text-[10px] font-mono text-[#0D949E] dark:text-[#2DD4BF] tabular-nums">
                {levelScore.toLocaleString()} / {targetScore.toLocaleString()}{' '}
                {language === 'id' ? 'Poin' : 'PTS'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right font-mono">
              <span className="text-[9px] text-[#557293] dark:text-[#9FC0E2] block leading-none uppercase">
                {language === 'id' ? 'LANGKAH' : 'MOVES'}
              </span>
              <span
                className={`text-sm font-black tabular-nums ${
                  movesLeft <= 5
                    ? 'text-rose-500'
                    : 'text-[#0B2249] dark:text-white'
                }`}
              >
                {movesLeft}
              </span>
            </div>

            <button
              type="button"
              onClick={onToggleSound}
              className={`p-1.5 rounded-md border cursor-pointer ${
                soundOn
                  ? 'bg-[#14B8C4]/15 border-[#14B8C4]/50 text-[#0D949E] dark:text-[#2DD4BF]'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
              }`}
              title="Toggle Sound"
            >
              {soundOn ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Target Progress Bar */}
        <div className="w-full h-2 bg-[#DCEEF4] dark:bg-[#071731] rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPct}%` }}
            className="h-full bg-gradient-to-r from-[#14B8C4] to-[#2DD4BF] transition-all duration-300"
          />
        </div>

        {/* Slim Brain Skill + How It Works Row */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5">
          <div className="flex items-center gap-1 min-w-0">
            <Brain className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 truncate">
              {language === 'id'
                ? 'Latihan Otak: Pola Cepat & Strategi Kombo'
                : language === 'en'
                ? 'Brain Workout: Pattern Spotting & Chain Planning'
                : 'Pattern Spotting · Pola Cepat & Strategi Kombo'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowHowItWorks((prev) => !prev)}
            className="px-2 py-0.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 shrink-0 cursor-pointer"
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
        </div>
      </div>

      {/* Transient Combo Banner */}
      {bannerText && (
        <div className="bg-[#CCF5F8] dark:bg-[#12336B] border border-[#14B8C4] text-[#0B2249] dark:text-[#CCF5F8] px-3 py-1 rounded-lg text-[11px] font-extrabold text-center truncate">
          {bannerText}
        </div>
      )}

      {/* 8x8 Candy Crush Grid */}
      <div
        className="relative w-full aspect-square max-w-[360px] sm:max-w-[400px] mx-auto select-none touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className={`w-full h-full p-2 rounded-2xl border-2 grid grid-cols-8 gap-1 sm:gap-1.5 ${
            isLightMode
              ? 'bg-[#E6F4F8] border-[#14B8C4]'
              : 'bg-[#091D3E] border-[#14B8C4]/70'
          }`}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const theme = CANDY_THEMES[cell.type % CANDY_THEMES.length];
              const isSel = selected?.r === r && selected?.c === c;
              const isPop = poppingKeys.has(`${r},${c}`);
              const isHint =
                hintPair &&
                ((hintPair[0].r === r && hintPair[0].c === c) ||
                  (hintPair[1].r === r && hintPair[1].c === c));

              const bgColor =
                cell.special === 'rainbow'
                  ? 'linear-gradient(135deg, #EF4444, #F59E0B, #10B981, #3B82F6, #8B5CF6)'
                  : theme.bg;

              return (
                <button
                  key={`${r}_${c}_${cell.id}`}
                  type="button"
                  onPointerDown={(e) => handlePointerDown(e, r, c)}
                  onClick={() => handleTileClick(r, c)}
                  style={{
                    background: bgColor,
                    borderColor: isSel
                      ? '#FFFFFF'
                      : isHint
                      ? '#2DD4BF'
                      : theme.border,
                    boxShadow: isSel
                      ? `0 0 0 2px #0B2249, 0 4px 10px ${theme.glow}`
                      : isHint
                      ? '0 0 0 2px #14B8C4'
                      : undefined,
                  }}
                  className={`w-full h-full rounded-xl border-2 flex items-center justify-center relative transition-transform duration-150 cursor-pointer focus:outline-none ${
                    isPop
                      ? 'scale-50 opacity-30'
                      : isSel
                      ? 'scale-110 z-10'
                      : isHint
                      ? 'scale-105 animate-pulse'
                      : 'hover:scale-105'
                  }`}
                  aria-label={`${theme.nameEn} candy at row ${r + 1} column ${c + 1}`}
                >
                  <span className="text-base sm:text-xl leading-none drop-shadow-xs">
                    {cell.special === 'rainbow' ? '🌈' : theme.emoji}
                  </span>

                  {cell.special === 'striped-h' && (
                    <span className="absolute inset-x-0.5 top-1/2 -translate-y-1/2 h-1 bg-white/90 rounded-full pointer-events-none" />
                  )}
                  {cell.special === 'striped-v' && (
                    <span className="absolute inset-y-0.5 left-1/2 -translate-x-1/2 w-1 bg-white/90 rounded-full pointer-events-none" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* OVERLAY: Bilingual How It Works */}
        {showHowItWorks && (
          <div className="absolute inset-0 bg-[#071731]/95 backdrop-blur-md rounded-2xl p-3.5 flex flex-col justify-between text-left border-2 border-[#14B8C4] z-20 overflow-y-auto">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🍬</span>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#2DD4BF] font-bold">
                      Candy Match-3 / Permen Match-3
                    </div>
                    <h3 className="text-sm font-extrabold text-white">
                      {language === 'id'
                        ? 'Cara Bermain Ledakan Permen'
                        : 'How to Play Candy Match-3'}
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowHowItWorks(false)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1 bg-[#0B2249] p-1 rounded-lg border border-[#1E447D]">
                {(
                  [
                    { id: 'bilingual', label: '🇮🇩+🇬🇧 Bilingual' },
                    { id: 'id', label: '🇮🇩 Indonesia' },
                    { id: 'en', label: '🇬🇧 English' },
                  ] as { id: AppLanguage; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onLanguageChange(opt.id)}
                    className={`flex-1 py-1 px-1.5 rounded text-[10px] font-extrabold cursor-pointer ${
                      language === opt.id
                        ? 'bg-[#14B8C4] text-[#062134]'
                        : 'text-[#CBE7F0] hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="bg-[#0B2249] border border-[#1E447D] rounded-lg p-2.5 space-y-1.5 text-[11px]">
                {showEn && (
                  <p className="text-white leading-snug">
                    🇬🇧 <strong>Tap or swipe</strong> any two neighboring candies
                    to swap them and line up <strong>3 or more</strong> of the
                    same kind! Match <strong>4</strong> for a{' '}
                    <strong>Striped Line Blaster</strong>, or match{' '}
                    <strong>5</strong> for a{' '}
                    <strong>🌈 Rainbow Bomb</strong> that clears every candy of
                    one color!
                  </p>
                )}
                {showId && (
                  <p className="text-[#CCF5F8] leading-snug">
                    🇮🇩 <strong>Ketuk atau geser</strong> dua permen yang
                    bersebelahan untuk menukarnya dan cocokkan{' '}
                    <strong>3 atau lebih</strong> permen yang sama! Cocokkan{' '}
                    <strong>4</strong> untuk <strong>Permen Garis</strong>{' '}
                    pembersih satu baris, atau cocokkan <strong>5</strong> untuk{' '}
                    <strong>🌈 Bom Pelangi</strong>!
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHowItWorks(false)}
              className="w-full py-2 bg-[#14B8C4] hover:bg-[#2DD4BF] text-[#062134] font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {language === 'id' ? 'Ayo Main!' : 'Play Candy Match-3!'}
              </span>
            </button>
          </div>
        )}

        {/* OVERLAY: LEVEL COMPLETE */}
        {status === 'LEVEL_UP' && (
          <div className="absolute inset-0 bg-[#071731]/92 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 border-2 border-[#2DD4BF] z-20">
            <div className="text-4xl">🎉🍬</div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold uppercase text-[#2DD4BF]">
                {language === 'id'
                  ? `Level ${level} Selesai!`
                  : `Level ${level} Complete!`}
              </div>
              <h3 className="text-xl font-extrabold text-white">
                {language === 'id' ? 'Luar Biasa!' : 'Sweet Victory!'}
              </h3>
              <p className="text-xs font-mono text-[#CCF5F8]">
                {score.toLocaleString()} PTS · +
                {(12000 + level * 2500).toLocaleString()} CR
              </p>
            </div>
            <button
              type="button"
              onClick={advanceToNextLevel}
              className="px-5 py-2.5 bg-[#14B8C4] hover:bg-[#2DD4BF] text-[#062134] font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <span>
                {language === 'id'
                  ? `Lanjut Level ${level + 1}`
                  : `Next Level (${level + 1})`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* OVERLAY: OUT OF MOVES */}
        {status === 'OUT_OF_MOVES' && (
          <div className="absolute inset-0 bg-[#071731]/94 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 border-2 border-[#14B8C4] z-20">
            <div className="text-3xl">🍬</div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">
                {language === 'id' ? 'Langkah Habis!' : 'Out of Moves!'}
              </h3>
              <p className="text-xs text-[#CBE7F0]">
                {language === 'id'
                  ? `Skor: ${levelScore.toLocaleString()} / ${targetScore.toLocaleString()}`
                  : `Score: ${levelScore.toLocaleString()} / ${targetScore.toLocaleString()}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setMovesLeft(8);
                  setStatus('PLAYING');
                  soundEngine.playPatternComplete();
                }}
                className="px-4 py-2 bg-[#14B8C4] hover:bg-[#2DD4BF] text-[#062134] font-extrabold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {language === 'id' ? '+8 Langkah Gratis' : '+8 Free Moves'}
                </span>
              </button>
              <button
                type="button"
                onClick={resetEntireGame}
                className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'id' ? 'Main Lagi' : 'Play Again'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Compact 3-Button Essential Bottom Dock */}
      <div className="w-full max-w-[360px] sm:max-w-[400px] mx-auto bg-white dark:bg-[#0D244B] border border-[#C5E4EC] dark:border-[#1E447D] rounded-xl p-2 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-[#355275] dark:text-[#CBE7F0] px-1">
          <span>
            {language === 'id'
              ? '👆 Ketuk/geser 2 permen sebelahan · 4=Garis ⚡ · 5=Pelangi 🌈'
              : '👆 Tap or swipe 2 candies · 4=Striped ⚡ · 5=Rainbow 🌈'}
          </span>
          {comboCount >= 2 && (
            <span className="font-mono font-black text-[#0D949E] dark:text-[#2DD4BF]">
              {comboCount}x
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={handleShowHint}
            disabled={isAnimating}
            className="py-2 px-2 bg-[#0B2249] dark:bg-[#2DD4BF] hover:bg-[#12336B] dark:hover:bg-[#5EEAD4] disabled:opacity-40 text-white dark:text-[#062134] text-[11px] font-extrabold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'id' ? 'Petunjuk' : 'Hint'}</span>
          </button>

          <button
            type="button"
            onClick={handleManualShuffle}
            disabled={isAnimating}
            className="py-2 px-2 bg-[#E8F5F8] dark:bg-[#122E5E] hover:bg-[#D5EEF4] dark:hover:bg-[#1B4284] border border-[#C5E4EC] dark:border-[#1E447D] disabled:opacity-40 text-[#0B2249] dark:text-[#2DD4BF] text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'id' ? 'Acak' : 'Shuffle'}</span>
          </button>

          <button
            type="button"
            onClick={resetEntireGame}
            className="py-2 px-2 bg-[#14B8C4] hover:bg-[#0EA5B7] text-[#062134] text-[11px] font-extrabold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
            <span>{language === 'id' ? 'Baru' : 'New Game'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
