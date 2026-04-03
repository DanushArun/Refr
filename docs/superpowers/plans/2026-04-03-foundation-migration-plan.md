# Phase 1: Foundation & Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve 48 frontend TypeScript errors and migrate the tab routing structure to use Expo Router with separate route groups for Seekers and Referrers.

**Architecture:** We will first fix all type mismatches between the frontend components and the new `packages/shared` schema. Then, we will establish `app/(seeker-tabs)` and `app/(referrer-tabs)` route groups, moving existing screens into them. Finally, we will update `app/index.tsx` to handle role-based redirection.

**Tech Stack:** React Native (New Architecture/Fabric), Expo SDK 52+, Expo Router, TypeScript.

---

### Task 1: Fix Type Errors in Feed Components

**Files:**
- Modify: `frontend/src/components/feed/CompanyIntelCard.tsx`
- Modify: `frontend/src/components/feed/ReferralEventCard.tsx`

- [ ] **Step 1: Update CompanyIntelCard**
  - Change `card.companyLogoUrl` to `card.companyLogo`
  - Remove `square` prop from `<Avatar>`
  - Change `card.headline` to `card.title`
  - Ensure `card.isAnonymous` check is removed or handled via `authorLabel` logic since `isAnonymous` is not in `CompanyIntelCard` type.

- [ ] **Step 2: Update ReferralEventCard**
  - Change `card.eventType` check to rely on something else or assume it's a generic referral event, as `ReferralEventCard` doesn't have `eventType`.
  - Replace `card.referrerName`, `card.seekerName`, and `card.role` with `card.referrerDisplayName`, `card.seekerDisplayName`, and part of `card.eventDescription`.

- [ ] **Step 3: Verify Fixes**
  Run: `npm run typecheck` in `frontend`
  Expected: Errors for `CompanyIntelCard.tsx` and `ReferralEventCard.tsx` should be gone.

- [ ] **Step 4: Commit**
  Run: `git add frontend/src/components/feed/CompanyIntelCard.tsx frontend/src/components/feed/ReferralEventCard.tsx`
  Run: `git commit -m "fix: resolve type errors in feed components"`

### Task 2: Fix Type Errors in Screens (Earnings, Feed, Inbox)

**Files:**
- Modify: `frontend/src/screens/EarningsScreen.tsx`
- Modify: `frontend/src/screens/FeedScreen.tsx`
- Modify: `frontend/src/screens/InboxScreen.tsx`

- [ ] **Step 1: Fix EarningsScreen and FeedScreen Props**
  - Remove `size` and `accent` props from `<StatCard>` or update `StatCardProps` to accept them. Let's update `frontend/src/components/common/StatCard.tsx` (or remove them if not needed). Assuming we remove them for simplicity if not in type.
  - Remove `variant="ghost"` from `<Button>` or update `ButtonVariant` type in `frontend/src/components/common/Button.tsx`.

- [ ] **Step 2: Fix InboxScreen Referral Types**
  - `ReferrerInboxItem` uses `referral.id` instead of `item.id`. Update all `item.id` to `item.referral.id`.
  - Update `item.status` to `item.referral.status`.
  - Update `item.targetRole` to `item.referral.targetRole`.
  - Update `item.seekerNote` to `item.referral.seekerNote` or `item.seekerName` depending on context.
  - Update `item.referralId` to `item.referral.id`.
  - Update `item.conversationId` to something available or remove it if not in schema.
  - Fix `<Button variant="ghost">`

- [ ] **Step 3: Verify Fixes**
  Run: `npm run typecheck` in `frontend`
  Expected: Errors for Earnings, Feed, and Inbox screens should be resolved.

- [ ] **Step 4: Commit**
  Run: `git add frontend/src/screens/EarningsScreen.tsx frontend/src/screens/FeedScreen.tsx frontend/src/screens/InboxScreen.tsx`
  Run: `git commit -m "fix: resolve type errors in earnings, feed, and inbox screens"`

