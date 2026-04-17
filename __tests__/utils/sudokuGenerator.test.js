import { generateSudokuGame } from '../../src/utils/sudokuGenerator';

describe('generateSudokuGame', () => {
  it('returns a puzzle and a solution object', () => {
    const result = generateSudokuGame('easy');
    expect(result).toHaveProperty('puzzle');
    expect(result).toHaveProperty('solution');
  });

  it('puzzle is a 9x9 grid', () => {
    const { puzzle } = generateSudokuGame('easy');
    expect(puzzle).toHaveLength(9);
    puzzle.forEach((row) => expect(row).toHaveLength(9));
  });

  it('solution is a 9x9 grid', () => {
    const { solution } = generateSudokuGame('medium');
    expect(solution).toHaveLength(9);
    solution.forEach((row) => expect(row).toHaveLength(9));
  });

  it('puzzle cells are numbers between 0 and 9', () => {
    const { puzzle } = generateSudokuGame('easy');
    puzzle.flat().forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(9);
    });
  });

  it('solution cells are all between 1 and 9 (no zeros)', () => {
    const { solution } = generateSudokuGame('easy');
    solution.flat().forEach((val) => {
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(9);
    });
  });

  it('easy mode removes fewer cells than expert mode', () => {
    const { puzzle: easy } = generateSudokuGame('easy');
    const { puzzle: expert } = generateSudokuGame('expert');
    const easyZeros = easy.flat().filter((v) => v === 0).length;
    const expertZeros = expert.flat().filter((v) => v === 0).length;
    // expert should have more blanks on average (50 vs 30)
    expect(expertZeros).toBeGreaterThan(easyZeros);
  });

  it('each solution row contains digits 1-9 exactly once', () => {
    const { solution } = generateSudokuGame('medium');
    solution.forEach((row) => {
      const sorted = [...row].sort((a, b) => a - b);
      expect(sorted).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
  });
});
