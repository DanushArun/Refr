import React, { useCallback } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Avatar } from '../common/Avatar';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, layout } from '../../theme/spacing';
import { SwipeStamp } from './SwipeStamp';
import type { SwipeDirection } from './SwipeDeck';
import type { EndorserCard as EndorserCardData } from './endorserCardData';

const { width: WINDOW_WIDTH, height: WINDOW_HEIGHT } = Dimensions.get('window');
const COMMIT_THRESHOLD = WINDOW_WIDTH * 0.32;
const FLY_OFF_X = WINDOW_WIDTH * 1.3;

const CARD_HEIGHT = Math.min(580, Math.round(WINDOW_HEIGHT * 0.65));

interface EndorserCardProps {
  card: EndorserCardData;
  isTop: boolean;
  stackIndex: number;
  onSwiped: (direction: SwipeDirection) => void;
  onTap?: () => void;
}

export function EndorserCard({ card, isTop, stackIndex, onSwiped, onTap }: EndorserCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const commitHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
  }, []);

  const finishSwipe = useCallback(
    (direction: SwipeDirection) => onSwiped(direction),
    [onSwiped],
  );

  const gesture = Gesture.Pan()
    .enabled(isTop)
    .activeOffsetX([-15, 15])
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd((e) => {
      const { translationX, velocityX } = e;
      const shouldCommit =
        Math.abs(translationX) > COMMIT_THRESHOLD ||
        Math.abs(velocityX) > 800;

      if (shouldCommit) {
        const direction: SwipeDirection = translationX > 0 ? 'request' : 'pass';
        const target = translationX > 0 ? FLY_OFF_X : -FLY_OFF_X;
        runOnJS(commitHaptic)();
        // Heavy, satisfying spring physics
        translateX.value = withSpring(target, { stiffness: 300, damping: 25 }, () => {
          runOnJS(finishSwipe)(direction);
        });
        translateY.value = withSpring(translateY.value + 40, { stiffness: 300, damping: 25 });
      } else {
        translateX.value = withSpring(0, { stiffness: 300, damping: 25 });
        translateY.value = withSpring(0, { stiffness: 300, damping: 25 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    if (!isTop) {
      const scale = 1 - stackIndex * 0.05;
      const offsetY = stackIndex * 14;
      return {
        transform: [{ translateY: offsetY }, { scale }],
        opacity: stackIndex < 3 ? 1 : 0,
      };
    }
    const rotate = interpolate(
      translateX.value,
      [-WINDOW_WIDTH / 2, 0, WINDOW_WIDTH / 2],
      [-10, 0, 10],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.cardWrapper, cardStyle]}>
        {/* Diffuse ambient shadow */}
        <View style={styles.ambientShadow} />
        
        <View style={styles.glassContainer}>
          {/* Pure glass blur */}
          <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFillObject} />
          
          {/* Subtle base wash to ensure contrast against background */}
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(20, 20, 24, 0.4)' }]} />
          
          {/* Rim Lighting */}
          <View style={styles.rimLight} />
          
          {isTop && (
            <>
              <SwipeStamp translateX={translateX} kind="request" />
              <SwipeStamp translateX={translateX} kind="pass" />
            </>
          )}

          <Pressable onPress={isTop ? onTap : undefined} style={styles.tapArea}>
            {isTop ? (
              <>
                <View style={styles.header}>
                  <Avatar displayName={card.name} size="lg" />
                  <View style={styles.headMeta}>
                    <Text style={styles.name} numberOfLines={1}>{card.name}</Text>
                    <Text style={styles.role} numberOfLines={1}>
                      {card.jobTitle}
                    </Text>
                    <Text style={styles.company} numberOfLines={1}>
                      @ {card.companyName}
                    </Text>
                  </View>
                </View>

                <View style={styles.badges}>
                  <View style={styles.tag}>
                    <View style={[styles.tagDot, { backgroundColor: colors.success }]} />
                    <Text style={styles.tagText}>Verified</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Trust ★ {card.trustScore}</Text>
                  </View>
                </View>

                <View style={{ flex: 1 }} />

                {/* Skeuomorphic Match Score (The "Tachometer") */}
                <View style={styles.tachometerContainer}>
                  <Text style={styles.tachometerLabel}>MATCH SCORE</Text>
                  <View style={styles.tachometerValueRow}>
                    <Text style={styles.tachometerNumber}>{card.matchPercent}</Text>
                    <Text style={styles.tachometerPercent}>%</Text>
                  </View>
                  
                  {/* Recessed physical track */}
                  <View style={styles.recessedTrack}>
                    <View style={styles.recessedInnerShadow} />
                    {/* Glowing active fill */}
                    <View style={[styles.tachometerFill, { width: `${card.matchPercent}%` }]}>
                      {/* Leading edge glow (the "needle") */}
                      <View style={styles.tachometerNeedle} />
                    </View>
                  </View>
                </View>

                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValueBold}>{card.responseTime}</Text>
                    <Text style={styles.statLabelSmall}>Response</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statValueBold}>{card.acceptanceRate}%</Text>
                    <Text style={styles.statLabelSmall}>Accepts</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Text style={styles.statValueBold}>{card.hires}</Text>
                    <Text style={styles.statLabelSmall}>Hires</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.header}>
                <Avatar displayName={card.name} size="lg" />
                <View style={styles.headMeta}>
                   <Text style={styles.name} numberOfLines={1}>{card.name}</Text>
                </View>
              </View>
            )}
          </Pressable>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'absolute',
    left: layout.screenPaddingH,
    right: layout.screenPaddingH,
    top: 0,
    height: CARD_HEIGHT,
  },
  ambientShadow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    borderRadius: 36,
    opacity: 0.6,
    transform: [{ translateY: 24 }],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },
  glassContainer: {
    flex: 1,
    borderRadius: 36,
    overflow: 'hidden',
  },
  rimLight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 36,
    borderTopWidth: 1.5,
    borderTopColor: colors.glassHighlight,
    borderLeftWidth: 1,
    borderLeftColor: colors.borderStrong,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.04)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.02)',
    pointerEvents: 'none',
  },
  tapArea: { flex: 1, padding: 28 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
    marginBottom: spacing[5],
  },
  headMeta: { flex: 1, gap: 1 },
  name: {
    fontFamily: 'Outfit-Bold',
    fontSize: 26,
    color: colors.text,
    letterSpacing: -0.5,
  },
  role: {
    fontFamily: 'Outfit-Medium',
    color: colors.textSecondary,
    fontSize: 15,
  },
  company: {
    fontFamily: 'Outfit-Regular',
    color: colors.textTertiary,
    fontSize: 14,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    color: colors.textSecondary,
  },
  tachometerContainer: {
    alignItems: 'flex-end',
    marginBottom: 40,
  },
  tachometerLabel: {
    fontFamily: 'Outfit-Bold',
    fontSize: 11,
    letterSpacing: 2,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: -4,
  },
  tachometerValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tachometerNumber: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 72,
    lineHeight: 84,
    color: colors.text,
    letterSpacing: -2,
  },
  tachometerPercent: {
    fontFamily: 'Outfit-Bold',
    fontSize: 24,
    color: colors.accent,
    marginTop: 12,
    marginLeft: 4,
  },
  recessedTrack: {
    width: '100%',
    height: 12,
    backgroundColor: '#050505',
    borderRadius: 6,
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)', // Faux bottom highlight
  },
  recessedInnerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.8)',
    borderRadius: 6,
    zIndex: 10, // Sits above the fill to cast shadow down into the recess
  },
  tachometerFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 6,
    shadowColor: colors.accent,
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    justifyContent: 'center', // To align the needle
  },
  tachometerNeedle: {
    position: 'absolute',
    right: 2,
    width: 4,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    shadowColor: '#FFFFFF',
    shadowOpacity: 1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Deep inset
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 2,
    borderTopColor: 'rgba(0, 0, 0, 0.6)', // Inner shadow effect
  },
  statBox: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 4,
  },
  statValueBold: {
    fontFamily: 'JetBrainsMono-Medium',
    fontSize: 20,
    color: colors.text,
  },
  statLabelSmall: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});