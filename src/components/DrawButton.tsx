interface DrawButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export function DrawButton({ label, disabled, onClick }: DrawButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="font-gothic min-h-16 min-w-48 rounded-2xl bg-pink-200 px-10 text-2xl font-bold text-pink-700 shadow-[0_6px_0_0_rgba(219,39,119,0.15),0_8px_20px_rgba(219,39,119,0.15)] transition active:translate-y-1 active:shadow-[0_2px_0_0_rgba(219,39,119,0.15)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}
