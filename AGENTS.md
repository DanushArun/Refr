# REFR

## Repository Boundary

- `Refer` is the frontend repo only. Do not create, restore, or edit backend
  application code under `Refer/backend/`.
- Backend code belongs only in the sibling repo:
  `/Users/danusharun/Documents/refr-backend`.
- Frontend/backend contract work may update frontend TypeScript types and API
  clients in this repo, but Django models, migrations, serializers, views,
  services, backend tests, backend `.env`, and backend commands must happen in
  `refr-backend`.

## Codex Guardrails

### Catalogue-bound visual delivery

- `design-reference/` is the binding implementation authority for the replacement interface.
  Catalogue references are specifications, never inspiration.
- `design-reference/screen-registry.json` defines the complete source inventory. Every new visual
  state needs its own screen folder, `specification.md`, `screen-audit.md`, and flat reference art.
- The current source package is status `source-export-required`. Do not invent tokens, artwork,
  crops, fonts, or geometry from perspective composites. Obtain the required source handoff before
  implementing or approving visual UI.
- Once a screen has `referenceStatus: ready`, implement static fidelity first, run screenshot
  comparison at its declared viewport, resolve P0 and P1 discrepancies, then add interaction and
  polish work. A separate visual-QA pass must review the comparison; the implementer does not
  self-approve.
- Shared visual code belongs in `frontend/src/design-system/`. Use semantic tokens and shared
  primitives/components only; do not scatter raw colors, spacing, radii, shadows, font values, or
  ad-hoc iconography through screens.
- Use supplied assets and font files only. Never replace them with generated artwork, emoji, stock
  images, a different icon family, a generic gradient, a default native control, or synthetic font
  weights. Preserve declared aspect ratios and crop rules.
- Catalogue rules supersede older visual-style descriptions in this file where they conflict.
- A visual screen is complete only after build, typecheck, applicable tests, a device/simulator
  inspection, screenshot capture, direct reference comparison, responsive checks at 360, 375, 390,
  393, and 430 points, and a recorded discrepancy result. Do not claim pixel-perfect fidelity
  without that evidence.

### Root Provider / Navigation Safety

- Treat `frontend/app/_layout.tsx`, `frontend/app/(*)/_layout.tsx`, and
  `frontend/src/components/navigation/*` as high-risk files. These control the
  root providers and whether routed screens are visible.
- Preserve the root layering contract: background/aurora stays behind the
  route layer, route content stays inside the Expo Router `Stack`, and overlays
  must use `pointerEvents="box-none"` unless they intentionally block touch.
- Do not animate bottom-tab scenes with opacity/shift transforms while tab
  scenes are transparent. Keep tab scene animation at `none` unless a real
  device/simulator check proves every tab still renders content after rapid
  switching.
- Never ship a change that can leave only the aurora/background and tab bar
  visible with the routed screen blank. If that happens, revert the scene
  animation/provider change first, then debug.
- Full-screen routes such as `/chat` should render their final shell
  immediately. Avoid full-screen loading handoffs between a tap and the
  destination screen; use in-panel skeletons and hydrate data after navigation
  interactions instead.
- Before finalizing any root provider, tab bar, stack animation, or chat
  navigation change, run `npm run typecheck` and manually verify: tab switching,
  Matches/Inbox person tap to `/chat`, back navigation, and no blank screen.

<!-- AUTO-MANAGED: project-description -->
## Project Overview

Endorsly (codebase: REFR) is a **Professional Intelligence Platform for India** — a content-first feed where the natural social action is submitting job endorsements. The app is pan-India: a candidate can be endorsed for any role anywhere in India, gated only by job-market availability. Endorsement is not a task; it is the social action within a doom-scroll feed of insider career and company knowledge.

