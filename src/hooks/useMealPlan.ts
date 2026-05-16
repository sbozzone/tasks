"use client";

import { useState, useEffect, useCallback } from "react";
import { useFamily } from "@/lib/family-context";
import { getWeekDays } from "@/lib/utils";
import type { MealPlan, DayPlan } from "@/types/database";

export function useMealPlan(weekStart: string) {
  const { family } = useFamily();
  const [meals, setMeals] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const headers = { "x-family-id": family.id };

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/meal-plan?weekStart=${weekStart}`,
      { headers }
    );
    if (res.ok) {
      setMeals(await res.json());
    }
    setLoading(false);
  }, [family.id, weekStart]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  const days: DayPlan[] = getWeekDays(weekStart).map((day) => ({
    ...day,
    meals: meals.filter((m) => m.meal_date === day.date),
  }));

  async function assignDish(date: string, dishId: string) {
    const res = await fetch("/api/meal-plan", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ dish_id: dishId, meal_date: date }),
    });
    if (res.ok) {
      const meal = await res.json();
      setMeals((prev) => [...prev, meal]);
      return meal;
    }
    return null;
  }

  async function removeMeal(mealId: string) {
    const res = await fetch(`/api/meal-plan/${mealId}`, {
      method: "DELETE",
      headers,
    });
    if (res.ok) {
      setMeals((prev) => prev.filter((m) => m.id !== mealId));
    }
  }

  async function clearWeek() {
    const res = await fetch("/api/meal-plan/clear", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ weekStart }),
    });
    if (res.ok) {
      setMeals([]);
    }
  }

  return { days, meals, loading, assignDish, removeMeal, clearWeek, refetch: fetchMeals };
}
