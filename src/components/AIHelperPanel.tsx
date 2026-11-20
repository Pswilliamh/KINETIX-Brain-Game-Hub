import React, { useState } from 'react';
import {
  BlockShape,
  TargetMonumentPuzzle,
  TargetPattern,
} from '../types/game';
import {
  Bot,
  Sparkles,
  Play,
  Send,
  Crosshair,
  Loader2,
  AlertCircle,
  Gamepad2,
} from 'lucide-react';

export interface ComputedBestMove {
  trayIndex: number;
  shapeName: string;
  rotationsNeeded: number;
  rotatedCells: number[][];
  row: number;
  col: number;
  completesPattern: boolean;
  linesCleared: number;
  reasonSummary: string;
}

interface AICoachReply {
  headline: string;
  coachingAdvice: string;
  patternTip: string;
}

interface AIHelperPanelProps {
  grid: number[][];
  tray: (BlockShape | null)[];
  targetPattern: TargetPattern;
  activeMonument?: TargetMonumentPuzzle | null;
  bestMove: ComputedBestMove | null;
  isShowingHintOnBoard: boolean;
  onToggleHintOnBoard: () => void;
  onExecuteBestMove: () => void;
  onReturnToArena?: () => void;
}

export const AIHelperPanel: React.FC<AIHelperPanelProps> = ({
  grid,
  tray,
  targetPattern,
  activeMonument,
  bestMove,
  isShowingHintOnBoard,
  onToggleHintOnBoard,
  onExecuteBestMove,
  onReturnToArena,
}) => {
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [aiReply, setAiReply] = useState<AICoachReply | null>(null);
  const [loadingAI, setLoadingAI] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAskGeminiCoach = async (customPrompt?: string) => {
    setLoadingAI(true);
    setAiError(null);

    const activeGoalName = activeMonument
      ? `${activeMonument.name} (${activeMonument.location})`
      : targetPattern.name;
    const activeGoalCredits = activeMonument
      ? activeMonument.bonusCredits
      : targetPattern.bonusCredits;

    try {
      const response = await fetch('/api/ai-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grid,
          tray,
          targetPattern: activeMonument
            ? {
                id: activeMonument.id,
                name: `${activeMonument.name} Monument Blueprint`,
                bonusPoints: activeMonument.bonusPoints,
                bonusCredits: activeMonument.bonusCredits,
                matrix: activeMonument.blueprint.slice(0, 3).map((r) => r.slice(0, 3)),
              }
            : targetPattern,
          userQuestion:
            customPrompt ??
            (userQuestion ||
              `How do I best place my tray blocks to assemble ${activeGoalName}?`),
          bestComputedMove: bestMove,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to get tactical analysis from AI Helper'
        );
      }

      setAiReply({
        headline: data.headline || `Tactical Analysis: ${activeGoalName}`,
        coachingAdvice:
          data.coachingAdvice ||
          `Place the highlighted tray piece at the glowing target coordinates to assemble ${activeGoalName}.`,
        patternTip:
          data.patternTip ||
          `Focus on completing ${activeGoalName} for +${activeGoalCredits.toLocaleString()} credits.`,
      });
      if (!isShowingHintOnBoard) {
        onToggleHintOnBoard();
      }
    } catch (err: unknown) {
      setAiError(
        err instanceof Error
          ? err.message
          : 'Could not reach Gemini AI Helper.'
      );
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900/85 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/15 border border-sky-500/30 rounded-xl text-sky-600 dark:text-sky-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-sky-600 dark:text-sky-400 font-mono">
              DEDICATED AI HELPER SCREEN
            </div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              Gemini Live Spatial Coach & Move Solver
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleHintOnBoard}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isShowingHintOnBoard
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>
              {isShowingHintOnBoard ? 'Hint Highlighted' : 'Show Board Hint'}
            </span>
          </button>

          {onReturnToArena && (
            <button
              type="button"
              onClick={onReturnToArena}
              className="px-3.5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Back to Game</span>
            </button>
          )}
        </div>
      </div>

      {/* Instant Live Recommendation Box */}
      {bestMove ? (
        <div className="bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              RECOMMENDED MOVE: SLOT #{bestMove.trayIndex + 1} (
              {bestMove.shapeName})
            </span>
            <span className="font-mono text-slate-600 dark:text-slate-400">
              Row {bestMove.row + 1}, Col {bestMove.col + 1}
              {bestMove.rotationsNeeded > 0
                ? ` · Rotate ${bestMove.rotationsNeeded * 90}°`
                : ''}
            </span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {bestMove.reasonSummary}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onExecuteBestMove();
                if (onReturnToArena) onReturnToArena();
              }}
              className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Execute Move & Return to Game</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleAskGeminiCoach(
                  'Explain the best move on my current board and how I can finish the 3x3 Target Pattern.'
                )
              }
              disabled={loadingAI}
              className="py-2.5 px-4 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              {loadingAI ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Ask Gemini AI Coach</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-500 dark:text-slate-400">
          No valid moves remaining for current tray pieces. Return to the Game Screen to Undo or Clear Points!
        </div>
      )}

      {/* Custom Question Input for Gemini AI Helper */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAskGeminiCoach();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          placeholder="Ask AI Helper (e.g., How do I build Harmonic Cross?)"
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 focus:border-sky-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loadingAI}
          className="px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-white dark:text-sky-400 font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          {loadingAI ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Ask</span>
        </button>
      </form>

      {/* Gemini AI Coach Deep Response */}
      {aiError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{aiError}</span>
        </div>
      )}

      {aiReply && (
        <div className="p-5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-500/30 rounded-xl space-y-2.5">
          <div className="text-sm font-bold text-sky-800 dark:text-sky-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
            <span>{aiReply.headline}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {aiReply.coachingAdvice}
          </p>
          <div className="pt-2 border-t border-sky-200 dark:border-sky-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
            Pattern Tip: {aiReply.patternTip}
          </div>
        </div>
      )}
    </div>
  );
};
