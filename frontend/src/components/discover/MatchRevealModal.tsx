import React, { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '../../theme/colors';
import { layout, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Phrase } from '../../utils/haptics';
import { ProfileTile, RevealButton } from './MatchRevealElements';
import { ParticleField } from './MatchRevealParticles';

export interface MatchRevealData {
  referralId: string;
  seekerName: string;
  seekerAvatar?: string;
  endorserName: string;
  endorserAvatar?: string;
  targetRole?: string;
}

interface MatchRevealModalProps {
  match: MatchRevealData | null;
  onKeepReviewing: () => void;
  onOpenChat: (match: MatchRevealData) => void;
}

type ProfileMotionStyle = ReturnType<typeof useProfileMotion>;
type SealMotionStyle = ReturnType<typeof useSealMotion>;
type CopyMotionStyle = ReturnType<typeof useCopyMotion>;

export function MatchRevealModal({
  match,
  onKeepReviewing,
  onOpenChat,
}: MatchRevealModalProps): React.ReactElement {
  const active = match !== null;
  const progress = useSharedValue(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useReduceMotion(setReduceMotion);
  useRevealProgress(active, reduceMotion, progress);

  const leftCardStyle = useProfileMotion(progress, 'left');
  const rightCardStyle = useProfileMotion(progress, 'right');
  const sealStyle = useSealMotion(progress);
  const copyStyle = useCopyMotion(progress);

  const title = `You matched with ${firstName(match?.seekerName ?? 'this candidate')}`;
  const body = bodyFor(match);

  return (
    <MatchRevealShell
      active={active}
      reduceMotion={reduceMotion}
      seed={match?.referralId ?? 'idle'}
      onKeepReviewing={onKeepReviewing}
    >
      <MatchRevealScene
        copyStyle={copyStyle}
        leftCardStyle={leftCardStyle}
        match={match}
        rightCardStyle={rightCardStyle}
        sealStyle={sealStyle}
        body={body}
        title={title}
      />
      <MatchRevealActions
        copyStyle={copyStyle}
        match={match}
        onKeepReviewing={onKeepReviewing}
        onOpenChat={onOpenChat}
      />
    </MatchRevealShell>
  );
}

function MatchRevealShell({
  active,
  children,
  onKeepReviewing,
  reduceMotion,
  seed,
}: {
  active: boolean;
  children: React.ReactNode;
  onKeepReviewing: () => void;
  reduceMotion: boolean;
  seed: string;
}): React.ReactElement {
  return (
    <Modal
      animationType="none"
      onRequestClose={onKeepReviewing}
      presentationStyle="fullScreen"
      statusBarTranslucent
      transparent
      visible={active}
    >
      <SafeAreaView accessibilityViewIsModal style={styles.safe}>
        <LinearGradient
          colors={['#07140F', colors.background, colors.backgroundElevated]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {!reduceMotion && active && <ParticleField seed={seed} />}
        {children}
      </SafeAreaView>
    </Modal>
  );
}

function MatchRevealScene({
  body,
  copyStyle,
  leftCardStyle,
  match,
  rightCardStyle,
  sealStyle,
  title,
}: {
  body: string;
  copyStyle: CopyMotionStyle;
  leftCardStyle: ProfileMotionStyle;
  match: MatchRevealData | null;
  rightCardStyle: ProfileMotionStyle;
  sealStyle: SealMotionStyle;
  title: string;
}): React.ReactElement {
  return (
    <View style={styles.content}>
      <ProfileStage
        leftCardStyle={leftCardStyle}
        match={match}
        rightCardStyle={rightCardStyle}
        sealStyle={sealStyle}
      />
      <RevealCopy body={body} copyStyle={copyStyle} title={title} />
    </View>
  );
}

function ProfileStage({
  leftCardStyle,
  match,
  rightCardStyle,
  sealStyle,
}: {
  leftCardStyle: ProfileMotionStyle;
  match: MatchRevealData | null;
  rightCardStyle: ProfileMotionStyle;
  sealStyle: SealMotionStyle;
}): React.ReactElement {
  return (
    <View style={styles.cardsStage}>
      <Animated.View style={[styles.leftCard, leftCardStyle]}>
        <ProfileTile
          name={match?.endorserName ?? 'You'}
          uri={match?.endorserAvatar}
          variant="endorser"
        />
      </Animated.View>
      <Animated.View style={[styles.rightCard, rightCardStyle]}>
        <ProfileTile
          name={match?.seekerName ?? 'Candidate'}
          uri={match?.seekerAvatar}
          variant="seeker"
        />
      </Animated.View>
      <Animated.View style={[styles.seal, sealStyle]}>
        <Ionicons name="checkmark" size={30} color={colors.navyDeep} />
      </Animated.View>
    </View>
  );
}

function RevealCopy({
  body,
  copyStyle,
  title,
}: {
  body: string;
  copyStyle: CopyMotionStyle;
  title: string;
}): React.ReactElement {
  return (
    <Animated.View style={[styles.copy, copyStyle]}>
      <Text style={styles.eyebrow}>MUTUAL ENDORSEMENT</Text>
      <Text adjustsFontSizeToFit numberOfLines={2} style={styles.title}>
        {title}
      </Text>
      <Text style={styles.body}>{body}</Text>
    </Animated.View>
  );
}

function MatchRevealActions({
  copyStyle,
  match,
  onKeepReviewing,
  onOpenChat,
}: {
  copyStyle: CopyMotionStyle;
  match: MatchRevealData | null;
  onKeepReviewing: () => void;
  onOpenChat: (match: MatchRevealData) => void;
}): React.ReactElement {
  return (
    <Animated.View style={[styles.actions, copyStyle]}>
      <RevealButton
        icon="chatbubble-ellipses"
        label="Open chat"
        onPress={() => {
          if (match) onOpenChat(match);
        }}
        tone="primary"
      />
      <RevealButton
        icon="layers-outline"
        label="Keep reviewing"
        onPress={onKeepReviewing}
        tone="secondary"
      />
    </Animated.View>
  );
}

function useReduceMotion(setReduceMotion: (enabled: boolean) => void): void {
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (mounted) setReduceMotion(enabled);
      })
      .catch(reportReduceMotionError);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, [setReduceMotion]);
}

