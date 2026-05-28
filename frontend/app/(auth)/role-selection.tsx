import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';
import { spacing, layout } from '../../src/theme/spacing';

type Role = 'seeker' | 'referrer';

const ROLES: Array<{
  id: Role;
  title: string;
  description: string;
}> = [
  {
    id: 'seeker',
    title: 'I want endorsements',
    description: 'Find verified employees who can endorse you for the right role',
  },
  {
    id: 'referrer',
    title: 'I can endorse people',
    description: 'Back qualified candidates and track every endorsement in one place',
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
          <Text style={styles.title}>
            How do you want{'\n'}to use Endorsly?
          </Text>
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
                <View style={styles.iconPlaceholder} />
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
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: 48,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'InstrumentSerif-Regular', // Clash Display
    fontSize: 28,
    lineHeight: 36,
    color: colors.text,
    textAlign: 'center',
  },
  cards: {
    width: '100%',
    gap: 20,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 12,
    alignItems: 'flex-start',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.goldGlow,
    marginBottom: 4, // 12px gap minus standard 8px from gap if it wasn't flex
  },
  cardTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 20,
    color: colors.text,
  },
  cardDescription: {
    ...typography.bodySmall,
    fontSize: 14,
    lineHeight: 22,
    color: '#a1a1ab',
  },
  flexSpacer: {
    flex: 1,
    minHeight: 20,
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: colors.accent,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceActive,
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: colors.text,
  },
});
