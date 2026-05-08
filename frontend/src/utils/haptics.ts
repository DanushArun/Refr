import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { isAhapSupported, playAhap } from '../../modules/expo-haptic-engine/src';

const isWeb = Platform.OS === 'web';

/**
 * Endorsly Haptic Conductor.
 *
 * expo-haptics only exposes the legacy UIImpactFeedback primitives — single
 * impacts, selection ticks, success/warning/error pulses. To make the app
 * *feel* like music we sequence those primitives with carefully tuned timing.
 * Each phrase is a small composition: attack, body, resolution.
 *
 * Intensity vocabulary:
 *   Soft   — pianissimo, whispered acknowledgment
 *   Light  — piano, gentle tick
 *   Medium — mezzo, the working hit
 *   Heavy  — forte, decisive landing
 *   Rigid  — staccato, sharp pop
 *   Selection — pure metronome tick (0–10ms, no body)
 *   Success/Warning/Error — full-body cadences from the OS
 *
 * Phrase design notes:
 *   - Gaps under 80ms read as a single "chord"; 80–160ms read as a "phrase";
 *     >200ms feels like two distinct events. We mostly compose in the 50–120ms
 *     band so the rhythm stays musical.
 *   - The same pattern played at different intensities (light-light-light vs
 *     light-medium-heavy) feels emotionally different — ascending implies
 *     anticipation, descending implies completion.
 *   - Success/Warning/Error notifications already contain their own micro-rhythm.
 *     We use them only at the end of phrases (the resolution).
 */

type Step =
  | { kind: 'impact'; style: Haptics.ImpactFeedbackStyle }
  | { kind: 'selection' }
  | { kind: 'notify'; type: Haptics.NotificationFeedbackType }
  | { kind: 'rest'; ms: number };

const I = Haptics.ImpactFeedbackStyle;
const N = Haptics.NotificationFeedbackType;

