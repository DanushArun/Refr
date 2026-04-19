import { EndorserDiscoverScreen } from '../../src/screens/EndorserDiscoverScreen';

// Route filename stays `inbox` for Expo Router compat; the tab label is "Discover"
// (set in `(referrer-tabs)/_layout.tsx`). Endorser flow is swipe-first per UX spec.
export default function EndorserDiscoverRoute() {
  return <EndorserDiscoverScreen />;
}
