import React, { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  AppLanguage,
  BlockSkin,
  DigitalVaultItem,
  GameMode,
  INITIAL_CREDITS,
  PlayerProfileData,
} from './types/game';
import {
  getCurrentMonthKey,
  getTodayDateKey,
} from './utils/patternEngine';
import { soundEngine } from './utils/soundAndHaptics';
import { ArcadeArena } from './components/ArcadeArena';
import { LeaderboardSection } from './components/LeaderboardSection';
import { RewardsVaultSection } from './components/RewardsVaultSection';
import { MonthlyDrawSection } from './components/MonthlyDrawSection';
import { LearnLinkPromoPage } from './components/LearnLinkPromoPage';
import { OfflineIndicator } from './components/OfflineControls';
import { triggerUsbOfflineDownload } from './utils/usbOfflineExporter';
import { PayPalModal } from './components/PayPalModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import {
  CreditCard,
  Share2,
  Trophy,
  Download,
  Ticket,
  Gamepad2,
  Sun,
  Moon,
  Trash2,
  GraduationCap,
  HardDriveDownload,
} from 'lucide-react';

type ActiveSection = 'arena' | 'leaderboard' | 'vault' | 'giveaway' | 'learnlink';

// Temporarily hide the $50/month giveaway across the portal (set to true to re-enable later)
const SHOW_MONTHLY_GIVEAWAY = false;

const LOCAL_STORAGE_KEY = 'kinetix_arcade_player_v1';
const THEME_STORAGE_KEY = 'learnlink_theme_choice_v2';
const LANGUAGE_STORAGE_KEY = 'kinetix_language_choice_v1';

function loadLocalProfile(): PlayerProfileData {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        uid: parsed.uid || 'local_player',
        displayName: String(parsed.displayName || 'Guest Architect').slice(0, 64),
        credits:
          typeof parsed.credits === 'number' && parsed.credits >= 0
            ? parsed.credits
            : INITIAL_CREDITS,
        highScore: Number(parsed.highScore || 0),
        dailyHighScore: Number(parsed.dailyHighScore || 0),
        maxLevel: Math.max(1, Number(parsed.maxLevel || 1)),
        patternsCompleted: Number(parsed.patternsCompleted || 0),
        activeSkinId: String(parsed.activeSkinId || 'swiss_matte'),
        unlockedSkins: Array.isArray(parsed.unlockedSkins)
          ? parsed.unlockedSkins.slice(0, 15)
          : ['swiss_matte'],
        unlockedVaultItems: Array.isArray(parsed.unlockedVaultItems)
          ? parsed.unlockedVaultItems.slice(0, 25)
          : [],
        dailyStreak: Number(parsed.dailyStreak || 1),
        lastDailyClaimDate: String(parsed.lastDailyClaimDate || ''),
        drawTickets: Math.max(1, Number(parsed.drawTickets || 1)),
      };
    }
  } catch {
    // Fallback to default
  }

  return {
    uid: 'local_player',
    displayName: 'Guest Architect',
    credits: INITIAL_CREDITS,
    highScore: 0,
    dailyHighScore: 0,
    maxLevel: 1,
    patternsCompleted: 0,
    activeSkinId: 'swiss_matte',
    unlockedSkins: ['swiss_matte'],
    unlockedVaultItems: [],
    dailyStreak: 1,
    lastDailyClaimDate: '',
    drawTickets: 1,
  };
}

