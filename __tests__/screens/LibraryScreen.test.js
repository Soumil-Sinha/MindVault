import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import LibraryScreen from '../../src/screens/LibraryScreen';
import { renderWithAuth, mockNavigation } from '../test-utils';

describe('LibraryScreen', () => {
  it('renders the library title', () => {
    const { getByText } = renderWithAuth(
      <LibraryScreen navigation={mockNavigation} />
    );
    expect(getByText('YOUR LIBRARY')).toBeTruthy();
  });

  it('renders all game cards', () => {
    const { getByText, getAllByText } = renderWithAuth(
      <LibraryScreen navigation={mockNavigation} />
    );
    expect(getByText('SUDOKU')).toBeTruthy();
    expect(getByText('MINES')).toBeTruthy();
    // '2048' appears as both the large number label and the card name
    expect(getAllByText('2048').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all category filter buttons', () => {
    const { getByText, getAllByText } = renderWithAuth(
      <LibraryScreen navigation={mockNavigation} />
    );
    expect(getByText('ALL GAMES')).toBeTruthy();
    expect(getByText('PUZZLES')).toBeTruthy();
    // 'CLASSIC' appears in both the category bar and the Minesweeper card mode label
    expect(getAllByText('CLASSIC').length).toBeGreaterThanOrEqual(1);
    expect(getByText('LOGIC')).toBeTruthy();
  });

  it('renders the search input', () => {
    const { getByPlaceholderText } = renderWithAuth(
      <LibraryScreen navigation={mockNavigation} />
    );
    expect(getByPlaceholderText('FIND A GAME...')).toBeTruthy();
  });

  it('navigates to Sudoku when PLAY is pressed on the Sudoku card', () => {
    const navigate = jest.fn();
    const { getAllByText } = renderWithAuth(
      <LibraryScreen navigation={{ ...mockNavigation, navigate }} />
    );
    // First PLAY button belongs to Sudoku card
    fireEvent.press(getAllByText('PLAY')[0]);
    expect(navigate).toHaveBeenCalledWith('Sudoku');
  });

  it('shows POPULAR NOW section heading', () => {
    const { getByText } = renderWithAuth(
      <LibraryScreen navigation={mockNavigation} />
    );
    expect(getByText('POPULAR NOW')).toBeTruthy();
  });
});
