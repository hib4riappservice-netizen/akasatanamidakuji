import { useState } from 'react';
import type { Row } from '../types';

export type RevealStage = 'modifier' | 'pause' | 'row';

interface ResultDisplayProps {
  modifier: string;
  userName: string;
  row: Row;
  stage: RevealStage;
  finished: boolean;
  onDrawAgain: () => void;
  onSkip?: () => void;
}

export function ResultDisplay({ modifier, userName, row, stage, finished, onDrawAgain, onSkip }: ResultDisplayProps) {
  const [copied, setCopied] = useState(false);
  const name = userName.trim().length > 0 ? userName.trim() : 'あなた';
  const rowVisible = stage === 'row';
  const rare = Boolean(row.rare) && rowVisible;

  async function handleCopy() {
    const text = `${modifier}${name}の${row.label}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore, this is a low-priority nicety
    }
  }

  return (
    <div className="px-4 pt-4">
      {!finished && onSkip && (
        <div className="mb-2 text-right">
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-white/40 underline underline-offset-2 hover:text-white/60"
          >
            タップでスキップ
          </button>
        </div>
      )}
      <div
        className={`rounded-2xl border p-5 text-center transition-all duration-300 ${
          rare
            ? 'border-amber-300/70 bg-gradient-to-b from-amber-500/20 to-fuchsia-500/10 shadow-lg shadow-amber-400/20'
            : 'border-white/10 bg-white/5'
        }`}
      >
        {rare && (
          <div className="mb-2 animate-pulse text-sm font-bold tracking-widest text-amber-300">
            ✨ 激レア出現 ✨
          </div>
        )}

        <p
          className="font-bold text-white"
          style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)', lineHeight: 1.3 }}
        >
          <span>{modifier}{name}の</span>
          <span
            className={`inline-block transition-all duration-500 ${
              rowVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            } ${rare ? 'text-amber-300' : 'text-fuchsia-300'}`}
          >
            {rowVisible ? row.label : ' '.repeat(5)}
          </span>
        </p>

        {stage === 'pause' && <p className="mt-2 text-2xl text-white/40">……</p>}

        {rowVisible && (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
            {row.kana.map((k, i) => (
              <span
                key={i}
                className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white/60"
              >
                {k}
              </span>
            ))}
          </div>
        )}
      </div>

      {finished && (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onDrawAgain}
            className="min-h-11 flex-1 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-500 font-bold text-white active:scale-[0.98]"
          >
            もう一度引く
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-11 rounded-xl border border-white/15 bg-white/5 px-4 text-sm text-white/70 hover:bg-white/10"
          >
            {copied ? 'コピー済み' : 'コピー'}
          </button>
        </div>
      )}
    </div>
  );
}
