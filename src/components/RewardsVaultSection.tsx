import React, { useState } from 'react';
import {
  BLOCK_SKINS,
  BlockSkin,
  DIGITAL_VAULT_ITEMS,
  DigitalVaultItem,
} from '../types/game';
import {
  Download,
  ExternalLink,
  Lock,
  Check,
  Sparkles,
  BookOpen,
  CreditCard,
  X,
} from 'lucide-react';

interface RewardsVaultSectionProps {
  credits: number;
  patternsCompleted: number;
  activeSkinId: string;
  unlockedSkins: string[];
  unlockedVaultItems: string[];
  onSelectSkin: (skinId: string) => void;
  onUnlockSkinWithCredits: (skin: BlockSkin) => void;
  onUnlockVaultItemWithCredits: (item: DigitalVaultItem) => void;
  onOpenPayPalModal: () => void;
}

export const RewardsVaultSection: React.FC<RewardsVaultSectionProps> = ({
  credits,
  patternsCompleted,
  activeSkinId,
  unlockedSkins,
  unlockedVaultItems,
  onSelectSkin,
  onUnlockSkinWithCredits,
  onUnlockVaultItemWithCredits,
  onOpenPayPalModal,
}) => {
  const [readerItem, setReaderItem] = useState<DigitalVaultItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const triggerFreeFileDownload = (item: DigitalVaultItem) => {
    const blob = new Blob([item.fullTextContent], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Header & Top-Up Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div className="space-y-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>100% Free-to-Play Progression</span>
            <span aria-hidden="true">·</span>
            <span>Instant Digital Downloads & Skins</span>
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
            Unlockable Skins & Free Download Vault
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Every player starts with 100,000 Credits. Complete puzzle patterns during gameplay to win free downloadable strategy eBooks, digital guides, and minimalist skins—or top up credits behind the win wall for $0.99 via PayPal.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Available Balance
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
              {credits.toLocaleString()} CR
            </div>
          </div>

          <button
            onClick={onOpenPayPalModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>$0.99 PayPal (+250,000 CR)</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: UNLOCKABLE MINIMALIST BLOCK SKINS */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              01. Minimalist Tactile Block Skins
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize your 8x8 arena blocks. Unlock instantly with starting credits or by reaching pattern milestones.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BLOCK_SKINS.map((skin) => {
            const isUnlocked = unlockedSkins.includes(skin.id);
            const isEquipped = activeSkinId === skin.id;
            const canAfford = credits >= skin.costCredits;

            return (
              <div
                key={skin.id}
                className={`bg-white dark:bg-slate-900/70 border rounded-xl p-5 flex flex-col justify-between gap-5 transition-colors shadow-xs ${
                  isEquipped
                    ? 'border-sky-500 dark:border-sky-400'
                    : 'border-slate-200 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="space-y-4">
                  <div className="h-20 bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/70 rounded-lg flex items-center justify-center gap-3 p-3">
                    {['#38bdf8', '#10b981', '#f59e0b'].map((hex, i) => (
                      <div
                        key={i}
                        style={{
                          backgroundColor:
                            skin.innerStyle === 'hollow' ||
                            skin.innerStyle === 'monolith'
                              ? '#0f172a'
                              : hex,
                          borderColor: hex,
                        }}
                        className={`w-10 h-10 ${skin.borderRadiusClass} border-2 flex items-center justify-center relative`}
                      >
                        {skin.innerStyle === 'dot' && (
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-950/75" />
                        )}
                        {skin.innerStyle === 'prism' && (
                          <div className="w-5 h-5 border border-white/60" />
                        )}
                        {skin.innerStyle === 'striated' && (
                          <div className="w-full h-1.5 bg-slate-950/40" />
                        )}
                        {skin.innerStyle === 'monolith' && (
                          <div
                            style={{ backgroundColor: hex }}
                            className="w-3 h-3"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {skin.unlockRequirementText}
                    </div>
                    <h3 className="text-base font-bold font-display text-slate-900 dark:text-white mt-0.5">
                      {skin.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {skin.subtitle}
                    </p>
                  </div>
                </div>

                <div>
                  {isUnlocked ? (
                    <button
                      onClick={() => onSelectSkin(skin.id)}
                      className={`w-full py-2 px-4 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                        isEquipped
                          ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/40'
                          : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isEquipped ? 'Equipped Skin' : 'Equip Skin'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        canAfford
                          ? onUnlockSkinWithCredits(skin)
                          : onOpenPayPalModal()
                      }
                      className="w-full py-2 px-4 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>
                        {canAfford
                          ? `Unlock (${skin.costCredits.toLocaleString()} CR)`
                          : `Top Up to Unlock (${skin.costCredits.toLocaleString()} CR)`}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 2: FREE DIGITAL DOWNLOADS, EBOOKS & EXCLUSIVE GUIDES */}
      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white">
            02. Returning Player Digital Vault (Free eBooks & Exclusive Guides)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Win free downloadable items by completing target patterns in-game or unlock immediately behind the Win Wall using your credits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DIGITAL_VAULT_ITEMS.map((item) => {
            const wonByPatterns =
              patternsCompleted >= item.requiredPatternsToWinFree;
            const unlockedByCredits = unlockedVaultItems.includes(item.id);
            const isUnlocked = wonByPatterns || unlockedByCredits;

            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 rounded-xl overflow-hidden flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="h-52 bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 relative overflow-hidden flex items-center justify-center">
                    {item.coverImage && !failedImages[item.id] ? (
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({
                            ...prev,
                            [item.id]: true,
                          }))
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="p-6 text-center space-y-2">
                        <BookOpen className="w-10 h-10 text-sky-400 mx-auto" />
                        <div className="text-xs font-mono text-slate-400">
                          {item.category}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                      <span>{item.category}</span>
                      <span>·</span>
                      <span className="font-mono">
                        Win at {item.requiredPatternsToWinFree} Patterns
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {item.authorOrPartner}
                    </div>
                    <h3 className="text-base font-bold font-display text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2.5">
                  {isUnlocked ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => triggerFreeFileDownload(item)}
                          className="flex-1 py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Free Guide</span>
                        </button>
                        <button
                          onClick={() => setReaderItem(item)}
                          className="py-2 px-3 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                        >
                          Read
                        </button>
                      </div>
                      {item.externalPartnerUrl && (
                        <a
                          href={item.externalPartnerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-1.5 px-3 text-xs text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <span>Explore {item.partnerSiteName}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          credits >= item.unlockCostCredits
                            ? onUnlockVaultItemWithCredits(item)
                            : onOpenPayPalModal()
                        }
                        className="w-full py-2 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          Unlock Now ({item.unlockCostCredits.toLocaleString()}{' '}
                          CR)
                        </span>
                      </button>
                      <div className="text-[11px] text-slate-500 text-center">
                        Or complete {item.requiredPatternsToWinFree} Patterns in
                        gameplay to win free ({patternsCompleted}/
                        {item.requiredPatternsToWinFree})
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: CONNECTED PUBLIC DOMAIN EBOOK & FREE DOWNLOAD PORTALS */}
      <section className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white">
            03. Connected Partner Libraries for Returning Users
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Direct portals to verified repositories offering free digital books, open-source arcade design manuals, and downloadable creative commons assets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="https://standardebooks.org/ebooks"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 rounded-lg flex items-center justify-between transition-colors group"
          >
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                Standard Ebooks
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Typography-crafted free EPUB & Kindle editions
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-500 shrink-0" />
          </a>

          <a
            href="https://www.gutenberg.org/browse/scores/top"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 rounded-lg flex items-center justify-between transition-colors group"
          >
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                Project Gutenberg Top 100
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                70,000+ free downloadable literary & logic books
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-500 shrink-0" />
          </a>

          <a
            href="https://openlibrary.org"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 hover:border-sky-500/50 rounded-lg flex items-center justify-between transition-colors group"
          >
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                Open Library Digital Guides
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Open catalog of downloadable technical manuals
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-500 shrink-0" />
          </a>
        </div>
      </section>

      {/* In-App Digital Reader Modal */}
      {readerItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="text-xs text-sky-600 dark:text-sky-400">
                  {readerItem.category}
                </div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                  {readerItem.title}
                </h3>
              </div>
              <button
                onClick={() => setReaderItem(null)}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <pre className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg p-4 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
              {readerItem.fullTextContent}
            </pre>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => triggerFreeFileDownload(readerItem)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File (.TXT)</span>
              </button>
              <button
                onClick={() => setReaderItem(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-medium rounded-lg transition-colors"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
