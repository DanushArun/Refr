import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { lightJourney } from '../../src/theme/lightJourney';

type Role = 'seeker' | 'referrer';

const ROLES: Array<{
  id: Role;
  title: string;
  description: string;
}> = [
  {
    id: 'seeker',
    title: 'I’m seeking an introduction',
    description: 'Find the right person to make a warm referral for your next role.',
  },
  {
    id: 'referrer',
    title: 'I refer great people',
    description: 'Back exceptional candidates with context your hiring team can trust.',
  },
];

export default function RoleSelectionScreen() {
  const [selected, setSelected] = useState<Role | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    router.push({ pathname: '/(auth)/profile-setup', params: { role: selected } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>CHOOSE YOUR PATH</Text>
          <Text style={styles.title}>How will you move opportunity forward?</Text>
        </View>

        <View style={styles.cards}>
          {ROLES.map((role) => {
            const isSelected = selected === role.id;
            return (
              <Pressable
                key={role.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelected(role.id)}
              >
                <View style={styles.roleNumber}>
                  <Text style={styles.roleNumberText}>{role.id === 'seeker' ? '01' : '02'}</Text>
                </View>
                <Text style={styles.cardTitle}>{role.title}</Text>
                <Text style={styles.cardDescription}>{role.description}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.flexSpacer} />

        <Pressable
          style={[styles.button, !selected && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!selected}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: lightJourney.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 42,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: 34,
  },
  title: {
    color: lightJourney.ink,
    fontFamily: 'IBMPlexSerif-Medium',
    fontSize: 34,
    letterSpacing: -0.7,
    lineHeight: 40,
  },
  eyebrow: {
    color: lightJourney.blue,
    fontFamily: 'TikTokSans-Semibold',
    fontSize: 11,
    letterSpacing: 1.1,
    marginBottom: 10,
  },
  cards: {
    width: '100%',
    gap: 12,
  },
  card: {
    backgroundColor: lightJourney.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: lightJourney.border,
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
    alignItems: 'flex-start',
  },
  cardSelected: {
    borderWidth: 2,
    backgroundColor: lightJourney.blueSoft,
    borderColor: lightJourney.blue,
    shadowColor: lightJourney.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  roleNumber: {
    alignItems: 'center',
    backgroundColor: lightJourney.surfaceMuted,
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  roleNumberText: {
    color: lightJourney.blue,
    fontFamily: 'TikTokSans-Semibold',
    fontSize: 11,
  },
  cardTitle: {
    color: lightJourney.ink,
    fontFamily: 'IBMPlexSerif-Medium',
    fontSize: 22,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: lightJourney.textMuted,
    fontFamily: 'TikTokSans-Regular',
  },
  flexSpacer: {
    flex: 1,
    minHeight: 20,
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: lightJourney.blue,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: lightJourney.border,
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'TikTokSans-Semibold',
    fontSize: 16,
    color: '#FFFFFF',
  },
});
