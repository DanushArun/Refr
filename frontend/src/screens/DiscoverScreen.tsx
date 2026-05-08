import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SwipeDeck } from '../components/discover/SwipeDeck';
import { EndorserCard as EndorserCardView } from '../components/discover/EndorserCard';
import { EndorserProfileSheet } from '../components/discover/ProfileSheet';
import {
  buildEndorserCards,
  type EndorserCard,
} from '../components/discover/endorserCardData';
import { referralsApi } from '../services/api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';

const COMPANIES = ['All', 'Google', 'Flipkart', 'Razorpay', 'Swiggy'];

export function DiscoverScreen() {
  const [queueKey, setQueueKey] = useState(0);
  const cards = useMemo(() => buildEndorserCards('1'), [queueKey]);
  const [index, setIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('All');
  const [previewCard, setPreviewCard] = useState<EndorserCard | null>(null);

  const remainingSwipes = Math.max(0, cards.length - index);
  const requestsLeft = 7;

  const commitSwipe = useCallback(
    (card: EndorserCard, direction: 'request' | 'pass') => {
      if (direction === 'request') {
        referralsApi
          .recordSeekerSwipe(
            {
              id: card.id,
              name: card.name,
              companyId: card.companyId,
              companyName: card.companyName,
              jobTitle: card.jobTitle,
            },
            `Hi ${card.name.split(' ')[0]}, saw your profile — would love an endorsement for ${card.companyName}.`,
          )
          .catch(() => {});
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      setIndex((i) => i + 1);
    },
    [],
  );

  const handleRefresh = useCallback(() => {
    setQueueKey((k) => k + 1);
    setIndex(0);
  }, []);

  const handleCardTap = useCallback((card: EndorserCard) => {
    setPreviewCard(card);
  }, []);

  const handlePreviewCommit = useCallback(
    (direction: 'request' | 'pass') => {
      if (previewCard) commitSwipe(previewCard, direction);
      setPreviewCard(null);
    },
    [previewCard, commitSwipe],
  );

  return (
    <View style={styles.container}>
      {/* Ambient background light to refract through the glass cards */}
      <LinearGradient
        colors={['rgba(0, 229, 255, 0.15)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 0.8 }}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.wordmark}>ENDORSLY</Text>
          <View style={styles.headerIcons}>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="options-outline" size={22} color={colors.text} />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {COMPANIES.map((company) => (
              <Pressable
                key={company}
                onPress={() => setActiveFilter(company)}
                style={[
                  styles.filterChip,
                  activeFilter === company && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === company && styles.filterTextActive,
                  ]}
                >
                  {company}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.deckFrame}>
          <SwipeDeck<EndorserCard>
            items={cards}
            index={index}
            keyOf={(c) => c.id}
            onSwipe={commitSwipe}
            onCardTap={handleCardTap}
            onRefresh={handleRefresh}
            emptyTitle="You're caught up"
            emptyBody="No more Endorsers in today's queue. Check back later, or broaden your target companies."
            renderCard={({ item, isTop, stackIndex, onSwiped, onTap }) => (
              <EndorserCardView
                card={item}
                isTop={isTop}
                stackIndex={stackIndex}
                onSwiped={onSwiped}
                onTap={onTap}
              />
            )}
          />
          <View style={styles.remainingBadge}>
            <Text style={styles.remainingText}>{remainingSwipes} remaining swipes</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.requestsLeft}>{requestsLeft} requests left today</Text>
        </View>

        <EndorserProfileSheet
          visible={previewCard !== null}
          card={previewCard}
          onClose={() => setPreviewCard(null)}
          onPass={() => handlePreviewCommit('pass')}
          onCommit={() => handlePreviewCommit('request')}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  wordmark: {
    fontFamily: 'Outfit-Bold',
    fontSize: 20,
    color: colors.text,
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterContainer: {
    height: 54,
    marginTop: 4,
  },
  filterScroll: {
    paddingHorizontal: layout.screenPaddingH,
    alignItems: 'center',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  filterChipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  filterText: {
    fontFamily: 'Outfit-Medium',
    color: colors.textSecondary,
    fontSize: 14,
  },
  filterTextActive: {
    color: '#000000', // Deep contrast against the cyan background
    fontFamily: 'Outfit-Bold',
  },
  deckFrame: {
    flex: 1,
    marginTop: spacing[2],
  },
  remainingBadge: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(10, 10, 11, 0.8)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  remainingText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 11,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footer: {
    paddingBottom: spacing[4],
    alignItems: 'center',
  },
  requestsLeft: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    color: colors.textTertiary,
  },
});
