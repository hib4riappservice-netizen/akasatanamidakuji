export interface Category {
  id: string;
  label: string;
  emoji: string;
  defaultOn: boolean;
  modifiers: string[];
}

export interface Row {
  id: string;
  label: string;
  kana: string[];
  weight: number;
  rare?: boolean;
}

export interface PoolData {
  version: number;
  categories: Category[];
  rows: Row[];
}

export interface HistoryEntry {
  id: string;
  text: string;
  timestamp: number;
  rare: boolean;
}

export interface Settings {
  rareEnabled: boolean;
  soundEnabled: boolean;
}

export interface DrawOutcome {
  modifier: string;
  row: Row;
  userName: string;
  text: string;
}