- **Founders**: Danush (technical), Nivrant
- **Market**: Indian tech companies; employer-side monetization (22K INR/hire success fee)
- **Kill metric**: 100 active endorsers ("submitted at least one endorsement in trailing 30 days") at 20 companies in 6 months
- **Predecessor**: Round One — failed due to seeker-side monetization (adverse selection); Endorsly must NOT charge seekers in Phase 1-2
- **Strategic concept**: Epistemic dependency — Endorsly becomes the authoritative source for Indian tech insider knowledge (what Twitter/Blind/Glassdoor/LinkedIn currently split across 5 platforms)
- **Feed content pillars**: Company Intelligence (insider posts) + Career Stories (seeker narratives) + Live Endorsement Stream (system events)
- **Endorsement Score**: Public reputation metric for endorsers — permanent, visible, identity-defining; stronger retention driver than money alone. Never call this "Kingmaker Score" — that term is retired.
- **Anonymous + Verified Hybrid**: Employees post company intel anonymously ("Verified employee at [Company]"); endorsement actions are identity-attached
- **Current status**: Phase 1 complete — Django backend lives in the separate `refr-backend` repo; this repo contains the React Native frontend, local shared TypeScript package, and product/design docs.
- **Naming convention**: Public/UI copy uses **Endorsement / Endorser / Seeker / Endorsement Score**. Internal data model and code retain `Referral / referrer / kingmaker_score` (rename pending — scoring refactor is the last task in the queue, not the next).
<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: architecture -->
## Repository Contents

- `REFR_CTO_Analysis.md` — Original 12-skill CTO analysis (tech stack, architecture, roadmap, ML, cost, validation) — superseded by system-design doc below for product/behavioral architecture
- `India-Job-Referral-Market-Research/` — Market research directory
- `index.html` — Project landing page
- `docs/plans/2026-03-30-refr-system-design.md` — **Current strategic authority**: Professional Intelligence Platform concept, updated tech stack v2, updated module structure, anti-pattern analysis, revised phases (supersedes behavioral/product sections of CTO Analysis)
- `docs/plans/2026-03-27-refr-app-flow-design.md` — Full app flow and UI/UX screen specifications for Phase 1-2 MVP (11 screens + 2 modals)
- `docs/plans/REFR-Designer-Brief.md` — Designer handoff brief with component specs and Figma instructions (iPhone 14 Pro, 393x852pt)
- `docs/plans/figma-screen-scripts.md` — Figma screen build status tracker (file key: V2Hi4ENOtbntTaYWWGd8QF)
- `docs/plans/figma-seeker-scripts.js` — Figma Scripter plugin scripts for seeker journey screens (row 1, y=0)
- `docs/plans/figma-referrer-scripts.js` — Figma Scripter plugin scripts for referrer journey screens (row 2, y=960)
- `/Users/danusharun/Documents/refr-backend` — sibling Django 6.0 + DRF backend repo; backend code must stay there
- `frontend/` — React Native + Expo (TypeScript); Expo Router file-based navigation
  - `frontend/metro.config.js` — Metro monorepo config; resolves `@refr/shared` and root `node_modules`
  - `frontend/app/` — Expo Router route tree (thin wrappers only — each file imports from `src/screens/`)
    - `index.tsx` — entry: shows spinner while loading auth; redirects unauthenticated to `/(auth)/login`
    - `_layout.tsx` — RootLayout: loads 8 custom fonts (Outfit, InstrumentSerif, JetBrainsMono), wraps app in ErrorBoundary + GestureHandlerRootView + SystemBars
    - `(auth)/` — unauthenticated flow: `login.tsx`, `role-selection.tsx`, `profile-setup.tsx`
    - `(seeker-tabs)/` — seeker tab group: `discover.tsx`, `matches.tsx`, `pipeline.tsx`, `profile.tsx`
    - `(referrer-tabs)/` — referrer tab group (5 tabs): `discover.tsx` (incoming-candidate swipe deck), `inbox.tsx` (chat list), `active.tsx` (in-flight referral list), `earnings.tsx`, `profile.tsx`
    - `chat.tsx` — chat route wrapper (shared, accessed from any tab via `router.push('/chat')`)
  - `frontend/src/screens/` — actual screen components (imported by app/ routes): `ChatScreen.tsx`, `EarningsScreen.tsx`, `FeedScreen.tsx`, `InboxScreen.tsx`, `MatchesScreen.tsx`, `PipelineScreen.tsx`, `ProfileScreen.tsx`
  - `frontend/src/components/common/` — shared UI primitives (Button, Input, GlassCard, Badge, Tag, Avatar, StatCard, ErrorBoundary, FilterBar)
  - `frontend/src/theme/` — colors, typography, spacing tokens
  - `frontend/src/services/` — api client (`api.ts`), auth helpers (`auth.ts`), URL resolution (`baseUrl.ts`)
  - `frontend/src/hooks/` — useAuth, useFeed
