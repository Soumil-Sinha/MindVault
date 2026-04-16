import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Dimensions, useWindowDimensions, Animated,
} from 'react-native';
import { Pause, Settings, Undo2, Eraser, Lightbulb, Pencil } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { saveGameResult } from '../utils/storage';
import { generateSudokuGame } from '../utils/sudokuGenerator';

export default function SudokuScreen({ navigation }) {
  const [basePuzzle, setBasePuzzle] = useState([]);
  const [solutionInfo, setSolutionInfo] = useState([]);
  const [board, setBoard] = useState([]);
  const [notesData, setNotesData] = useState([]);
  const [selected, setSelected] = useState(null);
  
  const [mistakes, setMistakes] = useState(0);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [notesMode, setNotesMode] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const timerRef = useRef(null);
  const { width: windowWidth } = useWindowDimensions();
  const widthArea = Math.min(windowWidth, 500);
  const BOARD_SIZE = widthArea - 36;
  const CELL_SIZE = Math.floor(BOARD_SIZE / 9);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceBoard = () => {
    scaleAnim.setValue(0.97);
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  const resetGame = () => {
     const { puzzle, solution } = generateSudokuGame('expert');
     setBasePuzzle(puzzle);
     setSolutionInfo(solution);
     setBoard(puzzle.map(r => [...r]));
     setNotesData(Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => [])));
     setSelected(null);
     setMistakes(0);
     setScore(0);
     setSeconds(0);
     setNotesMode(false);
     setGameOver(false);
     setWon(false);
     setInitialized(true);
  };

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (timerRef.current) clearInterval(timerRef.current);
    if (!gameOver && !won) {
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameOver, won, initialized]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const checkWinCondition = (currentBoard) => {
    for (let r = 0; r < 9; r++) {
       for (let c = 0; c < 9; c++) {
          if (currentBoard[r][c] !== solutionInfo[r][c]) return false;
       }
    }
    return true;
  };

  const handleCellPress = (r, c) => {
    if (gameOver || won) return;
    setSelected([r, c]);
  };

  const handleNumberPress = (num) => {
    if (!selected || gameOver || won) return;
    const [r, c] = selected;
    if (basePuzzle[r][c] !== 0) return;

    if (notesMode) {
       // Toggle notes flag
       const newNotes = notesData.map(row => row.map(cell => [...cell]));
       const idx = newNotes[r][c].indexOf(num);
       if (idx > -1) newNotes[r][c].splice(idx, 1);
       else newNotes[r][c].push(num);
       setNotesData(newNotes);
       // Clear absolute value if there was one
       if (board[r][c] !== 0) {
           const newBoard = board.map(row => [...row]);
           newBoard[r][c] = 0;
           setBoard(newBoard);
       }
       return;
    }

    // Number Mode
    bounceBoard();
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    if (num !== solutionInfo[r][c]) {
      setScore(s => Math.max(0, s - 50));
      setMistakes(m => {
        const newM = Math.min(m + 1, 3);
        if (newM >= 3) {
           setGameOver(true);
           saveGameResult({ gameName: 'Sudoku', score, won: false, timeTakenSeconds: seconds });
        }
        return newM;
      });
    } else {
      setScore(s => s + 100);
      if (checkWinCondition(newBoard)) {
         setWon(true);
         const timeBonus = Math.max(0, 5000 - (seconds * 2));
         const finalScore = score + 100 + timeBonus;
         setScore(finalScore);
         saveGameResult({ gameName: 'Sudoku', score: finalScore, won: true, timeTakenSeconds: seconds });
      }
    }
  };

  const handleErase = () => {
    if (!selected || gameOver || won) return;
    const [r, c] = selected;
    if (basePuzzle[r][c] !== 0) return;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = 0;
    setBoard(newBoard);
    
    // Also clear notes
    const newNotes = notesData.map(row => row.map(cell => [...cell]));
    newNotes[r][c] = [];
    setNotesData(newNotes);
  };

  const handleBack = () => {
    if (score > 0 && !gameOver && !won) {
       saveGameResult({ gameName: 'Sudoku', score, won: false, timeTakenSeconds: seconds });
    }
    navigation.goBack();
  };

  const isSameBox = (r1, c1, r2, c2) =>
    Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3);

  const getCellStyle = (r, c) => {
    const val = board[r][c];
    const isSelected = selected && selected[0] === r && selected[1] === c;
    const isPrefilled = basePuzzle[r][c] !== 0;
    const isHighlighted = selected &&
      (selected[0] === r || selected[1] === c || isSameBox(r, c, selected[0], selected[1]));
    const isWrong = val !== 0 && !isPrefilled && val !== solutionInfo[r][c];
    const isSameNum = selected && val !== 0 && val === board[selected[0]][selected[1]] && !isSelected;

    return [
      { width: CELL_SIZE, height: CELL_SIZE },
      styles.cell,
      isSelected && styles.cellSelected,
      isHighlighted && !isSelected && styles.cellHighlighted,
      isWrong && styles.cellWrong,
      isSameNum && !isSelected && styles.cellSameNum,
      c % 3 === 2 && c !== 8 && styles.cellBorderRight,
      r % 3 === 2 && r !== 8 && styles.cellBorderBottom,
    ];
  };

  const getNumStyle = (r, c) => {
    const isPrefilled = basePuzzle[r][c] !== 0;
    const isWrong = board[r][c] !== 0 && !isPrefilled && board[r][c] !== solutionInfo[r][c];
    return [
      { fontSize: CELL_SIZE * 0.42 },
      styles.cellNum,
      isPrefilled ? styles.cellNumPrefilled : styles.cellNumUser,
      isWrong && styles.cellNumWrong,
    ];
  };

  if (!initialized) return <SafeAreaView style={styles.safe}><StatusBar barStyle="light-content" backgroundColor={colors.bg} /></SafeAreaView>;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={handleBack}>
          <Pause size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SUDOKU</Text>
        <TouchableOpacity style={styles.newGameBtn} onPress={resetGame}>
          <Text style={styles.newGameText}>NEW GAME</Text>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>MISTAKES</Text>
          <Text style={styles.statValueRed}>{mistakes}/3</Text>
        </View>
        <View style={[styles.statBox, styles.statBoxMid]}>
          <Text style={styles.statLabel}>SCORE</Text>
          <Text style={styles.statValue}>{score.toLocaleString()}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>TIME</Text>
          <Text style={styles.statValue}>{formatTime(seconds)}</Text>
        </View>
      </View>

      {/* Game Over / Win banner */}
      {(gameOver || won) && (
        <View style={[styles.banner, won ? styles.bannerWin : styles.bannerLose]}>
          <Text style={styles.bannerText}>{won ? '🏆 YOU WIN!' : '💥 GAME OVER'}</Text>
          <TouchableOpacity onPress={resetGame} style={styles.retryBtn}>
            <Text style={styles.retryText}>PLAY AGAIN</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Board */}
      <Animated.View style={[styles.boardWrap, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.board, { width: BOARD_SIZE }]}>
          {board.map((row, r) => (
            <View key={r} style={styles.row}>
              {row.map((val, c) => (
                <TouchableOpacity key={c} style={getCellStyle(r, c)}
                  onPress={() => handleCellPress(r, c)} activeOpacity={0.7}>
                  {val !== 0 && <Text style={getNumStyle(r, c)}>{val}</Text>}
                  
                  {/* Notes Render */}
                  {val === 0 && notesData[r][c].length > 0 && (
                     <View style={styles.notesGrid}>
                       {[1,2,3,4,5,6,7,8,9].map(n => (
                         <Text key={n} style={[styles.noteText, { opacity: notesData[r][c].includes(n) ? 1 : 0 }]}>{n}</Text>
                       ))}
                     </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleErase}>
          <Eraser size={20} color="#000" />
          <Text style={styles.actionText}>ERASE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, notesMode && styles.actionBtnActive]}
          onPress={() => setNotesMode(!notesMode)}>
          <Pencil size={20} color={notesMode ? colors.purple : '#000'} />
          <Text style={[styles.actionText, notesMode && { color: colors.purple }]}>NOTES</Text>
        </TouchableOpacity>
      </View>

      {/* Number pad */}
      <View style={styles.numPad}>
        <View style={styles.numRow}>
          {[1,2,3,4,5].map(n => (
            <TouchableOpacity key={n}
              style={[styles.numBtn, selected && board[selected && selected[0]] && board[selected[0]][selected[1]] === n && styles.numBtnActive]}
              onPress={() => handleNumberPress(n)}>
              <Text style={[styles.numBtnText, selected && board[selected && selected[0]] && board[selected[0]][selected[1]] === n && styles.numBtnTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.numRow}>
          {[6,7,8,9].map(n => (
            <TouchableOpacity key={n}
              style={[styles.numBtn, selected && board[selected && selected[0]] && board[selected[0]][selected[1]] === n && styles.numBtnActive]}
              onPress={() => handleNumberPress(n)}>
              <Text style={[styles.numBtnText, selected && board[selected && selected[0]] && board[selected[0]][selected[1]] === n && styles.numBtnTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.tapToInsert}>Tap to{'\n'}Insert</Text>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, width: '100%', maxWidth: 500, alignSelf: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 8, marginBottom: 14 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.textPrimary, letterSpacing: 2 },
  iconBtn: { width: 38, height: 38, borderRadius: 8, backgroundColor: colors.bgCard, justifyContent: 'center', alignItems: 'center' },
  newGameBtn: { backgroundColor: colors.yellowGreen, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  newGameText: { color: '#000', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  statsRow: { flexDirection: 'row', paddingHorizontal: 18, gap: 10, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: colors.bgCard, borderRadius: 12, padding: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  statBoxMid: { borderColor: colors.blue, borderWidth: 1 },
  statLabel: { fontSize: 9, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: '900', color: colors.cyan },
  statValueRed: { fontSize: 16, fontWeight: '900', color: colors.red },

  banner: { marginHorizontal: 18, borderRadius: 12, padding: 14, marginBottom: 10, alignItems: 'center', gap: 8 },
  bannerWin: { backgroundColor: '#1A3A1A' },
  bannerLose: { backgroundColor: '#3A1A1A' },
  bannerText: { color: colors.textPrimary, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  retryBtn: { backgroundColor: colors.purple, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 8 },
  retryText: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  boardWrap: { paddingHorizontal: 18, marginBottom: 14, alignSelf: 'center' },
  board: { borderWidth: 2, borderColor: colors.textSecondary, borderRadius: 4 },
  row: { flexDirection: 'row' },

  cell: {
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 0.5, borderColor: colors.border,
    backgroundColor: colors.bgCard, position: 'relative'
  },
  cellSelected: { backgroundColor: colors.purple },
  cellHighlighted: { backgroundColor: '#2D2B50' },
  cellWrong: { backgroundColor: '#2E1010' },
  cellSameNum: { backgroundColor: '#1E1530' },
  cellBorderRight: { borderRightWidth: 2, borderRightColor: colors.textSecondary },
  cellBorderBottom: { borderBottomWidth: 2, borderBottomColor: colors.textSecondary },

  cellNum: { fontWeight: '700' },
  cellNumPrefilled: { color: colors.textPrimary },
  cellNumUser: { color: colors.cyan },
  cellNumWrong: { color: colors.red },

  notesGrid: {
    flexDirection: 'row', flexWrap: 'wrap', width: '100%', height: '100%',
    padding: 2, justifyContent: 'center', alignItems: 'center', alignContent: 'center'
  },
  noteText: {
    width: '33%', fontSize: 8, color: colors.textSecondary,
    textAlign: 'center', fontWeight: '800'
  },

  actionRow: { flexDirection: 'row', paddingHorizontal: 18, gap: 10, marginBottom: 14 },
  actionBtn: {
    flex: 1, backgroundColor: colors.yellow,
    borderRadius: 10, paddingVertical: 10, alignItems: 'center', gap: 4,
  },
  actionBtnActive: { backgroundColor: '#E8D5FF' },
  actionText: { fontSize: 9, fontWeight: '800', color: '#000', letterSpacing: 1 },

  numPad: { paddingHorizontal: 18, gap: 10 },
  numRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  numBtn: {
    flex: 1, height: 52, backgroundColor: colors.bgCard,
    borderRadius: 10, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  numBtnActive: { backgroundColor: colors.purple, borderColor: colors.purple },
  numBtnText: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  numBtnTextActive: { color: '#fff' },
  tapToInsert: { color: colors.textMuted, fontSize: 10, textAlign: 'center', flex: 1 },
});
