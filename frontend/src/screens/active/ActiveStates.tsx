import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/common/Button';
import { colors } from '../../theme/colors';
import { activeStyles as styles } from './activeStyles';

export function LoadingState(): React.ReactElement {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  );
}

export function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}): React.ReactElement {
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Pipeline</Text>
      </View>
      <EmptyState title="Something went wrong" body={error}>
        <Button label="Retry" onPress={onRetry} variant="primary" size="medium" />
      </EmptyState>
    </SafeAreaView>
  );
}

export function EmptyState({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}): React.ReactElement {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {children}
    </View>
  );
}
