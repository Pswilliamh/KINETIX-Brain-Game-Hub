# KINETIX: Pattern Pulse Arcade — Zero-Trust Firestore Security Specification

## 1. Data Invariants

1. **PlayerProfile (`/players/{userId}`)**:
   - **PII & Owner Isolation**: Only the authenticated owner (`request.auth.uid == userId`) can `get`, `create`, or `update` their own profile document. No `list` or `delete` operations are permitted.
   - **Verified Identity**: Writes require `request.auth.token.email_verified == true`.
   - **Schema Integrity**: Must strictly match required keys (`uid`, `displayName`, `credits`, `highScore`, `dailyHighScore`, `maxLevel`, `patternsCompleted`, `activeSkinId`, `unlockedSkins`, `unlockedVaultItems`, `dailyStreak`, `lastDailyClaimDate`, `drawTickets`, `createdAt`, `updatedAt`).
   - **Array Bounds**: `unlockedSkins.size() <= 15` and `unlockedVaultItems.size() <= 25`.
   - **Temporal Integrity**: `createdAt == request.time` on create; `createdAt == resource.data.createdAt` and `updatedAt == request.time` on update.

2. **LeaderboardEntry (`/leaderboard/{entryId}`)**:
   - **Public Competition Read**: Must be readable (`get`, `list`) if `resource.data.score >= 0` and `resource.data.mode in ['arcade', 'daily']` so global leaderboards work cleanly while enforcing resource constraints.
   - **Owner-Bound Write**: Only verified authenticated users (`request.auth.uid == request.resource.data.uid`) can create or update their own entry (`entryId` must be valid ID).
   - **Score Bounds**: `score >= 0 && score <= 100000000`, `level >= 1 && level <= 999`, `patterns >= 0 && patterns <= 100000`.

3. **MonthlyDrawEntry (`/monthly_draws/{entryId}`)**:
   - **Public Transparency Read**: Readable if `resource.data.ticketCount >= 1 && resource.data.ticketCount <= 1000`.
   - **Verified Owner Write**: `request.auth.uid == request.resource.data.uid`, `monthKey.matches('^[0-9]{4}-[0-9]{2}$')`.

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Identity Spoofing on PlayerProfile**: Authenticated user `uid_A` tries to write `/players/uid_B` or set `uid: "uid_B"`. -> `PERMISSION_DENIED`
2. **Unverified Email Write**: Authenticated user with `email_verified: false` tries to create `/players/uid_A`. -> `PERMISSION_DENIED`
3. **Shadow Field Injection on PlayerProfile**: Payload includes all required fields plus `"isAdmin": true`. -> `PERMISSION_DENIED`
4. **Unbounded Array Exhaustion**: `unlockedSkins` array with 50 items (`> 15`). -> `PERMISSION_DENIED`
5. **Cross-User Profile Scraping**: User `uid_A` attempts `get(/players/uid_B)`. -> `PERMISSION_DENIED`
6. **Negative or Overflow Credits**: User tries to set `credits: -500` or `credits: 999999999999`. -> `PERMISSION_DENIED`
7. **Forged Timestamp on Create**: User sends `createdAt` not matching `request.time`. -> `PERMISSION_DENIED`
8. **Mutating Immutable `createdAt` or `uid` on Update**: User updates `PlayerProfile` changing `createdAt` or `uid`. -> `PERMISSION_DENIED`
9. **Leaderboard Score Poisoning**: User submits a string `"999999"` for `score` or negative score `-100`. -> `PERMISSION_DENIED`
10. **Leaderboard Spoofing Another Player**: User `uid_A` updates `/leaderboard/entry_B` belonging to `uid_B`. -> `PERMISSION_DENIED`
11. **Invalid Mode Enum in Leaderboard**: User submits `mode: "hacked_mode"`. -> `PERMISSION_DENIED`
12. **Malformed Month Key in Monthly Draw**: User submits `monthKey: "2026-13-99"` or `ticketCount: 0`. -> `PERMISSION_DENIED`