- `frontend/packages/shared/` — Shared TypeScript types and Zod schemas (@refr/shared); local to frontend (no root monorepo)
<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: build-commands -->
## Commands

### Backend (run from `/Users/danusharun/Documents/refr-backend/`)
- `source .venv/bin/activate` — activate Python virtual environment
- `python manage.py runserver 8000` — start Django dev server
- `python manage.py migrate` — run database migrations
- `python manage.py seed_data` — populate database with test data
- `python manage.py createsuperuser` — create Django admin user
- `pytest -v` — run backend tests

### Frontend (run from `frontend/`)
- `npm run dev` — start Expo dev server
- `npm run typecheck` — TypeScript type check
- `npx expo start` — start Expo dev server

### Database
- `createdb refr` — create PostgreSQL database (one-time)
- `python manage.py migrate` — apply migrations
- `python manage.py seed_data` — seed with test data

### Test Accounts (after seeding)
- Seeker: `arjun@gmail.com` / `password123`
- Referrer: `ravi@razorpay.com` / `password123`
<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: backend-structure -->
## Backend Structure

Django 6.0 + Django REST Framework lives in the sibling repo
`/Users/danusharun/Documents/refr-backend/`, not in `Refer`:

```
refr-backend/
  src/core/            — Django project config and typed runtime config
  src/api/             — Django app: models, serializers, views, services
  src/api/migrations/  — database migrations
  tests/               — pytest suite
  requirements.txt     — Python dependencies
  .env                 — backend runtime environment
```

### Implemented API Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/users/register/` | none | Register user + create profile + return JWT |
| POST | `/api/token/` | none | JWT sign-in (returns tokens + user profile) |
| POST | `/api/token/refresh/` | none | Refresh JWT token |
| GET/PATCH | `/api/v1/users/me/` | required | Fetch/update full profile |
| GET | `/api/v1/feed` | required | Ranked, cursor-paginated feed (`?cursor&limit`) |
| POST | `/api/v1/feed/events/batch` | required | Ingest up to 50 behavior events |
| POST | `/api/v1/referrals/` | required | Create a referral request |
| GET | `/api/v1/referrals/inbox/` | required | Referrer's incoming requests (active statuses) |
| GET | `/api/v1/referrals/pipeline/` | required | Seeker's full referral pipeline |
| PATCH | `/api/v1/referrals/<id>/status/` | required | Advance referral state machine |
| GET | `/api/v1/chat/<referralId>/` | required | Fetch conversation + message history |
| POST | `/api/v1/chat/<conversationId>/messages/` | required | Send a message (1-4000 chars) |
| GET | `/api/v1/reputation/me/` | required | Endorser's own Endorsement Score profile |
| GET | `/api/v1/reputation/leaderboard/` | required | Global or company-scoped leaderboard (`?companyId`) |

### Database Models (Django ORM)

- `User` — extends AbstractUser; roles: `seeker` / `referrer`; `display_name`, `phone`, `avatar_url`
- `SeekerProfile` / `ReferrerProfile` — one-to-one with User; created during registration; `ReferrerProfile` tracks `kingmaker_score` (internal column name — surfaces as **Endorsement Score** in all UI/API consumers; do not say "Kingmaker" in copy), `successful_hires`, `total_referrals`, `verification_status`; `SeekerProfile.years_of_experience` enforces `min_value=0` in the serializer (negative values return 400)
- `Company` — upserted by name during referrer onboarding; `domain` field for email-based verification
- `ContentCard` — polymorphic via JSONB `payload`; types: `career_story`, `company_intel`, `referral_event`, `milestone`, `editorial`; `score` float; soft-deleted via `is_removed`; indexes on `type`, `is_removed`, `created_at`
- `Referral` — 8-state machine: `requested -> accepted -> submitted -> interviewing -> hired/rejected/withdrawn/expired`; auto-creates `Conversation` on creation; `unique_together = [('seeker', 'referrer', 'company')]` prevents duplicate referrals; indexes on `status`, `requested_at`
- `Conversation` / `Message` — one conversation per referral
- `BehaviorEvent` — feed analytics; fire-and-forget writes; indexes on `event_type`, `timestamp`
- `ModerationQueue` — soft-delete audit trail for flagged content

