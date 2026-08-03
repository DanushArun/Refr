import { useState, type ReactElement } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveDemoRole, type DemoRole } from '../services/demoRoleStorage';
import { lightJourney } from '../theme/lightJourney';
import { launchContentFor } from './launchPresentation';

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
      source={require('../../assets/launch-common.png')}
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

function routeFor(role: DemoRole): '/seeker/discover' | '/referrer/discover' {
  return role === 'seeker' ? '/seeker/discover' : '/referrer/discover';
}

async function chooseRole(role: DemoRole): Promise<void> {
  await saveDemoRole(role);
  router.replace(routeFor(role));
}

export function WelcomeScreen(): ReactElement {
  const [isChoosingRole, setIsChoosingRole] = useState(false);
  const launch = launchContentFor('seeker');

  if (!isChoosingRole) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.launchSafe}>
        <LaunchArtwork />
        <LinearGradient
          colors={[
            'rgba(252,249,244,0)',
            'rgba(252,249,244,0.96)',
            '#FCF9F4',
          ]}
          locations={[0, 0.42, 0.62]}
          pointerEvents="none"
          style={styles.launchFade}
        />
        <View style={styles.launchOverlay}>
          <Text style={styles.launchWordmark}>Endorsly</Text>
          <View style={styles.launchFooter}>
            <Text accessibilityRole="header" style={styles.launchHeading}>
              {launch.headline}
            </Text>
            <Text style={styles.launchSubheading}>{launch.subheading}</Text>
            <Pressable
              accessibilityLabel="Get started"
              accessibilityRole="button"
              onPress={() => setIsChoosingRole(true)}
              style={({ pressed }) => [styles.launchAction, pressed && styles.launchActionPressed]}
            >
              <Ionicons color="#FFFFFF" name="phone-portrait-outline" size={23} />
              <Text style={styles.launchActionText}>Continue with phone</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Sign in"
              accessibilityRole="button"
              onPress={() => router.push('/(auth)/login')}
              style={styles.signInAction}
            >
              <Text style={styles.signInCopy}>
                Already have an account? <Text style={styles.signInLink}>Sign in</Text>
              </Text>
            </Pressable>
            <Text style={styles.legalCopy}>
              By continuing, you agree to Endorsly’s{' '}
              <Text style={styles.legalLink}>Terms of Use</Text>{'\n'}and{' '}
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </Text>
          </View>
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
  launchFade: { bottom: 0, height: 480, left: 0, position: 'absolute', right: 0, zIndex: 1 },
  launchOverlay: { flex: 1, paddingHorizontal: 24, paddingTop: 63, zIndex: 2 },
  launchWordmark: {
    color: lightJourney.ink,
    fontFamily: 'IBMPlexSerif-Medium',
    fontSize: 31,
    textAlign: 'center',
  },
  launchFooter: { marginTop: 'auto', paddingBottom: 18 },
  launchHeading: {
    color: lightJourney.ink,
    fontFamily: 'IBMPlexSerif-Medium',
    fontSize: 37,
    letterSpacing: -1,
    lineHeight: 42,
    textAlign: 'center',
  },
  launchSubheading: {
    color: '#5E6570',
    fontFamily: 'TikTokSans-Regular',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 14,
    textAlign: 'center',
  },
  launchAction: {
    alignItems: 'center',
    backgroundColor: '#1359D5',
    borderRadius: 18,
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
    minHeight: 56,
    width: '100%',
  },
  launchActionPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  launchActionText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 16 },
  signInAction: { alignItems: 'center', justifyContent: 'center', minHeight: 44, marginTop: 8 },
  signInCopy: { color: '#626873', fontFamily: 'TikTokSans-Regular', fontSize: 14 },
  signInLink: { color: lightJourney.blue, fontFamily: 'TikTokSans-Semibold' },
  legalCopy: {
    color: '#626873',
    fontFamily: 'TikTokSans-Regular',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 9,
    textAlign: 'center',
  },
  legalLink: { color: lightJourney.blue, fontFamily: 'TikTokSans-Medium' },
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