async function rest(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function play(score: Step[]): Promise<void> {
  if (isWeb) return;
  for (const step of score) {
    try {
      switch (step.kind) {
        case 'impact':
          await Haptics.impactAsync(step.style);
          break;
        case 'selection':
          await Haptics.selectionAsync();
          break;
        case 'notify':
          await Haptics.notificationAsync(step.type);
          break;
        case 'rest':
          await rest(step.ms);
          break;
      }
    } catch {
      // Haptics can throw on simulators or restricted contexts — never bubble.
    }
  }
}

/* ──────────────────────────────────────────────────────────────────────
   Phrases — named compositions used throughout the app.
   ────────────────────────────────────────────────────────────────────── */

export const Phrase = {
  /** A whispered tick — UI selection, tab change, filter chip. */
  tick: (): Promise<void> => play([{ kind: 'selection' }]),

  /** A soft acknowledgment — opening a card, confirming a button press. */
  tap: (): Promise<void> => play([{ kind: 'impact', style: I.Soft }]),

  /** Heartbeat — the "I'm interested" swipe. Two-beat pulse: heavy then light. */
  swipeRequest: (): Promise<void> => {
    if (isAhapSupported()) {
      playAhap('swipe-request');
      return Promise.resolve();
    }
    return play([
      { kind: 'impact', style: I.Heavy },
      { kind: 'rest', ms: 80 },
      { kind: 'impact', style: I.Light },
    ]);
  },

  /** Soft sigh — the "not for me" swipe. Single soft dismissal. */
  swipePass: (): Promise<void> => {
    if (isAhapSupported()) {
      playAhap('swipe-pass');
      return Promise.resolve();
    }
    return play([{ kind: 'impact', style: I.Soft }]);
  },

  /** Stamp threshold — the swipe stamp first becomes visible mid-drag. */
  stampReveal: (): Promise<void> =>
    play([{ kind: 'impact', style: I.Light }]),

  /** Match bell — both sides agreed. Three-note ascent + success cadence. */
  match: (): Promise<void> => {
    if (isAhapSupported()) {
      playAhap('match');
      return Promise.resolve();
    }
    return play([
      { kind: 'impact', style: I.Light },
      { kind: 'rest', ms: 60 },
      { kind: 'impact', style: I.Medium },
      { kind: 'rest', ms: 60 },
      { kind: 'impact', style: I.Heavy },
      { kind: 'rest', ms: 100 },
      { kind: 'notify', type: N.Success },
    ]);
  },

  /** Hire — the climb of the company. Four ascending hits, then success. */
  hire: (): Promise<void> => {
    if (isAhapSupported()) {
      playAhap('hire');
      return Promise.resolve();
    }
    return play([
      { kind: 'impact', style: I.Light },
      { kind: 'rest', ms: 90 },
      { kind: 'impact', style: I.Light },
      { kind: 'rest', ms: 90 },
      { kind: 'impact', style: I.Medium },
      { kind: 'rest', ms: 110 },
      { kind: 'impact', style: I.Heavy },
      { kind: 'rest', ms: 140 },
      { kind: 'notify', type: N.Success },
    ]);
  },

  /** Onboarding self-star ignite — soft attack, soft echo. */
  starIgnite: (): Promise<void> =>
    play([
      { kind: 'impact', style: I.Medium },
      { kind: 'rest', ms: 50 },
      { kind: 'impact', style: I.Soft },
    ]),

  /** A new star/connection appears in the constellation. Single tick. */
  starAppear: (): Promise<void> =>
    play([{ kind: 'selection' }]),

  /** A path draws between you and a target — soft ascending chord. */
  pathDraw: (): Promise<void> =>
    play([
      { kind: 'impact', style: I.Soft },
      { kind: 'rest', ms: 40 },
      { kind: 'impact', style: I.Light },
    ]),

  /** "Your galaxy is ready" — the ritual close. Soft → heavy → success. */
  ritualComplete: (): Promise<void> => {
    if (isAhapSupported()) {
      playAhap('ritual');
      return Promise.resolve();
    }
    return play([
      { kind: 'impact', style: I.Medium },
      { kind: 'rest', ms: 100 },
      { kind: 'impact', style: I.Heavy },
      { kind: 'rest', ms: 130 },
      { kind: 'notify', type: N.Success },
    ]);
  },

  /** A new chat message arrives — single light landing. */
  messageReceived: (): Promise<void> =>
    play([{ kind: 'impact', style: I.Light }]),

  /** Outgoing message sent — clipped staccato so it feels released. */
  messageSent: (): Promise<void> =>
    play([{ kind: 'impact', style: I.Rigid }]),

  /** Soft warning — a non-blocking issue surfaces. */
  warning: (): Promise<void> =>
    play([{ kind: 'notify', type: N.Warning }]),

  /** Error — an action failed and needs attention. */
  error: (): Promise<void> =>
    play([{ kind: 'notify', type: N.Error }]),

  /** Pull-to-refresh release — a soft "got it" downbeat. */
  pullRefresh: (): Promise<void> =>
    play([
      { kind: 'impact', style: I.Light },
      { kind: 'rest', ms: 70 },
      { kind: 'impact', style: I.Soft },
    ]),
};

/* ──────────────────────────────────────────────────────────────────────
   Legacy primitives — kept for callers that haven't migrated to phrases yet.
   New code should use Phrase.* instead.
   ────────────────────────────────────────────────────────────────────── */

export const hapticSelection = (): Promise<void> => Phrase.tick();

export const hapticImpact = async (
  style: Haptics.ImpactFeedbackStyle = I.Light,
): Promise<void> => {
  if (isWeb) return;
  await Haptics.impactAsync(style).catch(() => {});
};

export const hapticNotification = async (
  type: Haptics.NotificationFeedbackType = N.Success,
): Promise<void> => {
  if (isWeb) return;
  await Haptics.notificationAsync(type).catch(() => {});
};