### Feed Ranking Algorithm (Phase 1, rule-based)

`refr-backend/src/api/views_feed.py` (`_compute_feed_score` function):
- **Recency** (weight 0.45): exponential decay, 12h half-life -- `2^(-ageHours/12)`
- **Relevance** (weight 0.35): role-aware; seekers use Jaccard skill similarity + target company match; referrers use seeker-targets-my-company signal
- **Popularity** (weight 0.20): log-normalised reaction count, saturates at 500 reactions
- Candidate pool: `POOL_MULTIPLIER=5`, `MAX_POOL_SIZE=200`; ranked in-process, not in SQL

### Auth Pattern

Django REST Framework + SimpleJWT:
1. `JWTAuthentication` extracts Bearer token from `Authorization` header
2. Validates JWT signature + expiry using Django's `SECRET_KEY`
3. Resolves to Django `User` object (available as `request.user`)
4. `CustomTokenObtainPairView` returns tokens + full user profile on sign-in
5. `register_user` creates User + Profile atomically (`transaction.atomic`) and returns JWT tokens
6. All config (SECRET_KEY, DATABASE_URL, CORS) via django-environ + python-dotenv; reads `refr-backend/.env` through `src/core/config.py` — no hardcoded credentials; missing `.env` raises `ImproperlyConfigured` at startup
- **JWT config**: `ACCESS_TOKEN_LIFETIME=15min`, `REFRESH_TOKEN_LIFETIME=7days`, `ROTATE_REFRESH_TOKENS=True`, `BLACKLIST_AFTER_ROTATION=True` (refresh tokens rotate and old tokens are blacklisted on use)
- **Rate limiting**: anon=30/min, user=120/min via DRF throttle classes

### Shared Package

`@refr/shared` (`frontend/packages/shared/`) -- shared TypeScript types and Zod schemas (used by frontend); declared as `"file:./packages/shared"` in `frontend/package.json`:
- `FeedCard` discriminated union, `FeedResponse`
- `SeekerProfile`, `ReferrerProfile`, `UserProfile`
- `SeekerPipelineItem`, `ReferrerInboxItem`, `Referral`
- `behaviorEventSchema`, `UserRole` enum, `ContentType` enum, `ReferralStatus`
<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: conventions -->
## Current Tech Stack

- **Mobile**: React Native 0.81.5 + Expo 54 + Expo Router 6.0.23 (TypeScript); React 19.1.0
- **Backend**: Django 6.0 + Django REST Framework + SimpleJWT in sibling repo `refr-backend`
- **Database**: PostgreSQL (local; production via Supabase AWS Mumbai)
- **Auth**: SimpleJWT (email + password); phone OTP planned for Phase 2
- **UI**: react-native-reanimated, moti (animation), react-native-edge-to-edge (SystemBars), expo-linear-gradient, expo-haptics; `GlassCard` is pure RN `View`+`StyleSheet` (borderless, no Skia) for Expo Go compatibility; `Ionicons` from `@expo/vector-icons` for all tab bar icons
- **Skia**: @shopify/react-native-skia present in package.json but not used in any screen or component; available for future canvas/drawing features only
- **Worklets**: react-native-worklets ^0.8.1
- **New arch**: `newArchEnabled: true` in app.json — all native deps must support React Native new architecture
- **Shared types**: @refr/shared (TypeScript, Zod validation)
- **AI**: Google Vertex AI + Gemini 2.5 Flash (resume parsing, optional); GCP credentials set via `GOOGLE_VERTEX_CREDENTIALS_JSON` (inline service account JSON string — not a file path); `VertexAIService.enabled` checked before every call — gracefully degrades to `{"error": ...}` dict when unconfigured; credentials loaded once at `__init__` via `_load_credentials()`
<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: patterns -->
## Architecture Decisions

