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
import { Button } from '../../src/components/common/Button';

type Role = 'seeker' | 'referrer';

const ROLES: Array<{
  id: Role;
  title: string;
  subtitle: string;
  description: string;
}> = [
  {
    id: 'seeker',
    title: 'I am looking',
    subtitle: 'Job Seeker',
    description: 'Get referred to Bangalore\'s best tech companies. Your story reaches referrers at places you want to work.',
  },
  {
    id: 'referrer',
    title: 'I can refer',
    subtitle: 'Referrer',
    description: 'Help talented engineers land at great companies. Build your Kingmaker reputation as someone who makes careers happen.',
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
          <Text style={styles.wordmark}>REFR</Text>
          <Text style={styles.question}>How do you want to use REFR?</Text>
          <Text style={styles.hint}>You can change this later in settings.</Text>
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
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                    {role.title}
                  </Text>
                  <View style={[styles.badge, isSelected && styles.badgeSelected]}>
                    <Text style={[styles.badgeText, isSelected && styles.badgeTextSelected]}>
                      {role.subtitle}
                    </Text>
                  </View>
                </View>
                <Text style={styles.cardDescription}>{role.description}</Text>

                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Button
            label="Continue"
            onPress={handleContinue}
            variant="primary"
            size="large"
            fullWidth
            disabled={!selected}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingH,
    paddingVertical: layout.screenPaddingV,
  },
  header: {
    gap: spacing[2],
    marginBottom: spacing[10],
  },
  wordmark: {
    ...typography.h3,
    color: colors.accent,
    letterSpacing: 4,
    marginBottom: spacing[4],
  },
  question: {
    ...typography.h2,
    color: colors.text,
  },
  hint: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  cards: {
    flex: 1,
    gap: spacing[4],
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: layout.cardBorderRadius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: layout.cardPadding,
    gap: spacing[3],
    position: 'relative',
  },
  cardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...typography.h4,
    color: colors.text,
  },
  cardTitleSelected: {
    color: colors.text,
  },
  badge: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: 100,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeSelected: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  badgeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  badgeTextSelected: {
    color: colors.text,
  },
  cardDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: colors.text,
    fontSize: 13,
    fontFamily: 'Outfit-Bold',
  },
  footer: {
    paddingTop: spacing[6],
  },
});
