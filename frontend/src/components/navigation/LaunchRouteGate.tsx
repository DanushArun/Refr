import React, { useEffect, useState } from 'react';
import { Redirect, type Href } from 'expo-router';
import {
  consumeLaunchRouteReset,
  settleLaunchRoute,
} from '../../services/launchRouteReset';

interface LaunchRouteGateProps {
  children: React.ReactNode;
  fallbackHref: Href;
}

export function LaunchRouteGate({ children, fallbackHref }: LaunchRouteGateProps) {
  const [shouldRedirect] = useState(() => consumeLaunchRouteReset());

  if (shouldRedirect) {
    return <Redirect href={fallbackHref} />;
  }

  return <>{children}</>;
}

export function LaunchRouteSettler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    settleLaunchRoute();
  }, []);

  return <>{children}</>;
}
