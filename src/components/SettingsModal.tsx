import type { Settings } from '../types';

interface SettingsModalProps {
  open: boolean;
  settings: Settings;
  onChange: (settings: Settings) => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export function SettingsModal({ open, settings, onChange, onClearHistory, onClose }: SettingsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl border border-white/10 bg-[#14141f] p-5 sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">設定</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 hover:bg-white/10"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <ToggleRow
            label="レア行（わをん）を出現させる"
            checked={settings.rareEnabled}
            onChange={(rareEnabled) => onChange({ ...settings, rareEnabled })}
          />
          <ToggleRow
            label="効果音"
            checked={settings.soundEnabled}
            onChange={(soundEnabled) => onChange({ ...settings, soundEnabled })}
          />

          <button
            type="button"
            onClick={onClearHistory}
            className="min-h-11 w-full rounded-xl border border-red-400/30 bg-red-500/10 text-sm font-medium text-red-300"
          >
            履歴を全削除
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3">
      <span className="text-sm text-white/80">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-fuchsia-500' : 'bg-white/15'}`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
}
