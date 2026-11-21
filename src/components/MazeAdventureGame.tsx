import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { AppLanguage } from '../types/game';
import { soundEngine } from '../utils/soundAndHaptics';
import {
  Play,
  Lightbulb,
  BookOpen,
  X,
  Brain,
  Volume2,
  VolumeX,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Timer,
} from 'lucide-react';

interface MazeAdventureGameProps {
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

type MazeThemeId = 'corn' | 'race' | 'tortoise';

interface EducationalChallenge {
  promptEn: string;
  promptId: string;
  speakWord?: string;
  options: [string, string];
  correctIndex: 0 | 1;
  explanationEn: string;
  explanationId: string;
}

interface CheckpointNode {
  r: number;
  c: number;
  solved: boolean;
  challenge: EducationalChallenge;
}

const VOCAB_CHALLENGES: EducationalChallenge[] = [
  {
    promptEn: 'Which English word means "BANDARA"?',
    promptId: 'Kata Inggris apa yang artinya "BANDARA"?',
    speakWord: 'Airport',
    options: ['Airport', 'Hospital'],
    correctIndex: 0,
    explanationEn: 'Airport = Bandara ✈️',
    explanationId: 'Airport artinya Bandara ✈️',
  },
  {
    promptEn: 'Which English word means "TERIMA KASIH"?',
    promptId: 'Kata Inggris apa yang artinya "TERIMA KASIH"?',
    speakWord: 'Thank you',
    options: ['Goodbye', 'Thank you'],
    correctIndex: 1,
    explanationEn: 'Thank you = Terima kasih 🙏',
    explanationId: 'Thank you artinya Terima kasih 🙏',
  },
  {
    promptEn: 'What does "SCHOOL" mean in Bahasa Indonesia?',
    promptId: 'Apa arti kata "SCHOOL" dalam Bahasa Indonesia?',
    speakWord: 'School',
    options: ['Sekolah', 'Pasar'],
    correctIndex: 0,
    explanationEn: 'School = Sekolah 🏫',
    explanationId: 'School artinya Sekolah 🏫',
  },
  {
    promptEn: 'Which English word means "TEMAN"?',
    promptId: 'Kata Inggris apa yang artinya "TEMAN"?',
    speakWord: 'Friend',
    options: ['Water', 'Friend'],
    correctIndex: 1,
    explanationEn: 'Friend = Teman 🤝',
    explanationId: 'Friend artinya Teman 🤝',
  },
  {
    promptEn: 'What does "WATER" mean in Bahasa Indonesia?',
    promptId: 'Apa arti kata "WATER" dalam Bahasa Indonesia?',
    speakWord: 'Water',
    options: ['Air', 'Api'],
    correctIndex: 0,
    explanationEn: 'Water = Air 💧',
    explanationId: 'Water artinya Air 💧',
  },
  {
    promptEn: 'Which English word means "BUKU"?',
    promptId: 'Kata Inggris apa yang artinya "BUKU"?',
    speakWord: 'Book',
    options: ['Chair', 'Book'],
    correctIndex: 1,
    explanationEn: 'Book = Buku 📖',
    explanationId: 'Book artinya Buku 📖',
  },
  {
    promptEn: 'Which English word means "TOLONG / BANTU"?',
    promptId: 'Kata Inggris apa yang artinya "TOLONG / BANTU"?',
    speakWord: 'Help',
    options: ['Help', 'Sleep'],
    correctIndex: 0,
    explanationEn: 'Help = Tolong / Bantu 🌟',
    explanationId: 'Help artinya Tolong / Bantu 🌟',
  },
  {
    promptEn: 'What does "HAPPY" mean in Bahasa Indonesia?',
    promptId: 'Apa arti kata "HAPPY" dalam Bahasa Indonesia?',
    speakWord: 'Happy',
    options: ['Sedih', 'Senang'],
    correctIndex: 1,
    explanationEn: 'Happy = Senang 😊',
    explanationId: 'Happy artinya Senang 😊',
  },
  {
    promptEn: 'Which English word means "APEL"?',
    promptId: 'Kata Inggris apa yang artinya "APEL"?',
    speakWord: 'Apple',
    options: ['Apple', 'Carrot'],
    correctIndex: 0,
    explanationEn: 'Apple = Apel 🍎',
    explanationId: 'Apple artinya Apel 🍎',
  },
  {
    promptEn: 'What does "SUNSHINE" mean in Bahasa Indonesia?',
    promptId: 'Apa arti "SUNSHINE" dalam Bahasa Indonesia?',
    speakWord: 'Sunshine',
    options: ['Hujan', 'Sinar Matahari'],
    correctIndex: 1,
    explanationEn: 'Sunshine = Sinar Matahari ☀️',
    explanationId: 'Sunshine artinya Sinar Matahari ☀️',
  },
];

function createMathChallenge(level: number): EducationalChallenge {
  const mode = Math.floor(Math.random() * 3);
  if (mode === 0) {
    const a = 3 + Math.floor(Math.random() * (6 + level * 2));
    const b = 2 + Math.floor(Math.random() * (6 + level * 2));
    const ans = a + b;
    const wrong = ans + (Math.random() < 0.5 ? 2 : -1);
    const swap = Math.random() < 0.5;
    return {
      promptEn: `Turbo Math Boost: ${a} + ${b} = ?`,
      promptId: `Hitung Cepat Turbo: ${a} + ${b} = ?`,
      options: swap ? [String(wrong), String(ans)] : [String(ans), String(wrong)],
      correctIndex: swap ? 1 : 0,
      explanationEn: `${a} + ${b} = ${ans} ⚡`,
      explanationId: `${a} + ${b} = ${ans} ⚡`,
    };
  }
  if (mode === 1) {
    const a = 7 + Math.floor(Math.random() * (8 + level * 2));
    const b = 2 + Math.floor(Math.random() * 6);
    const ans = a - b;
    const wrong = ans + (Math.random() < 0.5 ? 1 : 2);
    const swap = Math.random() < 0.5;
    return {
      promptEn: `Turbo Math Boost: ${a} - ${b} = ?`,
      promptId: `Hitung Cepat Turbo: ${a} - ${b} = ?`,
      options: swap ? [String(wrong), String(ans)] : [String(ans), String(wrong)],
      correctIndex: swap ? 1 : 0,
      explanationEn: `${a} - ${b} = ${ans} ⚡`,
      explanationId: `${a} - ${b} = ${ans} ⚡`,
    };
  }
  const a = 2 + Math.floor(Math.random() * Math.min(8, 3 + level));
  const b = 2 + Math.floor(Math.random() * 5);
  const ans = a * b;
  const wrong = ans + (Math.random() < 0.5 ? a : 2);
  const swap = Math.random() < 0.5;
  return {
    promptEn: `Turbo Math Boost: ${a} × ${b} = ?`,
    promptId: `Hitung Cepat Turbo: ${a} × ${b} = ?`,
    options: swap ? [String(wrong), String(ans)] : [String(ans), String(wrong)],
    correctIndex: swap ? 1 : 0,
    explanationEn: `${a} × ${b} = ${ans} ⚡`,
    explanationId: `${a} × ${b} = ${ans} ⚡`,
  };
}

/**
 * Generates an odd-sized 2D maze (1 = wall, 0 = open path) via Recursive Backtracker
 * with a few gentle extra openings so kids can explore strategic shortcuts.
 */
function generateMaze(size: number): number[][] {
  const maze: number[][] = Array.from({ length: size }, () =>
    Array(size).fill(1)
  );

  const dirs = [
    [-2, 0],
    [2, 0],
    [0, -2],
    [0, 2],
  ];

  const carve = (r: number, c: number) => {
    maze[r][c] = 0;
    const shuffled = [...dirs].sort(() => Math.random() - 0.5);
    for (const [dr, dc] of shuffled) {
      const nr = r + dr;
      const nc = c + dc;
      if (
        nr > 0 &&
        nr < size - 1 &&
        nc > 0 &&
        nc < size - 1 &&
        maze[nr][nc] === 1
      ) {
        maze[r + dr / 2][c + dc / 2] = 0;
        carve(nr, nc);
      }
    }
  };

  carve(1, 1);

  // Add 2–3 subtle braided openings so there are fun alternate routes
  let added = 0;
  for (let tries = 0; tries < 40 && added < 3; tries++) {
    const r = 1 + Math.floor(Math.random() * (size - 2));
    const c = 1 + Math.floor(Math.random() * (size - 2));
    if (maze[r][c] !== 1) continue;
    const horiz =
      maze[r][c - 1] === 0 &&
      maze[r][c + 1] === 0 &&
      maze[r - 1]?.[c] === 1 &&
      maze[r + 1]?.[c] === 1;
    const vert =
      maze[r - 1]?.[c] === 0 &&
      maze[r + 1]?.[c] === 0 &&
      maze[r][c - 1] === 1 &&
      maze[r][c + 1] === 1;
    if (horiz || vert) {
      maze[r][c] = 0;
      added++;
    }
  }

  maze[1][1] = 0;
  maze[size - 2][size - 2] = 0;
  return maze;
}

/**
 * BFS shortest path from (sr, sc) to (gr, gc)
 */
function findShortestPath(
  maze: number[][],
  sr: number,
  sc: number,
  gr: number,
  gc: number
): { r: number; c: number }[] {
  const size = maze.length;
  const visited = Array.from({ length: size }, () => Array(size).fill(false));
  const parent = new Map<string, { r: number; c: number } | null>();
  const queue: { r: number; c: number }[] = [{ r: sr, c: sc }];
  visited[sr][sc] = true;
  parent.set(`${sr},${sc}`, null);

  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur.r === gr && cur.c === gc) {
      const path: { r: number; c: number }[] = [];
      let node: { r: number; c: number } | null = cur;
      while (node) {
        path.push(node);
        node = parent.get(`${node.r},${node.c}`) || null;
      }
      return path.reverse();
    }
    for (const [dr, dc] of dirs) {
      const nr = cur.r + dr;
      const nc = cur.c + dc;
      if (
        nr >= 0 &&
        nr < size &&
        nc >= 0 &&
        nc < size &&
        maze[nr][nc] === 0 &&
        !visited[nr][nc]
      ) {
        visited[nr][nc] = true;
        parent.set(`${nr},${nc}`, cur);
        queue.push({ r: nr, c: nc });
      }
    }
  }
  return [];
}

