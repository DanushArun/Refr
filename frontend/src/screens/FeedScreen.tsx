import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Modal,
  Pressable,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useFeed } from '../hooks/useFeed';
import { FeedList } from '../components/feed/FeedList';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, layout } from '../theme/spacing';
import { Button } from '../components/common/Button';
import { StatCard } from '../components/common/StatCard';
import { referralsApi } from '../services/api';
import type { FeedCard } from '@refr/shared';

export function FeedScreen() {
  const { cards, loading, refreshing, hasMore, error, fetchMore, refresh } = useFeed();

  // Trigger initial load on mount
  useEffect(() => {
    fetchMore();
  }, []);

  const [referModal, setReferModal] = useState<{
    visible: boolean;
    card: FeedCard | null;
    note: string;
    submitting: boolean;
  }>({ visible: false, card: null, note: '', submitting: false });

  const handleReferPress = useCallback((card: FeedCard) => {
    setReferModal({ visible: true, card, note: '', submitting: false });
  }, []);

  const handleReferSubmit = useCallback(async () => {
    const { card, note } = referModal;
    if (!card || card.type !== 'career_story') return;

    setReferModal((s) => ({ ...s, submitting: true }));
    try {
      await referralsApi.createRequest({
        feedCardId: card.id,
        targetRole: card.targetRoles?.[0] ?? 'Software Engineer',
        seekerNote: note,
        card,
      });
      setReferModal({ visible: false, card: null, note: '', submitting: false });
      Alert.alert(
        'Referral request sent',
        'The seeker will be notified. You can chat once they respond.',
      );
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to send request');
      setReferModal((s) => ({ ...s, submitting: false }));
    }
  }, [referModal]);

  const handleCloseModal = () => {
    if (!referModal.submitting) {
      setReferModal({ visible: false, card: null, note: '', submitting: false });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.wordmark}>REFR</Text>
        <Text style={styles.headerSub}>Bangalore tech · live feed</Text>
      </View>

      <FeedList
        cards={cards}
        loading={loading}
        refreshing={refreshing}
        hasMore={hasMore}
        onReferPress={handleReferPress}
        onFetchMore={fetchMore}
        onRefresh={refresh}
      />

      {/* Referral initiation modal — bottom sheet style */}
      <Modal
        visible={referModal.visible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <Pressable style={styles.modalBackdrop} onPress={handleCloseModal}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            {referModal.card?.type === 'career_story' && (
              <>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>
                  Refer {referModal.card.seekerName}?
                </Text>
                <Text style={styles.modalSubtitle}>
                  You'll be able to chat with them once they accept. Your Kingmaker Score increases when you submit.
                </Text>

                <View style={styles.seekerStats}>
                  <StatCard
                    label="Experience"
                    value={`${referModal.card.yearsOfExperience}y`}
                  />
                  <StatCard
                    label="Skills"
                    value={String(referModal.card.skills?.length ?? 0)}
                  />
                </View>

                <TextInput
                  style={styles.noteInput}
                  placeholder="Add a note to the seeker (optional)..."
                  placeholderTextColor={colors.textTertiary}
                  value={referModal.note}
                  onChangeText={(v) => setReferModal((s) => ({ ...s, note: v }))}
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />

                <Button
                  label={referModal.submitting ? 'Sending...' : 'Send referral request'}
                  onPress={handleReferSubmit}
                  variant="primary"
                  size="large"
                  fullWidth
                  disabled={referModal.submitting}
                />
                <Button
                  label="Cancel"
                  onPress={handleCloseModal}
                  variant="text"
                  size="medium"
                  fullWidth
                  disabled={referModal.submitting}
                />
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  wordmark: {
    fontFamily: 'Outfit-Bold',
    fontSize: 22,
    color: colors.text,
    letterSpacing: 3,
  },
  headerSub: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.backgroundElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: layout.screenPaddingH,
    paddingTop: spacing[5],
    gap: spacing[4],
    paddingBottom: Platform.OS === 'ios' ? spacing[10] : spacing[6],
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing[2],
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text,
  },
  modalSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  seekerStats: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  noteInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 12,
    padding: spacing[4],
    color: colors.text,
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
