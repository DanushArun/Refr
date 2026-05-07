# REFR

**Professional Intelligence Platform** -- a content-first feed where the natural
social action is submitting job referrals. Employer-monetised.

REFR combines insider career content (company intelligence, career stories) with
a referral workflow that connects job seekers to verified employees at top tech
companies. Referrals aren't a task; they're the social action within a
doom-scroll feed of insider knowledge.

## Why REFR exists

Referrals account for only 7% of applications but produce 30--50% of hires.
They're 5x more likely to result in a hire, 55% faster to close, and save
companies $3K--$7.5K per placement. Yet no platform in India combines trust
verification, AI matching, swipe UX, gamification, and INR/UPI payments.

REFR fills that gap.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.81 + Expo 54 + Expo Router 6 (TypeScript) |
| Backend | Django 6.0 + Django REST Framework + SimpleJWT (Python) |
| Database | PostgreSQL (local dev; Supabase AWS Mumbai in production) |
| Auth | JWT (email + password); phone OTP planned for Phase 2 |
| UI/Graphics | @shopify/react-native-skia, react-native-reanimated 4 |
| Shared types | @refr/shared (TypeScript + Zod validation) |
| AI | Google Vertex AI + Gemini 2.5 Flash (resume parsing) |
| Monorepo | npm workspaces (`packages/*`, `frontend`) |

## Project structure

```
refr/
  backend/                  Django REST API
    refr_api/               Django project config (settings, urls)
    api/
      models.py             ORM models (User, Referral, ContentCard, ...)
      views.py              API views (auth, feed, referrals, chat, reputation)
      serializers.py        DRF serializers
      services/
        vertex_ai.py        Resume parsing via Google Gemini
      management/commands/
        seed_data.py        Seed database with test data
      tests/                pytest test suite
    requirements.txt        Python dependencies

  frontend/                 Expo / React Native app
    app/                    Expo Router file-based routes
      (auth)/               Login, role selection, profile setup
      (seeker-tabs)/        Discover, Matches, Pipeline, Profile
      (referrer-tabs)/      Inbox, Active, Earnings, Profile
      chat.tsx              Shared chat screen
    src/
      components/
        common/             Button, Input, GlassCard, Avatar, Badge, Tag, StatCard
        feed/               CareerStoryCard, CompanyIntelCard, FeedList, ...
      screens/              Full-screen views (FeedScreen, ChatScreen, ...)
      hooks/                useAuth, useFeed
      services/             API client (with token refresh), auth (AsyncStorage)
      theme/                colors, typography, spacing tokens
    app.json                Expo configuration
    metro.config.js         Monorepo-aware Metro config

  packages/shared/          @refr/shared -- shared between frontend modules
    src/
      constants/            UserRole, ReferralStatus, ContentType
      types/                User, Content, Feed, Referral type definitions
      schemas/              Zod validation schemas

  docs/plans/               System design, app flow, designer brief, Figma scripts
  package.json              Root monorepo config (npm workspaces)
  tsconfig.base.json        Shared TypeScript config
```

## Getting started

### Prerequisites

- **Node.js** 20+ and npm
- **Python** 3.12+
- **PostgreSQL** 14+
- **Expo CLI**: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator, or Expo Go on a physical device

### 1. Clone and install

```bash
git clone <repo-url> && cd refr
npm install                # installs frontend + shared package deps
```

### 2. Set up the database

```bash
createdb refr
```

### 3. Set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data   # populates test data
```

### 4. Start the backend

```bash
cd backend
source venv/bin/activate
python manage.py runserver 8000
```

### 5. Start the frontend

```bash
# from project root
npm run dev
```

Or directly:

```bash
cd frontend
npx expo start
```

### Test accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Seeker | `danush@gmail.com` | `password123` |
| Referrer | `nivrant@razorpay.com` | `password123` |

## API reference

All authenticated endpoints require `Authorization: Bearer <token>`.

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/users/register/` | Register + create profile + return JWT |
| POST | `/api/token/` | Sign in (returns tokens + user profile) |
| POST | `/api/token/refresh/` | Refresh access token |

### User profile

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/users/me/` | Fetch full profile |
| PATCH | `/api/v1/users/me/` | Update profile fields |

### Feed

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/feed?cursor=&limit=` | Ranked, cursor-paginated feed |
| POST | `/api/v1/feed/events/batch` | Ingest up to 50 behavior events |

