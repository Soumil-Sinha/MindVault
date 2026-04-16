export function generateSudokuGame(difficulty = 'expert') {
  const N = 9;
  const SRN = 3;
  let mat = Array.from({ length: N }, () => Array(N).fill(0));

  function randomGenerator(num) {
    return Math.floor(Math.random() * num + 1);
  }

  function unUsedInBox(rowStart, colStart, num) {
    for (let i = 0; i < SRN; i++) {
        for (let j = 0; j < SRN; j++) {
            if (mat[rowStart + i][colStart + j] === num) return false;
        }
    }
    return true;
  }

  function fillBox(rowStart, colStart) {
    let num;
    for (let i = 0; i < SRN; i++) {
        for (let j = 0; j < SRN; j++) {
            do {
                num = randomGenerator(N);
            } while (!unUsedInBox(rowStart, colStart, num));
            mat[rowStart + i][colStart + j] = num;
        }
    }
  }

  function checkIfSafe(i, j, num) {
    return (
        unUsedInRow(i, num) &&
        unUsedInCol(j, num) &&
        unUsedInBox(i - (i % SRN), j - (j % SRN), num)
    );
  }

  function unUsedInRow(i, num) {
    for (let j = 0; j < N; j++) {
        if (mat[i][j] === num) return false;
    }
    return true;
  }

  function unUsedInCol(j, num) {
    for (let i = 0; i < N; i++) {
        if (mat[i][j] === num) return false;
    }
    return true;
  }

  function fillRemaining(i, j) {
    if (j >= N && i < N - 1) {
        i = i + 1;
        j = 0;
    }
    if (i >= N && j >= N) return true;
    if (i < SRN) {
        if (j < SRN) j = SRN;
    } else if (i < N - SRN) {
        if (j === Math.floor(i / SRN) * SRN) j = j + SRN;
    } else {
        if (j === N - SRN) {
            i = i + 1;
            j = 0;
            if (i >= N) return true;
        }
    }

    for (let num = 1; num <= N; num++) {
        if (checkIfSafe(i, j, num)) {
            mat[i][j] = num;
            if (fillRemaining(i, j + 1)) return true;
            mat[i][j] = 0;
        }
    }
    return false;
  }

  function removeKDigits(K) {
    let count = K;
    let removedIdxs = new Set();
    while (count !== 0) {
        let cellId = Math.floor(Math.random() * N * N);
        if (!removedIdxs.has(cellId)) {
            let i = Math.floor(cellId / N);
            let j = cellId % N;
            mat[i][j] = 0;
            removedIdxs.add(cellId);
            count--;
        }
    }
  }

  // 1. Fill diagonal boxes
  for (let i = 0; i < N; i += SRN) fillBox(i, i);
  // 2. Fill remaining
  fillRemaining(0, SRN);
  // 3. Save solution
  const solution = mat.map(row => [...row]);
  // 4. Remove elements
  const missingCount = difficulty === 'expert' ? 50 : difficulty === 'medium' ? 40 : 30;
  removeKDigits(missingCount);

  return { puzzle: mat, solution };
}
