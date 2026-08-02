import { useState, type ReactElement } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveDemoRole } from '../services/demoRoleStorage';
import { lightJourney } from '../theme/lightJourney';
import {
  participationChoices,
  type ParticipationChoice,
  type ParticipationRole,
} from './participationContent';

function Header(): ReactElement {
  return <Text accessibilityRole="header" style={styles.wordmark}>Endorsly</Text>;
}

function ParticipationChoiceCard({
  choice,
  isSelected,
  onPress,
}: {
  choice: ParticipationChoice;
  isSelected: boolean;
  onPress: () => void;
}): ReactElement {
  return (
    <Pressable
      accessibilityLabel={choice.title}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        isSelected && styles.choiceSelected,
        pressed && styles.choicePressed,
      ]}
    >
      <View style={[styles.choiceMark, isSelected && styles.choiceMarkSelected]}>
        {isSelected ? <Ionicons color="#FFFFFF" name="checkmark" size={16} /> : null}
      </View>
      <View style={styles.choiceCopy}>
        <Text style={styles.choiceTitle}>{choice.title}</Text>
        <Text style={styles.choiceDescription}>{choice.description}</Text>
      </View>
    </Pressable>
  );
}

function routeAfterParticipation(role: ParticipationRole): '/(auth)/phone' {
  void role;
  return '/(auth)/phone';
}

export function ParticipationScreen(): ReactElement {
  const [role, setRole] = useState<ParticipationRole>('seeker');

  async function continueToPhone(): Promise<void> {
    await saveDemoRole(role === 'endorser' ? 'referrer' : 'seeker');
    router.push(routeAfterParticipation(role));
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header />
        <Image
          accessibilityLabel="Priya, a professional seeking a trusted introduction"
          resizeMode="cover"
          source={require('../../assets/seeker-entry-portrait.png')}
          style={styles.portrait}
        />
        <View style={styles.sheet}>
          <Text accessibilityRole="header" style={styles.heading}>
            Your next role, through people who know.
          </Text>
          <View accessibilityRole="radiogroup" style={styles.choices}>
            {participationChoices.map((choice) => (
              <ParticipationChoiceCard
                choice={choice}
                isSelected={role === choice.id}
                key={choice.id}
                onPress={() => setRole(choice.id)}
              />
            ))}
          </View>
        </View>
        <Pressable
          accessibilityLabel="Continue"
          accessibilityRole="button"
          onPress={() => void continueToPhone()}
          style={({ pressed }) => [styles.continueAction, pressed && styles.continuePressed]}
        >
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  content: { flexGrow: 1, paddingBottom: 24 },
  wordmark: {
    color: lightJourney.ink,
    fontFamily: 'IBMPlexSerif-Medium',
    fontSize: 28,
    paddingVertical: 12,
    textAlign: 'center',
  },
  portrait: { alignSelf: 'center', borderRadius: 14, height: 232, width: '88%' },
  sheet: {
    backgroundColor: lightJourney.background,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    marginHorizontal: 15,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  heading: {
    color: lightJourney.ink,
    fontFamily: 'IBMPlexSerif-Medium',
    fontSize: 35,
    letterSpacing: -0.9,
    lineHeight: 39,
  },
  choices: { gap: 10, marginTop: 16 },
  choice: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderColor: lightJourney.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 82,
    paddingHorizontal: 14,
  },
  choiceSelected: { borderColor: lightJourney.blue, borderWidth: 1.5 },
  choicePressed: { backgroundColor: lightJourney.blueSoft },
  choiceMark: {
    alignItems: 'center',
    borderColor: '#A5ABB5',
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  choiceMarkSelected: { backgroundColor: lightJourney.blue, borderColor: lightJourney.blue },
  choiceCopy: { flex: 1, marginLeft: 14 },
  choiceTitle: { color: lightJourney.ink, fontFamily: 'TikTokSans-Medium', fontSize: 15 },
  choiceDescription: {
    color: lightJourney.textMuted,
    fontFamily: 'TikTokSans-Regular',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  continueAction: {
    alignItems: 'center',
    backgroundColor: lightJourney.blue,
    borderRadius: 17,
    height: 56,
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 'auto',
  },
  continuePressed: { backgroundColor: lightJourney.bluePressed, transform: [{ scale: 0.98 }] },
  continueText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 16 },
});
