/**
 * F-05-4: total performance duration is fixed at 4.0s, split into four phases.
 * Kept as a single source of truth so the SVG animation and result reveal stay in sync.
 */
export const TIMING_MS = {
  trace: 2400,
  modifierReveal: 400,
  pause: 600,
  rowReveal: 600,
} as const;

export const TOTAL_DURATION_MS = Object.values(TIMING_MS).reduce((sum, ms) => sum + ms, 0);

export const PHASE_END_MS = {
  trace: TIMING_MS.trace,
  modifierReveal: TIMING_MS.trace + TIMING_MS.modifierReveal,
  pause: TIMING_MS.trace + TIMING_MS.modifierReveal + TIMING_MS.pause,
  rowReveal: TOTAL_DURATION_MS,
} as const;
