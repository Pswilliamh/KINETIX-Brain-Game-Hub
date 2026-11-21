import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { AppLanguage } from '../types/game';
import { soundEngine } from '../utils/soundAndHaptics';
import {
  Play,
  Undo2,
  Lightbulb,
  BookOpen,
  X,
  Brain,
  Volume2,
  VolumeX,
  Crown,
  Users,
  Bot,
} from 'lucide-react';

interface CheckersGameProps {
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  isLightMode: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
  onScoreUpdate: (params: {
    score: number;
    level: number;
    earnedCredits: number;
    wonMatch?: boolean;
  }) => void;
  clearSignal?: number;
}

type PieceOwner = 'player' | 'opponent';
type OpponentMode = 'ai-easy' | 'ai-smart' | 'two-player';

interface CheckerPiece {
  owner: PieceOwner;
  isKing: boolean;
}

type CheckersBoard = (CheckerPiece | null)[][];

interface CheckerMove {
  fromR: number;
  fromC: number;
  toR: number;
  toC: number;
  capturedR?: number;
  capturedC?: number;
}

interface HistorySnapshot {
  board: CheckersBoard;
  turn: PieceOwner;
  lockedPiece: { r: number; c: number } | null;
  playerCaptured: number;
  opponentCaptured: number;
  score: number;
}

const SIZE = 8;

function createInitialCheckersBoard(): CheckersBoard {
  const board: CheckersBoard = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(null)
  );
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) {
          board[r][c] = { owner: 'opponent', isKing: false };
        } else if (r > 4) {
          board[r][c] = { owner: 'player', isKing: false };
        }
      }
    }
  }
  return board;
}

function cloneBoard(board: CheckersBoard): CheckersBoard {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function getMoveDirs(piece: CheckerPiece): [number, number][] {
  if (piece.isKing) {
    return [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
  }
  return piece.owner === 'player'
    ? [
        [-1, -1],
        [-1, 1],
      ]
    : [
        [1, -1],
        [1, 1],
      ];
}

function getPieceJumps(
  board: CheckersBoard,
  r: number,
  c: number
): CheckerMove[] {
  const piece = board[r][c];
  if (!piece) return [];
  const jumps: CheckerMove[] = [];
  for (const [dr, dc] of getMoveDirs(piece)) {
    const midR = r + dr;
    const midC = c + dc;
    const landR = r + dr * 2;
    const landC = c + dc * 2;
    if (
      landR >= 0 &&
      landR < SIZE &&
      landC >= 0 &&
      landC < SIZE &&
      board[midR][midC] &&
      board[midR][midC]!.owner !== piece.owner &&
      board[landR][landC] === null
    ) {
      jumps.push({
        fromR: r,
        fromC: c,
        toR: landR,
        toC: landC,
        capturedR: midR,
        capturedC: midC,
      });
    }
  }
  return jumps;
}

function getPieceSimpleMoves(
  board: CheckersBoard,
  r: number,
  c: number
): CheckerMove[] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: CheckerMove[] = [];
  for (const [dr, dc] of getMoveDirs(piece)) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === null) {
      moves.push({ fromR: r, fromC: c, toR: nr, toC: nc });
    }
  }
  return moves;
}

function getAllLegalMoves(
  board: CheckersBoard,
  owner: PieceOwner,
  lockedPiece: { r: number; c: number } | null
): { moves: CheckerMove[]; mustJump: boolean } {
  if (lockedPiece) {
    const furtherJumps = getPieceJumps(board, lockedPiece.r, lockedPiece.c);
    return { moves: furtherJumps, mustJump: furtherJumps.length > 0 };
  }

  const allJumps: CheckerMove[] = [];
  const allSimple: CheckerMove[] = [];

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const p = board[r][c];
      if (!p || p.owner !== owner) continue;
      allJumps.push(...getPieceJumps(board, r, c));
      allSimple.push(...getPieceSimpleMoves(board, r, c));
    }
  }

  if (allJumps.length > 0) {
    return { moves: allJumps, mustJump: true };
  }
  return { moves: allSimple, mustJump: false };
}

