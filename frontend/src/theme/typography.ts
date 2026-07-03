/**
 * Endorsly Design System - Typography
 *
 * Cabinet Grotesk - Awwwards-listed accent for product titles
 * IBM Plex Serif  - After Hours editorial and detonation moments
 * TikTok Sans     - product UI, settings, lists, navigation, chat, forms
 * Geist Mono      - numbers, stats, payouts, ranks, Endorsement Score
 *
 * Legacy "Outfit-*" and "InstrumentSerif-*" aliases remain in app/_layout.tsx.
 * They intentionally resolve to non-bold weights to keep the app light.
 */

export const fontFamilies = {
  heading: 'CabinetGrotesk-Regular',
  headingMedium: 'CabinetGrotesk-Medium',
  headingItalic: 'CabinetGrotesk-Regular',
  body: 'TikTokSans-Regular',
  bodyMedium: 'TikTokSans-Medium',
  bodySemiBold: 'TikTokSans-Semibold',
  bodyBold: 'TikTokSans-Semibold',
  serif: 'IBMPlexSerif-Regular',
  serifMedium: 'IBMPlexSerif-Medium',
  mono: 'GeistMono-Regular',
  monoMedium: 'GeistMono-Medium',
} as const;

export const fontSizes = {
  // Display — splash screen, hero moments
  display: 40,
  // Headings
  h1: 32,
  h2: 26,
  h3: 22,
  h4: 18,
  // Body
  bodyLarge: 17,
  body: 15,
  bodySmall: 13,
  // Labels and captions
  label: 12,
  caption: 11,
  // Mono stat displays
  statLarge: 28,
  statMedium: 20,
  statSmall: 14,
} as const;

export const lineHeights = {
  display: 48,
  h1: 40,
  h2: 34,
  h3: 30,
  h4: 26,
  bodyLarge: 26,
  body: 22,
  bodySmall: 20,
  label: 18,
  caption: 16,
  statLarge: 36,
  statMedium: 28,
  statSmall: 20,
} as const;

export const letterSpacings = {
  tight: 0,
  normal: 0,
  wide: 0,
  wider: 0,
  mono: 0,
} as const;

export const typography = {
  display: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.display,
    lineHeight: lineHeights.display,
    letterSpacing: letterSpacings.tight,
  },
  detonationDisplay: {
    fontFamily: fontFamilies.serifMedium,
    fontSize: 58,
    lineHeight: 62,
    letterSpacing: letterSpacings.normal,
  },
  h1: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.h1,
    lineHeight: lineHeights.h1,
    letterSpacing: letterSpacings.tight,
  },
  h2: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.h2,
    lineHeight: lineHeights.h2,
    letterSpacing: letterSpacings.tight,
  },
  h3: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.h3,
    lineHeight: lineHeights.h3,
  },
  h4: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.h4,
    lineHeight: lineHeights.h4,
  },
  bodyLarge: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.bodyLarge,
    lineHeight: lineHeights.bodyLarge,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
  },
  bodySmall: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.bodySmall,
    lineHeight: lineHeights.bodySmall,
  },
  label: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.label,
    lineHeight: lineHeights.label,
    letterSpacing: letterSpacings.wide,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.caption,
    lineHeight: lineHeights.caption,
  },
  screenTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: fontSizes.h2,
    lineHeight: 32,
    letterSpacing: letterSpacings.normal,
  },
  screenSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.bodySmall,
    lineHeight: 19,
    letterSpacing: letterSpacings.normal,
  },
  sectionTitle: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: letterSpacings.normal,
  },
  sectionEyebrow: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.caption,
    lineHeight: lineHeights.caption,
    letterSpacing: letterSpacings.normal,
    textTransform: 'uppercase' as const,
  },
  rowTitle: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: letterSpacings.normal,
  },
  rowMeta: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.bodySmall,
    lineHeight: 18,
    letterSpacing: letterSpacings.normal,
  },
  rowCaption: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.caption,
    lineHeight: lineHeights.caption,
    letterSpacing: letterSpacings.normal,
  },
  chipLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.label,
    lineHeight: lineHeights.label,
    letterSpacing: letterSpacings.normal,
  },
  buttonLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: 14,
    lineHeight: lineHeights.label,
    letterSpacing: letterSpacings.normal,
  },
  identityTitle: {
    fontFamily: fontFamilies.headingMedium,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: letterSpacings.normal,
  },
  editorialTitle: {
    fontFamily: fontFamilies.serif,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: letterSpacings.normal,
  },
  statLarge: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.statLarge,
    lineHeight: lineHeights.statLarge,
    letterSpacing: letterSpacings.mono,
  },
  statMedium: {
    fontFamily: fontFamilies.monoMedium,
    fontSize: fontSizes.statMedium,
    lineHeight: lineHeights.statMedium,
    letterSpacing: letterSpacings.mono,
  },
  statSmall: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.statSmall,
    lineHeight: lineHeights.statSmall,
    letterSpacing: letterSpacings.mono,
  },
} as const;
