import type { SwipeDirection } from '../../components/discover/SwipeDeck';

type EndorsementFeedback = {
  toast: string | null;
};

export function feedbackForEndorsementDecision(
  direction: SwipeDirection,
  seekerName?: string,
): EndorsementFeedback {
  if (direction !== 'request') {
    return { toast: null };
  }

  const target = seekerName ? ` for ${seekerName}` : '';
  return {
    toast: `Saving endorsement${target}...`,
  };
}