function buildCheckpoints(
  maze: number[][],
  theme: MazeThemeId,
  level: number
): CheckpointNode[] {
  const size = maze.length;
  const path = findShortestPath(maze, 1, 1, size - 2, size - 2);
  if (path.length < 6) return [];

  const count = Math.min(3, Math.max(2, Math.floor(path.length / 7)));
  const picks: CheckpointNode[] = [];
  const usedVocab = new Set<number>();

  for (let i = 1; i <= count; i++) {
    const idx = Math.floor((path.length * i) / (count + 1));
    const cell = path[idx];
    if (!cell || (cell.r === 1 && cell.c === 1)) continue;

    let challenge: EducationalChallenge;
    if (theme === 'race') {
      challenge = createMathChallenge(level);
    } else if (theme === 'tortoise' && i % 2 === 0) {
      challenge = createMathChallenge(level);
    } else {
      let vIdx = Math.floor(Math.random() * VOCAB_CHALLENGES.length);
      while (usedVocab.has(vIdx) && usedVocab.size < VOCAB_CHALLENGES.length) {
        vIdx = (vIdx + 1) % VOCAB_CHALLENGES.length;
      }
      usedVocab.add(vIdx);
      challenge = VOCAB_CHALLENGES[vIdx];
    }

    picks.push({
      r: cell.r,
      c: cell.c,
      solved: false,
      challenge,
    });
  }
  return picks;
}

