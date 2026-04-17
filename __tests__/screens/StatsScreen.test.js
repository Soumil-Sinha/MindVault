import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import StatsScreen from '../../src/screens/StatsScreen';

jest.mock('../../src/utils/storage', () => ({
  getStats: jest.fn().mockResolvedValue({ gamesPlayed: 5, wins: 3, totalTimeSeconds: 600 }),
}));

describe('StatsScreen', () => {
  // Each test is async and uses waitFor so the getStats() useEffect
  // state update is flushed inside act() — eliminating the console warning.

  it('renders the screen title', async () => {
    const { getByText } = render(<StatsScreen />);
    await waitFor(() => expect(getByText('PERFORMANCE HUB')).toBeTruthy());
  });

  it('renders the period toggle buttons', async () => {
    const { getByText } = render(<StatsScreen />);
    await waitFor(() => {
      expect(getByText('DAY')).toBeTruthy();
      expect(getByText('WEEK')).toBeTruthy();
      expect(getByText('MONTH')).toBeTruthy();
    });
  });

  it('renders the stat card labels', async () => {
    const { getByText } = render(<StatsScreen />);
    await waitFor(() => {
      expect(getByText('WIN RATE')).toBeTruthy();
      expect(getByText('GAMES PLAYED')).toBeTruthy();
      expect(getByText('AVG TIME')).toBeTruthy();
    });
  });

  it('renders the activity trend chart section', async () => {
    const { getByText } = render(<StatsScreen />);
    await waitFor(() => expect(getByText('ACTIVITY TREND')).toBeTruthy());
  });

  it('renders breakthroughs section', async () => {
    const { getByText } = render(<StatsScreen />);
    await waitFor(() => expect(getByText('LATEST BREAKTHROUGHS')).toBeTruthy());
  });

  it('renders export and share buttons', async () => {
    const { getByText } = render(<StatsScreen />);
    await waitFor(() => {
      expect(getByText('EXPORT REPORT')).toBeTruthy();
      expect(getByText('SHARE STATS')).toBeTruthy();
    });
  });
});
