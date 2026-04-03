# Phase 1: Foundation & Migration (Type Errors & Tab Routing)

## 1. Type Error Resolution
The transition to the new shared schema in `packages/shared/src/types` resulted in 48 frontend TypeScript errors across 8 files. These primarily stem from renaming properties (e.g., `companyLogo` -> `companyLogoUrl`, `eventType`, `referrerName`, `seekerName`, missing properties on `IntrinsicAttributes & StatCardProps` and `IntrinsicAttributes & AvatarProps`).

### Strategy:
1. Update frontend components to strictly adhere to `packages/shared`.
2. Fix mapping discrepancies between old Prisma schema models and new Django models via shared types.
3. Ensure strictly typed `StatCardProps` and `AvatarProps` are implemented in their respective component files.

## 2. Tab Routing Architecture (Expo Router)
We are adopting **Approach 1: Separate Route Groups** for managing the Seeker and Referrer dashboards.

### Structure:
- `app/(seeker-tabs)`
  - `_layout.tsx` (Seeker Tab Navigator)
  - `discover.tsx` (FeedScreen)
  - `matches.tsx` (MatchesScreen)
  - `pipeline.tsx` (PipelineScreen)
  - `profile.tsx` (ProfileScreen)
- `app/(referrer-tabs)`
  - `_layout.tsx` (Referrer Tab Navigator)
  - `inbox.tsx` (InboxScreen)
  - `active.tsx` (EarningsScreen/ActiveReferrals)
  - `earnings.tsx` (EarningsScreen)
  - `profile.tsx` (ProfileScreen)

### Entry Arbitration (`app/index.tsx`):
The index file will be updated to read the user's role from the session (`session.user.role`) and redirect to the corresponding tab group:
- If `role === 'seeker'`, redirect to `/(seeker-tabs)/discover`.
- If `role === 'referrer'`, redirect to `/(referrer-tabs)/inbox`.

## 3. Fabric Verification
Once compilation errors are resolved, the application will be built and tested locally to ensure seamless mounting under React Native's New Architecture (`newArchEnabled: true`).