function useRevealProgress(
  active: boolean,
  reduceMotion: boolean,
  progress: SharedValue<number>,
): void {
  useEffect(() => {
    progress.value = 0;
    if (!active) return;
    void Phrase.match();
    progress.value = withTiming(1, {
      duration: reduceMotion ? 180 : 820,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, progress, reduceMotion]);
}

function useProfileMotion(progress: SharedValue<number>, side: 'left' | 'right') {
  const dir = side === 'left' ? -1 : 1;
  const fromRotate = side === 'left' ? -34 : 46;
  const toRotate = side === 'left' ? -10 : 15;
  return useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateX: interpolate(progress.value, [0, 1], [dir * 96, 0]) },
      { translateY: interpolate(progress.value, [0, 1], [-28, 0]) },
      { scale: interpolate(progress.value, [0, 1], [1.08, 1]) },
      { rotate: `${interpolate(progress.value, [0, 1], [fromRotate, toRotate])}deg` },
    ],
  }));
}

function useSealMotion(progress: SharedValue<number>) {
  return useAnimatedStyle(() => {
    const seal = interpolate(progress.value, [0, 0.52, 1], [0, 0, 1]);
    return {
      opacity: seal,
      transform: [{ scale: interpolate(seal, [0, 1], [0.55, 1]) }],
    };
  });
}

function useCopyMotion(progress: SharedValue<number>) {
  return useAnimatedStyle(() => {
    const copy = interpolate(progress.value, [0, 0.36, 1], [0, 0, 1]);
    return {
      opacity: copy,
      transform: [{ translateY: interpolate(copy, [0, 1], [18, 0]) }],
    };
  });
}

function firstName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return name;
  return trimmed.split(/\s+/)[0] ?? name;
}

function bodyFor(match: MatchRevealData | null): string {
  if (!match?.targetRole) {
    return 'They already requested your endorsement. Chat is ready.';
  }
  return `They already requested your endorsement for ${match.targetRole}. Chat is ready.`;
}

function reportReduceMotionError(error: unknown): void {
  if (__DEV__) {
    console.warn('Unable to read reduce motion preference', error);
  }
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingH,
  },
  cardsStage: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[9],
  },
  leftCard: {
    position: 'absolute',
    left: '20%',
  },
  rightCard: {
    position: 'absolute',
    right: '18%',
  },
  seal: {
    position: 'absolute',
    bottom: 24,
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 31,
    backgroundColor: colors.brass,
    borderWidth: 3,
    borderColor: 'rgba(244, 237, 221, 0.76)',
  },
  copy: {
    alignItems: 'center',
    gap: spacing[3],
  },
  eyebrow: {
    ...typography.sectionEyebrow,
    color: colors.brass,
  },
  title: {
    ...typography.h1,
    maxWidth: 330,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    maxWidth: 300,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    gap: spacing[3],
    paddingHorizontal: layout.screenPaddingH,
    paddingBottom: spacing[8],
  },
});
