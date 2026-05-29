export type SensoryEvent =
  | 'control.tap'
  | 'control.select'
  | 'endorsement.threshold'
  | 'endorsement.commit'
  | 'endorsement.submitted'
  | 'pipeline.advance'
  | 'score.delta'
  | 'verification.seal'
  | 'match.reveal'
  | 'hire.confirmed'
  | 'failure.rollback'
  | 'feed.liveArrival';

export type HapticPhrase =
  | 'tick'
  | 'tap'
  | 'swipeRequest'
  | 'stampReveal'
  | 'endorsementCommit'
  | 'endorsementSubmitted'
  | 'pipelineAdvance'
  | 'scoreDelta'
  | 'verificationSeal'
  | 'match'
  | 'hire'
  | 'failureRollback';

export type MotionFeel = 'quiet' | 'standard' | 'cinematic' | 'instant';

export type SensoryRecipe = {
  event: SensoryEvent;
  motion: MotionFeel;
  haptic: HapticPhrase | null;
  passive: boolean;
};

type RecipeDefinition = Omit<SensoryRecipe, 'event' | 'haptic'> & {
  haptic: HapticPhrase | null;
};

type RecipeOptions = {
  hapticsEnabled: boolean;
  reduceMotion: boolean;
};

const GRAMMAR: Record<SensoryEvent, RecipeDefinition> = {
  'control.tap': { motion: 'quiet', haptic: 'tap', passive: false },
  'control.select': { motion: 'quiet', haptic: 'tick', passive: false },
  'endorsement.threshold': { motion: 'quiet', haptic: 'stampReveal', passive: false },
  'endorsement.commit': { motion: 'standard', haptic: 'endorsementCommit', passive: false },
  'endorsement.submitted': { motion: 'cinematic', haptic: 'endorsementSubmitted', passive: false },
  'pipeline.advance': { motion: 'standard', haptic: 'pipelineAdvance', passive: false },
  'score.delta': { motion: 'standard', haptic: 'scoreDelta', passive: false },
  'verification.seal': { motion: 'cinematic', haptic: 'verificationSeal', passive: false },
  'match.reveal': { motion: 'cinematic', haptic: 'match', passive: false },
  'hire.confirmed': { motion: 'cinematic', haptic: 'hire', passive: false },
  'failure.rollback': { motion: 'standard', haptic: 'failureRollback', passive: false },
  'feed.liveArrival': { motion: 'quiet', haptic: null, passive: true },
};

export function getSensoryRecipe(
  event: SensoryEvent,
  options: RecipeOptions,
): SensoryRecipe {
  const recipe = GRAMMAR[event];
  const haptic = options.hapticsEnabled && !recipe.passive ? recipe.haptic : null;
  return {
    event,
    haptic,
    passive: recipe.passive,
    motion: options.reduceMotion ? 'instant' : recipe.motion,
  };
}
