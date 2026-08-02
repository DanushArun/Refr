import { useState, type ReactElement } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatIndianPhone } from './phoneEntry';
import { lightJourney } from '../theme/lightJourney';

function AppHeader(): ReactElement {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Back"
        accessibilityRole="button"
        hitSlop={10}
        onPress={() => router.back()}
        style={styles.backAction}
      >
        <Ionicons color={lightJourney.ink} name="arrow-back" size={22} />
      </Pressable>
      <Text accessibilityRole="header" style={styles.wordmark}>Endorsly</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

export function PhoneEntryScreen(): ReactElement {
  const [phone, setPhone] = useState('98765 43210');
  const canSubmit = phone.replace(/\D/g, '').length === 10;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoider}
      >
        <AppHeader />
        <View style={styles.content}>
          <View style={styles.copy}>
            <Text accessibilityRole="header" style={styles.heading}>Let’s get started</Text>
            <Text style={styles.subheading}>Enter your mobile number{`\n`}to create your account.</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.countryCode}>+91⌄</Text>
            <View style={styles.fieldDivider} />
            <TextInput
              accessibilityLabel="Mobile number"
              autoFocus={false}
              keyboardType="phone-pad"
              maxLength={11}
              onChangeText={(value) => setPhone(formatIndianPhone(value))}
              selectionColor={lightJourney.blue}
              style={styles.input}
              value={phone}
            />
          </View>
          <View style={styles.privacyNote}>
            <Ionicons color={lightJourney.ink} name="lock-closed-outline" size={18} />
            <Text style={styles.privacyCopy}>
              We’ll never share your number.{`\n`}See our <Text style={styles.privacyLink}>Privacy Policy.</Text>
            </Text>
          </View>
        </View>
        <View style={styles.actionArea}>
          <Pressable
            accessibilityLabel="Send code"
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit }}
            disabled={!canSubmit}
            onPress={() => router.push('/(auth)/otp')}
            style={({ pressed }) => [
              styles.sendAction,
              !canSubmit && styles.sendDisabled,
              pressed && styles.sendPressed,
            ]}
          >
            <Text style={styles.sendText}>Send code</Text>
          </Pressable>
          <Text style={styles.rateNotice}>Standard message and data rates may apply.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  keyboardAvoider: { flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 18,
  },
  backAction: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  headerSpacer: { width: 44 },
  content: { alignItems: 'center', flex: 1, paddingHorizontal: 36, paddingTop: 96 },
  copy: { alignItems: 'center' },
  heading: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 35 },
  subheading: {
    color: lightJourney.textMuted,
    fontFamily: 'TikTokSans-Regular',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },
  field: {
    alignItems: 'center',
    borderColor: '#7892B8',
    borderRadius: 9,
    borderWidth: 1,
    flexDirection: 'row',
    height: 56,
    marginTop: 28,
    paddingHorizontal: 14,
    width: '100%',
  },
  countryCode: { color: lightJourney.ink, fontFamily: 'TikTokSans-Medium', fontSize: 15 },
  fieldDivider: { backgroundColor: lightJourney.border, height: 24, marginHorizontal: 12, width: 1 },
  input: { color: lightJourney.ink, flex: 1, fontFamily: 'TikTokSans-Regular', fontSize: 16 },
  privacyNote: { alignItems: 'center', flexDirection: 'row', marginTop: 18 },
  privacyCopy: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, lineHeight: 16, marginLeft: 8 },
  privacyLink: { color: lightJourney.blue, fontFamily: 'TikTokSans-Medium' },
  actionArea: { paddingBottom: 18, paddingHorizontal: 24 },
  sendAction: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 17, height: 56, justifyContent: 'center' },
  sendDisabled: { opacity: 0.45 },
  sendPressed: { backgroundColor: lightJourney.bluePressed, transform: [{ scale: 0.98 }] },
  sendText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 16 },
  rateNotice: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 10, marginTop: 9, textAlign: 'center' },
});
