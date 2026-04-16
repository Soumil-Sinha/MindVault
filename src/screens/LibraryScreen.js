import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, StatusBar,
} from 'react-native';
import { Settings, Search, Grid, Bomb, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const CATEGORIES = ['ALL GAMES', 'PUZZLES', 'CLASSIC', 'LOGIC'];

export default function LibraryScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('ALL GAMES');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>YOUR LIBRARY</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Settings size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <Search size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="FIND A GAME..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catBtn, activeCat === cat && styles.catBtnActive]}
              onPress={() => setActiveCat(cat)}
            >
              <Text style={[styles.catText, activeCat === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Now heading */}
        <Text style={styles.sectionTitle}>POPULAR NOW</Text>

        {/* Game cards grid */}
        <View style={styles.grid}>
          {/* Sudoku Card */}
          <TouchableOpacity style={[styles.card, { backgroundColor: colors.sudokuCard }]}
            onPress={() => navigation.navigate('Sudoku')} activeOpacity={0.9}>
            <View style={styles.cardIconCircle}>
              <Grid size={36} color="#000" />
            </View>
            <Text style={styles.cardGameName}>SUDOKU</Text>
            <Text style={styles.cardGameMode}>MEDIUM MODE</Text>
            <TouchableOpacity style={styles.playBtn} onPress={() => navigation.navigate('Sudoku')}>
              <Text style={styles.playBtnText}>PLAY</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Minesweeper Card */}
          <TouchableOpacity style={[styles.card, { backgroundColor: colors.minesCard }]}
            onPress={() => navigation.navigate('Minesweeper')} activeOpacity={0.9}>
            <View style={styles.cardIconCircle}>
              <Bomb size={30} color="#000" />
            </View>
            <Text style={styles.cardGameName}>MINES</Text>
            <Text style={styles.cardGameMode}>CLASSIC</Text>
            <TouchableOpacity style={styles.playBtn} onPress={() => navigation.navigate('Minesweeper')}>
              <Text style={styles.playBtnText}>PLAY</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* 2048 Card */}
          <TouchableOpacity style={[styles.card, { backgroundColor: colors.game2048Card }]}
            onPress={() => navigation.navigate('Game2048')} activeOpacity={0.9}>
            <Text style={styles.card2048Number}>2048</Text>
            <Text style={styles.cardGameName}>2048</Text>
            <Text style={styles.cardGameMode}>HIGH SCORE: 12K</Text>
            <TouchableOpacity style={styles.playBtn} onPress={() => navigation.navigate('Game2048')}>
              <Text style={styles.playBtnText}>PLAY</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Coming Soon Card */}
          <View style={[styles.card, styles.comingSoonCard]}>
            <View style={styles.plusCircle}>
              <Plus size={28} color={colors.textMuted} />
            </View>
            <Text style={styles.comingSoonText}>MORE GAMES{'\n'}COMING SOON</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, width: '100%', maxWidth: 500, alignSelf: 'center' },
  scroll: { paddingHorizontal: 18, paddingBottom: 30 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '900', color: colors.textPrimary, letterSpacing: 1 },
  settingsBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.purple, justifyContent: 'center', alignItems: 'center',
  },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14, height: 46, marginBottom: 16,
  },
  searchInput: { flex: 1, color: colors.textPrimary, fontSize: 13, letterSpacing: 1 },

  catScroll: { marginBottom: 20 },
  catBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.bgCard, marginRight: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  catBtnActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  catText: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  catTextActive: { color: '#fff' },

  sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.pink, letterSpacing: 2, marginBottom: 14 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  card: {
    width: '47%', borderRadius: 18, padding: 16,
    alignItems: 'center', minHeight: 200, justifyContent: 'space-between',
  },
  cardIconCircle: {
    width: 70, height: 70, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  card2048Number: { fontSize: 36, fontWeight: '900', color: '#fff', textShadowColor: 'rgba(0,0,0,0.3)', textShadowRadius: 4 },
  cardGameName: { fontSize: 16, fontWeight: '900', color: '#000', letterSpacing: 0.5, textAlign: 'center' },
  cardGameMode: { fontSize: 10, fontWeight: '600', color: 'rgba(0,0,0,0.6)', letterSpacing: 1, marginTop: 2, textAlign: 'center' },
  playBtn: {
    backgroundColor: '#000', borderRadius: 8,
    paddingHorizontal: 24, paddingVertical: 8, marginTop: 10, width: '100%', alignItems: 'center',
  },
  playBtnText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 2 },

  comingSoonCard: {
    backgroundColor: colors.comingSoonCard, borderWidth: 1.5,
    borderColor: colors.border, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center',
  },
  plusCircle: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  comingSoonText: { color: colors.textMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1, textAlign: 'center', lineHeight: 18 },
});
