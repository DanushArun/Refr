/**
 * REFR Design System — Typography
 *
 * Instrument Serif  — headings, narrative content, emotional beats
 * Outfit            — body text, UI labels, navigation
 * JetBrains Mono    — numbers, stats, earnings, scores
 */

export const fontFamilies = {
  heading: 'InstrumentSerif-Regular',
  headingItalic: 'InstrumentSerif-Italic',
  body: 'Outfit-Regular',
  bodyMedium: 'Outfit-Medium',
  bodySemiBold: 'Outfit-SemiBold',
  bodyBold: 'Outfit-Bold',
  mono: 'JetBrainsMono-Regular',
  monoMedium: 'JetBrainsMono-Medium',
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
  tight: -0.5,
  normal: 0,
  wide: 0.3,
  wider: 0.6,
  mono: 0.5,
} as const;

export const typography = {
  display: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.display,
    lineHeight: lineHeights.display,
    letterSpacing: letterSpacings.tight,
  },
  h1: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.h1,
    lineHeight: lineHeights.h1,
    letterSpacing: letterSpacings.tight,
  },
  h2: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.h2,
    lineHeight: lineHeights.h2,
    letterSpacing: letterSpacings.tight,
  },
  h3: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: fontSizes.h3,
    lineHeight: lineHeights.h3,
  },
  h4: {
    fontFamily: fontFamilies.bodySemiBold,
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
    fontFamily: fontFamilies.bodySemiBold,
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
