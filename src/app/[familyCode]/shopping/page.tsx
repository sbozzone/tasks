"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { useShoppingList } from "@/hooks/useShoppingList";
import { useWeekNavigation } from "@/hooks/useWeekNavigation";
import { useFamily } from "@/lib/family-context";
import { Plus, Trash2, ShoppingCart, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShoppingPage() {
  const { family } = useFamily();
  const { weekStart } = useWeekNavigation();
  const {
    items,
    loading,
    addItem,
    toggleItem,
    deleteItem,
    generateFromPlan,
    sortedCategories,
  } = useShoppingList();
  const [newItem, setNewItem] = useState("");
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  async function handleAdd() {
    if (!newItem.trim()) return;
    await addItem(newItem.trim());
    setNewItem("");
  }

  async function handleGenerate() {
    setGenerating(true);
    const result = await generateFromPlan(weekStart);
    setToast({ message: result.message, isError: !result.ok });
    setTimeout(() => setToast(null), 3000);
    setGenerating(false);
  }

  function toggleCategory(cat: string) {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const unchecked = items.filter((it) => !it.is_checked);
  const checked = items.filter((it) => it.is_checked);
  const hasCategories = sortedCategories.some(([cat]) => cat !== "Other");

  return (
    <>
      <Header title="Shopping List" familyCode={family.share_code} />

      <div className="px-4 py-3 max-w-3xl mx-auto space-y-4">
        {/* Add item */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 px-4 py-2.5 bg-card border border-border rounded-lg text-sm placeholder:text-text-muted"
          />
          <button
            onClick={handleAdd}
            disabled={!newItem.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-accent text-white rounded-lg font-medium text-sm hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        {/* Auto-generate button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full flex items-center justify-center gap-2 py-2.5 border border-accent/30 text-accent rounded-lg text-sm font-medium hover:bg-accent-light/30 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {generating ? "Generating..." : "Generate from meal plan"}
        </button>

        {/* Toast */}
        {toast && (
          <div
            className={cn(
              "px-4 py-2.5 rounded-lg text-sm font-medium text-center",
              toast.isError
                ? "bg-red/10 text-red"
                : "bg-green/10 text-green"
            )}
          >
            {toast.message}
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-card bg-card animate-pulse border border-border-light" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-50" />
            <p className="text-text-muted text-sm">
              No items yet. Add ingredients as you plan meals!
            </p>
          </div>
        ) : (
          <>
            {/* Unchecked items — grouped by category if applicable */}
            {hasCategories && unchecked.length > 0 ? (
              <div className="space-y-3">
                {sortedCategories
                  .map(([cat, catItems]) => {
                    const uncheckedInCat = catItems.filter((it) => !it.is_checked);
                    if (uncheckedInCat.length === 0) return null;
                    const isCollapsed = collapsedCats.has(cat);
                    return (
                      <div key={cat}>
                        <button
                          onClick={() => toggleCategory(cat)}
                          className="flex items-center gap-2 mb-1.5 px-1"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                          )}
                          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                            {cat}
                          </span>
                          <span className="text-xs text-text-muted">
                            ({uncheckedInCat.length})
                          </span>
                        </button>
                        {!isCollapsed && (
                          <div className="space-y-1">
                            {uncheckedInCat.map((item) => (
                              <ShoppingRow
                                key={item.id}
                                item={item}
                                onToggle={toggleItem}
                                onDelete={deleteItem}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                  .filter(Boolean)}
              </div>
            ) : (
              unchecked.length > 0 && (
                <div className="space-y-1">
                  {unchecked.map((item) => (
                    <ShoppingRow
                      key={item.id}
                      item={item}
                      onToggle={toggleItem}
                      onDelete={deleteItem}
                    />
                  ))}
                </div>
              )
            )}

            {/* Checked items */}
            {checked.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2 px-1">
                  Checked off ({checked.length})
                </h3>
                <div className="space-y-1">
                  {checked.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-2.5 bg-card/50 border border-border-light/50 rounded-card group"
                    >
                      <button
                        onClick={() => toggleItem(item.id, false)}
                        className="w-6 h-6 rounded-full border-2 border-accent bg-accent flex items-center justify-center shrink-0"
                        aria-label={`Uncheck ${item.name}`}
                      >
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <span className="flex-1 text-sm text-text-muted line-through">
                        {item.name}
                      </span>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-1 rounded text-text-muted hover:text-red opacity-0 group-hover:opacity-100 sm:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function ShoppingRow({
  item,
  onToggle,
  onDelete,
}: {
  item: { id: string; name: string; quantity: string | null; source: string };
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border-light rounded-card group">
      <button
        onClick={() => onToggle(item.id, true)}
        className="w-6 h-6 rounded-full border-2 border-border hover:border-accent transition-colors shrink-0"
        aria-label={`Check off ${item.name}`}
      />
      <span className="flex-1 text-sm text-text">{item.name}</span>
      {item.quantity && (
        <span className="text-xs text-text-muted font-mono">{item.quantity}</span>
      )}
      {item.source === "auto" && (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue/10 text-blue font-medium uppercase tracking-wider">
          auto
        </span>
      )}
      <button
        onClick={() => onDelete(item.id)}
        className="p-1 rounded text-text-muted hover:text-red opacity-0 group-hover:opacity-100 sm:opacity-100 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
