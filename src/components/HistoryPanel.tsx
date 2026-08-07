import { useState } from 'react';
import type { HistoryEntry } from '../types';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onClear: () => void;
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function HistoryPanel({ history, onClear }: HistoryPanelProps) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="mt-4 px-4 pb-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white/70"
      >
        <span>履歴（{history.length}）</span>
        <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {history.length === 0 && <p className="px-1 text-sm text-white/40">まだ履歴がありません</p>}
          {history.map((entry) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                entry.rare ? 'border-amber-300/40 bg-amber-500/10 text-amber-100' : 'border-white/10 bg-white/5 text-white/70'
              }`}
            >
              <span className="truncate pr-2">{entry.text}</span>
              <span className="shrink-0 text-xs text-white/40">{formatTime(entry.timestamp)}</span>
            </div>
          ))}

          {history.length > 0 && (
            <div className="pt-1">
              {confirming ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-white/60">全件削除しますか？</span>
                  <button
                    type="button"
                    onClick={() => {
                      onClear();
                      setConfirming(false);
                    }}
                    className="rounded-lg bg-red-500/80 px-3 py-1.5 font-medium text-white"
                  >
                    削除する
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="rounded-lg border border-white/15 px-3 py-1.5 text-white/60"
                  >
                    キャンセル
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="text-sm text-red-300/80 underline underline-offset-2"
                >
                  全件クリア
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
