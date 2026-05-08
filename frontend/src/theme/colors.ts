/**
 * REFR Design System — Liquid Glass + Skeuomorphic Data
 *
 * Base: Neutral near-black.
 * Accent: Radioactive Cyan.
 * Surfaces: Translucent, frosted glass.
 */

export const colors = {
  // Base backgrounds - Neutral near-black
  background: '#0A0A0B',
  backgroundElevated: '#121214',

  // Glass surfaces — Translucent layers
  surface: 'rgba(255, 255, 255, 0.03)',
  surfaceHover: 'rgba(255, 255, 255, 0.06)',
  surfaceActive: 'rgba(255, 255, 255, 0.1)',

  // ONE bold accent color for live data - Radioactive Cyan
  accent: '#00FFCC',
  accentLight: 'rgba(0, 255, 204, 0.15)',
  accentDim: 'rgba(0, 255, 204, 0.3)',
  accentPressedBg: 'rgba(0, 255, 204, 0.25)',

  // Typography hierarchy
  text: '#FAFAF7', // Off-white
  textSecondary: 'rgba(250, 250, 247, 0.6)',
  textTertiary: 'rgba(250, 250, 247, 0.3)',
  textDisabled: 'rgba(250, 250, 247, 0.15)',

  // Rim lights and borders for glass
  border: 'rgba(255, 255, 255, 0.08)',
  borderStrong: 'rgba(255, 255, 255, 0.15)',
  glassHighlight: 'rgba(255, 255, 255, 0.2)',

  // Semantic states (muted unless they are the primary action)
  success: '#00FFCC',
  successLight: 'rgba(0, 255, 204, 0.15)',
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

  // Pipeline colors
  pipelineRequested: 'rgba(255, 255, 255, 0.4)',
  pipelineAccepted: 'rgba(255, 255, 255, 0.6)',
  pipelineSubmitted: 'rgba(255, 255, 255, 0.8)',
  pipelineInterviewing: '#00FFCC',
  pipelineHired: '#00FFCC',
  pipelineRejected: 'rgba(255, 255, 255, 0.2)',
  pipelineWithdrawn: 'rgba(255, 255, 255, 0.1)',
  pipelineExpired: 'rgba(255, 255, 255, 0.1)',

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
