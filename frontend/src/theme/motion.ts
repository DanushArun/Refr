import { Easing } from 'react-native-reanimated';

/**
 * Single source of truth for animation timings, springs, and easings.
 *
 * Use these constants instead of inlining `withSpring(value, { damping: ... })`
 * configs everywhere — that scattered tuning is what makes one screen feel
 * crisp and the next feel mushy. Pick the closest semantic preset and import.
 *
 * Three spring families cover ~95% of cases:
 *
 *   SPRING_SNAPPY — UI feedback (press, drag-cancel, modal back-snap).
 *                   Reaches rest fast, no overshoot. Think iOS button release.
 *
 *   SPRING_SOFT   — Content motion (cards advancing, deck promotions, ship
 *                   sailing across stages). Glides in, settles smoothly.
 *
 *   SPRING_BOUNCY — Celebrations / arrivals (seal stamp, achievement reveal).
 *                   Slight overshoot for delight. Use sparingly.
 *
 * For non-spring transitions (fades, opacity, simple progress) prefer
 * withTiming + one of TIMING_* + EASE_OUT_CUBIC.
 */

// ─── Springs ─────────────────────────────────────────────────────────────
export const SPRING_SNAPPY = {
  stiffness: 320,
  damping: 26,
  mass: 0.8,
} as const;

export const SPRING_SOFT = {
  stiffness: 90,
  damping: 16,
  mass: 0.95,
} as const;

export const SPRING_BOUNCY = {
  stiffness: 220,
  damping: 9,
  mass: 0.7,
  overshootClamping: false,
} as const;

// ─── Timings (ms) ────────────────────────────────────────────────────────
/** Tap echoes, micro feedback. */
export const TIMING_FAST = 180;
/** Standard interactions — modal open/close, card morph. */
export const TIMING_BASE = 280;
/** Reveals — hero fade-in, seal celebration envelope. */
export const TIMING_SLOW = 480;

// ─── Easings ─────────────────────────────────────────────────────────────
/** Default exit/leave easing — most natural feel for outbound motion. */
export const EASE_OUT_CUBIC = Easing.out(Easing.cubic);
/** For accelerating motion that lands off-screen (swipe-out, fly-off). */
export const EASE_IN_QUAD = Easing.in(Easing.quad);
/** Symmetric slow-fast-slow — orbital animations, breathing loops. */
export const EASE_IN_OUT_SIN = Easing.inOut(Easing.sin);

// ─── Press feedback (RN Pressable scale/opacity) ─────────────────────────
/** The canonical pressed-state transform. Apply via Pressable's
 *  `style={({ pressed }) => [base, pressed && PRESS_STATE]}`. */
export const PRESS_STATE = {
  opacity: 0.85,
  transform: [{ scale: 0.97 }],
} as const;

/** Stronger pressed-state for primary CTAs that should feel weighty. */
export const PRESS_STATE_STRONG = {
  opacity: 0.9,
  transform: [{ scale: 0.94 }],
} as const;
