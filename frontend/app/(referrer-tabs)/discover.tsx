import type { ReactElement } from 'react';
import { EndorserDiscoverScreen } from '../../src/screens/EndorserDiscoverScreen';

/**
 * Discover route — swipe deck of incoming candidate requests. Same screen
 * the seeker tab calls "Discover"; the referrer's parallel surface.
 *
 * (Was previously routed at `/inbox`, which was misleading — that label
 * now belongs to the actual chat inbox at `inbox.tsx`.)
 */
export default function EndorserDiscoverRoute(): ReactElement {
  return <EndorserDiscoverScreen />;
}
