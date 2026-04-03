import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// ─── Auth Stack ────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Splash: undefined;
  RoleSelection: undefined;
  ProfileSetup: {
    role: 'seeker' | 'referrer';
  };
};

export type SplashScreenProps = NativeStackScreenProps<AuthStackParamList, 'Splash'>;
export type RoleSelectionScreenProps = NativeStackScreenProps<AuthStackParamList, 'RoleSelection'>;
export type ProfileSetupScreenProps = NativeStackScreenProps<AuthStackParamList, 'ProfileSetup'>;

// ─── Seeker Tabs ───────────────────────────────────────────────────────────

export type SeekerTabParamList = {
  Discover: undefined;
  Matches: undefined;
  Pipeline: undefined;
  SeekerProfile: undefined;
};

// ─── Referrer Tabs ─────────────────────────────────────────────────────────

export type ReferrerTabParamList = {
  Inbox: undefined;
  Active: undefined;
  Earnings: undefined;
  ReferrerProfile: undefined;
};

// ─── Main Stack (wraps tabs + modal screens) ───────────────────────────────

export type MainStackParamList = {
  SeekerTabs: undefined;
  ReferrerTabs: undefined;
  Chat: {
    referralId: string;
    participantName: string;
    participantAvatar?: string;
  };
};

export type ChatScreenProps = NativeStackScreenProps<MainStackParamList, 'Chat'>;

// ─── Root Navigator ────────────────────────────────────────────────────────

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// ─── Composite props for tab screens that also need main stack navigation ──

export type SeekerDiscoverScreenProps = CompositeScreenProps<
  BottomTabScreenProps<SeekerTabParamList, 'Discover'>,
  NativeStackScreenProps<MainStackParamList>
>;

export type SeekerMatchesScreenProps = CompositeScreenProps<
  BottomTabScreenProps<SeekerTabParamList, 'Matches'>,
  NativeStackScreenProps<MainStackParamList>
>;

export type ReferrerInboxScreenProps = CompositeScreenProps<
  BottomTabScreenProps<ReferrerTabParamList, 'Inbox'>,
  NativeStackScreenProps<MainStackParamList>
>;
