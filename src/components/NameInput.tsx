interface NameInputProps {
  value: string;
  onChange: (value: string) => void;
  nameHistory: string[];
}

const MAX_LENGTH = 16;

export function NameInput({ value, onChange, nameHistory }: NameInputProps) {
  return (
    <div className="px-4 pt-4">
      <label htmlFor="userName" className="mb-1 block text-sm font-medium text-white/70">
        リスナー名
      </label>
      <div className="relative">
        <input
          id="userName"
          type="text"
          inputMode="text"
          value={value}
          maxLength={MAX_LENGTH}
          placeholder="あなた"
          onChange={(e) => onChange(e.target.value.slice(0, MAX_LENGTH))}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 pr-11 text-lg text-white placeholder-white/30 outline-none focus:border-fuchsia-400/60 focus:ring-2 focus:ring-fuchsia-400/30"
        />
        {value.length > 0 && (
          <button
            type="button"
            aria-label="名前をクリア"
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white/50 hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        )}
      </div>
      <div className="mt-1 flex items-center justify-between text-xs text-white/35">
        <span>入力された名前は端末外へ一切送信されません</span>
        <span>
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
      {nameHistory.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {nameHistory.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
