/**
 * REFR Design System — Color Tokens
 *
 * Dark premium, glass-morphism aesthetic.
 * Visual refs: CRED (dark glass), Tinder (cards), PhonePe (payments), WhatsApp (chat).
 * NOT LinkedIn or Naukri.
 */

export const colors = {
  // Base backgrounds
  background: '#0a0a0f',
  backgroundElevated: '#0f0f17',

  // Glass surfaces — use for cards and overlays
  surface: 'rgba(255, 255, 255, 0.05)',
  surfaceHover: 'rgba(255, 255, 255, 0.08)',
  surfaceActive: 'rgba(255, 255, 255, 0.12)',

  // Violet accent — CTAs ONLY, not decorative
  accent: '#7c3aed',
  accentLight: 'rgba(124, 58, 237, 0.15)',
  accentDim: 'rgba(124, 58, 237, 0.4)',
  accentPressedBg: 'rgba(124, 58, 237, 0.25)',

  // Typography hierarchy
  text: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  textTertiary: 'rgba(255, 255, 255, 0.35)',
  textDisabled: 'rgba(255, 255, 255, 0.2)',

  // Borders and separators
  border: 'rgba(255, 255, 255, 0.1)',
  borderStrong: 'rgba(255, 255, 255, 0.18)',

  // Semantic states
  success: '#22c55e',
  successLight: 'rgba(34, 197, 94, 0.15)',
  warning: '#f59e0b',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  error: '#ef4444',
  errorLight: 'rgba(239, 68, 68, 0.15)',

  // Company / department tag palette
  tagBlue: 'rgba(59, 130, 246, 0.2)',
  tagBlueText: '#93c5fd',
  tagGreen: 'rgba(34, 197, 94, 0.15)',
  tagGreenText: '#86efac',
  tagOrange: 'rgba(249, 115, 22, 0.2)',
  tagOrangeText: '#fdba74',
  tagPurple: 'rgba(124, 58, 237, 0.2)',
  tagPurpleText: '#c4b5fd',

  // Referral pipeline status colors
  pipelineRequested: '#f59e0b',
  pipelineAccepted: '#3b82f6',
  pipelineSubmitted: '#8b5cf6',
  pipelineInterviewing: '#06b6d4',
  pipelineHired: '#22c55e',
  pipelineRejected: '#ef4444',
  pipelineWithdrawn: 'rgba(255, 255, 255, 0.3)',
  pipelineExpired: 'rgba(255, 255, 255, 0.2)',

  // Kingmaker Score gradient start/end
  scoreLow: '#ef4444',
  scoreMiddle: '#f59e0b',
  scoreHigh: '#22c55e',

  // Chat
  chatBubbleSent: '#7c3aed',
  chatBubbleReceived: 'rgba(255, 255, 255, 0.08)',
} as const;

export type ColorToken = keyof typeof colors;
