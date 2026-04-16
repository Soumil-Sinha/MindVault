import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Platform, useWindowDimensions, Animated,
  UIManager, LayoutAnimation,
} from 'react-native';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { saveGameResult } from '../utils/storage';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TILE_COLORS = {
  0:    { bg: '#1A1A2E', text: '#1A1A2E' },
  2:    { bg: '#4A90D9', text: '#fff'    },
  4:    { bg: '#5BA3E0', text: '#fff'    },
  8:    { bg: '#F5A623', text: '#fff'    },
  16:   { bg: '#F5793A', text: '#fff'    },
  32:   { bg: '#E95656', text: '#fff'    },
  64:   { bg: '#C0392B', text: '#fff'    },
  128:  { bg: '#9B59B6', text: '#fff'    },
  256:  { bg: '#8E44AD', text: '#fff'    },
  512:  { bg: '#27AE60', text: '#fff'    },
  1024: { bg: '#16A085', text: '#fff'    },
  2048: { bg: '#F5C518', text: '#000'    },
};

const getTileStyle = (val) => TILE_COLORS[val] || { bg: '#FFD700', text: '#000' };

// Direction vectors for slide animation
const SLIDE_OFFSET = {
  left:  { x: -14, y: 0  },
  right: { x:  14, y: 0  },
  up:    { x: 0,  y: -14 },
  down:  { x: 0,  y:  14 },
};

function addRandom(grid) {
  const empties = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (grid[r][c] === 0) empties.push([r, c]);
  if (!empties.length) return grid;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const newGrid = grid.map(row => [...row]);
  newGrid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newGrid;
}

function slideRow(row) {
  let arr = row.filter(v => v !== 0);
  let score = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] === arr[i + 1]) { arr[i] *= 2; score += arr[i]; arr[i + 1] = 0; }
  }
  arr = arr.filter(v => v !== 0);
  while (arr.length < 4) arr.push(0);
  return { row: arr, score };
}

function move(grid, dir) {
  let newGrid = grid.map(r => [...r]);
  let totalScore = 0;
  if (dir === 'left') {
    for (let r = 0; r < 4; r++) { const { row, score } = slideRow(newGrid[r]); newGrid[r] = row; totalScore += score; }
  } else if (dir === 'right') {
    for (let r = 0; r < 4; r++) { const { row, score } = slideRow([...newGrid[r]].reverse()); newGrid[r] = row.reverse(); totalScore += score; }
  } else if (dir === 'up') {
    for (let c = 0; c < 4; c++) {
      const col = newGrid.map(r => r[c]);
      const { row, score } = slideRow(col);
      row.forEach((v, r) => newGrid[r][c] = v); totalScore += score;
    }
  } else if (dir === 'down') {
    for (let c = 0; c < 4; c++) {
      const col = newGrid.map(r => r[c]).reverse();
      const { row, score } = slideRow(col);
      row.reverse().forEach((v, r) => newGrid[r][c] = v); totalScore += score;
    }
  }
  return { newGrid, score: totalScore };
}

