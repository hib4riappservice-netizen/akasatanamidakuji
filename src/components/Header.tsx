interface HeaderProps {
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export function Header({ onOpenHistory, onOpenSettings }: HeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-ink/10 bg-board-panel px-4 py-2.5">
      <img src="/logo.png" alt="あかさたなみだくじ" className="h-6 w-auto sm:h-9" />
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenHistory}
          className="rounded-full px-2 py-1 text-sm text-ink/70 transition hover:bg-black/5 active:bg-black/10"
        >
          履歴
        </button>
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="設定を開く"
          className="flex h-8 w-8 items-center justify-center rounded-full text-lg text-ink/70 transition hover:bg-black/5 active:bg-black/10"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
}
