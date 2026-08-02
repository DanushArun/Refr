import { useState, type ReactElement } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveDemoRole, type DemoRole } from '../services/demoRoleStorage';
import { lightJourney } from '../theme/lightJourney';

interface RoleChoiceProps {
  body: string;
  label: string;
  onPress: () => void;
  role: DemoRole;
}

function LaunchArtwork(): ReactElement {
  return (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel="Interwoven threads representing trusted connections"
      fadeDuration={0}
      resizeMode="cover"
      source={require('../../assets/launch-threads.png')}
      style={styles.launchArtwork}
    />
  );
}

function RoleChoice({ body, label, onPress, role }: RoleChoiceProps): ReactElement {
  const isSeeker = role === 'seeker';

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.roleChoice,
        isSeeker ? styles.seekerChoice : styles.endorserChoice,
        pressed && styles.roleChoicePressed,
      ]}
    >
      <Text style={isSeeker ? styles.seekerChoiceTitle : styles.endorserChoiceTitle}>
        {label}
      </Text>
      <Text style={isSeeker ? styles.seekerChoiceBody : styles.endorserChoiceBody}>
        {body}
      </Text>
    </Pressable>
  );
}

function routeFor(role: DemoRole): '/(seeker-tabs)/discover' | '/(referrer-tabs)/discover' {
  return role === 'seeker' ? '/(seeker-tabs)/discover' : '/(referrer-tabs)/discover';
}

async function chooseRole(role: DemoRole): Promise<void> {
  await saveDemoRole(role);
  router.replace(routeFor(role));
}

export function WelcomeScreen(): ReactElement {
  const [isChoosingRole, setIsChoosingRole] = useState(false);

  if (!isChoosingRole) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.launchSafe}>
        <LaunchArtwork />
        <View style={styles.launchOverlay}>
          <Text style={styles.launchWordmark}>Endorsly</Text>
          <Pressable
            accessibilityLabel="Get started"
            accessibilityRole="button"
            onPress={() => setIsChoosingRole(true)}
            style={({ pressed }) => [styles.launchAction, pressed && styles.launchActionPressed]}
          >
            <Text style={styles.launchActionText}>Get started</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.page}>
        <Text style={styles.wordmark}>Endorsly</Text>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>CAREERS MOVE THROUGH PEOPLE</Text>
          <Text accessibilityRole="header" style={styles.heading}>
            A warm introduction changes everything.
          </Text>
          <Text style={styles.body}>
            Build trusted career momentum with people who have seen the work.
          </Text>
        </View>
        <View style={styles.choices}>
          <RoleChoice
            body="Find the right person for your next opportunity."
            label="I’m seeking an introduction"
            onPress={() => void chooseRole('seeker')}
            role="seeker"
          />
          <RoleChoice
            body="Back exceptional people with a referral that matters."
            label="I refer great people"
            onPress={() => void chooseRole('referrer')}
            role="referrer"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  launchSafe: { backgroundColor: lightJourney.background, flex: 1 },
  launchArtwork: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    opacity: 1,
    width: '100%',
    zIndex: 0,
  },
  launchOverlay: { flex: 1, justifyContent: 'space-between', padding: 24, zIndex: 1 },
  launchWordmark: {
    color: lightJourney.ink,
    fontFamily: 'IBMPlexSerif-Medium',
    fontSize: 30,
    textAlign: 'center',
  },
  launchAction: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: lightJourney.ink,
    borderRadius: 28,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 28,
  },
  launchActionPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  launchActionText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 16 },
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  page: { flex: 1, justifyContent: 'space-between', padding: 24 },
  wordmark: {
    color: lightJourney.ink,
    fontFamily: 'IBMPlexSerif-Medium',
    fontSize: 29,
    textAlign: 'center',
  },
  hero: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingBottom: 24 },
  eyebrow: {
    color: lightJourney.blue,
    fontFamily: 'TikTokSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.1,
  },
  heading: {
    color: lightJourney.ink,
    fontFamily: 'IBMPlexSerif-Medium',
    fontSize: 35,
    letterSpacing: -0.8,
    lineHeight: 41,
    marginTop: 14,
    textAlign: 'center',
  },
  body: {
    color: lightJourney.textMuted,
    fontFamily: 'TikTokSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 14,
    maxWidth: 330,
    textAlign: 'center',
  },
  choices: { gap: 12, paddingBottom: 8 },
  roleChoice: { borderRadius: 18, minHeight: 86, paddingHorizontal: 18, paddingVertical: 15 },
  roleChoicePressed: { transform: [{ scale: 0.98 }] },
  seekerChoice: { backgroundColor: lightJourney.blue },
  endorserChoice: { backgroundColor: lightJourney.surface, borderColor: lightJourney.border, borderWidth: 1 },
  seekerChoiceTitle: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 16 },
  endorserChoiceTitle: { color: lightJourney.ink, fontFamily: 'TikTokSans-Semibold', fontSize: 16 },
  seekerChoiceBody: { color: '#DBE9FF', fontFamily: 'TikTokSans-Regular', fontSize: 13, marginTop: 4 },
  endorserChoiceBody: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 13, marginTop: 4 },
});
