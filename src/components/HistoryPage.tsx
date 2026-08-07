import { useState } from 'react';
import type { HistoryEntry } from '../types';

interface HistoryPageProps {
  history: HistoryEntry[];
  onClear: () => void;
  onBack: () => void;
}

function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  const year = (d.getFullYear() % 100).toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const date = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${year}/${month}/${date}  ${hours}:${minutes}`;
}

export function HistoryPage({ history, onClear, onBack }: HistoryPageProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-ink/10 bg-board-panel px-3 py-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="戻る"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg text-ink/70 transition hover:bg-black/5 active:bg-black/10"
          >
            ←
          </button>
          <h1 className="truncate text-base font-semibold text-ink">履歴（{history.length}）</h1>
        </div>

        {history.length > 0 &&
          (confirming ? (
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-ink/20 px-2 py-1 text-xs text-ink/60"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setConfirming(false);
                }}
                className="rounded-lg bg-red-500 px-2 py-1 text-xs font-medium text-white"
              >
                削除する
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="shrink-0 text-sm text-red-500 underline underline-offset-2"
            >
              全件クリア
            </button>
          ))}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
        {history.length === 0 && <p className="px-1 text-sm text-ink/40">まだ履歴がありません</p>}
        <div className="space-y-1.5">
          {history.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                entry.rare ? 'border-amber-400/40 bg-amber-50 text-amber-700' : 'border-ink/15 bg-board-panel text-ink/70'
              }`}
            >
              <span className="truncate pr-2">{entry.text}</span>
              <span className="shrink-0 text-xs text-ink/40">{formatDateTime(entry.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
