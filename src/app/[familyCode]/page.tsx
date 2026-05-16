"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { WeekNavigation } from "@/components/meal-plan/WeekNavigation";
import { DayCard } from "@/components/meal-plan/DayCard";
import { DishPicker } from "@/components/meal-plan/DishPicker";
import { DishForm } from "@/components/dishes/DishForm";
import { useWeekNavigation } from "@/hooks/useWeekNavigation";
import { useMealPlan } from "@/hooks/useMealPlan";
import { useDishes } from "@/hooks/useDishes";
import { useFamily } from "@/lib/family-context";
import type { Dish } from "@/types/database";

export default function MealPlanPage() {
  const { family } = useFamily();
  const { weekStart, weekLabel, goToPrevWeek, goToNextWeek, goToToday } =
    useWeekNavigation();
  const { days, loading, assignDish, removeMeal, clearWeek } =
    useMealPlan(weekStart);
  const { dishes, addDish } = useDishes();

  const [pickerDate, setPickerDate] = useState<string | null>(null);
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [showAddDish, setShowAddDish] = useState(false);

  function handleTapToAssign(date: string) {
    setPickerDate(date);
  }

  async function handleSelectDish(dish: Dish) {
    if (pickerDate) {
      await assignDish(pickerDate, dish.id);
      setPickerDate(null);
    }
  }

  async function handleClearWeek() {
    if (confirm("Clear all meals for this week?")) {
      await clearWeek();
    }
  }

  return (
    <>
      <Header
        subtitle={weekLabel}
        showPrint
        familyCode={family.share_code}
      />

      <WeekNavigation
        weekLabel={weekLabel}
        onPrev={goToPrevWeek}
        onNext={goToNextWeek}
        onToday={goToToday}
        onClearWeek={handleClearWeek}
      />

      <main className="px-4 pb-4 max-w-3xl mx-auto">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-card bg-card animate-pulse border border-border-light"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {days.map((day) => (
              <DayCard
                key={day.date}
                day={day}
                onTapToAssign={handleTapToAssign}
                onRemoveMeal={removeMeal}
              />
            ))}
          </div>
        )}
      </main>

      <DishPicker
        open={pickerDate !== null}
        onClose={() => setPickerDate(null)}
        dishes={dishes}
        onSelect={handleSelectDish}
        onAddNew={() => {
          setPendingDate(pickerDate);
          setPickerDate(null);
          setShowAddDish(true);
        }}
      />

      <DishForm
        open={showAddDish}
        onClose={() => {
          setShowAddDish(false);
          setPendingDate(null);
        }}
        onSave={async (name, tags, ingredients) => {
          const dish = await addDish(name, tags, ingredients);
          if (dish && pendingDate) {
            await assignDish(pendingDate, dish.id);
          }
          setPendingDate(null);
        }}
      />
    </>
  );
}
