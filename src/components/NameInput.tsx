interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MAX_LENGTH = 10;

export function NameInput({ value, onChange }: NameInputProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 px-4 py-2.5">
      <label htmlFor="userName" className="shrink-0 text-sm font-medium text-ink/70">
        ユーザ名
      </label>
      <div className="relative w-52 shrink-0">
        <input
          id="userName"
          type="text"
          inputMode="text"
          value={value}
          maxLength={MAX_LENGTH}
          placeholder="あなた"
          onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
          className="w-full rounded-lg border border-dashed border-ink/25 bg-board-panel px-3 py-1.5 pr-8 text-base text-ink placeholder-ink/30 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-200"
        />
        {value.length > 0 && (
          <button
            type="button"
            aria-label="名前をクリア"
            onClick={() => onChange('')}
            className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-ink/50 hover:bg-black/5 hover:text-ink"
          >
            ×
          </button>
        )}
      </div>
      <span className="shrink-0 text-xs text-ink/35">
        {value.length}/{MAX_LENGTH}
      </span>
    </div>
  );
}
