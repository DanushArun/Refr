import type { ReactElement } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightJourney } from '../theme/lightJourney';
import { entryWelcomeBenefits, type EntryWelcomeBenefit } from './entryWelcomeContent';

function Header(): ReactElement {
  return (
    <View style={styles.header}>
      <View style={styles.headerSpace} />
      <Text accessibilityRole="header" style={styles.wordmark}>Endorsly</Text>
      <View style={styles.headerIcon}>
        <Ionicons color={lightJourney.green} name="shield-checkmark-outline" size={25} />
      </View>
    </View>
  );
}

function Benefit({ benefit }: { benefit: EntryWelcomeBenefit }): ReactElement {
  return (
    <View style={styles.benefit}>
      <View style={styles.benefitIcon}>
        <Ionicons color={lightJourney.ink} name={benefit.icon} size={20} />
      </View>
      <View style={styles.benefitCopy}>
        <Text style={styles.benefitTitle}>{benefit.title}</Text>
        <Text style={styles.benefitDescription}>{benefit.description}</Text>
      </View>
    </View>
  );
}

export function EntryWelcomeScreen(): ReactElement {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <Header />
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.heading}>Welcome, Priya.</Text>
        <Text style={styles.intro}>Let’s build a profile people{`\n`}can confidently endorse.</Text>
        <View style={styles.portraitWrap}>
          <Image
            accessibilityLabel="Priya's profile portrait"
            resizeMode="cover"
            source={require('../../assets/seeker-entry-portrait.png')}
            style={styles.portrait}
          />
        </View>
        <View style={styles.verifiedChip}>
          <Ionicons color={lightJourney.green} name="shield-checkmark-outline" size={16} />
          <Text style={styles.verifiedText}>Account verified</Text>
        </View>
        <View style={styles.benefits}>
          {entryWelcomeBenefits.map((benefit) => <Benefit benefit={benefit} key={benefit.title} />)}
        </View>
      </View>
      <View style={styles.footer}>
        <Pressable
          accessibilityLabel="Start my profile"
          accessibilityRole="button"
          onPress={() => router.replace('/(auth)/onboarding/basics')}
          style={({ pressed }) => [styles.startAction, pressed && styles.startPressed]}
        >
          <Text style={styles.startText}>Start my profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 56, paddingHorizontal: 18 },
  headerSpace: { height: 44, width: 44 },
  headerIcon: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  content: { alignItems: 'center', flex: 1, paddingHorizontal: 28, paddingTop: 44 },
  heading: { alignSelf: 'stretch', color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 38, letterSpacing: -1, lineHeight: 43 },
  intro: { alignSelf: 'stretch', color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 15, lineHeight: 22, marginTop: 8 },
  portraitWrap: { backgroundColor: lightJourney.surfaceMuted, borderRadius: 86, height: 172, marginTop: 17, overflow: 'hidden', width: 172 },
  portrait: { height: '100%', width: '100%' },
  verifiedChip: { alignItems: 'center', backgroundColor: lightJourney.greenSoft, borderColor: lightJourney.border, borderRadius: 7, borderWidth: 1, flexDirection: 'row', gap: 5, marginTop: -2, minHeight: 30, paddingHorizontal: 10 },
  verifiedText: { color: lightJourney.green, fontFamily: 'TikTokSans-Medium', fontSize: 11 },
  benefits: { alignSelf: 'stretch', gap: 9, marginTop: 15 },
  benefit: { alignItems: 'center', flexDirection: 'row', minHeight: 39 },
  benefitIcon: { alignItems: 'center', height: 30, justifyContent: 'center', width: 32 },
  benefitCopy: { flex: 1, marginLeft: 10 },
  benefitTitle: { color: lightJourney.ink, fontFamily: 'TikTokSans-Medium', fontSize: 13 },
  benefitDescription: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, marginTop: 1 },
  footer: { paddingBottom: 18, paddingHorizontal: 24 },
  startAction: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 17, height: 56, justifyContent: 'center' },
  startPressed: { backgroundColor: lightJourney.bluePressed, transform: [{ scale: 0.98 }] },
  startText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 16 },
});
