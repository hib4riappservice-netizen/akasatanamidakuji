import { useState } from 'react';
import type { HistoryEntry } from '../types';

interface HistoryPageProps {
  history: HistoryEntry[];
  onClear: () => void;
  onBack: () => void;
}

function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  const month = (d.getMonth() + 1).toString();
  const date = d.getDate().toString();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${month}/${date} ${hours}:${minutes}`;
}

export function HistoryPage({ history, onClear, onBack }: HistoryPageProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex shrink-0 items-center gap-2 border-b border-ink/10 bg-board-panel px-3 py-1.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="戻る"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-ink/70 transition hover:bg-black/5 active:bg-black/10"
        >
          ←
        </button>
        <h1 className="text-base font-semibold text-ink">履歴（{history.length}）</h1>
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

      {history.length > 0 && (
        <div className="shrink-0 border-t border-ink/10 bg-board-panel px-3 py-2">
          {confirming ? (
            <div className="flex items-center justify-end gap-2 text-sm">
              <span className="text-ink/60">全件削除しますか？</span>
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setConfirming(false);
                }}
                className="rounded-lg bg-red-500 px-3 py-1.5 font-medium text-white"
              >
                削除する
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-ink/20 px-3 py-1.5 text-ink/60"
              >
                キャンセル
              </button>
            </div>
          ) : (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setConfirming(true)}
                className="text-sm text-red-500 underline underline-offset-2"
              >
                全件クリア
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
