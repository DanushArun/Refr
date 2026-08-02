import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';

export type EntryWelcomeBenefit = {
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
};

export const entryWelcomeBenefits: readonly EntryWelcomeBenefit[] = [
  {
    description: 'We’ve secured your account',
    icon: 'shield-checkmark-outline',
    title: 'Your details are verified',
  },
  {
    description: 'Verified profiles get more referrals',
    icon: 'sparkles-outline',
    title: 'Endorsers find and trust',
  },
  {
    description: 'Referrals help you move ahead',
    icon: 'flash-outline',
    title: 'Opportunities, faster',
  },
];
