import { LaunchRouteGate } from '../../src/components/navigation/LaunchRouteGate';
import { EndorserInboxScreen } from '../../src/screens/EndorserInboxScreen';

/**
 * Inbox route — chat surface for the referrer. Tiered list of candidates
 * (Fresh / Conversations / Resting), mirrors the seeker's Matches tab.
 *
 * The previous occupant of this route was the swipe deck (which is now at
 * `discover.tsx`). The label "Inbox" finally maps to what users expect:
 * a list of conversations.
 */
export default function EndorserInboxRoute() {
  return (
    <LaunchRouteGate fallbackHref="/(referrer-tabs)/discover">
      <EndorserInboxScreen />
    </LaunchRouteGate>
  );
}
