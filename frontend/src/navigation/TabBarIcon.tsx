import React from 'react';
import { Ionicons } from '@expo/vector-icons';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabBarIconProps {
  name: string;
  color: string;
  focused: boolean;
  size?: number;
}

/**
 * TabBarIcon — wraps Ionicons for tab bar usage.
 * Switches between filled (focused) and outline (unfocused) variants.
 */
export function TabBarIcon({ name, color, focused, size = 22 }: TabBarIconProps) {
  // Ionicons convention: outlined names have "-outline" suffix
  const iconName = focused ? (name as IoniconsName) : (`${name}-outline` as IoniconsName);
  return <Ionicons name={iconName} size={size} color={color} />;
}
