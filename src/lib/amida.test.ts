import { describe, expect, it } from 'vitest';
import { generateAmida, resolveAllPaths, resolvePath, tracePath, type AmidaBoard } from './amida';

describe('generateAmida', () => {
  it('never places two rungs on adjacent gaps at the same row', () => {
    // Exercise many seeds so the adjacency rule is checked across a wide range of layouts.
    for (let seed = 0; seed < 200; seed++) {
      let calls = 0;
      const rng = () => {
        calls += 1;
        // deterministic pseudo-random sequence derived from the seed
        return ((seed * 9301 + calls * 49297) % 233280) / 233280;
      };
      const board = generateAmida(4, 10, rng);
      const byRow = new Map<number, number[]>();
      for (const rung of board.rungs) {
        const gaps = byRow.get(rung.row) ?? [];
        gaps.push(rung.gap);
        byRow.set(rung.row, gaps);
      }
      for (const gaps of byRow.values()) {
        const sorted = [...gaps].sort((a, b) => a - b);
        for (let i = 1; i < sorted.length; i++) {
          expect(sorted[i] - sorted[i - 1]).toBeGreaterThanOrEqual(2);
        }
      }
    }
  });

  it('produces the requested row count and stays within line bounds', () => {
    const board = generateAmida(4, 10, () => 0.4);
    expect(board.rowCount).toBe(10);
    for (const rung of board.rungs) {
      expect(rung.gap).toBeGreaterThanOrEqual(0);
      expect(rung.gap).toBeLessThan(board.lineCount - 1);
    }
  });
});

describe('tracePath / resolvePath', () => {
  it('swaps lines through a single rung', () => {
    const board: AmidaBoard = { lineCount: 4, rowCount: 1, rungs: [{ row: 0, gap: 0 }] };
    expect(resolvePath(board, 0)).toBe(1);
    expect(resolvePath(board, 1)).toBe(0);
    expect(resolvePath(board, 2)).toBe(2); // untouched line
  });

  it('chains swaps across multiple rows', () => {
    const board: AmidaBoard = {
      lineCount: 4,
      rowCount: 3,
      rungs: [
        { row: 0, gap: 0 }, // swap lines 0/1
        { row: 1, gap: 1 }, // swap lines 1/2
        { row: 2, gap: 2 }, // swap lines 2/3
      ],
    };
    // start=0: row0 -> 1, row1 -> 2, row2 -> 3
    expect(resolvePath(board, 0)).toBe(3);
    const path = tracePath(board, 0);
    expect(path).toEqual([0, 1, 2, 3]);
  });

  it('resolveAllPaths always yields a permutation (bijective mapping)', () => {
    let calls = 0;
    const rng = () => {
      calls += 1;
      return (calls * 37) % 97 / 97;
    };
    const board = generateAmida(4, 10, rng);
    const outcomes = resolveAllPaths(board);
    expect(new Set(outcomes).size).toBe(board.lineCount);
    for (const end of outcomes) {
      expect(end).toBeGreaterThanOrEqual(0);
      expect(end).toBeLessThan(board.lineCount);
    }
  });
});
