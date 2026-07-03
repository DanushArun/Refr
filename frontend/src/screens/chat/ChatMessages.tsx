import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Skeleton } from '../../components/common/Skeleton';
import { colors } from '../../theme/colors';
import { chatStyles as styles } from './chatStyles';
import {
  DeliveryState,
  formatGroupTime,
  GroupedMessage,
} from './chatLogic';
import { keyReactions } from './chatReactionKeys';

interface MessageListProps {
  groups: GroupedMessage[];
  loading: boolean;
  viewerId: string;
  deliveryStates: Record<string, DeliveryState>;
  reactions: Record<string, string[]>;
  typing: boolean;
  onLongPress: (messageId: string) => void;
}

export function MessageList(props: MessageListProps): React.ReactElement {
  const listRef = useRef<FlatList<GroupedMessage>>(null);
  const keyExtractor = useCallback((group: GroupedMessage) => group.id, []);

  useEffect(() => {
    const timer = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [props.groups.length, props.typing]);

  const renderItem = useCallback(
    ({ item }: { item: GroupedMessage }) => (
      <MessageGroup
        group={item}
        viewerId={props.viewerId}
        deliveryStates={props.deliveryStates}
        reactions={props.reactions}
        onLongPress={props.onLongPress}
      />
    ),
    [props.deliveryStates, props.onLongPress, props.reactions, props.viewerId],
  );

  return (
    <FlatList
      ref={listRef}
      data={props.groups}
      keyExtractor={keyExtractor}
      style={styles.messageViewport}
      contentContainerStyle={styles.messageList}
      showsVerticalScrollIndicator={false}
      onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
      renderItem={renderItem}
      ListEmptyComponent={props.loading ? <MessageSkeletons /> : null}
      ListFooterComponent={props.typing ? <TypingBubble /> : null}
      removeClippedSubviews={true}
      initialNumToRender={12}
      maxToRenderPerBatch={8}
      windowSize={9}
    />
  );
}

function MessageSkeletons(): React.ReactElement {
  return (
    <View style={styles.messageSkeletonWrap}>
      <View style={styles.skeletonTheirs}>
        <Skeleton width="68%" height={38} radius={18} />
        <Skeleton width="48%" height={34} radius={18} />
      </View>
      <View style={styles.skeletonMine}>
        <Skeleton width="58%" height={38} radius={18} />
      </View>
      <View style={styles.skeletonTheirs}>
        <Skeleton width="76%" height={38} radius={18} />
        <Skeleton width="42%" height={34} radius={18} />
      </View>
    </View>
  );
}

const MessageGroup = React.memo(function MessageGroup({
  group,
  viewerId,
  deliveryStates,
  reactions,
  onLongPress,
}: {
  group: GroupedMessage;
  viewerId: string;
  deliveryStates: Record<string, DeliveryState>;
  reactions: Record<string, string[]>;
  onLongPress: (messageId: string) => void;
}): React.ReactElement {
  const mine = group.senderId === viewerId;

  if (group.isSystem) return <SystemGroup group={group} />;

  const lastBubbleId = group.bodies[group.bodies.length - 1].id;
  const lastDelivery = deliveryStates[lastBubbleId];

  return (
    <View style={[styles.groupWrap, mine ? styles.groupMine : styles.groupTheirs]}>
      <BubbleCluster
        group={group}
        mine={mine}
        reactions={reactions}
        onLongPress={onLongPress}
      />
      <View style={[styles.groupMeta, mine && styles.groupMetaMine]}>
        <Text style={styles.groupTime}>{formatGroupTime(group.endedAt)}</Text>
        {mine && <DeliveryTicks state={lastDelivery} />}
      </View>
    </View>
  );
});

function SystemGroup({ group }: { group: GroupedMessage }): React.ReactElement {
  return (
    <View style={styles.systemRow}>
      <View style={styles.systemPill}>
        <Text style={styles.systemText}>{group.bodies[0].body}</Text>
      </View>
    </View>
  );
}

function BubbleCluster({
  group,
  mine,
  reactions,
  onLongPress,
}: {
  group: GroupedMessage;
  mine: boolean;
  reactions: Record<string, string[]>;
  onLongPress: (messageId: string) => void;
}): React.ReactElement {
  return (
    <>
      {group.bodies.map((body, index) => (
        <MessageBubble
          key={body.id}
          body={body}
          index={index}
          total={group.bodies.length}
          mine={mine}
          reactions={reactions[body.id] ?? []}
          onLongPress={onLongPress}
        />
      ))}
    </>
  );
}

function MessageBubble({
  body,
  index,
  total,
  mine,
  reactions,
  onLongPress,
}: {
  body: { id: string; body: string };
  index: number;
  total: number;
  mine: boolean;
  reactions: string[];
  onLongPress: (messageId: string) => void;
}): React.ReactElement {
  const alignment = { alignItems: mine ? 'flex-end' : 'flex-start' } as const;
  return (
    <View style={alignment}>
      <Pressable
        onLongPress={() => onLongPress(body.id)}
        delayLongPress={300}
        style={bubbleStyle({ mine, index, total })}
      >
        <Text style={[styles.bubbleText, mine ? styles.textMine : styles.textTheirs]}>
          {body.body}
        </Text>
      </Pressable>
      <ReactionRow mine={mine} reactions={reactions} />
    </View>
  );
}

function ReactionRow({
  mine,
  reactions,
}: {
  mine: boolean;
  reactions: string[];
}): React.ReactElement | null {
  if (reactions.length === 0) return null;

  return (
    <View style={[styles.reactionRow, mine ? styles.reactionRowMine : styles.reactionRowTheirs]}>
      {keyReactions(reactions).map((reaction) => (
        <Text key={reaction.key} style={styles.reactionBadgeText}>
          {reaction.emoji}
        </Text>
      ))}
    </View>
  );
}

function DeliveryTicks({ state }: { state?: DeliveryState }): React.ReactElement | null {
  if (!state) return null;
  if (state === 'sending') return <TickIcon name="time-outline" size={11} />;
  if (state === 'sent') return <TickIcon name="checkmark" size={13} />;

  const color = state === 'read' ? colors.pipelineAccepted : colors.textTertiary;
  return (
    <View style={{ flexDirection: 'row', marginLeft: 4 }}>
      <Ionicons name="checkmark-done" size={13} color={color} />
    </View>
  );
}

function TickIcon({
  name,
  size,
}: {
  name: 'time-outline' | 'checkmark';
  size: number;
}): React.ReactElement {
  return (
    <Ionicons
      name={name}
      size={size}
      color={colors.textTertiary}
      style={{ marginLeft: 4 }}
    />
  );
}

function TypingBubble(): React.ReactElement {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startDotLoop(dot1, 0);
    startDotLoop(dot2, 150);
    startDotLoop(dot3, 300);
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingRow}>
      <View style={styles.typingBubble}>
        <Animated.View style={[styles.typingDot, typingDotStyle(dot1)]} />
        <Animated.View style={[styles.typingDot, typingDotStyle(dot2)]} />
        <Animated.View style={[styles.typingDot, typingDotStyle(dot3)]} />
      </View>
    </View>
  );
}

function startDotLoop(value: Animated.Value, delay: number): void {
  Animated.loop(
    Animated.sequence([
      Animated.timing(value, {
        toValue: 1,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
        delay,
      }),
      Animated.timing(value, {
        toValue: 0,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]),
  ).start();
}

function typingDotStyle(value: Animated.Value): object {
  return {
    opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [
      { translateY: value.interpolate({ inputRange: [0, 1], outputRange: [0, -3] }) },
    ],
  };
}

function bubbleStyle(args: {
  mine: boolean;
  index: number;
  total: number;
}): object[] {
  const { mine, index, total } = args;
  return [
    styles.bubble,
    mine ? styles.bubbleMine : styles.bubbleTheirs,
    tailStyle(mine, index, total),
    index > 0 ? { marginTop: 2 } : {},
  ];
}

function tailStyle(mine: boolean, index: number, total: number): object {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  if (mine && isFirst) return styles.bubbleMineFirst;
  if (mine && isLast) return styles.bubbleMineLast;
  if (mine) return styles.bubbleMineMiddle;
  if (isFirst) return styles.bubbleTheirsFirst;
  if (isLast) return styles.bubbleTheirsLast;
  return styles.bubbleTheirsMiddle;
}
