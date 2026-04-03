import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

export default function ActiveRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Active Referrals</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  text: { ...typography.h4, color: colors.textSecondary },
});