### Task 3: Fix Type Errors in Pipeline and Profile Screens & Hooks

**Files:**
- Modify: `frontend/src/screens/PipelineScreen.tsx`
- Modify: `frontend/src/screens/ProfileScreen.tsx`
- Modify: `frontend/src/hooks/useAuth.ts`
- Modify: `frontend/src/components/common/Avatar.tsx` (if needed for displayName)
- Modify: `frontend/src/components/common/Button.tsx` (to add 'ghost' variant)

- [ ] **Step 1: Fix PipelineScreen**
  - Update `item.id` to `item.referral.id`.
  - Update `item.status` to `item.referral.status`.
  - Update `item.targetRole` to `item.referral.targetRole`.
  - Update `item.referrerTitle` to something available, maybe `item.referrerName`.

- [ ] **Step 2: Fix ProfileScreen**
  - `User` type needs to map correctly. `user.referrerProfile` and `user.seekerProfile` checks might need to be adjusted based on `UserProfile` type.
  - Ensure `displayName` is always a string or provide a fallback `displayName={user.displayName || 'User'}`.
  - Fix `<Button variant="ghost">`

- [ ] **Step 3: Fix useAuth Hook**
  - `useEffect` must return a function or void. Ensure it doesn't return a boolean.

- [ ] **Step 4: Update Button Component**
  - Add `'ghost'` to `ButtonVariant` type in `frontend/src/components/common/Button.tsx`.

- [ ] **Step 5: Verify Fixes**
  Run: `npm run typecheck` in `frontend`
  Expected: 0 errors.

- [ ] **Step 6: Commit**
  Run: `git add frontend/src/screens/PipelineScreen.tsx frontend/src/screens/ProfileScreen.tsx frontend/src/hooks/useAuth.ts frontend/src/components/common/Button.tsx`
  Run: `git commit -m "fix: resolve remaining type errors"`

### Task 4: Setup Tab Routing Directories

**Files:**
- Create: `frontend/app/(seeker-tabs)/_layout.tsx`
- Create: `frontend/app/(seeker-tabs)/discover.tsx`
- Create: `frontend/app/(seeker-tabs)/matches.tsx`
- Create: `frontend/app/(seeker-tabs)/pipeline.tsx`
- Create: `frontend/app/(seeker-tabs)/profile.tsx`
- Create: `frontend/app/(referrer-tabs)/_layout.tsx`
- Create: `frontend/app/(referrer-tabs)/inbox.tsx`
- Create: `frontend/app/(referrer-tabs)/active.tsx`
- Create: `frontend/app/(referrer-tabs)/earnings.tsx`
- Create: `frontend/app/(referrer-tabs)/profile.tsx`

- [ ] **Step 1: Scaffold Seeker Tabs Layout**
  Create `_layout.tsx` for seeker tabs using `Tabs` from `expo-router`.

- [ ] **Step 2: Scaffold Referrer Tabs Layout**
  Create `_layout.tsx` for referrer tabs using `Tabs` from `expo-router`.

- [ ] **Step 3: Move/Create Tab Screens**
  Wrap the existing screens (e.g., `FeedScreen`, `PipelineScreen`) inside these new route files.

- [ ] **Step 4: Commit**
  Run: `git add frontend/app/\(seeker-tabs\) frontend/app/\(referrer-tabs\)`
  Run: `git commit -m "feat: establish separate tab route groups"`

### Task 5: Update Entry Routing and Cleanup

**Files:**
- Modify: `frontend/app/index.tsx`
- Delete: `frontend/app/(tabs)` (if it exists)

- [ ] **Step 1: Update index.tsx**
  Change the redirect logic in `frontend/app/index.tsx` to check `session.user.role`.
  - If seeker -> `return <Redirect href="/(seeker-tabs)/discover" />`
  - If referrer -> `return <Redirect href="/(referrer-tabs)/inbox" />`

- [ ] **Step 2: Commit**
  Run: `git add frontend/app/index.tsx`
  Run: `git commit -m "feat: implement role-based entry routing"`
