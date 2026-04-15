/**
 * REFR Demo Mode Configuration
 *
 * HOW TO USE:
 * 1. Set `enabled: true` to activate demo mode globally.
 * 2. Set `demoRole` to 'seeker' or 'referrer' to switch personas.
 * 3. Toggle individual screens on/off in the `screens` object.
 *    - When a screen flag is true AND enabled is true: mock data is used.
 *    - When a screen flag is false: real API is called even in demo mode.
 *
 * This lets you demo any screen without the backend running,
 * disable a broken screen while showing the rest, or switch
 * roles instantly.
 *
 * IMPORTANT: Keep `enabled: false` for production / real testing.
 */

export const DEMO = {
  /** Master switch -- must be true for any mock data to activate */
  enabled: true,

  /** Which role to simulate: 'seeker' shows seeker tabs, 'referrer' shows referrer tabs */
  demoRole: 'referrer' as 'referrer' | 'seeker',

  /** Per-screen toggles. Each controls one API surface area. */
  screens: {
    /** Bypass login, use mock session */
    auth: true,
    /** Mock feed cards */
    feed: true,
    /** Mock seeker pipeline items */
    pipeline: true,
    /** Mock referrer inbox items */
    inbox: true,
    /** Mock chat messages */
    chat: true,
    /** Mock reputation + leaderboard */
    earnings: true,
    /** Mock profile data */
    profile: true,
    /** Mock matches (derives from pipeline) */
    matches: true,
  },
};

/** Check if a specific screen should use mock data */
export function isDemoScreen(
  screen: keyof typeof DEMO.screens,
): boolean {
  return DEMO.enabled && DEMO.screens[screen];
}

export {
  MOCK_SEEKER_SESSION,
  MOCK_REFERRER_SESSION,
  MOCK_FEED_RESPONSE,
  MOCK_PIPELINE,
  MOCK_INBOX,
  MOCK_CHAT_CONVERSATION_ID,
  MOCK_CHAT_MESSAGES,
  MOCK_REPUTATION,
  MOCK_LEADERBOARD,
  MOCK_SEEKER_PROFILE,
  MOCK_REFERRER_PROFILE,
} from './mockData';