export default function Game2048Screen({ navigation }) {
  const [board, setBoard] = useState(() => addRandom(addRandom(Array.from({ length: 4 }, () => [0, 0, 0, 0]))));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Always holds the latest board without stale closure issues
  const boardRef = useRef(board);
  useEffect(() => { boardRef.current = board; }, [board]);

  const slideAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const { width: windowWidth } = useWindowDimensions();
  const WINDOW_WIDTH = Math.min(windowWidth, 500);
  const BOARD_SIZE = WINDOW_WIDTH - 24;
  const CELL_GAP = 6;
  const CELL_SIZE = Math.floor((BOARD_SIZE - CELL_GAP * 5) / 4);

  const performSlide = useCallback((dir, currentBoard) => {
    if (isAnimating) return;
    const { newGrid, score: gained } = move(currentBoard, dir);
    const changed = JSON.stringify(newGrid) !== JSON.stringify(currentBoard);
    if (!changed) return;

    setIsAnimating(true);
    const { x, y } = SLIDE_OFFSET[dir];

    // Phase 1: slide in the direction
    Animated.timing(slideAnim, {
      toValue: { x, y },
      duration: 75,
      useNativeDriver: true,
    }).start(() => {
      // Phase 2: update board and snap back
      LayoutAnimation.configureNext({
        duration: 120,
        update: { type: 'spring', springDamping: 0.75 },
      });
      const withNew = addRandom(newGrid);
      setBoard(withNew);
      setScore(s => { const ns = s + gained; setBest(b => Math.max(b, ns)); return ns; });
      // Phase 3: spring back
      Animated.spring(slideAnim, {
        toValue: { x: 0, y: 0 },
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }).start(() => setIsAnimating(false));
    });
  }, [isAnimating, slideAnim]);

  const doMove = useCallback((dir) => {
    performSlide(dir, boardRef.current);
  }, [performSlide]);

  const handleTouchStart = (e) => setTouchStart({ x: e.nativeEvent.pageX, y: e.nativeEvent.pageY });

  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const dx = e.nativeEvent.pageX - touchStart.x;
    const dy = e.nativeEvent.pageY - touchStart.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 'right' : 'left');
    else doMove(dy > 0 ? 'down' : 'up');
    setTouchStart(null);
  };

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e) => {
        const key = e.key.toLowerCase();
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) e.preventDefault();
        switch (key) {
          case 'w': case 'arrowup': doMove('up'); break;
          case 's': case 'arrowdown': doMove('down'); break;
          case 'a': case 'arrowleft': doMove('left'); break;
          case 'd': case 'arrowright': doMove('right'); break;
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [doMove]);

  const resetGame = () => {
    if (score > 0) saveGameResult({ gameName: '2048', score, won: false, timeTakenSeconds: 0 });
    slideAnim.setValue({ x: 0, y: 0 });
    setBoard(addRandom(addRandom(Array.from({ length: 4 }, () => [0, 0, 0, 0]))));
    setScore(0);
    setIsAnimating(false);
  };

  const handleBack = () => {
    if (score > 0) saveGameResult({ gameName: '2048', score, won: false, timeTakenSeconds: 0 });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>2048</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.pink }]} onPress={resetGame}>
          <RefreshCw size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Score boxes */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreBox}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreVal}>{score.toLocaleString()}</Text>
        </View>
        <View style={[styles.scoreBox, { backgroundColor: '#1A1A2E', borderColor: colors.purple }]}>
          <Text style={styles.scoreLabel}>BEST</Text>
          <Text style={[styles.scoreVal, { color: colors.yellow }]}>{best.toLocaleString()}</Text>
        </View>
      </View>

      <Text style={styles.hint}>Swipe to merge tiles — reach 2048!</Text>

      {/* Board with slide animation */}
      <Animated.View
        style={[styles.board, {
          width: BOARD_SIZE,
          transform: [
            { translateX: slideAnim.x },
            { translateY: slideAnim.y },
          ],
        }]}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {board.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((val, c) => {
              const ts = getTileStyle(val);
              return (
                <View key={c} style={[styles.cell, { width: CELL_SIZE, height: CELL_SIZE, backgroundColor: ts.bg }]}>
                  {val !== 0 && (
                    <Text style={[
                      styles.cellNum,
                      { color: ts.text, fontSize: val >= 1024 ? CELL_SIZE * 0.26 : val >= 128 ? CELL_SIZE * 0.31 : CELL_SIZE * 0.38 },
                    ]}>
                      {val}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </Animated.View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, width: '100%', maxWidth: 500, alignSelf: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 8, marginBottom: 14 },
  iconBtn: { width: 38, height: 38, borderRadius: 8, backgroundColor: colors.bgCard, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 36, fontWeight: '900', color: colors.yellow, letterSpacing: 2 },

  scoreRow: { flexDirection: 'row', paddingHorizontal: 18, gap: 12, marginBottom: 10 },
  scoreBox: { flex: 1, backgroundColor: colors.bgCard, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  scoreLabel: { fontSize: 9, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 4 },
  scoreVal: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },

  hint: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginBottom: 14 },

  board: {
    backgroundColor: colors.bgCard, alignSelf: 'center',
    borderRadius: 14, padding: CELL_GAP, borderWidth: 1, borderColor: colors.border,
  },
  row: { flexDirection: 'row' },
  cell: {
    borderRadius: 10, margin: 3,
    justifyContent: 'center', alignItems: 'center',
  },
  cellNum: { fontWeight: '900' },
});

const CELL_GAP = 6;
