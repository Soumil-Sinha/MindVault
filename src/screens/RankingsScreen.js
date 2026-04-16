import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { ArrowLeft, User, Star, UserRound, Flower, LogOut, CodeSquare } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { getHistory } from '../utils/storage';

const TABS = ['DAILY', 'WEEKLY', 'ALL-TIME'];
const AVATAR_COLORS = [colors.blue, colors.pink, colors.green, colors.yellow, colors.purple, colors.cyan, colors.red];

export default function RankingsScreen() {
  const [activeTab, setActiveTab] = useState('ALL-TIME');
  const [history, setHistory] = useState([]);
  const { user, signOut } = useContext(AuthContext);

  useEffect(() => {
    getHistory().then(setHistory);
  }, []);

  const MOCK_GLOBALS = [
    { name: 'Zephyr.eth', sub: 'LEVEL 42', score: 15200 },
    { name: 'Vanguard.sol', sub: 'LEVEL 60', score: 18450 },
    { name: 'Nova.core', sub: 'LEVEL 38', score: 12100 },
    { name: 'Ember_Night', sub: 'LEVEL 42', score: 9820 },
    { name: 'Luna_Tic', sub: 'LEVEL 31', score: 7200 },
    { name: 'Cyber_Punk', sub: 'LEVEL 29', score: 6150 },
  ];

  const userBest = history.length > 0 ? Math.max(...history.map(h => h.score)) : 0;
  const allScores = [...MOCK_GLOBALS.map(m => ({ ...m, isUser: false }))];
  if (userBest > 0) {
    allScores.push({ name: user?.email || 'Player', sub: 'LOCAL BEST', score: userBest, isUser: true });
  }

  const sorted = allScores.sort((a, b) => b.score - a.score);
  const topList = sorted.slice(0, 3).map((h, i) => ({
    rank: i + 1,
    name: h.name,
    xp: h.score.toLocaleString() + ' PTS',
    isUser: h.isUser
  }));

  while (topList.length < 3) {
    topList.push({ rank: topList.length + 1, name: '---', xp: '0 PTS', isUser: false });
  }

  const OTHERS = sorted.slice(3, 10).map((h, i) => ({
    rank: i + 4,
    name: h.name,
    sub: h.sub,
    xp: h.score.toLocaleString(),
    isUser: h.isUser
  }));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconBtn}>
          <User size={20} color={colors.textPrimary} />
        </View>
        <Text style={styles.title}>MY PROFILE</Text>
        <TouchableOpacity style={styles.iconBtnLogout} onPress={signOut}>
          <LogOut size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Tab row */}
        <View style={styles.tabRow}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]}
              onPress={() => setActiveTab(t)}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{color: colors.textSecondary, textAlign: 'center', marginBottom: 20, fontSize: 13, letterSpacing: 1}}>LOCAL HIGHSCORES</Text>

        {/* Podium */}
        <View style={styles.podium}>
          {/* #2 */}
          <View style={styles.podiumItem}>
            <View style={[styles.badge, { backgroundColor: colors.blue }]}>
              <Text style={styles.badgeText}>#2</Text>
            </View>
            <View style={[styles.avatar, { borderColor: colors.blue, width: 64, height: 64, borderRadius: 32 }]}>
              <User size={30} color={colors.textPrimary} />
            </View>
            <Text style={styles.podiumName}>
              {topList[1].name} {topList[1].isUser && <Text style={{color: colors.purple}}> (YOU)</Text>}
            </Text>
            <Text style={[styles.podiumXp, { color: colors.blue }]}>{topList[1].xp}</Text>
          </View>

          {/* #1 */}
          <View style={[styles.podiumItem, styles.podiumFirst]}>
            <View style={styles.crownWrap}>
              <Star size={20} color={colors.yellow} />
            </View>
            <View style={[styles.badge, { backgroundColor: colors.yellow }]}>
              <Text style={[styles.badgeText, { color: '#000' }]}>#1</Text>
            </View>
            <View style={[styles.avatar, { borderColor: colors.yellow, width: 78, height: 78, borderRadius: 39 }]}>
              <UserRound size={36} color={colors.textPrimary} />
            </View>
            <Text style={[styles.podiumName, { fontSize: 14 }]}>
              {topList[0].name} {topList[0].isUser && <Text style={{color: colors.purple}}> (YOU)</Text>}
            </Text>
            <Text style={[styles.podiumXp, { color: colors.yellow }]}>{topList[0].xp}</Text>
          </View>

          {/* #3 */}
          <View style={styles.podiumItem}>
            <View style={[styles.badge, { backgroundColor: colors.pink }]}>
              <Text style={[styles.badgeText, { color: '#000' }]}>#3</Text>
            </View>
            <View style={[styles.avatar, { borderColor: colors.pink, width: 64, height: 64, borderRadius: 32 }]}>
              <Flower size={30} color={colors.textPrimary} />
            </View>
            <Text style={styles.podiumName}>
              {topList[2].name} {topList[2].isUser && <Text style={{color: colors.purple}}> (YOU)</Text>}
            </Text>
            <Text style={[styles.podiumXp, { color: colors.pink }]}>{topList[2].xp}</Text>
          </View>
        </View>

        {/* Ranked list */}
        <View style={styles.list}>
          {OTHERS.map((player) => (
            <View key={player.rank} style={[styles.listRow, player.isUser && styles.listRowUser]}>
              <View style={[styles.rankBadge, player.isUser && { backgroundColor: colors.purple }]}>
                <Text style={styles.rankNum}>#{player.rank}</Text>
              </View>
              <View style={[styles.listAvatar, { backgroundColor: AVATAR_COLORS[player.rank % AVATAR_COLORS.length] }]}>
                <CodeSquare size={18} color="#fff" />
              </View>
              <View style={styles.listInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.listName}>{player.name}</Text>
                  {player.isUser && <View style={styles.youBadge}><Text style={styles.youText}>{player.name.toUpperCase()}</Text></View>}
                </View>
              </View>
              <Text style={[styles.listXp, player.isUser && { color: colors.purple }]}>{player.xp}</Text>
              <Text style={styles.listPts}>PTS</Text>
            </View>
          ))}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, width: '100%', maxWidth: 500, alignSelf: 'center' },
  scroll: { paddingHorizontal: 18, paddingBottom: 100 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 12, marginBottom: 16 },
  iconBtn: { width: 38, height: 38, borderRadius: 8, backgroundColor: colors.bgCard, justifyContent: 'center', alignItems: 'center' },
  iconBtnLogout: { width: 38, height: 38, borderRadius: 8, backgroundColor: '#5A1A1A', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '900', color: colors.textPrimary, letterSpacing: 1.5 },

  tabRow: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: 12, padding: 4, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.purple },
  tabText: { color: colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  tabTextActive: { color: '#fff' },

  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 12, marginBottom: 28 },
  podiumItem: { alignItems: 'center', gap: 6, flex: 1 },
  podiumFirst: { marginBottom: 16 },
  crownWrap: { position: 'absolute', top: -20, zIndex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },
  avatar: { borderWidth: 3, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bgCard },
  podiumName: { color: colors.textPrimary, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  podiumXp: { fontSize: 11, fontWeight: '700' },

  list: { gap: 8 },
  listRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 10 },
  listRowUser: { borderColor: colors.purple, borderWidth: 2, backgroundColor: '#17112A' },
  rankBadge: { backgroundColor: colors.bgCardAlt, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  rankNum: { color: colors.textSecondary, fontSize: 13, fontWeight: '800' },
  listAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  listInfo: { flex: 1 },
  listName: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  listSub: { color: colors.textMuted, fontSize: 10, letterSpacing: 1, marginTop: 2 },
  listXp: { color: colors.textAccentPurple, fontSize: 14, fontWeight: '800' },
  listPts: { color: colors.textMuted, fontSize: 9, letterSpacing: 0.5 },
  youBadge: { backgroundColor: colors.purple, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  youText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
