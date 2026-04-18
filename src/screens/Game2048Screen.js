import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, Platform, useWindowDimensions,
  Animated, PanResponder,
} from 'react-native';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { saveGameResult } from '../utils/storage';

// ─── Constants ────────────────────────────────────────────────────────────────

const GAP = 8;
const ANIM_MS = 110;

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
const getTileStyle = v => TILE_COLORS[v] || { bg: '#FFD700', text: '#000' };

// ─── Tile factory ─────────────────────────────────────────────────────────────

let _uid = 1;
const uid = () => _uid++;

function mkTile(value, row, col) {
  return { id: uid(), value, row, col };
}

function initTiles() {
  const all = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) all.push([r, c]);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return [
    mkTile(Math.random() < 0.9 ? 2 : 4, all[0][0], all[0][1]),
    mkTile(Math.random() < 0.9 ? 2 : 4, all[1][0], all[1][1]),
  ];
}

function spawnRandom(tiles) {
  const occupied = new Set(tiles.map(t => `${t.row},${t.col}`));
  const empties = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++)
    if (!occupied.has(`${r},${c}`)) empties.push([r, c]);
  if (!empties.length) return { tiles, spawned: null };
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const spawned = mkTile(Math.random() < 0.9 ? 2 : 4, r, c);
  return { tiles: [...tiles, spawned], spawned };
}

// ─── Move logic ───────────────────────────────────────────────────────────────
// Returns:
//   newTiles   – real tiles after the move  (IDs preserved; merged tile keeps first tile's ID)
//   ghosts     – consumed tiles still needing animation  [{...tile, targetRow, targetCol}]
//   mergedIds  – Set of IDs that just merged (for pop animation)
//   score      – points gained
//   changed    – whether anything actually moved

function mergeLine(line) {
  // line: tile objects in slide-toward-zero order (already filtered)
  const out = [];
  const ghosts = [];
  const mergedIds = new Set();
  let score = 0;
  let i = 0;
  while (i < line.length) {
    if (i + 1 < line.length && line[i].value === line[i + 1].value) {
      const merged = { ...line[i], value: line[i].value * 2 };
      score += merged.value;
      mergedIds.add(merged.id);
      out.push({ tile: merged, slotIndex: out.length });
      ghosts.push({ consumed: line[i + 1], slotIndex: out.length - 1 });
      i += 2;
    } else {
      out.push({ tile: { ...line[i] }, slotIndex: out.length });
      i++;
    }
  }
  return { out, ghosts, mergedIds, score };
}

