import React from 'react';
import { Text, View } from 'react-native';

import { activeStyles as styles } from './activeStyles';

export function NoticePill({ message }: { message: string }): React.ReactElement {
  return (
    <View style={styles.noticePill}>
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
}
