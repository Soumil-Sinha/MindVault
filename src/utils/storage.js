import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = '@GameVault_user';
const STATS_KEY = '@GameVault_stats';
const HISTORY_KEY = '@GameVault_history';

// Auth
export async function saveUser(email) {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify({ email }));
  } catch (e) {
    console.error('saveUser error', e);
  }
}

export async function getUser() {
  try {
    const val = await AsyncStorage.getItem(USER_KEY);
    return val ? JSON.parse(val) : null;
  } catch (e) {
    return null;
  }
}

export async function clearUser() {
  await AsyncStorage.removeItem(USER_KEY);
}

// Game Stats & History
export async function saveGameResult({ gameName, score, won, timeTakenSeconds }) {
  try {
    const historyVal = await AsyncStorage.getItem(HISTORY_KEY);
    let history = historyVal ? JSON.parse(historyVal) : [];

    history.push({
      gameName, score, won, timeTakenSeconds, timestamp: Date.now()
    });
    
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    const statsVal = await AsyncStorage.getItem(STATS_KEY);
    let stats = statsVal ? JSON.parse(statsVal) : { gamesPlayed: 0, wins: 0, totalTimeSeconds: 0 };
    
    stats.gamesPlayed += 1;
    if (won) stats.wins += 1;
    stats.totalTimeSeconds += (timeTakenSeconds || 0);

    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('saveGameResult error', e);
  }
}

export async function getStats() {
  const statsVal = await AsyncStorage.getItem(STATS_KEY);
  if (!statsVal) return { gamesPlayed: 0, wins: 0, totalTimeSeconds: 0 };
  return JSON.parse(statsVal);
}

export async function getHistory() {
  const historyVal = await AsyncStorage.getItem(HISTORY_KEY);
  return historyVal ? JSON.parse(historyVal) : [];
}
