import type { Row } from '../types';

export type Rng = () => number;

const MIN_POOL_FOR_MODIFIER_DEDUPE = 3;
const AMIDA_CANDIDATE_COUNT = 4;

/** Picks one item from `items` weighted by `weightOf`. Pure, RNG-injectable. */
export function weightedPick<T>(items: T[], weightOf: (item: T) => number, rng: Rng = Math.random): T {
  if (items.length === 0) {
    throw new Error('weightedPick: items must not be empty');
  }
  const total = items.reduce((sum, item) => sum + weightOf(item), 0);
  let threshold = rng() * total;
  for (const item of items) {
    threshold -= weightOf(item);
    if (threshold < 0) return item;
  }
  return items[items.length - 1];
}

/** Combines the modifier lists of the selected categories into a single pool. */
export function buildModifierPool(categoryModifierLists: string[][]): string[] {
  return categoryModifierLists.flat();
}

/**
 * Excludes modifiers seen in the last two draws, per F-03.
 * If the pool has fewer than 3 entries, dedupe is skipped so a draw is always possible.
 */
export function excludeRecentModifiers(pool: string[], recentModifiers: string[]): string[] {
  if (pool.length < MIN_POOL_FOR_MODIFIER_DEDUPE) return pool;
  const filtered = pool.filter((m) => !recentModifiers.includes(m));
  return filtered.length > 0 ? filtered : pool;
}

/**
 * Picks `count` unique modifiers to display on the amida board, honoring the
 * recent-modifier exclusion first and backfilling from the full pool if the
 * excluded pool can't fill all slots.
 */
export function pickAmidaCandidates(
  pool: string[],
  recentModifiers: string[],
  count = AMIDA_CANDIDATE_COUNT,
  rng: Rng = Math.random,
): string[] {
  const preferred = excludeRecentModifiers(pool, recentModifiers);
  const chosen = sampleUnique(preferred, Math.min(count, preferred.length), rng);
  if (chosen.length < count) {
    const remaining = pool.filter((m) => !chosen.includes(m));
    const backfill = sampleUnique(remaining, Math.min(count - chosen.length, remaining.length), rng);
    chosen.push(...backfill);
  }
  return chosen;
}

/** Fisher-Yates sample of `count` unique items, RNG-injectable. */
export function sampleUnique<T>(items: T[], count: number, rng: Rng = Math.random): T[] {
  const pool = [...items];
  const result: T[] = [];
  const n = Math.min(count, pool.length);
  for (let i = 0; i < n; i++) {
    const index = Math.floor(rng() * pool.length);
    result.push(pool[index]);
    pool.splice(index, 1);
  }
  return result;
}

/**
 * Picks a row via weighted random selection, excluding the immediately
 * preceding row per F-03. Falls back to the full set if that would leave
 * nothing to pick from.
 */
export function pickRow(rows: Row[], lastRowId: string | null, rng: Rng = Math.random): Row {
  const candidates = lastRowId ? rows.filter((r) => r.id !== lastRowId) : rows;
  const pool = candidates.length > 0 ? candidates : rows;
  return weightedPick(pool, (r) => r.weight, rng);
}

/** Assembles the final display string per the F-04 concatenation rule. */
export function composeResultText(modifier: string, userName: string, row: Row): string {
  const name = userName.trim().length > 0 ? userName.trim() : 'あなた';
  return `${modifier}${name}の${row.label}`;
}
