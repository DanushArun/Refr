import type { ReactElement } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightJourney } from '../theme/lightJourney';
import type { TrackingState } from './tracking/trackingModel';

type Props = { state: TrackingState };

const stages = ['Matched', 'Referred', 'Recruiter review', 'Interview', 'Decision'];

function Header(): ReactElement {
  return <View style={s.header}><Pressable accessibilityLabel="Back" onPress={() => router.back()} style={s.icon}><Ionicons color={lightJourney.ink} name="arrow-back" size={22} /></Pressable><Text style={s.wordmark}>Endorsly</Text><View style={s.icon}><Ionicons color={lightJourney.ink} name="shield-checkmark-outline" size={22} /></View></View>;
}

function Button({ label, path }: { label: string; path: string }): ReactElement {
  return <Pressable accessibilityLabel={label} onPress={() => router.push(path as never)} style={s.primary}><Text style={s.primaryText}>{label}</Text></Pressable>;
}

function Shared(): ReactElement {
  return <View style={s.center}><View style={s.success}><Ionicons color={lightJourney.green} name="shield-checkmark-outline" size={38} /></View><Text style={s.hero}>Secure package shared</Text><Text style={s.copy}>Arjun has shared your verified details{`\n`}19 Jun 2026 · 10:42 AM</Text><Text style={s.copy}>You’re all set. Arjun can now start your referral.</Text><Text style={s.privacy}>♙  Your data is private and encrypted.{`\n`}    Endorsly never shares without consent.</Text><Button label="Return to chat" path="/chat?referralId=razorpay-spm" /></View>;
}

function Submitted(): ReactElement {
  return <View style={s.center}><View style={s.success}><Ionicons color={lightJourney.orange} name="checkmark" size={38} /></View><Text style={s.hero}>Arjun submitted{`\n`}your referral</Text><Text style={s.copy}>Great news! Arjun has submitted your referral to Razorpay.</Text><View style={s.card}><Text style={s.cardTitle}>◢  Senior Product Manager</Text><Text style={s.copy}>Razorpay</Text><Divider /><Pair left="Submitted on" right="19 Jun 2026 · 10:42 AM" /><Pair left="Reference ID" right="END-RZP-061926" /><Pair left="Next step" right="Recruiter review" /><Pair left="What happens next?" right="The Razorpay team will review your application." /></View><Button label="Track application" path="/application/razorpay-spm" /></View>;
}

function Pair({ left, right }: { left: string; right: string }): ReactElement { return <View style={s.pair}><Text style={s.small}>{left}</Text><Text style={s.pairRight}>{right}</Text></View>; }
function Divider(): ReactElement { return <View style={s.divider} />; }

function Overview(): ReactElement {
  return <ScrollView contentContainerStyle={s.content}><Text style={s.hero}>Activity overview</Text><Text style={s.copy}>Stay up to date on your applications.</Text><Text style={s.section}>Active applications                                  View all</Text><Pressable onPress={() => router.push('/application/razorpay-spm')} style={s.card}><Text style={s.cardTitle}>◢  Razorpay</Text><Text style={s.copy}>Senior Product Manager</Text><Text style={s.badge}>Referral submitted</Text><Divider /><Pair left="Last update" right="19 Jun 2026" /><Pair left="Next expected action" right="22 Jun 2026" /><Progress active={2} /></Pressable><Text style={s.section}>Other applications</Text>{['CRED · Senior Product Manager · Saved','Swiggy · Product Manager · Closed'].map((text) => <View key={text} style={s.other}><Text style={s.cardTitle}>{text}</Text></View>)}</ScrollView>;
}

function Progress({ active }: { active: number }): ReactElement { return <View style={s.progress}>{stages.map((stage, index) => <View key={stage} style={[s.progressDot, index < active && s.progressDone, index === active && s.progressCurrent]} />)}</View>; }

function Timeline(): ReactElement {
  return <ScrollView contentContainerStyle={s.content}><Text style={s.cardTitle}>◢  Razorpay</Text><Text style={s.copy}>Senior Product Manager     Referral submitted</Text><View style={s.card}><Text style={s.section}>Application timeline</Text>{stages.map((stage, index) => <View key={stage} style={s.timelineRow}><View style={[s.timelineDot, index < 2 && s.timelineDone, index === 2 && s.timelineCurrent]} /><View><Text style={index === 2 ? s.currentText : s.cardTitle}>{stage}</Text><Text style={s.copy}>{index < 2 ? index === 0 ? '18 Jun 2026 · You were matched to this role.' : '19 Jun 2026 · Arjun submitted your referral.' : index === 2 ? '22 Jun 2026 · Razorpay team is reviewing your application.' : 'Upcoming · You’ll be notified when scheduled.'}</Text></View></View>)}</View><View style={s.card}><Text style={s.small}>Application owner</Text><Text style={s.cardTitle}>Arjun Menon</Text><Text style={s.copy}>Product Manager at Razorpay</Text></View></ScrollView>;
}

