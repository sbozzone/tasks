"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { BottomSheet } from "@/components/shared/BottomSheet";
import { DISH_TAGS, type Dish, type DishTag } from "@/types/database";
import { cn } from "@/lib/utils";

export function DishPicker({
  open,
  onClose,
  dishes,
  onSelect,
  onAddNew,
}: {
  open: boolean;
  onClose: () => void;
  dishes: Dish[];
  onSelect: (dish: Dish) => void;
  onAddNew: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState<DishTag | null>(null);

  const filtered = dishes.filter((d) => {
    const matchesSearch = d.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesTag = !filterTag || d.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  const usedTags = DISH_TAGS.filter((t) =>
    dishes.some((d) => d.tags.includes(t.value))
  );

  return (
    <BottomSheet open={open} onClose={onClose} title="Pick a dish">
      <div className="px-4 py-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg border border-border rounded-lg text-sm placeholder:text-text-muted"
            autoFocus
          />
        </div>

        {usedTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
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
                    : "border-border text-text-secondary bg-card hover:border-accent/40"
                )}
              >
                {tag.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={() => {
            onClose();
            onAddNew();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 mb-2 border-2 border-dashed border-accent/30 rounded-lg text-accent hover:bg-accent-light/30 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium text-sm">Add new dish</span>
        </button>

        {filtered.length === 0 ? (
          <p className="text-center text-text-muted py-8 text-sm">
            {search ? "No dishes match your search" : "No dishes yet"}
          </p>
        ) : (
          <div className="space-y-1">
            {filtered.map((dish) => (
              <button
                key={dish.id}
                onClick={() => {
                  onSelect(dish);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-card-header active:bg-border-light transition-colors text-left"
              >
                <span className="flex-1 font-medium text-sm text-text">
                  {dish.name}
                </span>
                {dish.tags.length > 0 && (
                  <div className="flex gap-1">
                    {dish.tags.slice(0, 2).map((tag) => {
                      const tagDef = DISH_TAGS.find((t) => t.value === tag);
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
              </button>
            ))}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
