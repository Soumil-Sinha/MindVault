import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveUser,
  getUser,
  clearUser,
  saveGameResult,
  getStats,
  getHistory,
} from '../../src/utils/storage';

beforeEach(() => {
  AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('storage – user helpers', () => {
  it('saveUser stores a user object', async () => {
    await saveUser('player@grid.com');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@GameVault_user',
      JSON.stringify({ email: 'player@grid.com' })
    );
  });

  it('getUser returns null when nothing is stored', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const result = await getUser();
    expect(result).toBeNull();
  });

  it('getUser returns the stored user', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify({ email: 'player@grid.com' })
    );
    const result = await getUser();
    expect(result).toEqual({ email: 'player@grid.com' });
  });

  it('clearUser removes the user key', async () => {
    await clearUser();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@GameVault_user');
  });
});

describe('storage – game result helpers', () => {
  it('saveGameResult increments gamesPlayed', async () => {
    // Simulate empty storage
    AsyncStorage.getItem.mockResolvedValue(null);
    await saveGameResult({ gameName: 'Sudoku', score: 100, won: true, timeTakenSeconds: 120 });
    // The second setItem call should be the updated stats
    const calls = AsyncStorage.setItem.mock.calls;
    const statsCall = calls.find(([key]) => key === '@GameVault_stats');
    expect(statsCall).toBeTruthy();
    const stats = JSON.parse(statsCall[1]);
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.wins).toBe(1);
    expect(stats.totalTimeSeconds).toBe(120);
  });

  it('getStats returns zeros when nothing is stored', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const stats = await getStats();
    expect(stats).toEqual({ gamesPlayed: 0, wins: 0, totalTimeSeconds: 0 });
  });

  it('getHistory returns an empty array when nothing is stored', async () => {
    AsyncStorage.getItem.mockResolvedValueOnce(null);
    const history = await getHistory();
    expect(history).toEqual([]);
  });

  it('getHistory returns parsed history when present', async () => {
    const mockHistory = [{ gameName: '2048', score: 500, won: false }];
    AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockHistory));
    const history = await getHistory();
    expect(history).toEqual(mockHistory);
  });
});
