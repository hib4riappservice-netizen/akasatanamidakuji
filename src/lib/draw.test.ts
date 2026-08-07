import { describe, expect, it } from 'vitest';
import {
  composeResultText,
  excludeRecentModifiers,
  pickAmidaCandidates,
  pickRow,
  weightedPick,
} from './draw';
import type { Row } from '../types';

/** Returns an RNG that yields the given values in order, then repeats the last one. */
function sequence(...values: number[]) {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)];
}

const ROWS: Row[] = [
  { id: 'a', label: 'あいうえお', kana: ['あ'], weight: 100 },
  { id: 'ka', label: 'かきくけこ', kana: ['か'], weight: 100 },
  { id: 'wa', label: 'わをん', kana: ['わ'], weight: 3, rare: true },
];

describe('weightedPick', () => {
  it('picks the item whose cumulative weight range contains the rng draw', () => {
    const items = [
      { id: 'x', weight: 1 },
      { id: 'y', weight: 1 },
      { id: 'z', weight: 1 },
    ];
    // total=3, rng()*3 -> 0.5 falls in item x's [0,1) range
    expect(weightedPick(items, (i) => i.weight, sequence(0.1)).id).toBe('x');
    // 0.5*3=1.5 falls in item y's [1,2) range
    expect(weightedPick(items, (i) => i.weight, sequence(0.5)).id).toBe('y');
    // 0.9*3=2.7 falls in item z's [2,3) range
    expect(weightedPick(items, (i) => i.weight, sequence(0.9)).id).toBe('z');
  });

  it('throws on an empty list', () => {
    expect(() => weightedPick([], () => 1)).toThrow();
  });
});

describe('excludeRecentModifiers', () => {
  it('does not filter when the pool has fewer than 3 entries', () => {
    const pool = ['a', 'b'];
    expect(excludeRecentModifiers(pool, ['a'])).toEqual(pool);
  });

  it('filters recent modifiers out when the pool is large enough', () => {
    const pool = ['a', 'b', 'c', 'd'];
    expect(excludeRecentModifiers(pool, ['a', 'b'])).toEqual(['c', 'd']);
  });

  it('falls back to the full pool if filtering would remove everything', () => {
    const pool = ['a', 'b', 'c'];
    expect(excludeRecentModifiers(pool, ['a', 'b', 'c'])).toEqual(pool);
  });
});

describe('pickAmidaCandidates', () => {
  it('returns the requested count of unique modifiers', () => {
    const pool = ['a', 'b', 'c', 'd', 'e', 'f'];
    const result = pickAmidaCandidates(pool, [], 4, sequence(0, 0.9, 0.4, 0.1, 0.6));
    expect(result).toHaveLength(4);
    expect(new Set(result).size).toBe(4);
  });

  it('backfills from the full pool when recent-exclusion leaves too few candidates', () => {
    const pool = ['a', 'b', 'c', 'd'];
    // excluding a,b,c leaves only ['d'], so 3 more must be backfilled from the full pool
    const result = pickAmidaCandidates(pool, ['a', 'b', 'c'], 4, sequence(0));
    expect(result).toHaveLength(4);
    expect(new Set(result).size).toBe(4);
  });
});

describe('pickRow', () => {
  it('excludes the immediately preceding row', () => {
    // rng near 1 would land on the last candidate; with 'a' excluded that's 'wa'
    const row = pickRow(ROWS, 'a', sequence(0.999));
    expect(row.id).not.toBe('a');
  });

  it('falls back to the full set if excluding the last row leaves nothing', () => {
    const singleRow: Row[] = [ROWS[0]];
    expect(pickRow(singleRow, 'a', sequence(0.5)).id).toBe('a');
  });
});

describe('composeResultText', () => {
  it('concatenates modifier + name + の + row label', () => {
    expect(composeResultText('セクシーな', '太郎', ROWS[0])).toBe('セクシーな太郎のあいうえお');
  });

  it('uses "あなた" as a placeholder when the name is empty or whitespace', () => {
    expect(composeResultText('謎の', '', ROWS[0])).toBe('謎のあなたのあいうえお');
    expect(composeResultText('謎の', '   ', ROWS[0])).toBe('謎のあなたのあいうえお');
  });

  it('trims surrounding whitespace from the name', () => {
    expect(composeResultText('謎の', '  花子  ', ROWS[0])).toBe('謎の花子のあいうえお');
  });
});
