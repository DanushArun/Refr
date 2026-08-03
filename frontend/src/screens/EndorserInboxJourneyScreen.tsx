import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactElement } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View, type ImageStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { lightJourney } from '../theme/lightJourney';

type Person = { name: string; role: string; status: string; fit?: string; unread?: boolean };

const activeConnections: Person[] = [
  { name: 'Priya Nair', role: 'Senior Product Manager at CRED', status: 'Matched', fit: '92% fit' },
  { name: 'Neha Kulkarni', role: 'UX Designer', status: 'Connected', fit: '81% fit' },
  { name: 'Dev Malhotra', role: 'Data Analyst', status: 'Connected', fit: '76% fit' },
];

const conversations: Person[] = [
  { name: 'Priya Nair', role: 'Thanks for connecting!\nHi Arjun, thanks for the intro…', status: '10:24 AM', unread: true },
  { name: 'Neha Kulkarni', role: 'Great chatting!\nThe UX team at Razorpay is…', status: '17 Jun' },
  { name: 'Dev Malhotra', role: 'Thanks!\nReally appreciate the connect.', status: '16 Jun' },
];

function Header(): ReactElement {
  return <View style={styles.header}><View style={styles.headerButton}><Ionicons color={lightJourney.ink} name="menu-outline" size={23}/></View><Text style={styles.wordmark}>Endorsly</Text><View style={styles.headerButton}><Ionicons color={lightJourney.ink} name="create-outline" size={22}/></View></View>;
}

function Avatar({ name }: { name: string }): ReactElement {
  if (name === 'Priya Nair') return <Image source={require('../../assets/seeker-entry-portrait.png')} style={styles.avatarImage as ImageStyle} />;
  return <View style={styles.avatar}><Text style={styles.avatarText}>{name.split(' ').map((word) => word[0]).join('')}</Text></View>;
}

function ConnectionRow({ person }: { person: Person }): ReactElement {
  const open = person.name === 'Priya Nair' ? '/connection/priya-nair' : '/chat?referralId=priya-razo';
  return <Pressable accessibilityLabel={person.name} accessibilityRole="button" onPress={() => router.push(open as never)} style={styles.row}><Avatar name={person.name}/><View style={styles.copy}><Text style={styles.name}>{person.name}</Text><Text style={styles.role}>{person.role}</Text><Text style={styles.fit}>{person.fit}</Text></View><Text style={[styles.status, person.status === 'Matched' && styles.matched]}>{person.status}</Text><Ionicons color={lightJourney.textMuted} name="chevron-forward" size={17}/></Pressable>;
}

function ConversationRow({ person }: { person: Person }): ReactElement {
  return <Pressable accessibilityLabel={`Conversation with ${person.name}`} accessibilityRole="button" onPress={() => router.push('/chat?referralId=priya-razo' as never)} style={styles.row}><Avatar name={person.name}/><View style={styles.copy}><Text style={styles.name}>{person.name}</Text><Text numberOfLines={2} style={styles.role}>{person.role}</Text></View><View style={styles.time}><Text style={styles.timeText}>{person.status}</Text>{person.unread ? <View style={styles.unread}/> : null}</View></Pressable>;
}

export function EndorserInboxJourneyScreen(): ReactElement {
  return <SafeAreaView edges={['top','left','right']} style={styles.safe}><Header/><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><Text accessibilityRole="header" style={styles.title}>Inbox</Text><Text style={styles.subtitle}>Your conversations and connections.</Text><Text style={styles.section}>Active connections</Text><View style={styles.card}>{activeConnections.map((person) => <ConnectionRow key={person.name} person={person}/>)}</View><Text style={styles.section}>Conversations</Text><View style={styles.card}>{conversations.map((person) => <ConversationRow key={person.name} person={person}/>)}</View></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({safe:{backgroundColor:lightJourney.background,flex:1},header:{alignItems:'center',flexDirection:'row',height:56,justifyContent:'space-between',paddingHorizontal:18},headerButton:{alignItems:'center',height:44,justifyContent:'center',width:44},wordmark:{color:lightJourney.ink,fontFamily:'IBMPlexSerif-Medium',fontSize:27},content:{padding:20,paddingBottom:30},title:{color:lightJourney.ink,fontFamily:'IBMPlexSerif-Medium',fontSize:28,lineHeight:34,marginTop:8},subtitle:{color:lightJourney.textMuted,fontFamily:'TikTokSans-Regular',fontSize:11,lineHeight:17,marginTop:4},section:{color:lightJourney.text,fontFamily:'TikTokSans-Medium',fontSize:12,marginTop:20},card:{backgroundColor:lightJourney.surface,borderColor:lightJourney.border,borderRadius:11,borderWidth:1,marginTop:8,overflow:'hidden'},row:{alignItems:'center',borderBottomColor:lightJourney.border,borderBottomWidth:1,flexDirection:'row',gap:10,minHeight:75,paddingHorizontal:11},avatar:{alignItems:'center',backgroundColor:lightJourney.blueSoft,borderRadius:25,height:50,justifyContent:'center',width:50},avatarImage:{borderRadius:25,height:50,width:50},avatarText:{color:lightJourney.ink,fontFamily:'TikTokSans-Medium',fontSize:12},copy:{flex:1},name:{color:lightJourney.text,fontFamily:'TikTokSans-Medium',fontSize:12},role:{color:lightJourney.textMuted,fontFamily:'TikTokSans-Regular',fontSize:10,lineHeight:15,marginTop:3},fit:{color:lightJourney.green,fontFamily:'TikTokSans-Medium',fontSize:9,marginTop:4},status:{backgroundColor:lightJourney.greenSoft,borderRadius:6,color:lightJourney.green,fontFamily:'TikTokSans-Medium',fontSize:9,overflow:'hidden',paddingHorizontal:6,paddingVertical:4},matched:{backgroundColor:lightJourney.orangeSoft,color:lightJourney.orange},time:{alignItems:'flex-end',alignSelf:'stretch',justifyContent:'center',paddingTop:16},timeText:{color:lightJourney.textMuted,fontFamily:'TikTokSans-Regular',fontSize:9},unread:{backgroundColor:lightJourney.blue,borderRadius:5,height:10,marginTop:9,width:10}});