export function TrackingScreen({ state }: Props): ReactElement {
  const content = state === 'shared' ? <Shared /> : state === 'submitted' ? <Submitted /> : state === 'overview' ? <Overview /> : <Timeline />;
  return <SafeAreaView edges={['top', 'left', 'right']} style={s.safe}><Header />{content}</SafeAreaView>;
}

const s = StyleSheet.create({safe:{backgroundColor:lightJourney.background,flex:1},header:{alignItems:'center',flexDirection:'row',height:56,justifyContent:'space-between',paddingHorizontal:18},icon:{alignItems:'center',height:44,justifyContent:'center',width:44},wordmark:{color:lightJourney.ink,fontFamily:'IBMPlexSerif-Medium',fontSize:27},center:{alignItems:'center',flex:1,padding:24,paddingTop:50},content:{padding:20},success:{alignItems:'center',backgroundColor:lightJourney.surfaceMuted,borderRadius:37,height:74,justifyContent:'center',width:74},hero:{color:lightJourney.ink,fontFamily:'IBMPlexSerif-Medium',fontSize:28,lineHeight:34,marginTop:13,textAlign:'center'},copy:{color:lightJourney.textMuted,fontFamily:'TikTokSans-Regular',fontSize:11,lineHeight:17,marginTop:6},privacy:{color:lightJourney.textMuted,fontFamily:'TikTokSans-Regular',fontSize:11,lineHeight:18,marginTop:35},primary:{alignItems:'center',backgroundColor:lightJourney.blue,borderRadius:14,height:51,justifyContent:'center',marginTop:20,width:'100%'},primaryText:{color:'#fff',fontFamily:'TikTokSans-Semibold',fontSize:15},card:{backgroundColor:lightJourney.surface,borderColor:lightJourney.border,borderRadius:12,borderWidth:1,marginTop:18,padding:13,width:'100%'},cardTitle:{color:lightJourney.ink,fontFamily:'TikTokSans-Medium',fontSize:13},divider:{backgroundColor:lightJourney.border,height:1,marginVertical:10},pair:{flexDirection:'row',gap:10,justifyContent:'space-between',paddingVertical:5},pairRight:{color:lightJourney.text,fontFamily:'TikTokSans-Regular',fontSize:10,maxWidth:'57%',textAlign:'right'},small:{color:lightJourney.textMuted,fontFamily:'TikTokSans-Regular',fontSize:10,lineHeight:16},section:{color:lightJourney.ink,fontFamily:'IBMPlexSerif-Medium',fontSize:19,marginTop:17},badge:{alignSelf:'flex-start',backgroundColor:lightJourney.greenSoft,borderRadius:7,color:lightJourney.green,fontFamily:'TikTokSans-Medium',fontSize:10,marginTop:8,overflow:'hidden',paddingHorizontal:7,paddingVertical:5},progress:{flexDirection:'row',justifyContent:'space-between',marginTop:14},progressDot:{backgroundColor:lightJourney.background,borderColor:lightJourney.border,borderRadius:8,borderWidth:1,height:16,width:16},progressDone:{backgroundColor:lightJourney.green,borderColor:lightJourney.green},progressCurrent:{borderColor:lightJourney.blue,borderWidth:3},other:{backgroundColor:lightJourney.surface,borderColor:lightJourney.border,borderRadius:10,borderWidth:1,marginTop:9,padding:13},timelineRow:{alignItems:'flex-start',flexDirection:'row',gap:12,minHeight:74},timelineDot:{backgroundColor:lightJourney.background,borderColor:lightJourney.border,borderRadius:10,borderWidth:1,height:20,width:20},timelineDone:{backgroundColor:lightJourney.green,borderColor:lightJourney.green},timelineCurrent:{borderColor:lightJourney.blue,borderWidth:3},currentText:{color:lightJourney.blue,fontFamily:'TikTokSans-Medium',fontSize:13}});
