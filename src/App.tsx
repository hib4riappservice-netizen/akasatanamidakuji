import { useEffect, useState } from 'react';
import poolData from './data/pool.json';
import type { HistoryEntry, PoolData, Row, Settings } from './types';
import { buildModifierPool, composeResultText, pickAmidaCandidates, pickRow } from './lib/draw';
import { generateAmida, resolvePath, type AmidaBoard } from './lib/amida';
import { TIMING_MS } from './lib/timing';
import {
  clearHistory as clearHistoryStorage,
  loadHistory,
  loadNameHistory,
  loadSelectedCategories,
  loadSettings,
  pushHistory,
  pushNameHistory,
  saveSelectedCategories,
  saveSettings,
} from './lib/storage';
import { useReducedMotion } from './hooks/useReducedMotion';
import { Header } from './components/Header';
import { NameInput } from './components/NameInput';
import { CategorySelector } from './components/CategorySelector';
import { DrawButton } from './components/DrawButton';
import { AmidaStage } from './components/AmidaStage';
import { ResultDisplay, type RevealStage } from './components/ResultDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { SettingsModal } from './components/SettingsModal';

const pool = poolData as PoolData;

type Stage = 'idle' | 'choosing' | 'tracing' | 'modifierReveal' | 'pause' | 'rowReveal' | 'result';

const RESULT_STAGE_MAP: Record<string, RevealStage> = {
  modifierReveal: 'modifier',
  pause: 'pause',
  rowReveal: 'row',
  result: 'row',
};

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function App() {
  const defaultCategoryIds = pool.categories.filter((c) => c.defaultOn).map((c) => c.id);
  const reducedMotion = useReducedMotion();

  const [userName, setUserName] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() =>
    loadSelectedCategories(defaultCategoryIds),
  );
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [history, setHistory] = useState<HistoryEntry[]>(() => loadHistory());
  const [nameHistory, setNameHistory] = useState<string[]>(() => loadNameHistory());
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [stage, setStage] = useState<Stage>('idle');
  const [board, setBoard] = useState<AmidaBoard | null>(null);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [startLine, setStartLine] = useState<number | null>(null);
  const [resolvedEnd, setResolvedEnd] = useState<number | null>(null);
  const [currentRow, setCurrentRow] = useState<Row | null>(null);
  const [recentModifiers, setRecentModifiers] = useState<string[]>([]);
  const [lastRowId, setLastRowId] = useState<string | null>(null);

  const availableRows = settings.rareEnabled ? pool.rows : pool.rows.filter((r) => !r.rare);
  const modifierPool = buildModifierPool(
    pool.categories.filter((c) => selectedCategoryIds.includes(c.id)).map((c) => c.modifiers),
  );

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) => {
      const isOn = prev.includes(id);
      if (isOn && prev.length === 1) return prev; // never allow all-off
      const next = isOn ? prev.filter((x) => x !== id) : [...prev, id];
      saveSelectedCategories(next);
      return next;
    });
  }

  function handleDraw() {
    if (modifierPool.length === 0) return;
    const newCandidates = pickAmidaCandidates(modifierPool, recentModifiers, 4);
    const newBoard = generateAmida(4, 10);
    const row = pickRow(availableRows, lastRowId);
    setBoard(newBoard);
    setCandidates(newCandidates);
    setCurrentRow(row);
    setStartLine(null);
    setResolvedEnd(null);
    setStage('choosing');
  }

  function handleSelectStart(index: number) {
    if (stage !== 'choosing' || !board) return;
    const end = resolvePath(board, index);
    setStartLine(index);
    setResolvedEnd(end);
    setStage(reducedMotion ? 'result' : 'tracing');
  }

  function handleSkip() {
    if (stage === 'idle' || stage === 'choosing' || stage === 'result') return;
    setStage('result');
  }

  // Auto-advance through the fixed 4.0s reveal sequence (F-05-4).
  useEffect(() => {
    const next: Partial<Record<Stage, Stage>> = {
      tracing: 'modifierReveal',
      modifierReveal: 'pause',
      pause: 'rowReveal',
      rowReveal: 'result',
    };
    const duration: Partial<Record<Stage, number>> = {
      tracing: TIMING_MS.trace,
      modifierReveal: TIMING_MS.modifierReveal,
      pause: TIMING_MS.pause,
      rowReveal: TIMING_MS.rowReveal,
    };
    const nextStage = next[stage];
    const ms = duration[stage];
    if (!nextStage || ms === undefined) return;
    const id = window.setTimeout(() => setStage(nextStage), ms);
    return () => window.clearTimeout(id);
  }, [stage]);

  // Commit the result to history/dedupe state exactly once, when the sequence lands.
  useEffect(() => {
    if (stage !== 'result' || !currentRow || resolvedEnd === null) return;
    const modifier = candidates[resolvedEnd];
    const text = composeResultText(modifier, userName, currentRow);
    const entry: HistoryEntry = { id: makeId(), text, timestamp: Date.now(), rare: Boolean(currentRow.rare) };
    setHistory(pushHistory(entry));
    setNameHistory(pushNameHistory(userName));
    setRecentModifiers((prev) => [modifier, ...prev].slice(0, 2));
    setLastRowId(currentRow.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  function handleClearHistory() {
    clearHistoryStorage();
    setHistory([]);
  }

  function handleSettingsChange(next: Settings) {
    setSettings(next);
    saveSettings(next);
  }

  const showAmida = stage === 'choosing' || stage === 'tracing';
  const showResult = stage in RESULT_STAGE_MAP;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header onOpenSettings={() => setSettingsOpen(true)} />

      <main className="flex-1 pb-6">
        <NameInput value={userName} onChange={setUserName} nameHistory={nameHistory} />
        <CategorySelector categories={pool.categories} selectedIds={selectedCategoryIds} onToggle={toggleCategory} />

        {showAmida && board && (
          <AmidaStage
            board={board}
            candidates={candidates}
            stagePhase={stage === 'tracing' ? 'tracing' : 'choosing'}
            selectedStart={startLine}
            reducedMotion={reducedMotion}
            onSelectStart={handleSelectStart}
            onSkip={handleSkip}
          />
        )}

        {showResult && currentRow && resolvedEnd !== null && (
          <ResultDisplay
            modifier={candidates[resolvedEnd]}
            userName={userName}
            row={currentRow}
            stage={RESULT_STAGE_MAP[stage]}
            finished={stage === 'result'}
            onDrawAgain={handleDraw}
            onSkip={handleSkip}
          />
        )}

        <HistoryPanel history={history} onClear={handleClearHistory} />
      </main>

      {stage === 'idle' && (
        <DrawButton label="引く" disabled={modifierPool.length === 0} onClick={handleDraw} />
      )}

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onChange={handleSettingsChange}
        onClearHistory={handleClearHistory}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
