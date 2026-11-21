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
      if (!navigator.onLine) {
        setAiReply({
          headline: `Offline Spatial Coach: ${activeGoalName}`,
          coachingAdvice: bestMove
            ? `${bestMove.reasonSummary} (Running locally in 100% Offline Mode — zero internet needed!)`
            : `Place pieces onto open cells to progress toward ${activeGoalName}.`,
          patternTip: `Complete ${activeGoalName} for +${activeGoalCredits.toLocaleString()} credits.`,
        });
        if (!isShowingHintOnBoard) onToggleHintOnBoard();
        setLoadingAI(false);
        return;
      }

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
    } catch {
      // Seamless local offline fallback so the helper always works without internet
      setAiReply({
        headline: `Local Offline Coach: ${activeGoalName}`,
        coachingAdvice: bestMove
          ? `${bestMove.reasonSummary} (Computed locally offline — tap Execute Move to play it right away.)`
          : `Tap Rotate or try another tray slot to line up your next match for ${activeGoalName}.`,
        patternTip: `Finish ${activeGoalName} to earn +${activeGoalCredits.toLocaleString()} credits.`,
      });
      if (!isShowingHintOnBoard) {
        onToggleHintOnBoard();
      }
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-[#0D244B] border border-[#C5E4EC] dark:border-[#1E447D] rounded-2xl p-6 space-y-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C5E4EC] dark:border-[#1E447D] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#14B8C4]/15 border border-[#14B8C4]/40 rounded-xl text-[#0D949E] dark:text-[#2DD4BF]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#0D949E] dark:text-[#2DD4BF] font-mono font-semibold">
              LEARNLINK SPATIAL HELPER (ONLINE &amp; OFFLINE)
            </div>
            <h2 className="text-xl font-bold font-display text-[#0B2249] dark:text-white">
              Spatial Coach &amp; Move Solver
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleHintOnBoard}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isShowingHintOnBoard
                ? 'bg-[#14B8C4] text-[#062134] font-bold'
                : 'bg-[#E8F5F8] dark:bg-[#122E5E] hover:bg-[#D5EEF4] dark:hover:bg-[#1B4284] text-[#0B2249] dark:text-white'
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
              className="px-3.5 py-2 bg-[#0B2249] dark:bg-[#14B8C4] hover:bg-[#12336B] dark:hover:bg-[#2DD4BF] text-white dark:text-[#062134] font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Back to Game</span>
            </button>
          )}
        </div>
      </div>

      {/* Instant Live Recommendation Box */}
      {bestMove ? (
        <div className="bg-[#F2F9FB] dark:bg-[#071731] border border-[#C5E4EC] dark:border-[#1E447D] rounded-xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[#0D949E] dark:text-[#2DD4BF] font-bold font-mono">
              RECOMMENDED MOVE: SLOT #{bestMove.trayIndex + 1} (
              {bestMove.shapeName})
            </span>
            <span className="font-mono text-[#466284] dark:text-[#A9C8E8]">
              Row {bestMove.row + 1}, Col {bestMove.col + 1}
              {bestMove.rotationsNeeded > 0
                ? ` · Rotate ${bestMove.rotationsNeeded * 90}°`
                : ''}
            </span>
          </div>
          <p className="text-sm text-[#0B2249] dark:text-[#CBE7F0] leading-relaxed">
            {bestMove.reasonSummary}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                onExecuteBestMove();
                if (onReturnToArena) onReturnToArena();
              }}
              className="flex-1 py-2.5 px-4 bg-[#14B8C4] hover:bg-[#0EA5B7] text-[#062134] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Execute Move &amp; Return to Game</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleAskGeminiCoach(
                  'Explain the best move on my current board and how I can finish the 3x3 Target Pattern.'
                )
              }
              disabled={loadingAI}
              className="py-2.5 px-4 bg-[#0B2249] dark:bg-[#2DD4BF] hover:bg-[#12336B] dark:hover:bg-[#5EEAD4] disabled:opacity-50 text-white dark:text-[#062134] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              {loadingAI ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>Get Coach Explanation</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#F2F9FB] dark:bg-[#071731] border border-[#C5E4EC] dark:border-[#1E447D] rounded-xl p-4 text-xs text-[#466284] dark:text-[#A9C8E8]">
          No valid moves remaining for current tray pieces. Return to the Game Screen to Undo or Clear Points!
        </div>
      )}

      {/* Custom Question Input */}
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
          placeholder="Ask Helper (e.g., How do I finish this puzzle?)"
          className="flex-1 bg-[#F2F9FB] dark:bg-[#071731] border border-[#C5E4EC] dark:border-[#1E447D] focus:border-[#14B8C4] rounded-xl px-4 py-2.5 text-xs text-[#0B2249] dark:text-white placeholder:text-[#6B86A6] focus:outline-none"
        />
        <button
          type="submit"
          disabled={loadingAI}
          className="px-4 py-2.5 bg-[#0B2249] dark:bg-[#14B8C4] hover:bg-[#12336B] dark:hover:bg-[#2DD4BF] disabled:opacity-50 text-white dark:text-[#062134] font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          {loadingAI ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Ask</span>
        </button>
      </form>

      {aiError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <span>{aiError}</span>
        </div>
      )}

      {aiReply && (
        <div className="p-5 bg-[#E8F5F8] dark:bg-[#122E5E] border border-[#14B8C4]/50 rounded-xl space-y-2.5">
          <div className="text-sm font-bold text-[#0B2249] dark:text-[#2DD4BF] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#14B8C4] shrink-0" />
            <span>{aiReply.headline}</span>
          </div>
          <p className="text-xs sm:text-sm text-[#355275] dark:text-[#E2F2F8] leading-relaxed">
            {aiReply.coachingAdvice}
          </p>
          <div className="pt-2 border-t border-[#C5E4EC] dark:border-[#1E447D] text-xs text-[#0D949E] dark:text-[#2DD4BF] font-semibold">
            Pattern Tip: {aiReply.patternTip}
          </div>
        </div>
      )}
    </div>
  );
};
