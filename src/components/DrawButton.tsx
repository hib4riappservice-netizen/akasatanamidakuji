interface DrawButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export function DrawButton({ label, disabled, onClick }: DrawButtonProps) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-white/10 bg-[#0b0b12]/95 px-4 py-3 backdrop-blur">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="min-h-14 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-violet-500 text-lg font-bold text-white shadow-lg shadow-fuchsia-500/20 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {label}
      </button>
    </div>
  );
}
