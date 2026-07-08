import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { ReferrerSwipeDiscoverScreen } from './ReferrerSwipeDiscoverScreen';
import { SeekerSwipeDiscoverScreen } from './SeekerSwipeDiscoverScreen';

export function RoleDiscoverScreen(): React.ReactElement {
  const { user } = useAuth();
  if (user?.role === 'referrer') return <ReferrerSwipeDiscoverScreen />;
  return <SeekerSwipeDiscoverScreen />;
}