const MAZE_THEMES: Record<
  MazeThemeId,
  {
    labelEn: string;
    labelId: string;
    emoji: string;
    playerEmoji: string;
    goalEmoji: string;
    starEmoji: string;
    wallLight: string;
    wallDark: string;
    pathLight: string;
    pathDark: string;
    trailColor: string;
  }
> = {
  corn: {
    labelEn: 'Corn Maze',
    labelId: 'Labirin Jagung',
    emoji: '🌽',
    playerEmoji: '🧑‍🌾',
    goalEmoji: '🏡',
    starEmoji: '⭐',
    wallLight: '#15803D',
    wallDark: '#14532D',
    pathLight: '#FEF9C3',
    pathDark: '#1E3A5F',
    trailColor: 'rgba(20, 184, 196, 0.25)',
  },
  race: {
    labelEn: 'Race Car',
    labelId: 'Balap Mobil',
    emoji: '🏎️',
    playerEmoji: '🏎️',
    goalEmoji: '🏁',
    starEmoji: '⚡',
    wallLight: '#0B2249',
    wallDark: '#06152E',
    pathLight: '#E8F5F8',
    pathDark: '#16386B',
    trailColor: 'rgba(20, 184, 196, 0.3)',
  },
  tortoise: {
    labelEn: 'Tortoise & Hare',
    labelId: 'Kura & Kelinci',
    emoji: '🐢',
    playerEmoji: '🐢',
    goalEmoji: '🏆',
    starEmoji: '🥕',
    wallLight: '#0F766E',
    wallDark: '#115E59',
    pathLight: '#F0FDFA',
    pathDark: '#102C54',
    trailColor: 'rgba(45, 212, 191, 0.28)',
  },
};