export default function App() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('arena');
  const [gameMode, setGameMode] = useState<GameMode>('puzzle');
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [profile, setProfile] = useState<PlayerProfileData>(() =>
    loadLocalProfile()
  );

  // LearnLink Navy Blue, Turquoise & White Theme (defaults to crisp White + Navy + Turquoise; toggle for Deep Navy Dark)
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark') return false;
      return true;
    } catch {
      return true;
    }
  });

  // Bilingual / Bahasa Indonesia / English Choice for Children's Brain Workout Portal (defaults to bilingual)
  const [language, setLanguage] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'id' || saved === 'en' || saved === 'bilingual') {
        return saved;
      }
      return 'bilingual';
    } catch {
      return 'bilingual';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {}
  }, [language]);

  useEffect(() => {
    const rootEl = document.documentElement;
    if (isLightMode) {
      rootEl.classList.remove('dark');
      try {
        localStorage.setItem(THEME_STORAGE_KEY, 'light');
      } catch {}
    } else {
      rootEl.classList.add('dark');
      try {
        localStorage.setItem(THEME_STORAGE_KEY, 'dark');
      } catch {}
    }
  }, [isLightMode]);

  const [isPayPalOpen, setIsPayPalOpen] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [pushStatusText, setPushStatusText] = useState<string>(
    'Enable Daily Reward Push Alerts'
  );

  // Check if current user is admin (PsWilliamh@gmail.com)
  const isAdminUser =
    user?.email?.toLowerCase() === 'pswilliamh@gmail.com';

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota errors
    }
  }, [profile]);

  const showTemporaryNotice = useCallback((msg: string) => {
    setStatusBanner(msg);
    window.setTimeout(() => {
      setStatusBanner((prev) => (prev === msg ? null : prev));
    }, 4200);
  }, []);

  const syncProfileToCloud = useCallback(
    async (
      currentUser: User,
      nextData: PlayerProfileData,
      isInitialMerge: boolean = false
    ) => {
      if (!currentUser.emailVerified) return;
      const playerPath = `players/${currentUser.uid}`;
      const playerRef = doc(db, 'players', currentUser.uid);

      const safeDisplayName = (
        currentUser.displayName ||
        nextData.displayName ||
        'Kinetix Player'
      ).slice(0, 64);

      const sanitizedUnlockedSkins = Array.from(
        new Set(['swiss_matte', ...nextData.unlockedSkins])
      ).slice(0, 15);
      const sanitizedVaultItems = Array.from(
        new Set(nextData.unlockedVaultItems)
      ).slice(0, 25);

      try {
        const snap = await getDoc(playerRef);
        if (!snap.exists()) {
          await setDoc(playerRef, {
            uid: currentUser.uid,
            displayName: safeDisplayName,
            credits: Math.min(Math.max(0, nextData.credits), 1000000000),
            highScore: Math.min(Math.max(0, nextData.highScore), 100000000),
            dailyHighScore: Math.min(
              Math.max(0, nextData.dailyHighScore),
              100000000
            ),
            maxLevel: Math.min(Math.max(1, nextData.maxLevel), 999),
            patternsCompleted: Math.min(
              Math.max(0, nextData.patternsCompleted),
              1000000
            ),
            activeSkinId: nextData.activeSkinId.slice(0, 32),
            unlockedSkins: sanitizedUnlockedSkins,
            unlockedVaultItems: sanitizedVaultItems,
            dailyStreak: Math.min(Math.max(0, nextData.dailyStreak), 3650),
            lastDailyClaimDate: nextData.lastDailyClaimDate.slice(0, 16),
            drawTickets: Math.min(Math.max(0, nextData.drawTickets), 10000),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else if (isInitialMerge) {
          const cloud = snap.data();
          const merged: PlayerProfileData = {
            uid: currentUser.uid,
            displayName: safeDisplayName,
            credits: Math.max(
              Number(cloud.credits ?? INITIAL_CREDITS),
              nextData.credits
            ),
            highScore: Math.max(
              Number(cloud.highScore ?? 0),
              nextData.highScore
            ),
            dailyHighScore: Math.max(
              Number(cloud.dailyHighScore ?? 0),
              nextData.dailyHighScore
            ),
            maxLevel: Math.max(Number(cloud.maxLevel ?? 1), nextData.maxLevel),
            patternsCompleted: Math.max(
              Number(cloud.patternsCompleted ?? 0),
              nextData.patternsCompleted
            ),
            activeSkinId: String(
              cloud.activeSkinId || nextData.activeSkinId || 'swiss_matte'
            ),
            unlockedSkins: Array.from(
              new Set([
                'swiss_matte',
                ...(Array.isArray(cloud.unlockedSkins)
                  ? cloud.unlockedSkins
                  : []),
                ...nextData.unlockedSkins,
              ])
            ).slice(0, 15),
            unlockedVaultItems: Array.from(
              new Set([
                ...(Array.isArray(cloud.unlockedVaultItems)
                  ? cloud.unlockedVaultItems
                  : []),
                ...nextData.unlockedVaultItems,
              ])
            ).slice(0, 25),
            dailyStreak: Math.max(
              Number(cloud.dailyStreak ?? 1),
              nextData.dailyStreak
            ),
            lastDailyClaimDate:
              String(cloud.lastDailyClaimDate || '') ||
              nextData.lastDailyClaimDate,
            drawTickets: Math.max(
              Number(cloud.drawTickets ?? 1),
              nextData.drawTickets
            ),
          };
          setProfile(merged);
          await updateDoc(playerRef, {
            displayName: merged.displayName,
            credits: merged.credits,
            highScore: merged.highScore,
            dailyHighScore: merged.dailyHighScore,
            maxLevel: merged.maxLevel,
            patternsCompleted: merged.patternsCompleted,
            activeSkinId: merged.activeSkinId,
            unlockedSkins: merged.unlockedSkins,
            unlockedVaultItems: merged.unlockedVaultItems,
            dailyStreak: merged.dailyStreak,
            lastDailyClaimDate: merged.lastDailyClaimDate,
            drawTickets: merged.drawTickets,
            updatedAt: serverTimestamp(),
          });
        } else {
          await updateDoc(playerRef, {
            displayName: safeDisplayName,
            credits: Math.min(Math.max(0, nextData.credits), 1000000000),
            highScore: Math.min(Math.max(0, nextData.highScore), 100000000),
            dailyHighScore: Math.min(
              Math.max(0, nextData.dailyHighScore),
              100000000
            ),
            maxLevel: Math.min(Math.max(1, nextData.maxLevel), 999),
            patternsCompleted: Math.min(
              Math.max(0, nextData.patternsCompleted),
              1000000
            ),
            activeSkinId: nextData.activeSkinId.slice(0, 32),
            unlockedSkins: sanitizedUnlockedSkins,
            unlockedVaultItems: sanitizedVaultItems,
            dailyStreak: Math.min(Math.max(0, nextData.dailyStreak), 3650),
            lastDailyClaimDate: nextData.lastDailyClaimDate.slice(0, 16),
            drawTickets: Math.min(Math.max(0, nextData.drawTickets), 10000),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, playerPath);
      }
    },
    []
  );

  const syncLeaderboardEntryToCloud = useCallback(
    async (
      currentUser: User,
      modeToSync: GameMode,
      newScore: number,
      newLevel: number,
      newPatterns: number,
      skinId: string
    ) => {
      if (modeToSync === 'practice') return;
      if (!currentUser.emailVerified || newScore <= 0) return;
      const entryId = `${currentUser.uid}_${modeToSync}`;
      const entryPath = `leaderboard/${entryId}`;
      const entryRef = doc(db, 'leaderboard', entryId);
      const safeName = (
        currentUser.displayName ||
        profile.displayName ||
        'Kinetix Player'
      ).slice(0, 64);

      try {
        const snap = await getDoc(entryRef);
        if (!snap.exists()) {
          await setDoc(entryRef, {
            uid: currentUser.uid,
            displayName: safeName,
            score: Math.min(newScore, 100000000),
            level: Math.min(Math.max(1, newLevel), 999),
            patterns: Math.min(Math.max(0, newPatterns), 100000),
            mode: modeToSync,
            skinId: skinId.slice(0, 32),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          const existingScore = Number(snap.data().score || 0);
          if (newScore >= existingScore) {
            await updateDoc(entryRef, {
              displayName: safeName,
              score: Math.min(newScore, 100000000),
              level: Math.min(Math.max(1, newLevel), 999),
              patterns: Math.min(Math.max(0, newPatterns), 100000),
              skinId: skinId.slice(0, 32),
              updatedAt: serverTimestamp(),
            });
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, entryPath);
      }
    },
    [profile.displayName]
  );

  const syncMonthlyDrawToCloud = useCallback(
    async (
      currentUser: User,
      totalTickets: number,
      bestScore: number
    ) => {
      if (!currentUser.emailVerified || totalTickets < 1) return;
      const monthKey = getCurrentMonthKey();
      const entryId = `${currentUser.uid}_${monthKey}`;
      const drawPath = `monthly_draws/${entryId}`;
      const drawRef = doc(db, 'monthly_draws', entryId);
      const safeName = (
        currentUser.displayName ||
        profile.displayName ||
        'Kinetix Player'
      ).slice(0, 64);

      try {
        const snap = await getDoc(drawRef);
        if (!snap.exists()) {
          await setDoc(drawRef, {
            uid: currentUser.uid,
            displayName: safeName,
            monthKey,
            ticketCount: Math.min(Math.max(1, totalTickets), 10000),
            highScore: Math.min(Math.max(0, bestScore), 100000000),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } else {
          const existingTickets = Number(snap.data().ticketCount || 1);
          const nextTickets = Math.max(existingTickets, totalTickets);
          await updateDoc(drawRef, {
            displayName: safeName,
            ticketCount: Math.min(nextTickets, 10000),
            highScore: Math.min(Math.max(0, bestScore), 100000000),
            updatedAt: serverTimestamp(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, drawPath);
      }
    },
    [profile.displayName]
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (firebaseUser) {
        const currentLocal = loadLocalProfile();
        await syncProfileToCloud(firebaseUser, currentLocal, true);
      }
    });
    return () => unsub();
  }, [syncProfileToCloud]);

  const handleCloudAuthToggle = async () => {
    if (user) {
      await signOut(auth);
      showTemporaryNotice(
        'Signed out of Cloud Save. Your progress remains safely stored locally.'
      );
      return;
    }
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        await syncProfileToCloud(cred.user, profile, true);
        await syncMonthlyDrawToCloud(
          cred.user,
          profile.drawTickets,
          profile.highScore
        );
        showTemporaryNotice(
          `Cloud Save Active for ${cred.user.displayName || 'Player'} · Synced Across Devices!`
        );
      }
    } catch (err) {
      showTemporaryNotice(
        err instanceof Error
          ? `Google Sign-In Notice: ${err.message}`
          : 'Could not complete Google Sign-In.'
      );
    }
  };

  // Clear Points & Credits Handler (clears 659,090+ credits, best scores, patterns, and active board to 0)
  const [clearSignal, setClearSignal] = useState<number>(0);

  const handleClearPointsAdminOrPractice = useCallback(
    (resetAllTime: boolean = true, resetCreditsToAmount: number = 0) => {
      setClearSignal((prev) => prev + 1);
      setProfile((prev) => {
        const updated: PlayerProfileData = {
          ...prev,
          credits: resetAllTime ? resetCreditsToAmount : prev.credits,
          highScore: resetAllTime ? 0 : prev.highScore,
          dailyHighScore: resetAllTime ? 0 : prev.dailyHighScore,
          patternsCompleted: resetAllTime ? 0 : prev.patternsCompleted,
          maxLevel: resetAllTime ? 1 : prev.maxLevel,
        };
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
        if (user) {
          syncProfileToCloud(user, updated, false);
        }
        return updated;
      });
      showTemporaryNotice(
        resetAllTime
          ? `Cleared All Credits (${resetCreditsToAmount.toLocaleString()} CR), High Scores (0 PTS), Patterns (0), and Puzzle Board to Start From Scratch!`
          : 'Current Game Points & Puzzle Board Cleared to 0!'
      );
    },
    [showTemporaryNotice, syncProfileToCloud, user]
  );

  const handleRecordRunUpdate = useCallback(
    (params: {
      score: number;
      level: number;
      patternsInRun: number;
      earnedCredits: number;
      mode: GameMode;
    }) => {
      setProfile((prev) => {
        const nextHigh =
          params.mode === 'arcade' ||
          params.mode === 'puzzle' ||
          params.mode === 'candy' ||
          params.mode === 'checkers' ||
          params.mode === 'maze'
            ? Math.max(prev.highScore, params.score)
            : prev.highScore;
        const nextDailyHigh =
          params.mode === 'daily'
            ? Math.max(prev.dailyHighScore, params.score)
            : prev.dailyHighScore;
        const nextMaxLevel = Math.max(prev.maxLevel, params.level);
        const nextCredits = Math.max(0, prev.credits + params.earnedCredits);
        const nextPatterns = Math.max(
          prev.patternsCompleted,
          params.patternsInRun
        );

        const nextUnlockedSkins = [...prev.unlockedSkins];
        if (
          nextMaxLevel >= 2 &&
          !nextUnlockedSkins.includes('bauhaus_frame')
        ) {
          nextUnlockedSkins.push('bauhaus_frame');
        }
        if (nextPatterns >= 5 && !nextUnlockedSkins.includes('kinetic_dot')) {
          nextUnlockedSkins.push('kinetic_dot');
        }
        if (nextMaxLevel >= 4 && !nextUnlockedSkins.includes('prism_bevel')) {
          nextUnlockedSkins.push('prism_bevel');
        }
        if (
          nextPatterns >= 12 &&
          !nextUnlockedSkins.includes('acoustic_striated')
        ) {
          nextUnlockedSkins.push('acoustic_striated');
        }
        if (
          nextHigh >= 5000 &&
          !nextUnlockedSkins.includes('obsidian_monolith')
        ) {
          nextUnlockedSkins.push('obsidian_monolith');
        }

        const updated: PlayerProfileData = {
          ...prev,
          credits: nextCredits,
          highScore: nextHigh,
          dailyHighScore: nextDailyHigh,
          maxLevel: nextMaxLevel,
          patternsCompleted: nextPatterns,
          unlockedSkins: nextUnlockedSkins.slice(0, 15),
        };

        if (user) {
          syncProfileToCloud(user, updated, false);
          if (
            ((params.mode === 'arcade' ||
              params.mode === 'puzzle' ||
              params.mode === 'candy' ||
              params.mode === 'checkers' ||
              params.mode === 'maze') &&
              params.score >= prev.highScore) ||
            (params.mode === 'daily' && params.score >= prev.dailyHighScore)
          ) {
            syncLeaderboardEntryToCloud(
              user,
              params.mode === 'daily' ? 'daily' : 'arcade',
              params.score,
              params.level,
              nextPatterns,
              updated.activeSkinId
            );
          }
        }

        return updated;
      });
    },
    [user, syncProfileToCloud, syncLeaderboardEntryToCloud]
  );

  const todayKey = getTodayDateKey();
  const canClaimDailyBonus = profile.lastDailyClaimDate !== todayKey;

  const handleClaimDailyBonus = () => {
    if (!canClaimDailyBonus) return;
    soundEngine.playPatternComplete();
    const updated: PlayerProfileData = {
      ...profile,
      credits: profile.credits + 15000,
      dailyStreak: profile.dailyStreak + 1,
      lastDailyClaimDate: todayKey,
      drawTickets: profile.drawTickets + 1,
    };
    setProfile(updated);
    if (user) {
      syncProfileToCloud(user, updated, false);
      syncMonthlyDrawToCloud(user, updated.drawTickets, updated.highScore);
    }
    showTemporaryNotice(
      SHOW_MONTHLY_GIVEAWAY
        ? 'Daily Reward Claimed: +15,000 Credits & +1 Monthly $50 Giveaway Ticket!'
        : 'Daily Reward Claimed: +15,000 Free Credits Added!'
    );
  };

  const handleEnablePushNotifications = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          setPushStatusText('Push Alerts Active');
          new Notification('KINETIX: Pattern Pulse Arcade', {
            body: 'Daily +15,000 Credit Reward & Friend Challenge notifications are now enabled!',
          });
          showTemporaryNotice(
            'Browser Push Notifications Enabled! You will be alerted for daily credit rewards & friend challenges.'
          );
          return;
        }
      } catch {
        // Fallback for sandboxed iframe environments
      }
    }
    setPushStatusText('In-App Push Alerts Enabled');
    showTemporaryNotice(
      'Push Reminders Activated! Daily +15,000 CR reward alerts & friend invite notifications synced.'
    );
  };

  const handleShareScore = async (customScore?: number) => {
    const scoreToShare =
      customScore ?? Math.max(profile.highScore, profile.dailyHighScore);
    const shareUrl = window.location.href;
    const shareText = `I scored ${scoreToShare.toLocaleString()} pts in KINETIX: Pattern Pulse Arcade (${
      profile.patternsCompleted
    } patterns completed)! Start with 100,000 free credits and beat my score: ${shareUrl}`;

    let sharedViaNative = false;
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'KINETIX: Pattern Pulse Arcade',
          text: shareText,
          url: shareUrl,
        });
        sharedViaNative = true;
      } catch {
        sharedViaNative = false;
      }
    }

    if (!sharedViaNative && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
      } catch {
        // Ignore clipboard permissions
      }
    }

    setCopiedToast(true);
    window.setTimeout(() => setCopiedToast(false), 3000);

    const updated: PlayerProfileData = {
      ...profile,
      credits: profile.credits + 5000,
    };
    setProfile(updated);
    if (user) {
      syncProfileToCloud(user, updated, false);
    }
    showTemporaryNotice(
      'Challenge Link Copied to Clipboard! +5,000 Viral Friend Invite Credits Added.'
    );
  };

  const handleSelectSkin = (skinId: string) => {
    const updated: PlayerProfileData = {
      ...profile,
      activeSkinId: skinId,
    };
    setProfile(updated);
    if (user) syncProfileToCloud(user, updated, false);
    soundEngine.playBlockSelect();
  };

  const handleUnlockSkinWithCredits = (skin: BlockSkin) => {
    if (profile.credits < skin.costCredits) {
      setIsPayPalOpen(true);
      return;
    }
    soundEngine.playPatternComplete();
    const nextSkins = Array.from(
      new Set([...profile.unlockedSkins, skin.id])
    ).slice(0, 15);
    const updated: PlayerProfileData = {
      ...profile,
      credits: profile.credits - skin.costCredits,
      unlockedSkins: nextSkins,
      activeSkinId: skin.id,
    };
    setProfile(updated);
    if (user) syncProfileToCloud(user, updated, false);
    showTemporaryNotice(`Unlocked & Equipped ${skin.name} Skin!`);
  };

  const handleUnlockVaultItemWithCredits = (item: DigitalVaultItem) => {
    if (profile.credits < item.unlockCostCredits) {
      setIsPayPalOpen(true);
      return;
    }
    soundEngine.playPatternComplete();
    const nextVault = Array.from(
      new Set([...profile.unlockedVaultItems, item.id])
    ).slice(0, 25);
    const updated: PlayerProfileData = {
      ...profile,
      credits: profile.credits - item.unlockCostCredits,
      unlockedVaultItems: nextVault,
    };
    setProfile(updated);
    if (user) syncProfileToCloud(user, updated, false);
    showTemporaryNotice(
      `Unlocked "${item.title}"! Click Download Free Guide to save your copy.`
    );
  };

  const handleClaimTicketWithCredits = () => {
    if (profile.credits < 15000) {
      setIsPayPalOpen(true);
      return;
    }
    soundEngine.playPatternComplete();
    const updated: PlayerProfileData = {
      ...profile,
      credits: profile.credits - 15000,
      drawTickets: profile.drawTickets + 1,
    };
    setProfile(updated);
    if (user) {
      syncProfileToCloud(user, updated, false);
      syncMonthlyDrawToCloud(user, updated.drawTickets, updated.highScore);
    }
    showTemporaryNotice(
      `+1 Entry Ticket Added for the Monthly $50 Giveaway (${updated.drawTickets} Total Tickets)!`
    );
  };

  const handlePayPalSuccessTopUp = (
    addedCredits: number,
    bonusTickets: number
  ) => {
    soundEngine.playLevelCompleteChime();
    const updated: PlayerProfileData = {
      ...profile,
      credits: profile.credits + addedCredits,
      drawTickets: profile.drawTickets + bonusTickets,
    };
    setProfile(updated);
    if (user) {
      syncProfileToCloud(user, updated, false);
      syncMonthlyDrawToCloud(user, updated.drawTickets, updated.highScore);
    }
    showTemporaryNotice(
      SHOW_MONTHLY_GIVEAWAY
        ? `PayPal Top-Up Complete: +${addedCredits.toLocaleString()} Credits & +${bonusTickets} Monthly $50 Draw Tickets!`
        : `PayPal Top-Up Complete: +${addedCredits.toLocaleString()} Credits Added!`
    );
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#F2F9FB] dark:bg-[#071731] text-[#0B2249] dark:text-white flex flex-col transition-colors duration-200">
        {/* LearnLink Signature Navy Blue + Turquoise + Crisp White Top Bar */}
        <header className="flex items-center justify-between gap-2 px-3 sm:px-6 py-2 border-b-2 border-[#14B8C4] bg-[#0B2249] text-white sticky top-0 z-30 shadow-sm">
          {/* Left: Wordmark */}
          <a
            href="#arena"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('arena');
            }}
            className="text-sm sm:text-base font-extrabold font-display tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-[#14B8C4] inline-block" aria-hidden="true" />
            <span>KINETIX</span>
          </a>

          {/* Center: Compact 5-Section Switcher */}
          <nav className="flex items-center gap-1 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSection('arena')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                activeSection === 'arena'
                  ? 'bg-[#14B8C4] text-[#062134]'
                  : 'text-[#CBE7F0] hover:text-white hover:bg-white/10'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Game</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('leaderboard')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                activeSection === 'leaderboard'
                  ? 'bg-[#14B8C4] text-[#062134] font-bold'
                  : 'text-[#CBE7F0] hover:text-white hover:bg-white/10'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Ranks</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('vault')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                activeSection === 'vault'
                  ? 'bg-[#14B8C4] text-[#062134] font-bold'
                  : 'text-[#CBE7F0] hover:text-white hover:bg-white/10'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Vault</span>
            </button>
            {SHOW_MONTHLY_GIVEAWAY && (
              <button
                type="button"
                onClick={() => setActiveSection('giveaway')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  activeSection === 'giveaway'
                    ? 'bg-[#14B8C4] text-[#062134] font-bold'
                    : 'text-[#CBE7F0] hover:text-white hover:bg-white/10'
                }`}
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>$50 Draw</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveSection('learnlink')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                activeSection === 'learnlink'
                  ? 'bg-[#14B8C4] text-[#062134] font-bold'
                  : 'text-[#CBE7F0] hover:text-white hover:bg-white/10'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>LearnLink</span>
            </button>
          </nav>

          {/* Right: Language Toggle (ID+EN / ID / EN), Light/Dark Navy Toggle & Cloud Sign-In */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                setLanguage((prev) =>
                  prev === 'bilingual'
                    ? 'id'
                    : prev === 'id'
                    ? 'en'
                    : 'bilingual'
                )
              }
              className="px-2 py-1 bg-[#14B8C4]/20 hover:bg-[#14B8C4]/35 border border-[#14B8C4]/50 text-[#CCF5F8] text-[11px] font-extrabold rounded-lg transition-colors cursor-pointer"
              title="Switch Language: Bilingual (Bahasa Indonesia + English) / Bahasa Indonesia / English"
            >
              {language === 'bilingual'
                ? '🇮🇩+🇬🇧'
                : language === 'id'
                ? '🇮🇩 ID'
                : '🇬🇧 EN'}
            </button>

            <button
              type="button"
              onClick={() => setIsLightMode((prev) => !prev)}
              className="p-1.5 bg-white/12 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
              title={
                isLightMode
                  ? 'Switch to Deep Navy Dark Screen'
                  : 'Switch to Crisp White Light Screen'
              }
            >
              {isLightMode ? (
                <Moon className="w-3.5 h-3.5 text-[#2DD4BF]" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-[#2DD4BF]" />
              )}
            </button>

            <button
              type="button"
              onClick={handleCloudAuthToggle}
              className="px-2.5 py-1 text-[11px] font-bold text-[#062134] bg-[#2DD4BF] hover:bg-[#5EEAD4] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {!authReady
                ? '...'
                : user
                ? (user.displayName || 'Saved').split(' ')[0]
                : 'Sign In'}
            </button>
          </div>
        </header>

        {/* Secondary Economy Bar ONLY shown on Ranks, Vault, $50 Draw so Game Screen & LearnLink Promo stay 100% clutter-free */}
        {activeSection !== 'arena' && activeSection !== 'learnlink' && (
          <div className="bg-white dark:bg-[#0D244B] border-b border-[#C5E4EC] dark:border-[#1E447D] px-4 sm:px-8 py-2">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#0B2249] dark:text-[#CBE7F0] font-mono">
                <span className="text-[#0D949E] dark:text-[#2DD4BF] font-bold">
                  {profile.credits.toLocaleString()} Credits
                </span>
                <span aria-hidden="true">·</span>
                <span>Best: {profile.highScore.toLocaleString()} PTS</span>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {profile.patternsCompleted} Patterns
                </span>
                {SHOW_MONTHLY_GIVEAWAY && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{profile.drawTickets} Ticket(s)</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsPayPalOpen(true)}
                  className="px-2.5 py-1 bg-[#14B8C4] hover:bg-[#0EA5B7] text-[#062134] font-bold text-xs rounded-md transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>$0.99 PayPal (+250K CR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleShareScore()}
                  className="px-2.5 py-1 bg-[#E8F5F8] dark:bg-[#122E5E] hover:bg-[#D5EEF4] dark:hover:bg-[#1A3E7A] text-[#0B2249] dark:text-white font-medium text-xs rounded-md transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#0D949E] dark:text-[#2DD4BF]" />
                  <span>Invite (+5K CR)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleClearPointsAdminOrPractice(true, 0)}
                  className="px-2.5 py-1 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-600 dark:text-rose-300 font-bold text-xs rounded-md transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear (0)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transient Notification Toast */}
        {statusBanner && (
          <div className="bg-[#CCF5F8] dark:bg-[#12336B] border-b border-[#14B8C4] px-3 py-1.5 text-center text-xs text-[#0B2249] dark:text-[#CCF5F8] font-semibold">
            {statusBanner}
          </div>
        )}

        {/* Main Content Container (Tight vertical padding on Game Screen so no scrolling is needed) */}
        <main
          className={`flex-1 w-full max-w-7xl mx-auto ${
            activeSection === 'arena'
              ? 'px-2.5 sm:px-4 py-2'
              : 'px-4 sm:px-8 py-5'
          }`}
        >
          {activeSection === 'arena' && (
            <ArcadeArena
              mode={gameMode}
              onModeChange={setGameMode}
              isLightMode={isLightMode}
              language={language}
              onLanguageChange={setLanguage}
              isAdminUser={Boolean(isAdminUser)}
              credits={profile.credits}
              highScore={profile.highScore}
              dailyHighScore={profile.dailyHighScore}
              patternsCompletedTotal={profile.patternsCompleted}
              activeSkinId={profile.activeSkinId}
              dailyStreak={profile.dailyStreak}
              canClaimDailyBonus={canClaimDailyBonus}
              onClaimDailyBonus={handleClaimDailyBonus}
              onRecordRunUpdate={handleRecordRunUpdate}
              onClearPointsAdminOrPractice={handleClearPointsAdminOrPractice}
              clearSignal={clearSignal}
              onOpenPayPalModal={() => setIsPayPalOpen(true)}
              onNavigateToVault={() => setActiveSection('vault')}
              onShareScore={handleShareScore}
              copiedToast={copiedToast}
            />
          )}

          {activeSection === 'leaderboard' && (
            <LeaderboardSection
              currentUid={user?.uid || profile.uid}
              isAdminUser={Boolean(isAdminUser)}
              playerHighScore={profile.highScore}
              playerDailyHighScore={profile.dailyHighScore}
              onShareScore={() => handleShareScore()}
              onAdminClearPoints={() => handleClearPointsAdminOrPractice(true)}
              copiedToast={copiedToast}
            />
          )}

          {activeSection === 'vault' && (
            <RewardsVaultSection
              credits={profile.credits}
              patternsCompleted={profile.patternsCompleted}
              activeSkinId={profile.activeSkinId}
              unlockedSkins={profile.unlockedSkins}
              unlockedVaultItems={profile.unlockedVaultItems}
              onSelectSkin={handleSelectSkin}
              onUnlockSkinWithCredits={handleUnlockSkinWithCredits}
              onUnlockVaultItemWithCredits={handleUnlockVaultItemWithCredits}
              onOpenPayPalModal={() => setIsPayPalOpen(true)}
            />
          )}

          {SHOW_MONTHLY_GIVEAWAY && activeSection === 'giveaway' && (
            <MonthlyDrawSection
              credits={profile.credits}
              drawTickets={profile.drawTickets}
              highScore={profile.highScore}
              onClaimTicketWithCredits={handleClaimTicketWithCredits}
              onEnablePushNotifications={handleEnablePushNotifications}
              pushStatusText={pushStatusText}
            />
          )}

          {activeSection === 'learnlink' && (
            <LearnLinkPromoPage
              language={language}
              onReturnToGame={() => setActiveSection('arena')}
            />
          )}
        </main>

        {/* LearnLink Signature Navy Blue + Turquoise + Crisp White Copyright Footer */}
        <footer
          className={`border-t-2 border-[#14B8C4] bg-[#0B2249] text-[#CBE7F0] ${
            activeSection === 'arena' ? 'py-2 px-3 sm:px-6' : 'py-3 px-4 sm:px-8'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
            <span className="text-white/90 font-medium">
              &copy; {new Date().getFullYear()} LearnLink Educational Learning
              System.{' '}
              {language === 'id'
                ? 'Hak Cipta Dilindungi.'
                : 'All rights reserved.'}
            </span>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  triggerUsbOfflineDownload();
                  showTemporaryNotice(
                    language === 'id'
                      ? 'File USB Offline (LearnLink-Brain-Workout-Offline-USB.html) berhasil diunduh! Salin ke USB untuk main tanpa internet.'
                      : 'Downloaded LearnLink-Brain-Workout-Offline-USB.html! Copy it to a USB flash drive to play all 37 games 100% offline.'
                  );
                }}
                className="font-semibold text-[#2DD4BF] hover:text-white inline-flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                title="Download 100% Offline Single-File Game for USB Drive"
              >
                <HardDriveDownload className="w-3.5 h-3.5" />
                <span>
                  {language === 'id' ? 'Simpan ke USB' : 'Save to USB'}
                </span>
              </button>

              <span aria-hidden="true" className="text-white/30">
                ·
              </span>

              {activeSection !== 'learnlink' ? (
                <button
                  type="button"
                  onClick={() => setActiveSection('learnlink')}
                  className="font-semibold text-white hover:text-[#2DD4BF] underline-offset-4 hover:underline whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  {language === 'id'
                    ? 'Promo & Alat Belajar LearnLink'
                    : language === 'en'
                    ? 'LearnLink Promo & Tools'
                    : 'LearnLink Promo & Tools'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveSection('arena')}
                  className="font-semibold text-white hover:text-[#2DD4BF] underline-offset-4 hover:underline whitespace-nowrap shrink-0 cursor-pointer transition-colors"
                >
                  {language === 'id' ? 'Kembali ke Permainan' : 'Back to Game'}
                </button>
              )}
            </div>
          </div>
        </footer>

        {/* Subtle Offline Connectivity Toast (only shown when network disconnects) */}
        <OfflineIndicator language={language} />

        {/* Win-Wall $0.99 PayPal Credit Top-Up Gateway Modal */}
        <PayPalModal
          isOpen={isPayPalOpen}
          onClose={() => setIsPayPalOpen(false)}
          currentCredits={profile.credits}
          onSuccessTopUp={handlePayPalSuccessTopUp}
        />
      </div>
    </ErrorBoundary>
  );
}
