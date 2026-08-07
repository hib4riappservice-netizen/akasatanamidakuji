import { useEffect, useState } from 'react';
import poolData from './data/pool.json';
import type { HistoryEntry, PoolData, Row, Settings } from './types';
import { buildModifierPool, composeResultText, pickAmidaCandidates, pickRow } from './lib/draw';
import { generateAmida, resolvePath, type AmidaBoard } from './lib/amida';
import { SELECT_TIMEOUT_SEC, TIMING_MS } from './lib/timing';
import {
  clearHistory as clearHistoryStorage,
  loadHistory,
  loadSelectedCategories,
  loadSettings,
  pushHistory,
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
import { HistoryPage } from './components/HistoryPage';
import { SettingsModal } from './components/SettingsModal';

const HISTORY_HASH = '#/history';

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showHistoryPage, setShowHistoryPage] = useState(() => window.location.hash === HISTORY_HASH);

  // Lightweight hash routing for the history page — no router dependency needed for one extra screen.
  useEffect(() => {
    const onHashChange = () => setShowHistoryPage(window.location.hash === HISTORY_HASH);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const availableRows = settings.rareEnabled ? pool.rows : pool.rows.filter((r) => !r.rare);
  const modifierPool = buildModifierPool(
    pool.categories.filter((c) => selectedCategoryIds.includes(c.id)).map((c) => c.modifiers),
  );

  const [stage, setStage] = useState<Stage>('idle');
  const [board, setBoard] = useState<AmidaBoard>(() => generateAmida());
  const [candidates, setCandidates] = useState<string[]>(() => pickAmidaCandidates(modifierPool, []));
  const [currentRow, setCurrentRow] = useState<Row | null>(() =>
    availableRows.length > 0 ? pickRow(availableRows, null) : null,
  );
  const [startLine, setStartLine] = useState<number | null>(null);
  const [resolvedEnd, setResolvedEnd] = useState<number | null>(null);
  const [recentModifiers, setRecentModifiers] = useState<string[]>([]);
  const [lastRowId, setLastRowId] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(SELECT_TIMEOUT_SEC);

  function toggleCategory(id: string) {
    setSelectedCategoryIds((prev) => {
      const isOn = prev.includes(id);
      if (isOn && prev.length === 1) return prev; // never allow all-off
      const next = isOn ? prev.filter((x) => x !== id) : [...prev, id];
      saveSelectedCategories(next);
      return next;
    });
  }

  // Generates a brand new (freshly shuffled) ladder + candidates + row and opens the selection window.
  function rollNewRound() {
    if (modifierPool.length === 0) return;
    const newCandidates = pickAmidaCandidates(modifierPool, recentModifiers, 4);
    const newBoard = generateAmida();
    const row = availableRows.length > 0 ? pickRow(availableRows, lastRowId) : null;
    setBoard(newBoard);
    setCandidates(newCandidates);
    setCurrentRow(row);
    setStartLine(null);
    setResolvedEnd(null);
    setSecondsLeft(SELECT_TIMEOUT_SEC);
    setStage('choosing');
  }

  function handleSelectStart(index: number) {
    if (stage !== 'choosing') return;
    const end = resolvePath(board, index);
    setStartLine(index);
    setResolvedEnd(end);
    setStage(reducedMotion ? 'result' : 'tracing');
  }

  function handleSkip() {
    if (stage === 'idle' || stage === 'choosing' || stage === 'result') return;
    setStage('result');
  }

  function handleGoHome() {
    setStage('idle');
  }

  // Selection countdown (F: 番号選択は10秒以内) — ticks while the ladder is choosable.
  useEffect(() => {
    if (stage !== 'choosing') return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [stage]);

  // Auto-pick a random line once the countdown runs out, so a round always resolves.
  useEffect(() => {
    if (stage !== 'choosing' || secondsLeft > 0) return;
    handleSelectStart(Math.floor(Math.random() * board.lineCount));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, stage]);

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

  if (showHistoryPage) {
    return (
      <HistoryPage
        history={history}
        onClear={handleClearHistory}
        onBack={() => {
          window.location.hash = '';
        }}
      />
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="shrink-0">
        <Header
          onOpenHistory={() => {
            window.location.hash = HISTORY_HASH;
          }}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <NameInput value={userName} onChange={setUserName} />
        <CategorySelector categories={pool.categories} selectedIds={selectedCategoryIds} onToggle={toggleCategory} />
      </div>

      <main className="grid min-h-0 flex-1 place-items-center overflow-y-auto px-2">
        {stage === 'idle' && (
          <div className="flex flex-col items-center gap-5 px-6 text-center">
            <div className="space-y-3">
              <p className="text-lg leading-relaxed font-semibold text-ink/70">「引く」を押してスタート！</p>
              <p className="text-xs whitespace-nowrap text-ink/40 sm:text-sm">あみだくじが出るので、1〜4のどれかを選んでね</p>
            </div>
            <DrawButton label="引く" disabled={modifierPool.length === 0} onClick={rollNewRound} />
          </div>
        )}

        {showAmida && (
          <AmidaStage
            board={board}
            candidates={candidates}
            stagePhase={stage === 'tracing' ? 'tracing' : 'choosing'}
            selectedStart={startLine}
            secondsLeft={secondsLeft}
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
            onDrawAgain={rollNewRound}
            onGoHome={handleGoHome}
            onSkip={handleSkip}
          />
        )}
      </main>

      {/*
        Fixed (not measured) to match the top bar's height, so the space `main` centers within
        stays vertically symmetric without depending on runtime measurement — a JS-measured
        version of this used to visibly jump when web fonts finished loading and the top bar's
        rendered height changed underneath it.
      */}
      <div aria-hidden="true" className="hidden h-[163px] shrink-0 sm:block" />
      <div aria-hidden="true" className="h-[199px] shrink-0 sm:hidden" />

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
