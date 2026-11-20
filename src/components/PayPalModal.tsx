import React, { useState } from 'react';
import { CreditCard, CheckCircle2, Lock, X, ShieldCheck } from 'lucide-react';

interface PayPalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCredits: number;
  onSuccessTopUp: (addedCredits: number, bonusDrawTickets: number) => void;
}

export const PayPalModal: React.FC<PayPalModalProps> = ({
  isOpen,
  onClose,
  currentCredits,
  onSuccessTopUp,
}) => {
  const [step, setStep] = useState<'review' | 'processing' | 'complete'>('review');
  const [selectedTier, setSelectedTier] = useState<'standard' | 'bundle'>('standard');

  if (!isOpen) return null;

  const creditAmount = selectedTier === 'standard' ? 250000 : 750000;
  const priceDisplay = selectedTier === 'standard' ? '$0.99' : '$1.99';
  const ticketBonus = selectedTier === 'standard' ? 2 : 5;

  const handlePayPalCheckout = () => {
    setStep('processing');
    window.setTimeout(() => {
      onSuccessTopUp(creditAmount, ticketBonus);
      setStep('complete');
    }, 900);
  };

  const handleCloseReset = () => {
    setStep('review');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Top Bar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold font-display text-slate-900 dark:text-white">
              Win-Wall Express Credit Top-Up
            </span>
          </div>
          <button
            onClick={handleCloseReset}
            className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {step === 'review' && (
            <>
              <div className="space-y-1.5">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Current Balance: {currentCredits.toLocaleString()} CR · All gameplay is free to play
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                  Instant PayPal Credit Boost
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Top up credits behind the Win Wall to immediately unlock all minimalist skins, downloadable strategy eBooks, and bonus tickets for the monthly $50 drawing.
                </p>
              </div>

              {/* Tier Selector */}
              <div className="space-y-2.5">
                <button
                  onClick={() => setSelectedTier('standard')}
                  className={`w-full p-4 rounded-xl border text-left transition-colors flex items-center justify-between cursor-pointer ${
                    selectedTier === 'standard'
                      ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      +250,000 Credits + 2 Draw Tickets
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Featured Win-Wall Micro-Pack
                    </div>
                  </div>
                  <div className="text-lg font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                    $0.99
                  </div>
                </button>

                <button
                  onClick={() => setSelectedTier('bundle')}
                  className={`w-full p-4 rounded-xl border text-left transition-colors flex items-center justify-between cursor-pointer ${
                    selectedTier === 'bundle'
                      ? 'bg-sky-500/10 border-sky-500 dark:border-sky-400 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      +750,000 Credits + 5 Draw Tickets
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Complete Vault & All Skins Unlocker
                    </div>
                  </div>
                  <div className="text-lg font-bold font-mono tabular-nums text-sky-600 dark:text-sky-400">
                    $1.99
                  </div>
                </button>
              </div>

              {/* PayPal Express Action Button */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handlePayPalCheckout}
                  className="w-full py-3 px-4 bg-[#ffc439] hover:bg-[#f4b828] text-slate-950 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Pay {priceDisplay} with PayPal Express</span>
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <Lock className="w-3 h-3" />
                  <span>256-Bit Encrypted Sandbox · Instant Cloud Credit Sync</span>
                </div>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="py-10 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Authorizing PayPal Express Checkout ({priceDisplay})...
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Minting +{creditAmount.toLocaleString()} Credits to your account
                </div>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="py-6 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <div className="space-y-1">
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                  TRANSACTION VERIFIED · {priceDisplay} USD
                </div>
                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
                  +{creditAmount.toLocaleString()} Credits Added!
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Plus +{ticketBonus} bonus tickets registered for the monthly $50 giveaway drawing.
                </p>
              </div>
              <button
                onClick={handleCloseReset}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Return to Game & Unlock Items</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