export const MazeAdventureGame: React.FC<MazeAdventureGameProps> = ({
  language,
  onLanguageChange,
  isLightMode,
  soundOn,
  onToggleSound,
  onScoreUpdate,
  clearSignal,
}) => {
  const [themeId, setThemeId] = useState<MazeThemeId>('corn');
  const [level, setLevel] = useState<number>(1);
  const mazeSize = level === 1 ? 9 : level === 2 ? 11 : 13;

  const [maze, setMaze] = useState<number[][]>(() => generateMaze(9));
  const [playerPos, setPlayerPos] = useState<{ r: number; c: number }>({
    r: 1,
    c: 1,
  });
  const [visitedTrail, setVisitedTrail] = useState<Set<string>>(
    () => new Set(['1,1'])
  );
  const [checkpoints, setCheckpoints] = useState<CheckpointNode[]>([]);
  const [activeChallengeIdx, setActiveChallengeIdx] = useState<number | null>(
    null
  );
  const [hintCells, setHintCells] = useState<Set<string>>(new Set());

  // Tortoise & Hare live rival state
  const [harePath, setHarePath] = useState<{ r: number; c: number }[]>([]);
  const [hareStepIdx, setHareStepIdx] = useState<number>(0);
  const [hareSleeping, setHareSleeping] = useState<boolean>(false);

  const [score, setScore] = useState<number>(0);
  const [stepsCount, setStepsCount] = useState<number>(0);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [status, setStatus] = useState<'PLAYING' | 'WON' | 'HARE_WON'>(
    'PLAYING'
  );
  const [bannerText, setBannerText] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);

  const swipeStartRef = useRef<{ x: number; y: number } | null>(null);
  const theme = MAZE_THEMES[themeId];
  const goalPos = { r: maze.length - 2, c: maze.length - 2 };

  const speakEnglishWord = useCallback(
    (word?: string) => {
      if (!word || !soundOn) return;
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(word);
          u.lang = 'en-US';
          u.rate = 0.88;
          window.speechSynthesis.speak(u);
        }
      } catch {
        // Ignore unsupported browsers
      }
    },
    [soundOn]
  );

  const flashBanner = useCallback((msg: string) => {
    setBannerText(msg);
    window.setTimeout(() => {
      setBannerText((prev) => (prev === msg ? null : prev));
    }, 2400);
  }, []);

  const initLevel = useCallback(
    (nextTheme: MazeThemeId, nextLevel: number, keepScore: boolean = false) => {
      const nextSize = nextLevel === 1 ? 9 : nextLevel === 2 ? 11 : 13;
      const freshMaze = generateMaze(nextSize);
      const freshCheckpoints = buildCheckpoints(freshMaze, nextTheme, nextLevel);
      const fullPath = findShortestPath(
        freshMaze,
        1,
        1,
        nextSize - 2,
        nextSize - 2
      );

      setThemeId(nextTheme);
      setLevel(nextLevel);
      setMaze(freshMaze);
      setPlayerPos({ r: 1, c: 1 });
      setVisitedTrail(new Set(['1,1']));
      setCheckpoints(freshCheckpoints);
      setActiveChallengeIdx(null);
      setHintCells(new Set());
      setHarePath(fullPath);
      setHareStepIdx(0);
      setHareSleeping(false);
      setStepsCount(0);
      setElapsedSec(0);
      setStatus('PLAYING');
      setBannerText(null);
      if (!keepScore) {
        setScore(0);
      }
      soundEngine.playBlockSelect();
    },
    []
  );

  // Initialize checkpoints & hare path on first mount
  useEffect(() => {
    initLevel('corn', 1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (clearSignal) {
      initLevel(themeId, 1, false);
    }
  }, [clearSignal, initLevel, themeId]);

  // Live timer for reflex & focus tracking
  useEffect(() => {
    if (status !== 'PLAYING' || activeChallengeIdx !== null || showHowItWorks) {
      return;
    }
    const id = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [activeChallengeIdx, showHowItWorks, status]);

  // Tortoise & Hare live pacing AI: Hare dashes fast, then naps ("💤") so the steady Tortoise can pass!
  useEffect(() => {
    if (
      themeId !== 'tortoise' ||
      status !== 'PLAYING' ||
      activeChallengeIdx !== null ||
      showHowItWorks ||
      harePath.length === 0
    ) {
      return;
    }

    const tickMs = hareSleeping ? 2100 : 780;
    const timer = window.setTimeout(() => {
      if (hareSleeping) {
        setHareSleeping(false);
        return;
      }

      const nextIdx = Math.min(harePath.length - 1, hareStepIdx + 1);
      setHareStepIdx(nextIdx);

      if (nextIdx >= harePath.length - 1) {
        setStatus('HARE_WON');
        soundEngine.playGameOver();
        return;
      }

      // Classic fable twist: Hare gets overconfident every 3 steps and takes a nap!
      if (nextIdx > 0 && nextIdx % 3 === 0) {
        setHareSleeping(true);
        flashBanner(
          language === 'id'
            ? '💤 Kelinci tertidur! Ayo Kura-Kura, salip sekarang!'
            : '💤 The Hare stopped for a nap! Quick Tortoise, pass him!'
        );
      }
    }, tickMs);

    return () => window.clearTimeout(timer);
  }, [
    activeChallengeIdx,
    flashBanner,
    harePath.length,
    hareSleeping,
    hareStepIdx,
    language,
    showHowItWorks,
    status,
    themeId,
  ]);

  const movePlayerTo = useCallback(
    (nr: number, nc: number) => {
      if (status !== 'PLAYING' || activeChallengeIdx !== null) return;
      if (nr < 0 || nr >= maze.length || nc < 0 || nc >= maze.length) return;
      if (maze[nr][nc] === 1) {
        soundEngine.triggerHaptic(18);
        return;
      }

      setPlayerPos({ r: nr, c: nc });
      setVisitedTrail((prev) => new Set(prev).add(`${nr},${nc}`));
      setStepsCount((prev) => prev + 1);
      setHintCells((prev) => {
        if (!prev.has(`${nr},${nc}`)) return prev;
        const next = new Set(prev);
        next.delete(`${nr},${nc}`);
        return next;
      });
      soundEngine.playBlockPlace(stepsCount % 6, level);

      // Check if stepped onto an unsolved Educational Checkpoint
      const cpIdx = checkpoints.findIndex(
        (cp) => !cp.solved && cp.r === nr && cp.c === nc
      );
      if (cpIdx !== -1) {
        setActiveChallengeIdx(cpIdx);
        soundEngine.playBlockSelect();
        if (checkpoints[cpIdx].challenge.speakWord) {
          speakEnglishWord(checkpoints[cpIdx].challenge.speakWord);
        }
        return;
      }

      // Check Goal Reached!
      if (nr === goalPos.r && nc === goalPos.c) {
        const solvedStars = checkpoints.filter((c) => c.solved).length;
        const speedBonus = Math.max(100, 600 - elapsedSec * 6);
        const levelPts = 550 + level * 250 + solvedStars * 200 + speedBonus;
        const levelCredits = 9000 + level * 2500 + solvedStars * 1500;
        const nextScore = score + levelPts;

        setScore(nextScore);
        setStatus('WON');
        soundEngine.playLevelCompleteChime();
        confetti({ particleCount: 95, spread: 90, origin: { y: 0.55 } });
        onScoreUpdate({
          score: nextScore,
          level: level + 1,
          earnedCredits: levelCredits,
          completedLevel: true,
        });
      }
    },
    [
      activeChallengeIdx,
      checkpoints,
      elapsedSec,
      goalPos.c,
      goalPos.r,
      level,
      maze,
      onScoreUpdate,
      score,
      speakEnglishWord,
      status,
      stepsCount,
    ]
  );

  const stepDirection = useCallback(
    (dr: number, dc: number) => {
      movePlayerTo(playerPos.r + dr, playerPos.c + dc);
    },
    [movePlayerTo, playerPos.c, playerPos.r]
  );

  // Keyboard Arrow & WASD controls for desktop
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (status !== 'PLAYING' || activeChallengeIdx !== null || showHowItWorks) {
        return;
      }
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        stepDirection(-1, 0);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        stepDirection(1, 0);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        stepDirection(0, -1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        stepDirection(0, 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeChallengeIdx, showHowItWorks, status, stepDirection]);

  // Clicking an open cell in the same row/col steps 1 square toward it (super intuitive on touchscreens!)
  const handleCellTap = (r: number, c: number) => {
    if (status !== 'PLAYING' || activeChallengeIdx !== null) return;
    if (maze[r][c] === 1) return;
    const dr = r - playerPos.r;
    const dc = c - playerPos.c;
    if (Math.abs(dr) + Math.abs(dc) === 1) {
      movePlayerTo(r, c);
      return;
    }
    if (dr === 0 && dc !== 0) {
      stepDirection(0, dc > 0 ? 1 : -1);
    } else if (dc === 0 && dr !== 0) {
      stepDirection(dr > 0 ? 1 : -1, 0);
    }
  };

  const handleAnswerChallenge = (pickedIdx: 0 | 1) => {
    if (activeChallengeIdx === null) return;
    const node = checkpoints[activeChallengeIdx];
    if (!node) return;

    if (pickedIdx === node.challenge.correctIndex) {
      const nextScore = score + 300;
      setScore(nextScore);
      setCheckpoints((prev) =>
        prev.map((cp, idx) =>
          idx === activeChallengeIdx ? { ...cp, solved: true } : cp
        )
      );
      setActiveChallengeIdx(null);
      soundEngine.playPatternComplete();
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      if (node.challenge.speakWord) {
        speakEnglishWord(node.challenge.speakWord);
      }
      flashBanner(
        language === 'id'
          ? `✅ Benar! ${node.challenge.explanationId} (+300 Poin!)`
          : `✅ Correct! ${node.challenge.explanationEn} (+300 PTS!)`
      );
      onScoreUpdate({
        score: nextScore,
        level,
        earnedCredits: 2500,
      });
    } else {
      soundEngine.playBlockRotate();
      flashBanner(
        language === 'id'
          ? 'Coba pilihan satunya — kamu pasti bisa!'
          : 'Try the other choice — you got this!'
      );
    }
  };

  const handleShowPathHint = () => {
    if (status !== 'PLAYING') return;
    const path = findShortestPath(
      maze,
      playerPos.r,
      playerPos.c,
      goalPos.r,
      goalPos.c
    );
    const nextFive = new Set<string>();
    path.slice(1, 6).forEach((p) => nextFive.add(`${p.r},${p.c}`));
    setHintCells(nextFive);
    soundEngine.playBlockSelect();
  };

  const harePos =
    themeId === 'tortoise' && harePath[hareStepIdx]
      ? harePath[hareStepIdx]
      : null;

  const solvedCount = checkpoints.filter((c) => c.solved).length;
  const activeChallenge =
    activeChallengeIdx !== null ? checkpoints[activeChallengeIdx] : null;
  const showEn = language === 'en' || language === 'bilingual';
  const showId = language === 'id' || language === 'bilingual';

  return (
    <div className="space-y-2">
      {/* Compact Theme & Brain HUD Strip */}
      <div className="bg-[#F2F9FB] dark:bg-[#0D244B] border border-[#C5E4EC] dark:border-[#1E447D] rounded-xl px-2.5 py-2 space-y-1.5">
        {/* 3 Maze Themes Switcher + Sound */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="grid grid-cols-3 gap-0.5 flex-1 bg-[#E8F5F8] dark:bg-[#071731] p-0.5 rounded-lg border border-[#C5E4EC] dark:border-[#1E447D]">
            {(['corn', 'race', 'tortoise'] as MazeThemeId[]).map((id) => {
              const t = MAZE_THEMES[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => initLevel(id, 1, false)}
                  className={`px-1.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap text-center cursor-pointer transition-colors ${
                    themeId === id
                      ? 'bg-[#0B2249] dark:bg-[#14B8C4] text-white dark:text-[#062134]'
                      : 'text-[#355275] dark:text-[#A9C8E8] hover:text-[#0B2249] dark:hover:text-white'
                  }`}
                >
                  {t.emoji} {language === 'id' ? t.labelId : t.labelEn}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            className={`p-1.5 rounded-md border cursor-pointer shrink-0 ${
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

        {/* Live Telemetry Row: Level · Stars · Timer + How It Works */}
        <div className="flex items-center justify-between gap-1.5 text-[10px] pt-0.5 border-t border-[#C5E4EC]/70 dark:border-[#1E447D]">
          <div className="flex items-center gap-2 font-mono font-bold text-[#0B2249] dark:text-[#CBE7F0] tabular-nums">
            <span>Lvl {level}</span>
            <span className="text-[#0D949E] dark:text-[#2DD4BF]">
              {theme.starEmoji} {solvedCount}/{checkpoints.length}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[#557293] dark:text-[#9FC0E2]">
              <Timer className="w-3 h-3" />
              {elapsedSec}s
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              <Brain className="w-3 h-3" />
              {themeId === 'race'
                ? language === 'id'
                  ? 'Refleks & Hitung'
                  : 'Math & Reflex'
                : language === 'id'
                ? 'Navigasi & Kosakata'
                : 'Spatial & Vocab'}
            </span>
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
      </div>

      {/* Transient Feedback Banner */}
      {bannerText && (
        <div className="bg-[#CCF5F8] dark:bg-[#12336B] border border-[#14B8C4] text-[#0B2249] dark:text-[#CCF5F8] px-3 py-1 rounded-lg text-[11px] font-extrabold text-center truncate">
          {bannerText}
        </div>
      )}

      {/* Interactive Educational Maze Board */}
      <div
        className="relative w-full aspect-square max-w-[350px] sm:max-w-[385px] mx-auto select-none touch-none"
        onPointerDown={(e) => {
          swipeStartRef.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerMove={(e) => {
          if (!swipeStartRef.current || status !== 'PLAYING' || activeChallengeIdx !== null) {
            return;
          }
          const dx = e.clientX - swipeStartRef.current.x;
          const dy = e.clientY - swipeStartRef.current.y;
          if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
          swipeStartRef.current = { x: e.clientX, y: e.clientY };
          if (Math.abs(dx) > Math.abs(dy)) {
            stepDirection(0, dx > 0 ? 1 : -1);
          } else {
            stepDirection(dy > 0 ? 1 : -1, 0);
          }
        }}
        onPointerUp={() => {
          swipeStartRef.current = null;
        }}
      >
        <div
          style={{
            gridTemplateColumns: `repeat(${maze.length}, minmax(0, 1fr))`,
          }}
          className="w-full h-full p-1.5 rounded-2xl border-2 border-[#0B2249] dark:border-[#14B8C4] bg-[#0B2249] grid gap-[1px] overflow-hidden shadow-md"
        >
          {maze.map((row, r) =>
            row.map((cellVal, c) => {
              const isWall = cellVal === 1;
              const isPlayer = playerPos.r === r && playerPos.c === c;
              const isGoal = goalPos.r === r && goalPos.c === c;
              const isHare =
                harePos !== null && harePos.r === r && harePos.c === c;
              const isHint = hintCells.has(`${r},${c}`);
              const isVisited = visitedTrail.has(`${r},${c}`);
              const cp = checkpoints.find(
                (node) => !node.solved && node.r === r && node.c === c
              );

              const bgColor = isWall
                ? isLightMode
                  ? theme.wallLight
                  : theme.wallDark
                : isHint
                ? '#2DD4BF'
                : isLightMode
                ? theme.pathLight
                : theme.pathDark;

              return (
                <button
                  key={`mz_${r}_${c}`}
                  type="button"
                  disabled={isWall}
                  onClick={() => handleCellTap(r, c)}
                  style={{
                    backgroundColor: bgColor,
                  }}
                  className={`w-full h-full rounded-[3px] flex items-center justify-center relative transition-colors focus:outline-none ${
                    isWall ? 'cursor-default' : 'cursor-pointer'
                  }`}
                  aria-label={`Maze cell ${r + 1}, ${c + 1}`}
                >
                  {/* Corn stalk / hedge subtle dot texture on walls */}
                  {isWall && themeId === 'corn' && (r + c) % 2 === 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300/35 pointer-events-none" />
                  )}

                  {/* Visited trail soft highlight */}
                  {!isWall && isVisited && !isHint && !isPlayer && !isGoal && (
                    <span
                      style={{ backgroundColor: theme.trailColor }}
                      className="absolute inset-0.5 rounded-[2px] pointer-events-none"
                    />
                  )}

                  {/* Unsolved Educational Checkpoint */}
                  {cp && !isPlayer && (
                    <span className="text-xs sm:text-sm leading-none animate-pulse z-10">
                      {theme.starEmoji}
                    </span>
                  )}

                  {/* Goal */}
                  {isGoal && !isPlayer && (
                    <span className="text-sm sm:text-base leading-none z-10">
                      {theme.goalEmoji}
                    </span>
                  )}

                  {/* Rival Hare in Tortoise & Hare Mode */}
                  {isHare && !isPlayer && (
                    <span
                      className={`text-sm sm:text-base leading-none z-10 ${
                        hareSleeping ? 'opacity-80' : ''
                      }`}
                    >
                      {hareSleeping ? '💤' : '🐇'}
                    </span>
                  )}

                  {/* Player Avatar */}
                  {isPlayer && (
                    <span className="text-sm sm:text-lg leading-none z-20 drop-shadow-xs scale-110">
                      {theme.playerEmoji}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* EDUCATIONAL CHECKPOINT POPUP (English Vocab or Quick Mental Math!) */}
        {activeChallenge && (
          <div className="absolute inset-0 bg-[#071731]/94 backdrop-blur-md rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-3 border-2 border-[#2DD4BF] z-30">
            <div className="text-3xl">{theme.starEmoji}</div>
            <div className="space-y-1">
              <div className="text-[10px] font-mono font-bold uppercase text-[#2DD4BF] flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {language === 'id'
                    ? 'Gerbang Latihan Otak (+300 Poin)'
                    : 'Brain Boost Checkpoint (+300 PTS)'}
                </span>
              </div>
              {showEn && (
                <h3 className="text-sm sm:text-base font-extrabold text-white">
                  🇬🇧 {activeChallenge.challenge.promptEn}
                </h3>
              )}
              {showId && (
                <p className="text-xs sm:text-sm font-bold text-[#CCF5F8]">
                  🇮🇩 {activeChallenge.challenge.promptId}
                </p>
              )}
            </div>

            {activeChallenge.challenge.speakWord && (
              <button
                type="button"
                onClick={() =>
                  speakEnglishWord(activeChallenge.challenge.speakWord)
                }
                className="px-3 py-1 bg-[#14B8C4]/25 hover:bg-[#14B8C4]/40 border border-[#14B8C4] text-[#CCF5F8] text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>
                  {language === 'id' ? 'Dengar Kata' : 'Hear Word'}
                </span>
              </button>
            )}

            <div className="grid grid-cols-2 gap-2.5 w-full max-w-[280px]">
              {activeChallenge.challenge.options.map((opt, idx) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleAnswerChallenge(idx as 0 | 1)}
                  className="py-3 px-3 bg-[#14B8C4] hover:bg-[#2DD4BF] text-[#062134] font-extrabold text-sm rounded-xl transition-transform active:scale-95 cursor-pointer shadow-sm"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BILINGUAL HOW IT WORKS MODAL */}
        {showHowItWorks && (
          <div className="absolute inset-0 bg-[#071731]/95 backdrop-blur-md rounded-2xl p-3.5 flex flex-col justify-between text-left border-2 border-[#14B8C4] z-30 overflow-y-auto">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{theme.emoji}</span>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#2DD4BF] font-bold">
                      Brain Maze / Labirin Edukasi
                    </div>
                    <h3 className="text-sm font-extrabold text-white">
                      {language === 'id'
                        ? 'Cara Bermain Labirin Otak'
                        : 'How to Play Brain Maze'}
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
                    🇬🇧 Stimulates visual-spatial nerves, hand-eye reflexes, and
                    learning! Swipe, tap the corridor, or use the arrows to
                    reach the goal. Pick <strong>🌽 Corn Maze</strong> for
                    English vocabulary stars, <strong>🏎️ Race Car</strong> for
                    Turbo Math checkpoints, or{' '}
                    <strong>🐢 Tortoise &amp; Hare</strong> to outsmart the
                    napping Hare!
                  </p>
                )}
                {showId && (
                  <p className="text-[#CCF5F8] leading-snug">
                    🇮🇩 Melatih saraf visual-spasial, refleks mata-tangan, dan
                    belajar! Geser layar, ketuk jalan, atau pakai tombol panah
                    menuju garis akhir. Pilih <strong>🌽 Labirin Jagung</strong>{' '}
                    untuk bintang kosakata Inggris,{' '}
                    <strong>🏎️ Balap Mobil</strong> untuk hitung cepat, atau{' '}
                    <strong>🐢 Kura &amp; Kelinci</strong> untuk menyalip
                    kelinci saat ia tertidur!
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
                {language === 'id' ? 'Ayo Main Labirin!' : 'Start Maze!'}
              </span>
            </button>
          </div>
        )}

        {/* WIN / HARE WON OVERLAY */}
        {(status === 'WON' || status === 'HARE_WON') && (
          <div className="absolute inset-0 bg-[#071731]/93 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 border-2 border-[#2DD4BF] z-30">
            <div className="text-4xl">
              {status === 'WON' ? `${theme.playerEmoji}🎉` : '🐇💨'}
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold uppercase text-[#2DD4BF]">
                {status === 'WON'
                  ? language === 'id'
                    ? `Level ${level} Selesai dalam ${elapsedSec}d!`
                    : `Level ${level} Cleared in ${elapsedSec}s!`
                  : language === 'id'
                  ? 'Kelinci Sampai Duluan!'
                  : 'The Hare Reached First!'}
              </div>
              <h3 className="text-xl font-extrabold text-white">
                {status === 'WON'
                  ? language === 'id'
                    ? 'Hebat! Kamu Menang!'
                    : 'Awesome Maze Victory!'
                  : language === 'id'
                  ? 'Ayo Balapan Lagi!'
                  : 'Rematch the Hare!'}
              </h3>
              <p className="text-xs font-mono text-[#CCF5F8]">
                {score.toLocaleString()} PTS · {theme.starEmoji} {solvedCount}/
                {checkpoints.length}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {status === 'WON' ? (
                <button
                  type="button"
                  onClick={() => initLevel(themeId, level + 1, true)}
                  className="px-5 py-2.5 bg-[#14B8C4] hover:bg-[#2DD4BF] text-[#062134] font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <span>
                    {language === 'id'
                      ? `Lanjut Level ${level + 1}`
                      : `Next Maze (Level ${level + 1})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => initLevel(themeId, level, true)}
                  className="px-5 py-2.5 bg-[#14B8C4] hover:bg-[#2DD4BF] text-[#062134] font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{language === 'id' ? 'Coba Lagi' : 'Try Again'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compact Tactile D-Pad + Hint & New Maze Controls */}
      <div className="w-full max-w-[350px] sm:max-w-[385px] mx-auto bg-white dark:bg-[#0D244B] border border-[#C5E4EC] dark:border-[#1E447D] rounded-xl p-2 flex items-center justify-between gap-2">
        {/* Left: Hint & New Maze */}
        <div className="flex flex-col gap-1.5 w-[108px] shrink-0">
          <button
            type="button"
            onClick={handleShowPathHint}
            disabled={status !== 'PLAYING'}
            className="py-2 px-2 bg-[#0B2249] dark:bg-[#2DD4BF] hover:bg-[#12336B] dark:hover:bg-[#5EEAD4] disabled:opacity-40 text-white dark:text-[#062134] text-[11px] font-extrabold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'id' ? 'Petunjuk' : 'Path Hint'}</span>
          </button>
          <button
            type="button"
            onClick={() => initLevel(themeId, level, true)}
            className="py-2 px-2 bg-[#E8F5F8] dark:bg-[#122E5E] hover:bg-[#D5EEF4] dark:hover:bg-[#1B4284] border border-[#C5E4EC] dark:border-[#1E447D] text-[#0B2249] dark:text-[#2DD4BF] text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'id' ? 'Labirin Baru' : 'New Maze'}</span>
          </button>
        </div>

        {/* Right: Ergonomic Motor-Reflex D-Pad (44px+ friendly buttons) */}
        <div className="grid grid-cols-3 gap-1 flex-1 max-w-[168px]">
          <div />
          <button
            type="button"
            onClick={() => stepDirection(-1, 0)}
            className="h-10 bg-[#14B8C4] hover:bg-[#0EA5B7] active:scale-95 text-[#062134] rounded-lg flex items-center justify-center cursor-pointer shadow-xs"
            aria-label="Move Up"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div />
          <button
            type="button"
            onClick={() => stepDirection(0, -1)}
            className="h-10 bg-[#14B8C4] hover:bg-[#0EA5B7] active:scale-95 text-[#062134] rounded-lg flex items-center justify-center cursor-pointer shadow-xs"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => stepDirection(1, 0)}
            className="h-10 bg-[#14B8C4] hover:bg-[#0EA5B7] active:scale-95 text-[#062134] rounded-lg flex items-center justify-center cursor-pointer shadow-xs"
            aria-label="Move Down"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => stepDirection(0, 1)}
            className="h-10 bg-[#14B8C4] hover:bg-[#0EA5B7] active:scale-95 text-[#062134] rounded-lg flex items-center justify-center cursor-pointer shadow-xs"
            aria-label="Move Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
