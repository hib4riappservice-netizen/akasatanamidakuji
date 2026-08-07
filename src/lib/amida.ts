import type { Rng } from './draw';

export interface Rung {
  /** 0-indexed row (height) this rung sits at. */
  row: number;
  /** Index of the left line this rung connects; it joins lines `gap` and `gap + 1`. */
  gap: number;
}

export interface AmidaBoard {
  lineCount: number;
  rowCount: number;
  rungs: Rung[];
}

const DEFAULT_LINE_COUNT = 4;
/** High row count keeps the ladder visually dense/complex even though F-05 fixes the line count at 4. */
const DEFAULT_ROW_COUNT = 16;
const RUNG_PROBABILITY = 0.45;

/**
 * Generates a random ghost-leg (amida) board. At any given row, chosen gaps
 * never sit adjacent to one another, so no two rungs ever share a line at
 * the same height (F-05: "横線は同一の高さで隣接する横線が重ならないこと").
 */
export function generateAmida(
  lineCount = DEFAULT_LINE_COUNT,
  rowCount = DEFAULT_ROW_COUNT,
  rng: Rng = Math.random,
): AmidaBoard {
  const rungs: Rung[] = [];
  const gapCount = lineCount - 1;

  for (let row = 0; row < rowCount; row++) {
    let previousChosen = false;
    for (let gap = 0; gap < gapCount; gap++) {
      if (previousChosen) {
        previousChosen = false;
        continue;
      }
      if (rng() < RUNG_PROBABILITY) {
        rungs.push({ row, gap });
        previousChosen = true;
      }
    }
  }

  return { lineCount, rowCount, rungs };
}

/** Traces the full path of a token dropped at `startLine`, one entry per row (including the start). */
export function tracePath(board: AmidaBoard, startLine: number): number[] {
  const path = [startLine];
  let line = startLine;
  for (let row = 0; row < board.rowCount; row++) {
    for (const rung of board.rungs) {
      if (rung.row !== row) continue;
      if (rung.gap === line) line += 1;
      else if (rung.gap === line - 1) line -= 1;
    }
    path.push(line);
  }
  return path;
}

/** Resolves only the final line index reached from `startLine`. */
export function resolvePath(board: AmidaBoard, startLine: number): number {
  const path = tracePath(board, startLine);
  return path[path.length - 1];
}

/** Resolves the ending line for every starting line, e.g. to render all 4 outcomes at once. */
export function resolveAllPaths(board: AmidaBoard): number[] {
  return Array.from({ length: board.lineCount }, (_, start) => resolvePath(board, start));
}
