"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/shared/BottomSheet";
import {
  DISH_TAGS,
  INGREDIENT_CATEGORIES,
  type DishTag,
  type Ingredient,
  type IngredientCategory,
} from "@/types/database";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

export function DishForm({
  open,
  onClose,
  onSave,
  initialName,
  initialTags,
  initialIngredients,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, tags: DishTag[], ingredients: Ingredient[]) => Promise<void>;
  initialName?: string;
  initialTags?: DishTag[];
  initialIngredients?: Ingredient[];
}) {
  const [name, setName] = useState(initialName || "");
  const [tags, setTags] = useState<DishTag[]>(initialTags || []);
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialIngredients || []
  );
  const [saving, setSaving] = useState(false);
  const [showIngredients, setShowIngredients] = useState(
    (initialIngredients?.length ?? 0) > 0
  );

  function toggleTag(tag: DishTag) {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function addIngredient() {
    setIngredients((prev) => [
      ...prev,
      { name: "", quantity: "", unit: "", category: "Other" },
    ]);
  }

  function updateIngredient(index: number, field: keyof Ingredient, value: string) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!name.trim()) return;
    setSaving(true);
    const cleanIngredients = ingredients.filter((ing) => ing.name.trim());
    await onSave(name.trim(), tags, cleanIngredients);
    setName("");
    setTags([]);
    setIngredients([]);
    setShowIngredients(false);
    setSaving(false);
    onClose();
  }

  function handleClose() {
    setName(initialName || "");
    setTags(initialTags || []);
    setIngredients(initialIngredients || []);
    setShowIngredients((initialIngredients?.length ?? 0) > 0);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title={initialName ? "Edit Dish" : "Add New Dish"}>
      <div className="p-5 space-y-5">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Dish name
          </label>
          <input
            type="text"
            placeholder="e.g. Chicken Parmesan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-base placeholder:text-text-muted"
            autoFocus
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {DISH_TAGS.map((tag) => (
              <button
                key={tag.value}
                onClick={() => toggleTag(tag.value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  tags.includes(tag.value)
                    ? "text-white border-transparent"
                    : "border-border text-text-secondary bg-bg hover:border-accent/40"
                )}
                style={
                  tags.includes(tag.value)
                    ? { backgroundColor: tag.color }
                    : undefined
                }
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">
              Ingredients
            </label>
            {!showIngredients && (
              <button
                onClick={() => {
                  setShowIngredients(true);
                  if (ingredients.length === 0) addIngredient();
                }}
                className="text-xs text-accent font-medium"
              >
                + Add ingredients
              </button>
            )}
          </div>

          {showIngredients && (
            <div className="space-y-2">
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Ingredient name"
                      value={ing.name}
                      onChange={(e) => updateIngredient(i, "name", e.target.value)}
                      className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm placeholder:text-text-muted"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Qty"
                        value={ing.quantity}
                        onChange={(e) => updateIngredient(i, "quantity", e.target.value)}
                        className="w-20 px-3 py-2 bg-bg border border-border rounded-lg text-sm placeholder:text-text-muted font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Unit"
                        value={ing.unit}
                        onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                        className="w-20 px-3 py-2 bg-bg border border-border rounded-lg text-sm placeholder:text-text-muted"
                      />
                      <select
                        value={ing.category}
                        onChange={(e) =>
                          updateIngredient(i, "category", e.target.value as IngredientCategory)
                        }
                        className="flex-1 px-2 py-2 bg-bg border border-border rounded-lg text-xs text-text-secondary"
                      >
                        {INGREDIENT_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => removeIngredient(i)}
                    className="p-1.5 mt-1.5 rounded text-text-muted hover:text-red transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={addIngredient}
                className="flex items-center gap-1.5 text-sm text-accent font-medium py-2"
              >
                <Plus className="w-4 h-4" />
                Add ingredient
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || saving}
          className="w-full py-3.5 bg-accent text-white rounded-card font-semibold text-base hover:bg-accent-hover active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : initialName ? "Update Dish" : "Add Dish"}
        </button>
      </div>
    </BottomSheet>
  );
}
