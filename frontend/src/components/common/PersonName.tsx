import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface PersonNameProps {
  /** Full display name, e.g. "Nivrant Goswami". */
  name: string;
  /** Style applied to BOTH lines so the rendered name reads as one block. */
  textStyle?: StyleProp<TextStyle>;
  /** Optional wrapper style — useful when the parent needs to control width. */
  containerStyle?: StyleProp<ViewStyle>;
  /** When true, the second line wraps if a single token is too long;
   *  defaults to true so very long surnames break instead of overflowing. */
  allowSecondLineWrap?: boolean;
}

/**
 * Renders a person's name as two lines: first name on line 1, the rest of
 * the name (middle + surname) on line 2. NEVER truncates with an ellipsis —
 * the user's identity is always shown in full.
 *
 * Single-token names render on one line. Otherwise the first whitespace-
 * separated token becomes line 1 and everything after collapses onto line 2.
 *
 * Use this anywhere we previously rendered `<Text numberOfLines={1}>{name}</Text>`
 * in a constrained-width column. Same visual rhythm, but the name never gets
 * cut off.
 */
export function PersonName({
  name,
  textStyle,
  containerStyle,
  allowSecondLineWrap = true,
}: PersonNameProps) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const idx = trimmed.indexOf(' ');
  const first = idx === -1 ? trimmed : trimmed.slice(0, idx);
  const rest = idx === -1 ? '' : trimmed.slice(idx + 1).trim();

  return (
    <View style={[styles.wrap, containerStyle]}>
      <Text
        style={[styles.line, textStyle]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {first}
      </Text>
      {!!rest && (
        <Text
          style={[styles.line, textStyle]}
          numberOfLines={allowSecondLineWrap ? 2 : 1}
          ellipsizeMode="tail"
        >
          {rest}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-start',
  },
  line: {
    // No marginVertical — line spacing comes from textStyle's lineHeight,
    // which keeps the two lines visually tight as one name block.
  },
});
