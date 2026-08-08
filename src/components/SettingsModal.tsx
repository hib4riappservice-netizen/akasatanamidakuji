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
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-2xl border border-ink/15 bg-board-panel p-5 shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">設定</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-black/5"
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
            className="min-h-11 w-full rounded-xl border border-red-400/40 bg-red-50 text-sm font-medium text-red-600"
          >
            履歴を全削除
          </button>

          <div className="border-t border-ink/10 pt-4 text-xs leading-relaxed text-ink/50">
            <p className="mb-1 font-medium text-ink/70">データの取り扱い</p>
            <p>
              入力されたユーザ名・履歴・設定は、お使いの端末内（ブラウザのローカルストレージ）にのみ保存され、
              サーバーへ送信されることはありません。「履歴を全削除」またはブラウザのデータ消去でいつでも削除できます。
              広告・アクセス解析・第三者へのデータ提供は行っていません。
            </p>
          </div>
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
    <div className="flex min-h-11 items-center justify-between gap-3">
      <span className="text-sm text-ink/80">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full p-0 transition-colors ${
          checked ? 'bg-accent' : 'bg-ink/25'
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
