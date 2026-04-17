import React from 'react';
import { waitFor } from '@testing-library/react-native';
import RankingsScreen from '../../src/screens/RankingsScreen';
import { renderWithAuth } from '../test-utils';

jest.mock('../../src/utils/storage', () => ({
  getHistory: jest.fn().mockResolvedValue([]),
}));

describe('RankingsScreen', () => {
  // Each test is async and uses waitFor so the getHistory() useEffect
  // state update is flushed inside act() — eliminating the console warning.

  it('renders the profile title', async () => {
    const { getByText } = renderWithAuth(<RankingsScreen />);
    await waitFor(() => expect(getByText('MY PROFILE')).toBeTruthy());
  });

  it('renders the time-period tab buttons', async () => {
    const { getByText } = renderWithAuth(<RankingsScreen />);
    await waitFor(() => {
      expect(getByText('DAILY')).toBeTruthy();
      expect(getByText('WEEKLY')).toBeTruthy();
      expect(getByText('ALL-TIME')).toBeTruthy();
    });
  });

  it('renders the leaderboard section label', async () => {
    const { getByText } = renderWithAuth(<RankingsScreen />);
    await waitFor(() => expect(getByText('LOCAL HIGHSCORES')).toBeTruthy());
  });

  it('renders the top mock players', async () => {
    const { getByText } = renderWithAuth(<RankingsScreen />);
    // Vanguard.sol has the highest score (18450) and should appear in top 3
    await waitFor(() => expect(getByText('Vanguard.sol')).toBeTruthy());
  });

  it('renders rank badges in the podium', async () => {
    const { getByText } = renderWithAuth(<RankingsScreen />);
    await waitFor(() => {
      expect(getByText('#1')).toBeTruthy();
      expect(getByText('#2')).toBeTruthy();
      expect(getByText('#3')).toBeTruthy();
    });
  });
});
