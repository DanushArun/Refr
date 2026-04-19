/**
 * Endorsly Demo Mode Configuration
 *
 * HOW TO USE:
 * 1. Set `enabled: true` to activate demo mode globally.
 * 2. Set `demoRole` to 'seeker' or 'referrer' — just the word.
 * 3. Toggle individual screens on/off in the `screens` object.
 *    - When a screen flag is true AND enabled is true: mock data is used.
 *    - When a screen flag is false: real API is called even in demo mode.
 *
 * IMPORTANT: Keep `enabled: false` for production / real testing.
 */

type DemoRole = 'seeker' | 'referrer';

interface DemoConfig {
  enabled: boolean;
  demoRole: DemoRole;
  screens: {
    auth: boolean;
    feed: boolean;
    pipeline: boolean;
    inbox: boolean;
    chat: boolean;
    earnings: boolean;
    profile: boolean;
    matches: boolean;
  };
}

export const DEMO: DemoConfig = {
  /** Master switch -- must be true for any mock data to activate */
  enabled: true,

  /** Which role to simulate: 'seeker' or 'referrer' */
  demoRole: 'seeker',

  /** Per-screen toggles. Each controls one API surface area. */
  screens: {
    auth: true,
    feed: true,
    pipeline: true,
    inbox: true,
    chat: true,
    earnings: true,
    profile: true,
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
  DEMO_REFERRERS,
  chatForReferral,
  appendChatMessage,
  referrerByCompany,
  referrerById,
} from './mockData';
export type { DemoReferrer } from './mockData';