function applyCheckerMove(
  board: CheckersBoard,
  move: CheckerMove
): {
  nextBoard: CheckersBoard;
  wasCapture: boolean;
  becameKing: boolean;
  canChainJump: boolean;
} {
  const nextBoard = cloneBoard(board);
  const movingPiece = nextBoard[move.fromR][move.fromC]!;
  nextBoard[move.fromR][move.fromC] = null;

  let wasCapture = false;
  if (move.capturedR !== undefined && move.capturedC !== undefined) {
    nextBoard[move.capturedR][move.capturedC] = null;
    wasCapture = true;
  }

  let becameKing = false;
  if (
    !movingPiece.isKing &&
    ((movingPiece.owner === 'player' && move.toR === 0) ||
      (movingPiece.owner === 'opponent' && move.toR === SIZE - 1))
  ) {
    movingPiece.isKing = true;
    becameKing = true;
  }

  nextBoard[move.toR][move.toC] = movingPiece;

  const canChainJump =
    wasCapture &&
    !becameKing &&
    getPieceJumps(nextBoard, move.toR, move.toC).length > 0;

  return { nextBoard, wasCapture, becameKing, canChainJump };
}

function evaluateBoardFor(board: CheckersBoard, owner: PieceOwner): number {
  let val = 0;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const p = board[r][c];
      if (!p) continue;
      const base = p.isKing ? 55 : 30;
      const advancement =
        p.owner === 'opponent' ? r * 2.2 : (SIZE - 1 - r) * 2.2;
      const centerBonus = c >= 2 && c <= 5 && r >= 2 && r <= 5 ? 4 : 0;
      const edgeSafety = c === 0 || c === SIZE - 1 ? 3 : 0;
      const pieceScore = base + advancement + centerBonus + edgeSafety;
      val += p.owner === owner ? pieceScore : -pieceScore;
    }
  }
  return val;
}

