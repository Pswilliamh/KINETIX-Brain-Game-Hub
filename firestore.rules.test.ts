/**
 * Firestore Security Rules Test Suite — Phase 0 Verification
 * Verifies that all "Dirty Dozen" adversarial payloads return PERMISSION_DENIED.
 */

export interface AdversarialTestCase {
  id: number;
  name: string;
  collection: string;
  docId: string;
  auth: { uid: string; email_verified: boolean } | null;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  payload?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_TESTS: AdversarialTestCase[] = [
  {
    id: 1,
    name: 'Identity Spoofing on PlayerProfile',
    collection: 'players',
    docId: 'victim_uid',
    auth: { uid: 'attacker_uid', email_verified: true },
    operation: 'create',
    payload: { uid: 'victim_uid', displayName: 'Spoofer', credits: 100000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Write',
    collection: 'players',
    docId: 'user_1',
    auth: { uid: 'user_1', email_verified: false },
    operation: 'create',
    payload: { uid: 'user_1', displayName: 'Unverified', credits: 100000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Shadow Field Injection on PlayerProfile',
    collection: 'players',
    docId: 'user_1',
    auth: { uid: 'user_1', email_verified: true },
    operation: 'create',
    payload: {
      uid: 'user_1',
      displayName: 'Player1',
      credits: 100000,
      isAdmin: true,
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Unbounded Array Exhaustion on unlockedSkins',
    collection: 'players',
    docId: 'user_1',
    auth: { uid: 'user_1', email_verified: true },
    operation: 'update',
    payload: {
      unlockedSkins: Array.from({ length: 20 }, (_, i) => `skin_${i}`),
    },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Cross-User Profile Scraping',
    collection: 'players',
    docId: 'user_2',
    auth: { uid: 'user_1', email_verified: true },
    operation: 'get',
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Negative or Overflow Credits',
    collection: 'players',
    docId: 'user_1',
    auth: { uid: 'user_1', email_verified: true },
    operation: 'update',
    payload: { credits: -5000 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Forged Timestamp on Create',
    collection: 'players',
    docId: 'user_1',
    auth: { uid: 'user_1', email_verified: true },
    operation: 'create',
    payload: { createdAt: '1999-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Mutating Immutable createdAt on Update',
    collection: 'players',
    docId: 'user_1',
    auth: { uid: 'user_1', email_verified: true },
    operation: 'update',
    payload: { createdAt: '2026-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Leaderboard Score Type Poisoning',
    collection: 'leaderboard',
    docId: 'user_1_arcade',
    auth: { uid: 'user_1', email_verified: true },
    operation: 'create',
    payload: { uid: 'user_1', score: '9999999', mode: 'arcade' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Leaderboard Spoofing Another Player',
    collection: 'leaderboard',
    docId: 'user_2_arcade',
    auth: { uid: 'user_1', email_verified: true },
    operation: 'update',
    payload: { uid: 'user_2', score: 10 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Invalid Mode Enum in Leaderboard',
    collection: 'leaderboard',
    docId: 'user_1_hack',
    auth: { uid: 'user_1', email_verified: true },
    operation: 'create',
    payload: { uid: 'user_1', score: 5000, mode: 'unlimited_hack' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Malformed Month Key in Monthly Draw',
    collection: 'monthly_draws',
    docId: 'user_1_2026',
    auth: { uid: 'user_1', email_verified: true },
    operation: 'create',
    payload: { uid: 'user_1', monthKey: '2026-99-99', ticketCount: 0 },
    expectedResult: 'PERMISSION_DENIED',
  },
];
