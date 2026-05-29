let launchRouteResetPending = true;

export function consumeLaunchRouteReset(): boolean {
  if (!launchRouteResetPending) return false;
  launchRouteResetPending = false;
  return true;
}

export function settleLaunchRoute(): void {
  launchRouteResetPending = false;
}