function chooseBotMove(
  board: CheckersBoard,
  owner: PieceOwner,
  lockedPiece: { r: number; c: number } | null,
  difficulty: 'ai-easy' | 'ai-smart'
): CheckerMove | null {
  const { moves } = getAllLegalMoves(board, owner, lockedPiece);
  if (moves.length === 0) return null;

  if (difficulty === 'ai-easy' && Math.random() < 0.48) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const enemy: PieceOwner = owner === 'opponent' ? 'player' : 'opponent';
  let bestMove = moves[0];
  let bestScore = -99999;

  for (const move of moves) {
    const res = applyCheckerMove(board, move);
    let score = evaluateBoardFor(res.nextBoard, owner);
    if (res.wasCapture) score += 26;
    if (res.becameKing) score += 35;
    if (res.canChainJump) score += 30;

    // 1-ply lookahead: penalize if enemy gets an immediate capture
    if (!res.canChainJump) {
      const enemyReply = getAllLegalMoves(res.nextBoard, enemy, null);
      if (enemyReply.mustJump) {
        score -= 34;
      }
      if (enemyReply.moves.length === 0) {
        score += 500;
      }
    }

    score += (Math.random() - 0.5) * (difficulty === 'ai-smart' ? 3 : 10);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

export const CheckersGame: React.FC<CheckersGameProps> = ({
  language,
  onLanguageChange,
  isLightMode,
  soundOn,
  onToggleSound,
  onScoreUpdate,
  clearSignal,
}) => {
  const [board, setBoard] = useState<CheckersBoard>(() =>
    createInitialCheckersBoard()
  );
  const [turn, setTurn] = useState<PieceOwner>('player');
  const [opponentMode, setOpponentMode] = useState<OpponentMode>('ai-easy');
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(
    null
  );
  const [lockedPiece, setLockedPiece] = useState<{ r: number; c: number } | null>(
    null
  );
  const [lastMove, setLastMove] = useState<{
    fromR: number;
    fromC: number;
    toR: number;
    toC: number;
  } | null>(null);
  const [hintMove, setHintMove] = useState<CheckerMove | null>(null);
  const [history, setHistory] = useState<HistorySnapshot[]>([]);

  const [playerCaptured, setPlayerCaptured] = useState<number>(0);
  const [opponentCaptured, setOpponentCaptured] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [winner, setWinner] = useState<PieceOwner | null>(null);
  const [bannerText, setBannerText] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);

  const botTimerRef = useRef<number | null>(null);

  const legalInfo = React.useMemo(
    () => getAllLegalMoves(board, turn, lockedPiece),
    [board, turn, lockedPiece]
  );

  const flashBanner = useCallback((msg: string) => {
    setBannerText(msg);
    window.setTimeout(() => {
      setBannerText((prev) => (prev === msg ? null : prev));
    }, 2400);
  }, []);

  const resetGame = useCallback((nextOppMode?: OpponentMode) => {
    if (botTimerRef.current) {
      window.clearTimeout(botTimerRef.current);
      botTimerRef.current = null;
    }
    if (nextOppMode) setOpponentMode(nextOppMode);
    setBoard(createInitialCheckersBoard());
    setTurn('player');
    setSelected(null);
    setLockedPiece(null);
    setLastMove(null);
    setHintMove(null);
    setHistory([]);
    setPlayerCaptured(0);
    setOpponentCaptured(0);
    setScore(0);
    setWinner(null);
    setBannerText(null);
    soundEngine.playBlockSelect();
  }, []);

  useEffect(() => {
    if (clearSignal) {
      resetGame();
    }
  }, [clearSignal, resetGame]);

  const executeMove = useCallback(
    (move: CheckerMove, saveSnapshot: boolean = true) => {
      if (saveSnapshot) {
        setHistory((prev) => [
          ...prev.slice(-14),
          {
            board: cloneBoard(board),
            turn,
            lockedPiece,
            playerCaptured,
            opponentCaptured,
            score,
          },
        ]);
      }

      const res = applyCheckerMove(board, move);
      const isPlayerTurn = turn === 'player';

      let nextPlayerCap = playerCaptured;
      let nextOppCap = opponentCaptured;
      let ptsDelta = 0;
      let credDelta = 0;

      if (res.wasCapture) {
        if (isPlayerTurn) {
          nextPlayerCap += 1;
          ptsDelta += 180;
          credDelta += 1200;
        } else {
          nextOppCap += 1;
        }
      } else if (isPlayerTurn) {
        ptsDelta += 25;
        credDelta += 150;
      }

      if (res.becameKing) {
        if (isPlayerTurn) {
          ptsDelta += 350;
          credDelta += 3000;
        }
        soundEngine.playPatternComplete();
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.55 } });
        flashBanner(
          language === 'id'
            ? '👑 RAJA BARU! Bidak bisa maju & mundur!'
            : '👑 CROWNED KING! This piece can move both ways!'
        );
      } else if (res.wasCapture) {
        soundEngine.playLineClear(res.canChainJump ? 2 : 1, 1);
      } else {
        soundEngine.playBlockPlace(0, 1);
      }

      const nextScore = score + ptsDelta;
      setBoard(res.nextBoard);
      setPlayerCaptured(nextPlayerCap);
      setOpponentCaptured(nextOppCap);
      setScore(nextScore);
      setLastMove({
        fromR: move.fromR,
        fromC: move.fromC,
        toR: move.toR,
        toC: move.toC,
      });
      setHintMove(null);

      if (ptsDelta > 0) {
        onScoreUpdate({
          score: nextScore,
          level: opponentMode === 'ai-smart' ? 2 : 1,
          earnedCredits: credDelta,
        });
      }

      // Check chain jump
      if (res.canChainJump) {
        setLockedPiece({ r: move.toR, c: move.toC });
        setSelected({ r: move.toR, c: move.toC });
        flashBanner(
          language === 'id'
            ? '🔥 LOMPAT GANDA! Lompat lagi dengan bidak yang sama!'
            : '🔥 DOUBLE JUMP! Jump again with the same piece!'
        );
        return;
      }

      // Switch turn & check if next side has any legal moves
      const nextTurn: PieceOwner = turn === 'player' ? 'opponent' : 'player';
      const nextLegal = getAllLegalMoves(res.nextBoard, nextTurn, null);

      setLockedPiece(null);
      setSelected(null);

      if (nextLegal.moves.length === 0) {
        setWinner(turn);
        if (turn === 'player' || opponentMode === 'two-player') {
          soundEngine.playLevelCompleteChime();
          confetti({ particleCount: 100, spread: 90, origin: { y: 0.55 } });
          if (turn === 'player') {
            const winBonusPts = opponentMode === 'ai-smart' ? 1500 : 1000;
            const winBonusCreds = opponentMode === 'ai-smart' ? 18000 : 12000;
            setScore(nextScore + winBonusPts);
            onScoreUpdate({
              score: nextScore + winBonusPts,
              level: opponentMode === 'ai-smart' ? 2 : 1,
              earnedCredits: winBonusCreds,
              wonMatch: true,
            });
          }
        } else {
          soundEngine.playGameOver();
        }
        return;
      }

      setTurn(nextTurn);
    },
    [
      board,
      flashBanner,
      language,
      lockedPiece,
      onScoreUpdate,
      opponentCaptured,
      opponentMode,
      playerCaptured,
      score,
      turn,
    ]
  );

  // Automatic Bot Turn
  useEffect(() => {
    if (winner || opponentMode === 'two-player' || turn !== 'opponent') return;

    botTimerRef.current = window.setTimeout(() => {
      const botMove = chooseBotMove(
        board,
        'opponent',
        lockedPiece,
        opponentMode
      );
      if (botMove) {
        executeMove(botMove, false);
      }
    }, 560);

    return () => {
      if (botTimerRef.current) {
        window.clearTimeout(botTimerRef.current);
        botTimerRef.current = null;
      }
    };
  }, [board, executeMove, lockedPiece, opponentMode, turn, winner]);

  const handleSquareClick = (r: number, c: number) => {
    if (winner) return;
    if (opponentMode !== 'two-player' && turn === 'opponent') return;

    // Check if clicking a valid destination for the selected piece
    if (selected) {
      const matchingMove = legalInfo.moves.find(
        (m) =>
          m.fromR === selected.r &&
          m.fromC === selected.c &&
          m.toR === r &&
          m.toC === c
      );
      if (matchingMove) {
        executeMove(matchingMove, true);
        return;
      }
    }

    // Otherwise select a movable piece belonging to current turn
    const piece = board[r][c];
    if (piece && piece.owner === turn) {
      if (lockedPiece && (lockedPiece.r !== r || lockedPiece.c !== c)) {
        flashBanner(
          language === 'id'
            ? 'Selesaikan lompatan ganda dengan bidak yang menyala!'
            : 'Finish the double jump with the highlighted piece!'
        );
        return;
      }
      const hasLegal = legalInfo.moves.some(
        (m) => m.fromR === r && m.fromC === c
      );
      if (hasLegal) {
        setSelected({ r, c });
        setHintMove(null);
        soundEngine.playBlockSelect();
      } else if (legalInfo.mustJump) {
        flashBanner(
          language === 'id'
            ? '👆 Ada bidak lawan yang bisa dilompati! Pilih bidak yang berkedip.'
            : '👆 A jump capture is available! Tap a glowing piece to jump.'
        );
        soundEngine.playBlockRotate();
      }
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    if (botTimerRef.current) {
      window.clearTimeout(botTimerRef.current);
      botTimerRef.current = null;
    }
    const prev = history[history.length - 1];
    setBoard(prev.board);
    setTurn(prev.turn);
    setLockedPiece(prev.lockedPiece);
    setPlayerCaptured(prev.playerCaptured);
    setOpponentCaptured(prev.opponentCaptured);
    setScore(prev.score);
    setSelected(null);
    setHintMove(null);
    setWinner(null);
    setHistory((h) => h.slice(0, -1));
    soundEngine.playBlockRotate();
  };

  const handleHint = () => {
    if (winner) return;
    if (opponentMode !== 'two-player' && turn === 'opponent') return;
    const suggestion = chooseBotMove(board, turn, lockedPiece, 'ai-smart');
    if (suggestion) {
      setSelected({ r: suggestion.fromR, c: suggestion.fromC });
      setHintMove(suggestion);
      soundEngine.playBlockSelect();
    }
  };

  const selectedDestinations = React.useMemo(() => {
    if (!selected) return new Map<string, CheckerMove>();
    const map = new Map<string, CheckerMove>();
    legalInfo.moves.forEach((m) => {
      if (m.fromR === selected.r && m.fromC === selected.c) {
        map.set(`${m.toR},${m.toC}`, m);
      }
    });
    return map;
  }, [legalInfo.moves, selected]);

  const movableSources = React.useMemo(() => {
    const set = new Set<string>();
    legalInfo.moves.forEach((m) => set.add(`${m.fromR},${m.fromC}`));
    return set;
  }, [legalInfo.moves]);

  const showEn = language === 'en' || language === 'bilingual';
  const showId = language === 'id' || language === 'bilingual';

  return (
    <div className="space-y-2">
      {/* Compact Checkers HUD Strip */}
      <div className="bg-[#F2F9FB] dark:bg-[#0D244B] border border-[#C5E4EC] dark:border-[#1E447D] rounded-xl px-2.5 py-2 space-y-1.5">
        <div className="flex items-center justify-between gap-1.5">
          {/* Opponent Mode Segmented Selector */}
          <div className="flex items-center gap-0.5 bg-[#E8F5F8] dark:bg-[#071731] p-0.5 rounded-lg border border-[#C5E4EC] dark:border-[#1E447D]">
            {(
              [
                {
                  id: 'ai-easy',
                  label: language === 'id' ? 'Bot Mudah' : 'Easy Bot',
                  icon: Bot,
                },
                {
                  id: 'ai-smart',
                  label: language === 'id' ? 'Bot Pintar' : 'Smart Bot',
                  icon: Brain,
                },
                {
                  id: 'two-player',
                  label: language === 'id' ? '2 Pemain' : '2 Players',
                  icon: Users,
                },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => resetGame(opt.id)}
                  className={`px-1.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors ${
                    opponentMode === opt.id
                      ? 'bg-[#0B2249] dark:bg-[#14B8C4] text-white dark:text-[#062134]'
                      : 'text-[#355275] dark:text-[#A9C8E8] hover:text-[#0B2249] dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span>{opt.label}</span>
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

        {/* Turn Indicator + Captured Counters */}
        <div className="flex items-center justify-between gap-2 text-[11px] font-bold pt-0.5 border-t border-[#C5E4EC]/70 dark:border-[#1E447D]">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                turn === 'player'
                  ? 'bg-[#14B8C4] border-[#0B2249] dark:border-white'
                  : 'bg-[#F43F5E] border-[#0B2249] dark:border-white'
              }`}
            />
            <span className="text-[#0B2249] dark:text-white">
              {turn === 'player'
                ? opponentMode === 'two-player'
                  ? language === 'id'
                    ? 'Giliran Biru (P1)'
                    : 'Turquoise Turn (P1)'
                  : language === 'id'
                  ? 'Giliran Kamu!'
                  : 'Your Turn!'
                : opponentMode === 'two-player'
                ? language === 'id'
                  ? 'Giliran Merah (P2)'
                  : 'Coral Turn (P2)'
                : language === 'id'
                ? 'Bot Berpikir...'
                : 'Bot Thinking...'}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] tabular-nums">
            <span className="text-[#0D949E] dark:text-[#2DD4BF]">
              ● {playerCaptured}
            </span>
            <span className="text-slate-400">/</span>
            <span className="text-rose-500">● {opponentCaptured}</span>
          </div>
        </div>

        {/* Slim Brain Skill + How It Works Row */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 min-w-0">
            <Brain className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 truncate">
              {language === 'id'
                ? 'Latihan Otak: Strategi Catur Dam & Logika Langkah'
                : language === 'en'
                ? 'Brain Workout: Strategic Thinking & Look-Ahead Logic'
                : 'Strategic Logic · Strategi Catur Dam & Logika'}
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

      {/* Transient Jump / King Alert */}
      {bannerText && (
        <div className="bg-[#CCF5F8] dark:bg-[#12336B] border border-[#14B8C4] text-[#0B2249] dark:text-[#CCF5F8] px-3 py-1 rounded-lg text-[11px] font-extrabold text-center truncate">
          {bannerText}
        </div>
      )}

      {/* 8x8 Classic Checkers Board */}
      <div className="relative w-full aspect-square max-w-[360px] sm:max-w-[400px] mx-auto select-none">
        <div className="w-full h-full p-1.5 rounded-2xl border-2 border-[#0B2249] dark:border-[#14B8C4] bg-[#0B2249] grid grid-cols-8 overflow-hidden shadow-md">
          {board.map((row, r) =>
            row.map((piece, c) => {
              const isDarkSquare = (r + c) % 2 === 1;
              const isSelected = selected?.r === r && selected?.c === c;
              const destMove = selectedDestinations.get(`${r},${c}`);
              const isLastFrom =
                lastMove?.fromR === r && lastMove?.fromC === c;
              const isLastTo = lastMove?.toR === r && lastMove?.toC === c;
              const isHintDest = hintMove?.toR === r && hintMove?.toC === c;
              const isHumanTurn =
                opponentMode === 'two-player' || turn === 'player';
              const isMovableJumpPiece =
                !winner &&
                isHumanTurn &&
                legalInfo.mustJump &&
                movableSources.has(`${r},${c}`);

              const squareBg = !isDarkSquare
                ? isLightMode
                  ? '#F2F9FB'
                  : '#DCEEF4'
                : destMove
                ? '#0D949E'
                : isLastFrom || isLastTo
                ? '#1B4982'
                : '#102B57';

              return (
                <button
                  key={`chk_${r}_${c}`}
                  type="button"
                  disabled={!isDarkSquare}
                  onClick={() => handleSquareClick(r, c)}
                  style={{ backgroundColor: squareBg }}
                  className={`w-full h-full relative flex items-center justify-center transition-colors focus:outline-none ${
                    isDarkSquare ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  aria-label={`Checkers row ${r + 1} col ${c + 1}`}
                >
                  {/* Valid Destination Dot / Jump Target */}
                  {destMove && (
                    <span
                      className={`rounded-full pointer-events-none transition-transform ${
                        destMove.capturedR !== undefined
                          ? 'w-5 h-5 sm:w-6 sm:h-6 border-2 border-amber-300 bg-amber-300/35 animate-pulse'
                          : isHintDest
                          ? 'w-4 h-4 bg-[#2DD4BF] ring-2 ring-white animate-pulse'
                          : 'w-3.5 h-3.5 bg-[#CCF5F8]/90'
                      }`}
                    />
                  )}

                  {/* Checker Piece */}
                  {piece && (
                    <div
                      className={`w-[78%] h-[78%] rounded-full border-2 flex items-center justify-center transition-transform duration-150 shadow-md ${
                        piece.owner === 'player'
                          ? 'bg-gradient-to-br from-[#2DD4BF] to-[#0D949E] border-white text-[#062134]'
                          : 'bg-gradient-to-br from-[#FB7185] to-[#E11D48] border-[#FFE4E6] text-white'
                      } ${
                        isSelected
                          ? 'scale-115 ring-2 ring-amber-300 z-10'
                          : isMovableJumpPiece
                          ? 'ring-2 ring-amber-300 animate-pulse'
                          : ''
                      }`}
                    >
                      {piece.isKing ? (
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200 drop-shadow-xs fill-amber-300" />
                      ) : (
                        <span className="w-[54%] h-[54%] rounded-full border border-white/45 pointer-events-none" />
                      )}
                    </div>
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
                  <span className="text-2xl">🔴</span>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#2DD4BF] font-bold">
                      Checkers / Catur Dam
                    </div>
                    <h3 className="text-sm font-extrabold text-white">
                      {language === 'id'
                        ? 'Cara Bermain Catur Dam'
                        : 'How to Play Checkers'}
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
                    🇬🇧 Move your <strong>Turquoise pieces</strong> diagonally
                    forward on the dark squares. <strong>Jump over</strong>{' '}
                    Coral pieces to capture them (even double or triple jumps!).
                    Reach the top row to crown a <strong>👑 King</strong> that
                    can move both forward and backward. Play vs{' '}
                    <strong>Easy/Smart Bot</strong> or{' '}
                    <strong>2 Players</strong>!
                  </p>
                )}
                {showId && (
                  <p className="text-[#CCF5F8] leading-snug">
                    🇮🇩 Gerakkan <strong>bidak Toska (Biru)</strong> secara
                    diagonal ke depan pada kotak gelap.{' '}
                    <strong>Lompati bidak Merah</strong> untuk memakannya (bisa
                    lompat ganda!). Capai baris paling atas untuk menjadi{' '}
                    <strong>👑 Raja</strong> yang bisa bergerak maju dan mundur.
                    Bisa main lawan <strong>Bot</strong> atau{' '}
                    <strong>2 Pemain</strong>!
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
                {language === 'id' ? 'Ayo Main Catur Dam!' : 'Play Checkers!'}
              </span>
            </button>
          </div>
        )}

        {/* OVERLAY: WINNER */}
        {winner && (
          <div className="absolute inset-0 bg-[#071731]/93 backdrop-blur-md rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-3 border-2 border-[#2DD4BF] z-20">
            <div className="text-4xl">
              {winner === 'player' ? '🏆👑' : '🤝🔴'}
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-mono font-bold uppercase text-[#2DD4BF]">
                {language === 'id' ? 'Permainan Selesai' : 'Match Complete'}
              </div>
              <h3 className="text-xl font-extrabold text-white">
                {winner === 'player'
                  ? opponentMode === 'two-player'
                    ? language === 'id'
                      ? 'Pemain Biru (P1) Menang!'
                      : 'Turquoise (P1) Wins!'
                    : language === 'id'
                    ? 'Kamu Menang!'
                    : 'You Win!'
                  : opponentMode === 'two-player'
                  ? language === 'id'
                    ? 'Pemain Merah (P2) Menang!'
                    : 'Coral (P2) Wins!'
                  : language === 'id'
                  ? 'Bot Menang — Coba Lagi!'
                  : 'Bot Wins — Try Again!'}
              </h3>
              <p className="text-xs font-mono text-[#CCF5F8]">
                {score.toLocaleString()} PTS · {playerCaptured} vs{' '}
                {opponentCaptured}
              </p>
            </div>
            <button
              type="button"
              onClick={() => resetGame()}
              className="px-5 py-2.5 bg-[#14B8C4] hover:bg-[#2DD4BF] text-[#062134] font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{language === 'id' ? 'Main Lagi' : 'Play Again'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Compact 3-Button Essential Bottom Dock */}
      <div className="w-full max-w-[360px] sm:max-w-[400px] mx-auto bg-white dark:bg-[#0D244B] border border-[#C5E4EC] dark:border-[#1E447D] rounded-xl p-2 space-y-1.5">
        <div className="text-[10px] text-[#355275] dark:text-[#CBE7F0] px-1 text-center">
          {legalInfo.mustJump
            ? language === 'id'
              ? '⚡ Lompatan tersedia! Ketuk bidak yang berkedip lalu ketuk kotak kuning.'
              : '⚡ Jump available! Tap a glowing piece, then tap the gold ring.'
            : language === 'id'
            ? '👆 Ketuk bidak lalu ketuk kotak diagonal · Capai ujung untuk jadi 👑 Raja'
            : '👆 Tap a piece then a diagonal square · Reach top row for 👑 King'}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={handleHint}
            disabled={
              Boolean(winner) ||
              (opponentMode !== 'two-player' && turn === 'opponent')
            }
            className="py-2 px-2 bg-[#0B2249] dark:bg-[#2DD4BF] hover:bg-[#12336B] dark:hover:bg-[#5EEAD4] disabled:opacity-40 text-white dark:text-[#062134] text-[11px] font-extrabold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'id' ? 'Petunjuk' : 'Hint'}</span>
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="py-2 px-2 bg-[#E8F5F8] dark:bg-[#122E5E] hover:bg-[#D5EEF4] dark:hover:bg-[#1B4284] border border-[#C5E4EC] dark:border-[#1E447D] disabled:opacity-40 text-[#0B2249] dark:text-[#2DD4BF] text-[11px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer"
          >
            <Undo2 className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'id' ? 'Batal' : 'Undo'}</span>
          </button>

          <button
            type="button"
            onClick={() => resetGame()}
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
