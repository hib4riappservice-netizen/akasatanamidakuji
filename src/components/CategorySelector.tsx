import type { Category } from '../types';

interface CategorySelectorProps {
  categories: Category[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function CategorySelector({ categories, selectedIds, onToggle }: CategorySelectorProps) {
  return (
    <div className="grid shrink-0 grid-cols-2 gap-2 px-4 py-2 sm:flex sm:flex-wrap">
      {categories.map((category) => {
        const active = selectedIds.includes(category.id);
        return (
          <button
            key={category.id}
            type="button"
            aria-pressed={active}
            onClick={() => onToggle(category.id)}
            className={`min-h-8 rounded-full border px-3 py-1 text-xs font-medium transition ${
              active
                ? 'border-pink-400/70 bg-pink-50 text-pink-600'
                : 'border-ink/15 bg-board-panel text-ink/50 hover:bg-black/5'
            }`}
          >
            <span className="mr-1">{category.emoji}</span>
            {category.label}
          </button>
        );
      })}
    </div>
  );
}
