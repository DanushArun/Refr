# Phase 2: Liquid UX & Aesthetics

## Overview
This phase introduces the "Liquid Realism" standard to the REFR application, targeting the 2026-2028 elite consumer aesthetic. It focuses on three core pillars: React Native Skia for high-performance frosted glass refraction, Reanimated 4 for Shared Element Transitions (SET), and comprehensive haptic feedback.

## 1. Skia Frosted Glass (Apple-Style)
We will rebuild the `GlassCard` component using `@shopify/react-native-skia` to guarantee native-level GPU rendering at 120fps.

**Architecture:**
- **Component:** `frontend/src/components/common/GlassCard.tsx`
- **Implementation:** Utilize Skia's `<BackdropFilter>` with a `<Blur>` filter (radius ~10-15 for a subtle effect).
- **Overlay:** Apply a very low-opacity white/dark noise or linear gradient overlay within the Skia `<Canvas>` to create the physical "glass" texture.
- **Fallback:** Ensure graceful degradation or safe rendering if Skia context fails to mount, though Fabric should support it natively.
- **Integration:** Feed cards (`CareerStoryCard`, `CompanyIntelCard`) will wrap their content in this new `GlassCard` to inherit the refraction effect.

## 2. Haptic Feedback Integration
Every significant interaction must have a corresponding physical response to make the UI feel "alive."

**Architecture:**
- **Library:** `expo-haptics`
- **Utility:** Create a wrapper `frontend/src/utils/haptics.ts` to standardize the feedback types.
- **Implementation Points:**
  - Tab switching: `selectionAsync()`
  - Button presses (Primary CTA): `impactAsync(ImpactFeedbackStyle.Light)`
  - Destructive actions (Decline request): `notificationAsync(NotificationFeedbackType.Warning)`
  - Success actions (Referral sent): `notificationAsync(NotificationFeedbackType.Success)`

## 3. Shared Element Transitions (SET)
Transitioning between the feed and detailed views should feel continuous, not like pushing a new screen.

**Architecture:**
- **Library:** `react-native-reanimated` (v3/v4 SET API)
- **Implementation:**
  - When tapping a `CareerStoryCard` or `CompanyIntelCard`, the avatar, name, and headline should use `sharedTransitionTag`.
  - The destination screen (e.g., a new `StoryDetailScreen` or `IntelDetailScreen`, if implemented, or the existing `ProfileScreen`) will have matching `sharedTransitionTag` identifiers.
  - *Note:* Since the current feed relies on a bottom sheet modal for referrals, we will primarily target SET for avatar taps navigating to the `ProfileScreen` or expanding feed cards if a detail view is introduced.

## Execution Order
1. Implement the `GlassCard` Skia rewrite and verify performance on the simulator.
2. Implement the `haptics.ts` utility and inject it into the `Button`, `Tabs`, and `FeedList` components.
3. Set up the `sharedTransitionTag` logic between the feed and profile screens using Reanimated.
