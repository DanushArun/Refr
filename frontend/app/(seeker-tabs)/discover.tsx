import { LaunchRouteSettler } from '../../src/components/navigation/LaunchRouteGate';
import { DiscoverScreen } from '../../src/screens/DiscoverScreen';

export default function DiscoverRoute() {
  console.log('[route-debug] Seeker DiscoverRoute render');
  return (
    <LaunchRouteSettler>
      <DiscoverScreen />
    </LaunchRouteSettler>
  );
}
