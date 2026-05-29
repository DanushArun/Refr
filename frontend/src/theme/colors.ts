/**
 * Endorsly Design System
 *
 * Base: near-black navy.
 * Accent: restrained gold.
 * Content surfaces: cream cards and quiet dark panels.
 */

export const colors = {
  background: '#05070D',
  backgroundElevated: '#0C1426',
  navy: '#081226',
  navyDeep: '#030712',
  cream: '#F5F1E8',
  cardSurface: '#F5F1E8',
  cardSurfaceText: '#000000',
  cardSurfaceTextMuted: 'rgba(0, 0, 0, 0.60)',
  cardSurfaceTextSubtle: 'rgba(0, 0, 0, 0.38)',
  cardSurfaceDivider: 'rgba(0, 0, 0, 0.10)',
  gold: '#D4A744',
  goldBright: '#E8BD58',
  goldDim: 'rgba(212, 167, 68, 0.30)',
  goldGlow: 'rgba(212, 167, 68, 0.18)',

  surface: 'rgba(255, 255, 255, 0.03)',
  surfaceHover: 'rgba(255, 255, 255, 0.06)',
  surfaceActive: 'rgba(255, 255, 255, 0.1)',

  accent: '#D4A744',
  accentLight: 'rgba(212, 167, 68, 0.15)',
  accentDim: 'rgba(212, 167, 68, 0.30)',
  accentPressedBg: 'rgba(212, 167, 68, 0.25)',

  text: '#FAFAF7',
  textSecondary: 'rgba(250, 250, 247, 0.6)',
  textTertiary: 'rgba(250, 250, 247, 0.3)',
  textDisabled: 'rgba(250, 250, 247, 0.15)',

  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',
  glassHighlight: 'rgba(255, 255, 255, 0.2)',

  success: '#22C55E',
  successLight: 'rgba(34, 197, 94, 0.15)',
  warning: '#FFB800',
  warningLight: 'rgba(255, 184, 0, 0.15)',
  error: '#FF3366',
  errorLight: 'rgba(255, 51, 102, 0.15)',

  tagBlue: 'rgba(255, 255, 255, 0.06)',
  tagBlueText: 'rgba(250, 250, 247, 0.8)',
  tagGreen: 'rgba(255, 255, 255, 0.06)',
  tagGreenText: 'rgba(250, 250, 247, 0.8)',
  tagOrange: 'rgba(255, 255, 255, 0.06)',
  tagOrangeText: 'rgba(250, 250, 247, 0.8)',
  tagPurple: 'rgba(255, 255, 255, 0.06)',
  tagPurpleText: 'rgba(250, 250, 247, 0.8)',

  pipelineRequested: 'rgba(250, 250, 247, 0.35)',
  pipelineAccepted: '#86A8D8',
  pipelineSubmitted: '#D4A744',
  pipelineInterviewing: '#F59E0B',
  pipelineHired: '#22c55e',
  pipelineRejected: '#f87171',
  pipelineWithdrawn: 'rgba(250, 250, 247, 0.2)',
  pipelineExpired: 'rgba(250, 250, 247, 0.2)',

  ambientViolet: 'rgba(212, 167, 68, 0.12)',
  ambientCyan: 'rgba(245, 241, 232, 0.08)',
  ambientTeal: 'rgba(134, 168, 216, 0.07)',

  scoreLow: 'rgba(250, 250, 247, 0.3)',
  scoreMiddle: 'rgba(250, 250, 247, 0.6)',
  scoreHigh: '#E8BD58',

  surfaceLevel1: 'rgba(255, 255, 255, 0.04)',
  surfaceLevel2: 'rgba(255, 255, 255, 0.08)',
  surfaceInset: 'rgba(0, 0, 0, 0.4)',

  chatBubbleSent: '#D4A744',
  chatBubbleReceived: 'rgba(255, 255, 255, 0.06)',
} as const;

export type ColorToken = keyof typeof colors;
