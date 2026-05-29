import { LaunchRouteGate } from '../../src/components/navigation/LaunchRouteGate';
import { ProfileScreen } from '../../src/screens/ProfileScreen';

export default function ProfileRoute() {
  return (
    <LaunchRouteGate fallbackHref="/(referrer-tabs)/discover">
      <ProfileScreen />
    </LaunchRouteGate>
  );
}
