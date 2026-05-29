import { LaunchRouteGate } from '../../src/components/navigation/LaunchRouteGate';
import { EarningsScreen } from '../../src/screens/EarningsScreen';

export default function EarningsRoute() {
  return (
    <LaunchRouteGate fallbackHref="/(referrer-tabs)/discover">
      <EarningsScreen />
    </LaunchRouteGate>
  );
}
