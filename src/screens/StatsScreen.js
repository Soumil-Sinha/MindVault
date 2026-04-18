import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Dimensions,
} from 'react-native';
import { ArrowLeft, Settings, Trophy, Gamepad2, Clock, Star, Zap } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { getStats } from '../utils/storage';

const PERIODS = ['DAY', 'WEEK', 'MONTH'];
const { width: windowWidth } = Dimensions.get('window');
const width = Math.min(windowWidth, 500);

const BAR_DATA = [42, 55, 38, 70, 60, 80, 95];
const BAR_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const MAX_BAR = 95;

const BREAKTHROUGHS = [
  { icon: Star, color: colors.yellow, title: 'TRIPLE CROWN ACHIEVEMENT', sub: 'Unlocked 2 hours ago', xp: '+500 XP' },
  { icon: Zap, color: colors.cyan, title: 'SPEED RUNNER LEVEL 4', sub: 'Improved avg time by 52%', xp: '+200 XP' },
];

export default function StatsScreen() {
  const [period, setPeriod] = useState('DAY');
  const [stats, setStats] = useState({ gamesPlayed: 0, wins: 0, totalTimeSeconds: 0 });

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  const avgTimeMins = stats.gamesPlayed > 0 ? Math.round(stats.totalTimeSeconds / stats.gamesPlayed / 60) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>PERFORMANCE HUB</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Settings size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Period toggle */}
        <View style={styles.periodRow}>
          {PERIODS.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.periodBtn, period === p && styles.periodBtnActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Win Rate */}
        <View style={[styles.statCard, { backgroundColor: colors.red }]}>
          <View style={styles.statCardHeader}>
            <Text style={styles.statCardLabel}>WIN RATE</Text>
            <Trophy size={18} color="#fff" />
          </View>
          <Text style={styles.statCardBig}>{winRate}%</Text>
          <Text style={styles.statCardSub}>+2.4% vs last week</Text>
        </View>

        {/* Games Played */}
        <View style={[styles.statCard, { backgroundColor: colors.yellow }]}>
          <View style={styles.statCardHeader}>
            <Text style={[styles.statCardLabel, { color: '#000' }]}>GAMES PLAYED</Text>
            <Gamepad2 size={18} color="#000" />
          </View>
          <Text style={[styles.statCardBig, { color: '#000' }]}>{stats.gamesPlayed}</Text>
          <Text style={[styles.statCardSub, { color: 'rgba(0,0,0,0.6)' }]}>{stats.gamesPlayed} sessions total</Text>
        </View>

        {/* Avg Time */}
        <View style={[styles.statCard, { backgroundColor: colors.blue }]}>
          <View style={styles.statCardHeader}>
            <Text style={styles.statCardLabel}>AVG TIME</Text>
            <Clock size={18} color="#fff" />
          </View>
          <Text style={styles.statCardBig}>{avgTimeMins}m</Text>
          <Text style={styles.statCardSub}>Per session average</Text>
        </View>

        {/* Activity Trend */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>ACTIVITY TREND</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>LIVE DATA</Text>
            </View>
          </View>
          <View style={styles.chart}>
            {BAR_DATA.map((val, i) => (
              <View key={i} style={styles.barCol}>
                <View style={[styles.bar, {
                  height: (val / MAX_BAR) * 100,
                  backgroundColor: i === BAR_DATA.length - 1 ? colors.purple : colors.blue,
                }]} />
                <Text style={styles.barLabel}>{BAR_DAYS[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Latest Breakthroughs */}
        <Text style={styles.sectionTitle}>LATEST BREAKTHROUGHS</Text>
        {BREAKTHROUGHS.map((b, i) => (
          <View key={i} style={styles.achievementRow}>
            <View style={[styles.achieveIcon, { backgroundColor: b.color }]}>
              <b.icon size={18} color="#000" />
            </View>
            <View style={styles.achieveText}>
              <Text style={styles.achieveTitle}>{b.title}</Text>
              <Text style={styles.achieveSub}>{b.sub}</Text>
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>{b.xp}</Text>
            </View>
          </View>
        ))}

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.exportBtn}>
            <Text style={styles.exportText}>EXPORT REPORT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn}>
            <Text style={styles.shareText}>SHARE STATS</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, width: '100%', maxWidth: 500, alignSelf: 'center' },
  scroll: { paddingHorizontal: 18, paddingBottom: 30 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, marginBottom: 18 },
  backBtn: { width: 38, height: 38, borderRadius: 8, backgroundColor: colors.bgCard, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '900', color: colors.textPrimary, letterSpacing: 1.5 },
  iconBtn: { width: 38, height: 38, borderRadius: 8, backgroundColor: colors.bgCard, justifyContent: 'center', alignItems: 'center' },

  periodRow: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: 12, padding: 4, marginBottom: 18, borderWidth: 1, borderColor: colors.border },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  periodBtnActive: { backgroundColor: colors.textPrimary },
  periodText: { color: colors.textMuted, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  periodTextActive: { color: colors.bg },

  statCard: { borderRadius: 16, padding: 18, marginBottom: 12 },
  statCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statCardLabel: { fontSize: 11, fontWeight: '700', color: '#fff', letterSpacing: 1.5 },
  statCardBig: { fontSize: 40, fontWeight: '900', color: '#fff', marginBottom: 4 },
  statCardSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },

  chartCard: { backgroundColor: colors.bgCard, borderRadius: 16, padding: 18, marginBottom: 18, borderWidth: 1, borderColor: colors.border },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartTitle: { fontSize: 13, fontWeight: '800', color: colors.textPrimary, letterSpacing: 1.5 },
  liveBadge: { backgroundColor: colors.purple, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  liveBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 6 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: 110, gap: 6 },
  bar: { width: '100%', borderRadius: 4 },
  barLabel: { fontSize: 8, color: colors.textMuted, fontWeight: '600' },

  sectionTitle: { fontSize: 12, fontWeight: '800', color: colors.textPrimary, letterSpacing: 2, marginBottom: 12 },
  achievementRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border, gap: 12 },
  achieveIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  achieveText: { flex: 1 },
  achieveTitle: { color: colors.textPrimary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 3 },
  achieveSub: { color: colors.textMuted, fontSize: 11 },
  xpBadge: { backgroundColor: colors.bgCardAlt, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  xpText: { color: colors.yellow, fontSize: 11, fontWeight: '800' },

  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  exportBtn: { flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: colors.purple, paddingVertical: 14, alignItems: 'center' },
  exportText: { color: colors.purple, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  shareBtn: { flex: 1, borderRadius: 12, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, paddingVertical: 14, alignItems: 'center' },
  shareText: { color: colors.textPrimary, fontSize: 12, fontWeight: '800', letterSpacing: 1 },
});
