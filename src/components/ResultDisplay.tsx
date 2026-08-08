import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCopy, faHouse } from '@fortawesome/free-solid-svg-icons';
import type { Row } from '../types';

export type RevealStage = 'modifier' | 'pause' | 'row';

interface ResultDisplayProps {
  modifier: string;
  userName: string;
  row: Row;
  stage: RevealStage;
  finished: boolean;
  onDrawAgain: () => void;
  onGoHome: () => void;
  onSkip?: () => void;
}

export function ResultDisplay({ modifier, userName, row, stage, finished, onDrawAgain, onGoHome, onSkip }: ResultDisplayProps) {
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
    <div className="flex w-full max-w-xs flex-col gap-2 px-3 py-1 sm:max-w-sm md:max-w-md">
      {/* Fixed-height slot so the skip link appearing/disappearing never shifts the layout. */}
      <div className="h-5 text-right">
        <button
          type="button"
          onClick={onSkip}
          disabled={finished}
          className={`text-xs underline underline-offset-2 transition-opacity ${
            finished ? 'pointer-events-none opacity-0' : 'text-ink/40 opacity-100 hover:text-ink/60'
          }`}
        >
          タップでスキップ
        </button>
      </div>

      <div
        className={`relative flex min-h-32 flex-col items-center justify-center rounded-2xl border p-4 text-center transition-colors duration-300 ${
          rare
            ? 'border-amber-400/70 bg-amber-50 shadow-lg shadow-amber-300/30'
            : 'border-dashed border-ink/20 bg-board-panel'
        }`}
      >
        {/* `rare` only ever flips true at the very last reveal step (never mid-sequence), so
            unlike the pause dots below, this is safe to render in normal flow — it just pushes
            the text down instead of needing to be pinned in place. */}
        {rare && (
          <div className="mb-1 animate-pulse text-sm font-semibold tracking-widest text-amber-500">
            ✨ 激レア出現 ✨
          </div>
        )}

        {/* Always exactly 3 lines (modifier / name+の / row) so it never wraps at an awkward
            point — content never changes across reveal stages (only opacity/scale animate),
            so it always sits dead-center. */}
        <div className="font-semibold text-ink" style={{ fontSize: 'clamp(1.3rem, 5vw, 2.2rem)', lineHeight: 1.3 }}>
          <div>{modifier}</div>
          <div>{name}の</div>
          <div
            className={`transition-all duration-500 ${
              rowVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            } ${rare ? 'text-amber-500' : 'text-pink-500'}`}
          >
            {row.label}
          </div>
        </div>

        {/* Absolutely positioned so the "……" beat never affects the centering/size of the text above. */}
        <p
          className={`absolute bottom-3 left-0 w-full text-2xl text-ink/40 transition-opacity duration-300 ${
            stage === 'pause' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          ……
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!finished}
          onClick={onGoHome}
          aria-label="トップに戻る"
          className="flex min-h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink/20 bg-board-panel text-ink/70 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={!finished}
          onClick={handleCopy}
          aria-label="コピー"
          className="flex min-h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-ink/20 bg-board-panel text-ink/70 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={!finished}
          onClick={onDrawAgain}
          className="font-gothic min-h-11 flex-1 rounded-xl bg-pink-200 font-bold text-pink-700 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          もう一度引く
        </button>
      </div>
    </div>
  );
}
