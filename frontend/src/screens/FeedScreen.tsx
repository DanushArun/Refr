import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeed } from '../hooks/useFeed';
import { FeedList } from '../components/feed/FeedList';
import { Phrase } from '../utils/haptics';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { layout, rhythm, spacing } from '../theme/spacing';
import { Button } from '../components/common/Button';
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
        'Endorsement request sent',
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
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.wordmark}>ENDORSLY</Text>
        <Text style={styles.headerSub}>Tech · live feed</Text>
      </View>

      <FeedList
        cards={cards}
        loading={loading}
        refreshing={refreshing}
        hasMore={hasMore}
        onReferPress={handleReferPress}
        onFetchMore={fetchMore}
        onRefresh={() => {
          Phrase.pullRefresh();
          refresh();
        }}
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
                  Endorse {referModal.card.seekerName}?
                </Text>
                <Text style={styles.modalSubtitle}>
                  You'll be able to chat with them once they accept. Your Score
                  increases when you submit.
                </Text>

                <Text style={styles.modalMeta}>
                  {referModal.card.yearsOfExperience}y experience ·{' '}
                  {referModal.card.skills?.length ?? 0} skills
                </Text>

                <TextInput
                  style={styles.noteInput}
                  placeholder="Add a note to the Seeker (optional)..."
                  placeholderTextColor={colors.textTertiary}
                  value={referModal.note}
                  onChangeText={(v) => setReferModal((s) => ({ ...s, note: v }))}
                  multiline
                  numberOfLines={3}
                  maxLength={500}
                />

                <Button
                  label={referModal.submitting ? 'Sending...' : 'Send endorsement request'}
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
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: layout.screenPaddingH,
    paddingTop: rhythm.screenTop,
    paddingBottom: rhythm.headerBottom,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  wordmark: {
    fontFamily: 'Outfit-Bold',
    fontSize: 22,
    color: colors.text,
    letterSpacing: 0,
  },
  headerSub: {
    ...typography.caption,
    color: colors.textTertiary,
    letterSpacing: 0,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.backgroundElevated,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(244, 237, 221, 0.16)',
    padding: layout.screenPaddingH,
    paddingTop: spacing[5],
    gap: spacing[4],
    paddingBottom: Platform.OS === 'ios' ? spacing[10] : spacing[6],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.22,
    shadowRadius: 26,
    elevation: 18,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(244, 237, 221, 0.20)',
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
  modalMeta: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  noteInput: {
    backgroundColor: 'rgba(244, 237, 221, 0.075)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(244, 237, 221, 0.16)',
    borderRadius: 18,
    padding: spacing[4],
    color: colors.text,
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    lineHeight: 21,
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