- **Pattern**: Modular Monolith — one deployable unit with module boundaries (`users/`, `verification/`, `matching/`, `referrals/`, `chat/`, `payments/`, `shared/`)
- **Microservices**: Rejected — wrong for a one-person team; extract only when team grows to 3+ or a module becomes a bottleneck
- **ML**: No ML in Phase 1-2; use rule-based matching and hardcoded scoring formulas; introduce OpenAI API embeddings in Phase 3 only after 500+ labeled outcomes
- **Resume parsing**: Implemented via `VertexAIService` (`refr-backend/src/api/services/vertex_ai.py`) using Gemini 2.5 Flash — optional, gracefully degraded; original plan referenced Codex API but Vertex AI is what is built
- **Search**: PostgreSQL full-text search for MVP; defer Elasticsearch until search p95 > 1s
- **Chat**: Supabase Realtime for MVP; migrate to dedicated store only if chat table exceeds 10M rows; partition chat table by month from day one
- **Async jobs**: BullMQ for referral state machine fan-out and notifications
- **Leaderboards**: Pre-compute in scheduled jobs, store in Redis sorted sets — never aggregate live
- **Feed ranking**: Rule-based in Phase 1-2 (recency 0.45, relevance 0.35, popularity 0.20); fetch oversized pool (5x limit, max 200) from DB, rank in-process — do not move ranking into SQL
- **Analytics events**: Fire-and-forget (`void EventsService.logEvent(...)`) — analytics must never delay API response or cause user-visible failure
- **Prisma singleton**: Store on `globalThis.__prisma` to survive tsx hot reloads in dev; guards against connection pool exhaustion
- **Content payload**: Polymorphic JSONB on `ContentCard.payload`; discriminated by `type` enum; validated at application layer, not DB layer

## Frontend Patterns

