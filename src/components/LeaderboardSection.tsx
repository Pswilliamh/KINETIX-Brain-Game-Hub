import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Trophy, Share2, Award, ArrowUpRight, Check, Trash2 } from 'lucide-react';
import { BLOCK_SKINS } from '../types/game';

export interface LeaderboardRow {
  id: string;
  uid: string;
  displayName: string;
  score: number;
  level: number;
  patterns: number;
  mode: 'arcade' | 'daily';
  skinId: string;
}

const BENCHMARK_RECORDS: LeaderboardRow[] = [
  {
    id: 'bench_1',
    uid: 'grandmaster_1',
    displayName: 'Vance_Kinetix',
    score: 14850,
    level: 6,
    patterns: 14,
    mode: 'arcade',
    skinId: 'obsidian_monolith',
  },
  {
    id: 'bench_2',
    uid: 'grandmaster_2',
    displayName: 'Sora_Pulse',
    score: 11420,
    level: 5,
    patterns: 11,
    mode: 'arcade',
    skinId: 'acoustic_striated',
  },
  {
    id: 'bench_3',
    uid: 'grandmaster_3',
    displayName: 'Milo_Bauhaus',
    score: 8940,
    level: 4,
    patterns: 8,
    mode: 'arcade',
    skinId: 'prism_bevel',
  },
  {
    id: 'bench_4',
    uid: 'grandmaster_4',
    displayName: 'Elena_Synth',
    score: 9620,
    level: 5,
    patterns: 9,
    mode: 'daily',
    skinId: 'kinetic_dot',
  },
  {
    id: 'bench_5',
    uid: 'grandmaster_5',
    displayName: 'Kaito_Grid',
    score: 7310,
    level: 4,
    patterns: 7,
    mode: 'daily',
    skinId: 'bauhaus_frame',
  },
];

interface LeaderboardSectionProps {
  currentUid?: string | null;
  isAdminUser?: boolean;
  playerHighScore: number;
  playerDailyHighScore: number;
  onShareScore: () => void;
  onAdminClearPoints?: () => void;
  copiedToast: boolean;
}

export const LeaderboardSection: React.FC<LeaderboardSectionProps> = ({
  currentUid,
  isAdminUser,
  playerHighScore,
  playerDailyHighScore,
  onShareScore,
  onAdminClearPoints,
  copiedToast,
}) => {
  const [filterMode, setFilterMode] = useState<'arcade' | 'daily'>('arcade');
  const [cloudEntries, setCloudEntries] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const path = 'leaderboard';
    const q = query(
      collection(db, path),
      orderBy('score', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const rows: LeaderboardRow[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (
            typeof data.score === 'number' &&
            (data.mode === 'arcade' || data.mode === 'daily')
          ) {
            rows.push({
              id: docSnap.id,
              uid: data.uid || docSnap.id,
              displayName: String(data.displayName || 'Anonymous Player').slice(0, 32),
              score: data.score,
              level: Number(data.level || 1),
              patterns: Number(data.patterns || 0),
              mode: data.mode,
              skinId: String(data.skinId || 'swiss_matte'),
            });
          }
        });
        setCloudEntries(rows);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        handleFirestoreError(err, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, []);

  const mergedRows = React.useMemo(() => {
    const map = new Map<string, LeaderboardRow>();
    BENCHMARK_RECORDS.filter((r) => r.mode === filterMode).forEach((r) => {
      map.set(`${r.uid}_${r.mode}`, r);
    });
    cloudEntries
      .filter((r) => r.mode === filterMode)
      .forEach((r) => {
        const key = `${r.uid}_${r.mode}`;
        const existing = map.get(key);
        if (!existing || r.score >= existing.score) {
          map.set(key, r);
        }
      });

    return Array.from(map.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [cloudEntries, filterMode]);

  const getSkinLabel = (skinId: string) => {
    return BLOCK_SKINS.find((s) => s.id === skinId)?.name || 'Swiss Matte';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div className="space-y-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>Global Cloud Standings</span>
            <span aria-hidden="true">·</span>
            <span>Real-Time Firestore Sync</span>
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
            High-Score Leaderboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Compete with friends globally in standard Endless Arcade or the synchronized UTC Daily Challenge seed. Every completed pattern accelerates your score and unlocks prize tickets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <button
              onClick={() => setFilterMode('arcade')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filterMode === 'arcade'
                  ? 'bg-sky-500 text-slate-950 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Endless Arcade
            </button>
            <button
              onClick={() => setFilterMode('daily')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filterMode === 'daily'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Daily Challenge
            </button>
          </div>

          {onAdminClearPoints && (
            <button
              onClick={onAdminClearPoints}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-600 dark:text-rose-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAdminUser ? 'Admin Clear Points' : 'Clear My Points'}</span>
            </button>
          )}

          <button
            onClick={onShareScore}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copiedToast ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Challenge Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share My Score</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Personal Best Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Your Best Arcade Score
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-1">
              {playerHighScore.toLocaleString()}
            </div>
          </div>
          <Trophy className="w-6 h-6 text-sky-500 shrink-0" />
        </div>

        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Your Best Daily Challenge
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-1">
              {playerDailyHighScore.toLocaleString()}
            </div>
          </div>
          <Award className="w-6 h-6 text-amber-500 shrink-0" />
        </div>

        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Viral Friend Invite Bonus
            </div>
            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              +5,000 Credits per Share
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Instant reward on challenge link copy
            </div>
          </div>
          <button
            onClick={onShareScore}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
            title="Share Challenge Link"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/90 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-5 font-medium">Rank</th>
                <th className="py-3.5 px-5 font-medium">Player</th>
                <th className="py-3.5 px-5 font-medium">Active Skin</th>
                <th className="py-3.5 px-5 font-medium text-right">Level</th>
                <th className="py-3.5 px-5 font-medium text-right">Patterns</th>
                <th className="py-3.5 px-5 font-medium text-right">High Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    Synchronizing global leaderboard entries...
                  </td>
                </tr>
              ) : mergedRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No scores recorded for this mode yet. Play a round to claim Rank #1!
                  </td>
                </tr>
              ) : (
                mergedRows.map((row, idx) => {
                  const isCurrentUser = currentUid && row.uid === currentUid;
                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors ${
                        isCurrentUser
                          ? 'bg-sky-500/10 text-slate-900 dark:text-white'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <td className="py-3.5 px-5 font-mono tabular-nums font-semibold text-slate-500 dark:text-slate-400">
                        #{String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 px-5 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 dark:text-white font-semibold">
                            {row.displayName}
                          </span>
                          {isCurrentUser && (
                            <span className="text-xs text-sky-600 dark:text-sky-400 font-normal">
                              · You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400">
                        {getSkinLabel(row.skinId)}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        Lv.{row.level}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                        {row.patterns}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                        {row.score.toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
