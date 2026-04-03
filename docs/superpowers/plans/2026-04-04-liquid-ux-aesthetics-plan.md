# Phase 2: Liquid UX & Aesthetics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Skia-based frosted glass, comprehensive haptics, and Reanimated 4 Shared Element Transitions to achieve the Liquid Realism aesthetic.

**Architecture:** 
1. `GlassCard` will be rewritten using `@shopify/react-native-skia` with `<BackdropFilter>` and `<Blur>`.
2. A new `haptics.ts` utility will wrap `expo-haptics` and be integrated into interactive components.
3. Feed items will utilize `sharedTransitionTag` from `react-native-reanimated`.

**Tech Stack:** React Native Skia, Reanimated 4, Expo Haptics, React Native.

---

### Task 1: Setup Haptics Utility

**Files:**
- Create: `frontend/src/utils/haptics.ts`

- [ ] **Step 1: Install expo-haptics**
  Run: `cd frontend && npx expo install expo-haptics`
  Expected: Installation succeeds.

- [ ] **Step 2: Create haptics utility**
  Create `frontend/src/utils/haptics.ts` exporting functions `hapticSelection()`, `hapticImpact(style)`, `hapticNotification(type)` wrapping `expo-haptics` methods. Include a platform check so it doesn't crash on web/unsupported platforms if ever used there.

- [ ] **Step 3: Commit**
  Run: `git add frontend/src/utils/haptics.ts frontend/package.json`
  Run: `git commit -m "feat: add haptics utility"`

### Task 2: Implement Skia GlassCard

**Files:**
- Modify: `frontend/src/components/common/GlassCard.tsx`

- [ ] **Step 1: Rewrite GlassCard with Skia**
  Replace standard React Native `View` with Skia components. Ensure `children` are rendered on top of the Skia canvas.
  *Note:* You may need to use `react-native-blur` or structure the Skia canvas as an absolute positioned layer behind the children, because Skia's `Canvas` itself doesn't typically accept React Native children directly inside it in a way that applies the filter to the background, unless you use `BackdropFilter` correctly. Wait, actually, standard RN Skia `BackdropFilter` works by placing it absolute-filled over the background, but under the content.

- [ ] **Step 2: Typecheck**
  Run: `cd frontend && npm run typecheck`

- [ ] **Step 3: Commit**
  Run: `git add frontend/src/components/common/GlassCard.tsx`
  Run: `git commit -m "feat: rewrite GlassCard using Skia BackdropFilter"`

### Task 3: Inject Haptics

**Files:**
- Modify: `frontend/src/components/common/Button.tsx`
- Modify: `frontend/app/(seeker-tabs)/_layout.tsx`
- Modify: `frontend/app/(referrer-tabs)/_layout.tsx`

- [ ] **Step 1: Button Haptics**
  In `Button.tsx`, add `hapticImpact('light')` to the `onPress` handler before calling the provided `onPress` prop.

- [ ] **Step 2: Tab Haptics (Seeker)**
  In `_layout.tsx`, add a listener for `tabPress` to trigger `hapticSelection()`.

- [ ] **Step 3: Tab Haptics (Referrer)**
  In `_layout.tsx`, add a listener for `tabPress` to trigger `hapticSelection()`.

- [ ] **Step 4: Commit**
  Run: `git add frontend/src/components/common/Button.tsx frontend/app/\(seeker-tabs\)/_layout.tsx frontend/app/\(referrer-tabs\)/_layout.tsx`
  Run: `git commit -m "feat: inject haptics into buttons and tabs"`

### Task 4: Prepare Shared Element Transitions

**Files:**
- Modify: `frontend/src/components/feed/CareerStoryCard.tsx`
- Modify: `frontend/src/components/common/Avatar.tsx`

- [ ] **Step 1: Wrap Avatar with Animated.View**
  In `Avatar.tsx`, change `View` or `Image` to `Animated.Image` from `react-native-reanimated` if it needs a `sharedTransitionTag`. Pass the tag as a prop.

- [ ] **Step 2: Apply Tags in Feed**
  In `CareerStoryCard.tsx`, pass a unique `sharedTransitionTag` (e.g., `avatar-${card.id}`) to the Avatar.

- [ ] **Step 3: Commit**
  Run: `git add frontend/src/components/common/Avatar.tsx frontend/src/components/feed/CareerStoryCard.tsx`
  Run: `git commit -m "feat: prepare shared element transition tags"`