- **Routing**: Expo Router file-based — `frontend/app/` files are thin one-liner route wrappers; all real screen logic lives in `frontend/src/screens/`; route groups use `(group-name)/` convention
- **Screen component layer**: `src/screens/` holds full screen implementations (ChatScreen, EarningsScreen, FeedScreen, InboxScreen, MatchesScreen, PipelineScreen, ProfileScreen); `app/` route files import and re-export them — never put business logic in `app/` files
- **Chat navigation**: use `router.push({ pathname: '/chat', params: { referralId, participantName, participantAvatar } })` — path is lowercase `/chat`, not `/Chat`
- **Chat screen** (`src/screens/ChatScreen.tsx`): calls `chatApi.subscribeToMessages(referralId, cb)` on mount (uses `referralId`, not `conversationId`), calls `sub.unsubscribe()` on unmount; optimistic send — append temp message with `id: temp-${Date.now()}` immediately, replace with server response on success, roll back + restore draft on failure
- **Earnings screen** (`src/screens/EarningsScreen.tsx`): parallel fetches via `Promise.all([getReputation(), getLeaderboard()])`; **Endorsement Score** hero in JetBrains Mono at 72px; leaderboard top 20; medal symbols ★ ✦ ◆ for ranks 1-3; score rules: +2 per endorsement submitted, +10 per confirmed hire, -1/week after 2+ weeks inactive. Display label is "Endorsement Score" — never "Kingmaker".
- **Shared package resolution**: `frontend/metro.config.js` maps `@refr/shared` via `extraNodeModules` to `frontend/packages/shared`; watches `frontend/packages/shared` only — no root `node_modules` or monorepo references (not a monorepo; root `package.json` and `node_modules/` deleted)
- **Auth navigation**: unauthenticated entry redirects to `/(auth)/login`; after `signInWithEmail`, `useAuth` detects session change via event emitter and redirects automatically — no explicit `router.push` after sign-in; "Create account" on login goes to `/(auth)/role-selection`
- **Auth onboarding**: `app/(auth)/profile-setup.tsx` reads `role` param via `useLocalSearchParams`; single component handles both seeker and referrer forms; navigation after signup is driven by session state change, not explicit `router.push`
- **Base URL resolution** (`src/services/baseUrl.ts`): exports `BASE_URL` constant resolved at module load; priority order: (1) `Constants.expoConfig.extra.apiBaseUrl` if set and not `127.0.0.1`, (2) LAN IP from Expo `hostUri`/`debuggerHost` in `__DEV__`, (3) Android emulator `10.0.2.2:8000`, (4) `127.0.0.1:8000`; both `api.ts` and `auth.ts` import from here — do not inline URL logic in those files; `app.json extra` is now empty (`{}`), URL resolution is fully self-contained in `baseUrl.ts`
- **API client** (`src/services/api.ts`): JWT auto-refresh on 401 — calls `/api/token/refresh/` then retries; `isRefreshing` flag + `refreshPromise` deduplicates concurrent refresh calls; `ChatMessage`, `ReputationData`, `LeaderboardEntry` interfaces exported from `api.ts` — do not redefine locally in screens; `profileApi` exported: `getMe()` → GET `/api/v1/users/me/`, `updateMe(data)` → PATCH `/api/v1/users/me/`; `ApiError` class exported with `status`, `message`, `body`
- **Chat message delivery** (`chatApi.subscribeToMessages`): takes `referralId` (not `conversationId`) as first argument; polls every 3 seconds, tracks `lastMessageId`, slices only new messages per poll; returns `{ unsubscribe }` — call on unmount to clear interval; Supabase Realtime WebSocket is the planned replacement — do not assume it is active
- **Error boundary**: `ErrorBoundary` class component in `src/components/common/ErrorBoundary.tsx` wraps entire app in `_layout.tsx`; renders "Something went wrong" with Try Again reset button
- **Font loading**: `_layout.tsx` calls `useFonts` to load all 8 variants (Outfit 400/500/600/700, InstrumentSerif regular/italic, JetBrainsMono 400/500); `SplashScreen.preventAutoHideAsync()` holds splash until fonts ready or error — render nothing until then
- **Form pattern**: Single state object per role (`SeekerForm` / `ReferrerForm`); named change handler via `useCallback` with signature `(name: string, value: string) => void`; use `Input` prop `onChangeValue` (not `onChangeText`) for named fields
- **Input component** (`src/components/common/Input.tsx`): animated floating label; `onChangeValue(name, value)` fires alongside `onChangeText`; `clearable` prop adds × button; container has **no built-in marginBottom** — parent must provide spacing (use `gap: spacing[N]` on the form `View`)
- **Comma-separated fields**: parse at submit time with `.split(',').map(s => s.trim()).filter(Boolean)` — store raw string in form state, convert to array only on API call
- **KeyboardAvoidingView**: auth screens — iOS `behavior="padding"`, Android `behavior={undefined}`; ChatScreen — iOS `behavior="padding"`, Android `behavior="height"`; always add `nestedScrollEnabled`, `keyboardDismissMode="interactive"` on inner `ScrollView`
- **Active Referrals screen** (`(referrer-tabs)/active.tsx`): filters `referralsApi.getInbox()` to statuses `accepted | submitted | interviewing | hired`; statuses `requested` and terminal states are shown only in Inbox. Page-local `FilterBar` exposes a stage filter (All / Matched / Submitted / Interviewing / Hired). Pending / Earned / In flight stat tiles live on the Earnings tab — not here.
- **Filter UI consistency**: every list page (Discover, Matches, Pipeline, Endorser Discover, Endorser Inbox, Active) renders `FilterBar` from `src/components/common/FilterBar.tsx`. Earnings and Profile have no filters by design. Each screen owns its own filter axis (status, company, experience, stage) but the chip language is identical — quiet outline chips, elevated active state, optional count badge, dim when count = 0.
- **Tab bar icons**: both tab layouts use `Ionicons` from `@expo/vector-icons`; each tab passes `({ color, focused }) => <Ionicons name={focused ? 'icon' : 'icon-outline'} size={24} color={color} />` — seeker: compass/heart/git-branch/person; referrer: mail/people/trophy/person; `hapticSelection()` called via `listeners={{ tabPress: () => hapticSelection() }}` on every tab; tab bar style: `borderTopWidth: 0`, `elevation: 0`, height 84, paddingBottom 28
- **Card backgrounds**: use `colors.surfaceLevel1` (`rgba(255,255,255,0.04)`) for standard cards, `colors.surfaceLevel2` (`rgba(255,255,255,0.07)`) for elevated cards, `colors.surfaceInset` (`rgba(255,255,255,0.03)`) for inset/nested surfaces — never hardcode rgba values for card backgrounds
- **useFeed pagination** (`src/hooks/useFeed.ts`): `fetchPage` deduplicates on append — builds `Set` of existing card IDs from `prev` state, filters incoming `response.cards` to only unseen IDs before spreading; deduplication runs inside the `setCards` functional updater (not outer scope) so it always operates on the latest state; on refresh (`isRefresh === true`) deduplication is skipped and list is replaced wholesale; guards against concurrent calls via `fetchingRef`
<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: design-system -->
## Design System

