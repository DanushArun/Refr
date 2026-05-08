/**
 * REFR Design System — Liquid Glass + Skeuomorphic Data
 *
 * Base: Neutral near-black.
 * Accent: Radioactive Cyan.
 * Surfaces: Translucent, frosted glass.
 */

export const colors = {
  // Nautical palette — deep navy hull, cream sailcloth, sailor gold trim
  background: '#0A1F44',
  backgroundElevated: '#102A5C',
  navy: '#0A1F44',
  navyDeep: '#061638',
  cream: '#F5F1E8',
  cardSurface: '#F5F1E8',
  cardSurfaceText: '#000000',
  cardSurfaceTextMuted: 'rgba(0, 0, 0, 0.60)',
  cardSurfaceTextSubtle: 'rgba(0, 0, 0, 0.38)',
  cardSurfaceDivider: 'rgba(0, 0, 0, 0.10)',
  // Sailor gold — the trim/insignia color
  gold: '#D4A744',
  goldBright: '#E8BD58',
  goldDim: 'rgba(212, 167, 68, 0.30)',
  goldGlow: 'rgba(212, 167, 68, 0.18)',

  // Glass surfaces — Translucent layers
  surface: 'rgba(255, 255, 255, 0.03)',
  surfaceHover: 'rgba(255, 255, 255, 0.06)',
  surfaceActive: 'rgba(255, 255, 255, 0.1)',

  // Brand accent — sailor gold (was radioactive cyan)
  accent: '#D4A744',
  accentLight: 'rgba(212, 167, 68, 0.15)',
  accentDim: 'rgba(212, 167, 68, 0.30)',
  accentPressedBg: 'rgba(212, 167, 68, 0.25)',

  // Typography hierarchy
  text: '#FAFAF7', // Off-white
  textSecondary: 'rgba(250, 250, 247, 0.6)',
  textTertiary: 'rgba(250, 250, 247, 0.3)',
  textDisabled: 'rgba(250, 250, 247, 0.15)',

  // Rim lights and borders for glass
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',
  glassHighlight: 'rgba(255, 255, 255, 0.2)',

  // Semantic states — green keeps its universal meaning regardless of brand
  success: '#22C55E',
  successLight: 'rgba(34, 197, 94, 0.15)',
  warning: '#FFB800',
  warningLight: 'rgba(255, 184, 0, 0.15)',
  error: '#FF3366',
  errorLight: 'rgba(255, 51, 102, 0.15)',

  // Tags (Monochrome to let the accent shine)
  tagBlue: 'rgba(255, 255, 255, 0.06)',
  tagBlueText: 'rgba(250, 250, 247, 0.8)',
  tagGreen: 'rgba(255, 255, 255, 0.06)',
  tagGreenText: 'rgba(250, 250, 247, 0.8)',
  tagOrange: 'rgba(255, 255, 255, 0.06)',
  tagOrangeText: 'rgba(250, 250, 247, 0.8)',
  tagPurple: 'rgba(255, 255, 255, 0.06)',
  tagPurpleText: 'rgba(250, 250, 247, 0.8)',

  // Pipeline colors — semantically distinct hues
  pipelineRequested: 'rgba(250, 250, 247, 0.35)',
  pipelineAccepted: '#60a5fa',
  pipelineSubmitted: '#a78bfa',
  pipelineInterviewing: '#00FFCC',
  pipelineHired: '#22c55e',
  pipelineRejected: '#f87171',
  pipelineWithdrawn: 'rgba(250, 250, 247, 0.2)',
  pipelineExpired: 'rgba(250, 250, 247, 0.2)',

  // Ambient background orbs
  ambientViolet: 'rgba(124, 58, 237, 0.20)',
  ambientCyan: 'rgba(0, 255, 204, 0.13)',
  ambientTeal: 'rgba(6, 182, 212, 0.07)',

  // Scores
  scoreLow: 'rgba(250, 250, 247, 0.3)',
  scoreMiddle: 'rgba(250, 250, 247, 0.6)',
  scoreHigh: '#00FFCC',

  // Surface elevation (diffuse ambient)
  surfaceLevel1: 'rgba(255, 255, 255, 0.04)',
  surfaceLevel2: 'rgba(255, 255, 255, 0.08)',
  surfaceInset: 'rgba(0, 0, 0, 0.4)',

  chatBubbleSent: '#00FFCC',
  chatBubbleReceived: 'rgba(255, 255, 255, 0.06)',
} as const;

export type ColorToken = keyof typeof colors;
