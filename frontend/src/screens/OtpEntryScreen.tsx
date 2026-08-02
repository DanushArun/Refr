import { useState, type ReactElement } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightJourney } from '../theme/lightJourney';
import { otpDigits } from './otpEntry';

function Header(): ReactElement {
  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel="Back" accessibilityRole="button" onPress={() => router.back()} style={styles.iconAction}>
        <Ionicons color={lightJourney.ink} name="arrow-back" size={22} />
      </Pressable>
      <Text accessibilityRole="header" style={styles.wordmark}>Endorsly</Text>
      <View style={styles.iconAction}>
        <Ionicons color={lightJourney.ink} name="shield-checkmark-outline" size={22} />
      </View>
    </View>
  );
}

export function OtpEntryScreen(): ReactElement {
  const [code, setCode] = useState('286417');
  const digits = otpDigits(code);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <Header />
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.heading}>Verify your number</Text>
        <Text style={styles.subheading}>We’ve sent a 6-digit code to{`\n`}<Text style={styles.phone}>+91 98765 43210</Text></Text>
        <View style={styles.codeRow}>
          {digits.map((digit, index) => <View key={`${digit}-${index}`} style={styles.codeBox}><Text style={styles.codeDigit}>{digit}</Text></View>)}
        </View>
        <TextInput accessibilityLabel="Verification code" keyboardType="number-pad" maxLength={6} onChangeText={setCode} style={styles.hiddenInput} value={code} />
        <View style={styles.expiry}><Ionicons color={lightJourney.textMuted} name="time-outline" size={15} /><Text style={styles.expiryText}>Code expires in 01:46</Text></View>
        <Pressable accessibilityLabel="Paste code from messages" accessibilityRole="button" onPress={() => setCode('286417')} style={styles.pasteCard}>
          <Ionicons color={lightJourney.ink} name="copy-outline" size={27} />
          <View><Text style={styles.pasteTitle}>Paste from messages</Text><Text style={styles.pasteSubtitle}>iOS will fill code automatically</Text></View>
        </Pressable>
        <Pressable accessibilityLabel="Change phone number" accessibilityRole="button" onPress={() => router.back()} style={styles.changeAction}>
          <Text style={styles.changeText}>Change number</Text>
        </Pressable>
      </View>
      <View style={styles.footer}>
        <Pressable accessibilityLabel="Verify and continue" accessibilityRole="button" onPress={() => router.push('/(auth)/entry-welcome')} style={({ pressed }) => [styles.verifyAction, pressed && styles.verifyPressed]}>
          <Text style={styles.verifyText}>Verify &amp; continue</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: lightJourney.background, flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', minHeight: 56, paddingHorizontal: 18 },
  iconAction: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  wordmark: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 27 },
  content: { alignItems: 'center', flex: 1, paddingHorizontal: 28, paddingTop: 74 },
  heading: { color: lightJourney.ink, fontFamily: 'IBMPlexSerif-Medium', fontSize: 35 },
  subheading: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 15, lineHeight: 22, marginTop: 13, textAlign: 'center' },
  phone: { color: lightJourney.ink, fontFamily: 'TikTokSans-Semibold' },
  codeRow: { flexDirection: 'row', gap: 8, marginTop: 32 },
  codeBox: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.6)', borderColor: lightJourney.border, borderRadius: 8, borderWidth: 1, height: 55, justifyContent: 'center', width: 36 },
  codeDigit: { color: lightJourney.ink, fontFamily: 'TikTokSans-Regular', fontSize: 21 },
  hiddenInput: { height: 1, opacity: 0, width: 1 },
  expiry: { alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 12 },
  expiryText: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 12 },
  pasteCard: { alignItems: 'center', borderColor: lightJourney.border, borderRadius: 10, borderWidth: 1, flexDirection: 'row', gap: 14, marginTop: 31, minHeight: 62, paddingHorizontal: 18, width: '80%' },
  pasteTitle: { color: lightJourney.ink, fontFamily: 'TikTokSans-Medium', fontSize: 14 },
  pasteSubtitle: { color: lightJourney.textMuted, fontFamily: 'TikTokSans-Regular', fontSize: 11, marginTop: 3 },
  changeAction: { alignItems: 'center', justifyContent: 'center', marginTop: 13, minHeight: 44 },
  changeText: { color: lightJourney.blue, fontFamily: 'TikTokSans-Medium', fontSize: 12 },
  footer: { paddingBottom: 18, paddingHorizontal: 24 },
  verifyAction: { alignItems: 'center', backgroundColor: lightJourney.blue, borderRadius: 17, height: 56, justifyContent: 'center' },
  verifyPressed: { backgroundColor: lightJourney.bluePressed, transform: [{ scale: 0.98 }] },
  verifyText: { color: '#FFFFFF', fontFamily: 'TikTokSans-Semibold', fontSize: 16 },
});
