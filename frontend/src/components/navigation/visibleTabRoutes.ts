import { type AppRole, tabIsVisibleForRole } from './roleTabs';

export interface NavigationRoute {
  key: string;
  name: string;
}

export type NavigationDescriptors = Record<
  string,
  { options?: unknown } | undefined
>;

export function visibleRoleRoutes<Route extends NavigationRoute>(
  routes: readonly Route[],
  descriptors: NavigationDescriptors,
  role?: AppRole,
): Route[] {
  return routes.filter((route) => {
    const options = descriptors[route.key]?.options as { href?: unknown } | undefined;
    return options?.href !== null && tabIsVisibleForRole(route.name, role);
  });
}
