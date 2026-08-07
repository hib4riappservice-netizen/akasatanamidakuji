import type { Category } from '../types';

interface CategorySelectorProps {
  categories: Category[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function CategorySelector({ categories, selectedIds, onToggle }: CategorySelectorProps) {
  return (
    <div className="px-4 pt-4">
      <span className="mb-1 block text-sm font-medium text-white/70">カテゴリ（複数選択可）</span>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const active = selectedIds.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(category.id)}
              className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium transition ${
                active
                  ? 'border-fuchsia-400/70 bg-fuchsia-500/20 text-fuchsia-100'
                  : 'border-white/10 bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              <span className="mr-1">{category.emoji}</span>
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
