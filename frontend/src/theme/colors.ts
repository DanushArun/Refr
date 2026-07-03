import { afterHoursBrand } from './afterHours';

const ah = afterHoursBrand.colors;
const alpha = afterHoursBrand.alpha;

export const colors = {
  background: ah.midnight,
  backgroundElevated: ah.velvet,
  navy: ah.midnight,
  navyDeep: '#07140F',
  cream: ah.parchment,
  cardSurface: ah.parchment,
  cardSurfaceText: ah.midnight,
  cardSurfaceTextMuted: 'rgba(0, 0, 0, 0.60)',
  cardSurfaceTextSubtle: 'rgba(0, 0, 0, 0.38)',
  cardSurfaceDivider: 'rgba(0, 0, 0, 0.10)',
  gold: ah.brass,
  goldBright: ah.brass,
  goldDim: alpha.brass34,
  goldGlow: alpha.brass22,
  brass: ah.brass,
  sage: ah.sage,
  vermilion: ah.vermilion,
  vermilionLight: alpha.vermilion14,
  vermilionDim: alpha.vermilion38,

  surface: alpha.parchment08,
  surfaceHover: alpha.parchment12,
  surfaceActive: alpha.parchment18,

  accent: ah.vermilion,
  accentLight: alpha.vermilion14,
  accentDim: alpha.vermilion38,
  accentPressedBg: alpha.vermilion22,

  text: ah.parchment,
  textSecondary: alpha.parchment62,
  textTertiary: alpha.parchment35,
  textDisabled: 'rgba(244, 237, 221, 0.16)',

  border: alpha.parchment12,
  borderStrong: alpha.parchment18,
  glassHighlight: alpha.parchment18,

  success: ah.sage,
  successLight: alpha.sage16,
  warning: ah.brass,
  warningLight: alpha.brass14,
  error: ah.vermilion,
  errorLight: alpha.vermilion14,

  tagBlue: alpha.parchment08,
  tagBlueText: alpha.parchment78,
  tagGreen: alpha.sage16,
  tagGreenText: ah.sage,
  tagOrange: alpha.brass14,
  tagOrangeText: ah.brass,
  tagPurple: alpha.parchment08,
  tagPurpleText: alpha.parchment78,

  pipelineRequested: alpha.parchment35,
  pipelineAccepted: ah.sage,
  pipelineSubmitted: ah.brass,
  pipelineInterviewing: ah.brass,
  pipelineHired: ah.sage,
  pipelineRejected: ah.vermilion,
  pipelineWithdrawn: alpha.parchment18,
  pipelineExpired: alpha.parchment18,

  ambientViolet: alpha.vermilion14,
  ambientCyan: alpha.parchment08,
  ambientTeal: alpha.sage16,

  scoreLow: alpha.parchment35,
  scoreMiddle: alpha.parchment62,
  scoreHigh: ah.brass,

  surfaceLevel1: alpha.parchment08,
  surfaceLevel2: alpha.parchment12,
  surfaceInset: 'rgba(0, 0, 0, 0.36)',
  profileCardSurface: alpha.velvetStrong,
  profileCardInset: alpha.parchment08,
  conversationCardSurface: alpha.sage30,
  conversationCardBorder: 'rgba(157, 181, 164, 0.34)',

  chatBubbleSent: ah.velvet,
  chatBubbleReceived: alpha.parchment08,
} as const;

export type ColorToken = keyof typeof colors;
