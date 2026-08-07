interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#0b0b12]/90 px-4 py-3 backdrop-blur">
      <div className="flex items-baseline gap-2">
        <h1 className="text-lg font-bold tracking-wide text-white">あかさたなみだくじ</h1>
        <span className="text-xs text-white/40">お題ジェネレーター</span>
      </div>
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label="設定を開く"
        className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-white/70 transition hover:bg-white/10 active:bg-white/20"
      >
        ⚙️
      </button>
    </header>
  );
}