- **Visual style**: Dark premium, glass-morphism — #0a0a0f background, violet #7c3aed accent (used sparingly for CTAs and active states only)
- **Typography**: Instrument Serif (headings/editorial), Outfit (body/UI), JetBrains Mono (stats/numbers/earnings)
- **Platform frame**: iPhone 14 Pro (393x852pt); React Native mobile-first; touch targets minimum 44pt
- **Visual tone references**: CRED (dark glass-morphism, whitespace), Tinder (swipe card stack), PhonePe/GPay (payment screens), WhatsApp (chat layout) — do NOT reference LinkedIn or Naukri
- **Figma file key**: V2Hi4ENOtbntTaYWWGd8QF; scripts run via Figma Scripter plugin
- **11 screens + 2 modals**: Splash, Role Selection, Profile Setup, Discover/Swipe Stack, Referrer Full Profile (modal), Request Confirmation (modal), Matches/Inbox, Chat, Pipeline Tracker, Earnings Dashboard, Profile/Settings
- **Seeker tab bar**: Discover / Matches / Pipeline / Profile
- **Referrer tab bar**: Inbox / Active / Earnings / Profile
- **Figma build status**: Screens 01 (Splash), 02 (Role Selection), 04 (Discover) complete; screens 03, 05-11 pending script execution
- **Key component specs**: defined in `docs/plans/REFR-Designer-Brief.md` (glass-morphism cards, buttons, tags, badges, input fields, chat bubbles, pipeline stepper, stat cards)
- **GlassCard** (`src/components/common/GlassCard.tsx`): pure RN `View`, borderless (`borderWidth: 0`), `backgroundColor: colors.surfaceLevel1`; props: `padding` (`none`|`small`|`default`|`large`), `accentBorder` (string — adds 1px border in that color), `square` (removes border radius), `style`
- **StatCard** (`src/components/common/StatCard.tsx`): value-above-label layout — value in JetBrains Mono 28px first, label in uppercase Outfit 11px below, optional `subLabel`; `valueColor` prop overrides value color; `StatRow` helper wraps multiple cards in a flex row with gap; no border, uses `surfaceLevel1` background
- **Avatar** (`src/components/common/Avatar.tsx`): sizes `xs`/`sm`/`md`/`lg`/`xl`; falls back to initials monogram with deterministic background color (8-color palette: indigo, violet, pink, rose, teal, cyan, orange, lime) hashed from `displayName`; `verificationRing` adds 2px violet border ring; `online` adds green dot indicator in bottom-right corner
<!-- END AUTO-MANAGED -->

<!-- AUTO-MANAGED: git-insights -->
## Key Constraints and Risks

- Do NOT add seeker premium subscription (499-1,999 INR/month) to Phase 1-2 — this repeats Round One's fatal mistake
- Apply for Razorpay Route early (approval takes 2-4 weeks)
- DigiLocker integration requires government API approval (takes months); do not put on critical path
- 9-checkpoint verification is a cold-start risk — each checkpoint is a drop-off point; classify as automated/semi-automated/manual before building
- Employer SaaS dashboard is 18-24 months away; do not treat as near-term revenue

## Implementation Phases

- **Phase 1** (weeks 1-4): Infra + auth + profiles + swipe + chat; exit when one live referral submitted
- **Phase 2** (weeks 5-14): Payments + verification + analytics + App Store; exit when 10 hire-payout loops completed
- **Phase 3** (months 4-9): AI matching + trust score + gamification + scale (hire 2 devs, 1 community manager)
- **Phase 4** (months 10-18): Employer SaaS + ATS integration (use Merge.dev) + API platform
<!-- END AUTO-MANAGED -->