function computeMove(tiles, dir) {
  const grid = Array.from({ length: 4 }, () => Array(4).fill(null));
  tiles.forEach(t => { grid[t.row][t.col] = t; });

  const newTiles = [];
  const ghostTiles = [];
  const allMergedIds = new Set();
  let totalScore = 0;

  if (dir === 'left' || dir === 'right') {
    for (let r = 0; r < 4; r++) {
      const line = (dir === 'left' ? [0, 1, 2, 3] : [3, 2, 1, 0])
        .map(c => grid[r][c]).filter(Boolean);
      const { out, ghosts, mergedIds, score } = mergeLine(line);
      totalScore += score;
      mergedIds.forEach(id => allMergedIds.add(id));
      out.forEach(({ tile }, i) => {
        newTiles.push({ ...tile, row: r, col: dir === 'left' ? i : 3 - i });
      });
      ghosts.forEach(({ consumed, slotIndex }) => {
        ghostTiles.push({ ...consumed, targetRow: r, targetCol: dir === 'left' ? slotIndex : 3 - slotIndex });
      });
    }
  } else {
    for (let c = 0; c < 4; c++) {
      const line = (dir === 'up' ? [0, 1, 2, 3] : [3, 2, 1, 0])
        .map(r => grid[r][c]).filter(Boolean);
      const { out, ghosts, mergedIds, score } = mergeLine(line);
      totalScore += score;
      mergedIds.forEach(id => allMergedIds.add(id));
      out.forEach(({ tile }, i) => {
        newTiles.push({ ...tile, row: dir === 'up' ? i : 3 - i, col: c });
      });
      ghosts.forEach(({ consumed, slotIndex }) => {
        ghostTiles.push({ ...consumed, targetRow: dir === 'up' ? slotIndex : 3 - slotIndex, targetCol: c });
      });
    }
  }

  const prevKey = tiles.map(t => `${t.id}:${t.row},${t.col}`).sort().join('|');
  const nextKey = newTiles.map(t => `${t.id}:${t.row},${t.col}`).sort().join('|');
  const changed = prevKey !== nextKey || ghostTiles.length > 0;

  return { newTiles, ghostTiles, mergedIds: allMergedIds, score: totalScore, changed };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Game2048Screen({ navigation }) {
  const { width: windowWidth } = useWindowDimensions();
  const BOARD_SIZE = Math.min(windowWidth, 500) - 24;
  const CELL_SIZE = Math.floor((BOARD_SIZE - GAP * 5) / 4);
  const BOARD_H = GAP * 5 + CELL_SIZE * 4;

  // tile pixel top-left corner from row/col
  const px = useCallback((row, col) => ({
    x: GAP + col * (CELL_SIZE + GAP),
    y: GAP + row * (CELL_SIZE + GAP),
  }), [CELL_SIZE]);

  const [tiles, setTiles] = useState(initTiles);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);

  // animMap[id] = { pos: Animated.ValueXY, scale: Animated.Value }
  const animMap = useRef({});
  const isMoving = useRef(false);
  const tilesRef = useRef(tiles);

  useEffect(() => { tilesRef.current = tiles; }, [tiles]);

  // Ensure every tile has an anim entry; called before any move and on init
  const ensureAnim = useCallback((id, row, col) => {
    if (!animMap.current[id]) {
      animMap.current[id] = {
        pos: new Animated.ValueXY(px(row, col)),
        scale: new Animated.Value(1),
      };
    }
    return animMap.current[id];
  }, [px]);

  // Seed anim entries for initial tiles
  useEffect(() => {
    tiles.forEach(t => ensureAnim(t.id, t.row, t.col));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Core move handler ──────────────────────────────────────────────────────
  const performMove = useCallback((dir) => {
    if (isMoving.current) return;

    const realTiles = tilesRef.current.filter(t => !t.isGhost);
    const result = computeMove(realTiles, dir);
    if (!result.changed) return;

    isMoving.current = true;

    // Make sure all current real tiles have anim entries
    realTiles.forEach(t => ensureAnim(t.id, t.row, t.col));

    // Temporarily add ghost tiles to the state so they render during animation
    const ghostsForState = result.ghostTiles.map(g => ({ ...g, isGhost: true }));
    const combined = [...result.newTiles, ...ghostsForState];
    setTiles(combined);
    tilesRef.current = combined;

    // Build parallel animations
    const anims = [];

    result.newTiles.forEach(tile => {
      const a = animMap.current[tile.id];
      if (!a) return;
      anims.push(Animated.timing(a.pos, {
        toValue: px(tile.row, tile.col),
        duration: ANIM_MS,
        useNativeDriver: true,
      }));
    });

    result.ghostTiles.forEach(ghost => {
      const a = animMap.current[ghost.id];
      if (!a) return;
      anims.push(Animated.timing(a.pos, {
        toValue: px(ghost.targetRow, ghost.targetCol),
        duration: ANIM_MS,
        useNativeDriver: true,
      }));
    });

    Animated.parallel(anims).start(() => {
      // Remove ghost anim entries
      result.ghostTiles.forEach(g => { delete animMap.current[g.id]; });

      // Spawn new random tile
      const { tiles: finalTiles, spawned } = spawnRandom(result.newTiles);

      if (spawned) {
        const { x, y } = px(spawned.row, spawned.col);
        animMap.current[spawned.id] = {
          pos: new Animated.ValueXY({ x, y }),
          scale: new Animated.Value(0.2),
        };
      }

      setTiles(finalTiles);
      tilesRef.current = finalTiles;
      setScore(prev => {
        const next = prev + result.score;
        setBest(b => Math.max(b, next));
        return next;
      });

      // Pop animations: spawn + merge
      const popAnims = [];

      if (spawned) {
        const a = animMap.current[spawned.id];
        if (a) popAnims.push(
          Animated.spring(a.scale, { toValue: 1, friction: 4, tension: 220, useNativeDriver: true })
        );
      }

      result.mergedIds.forEach(id => {
        const a = animMap.current[id];
        if (!a) return;
        a.scale.setValue(1);
        popAnims.push(Animated.sequence([
          Animated.timing(a.scale, { toValue: 1.18, duration: 70, useNativeDriver: true }),
          Animated.spring(a.scale, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }),
        ]));
      });

      if (popAnims.length) {
        Animated.parallel(popAnims).start(() => { isMoving.current = false; });
      } else {
        isMoving.current = false;
      }
    });
  }, [px, ensureAnim]);

  // Stable ref so PanResponder never holds a stale closure
  const moveRef = useRef(performMove);
  useEffect(() => { moveRef.current = performMove; }, [performMove]);

  // ── PanResponder ──────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, { dx, dy }) => Math.abs(dx) > 4 || Math.abs(dy) > 4,
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_, { dx, dy }) => {
        const ax = Math.abs(dx), ay = Math.abs(dy);
        if (ax < 12 && ay < 12) return;
        if (ax >= ay) moveRef.current(dx > 0 ? 'right' : 'left');
        else moveRef.current(dy > 0 ? 'down' : 'up');
      },
    })
  ).current;

  // ── Keyboard (web) ────────────────────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const MAP = {
      arrowleft: 'left', a: 'left',
      arrowright: 'right', d: 'right',
      arrowup: 'up', w: 'up',
      arrowdown: 'down', s: 'down',
    };
    const handler = e => {
      const dir = MAP[e.key.toLowerCase()];
      if (dir) { e.preventDefault(); moveRef.current(dir); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ── Game reset ────────────────────────────────────────────────────────────
  const resetGame = () => {
    if (score > 0) saveGameResult({ gameName: '2048', score, won: false, timeTakenSeconds: 0 });
    animMap.current = {};
    isMoving.current = false;
    const fresh = initTiles();
    fresh.forEach(t => ensureAnim(t.id, t.row, t.col));
    setTiles(fresh);
    tilesRef.current = fresh;
    setScore(0);
  };

  const handleBack = () => {
    if (score > 0) saveGameResult({ gameName: '2048', score, won: false, timeTakenSeconds: 0 });
    navigation.goBack();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  const renderTile = (tile) => {
    const a = ensureAnim(tile.id, tile.row, tile.col);
    const ts = getTileStyle(tile.value);
    const fontSize = tile.value >= 1024
      ? CELL_SIZE * 0.26
      : tile.value >= 128
        ? CELL_SIZE * 0.31
        : CELL_SIZE * 0.38;

    return (
      <Animated.View
        key={tile.id}
        style={[
          styles.tile,
          {
            width: CELL_SIZE,
            height: CELL_SIZE,
            borderRadius: 10,
            backgroundColor: ts.bg,
            transform: [
              { translateX: a.pos.x },
              { translateY: a.pos.y },
              { scale: a.scale },
            ],
          },
        ]}
      >
        {tile.value !== 0 && (
          <Text style={[styles.tileNum, { color: ts.text, fontSize }]}>
            {tile.value}
          </Text>
        )}
      </Animated.View>
    );
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

      {/* Board */}
      <View
        style={[styles.board, { width: BOARD_SIZE, height: BOARD_H }]}
        {...panResponder.panHandlers}
      >
        {/* Background grid cells */}
        {Array.from({ length: 4 }, (_, r) =>
          Array.from({ length: 4 }, (_, c) => (
            <View
              key={`bg-${r}-${c}`}
              style={[
                styles.bgCell,
                {
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  left: GAP + c * (CELL_SIZE + GAP),
                  top: GAP + r * (CELL_SIZE + GAP),
                  borderRadius: 10,
                },
              ]}
            />
          ))
        )}
        {/* Animated tiles */}
        {tiles.map(renderTile)}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg, width: '100%', maxWidth: 500, alignSelf: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingTop: 8, marginBottom: 14,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 8,
    backgroundColor: colors.bgCard, justifyContent: 'center', alignItems: 'center',
  },
  title: { fontSize: 36, fontWeight: '900', color: colors.yellow, letterSpacing: 2 },

  scoreRow: { flexDirection: 'row', paddingHorizontal: 18, gap: 12, marginBottom: 10 },
  scoreBox: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: 12, padding: 12,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  scoreLabel: { fontSize: 9, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: 4 },
  scoreVal: { fontSize: 20, fontWeight: '900', color: colors.textPrimary },

  hint: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginBottom: 14 },

  board: {
    backgroundColor: colors.bgCard, alignSelf: 'center',
    borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    position: 'relative',
  },

  bgCell: { position: 'absolute', backgroundColor: '#1A1A2E' },

  tile: {
    position: 'absolute',
    justifyContent: 'center', alignItems: 'center',
  },
  tileNum: { fontWeight: '900' },
});
