"use client";

import { useState, useEffect, useCallback } from "react";
import { useFamily } from "@/lib/family-context";
import type { ShoppingItem } from "@/types/database";

export function useShoppingList() {
  const { family } = useFamily();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = { "x-family-id": family.id };

  const fetchItems = useCallback(async () => {
    const res = await fetch("/api/shopping", { headers });
    if (res.ok) {
      setItems(await res.json());
    }
    setLoading(false);
  }, [family.id]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function addItem(name: string) {
    const res = await fetch("/api/shopping", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [item, ...prev]);
      return item;
    }
    return null;
  }

  async function toggleItem(id: string, checked: boolean) {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, is_checked: checked } : it))
    );
    await fetch(`/api/shopping/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ is_checked: checked }),
    });
  }

  async function deleteItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    await fetch(`/api/shopping/${id}`, {
      method: "DELETE",
      headers,
    });
  }

  async function generateFromPlan(weekStart: string): Promise<{ ok: boolean; message: string }> {
    const res = await fetch("/api/shopping/generate", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart }),
    });
    const data = await res.json();
    if (res.ok) {
      await fetchItems();
      return { ok: true, message: `Added ${data.generated} items from your meal plan` };
    }
    return { ok: false, message: data.error || "Failed to generate list" };
  }

  const uncheckedCount = items.filter((it) => !it.is_checked).length;

  // Group items by category
  const categories = items.reduce<Record<string, ShoppingItem[]>>((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const CATEGORY_ORDER = [
    "Produce",
    "Meat & Seafood",
    "Dairy & Eggs",
    "Bakery",
    "Frozen",
    "Pantry",
    "Canned Goods",
    "Condiments",
    "Snacks",
    "Beverages",
    "Other",
  ];

  const sortedCategories = Object.entries(categories).sort(
    ([a], [b]) =>
      (CATEGORY_ORDER.indexOf(a) === -1 ? 99 : CATEGORY_ORDER.indexOf(a)) -
      (CATEGORY_ORDER.indexOf(b) === -1 ? 99 : CATEGORY_ORDER.indexOf(b))
  );

  return {
    items,
    loading,
    addItem,
    toggleItem,
    deleteItem,
    generateFromPlan,
    uncheckedCount,
    sortedCategories,
    refetch: fetchItems,
  };
}
