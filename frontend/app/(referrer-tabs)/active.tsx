import { LaunchRouteGate } from '../../src/components/navigation/LaunchRouteGate';
import { ActiveScreen } from '../../src/screens/ActiveScreen';

export default function ActiveRoute() {
  return (
    <LaunchRouteGate fallbackHref="/(referrer-tabs)/discover">
      <ActiveScreen />
    </LaunchRouteGate>
  );
}
