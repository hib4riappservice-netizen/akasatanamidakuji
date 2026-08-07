import { useEffect, useRef } from 'react';
import type { AmidaBoard } from '../lib/amida';
import { TIMING_MS } from '../lib/timing';

export type StagePhase = 'choosing' | 'tracing';

interface AmidaStageProps {
  board: AmidaBoard;
  candidates: string[];
  stagePhase: StagePhase;
  selectedStart: number | null;
  reducedMotion: boolean;
  onSelectStart: (index: number) => void;
  onSkip: () => void;
}

const VIEW_W = 100;
const VIEW_H = 140;

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

  return (
    <div className="px-4 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-white/70">
          {stagePhase === 'choosing' ? '番号を選んでね（1〜4）' : '結果を確認中…'}
        </span>
        {stagePhase !== 'choosing' && (
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-white/40 underline underline-offset-2 hover:text-white/60"
          >
            タップでスキップ
          </button>
        )}
      </div>

      <div className="grid gap-1" style={gridCols}>
        {Array.from({ length: lineCount }, (_, i) => (
          <button
            key={i}
            type="button"
            disabled={stagePhase !== 'choosing'}
            onClick={() => onSelectStart(i)}
            aria-label={`${i + 1}番でスタート`}
            className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border text-base font-bold transition ${
              selectedStart === i
                ? 'border-fuchsia-400 bg-fuchsia-500/30 text-white'
                : 'border-white/15 bg-white/5 text-white/70 hover:bg-white/10'
            } disabled:cursor-default`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div
        className="mt-2 w-full"
        style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}`, cursor: stagePhase !== 'choosing' ? 'pointer' : 'default' }}
        onClick={stagePhase !== 'choosing' ? onSkip : undefined}
      >
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="h-full w-full" preserveAspectRatio="none">
          {Array.from({ length: lineCount }, (_, i) => (
            <line
              key={`line-${i}`}
              x1={lineX(i, lineCount)}
              y1={0}
              x2={lineX(i, lineCount)}
              y2={VIEW_H}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth={1}
            />
          ))}
          {board.rungs.map((r, idx) => (
            <line
              key={`rung-${idx}`}
              x1={lineX(r.gap, lineCount)}
              y1={rowMid(r.row, board.rowCount)}
              x2={lineX(r.gap + 1, lineCount)}
              y2={rowMid(r.row, board.rowCount)}
              stroke="rgba(255,255,255,0.28)"
              strokeWidth={1}
            />
          ))}
          {showPath && (
            <path
              ref={pathRef}
              d={dAttr}
              fill="none"
              stroke="rgba(232,121,249,0.55)"
              strokeWidth={1.6}
              strokeLinecap="round"
            />
          )}
          {showPath && !reducedMotion && stagePhase === 'tracing' && (
            <circle ref={markerRef} r={2.2} fill="#e879f9" />
          )}
        </svg>
      </div>

      <div className="mt-2 grid gap-1" style={gridCols}>
        {candidates.map((mod, i) => (
          <div
            key={`${mod}-${i}`}
            className="rounded-lg border border-white/10 bg-white/5 px-1 py-2 text-center text-xs leading-tight text-white/60"
          >
            {mod}
          </div>
        ))}
      </div>
    </div>
  );
}
