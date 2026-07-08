interface EndorserSwipeResult {
  mutual: boolean;
}

export function shouldShowMatchReveal(result: EndorserSwipeResult): boolean {
  return result.mutual;
}
