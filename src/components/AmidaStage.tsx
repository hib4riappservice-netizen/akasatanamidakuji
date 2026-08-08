import { useEffect, useRef } from 'react';
import type { AmidaBoard } from '../lib/amida';
import { TIMING_MS } from '../lib/timing';

export type StagePhase = 'choosing' | 'tracing';

interface AmidaStageProps {
  board: AmidaBoard;
  candidates: string[];
  stagePhase: StagePhase;
  selectedStart: number | null;
  secondsLeft: number;
  reducedMotion: boolean;
  onSelectStart: (index: number) => void;
  onSkip: () => void;
}

const VIEW_W = 100;
const VIEW_H = 120;

function lineX(i: number, lineCount: number): number {
  return ((i + 0.5) / lineCount) * VIEW_W;
}

function rowTop(row: number, rowCount: number): number {
  return (row / rowCount) * VIEW_H;
}

function rowMid(row: number, rowCount: number): number {
  return rowTop(row, rowCount) + VIEW_H / rowCount / 2;
}

function buildTravelerSteps(board: AmidaBoard, startLine: number) {
  let line = startLine;
  const steps: { row: number; from: number; to: number }[] = [];
  for (let row = 0; row < board.rowCount; row++) {
    const rung = board.rungs.find((r) => r.row === row && (r.gap === line || r.gap === line - 1));
    const to = rung ? (rung.gap === line ? line + 1 : line - 1) : line;
    steps.push({ row, from: line, to });
    line = to;
  }
  return steps;
}

function buildTravelerPathD(board: AmidaBoard, startLine: number): string {
  const steps = buildTravelerSteps(board, startLine);
  let d = `M ${lineX(startLine, board.lineCount)} 0`;
  for (const step of steps) {
    const yMid = rowMid(step.row, board.rowCount);
    const yBottom = rowTop(step.row + 1, board.rowCount);
    if (step.to !== step.from) {
      d += ` L ${lineX(step.from, board.lineCount)} ${yMid}`;
      d += ` L ${lineX(step.to, board.lineCount)} ${yMid}`;
      d += ` L ${lineX(step.to, board.lineCount)} ${yBottom}`;
    } else {
      d += ` L ${lineX(step.from, board.lineCount)} ${yBottom}`;
    }
  }
  return d;
}

export function AmidaStage({
  board,
  candidates,
  stagePhase,
  selectedStart,
  secondsLeft,
  reducedMotion,
  onSelectStart,
  onSkip,
}: AmidaStageProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const markerRef = useRef<SVGCircleElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (stagePhase !== 'tracing' || selectedStart === null || reducedMotion) return;
    const path = pathRef.current;
    const marker = markerRef.current;
    if (!path || !marker) return;

    const total = path.getTotalLength();
    const start = performance.now();

    function tick(now: number) {
      const t = Math.min(1, (now - start) / TIMING_MS.trace);
      const point = path!.getPointAtLength(t * total);
      marker!.setAttribute('cx', String(point.x));
      marker!.setAttribute('cy', String(point.y));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [stagePhase, selectedStart, reducedMotion, board]);

  const lineCount = board.lineCount;
  const showPath = selectedStart !== null;
  const dAttr = showPath ? buildTravelerPathD(board, selectedStart) : '';
  const gridCols = { gridTemplateColumns: `repeat(${lineCount}, 1fr)` };
  const urgent = stagePhase === 'choosing' && secondsLeft <= 3;

  return (
    <div className="flex flex-col items-center gap-1 px-3 py-1">
      <div className="flex h-12 w-full max-w-xs shrink-0 items-center justify-between sm:max-w-sm md:max-w-md lg:max-w-xl">
        <span className="text-xs font-medium text-ink/70 sm:text-sm">
          {stagePhase === 'choosing' ? '番号を選んでね（1〜4）' : '結果を確認中…'}
        </span>
        {stagePhase === 'choosing' && (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] text-xl font-black tabular-nums sm:h-12 sm:w-12 sm:text-2xl ${
              urgent ? 'animate-pulse border-red-500 text-red-500' : 'border-pink-500 text-pink-500'
            }`}
          >
            {secondsLeft}
          </span>
        )}
        {stagePhase !== 'choosing' && (
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-ink/40 underline underline-offset-2 hover:text-ink/60"
          >
            タップでスキップ
          </button>
        )}
      </div>

      <div className="flex h-[calc(100dvh-285px)] w-full max-w-xs shrink-0 flex-col gap-1.5 rounded-2xl border border-ink/10 bg-board-panel p-2.5 shadow-sm sm:h-auto sm:max-w-sm sm:p-3 md:max-w-md lg:max-w-xl">
        <div className="grid shrink-0 gap-1" style={gridCols}>
          {Array.from({ length: lineCount }, (_, i) => (
            <button
              key={i}
              type="button"
              disabled={stagePhase !== 'choosing'}
              onClick={() => onSelectStart(i)}
              aria-label={`${i + 1}番でスタート`}
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border-2 text-base font-semibold transition sm:h-12 sm:w-12 sm:text-lg ${
                selectedStart === i
                  ? 'border-pink-500 bg-pink-100 text-pink-600'
                  : 'border-ink/15 bg-board text-ink/70 hover:border-pink-400/50 hover:bg-pink-50'
              } disabled:cursor-default`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div
          className="min-h-16 w-full flex-1 sm:h-[clamp(8rem,26dvh,20rem)] sm:flex-none"
          style={{ cursor: stagePhase !== 'choosing' ? 'pointer' : 'default' }}
          onClick={stagePhase !== 'choosing' ? onSkip : undefined}
        >
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="h-full w-full"
            preserveAspectRatio="none"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <line
                key={`line-${i}`}
                x1={lineX(i, lineCount)}
                y1={0}
                x2={lineX(i, lineCount)}
                y2={VIEW_H}
                stroke="rgba(35,38,43,0.3)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {board.rungs.map((r, idx) => (
              <line
                key={`rung-${idx}`}
                x1={lineX(r.gap, lineCount)}
                y1={rowMid(r.row, board.rowCount)}
                x2={lineX(r.gap + 1, lineCount)}
                y2={rowMid(r.row, board.rowCount)}
                stroke="rgba(35,38,43,0.35)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {showPath && (
              <path
                ref={pathRef}
                d={dAttr}
                fill="none"
                stroke="rgba(236,72,153,0.8)"
                strokeWidth={2.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {showPath && !reducedMotion && stagePhase === 'tracing' && (
              <circle ref={markerRef} r={2} fill="#ec4899" />
            )}
          </svg>
        </div>

        <div className="grid shrink-0 gap-1" style={gridCols}>
          {candidates.map((mod, i) => (
            <div
              key={`${mod}-${i}`}
              className="text-balance rounded-lg border border-ink/15 bg-board px-1.5 py-2 text-center text-[11px] leading-snug text-ink/70 sm:px-2 sm:text-sm"
            >
              {mod}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
