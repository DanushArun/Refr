import { LaunchRouteGate } from '../../src/components/navigation/LaunchRouteGate';
import { PipelineScreen } from '../../src/screens/PipelineScreen';

export default function PipelineRoute() {
  return (
    <LaunchRouteGate fallbackHref="/(seeker-tabs)/discover">
      <PipelineScreen />
    </LaunchRouteGate>
  );
}
