import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Vibration, useWindowDimensions, Animated,
} from 'react-native';
import { Settings, Flag, Timer, HelpCircle, Bomb, Pointer } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { saveGameResult } from '../utils/storage';

const COLS = 9;
const ROWS = 9;
const MINES_COUNT = 12;

function createBoard() {
  const board = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      r, c, isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0,
    }))
  );
  let placed = 0;
  while (placed < MINES_COUNT) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].isMine) { board[r][c].isMine = true; placed++; }
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!board[r][c].isMine) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr; const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].isMine) count++;
        }
        board[r][c].adjacentMines = count;
      }
    }
  }
  return board;
}

const ADJ_COLORS = ['', colors.blue, colors.green, colors.red, colors.purple, colors.red, colors.cyan, '#000', '#888'];

// Animated Cell wrapper
function AnimatedCell({ onPress, cell, cellSize, children }) {
  const scaleRef = useRef(new Animated.Value(1));

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleRef.current, { toValue: 0.82, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleRef.current, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <Animated.View style={[
        styles.cell,
        { width: cellSize, height: cellSize },
        { transform: [{ scale: scaleRef.current }] },
      ]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function MinesweeperScreen({ navigation }) {
  const [board, setBoard] = useState(() => createBoard());
  const [flagMode, setFlagMode] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [minesLeft, setMinesLeft] = useState(MINES_COUNT);

  const timerRef = useRef(null);

  // Banner slide-in animation
  const bannerAnim = useRef(new Animated.Value(-60));
  // Flag mode toggle bounce
  const flagScaleAnim = useRef(new Animated.Value(1));

  const { width: windowWidth } = useWindowDimensions();
  const widthArea = Math.min(windowWidth, 500);
  const CELL_SIZE = Math.floor((widthArea - 36) / COLS);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (!gameOver && !won) setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [gameOver, won]);

  // Animate banner in when game ends
  useEffect(() => {
    if (gameOver || won) {
      bannerAnim.current.setValue(-60);
      Animated.spring(bannerAnim.current, {
        toValue: 0,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [gameOver, won]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const reveal = (grid, r, c) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
    if (grid[r][c].isRevealed || grid[r][c].isFlagged) return;
    grid[r][c].isRevealed = true;
    if (grid[r][c].adjacentMines === 0 && !grid[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) reveal(grid, r + dr, c + dc);
    }
  };

  const toggleFlagMode = () => {
    flagScaleAnim.current.setValue(0.85);
    Animated.spring(flagScaleAnim.current, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    setFlagMode(f => !f);
  };

  const handlePress = (r, c) => {
    if (gameOver || won) return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const cell = newBoard[r][c];

    if (flagMode) {
      if (cell.isRevealed) return;
      if (!cell.isFlagged) { cell.isFlagged = true; setMinesLeft(m => m - 1); }
      else { cell.isFlagged = false; setMinesLeft(m => m + 1); }
      setBoard(newBoard);
      return;
    }

    if (cell.isFlagged) return;

    if (cell.isRevealed) {
      if (cell.adjacentMines > 0) {
        let flagCount = 0;
        let unrevealedNeighbors = [];
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              if (newBoard[nr][nc].isFlagged) flagCount++;
              else if (!newBoard[nr][nc].isRevealed) unrevealedNeighbors.push([nr, nc]);
            }
          }
        }
        if (flagCount === cell.adjacentMines) {
          let hitMine = false;
          unrevealedNeighbors.forEach(([nr, nc]) => {
            newBoard[nr][nc].isRevealed = true;
            if (newBoard[nr][nc].isMine) hitMine = true;
            else if (newBoard[nr][nc].adjacentMines === 0) reveal(newBoard, nr, nc);
          });
          if (hitMine) {
            newBoard.forEach(row => row.forEach(c => { if (c.isMine && !c.isFlagged) c.isRevealed = true; }));
            setBoard(newBoard);
            setGameOver(true);
            saveGameResult({ gameName: 'Minesweeper', score: seconds, won: false, timeTakenSeconds: seconds });
            Vibration.vibrate(400);
            return;
          }
          setBoard(newBoard);
          if (newBoard.flat().filter(c => !c.isRevealed && !c.isMine).length === 0) {
            setWon(true);
            saveGameResult({ gameName: 'Minesweeper', score: seconds, won: true, timeTakenSeconds: seconds });
          }
        }
      }
      return;
    }

    if (cell.isMine) {
      newBoard.forEach(row => row.forEach(c => { if (c.isMine && !c.isFlagged) c.isRevealed = true; }));
      setBoard(newBoard);
      setGameOver(true);
      saveGameResult({ gameName: 'Minesweeper', score: seconds, won: false, timeTakenSeconds: seconds });
      Vibration.vibrate(400);
      return;
    }

    reveal(newBoard, r, c);
    setBoard(newBoard);
    if (newBoard.flat().filter(c => !c.isRevealed && !c.isMine).length === 0) {
      setWon(true);
      saveGameResult({ gameName: 'Minesweeper', score: seconds, won: true, timeTakenSeconds: seconds });
    }
  };

  const resetGame = () => {
    setBoard(createBoard());
    setGameOver(false);
    setWon(false);
    setSeconds(0);
    setMinesLeft(MINES_COUNT);
    setFlagMode(false);
  };

  const getCellBg = (cell) => {
    if (cell.isRevealed && cell.isMine) return colors.red;
    if (cell.isRevealed) return '#3D3D55';  // lighter revealed empty
    return colors.surface;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn}>
          <Settings size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>MINESWEEPER</Text>
        <TouchableOpacity style={styles.newGameBtn} onPress={resetGame}>
          <Text style={styles.newGameText}>NEW GAME</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Flag size={16} color={colors.pink} />
          <View style={styles.statBoxTexts}>
            <Text style={styles.statLabel}>MINES</Text>
            <Text style={styles.statValue}>{String(minesLeft).padStart(3, '0')}</Text>
          </View>
        </View>
        <View style={styles.statBox}>
          <Timer size={16} color={colors.cyan} />
          <View style={styles.statBoxTexts}>
            <Text style={styles.statLabel}>TIME</Text>
            <Text style={[styles.statValue, { color: colors.cyan }]}>{formatTime(seconds)}</Text>
          </View>
        </View>
      </View>

      {/* Game Over / Win banner — slides down */}
      {(gameOver || won) && (
        <Animated.View style={[
          styles.banner,
          won ? styles.bannerWin : styles.bannerLose,
          { transform: [{ translateY: bannerAnim.current }] },
        ]}>
          <Text style={styles.bannerText}>{won ? '🏆 YOU WIN!' : '💥 GAME OVER'}</Text>
          <TouchableOpacity onPress={resetGame} style={styles.retryBtn}>
            <Text style={styles.retryText}>PLAY AGAIN</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Board — cells animate individually on tap */}
      <View style={styles.boardWrap}>
        {board.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((cell, c) => (
              <AnimatedCell key={c} onPress={() => handlePress(r, c)} cell={cell} cellSize={CELL_SIZE}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: getCellBg(cell), borderWidth: 0.5, borderColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                  {cell.isFlagged && !cell.isRevealed && (
                    <Flag size={CELL_SIZE * 0.4} color={colors.pink} />
                  )}
                  {cell.isRevealed && cell.isMine && (
                    <Bomb size={CELL_SIZE * 0.4} color="#fff" />
                  )}
                  {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0 && (
                    <Text style={[styles.cellNum, { color: ADJ_COLORS[cell.adjacentMines], fontSize: CELL_SIZE * 0.45 }]}>
                      {cell.adjacentMines}
                    </Text>
                  )}
                </View>
              </AnimatedCell>
            ))}
          </View>
        ))}
      </View>

      {/* Action bar */}
      <View style={styles.actionBar}>
        <Animated.View style={{ transform: [{ scale: flagScaleAnim.current }] }}>
          <TouchableOpacity
            style={[styles.actionBtn, !flagMode && styles.actionBtnActive]}
            onPress={toggleFlagMode}>
            <Pointer size={22} color={!flagMode ? '#000' : colors.textPrimary} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: flagScaleAnim.current }] }}>
          <TouchableOpacity
            style={[styles.actionBtn, flagMode && styles.actionBtnActive]}
            onPress={toggleFlagMode}>
            <Flag size={18} color={flagMode ? '#000' : colors.textPrimary} />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={[styles.actionBtn, styles.hintBtn]}>
          <HelpCircle size={22} color="#000" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, width: '100%', maxWidth: 500, alignSelf: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14, marginBottom: 14, backgroundColor: colors.purple },
  iconBtn: { width: 38, height: 38, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '900', color: colors.textPrimary, letterSpacing: 2 },
  newGameBtn: { backgroundColor: colors.yellowGreen, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  newGameText: { color: '#000', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  statsRow: { flexDirection: 'row', paddingHorizontal: 18, gap: 12, marginBottom: 14 },
  statBox: { flex: 1, backgroundColor: colors.bgCard, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.border },
  statBoxTexts: { flex: 1 },
  statLabel: { fontSize: 9, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 2 },
  statValue: { fontSize: 22, fontWeight: '900', color: colors.textAccentYellow, letterSpacing: 2 },

  banner: { marginHorizontal: 18, borderRadius: 12, padding: 14, marginBottom: 10, alignItems: 'center', gap: 8 },
  bannerWin: { backgroundColor: '#1A3A1A' },
  bannerLose: { backgroundColor: '#3A1A1A' },
  bannerText: { color: colors.textPrimary, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  retryBtn: { backgroundColor: colors.purple, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  boardWrap: { paddingHorizontal: 18, marginBottom: 14, alignSelf: 'center' },
  row: { flexDirection: 'row' },
  cell: { overflow: 'hidden' },
  cellNum: { fontWeight: '800' },

  actionBar: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingHorizontal: 18 },
  actionBtn: {
    width: 70, height: 52, borderRadius: 14,
    backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  actionBtnActive: { backgroundColor: colors.purple },
  hintBtn: { backgroundColor: colors.yellow },
});