### Referrals

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/referrals/` | Create a referral request |
| GET | `/api/v1/referrals/inbox/` | Referrer's incoming requests |
| GET | `/api/v1/referrals/pipeline/` | Seeker's referral pipeline |
| PATCH | `/api/v1/referrals/<id>/status/` | Advance referral state machine |

### Chat

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/chat/<referralId>/` | Fetch conversation + messages |
| POST | `/api/v1/chat/<conversationId>/messages/` | Send a message (1--4000 chars) |

### Reputation

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/reputation/me/` | Referrer's Kingmaker profile |
| GET | `/api/v1/reputation/leaderboard/?companyId=` | Global or company leaderboard |

## Data model

Core entities and their relationships:

```
User (seeker | referrer)
  |-- SeekerProfile   (skills, target companies/roles, resume)
  |-- ReferrerProfile  (company, department, kingmaker score, verification)

Company (name, domain, logo)

ContentCard (type: career_story | company_intel | referral_event | milestone | editorial)
  |-- payload (JSONB, discriminated by type)

Referral (8-state machine)
  requested -> accepted -> submitted -> interviewing -> hired
                                                     -> rejected
                                     -> withdrawn (any active state)
                          -> expired
  |-- Conversation
        |-- Message[]

BehaviorEvent (feed analytics, fire-and-forget)
```

## Feed ranking (Phase 1, rule-based)

The feed fetches an oversized candidate pool (5x requested limit, max 200 cards)
and scores each card in-process:

| Signal | Weight | Formula |
|--------|--------|---------|
| Recency | 0.45 | `2^(-age_hours / 12)` -- 12h half-life |
| Relevance | 0.35 | Jaccard skill similarity (seekers) or company match (referrers) |
| Popularity | 0.20 | `log(1 + min(reactions, 500)) / log(501)` |

## Design system

- **Visual style**: Dark premium, glass-morphism (`#0a0a0f` background, violet
  `#7c3aed` accent for CTAs only)
- **Typography**: Instrument Serif (headings), Outfit (body/UI), JetBrains Mono
  (stats/numbers)
- **Platform frame**: iPhone 14 Pro (393x852pt), 44pt minimum touch targets
- **Visual references**: CRED (glass-morphism), Tinder (swipe stack),
  PhonePe/GPay (payments), WhatsApp (chat)

## Navigation

**Seeker tabs**: Discover | Matches | Pipeline | Profile

**Referrer tabs**: Inbox | Active | Earnings | Profile

Both roles share a `/chat` screen accessed via `router.push`.

## Architecture decisions

| Decision | Rationale |
|----------|-----------|
| Modular monolith | Right for a one-person team; extract modules when team hits 3+ |
| No ML until Phase 3 | Rule-based matching first; introduce embeddings after 500+ labeled outcomes |
| Cursor pagination | Avoids offset drift on live feeds |
| JSONB content payloads | Polymorphic feed cards without table-per-type overhead |
| Fire-and-forget analytics | Analytics must never delay API response or cause user-visible failure |
| PostgreSQL full-text search | Defer Elasticsearch until search p95 > 1s |

## Development

### Available commands

```bash
# Frontend
npm run dev              # Start Expo dev server
npm run typecheck        # TypeScript type check

# Backend (from backend/, with venv active)
python manage.py runserver 8000
python manage.py migrate
python manage.py seed_data
python manage.py createsuperuser
pytest -v                # Run backend tests
```

### Backend testing

```bash
cd backend
source venv/bin/activate
pytest -v
```

### Type checking

```bash
npm run typecheck
```

## Phases

| Phase | Timeline | Goal |
|-------|----------|------|
| 1 | Weeks 1--4 | Infra + auth + profiles + swipe + chat; one live referral |
| 2 | Weeks 5--14 | Payments + verification + analytics + App Store; 10 hire-payout loops |
| 3 | Months 4--9 | AI matching + trust score + gamification + scale |
| 4 | Months 10--18 | Employer SaaS + ATS integration + API platform |

## Key constraints

- Do NOT charge seekers in Phase 1--2 (avoids Round One's fatal mistake)
- Razorpay Route approval takes 2--4 weeks; apply early
- DigiLocker integration requires government API approval; not on critical path
- 9-checkpoint verification is a cold-start risk; classify each checkpoint as
  automated/semi-automated/manual before building

## Economics

Per successful hire:

```
Company bonus:    Rs 50,000
Referrer payout:  Rs 40,000 (80%)
Platform commission: Rs 10,000 (20%)
Employer success fee: Rs 12,000
---------------------------------
Platform revenue:    Rs 22,000 / hire
```

## License

Proprietary. All rights reserved.
