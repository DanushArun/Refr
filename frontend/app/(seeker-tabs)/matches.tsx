import { LaunchRouteGate } from '../../src/components/navigation/LaunchRouteGate';
import { MatchesScreen } from '../../src/screens/MatchesScreen';

export default function MatchesRoute() {
  return (
    <LaunchRouteGate fallbackHref="/(seeker-tabs)/discover">
      <MatchesScreen />
    </LaunchRouteGate>
  );
}
