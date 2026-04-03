/**
 * REFR Design System — Spacing
 *
 * 4px base grid. All spacing values are multiples of 4.
 * Min touch target: 44pt (iOS HIG standard).
 */

export const spacing = {
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,   // Minimum touch target
  12: 48,
  14: 56,
  16: 64,
  18: 72,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
} as const;

export const layout = {
  screenPaddingH: spacing[5],       // 20 — horizontal screen padding
  screenPaddingV: spacing[6],       // 24 — vertical screen padding
  cardPadding: spacing[5],          // 20 — internal card padding
  cardBorderRadius: 16,
  cardBorderRadiusLarge: 24,
  buttonHeight: spacing[12],        // 48 — standard button height
  buttonHeightSmall: spacing[9],    // 36
  inputHeight: spacing[12],         // 48
  tabBarHeight: 64,
  headerHeight: 56,
  touchTargetMin: spacing[11],      // 44 — iOS HIG minimum
} as const;
