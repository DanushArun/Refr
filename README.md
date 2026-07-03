# Endorsly (codebase: REFR)

**Professional Intelligence Platform for India** -- a content-first feed where
the natural social action is submitting job endorsements. Employer-monetised.

Endorsly combines insider career content (company intelligence, career stories)
with an endorsement workflow that connects job seekers (Seekers) to verified
employees (Endorsers) at Indian tech companies. The app is pan-India: a Seeker
can be endorsed for any role anywhere in India, gated only by job-market
availability. Endorsements aren't a task; they're the social action within a
doom-scroll feed of insider knowledge.

> **Naming note:** the public product is **Endorsly** and copy uses
> *Endorsement / Endorser / Seeker / Endorsement Score*. The codebase is
> historically named **REFR** and internal data-model identifiers
> (`Referral`, `referrer`, `kingmaker_score`) reflect that. Do not use
> "Kingmaker" in any user-facing surface — that term is retired.

## Why Endorsly exists

Referrals account for only 7% of applications but produce 30--50% of hires.
They're 5x more likely to result in a hire, 55% faster to close, and save
companies $3K--$7.5K per placement. Yet no platform in India combines trust
verification, AI matching, swipe UX, gamification, and INR/UPI payments.

Endorsly fills that gap.

## Tech stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.81 + Expo 54 + Expo Router 6 (TypeScript) |
| Backend API | Separate repo: `../refr-backend` |
| Database | Owned by `../refr-backend` |
| Auth | JWT (email + password); phone OTP planned for Phase 2 |
| UI/Graphics | @shopify/react-native-skia, react-native-reanimated 4 |
| Shared types | `frontend/packages/shared` (`@refr/shared`) |
| AI | Owned by `../refr-backend` |
| Repo boundary | This repo is frontend-only. Do not add `backend/` here. |

## Project structure

```
Refer/
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
    metro.config.js         Metro config

  docs/plans/               System design, app flow, designer brief, Figma scripts

../refr-backend/            Django REST API, database models, migrations, tests
```

## Getting started

### Prerequisites

- **Node.js** 20+ and npm
- **Expo CLI**: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator, or Expo Go on a physical device
- Optional for full-stack local work: backend repo at `../refr-backend`

### 1. Clone and install

```bash
git clone <frontend-repo-url> Refer
cd Refer/frontend
npm install
```

### 2. Set up the backend repo

```bash
cd ../refr-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_data   # populates test data
```

### 3. Start the backend

```bash
cd ../refr-backend
source .venv/bin/activate
python manage.py runserver 8000
```

### 4. Start the frontend

```bash
cd ../Refer/frontend
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

## Backend API

Backend code, migrations, database models, API tests, and backend `.env` files
belong only in `../refr-backend`.

This frontend consumes the backend through `frontend/src/services/api.ts` and
uses `EXPO_PUBLIC_API_BASE_URL` from `.env` when a non-default API URL is needed.

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
cd frontend
npm run dev              # Start Expo dev server
npm run typecheck        # TypeScript type check

# Backend lives in ../refr-backend
cd ../refr-backend
source .venv/bin/activate
python manage.py runserver 8000
python manage.py migrate
python manage.py seed_data
pytest -v                # Run backend tests
```

### Type checking

```bash
cd frontend
npm run typecheck
```

## Phases

| Phase | Timeline | Goal |
|-------|----------|------|
| 1 | Weeks 1--4 | Infra + auth + profiles + swipe + chat; one live endorsement |
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
