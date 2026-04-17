import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MinesweeperScreen from '../../src/screens/MinesweeperScreen';
import { mockNavigation } from '../test-utils';

jest.mock('../../src/utils/storage', () => ({
  saveGameResult: jest.fn().mockResolvedValue(undefined),
}));

describe('MinesweeperScreen', () => {
  it('renders the screen title', () => {
    const { getByText } = render(<MinesweeperScreen navigation={mockNavigation} />);
    expect(getByText('MINESWEEPER')).toBeTruthy();
  });

  it('renders mines counter and timer labels', () => {
    const { getByText } = render(<MinesweeperScreen navigation={mockNavigation} />);
    expect(getByText('MINES')).toBeTruthy();
    expect(getByText('TIME')).toBeTruthy();
  });

  it('renders the initial mines count', () => {
    const { getByText } = render(<MinesweeperScreen navigation={mockNavigation} />);
    // MINES_COUNT = 12, padded to '012'
    expect(getByText('012')).toBeTruthy();
  });

  it('renders the NEW GAME button', () => {
    const { getByText } = render(<MinesweeperScreen navigation={mockNavigation} />);
    expect(getByText('NEW GAME')).toBeTruthy();
  });

  it('resets the board when NEW GAME is pressed', () => {
    const { getByText } = render(<MinesweeperScreen navigation={mockNavigation} />);
    // Press NEW GAME — board should reset; mines count returns to 012
    fireEvent.press(getByText('NEW GAME'));
    expect(getByText('012')).toBeTruthy();
  });

  it('renders the timer starting at 00:00', () => {
    const { getByText } = render(<MinesweeperScreen navigation={mockNavigation} />);
    expect(getByText('00:00')).toBeTruthy();
  });
});
