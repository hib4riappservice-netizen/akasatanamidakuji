import type { HistoryEntry, Settings } from '../types';

const KEYS = {
  categories: 'akasatana:selectedCategories',
  history: 'akasatana:history',
  settings: 'akasatana:settings',
} as const;

const HISTORY_LIMIT = 500;

const DEFAULT_SETTINGS: Settings = {
  rareEnabled: true,
  soundEnabled: false,
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode, quota, etc.) — fail silently, app still works in-memory.
  }
}

export function loadSelectedCategories(defaultIds: string[]): string[] {
  return readJson(KEYS.categories, defaultIds);
}

export function saveSelectedCategories(ids: string[]): void {
  writeJson(KEYS.categories, ids);
}

export function loadHistory(): HistoryEntry[] {
  return readJson(KEYS.history, []);
}

export function pushHistory(entry: HistoryEntry): HistoryEntry[] {
  const next = [entry, ...loadHistory()].slice(0, HISTORY_LIMIT);
  writeJson(KEYS.history, next);
  return next;
}

export function clearHistory(): void {
  writeJson(KEYS.history, []);
}

export function loadSettings(): Settings {
  return { ...DEFAULT_SETTINGS, ...readJson(KEYS.settings, DEFAULT_SETTINGS) };
}

export function saveSettings(settings: Settings): void {
  writeJson(KEYS.settings, settings);
}
