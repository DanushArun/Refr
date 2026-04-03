import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

type TagColor = 'blue' | 'green' | 'orange' | 'purple' | 'default';

interface TagProps {
  label: string;
  color?: TagColor;
  style?: StyleProp<ViewStyle>;
}

const colorMap: Record<TagColor, { bg: string; text: string; border: string }> = {
  blue: {
    bg: colors.tagBlue,
    text: colors.tagBlueText,
    border: 'rgba(59, 130, 246, 0.3)',
  },
  green: {
    bg: colors.tagGreen,
    text: colors.tagGreenText,
    border: 'rgba(34, 197, 94, 0.25)',
  },
  orange: {
    bg: colors.tagOrange,
    text: colors.tagOrangeText,
    border: 'rgba(249, 115, 22, 0.3)',
  },
  purple: {
    bg: colors.tagPurple,
    text: colors.tagPurpleText,
    border: 'rgba(124, 58, 237, 0.3)',
  },
  default: {
    bg: colors.surface,
    text: colors.textSecondary,
    border: colors.border,
  },
};

/**
 * Tag — skill chip / department tag.
 * Used on CareerStoryCard to display skills and on CompanyIntelCard for topic tags.
 */
export function Tag({ label, color = 'default', style }: TagProps) {
  const c = colorMap[color];
  return (
    <View
      style={[
        styles.tag,
        { backgroundColor: c.bg, borderColor: c.border },
        style,
      ]}
    >
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
    </View>
  );
}

/** Render a row of Tag chips with wrapping. */
export function TagRow({
  tags,
  color,
  max,
}: {
  tags: string[];
  color?: TagColor;
  max?: number;
}) {
  const visible = max ? tags.slice(0, max) : tags;
  const overflow = max && tags.length > max ? tags.length - max : 0;

  return (
    <View style={styles.row}>
      {visible.map((t) => (
        <Tag key={t} label={t} color={color} />
      ))}
      {overflow > 0 && (
        <Tag label={`+${overflow}`} color="default" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: 'Outfit-Medium',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[1.5],
  },
});
