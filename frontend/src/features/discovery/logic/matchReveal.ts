interface EndorserSwipeResult {
  mutual: boolean;
  referral: unknown | null;
}

export function shouldShowMatchReveal(result: EndorserSwipeResult): boolean {
  return result.mutual && result.referral !== null;
}
