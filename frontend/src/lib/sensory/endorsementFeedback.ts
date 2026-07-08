type EndorsementDecision = 'request' | 'pass';

type EndorsementFeedback = {
  toast: string | null;
};

export function feedbackForEndorsementDecision(
  direction: EndorsementDecision,
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
