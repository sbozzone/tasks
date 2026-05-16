"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { DishForm } from "@/components/dishes/DishForm";
import { useDishes } from "@/hooks/useDishes";
import { useFamily } from "@/lib/family-context";
import { DISH_TAGS, type DishTag } from "@/types/database";
import { Plus, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DishesPage() {
  const { family } = useFamily();
  const { dishes, loading, addDish, deleteDish } = useDishes();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<DishTag | null>(null);

  const filtered = dishes.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !filterTag || d.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const usedTags = DISH_TAGS.filter((t) =>
    dishes.some((d) => d.tags.includes(t.value))
  );

  return (
    <>
      <Header title="Favorite Dishes" familyCode={family.share_code} />

      <div className="px-4 py-3 max-w-3xl mx-auto space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm placeholder:text-text-muted"
          />
        </div>

        {usedTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setFilterTag(null)}
              className={cn(
                "shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                !filterTag
                  ? "border-accent bg-accent text-white"
                  : "border-border text-text-secondary bg-card"
              )}
            >
              All
            </button>
            {usedTags.map((tag) => (
              <button
                key={tag.value}
                onClick={() =>
                  setFilterTag((prev) =>
                    prev === tag.value ? null : tag.value
                  )
                }
                className={cn(
                  "shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                  filterTag === tag.value
                    ? "border-accent bg-accent text-white"
                    : "border-border text-text-secondary bg-card"
                )}
              >
                {tag.label}
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-card font-semibold hover:bg-accent-hover active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Dish
        </button>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-card bg-card animate-pulse border border-border-light" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm">
              {search
                ? "No dishes match your search"
                : "No favorites yet. Add your first dish!"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((dish) => (
              <div
                key={dish.id}
                className="flex items-center gap-3 px-4 py-3 bg-card border border-border-light rounded-card group"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-text truncate">
                    {dish.name}
                  </h3>
                  {dish.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {dish.tags.slice(0, 3).map((tag) => {
                        const tagDef = DISH_TAGS.find(
                          (t) => t.value === tag
                        );
                        return (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor: tagDef
                                ? `${tagDef.color}18`
                                : "#DDD8CC",
                              color: tagDef?.color || "#7A6F5E",
                            }}
                          >
                            {tagDef?.label || tag}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${dish.name}"?`)) {
                      deleteDish(dish.id);
                    }
                  }}
                  className="p-2 rounded-lg text-text-muted hover:text-red hover:bg-red/5 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                  aria-label={`Delete ${dish.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <DishForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={async (name, tags, ingredients) => {
          await addDish(name, tags, ingredients);
        }}
      />
    </>
  );
}
