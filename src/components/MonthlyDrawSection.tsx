import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { getCurrentMonthKey } from '../utils/patternEngine';
import { Ticket, Gift, Sparkles, Bell, Check } from 'lucide-react';

interface DrawParticipant {
  id: string;
  uid: string;
  displayName: string;
  monthKey: string;
  ticketCount: number;
  highScore: number;
}

interface MonthlyDrawSectionProps {
  credits: number;
  drawTickets: number;
  highScore: number;
  onClaimTicketWithCredits: () => void;
  onEnablePushNotifications: () => void;
  pushStatusText: string;
}

export const MonthlyDrawSection: React.FC<MonthlyDrawSectionProps> = ({
  credits,
  drawTickets,
  highScore,
  onClaimTicketWithCredits,
  onEnablePushNotifications,
  pushStatusText,
}) => {
  const [entries, setEntries] = useState<DrawParticipant[]>([]);
  const [imgFailed, setImgFailed] = useState(false);
  const currentMonth = getCurrentMonthKey();

  useEffect(() => {
    const path = 'monthly_draws';
    const q = query(
      collection(db, path),
      orderBy('ticketCount', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: DrawParticipant[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          if (typeof d.ticketCount === 'number' && d.ticketCount >= 1) {
            list.push({
              id: docSnap.id,
              uid: String(d.uid || docSnap.id),
              displayName: String(d.displayName || 'Arcade Player'),
              monthKey: String(d.monthKey || currentMonth),
              ticketCount: d.ticketCount,
              highScore: Number(d.highScore || 0),
            });
          }
        });
        setEntries(list);
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, path);
      }
    );

    return () => unsubscribe();
  }, [currentMonth]);

  const daysLeftInMonth = React.useMemo(() => {
    const now = new Date();
    const lastDay = new Date(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1,
      0
    ).getUTCDate();
    return Math.max(1, lastDay - now.getUTCDate());
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Hero Split for Monthly $50 Giveaway Drawing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 rounded-xl overflow-hidden shadow-xs">
        <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <span>Monthly Prize Pool: $50.00 USD</span>
              <span aria-hidden="true">·</span>
              <span>Drawing Period: {currentMonth}</span>
              <span aria-hidden="true">·</span>
              <span>{daysLeftInMonth} Days Remaining</span>
            </div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
              Monthly $50 Cash & Gift Prize Drawing
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Once a month, one lucky KINETIX player wins a $50.00 prize payout. All gameplay is free to play: earn drawing tickets by completing daily challenges, hitting pattern milestones, or exchanging 15,000 free game credits for an official entry ticket.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800/80">
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Your Active Tickets
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
                {drawTickets}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Qualifying Score
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white mt-0.5">
                {highScore.toLocaleString()}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Next Drawing Date
              </div>
              <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5">
                End of {currentMonth} (UTC)
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onClaimTicketWithCredits}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>Claim +1 Draw Ticket (15,000 Credits)</span>
            </button>

            <button
              onClick={onEnablePushNotifications}
              className="px-4 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-medium text-xs rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{pushStatusText}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-950 relative min-h-[240px] flex items-center justify-center overflow-hidden">
          {!imgFailed ? (
            <img
              src="/src/assets/images/giveaway_prize_emblem_1795149414859.jpg"
              alt="Monthly $50 Prize Emblem"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="p-8 text-center space-y-2">
              <Gift className="w-12 h-12 text-amber-400 mx-auto" />
              <div className="text-sm font-bold text-white">
                $50 Monthly Prize Pool
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-xs text-slate-300 flex items-center justify-between">
            <span>Verified Cloud Registry</span>
            <span>·</span>
            <span className="font-mono">{credits.toLocaleString()} CR Available</span>
          </div>
        </div>
      </div>

      {/* Live Registered Entries Table */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/90 rounded-xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-display text-slate-900 dark:text-white">
              Live Monthly Drawing Registry ({currentMonth})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in with Google Cloud Save and claim tickets to sync your entry to the public drawing ledger.
            </p>
          </div>
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <th className="py-3 px-6 font-medium">Player</th>
                <th className="py-3 px-6 font-medium">Draw Month</th>
                <th className="py-3 px-6 font-medium text-right">Qualifying Score</th>
                <th className="py-3 px-6 font-medium text-right">Tickets Entered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/60 text-sm">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                    You have {drawTickets} local ticket(s). Claim a ticket while signed in to register on the public cloud board!
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-6 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{entry.displayName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {entry.monthKey}
                    </td>
                    <td className="py-3 px-6 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {entry.highScore.toLocaleString()}
                    </td>
                    <td className="py-3 px-6 text-right font-mono tabular-nums font-bold text-amber-600 dark:text-amber-400">
                      {entry.ticketCount} Tickets
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
